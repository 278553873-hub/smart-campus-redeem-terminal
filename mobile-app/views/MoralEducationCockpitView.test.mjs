import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getMoralEducationCockpitPeriods,
  getMoralEducationCockpitSnapshot,
  getMoralEducationCockpitWeeks,
} from '../services/moralEducationCockpitService.ts';

const viewSource = fs.readFileSync(new URL('./MoralEducationCockpitView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const accessSource = fs.readFileSync(new URL('../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');
const chartSource = fs.readFileSync(new URL('../components/report/TeacherReportChart.tsx', import.meta.url), 'utf8');

for (const required of [
  "title: '班级评价报表'",
  "id: 'moralEducationCockpit'",
  'imageSrc: ASSETS.MANAGEMENT.CLASS_EVALUATION_REPORT',
  "imageAlt: '班级评价报表图标'",
  'imageClassName: reportToolImageClass',
  'plainImage: true',
  'onClick: onOpenMoralEducationCockpit',
  '<ToolGrid items={primaryTools} columns={4} />',
]) {
  assert.ok(meSource.includes(required), `管理工具应保持四列并提供班级评价报表入口，缺少：${required}`);
}

assert.ok(accessSource.includes("| 'moralEducationCockpit'"), '教师空间权限类型应包含班级评价报表。');
assert.ok(accessSource.includes("'schoolReport',\n    'moralEducationCockpit',"), '领导和管理员权限应默认包含班级评价报表。');

for (const required of [
  "import MoralEducationCockpitView from './views/MoralEducationCockpitView';",
  "'moral_education_cockpit'",
  "onOpenMoralEducationCockpit={() => navigateTo('moral_education_cockpit')}",
  "{currentView === 'moral_education_cockpit' && (",
  "enabledManagementTools: ['schoolReport', 'moralEducationCockpit', 'termReport'",
]) {
  assert.ok(appSource.includes(required), `应用路由应完整接入班级评价报表，缺少：${required}`);
}

const sectionTitles = ['数据概况', '班级排名', '指标得分', '扣分维度', '扣分项目', '周期趋势'];
let previousIndex = -1;
for (const title of sectionTitles) {
  const currentIndex = viewSource.indexOf(`title="${title}"`);
  assert.ok(currentIndex > previousIndex, `驾驶舱板块应按评审顺序展示：${title}`);
  previousIndex = currentIndex;
}

for (const required of [
  'getMoralEducationCockpitPeriods',
  'TeacherReportBarChart',
  'TeacherReportDonutChart',
  'TeacherReportLineChart',
  '<MobileBottomSheet',
  "{ key: 'week', label: '按周' }",
  "{ key: 'month', label: '按月' }",
  "{ key: 'term', label: '按学期' }",
  'getMoralEducationCockpitSnapshot({ periodType, periodId: selectedPeriodId })',
  "var(--mini-program-capsule-right-inset, 0px)",
  '查看完整排名',
  'title="完整班级排名"',
  'snapshot.summary.lowestScore',
  'seriesName="扣分维度"',
  'valueSuffix="分"',
]) {
  assert.ok(viewSource.includes(required), `驾驶舱应提供多周期筛选、排名和图表展示，缺少：${required}`);
}

assert.ok(!viewSource.includes('AI角标'), '班级评价报表不得展示人工智能角标。');
assert.equal(viewSource.includes('<h1'), false, '顶部不应保留页面标题。');
assert.ok(chartSource.includes('charts.LineChart'), '通用教师报告图表应注册折线图。');
assert.ok(chartSource.includes('export const TeacherReportLineChart'), '通用教师报告图表应导出折线图组件。');
assert.ok(chartSource.includes('valueSuffix = \'条\''), '环图应保持默认条数单位，兼容既有报告。');
assert.ok(chartSource.includes('seriesName = \'五育事件\''), '环图应保持默认系列名称，兼容既有报告。');

const weeks = await getMoralEducationCockpitWeeks();
assert.ok(weeks.length >= 4, '驾驶舱应提供多个已有考核周供切换。');
assert.equal(weeks.every(week => !/第\d+周/.test(week.label) && !/第\d+周/.test(week.trendLabel)), true, '考核周期不得使用推算周次。');

const months = await getMoralEducationCockpitPeriods('month');
const terms = await getMoralEducationCockpitPeriods('term');
assert.ok(months.length >= 2, '驾驶舱应提供多个自然月供切换。');
assert.ok(terms.length >= 2, '驾驶舱应提供多个学期供切换。');
assert.equal(months.every(period => /^\d{4}年\d{1,2}月$/.test(period.label)), true, '按月应展示真实年月。');
assert.equal(terms.every(period => /学年(第一|第二)学期$/.test(period.label)), true, '按学期应展示明确学年和学期。');

const selectedWeek = weeks[weeks.length - 1];
const snapshot = await getMoralEducationCockpitSnapshot({ periodType: 'week', periodId: selectedWeek.id });
assert.equal(snapshot.period.id, selectedWeek.id, '驾驶舱应按所选考核周加载数据。');
assert.equal(snapshot.period.label, '2026.08.03 - 08.09', '按周应展示明确的起止日期。');
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
assert.equal(snapshot.grades.every(grade => grade.classes.every((classItem, index) => classItem.rank === index + 1)), true, '切换年级后应按年级内名次连续展示。');
assert.equal(snapshot.summary.highestScore, snapshot.classRanking[0].score, '最高得分应来自班级最终得分。');
assert.equal(snapshot.summary.lowestScore, snapshot.classRanking[snapshot.classRanking.length - 1].score, '最低得分应来自班级最终得分。');
assert.equal(snapshot.trend[snapshot.trend.length - 1].label, selectedWeek.trendLabel, '趋势最后一个点应对应当前所选考核周。');
assert.equal(snapshot.problems.every(problem => Number.isInteger(problem.recordCount) && Number.isInteger(problem.affectedClassCount)), true, '扣分项目只汇总记录和班级。');

const selectedTerm = terms[terms.length - 1];
const termSnapshot = await getMoralEducationCockpitSnapshot({ periodType: 'term', periodId: selectedTerm.id });
assert.equal(termSnapshot.period.id, selectedTerm.id, '驾驶舱应按所选学期加载数据。');
assert.ok(termSnapshot.summary.cumulativeDeduction > snapshot.summary.cumulativeDeduction, '学期累计扣分应汇总所含考核周。');
assert.equal(
  termSnapshot.summary.averageScore,
  Math.round((termSnapshot.classRanking.reduce((sum, classItem) => sum + classItem.score, 0) / termSnapshot.classRanking.length) * 10) / 10,
  '月度和学期平均得分仍应按班级最终平均得分计算。',
);

for (const unsupportedMetric of ['平均得分率', '检查完成率', '待整改', '风险事项', '整改与风险', '排名班级', '涉及学生']) {
  assert.equal(viewSource.includes(unsupportedMetric), false, `驾驶舱不应展示无数据来源的指标：${unsupportedMetric}`);
}

for (const unsupportedContent of ['本周考核', '年级排名', '高频问题', 'moralEducationCockpitPeriods', 'type="date"', '>自定义<']) {
  assert.equal(viewSource.includes(unsupportedContent), false, `驾驶舱不应保留旧的信息结构：${unsupportedContent}`);
}
assert.equal(/第\d+周/.test(viewSource), false, '驾驶舱页面不得显示推算的第X周。');

console.log('Moral education cockpit assertions passed');
