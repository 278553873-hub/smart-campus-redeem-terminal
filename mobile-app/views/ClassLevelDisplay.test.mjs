import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = relativePath => fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const typesSource = read('../types.ts');
const classInfoSource = read('./ClassInfoView.tsx');
const classDetailSource = read('./ClassDetailView.tsx');
const levelSettingsSource = read('../components/student-performance/CardLevelDisplaySettings.tsx');
const rosterCardSource = read('../components/student/StudentRosterCard.tsx');
const metaSource = read('../components/student-performance/StudentPerformanceMeta.tsx');
const appSource = read('../App.tsx');

assert.match(typesSource, /StudentLevelForm = 'icon' \| 'score'/, '等级展示形式应使用图标与分值互斥的明确类型。');
assert.match(typesSource, /levelForm: StudentLevelForm/, '等级展示形式应保存到学生卡片设置。');
assert.doesNotMatch(typesSource, /studentLevelDisplayMode\?: StudentLevelDisplayMode/, '班级信息不应再保存统计范围。');
assert.doesNotMatch(classInfoSource, /等级展示规则/, '班级详情不应承载等级展示规则。');
assert.doesNotMatch(classDetailSource, /canConfigureLevelDisplay|onUpdateStudentLevelDisplayMode|LEVEL_DISPLAY_OPTIONS/, '班级详情不应再保留统计范围入口与权限分支。');
assert.doesNotMatch(classDetailSource, /统计范围|历史累计/, '等级设置不应再提供统计范围选项。');
assert.match(classDetailSource, /<CardLevelDisplaySettings[\s\S]*levelForm=\{studentCardDisplaySettings\.levelForm\}/, '等级展示形式应通过公共设置组件读写。');
assert.match(levelSettingsSource, /label="显示等级"[\s\S]*showLevel && \([\s\S]*等级形式/, '显示等级开启后才应渐进展示等级形式。');
assert.match(levelSettingsSource, /value: 'icon', label: '图标'[\s\S]*value: 'score', label: '分值'/, '等级形式应为图标与分值二选一。');
assert.match(rosterCardSource, /levelNetScore \?\? performance\.netScore/, '等级图标与等级分值应使用同一展示分值。');
assert.match(rosterCardSource, /等级分值\$\{shownLevelNetScore\}分/, '学生卡片读屏名称应与等级展示分值保持一致。');
assert.match(rosterCardSource, /displaySettings\.levelForm === 'icon'/, '图标形式应展示星级图标并保留头像进度环。');
assert.match(rosterCardSource, /displaySettings\.levelForm === 'score'/, '分值形式应展示净得分。');
assert.match(rosterCardSource, /<StudentPerformanceValues[\s\S]*summary=\{performance\}/, '加扣分数据应使用共享卡片数值组件。');
assert.match(metaSource, /formatScore\(normalizedScore\)/, '等级分值应复用统一的分值格式。');
assert.match(appSource, /getStudentLevelNetScore\([\s\S]*'term'[\s\S]*CURRENT_PRINCIPAL_TERM/, '等级分值应固定按学校当前学期边界计算。');
assert.match(appSource, /getMergedStudentsForClass\(selectedClassId\)\.map\(student =>/, '等级分值映射应覆盖当前班级的全部模拟学生。');
assert.match(appSource, /confirmedRecords\?\.length[\s\S]*createDemoStudentLevelEvaluationRecords\(student, CURRENT_PRINCIPAL_TERM\)/, '没有真实评价记录时应使用模拟记录。');
assert.doesNotMatch(appSource, /studentLevelDisplayMode: mode/, '应用层不应再回写统计范围配置。');

console.log('班级等级展示形式配置校验通过。');

