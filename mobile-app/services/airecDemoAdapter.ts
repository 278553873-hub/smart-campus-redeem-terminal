import { airecRecordingKey, mergeAirecRecording, rememberAirecDevice, type AirecDevice, type AirecKnownDevice, type AirecRecording } from '../domain/airecSync';

export const AIREC_DEMO_CONTROL_EVENT = 'airec-demo-control';
export const AIREC_DEMO_STATE_EVENT = 'airec-demo-state';
export const AIREC_DEMO_STATE_REQUEST_EVENT = 'airec-demo-state-request';
export type AirecDemoScenario = 'never-added' | 'connected' | 'syncing' | 'disconnected';

const prefix = 'teacher-airec-demo-v1:';
const discoveredDevices: AirecDevice[] = [
    { id: 'airec-sn-001', name: 'AIREC_001' },
    { id: 'other-headphones', name: '蓝牙耳机' },
    { id: 'airec-sn-002', name: 'AIREC_002' },
    { id: 'other-speaker', name: '办公室音箱' },
];

function readRecords(key: string): AirecRecording[] {
    const value = localStorage.getItem(prefix + key);
    if (!value) return [];
    const records: unknown = JSON.parse(value);
    if (!Array.isArray(records) || records.some(item => !item || typeof item.deviceId !== 'string'
        || typeof item.recordingId !== 'string' || typeof item.checksum !== 'string'
        || typeof item.recordedAt !== 'string' || typeof item.durationSeconds !== 'number')) {
        throw new Error('同步记录暂时无法读取，请保留设备录音并联系支持。');
    }
    return records;
}

function writeRecords(key: string, records: readonly AirecRecording[]) {
    localStorage.setItem(prefix + key, JSON.stringify(records));
}

const ownerKey = (schoolId: string, teacherId: string) => JSON.stringify([schoolId, teacherId]);
const cloudKey = (schoolId: string) => 'cloud:' + schoolId;
const localKey = (schoolId: string, teacherId: string) => 'local:' + ownerKey(schoolId, teacherId);
const historyKey = (schoolId: string, teacherId: string) => prefix + 'devices:' + ownerKey(schoolId, teacherId);

/** 仅用于 Demo。真实云端、文件传输和厂商 SDK 必须替换此适配器。 */
export const airecDemoAdapter = {
    discover: () => [...discoveredDevices],
    readLocal: (schoolId: string, teacherId: string) => readRecords(localKey(schoolId, teacherId)),
    readCloud: (schoolId: string) => readRecords(cloudKey(schoolId)),
    readDevices(schoolId: string, teacherId: string): AirecKnownDevice[] {
        const value = localStorage.getItem(historyKey(schoolId, teacherId));
        let devices: unknown;
        try { devices = value ? JSON.parse(value) : []; } catch { throw new Error('设备列表暂时无法读取，请重试。'); }
        if (!Array.isArray(devices) || devices.some(item => !item || typeof item.id !== 'string' || typeof item.name !== 'string' || typeof item.lastConnectedAt !== 'string')) {
            throw new Error('设备列表暂时无法读取，请重试。');
        }
        return devices;
    },
    rememberDevice(schoolId: string, teacherId: string, device: AirecDevice) {
        const devices = rememberAirecDevice(this.readDevices(schoolId, teacherId), device, new Date().toISOString());
        localStorage.setItem(historyKey(schoolId, teacherId), JSON.stringify(devices));
        return devices;
    },
    manifest(deviceId: string): AirecRecording[] {
        const count = Number(localStorage.getItem(prefix + 'hardware-count:' + deviceId) ?? 10);
        return Array.from({ length: Number.isFinite(count) ? Math.max(0, Math.min(count, 100)) : 10 }, (_, index) => ({
            deviceId,
            recordingId: `session-20261105-${index + 1}`,
            checksum: `demo-content-${deviceId}-${index + 1}`,
            recordedAt: new Date(`2026-11-05T09:${String(index % 60).padStart(2, '0')}:00+08:00`).toISOString(),
            durationSeconds: 12 + index * 3,
        }));
    },
    receive(schoolId: string, teacherId: string, recording: AirecRecording) {
        const local = mergeAirecRecording(this.readLocal(schoolId, teacherId), recording);
        writeRecords(localKey(schoolId, teacherId), local);
        return local;
    },
    save(schoolId: string, recording: AirecRecording) {
        const current = this.readCloud(schoolId);
        const existed = current.some(item => airecRecordingKey(item) === airecRecordingKey(recording));
        const cloud = mergeAirecRecording(current, recording);
        writeRecords(cloudKey(schoolId), cloud);
        return { cloud, existed };
    },
    simulateReinstall(schoolId: string, teacherId: string) {
        localStorage.removeItem(prefix + localKey(schoolId, teacherId));
        localStorage.removeItem(historyKey(schoolId, teacherId));
    },
    addRecordings(deviceId: string) {
        localStorage.setItem(prefix + 'hardware-count:' + deviceId, String(this.manifest(deviceId).length + 2));
    },
    reset(schoolId: string, teacherId: string) {
        this.simulateReinstall(schoolId, teacherId);
        localStorage.removeItem(prefix + cloudKey(schoolId));
        for (const device of discoveredDevices) localStorage.removeItem(prefix + 'hardware-count:' + device.id);
    },
    /** 手机壳外四种演示场景；不删除其他学校或设备的回执。 */
    prepareScenario(schoolId: string, teacherId: string, scenario: AirecDemoScenario) {
        const device = discoveredDevices[0];
        localStorage.setItem(prefix + 'hardware-count:' + device.id, '10');
        if (scenario === 'never-added') {
            this.simulateReinstall(schoolId, teacherId);
            return { device: null, knownDevices: [], manifest: [], local: [], cloud: [] };
        }
        const manifest = this.manifest(device.id);
        const knownDevices = this.rememberDevice(schoolId, teacherId, device);
        if (scenario === 'connected') {
            for (const recording of manifest) { this.receive(schoolId, teacherId, recording); this.save(schoolId, recording); }
        }
        if (scenario === 'syncing') {
            writeRecords(localKey(schoolId, teacherId), this.readLocal(schoolId, teacherId).filter(item => item.deviceId !== device.id));
            writeRecords(cloudKey(schoolId), this.readCloud(schoolId).filter(item => item.deviceId !== device.id));
            for (const recording of manifest.slice(0, 4)) this.receive(schoolId, teacherId, recording);
        }
        return { device, knownDevices, manifest, local: this.readLocal(schoolId, teacherId), cloud: this.readCloud(schoolId) };
    },
};
