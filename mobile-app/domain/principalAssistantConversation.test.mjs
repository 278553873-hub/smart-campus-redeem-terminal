import assert from 'node:assert/strict';
import {
    PRINCIPAL_ASSISTANT_CHAT_PROMPT_VERSION,
    PRINCIPAL_ASSISTANT_FOLLOW_UP_QUESTIONS,
    PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS,
    askPrincipalAssistantQuestion,
} from './principalAssistantConversation.ts';
import { getPrincipalAssistantSnapshot } from '../data/principalAssistant.ts';

const snapshot = getPrincipalAssistantSnapshot();
const ask = (question) => askPrincipalAssistantQuestion({ question, snapshot });

// 1. 新会话的固定建议问题只看学校运行和班级关注，不下沉到学生，也不问校长自己的复盘
assert.deepEqual([...PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS], [
    '本周学校需要重点关注什么？',
    '上月复盘发现了哪些持续问题？',
    '哪些班级需要重点关注？',
]);
assert.equal(
    PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS.some(question => /学生|我该|我的/.test(question)),
    false,
    '校长助理的默认问题不应下沉到单个学生',
);

// 2. 数据快照与三份报告同源：周、月、学期指标直接取自报告样本
assert.equal(snapshot.week.metrics[0].value, '1,843');
assert.equal(snapshot.month.metrics[0].value, '4,920');
assert.equal(snapshot.term.metrics[0].value, '8,260');
assert.equal(snapshot.focusClasses.length, 4, '班级关注应给出演示名单');

// 3. 三条默认问题各自命中对应口径，且班级关注不被“重点”抢走
assert.equal(ask(PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS[0]).answerType, 'school_week_focus');
assert.equal(ask(PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS[1]).answerType, 'school_month_review');
assert.equal(ask(PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS[2]).answerType, 'school_class_focus');
assert.equal(ask('重点班级有哪些？').answerType, 'school_class_focus');
assert.equal(ask('这周有什么要注意的？').answerType, 'school_week_focus');
assert.equal(ask('本学期学校整体情况如何？').answerType, 'school_term_summary');

// 4. 本周口径：数字取上周学校数据，动作来自本周管理建议
const week = ask(PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS[0]);
assert.ok(week.message.includes('1,843条'), '本周回答应包含上周评价事件数');
assert.ok(week.message.includes('93.6%'), '本周回答应包含学生覆盖');
assert.deepEqual(week.metrics.map(metric => metric.label), ['评价事件', '学生覆盖', '活跃教师', '活跃班级']);
assert.ok(week.analysis.some(item => item.title === '本周优先判断'), '本周回答应给出优先判断');
assert.ok(week.suggestions.length > 0 && week.suggestions.every(item => item.body.length > 0), '管理动作不能是空文案');

// 5. 月度口径：持续问题与改善进展分开说
const month = ask(PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS[1]);
assert.ok(month.message.includes('4,920条'), '月度回答应包含上月评价事件数');
assert.ok(month.breakdown.length > 0, '月度回答应给出持续问题');
assert.ok(
    month.analysis.some(item => item.title.startsWith('改善进展')),
    '月度回答应把改善进展与持续问题分开',
);

// 6. 班级关注：点名到具体班级，并说明每个班需要核实什么
const classes = ask(PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS[2]);
assert.equal(classes.breakdown.length, snapshot.focusClasses.length, '每个重点班级都应有一条说明');
for (const item of snapshot.focusClasses) {
    assert.ok(classes.message.includes(item.className), '班级关注回答应点名到班：' + item.className);
    assert.ok(classes.breakdown.some(entry => entry.label === item.className && entry.detail === item.signal), '重点班级应给出关注原因');
}
assert.equal(classes.metrics[0].tone, 'negative', '需要重点关注的班级属于待改进项');
assert.equal(
    classes.message.includes('学生'),
    false,
    '班级关注回答不应下沉到单个学生',
);

// 7. 学期口径：给累计数字和可复制做法，不重复周月操作细节
const term = ask('本学期学校整体情况如何？');
assert.ok(term.message.includes('8,260条'), '学期回答应包含累计评价');
assert.ok(term.message.includes('55.36%'), '学期回答应包含活跃教师占比');
assert.ok(term.analysis.some(item => item.title.startsWith('可复制做法')), '学期回答应提炼可复制做法');

// 8. 每次回答后固定给 3 条追问，全部落在三类学校口径内，并且不重复当前问题
const knownQuestions = new Set([
    ...PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS,
    '本学期学校整体情况如何？',
]);
for (const [answerType, questions] of Object.entries(PRINCIPAL_ASSISTANT_FOLLOW_UP_QUESTIONS)) {
    assert.equal(questions.length, 3, '每个回答口径都应给出 3 条追问：' + answerType);
    assert.equal(new Set(questions).size, 3, '追问不应重复：' + answerType);
    for (const question of questions) {
        assert.ok(knownQuestions.has(question), '追问不能超出学校口径范围：' + question);
    }
}
assert.equal(
    PRINCIPAL_ASSISTANT_FOLLOW_UP_QUESTIONS.school_week_focus.includes(PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS[0]),
    false,
    '追问不应重复刚问过的问题',
);

// 9. 范围外的问题只说明可回答范围，不编造数据
const unknown = ask('今天天气怎么样？');
assert.equal(unknown.answerType, 'clarification');
assert.equal(unknown.metrics.length, 0);
assert.equal(unknown.breakdown.length, 0);
assert.equal(unknown.suggestions.length, 0);

// 10. 所有回答都带同一份快照与提示词版本，便于回溯证据
for (const answer of [week, month, classes, term, unknown]) {
    assert.equal(answer.dataSnapshotId, snapshot.id, '回答应指向同一份数据快照');
    assert.equal(answer.promptVersion, PRINCIPAL_ASSISTANT_CHAT_PROMPT_VERSION);
    assert.ok(answer.evidenceRefs.length > 0 || answer.answerType === 'clarification');
}

console.log('principalAssistantConversation assertions passed');
