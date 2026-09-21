/**
 * 校长助理自由对话领域逻辑
 *
 * 与班主任助理保持同一套回答结构（结论 + 数据点 + 分析 + 建议），
 * 但只使用学校层级的数据口径：本周管理建议、上月学校复盘、学期学校报告。
 * 默认推荐问题全部指向学校运行与班级关注，不下沉到单个学生。
 */
import type { PrincipalAssistantSnapshot } from '../data/principalAssistant.ts';
import type {
    AssistantAiInsight,
    AssistantAnswerBreakdown,
    AssistantAnswerMetric,
} from './assistantAnswerShape.ts';

export type PrincipalAssistantAnswerType =
    | 'school_week_focus'
    | 'school_month_review'
    | 'school_class_focus'
    | 'school_term_summary'
    | 'clarification'
    | 'unavailable';

export interface PrincipalAssistantAnswer {
    answerType: PrincipalAssistantAnswerType;
    message: string;
    metrics: AssistantAnswerMetric[];
    breakdown: AssistantAnswerBreakdown[];
    analysis: AssistantAiInsight[];
    suggestions: AssistantAiInsight[];
    evidenceRefs: string[];
    promptVersion: string;
    dataSnapshotId: string;
}

interface AskPrincipalAssistantQuestionInput {
    question: string;
    snapshot: PrincipalAssistantSnapshot;
}

/** 输入控件上方的首选问题：三条都只看学校运行和班级关注。 */
export const PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS = [
    '本周学校需要重点关注什么？',
    '上月复盘发现了哪些持续问题？',
    '哪些班级需要重点关注？',
] as const;

export const PRINCIPAL_ASSISTANT_FIXED_QUESTIONS = [
    { id: 'school_week_focus', label: PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS[0] },
    { id: 'school_month_review', label: PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS[1] },
    { id: 'school_class_focus', label: PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS[2] },
] as const;

/** 回答后的连续追问：每个意图都给 3 条，正好是另外三类问题。 */
export const PRINCIPAL_ASSISTANT_FOLLOW_UP_QUESTIONS: Record<PrincipalAssistantAnswerType, readonly string[]> = {
    school_week_focus: [
        '哪些班级需要重点关注？',
        '上月复盘发现了哪些持续问题？',
        '本学期学校整体情况如何？',
    ],
    school_month_review: [
        '哪些班级需要重点关注？',
        '本周学校需要重点关注什么？',
        '本学期学校整体情况如何？',
    ],
    school_class_focus: [
        '本周学校需要重点关注什么？',
        '上月复盘发现了哪些持续问题？',
        '本学期学校整体情况如何？',
    ],
    school_term_summary: [
        '本周学校需要重点关注什么？',
        '上月复盘发现了哪些持续问题？',
        '哪些班级需要重点关注？',
    ],
    clarification: PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS,
    unavailable: PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS,
};

export const PRINCIPAL_ASSISTANT_CHAT_PROMPT_VERSION = 'principal-assistant-chat-v1';

/** 回复中的分析提示：校长助理只有学校一套数据口径，不冒充班级或学生口径。 */
export const PRINCIPAL_ASSISTANT_REPLYING_LABEL = '正在分析学校数据';

const includesAny = (question: string, keywords: readonly string[]) => (
    keywords.some(keyword => question.includes(keyword))
);

const createInsight = (title: string, body: string): AssistantAiInsight => ({ title, body });

const createBreakdown = (label: string, value: string, detail = ''): AssistantAnswerBreakdown => ({
    label,
    value: value.replace(/[。；;\s]+$/, ''),
    detail,
});

/** 班级关注优先于周月口径：「哪些班级需要重点关注」不能被“重点”抢先判成本周问题。 */
const CLASS_KEYWORDS = ['哪些班级', '重点班级', '需要关注的班级', '低频班级', '无新增'];
const TERM_KEYWORDS = ['本学期', '这学期', '学期整体', '学期情况', '学期报告'];
const MONTH_KEYWORDS = ['上月', '上个月', '月度', '复盘', '持续问题', '环比'];
const WEEK_KEYWORDS = ['本周', '这周', '上周', '管理建议', '管理动作', '重点关注', '优先'];

const resolveQuestionIntent = (question: string): PrincipalAssistantAnswerType | null => {
    const normalized = question.trim();
    const fixed = PRINCIPAL_ASSISTANT_FIXED_QUESTIONS.find(item => item.label === normalized);
    if (fixed) return fixed.id;

    if (includesAny(normalized, CLASS_KEYWORDS)) return 'school_class_focus';
    if (includesAny(normalized, TERM_KEYWORDS)) return 'school_term_summary';
    if (includesAny(normalized, MONTH_KEYWORDS)) return 'school_month_review';
    if (includesAny(normalized, WEEK_KEYWORDS)) return 'school_week_focus';
    return null;
};

const buildClarificationAnswer = (
    snapshot: PrincipalAssistantSnapshot,
): PrincipalAssistantAnswer => ({
    answerType: 'clarification',
    message: '我可以基于学校本周运行数据、上月复盘和本学期报告，回答学校需要重点关注什么、哪些班级需要重点关注，以及学期整体情况。请换一种问法。',
    metrics: [],
    breakdown: [],
    analysis: [],
    suggestions: [],
    evidenceRefs: [],
    promptVersion: PRINCIPAL_ASSISTANT_CHAT_PROMPT_VERSION,
    dataSnapshotId: snapshot.id,
});

/** 本周重点：先给上周学校运行数据，再给本周优先判断和管理动作。 */
const buildWeekAnswer = (
    snapshot: PrincipalAssistantSnapshot,
): PrincipalAssistantAnswer => {
    const week = snapshot.week;
    const [events, coverage, teachers, classes] = week.metrics;

    return {
        answerType: 'school_week_focus',
        message: `上周（${week.periodLabel}）共产生${events.value}条评价事件，学生覆盖${coverage.value}，活跃教师${teachers.value}，活跃班级${classes.value}。`,
        metrics: week.metrics.map(metric => ({ label: metric.label, value: metric.value })),
        breakdown: week.findings.map(finding => createBreakdown(finding.title, finding.detail)),
        analysis: [createInsight('本周优先判断', week.judgement)],
        suggestions: week.actions.map(action => createInsight(action.title, action.detail)),
        evidenceRefs: week.findings.map(finding => finding.title),
        promptVersion: PRINCIPAL_ASSISTANT_CHAT_PROMPT_VERSION,
        dataSnapshotId: snapshot.id,
    };
};

/** 上月复盘：持续问题与改善进展分开说，避免把进展当问题重复汇报。 */
const buildMonthAnswer = (
    snapshot: PrincipalAssistantSnapshot,
): PrincipalAssistantAnswer => {
    const month = snapshot.month;
    const [events, coverage, teachers, median] = month.metrics;

    return {
        answerType: 'school_month_review',
        message: `上月（${month.periodLabel}）共产生${events.value}条评价事件，学生覆盖${coverage.value}，活跃教师${teachers.value}，班级记录中位数${median.value}条。`,
        metrics: month.metrics.map(metric => ({ label: metric.label, value: metric.value })),
        breakdown: month.findings.map(finding => createBreakdown(finding.title, finding.detail)),
        analysis: [
            createInsight('月度总体判断', month.judgement),
            ...month.progress.map(item => createInsight(`改善进展·${item.title}`, `${item.title}：${item.evidence}`)),
        ],
        suggestions: month.actions.map(action => createInsight(action.title, action.detail)),
        evidenceRefs: month.findings.map(finding => finding.title),
        promptVersion: PRINCIPAL_ASSISTANT_CHAT_PROMPT_VERSION,
        dataSnapshotId: snapshot.id,
    };
};

/** 重点班级：点名到具体班级，并说明每个班需要核实什么。 */
const buildClassFocusAnswer = (
    snapshot: PrincipalAssistantSnapshot,
): PrincipalAssistantAnswer => {
    const classes = snapshot.focusClasses;

    return {
        answerType: 'school_class_focus',
        message: classes.length > 0
            ? `本周有${classes.length}个班级需要重点关注：${classes.map(item => item.className).join('、')}。`
            : '本周还没有需要单独跟进的班级。',
        metrics: [{ label: '重点关注班级', value: `${classes.length}个`, tone: 'negative' }],
        breakdown: classes.map(item => createBreakdown(item.className, item.evidence, item.signal)),
        analysis: [
            createInsight(
                '为什么要关注',
                '这几个班的问题不在记录总量，而在记录来源和连续性：有的上周没有新增，有的依赖少数教师，有的集中在少数日期。先逐班核实原因，不做统一归因。',
            ),
        ],
        suggestions: [
            createInsight('逐班核实', '对照高频班级的记录节奏，区分账号、流程、场景安排三类原因，每班只定一项最小改善动作。'),
        ],
        evidenceRefs: classes.map(item => item.className),
        promptVersion: PRINCIPAL_ASSISTANT_CHAT_PROMPT_VERSION,
        dataSnapshotId: snapshot.id,
    };
};

/** 学期整体：给累计口径和可复制的做法，不重复周月的操作细节。 */
const buildTermAnswer = (
    snapshot: PrincipalAssistantSnapshot,
): PrincipalAssistantAnswer => {
    const term = snapshot.term;

    return {
        answerType: 'school_term_summary',
        message: `本学期累计评价${term.metrics[0].value}条，学生覆盖${term.metrics[1].value}，活跃教师占比${term.metrics[2].value}，人均评价${term.metrics[3].value}条。`,
        metrics: term.metrics.map(metric => ({ label: metric.label, value: metric.value })),
        breakdown: term.usage.map(item => createBreakdown(item.title, item.detail)),
        analysis: [
            createInsight('学期总体结论', term.conclusion),
            ...term.highlights.slice(1).map(item => createInsight(`可复制做法·${item.title}`, `${item.title}：${item.evidence}`)),
        ],
        suggestions: term.actions.map(action => createInsight(action.title, action.detail)),
        evidenceRefs: term.usage.map(item => item.title),
        promptVersion: PRINCIPAL_ASSISTANT_CHAT_PROMPT_VERSION,
        dataSnapshotId: snapshot.id,
    };
};

export const askPrincipalAssistantQuestion = ({
    question,
    snapshot,
}: AskPrincipalAssistantQuestionInput): PrincipalAssistantAnswer => {
    const intent = resolveQuestionIntent(question);
    if (!intent) return buildClarificationAnswer(snapshot);
    if (intent === 'school_class_focus') return buildClassFocusAnswer(snapshot);
    if (intent === 'school_term_summary') return buildTermAnswer(snapshot);
    if (intent === 'school_month_review') return buildMonthAnswer(snapshot);
    return buildWeekAnswer(snapshot);
};
