/** 日期选择的纯逻辑；只处理日历日期，不依赖业务周期、权限或 UTC 时间戳输入。 */
export interface MobileDateRange { start: string; end: string }
export interface MobileDateRangePreset { label: string; value: MobileDateRange }
export const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
export const isCalendarDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
export const shiftDate = (value: string, days: number) => {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
export const dateAllowed = (value: string, min?: string, max?: string) => (
  isCalendarDate(value) && (!min || value >= min) && (!max || value <= max)
);
/** 依照教师端现有学期口径，返回本学期已发生日期范围；实际学期配置接入后由调用方传真实边界。 */
export const currentTermToDateRange = (today: string): MobileDateRange => {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const start = month >= 9
    ? `${year}-09-01`
    : month <= 1
      ? `${year - 1}-09-01`
      : `${year}-02-01`;
  return { start, end: today };
};
export const rangeError = (value: MobileDateRange, min?: string, max?: string) => {
  if (!isCalendarDate(value.start) || !isCalendarDate(value.end)) return '请选择开始日期和结束日期';
  if (value.end < value.start) return '结束日期不能早于开始日期';
  if (!dateAllowed(value.start, min, max) || !dateAllowed(value.end, min, max)) return '所选日期超出可选范围';
  return '';
};
export const setRangeEndpoint = (current: MobileDateRange, field: keyof MobileDateRange, value: string): MobileDateRange => {
  // 明确编辑起止字段，不静默交换；开始日期移到结束日期之后时，重新选择结束日期。
  return field === 'start' ? { start: value, end: current.end && value > current.end ? '' : current.end } : { ...current, end: value };
};
export const daysInCalendarMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
export const replaceCalendarPart = (date: string, part: 'year' | 'month' | 'day', next: number, min: string, max: string) => {
  const [y, m, d] = date.split('-').map(Number);
  const year = part === 'year' ? next : y;
  const month = part === 'month' ? next : m;
  const day = Math.min(part === 'day' ? next : d, daysInCalendarMonth(year, month));
  const value = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return value < min ? min : value > max ? max : value;
};
/** 自然周按周一至周日；学期边界由学校传入，绝不在公共组件内猜测。 */
export const dateRangePresets = (today: string, currentTerm?: MobileDateRange, min?: string, max?: string): MobileDateRangePreset[] => {
  const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  const weekStart = shiftDate(today, -weekday);
  const monthStart = `${today.slice(0, 7)}-01`;
  const nextMonth = new Date(`${monthStart}T00:00:00Z`);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  const previousMonthEnd = shiftDate(monthStart, -1);
  const options = [
    { label: '本周', value: { start: weekStart, end: shiftDate(weekStart, 6) } },
    { label: '本月', value: { start: monthStart, end: shiftDate(nextMonth.toISOString().slice(0, 10), -1) } },
    { label: '上周', value: { start: shiftDate(weekStart, -7), end: shiftDate(weekStart, -1) } },
    { label: '上月', value: { start: `${previousMonthEnd.slice(0, 7)}-01`, end: previousMonthEnd } },
    ...(currentTerm ? [{ label: '本学期', value: currentTerm }] : []),
  ];
  return options.map(({ label, value }) => ({ label, value: {
    start: min && value.start < min ? min : value.start,
    end: max && value.end > max ? max : value.end,
  } }));
};
export const calendarCells = (month: string) => {
  const first = `${month}-01`;
  const weekday = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7;
  const start = shiftDate(first, -weekday);
  return Array.from({ length: 42 }, (_, index) => shiftDate(start, index));
};
