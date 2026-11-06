import type { LeaderReportSnapshot, LeaderReportFiveEducationStat } from '../../mobile-app/services/leaderReportService';
import type { MoralEducationCockpitSnapshot } from '../../mobile-app/services/moralEducationCockpitService';

export const SCREEN_PERIODS = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'term', label: '本学期' },
] as const;
export type ScreenPeriod = typeof SCREEN_PERIODS[number]['key'];
export type EducationKey = LeaderReportFiveEducationStat['key'];

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
  occurredAt: number;
  students: StudentScoreChange[];
}

export interface EvaluationScreenSnapshot {
  period: ScreenPeriod;
  schoolName: string;
  report: LeaderReportSnapshot;
  classReport?: MoralEducationCockpitSnapshot;
  recentEvaluations: ScreenEvaluation[];
  studentScores: Record<string, number>;
  processedIds: string[];
  updatedAt: number;
}

export type EvaluationScreenPeriods = Record<ScreenPeriod, EvaluationScreenSnapshot>;

const DEMO_BEHAVIORS: Record<EducationKey, { positive: string; negative: string }> = {
  virtue: { positive: '主动帮助同学', negative: '课间文明待改进' },
  wisdom: { positive: '课堂积极思考', negative: '作业订正需及时' },
  fitness: { positive: '坚持体育锻炼', negative: '课间操需更认真' },
  aesthetic: { positive: '用心完成美术创作', negative: '艺术课堂参与待提升' },
  labor: { positive: '主动承担班级劳动', negative: '劳动工具需归位' },
};
// 只在演示事件源中使用脱敏展示名，不向页面传递学生完整姓名。
const DEMO_DISPLAY_NAMES = ['陈同学', '林同学', '周同学', '王同学', '李同学', '张同学', '刘同学', '赵同学'];

export const percentage = (part: number, total: number) => total > 0
  ? Math.max(0, Math.min(100, Math.round(part / total * 100))) : 0;

export const screenScoreTotals = (snapshot: EvaluationScreenSnapshot) => snapshot.report.fiveEducationStats.reduce(
  (totals, item) => ({ plus: totals.plus + item.plusScore, minus: totals.minus + item.minusScore }),
  { plus: 0, minus: 0 },
);

export const createDemoScreenEvaluation = (
  snapshot: EvaluationScreenSnapshot,
  sequence: number,
  occurredAt: number,
): ScreenEvaluation | null => {
  const { report } = snapshot;
  if (!report.teachers.length || !report.gradeCoverages.length || !report.fiveEducationStats.length) return null;
  const grade = report.gradeCoverages[sequence % report.gradeCoverages.length];
  const classroom = grade.classes[sequence % Math.max(1, grade.classes.length)];
  if (!classroom) return null;
  const teacher = report.teachers[sequence % report.teachers.length];
  const dimension = report.fiveEducationStats[sequence % report.fiveEducationStats.length];
  const negative = sequence % 4 === 2;
  const delta = negative ? -(sequence % 2 + 1) : sequence % 3 + 1;
  const count = sequence % 5 === 0 ? 3 : 1;
  const students = Array.from({ length: count }, (_, index) => {
    const slot = (sequence + index) % 8;
    const studentId = `${classroom.id}-screen-student-${slot}`;
    const beforeScore = snapshot.studentScores[studentId] ?? 32 + (sequence % 9) * 4 + index;
    return {
      studentId,
      displayName: DEMO_DISPLAY_NAMES[slot],
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
    indicator: DEMO_BEHAVIORS[dimension.key][negative ? 'negative' : 'positive'],
    occurredAt,
    students,
  };
};

export const createEvaluationScreenSnapshot = (
  report: LeaderReportSnapshot,
  schoolName: string,
  now: number,
): EvaluationScreenSnapshot => {
  const snapshot: EvaluationScreenSnapshot = {
    period: report.period as ScreenPeriod,
    schoolName,
    report,
    studentScores: {},
    recentEvaluations: [],
    processedIds: [],
    updatedAt: now,
  };
  // 历史节选仅填充播报列表，避免重复计入报表的存量统计。
  for (let index = 0; index < 8; index += 1) {
    const event = createDemoScreenEvaluation(snapshot, index, now - (8 - index) * 12000);
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
  const teachers = report.teachers.map(teacher => teacher.id === event.teacherId ? {
    ...teacher,
    records: teacher.records + 1,
    evaluationCount: (teacher.evaluationCount ?? teacher.records) + recipients,
    lastUsedAt: '刚刚',
  } : teacher);
  const activeTeachers = teachers.filter(teacher => teacher.records > 0).length;
  const nextReport: LeaderReportSnapshot = {
    ...report,
    teachers,
    activeRanking: [...teachers].sort((a, b) => b.records - a.records),
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
