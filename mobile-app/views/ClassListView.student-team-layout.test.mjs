import assert from 'node:assert/strict';
import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const guidelinesSource = fs.readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');

assert.ok(
  classListSource.includes('共{visibleStudentTeams.length}个社团或团队'),
  '社团与团队数量应使用与班级页一致的“共x个”文案。',
);
assert.ok(
  classListSource.includes('block h-[18px] whitespace-nowrap pl-3 text-[12px] font-medium leading-[18px] tabular-nums text-[var(--tm-text-secondary)]'),
  '社团与团队数量应复用班级页的18像素统计行。',
);
assert.ok(
  classListSource.includes('rounded-[var(--tm-class-list-card-radius)] bg-[var(--tm-bg-surface)]'),
  '团队卡片应复用班级列表专用圆角。',
);
assert.ok(
  classListSource.includes('block truncate text-lg font-[550] text-[var(--tm-text-primary)]">{team.name}'),
  '团队名称应与班级名称使用相同字号和字重。',
);
assert.ok(
  classListSource.includes('text-[13px] font-[450] text-[var(--tm-text-secondary)]">{team.ownerName}负责'),
  '团队负责人和人数应与班级元信息使用相同字号和字重。',
);
assert.ok(
  classListSource.includes("activeListTab === 'team' && (\n                    <div className=\"space-y-[var(--tm-space-3)]\">"),
  '团队卡片列表应明确复用班级卡片列表间距。',
);
assert.ok(
  guidelinesSource.includes('第二层数量统计与班级页一致'),
  '教师手机端规范应记录团队数量统计层级。',
);

console.log('ClassListView student-team layout assertions passed');
