import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');
const donutStart = source.indexOf('const FiveEducationDonutChart');
const nextStart = source.indexOf('const IndicatorUsageSummaryCard');
const donutSource = source.slice(donutStart, nextStart);

for (const forbidden of [
  'buildZeroStartPieOption',
  'animatePieChartFromZero',
  'setPieChartOptionWithReplay',
]) {
  if (source.includes(forbidden)) {
    throw new Error(`五育事件分布图不应给环形添加从 0 开始的动画，需移除：${forbidden}`);
  }
}

for (const forbidden of [
  'lastAnimationKeyRef',
  'setPieChartOptionWithReplay(chart, option, animationKey, lastAnimationKeyRef)',
]) {
  if (donutSource.includes(forbidden)) {
    throw new Error(`五育事件分布图不应给环形添加从 0 开始的动画，需移除：${forbidden}`);
  }
}

for (const required of [
  'animationKey',
  'chart.setOption(option, true)',
  'useAnimatedNumber(totalEvents, 650, animationKey)',
  'displayedTotalEvents',
  '<AnimatedNumber value={item.value} replayKey={`${animationKey}-${item.key}`} />',
  'animationKey={`${reportAnimationKey}-event-donut-${eventDistributionMetric}`}',
]) {
  if (!source.includes(required) && !donutSource.includes(required)) {
    throw new Error(`五育事件分布图中心和下方维度数字都需要动态变化，缺少：${required}`);
  }
}
