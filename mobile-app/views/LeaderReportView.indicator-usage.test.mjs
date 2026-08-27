import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');
const start = source.indexOf('const IndicatorUsageSummaryCard');
const end = source.indexOf('const IndicatorUsageSheet', start);
if (start < 0 || end < 0) throw new Error('找不到 IndicatorUsageSummaryCard 源码片段');
const indicatorSource = source.slice(start, end);
const sheetStart = source.indexOf('const IndicatorUsageSheet');
const sheetEnd = source.indexOf('const GradeCoverageChart', sheetStart);
if (sheetStart < 0 || sheetEnd < 0) throw new Error('找不到 IndicatorUsageSheet 源码片段');
const sheetSource = source.slice(sheetStart, sheetEnd);

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

for (const required of [
  'className="space-y-3"',
  'className="space-y-2"',
  'rounded-xl bg-[var(--tm-bg-surface)]',
  'h-5 w-1 rounded-full',
]) {
  if (!sheetSource.includes(required)) {
    throw new Error(`指标使用明细需要通过分组标题和填充背景建立层级，缺少：${required}`);
  }
}

for (const forbidden of [
  'rounded-3xl bg-white p-2.5 shadow-sm ring-1',
  'rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1',
  'rounded-xl border border-[var(--tm-border-subtle)] bg-white px-3 py-2',
]) {
  if (sheetSource.includes(forbidden)) {
    throw new Error(`指标使用明细不应保留嵌套描边卡片：${forbidden}`);
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
