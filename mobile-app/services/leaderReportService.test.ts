import { createLeaderReportSnapshot } from './leaderReportService';

const snapshot = createLeaderReportSnapshot({
  period: 'week',
  teachers: [],
  gradeCoverages: [],
  inputSources: [],
  fiveEducationStats: [
    {
      key: 'virtue',
      name: '育德',
      plusScore: 12,
      minusScore: 5,
      netScore: 7,
      score: 7,
      positiveEventCount: 2,
      negativeEventCount: 1,
      eventCount: 0,
    },
  ],
  teacherScoreSummaries: [],
});

const first = snapshot.fiveEducationStats[0];
const total: number = first.plusScore + first.minusScore + first.netScore;
if (total !== 24) {
  throw new Error('五育加减净字段归一化失败');
}

if (first.positiveEventCount !== 2 || first.negativeEventCount !== 1 || first.eventCount !== 3) {
  throw new Error('五育正负向事件数量合计归一化失败');
}
