import { classReportIndicatorDemoPaths } from '../../mobile-app/data/classReportIndicatorDemo';
import { currentTermToDateRange } from '../../mobile-app/components/ui/mobileDatePickerModel';

export type GrowthIndicatorPath = readonly [string, string, string];
// 当前演示学校与教师端目录共用同一份路径，其他学校由数据服务传入indicatorPaths。
export const DEFAULT_GROWTH_INDICATOR_PATHS: readonly GrowthIndicatorPath[] = classReportIndicatorDemoPaths;
const dimensionColors = [
  ['#ffe6ad', '#efa52d', '#8c5219'], ['#c5ffe5', '#79c6ac', '#366b5e'],
  ['#d1eaff', '#7baee1', '#385e91'], ['#ead3ff', '#b58bd8', '#694684'],
  ['#fffdf4', '#d9d6cb', '#85847d'], ['#ffe0ec', '#df9db9', '#8a526b'],
  ['#c5f5ff', '#76bfce', '#366d7b'], ['#ffdbc8', '#dc9878', '#88523b'],
  ['#e2edbd', '#b0c57b', '#637b36'], ['#d5d7ff', '#969be0', '#515687'],
] as const;
export const createGrowthDimensions = (paths: readonly GrowthIndicatorPath[]) => [...new Set(paths.map(path => path[0]))].map((name, index) => ({ name, colors: dimensionColors[index % dimensionColors.length] }));
export type GrowthDimension = ReturnType<typeof createGrowthDimensions>[number];
export interface GrowthStudent { id: string; displayName: string; gradeId: string; gradeName: string; classId?: string; className: string }
export interface GrowthRecord { id: string; studentId: string; indicatorPath: GrowthIndicatorPath; delta: number; timestamp: number; teacherName?: string; publicBehavior?: string }
export interface GrowthTerm { start: number; end: number }
export interface GrowthDataset {
  schoolName: string; students: GrowthStudent[]; records: GrowthRecord[]; generatedAt: number;
  term: GrowthTerm; indicatorPaths: readonly GrowthIndicatorPath[];
}
export interface GrowthStudentScore { student: GrowthStudent; total: number; dimensions: Record<string, number>; currentRecords: number; hasPraise: boolean }
export const growthPercent = (count: number, total: number) => total > 0 ? Math.round(count / total * 100) : 0;
/** 演示沿用教师端现有学期起始规则；正式服务可通过dataset.term传入学校真实边界。 */
export const getGrowthDemoTerm = (now: number): GrowthTerm => {
  const today = new Date(now + 8 * 3600000).toISOString().slice(0, 10);
  const { start } = currentTermToDateRange(today);
  return { start: new Date(`${start}T00:00:00+08:00`).getTime(), end: now };
};

/** 学期起点包含在内，截止到快照时间；只统计配置中有效的指标与学生。 */
export function selectGrowthSnapshot(dataset: GrowthDataset) {
  const start = dataset.term.start;
  const end = Math.min(dataset.generatedAt, dataset.term.end);
  const dimensions = createGrowthDimensions(dataset.indicatorPaths);
  const studentsById = new Map(dataset.students.map(student => [student.id, student]));
  const validPaths = new Set(dataset.indicatorPaths.map(path => path.join('\u0000')));
  const current = dataset.records.filter(record => studentsById.has(record.studentId)
    && Number.isFinite(record.delta) && Number.isFinite(record.timestamp)
    && record.timestamp >= start && record.timestamp <= end
    && validPaths.has(record.indicatorPath.join('\u0000')));
  const covered = new Set(current.map(record => record.studentId));
  const praised = new Set(current.filter(record => record.delta > 0).map(record => record.studentId));
  const scores = new Map<string, GrowthStudentScore>(dataset.students.map(student => [student.id, {
    student, total: 0, dimensions: Object.fromEntries(dimensions.map(item => [item.name, 0])), currentRecords: 0, hasPraise: false,
  }]));
  for (const record of current) {
    const score = scores.get(record.studentId)!;
    score.total += record.delta;
    score.dimensions[record.indicatorPath[0]] += record.delta;
    score.currentRecords++;
    if (record.delta > 0) score.hasPraise = true;
  }
  const grades = [...new Map(dataset.students.map(student => [student.gradeId, student.gradeName])).entries()].map(([id, name]) => ({
    id, name, total: dataset.students.filter(student => student.gradeId === id).length,
  }));
  return {
    schoolName: dataset.schoolName, generatedAt: end, start, dimensions,
    summary: { totalStudents: dataset.students.length, recordedStudents: covered.size, praisedStudents: praised.size, coverage: growthPercent(covered.size, dataset.students.length), records: current.length },
    studentScores: [...scores.values()], grades, records: current,
  };
}
export type GrowthSnapshot = ReturnType<typeof selectGrowthSnapshot>;

/** 从全部学生中选定年级，再统一计算概况与榜单，不能筛选已经截取的全校前十名。 */
export function selectGrowthScope(snapshot: GrowthSnapshot, gradeId?: string): GrowthSnapshot {
  if (!gradeId || !snapshot.grades.some(grade => grade.id === gradeId)) return snapshot;
  const studentScores = snapshot.studentScores.filter(item => item.student.gradeId === gradeId);
  const recordedStudents = studentScores.filter(item => item.currentRecords > 0).length;
  const ids = new Set(studentScores.map(item => item.student.id));
  return {
    ...snapshot,
    studentScores,
    records: snapshot.records.filter(record => ids.has(record.studentId)),
    grades: snapshot.grades.filter(grade => grade.id === gradeId),
    summary: {
      totalStudents: studentScores.length,
      recordedStudents,
      praisedStudents: studentScores.filter(item => item.hasPraise).length,
      coverage: growthPercent(recordedStudents, studentScores.length),
      records: studentScores.reduce((sum, item) => sum + item.currentRecords, 0),
    },
  };
}
