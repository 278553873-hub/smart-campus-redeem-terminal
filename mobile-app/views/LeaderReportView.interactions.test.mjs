import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');

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
const leaderView = slice('const LeaderReportView', 'export default LeaderReportView');

for (const required of [
  'isFilterPinned',
  'handleReportScroll',
  'onScroll={handleReportScroll}',
  'overflow-y-auto px-4 pb-8 pt-0',
  'sticky top-0 z-50',
  '紧凑筛选',
  '完整筛选',
  'rounded-3xl bg-white p-1.5',
  'rounded-[22px] bg-white p-2',
  'border-transparent bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-pressed)]',
  'border-transparent bg-[var(--tm-brand-primary)] text-white shadow-sm',
  'pointer-events-none absolute inset-x-0 top-0',
  'h-[108px] bg-white',
  'bg-white px-4 pb-2 pt-3',
  'rounded-b-none border-b border-[var(--tm-border-subtle)]',
  'flex flex-col gap-1.5',
  'grid h-12 grid-cols-2 rounded-[22px] bg-[var(--tm-brand-primary-soft)] p-1',
  'grid h-9 min-w-0 grid-cols-4 gap-1 rounded-[18px] bg-white p-0.5',
  'text-[var(--tm-brand-primary-pressed)] active:bg-white/80',
  '教师使用',
  '事件分布',
  'text-[14px] font-semibold',
  "isFilterPinned ? 'pointer-events-none",
  "isFilterPinned ? 'opacity-100",
  'shadow-[0_18px_42px_-30px_var(--tm-shadow-neutral)]',
  'transition-all duration-300 ease-out',
]) {
  if (!leaderView.includes(required)) {
    throw new Error(`学校数据报表顶部筛选需要滑动吸顶和微动画，缺少：${required}`);
  }
}

if (leaderView.includes('bg-emerald') || leaderView.includes('text-emerald')) {
  throw new Error('吸顶紧凑态教师/事件筛选不应残留旧绿色，应统一使用品牌红 Token');
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
  'backgroundColor: teacherBrandSemantic.chartTooltip',
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
