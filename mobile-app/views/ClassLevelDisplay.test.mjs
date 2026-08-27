import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = relativePath => fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const typesSource = read('../types.ts');
const classInfoSource = read('./ClassInfoView.tsx');
const classDetailSource = read('./ClassDetailView.tsx');
const rosterCardSource = read('../components/student/StudentRosterCard.tsx');
const appSource = read('../App.tsx');

assert.match(typesSource, /StudentLevelDisplayMode = 'term' \| 'cumulative'/, '等级展示方式应使用明确的班级配置类型。');
assert.match(typesSource, /studentLevelDisplayMode\?: StudentLevelDisplayMode/, '等级展示方式应保存到班级信息。');
assert.doesNotMatch(classInfoSource, /等级展示规则/, '班级详情不应继续承载等级展示规则。');
assert.match(classDetailSource, /canConfigureLevelDisplay: boolean/, '等级展示规则应保留独立的班主任权限。');
assert.match(classDetailSource, /studentCardDisplaySettings\.showLevel && canConfigureLevelDisplay/, '只有显示等级开启且具备权限时才应渐进展示规则。');
assert.match(classDetailSource, /label: '仅计算本学期'/, '当前学期选项应使用明确的数据范围文案。');
assert.match(classDetailSource, /label: '累计所有学期'/, '累计选项应使用明确的数据范围文案。');
assert.match(classDetailSource, /<CompactSegmentedControl[\s\S]*items=\{LEVEL_DISPLAY_OPTIONS\}[\s\S]*onChange=\{onUpdateStudentLevelDisplayMode\}[\s\S]*ariaLabel="等级展示规则"[\s\S]*fullWidth[\s\S]*semantics="group"/, '等级展示方式应复用设计系统紧凑分段控件。');
assert.doesNotMatch(classDetailSource, /role="radiogroup" aria-label="等级展示规则"/, '业务页面不得自行拼装等级展示规则切换控件。');
assert.match(rosterCardSource, /levelNetScore \?\? performance\.netScore/, '等级图标和进度环应使用独立的展示分值。');
assert.match(rosterCardSource, /等级分值\$\{levelNetScore \?\? performance\.netScore\}分/, '学生卡片读屏名称应与等级展示分值保持一致。');
assert.match(rosterCardSource, /<StudentPerformanceCounts[\s\S]*summary=\{performance\}/, '表扬和批评次数应保持原有统计口径。');
assert.match(appSource, /canConfigureLevelDisplay=\{selectedClassRole === 'headTeacher'\}/, '只有班主任可以修改等级展示规则。');
assert.match(appSource, /studentLevelDisplayMode: mode/, '等级展示方式应回写当前班级数据。');
assert.match(appSource, /studentLevelDisplayMode \?\? 'term'/, '未配置的班级应默认使用学期等级。');
assert.match(appSource, /CURRENT_PRINCIPAL_TERM/, '学期等级应使用学校当前学期边界。');
assert.match(appSource, /getMergedStudentsForClass\(selectedClassId\)\.map\(student =>/, '等级分值映射应覆盖当前班级的全部模拟学生。');
assert.match(appSource, /confirmedRecords\?\.length[\s\S]*createDemoStudentLevelEvaluationRecords\(student, CURRENT_PRINCIPAL_TERM\)/, '没有真实评价记录时应使用跨学期模拟记录。');
assert.match(appSource, /getStudentLevelNetScore\([\s\S]*levelRecords[\s\S]*studentLevelDisplayMode \?\? 'term'/, '真实记录与模拟记录应复用同一等级范围计算。');

console.log('班级等级展示方式配置校验通过。');
