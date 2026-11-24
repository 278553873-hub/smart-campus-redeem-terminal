import type { GrowthSnapshot } from '../student-growth-screen/studentGrowthModel';
import { selectGrowthRanking, type GrowthRankingRow } from '../student-growth-screen/studentGrowthRankingModel';

export type HonorStage = 'primary' | 'middle' | 'high';
export type HonorSnapshot = Pick<GrowthSnapshot, 'schoolName' | 'grades'> & Parameters<typeof selectGrowthRanking>[0] & { stages?: Record<string, HonorStage> };

export const HONOR_RANK_SIZE = 10;
export interface HonorGradeBoard { id: string; name: string; rows: GrowthRankingRow[] }
const HONOR_BOARDS_PER_PAGE = 6;

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

export function createHonorClassBoard(
  classId: string,
  className: string,
  students: readonly { id: string; name: string; avatar?: string; score: number }[],
): HonorGradeBoard {
  const studentScores = students.map(({ id, name, avatar, score }) => ({
    student: { id, displayName: name, avatar, classId, className, gradeId: '', gradeName: '' },
    total: score,
    dimensions: {},
  }));
  return {
    id: classId, name: className,
    rows: selectGrowthRanking({ dimensions: [], studentScores }, 'total', undefined, HONOR_RANK_SIZE),
  };
}

export function getHonorGradeGrid(gradeCount: number) {
  const columns = Math.max(1, Math.min(gradeCount, gradeCount > 9 ? 4 : 3));
  return { columns, rows: Math.max(1, Math.ceil(gradeCount / columns)), dense: gradeCount > 6 };
}

function splitHonorBoards(group: HonorGradeBoard[], stage: 'primary' | 'secondary') {
  return Array.from({ length: Math.ceil(group.length / HONOR_BOARDS_PER_PAGE) }, (_, index) => ({
    stage, boards: group.slice(index * HONOR_BOARDS_PER_PAGE, (index + 1) * HONOR_BOARDS_PER_PAGE),
  }));
}

export function createHonorStagePages(snapshot: HonorSnapshot) {
  const boards = createHonorGradeBoards(snapshot);
  const primaryBoards = boards.filter(board => (snapshot.stages?.[board.id] ?? 'primary') === 'primary');
  const secondaryBoards = boards.filter(board => snapshot.stages?.[board.id] === 'middle' || snapshot.stages?.[board.id] === 'high');
  return [...splitHonorBoards(primaryBoards, 'primary'), ...splitHonorBoards(secondaryBoards, 'secondary')];
}
