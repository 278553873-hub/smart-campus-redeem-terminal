import assert from 'node:assert/strict';
import {
    STUDENT_EVALUATION_FOLLOW_UP_QUESTIONS,
    STUDENT_EVALUATION_SUGGESTED_QUESTIONS,
    askStudentEvaluationQuestion,
} from './studentEvaluationAssistant.ts';
import { getStudentEvaluationSnapshot } from '../data/studentEvaluationAssistant.ts';

const snapshot = getStudentEvaluationSnapshot('c_2025_4');
const ask = (index) => askStudentEvaluationQuestion({
    question: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[index],
    snapshot,
});
const askText = (question) => askStudentEvaluationQuestion({ question, snapshot });

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

// 2. 默认三条问题只看学生和记录本身，不涉及老师自己的复盘
assert.deepEqual([...STUDENT_EVALUATION_SUGGESTED_QUESTIONS], [
    '哪些学生需要我重点关注？',
    '本周哪些学生没有被评价到？',
    '表扬和待改进分别集中在哪？',
]);
assert.equal(
    STUDENT_EVALUATION_SUGGESTED_QUESTIONS.some(question => /复盘|改进什么|我该|我的/.test(question)),
    false,
    '默认推荐问题不应涉及老师自己的复盘',
);

// 3. 重点对象：点名到人，并说清每个人需要确认什么
const focus = ask(0);
assert.equal(focus.answerType, 'student_focus');
for (const name of ['李思思', '王小虎', '周明']) {
    assert.ok(focus.message.includes(name), `重点关注回答应点名到人：${name}`);
}
assert.equal(focus.breakdown.length, 3, '每位重点关注的学生都应给出发现和依据');
assert.equal(focus.suggestions.length, 2, '只有写了核实要点的学生才给核实动作');
assert.ok(focus.suggestions.every(item => item.body.length > 0), '核实动作不能是空文案');

// 4. 覆盖缺口：给出记录量、覆盖比例和没有被评价到的人数
const coverage = ask(1);
assert.equal(coverage.answerType, 'student_coverage');
assert.ok(coverage.message.includes('52条') && coverage.message.includes('41/60'), '覆盖回答应包含记录量与覆盖比例');
assert.deepEqual(coverage.metrics.map(metric => metric.label), ['本周记录', '覆盖学生', '未被评价']);
assert.equal(coverage.metrics[2].value, '19人');
assert.equal(coverage.metrics[2].tone, 'negative', '没有被评价到的学生属于待改进项');
assert.ok(coverage.analysis[0].body.includes('19位'), '分析应说明还有多少学生没有被评价到');

// 5. 记录倾向：表扬与待改进分别有多少、集中在哪
const orientation = ask(2);
assert.equal(orientation.answerType, 'student_orientation');
assert.equal(orientation.metrics.find(metric => metric.label === '表扬记录').value, '25条');
assert.equal(orientation.metrics.find(metric => metric.label === '待改进记录').value, '34条');
assert.equal(orientation.metrics.find(metric => metric.label === '使用指标').value, '9个');
assert.equal(orientation.breakdown[0].label, '集中场景', '第一条拆分应是表扬与待改进的集中场景');
assert.ok(orientation.breakdown[0].value.includes('作业与课堂提醒'), '应说明待改进集中在哪些场景');
assert.ok(orientation.breakdown[0].value.includes('竞赛'), '应说明表扬集中在哪些场景');

// 6. 换一种问法仍要落到同一意图
assert.equal(askText('哪些学生需要重点跟进？').answerType, 'student_focus');
assert.equal(askText('本月还有多少学生没有记录？').answerType, 'student_coverage');
assert.equal(askText('哪些指标用得最多？').answerType, 'student_orientation');
assert.equal(askText('我该怎么改进记录？').answerType, 'student_improvement', '复盘能力保留，只是不再进默认推荐');
assert.equal(askText('今天天气怎么样？').answerType, 'clarification');

// 7. 追问固定 3 条且互不重复
for (const [answerType, questions] of Object.entries(STUDENT_EVALUATION_FOLLOW_UP_QUESTIONS)) {
    assert.equal(questions.length, 3, `${answerType} 应固定给出 3 条追问`);
    assert.equal(new Set(questions).size, 3, `${answerType} 的追问不应重复`);
}

// 8. 没有记录明细的班级只给汇总结论，不编造原因
const insufficientSnapshot = getStudentEvaluationSnapshot('c_2025_1');
assert.equal(insufficientSnapshot.week.hasRecordDetails, false);
assert.equal(
    askStudentEvaluationQuestion({ question: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[0], snapshot: insufficientSnapshot }).answerType,
    'unavailable',
);

console.log('✅ 学生评价助理问答断言通过（重点对象、覆盖缺口、表扬与待改进、澄清、数据不足）');
