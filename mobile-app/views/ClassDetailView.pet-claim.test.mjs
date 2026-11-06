import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
// 不启动浏览器：保留真实事件处理函数及数据层，仅用轻量状态容器驱动组件。
let slots = [], cursor = 0;
globalThis.__petClaimTestHooks = {
  useState(initial) {
    const index = cursor++;
    if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
    return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
  },
  useMemo: fn => fn(), useEffect: () => {},
};
const result = await build({
  stdin: { resolveDir: process.cwd(), contents: `export { default as View } from './mobile-app/views/ClassDetailView'; export * from './shared/classPetRoster'; export * from './shared/classPetSettings';` },
  bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic',
  loader: { '.png': 'dataurl', '.svg': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl', '.css': 'empty' },
  plugins: [{ name: 'component-hook-driver', setup(builder) {
    builder.onLoad({ filter: /ClassDetailView\.tsx$/ }, ({ path }) => ({ loader: 'tsx', contents: readFileSync(path, 'utf8')
      .replace("import React, { useEffect, useMemo, useState } from 'react';", "import React from 'react'; const { useEffect, useMemo, useState } = globalThis.__petClaimTestHooks;")
      .replace('    const studentCardDisplaySettings =', '    globalThis.__petClaimTestActions = { changeStudentView };\n    const studentCardDisplaySettings =') }));
  } }],
});
const api = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
let failStorage = false;
const values = new Map();
globalThis.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => { if (failStorage) throw new Error('无法保存领取结果，请重试'); values.set(key, value); } }, dispatchEvent: () => {} };
api.writeSchoolClassPetSettings('school', { enabled: true, claimMethod: 'teacher', deductExperience: false, levelPoints: api.DEFAULT_PET_LEVEL_POINTS });
const noop = () => {};
const props = { schoolId: 'school', classInfo: { id: 'class', name: '1班' }, students: [{ id: 'a', name: '小明', studentNo: '01', gender: 'male' }, { id: 'b', name: '小红', studentNo: '02', gender: 'female' }], currentTeacherName: '任课教师', isSelectionMode: false, selectedIds: new Set(), canConfigureCardDisplay: false, canResetStudentEvaluationCounts: false, canAddStudent: false, onSelectStudent: noop, onToggleSelectionMode: noop, onSelectionChange: noop, onAddStudent: noop, onUpdateStudentCardDisplaySettings: noop, onUpdateGroupCardDisplaySettings: noop };
const find = (node, predicate) => {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) { for (const child of node) { const result = find(child, predicate); if (result) return result; } return null; }
  return predicate(node) ? node : find(node.props?.children, predicate);
};
const render = () => { cursor = 0; return api.View(props); };
const dialog = tree => find(tree, node => node.props?.confirmLabel === '领取初始蛋');
render(); globalThis.__petClaimTestActions.changeStudentView('pet');
let sheet = dialog(render());
assert.equal(sheet.props.open, true, '普通任课教师可以进入领取确认');
sheet.props.onClose();
assert.equal(api.readClassPetRoster('school', 'class'), null, '取消不能领取');
render(); globalThis.__petClaimTestActions.changeStudentView('pet');
sheet = dialog(render()); failStorage = true; sheet.props.onConfirm();
sheet = dialog(render());
assert.equal(sheet.props.open, true);
assert.match(sheet.props.errorMessage, /无法保存/, '领取失败应在弹窗内显示原因');
failStorage = false; sheet.props.onConfirm();
assert.equal(dialog(render()).props.open, false, '确认成功关闭弹窗');
assert.deepEqual(Object.keys(api.readClassPetRoster('school', 'class').students), ['a', 'b'], '无卡片配置权限的教师也能成功为全班领取');
console.log('手机端领取事件回归通过：任课教师确认、取消、失败反馈与重试');
