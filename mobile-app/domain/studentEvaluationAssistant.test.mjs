import assert from 'node:assert/strict';
import {
    STUDENT_EVALUATION_SUGGESTED_QUESTIONS,
    askStudentEvaluationQuestion,
} from './studentEvaluationAssistant.ts';
import { getStudentEvaluationSnapshot } from '../data/studentEvaluationAssistant.ts';

const snapshot = getStudentEvaluationSnapshot('c_2025_4');

// 1. 快照口径应与「本周行动建议」「我的评价复盘」两份报告一致
assert.equal(snapshot.week.records, 52);
assert.equal(snapshot.week.covered, 41);
assert.equal(snapshot.week.total, 60);
assert.equal(snapshot.week.evaluators, 7);
assert.equal(snapshot.month.records, 64);
assert.equal(snapshot.month.positive, 25);
assert.equal(snapshot.month.negative, 34);
assert.equal(snapshot.month.indicatorsUsed, 9);
assert.equal(snapshot.week.focusStudents.length, 3, '本周重点学生应与报告中的学生洞察一致');

// 2. 覆盖问题：给出记录量、覆盖人数和未覆盖学生
const coverage = askStudentEvaluationQuestion({
    question: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[0],
    snapshot,
});
assert.equal(coverage.answerType, 'student_coverage');
assert.ok(coverage.message.includes('52条') && coverage.message.includes('41/60'), '覆盖回答应包含记录量与覆盖比例');
assert.deepEqual(coverage.metrics.map(metric => metric.label), ['本周记录', '覆盖学生', '未记录学生']);
assert.equal(coverage.metrics[2].value, '19人');
assert.equal(coverage.metrics[2].tone, 'negative', '未覆盖学生属于待改进项');
assert.ok(coverage.analysis[0].body.includes('19位'), '分析应说明还有多少学生没有被记录');

// 3. 记录倾向问题：正向、待改进、指标数与学生评价口径一致
const orientation = askStudentEvaluationQuestion({
    question: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[1],
    snapshot,
});
assert.equal(orientation.answerType, 'student_orientation');
assert.ok(orientation.message.includes('正向25条') && orientation.message.includes('待改进34条'));
assert.equal(orientation.metrics.find(metric => metric.label === '使用指标').value, '9个');
assert.ok(orientation.breakdown.length > 0, '记录倾向回答应说明记录视角');

// 4. 复盘改进问题：动作逐条列出，且不重复句子结束标点
const improvement = askStudentEvaluationQuestion({
    question: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[2],
    snapshot,
});
assert.equal(improvement.answerType, 'student_improvement');
assert.equal(improvement.breakdown.length, 3, '上月复盘的三条改进动作应逐条给出');
assert.ok(improvement.breakdown.every(item => !item.value.endsWith('。')), '气泡会自动补句号，条目文案不应自带句号');
assert.equal(improvement.metrics.find(metric => metric.label === '未记录学生').value, '18人');

// 5. 换一种问法仍要落到同一意图；问不出来的问题给出澄清
assert.equal(
    askStudentEvaluationQuestion({ question: '哪些学生本月还没有记录？', snapshot }).answerType,
    'student_coverage',
);
assert.equal(
    askStudentEvaluationQuestion({ question: '接下来该优先跟进谁？', snapshot }).answerType,
    'student_improvement',
);
assert.equal(askStudentEvaluationQuestion({ question: '今天天气怎么样？', snapshot }).answerType, 'clarification');

// 6. 没有记录明细的班级只给汇总结论，不编造原因
const insufficientSnapshot = getStudentEvaluationSnapshot('c_2025_1');
assert.equal(insufficientSnapshot.week.hasRecordDetails, false);
assert.equal(
    askStudentEvaluationQuestion({ question: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[0], snapshot: insufficientSnapshot }).answerType,
    'unavailable',
);

console.log('✅ 学生评价助理问答断言通过（覆盖、倾向、复盘、澄清、数据不足）');
