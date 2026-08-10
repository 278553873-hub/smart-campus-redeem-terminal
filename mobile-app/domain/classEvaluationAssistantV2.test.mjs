import assert from 'node:assert/strict';
import {
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
assert.equal(snapshot.classDeduction, 3.4);
assert.equal(snapshot.teacherDeduction, 1.1);
assert.equal(snapshot.recordCount, 8);
assert.ok(
  getClassEvaluationRecords('c_2025_4').every(record => record.date <= '2026-08-07'),
  '进行中周的模拟明细不得晚于面板所示的数据截止时间',
);

assert.equal(CLASS_EVALUATION_WEEKS.length, 3, '周评面板应提供当前周和两个历史周。');
assert.equal(CLASS_EVALUATION_WEEKS[0].label, '8月3日-8月9日');
assert.equal(CLASS_EVALUATION_WEEKS[0].dataRangeLabel, '8月3日-8月7日');
assert.equal(CLASS_EVALUATION_WEEKS[0].overallRank, 2);
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
  assert.equal(
    Number((record.classDeduction + record.teacherDeduction).toFixed(1)),
    record.deduction,
    `${record.id} 的责任拆分必须等于该笔总扣分`,
  );
}

const earlyExercise = askClassEvaluationQuestion({
  question: '早操具体扣在哪里',
  snapshot,
  records: CLASS_EVALUATION_RECORDS,
});
assert.equal(earlyExercise.answerType, 'deduction_detail');
assert.equal(earlyExercise.evidenceRefs.length, 2);
assert.ok(earlyExercise.breakdown.every(item => item.label.includes('早操')));

const advice = askClassEvaluationQuestion({
  question: '怎么改',
  snapshot,
  records: CLASS_EVALUATION_RECORDS,
  previousContext: earlyExercise.context,
});
assert.equal(advice.answerType, 'action_advice');
assert.equal(advice.context.indicator, '早操');
assert.deepEqual(advice.evidenceRefs, earlyExercise.evidenceRefs);
assert.ok(advice.actions.length > 0);

const teacherResponsibility = askClassEvaluationQuestion({
  question: '哪些属于教师组织责任',
  snapshot,
  records: CLASS_EVALUATION_RECORDS,
});
assert.equal(teacherResponsibility.answerType, 'responsibility');
assert.equal(teacherResponsibility.metrics[0].value, '-1.1');
assert.ok(teacherResponsibility.evidenceRefs.every(id => (
  CLASS_EVALUATION_RECORDS.find(record => record.id === id)?.teacherDeduction > 0
)));

const eyeExerciseRule = askClassEvaluationQuestion({
  question: '眼操扣分规则是什么',
  snapshot,
  records: CLASS_EVALUATION_RECORDS,
});
assert.equal(eyeExerciseRule.answerType, 'rule');
assert.match(eyeExerciseRule.message, /教师组织责任扣0\.3分/);

const fitnessAdvice = askClassEvaluationQuestion({
  question: '健体班级怎么提升',
  snapshot,
  records: CLASS_EVALUATION_RECORDS,
});
assert.equal(fitnessAdvice.answerType, 'action_advice');
assert.equal(fitnessAdvice.context.indicator, '健体班级');
assert.ok(fitnessAdvice.evidenceRefs.every(id => (
  CLASS_EVALUATION_RECORDS.find(record => record.id === id)?.dimension === '健体班级'
)));

const weeklyAdvice = askClassEvaluationQuestion({
  question: '本周怎么改',
  snapshot,
  records: CLASS_EVALUATION_RECORDS,
});
assert.equal(weeklyAdvice.answerType, 'action_advice');
assert.deepEqual(
  weeklyAdvice.actions.map(action => action.title),
  [
    '下楼前完成一次队列静默检查',
    '值日结束前由组长复查楼梯转角',
    '将早操到岗提醒提前至集合前5分钟',
  ],
  '整改建议应优先选择未整改、待复核且扣分较高的事项',
);

const snapshotOnly = getClassEvaluationSnapshot('c_2025_1');
const unavailable = askClassEvaluationQuestion({
  question: '为什么扣分',
  snapshot: snapshotOnly,
  records: [],
});
assert.equal(unavailable.answerType, 'unavailable');
assert.match(unavailable.message, /没有对应扣分明细/);
assert.deepEqual(unavailable.evidenceRefs, []);

console.log('Class evaluation assistant V2 domain assertions passed');
