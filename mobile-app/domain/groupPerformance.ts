import type { StudentPerformanceSummary } from './studentPerformance';

export interface GroupEvaluationRecord {
  id: string;
  groupId: string;
  scoreChange: number;
}

export const summarizeGroupPerformance = (
  records: Pick<GroupEvaluationRecord, 'groupId' | 'scoreChange'>[],
  groupId: string,
): StudentPerformanceSummary => records.reduce<StudentPerformanceSummary>((summary, record) => {
  if (record.groupId !== groupId) return summary;
  return {
    netScore: summary.netScore + record.scoreChange,
    praiseCount: summary.praiseCount + (record.scoreChange > 0 ? 1 : 0),
    criticismCount: summary.criticismCount + (record.scoreChange < 0 ? 1 : 0),
  };
}, {
  netScore: 0,
  praiseCount: 0,
  criticismCount: 0,
});

// Demo fallback only. Production summaries come from confirmed records targeting the group ID.
export const createDemoGroupPerformanceSummary = (groupId: string): StudentPerformanceSummary => {
  const seed = Array.from(groupId).reduce((total, character) => total + character.charCodeAt(0), 0);
  const praiseCount = 5 + (seed % 12);
  const criticismCount = seed % 4;
  return {
    netScore: praiseCount * (1 + (seed % 3)) - criticismCount * (1 + (seed % 2)),
    praiseCount,
    criticismCount,
  };
};
