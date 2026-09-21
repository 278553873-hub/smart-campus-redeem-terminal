/**
 * 班主任助理「学生评价」自由对话领域逻辑
 *
 * 与班级评价问答保持同一套回答结构（结论 + 数据点 + 分析 + 建议），
 * 但只使用学生评价口径的数据，不与班级评比混合计算。
 */
import type { StudentEvaluationSnapshot } from '../data/studentEvaluationAssistant.ts';
import type {
    AssistantAiInsight,
    AssistantAnswerBreakdown,
    AssistantAnswerMetric,
} from './assistantAnswerShape.ts';

export type StudentEvaluationAnswerType =
    | 'student_coverage'
    | 'student_orientation'
    | 'student_improvement'
    | 'clarification'
    | 'unavailable';

export interface StudentEvaluationConversationContext {
    classId: string;
    periodLabel: string;
    evidenceIds: string[];
}

export interface StudentEvaluationAssistantAnswer {
    answerType: StudentEvaluationAnswerType;
    message: string;
    metrics: AssistantAnswerMetric[];
    breakdown: AssistantAnswerBreakdown[];
    analysis: AssistantAiInsight[];
    suggestions: AssistantAiInsight[];
    context: StudentEvaluationConversationContext;
    evidenceRefs: string[];
    promptVersion: string;
    dataSnapshotId: string;
}

interface AskStudentEvaluationQuestionInput {
    question: string;
    snapshot: StudentEvaluationSnapshot;
}

/** 输入控件上方的首选问题：短句直指学生评价口径，与班级评比问题区分开。 */
export const STUDENT_EVALUATION_SUGGESTED_QUESTIONS = [
    '本周覆盖了哪些学生？',
    '记录更偏向哪类表现？',
    '上月复盘后该改进什么？',
] as const;

export const STUDENT_EVALUATION_FIXED_QUESTIONS = [
    { id: 'student_coverage', label: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[0] },
    { id: 'student_orientation', label: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[1] },
    { id: 'student_improvement', label: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[2] },
] as const;

/** 回答后的连续追问：每个意图都给 3 条，保证剔除已问问题后仍能凑满 3 条。 */
export const STUDENT_EVALUATION_FOLLOW_UP_QUESTIONS: Record<StudentEvaluationAnswerType, readonly string[]> = {
    student_coverage: [
        '记录更偏向哪类表现？',
        '上月复盘后该改进什么？',
        '哪些学生本月还没有记录？',
    ],
    student_orientation: [
        '本周覆盖了哪些学生？',
        '上月复盘后该改进什么？',
        '记录集中在哪些指标？',
    ],
    student_improvement: [
        '本周覆盖了哪些学生？',
        '记录更偏向哪类表现？',
        '接下来该优先跟进谁？',
    ],
    clarification: STUDENT_EVALUATION_SUGGESTED_QUESTIONS,
    unavailable: STUDENT_EVALUATION_SUGGESTED_QUESTIONS,
};

export const STUDENT_EVALUATION_CHAT_PROMPT_VERSION = 'headteacher-student-evaluation-chat-v1';

const includesAny = (question: string, keywords: readonly string[]) => (
    keywords.some(keyword => question.includes(keyword))
);

const trimSentence = (text: string) => text.replace(/[。；;\s]+$/, '');

const createInsight = (title: string, body: string): AssistantAiInsight => ({ title, body });

const createBreakdown = (label: string, value: string, detail = ''): AssistantAnswerBreakdown => ({
    label,
    value: trimSentence(value),
    detail,
});

const createContext = (
    snapshot: StudentEvaluationSnapshot,
    evidenceIds: string[],
): StudentEvaluationConversationContext => ({
    classId: snapshot.classId,
    periodLabel: snapshot.week?.dataRange ?? snapshot.month?.dataRange ?? '',
    evidenceIds,
});

const resolveQuestionIntent = (question: string): StudentEvaluationAnswerType | null => {
    const normalized = question.trim();
    const fixed = STUDENT_EVALUATION_FIXED_QUESTIONS.find(item => item.label === normalized);
    if (fixed) return fixed.id;

    if (includesAny(normalized, ['复盘', '改进', '改善', '跟进', '下一步', '怎么做'])) return 'student_improvement';
    if (includesAny(normalized, ['覆盖', '哪些学生', '没有记录', '未记录', '还没记录'])) return 'student_coverage';
    if (includesAny(normalized, ['偏向', '倾向', '集中', '指标', '正向', '负向', '表扬', '待改进'])) return 'student_orientation';
    return null;
};

const buildUnavailableAnswer = (
    snapshot: StudentEvaluationSnapshot,
): StudentEvaluationAssistantAnswer => ({
    answerType: 'unavailable',
    message: '当前只同步了本学期学生评价的汇总数据，还没有对应的记录明细，因此暂时无法确认具体情况。',
    metrics: [
        { label: '本周记录', value: `${snapshot.week?.records ?? 0}条` },
        { label: '覆盖学生', value: `${snapshot.week?.covered ?? 0}人` },
    ],
    breakdown: [],
    analysis: [],
    suggestions: [],
    context: createContext(snapshot, []),
    evidenceRefs: [],
    promptVersion: STUDENT_EVALUATION_CHAT_PROMPT_VERSION,
    dataSnapshotId: snapshot.id,
});

const buildClarificationAnswer = (
    snapshot: StudentEvaluationSnapshot,
): StudentEvaluationAssistantAnswer => ({
    answerType: 'clarification',
    message: '我可以基于当前班级的学生评价记录，回答记录覆盖、记录倾向和上月复盘的改进动作。请换一种问法。',
    metrics: [],
    breakdown: [],
    analysis: [],
    suggestions: [],
    context: createContext(snapshot, []),
    evidenceRefs: [],
    promptVersion: STUDENT_EVALUATION_CHAT_PROMPT_VERSION,
    dataSnapshotId: snapshot.id,
});

const buildCoverageAnswer = (
    snapshot: StudentEvaluationSnapshot,
): StudentEvaluationAssistantAnswer => {
    const week = snapshot.week!;
    const uncovered = Math.max(0, week.total - week.covered);
    const focusStudents = week.focusStudents.slice(0, 3);
    const followUps = focusStudents.filter(student => student.verificationFocus);

    return {
        answerType: 'student_coverage',
        message: `本周（${week.dataRange}）共产生${week.records}条学生评价记录，覆盖${week.covered}/${week.total}名学生，来自${week.evaluators}位教师。`,
        metrics: [
            { label: '本周记录', value: `${week.records}条` },
            { label: '覆盖学生', value: `${week.covered}人` },
            { label: '未记录学生', value: `${uncovered}人`, tone: 'negative' },
        ],
        breakdown: focusStudents.map(student => createBreakdown(student.name, student.finding, student.evidence)),
        analysis: [
            createInsight(
                '覆盖情况',
                `班级名单中还有${uncovered}位同学本周没有个人记录。未出现不代表没有表现，说明目前的记录触发点还不容易捕捉安静、稳定或变化不明显的同学。`,
            ),
        ],
        suggestions: followUps.length > 0
            ? followUps.map(student => createInsight(`核实${student.name}`, student.verificationFocus))
            : [createInsight('先扩大覆盖', '每周主动观察5位本周没有被记录的同学，优先记录一个具体行为或变化。')],
        context: createContext(snapshot, focusStudents.map(student => student.name)),
        evidenceRefs: focusStudents.map(student => student.name),
        promptVersion: STUDENT_EVALUATION_CHAT_PROMPT_VERSION,
        dataSnapshotId: snapshot.id,
    };
};

const buildOrientationAnswer = (
    snapshot: StudentEvaluationSnapshot,
): StudentEvaluationAssistantAnswer => {
    const month = snapshot.month!;
    const uncovered = Math.max(0, month.total - month.covered);

    return {
        answerType: 'student_orientation',
        message: `${month.label}（${month.dataRange}）共${month.records}条记录，其中正向${month.positive}条、待改进${month.negative}条、中性${month.neutral}条，使用到${month.indicatorsUsed}个指标。`,
        metrics: [
            { label: '正向记录', value: `${month.positive}条` },
            { label: '待改进记录', value: `${month.negative}条`, tone: 'negative' },
            { label: '使用指标', value: `${month.indicatorsUsed}个` },
        ],
        breakdown: [
            createBreakdown('记录视角', month.orientationNotes[0] ?? ''),
            createBreakdown('指标与表达', month.expressionNotes[0] ?? ''),
        ].filter(item => item.value),
        analysis: [
            ...(month.coverageNotes[0] ? [createInsight('记录集中', month.coverageNotes[0])] : []),
            ...(month.expressionNotes[1] ? [createInsight('表达方式', month.expressionNotes[1])] : []),
        ],
        suggestions: month.actions.length > 0
            ? [
                createInsight('先补日常进步', month.actions[month.actions.length - 1]),
                createInsight('再补覆盖', `本月还有${uncovered}位同学没有个人记录，下周优先观察其中5位。`),
            ]
            : [],
        context: createContext(snapshot, []),
        evidenceRefs: [],
        promptVersion: STUDENT_EVALUATION_CHAT_PROMPT_VERSION,
        dataSnapshotId: snapshot.id,
    };
};

const buildImprovementAnswer = (
    snapshot: StudentEvaluationSnapshot,
): StudentEvaluationAssistantAnswer => {
    const month = snapshot.month!;
    const uncovered = Math.max(0, month.total - month.covered);

    return {
        answerType: 'student_improvement',
        message: `${month.label}复盘给出${month.actions.length}条改进动作，重点是让记录覆盖更均衡、行为描述更具体。`,
        metrics: [
            { label: '待改进记录', value: `${month.negative}条`, tone: 'negative' },
            { label: '未记录学生', value: `${uncovered}人` },
            { label: '改进动作', value: `${month.actions.length}条` },
        ],
        breakdown: month.actions.map((action, index) => createBreakdown(`第${index + 1}步`, action)),
        analysis: [
            ...(month.orientationNotes[0] ? [createInsight('记录视角', month.orientationNotes[0])] : []),
            ...(month.expressionNotes[1] ? [createInsight('表达方式', month.expressionNotes[1])] : []),
        ],
        suggestions: month.actions.slice(0, 2).map((action, index) => (
            createInsight(index === 0 ? '第一优先' : '第二优先', action)
        )),
        context: createContext(snapshot, []),
        evidenceRefs: [],
        promptVersion: STUDENT_EVALUATION_CHAT_PROMPT_VERSION,
        dataSnapshotId: snapshot.id,
    };
};

export const askStudentEvaluationQuestion = ({
    question,
    snapshot,
}: AskStudentEvaluationQuestionInput): StudentEvaluationAssistantAnswer => {
    const intent = resolveQuestionIntent(question);
    if (!intent || intent === 'clarification' || intent === 'unavailable') {
        return buildClarificationAnswer(snapshot);
    }
    if (intent === 'student_coverage') {
        return snapshot.week?.hasRecordDetails ? buildCoverageAnswer(snapshot) : buildUnavailableAnswer(snapshot);
    }
    if (intent === 'student_orientation') {
        return snapshot.month?.hasRecordDetails ? buildOrientationAnswer(snapshot) : buildUnavailableAnswer(snapshot);
    }
    return snapshot.month?.hasRecordDetails ? buildImprovementAnswer(snapshot) : buildUnavailableAnswer(snapshot);
};
