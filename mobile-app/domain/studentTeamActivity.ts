export interface StudentTeamActivityOverview {
  evaluationCount: number;
  recordCount: number;
  praiseCount: number;
  criticismCount: number;
  activeMemberCount: number;
  memberCount: number;
}

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

export const createDemoTeamActivityOverview = (teamId: string, memberCount: number): StudentTeamActivityOverview => {
  if (memberCount === 0) {
    return {
      evaluationCount: 0,
      recordCount: 0,
      praiseCount: 0,
      criticismCount: 0,
      activeMemberCount: 0,
      memberCount: 0,
    };
  }
  const seed = hashString(teamId);
  const activeMemberCount = Math.max(1, Math.min(memberCount, Math.ceil(memberCount * (0.7 + (seed % 18) / 100))));
  const recordCount = activeMemberCount + (seed % Math.max(1, memberCount - activeMemberCount + 1)) + (seed % 6);
  const averageStudentsPerSession = 1 + (seed % 3);
  const evaluationCount = Math.max(1, Math.ceil(recordCount / averageStudentsPerSession));
  const praiseCount = Math.round(recordCount * (0.75 + (seed % 12) / 100));
  const criticismCount = recordCount - praiseCount;
  return {
    evaluationCount,
    recordCount,
    praiseCount,
    criticismCount,
    activeMemberCount,
    memberCount,
  };
};

