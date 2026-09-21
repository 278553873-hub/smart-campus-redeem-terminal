/**
 * 班主任助理对话编排：能力组合、问题路由与连续追问
 *
 * 学生评价与班级评价各自独立计算，这里只负责按学校开通的能力决定
 * 「底部给什么问题」「提问落到哪套问答」「回答后追问什么」。
 */
import {
    CLASS_EVALUATION_FOLLOW_UP_QUESTIONS,
    CLASS_EVALUATION_SUGGESTED_QUESTIONS,
} from './classEvaluationAssistantV2.ts';
import {
    STUDENT_EVALUATION_FOLLOW_UP_QUESTIONS,
    STUDENT_EVALUATION_SUGGESTED_QUESTIONS,
} from './studentEvaluationAssistant.ts';
import type { AssistantAnswerPresentation } from './assistantAnswerShape.ts';

export interface HeadteacherAssistantCapabilities {
    showClassEvaluation: boolean;
    showStudentEvaluation: boolean;
}

export type HeadteacherAssistantCapability = 'class' | 'student';

export interface HeadteacherAssistantQuestionRoute {
    capability: HeadteacherAssistantCapability | 'unknown';
    enabled: boolean;
}

export const HEADTEACHER_ASSISTANT_CAPABILITY_LABELS: Record<HeadteacherAssistantCapability, string> = {
    class: '班级评价',
    student: '学生评价',
};

/** 回复中的分析提示：按问题归属能力说明正在分析哪套数据，未识别或未开通时不冒充某一类口径。 */
export const HEADTEACHER_ASSISTANT_REPLYING_LABELS: Record<HeadteacherAssistantCapability | 'unknown', string> = {
    class: '正在分析班级评比数据',
    student: '正在分析学生评价数据',
    unknown: '正在整理回答',
};

/** 回答后固定给 3 条追问，保证连续对话永远有话可问。 */
export const HEADTEACHER_ASSISTANT_FOLLOW_UP_COUNT = 3;

const CLASS_EVALUATION_KNOWN_QUESTIONS = new Set<string>([
    ...CLASS_EVALUATION_SUGGESTED_QUESTIONS,
    ...Object.values(CLASS_EVALUATION_FOLLOW_UP_QUESTIONS).flat(),
]);

const STUDENT_EVALUATION_KNOWN_QUESTIONS = new Set<string>([
    ...STUDENT_EVALUATION_SUGGESTED_QUESTIONS,
    ...Object.values(STUDENT_EVALUATION_FOLLOW_UP_QUESTIONS).flat(),
]);

/** 未命中预设问题时按关键词兜底：班级评比优先，避免“扣分”被当成学生记录。 */
const CLASS_EVALUATION_KEYWORDS = ['班级评比', '评比', '班评', '扣', '失分', '得分', '分数', '排名', '满分', '周数据'];
const STUDENT_EVALUATION_KEYWORDS = ['学生', '覆盖', '复盘', '进步', '记录', '表现', '指标'];

const includesAny = (question: string, keywords: readonly string[]) => (
    keywords.some(keyword => question.includes(keyword))
);

/** 新会话的固定建议问题：都开通时先给班级评比问题，仅学生评价时给更短的学生评价问题。 */
export const getInitialSuggestedQuestions = (
    capabilities: HeadteacherAssistantCapabilities,
): readonly string[] => {
    if (capabilities.showClassEvaluation) return CLASS_EVALUATION_SUGGESTED_QUESTIONS;
    if (capabilities.showStudentEvaluation) return STUDENT_EVALUATION_SUGGESTED_QUESTIONS;
    return [];
};

export const resolveQuestionRoute = (
    question: string,
    capabilities: HeadteacherAssistantCapabilities,
): HeadteacherAssistantQuestionRoute => {
    const normalized = question.trim();
    if (CLASS_EVALUATION_KNOWN_QUESTIONS.has(normalized)) {
        return { capability: 'class', enabled: capabilities.showClassEvaluation };
    }
    if (STUDENT_EVALUATION_KNOWN_QUESTIONS.has(normalized)) {
        return { capability: 'student', enabled: capabilities.showStudentEvaluation };
    }
    if (includesAny(normalized, CLASS_EVALUATION_KEYWORDS)) {
        return { capability: 'class', enabled: capabilities.showClassEvaluation };
    }
    if (includesAny(normalized, STUDENT_EVALUATION_KEYWORDS)) {
        return { capability: 'student', enabled: capabilities.showStudentEvaluation };
    }
    return { capability: 'unknown', enabled: false };
};

const pickFollowUpQuestions = (
    candidates: readonly string[],
    askedQuestions: ReadonlySet<string>,
): string[] => {
    const unique = Array.from(new Set(candidates.filter(Boolean)));
    const result = unique.filter(question => !askedQuestions.has(question));
    unique.forEach(question => {
        if (result.length < HEADTEACHER_ASSISTANT_FOLLOW_UP_COUNT && !result.includes(question)) result.push(question);
    });
    let index = 0;
    while (result.length < HEADTEACHER_ASSISTANT_FOLLOW_UP_COUNT && unique.length > 0) {
        result.push(unique[index % unique.length]);
        index += 1;
    }
    return result.slice(0, HEADTEACHER_ASSISTANT_FOLLOW_UP_COUNT);
};

export const getFollowUpQuestions = ({
    answerType,
    capabilities,
    askedQuestions,
}: {
    answerType: string;
    capabilities: HeadteacherAssistantCapabilities;
    askedQuestions: ReadonlySet<string>;
}): string[] => {
    // 追问必须留在已开通的能力范围内，否则会出现学校根本没开通的班级评比问题。
    const classQuestions = capabilities.showClassEvaluation
        ? (CLASS_EVALUATION_FOLLOW_UP_QUESTIONS as Record<string, readonly string[]>)[answerType] ?? []
        : [];
    const studentQuestions = capabilities.showStudentEvaluation
        ? (STUDENT_EVALUATION_FOLLOW_UP_QUESTIONS as Record<string, readonly string[]>)[answerType] ?? []
        : [];
    return pickFollowUpQuestions(
        [...classQuestions, ...studentQuestions, ...getInitialSuggestedQuestions(capabilities)],
        askedQuestions,
    );
};

/** 未开通的能力被问到时，明确告知边界，不跨口径猜测。 */
export const buildCapabilityNoticeAnswer = (
    capability: HeadteacherAssistantCapability,
    capabilities: HeadteacherAssistantCapabilities,
): AssistantAnswerPresentation => {
    const other: HeadteacherAssistantCapability = capability === 'class' ? 'student' : 'class';
    const suggestion = capabilities[other === 'class' ? 'showClassEvaluation' : 'showStudentEvaluation']
        ? `可以改为询问${HEADTEACHER_ASSISTANT_CAPABILITY_LABELS[other]}相关的问题。`
        : '';
    return {
        answerType: 'capability_unavailable',
        message: `当前学校没有开通${HEADTEACHER_ASSISTANT_CAPABILITY_LABELS[capability]}，暂时无法回答这类问题。${suggestion}`,
        metrics: [],
        breakdown: [],
        analysis: [],
        suggestions: [],
        evidenceRefs: [],
        promptVersion: 'headteacher-assistant-routing-v1',
        dataSnapshotId: capability,
    };
};

/** 两种能力都开通时，未识别的问题要一次说清可回答的范围。 */
export const buildUnknownQuestionAnswer = (
    capabilities: HeadteacherAssistantCapabilities,
): AssistantAnswerPresentation => {
    const scopeCopy = capabilities.showClassEvaluation && capabilities.showStudentEvaluation
        ? '班级评比的得分排名、扣分记录，以及学生评价的记录覆盖、记录倾向和复盘改进'
        : capabilities.showClassEvaluation
            ? '班级评比的得分排名、扣分记录和下周建议'
            : '学生评价的记录覆盖、记录倾向和复盘改进';

    return {
        answerType: 'clarification',
        message: `我可以基于当前班级数据，回答${scopeCopy}。请换一种问法。`,
        metrics: [],
        breakdown: [],
        analysis: [],
        suggestions: [],
        evidenceRefs: [],
        promptVersion: 'headteacher-assistant-routing-v1',
        dataSnapshotId: 'headteacher-assistant-routing',
    };
};
