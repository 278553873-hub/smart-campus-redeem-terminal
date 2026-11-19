import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { transform } from 'esbuild';

// 执行实际组件和计时逻辑，以虚拟时钟检查交互，不启动浏览器。
let now = 0, cursor = 0, dirty = false, effects = [], tree;
const slots = [], timers = new Map();
let timerId = 0;
const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
const useState = initial => {
  const index = cursor++;
  if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
  return [slots[index], next => {
    const value = typeof next === 'function' ? next(slots[index]) : next;
    if (!Object.is(value, slots[index])) { slots[index] = value; dirty = true; }
  }];
};
const useRef = initial => { const index = cursor++; return slots[index] ?? (slots[index] = { current: initial }); };
const useMemo = (fn, deps) => {
  const index = cursor++;
  if (!same(slots[index]?.deps, deps)) slots[index] = { deps, value: fn() };
  return slots[index].value;
};
const useCallback = (fn, deps) => useMemo(() => fn, deps);
const useEffect = (fn, deps) => {
  const index = cursor++;
  if (!same(slots[index]?.deps, deps)) effects.push(() => { slots[index]?.cleanup?.(); slots[index] = { deps, cleanup: fn() }; });
};
const React = { memo: fn => fn, createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) };
const paths = [['崇德', '二级', '三级'], ['求知', '二级', '三级']];
const context = vm.createContext({
  React, useState, useRef, useMemo, useCallback, useEffect, useLayoutEffect: useEffect,
  Date: { now: () => now }, Math, Map, Set, Object, Number, Infinity,
  classReportIndicatorDemoPaths: paths,
  StudentGrowthBoards: 'boards', StudentGrowthAccountDialog: 'account', Button: 'button', GrowthGradeSelect: 'grade-select',
  defaultGrowthBoardSelection: () => ({studentMetric:'total',classMetric:'total',praiseMetric:'total',gradeMetric:'total',averageClassMetric:'total'}),
  Users: 'users', BookOpen: 'book', Award: 'award', ScanLine: 'scan',
  formatGrowthNumber: value => value.toLocaleString('zh-CN'),
  window: {
    setTimeout: (fn, duration) => { const id = ++timerId; timers.set(id, { fn, due: now + duration }); return id; },
    clearTimeout: id => timers.delete(id),
  },
});
for (const file of ['studentGrowthModel.ts', 'studentGrowthRankingModel.ts', 'useStudentGrowthInteraction.ts', 'useStudentGrowthPlayback.ts', 'StudentGrowthScreen.tsx']) {
  const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace(/^export \{.*\} from .*;\n/gm, '').replaceAll('export default ', '').replaceAll('export ', '');
  vm.runInContext((await transform(source, { loader: 'tsx', jsx: 'transform' })).code, context);
}
vm.runInContext('globalThis.renderContent=StudentGrowthContent;globalThis.BoardsComponent=StudentGrowthBoards;globalThis.snapshotFrom=selectGrowthSnapshot;globalThis.rank=selectGrowthRanking;', context);
const students = [
  ...Array.from({ length: 12 }, (_, index) => ({ id: 'g1-' + index, displayName: '一*' + index, gradeId: 'g1', gradeName: '一年级', className: '1班' })),
  ...Array.from({ length: 4 }, (_, index) => ({ id: 'g2-' + index, displayName: '二*' + index, gradeId: 'g2', gradeName: '二年级', className: '2班' })),
];
const record = (id, delta, path = paths[0]) => ({ id: id + ':' + delta, studentId: id, delta, indicatorPath: path, timestamp: 500 });
const snapshot = context.snapshotFrom({ schoolName: '测试学校', generatedAt: 1000, term: { start: 0, end: 1000 }, indicatorPaths: paths, students, records: [
  ...students.slice(0, 12).map((student, index) => record(student.id, 100 + index)),
  record('g2-0', 3), record('g2-0', -4, paths[1]), record('g2-1', 2), record('g2-2', -1),
] });
let visible = true, reducedMotion = false, cycleKey = 0, completed = 0;
const complete = () => { completed++; visible = false; };
const render = () => {
  let attempts = 0;
  do {
    assert.ok(attempts++ < 20, '组件状态应收敛');
    dirty = false; cursor = 0; effects = [];
    tree = context.renderContent({ snapshot, visible, reducedMotion, cycleKey, onCycleComplete: complete });
    effects.forEach(fn => fn());
  } while (dirty);
};
const advance = duration => {
  const end = now + duration;
  while (true) {
    const next = [...timers.entries()].filter(([, timer]) => timer.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
    if (!next) break;
    now = next[1].due; timers.delete(next[0]); next[1].fn(); render();
  }
  now = end;
};
const nodes = value => Array.isArray(value) ? value.flatMap(nodes) : value && typeof value === 'object' ? [value, ...nodes(value.props?.children)] : [];
const find = predicate => nodes(tree).find(predicate);
const boards = () => find(node => node.type === context.BoardsComponent);
const account = () => find(node => node.type === 'account');
const gradeSelect = () => find(node => node.type === 'grade-select');
const touch = () => { tree.props.onPointerDownCapture(); render(); tree.props.onPointerUpCapture(); render(); };
const choose = patch => { touch(); boards().props.onChange(patch); render(); };
const chooseGrade = gradeId => { touch(); gradeSelect().props.onChange(gradeId); render(); };
const openAccount = () => { tree.props.onClickCapture(); find(node=>node.props.className==='student-growth-my-entry').props.onClick(); render(); };

render();
assert.equal(boards().props.selection.gradeId, undefined);
assert.equal(timers.size, 1);
advance(10_000);
chooseGrade('g2');
assert.equal(gradeSelect().props.value,'g2','页面级年级控件与统一状态同步');
choose({studentMetric:'求知',classMetric:'崇德'});
assert.equal(boards().props.selection.gradeId,'g2');
assert.equal(boards().props.selection.studentMetric,'求知');
choose({praiseMetric:'求知'});
assert.equal(boards().props.selection.gradeId,'g2','卡片指标切换保留全局年级');
assert.equal(boards().props.selection.studentMetric,'求知');
assert.equal(boards().props.selection.classMetric,'崇德');
assert.equal(boards().props.selection.praiseMetric,'求知');
const selectedGradeKey=gradeSelect().props.key;
openAccount(); assert.ok(account());
account().props.onClose(); render();
assert.equal(account(),undefined);
assert.equal(boards().props.selection.gradeId,'g2','退出登录入口保留公开卡片筛选');
advance(60_000); assert.equal(completed,0);
tree.props.onScrollCapture(); render(); advance(30_000);
assert.equal(boards().props.selection.gradeId,'g2','滚动延长闲置期限');
openAccount();
advance(89_999); assert.ok(account()); assert.equal(completed,0);
advance(1);
assert.equal(account(),undefined,'90秒闲置关闭私人界面并清理会话');
assert.equal(boards().props.selection.gradeId,undefined);
assert.equal(gradeSelect().props.value,undefined);
assert.notEqual(gradeSelect().props.key,selectedGradeKey,'闲置复位时重建全局下拉，清理打开状态');
assert.equal(boards().props.selection.studentMetric,'total');
advance(59_999); assert.equal(completed,0);
advance(1); assert.equal(completed,1,'复位后再完整展示60秒恢复轮播');
visible=true; cycleKey++; render();
chooseGrade('g2'); advance(40_000);
visible=false; render(); assert.equal(timers.size,0);
advance(600_000); assert.equal(completed,1);
visible=true; render(); advance(49_999);
assert.equal(boards().props.selection.gradeId,'g2');
advance(1); assert.equal(boards().props.selection.gradeId,undefined);
chooseGrade('g2'); openAccount();
cycleKey++; render();
assert.equal(boards().props.selection.gradeId,undefined);
assert.equal(account(),undefined,'重新进入不残留私人会话');
reducedMotion=true; render(); assert.equal(timers.size,0);
chooseGrade('g2'); advance(90_000);
assert.equal(boards().props.selection.gradeId,undefined);
advance(120_000); assert.equal(completed,1);
for(const slot of slots) slot?.cleanup?.();
assert.equal(timers.size,0);
console.log('触屏交互检查通过：全局年级、独立指标、登录入口、90秒清理、滚动续时、60秒恢复、隐藏暂停及重新进入清理。');
