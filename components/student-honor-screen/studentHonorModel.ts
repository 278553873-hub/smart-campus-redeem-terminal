import type { GrowthSnapshot } from '../student-growth-screen/studentGrowthModel';
import { selectGrowthRanking, type GrowthRankingRow } from '../student-growth-screen/studentGrowthRankingModel';

export const HONOR_RANK_SIZE = 10;
export interface HonorGradeBoard { id: string; name: string; rows: GrowthRankingRow[] }

/** 每个年级从完整名册按总分重新排名，不筛选已截取的全校榜单。 */
export function createHonorGradeBoards(snapshot: GrowthSnapshot): HonorGradeBoard[] {
  return snapshot.grades.map(grade => ({
    id: grade.id, name: grade.name,
    rows: selectGrowthRanking(snapshot, 'total', grade.id, HONOR_RANK_SIZE),
  }));
}

export const formatHonorRank = (rank: number) => String(rank).padStart(2, '0');
export const formatHonorScore = (score: number) => score.toLocaleString('zh-CN', { maximumFractionDigits: 1 });

export function getHonorGradeGrid(gradeCount: number) {
  const columns = Math.max(1, Math.min(gradeCount, gradeCount > 9 ? 4 : 3));
  return { columns, rows: Math.max(1, Math.ceil(gradeCount / columns)), dense: gradeCount > 6 };
}
