import { growthPercent, type GrowthSnapshot, type GrowthRecord, type GrowthStudent } from './studentGrowthModel';
import { selectGrowthRanking } from './studentGrowthRankingModel';

export type GrowthMetric = string;
export interface GrowthClassSummary {
  id: string; name: string; shortName: string; gradeId: string; gradeName: string;
  total: number; points: number; average: number; praised: number; praiseRate: number;
}
const classKey = (student: GrowthStudent) => student.classId || `${student.gradeId}:${student.className}`;
const inMetric = (record: GrowthRecord, metric: string) => metric === 'total' || record.indicatorPath[0] === metric;

/** 分母始终是完整在籍名册；只有学生评价记录，不引入班级评价。 */
export function selectGrowthClasses(snapshot: GrowthSnapshot, gradeId?: string, metric = 'total'): GrowthClassSummary[] {
  const classes = new Map<string, GrowthClassSummary>();
  const studentClasses = new Map<string, string>();
  for (const item of snapshot.studentScores) {
    const student = item.student;
    if (gradeId && student.gradeId !== gradeId) continue;
    const id = classKey(student);
    studentClasses.set(student.id, id);
    const row = classes.get(id) || { id, name: student.className.startsWith(student.gradeName) ? student.className : `${student.gradeName}${student.className}`,
      shortName: student.className.startsWith(student.gradeName) ? student.className.slice(student.gradeName.length) : student.className,
      gradeId: student.gradeId, gradeName: student.gradeName, total: 0, points: 0, average: 0, praised: 0, praiseRate: 0 };
    row.total++;
    row.points += metric === 'total' ? item.total : item.dimensions[metric] || 0;
    classes.set(id, row);
  }
  const praised = new Map<string, Set<string>>();
  for (const record of snapshot.records) {
    const id = studentClasses.get(record.studentId);
    if (!id || record.delta <= 0 || !inMetric(record, metric)) continue;
    const people = praised.get(id) || new Set<string>();
    people.add(record.studentId); praised.set(id, people);
  }
  return [...classes.values()].map(row => ({ ...row, average: row.total ? row.points / row.total : 0,
    praised: praised.get(row.id)?.size || 0, praiseRate: growthPercent(praised.get(row.id)?.size || 0, row.total) }));
}

function rankGrowthClasses(classes: GrowthClassSummary[], kind: 'points' | 'praise', limit: number) {
  const value = (row: GrowthClassSummary) => kind === 'points' ? row.average : row.praised / row.total;
  const sorted = classes.filter(row => kind === 'points' ? row.average > 0 : row.praised > 0)
    .sort((a, b) => value(b) - value(a) || a.id.localeCompare(b.id));
  const comparable = (item: GrowthClassSummary) => kind === 'points' ? Math.round(item.average * 10) : item.praised / item.total;
  let rank = 0;
  return sorted.map((row, index) => {
    // 积分按展示精度比较，避免显示相同人均分却不同名次。
    if (!index || comparable(row) !== comparable(sorted[index - 1])) rank = index + 1;
    return { ...row, rank, tied: (index > 0 && comparable(sorted[index - 1]) === comparable(row)) || (index + 1 < sorted.length && comparable(sorted[index + 1]) === comparable(row)) };
  }).slice(0, limit);
}

export function selectGrowthClassRanking(snapshot: GrowthSnapshot, gradeId?: string, metric = 'total', kind: 'points' | 'praise' = 'points', limit = 10) {
  if (gradeId && !snapshot.grades.some(grade => grade.id === gradeId)) return [];
  return rankGrowthClasses(selectGrowthClasses(snapshot, gradeId, metric), kind, limit);
}

/** 公开内容只使用正向行为摘要，不透出教师的完整评价原文。 */
export function selectGrowthPublicPraise(snapshot: GrowthSnapshot, gradeId?: string, metric = 'total') {
  const students = new Map(snapshot.studentScores.filter(item => !gradeId || item.student.gradeId === gradeId).map(item => [item.student.id, item.student]));
  return snapshot.records.filter(record => record.delta > 0 && record.publicBehavior && students.has(record.studentId) && inMetric(record, metric))
    .map(record => ({ record, student: students.get(record.studentId)! }));
}

export function selectGrowthGradePraise(snapshot: GrowthSnapshot, metric = 'total') {
  const counts = new Map<string, Set<string>>();
  // 统计不限于有公开摘要的记录，防止摘要缺失低估获表扬人数。
  const gradeByStudent = new Map(snapshot.studentScores.map(item => [item.student.id, item.student.gradeId]));
  for (const record of snapshot.records) if (record.delta > 0 && inMetric(record, metric)) {
    const id = gradeByStudent.get(record.studentId);
    if (!id) continue;
    const ids = counts.get(id) || new Set<string>(); ids.add(record.studentId); counts.set(id, ids);
  }
  return snapshot.grades.map(grade => ({ ...grade, praised: counts.get(grade.id)?.size || 0, percent: growthPercent(counts.get(grade.id)?.size || 0, grade.total) }));
}

export function selectGrowthDimensionStars(snapshot: GrowthSnapshot, gradeId?: string) {
  return snapshot.dimensions.map(dimension => ({ dimension, leader: selectGrowthRanking(snapshot, dimension.name, gradeId, 1)[0] }));
}
