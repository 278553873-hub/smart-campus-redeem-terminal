/** 图形共用实际数值刻度；不改变显示值，也不把分数换算成百分制。 */
export const getMoralBarMaximum = (values: number[]) => Math.max(0, ...values.filter(Number.isFinite)) || 1;

export function getMoralBarRatio(value: number, maximum: number) {
  return Number.isFinite(value) && Number.isFinite(maximum) && maximum > 0
    ? Math.max(0, Math.min(1, value / maximum)) : 0;
}
