import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./AiHeadteacherAssistantV2View.tsx', import.meta.url), 'utf8');

const requireText = (text, message) => {
    assert.ok(viewSource.includes(text), message);
};

// 1. 输入控件与能力解耦：只要开通了任一评价能力，底部就有语音/文字录入
requireText(
    '{(showClassEvaluation || showStudentEvaluation) && !activeReport && !isGenerating && !historyOpen && (',
    '输入控件应只受“是否开通任一评价能力”控制，不能只跟随班级评价。',
);
assert.ok(
    !viewSource.includes('{showClassEvaluation && !activeReport && !isGenerating && !historyOpen && ('),
    '输入控件不应再被班级评价单独拦住。',
);
requireText("'按住说话'", '语音输入应保留在常驻输入控件里。');

// 2. 输入提示随能力组合变化
requireText("showStudentEvaluation\n            ? '输入学生评价问题'", '仅学生评价时应提示学生评价口径。');
requireText(": '输入班级评比问题';", '仅班级评价时应提示班级评比口径。');
requireText("? '输入问题'", '两类能力都开通时应使用中性提示。');
requireText('aria-label={placeholder}', '输入框的可读名称应与提示保持一致。');

// 3. 建议问题按能力组合取，并且回答后固定 3 条追问
requireText(
    'const OVERVIEW_RECOMMENDED_QUESTIONS = getInitialSuggestedQuestions(capabilities);',
    '新会话建议问题应按开通能力组合生成。',
);
requireText(
    'suggestedQuestions={messages.length > 0 ? followUpQuestions : OVERVIEW_RECOMMENDED_QUESTIONS}',
    '输入区应继续按对话状态切换首轮建议与连续追问。',
);
requireText(
    'getFollowUpQuestions({ answerType: latestAnswer.answerType, capabilities, askedQuestions })',
    '追问生成应同时带上能力组合与已问问题。',
);

// 4. 提问按能力路由：学生评价进入学生评价问答，未开通时说清边界
requireText('resolveQuestionRoute(question, capabilities)', '提问应先解析归属能力。');
requireText(
    'askStudentEvaluationQuestion({ question, snapshot: studentSnapshot })',
    '学生评价问题应进入学生评价问答领域逻辑。',
);
requireText('buildCapabilityNoticeAnswer(', '问到未开通能力时应明确说明边界。');
requireText('buildUnknownQuestionAnswer(capabilities)', '未识别问题应一次说清可回答范围。');
requireText(
    'getStudentEvaluationSnapshot(resolvedClassId)',
    '学生评价问答应跟随当前班级上下文。',
);

// 5. 对话外壳按能力组合命名，回复中的分析提示也要区分口径
requireText(
    "showClassEvaluation && showStudentEvaluation\n        ? '班主任助理对话'",
    '双开时对话区应使用统一助理名称。',
);
requireText('ariaLabel={conversationLabel}', '对话区名称应随能力组合变化。');
requireText(
    'HEADTEACHER_ASSISTANT_REPLYING_LABELS[replyingCapability]',
    '回复中的分析提示应由领域层按问题归属能力给出。',
);
requireText(
    "setReplyingCapability(route.enabled ? route.capability : 'unknown')",
    '未开通的能力不应冒充某一类口径展示分析提示。',
);

console.log('✅ 班主任助理能力组合预览断言通过（输入常驻、问题分组、路由与追问）');
