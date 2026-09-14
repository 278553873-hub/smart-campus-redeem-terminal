export interface GroupEvaluationRecord {
  id: string;
  groupId: string;
  scoreChange: number;
}

export interface GroupPerformanceSummary {
  praiseCount: number;
  criticismCount: number;
  praiseScore: number;
  criticismScore: number;
}

export const summarizeGroupPerformance = (
  records: Pick<GroupEvaluationRecord, 'groupId' | 'scoreChange'>[],
  groupId: string,
): GroupPerformanceSummary => records.reduce<GroupPerformanceSummary>((summary, record) => {
  if (record.groupId !== groupId) return summary;
  return {
    praiseCount: summary.praiseCount + (record.scoreChange > 0 ? 1 : 0),
    criticismCount: summary.criticismCount + (record.scoreChange < 0 ? 1 : 0),
    praiseScore: summary.praiseScore + (record.scoreChange > 0 ? record.scoreChange : 0),
    criticismScore: summary.criticismScore + (record.scoreChange < 0 ? Math.abs(record.scoreChange) : 0),
  };
}, {
  praiseCount: 0,
  criticismCount: 0,
  praiseScore: 0,
  criticismScore: 0,
});

// Demo fallback only. Production summaries come from confirmed records targeting the group ID.
export const createDemoGroupPerformanceSummary = (groupId: string): GroupPerformanceSummary => {
  const seed = Array.from(groupId).reduce((total, character) => total + character.charCodeAt(0), 0);
  const praiseCount = 5 + (seed % 12);
  const criticismCount = seed % 4;
  return {
    praiseCount,
    criticismCount,
    praiseScore: praiseCount * (1 + (seed % 4)),
    criticismScore: criticismCount * (1 + (seed % 3)),
  };
};
