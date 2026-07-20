export type StudentInsightType =
    | 'continuity'
    | 'context_contrast'
    | 'change'
    | 'cross_teacher'
    | 'strength'
    | 'significant_event';

export interface StudentAdviceInsight {
    studentNames: string[];
    insightType: StudentInsightType;
    finding: string;
    evidence: string;
    interpretation: string;
    verificationFocus: string;
    needVerify: boolean;
}

export type TeacherEvaluationInsightType =
    | 'participation'
    | 'orientation'
    | 'target_scope'
    | 'content_quality'
    | 'follow_up'
    | 'complementarity';

export interface TeacherEvaluationInsight {
    teacherNames: string[];
    insightType: TeacherEvaluationInsightType;
    finding: string;
    evidence: string;
    implication: string;
}

export type ClassInsightType =
    | 'shared_pattern'
    | 'context_pattern'
    | 'change'
    | 'strength'
    | 'differentiation';

export interface ClassAdviceInsight {
    insightType: ClassInsightType;
    finding: string;
    evidence: string;
    condition: string;
    implication: string;
}

export interface WeeklyAdviceContent {
    studentInsights: StudentAdviceInsight[];
    evaluationInsights: TeacherEvaluationInsight[];
    classInsights: ClassAdviceInsight[];
    actions: string[];
}

export interface WeeklyAdviceOverview {
    records: number;
    covered: number;
    total: number;
    evaluators: number;
}

export interface WeeklyAdviceTarget {
    records: number;
    covered: number;
}

export const getWeeklyAdviceTarget = (classSize: number): WeeklyAdviceTarget => {
    const normalizedClassSize = Math.max(0, classSize);
    return {
        records: Math.ceil(normalizedClassSize * 0.6),
        covered: Math.ceil(normalizedClassSize * 0.5),
    };
};

interface WeeklyActionAdviceBase {
    id: string;
    classId: string;
    title: string;
    className: string;
    actionWeekStart: string;
}

export interface WeeklyActionAdviceReport extends WeeklyActionAdviceBase {
    status: 'generated';
    generatedAt: string;
    dataRange: string;
    overview: WeeklyAdviceOverview;
    content: WeeklyAdviceContent;
}

export interface WeeklyActionAdviceInsufficient extends WeeklyActionAdviceBase {
    status: 'insufficient';
    previousWeekRange: string;
    previousWeek: WeeklyAdviceOverview;
    currentWeekRange: string;
    currentWeek: WeeklyAdviceOverview;
}

export type WeeklyActionAdvicePageData = WeeklyActionAdviceReport | WeeklyActionAdviceInsufficient;

const FULL_REPORT_CONTENT: WeeklyAdviceContent = {
    studentInsights: [
        {
            studentNames: ['李思思'],
            insightType: 'strength',
            finding: '本周呈现跨学科的同伴支持优势',
            evidence: '语文讨论和数学小组任务中3次主动向同伴解释步骤，记录来自2位教师',
            interpretation: '不是一次普通表扬，而是本周在不同场景重复出现的具体优势行为',
            verificationFocus: '',
            needVerify: false,
        },
        {
            studentNames: ['王小虎'],
            insightType: 'context_contrast',
            finding: '学习投入随任务阶段呈现明显反差',
            evidence: '3次在语文讲解阶段做其他题，但2次独立练习均较快完成',
            interpretation: '可能已掌握当前内容，也可能是讲解阶段参与感不足；现有证据不支持判断为整体学习态度或纪律问题',
            verificationFocus: '确认其在其他学科讲解阶段是否出现相同反差，并核对当前内容掌握程度',
            needVerify: true,
        },
        {
            studentNames: ['周明'],
            insightType: 'context_contrast',
            finding: '课后任务完成与课堂理解表现不一致',
            evidence: '2次作业未完成，但语文和数学课堂问答记录均显示能够跟上当前内容',
            interpretation: '困难可能集中在课后任务安排，也需排除个别知识点未掌握；现有记录不足以判断学习态度',
            verificationFocus: '确认未完成发生在时间安排、任务理解还是具体知识点环节',
            needVerify: true,
        },
    ],
    evaluationInsights: [
        {
            teacherNames: ['王老师'],
            insightType: 'participation',
            finding: '是本周本班最主要的评价参与者',
            evidence: '共发起31次原始评价互动，占全班52次的59.6%，评价分布于课堂、作业和班级活动',
            implication: '当前班级评价动态主要由班主任视角推动，其他任课场景提供的补充观察相对有限',
        },
        {
            teacherNames: ['李老师'],
            insightType: 'orientation',
            finding: '本周评价呈现明显的鼓励和正面引导倾向',
            evidence: '12次评价中10次为鼓励加分，2次纠偏也均指向具体行为',
            implication: '其记录不仅提供正向结果，也保留了学生因何获得肯定或需要调整的行为依据',
        },
        {
            teacherNames: ['张老师'],
            insightType: 'target_scope',
            finding: '评价覆盖面较广，但个体观察相对有限',
            evidence: '9次原始评价中有7次面向全班，展开后形成较多学生明细，只有2次针对个人',
            implication: '学生档案中的明细量较大，主要反映集体表现，暂不足以呈现学生之间的具体差异',
        },
    ],
    classInsights: [
        {
            insightType: 'context_pattern',
            finding: '课堂提醒主要集中在任务切换阶段',
            evidence: '8个独立事件涉及5名学生、3个学科，均发生在讲解转练习或分组开始时；进入独立练习后仅有1次相关提醒',
            condition: '从统一讲解转入下一任务的短暂切换阶段',
            implication: '当前更像转换环节的共同信号，而不是整节课持续失序，本周应优先优化任务切换方式',
        },
        {
            insightType: 'strength',
            finding: '同伴支持是本周跨场景出现的班级优势',
            evidence: '3位教师在6个个人或小组事件中记录到5名学生主动解释步骤、补位或整理材料，并非一次全班表扬展开所得',
            condition: '小组讨论、合作任务和集体劳动场景',
            implication: '班级已有可复用的合作行为基础，可通过明确小组角色继续强化',
        },
    ],
    actions: [
        '了解王小虎的掌握情况，安排一次有挑战度的延伸任务。',
        '与周明核实作业未完成的具体环节，提供针对性支持。',
        '任务切换前用30秒明确下一步要求与分工，观察相关提醒是否减少。',
    ],
};

export const CURRENT_WEEKLY_ACTION_ADVICE: WeeklyActionAdviceReport = {
    status: 'generated',
    id: 'current-2026-07-14',
    classId: 'c_2025_4',
    title: '本周行动建议',
    className: '2025级四班',
    actionWeekStart: '2026-07-14',
    generatedAt: '2026.07.14 08:30',
    dataRange: '7月7日-13日',
    overview: { records: 52, covered: 41, total: 60, evaluators: 7 },
    content: FULL_REPORT_CONTENT,
};

export const WEEKLY_ACTION_ADVICE_SAMPLE_REPORT: WeeklyActionAdviceReport = {
    ...CURRENT_WEEKLY_ACTION_ADVICE,
    id: 'weekly-advice-sample',
    classId: 'sample',
    title: '报告示例',
    className: '示例班级',
    generatedAt: '示例内容',
};

const CURRENT_NO_RECORDS: WeeklyActionAdviceInsufficient = {
    status: 'insufficient',
    id: 'insufficient-c-2025-1-2026-07-14',
    classId: 'c_2025_1',
    title: '本周行动建议',
    className: '2025级一班',
    actionWeekStart: '2026-07-14',
    previousWeekRange: '7月7日-13日',
    previousWeek: { records: 12, covered: 10, total: 60, evaluators: 2 },
    currentWeekRange: '7月14日-20日',
    currentWeek: { records: 0, covered: 0, total: 60, evaluators: 0 },
};

const CURRENT_ACCUMULATING: WeeklyActionAdviceInsufficient = {
    status: 'insufficient',
    id: 'insufficient-c-2024-2-2026-07-14',
    classId: 'c_2024_2',
    title: '本周行动建议',
    className: '2024级二班',
    actionWeekStart: '2026-07-14',
    previousWeekRange: '7月7日-13日',
    previousWeek: { records: 20, covered: 18, total: 60, evaluators: 3 },
    currentWeekRange: '7月14日-20日',
    currentWeek: { records: 22, covered: 17, total: 60, evaluators: 3 },
};

const CURRENT_READY_FOR_NEXT_WEEK: WeeklyActionAdviceInsufficient = {
    status: 'insufficient',
    id: 'insufficient-c-2025-7-2026-07-14',
    classId: 'c_2025_7',
    title: '本周行动建议',
    className: '2025级七班',
    actionWeekStart: '2026-07-14',
    previousWeekRange: '7月7日-13日',
    previousWeek: { records: 18, covered: 14, total: 60, evaluators: 2 },
    currentWeekRange: '7月14日-20日',
    currentWeek: { records: 41, covered: 33, total: 60, evaluators: 5 },
};

const createHistoryReport = (
    id: string,
    classId: string,
    className: string,
    title: string,
    actionWeekStart: string,
    dataRange: string,
    generatedAt: string,
    overview: WeeklyAdviceOverview,
): WeeklyActionAdviceReport => ({
    status: 'generated',
    id,
    classId,
    title,
    className,
    actionWeekStart,
    generatedAt,
    dataRange,
    overview,
    content: {
        studentInsights: [
            {
                studentNames: ['陈晨'],
                insightType: 'cross_teacher',
                finding: '课堂表达与团队协作优势得到跨教师印证',
                evidence: '2位教师在课堂讨论和小组任务中分别记录到主动表达、倾听和补位行为',
                interpretation: '积极表现来自不同场景，不是单次结果性表扬',
                verificationFocus: '',
                needVerify: false,
            },
            {
                studentNames: ['周明'],
                insightType: 'context_contrast',
                finding: '作业完成与课堂参与呈现反差',
                evidence: '2次作业未完成，但课堂问答和练习记录未出现相同困难',
                interpretation: '现有记录不足以判断是时间安排还是个别任务理解问题',
                verificationFocus: '确认未完成发生的具体任务和环节',
                needVerify: true,
            },
        ],
        evaluationInsights: [
            {
                teacherNames: ['陈老师'],
                insightType: 'orientation',
                finding: '本周评价以具体鼓励为主',
                evidence: '9次原始评价中有7次记录了学生在课堂表达和协作中的具体表现',
                implication: '这些记录能够帮助班主任看见结果之外的参与过程',
            },
            {
                teacherNames: ['周老师'],
                insightType: 'target_scope',
                finding: '评价明细量主要由集体评价带动',
                evidence: '8次原始评价中有6次面向全班，个人评价集中在两名学生',
                implication: '当前记录较能反映班级整体状态，对学生个体差异的呈现相对有限',
            },
        ],
        classInsights: [
            {
                insightType: 'strength',
                finding: '同伴互助在多个合作场景中重复出现',
                evidence: '3位教师记录的5个独立事件涉及4名学生，行为包括解释步骤、主动补位和整理公共材料',
                condition: '小组讨论和集体任务场景',
                implication: '这是由多个具体行为支持的本周优势，可继续通过清晰分工加以强化',
            },
            {
                insightType: 'context_pattern',
                finding: '任务完成提醒集中在放学前布置环节',
                evidence: '4个独立提醒涉及3名学生，均出现在任务要求集中说明之后，其他课堂练习未出现相同信号',
                condition: '放学前集中布置多项任务时',
                implication: '当前证据更支持优化任务确认方式，不宜直接概括为班级学习态度问题',
            },
        ],
        actions: [
            '肯定课堂表达和团队协作中的具体表现。',
            '了解作业未完成学生的实际困难。',
            '放学前请学生复述任务要求，确认多项任务是否记录完整。',
        ],
    },
});

const C_2025_4_HISTORY: WeeklyActionAdviceReport[] = [
    createHistoryReport('history-c-2025-4-2026-07-07', 'c_2025_4', '2025级四班', '7月7日-13日行动建议', '2026-07-07', '6月30日-7月6日', '2026.07.07 09:12', { records: 40, covered: 31, total: 60, evaluators: 6 }),
    createHistoryReport('history-c-2025-4-2026-06-30', 'c_2025_4', '2025级四班', '6月30日-7月6日行动建议', '2026-06-30', '6月23日-29日', '2026.06.30 10:05', { records: 38, covered: 30, total: 60, evaluators: 5 }),
    createHistoryReport('history-c-2025-4-2026-06-23', 'c_2025_4', '2025级四班', '6月23日-29日行动建议', '2026-06-23', '6月16日-22日', '2026.06.23 08:46', { records: 42, covered: 34, total: 60, evaluators: 6 }),
];

const C_2025_1_HISTORY: WeeklyActionAdviceReport[] = [
    createHistoryReport('history-c-2025-1-2026-06-30', 'c_2025_1', '2025级一班', '6月30日-7月6日行动建议', '2026-06-30', '6月23日-29日', '2026.06.30 08:55', { records: 39, covered: 31, total: 60, evaluators: 5 }),
];

const C_2024_2_HISTORY: WeeklyActionAdviceReport[] = [
    createHistoryReport('history-c-2024-2-2026-06-23', 'c_2024_2', '2024级二班', '6月23日-29日行动建议', '2026-06-23', '6月16日-22日', '2026.06.23 10:20', { records: 37, covered: 30, total: 60, evaluators: 4 }),
];

export const WEEKLY_ACTION_ADVICE_CURRENT_BY_CLASS: Record<string, WeeklyActionAdvicePageData> = {
    c_2025_4: CURRENT_WEEKLY_ACTION_ADVICE,
    c_2025_1: CURRENT_NO_RECORDS,
    c_2024_2: CURRENT_ACCUMULATING,
    c_2025_7: CURRENT_READY_FOR_NEXT_WEEK,
};

export const WEEKLY_ACTION_ADVICE_HISTORY_BY_CLASS: Record<string, WeeklyActionAdviceReport[]> = {
    c_2025_4: C_2025_4_HISTORY,
    c_2025_1: C_2025_1_HISTORY,
    c_2024_2: C_2024_2_HISTORY,
    c_2025_7: [],
};

export const WEEKLY_ACTION_ADVICE_HISTORY = C_2025_4_HISTORY;
