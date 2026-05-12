import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');
const start = source.indexOf('const IndicatorUsageSummaryCard');
const end = source.indexOf('const IndicatorUsageSheet', start);
if (start < 0 || end < 0) throw new Error('找不到 IndicatorUsageSummaryCard 源码片段');
const indicatorSource = source.slice(start, end);

for (const required of [
  'IndicatorCoverageChartRow',
  'coverageItems',
  'style={{ width: `${item.coverageRate}%` }}',
  'aria-label={`${item.label}${item.coverageRate}%`}',
  '<span className="text-2xl font-bold',
  '未覆盖 {item.uncovered}',
]) {
  if (!indicatorSource.includes(required)) {
    throw new Error(`指标使用情况需要改为图表化覆盖率展示，缺少：${required}`);
  }
}

for (const forbidden of [
  'grid grid-cols-2 gap-3',
  'text-3xl font-black',
]) {
  if (indicatorSource.includes(forbidden)) {
    throw new Error(`指标使用情况不应继续使用纯数字双卡片展示：${forbidden}`);
  }
}
