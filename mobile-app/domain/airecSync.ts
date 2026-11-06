export interface AirecDevice {
    id: string;
    name: string;
}

export interface AirecKnownDevice extends AirecDevice {
    lastConnectedAt: string;
}

export function rememberAirecDevice(history: readonly AirecKnownDevice[], device: AirecDevice, lastConnectedAt: string): AirecKnownDevice[] {
    return [...history.filter(item => item.id !== device.id), { ...device, lastConnectedAt }];
}

export function sortAirecDevices(history: readonly AirecKnownDevice[], connectedDeviceId?: string): AirecKnownDevice[] {
    return [...history].sort((left, right) => Number(right.id === connectedDeviceId) - Number(left.id === connectedDeviceId)
        || right.lastConnectedAt.localeCompare(left.lastConnectedAt) || left.id.localeCompare(right.id));
}

export interface AirecRecording {
    deviceId: string;
    recordingId: string;
    checksum: string;
    recordedAt: string;
    durationSeconds: number;
}

export type AirecSyncStage = 'idle' | 'receiving' | 'uploading' | 'paused' | 'waiting-network' | 'complete' | 'error';
export type AirecConnection = 'disconnected' | 'scanning' | 'connecting' | 'connected';

/** 名称只用于发现列表筛选；不能作为设备身份或同步去重依据。 */
export function filterAirecDevices(devices: readonly AirecDevice[]): AirecDevice[] {
    const matching = new Map<string, AirecDevice>();
    for (const device of devices) {
        if (device.id && typeof device.name === 'string' && device.name.trim().toUpperCase().startsWith('AIREC')) matching.set(device.id, device);
    }
    return [...matching.values()];
}

export const airecRecordingKey = (recording: Pick<AirecRecording, 'deviceId' | 'recordingId'>) => (
    JSON.stringify([recording.deviceId, recording.recordingId])
);

export function mergeAirecRecording(records: readonly AirecRecording[], incoming: AirecRecording): AirecRecording[] {
    const existing = records.find(item => airecRecordingKey(item) === airecRecordingKey(incoming));
    if (existing && existing.checksum !== incoming.checksum) throw new Error('录音编号与已有内容不一致，请保留设备录音并联系支持。');
    return existing ? [...records] : [...records, incoming];
}

/** 云端回执优先：本机收件箱丢失也不会把已保存录音当成新数据。 */
export function planAirecSync(manifest: readonly AirecRecording[], local: readonly AirecRecording[], cloud: readonly AirecRecording[]) {
    const unique = manifest.reduce<AirecRecording[]>((items, recording) => mergeAirecRecording(items, recording), []);
    const received = new Map(local.map(item => [airecRecordingKey(item), item]));
    const saved = new Map(cloud.map(item => [airecRecordingKey(item), item]));
    for (const recording of unique) {
        for (const receipt of [received.get(airecRecordingKey(recording)), saved.get(airecRecordingKey(recording))]) {
            if (receipt && receipt.checksum !== recording.checksum) throw new Error('录音内容校验不一致，请保留原录音并重试。');
        }
    }
    const pending = unique.filter(item => !saved.has(airecRecordingKey(item)));
    return {
        total: unique.length,
        alreadySaved: unique.length - pending.length,
        toReceive: pending.filter(item => !received.has(airecRecordingKey(item))),
        toUpload: pending.filter(item => received.has(airecRecordingKey(item))),
    };
}

/** 可见百分比与“同步中(已保存/总段数)”同口径，接收到手机不计为已同步。 */
export function getAirecSyncPercent(progress: { total: number; saved: number }) {
    return progress.total > 0 ? Math.min(100, Math.max(0, Math.floor(progress.saved / progress.total * 100))) : 0;
}

export function getAirecProgress(manifest: readonly AirecRecording[], local: readonly AirecRecording[], cloud: readonly AirecRecording[]) {
    const receivedKeys = new Set(local.map(airecRecordingKey));
    const savedKeys = new Set(cloud.map(airecRecordingKey));
    const unique = [...new Map(manifest.map(item => [airecRecordingKey(item), item])).values()];
    return {
        total: unique.length,
        received: unique.filter(item => receivedKeys.has(airecRecordingKey(item)) || savedKeys.has(airecRecordingKey(item))).length,
        saved: unique.filter(item => savedKeys.has(airecRecordingKey(item))).length,
    };
}
