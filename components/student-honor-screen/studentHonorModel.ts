import type { GrowthSnapshot } from '../student-growth-screen/studentGrowthModel';
import { selectGrowthRanking, type GrowthRankingRow } from '../student-growth-screen/studentGrowthRankingModel';

export type HonorStage = 'primary' | 'middle' | 'high';
export type HonorSnapshot = Pick<GrowthSnapshot, 'schoolName' | 'grades'> & Parameters<typeof selectGrowthRanking>[0] & { stages?: Record<string, HonorStage> };

export const HONOR_RANK_SIZE = 10;
export interface HonorGradeBoard { id: string; name: string; rows: GrowthRankingRow[] }

/** 每个年级从完整名册按总分重新排名，不筛选已截取的全校榜单。 */
export function createHonorGradeBoards(snapshot: HonorSnapshot): HonorGradeBoard[] {
  return snapshot.grades.map(grade => ({
    id: grade.id, name: grade.name,
    rows: selectGrowthRanking(snapshot, 'total', grade.id, HONOR_RANK_SIZE),
  }));
}

export const formatHonorRank = (rank: number) => String(rank).padStart(2, '0');
export const formatHonorScore = (score: number) => score.toLocaleString('zh-CN', { maximumFractionDigits: 1 });

/** 部分服务只返回“1班”，与年级名拼成“3年级1班”；已带年级时保持原样。 */
export function getHonorStudentClassName(student: Pick<GrowthSnapshot['studentScores'][number]['student'], 'gradeName' | 'className'>) {
  const grade = student.gradeName.trim(), className = student.className.trim();
  if (!className) return '未分班';
  return !grade || className.startsWith(grade) ? className : `${grade}${className}`;
}

export function getHonorGradeGrid(gradeCount: number) {
  const columns = Math.max(1, Math.min(gradeCount, gradeCount > 9 ? 4 : 3));
  return { columns, rows: Math.max(1, Math.ceil(gradeCount / columns)), dense: gradeCount > 6 };
}

export function createHonorStagePages(snapshot: HonorSnapshot) {
  const boards = createHonorGradeBoards(snapshot);
  const groups = [
    { stage: 'primary', boards: boards.filter(board => (snapshot.stages?.[board.id] ?? 'primary') === 'primary') },
    { stage: 'secondary', boards: boards.filter(board => snapshot.stages?.[board.id] === 'middle' || snapshot.stages?.[board.id] === 'high') },
  ];
  return groups.flatMap(({ stage, boards: group }) =>
    Array.from({ length: Math.ceil(group.length / 6) }, (_, index) => ({
      stage, boards: group.slice(index * 6, index * 6 + 6),
    })),
  );
}
