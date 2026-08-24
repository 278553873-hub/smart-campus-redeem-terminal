import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = relativePath => fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const typesSource = read('../types.ts');
const classInfoSource = read('./ClassInfoView.tsx');
const classDetailSource = read('./ClassDetailView.tsx');
const appSource = read('../App.tsx');

assert.match(typesSource, /StudentLevelDisplayMode = 'term' \| 'cumulative'/, '等级展示方式应使用明确的班级配置类型。');
assert.match(typesSource, /studentLevelDisplayMode\?: StudentLevelDisplayMode/, '等级展示方式应保存到班级信息。');
assert.match(classInfoSource, /canConfigureLevelDisplay = effectiveRole === 'headTeacher'/, '只有班主任可以修改等级展示方式。');
assert.match(classInfoSource, /title="等级展示规则"/, '等级展示规则应通过底部弹窗渐进披露。');
assert.match(classInfoSource, /label: '仅计算本学期'/, '当前学期选项应使用明确的数据范围文案。');
assert.match(classInfoSource, /label: '累计所有学期'/, '累计选项应使用明确的数据范围文案。');
assert.match(classDetailSource, /levelNetScore \?\? performance\.netScore/, '等级图标和进度环应使用独立的展示分值。');
assert.match(classDetailSource, /等级分值\$\{levelNetScore \?\? performance\.netScore\}分/, '学生卡片读屏名称应与等级展示分值保持一致。');
assert.match(classDetailSource, /<StudentPerformanceCounts[\s\S]*summary=\{performance\}/, '表扬和批评次数应保持原有统计口径。');
assert.match(appSource, /studentLevelDisplayMode \?\? 'term'/, '未配置的班级应默认使用学期等级。');
assert.match(appSource, /CURRENT_PRINCIPAL_TERM/, '学期等级应使用学校当前学期边界。');

console.log('班级等级展示方式配置校验通过。');
