import type { Student } from '../types';
import type { StudentEvaluationRecord } from '../views/student-evaluation/types';

export type StudentPerformanceTier = 'star' | 'moon' | 'sun' | 'crown';

export interface StudentPerformanceSummary {
  netScore: number;
  praiseCount: number;
  criticismCount: number;
}

export interface StudentPerformanceLevel {
  tier: StudentPerformanceTier;
  iconCount: number;
  progress: number;
  nextIconTier: StudentPerformanceTier | null;
  isMaxLevel: boolean;
}

const LEVEL_STEPS = [
  { tier: 'star', unitScore: 2, upperBound: 10, nextTier: 'moon' },
  { tier: 'moon', unitScore: 10, upperBound: 50, nextTier: 'sun' },
  { tier: 'sun', unitScore: 50, upperBound: 250, nextTier: 'crown' },
] as const;

const MAX_CROWN_SCORE = 1000;

export const getStudentPerformanceLevel = (netScore: number): StudentPerformanceLevel => {
  const normalizedScore = Math.max(0, Math.trunc(Number.isFinite(netScore) ? netScore : 0));
  const step = LEVEL_STEPS.find(item => normalizedScore < item.upperBound);

  if (step) {
    const iconCount = Math.min(4, Math.floor(normalizedScore / step.unitScore));
    return {
      tier: step.tier,
      iconCount,
      progress: (normalizedScore % step.unitScore) / step.unitScore,
      nextIconTier: iconCount === 4 ? step.nextTier : step.tier,
      isMaxLevel: false,
    };
  }

  if (normalizedScore >= MAX_CROWN_SCORE) {
    return {
      tier: 'crown',
      iconCount: 4,
      progress: 1,
      nextIconTier: null,
      isMaxLevel: true,
    };
  }

  return {
    tier: 'crown',
    iconCount: Math.floor(normalizedScore / 250),
    progress: (normalizedScore % 250) / 250,
    nextIconTier: 'crown',
    isMaxLevel: false,
  };
};

export const summarizeStudentPerformance = (
  records: Pick<StudentEvaluationRecord, 'scoreChange'>[],
): StudentPerformanceSummary => records.reduce<StudentPerformanceSummary>((summary, record) => ({
  netScore: summary.netScore + record.scoreChange,
  praiseCount: summary.praiseCount + (record.scoreChange > 0 ? 1 : 0),
  criticismCount: summary.criticismCount + (record.scoreChange < 0 ? 1 : 0),
}), {
  netScore: 0,
  praiseCount: 0,
  criticismCount: 0,
});

// Demo fallback only. Production summaries come from confirmed evaluation records.
export const applyStudentPerformanceEvent = (
  summary: StudentPerformanceSummary,
  scoreChange: number,
): StudentPerformanceSummary => ({
  netScore: summary.netScore + scoreChange,
  praiseCount: summary.praiseCount + (scoreChange > 0 ? 1 : 0),
  criticismCount: summary.criticismCount + (scoreChange < 0 ? 1 : 0),
});

export const revertStudentPerformanceEvent = (
  summary: StudentPerformanceSummary,
  scoreChange: number,
): StudentPerformanceSummary => ({
  netScore: summary.netScore - scoreChange,
  praiseCount: Math.max(0, summary.praiseCount - (scoreChange > 0 ? 1 : 0)),
  criticismCount: Math.max(0, summary.criticismCount - (scoreChange < 0 ? 1 : 0)),
});

export const createDemoStudentPerformanceSummary = (
  student: Pick<Student, 'id' | 'studentNo'>,
): StudentPerformanceSummary => {
  const numericSuffix = (student.studentNo || student.id).match(/(\d{1,2})$/)?.[1];
  const serialNumber = Math.max(1, Number(numericSuffix) || 1);

  if (serialNumber % 20 === 1) {
    return { netScore: 18, praiseCount: 10, criticismCount: 1 };
  }

  const praiseCount = serialNumber % 17 === 0
    ? 86 + (serialNumber % 9)
    : 4 + ((serialNumber * 7) % 25);
  const criticismCount = (serialNumber * 5) % 7;
  const positiveScore = praiseCount * (1 + (serialNumber % 5));
  const negativeScore = criticismCount * (1 + ((serialNumber * 3) % 5));

  return {
    netScore: positiveScore - negativeScore,
    praiseCount,
    criticismCount,
  };
};
