import { useEffect, useRef, useState } from 'react';
import { filterAirecDevices, getAirecProgress, planAirecSync, type AirecConnection, type AirecDevice, type AirecKnownDevice, type AirecRecording, type AirecSyncStage } from '../domain/airecSync';
import { AIREC_DEMO_CONTROL_EVENT, AIREC_DEMO_STATE_EVENT, AIREC_DEMO_STATE_REQUEST_EVENT, airecDemoAdapter, type AirecDemoScenario } from '../services/airecDemoAdapter';

export interface AirecDeviceState {
    connection: AirecConnection;
    device: AirecDevice | null;
    devices: AirecDevice[];
    knownDevices: AirecKnownDevice[];
    discovery: 'idle' | 'scanning' | 'ready';
    manifest: AirecRecording[];
    local: AirecRecording[];
    cloud: AirecRecording[];
    stage: AirecSyncStage;
    networkOnline: boolean;
    message: string;
    error: string;
    newlySaved: number;
}

const initialState = (): AirecDeviceState => ({
    connection: 'disconnected', device: null, devices: [], knownDevices: [], discovery: 'idle', manifest: [], local: [], cloud: [],
    stage: 'idle', networkOnline: true, message: '', error: '', newlySaved: 0,
});

export function useAirecDemoDevice(schoolId: string, teacherId: string, enabled: boolean, onSyncComplete?: () => void) {
    const [state, setState] = useState<AirecDeviceState>(initialState);
    const stateRef = useRef(state);
    // 扫描独立于连接/同步取消，进入添加页不会使原设备任务失效。
    const operation = useRef(0);
    const discoveryOperation = useRef(0);
    const connectionOrigin = useRef<'saved' | 'discovery' | null>(null);
    const onSyncCompleteRef = useRef(onSyncComplete);
    onSyncCompleteRef.current = onSyncComplete;
    const patch = (update: Partial<AirecDeviceState>) => {
        const next = { ...stateRef.current, ...update };
        stateRef.current = next;
        setState(next);
    };
    const wait = (milliseconds: number) => new Promise<void>(resolve => window.setTimeout(resolve, milliseconds));
    const fail = (error: unknown) => patch({ stage: 'error', error: error instanceof Error ? error.message : '同步未完成，请重试；设备原录音已保留。' });

    const scan = async () => {
        const token = ++discoveryOperation.current;
        patch({ discovery: 'scanning', devices: [], error: '', message: '' });
        await wait(2600);
        if (token !== discoveryOperation.current) return;
        const found = filterAirecDevices(airecDemoAdapter.discover());
        patch({ devices: found.slice(0, 1) });
        await wait(2800);
        if (token !== discoveryOperation.current) return;
        patch({ devices: found });
        await wait(3000);
        if (token !== discoveryOperation.current) return;
        patch({ discovery: 'ready' });
    };

    const connect = async (device: AirecDevice, origin: 'saved' | 'discovery' = 'saved') => {
        if (stateRef.current.connection === 'connecting' && stateRef.current.device?.id === device.id) return false;
        const token = ++operation.current;
        const discoveryToken = ++discoveryOperation.current;
        connectionOrigin.current = origin;
        patch({ device, connection: 'connecting', stage: 'idle', discovery: 'idle', manifest: [], error: '', message: '', newlySaved: 0 });
        await wait(2200);
        if (token !== operation.current) return false;
        try {
            const manifest = airecDemoAdapter.manifest(device.id);
            const local = airecDemoAdapter.readLocal(schoolId, teacherId);
            const cloud = stateRef.current.networkOnline ? airecDemoAdapter.readCloud(schoolId) : [];
            const plan = planAirecSync(manifest, local, cloud);
            const knownDevices = airecDemoAdapter.rememberDevice(schoolId, teacherId, device);
            connectionOrigin.current = null;
            patch({ connection: 'connected', manifest, local, cloud, knownDevices,
                ...(discoveryToken === discoveryOperation.current ? { devices: [] } : {}),
                stage: plan.alreadySaved === plan.total && plan.total > 0 ? 'complete' : 'idle',
                message: plan.alreadySaved > 0 ? `${plan.alreadySaved}段录音已保存，无需重复同步。` : '',
            });
            // 连接成功后立即接续真实同步任务，页面不再停留在手动开始状态。
            if (plan.alreadySaved < plan.total) void sync();
            return true;
        } catch (error) {
            connectionOrigin.current = null;
            patch({ connection: 'disconnected' });
            fail(error);
            return false;
        }
    };

    const sync = async (stepDelay = 350) => {
        if (!stateRef.current.device || ['receiving', 'uploading'].includes(stateRef.current.stage)) return;
        const token = ++operation.current;
        patch({ stage: 'receiving', error: '', message: '', newlySaved: 0 });
        try {
            const manifest = stateRef.current.manifest;
            if (stateRef.current.networkOnline) patch({ cloud: airecDemoAdapter.readCloud(schoolId) });
            let plan = planAirecSync(manifest, stateRef.current.local, stateRef.current.cloud);
            const hadPendingRecordings = plan.alreadySaved < plan.total;
            for (const recording of plan.toReceive) {
                if (stateRef.current.connection !== 'connected') break;
                await wait(stepDelay);
                if (token !== operation.current) return;
                if (stateRef.current.connection !== 'connected') break;
                patch({ local: airecDemoAdapter.receive(schoolId, teacherId, recording) });
            }
            if (token !== operation.current) return;
            plan = planAirecSync(manifest, stateRef.current.local, stateRef.current.cloud);
            if (plan.toUpload.length > 0 && !stateRef.current.networkOnline) {
                patch({ stage: 'waiting-network', message: '已接收的录音保留在手机，联网后继续保存。设备原录音仍保留。' });
                return;
            }
            patch({ stage: 'uploading' });
            for (const recording of plan.toUpload) {
                await wait(stepDelay);
                if (token !== operation.current) return;
                if (!stateRef.current.networkOnline) {
                    patch({ stage: 'waiting-network', message: '网络已断开，已保存的录音不会重复提交。' });
                    return;
                }
                const { cloud, existed } = airecDemoAdapter.save(schoolId, recording);
                patch({ cloud, newlySaved: stateRef.current.newlySaved + (existed ? 0 : 1) });
            }
            const progress = getAirecProgress(manifest, stateRef.current.local, stateRef.current.cloud);
            const complete = progress.saved === progress.total;
            // 保留最后一次真实的100%进度，待进度条平滑到达终点再收起。
            if (complete) {
                await wait(350);
                if (token !== operation.current) return;
            }
            patch({ stage: complete ? 'complete' : 'paused', message: complete
                ? `${progress.saved}段录音已保存到云端，设备原录音仍保留。`
                : '蓝牙已断开，已接收的录音已保留；重新连接后继续同步。' });
            if (complete && hadPendingRecordings) onSyncCompleteRef.current?.();
        } catch (error) {
            if (token === operation.current) fail(error);
        }
    };

    const disconnect = () => {
        const duringTransfer = ['receiving', 'uploading'].includes(stateRef.current.stage);
        patch({ connection: 'disconnected', ...(duringTransfer ? {} : { message: '麦克风已断开，设备仍可离线录音。' }) });
    };

    useEffect(() => {
        ++operation.current;
        ++discoveryOperation.current;
        connectionOrigin.current = null;
        stateRef.current = initialState();
        setState(stateRef.current);
        if (!enabled) return undefined;
        try { patch({ knownDevices: airecDemoAdapter.readDevices(schoolId, teacherId), networkOnline: navigator.onLine !== false }); } catch (error) { fail(error); }
        const handleOnline = () => {
            patch({ networkOnline: true });
            if (stateRef.current.stage === 'waiting-network') void sync();
        };
        const handleOffline = () => patch({ networkOnline: false });
        const handleControl = (event: Event) => {
            const scenario = (event as CustomEvent<AirecDemoScenario>).detail;
            if (!['never-added', 'connected', 'syncing', 'disconnected'].includes(scenario)) return;
            ++operation.current;
            ++discoveryOperation.current;
            connectionOrigin.current = null;
            const snapshot = airecDemoAdapter.prepareScenario(schoolId, teacherId, scenario);
            patch({ ...initialState(), ...snapshot,
                connection: scenario === 'connected' || scenario === 'syncing' ? 'connected' : 'disconnected',
                stage: scenario === 'connected' ? 'complete' : 'idle',
            });
            if (scenario === 'syncing') void sync(1100);
        };
        const handleEvent = (event: Event) => { try { handleControl(event); } catch (error) { fail(error); } };
        const publishState = () => {
            const current = stateRef.current;
            const scenario: AirecDemoScenario = current.knownDevices.length === 0 ? 'never-added'
                : current.connection !== 'connected' ? 'disconnected'
                : ['receiving', 'uploading'].includes(current.stage) ? 'syncing' : 'connected';
            window.dispatchEvent(new CustomEvent(AIREC_DEMO_STATE_EVENT, { detail: scenario }));
        };
        window.addEventListener(AIREC_DEMO_CONTROL_EVENT, handleEvent);
        window.addEventListener(AIREC_DEMO_STATE_REQUEST_EVENT, publishState);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            ++operation.current;
            ++discoveryOperation.current;
            window.removeEventListener(AIREC_DEMO_CONTROL_EVENT, handleEvent);
            window.removeEventListener(AIREC_DEMO_STATE_REQUEST_EVENT, publishState);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [enabled, schoolId, teacherId]);

    useEffect(() => {
        if (enabled) window.dispatchEvent(new Event(AIREC_DEMO_STATE_REQUEST_EVENT));
        else window.dispatchEvent(new CustomEvent(AIREC_DEMO_STATE_EVENT, { detail: null }));
    }, [enabled, state.connection, state.stage, state.knownDevices.length, schoolId, teacherId]);

    return {
        state, progress: getAirecProgress(state.manifest, state.local, state.cloud),
        scan, connect, sync, disconnect,
        stopDiscovery: () => {
            ++discoveryOperation.current;
            const cancelConnection = stateRef.current.connection === 'connecting' && connectionOrigin.current === 'discovery';
            if (cancelConnection) {
                ++operation.current;
                connectionOrigin.current = null;
            }
            patch({ discovery: 'idle', ...(cancelConnection ? { connection: 'disconnected' as const } : {}) });
        },
    };
}

export type AirecDeviceController = ReturnType<typeof useAirecDemoDevice>;
