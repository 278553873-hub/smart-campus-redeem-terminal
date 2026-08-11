import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getMoralEducationCockpitSnapshot,
  getMoralEducationCockpitWeeks,
} from '../services/moralEducationCockpitService.ts';

const viewSource = fs.readFileSync(new URL('./MoralEducationCockpitView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const accessSource = fs.readFileSync(new URL('../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');
const chartSource = fs.readFileSync(new URL('../components/report/TeacherReportChart.tsx', import.meta.url), 'utf8');

for (const required of [
  "title: '德育驾驶舱'",
  "id: 'moralEducationCockpit'",
  'icon: Gauge',
  'onClick: onOpenMoralEducationCockpit',
  '<ToolGrid items={primaryTools} columns={4} />',
]) {
  assert.ok(meSource.includes(required), `管理工具应保持四列并提供德育驾驶舱入口，缺少：${required}`);
}

assert.ok(accessSource.includes("| 'moralEducationCockpit'"), '教师空间权限类型应包含德育驾驶舱。');
assert.ok(accessSource.includes("'schoolReport',\n    'moralEducationCockpit',"), '领导和管理员权限应默认包含德育驾驶舱。');

for (const required of [
  "import MoralEducationCockpitView from './views/MoralEducationCockpitView';",
  "'moral_education_cockpit'",
  "onOpenMoralEducationCockpit={() => navigateTo('moral_education_cockpit')}",
  "{currentView === 'moral_education_cockpit' && (",
  "enabledManagementTools: ['schoolReport', 'moralEducationCockpit', 'termReport'",
]) {
  assert.ok(appSource.includes(required), `应用路由应完整接入德育驾驶舱，缺少：${required}`);
}

const sectionTitles = ['数据概况', '班级排名', '指标得分', '扣分项目', '近周趋势'];
let previousIndex = -1;
for (const title of sectionTitles) {
  const currentIndex = viewSource.indexOf(`title="${title}"`);
  assert.ok(currentIndex > previousIndex, `驾驶舱板块应按评审顺序展示：${title}`);
  previousIndex = currentIndex;
}

for (const required of [
  'getMoralEducationCockpitWeeks',
  'TeacherReportLineChart',
  '<MobileBottomSheet',
  'getMoralEducationCockpitSnapshot({ weekId: selectedWeekId })',
  'title="选择考核周期"',
  'aria-label="上一考核周"',
  'aria-label="下一考核周"',
  'snapshot.summary.lowestScore',
  "setRankingGradeId(grade.id)",
]) {
  assert.ok(viewSource.includes(required), `驾驶舱应提供按周筛选和班级数据展示，缺少：${required}`);
}

assert.ok(!viewSource.includes('AI角标'), '德育驾驶舱不得展示人工智能角标。');
assert.ok(chartSource.includes('charts.LineChart'), '通用教师报告图表应注册折线图。');
assert.ok(chartSource.includes('export const TeacherReportLineChart'), '通用教师报告图表应导出折线图组件。');

const weeks = await getMoralEducationCockpitWeeks();
assert.ok(weeks.length >= 4, '驾驶舱应提供多个已有考核周供切换。');
assert.equal(weeks.every(week => !/第\d+周/.test(week.label) && !/第\d+周/.test(week.trendLabel)), true, '考核周期不得使用推算周次。');

const selectedWeek = weeks[weeks.length - 1];
const snapshot = await getMoralEducationCockpitSnapshot({ weekId: selectedWeek.id });
assert.equal(snapshot.week.id, selectedWeek.id, '驾驶舱应按所选考核周加载数据。');
assert.equal(snapshot.week.label, '2026.08.03 - 08.09', '顶部应展示明确的起止日期。');
assert.equal(snapshot.dimensions.length, 5, '驾驶舱应展示五个班级评价一级维度。');
assert.equal(snapshot.grades.length, 6, '完整排名应提供年级筛选数据。');
assert.equal(snapshot.grades.every(grade => grade.classes.length === 5), true, '每个年级应具备班级数据。');
assert.equal(snapshot.classRanking.length, 30, '驾驶舱应提供全部班级排名。');
assert.equal(snapshot.problems.length, 5, '首屏只展示前五项扣分项目。');
assert.equal(snapshot.summary.issueCount, snapshot.classRanking.reduce((sum, item) => sum + item.issueCount, 0), '问题记录数应与班级记录汇总一致。');
assert.equal(
  snapshot.summary.averageScore,
  Math.round((snapshot.classRanking.reduce((sum, classItem) => sum + classItem.score, 0) / snapshot.classRanking.length) * 10) / 10,
  '平均得分应由全部参与排名班级的最终得分计算。',
);
assert.equal(snapshot.classRanking.every((classItem, index) => classItem.rank === index + 1), true, '班级排名序号应连续。');
assert.equal(snapshot.summary.highestScore, snapshot.classRanking[0].score, '最高得分应来自班级最终得分。');
assert.equal(snapshot.summary.lowestScore, snapshot.classRanking[snapshot.classRanking.length - 1].score, '最低得分应来自班级最终得分。');
assert.equal(snapshot.trend[snapshot.trend.length - 1].label, selectedWeek.trendLabel, '趋势最后一个点应对应当前所选考核周。');
assert.equal(snapshot.problems.every(problem => Number.isInteger(problem.recordCount) && Number.isInteger(problem.affectedClassCount)), true, '扣分项目只汇总记录和班级。');

for (const unsupportedMetric of ['平均得分率', '检查完成率', '待整改', '风险事项', '整改与风险', '排名班级', '涉及学生']) {
  assert.equal(viewSource.includes(unsupportedMetric), false, `驾驶舱不应展示无数据来源的指标：${unsupportedMetric}`);
}

for (const unsupportedContent of ['本周考核', '年级排名', '高频问题', 'moralEducationCockpitPeriods', 'type="date"', '>自定义<']) {
  assert.equal(viewSource.includes(unsupportedContent), false, `驾驶舱不应保留旧的信息结构：${unsupportedContent}`);
}
assert.equal(/第\d+周/.test(viewSource), false, '驾驶舱页面不得显示推算的第X周。');

console.log('Moral education cockpit assertions passed');
