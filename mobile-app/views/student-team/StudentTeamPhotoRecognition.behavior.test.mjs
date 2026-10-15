import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

// 直接执行组件事件，验证草稿提交边界；不启动浏览器或依赖页面布局。
function mount(file, props) {
  let states = [], effects = [], cursor = 0, effectCursor = 0, pending = [], dirty = false, tree;
  const timers = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, ...(children.length ? { children } : {}) } }),
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
      return [states[index], value => {
        const next = typeof value === 'function' ? value(states[index]) : value;
        if (!Object.is(next, states[index])) { states[index] = next; dirty = true; }
      }];
    },
    useMemo: fn => fn(),
    useRef(initial) { return react.useState({ current: initial })[0]; },
    useEffect(fn, deps) {
      const index = effectCursor++;
      if (!effects[index] || deps.some((value, i) => !Object.is(value, effects[index][i]))) pending.push(fn);
      effects[index] = deps;
    },
  };
  const imports = new Proxy({
    __esModule: true,
    ASSETS: { AVATAR: { GENERIC_BOY: 'boy.png' }, DEFAULT_STATE: { CHAIR: 'chair.png', MAGNIFIER: 'search.png' } },
    studentTeamAvatarOptions: [],
    getStudentTeamAvatarImage: () => '',
    getStudentTeamAvatarOption: () => ({ label: '头像' }),
  }, { get: (target, key) => key in target ? target[key] : String(key) });
  const code = transformSync(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), { loader: 'tsx', format: 'cjs' }).code;
  const context = {
    module: { exports: {} },
    require: name => name === 'react' ? react : { ...imports, default: name.split('/').pop() },
    window: { setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout() {} },
    URL: { createObjectURL: () => 'blob:student-roster', revokeObjectURL() {} },
  };
  vm.runInNewContext(code, context);
  const render = () => {
    let rounds = 0;
    do {
      assert.ok(++rounds < 15, '组件不应无限更新');
      dirty = false; cursor = 0; effectCursor = 0; pending = [];
      tree = context.module.exports.default(props);
      pending.forEach(fn => fn());
    } while (dirty);
    return tree;
  };
  const find = (predicate, node = tree) => {
    if (!node || typeof node !== 'object') return undefined;
    if (!Array.isArray(node) && predicate(node)) return node;
    const children = Array.isArray(node) ? node : Object.values(node.props ?? {});
    for (const child of children) { if (child === undefined) continue; const result = find(predicate, child); if (result) return result; }
  };
  render();
  return { render, find, runTimers() { timers.splice(0).forEach(fn => fn()); render(); }, timerCount: () => timers.length };
}
const students = ['a', 'b', 'c'].map(id => ({ id, name: id, status: 'active', gender: 'male' }));
let saved, closed;
const props = mode => ({
  open: true, mode,
  team: { id: 'team', name: '篮球社', memberIds: ['a'], visibility: 'management' },
  classes: [{ id: 'class', name: '一班', gradeLevel: '一年级' }],
  getStudentsForClass: () => students,
  getClassLabel: c => c.name,
  getStudentLabelById: id => ({ name: id, classLabel: '一班', avatar: '' }),
  searchStudentsByExactName: name => students.filter(s => s.name === name),
  onClose: () => { closed = true; }, onSave: value => { saved = value; },
});
const sheet = app => app.find(n => n.type === 'MobileBottomSheet');
const grid = app => app.find(n => n.type === 'StudentCompactSelectGrid');
const text = node => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join('') : node?.props ? text(node.props.children) : '';
const click = (app, label) => { const button = app.find(n => n.type === 'button' && (n.props['aria-label'] === label || text(n) === label)); assert.ok(button, label); button.props.onClick(); app.render(); };

const photo = mount('./StudentTeamPhotoRecognitionFlow.tsx', { ...props('add'), existingStudentIds: new Set(['a']), onConfirm: ids => { saved = ids; } });
const recognitionPage = () => photo.find(n => n.type === 'MobileFullScreenPage');
assert.equal(sheet(photo).props.title, '拍照识别');
assert.equal(recognitionPage(), undefined, '点击入口先选择图片来源，不直接进入相机');
assert.equal(photo.timerCount(), 0, '打开来源弹窗不能自动识别');
click(photo, '拍照');
assert.equal(recognitionPage().props.title, '拍照识别学生名单');
assert.equal(recognitionPage().props.appearance, 'dark', '相机原生模拟区域使用深色主题');
assert.equal(sheet(photo), undefined, '选择拍照后关闭来源弹窗并进入完整相机页');
assert.equal(photo.timerCount(), 0, '不能打开即自动识别');
const camera = photo.find(n => n.type === 'MobileCameraView');
assert.equal(typeof camera.props.onBack, 'function', '相机顶部提供返回');
camera.props.onCapture(); photo.render();
assert.equal(photo.find(n => n.type === 'MobileCameraView').props.busy, true);
photo.runTimers();
assert.equal(recognitionPage().props.title, '识别结果');
assert.equal(recognitionPage().props.appearance, 'light', '核对页恢复浅色原生模拟区域');
assert.equal(grid(photo).props.isDisabled('a'), true);
grid(photo).props.onToggle('a'); grid(photo).props.onToggle('b'); photo.render();
click(photo, '确认添加 1 人');
assert.equal(saved.join(','), 'b', '识别结果排除已有成员');
assert.equal(closed, true);

saved = undefined;
const album = mount('./StudentTeamPhotoRecognitionFlow.tsx', { ...props('add'), onConfirm: ids => { saved = ids; } });
let pickerOpened = false;
const albumInput = () => album.find(n => n.type === 'input' && n.props.type === 'file');
albumInput().props.ref.current = { click: () => { pickerOpened = true; } };
click(album, '从相册选择');
assert.equal(pickerOpened, true, '相册入口调用图片选择器');
assert.equal(albumInput().props.capture, undefined, '相册选择不强制拍照');
albumInput().props.onChange({ target: { files: [], value: '' } }); album.render();
assert.equal(sheet(album).props.open, true, '取消选择保留来源弹窗');
assert.equal(album.timerCount(), 0, '取消选择不触发识别');
albumInput().props.onChange({ target: { files: [{ type: 'text/plain' }], value: '' } }); album.render();
assert.ok(album.find(n => n.props?.role === 'alert'), '非图片文件提供错误反馈');
albumInput().props.onChange({ target: { files: [{ type: 'image/png' }], value: 'roster.png' } }); album.render();
assert.equal(sheet(album), undefined, '选图后关闭来源弹窗');
assert.equal(album.find(n => n.type === 'img').props.src, 'blob:student-roster');
assert.equal(saved, undefined, '选图不直接添加学生');
album.runTimers();
assert.equal(album.find(n => n.type === 'MobileFullScreenPage').props.title, '识别结果');
click(album, '重新选择图片');
assert.equal(sheet(album).props.open, true, '重新选择回到来源弹窗');
console.log('拍照识别行为验证通过：来源弹窗、主动拍照、相册选图、取消选图、文件校验、重新选择、识别去重。');
