export interface SchoolTermConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export type PrincipalTermReportAvailabilityStatus = 'available' | 'too_early' | 'closed' | 'invalid';

export interface PrincipalTermReportAvailability {
  status: PrincipalTermReportAvailabilityStatus;
  eligibleStartDate: string;
  eligibleEndDate: string;
  title: string;
  message: string;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const parseLocalDate = (value: string) => {
  const match = value.match(DATE_PATTERN);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) return null;

  return date;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatChineseDate = (date: Date) => (
  `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
);

export const getPrincipalTermReportAvailability = (
  term: SchoolTermConfig,
  now = new Date(),
): PrincipalTermReportAvailability => {
  const termStart = parseLocalDate(term.startDate);
  const termEnd = parseLocalDate(term.endDate);

  if (!termStart || !termEnd || termStart.getTime() > termEnd.getTime()) {
    return {
      status: 'invalid',
      eligibleStartDate: '',
      eligibleEndDate: '',
      title: '学期时间需要确认',
      message: '当前学期的开始或结束时间配置有误，请联系管理员检查后再试。',
    };
  }

  const eligibleStart = new Date(termEnd.getFullYear(), termEnd.getMonth() - 1, 1);
  const eligibleEnd = new Date(termEnd.getFullYear(), termEnd.getMonth() + 1, 0);
  const today = startOfDay(now);
  const shared = {
    eligibleStartDate: `${eligibleStart.getFullYear()}-${String(eligibleStart.getMonth() + 1).padStart(2, '0')}-01`,
    eligibleEndDate: `${eligibleEnd.getFullYear()}-${String(eligibleEnd.getMonth() + 1).padStart(2, '0')}-${String(eligibleEnd.getDate()).padStart(2, '0')}`,
  };

  if (today.getTime() < eligibleStart.getTime()) {
    return {
      ...shared,
      status: 'too_early',
      title: '暂未到生成时间',
      message: `${term.name}报告将于${formatChineseDate(eligibleStart)}起开放生成。`,
    };
  }

  if (today.getTime() > eligibleEnd.getTime()) {
    return {
      ...shared,
      status: 'closed',
      title: '本学期生成时间已结束',
      message: `${term.name}报告的生成时间已结束，请联系管理员确认当前学期配置。`,
    };
  }

  return {
    ...shared,
    status: 'available',
    title: '可以生成学期报告',
    message: `${term.name}报告已进入生成时间。`,
  };
};

export const getPrincipalTermReportKey = (schoolId: string, termId: string) => (
  `${schoolId}:${termId}:principal-term-report`
);
