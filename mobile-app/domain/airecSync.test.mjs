import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { airecRecordingKey, filterAirecDevices, getAirecProgress, getAirecSyncPercent, mergeAirecRecording, planAirecSync, rememberAirecDevice, sortAirecDevices } from './airecSync.ts';

const matches = filterAirecDevices([
  { id: 'one', name: 'AIREC_001' }, { id: 'two', name: 'airec_002' },
  { id: 'other', name: 'AirPods' }, { id: 'middle', name: 'Other_AIREC' },
  { id: 'empty', name: null }, { id: 'one', name: 'AIREC_001' }, { id: 'three', name: 'AIREC_001' },
]);
assert.deepEqual(matches.map(item => item.id), ['one', 'two', 'three'], '按名称前缀筛选并按设备身份去重，同名的不同设备应保留');

const manifest = Array.from({ length: 10 }, (_, index) => ({
  deviceId: 'device-001', recordingId: `generation-a-${index}`, checksum: `hash-${index}`,
  recordedAt: '2026-11-05T01:00:00.000Z', durationSeconds: 10,
}));
const fresh = planAirecSync(manifest, [], []);
assert.equal(fresh.toReceive.length, 10);
const interrupted = planAirecSync(manifest, manifest.slice(0, 4), manifest.slice(0, 2));
assert.equal(interrupted.toReceive.length, 6, '断点恢复只接收未接收的录音');
assert.equal(interrupted.toUpload.length, 2, '已在云端的录音不能重复上传');
assert.equal(interrupted.alreadySaved, 2);
assert.deepEqual(getAirecProgress(manifest, manifest.slice(0, 4), manifest.slice(0, 2)), { total: 10, received: 4, saved: 2 });
assert.equal(getAirecSyncPercent(getAirecProgress(manifest, manifest.slice(0, 4), [])), 0, '接收4段但尚未保存时，0/10对应0%');
assert.equal(getAirecSyncPercent(getAirecProgress(manifest, manifest, [])), 0, '全部接收但尚未保存时，进度条仍与0/10一致');
assert.equal(getAirecSyncPercent(getAirecProgress(manifest, manifest, manifest.slice(0, 6))), 60, '保存6/10时对应60%');
assert.equal(getAirecSyncPercent(getAirecProgress(manifest, manifest, manifest)), 100);
assert.equal(getAirecSyncPercent(getAirecProgress([], [], [])), 0);
const reinstalled = planAirecSync(manifest, [], manifest);
assert.equal(reinstalled.toReceive.length + reinstalled.toUpload.length, 0, '本机数据清空后仍以云端回执避免重复同步');
assert.equal(reinstalled.alreadySaved, 10);
assert.equal(planAirecSync(manifest, [], []).toReceive.length, 10, '尚未保存到云端就重装时，必须允许从硬件恢复');
assert.equal(planAirecSync([...manifest, manifest[0]], [], []).total, 10, '重复的设备清单项不得抬高总数');
assert.throws(() => mergeAirecRecording(manifest, { ...manifest[0], checksum: 'changed' }), /不一致/);
assert.throws(() => planAirecSync(manifest, [], [{ ...manifest[0], checksum: 'changed' }]), /不一致/);
assert.notEqual(airecRecordingKey(manifest[0]), airecRecordingKey({ ...manifest[0], deviceId: 'device-002' }));
assert.notEqual(airecRecordingKey(manifest[0]), airecRecordingKey({ ...manifest[0], recordingId: 'generation-b-0' }));

const memory = new Map();
const remembered = rememberAirecDevice([
  { id: 'old', name: 'AIREC_001', lastConnectedAt: '2026-11-03T00:00:00Z' },
  { id: 'new', name: 'AIREC_002', lastConnectedAt: '2026-11-05T00:00:00Z' },
], { id: 'old', name: 'AIREC_001' }, '2026-11-04T00:00:00Z');
assert.equal(remembered.length, 2, '重连不重复添加历史设备');
assert.deepEqual(sortAirecDevices(remembered, 'old').map(item => item.id), ['old', 'new'], '当前连接的设备必须排在较新的历史设备前');
assert.deepEqual(sortAirecDevices(remembered).map(item => item.id), ['new', 'old'], '无连接时按最近连接时间排序，排序不改变源数据');
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
const bundle = await build({ entryPoints: ['mobile-app/services/airecDemoAdapter.ts'], bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent' });
const { airecDemoAdapter: adapter } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const hardware = adapter.manifest('airec-sn-001');
adapter.rememberDevice('school-a', 'teacher-a', { id: 'airec-sn-001', name: 'AIREC_001' });
adapter.rememberDevice('school-a', 'teacher-a', { id: 'airec-sn-002', name: 'AIREC_002' });
adapter.rememberDevice('school-a', 'teacher-a', { id: 'airec-sn-001', name: 'AIREC_001' });
assert.equal(adapter.readDevices('school-a', 'teacher-a').length, 2, '重新读取仍保留全部曾连接设备，重连不重复');
assert.equal(adapter.readDevices('school-b', 'teacher-a').length, 0, '设备历史按学校隔离');
assert.equal(adapter.readDevices('school-a', 'teacher-b').length, 0, '设备历史按账号隔离');
for (const recording of hardware) { adapter.receive('school-a', 'teacher-a', recording); adapter.save('school-a', recording); }
assert.equal(adapter.save('school-a', hardware[0]).existed, true, '云端接受后回执丢失，再次提交也应返回已有记录');
adapter.simulateReinstall('school-a', 'teacher-a');
assert.equal(adapter.readLocal('school-a', 'teacher-a').length, 0);
assert.equal(adapter.readDevices('school-a', 'teacher-a').length, 0, '模拟卸载清除本机设备历史，但保留云端录音回执');
assert.equal(adapter.readCloud('school-a').length, 10);
assert.equal(adapter.manifest('airec-sn-001').length, 10, '同步及模拟重装均不删除硬件原录音');
assert.equal(planAirecSync(hardware, adapter.readLocal('school-a', 'teacher-a'), adapter.readCloud('school-a')).alreadySaved, 10);
assert.equal(planAirecSync(hardware, adapter.readLocal('school-a', 'teacher-b'), adapter.readCloud('school-a')).alreadySaved, 10, '同校换老师仍共用学校的去重回执');
assert.equal(adapter.readCloud('school-b').length, 0, '不同学校的云端记录隔离');
adapter.addRecordings('airec-sn-001');
assert.equal(planAirecSync(adapter.manifest('airec-sn-001'), [], adapter.readCloud('school-a')).toReceive.length, 2, '再次连接只同步新增的两段');
assert.throws(() => adapter.save('school-a', { ...hardware[0], checksum: 'bad-data' }), /不一致/);
assert.equal(adapter.readCloud('school-a').length, 10, '编号冲突不得覆盖原记录');
const completed = adapter.prepareScenario('preview-school', 'teacher-a', 'connected');
assert.deepEqual(getAirecProgress(completed.manifest, completed.local, completed.cloud), { total: 10, received: 10, saved: 10 }, '已连接场景必须真实完成模拟同步');
const syncing = adapter.prepareScenario('preview-school', 'teacher-a', 'syncing');
assert.deepEqual(getAirecProgress(syncing.manifest, syncing.local, syncing.cloud), { total: 10, received: 4, saved: 0 }, '同步场景从可继续的实际接收进度开始');
assert.equal(adapter.readCloud('school-a').length, 10, '切换场景不影响其他学校的云端回执');
const disconnected = adapter.prepareScenario('preview-school', 'teacher-a', 'disconnected');
assert.ok(disconnected.knownDevices.some(device => device.id === disconnected.device.id), '未连接场景保留曾添加的设备');
const neverAdded = adapter.prepareScenario('preview-school', 'teacher-a', 'never-added');
assert.equal(neverAdded.device, null);
assert.equal(neverAdded.knownDevices.length, 0, '从未添加场景清除本机设备历史');
console.log('AIREC 过滤、断点恢复、重复提交、卸载重装和学校隔离检查通过');
