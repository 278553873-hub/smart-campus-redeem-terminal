import assert from 'node:assert/strict';
import {
  CLASS_EVALUATION_FIXED_QUESTIONS,
  askClassEvaluationQuestion,
  calculateClassEvaluationSnapshot,
} from './classEvaluationAssistantV2.ts';
import {
    CLASS_EVALUATION_PERIOD,
    CLASS_EVALUATION_RECORDS,
    CLASS_EVALUATION_WEEKS,
    getClassEvaluationRecords,
    getClassEvaluationSnapshot,
} from '../data/classEvaluationAssistantV2.ts';

const snapshot = calculateClassEvaluationSnapshot(
  'c_2025_4',
  CLASS_EVALUATION_PERIOD.start,
  CLASS_EVALUATION_PERIOD.end,
  CLASS_EVALUATION_RECORDS,
);

assert.equal(snapshot.deduction, 4.5);
assert.equal(snapshot.finalScore, 95.5);
assert.equal(snapshot.recordCount, 8);
assert.ok(!('classDeduction' in snapshot));
assert.ok(!('teacherDeduction' in snapshot));
assert.ok(
  getClassEvaluationRecords('c_2025_4').every(record => record.date <= '2026-08-07'),
  '进行中周的模拟明细不得晚于面板所示的数据截止时间',
);

assert.equal(CLASS_EVALUATION_WEEKS.length, 3, '周评面板应提供当前周和两个历史周。');
assert.equal(CLASS_EVALUATION_WEEKS[0].label, '8月3日-8月9日');
assert.equal(CLASS_EVALUATION_WEEKS[0].dataRangeLabel, '8月3日-8月7日');
assert.equal(CLASS_EVALUATION_WEEKS[0].gradeRank, 2);
assert.ok(!('overallRank' in CLASS_EVALUATION_WEEKS[0]));
for (const week of CLASS_EVALUATION_WEEKS) {
  assert.equal(week.dimensionRankings.length, 5, `${week.label} 应包含五个一级指标。`);
  assert.ok(
    week.dimensionRankings.every(item => item.maxScore === 20 && item.score <= item.maxScore),
    `${week.label} 的五个一级指标应分别携带评价表中的20分满分上限。`,
  );
  assert.ok(
    week.dimensionRankings.every(item => item.gradeRank > 0 && item.schoolRank > 0),
    `${week.label} 的五个一级指标应同时携带年级排名和全校排名。`,
  );
  const dimensionTotal = week.dimensionRankings.reduce((sum, item) => sum + item.score, 0);
  assert.equal(
    Number(dimensionTotal.toFixed(1)),
    getClassEvaluationSnapshot('c_2025_4', week.id).finalScore,
    `${week.label} 的五项得分合计应与周快照一致。`,
  );
}

for (const record of CLASS_EVALUATION_RECORDS) {
  for (const field of ['classDeduction', 'teacherDeduction', 'responsibility', 'rectificationStatus', 'actions']) {
    assert.ok(!(field in record), `${record.id} 不应包含系统并不存在的 ${field} 字段`);
  }
}

assert.deepEqual(
  CLASS_EVALUATION_FIXED_QUESTIONS.map(question => question.label),
  ['本周班级评比表现怎么样？', '本周扣分反映出哪些主要问题？', '下周应该重点关注什么？'],
  'V2 应只提供三项同时覆盖数据统计和分析建议的固定问题。',
);

const currentWeek = CLASS_EVALUATION_WEEKS[0];
const previousWeekConfig = CLASS_EVALUATION_WEEKS[1];
const previousSnapshot = getClassEvaluationSnapshot('c_2025_4', previousWeekConfig.id);
const assistantInput = {
  snapshot,
  records: CLASS_EVALUATION_RECORDS,
  gradeRank: currentWeek.gradeRank,
  rankings: currentWeek.dimensionRankings,
  previousWeek: {
    label: previousWeekConfig.label,
    finalScore: previousSnapshot.finalScore,
    gradeRank: previousWeekConfig.gradeRank,
    dimensionRankings: previousWeekConfig.dimensionRankings,
  },
};

const weeklyPerformance = askClassEvaluationQuestion({
  ...assistantInput,
  question: CLASS_EVALUATION_FIXED_QUESTIONS[0].label,
});
assert.equal(weeklyPerformance.answerType, 'weekly_performance');
assert.match(weeklyPerformance.message, /本周当前得分95.5分，年级第2名/);
assert.equal(weeklyPerformance.breakdown.length, 5);
assert.equal(weeklyPerformance.breakdown[2].label, '健体班级');
assert.equal(weeklyPerformance.breakdown[2].value, '18.2\/20.0分');
assert.ok(weeklyPerformance.metrics.length > 0);
assert.ok(weeklyPerformance.analysis.length > 0);
assert.ok(weeklyPerformance.suggestions.length > 0);
assert.equal(weeklyPerformance.evidenceRefs.length, 8);

const deductionPatterns = askClassEvaluationQuestion({
  ...assistantInput,
  question: CLASS_EVALUATION_FIXED_QUESTIONS[1].label,
});
assert.equal(deductionPatterns.answerType, 'deduction_patterns');
assert.equal(deductionPatterns.breakdown[0].label, '健体班级');
assert.equal(deductionPatterns.breakdown[0].value, '-1.8分');
assert.match(deductionPatterns.analysis[0].body, /76%/);
assert.ok(deductionPatterns.metrics.length > 0);
assert.ok(deductionPatterns.suggestions.length > 0);
assert.equal(deductionPatterns.evidenceRefs.length, 8);

const nextWeekFocus = askClassEvaluationQuestion({
  ...assistantInput,
  question: CLASS_EVALUATION_FIXED_QUESTIONS[2].label,
});
assert.equal(nextWeekFocus.answerType, 'next_week_focus');
assert.match(nextWeekFocus.message, /下降2.0分/);
assert.equal(nextWeekFocus.metrics.find(item => item.label === '较上周')?.value, '-2.0分');
assert.equal(nextWeekFocus.breakdown.find(item => item.label === '美净班级')?.value, '-1.2分');
assert.ok(nextWeekFocus.analysis.length > 0);
assert.ok(nextWeekFocus.suggestions.length > 0);

for (const answer of [weeklyPerformance, deductionPatterns, nextWeekFocus]) {
  assert.ok(answer.promptVersion.endsWith('-v1'), '每项固定问题都应记录提示词版本。');
  assert.equal(answer.dataSnapshotId, snapshot.id, '每项回答都应绑定生成时的数据快照。');
}

const unsupportedQuestion = askClassEvaluationQuestion({
  ...assistantInput,
  question: '眼操扣分规则是什么',
});
assert.equal(unsupportedQuestion.answerType, 'clarification');
assert.match(unsupportedQuestion.message, /请选择下方固定问题/);
assert.deepEqual(unsupportedQuestion.evidenceRefs, []);

const snapshotOnly = getClassEvaluationSnapshot('c_2025_1');
const unavailable = askClassEvaluationQuestion({
  question: CLASS_EVALUATION_FIXED_QUESTIONS[0].label,
  snapshot: snapshotOnly,
  records: [],
  gradeRank: currentWeek.gradeRank,
  rankings: currentWeek.dimensionRankings,
});
assert.equal(unavailable.answerType, 'unavailable');
assert.match(unavailable.message, /没有对应扣分明细/);
assert.deepEqual(unavailable.evidenceRefs, []);
assert.deepEqual(unavailable.analysis, []);
assert.deepEqual(unavailable.suggestions, []);

console.log('Class evaluation assistant V2 domain assertions passed');
