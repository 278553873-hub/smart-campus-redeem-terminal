/**
 * 教师手机端页面渲染冒烟的执行体。
 *
 * 由 scripts/audit-teacher-mobile-render.mjs 打包后在 Node 里执行：
 * 先补齐浏览器环境桩，再把关键页面各渲染一遍，结果写进 argv 传入的结果文件。
 * 这里依赖应用源码里的 JSX / 样式 / 图片，所以不能直接用 node 运行本文件。
 */
import fs from 'node:fs';
import React from 'react';
import { renderToString } from 'react-dom/server.browser';

const noop = () => {};
const resultPath = process.argv[2];
const results = [];

const storage = () => ({ getItem: () => null, setItem: noop, removeItem: noop, clear: noop, key: () => null, length: 0 });
const elementStub = {
  style: {},
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  setAttribute: noop,
  removeAttribute: noop,
  appendChild: noop,
  removeChild: noop,
  addEventListener: noop,
  removeEventListener: noop,
};

const define = (name, value) => {
  try {
    Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
  } catch (error) {
    console.log('浏览器环境桩写入失败，已跳过：' + name);
  }
};

define('window', globalThis);
define('self', globalThis);
define('localStorage', storage());
define('sessionStorage', storage());
define('navigator', { userAgent: 'render-smoke', maxTouchPoints: 0, language: 'zh-CN' });
define('matchMedia', () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop, media: '' }));
define('requestAnimationFrame', callback => setTimeout(() => callback(Date.now()), 0));
define('cancelAnimationFrame', noop);
define('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
define('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
define('getComputedStyle', () => ({ getPropertyValue: () => '' }));
define('Image', class {});
define('Element', class {});
define('HTMLElement', class extends Element {});
define('customElements', { get: () => undefined, define: noop });
define('location', { href: 'http://localhost/', search: '', hash: '', pathname: '/' });
define('history', { replaceState: noop, pushState: noop });
define('dispatchEvent', () => true);
define('addEventListener', noop);
define('removeEventListener', noop);
define('CustomEvent', class { constructor(type) { this.type = type; } });
define('document', {
  documentElement: elementStub,
  body: elementStub,
  head: elementStub,
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => elementStub,
  addEventListener: noop,
  removeEventListener: noop,
  visibilityState: 'visible',
});

const writeResults = () => {
  fs.writeFileSync(resultPath, JSON.stringify(results));
};

// 服务端渲染会在动态文本之间插入 <!-- --> 占位注释，比对可见文案前先去掉。
const plainText = html => html.split('<!-- -->').join('');

const renderPage = async (name, load, props, verify, { minimumLength = 400 } = {}) => {
  try {
    const module = await load();
    const Component = module.default;
    if (!Component) throw new Error('页面模块没有默认导出组件');
    const html = renderToString(React.createElement(Component, props));
    if (!html || html.length < minimumLength) throw new Error('页面渲染结果为空');
    verify?.(html);
    results.push({ name, ok: true, htmlLength: html.length });
  } catch (error) {
    results.push({
      name,
      ok: false,
      message: error && error.message ? error.message : String(error),
      stack: error && error.stack ? String(error.stack) : '',
    });
  }
  writeResults();
};

for (const recordMode of [
  { activeTab: 'student', canRecordClass: false },
  { activeTab: 'student', canRecordClass: true },
  { activeTab: 'class', canRecordClass: true },
  { activeTab: 'class', canRecordClass: true, availableRecordScopes: ['class'] },
  { activeTab: 'student', canRecordClass: true, availableRecordScopes: ['student'] },
]) {
  for (const showFirstRecordGuide of [false, true]) {
    await renderPage('记录首页（' + recordMode.activeTab + '，班级权限' + recordMode.canRecordClass + '，范围' + (recordMode.availableRecordScopes ?? '默认') + '，引导' + showFirstRecordGuide + '）', () => import('../mobile-app/views/ClassRecordLogView'), {
      ...recordMode, showFirstRecordGuide, isMainView: true,
      onBack: noop, onTabChange: noop, onViewIndicators: noop,
    }, html => {
      const text = plainText(html);
      const hasMultipleScopes = recordMode.canRecordClass && (recordMode.availableRecordScopes?.length ?? 2) > 1;
      if (html.includes('aria-label="记录对象"') !== hasMultipleScopes) throw new Error('仅双对象展示切换入口');
      if (!hasMultipleScopes && />记录(?:学生|班级)</.test(html)) throw new Error('单对象不应展示替代标题');
      if (showFirstRecordGuide) {
        if (!text.includes('试试通过语音描述一下内容：')) throw new Error('初次记录应展示语音示例');
        if (text.includes('AI 智能解读')) throw new Error('引导态不应同时展示历史识别结果');
      } else if (!text.includes('AI 智能解读') || !text.includes('总分')) {
        throw new Error('记录列表应完整展示识别结果与分数');
      }
    });
  }
}

const inputBarProps = {
  showKeyboard: false, showTabBar: true, inputText: '', hasSelectionTarget: true,
  emptySelectionPrompt: '请选择学生', isMultiSelectMode: false, selectedTargetCount: 0, selectedTargetUnit: '人',
  voicePressState: 'idle', onCloseKeyboard: noop, onCameraClick: noop, onVoicePointerDown: noop,
  onKeyboardClick: noop, onVoiceKeyboardActivate: noop,
};
for (const scenario of [
  { label: '玻璃待录音', props: {}, text: '按住说话' },
  { label: '无底部导航', props: { showTabBar: false }, text: '按住说话' },
  { label: '录音中', props: { voicePressState: 'listening' }, text: '松手发送，上移取消' },
  { label: '取消录音', props: { voicePressState: 'canceling' }, text: '松开取消' },
  { label: '未选择对象', props: { hasSelectionTarget: false, isMultiSelectMode: true }, text: '请选择学生' },
  { label: '多选对象', props: { isMultiSelectMode: true, selectedTargetCount: 12 }, text: '按住说话 · 12人' },
  { label: '键盘空内容', props: { showKeyboard: true }, text: '请输入' },
  { label: '键盘草稿', props: { showKeyboard: true, inputText: '全班同学积极参与劳动。' }, text: '全班同学积极参与劳动。' },
]) {
  await renderPage('悬浮录入条（' + scenario.label + '）', () => import('../mobile-app/components/TeacherRecordInputBar'), {
    ...inputBarProps, ...scenario.props,
  }, html => {
    if (!plainText(html).includes(scenario.text)) throw new Error('录入状态文案缺失：' + scenario.text);
    if (scenario.props.hasSelectionTarget === false && (html.match(/disabled=""/g) ?? []).length !== 2) throw new Error('没有选择对象时禁用拍照与语音提交，允许保留文字草稿');
    if (scenario.props.showKeyboard && !html.includes(scenario.props.inputText ? 'aria-label="发送记录"' : 'aria-label="切换到语音输入"')) throw new Error('文字形态应按草稿内容提供发送或语音入口');
  });
}
for (const scenario of [
  { mode: 'text', ids: ['record-student'], names: '演示学生' },
  { mode: 'voice', ids: ['record-student'], names: '演示学生' },
  { mode: 'camera', ids: ['record-student'], names: '演示学生' },
  { mode: 'camera', ids: [], names: '' },
]) {
  await renderPage('全屏录入（' + scenario.mode + '，已选' + scenario.ids.length + '人）', () => import('../mobile-app/views/RecordInputView'), {
    initialMode: scenario.mode, initialStudentIds: scenario.ids, studentNameList: scenario.names,
    onClose: noop, onAnalysisComplete: noop,
  }, html => {
    const text = plainText(html);
    const expected = scenario.mode === 'camera' ? '轻触拍照' : scenario.mode === 'text' ? '发送识别' : '按住 说话';
    if (!text.includes(expected)) throw new Error('录入模式缺少对应操作：' + expected);
    if (scenario.mode === 'camera' && scenario.ids.length === 0 && text.includes('未选择学生')) throw new Error('拍照无预选学生时不应显示占位姓名');
  });
}
for (const mode of ['voice', 'text']) {
  await renderPage('班级全屏录入（' + mode + '）', () => import('../mobile-app/views/RecordInputView'), {
    scope: 'class', initialMode: mode, initialStudentIds: [], studentNameList: '',
    onClose: noop, onAnalysisComplete: noop,
  }, html => {
    if (!plainText(html).includes('记录班级') || plainText(html).includes('未选择学生')) throw new Error('班级录入不得出现学生选择提示');
  });
}

const demoStudents = Array.from({ length: 6 }, (_, index) => ({
  id: 'render-smoke-student-' + (index + 1),
  name: '演示学生' + (index + 1),
  gender: index % 2 === 0 ? '男' : '女',
  grade: '三年级',
  class: '三年级1班',
  status: 'active',
  campusCoin: 120 - index * 5,
}));

const { createDemoCoinLedger } = await import('../mobile-app/data/campusCoinLedger');
const { expandCoinLedgerForStudent } = await import('../mobile-app/domain/campusCoinLedger');
const { DEFAULT_COIN_ISSUANCE_CONFIG, GET_MOCK_CAMPUS_COIN_DETAIL } = await import('../mobile-app/constants');

// 用真实演示流水渲染，才能覆盖到列表、批次、撤回等分支，而不只是空状态。
const ledgerEntries = createDemoCoinLedger({
  classId: 'render-smoke-class',
  students: demoStudents,
  operator: '演示老师',
  today: new Date(),
});

await renderPage('教师端首页（默认页面）', () => import('../mobile-app/App'), {});

const { teacherAppFeatures, resolveTeacherAppRecordScopes } = await import('../mobile-app/config/teacherAppFeatures');
const { TEACHER_SPACE_OPTIONS } = await import('../mobile-app/data/teacherSpaces');
const { filterAirecDevices, getAirecProgress } = await import('../mobile-app/domain/airecSync');
const { airecDemoAdapter } = await import('../mobile-app/services/airecDemoAdapter');
const { default: AirecDeviceConnectionCard } = await import('../mobile-app/components/airec/AirecDeviceConnectionCard');
const { default: AirecDeviceStatus } = await import('../mobile-app/components/AirecDeviceStatus');

const airecDevice = { id: 'airec-sn-001', name: 'AIREC_001' };
const airecManifest = airecDemoAdapter.manifest(airecDevice.id);
const airecBaseState = {
  connection: 'connected', device: airecDevice, devices: [], discovery: 'idle',
  knownDevices: [{ ...airecDevice, lastConnectedAt: '2026-11-05T00:00:00Z' }],
  manifest: airecManifest, local: [], cloud: [], stage: 'idle',
  networkOnline: true, message: '', error: '', newlySaved: 0,
};
const airecController = state => ({
  state, progress: getAirecProgress(state.manifest, state.local, state.cloud),
  scan: noop, connect: noop, sync: noop, disconnect: noop, pause: noop, stopDiscovery: noop,
});
for (const scenario of [
  { name: '从未添加', state: { knownDevices: [], device: null, connection: 'disconnected', manifest: [] }, label: '未添加' },
  { name: '连接且无任务', state: { manifest: [] }, label: '已连接' },
  { name: '连接且已同步', state: { cloud: airecManifest, stage: 'complete' }, label: '已连接' },
  { name: '接收阶段', state: { stage: 'receiving', local: airecManifest.slice(0, 4) }, label: '同步 0%', progress: 0 },
  { name: '上云阶段', state: { stage: 'uploading', local: airecManifest, cloud: airecManifest.slice(0, 6) }, label: '同步 60%', progress: 60 },
  { name: '历史设备未连接', state: { connection: 'disconnected', device: null, manifest: [] }, label: '未连接' },
  { name: '配对完成前保持未连接', state: { connection: 'connecting' }, label: '未连接' },
]) {
  await renderPage('顶部设备状态（' + scenario.name + '）', async () => ({ default: AirecDeviceStatus }), {
    controller: airecController({ ...airecBaseState, ...scenario.state }),
  }, html => {
    if (!plainText(html).includes(scenario.label)) throw new Error('缺少对应设备状态');
    if (html.includes('<button') || html.includes('打开我的设备')) throw new Error('顶部状态仅作展示，不能作为入口');
    if (scenario.progress !== undefined && (!html.includes('role="progressbar"') || !html.includes('aria-valuenow="' + scenario.progress + '"') || !html.includes('stroke-dashoffset="' + (100 - scenario.progress) + '"'))) throw new Error('环形进度需与真实完成量一致');
    if (scenario.progress === undefined && html.includes('role="progressbar"')) throw new Error('空闲和未连接不能显示虚假同步进度');
  });
}
const airecHistory = [
  { id: 'airec-sn-002', name: 'AIREC_002', lastConnectedAt: '2026-11-06T00:00:00Z' },
  { ...airecDevice, lastConnectedAt: '2026-11-05T00:00:00Z' },
];
for (const scenario of [
  { name: '空设备列表', state: { knownDevices: [], device: null, manifest: [], connection: 'disconnected' }, expected: ['还没有添加设备', '添加设备'] },
  { name: '已连接置顶并保留全部历史', state: { knownDevices: airecHistory }, expected: ['AIREC_001', 'AIREC_002', '已连接'] },
  { name: '离开设备页后仍展示同步', state: { knownDevices: airecHistory, stage: 'uploading', local: airecManifest, cloud: airecManifest.slice(0, 9) }, expected: ['同步中(9/10)'] },
]) {
  await renderPage('蓝牙设备子页面（' + scenario.name + '）', () => import('../mobile-app/views/AirecDevicesView'), {
    controller: airecController({ ...airecBaseState, ...scenario.state }), onAddDevice: noop,
  }, html => {
    for (const expected of scenario.expected) if (!plainText(html).includes(expected)) throw new Error('设备页缺少：' + expected);
    if (!html.includes('<footer') || !html.includes('添加设备')) throw new Error('设备列表须有底部添加按钮');
    const footer = html.split('<footer')[1]?.split('</footer>')[0] ?? '';
    if (/<p(?:\s|>)/.test(footer) || footer.includes('disabled=')) throw new Error('添加设备按钮始终可用，按钮上方不显示等待或限制提示');
    if (!html.includes('<img') || html.includes('录音与同步') || html.includes('role="dialog"')) throw new Error('设备列表保留插图及状态，不提供同步详情弹窗');
    if (html.includes('role="progressbar"') !== (scenario.state.stage === 'uploading')) throw new Error('同步状态应在设备卡内显示真实进度条');
    if (scenario.state.knownDevices.length > 0 && html.indexOf('data-device-id="airec-sn-001"') > html.indexOf('data-device-id="airec-sn-002"')) throw new Error('当前连接设备未置顶');
  });
}
for (const scenario of [
  { name: '涟漪扫描', state: { discovery: 'scanning', device: null, connection: 'disconnected', devices: [] }, expected: ['附近的设备', 'is-scanning', 'airec-scan-ring-three'] },
  { name: '扫描结果仅AIREC', state: { discovery: 'ready', devices: filterAirecDevices(airecDemoAdapter.discover()) }, expected: ['AIREC_001', 'AIREC_002', '重新扫描'] },
  { name: '无结果可恢复', state: { discovery: 'ready', device: null, connection: 'disconnected', devices: [] }, expected: ['暂未找到设备', '重新扫描'] },
  { name: '连接中防止重复点击', state: { discovery: 'idle', connection: 'connecting', devices: filterAirecDevices(airecDemoAdapter.discover()) }, expected: ['正在连接麦克风', 'disabled=""'] },
]) {
  await renderPage('添加设备子页面（' + scenario.name + '）', () => import('../mobile-app/views/AirecAddDeviceView'), {
    controller: airecController({ ...airecBaseState, ...scenario.state }), onConnected: noop,
  }, html => {
    for (const expected of scenario.expected) if (!plainText(html).includes(expected)) throw new Error('添加页缺少：' + expected);
    if (!html.includes('<img')) throw new Error('未接入生成的麦克风插图');
    if (html.includes('附近的 AIREC') || html.includes('>扫描中<')) throw new Error('扫描页应精简标题及重复扫描文字');
    if (html.includes('蓝牙耳机') || html.includes('办公室音箱')) throw new Error('不能展示非 AIREC 设备');
    if (scenario.state.discovery !== 'scanning' && html.includes('is-scanning')) throw new Error('扫描结束后必须停止扫描动效');
    if (scenario.state.discovery === 'scanning' && (html.match(/vector-effect="non-scaling-stroke"/g) ?? []).length !== 3) throw new Error('三层涟漪须保持固定细描边');
  });
}
for (const scenario of [
  { name: '无任务绿点已连接', state: { manifest: [] }, expected: '已连接', readonly: true, dot: '--tm-status-positive' },
  { name: '同步完成绿点已连接', state: { stage: 'complete', cloud: airecManifest }, expected: '已连接', readonly: true, dot: '--tm-status-positive' },
  { name: '连接后不展示手动开始', state: {}, expected: '已连接', readonly: true, dot: '--tm-status-positive' },
  { name: '接收中0条对应零进度', state: { stage: 'receiving', local: airecManifest.slice(0, 4) }, expected: '同步中(0/10)', percent: 0, readonly: true, dot: '--tm-brand-secondary' },
  { name: '已接收完但尚未保存对应零进度', state: { stage: 'uploading', local: airecManifest }, expected: '同步中(0/10)', percent: 0, readonly: true, dot: '--tm-brand-secondary' },
  { name: '保存6条对应百分之六十', state: { stage: 'uploading', local: airecManifest, cloud: airecManifest.slice(0, 6) }, expected: '同步中(6/10)', percent: 60, readonly: true, dot: '--tm-brand-secondary' },
  { name: '百分之百保留收尾进度', state: { stage: 'uploading', local: airecManifest, cloud: airecManifest }, expected: '同步中(10/10)', percent: 100, readonly: true, dot: '--tm-brand-secondary' },
  { name: '等待联网自动恢复', state: { stage: 'waiting-network', networkOnline: false, local: airecManifest }, expected: '等待联网', readonly: true },
  { name: '同步失败提供重试', state: { stage: 'error' }, expected: '重试' },
  { name: '连接中箭头替换为加载', state: { connection: 'connecting' }, expected: '连接中', disabled: true, connecting: true },
  { name: '断线只提供连接', state: { connection: 'disconnected', stage: 'paused' }, expected: '未连接', arrow: true },
]) {
  await renderPage('极速版设备状态卡（' + scenario.name + '）', async () => ({ default: AirecDeviceConnectionCard }), {
    device: airecBaseState.knownDevices[0], controller: airecController({ ...airecBaseState, ...scenario.state }),
  }, html => {
    if (!plainText(html).includes(scenario.expected)) throw new Error('设备卡缺少状态或原位操作：' + scenario.expected);
    if (['已同步', '无同步任务', '查看同步', '段待同步', '开始同步', '暂停'].some(text => plainText(html).includes(text))) throw new Error('设备卡不展示多余的提示、手动开始或暂停操作');
    if (html.includes('lucide-chevron-right') !== Boolean(scenario.arrow)) throw new Error('只有未连接设备提供连接箭头');
    if (html.includes('animate-spin') !== Boolean(scenario.connecting)) throw new Error('连接中须在原箭头位置显示旋转加载');
    if (scenario.readonly && html.includes('<button')) throw new Error('已连接或自动同步状态卡只作展示');
    if (scenario.dot && (!html.includes('airec-status-dot') || !html.includes(scenario.dot) || !html.includes('is-breathing'))) throw new Error('连接与同步须展示相应颜色的呼吸小点');
    if (html.includes('disabled=""') !== Boolean(scenario.disabled)) throw new Error('原位操作可用状态与恢复条件不一致');
    if (scenario.percent !== undefined && (!html.includes('role="progressbar"') || !html.includes('aria-valuenow="' + scenario.percent + '"') || !html.includes('scaleX(' + scenario.percent / 100 + ')'))) throw new Error('进度条和读屏数值必须反映真实总体进度');
    if (scenario.percent === 0 && !html.includes('data-empty="true"')) throw new Error('零进度应立即清空，不残留前一任务进度');
    if (scenario.percent === undefined && html.includes('role="progressbar"')) throw new Error('非同步状态不展示虚假进度');
  }, { minimumLength: 100 });
}
for (const state of [
  { ...airecBaseState, connection: 'disconnected', device: null, manifest: [] },
  airecBaseState,
  { ...airecBaseState, stage: 'receiving', local: airecManifest.slice(0, 4) },
]) {
  const starSpace = TEACHER_SPACE_OPTIONS.find(space => space.id === 'school-star');
  const qingheSpace = TEACHER_SPACE_OPTIONS.find(space => space.id === 'school-qinghe');
  const liteScopes = resolveTeacherAppRecordScopes('lite', starSpace);
  await renderPage('极速版班级记录（首版隐藏设备状态，' + state.stage + '，' + state.connection + '）', () => import('../mobile-app/views/ClassRecordLogView'), {
    activeTab: 'class', availableRecordScopes: liteScopes, canRecordClass: true,
    isMainView: true, onBack: noop, onTabChange: noop, onViewIndicators: noop,
  }, html => {
    if (liteScopes.join(',') !== 'class' || resolveTeacherAppRecordScopes('lite', qingheSpace).length !== 0) throw new Error('极速版须仅开放已有班级权限');
    if (resolveTeacherAppRecordScopes('full', starSpace).join(',') !== 'student,class') throw new Error('完整版评价范围不应受到影响');
    if (html.includes('aria-label="记录对象"')) throw new Error('极速版不应提供学生评价切换');
    if (html.includes('aria-label="蓝牙麦克风：') || html.includes('录音同步总体进度')) throw new Error('第一版记录页不展示设备状态及同步进度环');
    const tools = html.split('aria-label="记录工具"')[1]?.split('</div>')[0] ?? '';
    if (!tools.includes('查看班级指标')) throw new Error('记录页保留指标入口');
  });
}
for (const edition of ['full', 'lite']) {
  await renderPage('教师端登录（' + edition + '）', () => import('../mobile-app/App'), { edition }, html => {
    if (html.includes('>一键登录<') !== teacherAppFeatures[edition].wechatLogin) throw new Error('微信登录入口不符合版本范围');
    if (!html.includes('手机号登录/注册')) throw new Error('须保留手机号登录');
    const capsuleInset = teacherAppFeatures[edition].miniProgramCapsule ? 112 : 0;
    if (!html.includes('--mini-program-capsule-right-inset:' + capsuleInset + 'px')) throw new Error('小程序胶囊空间不符合版本范围');
  });
}
for (const deviceType of ['phone', 'tablet']) {
  for (const showDeviceFrame of [true, false]) {
    await renderPage('极速版模拟设备（' + deviceType + '，机身' + showDeviceFrame + '）', () => import('../components/PhoneMockup'), {
      deviceType, showDeviceFrame, hideCapsule: true, contentTopInsetMode: 'status-bar',
      screenOverlayRootId: 'teacher-mobile-overlay-root',
      children: React.createElement('main', null, '极速版原页面内容'),
    }, html => {
      const tablet = deviceType === 'tablet';
      if (!html.includes('width:' + (tablet ? 834 : 393) + 'px;height:' + (tablet ? 1194 : 852) + 'px')) throw new Error('模拟设备视口尺寸不正确');
      if (!html.includes('--mini-program-status-bar-height:' + (showDeviceFrame ? (tablet ? 28 : 54) : 0) + 'px')) throw new Error('模拟系统状态栏高度不正确');
      if (!html.includes('--mini-program-title-bar-height:44px')) throw new Error('业务标题栏高度应保持44像素');
      if (!html.includes('极速版原页面内容') || !html.includes('id="teacher-mobile-overlay-root"')) throw new Error('切换模拟设备应保留页面及公共弹窗挂载层');
    });
  }
}
await renderPage('极速版平板登录预览', () => import('../mobile-app/App'), { edition: 'lite', previewDevice: 'tablet' }, html => {
  if (!html.includes('data-preview-device="tablet"') || !html.includes('width:834px;height:1194px')) throw new Error('极速版未接入竖屏平板模拟视口');
  if (!html.includes('>一键登录<') || !html.includes('手机号登录/注册')) throw new Error('平板预览应继续使用极速版登录页');
  if (html.includes('教师端主要导航')) throw new Error('平板预览不得切换到教师Pad业务版本');
});
const previousAppSearch = window.location.search;
window.location.search = '?app=teacher-mobile-lite';
try {
  await renderPage('极速版演示入口', () => import('../App'), {}, html => {
    if (!html.includes('aria-label="教师-手机端(极速版)"')) throw new Error('缺少极速版环境入口');
    if (html.includes('>教师-pad端<')) throw new Error('教师 Pad 入口仍在环境面板中展示');
    if (!html.includes('>一键登录<') || !html.includes('手机号登录/注册')) throw new Error('极速版须同时支持微信一键登录和手机号登录');
    if (!html.includes('role="switch" aria-checked="true" aria-label="模拟真机"')) throw new Error('应提供统一的模拟真机开关');
    if (!html.includes('aria-label="模拟设备"')) throw new Error('开启真机模拟后应提供设备选择');
    if (!html.includes('aria-label="真机模拟设备配置"') || !html.includes('>设备类型</h2>')) throw new Error('设备选择应沿用已有预览配置卡片');
    const deviceOptions = html.split('aria-label="模拟设备"')[1]?.split('</section>')[0] ?? '';
    if (!/aria-pressed="true"[^>]*>手机<\/button>/.test(deviceOptions) || !/aria-pressed="false"[^>]*>平板<\/button>/.test(deviceOptions)) throw new Error('真机模拟应默认选择手机');
    if (html.includes('aria-label="模拟真实手机"') || html.includes('aria-label="模拟真实平板"')) throw new Error('极速版不应再使用两个互斥开关');
  });
} finally {
  window.location.search = previousAppSearch;
}

for (const scenario of [
  { name: '关闭发放', enabled: false, budgetMode: 'per_student' },
  { name: '按人预算', enabled: true, budgetMode: 'per_student' },
  { name: '按班预算', enabled: true, budgetMode: 'per_class' },
  { name: '加分就发·日上限', enabled: true, mode: 'score', scoreRule: { coinsPerPoint: 1, limitEnabled: true, limitPeriod: 'daily', limitAmount: 10 } },
  { name: '加分就发·周上限', enabled: true, mode: 'score', scoreRule: { coinsPerPoint: 2, limitEnabled: true, limitPeriod: 'weekly', limitAmount: 20 } },
  { name: '加分就发·月上限', enabled: true, mode: 'score', scoreRule: { coinsPerPoint: 1, limitEnabled: true, limitPeriod: 'monthly', limitAmount: 80 } },
  { name: '加分就发·不限额', enabled: true, mode: 'score', scoreRule: { coinsPerPoint: 1, limitEnabled: false, limitPeriod: 'weekly', limitAmount: 20 } },
]) {
  await renderPage('成长币发放（' + scenario.name + '）', async () => ({
    default: (await import('../mobile-app/views/MeFeatureViews')).CoinIssuanceView,
  }), {
    config: { ...DEFAULT_COIN_ISSUANCE_CONFIG, ...scenario },
    onChange: noop,
    onSave: noop,
  }, html => {
    const text = plainText(html);
    if (scenario.mode === 'score') {
      if (text.includes('阳光保底比例') || text.includes('发放门槛')) throw new Error('加分就发不应展示定期发放参数');
      if (text.includes('加分后，币立即到账，扣分不扣币。') || !text.includes('1分=')) throw new Error('发放数量文案不正确');
      if (scenario.scoreRule.limitEnabled && (!text.includes('上限规则') || !html.includes('aria-label="发放上限周期，当前'))) throw new Error('缺少上限规则或周期选择入口');
      if (html.includes('<select')) throw new Error('手机端成长币配置应使用底部弹窗选择');
      if (text.includes('兑换不恢复额度') || text.includes('负分不影响')) throw new Error('不应展示已移除的提示文案');
      if (text.includes('aria-label="每人每周期发放上限"') !== scenario.scoreRule.limitEnabled) throw new Error('上限字段应随开关显示');
    } else if (scenario.enabled) {
      if (!text.includes('阳光保底比例')) throw new Error('旧配置应继续展示定期发放参数');
      if (html.includes('<select') || !html.includes('aria-label="发放周期，当前')) throw new Error('定期发放周期应通过底部弹窗选择');
    }
  });
}

const scoreCoinDetail = GET_MOCK_CAMPUS_COIN_DETAIL(demoStudents[0], { ...DEFAULT_COIN_ISSUANCE_CONFIG, mode: 'score' });
const legacyCoinDetail = GET_MOCK_CAMPUS_COIN_DETAIL(demoStudents[0]);
if (scoreCoinDetail.balance !== legacyCoinDetail.balance || scoreCoinDetail.bankDeposit !== legacyCoinDetail.bankDeposit
    || JSON.stringify(scoreCoinDetail.issueRecords) !== JSON.stringify(legacyCoinDetail.issueRecords)
    || JSON.stringify(scoreCoinDetail.consumeRecords) !== JSON.stringify(legacyCoinDetail.consumeRecords)) {
  throw new Error('更换规则不得改写历史余额、存款或流水');
}
await renderPage('学生成长币明细（加分就发）', () => import('../mobile-app/views/StudentCoinDetailView'), {
  student: demoStudents[0], coinDetail: scoreCoinDetail, onBack: noop,
}, html => {
  const text = plainText(html);
  if (!text.includes('每人每周最多获得 20 币')) throw new Error('学生明细未展示加分规则');
  if (text.includes('预计可得') || text.includes('阳光保底')) throw new Error('即时发币不应继续显示周期结算预估');
  for (const label of ['兑换退还', '评价修改补发', '已撤回', '存款利息', '德育 / 文明礼仪 / 尊师孝亲，+2分；智育 / 学习习惯 / 专注听讲，+3分']) {
    if (!text.includes(label)) throw new Error('学生流水缺少展示规则：' + label);
  }
  if (html.includes('line-clamp-2')) throw new Error('学生流水不应截断完整指标');
});

// 学校货币外观：用独立存储验证各端读到名称/图标，结束后还原，不污染后续页面。
const coinStorageBefore = globalThis.localStorage;
const coinMemory = new Map();
define('localStorage', { ...storage(), getItem: key => coinMemory.get(key) ?? null, setItem: (key, value) => coinMemory.set(key, value) });
const { saveCoinBranding } = await import('../shared/growthCoinBrandingStore');
const { GrowthCoinScope } = await import('../components/GrowthCoinBranding');
saveCoinBranding('school-star', { name: '向阳币', iconUrl: '/assets/c4d_growth.png' });
const loadCoinScoped = async (load, schoolId = 'school-star') => {
  const module = await load();
  return { default: props => React.createElement(GrowthCoinScope, { schoolId }, React.createElement(module.default, props)) };
};
await renderPage('成长币发放（学校名称与图标）', () => loadCoinScoped(async () => ({ default: (await import('../mobile-app/views/MeFeatureViews')).CoinIssuanceView })), {
  config: DEFAULT_COIN_ISSUANCE_CONFIG, onChange: noop,
}, html => {
  if (!plainText(html).includes('开启成长币发放') || !html.includes('aria-label="修改货币名称，当前向阳币"') || !html.includes('/assets/c4d_growth.png')) throw new Error('学校设置未回显名称和图标');
  if (!html.includes('grid-template-columns:repeat(2, minmax(0, 1fr))')) throw new Error('成长币页签应等宽铺满100%');
  if (! /role="tabpanel" aria-label="名称与图标"[^>]*hidden=""/.test(html) || /role="tabpanel" aria-label="发放规则"[^>]*hidden/.test(html)) throw new Error('配置默认页签应展示发放规则、隐藏名称与图标');
});
await renderPage('学生明细（学校名称与图标）', () => loadCoinScoped(() => import('../mobile-app/views/StudentCoinDetailView')), {
  student: demoStudents[0], coinDetail: legacyCoinDetail, onBack: noop,
}, html => {
  if (!html.includes('校园币明细</h1>') || html.includes('向阳币明细</h1>') || !html.includes('向阳币') || !html.includes('/assets/c4d_growth.png')) throw new Error('学生明细标题应固定，卡片仍同步学校货币外观');
});
await renderPage('学生明细（学校隔离）', () => loadCoinScoped(() => import('../mobile-app/views/StudentCoinDetailView'), 'another-school'), {
  student: demoStudents[0], coinDetail: legacyCoinDetail, onBack: noop,
}, html => {
  if (html.includes('向阳币') || !html.includes('校园币明细</h1>')) throw new Error('其他学校读到了本校货币名称或页面标题不固定');
});
await renderPage('学校后台（自动发放配置）', () => import('../components/CoinIssuanceSettings'), {
  value: DEFAULT_COIN_ISSUANCE_CONFIG, onChange: noop,
}, html => {
  if (!plainText(html).includes('开启自动发放')) throw new Error('学校后台缺少自动发放配置');
});
await renderPage('学校后台（独立名称与图标配置）', async () => {
  const { default: BrandFields } = await import('../components/PcGrowthCoinBrandFields');
  const { useCoinBrandingEditor } = await import('../components/GrowthCoinBrandFields');
  return { default: () => React.createElement(BrandFields, { editor: useCoinBrandingEditor() }) };
}, {}, html => {
  if (!html.includes('id="pc-growth-coin-name"') || !html.includes('value="向阳币"')) throw new Error('后台名称编辑未读取学校配置');
});
// 家长日常行为录入：真实渲染表单及记录列表，避免仅构建通过却在点击后白屏。
for (const hasContent of [false, true]) {
  await renderPage(`家长记录录入页（内容${hasContent}）`, () => import('../components/parent-app/ParentBehaviorRecordPage'), {
    child: { name: '郑小磊', className: '2025级1班' }, header: React.createElement('h1', null, '记录表现'),
    draft: { content: hasContent ? '主动帮助奶奶整理餐桌' : '', occurredOn: '2026-11-03', images: [] }, onChange: noop, onSave: noop,
  }, html => {
    if (!html.includes('按住说话') || html.includes('parent-record-transcript') !== hasContent || html.includes('type="date"')) throw new Error('空状态应引导下方录入，有内容才展示预览区');
    if (!hasContent && (!html.includes('按住下方按钮') || html.includes('编辑预览记录'))) throw new Error('空状态不得展示编辑入口');
  });
  await renderPage(`家长记录列表（内容${hasContent}）`, () => import('../components/parent-app/ParentBehaviorRecordList'), {
    childName: '郑小磊', onCreate: noop, records: hasContent ? [{ id: 'parent-record-test', source: 'parent', guardianId: 'parent-a', author: '妈妈', subject: { schoolCode: 'school-a', studentNo: '001', name: '郑小磊' }, content: '主动帮助奶奶整理餐桌', occurredOn: '2026-11-03', createdAt: 1, images: ['/assets/c4d_growth.png'] }] : [],
  }, html => {
    if (hasContent && (!html.includes('妈妈') || !html.includes('记录更多操作') || !html.includes('查看记录图片第 1 张'))) throw new Error('家长记录卡缺少评价人或更多操作');
    if (!html.includes(hasContent ? '主动帮助奶奶整理餐桌' : '还没有家长记录')) throw new Error('记录列表或空状态未正确展示');
  });
}
await renderPage('家长记录入口不依赖学校明细与成长币权限', () => import('../components/ParentApp'), {
  parentGrowthCoinEnabled: false, parentBehaviorRecordingEnabled: true,
  parentEvaluationVisibility: { positive: 'hidden', negative: 'hidden' },
}, html => {
  if (!html.includes('记录表现') || !html.includes('查看记录')) throw new Error('家长录入和历史查看不能被其他功能开关隐藏');
});
await renderPage('家长记录关闭后保留历史查看', () => import('../components/ParentApp'), {
  parentBehaviorRecordingEnabled: false,
}, html => {
  if (html.includes('记录表现') || !html.includes('查看记录')) throw new Error('录入权限关闭后应隐藏新建但保留历史查看');
});
// 成长币总开关和银行子开关独立验证，包含旧白屏问题所在的学生信息区域。
for (const enabled of [false, true]) {
  for (const bankEnabled of [false, true]) {
    for (const showPhoneShell of [false, true]) {
      await renderPage(`家长成长页（成长币${enabled}，银行${bankEnabled}，手机壳${showPhoneShell}）`, () => import('../components/ParentApp'), {
        parentGrowthCoinEnabled: enabled, parentBankFeatureEnabled: bankEnabled, showPhoneShell,
      }, html => {
        const text = plainText(html);
        if (!html.includes('pg-child-picker') || !html.includes('pg-messages')) throw new Error('身份与消息入口渲染失败');
        for (const label of ['本期预计可得', '收支明细', '兑换密码']) {
          if (text.includes(label) !== enabled) throw new Error(`成长币开放边界错误：${label}`);
        }
        if (text.includes('进入银行') !== (enabled && bankEnabled)) throw new Error('银行入口未遵循两级开关');
        if (text.includes('已存') !== (enabled && bankEnabled)) throw new Error('已存余额未遵循银行开关');
        if (enabled && !bankEnabled && !html.includes('pg-balances-single')) throw new Error('关闭银行后可用余额未铺满');
      });
    }
    await renderPage(`成长币预览配置（成长币${enabled}，银行${bankEnabled}）`, () => import('../components/ParentGrowthCoinFeaturePreviewControls'), {
      settings: { enabled, bankEnabled }, onChange: noop,
    }, html => {
      if (!html.includes('成长币功能开放')) throw new Error('主开关名称错误');
      if (html.includes('银行功能开放状态') !== enabled) throw new Error('银行子配置应仅在成长币开放后出现');
      const selectedCount = (html.match(/aria-pressed="true"/g) ?? []).length;
      if (selectedCount !== (enabled ? 2 : 1)) throw new Error('每组开关应只选中一个选项');
    });
  }
}
await renderPage('家长端（学校名称与图标）', () => import('../components/ParentApp'), {}, html => {
  if (!html.includes('向阳币') || !html.includes('/assets/c4d_growth.png')) throw new Error('家长端未同步当前孩子学校的名称与图标');
});
const { createDemoGrowthCoinFlows } = await import('../shared/demoGrowthCoinFlow');
const { ParentPageHeader } = await import('../components/parent-app/ParentUI');
const demoCoinFlows = createDemoGrowthCoinFlows(demoStudents[0].id);
for (const canViewEvaluationDetails of [true, false]) {
  await renderPage('家长收支列表（评价明细权限' + canViewEvaluationDetails + '）', () => import('../components/parent-app/ParentCoinFlowView'), {
    records: demoCoinFlows, header: React.createElement(ParentPageHeader, { title: '成长币明细', onBack: noop, backLabel: '返回成长页' }), canViewEvaluationDetails,
  }, html => {
    const text = plainText(html);
    if (!text.includes('成长嘉奖') || !text.includes('加分奖励') || !text.includes('每周奖励') || !text.includes('每月奖励')) throw new Error('家长流水缺少成长嘉奖奖励类型');
    if (canViewEvaluationDetails && !text.includes('加分奖励（德育 / 文明礼仪 / 尊师孝亲，+2分；智育 / 学习习惯 / 专注听讲，+3分）')) throw new Error('家长流水未展示完整指标及各项分值');
    if (!canViewEvaluationDetails && (text.includes('尊师孝亲') || text.includes('专注听讲') || text.includes('文明用餐'))) throw new Error('家长无明细权限时透出了评价指标');
    for (const label of ['兑换退还', '评价修改补发', '已撤回', '存款利息']) {
      if (!text.includes(label)) throw new Error('家长流水缺少展示规则：' + label);
    }
    if (html.includes('line-clamp-2')) throw new Error('家长流水不应截断完整指标');
    if (html.includes('aria-haspopup="dialog"')) throw new Error('本次不应新增单笔流水详情弹窗');
  });
}
await renderPage('货柜流水（周期与加分奖励）', () => import('../components/TransactionView'), {
  student: { ...demoStudents[0], campusCoins: 320, points: 100, level: 2 }, onBack: noop,
}, html => {
  const text = plainText(html);
  for (const label of ['成长嘉奖', '加分奖励（德育 / 文明礼仪 / 尊师孝亲，+2分；智育 / 学习习惯 / 专注听讲，+3分）', '每月奖励', '兑换退还', '发币撤回', '评价修改补发', '已撤回', '已退还', '未出货退还 · 笔记本×1', '评价对象修改', '评价分数修改']) {
    if (!text.includes(label)) throw new Error('货柜流水缺少展示规则：' + label);
  }
  if (html.includes('line-clamp-2')) throw new Error('货柜流水不应截断完整指标');
});
await renderPage('货柜首页（学校名称与图标）', () => import('../components/Dashboard'), {
  student: { ...demoStudents[0], campusCoins: 320, points: 100, level: 2 }, bankBalance: 100, onNavigate: noop,
}, html => {
  if (!html.includes('向阳币') || !html.includes('/assets/c4d_growth.png')) throw new Error('货柜首页未同步名称与图标');
});
define('localStorage', coinStorageBefore);

for (const [balance, bankDeposit] of [[320.5, 1200.25], [1234567.89, 98765432.12], [123456789012.34, 987654321098.76]]) {
  await renderPage('学生资产带（完整小数金额' + balance + '）', () => import('../mobile-app/components/student-detail/StudentCoinAssetBand'), {
    balance, bankDeposit, onOpen: noop,
  }, html => {
    const text = plainText(html);
    for (const value of [balance, bankDeposit]) {
      const full = value.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
      if (!text.includes(full)) throw new Error('资产带金额未完整保留小数：' + full);
    }
    if (html.includes('truncate') || html.includes('line-clamp')) throw new Error('资产带不能省略长金额');
    if (!html.includes('grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]') || html.includes('flex-wrap') || !html.includes('min-h-[var(--tm-student-detail-asset-height)]')) throw new Error('资产带两项余额应固定分栏、以短竖线分区并保留最低触控高度');
  });
}

const { DEFAULT_SCHOOL_PARENT_EVALUATION_CONFIG } = await import('../mobile-app/domain/parentEvaluationVisibility');
for (const allowHomeroomTeacherCustomization of [true, false]) {
  await renderPage('家长端展示（' + (allowHomeroomTeacherCustomization ? '允许自主设置' : '学校统管') + '）', () => import('../mobile-app/views/ParentEvaluationVisibilityManagementView'), {
    initialConfig: { ...DEFAULT_SCHOOL_PARENT_EVALUATION_CONFIG, allowHomeroomTeacherCustomization },
    onSave: noop,
    onBack: noop,
  });
}
for (const draft of [
  { name: '空白', text: '', images: [] },
  { name: '已填写并添加图片', text: '希望支持按学期查看历史记录', images: ['反馈图片'] },
]) {
  await renderPage('建议反馈（' + draft.name + '）', async () => ({
    default: (await import('../mobile-app/views/MeFeatureViews')).SuggestionFeedbackView,
  }), {
    text: draft.text, images: draft.images,
    onTextChange: noop, onAddImage: noop, onRemoveImage: noop, onSubmit: noop,
  });
}

const loadFeatureView = name => async () => ({ default: (await import('../mobile-app/views/MeFeatureViews'))[name] });
const { defaultTeacherGradientPreview } = await import('../mobile-app/styles/teacherGradientPreview');
await renderPage('设置页', loadFeatureView('MineSettingsView'), {
  onLogout: noop, gradientPreview: defaultTeacherGradientPreview, onGradientPreviewChange: noop,
});
for (const empty of [false, true]) {
  await renderPage('科目管理（' + (empty ? '空列表' : '有科目') + '）', loadFeatureView('SubjectManagementView'), {
    subjects: empty ? [] : [{ id: 'subject-1', name: '语文' }, { id: 'subject-2', name: '数学' }],
    draggingSubjectId: null, onAdd: noop, onEdit: noop, onDelete: noop,
    onDragStart: noop, onDragOver: noop, onDragEnd: noop,
  });
  await renderPage('部门管理（' + (empty ? '空列表' : '有部门') + '）', loadFeatureView('DepartmentManagementView'), {
    departments: empty ? [] : [{ id: 'department-1', name: '教务处' }, { id: 'department-2', name: '学生发展中心' }],
    onAdd: noop, onEdit: noop, onDelete: noop,
  });
}
await renderPage('科目及部门名称编辑', loadFeatureView('TextEditSheet'), {
  title: '修改科目', value: '语文', placeholder: '请输入科目名称', onChange: noop, onCancel: noop, onConfirm: noop,
});
await renderPage('科目及部门删除确认', loadFeatureView('DeleteConfirmSheet'), {
  title: '确认删除该科目？', onCancel: noop, onConfirm: noop,
});

const { MOCK_CLASSES, GET_MOCK_STUDENTS_FOR_CLASS } = await import('../mobile-app/constants');
const rosterClass = MOCK_CLASSES[0];
const rosterStudents = GET_MOCK_STUDENTS_FOR_CLASS(rosterClass.id).slice(0, 6);
const rosterTeacher = { id: 'roster-teacher', name: '演示老师', teachingAssignments: [{ classId: rosterClass.id, subject: '语文' }], homeroomClassIds: [rosterClass.id], gradeLeaderGrades: [] };
for (const classes of [[rosterClass], []]) {
  await renderPage('极速版班级目录（' + classes.length + '个班级）', () => import('../mobile-app/views/TeacherClassDirectoryView'), {
    classes, teacherProfile: rosterTeacher,
    currentSpace: { id: 'roster-school', title: '示范学校', type: 'school', role: 'teacher', schoolType: 'primary' },
  }, html => {
    if (classes.length === 0 && !html.includes('没有符合条件的班级')) throw new Error('空目录缺少反馈');
    if (['排行榜', '班级报告', '社团与团队', '更多操作'].some(label => html.includes(label))) throw new Error('只读目录泄露管理入口');
  });
}
const classListRenderProps = {
  classes: [rosterClass], teacherProfile: rosterTeacher,
  currentSpace: { id: 'roster-school', title: '示范学校', type: 'school', role: 'teacher', schoolType: 'primary' },
  classMembershipById: {}, activeListTab: 'class', studentTeams: [], studentTeamEditableClasses: [rosterClass],
  currentTeacherId: rosterTeacher.id, isSchoolManager: false, canCreateStudentTeam: true,
  getStudentsForClass: () => rosterStudents, searchStudentsByExactName: () => [], getStudentLabelById: noop,
  ...Object.fromEntries(['onCreateClass', 'onJoinClass', 'onSelectClass', 'onRestoreStudentStatus', 'onViewClassReport', 'onViewLeaderboard', 'onViewRewardVerification', 'onViewMedalIssuance', 'onBatchEditStudents', 'onViewFaceUpdate', 'onViewBankPassword', 'onViewHomeworkEntry', 'onEditClassInfo', 'onUpdateParentEvaluationVisibility', 'onListTabChange', 'onCreateStudentTeam', 'onUpdateStudentTeam', 'onSelectStudentTeam', 'onSelectStudentTeamInfo', 'onSelectStudentTeamReport'].map(name => [name, noop])),
};
await renderPage('班级列表', () => import('../mobile-app/views/ClassListView'), classListRenderProps);
const { defaultClassListLoadingPreview, classListLoadingPreviewSession, createClassListLoadingPreviewSession } = await import('../shared/classListLoadingPreview');
if (defaultClassListLoadingPreview.durationMs !== 500 || defaultClassListLoadingPreview.mode !== 'timed') throw new Error('演示默认应模拟首次加载0.5秒');
for (const preview of [
  { name: '默认首次加载', props: {
    demoLoadDuration: defaultClassListLoadingPreview.mode === 'timed' ? defaultClassListLoadingPreview.durationMs : 0,
    demoHoldLoading: defaultClassListLoadingPreview.mode === 'hold',
    demoInitialLoad: true,
  }, busy: true },
  { name: '模拟慢加载', props: { demoLoadDuration: 4500, demoLoadKey: 1 }, busy: true },
  { name: '保持骨架', props: { demoHoldLoading: true }, busy: true },
  { name: '显示内容', props: { demoLoadDuration: 0, demoHoldLoading: false }, busy: false },
]) {
  await renderPage('列表加载调试（' + preview.name + '）', () => import('../mobile-app/views/ClassListView'), {
    ...classListRenderProps, ...preview.props,
  }, html => {
    if (!html.includes(`aria-busy="${preview.busy}"`)) throw new Error('演示控制未正确切换列表加载状态');
    if (preview.busy !== html.includes('inert=""')) throw new Error('模拟加载状态与卡片交互状态不一致');
  });
}
for (const mode of ['timed', 'hold', 'ready']) {
  await renderPage('手机外加载演示控件（' + mode + '）', () => import('../components/ClassListLoadingPreviewControls'), {
    value: { durationMs: 4500, replayKey: 0, mode }, onChange: noop,
  }, html => {
    if (!html.includes('重播加载') || !html.includes(mode === 'hold' ? '显示内容' : '保持骨架')) throw new Error('加载演示缺少重复播放或手动交接入口');
  });
}
const demoSessionProps = { ...classListRenderProps, demoLoadDuration: 1800, demoInitialLoad: true };
const demoClassKey = `${rosterTeacher.id}:${classListRenderProps.currentSpace.id}:class:0`;
await renderPage('演示首次无数据标准占位', () => import('../mobile-app/views/ClassListView'), demoSessionProps, html => {
  if (!html.includes('aria-busy="true"') || !html.includes('loading-class-action-end-2') || html.includes(`class-action-end-${rosterClass.id}`)) throw new Error('首次演示必须使用三张标准占位，而非提前测量已知卡片');
});
classListLoadingPreviewSession.complete(demoClassKey);
for (const scenario of [
  { name: '返回已加载班级', props: {}, busy: false },
  { name: '首次切换团队', props: { activeListTab: 'team' }, busy: true },
  { name: '再次返回班级', props: {}, busy: false },
  { name: '切换来源', props: { currentSpace: { ...classListRenderProps.currentSpace, id: 'another-school' } }, busy: true },
  { name: '切换账号', props: { currentTeacherId: 'another-teacher' }, busy: true },
  { name: '手动重播', props: { demoLoadKey: 2, demoInitialLoad: false }, busy: true },
]) {
  await renderPage('演示缓存（' + scenario.name + '）', () => import('../mobile-app/views/ClassListView'), {
    ...demoSessionProps, ...scenario.props,
  }, html => {
    if (!html.includes(`aria-busy="${scenario.busy}"`)) throw new Error('演示已加载记录未按账号、来源、页签和手动重播隔离');
    if (!scenario.busy && (html.includes('mobile-skeleton-list__overlay') || !html.includes('data-phase="ready"'))) throw new Error('返回已加载列表不得重新展示骨架或播放入场动画');
  });
}
if (createClassListLoadingPreviewSession().hasLoaded(demoClassKey)) throw new Error('重新打开演示不应沿用上次的加载记录');
classListLoadingPreviewSession.complete(`${rosterTeacher.id}:${classListRenderProps.currentSpace.id}:team:0`);
await renderPage('演示缓存（返回已加载团队）', () => import('../mobile-app/views/ClassListView'), {
  ...demoSessionProps, activeListTab: 'team',
}, html => {
  if (!html.includes('aria-busy="false"') || html.includes('mobile-skeleton-list__overlay')) throw new Error('团队列表加载完成后再次进入应直接显示结果');
});
for (const activeListTab of ['class', 'team']) {
  const loadingTeam = { id: 'loading-team', name: '篮球社', ownerId: rosterTeacher.id, ownerName: rosterTeacher.name,
    collaboratorIds: [], collaboratorNames: [], memberIds: rosterStudents.map(student => student.id), visibility: 'management' };
  for (const scenario of [
    { name: '首次无数据', hasData: false, busy: true },
    { name: '另一页签有数据但当前未加载', hasData: false, otherTabHasData: true, busy: true },
    { name: '非空缓存后台刷新', hasData: true, busy: false },
    { name: '明确缓存已就绪', hasData: true, hasLoaded: true, busy: false },
    { name: '空结果后台刷新', hasData: false, hasLoaded: true, busy: false },
  ]) {
    await renderPage('列表请求状态（' + activeListTab + '，' + scenario.name + '）', () => import('../mobile-app/views/ClassListView'), {
      ...classListRenderProps, activeListTab, loading: true, hasLoaded: scenario.hasLoaded,
      classes: scenario.hasData || (scenario.otherTabHasData && activeListTab === 'team') ? [rosterClass] : [],
      studentTeams: scenario.hasData || (scenario.otherTabHasData && activeListTab === 'class') ? [loadingTeam] : [],
    }, html => {
      if (!scenario.busy) {
        if (!html.includes('aria-busy="false"') || html.includes('inert=""') || html.includes('mobile-skeleton-list__overlay')) throw new Error('后台刷新不能遮挡已有内容或禁止交互');
        if (!html.includes('data-phase="ready"')) throw new Error('缓存直接显示，不播放入场动画');
        if (!scenario.hasData && (!html.includes('共<!-- -->0<!-- -->个') || !html.includes(activeListTab === 'class' ? '没有符合条件的班级' : '暂无社团或团队'))) throw new Error('已确认的空结果应直接显示零值和空态');
        return;
      }
      if (!html.includes('aria-busy="true"') || !html.includes('inert=""')) throw new Error('加载期间必须标记忙碌状态并禁止卡片交互');
      if (!html.includes('data-skeleton-block="line"')) throw new Error('加载期间缺少标题及内容骨架占位');
      if (activeListTab === 'team' && !html.includes('data-skeleton-block="circle"')) throw new Error('团队加载期间缺少圆形头像占位');
      if (html.includes('暂无班级') || html.includes('暂无社团或团队') || html.includes('没有符合条件的班级')) throw new Error('加载中不能闪现空态');
      if ((html.match(/class="mobile-skeleton-list__light"/g) ?? []).length !== 1) throw new Error('列表所有骨架必须共享一道扫光');
      const countPosition = html.indexOf('data-skeleton-count');
      if (countPosition < html.indexOf('mobile-skeleton-list__layout') || countPosition > html.indexOf('mobile-skeleton-list__overlay')) throw new Error('数量统计必须与卡片位于同一骨架和扫光区域');
      if (!html.includes('data-skeleton-motion="fade"')) throw new Error('数量统计应原位淡入，不做上下位移');
    });
  }
}
for (const scenario of [
  { name: '普通教师', students: rosterStudents, isSelectionMode: false, canManage: false },
  { name: '班主任多选', students: rosterStudents, isSelectionMode: true, canManage: true },
  { name: '空班', students: [], isSelectionMode: false, canManage: true },
]) {
  await renderPage('学生列表（' + scenario.name + '）', () => import('../mobile-app/views/ClassDetailView'), {
    classInfo: rosterClass, students: scenario.students, currentTeacherName: rosterTeacher.name,
    isSelectionMode: scenario.isSelectionMode, selectedIds: new Set(),
    canConfigureCardDisplay: scenario.canManage, canResetStudentEvaluationCounts: scenario.canManage, canAddStudent: scenario.canManage,
    onSelectStudent: noop, onToggleSelectionMode: noop, onSelectionChange: noop, onBack: noop, onAddStudent: noop,
    onUpdateStudentCardDisplaySettings: noop, onUpdateGroupCardDisplaySettings: noop,
  });
}
// 领取后的学生卡片必须实际渲染默认蛋，不能误用美术对比素材或历史经验。
const originalPetRosterGet = localStorage.getItem;
for (const claimed of [false, true]) {
  localStorage.getItem = key => {
    if (key === 'campus-school-class-pet:v1:claim-audit') return JSON.stringify({ enabled: true, claimMethod: 'teacher' });
    if (key === `campus-class-pet-roster:v1:claim-audit:${encodeURIComponent(rosterClass.id)}` && claimed) return JSON.stringify({ claimedAt: '2026-11-03T00:00:00.000Z', view: 'pet', students: Object.fromEntries(rosterStudents.map(student => [student.id, { evaluations: [], highestStage: 0 }])) });
    return originalPetRosterGet.call(localStorage, key);
  };
  await renderPage('学生列表（AI宠物' + (claimed ? '已领取' : '未领取') + '）', () => import('../mobile-app/views/ClassDetailView'), {
    schoolId: 'claim-audit', classInfo: rosterClass, students: rosterStudents, currentTeacherName: rosterTeacher.name,
    isSelectionMode: false, selectedIds: new Set(), canConfigureCardDisplay: true, canResetStudentEvaluationCounts: true, canAddStudent: true,
    onSelectStudent: noop, onToggleSelectionMode: noop, onSelectionChange: noop, onBack: noop, onAddStudent: noop,
    onUpdateStudentCardDisplaySettings: noop, onUpdateGroupCardDisplaySettings: noop,
  }, html => {
    const text = html.replace(/<!--.*?-->/g, '');
    if (claimed && (!text.includes('lv1') || !text.includes('初生蛋') || !text.includes('0/5'))) throw new Error('领取后应从1级0经验初生蛋开始');
    if (!claimed && html.includes('aria-label="孵化进度"')) throw new Error('未领取时不应直接切到宠物');
  });
}
localStorage.getItem = originalPetRosterGet;
const { getClassroomDemoStudents: getScreenStudents, CLASSROOM_DEMO_CLASSES: screenClasses, getClassroomDemoClassId: getScreenClassId } = await import('../components/classroom/classroomDemoRoster');
const screenClassId = getScreenClassId(screenClasses[0]);
const screenStudents = getScreenStudents(screenClasses[0]);
const screenOriginalGetItem = localStorage.getItem;
for (const state of ['disabled', 'unclaimed', 'claimed']) {
  localStorage.getItem = key => {
    if (key === 'campus-school-class-pet:v1:screen-audit') return JSON.stringify({ enabled: state !== 'disabled', claimMethod: 'teacher' });
    if (key === `campus-class-pet-roster:v1:screen-audit:${encodeURIComponent(screenClassId)}` && state === 'claimed') return JSON.stringify({ claimedAt: '2026-11-03T00:00:00.000Z', view: 'pet', students: Object.fromEntries(screenStudents.map(student => [student.id, { evaluations: [], highestStage: 0 }])) });
    return screenOriginalGetItem.call(localStorage, key);
  };
  await renderPage('课堂大屏（AI宠物' + state + '）', () => import('../components/SmartBigScreen'), { onBack: noop, embedded: true, schoolId: 'screen-audit' }, html => {
    const hasPets = html.includes('classroom-pet-card pet-interaction-target');
    if (hasPets !== (state === 'claimed')) throw new Error('大屏应按共享领取状态展示学生或宠物');
  });
}
localStorage.getItem = screenOriginalGetItem;
await renderPage('班级报告', () => import('../mobile-app/views/ClassReportView'), {
  classInfo: rosterClass, students: rosterStudents, currentTeacherName: rosterTeacher.name, onSelectStudent: noop,
}, html => {
  if (html.includes('对比详情') || html.includes('本周期以正向评价记录为主')) throw new Error('评价记录分布不应显示详情或分析');
  if (!html.includes('得分排行') || !html.includes('查看得分排行与进步幅度说明')) throw new Error('得分排行应提供规则说明入口');
  if (!html.includes('记录条数') || html.includes('按评价次数')) throw new Error('学生覆盖应使用记录条数口径');
  if (!html.includes('/' + rosterStudents.length)) throw new Error('覆盖人数应展示全班人数作为分母');
});

const { buildClassReportEvaluationRecords } = await import('../mobile-app/domain/classReportEvaluationRecords');
const reportDemoRecords = buildClassReportEvaluationRecords({
  classId: rosterClass.id,
  studentCounts: rosterStudents.slice(0, 2).map(student => ({ student, evaluationCount: 20 })),
  count: 40, positiveCount: 32, paths: [['体育', '运动', '积极锻炼']],
  teachers: [{ id: 'mine', name: rosterTeacher.name }], start: '2026-10-19', end: '2026-10-21',
});
for (const scenario of [
  { name: '完整列表', records: reportDemoRecords, selected: null },
  { name: '空列表', records: [], selected: null },
  { name: '记录详情', records: reportDemoRecords, selected: reportDemoRecords[0] },
]) {
  await renderPage('班级报告评价明细（' + scenario.name + '）', async () => ({ default: (await import('../mobile-app/components/report/ReportEvaluationRecords')).ReportEvaluationRecordsPage }), {
    records: scenario.records, selected: scenario.selected, onSelect: noop,
  }, html => {
    if (scenario.name === '完整列表' && (!html.includes('加载更多') || (html.match(/<li /g) ?? []).length !== 30)) throw new Error('完整列表应首批展示三十条并允许加载更多');
    if (scenario.name === '空列表' && !html.includes('当前筛选下暂无评价记录')) throw new Error('明细需提供空状态');
    if (scenario.selected && !html.includes(scenario.selected.studentName)) throw new Error('详情需展示学生姓名');
  });
}

const { createDefaultClassReportOutline, toggleClassReportSection } = await import('../shared/classReportOutline');
const outlineDefault = createDefaultClassReportOutline();
const outlineHidden = toggleClassReportSection(outlineDefault, outlineDefault[1].id);
const outlineReselected = toggleClassReportSection(outlineHidden, outlineDefault[1].id);
if (outlineHidden.at(-1).visible || outlineHidden.at(-1).id !== outlineDefault[1].id) throw new Error('取消勾选应移至可选区末尾');
if (!outlineReselected.at(-1).visible || outlineReselected.at(-1).id !== outlineDefault[1].id) throw new Error('重新勾选应加入已选区末尾');

for (const scenario of [
  { name: '反向排序', outline: createDefaultClassReportOutline().reverse() },
  { name: '隐藏中间板块', outline: createDefaultClassReportOutline().map((item, index) => ({ ...item, visible: index % 2 === 0 })) },
  { name: '全部隐藏', outline: createDefaultClassReportOutline().map(item => ({ ...item, visible: false })) },
  { name: '恢复默认', outline: createDefaultClassReportOutline() },
  { name: '旧大纲补充新板块', outline: createDefaultClassReportOutline().filter(item => item.id !== 'evaluation-records-title') },
]) {
  await renderPage('班级报告大纲（' + scenario.name + '）', () => import('../mobile-app/views/ClassReportView'), {
    classInfo: rosterClass, students: rosterStudents, currentTeacherName: rosterTeacher.name, onSelectStudent: noop,
    outline: scenario.outline,
  }, html => {
    if (scenario.name === '旧大纲补充新板块' && !html.includes('id="evaluation-records-title"')) throw new Error('旧大纲应默认追加新评价明细板块');
    let previousIndex = -1;
    for (const item of scenario.outline) {
      const index = html.indexOf('<section aria-labelledby="' + item.id + '"');
      if (!item.visible && index !== -1) throw new Error('隐藏板块仍然渲染：' + item.id);
      if (item.visible) {
        if (index <= previousIndex) throw new Error('报告板块顺序未生效：' + item.id);
        previousIndex = index;
      }
    }
    if (!html.includes('报告时间范围')) throw new Error('调整大纲后日期筛选应保留');
  });
}
await renderPage('班级报告大纲预览控件', () => import('../components/ClassReportOutlinePreviewControls'), {
  value: createDefaultClassReportOutline(), onChange: noop,
}, html => {
  if ((html.match(/type="checkbox"/g) ?? []).length !== 8) throw new Error('大纲需提供八个显示开关');
  if (!html.includes('已选板块') || !html.includes('可选板块')) throw new Error('大纲缺少分组');
  if (html.includes('恢复默认') || html.includes('撤销')) throw new Error('大纲不应保留恢复按钮');
});


for (const schoolType of ['primary', 'middle']) {
  const dataReportSpace = { id: 'data-report-' + schoolType, title: '示范学校', type: 'school', role: 'administrator', schoolType };
  await renderPage('学生评价报表初始页（' + schoolType + '）', () => import('../mobile-app/views/LeaderReportView'), {
    onBack: noop, currentSpace: dataReportSpace,
  });
  await renderPage('班级评价报表初始页（' + schoolType + '）', () => import('../mobile-app/views/MoralEducationCockpitView'), {
    onBack: noop, currentSpace: dataReportSpace,
  });
}
for (const settlementCycle of ['week', 'month']) {
  await renderPage('班级排行榜（' + settlementCycle + '）', () => import('../mobile-app/views/ClassLeaderboardView'), {
    settlementCycle, currentSpace: { id: 'ranking-school', title: '示范学校', type: 'school', role: 'administrator', schoolType: 'primary' },
    classes: MOCK_CLASSES, onOpenEvaluationRecords: noop,
  });
}

await renderPage('添加学生', () => import('../mobile-app/views/AddStudentView'), {
  existingStudents: rosterStudents, onBack: noop, onSave: noop,
});
for (const students of [rosterStudents, []]) {
  await renderPage('批量修改学生（' + (students.length ? '有学生' : '空列表') + '）', () => import('../mobile-app/views/StudentBatchEditView'), {
    students, onBack: noop, onSave: noop,
  });
}
await renderPage('学生基本资料', () => import('../mobile-app/views/StudentBasicEditView'), {
  student: rosterStudents[0], classes: MOCK_CLASSES,
  currentSpace: { id: 'student-profile-school', title: '示范学校', type: 'school', role: 'homeroomTeacher', schoolType: 'primary' },
  onBack: noop, onChange: noop,
});

const profileSpace = { id: 'profile-school', title: '示范学校', type: 'school', role: 'teacher', schoolType: 'primary' };
for (const classRole of ['headTeacher', 'teacher']) {
  await renderPage('班级详情（' + classRole + '）', () => import('../mobile-app/views/ClassInfoView'), {
    classInfo: rosterClass, classRole, spaceType: 'school', currentSpace: profileSpace,
    teacherProfile: rosterTeacher, students: rosterStudents, onBack: noop, onSave: noop,
  });
}
await renderPage('教师个人资料', () => import('../mobile-app/views/TeacherProfileEditView'), {
  profile: { ...rosterTeacher, schoolName: '示范学校', departmentId: '', departmentName: '' },
  classes: [rosterClass], subjects: ['语文', '数学'], departments: [], currentSpace: profileSpace,
  onBack: noop, onChange: noop,
});
for (const canManage of [true, false]) {
  await renderPage('团队详情（' + (canManage ? '负责人' : '协作老师') + '）', () => import('../mobile-app/views/student-team/StudentTeamInfoView'), {
    team: { id: 'profile-team', name: '篮球社', ownerId: rosterTeacher.id, ownerName: rosterTeacher.name,
      collaboratorIds: ['collaborator'], collaboratorNames: ['协作老师'], memberIds: rosterStudents.map(student => student.id), visibility: 'management' },
    canManage, classes: [rosterClass], getStudentsForClass: () => rosterStudents,
    searchStudentsByExactName: () => [], getStudentLabelById: noop, currentSpace: profileSpace,
    onBack: noop, onUpdate: noop, onRemoveCollaborator: noop, onTransferOwner: noop, onArchive: noop,
  });
}

const teamStyleFixture = { id: 'style-team', name: '跨年级篮球社与课后兴趣活动团队', ownerId: rosterTeacher.id,
  ownerName: rosterTeacher.name, collaboratorIds: [], collaboratorNames: [],
  memberIds: rosterStudents.map(student => student.id), visibility: 'management' };
const teamStyleProps = {
  classes: [rosterClass], getStudentsForClass: () => rosterStudents, searchStudentsByExactName: () => [],
  getStudentLabelById: id => { const student = rosterStudents.find(item => item.id === id); return student ? { ...student, classLabel: rosterClass.name } : undefined; },
  currentSpace: profileSpace, onBack: noop, onClose: noop, onSave: noop,
};
for (const mode of ['create', 'add']) {
  await renderPage('团队创建流程（' + mode + '）', () => import('../mobile-app/views/student-team/StudentTeamCreateView'), {
    ...teamStyleProps, mode, initialTeam: mode === 'add' ? teamStyleFixture : undefined,
  });
}
await renderPage('团队添加学生（无班级）', () => import('../mobile-app/views/student-team/StudentTeamCreateView'), {
  ...teamStyleProps, mode: 'add', classes: [], getStudentsForClass: () => [], initialTeam: teamStyleFixture,
});
// 团队设置与拍照来源为挂载后的公共弹层，服务端渲染无法覆盖其内容。
for (const mode of ['members']) {
  await renderPage('团队编辑初始页（' + mode + '）', () => import('../mobile-app/views/student-team/StudentTeamEditorView'), {
    ...teamStyleProps, open: true, mode, team: teamStyleFixture,
  });
}
for (const scenario of [
  { label: '普通列表', students: rosterStudents, isSelectionMode: false },
  { label: '多选', students: rosterStudents, isSelectionMode: true },
  { label: '空列表', students: [], isSelectionMode: false },
]) {
  await renderPage('团队学生列表（' + scenario.label + '）', () => import('../mobile-app/views/student-team/StudentTeamDetailView'), {
    team: teamStyleFixture, students: scenario.students, isSelectionMode: scenario.isSelectionMode,
    selectedIds: new Set([rosterStudents[0].id]), canManage: true, getStudentLabelById: teamStyleProps.getStudentLabelById,
    onBack: noop, onSelectStudent: noop, onToggleSelectionMode: noop, onSelectionChange: noop,
  });
}


await renderPage('兑换核销页', () => import('../mobile-app/views/reward-verification/RewardVerificationView'), {
  classInfo: { id: 'render-smoke-class', name: '三年级1班', gradeLevel: '三年级' },
  currentSpace: { id: 'render-smoke-space', name: '示范学校' },
  students: demoStudents,
  onBack: noop,
  onViewExchangeRecords: noop,
  onRecordCoinRedeem: noop,
  onRecordCoinClear: noop,
});

await renderPage('成长币记录页', () => import('../mobile-app/views/ClassExchangeRecordView'), {
  students: demoStudents,
  entries: ledgerEntries,
  onRevokeEntry: noop,
  onBack: noop,
});

await renderPage('学生成长币明细页', () => import('../mobile-app/views/StudentCoinDetailView'), {
  student: demoStudents[0],
  coinDetail: {
    balance: 100,
    issueRecords: GET_MOCK_CAMPUS_COIN_DETAIL(demoStudents[0]).issueRecords,
    consumeRecords: expandCoinLedgerForStudent(ledgerEntries, demoStudents[0].id),
    settlementEstimate: { period: 'weekly', amount: 0 },
  },
  onBack: noop,
}, html => {
  const text = plainText(html);
  if (!text.includes('成长嘉奖')) throw new Error('成长嘉奖应作为收入分类展示');
  if (!text.includes('每周奖励（10月26日—11月1日）')) throw new Error('按周发放时成长嘉奖应展示每周奖励与所属周期');
});

await renderPage('学生成长币明细页（按月发放）', () => import('../mobile-app/views/StudentCoinDetailView'), {
  student: demoStudents[0],
  coinDetail: {
    balance: 100,
    issueRecords: GET_MOCK_CAMPUS_COIN_DETAIL(demoStudents[0], { ...DEFAULT_COIN_ISSUANCE_CONFIG, period: 'monthly' }).issueRecords,
    consumeRecords: expandCoinLedgerForStudent(ledgerEntries, demoStudents[0].id),
    settlementEstimate: { period: 'monthly', amount: 0 },
  },
  onBack: noop,
}, html => {
  const text = plainText(html);
  if (!text.includes('每月奖励（2026年10月）') || !text.includes('每周奖励（10月26日—11月1日）') || !text.includes('加分奖励（德育 / 文明礼仪 / 尊师孝亲，+2分；智育 / 学习习惯 / 专注听讲，+3分）')) throw new Error('切换当前周期后，历史月/周/加分奖励应继续按各自快照展示');
});

await renderPage('兑换奖励（空班）', () => import('../mobile-app/views/reward-verification/RewardVerificationView'), {
  classInfo: rosterClass, currentSpace: profileSpace, students: [], onBack: noop,
  onViewExchangeRecords: noop, onRecordCoinRedeem: noop, onRecordCoinClear: noop,
});
await renderPage('兑换记录（无流水）', () => import('../mobile-app/views/ClassExchangeRecordView'), {
  students: rosterStudents, entries: [], onRevokeEntry: noop, onBack: noop,
});
for (const scenario of [
  { label: '未开启自动发放', estimate: { enabled: false } },
  { label: '评价次数不足', estimate: { enabled: true, eligible: false, periodEvaluationCount: 1, minimumEvaluationCount: 5 } },
  { label: '符合发放条件', estimate: { enabled: true, eligible: true, estimatedTotal: 30, sunshineReward: 10, rankingReward: 20 } },
]) {
  await renderPage('成长币明细空流水（' + scenario.label + '）', () => import('../mobile-app/views/StudentCoinDetailView'), {
    student: rosterStudents[0], onBack: noop,
    coinDetail: { ...GET_MOCK_CAMPUS_COIN_DETAIL(rosterStudents[0]), issueRecords: [], consumeRecords: [],
      settlementEstimate: { period: 'weekly', ...scenario.estimate } },
  });
}

const archiveDesignProps = {
  onBack: noop, teacherProfile: rosterTeacher, spaceId: 'style-archive-design', classes: [rosterClass],
  currentSpace: profileSpace, getStudentsForClass: () => rosterStudents,
};
await renderPage('档案设计（空列表）', () => import('../mobile-app/views/archive-design/ArchiveDesignView'), archiveDesignProps, html => {
  if (!plainText(html).includes('暂无档案')) throw new Error('档案设计空列表应显示缺省内容');
});
// 仅在本次服务端渲染中注入档案数据，完成后恢复环境桩，不写入真实浏览器存储。
const archiveDesignOriginalStorage = globalThis.localStorage;
try {
  const entries = new Map();
  define('localStorage', { ...storage(), getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) });
  const { readArchiveWorkspace, persistArchiveWorkspace } = await import('../shared/studentArchiveStore');
  const workspace = readArchiveWorkspace({ ...archiveDesignProps, teacherName: rosterTeacher.name, homeroomClassIds: rosterTeacher.homeroomClassIds });
  const template = workspace.templates[0];
  workspace.templates.push(...['ready', 'published', 'disabled'].map((status, index) => ({
    ...template, id: 'style-archive-design-' + status, origin: 'school', status,
    name: ['待启用的学生成长档案', '跨学段综合素养与实践活动成长档案', '已停用的历史档案'][index],
    gradeScopes: ['一年级', '二年级', '三年级'],
  })));
  persistArchiveWorkspace(workspace);
  await renderPage('档案设计（待启用、使用中、已停用）', () => import('../mobile-app/views/archive-design/ArchiveDesignView'), archiveDesignProps, html => {
    for (const expected of ['待启用', '使用中', '已停用', '跨学段综合素养与实践活动成长档案']) {
      if (!plainText(html).includes(expected)) throw new Error('档案列表未展示预期内容：' + expected);
    }
  });
} finally {
  define('localStorage', archiveDesignOriginalStorage);
}

await renderPage('学生成长档案首页', () => import('../mobile-app/views/archive-design/StudentArchiveView'), {
  onBack: noop, student: rosterStudents[0], classInfo: rosterClass, teacherProfile: rosterTeacher,
  spaceId: 'style-archive-school', classes: [rosterClass], getStudentsForClass: () => rosterStudents, onOpenPendingCollection: noop,
}, html => {
  if (!plainText(html).includes('暂无档案')) throw new Error('尚未建立档案时应展示空态');
});
const archiveStyleFields = ['text', 'number', 'date', 'rating', 'single', 'multiple', 'multi_fill'].map((type, index) => ({
  id: type, semanticKey: type, label: '档案字段' + (index + 1), type, sectionId: 'style-section', required: false,
  options: ['选项一', '其他'], customAnswerOptions: ['其他'],
  subFields: type === 'multi_fill' ? [{ id: 'item', label: '补充项目', required: false }] : undefined,
}));
const archiveStyleAnswers = {
  text: '保持每天阅读的习惯。', number: '150', date: '2026-10-20', rating: '3',
  single: { selectedOptions: ['其他'], customText: { 其他: '课后参加合唱训练' } },
  multiple: { selectedOptions: ['选项一'], customText: {} }, multi_fill: { fillValues: { item: '补充内容' } },
};
const editorStyleFieldTypes = archiveStyleFields.map(field => ({
  value: field.type, label: field.label, choice: ['single', 'multiple'].includes(field.type),
  rating: field.type === 'rating', subFields: field.type === 'multi_fill',
}));
for (const itemLabel of ['字段', '题目']) {
  for (const layoutMode of ['flat', 'grouped']) {
    for (const readOnly of [false, true]) {
      await renderPage('共享编辑器（' + itemLabel + '，' + layoutMode + '，' + (readOnly ? '只读' : '编辑') + '）', () => import('../mobile-app/components/form-builder/FormBuilder'), {
        shape: 'subtle', layoutMode, sections: [{ id: 'style-section', label: '成长信息' }, { id: 'style-empty', label: '待补充分组' }],
        fields: archiveStyleFields, itemLabel, readOnly, fieldTypes: editorStyleFieldTypes,
        createField: () => archiveStyleFields[0], onChange: noop,
        lockedFieldIds: new Set(['number']), fixedContentFieldIds: new Set(['date']),
        fieldErrors: { text: { label: '请输入完整内容' } }, listError: readOnly ? '' : '请检查未完成内容',
      }, html => {
        for (const expected of ['档案字段1', '档案字段7']) {
          if (!plainText(html).includes(expected)) throw new Error('共享编辑器缺少字段：' + expected);
        }
        if (!readOnly && !plainText(html).includes('请检查未完成内容')) throw new Error('编辑器应保留表单错误提示');
        if (readOnly && html.includes('title="拖动排序' + itemLabel + '"')) throw new Error('只读预览不应提供拖动编辑入口');
      });
    }
    await renderPage('共享大纲排序（' + itemLabel + '，' + layoutMode + '）', () => import('../mobile-app/components/form-builder/FormOutlineSorter'), {
      shape: 'subtle', layoutMode, sections: [{ id: 'style-section', label: '成长信息' }, { id: 'style-empty', label: '待补充分组' }],
      fields: archiveStyleFields, itemLabel, onChange: noop,
    }, html => {
      if (!html.includes('aria-label="拖动排序' + itemLabel + '：档案字段1"')) throw new Error('排序器应保留带名称的拖动入口');
      if (layoutMode === 'grouped' && !plainText(html).includes('待补充分组')) throw new Error('排序器应保留空分组作为移动目标');
    });
  }
}
await renderPage('共享编辑器默认形态兼容', () => import('../mobile-app/components/form-builder/FormBuilder'), {
  layoutMode: 'flat', sections: [], fields: archiveStyleFields, itemLabel: '字段', readOnly: true,
  fieldTypes: editorStyleFieldTypes, createField: () => archiveStyleFields[0], onChange: noop,
});
await renderPage('共享排序器默认形态兼容', () => import('../mobile-app/components/form-builder/FormOutlineSorter'), {
  layoutMode: 'flat', sections: [], fields: archiveStyleFields, itemLabel: '字段', onChange: noop,
});

for (const layoutMode of ['flat', 'grouped']) {
  for (const mode of ['preview', 'fill', 'readonly']) {
    await renderPage('成长档案表单（' + layoutMode + '，' + mode + '）', () => import('../mobile-app/views/archive-design/ArchiveFormRenderer'), {
      definition: { layoutMode, sections: [{ id: 'style-section', label: '成长信息' }], fields: archiveStyleFields, growthFields: [] },
      mode, shape: mode === 'preview' ? 'default' : 'subtle', answers: archiveStyleAnswers, onAnswersChange: noop,
    }, html => {
      if (!plainText(html).includes('档案字段7')) throw new Error('档案表单应完整渲染各字段类型');
      if (mode === 'readonly' && !plainText(html).includes('保持每天阅读的习惯。')) throw new Error('只读档案应展示已保存内容');
      if (mode === 'fill' && !html.includes('aria-checked="true"')) throw new Error('档案填写应保留已有选项状态');
    });
  }
}

await renderPage('值周安排月份概览', () => import('../mobile-app/views/WeeklyDutyScheduleView'), {
  onBack: noop,
}, html => {
  if (!plainText(html).includes('值周安排') || !plainText(html).includes('只看未安排')) throw new Error('值周安排应展示标题与筛选入口');
});

// 临时补齐默认月份的排班，验证周卡中的多人摘要与未安排状态；不改动应用演示数据。
const dutyStyleData = await import('../mobile-app/data/weeklyDutySchedule');
const dutyStyleDomain = await import('../mobile-app/domain/weeklyDutySchedule');
const dutyStyleOriginalWeeks = [...dutyStyleData.DUTY_TERM_WEEKS];
const dutyStyleOriginalSchedules = { ...dutyStyleData.INITIAL_DUTY_SCHEDULES };
try {
  const today = new Date();
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const fixtureWeeks = dutyStyleDomain.createDutyWeeks(monthStart, 4);
  dutyStyleData.DUTY_TERM_WEEKS.splice(0, dutyStyleData.DUTY_TERM_WEEKS.length, ...fixtureWeeks);
  Object.assign(dutyStyleData.INITIAL_DUTY_SCHEDULES, {
    [fixtureWeeks[1].id]: ['teacher-li-lian', 'teacher-liu-chang'],
    [fixtureWeeks[2].id]: ['teacher-zhang-quanyou', 'teacher-liu-fei', 'teacher-chen-simin'],
  });
  await renderPage('值周安排周卡与多人摘要', () => import('../mobile-app/views/WeeklyDutyScheduleView'), {
    onBack: noop,
  }, html => {
    for (const label of [dutyStyleDomain.formatDutyWeekRange(fixtureWeeks[0]), dutyStyleDomain.formatDutyWeekRange(fixtureWeeks[3]), '李连、刘畅', '张全有等3人', '未安排']) {
      if (!plainText(html).includes(label)) throw new Error('值周安排未完整展示周次或教师摘要：' + label);
    }
  });
} finally {
  dutyStyleData.DUTY_TERM_WEEKS.splice(0, dutyStyleData.DUTY_TERM_WEEKS.length, ...dutyStyleOriginalWeeks);
  for (const key of Object.keys(dutyStyleData.INITIAL_DUTY_SCHEDULES)) delete dutyStyleData.INITIAL_DUTY_SCHEDULES[key];
  Object.assign(dutyStyleData.INITIAL_DUTY_SCHEDULES, dutyStyleOriginalSchedules);
}

const questionnaireStyleProps = {
  onBack: noop, teacherId: rosterTeacher.id, teacherName: rosterTeacher.name, teacherAvatar: '',
  spaceId: 'style-questionnaire-school', homeroomClassIds: [rosterClass.id], classes: [rosterClass],
  currentSpace: profileSpace, getStudentsForClass: () => rosterStudents,
};
const questionnaireStyleOriginalStorage = globalThis.localStorage;
try {
  const entries = new Map();
  define('localStorage', { ...storage(), getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) });
  const { writeQuestionnaires } = await import('../shared/questionnaireStore');
  writeQuestionnaires([]);
  for (const initialMode of ['owned', 'assigned']) {
    await renderPage('问卷采集空列表（' + initialMode + '）', () => import('../mobile-app/views/questionnaire/QuestionnaireManagementView'), {
      ...questionnaireStyleProps, initialMode,
    });
  }
  const target = { studentId: rosterStudents[0].id, studentNo: rosterStudents[0].studentNo ?? rosterStudents[0].id,
    studentName: rosterStudents[0].name, classId: rosterClass.id, className: rosterClass.name, reachable: true };
  const record = {
    id: 'style-questionnaire-guardian', title: '学生课外阅读与综合实践活动情况问卷', description: '请按实际情况记录。',
    creatorName: rosterTeacher.name, creatorTeacherId: rosterTeacher.id, spaceId: questionnaireStyleProps.spaceId,
    createdAt: '2026-10-20 08:00:00', suggestedDeadline: '', status: 'active', collectionMode: 'guardian_questionnaire',
    respondentRole: 'guardian', layoutMode: 'grouped', sections: [{ id: 'style-section', label: '成长信息' }],
    questions: archiveStyleFields.map(field => ({ ...field, title: field.label })), targets: [target],
    submissions: [{ id: 'style-submission', studentNo: target.studentNo, studentName: target.studentName,
      guardianRelation: '妈妈', submittedAt: '2026-10-20 09:00:00', answers: archiveStyleAnswers }],
  };
  const teacherRecord = { ...record, id: 'style-questionnaire-teacher', title: '教师采集学生成长情况',
    collectionMode: 'student_information', respondentRole: 'teacher', studentAssignmentMode: 'creator', submissions: [],
    studentRecords: [{ ...target, id: 'style-student-record', status: 'completed', updatedAt: '2026-10-20 09:00:00',
      answers: archiveStyleAnswers, assigneeTeacherId: rosterTeacher.id, assigneeTeacherName: rosterTeacher.name }],
  };
  const endedRecord = { ...record, id: 'style-questionnaire-ended', status: 'ended' };
  const emptyRecord = { ...record, id: 'style-questionnaire-empty-results', submissions: [] };
  writeQuestionnaires([record, teacherRecord, endedRecord, emptyRecord]);
  for (const initialMode of ['owned', 'assigned']) {
    await renderPage('问卷采集列表（' + initialMode + '）', () => import('../mobile-app/views/questionnaire/QuestionnaireManagementView'), {
      ...questionnaireStyleProps, initialMode,
    });
  }
  for (const detailRecord of [record, teacherRecord, endedRecord, emptyRecord]) {
    await renderPage('问卷详情及题目统计（' + detailRecord.id + '）', () => import('../mobile-app/views/questionnaire/QuestionnaireManagementView'), {
      ...questionnaireStyleProps, initialRecordId: detailRecord.id,
    }, html => {
      for (const expected of ['采集详情', detailRecord.title, '档案字段7']) {
        if (!plainText(html).includes(expected)) throw new Error('问卷详情缺少预期内容：' + expected);
      }
    });
  }
} finally {
  define('localStorage', questionnaireStyleOriginalStorage);
}

const collectionStyleItem = {
  id: 'style-collection', questionnaireId: 'style-questionnaire', collectionMode: 'guardian_questionnaire',
  title: '本学期学生课外阅读与体育活动情况采集', description: '请根据实际情况填写。',
  creatorName: '演示老师', respondentLabel: '学生家长', completedAt: '2026-10-19 09:00',
  questions: [
    { id: 'reading', type: 'text', title: '近期阅读情况', required: true, options: [] },
    { id: 'notes', type: 'text', title: '其他补充', required: false, options: [] },
  ], answers: { reading: '每天阅读半小时。' },
};
for (const collectionMode of ['guardian_questionnaire', 'student_information']) {
  await renderPage('采集记录详情（' + collectionMode + '）', () => import('../mobile-app/views/student-collection/StudentCollectionRecordDetailView'), {
    item: { ...collectionStyleItem, collectionMode }, onBack: noop,
  }, html => {
    for (const expected of ['每天阅读半小时。', '未填写', collectionMode === 'guardian_questionnaire' ? '家长问卷' : '学生采集']) {
      if (!plainText(html).includes(expected)) throw new Error('采集详情缺少预期内容：' + expected);
    }
  });
}
for (const hasItems of [true, false]) {
  await renderPage('采集记录列表（' + (hasItems ? '有记录' : '空态') + '）', () => import('../mobile-app/views/student-collection/StudentCollectionHistoryTab'), {
    items: hasItems ? [collectionStyleItem] : [], selectedTerm: 'style-term',
    termOptions: [{ value: 'style-term', label: '2026-2027学年上学期', startDate: '2026-09-01', endDate: '2027-01-31' }],
    onSelectedTermChange: noop, onOpen: noop,
  }, html => {
    const expected = hasItems ? '2026年10月' : '暂无采集记录';
    if (!plainText(html).includes(expected)) throw new Error('采集列表缺少预期内容：' + expected);
  });
}
for (const scenario of [
  { label: '可管理', classes: MOCK_CLASSES, canEditRecords: true, canDeleteRecords: true },
  { label: '只读', classes: MOCK_CLASSES, canEditRecords: false, canDeleteRecords: false },
  { label: '无班级', classes: [], canEditRecords: false, canDeleteRecords: false },
]) {
  await renderPage('班级评价记录查询（' + scenario.label + '）', () => import('../mobile-app/views/EvaluationRecordsLogView'), {
    currentSpace: profileSpace, ...scenario,
  }, html => {
    if (scenario.classes.length === 0 && !plainText(html).includes('暂无评价记录')) throw new Error('无班级时应展示评价记录空态');
  });
}
await renderPage('班级评价三级指标编辑器', () => import('../mobile-app/components/evaluation/EvaluationIndicatorCascadePicker'), {
  value: ['德育', '团结友爱', '主动帮助同学'], options: [['德育', '体育'], ['团结友爱'], ['主动帮助同学']], onChange: noop,
}, html => {
  if (!html.includes('aria-selected="true"') || !html.includes('aria-selected="false"')) throw new Error('指标编辑器应保留选中和未选中状态');
});

const evaluationStyleRecord = {
  id: 'style-evaluation-positive', evaluation_date: '2026-10-19',
  indicatorPath: ['德育', '团结友爱', '主动帮助同学解决学习中的困难'],
  scoreChange: 2, isBad: false, aiComment: '主动帮助同学整理学习资料，并耐心讲解不理解的内容。',
  description: '今天主动帮助同桌整理复习资料。', teacherId: 'style-teacher', teacherName: '负责跨学科教学的演示老师',
};
const evaluationStyleNegative = {
  ...evaluationStyleRecord, id: 'style-evaluation-negative', evaluation_date: '2026-09-18',
  scoreChange: -1, isBad: true, teacherId: 'style-other-teacher', teacherName: '另一位老师',
  aiComment: '需要按时完成课堂练习，遇到困难可以主动寻求帮助。',
  revisions: [{ id: 'style-revision', editedAt: '2026-10-19T09:00:00',
    editedByTeacherId: 'style-teacher', editedByTeacherName: '演示老师', reason: '核对原始记录后修正指标。', previous: evaluationStyleRecord }],
};
for (const scenario of [
  { label: '独立列表跨月记录', expected: '2026年9月' },
  { label: '学生详情嵌入列表', embedded: true, expected: evaluationStyleRecord.aiComment },
  { label: '家长评价只读详情', records: [{ ...evaluationStyleRecord, source: 'parent', indicatorPath: [], scoreChange: 0 }], initialRecordId: evaluationStyleRecord.id, expected: evaluationStyleRecord.aiComment, editable: false, parentRecord: true },
  { label: '可删除评价菜单', embedded: true, onDeleteRecord: noop, expected: '评价记录', deletable: true },
  { label: '空列表', records: [], expected: '没有符合条件的评价记录' },
  { label: '本人评价详情', initialRecordId: evaluationStyleRecord.id, expected: '原始记录', editable: true },
  { label: '他人评价只读及修改留痕', initialRecordId: evaluationStyleNegative.id, expected: '修改记录', editable: false },
  { label: '修改本人评价', initialRecordId: evaluationStyleRecord.id, initialRecordPage: 'edit', expected: '评价分值' },
  { label: '班主任修改他人评价', initialRecordId: evaluationStyleNegative.id, initialRecordPage: 'edit', canEditOtherTeachersRecords: true, expected: '修改原因' },
]) {
  await renderPage('学生评价记录（' + scenario.label + '）', () => import('../mobile-app/views/StudentEvaluationRecordsView'), {
    records: [evaluationStyleRecord, evaluationStyleNegative], selectedTerm: 'style-term',
    termOptions: [{ value: 'style-term', label: '2026-2027学年上学期', startDate: '2026-09-01', endDate: '2027-01-31' }],
    currentTeacherId: 'style-teacher', currentTeacherName: '演示老师', canEditOtherTeachersRecords: false,
    onSelectedTermChange: noop, onUpdateRecord: noop, onBack: noop, ...scenario,
  }, html => {
    if (!plainText(html).includes(scenario.expected)) throw new Error('评价记录缺少预期内容：' + scenario.expected);
    if (scenario.deletable && !html.includes('aria-label="更多评价操作"')) throw new Error('可删除评价缺少更多菜单');
    if (scenario.parentRecord && (plainText(html).includes('原始记录') || plainText(html).includes('AI 智能解读') || plainText(html).includes('诚实守信'))) throw new Error('家长评价详情不应展示学校指标或固定标题');
    if (scenario.embedded && (plainText(html).includes('AI 智能解读') || plainText(html).includes(evaluationStyleRecord.indicatorPath.join(' / ')))) throw new Error('列表不应显示固定标题或指标路径');
    if (scenario.editable !== undefined && html.includes('aria-label="修改评价"') !== scenario.editable) {
      throw new Error('评价详情修改入口与当前教师权限不符');
    }
  });
}

const { MOCK_BEHAVIOR_RECORDS } = await import('../mobile-app/constants');
await renderPage('学生详情（实际积分）', () => import('../mobile-app/views/DashboardView'), {
  student: demoStudents[0],
  currentSpace: { id: 'render-smoke-space', name: '示范学校' },
  scores: [
    { category: 'moral', label: '德育', score: 1250 },
    { category: 'intellectual', label: '智育', score: -25 },
    { category: 'physical', label: '体育', score: 0 },
    { category: 'aesthetic', label: '美育', score: 10 },
    { category: 'labor', label: '劳育', score: 15 },
  ],
  growthReports: [],
  collectionHistory: [],
  evaluationRecords: MOCK_BEHAVIOR_RECORDS,
  currentTeacherId: 'render-smoke-teacher',
  currentTeacherName: '演示老师',
  canEditOtherTeachersEvaluationRecords: false,
  campusCoinDetail: { balance: 0, issueRecords: [], consumeRecords: [], settlementEstimate: { period: 'weekly', amount: 0 } },
  onBack: noop,
}, html => {
  const plainHtml = html.replace(/<!--.*?-->/g, '');
  const start = plainHtml.indexOf('本学期五育积分');
  const summary = plainHtml.slice(start, plainHtml.indexOf('</section>', start));
  for (const score of ['1250', '-25', '0', '10', '15']) {
    if (!summary.includes('>' + score + '</span>')) throw new Error('学生详情实际积分未正确展示：' + score);
  }
  if (!summary.includes('总分')) throw new Error('学生详情缺少总分摘要');
  const total = summary.match(/总分<\/span><span[^>]*>([^<]+)<\/span>/)?.[1];
  if (total !== '1250') throw new Error('学生详情总分应为实际分项之和，实际为：' + total);
});

for (const scenario of [
  { label: '有学生', students: rosterStudents },
  { label: '空班', students: [] },
]) {
  await renderPage('颁发奖章（' + scenario.label + '）', () => import('../mobile-app/views/MedalIssuanceView'), {
    classInfo: rosterClass, students: scenario.students, onBack: noop,
  });
}
await renderPage('设置兑换密码（空班）', () => import('../mobile-app/views/bank-password/BankPasswordView'), {
  classInfo: rosterClass, currentSpace: profileSpace, students: [], onBack: noop,
});
await renderPage('更新人脸（空班）', () => import('../mobile-app/views/face-update/FaceUpdateView'), {
  classInfo: { ...rosterClass, id: 'style-face-empty' }, currentSpace: profileSpace, students: [], onBack: noop,
});

const homeworkFixture = {
  id: 'style-homework', schoolId: profileSpace.id, schoolName: profileSpace.title,
  classId: rosterClass.id, className: rosterClass.name, subject: '语文', teacherName: rosterTeacher.name,
  date: '2026-10-19', title: '阅读课文并完成课后练习，记录需要讲解的问题', source: 'manual', creatorName: rosterTeacher.name,
  createdAt: '2026-10-19T08:00:00', updatedAt: '2026-10-19T08:00:00',
  results: rosterStudents.map((student, index) => ({ studentId: student.id, studentNo: String(index + 1), studentName: student.name, status: 'good' })),
};
for (const scenario of [
  { label: '有作业', assignments: [homeworkFixture], subjects: ['语文', '数学'] },
  { label: '暂无作业', assignments: [], subjects: ['语文'] },
  { label: '未配置学科', assignments: [], subjects: [] },
]) {
  await renderPage('作业录入（' + scenario.label + '）', () => import('../mobile-app/views/HomeworkEntryView'), {
    schoolId: profileSpace.id, schoolName: profileSpace.title, classInfo: rosterClass, currentSpace: profileSpace,
    students: rosterStudents, subjects: scenario.subjects, teacherName: rosterTeacher.name,
    assignments: scenario.assignments, onSaveAssignment: noop, onBack: noop,
  });
}
for (const scenario of [
  { label: '无任务', tasks: [] },
  { label: '待核对与已完成', tasks: [
    { id: 'style-import-pending', fileName: '作业记录表.jpg', className: rosterClass.name, subject: '语文', teacherName: rosterTeacher.name,
      assignments: [homeworkFixture], issues: [{ id: 'style-issue', type: 'low_confidence', message: '请核对学生等级', resolved: false }] },
    { id: 'style-import-done', fileName: '已核对记录表.jpg', className: rosterClass.name, subject: '数学', teacherName: rosterTeacher.name,
      assignments: [homeworkFixture], issues: [] },
  ] },
]) {
  await renderPage('批量作业录入（' + scenario.label + '）', () => import('../mobile-app/views/HomeworkBatchImportView'), {
    schoolId: profileSpace.id, schoolName: profileSpace.title, operatorName: rosterTeacher.name,
    rosters: [], assignments: [homeworkFixture], tasks: scenario.tasks,
    classes: [rosterClass], currentSpace: profileSpace, onChangeTasks: noop,
    onSubmitAssignments: () => ({ saved: 0, skipped: 0 }), onSyncAssignments: noop, onDeleteTask: noop, onBack: noop,
  });
}

const growthStyleRecord = { id: 'style-growth', studentId: rosterStudents[0].id, recordedAt: '2026-10-19',
  values: { height_cm: 150, weight_kg: 40 }, sourceType: 'mobile-entry', sourceLabel: '教师手机端新增',
  sourceRecordId: 'style-source', version: 1, createdAt: '2026-10-19', updatedAt: '2026-10-19' };
const healthStyleRecord = { id: 'style-health', studentId: rosterStudents[0].id, examDate: '2026-10-19',
  heightCm: 150, weightKg: 40, bmi: 17.8, nakedVisionLeft: '5.0', nakedVisionRight: '5.0',
  correctedVisionLeft: '', correctedVisionRight: '', glassesType: '不戴镜', conclusion: '演示体检记录', conclusionTags: [],
  sourceType: 'mobile-entry', sourceLabel: '教师手机端新增', version: 1, createdAt: '2026-10-19', updatedAt: '2026-10-19', corrections: [] };
for (const scenario of [
  { label: '有记录可编辑', empty: false, canEdit: true },
  { label: '有记录只读', empty: false, canEdit: false },
  { label: '无记录可编辑', empty: true, canEdit: true },
  { label: '无记录只读', empty: true, canEdit: false },
]) {
  const growthProps = { studentId: rosterStudents[0].id, studentName: rosterStudents[0].name,
    canEdit: scenario.canEdit, operator: rosterTeacher.name, onBack: noop, onSaved: noop };
  await renderPage('成长数据（' + scenario.label + '）', () => import('../mobile-app/views/student-growth/StudentBodyMeasurementsView'), {
    ...growthProps, records: scenario.empty ? [] : [growthStyleRecord],
  });
  await renderPage('体检记录（' + scenario.label + '）', () => import('../mobile-app/views/student-growth/StudentHealthRecordsView'), {
    ...growthProps, records: scenario.empty ? [] : [healthStyleRecord],
  });
}
await renderPage('学生详情（成长报告目录）', () => import('../mobile-app/views/DashboardView'), {
  student: rosterStudents[0], classInfo: rosterClass, currentSpace: profileSpace, initialSection: 'report',
  scores: [], growthReports: [], collectionHistory: [], evaluationRecords: [],
  campusCoinDetail: GET_MOCK_CAMPUS_COIN_DETAIL(rosterStudents[0]), currentTeacherId: rosterTeacher.id,
  currentTeacherName: rosterTeacher.name, canEditOtherTeachersEvaluationRecords: false,
  onBack: noop, onEditBasicInfo: noop, onUpdateStudentStatus: noop, onViewCampusCoins: noop, onViewTermReport: noop,
  onUpdateEvaluationRecord: noop, onViewCollectionRecord: noop, onOpenStudentArchive: noop,
});

await renderPage('设置兑换密码页', () => import('../mobile-app/views/bank-password/BankPasswordView'), {
  classInfo: { id: 'render-smoke-class', name: '三年级1班', gradeLevel: '三年级' },
  currentSpace: { id: 'render-smoke-space', name: '示范学校' },
  students: demoStudents,
  onBack: noop,
}, html => {
  if (!html.includes('••••••')) throw new Error('兑换密码默认应以掩码展示。');
  const doubleQuote = String.fromCharCode(34);
  const revealLabel = 'aria-label=' + doubleQuote + '查看演示学生1兑换密码' + doubleQuote;
  if (!html.includes(revealLabel)) throw new Error('密码掩码时显隐按钮的无障碍名称应为查看加学生姓名加兑换密码。');
});

const faceStudentsWithAvatar = demoStudents.map((student, index) => ({
  ...student,
  avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  studentNo: '0' + (index + 1),
}));

// 人脸页按待录入和已录入分页：默认停在待录入、标签带人数、待录入用卡通头像、已录入用采集照头像。
await renderPage('更新人脸数据页（部分已录入）', () => import('../mobile-app/views/face-update/FaceUpdateView'), {
  classInfo: { id: 'render-smoke-class', name: '三年级1班', gradeLevel: '三年级' },
  currentSpace: { id: 'render-smoke-space', name: '示范学校' },
  students: faceStudentsWithAvatar,
  onBack: noop,
}, html => {
  const text = html.replace(/<!--[\s\S]*?-->/g, '');
  if (!text.includes('待录入（2）')) throw new Error('待录入标签应显示还剩多少待录入人数。');
  if (!text.includes('已录入（4）')) throw new Error('已录入标签应显示已录入人数。');
  if (!text.includes('录入演示学生5人脸')) throw new Error('默认应停在待录入页，并给出未录入学生的录入入口。');
  if (html.includes('更新演示学生1人脸')) throw new Error('默认待录入页不应渲染已录入学生。');
  if (html.includes('data:image/jpeg')) throw new Error('待录入学生应继续使用默认卡通头像，不使用采集照。');
  if (text.includes('还剩')) throw new Error('已取消顶部统计和进度条，不应再出现剩余人数。');
});

await renderPage('更新人脸数据页（全班已录入）', () => import('../mobile-app/views/face-update/FaceUpdateView'), {
  classInfo: { id: 'render-smoke-class-recorded', name: '三年级2班', gradeLevel: '三年级' },
  currentSpace: { id: 'render-smoke-space', name: '示范学校' },
  students: faceStudentsWithAvatar.slice(0, 2),
  onBack: noop,
}, html => {
  const text = html.replace(/<!--[\s\S]*?-->/g, '');
  if (!text.includes('待录入（0）')) throw new Error('全班录完后待录入标签应显示 0。');
  if (!text.includes('更新演示学生1人脸')) throw new Error('待录入为空时应直接展示已录入名单。');
  if (!html.includes('data:image/jpeg')) throw new Error('已录入学生应展示采集照风格头像。');
});

const meStyleActions = Object.fromEntries([
  'onNavigateToFiles', 'onEditTeacherProfile', 'onOpenTermGenerateModal', 'onViewLeaderReport',
  'onOpenMoralEducationCockpit', 'onOpenWeeklyDutySchedule', 'onOpenParentEvaluationVisibility',
  'onOpenHomeworkBatchImport', 'onOpenSettings', 'onOpenSubjectManagement', 'onOpenDepartmentManagement',
  'onOpenCoinIssuance', 'onOpenSuggestionFeedback', 'onOpenQuestionnaire', 'onOpenAssignedCollections',
  'onOpenArchiveDesign', 'onOpenReportManagement', 'onOpenAiHeadteacherAssistant', 'onOpenAiPrincipalAssistant',
  'onToggleSpaceSheet', 'onOpenBluetoothDevices',
].map(name => [name, noop]));
await renderPage('极速版我的（管理员同样遵守产品范围）', () => import('../mobile-app/views/MeView'), {
  ...meStyleActions, teacherProfile: rosterTeacher, isSpaceSheetOpen: false, pendingCollectionCount: 0,
  currentSpace: { ...profileSpace, role: 'administrator', type: 'school' },
  availableTools: teacherAppFeatures.lite.meTools, showUnreleasedTools: true,
}, html => {
  if (!html.includes('蓝牙设备') || !html.includes('aria-label="设置"')) throw new Error('极速版缺少蓝牙设备或设置入口');
  if (html.includes('建议反馈')) throw new Error('极速版不再展示建议反馈');
  if (['管理工具', '班主任助理', '校长助理', '报表', '期末报告', '值周安排', '档案设计', '科目管理', '部门管理', '成长币发放'].some(label => html.includes(label))) throw new Error('极速版泄露非核心工具');
});
for (const scenario of [
  { role: 'administrator', type: 'school', pending: 3 },
  { role: 'teacher', type: 'school', pending: 0 },
  { role: 'owner', type: 'personal', pending: 1 },
]) {
  await renderPage('我的页面（' + scenario.role + '）', () => import('../mobile-app/views/MeView'), {
    ...meStyleActions, teacherProfile: { ...rosterTeacher, name: '演示老师' }, isSpaceSheetOpen: false,
    currentSpace: { ...profileSpace, role: scenario.role, type: scenario.type }, pendingCollectionCount: scenario.pending,
  }, html => {
    const text = plainText(html);
    if (!text.includes('演示老师') || !html.includes('aria-label="设置"')) throw new Error('我的页面应保留个人资料及设置入口');
    if (html.includes('蓝牙设备')) throw new Error('完整版不新增极速版蓝牙工具');
    if (text.includes('待填写采集') !== (scenario.pending > 0)) throw new Error('采集待办应按待办数量显示');
    if (scenario.role === 'administrator' && !html.includes('aria-label="成长币发放"')) throw new Error('管理员应保留成长币发放入口');
    if (scenario.role === 'teacher' && html.includes('aria-label="成长币发放"')) throw new Error('普通老师不应出现管理配置入口');
  });
}

await renderPage('教师手机端登录页', () => import('../mobile-app/views/TeacherLoginView'), {
  onLogin: noop,
});

// 班主任助理三种能力组合都要能打开：少挂一个能力分支就会出现打开即白屏。
const assistantClasses = [
  { id: 'c_2025_4', name: '2025级四班', gradeLevel: '四年级', educationStage: 'primary' },
  { id: 'c_2025_1', name: '2025级一班', gradeLevel: '四年级', educationStage: 'primary' },
];

for (const combination of [
  { name: '仅班级评价', showClassEvaluation: true, showStudentEvaluation: false },
  { name: '仅学生评价', showClassEvaluation: false, showStudentEvaluation: true },
  { name: '学生评价和班级评价', showClassEvaluation: true, showStudentEvaluation: true },
]) {
  await renderPage(
    `班主任助理页（${combination.name}）`,
    () => import('../mobile-app/views/AiHeadteacherAssistantV2View'),
    {
      onBack: noop,
      homeroomClasses: assistantClasses,
      activeClassId: 'c_2025_4',
      onClassChange: noop,
      showStudentEvaluation: combination.showStudentEvaluation,
      showClassEvaluation: combination.showClassEvaluation,
      onOpenWeeklyActionAdvice: noop,
      onOpenEvaluationReview: noop,
    },
    html => {
      if (!html.includes('按住说话')) {
        throw new Error('班主任助理底部语音输入控件缺失');
      }
      if (combination.showStudentEvaluation && !combination.showClassEvaluation && !html.includes('哪些学生需要我重点关注？')) {
        throw new Error('仅开通学生评价时应给出学生评价建议问题');
      }
      if (combination.showClassEvaluation && !html.includes('班级评比主要在哪些方面待改进？')) {
        throw new Error('开通班级评价时应给出班级评比建议问题');
      }
    },
  );
}

for (const replying of [false, true]) {
  await renderPage('助理输入区（' + (replying ? '回复中' : '可提问') + '）', () => import('../mobile-app/components/assistant-chat/AssistantComposer'), {
    draft: '', replying, suggestedQuestions: ['本周哪些方面需要重点关注？'],
    placeholder: '输入问题', onDraftChange: noop, onSubmit: noop,
  }, html => {
    if (!html.includes('aria-label="切换到文字输入"') || !html.includes('aria-label="按住说话"')) throw new Error('助理输入区应保留语音和文字入口');
    const disabledCount = (html.match(/disabled=""/g) ?? []).length;
    if (disabledCount !== (replying ? 2 : 0)) throw new Error('回复中应同时禁用语音提交与快捷问题，保留模式切换');
  });
}

// 同一公共组件：能力参数、语音状态、文字草稿与发送约束。
for (const camera of [false, true]) {
  for (const scenario of [
    { name: '语音待输入', mode: 'voice', state: 'idle', value: '' },
    { name: '按住说话', mode: 'voice', state: 'listening', value: '' },
    { name: '上移取消', mode: 'voice', state: 'canceling', value: '' },
    { name: '文字空白', mode: 'text', state: 'idle', value: '' },
    { name: '文字草稿', mode: 'text', state: 'idle', value: '今天积极参与劳动。' },
    { name: '回复中', mode: 'text', state: 'idle', value: '本周表现如何？', disabled: true },
  ]) {
    await renderPage('统一输入（' + (camera ? '含拍照' : '无拍照') + '，' + scenario.name + '）', () => import('../mobile-app/components/ui/MobileInputComposer'), {
      mode: scenario.mode, voiceState: scenario.state, value: scenario.value, disabled: scenario.disabled,
      onModeChange: noop, onChange: noop, onSubmit: noop, ...(camera ? { onCameraClick: noop } : {}),
    }, html => {
      if (html.includes('aria-label="拍照记录"') !== camera) throw new Error('拍照入口必须只由能力参数决定');
      if (!html.includes('mobile-input-composer')) throw new Error('必须使用同一玻璃面板');
      if (scenario.mode === 'text') {
        if (!html.includes('<input') || !html.includes('value="' + scenario.value + '"')) throw new Error('文字态必须完整保留草稿');
        if (html.includes('aria-label="发送问题"') !== Boolean(scenario.value.trim())) throw new Error('空文字不得展示发送按钮');
      }
      if (scenario.state === 'canceling' && !plainText(html).includes('松开取消')) throw new Error('取消录音状态必须可辨识');
      if (scenario.disabled && !html.includes('disabled=""')) throw new Error('回复中应禁止再次发送');
    });
  }
}

// 校长助理：三个报告入口和自由对话都在同一页，缺一块就会出现打开即白屏。
await renderPage('校长助理页', () => import('../mobile-app/views/AiPrincipalAssistantView'), {
  onBack: noop,
  termConfig: { id: 'render-smoke-term', name: '2026学年第一学期', startDate: '2026-03-01', endDate: '2026-07-10' },
  hasTermReportTask: false,
  onOpenWeeklyReport: noop,
  onOpenMonthlyReport: noop,
  onOpenTermReport: noop,
}, html => {
  if (!html.includes('按住说话')) {
    throw new Error('校长助理底部语音输入控件缺失');
  }
  for (const question of ['本周学校需要重点关注什么？', '上月复盘发现了哪些持续问题？', '哪些班级需要重点关注？']) {
    if (!html.includes(question)) throw new Error('校长助理缺少建议问题：' + question);
  }
  if (!html.includes('ai-assistant-typewriter-shine')) {
    throw new Error('校长助理开场白应保留打字机光效容器');
  }
  if (html.includes('你好，我是校长助理')) {
    throw new Error('校长助理不应再展示旧版自我介绍开场白');
  }
  if (!html.includes('assistant-context-card')) {
    throw new Error('校长助理三个报告入口应放在助理玻璃卡里');
  }
  if (html.includes('学期学校报告')) {
    throw new Error('期末报告入口当前应隐藏');
  }
  for (const entry of ['本周管理建议', '上月学校复盘']) {
    if (!html.includes(entry)) throw new Error('校长助理缺少报告入口：' + entry);
  }
});

// 班主任助理报告页：底部说明与往期列表标题收敛后，页面仍要能正常渲染。
await renderPage('本周行动建议页', () => import('../mobile-app/views/WeeklyActionAdviceView'), {
  onBack: noop,
  onOpenHistory: noop,
  homeroomClasses: assistantClasses,
  activeClassId: 'c_2025_4',
  onClassChange: noop,
  simulateLoading: false,
}, html => {
  if (plainText(html).includes('内容由AI基于已授权的评价数据生成')) throw new Error('报告底部不应出现AI来源声明');
  if (plainText(html).includes('生成时间')) throw new Error('报告底部不应出现生成时间');
  if (!plainText(html).includes('根据7月7日-13日评价记录生成')) throw new Error('报告应保留数据来源');
});

const adviceStyleData = await import('../mobile-app/data/weeklyActionAdvice');
await renderPage('本周行动建议示例正文', () => import('../mobile-app/views/WeeklyActionAdviceView'), {
  onBack: noop, report: adviceStyleData.WEEKLY_ACTION_ADVICE_SAMPLE_REPORT, simulateLoading: false,
}, html => {
  if (!plainText(html).includes('查看依据')) throw new Error('示例正文应保留查看依据入口');
});
await renderPage('本周行动建议数据不足', () => import('../mobile-app/views/WeeklyActionAdviceView'), {
  onBack: noop, data: adviceStyleData.WEEKLY_ACTION_ADVICE_CURRENT_BY_CLASS.c_2025_1, simulateLoading: false,
}, html => {
  if (!plainText(html).includes('上周数据不足，暂时无法生成本周行动建议。')) throw new Error('数据不足状态应保留完整无障碍提示');
});
await renderPage('本周行动建议异常与重试入口', () => import('../mobile-app/views/WeeklyActionAdviceView'), {
  onBack: noop, reportPayload: {}, onRetry: noop, simulateLoading: false,
}, html => {
  for (const label of ['报告暂时无法展示', '重新加载']) {
    if (!plainText(html).includes(label)) throw new Error('报告异常状态缺少：' + label);
  }
});
await renderPage('往期建议空列表', () => import('../mobile-app/views/WeeklyActionAdviceHistoryView'), {
  onBack: noop, classes: [], initialClassId: 'empty-class',
}, html => {
  if (!plainText(html).includes('暂无往期建议')) throw new Error('往期建议无记录时应显示缺省提示');
});

await renderPage('往期建议页', () => import('../mobile-app/views/WeeklyActionAdviceHistoryView'), {
  onBack: noop,
  classes: assistantClasses,
  initialClassId: 'c_2025_4',
  onClassChange: noop,
}, html => {
  if (!plainText(html).includes('本周建议（7月7日-13日）')) throw new Error('往期建议标题应为本周建议加建议日期范围');
  if (plainText(html).includes('评价记录')) throw new Error('往期建议不应展示数据周期副文本');
});

await renderPage('我的评价复盘页', () => import('../mobile-app/views/TeacherEvaluationReviewView'), {
  onBack: noop,
  onOpenHistory: noop,
  homeroomClasses: assistantClasses,
  activeClassId: 'c_2025_4',
  onClassChange: noop,
  simulateLoading: false,
}, html => {
  if (plainText(html).includes('生成时间')) throw new Error('复盘底部不应出现生成时间');
  if (!plainText(html).includes('根据你在6月的评价记录生成')) throw new Error('复盘数据来源应按自然月表述');
});

const reviewStyleData = await import('../mobile-app/data/teacherEvaluationReview');
const insufficientReview = reviewStyleData.TEACHER_EVALUATION_REVIEW_CURRENT_BY_CLASS.c_2025_1;
await renderPage('我的评价复盘记录不足', () => import('../mobile-app/views/TeacherEvaluationReviewView'), {
  onBack: noop, data: insufficientReview, simulateLoading: false,
}, html => {
  for (const label of ['暂时无法生成评价复盘。', '查看报告示例', `还差${Math.max(0, insufficientReview.targetRecords - insufficientReview.overview.records)}条`]) {
    if (!plainText(html).includes(label)) throw new Error('记录不足状态缺少：' + label);
  }
});
await renderPage('我的评价复盘异常与重试', () => import('../mobile-app/views/TeacherEvaluationReviewView'), {
  onBack: noop, onRetry: noop, reportPayload: {}, simulateLoading: false,
}, html => {
  if (!plainText(html).includes('报告暂时无法展示') || !plainText(html).includes('重新加载')) throw new Error('复盘异常应展示错误与重试入口');
});
await renderPage('往期复盘空列表', () => import('../mobile-app/views/TeacherEvaluationReviewHistoryView'), {
  onBack: noop, classes: [], initialClassId: 'empty-class',
}, html => {
  if (!plainText(html).includes('暂无往期复盘')) throw new Error('复盘无记录时应展示缺省提示');
});

await renderPage('往期复盘页', () => import('../mobile-app/views/TeacherEvaluationReviewHistoryView'), {
  onBack: noop,
  classes: assistantClasses,
  initialClassId: 'c_2025_4',
  onClassChange: noop,
}, html => {
  if (!plainText(html).includes('4月复盘')) throw new Error('往期复盘标题应为x月复盘');
  if (plainText(html).includes('评价记录')) throw new Error('往期复盘不应展示数据周期副文本');
});


// 校长报告页：去掉页脚声明与徽章后，正文和数据来源仍要能正常渲染。
await renderPage('本周管理建议页', () => import('../mobile-app/views/PrincipalPeriodicReportView'), {
  kind: 'weekly',
  schoolName: '示范小学',
  generated: true,
  onBack: noop,
  onOpenHistory: noop,
}, html => {
  const text = plainText(html);
  if (text.includes('生成时间')) throw new Error('校长报告底部不应出现生成时间');
  if (text.includes('仅供教育管理与工作复盘参考')) throw new Error('校长报告底部不应出现AI声明');
  if (text.includes('AI周度管理分析')) throw new Error('校长报告页不应展示AI来源徽章');
  if (text.includes('本周学校管理建议')) throw new Error('校长报告页不应再展示固定的报告标题文案');
  if (text.includes('示范小学')) throw new Error('校长报告页不应再展示学校名字');
  if (text.includes('用于指导')) throw new Error('校长报告页不应再展示周期说明文案');
  if (!text.includes('根据7月13日-19日评价记录生成')) throw new Error('校长报告页应只保留一句数据来源');
});

await renderPage('上月学校复盘页', () => import('../mobile-app/views/PrincipalPeriodicReportView'), {
  kind: 'monthly',
  schoolName: '示范小学',
  generated: true,
  onBack: noop,
  onOpenHistory: noop,
}, html => {
  const text = plainText(html);
  if (text.includes('生成时间')) throw new Error('校长月度复盘不应出现生成时间');
  if (text.includes('AI月度运营复盘')) throw new Error('校长月度复盘不应展示AI来源徽章');
});

await renderPage('学期学校报告页', () => import('../mobile-app/views/PrincipalTermReportView'), {
  schoolName: '示范小学',
  term: { id: 'render-smoke-term', name: '2025-2026学年上学期', startDate: '2025-09-01', endDate: '2026-01-20' },
  generated: true,
  onBack: noop,
  onOpenHistory: noop,
}, html => {
  const text = plainText(html);
  if (text.includes('生成时间')) throw new Error('学期报告不应出现生成时间');
  if (text.includes('AI学期综合分析')) throw new Error('学期报告不应展示AI来源徽章');
  if (text.includes('学生综合素质评价系统学期运营报告')) throw new Error('学期报告不应再展示固定的报告标题文案');
  if (!text.includes('根据2025-2026学年上学期评价记录生成')) throw new Error('学期报告应只保留一句数据来源');
});

for (const reportKind of ['weekly', 'monthly', 'term']) {
  const loadReport = reportKind === 'term'
    ? () => import('../mobile-app/views/PrincipalTermReportView')
    : () => import('../mobile-app/views/PrincipalPeriodicReportView');
  const reportProps = {
    kind: reportKind, schoolName: '示范学校', onBack: noop, onRetry: noop,
    term: { id: 'render-smoke-term', name: '2025-2026学年上学期', startDate: '2025-09-01', endDate: '2026-01-20' },
  };
  for (const reportState of ['empty', 'failed', 'invalid']) {
    await renderPage('校长报告状态（' + reportKind + '，' + reportState + '）', loadReport, {
      ...reportProps, status: reportState === 'invalid' ? 'generated' : reportState,
      ...(reportState === 'invalid' ? { reportPayload: {} } : {}),
    }, html => {
      const text = plainText(html);
      if (reportState === 'empty' && (!text.includes('暂无可分析数据') || text.includes('重新生成'))) throw new Error('无数据状态应明确提示且不提供重新生成');
      if (reportState === 'failed' && (!text.includes('生成失败') || !text.includes('重新生成'))) throw new Error('生成失败应保留重试入口');
      if (reportState === 'invalid' && (!text.includes('报告暂时无法展示') || !text.includes('重新加载'))) throw new Error('不完整报告应展示异常与重新加载入口');
    });
  }
}

await renderPage('往期学校复盘页', () => import('../mobile-app/views/PrincipalReportHistoryView'), {
  kind: 'monthly',
  schoolName: '示范小学',
  onBack: noop,
}, html => {
  const text = plainText(html);
  if (text.includes('2026年5月')) throw new Error('月度卡片标题不应重复分组标签里的年份');
  if (!text.includes('5月学校复盘')) throw new Error('月度卡片应展示x月复盘');
});

await renderPage('往期学期报告页', () => import('../mobile-app/views/PrincipalReportHistoryView'), {
  kind: 'term',
  schoolName: '示范小学',
  onBack: noop,
}, html => {
  const text = plainText(html);
  if (text.includes('2025-2026学年上学期报告')) throw new Error('学期卡片标题不应重复分组标签里的学年');
  if (!text.includes('上学期报告')) throw new Error('学期卡片应展示学期名称');
});
await renderPage('往期学校报告页', () => import('../mobile-app/views/PrincipalReportHistoryView'), {
  kind: 'weekly',
  schoolName: '示范小学',
  onBack: noop,
}, html => {
  const text = plainText(html);
  if (text.includes('生成于')) throw new Error('往期学校报告不应展示生成日期');
  if (text.includes('基于')) throw new Error('往期列表不应展示基于xx数据一类的周期副文本');
  if (!text.includes('往期管理建议')) throw new Error('往期学校报告页应保留列表标题');
});

await renderPage('团队报告页', () => import('../mobile-app/views/ClassReportView'), {
  classInfo: { id: 'team-report-smoke', name: '篮球社', classCode: '', gradeLevel: '', studentCount: 6, tags: [] },
  students: demoStudents,
  currentTeacherName: '演示老师',
  onSelectStudent: noop,
});


const termReportStudent = {
  id: 'term-report-student',
  name: '演示学生',
  gender: 'male',
  grade: '三年级',
  class: '三年级1班',
  status: 'active',
};
const termReportClassInfo = { id: 'c_2025_3', name: '三年级1班', classCode: '20250003', gradeLevel: '三年级', studentCount: 6, tags: [], educationStage: 'primary' };

const { getSchoolTermReportProfile } = await import('../mobile-app/data/schoolTermReportProfiles');
const qingheTermReportProfile = getSchoolTermReportProfile('school-qinghe');
if (!qingheTermReportProfile) throw new Error('青禾实验小学应配置学校期末报告画像');

await renderPage('期末报告页（学校五育指标）', () => import('../mobile-app/views/TermReportView'), {
  student: termReportStudent,
  classInfo: termReportClassInfo,
  currentSpace: { id: 'school-qinghe', title: '青禾实验小学', type: 'school', schoolType: 'primary' },
  onBack: noop,
  hiddenSections: qingheTermReportProfile.hiddenSections,
  radarDimensions: qingheTermReportProfile.radarDimensions,
}, html => {
  const text = plainText(html);
  for (const dimension of ['健康向上', '乐学善思', '实践创新', '自主担当']) {
    if (!text.includes(dimension)) throw new Error('学校期末报告应展示一级维度：' + dimension);
  }
  if (text.includes('五育成长表现')) throw new Error('青禾实验小学期末报告不应展示五育成长表现');
  if (text.includes('五育发展亮点')) throw new Error('青禾实验小学期末报告不应展示五育发展亮点');
  if (text.includes('学科成绩分布')) throw new Error('青禾实验小学期末报告不应展示学科成绩分布');
  if (text.includes('高光时刻')) throw new Error('青禾实验小学期末报告不应展示高光时刻');
  if (text.includes('End of Report')) throw new Error('期末报告末尾不应再显示 End of Report 标记');
  if (text.includes('Future Education System') || text.includes('Semester Growth Report')) throw new Error('期末报告封面不应再显示英文小字');
});

await renderPage('期末报告页（平台默认）', () => import('../mobile-app/views/TermReportView'), {
  student: termReportStudent,
  classInfo: termReportClassInfo,
  currentSpace: { id: 'school-star', title: '星河实验学校', type: 'school', schoolType: 'twelveYear' },
  onBack: noop,
}, html => {
  const text = plainText(html);
  if (!text.includes('学科成绩分布')) throw new Error('平台默认期末报告应保留学科成绩分布');
  if (!text.includes('高光时刻')) throw new Error('平台默认期末报告应保留高光时刻');
  if (!text.includes('五育发展亮点')) throw new Error('平台默认期末报告应保留五育发展亮点');
  if (text.includes('End of Report')) throw new Error('期末报告末尾不应再显示 End of Report 标记');
  if (text.includes('Future Education System') || text.includes('Semester Growth Report')) throw new Error('期末报告封面不应再显示英文小字');
});


const { getSchoolStudentReportContent } = await import('../mobile-app/data/schoolTermReportProfiles');

const renderStudentReport = (reportCase, content) => ({
  student: { id: 'demo-' + reportCase.name, name: reportCase.name, gender: 'female', grade: reportCase.grade, class: reportCase.className, status: 'active' },
  classInfo: { id: reportCase.classId, name: reportCase.className, classCode: '', gradeLevel: reportCase.grade, studentCount: 6, tags: [], educationStage: 'primary' },
  currentSpace: { id: 'school-qinghe', title: '青禾实验小学', type: 'school', schoolType: 'primary' },
  onBack: noop,
  hiddenSections: qingheTermReportProfile.hiddenSections,
  radarDimensions: content.dimensions ?? qingheTermReportProfile.radarDimensions,
  studentReportContent: content,
});

const studentReportCases = [
  { name: '杨悠然', className: '2024级一班', classId: 'c_2024_1', grade: '三年级', advice: '把想法讲出来', tag: '心思细腻' },
  { name: '邹艾琳', className: '2024级一班', classId: 'c_2024_1', grade: '三年级', advice: '给阅读留固定时段', tag: '行动力强' },
  { name: '高奕可', className: '2026级一班', classId: 'c_2026_1', grade: '一年级', advice: '举手说一说', tag: '识字小达人' },
  { name: '廖堇汐', className: '2026级一班', classId: 'c_2026_1', grade: '一年级', advice: '每天读十分钟', tag: '运动小达人' },
];

const renderedStudentReports = new Map();

for (const reportCase of studentReportCases) {
  const content = getSchoolStudentReportContent('school-qinghe', reportCase.name);
  if (!content) throw new Error(reportCase.name + '应配置期末报告内容');

  await renderPage('期末报告页（' + reportCase.name + '）', () => import('../mobile-app/views/TermReportView'), renderStudentReport(reportCase, content), html => {
    const text = plainText(html);
    if (!text.includes(reportCase.advice)) throw new Error(reportCase.name + '的报告应使用自己的成长建议');
    if (!text.includes(reportCase.tag)) throw new Error(reportCase.name + '的报告应使用自己的封面标签');
    for (const other of studentReportCases) {
      if (other.name === reportCase.name) continue;
      if (text.includes(other.advice)) throw new Error(other.name + '的成长建议不应出现在' + reportCase.name + '的报告里');
    }
    renderedStudentReports.set(reportCase.name, html);
  });
}

if (new Set(renderedStudentReports.values()).size !== studentReportCases.length) {
  throw new Error('每位学生的期末报告内容应各不相同');
}

// 教师发展评价：两种身份、四个入口及完整教师资料。
for (const actorId of ['t1', 't2']) {
  for (const initialTab of ['record', 'archive', 'report', 'me']) {
    await renderPage('教师评价（' + actorId + ' / ' + initialTab + '）', () => import('../mobile-app/teacher-development/TeacherDevelopmentApp'), { initialActorId: actorId, initialTab }, html => {
      const text = plainText(html);
      for (const label of ['记录', '档案', '报表', '我的']) if (!text.includes(label)) throw new Error('缺少导航：' + label);
      if (initialTab === 'me') {
        for (const label of ['个人信息设置', '管理工具', '更多工具', 'AI 个人助理', '建议反馈']) if (!text.includes(label)) throw new Error('我的页缺少入口：' + label);
        if (text.includes('问卷采集') || text.includes('待填写采集')) throw new Error('教师评价我的页应隐藏问卷采集及待办');
        if (text.includes('使用帮助')) throw new Error('教师评价我的页应隐藏使用帮助入口');
        if (text.includes('指标说明')) throw new Error('我的页不应再展示指标说明');
        for (const label of ['指标设置', '考核周期设置']) if (text.includes(label) !== (actorId === 't2')) throw new Error(label + '应仅对管理者开放');
        if (text.includes('AI 校长助理') !== (actorId === 't2')) throw new Error('校长助理应仅对管理者开放');
      }
      if (initialTab === 'archive' && actorId === 't1') {
        for (const label of ['基本信息', '任职信息', '资格证书', '工作经历']) if (!text.includes(label)) throw new Error('教师档案缺少' + label);
        if (text.includes('全校教师')) throw new Error('教师不应看到全校教师目录');
        if (!text.includes('今天，我与刘甜家长沟通学生学习习惯。')) throw new Error('教师档案应展示本人原话，而非旧摘要');
      }
      if (initialTab === 'archive' && actorId === 't2' && !text.includes('全校教师')) throw new Error('管理者应访问全校目录');
      if (initialTab === 'report' && actorId === 't2' && (!text.includes('教师人数') || !text.includes('统计报表'))) throw new Error('全校报表应提供概览与统计报表入口');
    });
  }
}
// 我的页子页面使用同一渲染检查，避免全屏容器在服务端不挂载而遗漏业务内容。
const mePageData = await import('../mobile-app/teacher-development/data');
for (const [component, props, expected] of [
  ['PersonalSettingsPage', { teacher: mePageData.TEACHERS[0], onSave: () => true }, '联系手机'],
  ['DevelopmentQuestionnairePage', { onSave: () => true }, '教师发展需求采集'],
  ['DevelopmentQuestionnairePage', { answer: { focus: '课堂教学', support: '' }, onSave: () => true }, '查看我的回答'],
  ['DevelopmentFeedbackPage', { onSave: () => true }, '建议或问题'],
  ...[false, true].map(principal => ['DevelopmentAssistantPage', { principal, onBack: noop, teacher: mePageData.TEACHERS[principal ? 1 : 0], teachers: mePageData.TEACHERS, records: mePageData.INITIAL_RECORDS, indicators: mePageData.INDICATORS, periodId: '2026-autumn' }, principal ? '全校教师成长' : '个人成长记录']),
]) {
  await renderPage('教师评价我的子页面（' + component + '）', () => import('../mobile-app/teacher-development/MeFeaturePages').then(module => ({ default: module[component] })), props, html => {
    if (!plainText(html).includes(expected)) throw new Error('页面缺少关键内容：' + expected);
  });
}
for (const [component, props, expected] of [
  ['IndicatorSettingsPage', { indicators: mePageData.INDICATORS, onSave: noop }, '履职尽责'],
  ['PeriodSettingsPage', { periodMode: 'semester', onSave: noop }, '考核周期按'],
]) {
  await renderPage('教师评价管理设置（' + component + '）', () => import('../mobile-app/teacher-development/ManagementSettingsPages').then(module => ({ default: module[component] })), props, html => {
    if (!plainText(html).includes(expected)) throw new Error('设置页缺少内容：' + expected);
  });
}
// 报表的次级视图单独渲染，避免只覆盖默认看板。
const developmentData = await import('../mobile-app/teacher-development/data');
const developmentReporting = await import('../mobile-app/teacher-development/reporting');
for (const [schoolScope, kind] of [[false, 'records'], [true, 'records'], [true, 'people'], [true, 'profiles']]) {
  const report = developmentReporting.buildDevelopmentReport(schoolScope ? developmentData.TEACHERS : [developmentData.TEACHERS[0]], developmentData.INITIAL_RECORDS, developmentData.INDICATORS, '2026-autumn');
  await renderPage('教师评价统计报表（' + (schoolScope ? '全校' : '本人') + ' / ' + kind + '）', () => import('../mobile-app/teacher-development/ReportStatistics'), { report, schoolScope, state: { page: 'statistics', kind, grouping: 'subject' }, onState: noop, onDrill: noop, onTeacher: noop }, html => {
    const text = plainText(html);
    if (schoolScope && kind === 'records' && !text.includes('赵宁')) throw new Error('记录统计必须包含零记录教师');
    if (!schoolScope && (!text.includes('指标得分') || text.includes('赵宁'))) throw new Error('个人指标报表应只显示本人');
  });
}
for (const initialActorId of ['t2', 't4']) {
  await renderPage('教师评价审核（' + initialActorId + '）', () => import('../mobile-app/teacher-development/TeacherDevelopmentApp'), { initialActorId, initialTab: 'record', initialRecordMode: 'review' }, html => {
    const text = plainText(html);
    if (!text.includes(initialActorId === 't2' ? '审核 (1)' : '审核 (2)')) throw new Error('审核待办数必须排除本人记录');
    if (text.includes('按住说话')) throw new Error('审核功能不应显示录入条');
  });
}
await renderPage('教师评价指标导图', () => import('../mobile-app/teacher-development/IndicatorView'), { indicators: developmentData.INDICATORS, onBack: noop });
for (const scope of ['student', 'class']) {
  await renderPage('教师手机端指标导图（' + scope + '）', () => import('../mobile-app/views/TeacherIndicatorCatalogView'), { scope, onBack: noop });
}
const profileModule = await import('../mobile-app/teacher-development/ArchiveView');
for (const [part, expected] of [['basic', '学科教学（语文）'], ['positions', '高一1班、2班'], ['qualifications', '2014**********2186'], ['experience', '成都市实验中学']]) {
  await renderPage('教师完整资料（' + part + '）', async () => ({ default: profileModule.ProfileDetails }), { teacher: developmentData.TEACHERS[0], part }, html => {
    if (!plainText(html).includes(expected)) throw new Error('档案资料未完整渲染');
  });
}
await renderPage('管理者查看教师档案', () => import('../mobile-app/teacher-development/TeacherDevelopmentApp'), { initialActorId: 't2', initialSelectedTeacherId: 't3' }, html => {
  if (!plainText(html).includes('王悦的档案')) throw new Error('管理者查看对象应明确');
});


const reportAppearanceDomain = await import('../mobile-app/domain/termReportAppearance');
const reportAppearanceStore = await import('../mobile-app/services/termReportAppearanceStore');
const reportSpace = { id: 'cover-config-smoke', title: '星河实验学校', type: 'school', role: 'administrator', schoolType: 'nineYear' };
await renderPage('报告配置（默认关闭）', () => import('../mobile-app/views/ReportManagementView'), { currentSpace: reportSpace, onBack: noop }, html => {
  if (!html.includes('个性化封面配置') || !html.includes('aria-checked="false"')) throw new Error('封面配置默认应关闭');
  if (html.includes('封面工具')) throw new Error('关闭时隐藏工具');
});
const previousGetItem = localStorage.getItem;
for (const mode of ['school', 'stage']) {
  const config = { ...reportAppearanceDomain.createReportAppearance('星河实验学校'), enabled: true, mode };
  localStorage.getItem = key => key === reportAppearanceStore.appearanceKey(reportSpace.id) ? JSON.stringify(config) : null;
  await renderPage('统一报告配置（旧模式 ' + mode + '）', () => import('../mobile-app/views/ReportManagementView'), { currentSpace: reportSpace, onBack: noop }, html => {
    for (const label of ['封面预览', '编辑封面', 'cover-preview__overlay']) if (!html.includes(label)) throw new Error('缺少：' + label);
    for (const label of ['按学校', '按学段', '区分男女', '男生', '女生', 'A4', '小学低段']) if (html.includes(label)) throw new Error('第一版不应出现：' + label);
    for (const label of ['封面工具', '背景配色', '上传学校标识', '保存', 'cover-artwork-control']) if (html.includes(label)) throw new Error('预览页不得出现编辑操作：' + label);
  });
}
localStorage.getItem = previousGetItem;
const imageAsset = { src: 'data:image/png;base64,c2FtcGxl', width: 1600, height: 1600, name: 'cover.png' };
const customAppearance = { ...reportAppearanceDomain.createReportAppearance('星河实验学校'), enabled: true, assets: { ip: imageAsset }, defaultCover: { ...reportAppearanceDomain.DEFAULT_COVER_STYLE, artwork: 'custom', theme: 'blue', imageId: 'ip', imageScale: 85, imageOffsetX: 5, imageOffsetY: -3, imageRotation: 25 } };
await renderPage('独立封面编辑页（默认展开图片）', () => import('../mobile-app/components/term-report/SchoolCoverSettings'), { config: customAppearance, draft: null, grade: '一年级', onChange: noop, onSave: noop, onBusyChange: noop }, html => {
  for (const label of ['封面实时预览', '缩放封面图', '旋转封面图', '取消选中封面图', '封面图设置', '封面工具', '校徽', '背景', '保存']) if (!html.includes(label)) throw new Error('编辑页缺少：' + label);
  if (html.includes('编辑封面') || html.includes('返回编辑') || html.includes('个性化封面配置')) throw new Error('编辑页不应出现预览页入口');
  if (html.includes('type="range"')) throw new Error('缩放直接在画布完成，不应显示底部滑杆');
  const toolbar = html.slice(html.indexOf('school-cover-workspace__toolbar'), html.indexOf('school-cover-workspace__panel'));
  if (toolbar.includes('<svg')) throw new Error('底部工具应为纯文字');
  if (html.indexOf('school-cover-workspace__toolbar') > html.indexOf('school-cover-workspace__panel')) throw new Error('选项必须在工具按钮下方');
  if (html.indexOf('school-cover-workspace__save') < html.indexOf('school-cover-workspace__panel')) throw new Error('保存必须独立放在面板下方');
});
for (const gender of ['male', 'female']) for (const grade of ['一年级', '五年级', '七年级']) {
  await renderPage('统一封面（' + gender + ' / ' + grade + '）', () => import('../mobile-app/components/term-report/TermReportCover'), { student: { id: 'cover', name: '陈子涵', gender, grade, class: '1班' }, appearance: customAppearance, tags: ['勤学', '善思', '合作'] }, html => {
    if (!html.includes(imageAsset.src) || !html.includes('--cover-image-scale:0.85') || !html.includes('--cover-image-x:5%') || !html.includes('--cover-image-rotation:25deg')) throw new Error('不同学段及性别必须应用统一图片及位置');
  });
}
await renderPage('学校封面默认预览（无上传图片）', () => import('../mobile-app/components/term-report/SchoolCoverSettings'), {
  config: { ...reportAppearanceDomain.createReportAppearance('星河实验学校'), enabled: true }, draft: null, grade: '一年级', onChange: noop, onSave: noop, onBusyChange: noop,
}, html => {
  for (const text of ['成长手册', '陈子涵', '好奇善问', 'term-report-cover__wash']) if (!html.includes(text)) throw new Error('无图片时仍须展示完整封面：' + text);
  if (html.includes('<img') || html.includes('请上传')) throw new Error('无图片时不得回退默认插画或占位提示');
  if ((html.match(/星河实验学校/g) ?? []).length !== 1) throw new Error('校名仅在封面成品中展示');
});

await renderPage('公共组件库：录入控件', () => import('../components/PublicInputComposerDemo'), {}, html => {
  for (const label of ['录入控件', '预览配置', '阴影加强', '核心入参', '使用示例', '拍照记录', '按住说话']) {
    if (!plainText(html).includes(label)) throw new Error('公共输入预览缺少：' + label);
  }
  if (!html.includes('mobile-input-composer') || !html.includes('data-shadow="subtle"')) throw new Error('组件库必须复用正式输入控件与场景参数');
});

const petSettingsOriginalGetItem = localStorage.getItem;
for (const enabled of [false, true]) {
  localStorage.getItem = key => key === 'campus-school-class-pet:v1:pet-audit' ? JSON.stringify({ enabled, levelPoints: [5, 10, 10, 10, 10, 20, 20, 40, 40] }) : petSettingsOriginalGetItem.call(localStorage, key);
  await renderPage('AI宠物配置（' + (enabled ? '开启' : '默认关闭') + '）', () => import('../mobile-app/views/ClassPetSettingsView'), { schoolId: 'pet-audit' }, html => {
    const text = plainText(html);
    if (text.includes('个性化宠物') || text.includes('允许学生自定义初始蛋') || text.includes('允许学生控制进化方向')) throw new Error('已取消的个性化宠物仍显示');
    if (!text.includes('开启AI宠物')) throw new Error('缺少宠物主开关');
    for (const label of ['基础设置', '领取方式', '班主任领取', '学生领取', '扣分处理', '高级设置', '升级经验']) {
      if (text.includes(label) !== enabled) throw new Error('宠物设置未按主开关渐进展示：' + label);
    }
  });
}
localStorage.getItem = petSettingsOriginalGetItem;

await renderPage('教师Pad班级评价工作台', () => import('../components/teacher-pad/TeacherPad'), {}, html => {
  const text = plainText(html);
  for (const label of ['查看班级指标', '教师端主要导航', '班级', '我的', '按住说话', '切换到文字输入']) {
    if (!text.includes(label)) throw new Error('Pad缺少班级评价入口：' + label);
  }
  if (text.includes('记录学生') || text.includes('记录班级') || text.includes('提交评价')) throw new Error('Pad不应出现记录类型标题、学生入口或独立评分草稿');
});

for (const initialPage of ['class', 'me', 'ranking', 'report', 'assistant', 'indicators', 'duty', 'details', 'profile', 'settings', 'feedback']) {
  await renderPage('教师Pad页面（' + initialPage + '）', () => import('../components/teacher-pad/TeacherPad'), { initialPage }, html => {
    if (!html.includes('pad-page-' + initialPage)) throw new Error('Pad页面路由未挂载');
    const text = plainText(html);
    if (initialPage === 'class') {
      if (html.includes('aria-label="班级内容分类"')) throw new Error('Pad单一班级板块不应展示顶部分类');
      for (const label of ['任教班级', '按年级筛选班级', '班主任', '60人']) {
        if (!text.includes(label)) throw new Error('Pad班级缺少共用内容：' + label);
      }
      if (text.includes('学生列表') || text.includes('评价明细') || text.includes('查看班级排行榜')) throw new Error('首期班级页不展示学生操作或排行榜');
    }
    if (initialPage === 'feedback') {
      for (const label of ['建议反馈', '反馈内容', '上传反馈图片', '提交']) {
        if (!text.includes(label)) throw new Error('Pad建议反馈缺少共用内容：' + label);
      }
      if (!/disabled=""[^>]*>提交|disabled=""[^>]*>\s*提交/.test(html)) throw new Error('空反馈应禁止提交');
    }
    if (initialPage === 'me') {
      for (const label of ['编辑教师信息', '设置', '切换班级来源', '建议反馈']) {
        if (!text.includes(label)) throw new Error('Pad我的缺少共用入口：' + label);
      }
      if (['管理工具', '班主任助理', '班级评价报表', '值周安排', '班级评价指标', '管理者'].some(label => text.includes(label))) throw new Error('Pad我的展示了首期不需要的工具或角色文字');
    }
  });
}

for (const initialPage of ['class', 'me']) {
  await renderPage('教师Pad后续功能开启（' + initialPage + '）', () => import('../components/teacher-pad/TeacherPad'), {
    initialPage, features: { managementTools: true, weeklyDutySchedule: true, classLeaderboard: true, wechatQuickLogin: true },
  }, html => {
    const text = plainText(html);
    const labels = initialPage === 'class'
      ? ['查看班级排行榜']
      : ['管理工具', '班主任助理', '班级评价报表', '值周安排', '建议反馈'];
    for (const label of labels) if (!text.includes(label)) throw new Error('开启后应恢复符合学校权限的入口：' + label);
  });
}

await renderPage('班级记录演示分析不混入学生指标', async () => {
  const { buildClassRecordDemoAnalysis } = await import('../mobile-app/domain/classRecordDemoAnalysis');
  const { MOCK_CLASSES } = await import('../mobile-app/constants');
  const result = buildClassRecordDemoAnalysis('三年级二班，晨检发现教室桌椅摆放不整齐。', MOCK_CLASSES);
  if (result.students[0]?.id !== 'c_2024_2' || !result.score.label.includes('内务整理') || result.score.value !== -1) throw new Error('班级记录的对象、指标或扣分不正确');
  return import('../mobile-app/views/ClassRecordLogView');
}, { activeTab: 'class', onTabChange: noop, onBack: noop, onViewIndicators: noop });

await renderPage('教师Pad设备壳与预览控件', () => import('../components/teacher-pad/TeacherPadPreview'), {}, html => {
  for (const label of ['模拟真实Pad', '切换Pad横竖屏', 'Pad尺寸', 'pad-device-shell', '教师端主要导航', 'Pad功能预览设置', '第一期', '第二期']) {
    if (!html.includes(label)) throw new Error('Pad设备预览缺少：' + label);
  }
  if (!html.includes('aria-pressed="true">第一期') || !html.includes('aria-pressed="false">第二期')) throw new Error('Pad预览应默认选择第一期');
});

for (const showWechatLogin of [false, true]) {
  await renderPage('教师Pad登录入口（' + (showWechatLogin ? '第二期' : '第一期') + '）', () => import('../mobile-app/views/TeacherLoginView'), {
    onLogin: noop, showWechatLogin,
  }, html => {
    const text = plainText(html);
    for (const label of ['最近登录', '手机号登录/注册']) {
      if (!text.includes(label)) throw new Error('Pad登录页缺少入口：' + label);
    }
    if (text.includes('一键登录') !== showWechatLogin) throw new Error('一键登录应仅在第二期展示');
    if (text.includes('微信授权登录')) throw new Error('登录按钮名称应为一键登录');
  });
}

// 货柜兑换：覆盖真实列表渲染、空结果和演示适配，权限校验必须先于展示。
const vendingSample = {
  id: 'vending-smoke', orderNo: 'HG20261105001', schoolId: 'school-vending',
  studentId: 'student-vending', studentName: '张雨桐', studentNo: '20260101',
  classId: 'vending-class', className: '2026级1班', gradeName: '一年级',
  productId: 'vending-product', productName: '卡通笔袋', categoryId: 'stationery', categoryName: '文具',
  quantity: 1, unitPrice: 20, chargedAmount: 20,
  terminalDeviceId: 'terminal-1', terminalDeviceName: '人北华侨城一楼', channelName: '0101',
  time: '2026-11-05 10:32:00', status: 'failed', refundStatus: 'refunded', refundedAmount: 20,
};
for (const authorized of [true, false]) {
  await renderPage('货柜兑换明细（' + (authorized ? '含退币记录' : '无授权班级') + '）', () => import('../mobile-app/views/VendingExchangeView'), {
    schoolId: 'school-vending', today: '2026-11-05', onBack: noop,
    authorizedClasses: authorized ? [{ id: 'vending-class', name: '2026级1班', gradeLevel: '一年级' }] : [],
    records: [vendingSample, { ...vendingSample, id: 'other-vending', schoolId: 'other-school', studentName: '未授权学生' }],
  }, html => {
    const text = plainText(html);
    for (const label of ['货柜兑换明细', '搜索学生姓名', '全部分类']) if (!text.includes(label)) throw new Error('货柜兑换缺少：' + label);
    if (text.includes('未授权学生')) throw new Error('兑换明细泄露其他学校数据');
    if (text.includes('张雨桐') !== authorized) throw new Error('兑换明细没有按授权班级过滤');
    if (authorized && !['人北华侨城一楼', '未出货', '已退币', '共 1 条'].every(label => text.includes(label))) throw new Error('兑换明细缺少设备、异常状态或准确条数');
    if (!authorized && !text.includes('暂无兑换记录')) throw new Error('无权限数据时应展示空状态');
  });
}
await renderPage('货柜兑换演示适配', () => import('../mobile-app/views/vending-exchange/VendingExchangeDemoView'), {
  space: { id: 'school-vending', type: 'school', role: 'teacher' },
  teacher: { homeroomClassIds: ['vending-class'], teachingAssignments: [], gradeLeaderGrades: [] },
  classes: [{ id: 'vending-class', name: '2026级1班', gradeLevel: '一年级' }],
  getStudents: () => [{ id: 'student-vending', name: '张雨桐', studentNo: '20260101' }], onBack: noop,
}, html => {
  if (!plainText(html).includes('张雨桐')) throw new Error('演示兑换没有接入花名册');
});
for (const role of ['administrator', 'homeroomTeacher', 'teacher', 'owner']) {
  await renderPage('更多工具货柜入口（' + role + '）', () => import('../mobile-app/views/MeView'), {
    ...meStyleActions, onOpenVendingExchange: noop, teacherProfile: rosterTeacher,
    isSpaceSheetOpen: false, pendingCollectionCount: 0,
    currentSpace: { ...profileSpace, type: role === 'owner' ? 'personal' : 'school', role },
  }, html => {
    if (html.includes('aria-label="货柜兑换"') !== (role !== 'owner')) throw new Error('货柜入口学校权限不正确');
  });
}
await renderPage('极速版不开放货柜兑换', () => import('../mobile-app/views/MeView'), {
  ...meStyleActions, onOpenVendingExchange: noop, teacherProfile: rosterTeacher,
  isSpaceSheetOpen: false, pendingCollectionCount: 0,
  currentSpace: { ...profileSpace, type: 'school', role: 'administrator' },
  availableTools: teacherAppFeatures.lite.meTools,
}, html => {
  if (html.includes('aria-label="货柜兑换"')) throw new Error('极速版泄露货柜入口');
});

// 渲染结束后主动退出：个别模块会留下常驻定时器。
process.exit(0);
