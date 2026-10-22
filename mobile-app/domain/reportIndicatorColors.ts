/** 以学校完整指标清单建立颜色映射，再用于筛选后的数据，避免颜色随数据量变化。 */
export const REPORT_INDICATOR_COLORS = [
  'indicator1', 'indicator2', 'indicator3', 'indicator4', 'indicator5',
  'indicator6', 'indicator7', 'indicator8', 'indicator9', 'indicator10',
] as const;

export function buildReportIndicatorColorMap(ids: readonly string[]) {
  return new Map(ids.map((id, index) => [id, REPORT_INDICATOR_COLORS[index % REPORT_INDICATOR_COLORS.length]]));
}
