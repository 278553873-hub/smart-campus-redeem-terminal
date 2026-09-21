import assert from 'node:assert/strict';
import {
    HEADTEACHER_ASSISTANT_FOLLOW_UP_COUNT,
    HEADTEACHER_ASSISTANT_REPLYING_LABELS,
    buildCapabilityNoticeAnswer,
    buildUnknownQuestionAnswer,
    getFollowUpQuestions,
    getInitialSuggestedQuestions,
    resolveQuestionRoute,
} from './headteacherAssistantConversation.ts';
import { CLASS_EVALUATION_SUGGESTED_QUESTIONS } from './classEvaluationAssistantV2.ts';
import { STUDENT_EVALUATION_SUGGESTED_QUESTIONS } from './studentEvaluationAssistant.ts';

const classOnly = { showClassEvaluation: true, showStudentEvaluation: false };
const studentOnly = { showClassEvaluation: false, showStudentEvaluation: true };
const both = { showClassEvaluation: true, showStudentEvaluation: true };
const none = { showClassEvaluation: false, showStudentEvaluation: false };

// 1. 新会话建议问题：都开通时用班级评比问题，仅学生评价时用更短的学生评价问题
assert.deepEqual(getInitialSuggestedQuestions(classOnly), [...CLASS_EVALUATION_SUGGESTED_QUESTIONS]);
assert.deepEqual(getInitialSuggestedQuestions(both), [...CLASS_EVALUATION_SUGGESTED_QUESTIONS]);
assert.deepEqual(getInitialSuggestedQuestions(studentOnly), [...STUDENT_EVALUATION_SUGGESTED_QUESTIONS]);
assert.deepEqual(getInitialSuggestedQuestions(none), []);
assert.equal(STUDENT_EVALUATION_SUGGESTED_QUESTIONS.every(question => question.length <= 14), true, '学生评价建议问题应保持短句，且单行不折行');

// 2. 预设问题按能力归属，跨能力提问要能识别出未开通
assert.deepEqual(resolveQuestionRoute(CLASS_EVALUATION_SUGGESTED_QUESTIONS[0], both), { capability: 'class', enabled: true });
assert.deepEqual(resolveQuestionRoute(STUDENT_EVALUATION_SUGGESTED_QUESTIONS[0], both), { capability: 'student', enabled: true });
assert.deepEqual(resolveQuestionRoute(CLASS_EVALUATION_SUGGESTED_QUESTIONS[0], studentOnly), { capability: 'class', enabled: false });
assert.deepEqual(resolveQuestionRoute(STUDENT_EVALUATION_SUGGESTED_QUESTIONS[2], classOnly), { capability: 'student', enabled: false });

// 3. 自由提问按关键词兜底，两类口径不互相污染
assert.equal(resolveQuestionRoute('本周学生评价有多少条记录？', both).capability, 'student');
assert.equal(resolveQuestionRoute('这周扣了多少分？', both).capability, 'class');
assert.equal(resolveQuestionRoute('本月还有多少学生没有被记录', both).capability, 'student');
assert.equal(resolveQuestionRoute('今天天气怎么样', both).capability, 'unknown');

// 4. 追问固定 3 条，且不重复问过的问题
const classAnswerTypes = ['weekly_performance', 'deduction_patterns', 'next_week_focus', 'clarification', 'unavailable'];
const studentAnswerTypes = ['student_coverage', 'student_orientation', 'student_improvement'];
for (const answerType of [...classAnswerTypes, ...studentAnswerTypes, 'capability_unavailable']) {
    const questions = getFollowUpQuestions({ answerType, capabilities: both, askedQuestions: new Set() });
    assert.equal(questions.length, HEADTEACHER_ASSISTANT_FOLLOW_UP_COUNT, `${answerType} 应固定给出 3 条追问`);
    assert.equal(new Set(questions).size, 3, `${answerType} 的 3 条追问不应重复`);
}
const asked = new Set([STUDENT_EVALUATION_SUGGESTED_QUESTIONS[0]]);
const followUps = getFollowUpQuestions({ answerType: 'student_coverage', capabilities: studentOnly, askedQuestions: asked });
assert.equal(followUps.length, 3);
assert.ok(!followUps.includes(STUDENT_EVALUATION_SUGGESTED_QUESTIONS[0]), '追问不应重复已经问过的问题');
assert.equal(
    getFollowUpQuestions({ answerType: 'student_coverage', capabilities: both, askedQuestions: new Set() })
        .every(question => resolveQuestionRoute(question, both).capability === 'student'),
    true,
    '学生评价回答的追问应继续落在学生评价口径',
);

// 4.1 追问不得越出已开通的能力范围
for (const answerType of ['clarification', 'unavailable', 'student_coverage', 'capability_unavailable']) {
    const questions = getFollowUpQuestions({ answerType, capabilities: studentOnly, askedQuestions: new Set() });
    assert.equal(questions.length, HEADTEACHER_ASSISTANT_FOLLOW_UP_COUNT, `${answerType} 应固定给出 3 条追问`);
    assert.equal(
        questions.every(question => resolveQuestionRoute(question, studentOnly).capability === 'student'),
        true,
        `仅开通学生评价时追问不得出现班级评比问题：${questions.join(' / ')}`,
    );
}

// 4.2 分析提示按归属能力给出，未识别时不冒充某一类口径
assert.equal(HEADTEACHER_ASSISTANT_REPLYING_LABELS.class, '正在分析班级评比数据');
assert.equal(HEADTEACHER_ASSISTANT_REPLYING_LABELS.student, '正在分析学生评价数据');
assert.equal(
    new Set(Object.values(HEADTEACHER_ASSISTANT_REPLYING_LABELS)).size,
    3,
    '三类分析提示不应重复，未识别时必须给出中性文案',
);

// 5. 未开通与未识别都要说明边界
const notice = buildCapabilityNoticeAnswer('student', classOnly);
assert.equal(notice.answerType, 'capability_unavailable');
assert.ok(notice.message.includes('没有开通学生评价'));
assert.ok(buildUnknownQuestionAnswer(both).message.includes('学生评价的记录覆盖'));
assert.ok(buildUnknownQuestionAnswer(classOnly).message.includes('班级评比'));

console.log('✅ 班主任助理对话编排断言通过（问题分组、路由、固定 3 条追问）');
