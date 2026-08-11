import assert from 'node:assert/strict';
import {
  findSavedClassEvaluationReport,
  listSavedClassEvaluationReports,
  saveClassEvaluationReport,
} from './classEvaluationAssistantV2ReportStore.ts';

const records = [
  {
    id: 'record-1',
    classId: 'class-1',
    date: '2026-08-07',
    dimension: '健体班级',
    indicator: '早操精神风貌',
    finding: '队列中有学生说话。',
    deduction: 1,
    rule: '按班级评价表扣分。',
  },
  {
    id: 'record-2',
    classId: 'class-1',
    date: '2026-08-06',
    dimension: '美净班级',
    indicator: '教室卫生',
    finding: '地面有纸屑。',
    deduction: 0.5,
    rule: '按班级评价表扣分。',
  },
];

const createReport = (evidenceRefs = ['record-1']) => ({
  message: '测试结论',
  metrics: [],
  dimensionScores: [],
  performanceInsights: [],
  deductionBreakdown: [],
  deductionInsights: [],
  nextWeekInsights: [],
  nextWeekSuggestions: [],
  evidenceRefs,
  promptVersion: 'weekly-report-v1',
  dataSnapshotId: 'snapshot-v1',
});

const saveInput = {
  classId: 'class-1',
  className: '2025级一班',
  weekId: '2026-08-03_2026-08-09',
  weekLabel: '8月3日-8月9日',
  dataRangeLabel: '8月3日-8月7日',
  report: createReport(),
  records,
  generatedAt: '2026-08-07T10:00:00.000Z',
};

const firstReport = saveClassEvaluationReport(saveInput);
assert.equal(listSavedClassEvaluationReports().length, 1, '首次主动生成后应进入往期报告。');
assert.deepEqual(firstReport.evidenceRecords.map(record => record.id), ['record-1'], '历史报告只冻结完整周报实际引用的记录。');

firstReport.report.message = '外部修改';
firstReport.evidenceRecords[0].finding = '外部修改';
const frozenReport = listSavedClassEvaluationReports()[0];
assert.equal(frozenReport.report.message, '测试结论', '已保存报告不应被外部对象污染。');
assert.equal(frozenReport.evidenceRecords[0].finding, '队列中有学生说话。', '逐笔依据应保持生成时快照。');

const replacedReport = saveClassEvaluationReport({
  ...saveInput,
  report: { ...saveInput.report, message: '同一周报更新结论' },
  generatedAt: '2026-08-07T10:05:00.000Z',
});
assert.equal(listSavedClassEvaluationReports().length, 1, '同一班级、周、快照和整份报告提示词版本不应重复保存。');
assert.equal(replacedReport.report.message, '同一周报更新结论');

saveClassEvaluationReport({
  ...saveInput,
  weekId: '2026-07-27_2026-08-02',
  weekLabel: '7月27日-8月2日',
  report: { ...createReport(['record-1', 'record-2']), dataSnapshotId: 'snapshot-v0' },
  generatedAt: '2026-08-02T10:00:00.000Z',
});
assert.equal(listSavedClassEvaluationReports().length, 2, '不同周应分别保存一份完整报告。');

const exactMatch = findSavedClassEvaluationReport({
  classId: 'class-1',
  weekId: '2026-08-03_2026-08-09',
  promptVersion: 'weekly-report-v1',
  dataSnapshotId: 'snapshot-v1',
});
assert.equal(exactMatch?.id, firstReport.id, '四项身份完全一致时应命中周报缓存。');

assert.equal(findSavedClassEvaluationReport({
  classId: 'class-1',
  weekId: '2026-08-03_2026-08-09',
  promptVersion: 'weekly-report-v2',
  dataSnapshotId: 'snapshot-v1',
}), undefined, '整份报告提示词版本变化后不得复用旧报告。');

assert.equal(findSavedClassEvaluationReport({
  classId: 'class-1',
  weekId: '2026-08-03_2026-08-09',
  promptVersion: 'weekly-report-v1',
  dataSnapshotId: 'snapshot-v2',
}), undefined, '数据快照变化后不得复用旧报告。');

console.log('Class evaluation assistant V2 report store assertions passed');
