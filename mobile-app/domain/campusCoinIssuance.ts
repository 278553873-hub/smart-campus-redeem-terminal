export interface CoinIssuanceEligibilityInput {
  enabled: boolean;
  periodEvaluationCount: number;
  minimumEvaluationCount: number;
}

export const normalizeMinimumEvaluationCount = (value: number): number => (
  Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1
);

export const isCoinIssuanceEligible = ({
  enabled,
  periodEvaluationCount,
  minimumEvaluationCount,
}: CoinIssuanceEligibilityInput): boolean => (
  enabled
  && Math.max(0, Math.floor(periodEvaluationCount)) >= normalizeMinimumEvaluationCount(minimumEvaluationCount)
);

export const getClassBudgetTotal = ({
  budgetMode,
  budgetAmount,
  classStudentCount,
}: {
  budgetMode: CampusCoinBudgetMode;
  budgetAmount: number;
  classStudentCount: number;
}): number => {
  const normalizedAmount = Number.isFinite(budgetAmount) ? Math.max(0, budgetAmount) : 0;
  const normalizedStudentCount = Number.isFinite(classStudentCount) ? Math.max(1, Math.floor(classStudentCount)) : 1;
  return budgetMode === 'per_student' ? normalizedAmount * normalizedStudentCount : normalizedAmount;
};
import type { CampusCoinBudgetMode } from '../types';

export interface RankingRewardInput {
  rankingPool: number;
  score: number;
  totalPositiveScore: number;
}

export interface RankingRewardRow {
  id: string;
  score: number;
  share: number;
  reward: number;
}

export const roundCoinAmount = (value: number): number => (
  Number.isFinite(value) ? Math.round(value * 100) / 100 : 0
);

export const sumPositiveScores = (scores: number[]): number => (
  scores.reduce((total, score) => (
    Number.isFinite(score) && score > 0 ? total + score : total
  ), 0)
);

// 得分奖励按分数占比分配：个人占比 = 个人正分 / 全班正分总和。
export const getRankingRewardShare = ({ score, totalPositiveScore }: Pick<RankingRewardInput, 'score' | 'totalPositiveScore'>): number => {
  const normalizedScore = Number.isFinite(score) ? score : 0;
  const normalizedTotal = Number.isFinite(totalPositiveScore) ? totalPositiveScore : 0;
  if (normalizedScore <= 0 || normalizedTotal <= 0) return 0;
  return normalizedScore / normalizedTotal;
};

export const getRankingReward = ({ rankingPool, score, totalPositiveScore }: RankingRewardInput): number => {
  const normalizedPool = Number.isFinite(rankingPool) ? Math.max(0, rankingPool) : 0;
  return roundCoinAmount(normalizedPool * getRankingRewardShare({ score, totalPositiveScore }));
};

export const getRankingRewards = <T extends { id: string; score: number }>({
  rankingPool,
  students,
}: {
  rankingPool: number;
  students: T[];
}): RankingRewardRow[] => {
  const totalPositiveScore = sumPositiveScores(students.map(student => student.score));
  return students.map(student => ({
    id: student.id,
    score: student.score,
    share: getRankingRewardShare({ score: student.score, totalPositiveScore }),
    reward: getRankingReward({ rankingPool, score: student.score, totalPositiveScore }),
  }));
};

