import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./StudentBatchEditView.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const guidelines = fs.readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');

assert.match(viewSource, /grid-cols-\[minmax\(72px,1fr\)_minmax\(76px,0\.72fr\)_92px\]/, '学生姓名、学号和性别应保持单行三列布局。');
assert.match(viewSource, /space-y-\[var\(--tm-space-3\)\]/, '学生条目应通过留白分隔。');
assert.match(viewSource, /--tm-compact-editor-row-bg/, '学生条目应使用紧凑行编辑器 Token。');
assert.match(viewSource, /--tm-compact-editor-control-border/, '紧凑输入框应使用浅边界 Token。');
assert.doesNotMatch(viewSource, /divide-y|col-span-2|--tm-input-border/, '批量编辑页不应回退为总卡片分割线、两行布局或深色输入边框。');
assert.doesNotMatch(viewSource, /classInfo\.name|drafts\.length\}人/, '批量编辑页不应重复展示已知班级信息。');

for (const token of [
  "'--tm-compact-editor-row-bg'",
  "'--tm-compact-editor-control-bg'",
  "'--tm-compact-editor-control-border'",
  "'--tm-compact-editor-selected-bg'",
  "'--tm-compact-editor-selected-text'",
]) {
  assert.match(tokenSource, new RegExp(token), `教师端 Token 缺少 ${token}。`);
}

assert.match(guidelines, /紧凑行编辑场景使用 `--tm-compact-editor-\*` 组件 Token/, '教师手机端规范应明确紧凑行编辑器规则。');

console.log('Student batch edit layout assertions passed');
