import { createDemoStudentPerformanceSummary } from '../../mobile-app/domain/studentPerformance';
import { getPetGrowth } from './petGrowth';
import type { PetEvolutionState } from './PetEvolutionFrame';

/** 本地演示：伙伴有自己的培养起点，不把学生历史累计加分全部计入新蛋。 */
// 每20人中14人为不同孵化进度的蛋，其余覆盖全部进化阶段，保留稳定的两条形象路线。
export const DEMO_PET_GROWTH_CASES = [0, 1, 3, 8, 2, 0, 4, 32, 1, 0, 58, 2, 0, 113, 3, 19, 1, 165, 0, 2] as const;

export function getDemoPetGrowthScore(student: { id: string; studentNo: string }, currentPraiseScore: number) {
  const suffix = student.studentNo.match(/(\d{1,2})$/)?.[1];
  const serial = Math.max(1, Number(suffix) || 1);
  const initialGrowth = DEMO_PET_GROWTH_CASES[(serial - 1) % DEMO_PET_GROWTH_CASES.length];
  const initialPraiseScore = createDemoStudentPerformanceSummary(student).praiseScore;
  const delta = Number.isFinite(currentPraiseScore) ? currentPraiseScore - initialPraiseScore : 0;
  return Math.max(0, initialGrowth + delta);
}

/** 仅演示数据模拟生成任务，稳定保留上一阶段形象；真实业务由任务状态提供。 */
export function getDemoPetEvolution(student: { studentNo: string }, growthScore: number): PetEvolutionState | undefined {
  const serial = Math.max(1, Number(student.studentNo.match(/(\d{1,2})$/)?.[1]) || 1);
  const artworkByCase: Record<number, number> = { 3: 0, 7: 8, 10: 32 };
  const artworkScore = artworkByCase[(serial - 1) % DEMO_PET_GROWTH_CASES.length];
  if (artworkScore === undefined || getPetGrowth(growthScore).stageIndex <= getPetGrowth(artworkScore).stageIndex) return undefined;
  return { artworkScore, status: 'generating' };
}
