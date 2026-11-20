import type { GrowthSnapshot, GrowthStudent } from './studentGrowthModel';

export const GROWTH_RANK_SIZE = 10;
export interface GrowthRankingRow { student: GrowthStudent; score: number; rank: number; tied: boolean }

/** 先在完整学校/年级集合中排名，再按展示需要截取；完整榜单传入Infinity。 */
export function selectGrowthRanking(snapshot: { dimensions: GrowthSnapshot['dimensions']; studentScores: Pick<GrowthSnapshot['studentScores'][number], 'student' | 'total' | 'dimensions'>[] }, metric = 'total', gradeId?: string, limit = GROWTH_RANK_SIZE): GrowthRankingRow[] {
  if (metric !== 'total' && !snapshot.dimensions.some(item => item.name === metric)) return [];
  const scored = snapshot.studentScores.filter(item => !gradeId || item.student.gradeId === gradeId)
    .map(item => ({ student: item.student, score: metric === 'total' ? item.total : item.dimensions[metric] ?? 0 }))
    .filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.student.id.localeCompare(b.student.id));
  let rank = 0;
  return scored.map((item, index) => {
    if (index === 0 || item.score !== scored[index - 1].score) rank = index + 1;
    return { ...item, rank, tied: scored[index - 1]?.score === item.score || scored[index + 1]?.score === item.score };
  }).slice(0, limit);
}
