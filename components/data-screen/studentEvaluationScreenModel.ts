import type { LeaderReportSnapshot, LeaderReportFiveEducationStat, LeaderReportIndicatorGroupUsage } from '../../mobile-app/services/leaderReportService';
import { getMockStudentNameAt } from '../../mobile-app/data/studentNamePool';
import { applyGrowthEvaluation, createDemoGrowthTrend, type ScreenGrowthWeek } from './studentEvaluationScreenGrowth';

export const SCREEN_PERIODS = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'term', label: '本学期' },
] as const;
export type ScreenPeriod = typeof SCREEN_PERIODS[number]['key'];
export type EducationKey = LeaderReportFiveEducationStat['key'] | 'innovation';
export type ScreenLevelOneStat = Omit<LeaderReportFiveEducationStat, 'key'> & { key: EducationKey };
export type ScreenFiveEducationStat = ScreenLevelOneStat & { positiveStudentCount: number };
export type ScreenIndicatorGroupUsage = Omit<LeaderReportIndicatorGroupUsage, 'id'> & { id: string; dimension?: EducationKey };
export type ScreenReportSnapshot = Omit<LeaderReportSnapshot, 'indicatorUsage' | 'fiveEducationStats'> & {
  indicatorUsage: ScreenIndicatorGroupUsage[]; fiveEducationStats: ScreenLevelOneStat[];
};

export interface StudentScoreChange {
  studentId: string;
  displayName: string;
  beforeScore: number;
  afterScore: number;
  delta: number;
}

export interface ScreenEvaluation {
  id: string;
  teacherId: string;
  teacherName: string;
  gradeId: string;
  classId: string;
  className: string;
  dimension: EducationKey;
  dimensionName: string;
  indicator: string;
  indicatorPath?: [string, string, string];
  indicatorId?: string;
  occurredAt: number;
  students: StudentScoreChange[];
}

export interface EvaluationScreenSnapshot {
  period: ScreenPeriod;
  schoolName: string;
  report: ScreenReportSnapshot;
  recentEvaluations: ScreenEvaluation[];
  studentScores: Record<string, number>;
  positiveStudentIdsByDimension: Partial<Record<EducationKey, string[]>>;
  growthTrend: ScreenGrowthWeek[];
  processedIds: string[];
  updatedAt: number;
}

export type EvaluationScreenPeriods = Record<ScreenPeriod, EvaluationScreenSnapshot>;

export const maskScreenStudentName = (name: string) => {
  const displayName = name.trim().replace(/同学$/, '');
  if (!displayName) return '*';
  return Array.from(displayName.replace(/\*+/g, '*')).map((character, index) => index === 1 ? '*' : character).join('');
};

// 与既有报表保持相同覆盖口径：某二级指标下任一三级指标使用过，即覆盖该二级指标。
export const screenIndicatorCoverage = (groups: Pick<LeaderReportIndicatorGroupUsage, 'children'>[], period: ScreenPeriod) => {
  const seconds = groups.flatMap(group => group.children);
  const count = (third: LeaderReportIndicatorGroupUsage['children'][number]['children'][number]) => (
    period === 'term' ? third.termCount : period === 'month' ? third.monthCount : period === 'today' ? Math.round(third.weekCount * .18) : third.weekCount
  );
  const thirds = seconds.flatMap(second => second.children);
  const summarize = (covered: number, total: number) => ({ covered, total, percent: percentage(covered, total) });
  return {
    second: summarize(seconds.filter(second => second.children.some(third => count(third) > 0)).length, seconds.length),
    third: summarize(thirds.filter(third => count(third) > 0).length, thirds.length),
  };
};

export const percentage = (part: number, total: number) => total > 0
  ? Math.max(0, Math.min(100, Math.round(part / total * 100))) : 0;

export const screenFiveEducationStats = (snapshot: EvaluationScreenSnapshot): ScreenFiveEducationStat[] => (
  snapshot.report.fiveEducationStats.map(item => ({
    ...item,
    positiveStudentCount: snapshot.positiveStudentIdsByDimension[item.key]?.length ?? 0,
  }))
);

// 共享演示报表只有加分事件数：在Demo内模拟存量学生明细，人数按学生标识去重，不能直接拿事件数冒充人数。
const createDemoPositiveStudentIds = (report: ScreenReportSnapshot) => {
  const students = report.gradeCoverages.flatMap(grade => grade.classes.flatMap(classroom =>
    Array.from({ length: Math.min(classroom.covered, classroom.total) }, (_, index) => `${classroom.id}-screen-student-${index}`),
  ));
  const repeatFactors = [.76, .68, .64, .82, .73];
  return Object.fromEntries(report.fiveEducationStats.map((item, index) => {
    const count = Math.min(students.length, report.summary.totalCoveredStudents, item.positiveEventCount,
      item.plusScore > 0 ? Math.max(1, Math.round(item.positiveEventCount * repeatFactors[index % repeatFactors.length])) : 0);
    const offset = index * 31;
    return [item.key, Array.from({ length: count }, (_, slot) => students[(offset + slot) % students.length])];
  }));
};

export const createDemoScreenEvaluation = (
  snapshot: EvaluationScreenSnapshot,
  sequence: number,
  occurredAt: number,
  includeUnused = true,
): ScreenEvaluation | null => {
  const { report } = snapshot;
  if (!report.teachers.length || !report.gradeCoverages.length || !report.fiveEducationStats.length) return null;
  const grade = report.gradeCoverages[sequence % report.gradeCoverages.length];
  const classroom = grade.classes[sequence % Math.max(1, grade.classes.length)];
  if (!classroom) return null;
  const teacher = report.teachers[sequence % report.teachers.length];
  const availableDimensions = report.fiveEducationStats.filter(item => includeUnused || report.indicatorUsage.some(group =>
    (group.dimension ?? group.id) === item.key && group.children.some(second => second.children.some(third => third.weekCount > 0)),
  ));
  const dimension = availableDimensions[sequence % availableDimensions.length];
  if (!dimension) return null;
  const indicators = report.indicatorUsage.filter(group => (group.dimension ?? group.id) === dimension.key)
    .flatMap(group => group.children.flatMap(second => second.children.map(third => ({ group, second, third }))));
  const used = indicators.filter(item => item.third.weekCount > 0);
  const candidates = includeUnused && sequence % 11 === 0 ? indicators : used.length ? used : indicators;
  const matched = candidates[Math.floor(sequence / Math.max(1, report.fiveEducationStats.length)) % Math.max(1, candidates.length)];
  if (!matched) return null;
  const negative = sequence % 4 === 2;
  const delta = negative ? -(sequence % 2 + 1) : sequence % 3 + 1;
  const count = sequence % 5 === 0 ? 3 : 1;
  const students = Array.from({ length: count }, (_, index) => {
    const slot = (sequence + index) % 8;
    const studentId = `${classroom.id}-screen-student-${slot}`;
    const beforeScore = snapshot.studentScores[studentId] ?? 32 + (sequence % 9) * 4 + index;
    return {
      studentId,
      displayName: maskScreenStudentName(getMockStudentNameAt(classroom.id, slot).n),
      beforeScore,
      afterScore: beforeScore + delta,
      delta,
    };
  });
  const classNumber = classroom.name.match(/(\d+)班$/)?.[1] ?? '1';
  return {
    id: `screen-evaluation-${occurredAt}-${sequence}`,
    teacherId: teacher.id,
    teacherName: teacher.name,
    gradeId: grade.id,
    classId: classroom.id,
    className: `${grade.name}${classNumber}班`,
    dimension: dimension.key,
    dimensionName: dimension.name,
    indicator: matched.third.name,
    indicatorPath: [matched.group.name, matched.second.name, matched.third.name],
    indicatorId: matched.third.id,
    occurredAt,
    students,
  };
};

export const createEvaluationScreenSnapshot = (
  report: ScreenReportSnapshot,
  schoolName: string,
  now: number,
  growthTrend = createDemoGrowthTrend(report, now),
): EvaluationScreenSnapshot => {
  const snapshot: EvaluationScreenSnapshot = {
    period: report.period as ScreenPeriod,
    schoolName,
    report,
    studentScores: {},
    positiveStudentIdsByDimension: createDemoPositiveStudentIds(report),
    growthTrend,
    recentEvaluations: [],
    processedIds: [],
    updatedAt: now,
  };
  // 历史节选仅填充播报列表，避免重复计入报表的存量统计。
  for (let index = 0; index < 8; index += 1) {
    const event = createDemoScreenEvaluation(snapshot, index, now - (8 - index) * 12000, false);
    if (!event) continue;
    event.students.forEach(student => { snapshot.studentScores[student.studentId] = student.afterScore; });
    snapshot.recentEvaluations.unshift(event);
  }
  return snapshot;
};

export const applyScreenEvaluation = (
  snapshot: EvaluationScreenSnapshot,
  event: ScreenEvaluation,
): EvaluationScreenSnapshot => {
  if (!event.students.length || snapshot.processedIds.includes(event.id)) return snapshot;
  const { report } = snapshot;
  if (!report.teachers.some(teacher => teacher.id === event.teacherId)
    || !report.gradeCoverages.some(grade => grade.id === event.gradeId && grade.classes.some(item => item.id === event.classId))
    || !report.fiveEducationStats.some(dimension => dimension.key === event.dimension)
    || event.students.some(student => !Number.isFinite(student.delta) || !Number.isFinite(student.afterScore))) return snapshot;
  const recipients = event.students.length;
  const plus = event.students.reduce((total, student) => total + Math.max(0, student.delta), 0);
  const minus = event.students.reduce((total, student) => total + Math.max(0, -student.delta), 0);
  const positiveCount = event.students.filter(student => student.delta > 0).length;
  const negativeCount = event.students.filter(student => student.delta < 0).length;
  const positiveStudentIds = new Set(snapshot.positiveStudentIdsByDimension[event.dimension] ?? []);
  event.students.filter(student => student.delta > 0).forEach(student => positiveStudentIds.add(student.studentId));
  const teachers = report.teachers.map(teacher => teacher.id === event.teacherId ? {
    ...teacher,
    records: teacher.records + 1,
    evaluationCount: (teacher.evaluationCount ?? teacher.records) + recipients,
    lastUsedAt: '刚刚',
  } : teacher);
  const activeTeachers = teachers.filter(teacher => teacher.records > 0).length;
  const nextReport: ScreenReportSnapshot = {
    ...report,
    teachers,
    activeRanking: [...teachers].sort((a, b) => b.records - a.records),
    indicatorUsage: report.indicatorUsage.map(group => (group.dimension ?? group.id) === event.dimension ? {
      ...group,
      children: group.children.map(second => ({ ...second, children: second.children.map(third => third.id === event.indicatorId ? {
        ...third,
        weekCount: third.weekCount + recipients,
        monthCount: third.monthCount + recipients,
        termCount: third.termCount + recipients,
      } : third) })),
    } : group),
    summary: {
      ...report.summary,
      totalRecords: report.summary.totalRecords + 1,
      totalEvaluationCount: report.summary.totalEvaluationCount + recipients,
      activeTeachers,
      teacherPercent: percentage(activeTeachers, report.summary.totalTeachers),
    },
    gradeCoverages: report.gradeCoverages.map(grade => grade.id === event.gradeId ? {
      ...grade,
      evaluationRecords: grade.evaluationRecords + recipients,
      classes: grade.classes.map(item => item.id === event.classId ? {
        ...item, evaluationRecords: item.evaluationRecords + recipients,
      } : item),
    } : grade),
    fiveEducationStats: report.fiveEducationStats.map(dimension => dimension.key === event.dimension ? {
      ...dimension,
      plusScore: dimension.plusScore + plus,
      minusScore: dimension.minusScore + minus,
      netScore: dimension.netScore + plus - minus,
      score: dimension.score + plus - minus,
      positiveEventCount: dimension.positiveEventCount + positiveCount,
      negativeEventCount: dimension.negativeEventCount + negativeCount,
      eventCount: dimension.eventCount + positiveCount + negativeCount,
    } : dimension),
    teacherScoreSummaries: report.teacherScoreSummaries.map(teacher => teacher.teacherId === event.teacherId ? {
      ...teacher,
      plusScore: teacher.plusScore + plus,
      minusScore: teacher.minusScore + minus,
      netScore: teacher.netScore + plus - minus,
    } : teacher),
  };
  return {
    ...snapshot,
    report: nextReport,
    growthTrend: applyGrowthEvaluation(snapshot.growthTrend, event),
    positiveStudentIdsByDimension: positiveCount ? {
      ...snapshot.positiveStudentIdsByDimension,
      [event.dimension]: [...positiveStudentIds],
    } : snapshot.positiveStudentIdsByDimension,
    studentScores: {
      ...snapshot.studentScores,
      ...Object.fromEntries(event.students.map(student => [student.studentId, student.afterScore])),
    },
    recentEvaluations: [event, ...snapshot.recentEvaluations].slice(0, 12),
    processedIds: [...snapshot.processedIds, event.id].slice(-200),
    updatedAt: event.occurredAt,
  };
};

export const applyEvaluationToPeriods = (periods: EvaluationScreenPeriods, event: ScreenEvaluation): EvaluationScreenPeriods => (
  Object.fromEntries(SCREEN_PERIODS.map(({ key }) => [key, applyScreenEvaluation(periods[key], event)])) as EvaluationScreenPeriods
);
