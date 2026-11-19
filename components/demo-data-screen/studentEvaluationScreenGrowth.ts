import type { ScreenEvaluation, ScreenReportSnapshot } from './studentEvaluationScreenModel';

export interface ScreenGrowthWeek {
  weekStart: number;
  recordedStudentIds: string[];
  praisedStudentIds: string[];
}

const DAY = 86400000;
const WEEK = DAY * 7;
const SCHOOL_TIME_OFFSET = DAY / 3;

// 按学校所在的北京时间、周一零点分周，不受观看设备时区影响。
export const screenGrowthWeekStart = (timestamp: number) => {
  const date = new Date(timestamp + SCHOOL_TIME_OFFSET);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    - (date.getUTCDay() + 6) % 7 * DAY - SCHOOL_TIME_OFFSET;
};

export const formatGrowthWeek = (timestamp: number) => {
  const date = new Date(timestamp + SCHOOL_TIME_OFFSET);
  return `${String(date.getUTCMonth() + 1).padStart(2, '0')}.${String(date.getUTCDate()).padStart(2, '0')}`;
};

// 共享报表没有历史周明细；仅在Demo中生成稳定的演示学生集合，不用记录条数冒充人数。
export const createDemoGrowthTrend = (report: ScreenReportSnapshot, now: number): ScreenGrowthWeek[] => {
  const students = report.gradeCoverages.flatMap(grade => grade.classes.flatMap(classroom =>
    Array.from({ length: classroom.total }, (_, index) => `${classroom.id}-screen-student-${index}`),
  ));
  const covered = Math.min(students.length, report.summary.totalCoveredStudents, report.summary.totalEvaluationCount);
  const positiveEvents = report.fiveEducationStats.reduce((sum, item) => sum + item.positiveEventCount, 0);
  const totalEvents = report.fiveEducationStats.reduce((sum, item) => sum + item.eventCount, 0);
  const praised = totalEvents > 0 ? Math.round(covered * positiveEvents / totalEvents * .94) : 0;
  const currentWeek = screenGrowthWeekStart(now);
  const recordedFactors = [.76, .81, .8, .87, .91, .96, 1];
  const praisedFactors = [.71, .76, .79, .85, .89, .94, 1];
  return recordedFactors.map((factor, index) => {
    const count = Math.round(covered * factor);
    const offset = index * 37;
    const recordedStudentIds = Array.from({ length: count }, (_, slot) => students[(slot + offset) % students.length]);
    return {
      weekStart: currentWeek - (6 - index) * WEEK,
      recordedStudentIds,
      praisedStudentIds: recordedStudentIds.slice(0, Math.min(count, Math.round(praised * praisedFactors[index]))),
    };
  });
};

export const applyGrowthEvaluation = (weeks: ScreenGrowthWeek[], event: ScreenEvaluation): ScreenGrowthWeek[] => {
  if (!Number.isFinite(event.occurredAt)) return weeks;
  const eventWeek = screenGrowthWeekStart(event.occurredAt);
  const latestWeek = Math.max(eventWeek, weeks.at(-1)?.weekStart ?? eventWeek);
  return Array.from({ length: 7 }, (_, index) => {
    const weekStart = latestWeek - (6 - index) * WEEK;
    const previous = weeks.find(week => week.weekStart === weekStart)
      ?? { weekStart, recordedStudentIds: [], praisedStudentIds: [] };
    if (weekStart !== eventWeek) return previous;
    return {
      weekStart,
      recordedStudentIds: [...new Set([...previous.recordedStudentIds, ...event.students.map(student => student.studentId)])],
      praisedStudentIds: [...new Set([...previous.praisedStudentIds, ...event.students.filter(student => student.delta > 0).map(student => student.studentId)])],
    };
  });
};
