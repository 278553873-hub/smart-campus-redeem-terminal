const PERIOD_PATTERN = /^(\d{4})\.(\d{2})\.(\d{2})\s*-\s*(\d{4})\.(\d{2})\.(\d{2})$/;

/**
 * 把报告的“数据周期”（如 2026.07.13 - 2026.07.19）转成老师能直接读懂的口径：
 * 整月返回“6月”，同月区间返回“7月13日-19日”，跨月区间返回“6月29日-7月5日”。
 */
export const formatPrincipalReportDataRange = (periodLabel: string) => {
  const match = periodLabel.match(PERIOD_PATTERN);
  if (!match) return periodLabel;

  const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = match;
  const month = Number(startMonth);
  const day = Number(startDay);
  const end = Number(endDay);

  if (startYear !== endYear || startMonth !== endMonth) {
    return `${month}月${day}日-${Number(endMonth)}月${end}日`;
  }
  if (day === 1 && end >= 28) return `${month}月`;
  return `${month}月${day}日-${end}日`;
};
