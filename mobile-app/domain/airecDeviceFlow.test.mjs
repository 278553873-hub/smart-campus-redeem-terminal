import assert from 'node:assert/strict';
import { build } from 'esbuild';

// 直接运行无状态页面的实际事件回调，不启动浏览器或模拟系统蓝牙。
async function loadView(entry) {
    const result = await build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', jsx: 'automatic', write: false, logLevel: 'silent', loader: { '.png': 'dataurl', '.jpg': 'empty', '.webp': 'empty', '.svg': 'empty', '.css': 'empty' } });
    return (await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'))).default;
}
const [Devices, AddDevice, Status, Me, DeviceCard] = await Promise.all([
    loadView('mobile-app/views/AirecDevicesView.tsx'),
    loadView('mobile-app/views/AirecAddDeviceView.tsx'),
    loadView('mobile-app/components/AirecDeviceStatus.tsx'),
    loadView('mobile-app/views/MeView.tsx'),
    loadView('mobile-app/components/airec/AirecDeviceConnectionCard.tsx'),
]);
const device = { id: 'airec-sn-001', name: 'AIREC_001' };
const state = {
    connection: 'disconnected', device: null, devices: [device], discovery: 'ready', knownDevices: [],
    manifest: [], local: [], cloud: [], stage: 'idle', networkOnline: true, message: '', error: '', newlySaved: 0,
};
const noop = () => {};
const controller = { state, progress: { total: 0, received: 0, saved: 0 }, scan: noop, sync: noop, disconnect: noop, pause: noop, stopDiscovery: noop, connect: async () => true };
function nodes(element) {
    if (!element) return [];
    if (Array.isArray(element)) return element.flatMap(nodes);
    return typeof element === 'object' ? [element, ...nodes(element.props?.children)] : [];
}
const events = [];
assert.equal(nodes(Status({ controller })).some(node => node.type === 'button' || node.props?.onClick), false, '记录页的连接状态仅展示，不承担设备管理入口');
for (const type of ['school', 'personal', 'collaboration']) {
    const tools = nodes(Me({
        teacherProfile: { name: '演示老师' }, currentSpace: { id: type, title: type, type, role: 'teacher' },
        availableTools: { managementTools: [], moreTools: ['bluetoothDevices'] }, pendingCollectionCount: 0,
        onOpenBluetoothDevices: () => events.push('devices'), onOpenSuggestionFeedback: noop,
    })).flatMap(node => node.props?.items ?? []);
    assert.equal(tools.some(item => item.id === 'suggestionFeedback'), false, '极速版更多工具移除建议反馈');
    const entry = tools.find(item => item.id === 'bluetoothDevices');
    assert.ok(entry, '本机设备入口不依赖学校管理员权限或班级来源');
    entry.onClick();
}
const addButton = nodes(Devices({ controller, onAddDevice: () => events.push('add') })).find(node => node.type === 'button' && nodes(node.props.children).some(child => child.props?.['aria-hidden'] === 'true'));
assert.ok(addButton, '空设备页也应有可操作的底部添加按钮');
addButton.props.onClick();
assert.deepEqual(events, ['devices', 'devices', 'devices', 'add'], '我的更多工具到设备页，再到添加页的事件路径应连通');

for (const success of [true, false]) {
    const flow = [];
    const connectController = { ...controller, connect: async candidate => { flow.push(candidate.id); return success; } };
    const candidate = nodes(AddDevice({ controller: connectController, onConnected: () => flow.push('return-to-devices') })).find(node => node.type === 'button' && node.props['aria-label'] === '连接AIREC_001');
    candidate.props.onClick();
    await Promise.resolve();
    await Promise.resolve();
    assert.deepEqual(flow, success ? [device.id, 'return-to-devices'] : [device.id], '连接成功才返回列表，失败留在添加页恢复');
}
const knownDevice = { ...device, lastConnectedAt: '2026-11-05T00:00:00Z' };
const actions = [];
const cardController = {
    ...controller, state: { ...state, device, knownDevices: [knownDevice], stage: 'paused' },
    progress: { total: 10, received: 4, saved: 2 },
    connect: async candidate => { actions.push(`connect:${candidate.id}`); return true; },
    sync: () => actions.push('sync'),
};
const disconnected = nodes(DeviceCard({ device: knownDevice, controller: cardController }));
const reconnect = disconnected.find(node => node.type === 'button');
await reconnect.props.onClick();
assert.deepEqual(actions, ['connect:' + device.id], '保留待同步任务的未连接设备也必须直接连接，不打开详情');

const connecting = nodes(DeviceCard({ device: knownDevice, controller: { ...cardController, state: { ...cardController.state, connection: 'connecting' } } }));
assert.equal(connecting.find(node => node.type === 'button').props.disabled, true, '连接中禁止重复触发');
assert.equal(connecting.find(node => node.type === 'button').props['aria-busy'], true, '连接中应向读屏反馈忙碌状态');

for (const stage of ['idle', 'receiving', 'uploading']) {
    for (const connection of ['connecting', 'connected']) {
        const activeController = { ...cardController, state: { ...cardController.state, stage, connection } };
        const footer = nodes(Devices({ controller: activeController, onAddDevice: noop })).find(node => node.type === 'footer');
        assert.equal(nodes(footer).find(node => node.type === 'button').props.disabled, undefined, '连接或同步中添加按钮均保持可用');
        assert.equal(nodes(footer).some(node => node.type === 'p'), false, '添加按钮上方不增加等待或限制提示');
        const otherDevice = { id: 'airec-sn-002', name: 'AIREC_002' };
        const otherCard = nodes(DeviceCard({ device: { ...otherDevice, lastConnectedAt: knownDevice.lastConnectedAt }, controller: activeController }));
        assert.equal(otherCard.find(node => node.type === 'button').props.disabled, false, '连接或同步期间其他设备仍可选择');
        const nearby = nodes(AddDevice({ controller: { ...activeController, state: { ...activeController.state, devices: [device, otherDevice] } }, onConnected: noop }));
        assert.equal(nearby.find(node => node.props?.['aria-label'] === '连接AIREC_002').props.disabled, false, '添加页不因另一台设备正在连接而禁止选择');
    }
}

for (const stage of ['idle', 'paused', 'receiving', 'uploading']) {
    const card = nodes(DeviceCard({ device: knownDevice, controller: { ...cardController, state: { ...cardController.state, connection: 'connected', stage } } }));
    assert.equal(card.some(node => node.type === 'button' || node.props?.onClick), false, '正常连接与同步均自动处理，不展示开始或暂停操作');
}
const failed = nodes(DeviceCard({ device: knownDevice, controller: { ...cardController, state: { ...cardController.state, connection: 'connected', stage: 'error' } } }));
failed.find(node => node.type === 'button').props.onClick();
assert.deepEqual(actions, ['connect:' + device.id, 'sync'], '只有同步失败时保留原位重试');
for (const progress of [{ total: 0, received: 0, saved: 0 }, { total: 10, received: 10, saved: 10 }]) {
    const idle = nodes(DeviceCard({ device: knownDevice, controller: { ...cardController, progress, state: { ...cardController.state, connection: 'connected', stage: 'complete' } } }));
    assert.equal(idle.some(node => node.type === 'button' || node.props?.onClick), false, '无同步任务时整张状态卡不承担操作');
}
console.log('蓝牙入口、添加连接返回、连接中防重、正常同步只读及异常重试检查通过');
