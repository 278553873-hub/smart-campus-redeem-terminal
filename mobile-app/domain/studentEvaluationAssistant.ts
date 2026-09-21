/**
 * 班主任助理「学生评价」自由对话领域逻辑
 *
 * 与班级评价问答保持同一套回答结构（结论 + 数据点 + 分析 + 建议），
 * 但只使用学生评价口径的数据，不与班级评比混合计算。
 * 默认推荐问题全部指向学生和记录本身，不涉及老师自己的复盘。
 */
import type { StudentEvaluationSnapshot } from '../data/studentEvaluationAssistant.ts';
import type {
    AssistantAiInsight,
    AssistantAnswerBreakdown,
    AssistantAnswerMetric,
} from './assistantAnswerShape.ts';

export type StudentEvaluationAnswerType =
    | 'student_focus'
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

/** 输入控件上方的首选问题：三条都只看学生和记录本身，不涉及老师自己的复盘。 */
export const STUDENT_EVALUATION_SUGGESTED_QUESTIONS = [
    '哪些学生需要我重点关注？',
    '本周哪些学生没有被评价到？',
    '表扬和待改进分别集中在哪？',
] as const;

export const STUDENT_EVALUATION_FIXED_QUESTIONS = [
    { id: 'student_focus', label: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[0] },
    { id: 'student_coverage', label: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[1] },
    { id: 'student_orientation', label: STUDENT_EVALUATION_SUGGESTED_QUESTIONS[2] },
] as const;

/** 回答后的连续追问：每个意图都给 3 条，保证剔除已问问题后仍能凑满 3 条。 */
export const STUDENT_EVALUATION_FOLLOW_UP_QUESTIONS: Record<StudentEvaluationAnswerType, readonly string[]> = {
    student_focus: [
        '这些学生分别需要确认什么？',
        '本周哪些学生没有被评价到？',
        '表扬和待改进分别集中在哪？',
    ],
    student_coverage: [
        '哪些学生需要我重点关注？',
        '表扬和待改进分别集中在哪？',
        '本月还有多少学生没有记录？',
    ],
    student_orientation: [
        '哪些学生需要我重点关注？',
        '本周哪些学生没有被评价到？',
        '哪些指标用得最多？',
    ],
    student_improvement: [
        '哪些学生需要我重点关注？',
        '本周哪些学生没有被评价到？',
        '表扬和待改进分别集中在哪？',
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

/** 关注对象优先于覆盖口径：「哪些学生需要我重点关注」不能被“哪些学生”抢先判成覆盖问题。 */
const FOCUS_KEYWORDS = ['重点关注', '重点跟进', '重点核实', '需要确认', '值得关注', '需要我关注'];
const COVERAGE_KEYWORDS = ['没有被评价', '没被评价', '未评价', '没有被记录', '没有记录', '未记录', '还没记录', '覆盖', '哪些学生'];
const ORIENTATION_KEYWORDS = ['表扬', '待改进', '偏向', '倾向', '集中', '指标', '正向', '负向'];
const IMPROVEMENT_KEYWORDS = ['复盘', '改进', '改善', '跟进', '下一步', '怎么做'];

const resolveQuestionIntent = (question: string): StudentEvaluationAnswerType | null => {
    const normalized = question.trim();
    const fixed = STUDENT_EVALUATION_FIXED_QUESTIONS.find(item => item.label === normalized);
    if (fixed) return fixed.id;

    if (includesAny(normalized, FOCUS_KEYWORDS)) return 'student_focus';
    if (includesAny(normalized, COVERAGE_KEYWORDS)) return 'student_coverage';
    if (includesAny(normalized, ORIENTATION_KEYWORDS)) return 'student_orientation';
    if (includesAny(normalized, IMPROVEMENT_KEYWORDS)) return 'student_improvement';
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
    message: '我可以基于当前班级的学生评价记录，回答需要重点关注的学生、本周没有被评价到的学生，以及表扬和待改进分别集中在哪。请换一种问法。',
    metrics: [],
    breakdown: [],
    analysis: [],
    suggestions: [],
    context: createContext(snapshot, []),
    evidenceRefs: [],
    promptVersion: STUDENT_EVALUATION_CHAT_PROMPT_VERSION,
    dataSnapshotId: snapshot.id,
});

/** 重点对象：点名到人，并说明每个人需要确认什么。 */
const buildFocusAnswer = (
    snapshot: StudentEvaluationSnapshot,
): StudentEvaluationAssistantAnswer => {
    const week = snapshot.week!;
    const students = week.focusStudents;
    const needsCheck = students.filter(student => student.verificationFocus);
    const names = students.map(student => student.name).join('、');

    return {
        answerType: 'student_focus',
        message: students.length > 0
            ? `本周有${students.length}位同学值得重点关注：${names}。`
            : '本周还没有需要单独关注的学生。',
        metrics: [
            { label: '重点关注', value: `${students.length}人` },
            { label: '需要核实', value: `${needsCheck.length}人` },
        ],
        breakdown: students.map(student => createBreakdown(student.name, student.finding, student.evidence)),
        analysis: needsCheck.length > 0
            ? [
                createInsight(
                    '为什么要再确认',
                    `${needsCheck.map(student => student.name).join('、')}的表现存在前后反差或信息不完整，先核实具体情况再判断，避免用一次事件给学生下结论。`,
                ),
            ]
            : [createInsight('记录已足够', '这几位同学的表现都有具体行为证据支撑，暂时不需要额外核实。')],
        suggestions: needsCheck.length > 0
            ? needsCheck.map(student => createInsight(`核实${student.name}`, student.verificationFocus))
            : [createInsight('继续保持', '下周继续记录这几位同学的具体行为和发生情境，方便前后对比。')],
        context: createContext(snapshot, students.map(student => student.name)),
        evidenceRefs: students.map(student => student.name),
        promptVersion: STUDENT_EVALUATION_CHAT_PROMPT_VERSION,
        dataSnapshotId: snapshot.id,
    };
};

/** 覆盖缺口：说清还有多少人没有被评价到，以及为什么会被漏掉。 */
const buildCoverageAnswer = (
    snapshot: StudentEvaluationSnapshot,
): StudentEvaluationAssistantAnswer => {
    const week = snapshot.week!;
    const uncovered = Math.max(0, week.total - week.covered);

    return {
        answerType: 'student_coverage',
        message: `本周共产生${week.records}条学生评价记录，覆盖${week.covered}/${week.total}名学生，来自${week.evaluators}位教师；还有${uncovered}位同学本周没有被评价到。`,
        metrics: [
            { label: '本周记录', value: `${week.records}条` },
            { label: '覆盖学生', value: `${week.covered}人` },
            { label: '未被评价', value: `${uncovered}人`, tone: 'negative' },
        ],
        breakdown: [],
        analysis: [
            createInsight(
                '为什么会被漏掉',
                `班级名单中还有${uncovered}位同学本周没有个人记录。未出现不代表没有表现，说明目前的记录触发点还不容易捕捉安静、稳定或变化不明显的同学。`,
            ),
        ],
        suggestions: [
            createInsight('先扩大覆盖', '每周主动观察5位本周没有被评价到的同学，优先记录一个具体行为或变化。'),
        ],
        context: createContext(snapshot, []),
        evidenceRefs: [],
        promptVersion: STUDENT_EVALUATION_CHAT_PROMPT_VERSION,
        dataSnapshotId: snapshot.id,
    };
};

/** 记录倾向：表扬与待改进分别有多少、集中在哪些场景。 */
const buildOrientationAnswer = (
    snapshot: StudentEvaluationSnapshot,
): StudentEvaluationAssistantAnswer => {
    const month = snapshot.month!;
    const uncovered = Math.max(0, month.total - month.covered);

    return {
        answerType: 'student_orientation',
        message: `${month.label}（${month.dataRange}）共${month.records}条记录，其中表扬记录${month.positive}条、待改进记录${month.negative}条、中性${month.neutral}条，使用到${month.indicatorsUsed}个指标。`,
        metrics: [
            { label: '表扬记录', value: `${month.positive}条` },
            { label: '待改进记录', value: `${month.negative}条`, tone: 'negative' },
            { label: '使用指标', value: `${month.indicatorsUsed}个` },
        ],
        breakdown: [
            createBreakdown('集中场景', month.orientationNotes[0] ?? ''),
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

/** 复盘改进：仍然保留这条能力，但不进入默认推荐问题。 */
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
    if (intent === 'student_focus') {
        return snapshot.week?.hasRecordDetails ? buildFocusAnswer(snapshot) : buildUnavailableAnswer(snapshot);
    }
    if (intent === 'student_coverage') {
        return snapshot.week?.hasRecordDetails ? buildCoverageAnswer(snapshot) : buildUnavailableAnswer(snapshot);
    }
    if (intent === 'student_orientation') {
        return snapshot.month?.hasRecordDetails ? buildOrientationAnswer(snapshot) : buildUnavailableAnswer(snapshot);
    }
    return snapshot.month?.hasRecordDetails ? buildImprovementAnswer(snapshot) : buildUnavailableAnswer(snapshot);
};
