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

const add = mount('./StudentTeamEditorView.tsx', props('add'));
assert.equal(sheet(add).props.title, '添加学生');
assert.equal(sheet(add).props.footer.props.disabled, true);
assert.equal(grid(add).props.isDisabled('a'), true);
grid(add).props.onToggle('a'); add.render();
assert.equal(sheet(add).props.footer.props.disabled, true, '已有成员不能取消或计入新增');
assert.equal(add.find(n => n.type === 'button' && /全选/.test(text(n))), undefined, '社团选人不提供按班级全选');
grid(add).props.onToggle('b'); add.render();
assert.equal(text(sheet(add).props.footer), '添加（1人）');
assert.equal(sheet(add).props.footerLeading.type, 'StudentTeamSelectedList', '已选摘要固定在底部主操作上方');
click(add, '选择班级');
assert.equal(sheet(add).props.open, false, '打开公共班级选择时隐藏学生弹窗');
const classPicker = add.find(n => n.type === 'MobileClassPickerSheet');
assert.equal(classPicker.props.open, true);
assert.equal(classPicker.props.commitMode, 'immediate');
classPicker.props.onChange({ classId: 'class' }); classPicker.props.onClose(); add.render();
assert.equal(sheet(add).props.open, true);
assert.equal(text(sheet(add).props.footer), '添加（1人）', '选择班级后保留已选草稿');
sheet(add).props.footer.props.onClick();
assert.equal(saved.memberIds.join(','), 'a,b', '添加保留已有成员');

saved = undefined;
const edit = mount('./StudentTeamEditorView.tsx', props('members'));
assert.equal(sheet(edit).props.title, '调整学生');
assert.equal(grid(edit), undefined, '调整先展示成员而非班级选人');
click(edit, '移除a'); click(edit, '撤销移除a');
assert.equal(sheet(edit).props.footer.props.disabled, true, '撤销恢复初始名单');
click(edit, '移除a'); click(edit, '添加学生');
grid(edit).props.onToggle('b'); edit.render(); click(edit, '返回上一步');
assert.equal(sheet(edit).props.title, '调整学生');
assert.ok(edit.find(n => n.props?.['aria-label'] === '撤销移除a'), '返回保留此前移除草稿');
click(edit, '添加学生'); grid(edit).props.onToggle('c'); edit.render();
sheet(edit).props.footer.props.onClick(); edit.render();
assert.equal(saved, undefined, '调整中的添加不提前保存');
click(edit, '移除c'); click(edit, '撤销移除c');
sheet(edit).props.footer.props.onClick();
assert.equal(saved.memberIds.join(','), 'c', '最终保存统一提交增删');
const empty = mount('./StudentTeamEditorView.tsx', props('members'));
click(empty, '移除a'); sheet(empty).props.footer.props.onClick();
assert.equal(saved.memberIds.length, 0, '允许移除最后一位成员');

const photo = mount('./StudentTeamPhotoRecognitionFlow.tsx', { ...props('add'), existingStudentIds: new Set(['a']), onConfirm: ids => { saved = ids; } });
const recognitionPage = () => photo.find(n => n.type === 'MobileFullScreenPage');
assert.equal(recognitionPage().props.title, '拍照识别学生名单');
assert.equal(recognitionPage().props.appearance, 'dark', '相机原生模拟区域使用深色主题');
assert.equal(sheet(photo), undefined, '拍照识别不再使用底部弹窗');
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

console.log('社团成员行为验证通过：仅追加、逐项选择、移除撤销、添加返回、统一保存、空名单、主动拍照、识别去重。');
