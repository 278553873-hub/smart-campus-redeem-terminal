export interface EvaluationCountSummary {
  praiseCount: number;
  criticismCount: number;
}

export interface EvaluationCountCheckpoint extends EvaluationCountSummary {
  resetAt: string;
}

export const createEvaluationCountCheckpoint = (
  summary: EvaluationCountSummary,
  resetAt = new Date().toISOString(),
): EvaluationCountCheckpoint => ({
  praiseCount: summary.praiseCount,
  criticismCount: summary.criticismCount,
  resetAt,
});

export const getEvaluationCountsSinceCheckpoint = <T extends EvaluationCountSummary>(
  summary: T,
  checkpoint?: EvaluationCountCheckpoint,
): T => {
  if (!checkpoint) return summary;

  return {
    ...summary,
    praiseCount: Math.max(0, summary.praiseCount - checkpoint.praiseCount),
    criticismCount: Math.max(0, summary.criticismCount - checkpoint.criticismCount),
  };
};
