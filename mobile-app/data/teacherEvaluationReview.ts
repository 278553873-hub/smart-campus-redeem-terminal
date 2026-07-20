export interface TeacherEvaluationReviewOverview {
    records: number;
    covered: number;
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    indicatorsUsed: number;
}

export interface TeacherEvaluationReviewContent {
    reviewOverview: string[];
    attentionInsights: string[];
    perspectiveInsights: string[];
    indicatorAndExpressionInsights: string[];
    actions: string[];
}

interface TeacherEvaluationReviewBase {
    id: string;
    classId: string;
    title: string;
    className: string;
    reviewMonth: string;
    dataRange: string;
}

export interface TeacherEvaluationReviewReport extends TeacherEvaluationReviewBase {
    status: 'generated';
    generatedAt: string;
    overview: TeacherEvaluationReviewOverview;
    content: TeacherEvaluationReviewContent;
}

export interface TeacherEvaluationReviewInsufficient extends TeacherEvaluationReviewBase {
    status: 'insufficient';
    overview: TeacherEvaluationReviewOverview;
    targetRecords: number;
}

export type TeacherEvaluationReviewPageData = TeacherEvaluationReviewReport | TeacherEvaluationReviewInsufficient;

export const getTeacherEvaluationReviewTarget = (classSize: number) => (
    Math.max(15, Math.ceil(Math.max(0, classSize) * 0.5))
);

const CURRENT_REVIEW_CONTENT: TeacherEvaluationReviewContent = {
    reviewOverview: [
        '你的记录整体能够落到具体行为，但更容易在需要提醒和纠偏时留下记录。持续进步、安静投入等不显眼的表现较少进入记录，这比简单的“负向偏多”更值得关注。',
    ],
    attentionInsights: [
        '记录明显集中在王小虎、周明等少数同学，主要由作业未完成和课堂秩序事件反复触发。被反复记录不等于问题更严重，建议结合不同课堂继续核实。',
        '班级名单中仍有18位同学上月没有个人记录。未出现不代表没有表现，说明目前的记录触发点还不容易捕捉安静、稳定或变化不明显的同学。',
    ],
    perspectiveInsights: [
        '负向记录主要发生在作业与课堂提醒场景，正向记录则多来自竞赛、劳动等明显事件。你的记录视角更偏向“事件发生后再记录”，日常小幅进步和过程性努力较少被保留下来。',
    ],
    indicatorAndExpressionInsights: [
        '“遵守纪律、按时完成”使用较集中，而合作、审美体验和劳动过程中的个体证据较少。无需刻意覆盖所有指标，但可以在真实发生的班级活动中补充具体学生表现。',
        '少数记录直接使用“态度不认真”等判断，行为证据不足以支持归因。先写清发生了什么、在什么情境下发生，再选择指标，能让后续行动建议更可靠。',
    ],
    actions: [
        '每周主动观察5位上月较少被记录的同学，优先记录一个具体行为或变化。',
        '遇到需要纠偏的事件时，先记录可观察事实和发生情境，暂不写动机或态度判断。',
        '每周保留一次日常进步记录，让持续投入和小变化也能进入评价依据。',
    ],
};

export const CURRENT_TEACHER_EVALUATION_REVIEW: TeacherEvaluationReviewReport = {
    status: 'generated',
    id: 'teacher-review-c-2025-4-2026-06',
    classId: 'c_2025_4',
    title: '我的评价复盘',
    className: '2025级四班',
    reviewMonth: '2026-06',
    dataRange: '6月1日-30日',
    generatedAt: '2026.07.01 09:10',
    overview: {
        records: 64,
        covered: 42,
        total: 60,
        positive: 25,
        negative: 34,
        neutral: 5,
        indicatorsUsed: 9,
    },
    content: CURRENT_REVIEW_CONTENT,
};

export const TEACHER_EVALUATION_REVIEW_SAMPLE: TeacherEvaluationReviewReport = {
    ...CURRENT_TEACHER_EVALUATION_REVIEW,
    id: 'teacher-review-sample',
    classId: 'sample',
    title: '报告示例',
    className: '示例班级',
    generatedAt: '示例内容',
};

const CURRENT_REVIEW_INSUFFICIENT: TeacherEvaluationReviewInsufficient = {
    status: 'insufficient',
    id: 'teacher-review-insufficient-c-2025-1-2026-06',
    classId: 'c_2025_1',
    title: '我的评价复盘',
    className: '2025级一班',
    reviewMonth: '2026-06',
    dataRange: '6月1日-30日',
    overview: {
        records: 8,
        covered: 7,
        total: 60,
        positive: 3,
        negative: 5,
        neutral: 0,
        indicatorsUsed: 4,
    },
    targetRecords: getTeacherEvaluationReviewTarget(60),
};

const CURRENT_REVIEW_ACCUMULATING: TeacherEvaluationReviewInsufficient = {
    status: 'insufficient',
    id: 'teacher-review-insufficient-c-2024-2-2026-06',
    classId: 'c_2024_2',
    title: '我的评价复盘',
    className: '2024级二班',
    reviewMonth: '2026-06',
    dataRange: '6月1日-30日',
    overview: {
        records: 22,
        covered: 15,
        total: 60,
        positive: 12,
        negative: 9,
        neutral: 1,
        indicatorsUsed: 7,
    },
    targetRecords: getTeacherEvaluationReviewTarget(60),
};

const CURRENT_REVIEW_READY: TeacherEvaluationReviewReport = {
    ...CURRENT_TEACHER_EVALUATION_REVIEW,
    id: 'teacher-review-c-2025-7-2026-06',
    classId: 'c_2025_7',
    className: '2025级七班',
    overview: {
        records: 38,
        covered: 26,
        total: 60,
        positive: 21,
        negative: 14,
        neutral: 3,
        indicatorsUsed: 8,
    },
    content: {
        reviewOverview: [
            '你的记录能够同时保留学生亮点和需要跟进的事件，整体较为具体。当前更明显的盲区不是正负向比例，而是关注对象仍集中在课堂表达活跃的同学。',
        ],
        attentionInsights: [
            '被记录同学多为主动发言或参与活动者，较少发言但稳定完成任务的同学不容易进入记录。建议把“主动表达”之外的投入方式也纳入观察。',
        ],
        perspectiveInsights: [
            '正向记录覆盖合作、表达和劳动场景；需要跟进的记录大多写清了具体行为，没有直接把一次事件上升为学生特征。',
        ],
        indicatorAndExpressionInsights: [
            '指标选择与行为描述整体一致，但合作类表现经常只记录集体结果，较少写明个体在其中承担了什么。',
        ],
        actions: [
            '每周补充3位安静投入同学的具体过程记录。',
            '记录集体活动时，至少补充1位学生的具体角色和行为。',
        ],
    },
};

const createHistoryReview = (
    id: string,
    classId: string,
    className: string,
    reviewMonth: string,
    dataRange: string,
    generatedAt: string,
    overview: TeacherEvaluationReviewOverview,
    content: TeacherEvaluationReviewContent,
): TeacherEvaluationReviewReport => {
    const [year, month] = reviewMonth.split('-');
    return {
        status: 'generated',
        id,
        classId,
        title: `${year}年${Number(month)}月评价复盘`,
        className,
        reviewMonth,
        dataRange,
        generatedAt,
        overview,
        content,
    };
};

const C_2025_4_HISTORY: TeacherEvaluationReviewReport[] = [
    createHistoryReview(
        'teacher-review-c-2025-4-2026-05',
        'c_2025_4',
        '2025级四班',
        '2026-05',
        '5月1日-31日',
        '2026.06.01 08:42',
        { records: 57, covered: 38, total: 60, positive: 28, negative: 24, neutral: 5, indicatorsUsed: 8 },
        {
            reviewOverview: ['你的记录能够捕捉明显事件，但对学生变化过程的连续证据较少。评价复盘的重点不是增加条数，而是让同一学生的前后变化更容易被看见。'],
            attentionInsights: ['关注对象较上月更分散，但仍有部分同学只在出现提醒事件时被记录，缺少后续改善证据。'],
            perspectiveInsights: ['正向记录多为结果性表扬，较少说明学生经过了什么努力。补充过程信息后，表扬会更具体。'],
            indicatorAndExpressionInsights: ['指标选择整体准确；“责任担当”有时由一次未完成任务直接推断，建议先保留任务与情境事实。'],
            actions: ['对本月出现提醒记录的学生，补充一次后续变化观察。', '正向记录增加一句具体努力或过程。'],
        },
    ),
    createHistoryReview(
        'teacher-review-c-2025-4-2026-04',
        'c_2025_4',
        '2025级四班',
        '2026-04',
        '4月1日-30日',
        '2026.05.01 09:06',
        { records: 49, covered: 31, total: 60, positive: 19, negative: 27, neutral: 3, indicatorsUsed: 7 },
        {
            reviewOverview: ['记录主要由课堂提醒触发，个体亮点和稳定表现较少。现有证据更像记录习惯差异，不能解释为班级负向事件更多。'],
            attentionInsights: ['少数需要持续管理的同学占据较多记录，安静完成任务的同学较少出现。'],
            perspectiveInsights: ['负向记录描述较具体，但部分记录缺少事件发生前的任务情境，后续难以判断是难度、规则还是参与方式造成。'],
            indicatorAndExpressionInsights: ['纪律类指标使用集中，合作与劳动类活动已有原始描述，但没有稳定落到个人证据。'],
            actions: ['下一月优先补充未出现同学的具体表现。', '课堂提醒记录增加任务阶段和行为后的变化。'],
        },
    ),
];

const C_2025_7_HISTORY: TeacherEvaluationReviewReport[] = [
    createHistoryReview(
        'teacher-review-c-2025-7-2026-05',
        'c_2025_7',
        '2025级七班',
        '2026-05',
        '5月1日-31日',
        '2026.06.01 09:20',
        { records: 36, covered: 24, total: 60, positive: 20, negative: 13, neutral: 3, indicatorsUsed: 7 },
        CURRENT_REVIEW_READY.content,
    ),
];

export const TEACHER_EVALUATION_REVIEW_CURRENT_BY_CLASS: Record<string, TeacherEvaluationReviewPageData> = {
    c_2025_4: CURRENT_TEACHER_EVALUATION_REVIEW,
    c_2025_1: CURRENT_REVIEW_INSUFFICIENT,
    c_2024_2: CURRENT_REVIEW_ACCUMULATING,
    c_2025_7: CURRENT_REVIEW_READY,
};

export const TEACHER_EVALUATION_REVIEW_HISTORY_BY_CLASS: Record<string, TeacherEvaluationReviewReport[]> = {
    c_2025_4: C_2025_4_HISTORY,
    c_2025_1: [],
    c_2024_2: [],
    c_2025_7: C_2025_7_HISTORY,
};
