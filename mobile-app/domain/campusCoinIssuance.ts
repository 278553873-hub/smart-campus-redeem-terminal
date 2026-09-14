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
