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


const snapshotWithEvaluationRecords = createLeaderReportSnapshot({
  period: 'week',
  teachers: [],
  gradeCoverages: [
    {
      id: 'g3',
      name: '三年级',
      shortName: '三',
      covered: 45,
      total: 45,
      evaluationRecords: 45,
      classes: [
        { id: 'g3c1', name: '三年级1班', covered: 45, total: 45, evaluationRecords: 45 },
      ],
    },
  ],
  inputSources: [],
  fiveEducationStats: [],
  teacherScoreSummaries: [],
});

if (snapshotWithEvaluationRecords.gradeCoverages[0].evaluationRecords !== 45) {
  throw new Error('年级评价数应按学生明细记录条数保留，而不是按教师提交次数统计');
}

if (snapshotWithEvaluationRecords.gradeCoverages[0].classes[0].evaluationRecords !== 45) {
  throw new Error('班级评价数应按学生明细记录条数保留');
}
