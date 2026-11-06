import assert from 'node:assert/strict';
import { build } from 'esbuild';

// 使用真实连接、同步和存储代码推进可控时钟，不启动浏览器或等待演示时长。
const bundle = await build({
    stdin: { contents: "export { useAirecDemoDevice } from './mobile-app/hooks/useAirecDemoDevice'; export { airecDemoAdapter } from './mobile-app/services/airecDemoAdapter';", resolveDir: process.cwd() },
    bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent',
    plugins: [{ name: 'hook-runtime', setup(build) {
        build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'hook-runtime' }));
        build.onLoad({ filter: /.*/, namespace: 'hook-runtime' }, () => ({ contents: ['useState', 'useRef', 'useEffect'].map(name => `export const ${name} = (...args) => globalThis.airecHookRuntime.${name}(...args);`).join('\n') }));
    } }],
});
const { useAirecDemoDevice, airecDemoAdapter } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const device = { id: 'airec-sn-001', name: 'AIREC_001' };

function mount({ online = true } = {}) {
    const memory = new Map();
    const timers = [];
    const effects = [];
    const listeners = new Map();
    const snapshots = [];
    const completions = [];
    let current;
    globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, String(value)), removeItem: key => memory.delete(key) };
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: online } });
    globalThis.window = {
        setTimeout(callback, delay) { timers.push({ callback, delay }); },
        addEventListener(name, callback) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(callback); },
        removeEventListener(name, callback) { listeners.get(name)?.delete(callback); },
        dispatchEvent(event) { for (const callback of listeners.get(event.type) ?? []) callback(event); },
    };
    globalThis.airecHookRuntime = {
        useState(initial) { current = typeof initial === 'function' ? initial() : initial; return [current, next => { current = next; snapshots.push(next); }]; },
        useRef: value => ({ current: value }),
        useEffect: effect => effects.push(effect),
    };
    const controller = useAirecDemoDevice('test-school', 'test-teacher', true, () => completions.push('同步完成'));
    const cleanups = effects.map(effect => effect());
    return {
        controller, snapshots, completions, timers, get state() { return current; },
        async tick() { assert.ok(timers.length, '应有待推进的连接或同步任务'); timers.shift().callback(); await Promise.resolve(); await Promise.resolve(); },
        async finish() { for (let count = 0; timers.length > 0; count++) { assert.ok(count < 100, '同步应在有限步骤内完成'); await this.tick(); } },
        online() { window.dispatchEvent({ type: 'online' }); },
        unmount() { for (const cleanup of cleanups) cleanup?.(); },
    };
}

const fresh = mount();
const connecting = fresh.controller.connect(device);
assert.equal(fresh.state.connection, 'connecting');
assert.equal(fresh.timers[0].delay, 2200, '重连保留更充分的可见反馈时间');
assert.equal(await fresh.controller.connect(device), false, '连接中拒绝重复连接');
await fresh.tick();
assert.equal(await connecting, true, '连接完成即可返回设备列表，不等待全部同步结束');
assert.equal(fresh.state.stage, 'receiving', '连接成功后有数据就自动开始接收');
assert.equal(fresh.state.cloud.length, 0);
while (fresh.state.cloud.length < 10) await fresh.tick();
assert.equal(fresh.state.stage, 'uploading', '保存完最后一段后保留真实100%进度，供动画收尾');
assert.equal(fresh.completions.length, 0, '同步尚在收尾时不提前提示完成');
await fresh.tick();
assert.equal(fresh.state.stage, 'complete');
assert.equal(fresh.state.newlySaved, 10);
assert.deepEqual(fresh.completions, ['同步完成'], '实际同步结束后只提示一次');

const saved = fresh.controller.connect(device);
await fresh.tick();
assert.equal(await saved, true);
assert.equal(fresh.state.stage, 'complete');
assert.equal(fresh.timers.length, 0, '已全部保存时不重复同步');
assert.equal(fresh.state.newlySaved, 0);
assert.equal(fresh.completions.length, 1, '重复连接已完成设备不重复提示');
fresh.unmount();

const empty = mount();
localStorage.setItem('teacher-airec-demo-v1:hardware-count:' + device.id, '0');
const noData = empty.controller.connect(device);
await empty.tick();
assert.equal(await noData, true);
assert.equal(empty.state.connection, 'connected');
assert.equal(empty.timers.length, 0, '没有录音时保持已连接，不创建同步任务');
assert.equal(empty.completions.length, 0, '没有同步任务不提示同步完成');
empty.unmount();

const cancelled = mount();
const pending = cancelled.controller.connect(device, 'discovery');
cancelled.controller.stopDiscovery();
await cancelled.tick();
assert.equal(await pending, false);
assert.equal(cancelled.state.connection, 'disconnected');
assert.equal(cancelled.state.knownDevices.length, 0, '取消的配对不能记为已添加');
assert.equal(cancelled.timers.length, 0, '取消后不启动同步');
assert.equal(cancelled.completions.length, 0, '取消连接不提示完成');
cancelled.unmount();

const offline = mount({ online: false });
const offlineConnect = offline.controller.connect(device);
await offline.tick();
assert.equal(await offlineConnect, true);
await offline.finish();
assert.equal(offline.state.stage, 'waiting-network');
assert.equal(offline.state.local.length, 10, '离线连接后仍接收完整录音');
assert.equal(offline.state.cloud.length, 0);
assert.equal(offline.completions.length, 0, '等待联网不提示完成');
offline.online();
await offline.finish();
assert.equal(offline.state.stage, 'complete', '网络恢复后自动继续保存，不依赖开始按钮');
assert.equal(offline.state.cloud.length, 10);
assert.deepEqual(offline.completions, ['同步完成'], '联网补齐保存后提示一次');
offline.unmount();

const failed = mount();
const originalManifest = airecDemoAdapter.manifest;
airecDemoAdapter.manifest = () => { throw new Error('设备暂时不可用，请重试。'); };
const attempt = failed.controller.connect(device);
await failed.tick();
assert.equal(await attempt, false);
assert.equal(failed.state.connection, 'disconnected');
assert.equal(failed.state.stage, 'error');
assert.equal(failed.completions.length, 0, '失败时不提示完成');
airecDemoAdapter.manifest = originalManifest;
const retry = failed.controller.connect(device);
await failed.tick();
assert.equal(await retry, true, '连接失败后可以原位重试');
await failed.finish();
assert.equal(failed.state.stage, 'complete');
failed.unmount();

const scanning = mount();
const startSync = scanning.controller.connect(device);
await scanning.tick();
assert.equal(await startSync, true);
const discovery = scanning.controller.scan();
assert.equal(scanning.state.discovery, 'scanning', '同步期间仍可添加并扫描其他设备');
assert.equal(scanning.state.stage, 'receiving', '扫描不打断当前设备同步');
await scanning.finish();
await discovery;
assert.equal(scanning.state.stage, 'complete');
assert.equal(scanning.state.cloud.length, 10);
assert.equal(scanning.state.devices.length, 2, '同步与扫描均应完整结束');
scanning.unmount();

const savedConnecting = mount();
const savedConnection = savedConnecting.controller.connect(device);
const separateScan = savedConnecting.controller.scan();
savedConnecting.controller.stopDiscovery();
await savedConnecting.tick();
assert.equal(await savedConnection, true, '退出添加页不取消从设备列表发起的重连');
await savedConnecting.finish();
await separateScan;
assert.equal(savedConnecting.state.stage, 'complete');
assert.equal(savedConnecting.state.discovery, 'idle');
savedConnecting.unmount();

const otherDevice = { id: 'airec-sn-002', name: 'AIREC_002' };
const switching = mount();
const first = switching.controller.connect(device);
await switching.tick();
await first;
while (switching.state.cloud.length < 2) await switching.tick();
const second = switching.controller.connect(otherDevice);
assert.equal(switching.state.device.id, otherDevice.id, '同步中允许直接切换设备');
assert.equal(switching.state.connection, 'connecting');
await switching.finish();
assert.equal(await second, true);
assert.equal(switching.state.device.id, otherDevice.id);
assert.equal(switching.state.stage, 'complete');
assert.equal(switching.state.cloud.filter(item => item.deviceId === device.id).length, 2, '切换后旧任务不再写入新设备会话');
assert.equal(switching.state.cloud.filter(item => item.deviceId === otherDevice.id).length, 10);
assert.equal(switching.completions.length, 1, '被切换的旧同步任务不触发完成提示');
const back = switching.controller.connect(device);
await switching.finish();
assert.equal(await back, true);
assert.equal(switching.state.newlySaved, 8, '切回原设备只补剩余录音，已保存进度保留');
assert.equal(switching.state.cloud.length, 20);
switching.unmount();

const pairing = mount();
const replaced = pairing.controller.connect(device, 'discovery');
const latest = pairing.controller.connect(otherDevice, 'discovery');
await pairing.finish();
assert.equal(await replaced, false, '选择另一台设备取消前一次尚未完成的配对');
assert.equal(await latest, true, '连接中仍可选择另一台设备');
assert.equal(pairing.state.device.id, otherDevice.id);
assert.equal(pairing.state.knownDevices.length, 1, '被替换的配对不进入历史设备');
assert.equal(pairing.state.cloud.every(item => item.deviceId === otherDevice.id), true);
pairing.unmount();
console.log('自动同步、设备切换、进度保留及完成提示触发/防重复检查通过');
