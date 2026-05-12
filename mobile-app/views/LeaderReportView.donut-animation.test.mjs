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
  'const chartItems = useMemo(() =>',
  'chart.setOption(option, false)',
  'useAnimatedNumber(totalEvents, 650, animationKey)',
  'displayedTotalEvents',
  '<AnimatedNumber value={item.value} replayKey={`${animationKey}-${item.key}`} />',
  'animationKey={`${reportAnimationKey}-event-donut-${eventDistributionMetric}`}',
]) {
  if (!source.includes(required) && !donutSource.includes(required)) {
    throw new Error(`五育事件分布图中心和下方维度数字都需要动态变化，缺少：${required}`);
  }
}

if (donutSource.includes('const chartItems = data.map')) {
  throw new Error('五育事件分布图数字递增会触发重渲染，环形数据必须 useMemo 稳定，避免环形在数字结束后才变化');
}

if (!donutSource.includes('}, [animationKey, chartItems, chartReady,')) {
  throw new Error('五育事件分布图首次加载时，图表实例就绪后必须重新触发 setOption 绘制环形');
}
