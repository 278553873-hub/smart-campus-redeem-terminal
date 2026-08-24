export interface DutyWeek {
  id: string;
  startDate: string;
  endDate: string;
  termWeekNumber: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const parseDate = (value: string): Date => new Date(`${value}T00:00:00+08:00`);

const formatDateId = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const createDutyWeeks = (startMonday: string, count: number): DutyWeek[] => {
  const start = parseDate(startMonday);
  return Array.from({ length: count }, (_, index) => {
    const weekStart = new Date(start.getTime() + index * 7 * DAY_MS);
    const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);
    const startDate = formatDateId(weekStart);
    return {
      id: startDate,
      startDate,
      endDate: formatDateId(weekEnd),
      termWeekNumber: index + 1,
    };
  });
};

export const getDutyWeeksForMonth = (weeks: DutyWeek[], year: number, monthIndex: number): DutyWeek[] => {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  return weeks.filter(week => parseDate(week.startDate) <= monthEnd && parseDate(week.endDate) >= monthStart);
};

export const formatDutyWeekRange = (week: DutyWeek): string => {
  const format = (value: string) => {
    const date = parseDate(value);
    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };
  return `${format(week.startDate)}-${format(week.endDate)}`;
};

export const formatDutyMonth = (year: number, monthIndex: number): string => `${year}年${monthIndex + 1}月`;

export const formatDutyTeacherSummary = (teacherNames: string[]): string => {
  if (teacherNames.length === 0) return '未安排';
  if (teacherNames.length <= 2) return teacherNames.join('、');
  return `${teacherNames[0]}等${teacherNames.length}人`;
};

export const getDutyWeekMonthKey = (week: DutyWeek): string => week.startDate.slice(0, 7);

export const formatDutyMonthKey = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  return `${year}年${Number(month)}月`;
};
