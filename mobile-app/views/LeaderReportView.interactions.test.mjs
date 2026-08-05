import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const slice = (startMarker, endMarker) => {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + 1);
  if (start < 0 || end < 0) throw new Error(`找不到源码片段：${startMarker} -> ${endMarker}`);
  return source.slice(start, end);
};

const gradeChart = slice('const GradeCoverageChart', 'const ClassCoverageRow');
const classChart = slice('const ClassCoverageChart', 'const LeaderReportView');
const fiveBar = slice('const FiveEducationBarChart', 'const FiveEducationDonutChart');
const donut = slice('const FiveEducationDonutChart', 'const IndicatorUsageSummaryCard');
const teacherRows = slice('const TeacherUsageRankingHeader', 'const scoreSortTabs');
const fullScoreSheet = source.slice(source.indexOf('教师赋分完整榜单'), source.indexOf('{showIndicatorUsageSheet'));
const fullTeacherSheet = source.slice(source.indexOf('教师使用完整榜单'), source.indexOf('export default'));
const reportTypeTabs = slice('const ReportTypeTabs', 'const useAnimatedNumber');
const leaderView = slice('const LeaderReportView', 'export default LeaderReportView');

if ((source.match(/label: '总分'/g) ?? []).length < 1 || !source.includes("net: '总分'")) {
  throw new Error('学校数据报表的净得分展示文案必须统一为「总分」');
}
if (source.includes("label: '净得分'") || source.includes("net: '净得分'") || source.includes('净赋分')) {
  throw new Error('学校数据报表不应继续向教师展示「净得分」或「净赋分」');
}

for (const required of [
  'role="tablist"',
  'aria-label="学校报表类型"',
  'role="tab"',
  'aria-selected={selected}',
  'h-[var(--tm-report-filter-row-height)]',
  'text-[length:var(--tm-report-type-font-size)]',
  'h-[var(--tm-report-date-indicator-height)]',
  'w-[var(--tm-report-date-indicator-width)]',
  "? 'font-semibold text-[var(--tm-brand-primary)]'",
  "'font-medium text-[var(--tm-text-secondary)]'",
  'selected && (',
]) {
  if (!reportTypeTabs.includes(required)) {
    throw new Error(`学校数据报表类型需要使用班级报告同款开放式页签，缺少：${required}`);
  }
}

for (const forbidden of ['transition-', 'active:scale', 'compact', 'interactive']) {
  if (reportTypeTabs.includes(forbidden)) {
    throw new Error(`学校数据报表类型页签应直接切换数据，不保留微交互或双状态结构：${forbidden}`);
  }
}
if (reportTypeTabs.includes('border-b') || reportTypeTabs.includes('border-[var(--tm-border-subtle)]')) {
  throw new Error('学校数据报表类型切换与时间切换之间不应保留分割线');
}

for (const required of [
  'relative min-h-0 flex-1 overflow-y-auto pb-8 no-scrollbar',
  'px-[var(--tm-report-page-inline)]',
  'space-y-[var(--tm-report-card-gap)]',
  '<ReportTypeTabs value={activeReportTab} onChange={setActiveReportTab} />',
  'sticky -top-px z-30 -mt-px bg-[var(--tm-page-plain-header-bg)]',
  'grid h-[var(--tm-report-filter-row-height)] grid-cols-5',
  'aria-label="学校报表时间范围"',
  'aria-pressed={activePeriod === period.key}',
  'h-[var(--tm-report-period-pill-height)]',
  'px-[var(--tm-report-period-pill-inline)]',
  'text-[length:var(--tm-report-period-font-size)]',
  'bg-[var(--tm-brand-primary)] font-semibold text-[var(--tm-text-inverse)]',
  'font-medium text-[var(--tm-text-secondary)]',
  'activePeriod === \'custom\' && confirmedDateRange',
  '教师使用',
  '事件分布',
]) {
  if (!leaderView.includes(required)) {
    throw new Error(`学校数据报表顶部筛选需要使用单层静态结构并复用班级报告间距，缺少：${required}`);
  }
}

if ((leaderView.match(/<ReportTypeTabs/g) ?? []).length !== 1) {
  throw new Error('学校数据报表只应渲染一套报表类型页签');
}

for (const forbidden of ['isFilterPinned', 'handleReportScroll', '紧凑筛选', '完整筛选', 'blur-[2px]']) {
  if (leaderView.includes(forbidden)) {
    throw new Error(`学校数据报表顶部不应保留滚动变形或双层筛选：${forbidden}`);
  }
}
if ((source.match(/h-\[var\(--tm-report-filter-row-height\)\]/g) ?? []).length < 2) {
  throw new Error('报表类型与时间筛选必须使用同一个行高 Token');
}
if ((source.match(/h-\[var\(--tm-report-period-pill-height\)\]/g) ?? []).length < 2) {
  throw new Error('预设周期与自定义周期必须复用紧凑选中色块高度 Token');
}
if (!leaderView.includes('relative flex h-full min-h-0 flex-col overflow-hidden')) {
  throw new Error('学校数据报表根容器必须锁定为单一内部滚动层，避免标题栏与吸顶筛选之间穿模');
}
if (!leaderView.includes('relative z-40 flex h-11 shrink-0 items-center') || leaderView.includes('relative z-40 flex h-[44px] shrink-0 items-center justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-page-plain-header-bg)] px-4 py-2')) {
  throw new Error('学校数据报表标题栏必须使用完整 44 像素盒模型，不得通过上下内边距撑破高度');
}
const scrollHandledViews = appSource.match(/const viewHandlesScroll = \[([^\]]+)\]/)?.[1] ?? '';
if (!scrollHandledViews.includes("'leader_report'")) {
  throw new Error('学校数据报表必须由页面内部管理滚动，禁止与 App 外层形成双滚动穿模');
}

for (const chart of [gradeChart, classChart]) {
  if (chart.includes('showBackground: true') || chart.includes('backgroundStyle')) {
    throw new Error('年级/班级覆盖率柱状图不应保留 100% 背景条');
  }
}

for (const forbidden of [
  'const selectedDataIndex = Math.max(0',
  'alwaysShowContent: tooltipEnabled',
  'opacity: selectedGradeId ? (selected ? 1 : 0.38) : 0.96',
]) {
  if (gradeChart.includes(forbidden)) {
    throw new Error(`年级覆盖率不应默认呈现第一个柱子的选中/点击效果：${forbidden}`);
  }
}

for (const forbidden of [
  'alwaysShowContent: true',
  'defaultClassDataIndex',
]) {
  if (classChart.includes(forbidden)) {
    throw new Error(`班级覆盖率不应默认呈现第一个柱子的选中/点击效果：${forbidden}`);
  }
}

for (const required of [
  'const ClassCoverageChart = ({ classes, animationKey }',
  'animationKey={`${selectedGrade.id}-${selectedGrade.covered}/${selectedGrade.total}`}',
  'setSelectedGradeId(grade.id)',
  'setShowClassCoverageSheet(true)',
]) {
  if (!source.includes(required)) throw new Error(`班级覆盖率弹窗切换年级需要从 0 重放动画，缺少：${required}`);
}

for (const forbidden of [
  "axisLine: { lineStyle: { color: '#6b7280' } }",
  'axisTick: { show: true',
]) {
  if (fiveBar.includes(forbidden)) throw new Error(`五育得分对比图底部不应有多余轴线/刻度导致抖动或多线：${forbidden}`);
}
for (const required of [
  'grid: { left: 34, right: 10, top: 36, bottom: 36, containLabel: false }',
  "position: 'bottom'",
  'axisLine: { show: false, onZero: false }',
  'axisTick: { show: false }',
  'hideOverlap: false',
]) {
  if (!fiveBar.includes(required)) throw new Error(`五育得分对比图需要稳定底部空间并移除多余线条，缺少：${required}`);
}

for (const required of [
  'selectedDonutKey',
  'setSelectedDonutKey(item.key)',
  'showDonutTip',
  '占比',
  "triggerOn: 'click'",
  'backgroundColor: teacherReportChartSemantic.tooltip',
  "chart.dispatchAction({ type: 'showTip'",
  'aria-label={`查看${item.name}事件占比`}',
]) {
  if (!donut.includes(required)) throw new Error(`五育事件分布图需要点击维度展示次数和占比，缺少：${required}`);
}
if (donut.includes('{selectedDonutItem && (')) {
  throw new Error('五育事件分布图不应在图表下方追加说明条，应在主环图表内显示黑色浮层');
}

for (const required of ['>加分</span>', '>减分</span>']) {
  if (!fullScoreSheet.includes(required)) throw new Error(`教师赋分完整榜单表头文案需要和外部一致，缺少：${required}`);
}
if (fullScoreSheet.includes('累计加分') || fullScoreSheet.includes('累计减分')) {
  throw new Error('教师赋分完整榜单不应再显示“累计加分/累计减分”');
}

for (const required of [
  'TeacherRankBadge',
  'showAward={rankingTab === \'active\'}',
  'showAward={fullRankingType === \'active\'}',
]) {
  if (!source.includes(required)) throw new Error(`教师使用排行榜需要弱化排名并用前三图形标识，缺少：${required}`);
}
if (teacherRows.includes('>{rank}</span>') || fullTeacherSheet.includes('>{rank}</span>')) {
  throw new Error('教师使用排行榜积极使用 tab 不应显示排名数字');
}
