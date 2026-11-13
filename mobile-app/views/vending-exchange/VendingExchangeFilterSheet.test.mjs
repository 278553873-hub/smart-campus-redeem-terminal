import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';

// 在 Node 中执行真实组件与回调，仅替换 React 挂载环境；不启动浏览器。
async function harness(file, component, globals = {}) {
  const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8').replace(/^import .*;$/gm, '');
  const { code } = await transform(source, { loader: 'tsx', format: 'cjs', jsx: 'transform' });
  const states = [], dependencies = [];
  let cursor = 0, effectCursor = 0, dirty = false, effects = [];
  const useState = initial => {
    const index = cursor++;
    if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
    return [states[index], next => {
      const value = typeof next === 'function' ? next(states[index]) : next;
      if (!Object.is(value, states[index])) { states[index] = value; dirty = true; }
    }];
  };
  const context = vm.createContext({
    module: { exports: {} }, exports: {}, ...globals,
    React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children: children.flat(Infinity) } }) },
    useState, useMemo: factory => factory(), useRef: initial => useState(() => ({ current: initial }))[0],
    useEffect: (effect, deps) => {
      const index = effectCursor++, previous = dependencies[index];
      if (!previous || deps.some((value, item) => !Object.is(value, previous[item]))) {
        dependencies[index] = deps; effects.push(effect);
      }
    },
  });
  vm.runInContext(`${code}\nglobalThis.Component = ${component};`, context);
  return props => {
    let tree, attempts = 0;
    do {
      dirty = false; cursor = 0; effectCursor = 0; effects = [];
      tree = context.Component(props);
      effects.forEach(effect => effect());
      assert.ok(++attempts < 10, '组件应能稳定完成状态更新');
    } while (dirty);
    return tree;
  };
}
const walk = node => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(walk)
  : [node, ...walk(node.props?.children), ...walk(node.props?.titleContent), ...walk(node.props?.footer)];
const byType = (tree, type) => walk(tree).find(node => node.type === type);
const entry = (tree, label) => walk(tree).find(node => node.type?.name === 'FilterEntry' && node.props.label === label);
const text = node => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join('') : node?.props ? text(node.props.children) : '';
const button = (tree, label) => walk(tree).find(node => node.type === 'button' && (node.props['aria-label'] === label || text(node) === label));

let applied, closed = 0;
const value = { terminalDeviceId: 't1', status: '', categoryId: '', productId: '', productIds: [], gradeName: '', classId: '', classIds: [] };
const props = { open: true, value, onConfirm: next => { applied = next; }, onClose: () => { closed++; },
  terminals: [{ value: 't1', label: '一楼' }, { value: 't2', label: '二楼' }],
  classes: [{ id: 'c1', name: '1班', gradeLevel: '一年级' }, { id: 'c2', name: '2班', gradeLevel: '二年级' }, { id: 'c3', name: '3班', gradeLevel: '二年级' }],
  categories: [{ value: 'cat1', label: '文具', options: [{ value: 'p1', label: '铅笔' }] }, { value: 'cat2', label: '玩具', options: [{ value: 'p2', label: '积木' }] }],
};
const render = await harness('./VendingExchangeFilterSheet.tsx', 'VendingExchangeFilterSheet', {
  MobileBottomSheet: 'Sheet', MobileCascadePicker: 'Cascade', MobileClassCascadePicker: 'ClassPicker', MobileDropdownOptionList: 'Options', PillSelectionControl: 'Status',
  ChevronLeft: 'Icon', ChevronRight: 'Icon', mobileSheetActionClass: '',
  VENDING_EXCHANGE_STATUS_LABELS: { completed: '兑换成功', failed: '兑换失败' },
});
let tree = render(props);
assert.equal(tree.props.title, '筛选兑换记录');
assert.equal(walk(tree).filter(node => node.type?.name === 'FilterEntry').length, 3);
byType(tree, 'Status').props.onChange('failed');
entry(tree, '商品').props.onClick(); tree = render(props);
assert.equal(tree.props.title, '选择商品');
assert.ok(button(tree, '完成'), '商品多选通过完成回填');
assert.equal(walk(tree).filter(node => node.type === 'Sheet').length, 1, '全程只有一个弹窗');
assert.equal(byType(tree, 'Cascade').props.selectionMode, 'multiple');
assert.equal(byType(tree, 'Cascade').props.allGroupsLabel, '全部');
button(tree, '返回筛选').props.onClick(); tree = render(props);
assert.equal(byType(tree, 'Status').props.value, 'failed', '返回保留其他草稿');
assert.equal(entry(tree, '商品').props.value, '全部商品', '只浏览不应修改选择');
entry(tree, '商品').props.onClick(); tree = render(props);
byType(tree, 'Cascade').props.onSelectionChange(new Set(['p2'])); tree = render(props);
assert.equal(tree.props.title, '选择商品', '多选不提前返回');
button(tree, '完成').props.onClick(); tree = render(props);
assert.equal(entry(tree, '商品').props.value, '积木');
assert.equal(applied, undefined, '点选仅回填草稿，不应用查询');
entry(tree, '班级').props.onClick(); tree = render(props);
assert.equal(byType(tree, 'ClassPicker').props.groups[0].displayLabel, '全部', '全部位于年级列表顶部');
byType(tree, 'ClassPicker').props.onActiveGradeChange('二年级'); tree = render(props);
assert.equal(byType(tree, 'ClassPicker').props.selectedClassIds.size, 0, '浏览年级不修改已选范围');
byType(tree, 'ClassPicker').props.onToggleGrade(['c2', 'c3']); tree = render(props);
assert.equal(byType(tree, 'ClassPicker').props.selectedClassIds.size, 2);
byType(tree, 'ClassPicker').props.onToggleGrade(['c2', 'c3']); tree = render(props);
assert.equal(byType(tree, 'ClassPicker').props.selectedClassIds.size, 0, '再次点击全选取消当前年级的选择');
byType(tree, 'ClassPicker').props.onToggleGrade(['c2', 'c3']); tree = render(props);
assert.equal(applied, undefined, '多选班级期间不应用查询');
button(tree, '完成').props.onClick(); tree = render(props);
assert.equal(entry(tree, '班级').props.value, '已选2个班级');
entry(tree, '货柜机').props.onClick(); tree = render(props);
assert.equal(byType(tree, 'Options').props.options.length, 2, '货柜机不增加全部选项');
byType(tree, 'Options').props.onChange('t2'); tree = render(props);
assert.equal(entry(tree, '货柜机').props.value, '二楼');
button(tree, '查看结果').props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(applied)), { ...value, terminalDeviceId: 't2', status: 'failed', productIds: ['p2'], classIds: ['c2', 'c3'] });
assert.equal(closed, 1);
render({ ...props, open: false }); tree = render(props);
assert.equal(entry(tree, '商品').props.value, '全部商品', '重新打开恢复已生效值，丢弃旧草稿');
entry(tree, '班级').props.onClick(); tree = render(props);
byType(tree, 'ClassPicker').props.onToggleClass('c1'); tree = render(props);
byType(tree, 'ClassPicker').props.onActiveGradeChange('二年级'); tree = render(props);
byType(tree, 'ClassPicker').props.onToggleClass('c2'); tree = render(props);
assert.equal(byType(tree, 'ClassPicker').props.selectedClassIds.size, 2, '切换年级保留其他年级的选择');
button(tree, '完成').props.onClick(); tree = render(props);
assert.equal(entry(tree, '班级').props.value, '已选2个班级');
entry(tree, '班级').props.onClick(); tree = render(props);
byType(tree, 'ClassPicker').props.onToggleClass('c1'); tree = render(props);
button(tree, '返回筛选').props.onClick(); tree = render(props);
assert.equal(entry(tree, '班级').props.value, '已选2个班级', '返回放弃尚未完成的班级选择');
entry(tree, '班级').props.onClick(); tree = render(props);
const beforeAll = applied;
byType(tree, 'ClassPicker').props.onActiveGradeChange(''); tree = render(props);
assert.equal(tree.props.title, '选择班级', '点击左侧全部只切换右侧内容，不返回');
assert.equal(byType(tree, 'ClassPicker').props.activeGrade, '');
assert.equal(byType(tree, 'ClassPicker').props.selectedClassIds.size, 2, '浏览全部不改变选择');
assert.equal(byType(tree, 'ClassPicker').props.allClassesMixed, true);
byType(tree, 'ClassPicker').props.onToggleAllClasses(); tree = render(props);
assert.equal(byType(tree, 'ClassPicker').props.selectedClassIds.size, 3, '右侧全部班级选择权限内所有班级');
assert.equal(byType(tree, 'ClassPicker').props.allClassesSelected, true);
assert.equal(tree.props.title, '选择班级', '选择后仍需点完成');
button(tree, '完成').props.onClick(); tree = render(props);
assert.equal(entry(tree, '班级').props.value, '全部班级');
assert.equal(applied, beforeAll, '完成只回填草稿，不提前应用查询');
entry(tree, '班级').props.onClick(); tree = render(props);
assert.equal(byType(tree, 'ClassPicker').props.selectedClassIds.size, 3, '再次打开保留全部班级选择');
button(tree, '返回筛选').props.onClick(); tree = render(props);
entry(tree, '商品').props.onClick(); tree = render(props);
byType(tree, 'Cascade').props.onSelectionChange(new Set(['p1', 'p2'])); tree = render(props);
button(tree, '完成').props.onClick(); tree = render(props);
assert.equal(entry(tree, '商品').props.value, '全部商品');
entry(tree, '商品').props.onClick(); tree = render(props);
assert.equal(byType(tree, 'Cascade').props.selectedValues.size, 2, '再次打开保留跨分类商品多选');
byType(tree, 'Cascade').props.onSelectionChange(new Set(['p1'])); tree = render(props);
button(tree, '返回筛选').props.onClick(); tree = render(props);
assert.equal(entry(tree, '商品').props.value, '全部商品', '返回放弃未完成的商品修改');
byType(tree, 'Status').props.onChange('completed'); tree = render(props);
entry(tree, '货柜机').props.onClick(); tree = render(props);
byType(tree, 'Options').props.onChange('t2'); tree = render(props);
const beforeResetClosed = closed;
button(tree, '重置').props.onClick();
assert.equal(closed, beforeResetClosed + 1, '重置后立即关闭弹窗');
assert.deepEqual(JSON.parse(JSON.stringify(applied)), { ...value, terminalDeviceId: 't1' }, '重置立即清空状态、商品与班级条件，并恢复首台货柜');
render({ ...props, open: false }); tree = render({ ...props, value: applied });
assert.equal(entry(tree, '商品').props.value, '全部商品');
assert.equal(byType(tree, 'Status').props.value, '');
assert.equal(entry(tree, '货柜机').props.value, '一楼');

let selected;
const cascade = await harness('../../components/ui/MobileCascadePicker.tsx', 'MobileCascadePicker', { Check: 'Icon', Minus: 'Icon', mobileFilterCheckClass: '' });
const cascadeProps = { groups: props.categories, value: { groupValue: '', optionValue: '' }, showAllGroupsOption: false,
  allOptionsInGroupLabel: '该分类全部商品', onChange: next => { selected = next; } };
tree = cascade(cascadeProps);
const optionGroup = root => walk(root).find(node => node.props?.role === 'group' && node.props['aria-label'] === '文具下的选项');
assert.ok(optionGroup(tree));
assert.ok(button(tree, '铅笔'));
assert.equal(button(tree, '积木'), undefined, '不汇总其他分组的长列表');
button(tree, '玩具').props.onClick(); tree = cascade(cascadeProps);
assert.equal(selected, undefined, '切换分组只是导航，不提交范围');
assert.equal(button(tree, '铅笔'), undefined);
button(tree, '该分类全部商品').props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(selected)), { groupValue: 'cat2', optionValue: '' });
button(tree, '积木').props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(selected)), { groupValue: 'cat2', optionValue: 'p2' });

const multiCascade = await harness('../../components/ui/MobileCascadePicker.tsx', 'MobileCascadePicker', { Check: 'Icon', Minus: 'Icon', mobileFilterCheckClass: '' });
let selectedProducts = new Set();
const multiProps = () => ({ groups: props.categories, selectionMode: 'multiple', selectedValues: selectedProducts,
  allGroupsLabel: '全部', allOptionsLabel: '全部商品', onSelectionChange: next => { selectedProducts = next; } });
tree = multiCascade(multiProps());
assert.ok(button(tree, '全部商品'));
assert.equal(button(tree, '铅笔'), undefined, '全部分组只展示全部商品选项，不汇总长列表');
button(tree, '文具').props.onClick(); tree = multiCascade(multiProps());
assert.equal(selectedProducts.size, 0, '浏览分类不改变选择');
button(tree, '全选').props.onClick(); tree = multiCascade(multiProps());
assert.deepEqual([...selectedProducts], ['p1']);
button(tree, '玩具').props.onClick(); tree = multiCascade(multiProps());
button(tree, '积木').props.onClick(); tree = multiCascade(multiProps());
assert.deepEqual([...selectedProducts], ['p1', 'p2'], '跨分类保留已选商品');
button(tree, '全部').props.onClick(); tree = multiCascade(multiProps());
assert.equal(button(tree, '全部商品').props['aria-checked'], true);
button(tree, '全部商品').props.onClick(); tree = multiCascade(multiProps());
assert.equal(selectedProducts.size, 0, '再次点击全部商品取消全选');
button(tree, '全部商品').props.onClick(); tree = multiCascade(multiProps());
assert.equal(selectedProducts.size, 2);

const classPicker = await harness('../../components/ui/MobileClassCascadePicker.tsx', 'MobileClassCascadePicker', { Check: 'Icon', Minus: 'Icon', inferEducationStage: () => 'primary' });
let pickedGrade, pickedClass, browsed;
const classPickerProps = { selectionMode: 'multiple', groups: [{ gradeLabel: '', displayLabel: '全部', classes: [] }, { gradeLabel: '一年级', classes: [props.classes[0]] }, { gradeLabel: '二年级', classes: props.classes.slice(1) }],
  activeGrade: '二年级', selectedClassIds: new Set(['c2']), onActiveGradeChange: grade => { browsed = grade; }, onToggleGrade: ids => { pickedGrade = ids; }, onToggleClass: id => { pickedClass = id; } };
tree = classPicker(classPickerProps);
button(tree, '全部').props.onClick();
assert.equal(browsed, '');
assert.equal(button(tree, '全选').props['aria-checked'], 'mixed');
button(tree, '全选').props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(pickedGrade)), ['c2', 'c3']);
button(tree, '取消选择2班').props.onClick();
assert.equal(pickedClass, 'c2');
assert.equal(button(tree, '选择1班'), undefined, '已有班级选择器仅展示当前年级');
tree = classPicker({ ...classPickerProps, selectedClassIds: new Set(['c2', 'c3']) });
assert.equal(button(tree, '全选').props['aria-checked'], true);
let toggledAll = false;
tree = classPicker({ ...classPickerProps, activeGrade: '', showAllClassesOption: true, allClassesGroupValue: '', allClassesMixed: true,
  onToggleAllClasses: () => { toggledAll = true; } });
assert.equal(button(tree, '全部班级').props['aria-checked'], 'mixed');
assert.equal(button(tree, '全选'), undefined, '全部分组不展示年级全选');
assert.equal(walk(tree).some(node => node.props?.children === '暂无可选班级'), false, '全部分组展示选项而非空态');
button(tree, '全部班级').props.onClick();
assert.equal(toggledAll, true);
console.log('筛选交互通过：单弹窗切页、浏览不回填、范围选择、返回草稿、统一应用、重新打开及重置。');
