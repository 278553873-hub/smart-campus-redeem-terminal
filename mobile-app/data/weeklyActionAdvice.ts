export interface StudentAdviceInsight {
    studentName: string;
    content: string;
    suggestion: string;
    needVerify: boolean;
}

export interface WeeklyAdviceContent {
    classOverview: string[];
    studentInsights: StudentAdviceInsight[];
    evaluationInsights: string[];
    classInsights: string[];
    actions: string[];
}

export interface WeeklyAdviceOverview {
    records: number;
    covered: number;
    total: number;
    evaluators: number;
}

export interface WeeklyActionAdviceReport {
    id: string;
    classId: string;
    title: string;
    className: string;
    actionWeekStart: string;
    generatedAt: string;
    dataRange: string;
    dataWindowWeeks: 1 | 2 | 4;
    overview: WeeklyAdviceOverview;
    content: WeeklyAdviceContent;
}

export const CURRENT_WEEKLY_ACTION_ADVICE: WeeklyActionAdviceReport = {
    id: 'current-2026-07-14',
    classId: 'c_2025_4',
    title: '本周行动建议',
    className: '2025级四班',
    actionWeekStart: '2026-07-14',
    generatedAt: '2026.07.14 08:30',
    dataRange: '7月7日-13日',
    dataWindowWeeks: 1,
    overview: { records: 52, covered: 41, total: 45, evaluators: 7 },
    content: {
        classOverview: [
            '52条记录覆盖41位同学，正向记录超过八成。课堂秩序是当前最集中的提醒信号。',
            '仍有4位同学缺少观察，本周可优先补齐。',
        ],
        studentInsights: [
            {
                studentName: '李思思、赵雪',
                content: '学习投入和同伴互助表现稳定',
                suggestion: '适合在班会上公开肯定。',
                needVerify: false,
            },
            {
                studentName: '王小虎',
                content: '近3次语文讲解阶段做其他题，但独立练习完成较快，可能已掌握当前内容，也可能是讲解阶段参与感不足；现有记录不足以判断为纪律问题',
                suggestion: '先了解其掌握情况，再提供一次有挑战度的延伸任务，观察投入是否改善。',
                needVerify: true,
            },
            {
                studentName: '周明',
                content: '两次作业未完成，但课堂问答表现正常，可能是课后任务安排遇到困难，也需排除个别知识点未掌握；现有记录不足以判断学习态度',
                suggestion: '先询问未完成的具体环节，再针对时间安排或知识点提供一次支持。',
                needVerify: true,
            },
        ],
        evaluationInsights: [
            '7位老师参与记录，但科学、美术学科覆盖偏少。部分评价仍以全班描述为主，可更多落到具体学生。',
        ],
        classInsights: [
            '课堂纪律提醒涉及多个课堂，并非单一事件；同伴互助记录较多，班级合作氛围值得继续强化。',
        ],
        actions: [
            '了解王小虎的掌握情况，安排一次有挑战度的延伸任务。',
            '与周明核实作业未完成的具体环节，提供针对性支持。',
            '班会上重申课堂规则，同时表扬互助与稳定进步的同学。',
        ],
    },
};

const CURRENT_TWO_WEEK_ADVICE: WeeklyActionAdviceReport = {
    id: 'current-c-2025-1-2026-07-14',
    classId: 'c_2025_1',
    title: '本周行动建议',
    className: '2025级一班',
    actionWeekStart: '2026-07-14',
    generatedAt: '2026.07.14 09:05',
    dataRange: '6月30日-7月13日',
    dataWindowWeeks: 2,
    overview: { records: 24, covered: 19, total: 60, evaluators: 4 },
    content: {
        classOverview: [
            '前两周24条记录覆盖19位同学，可以形成阶段观察，结论仍需结合日常表现核实。',
        ],
        studentInsights: [
            {
                studentName: '陈晨',
                content: '连续获得英语口语和团队协作表扬',
                suggestion: '可以及时给予正向强化。',
                needVerify: false,
            },
            {
                studentName: '王小虎',
                content: '出现两次课堂提醒',
                suggestion: '建议继续观察并沟通，不宜直接下结论。',
                needVerify: true,
            },
        ],
        evaluationInsights: [
            '记录主要来自4位老师，科任教师参与度仍有提升空间。',
        ],
        classInsights: [
            '现有记录以课堂参与和作业表现为主，其他场景观察较少。',
        ],
        actions: [
            '肯定陈晨近期进步，并补充一次具体表现记录。',
            '继续观察王小虎在不同课堂的状态。',
            '优先补充尚未覆盖学生的日常观察。',
        ],
    },
};

const CURRENT_FOUR_WEEK_ADVICE: WeeklyActionAdviceReport = {
    id: 'current-c-2024-2-2026-07-14',
    classId: 'c_2024_2',
    title: '本周行动建议',
    className: '2024级二班',
    actionWeekStart: '2026-07-14',
    generatedAt: '2026.07.14 09:20',
    dataRange: '6月16日-7月13日',
    dataWindowWeeks: 4,
    overview: { records: 20, covered: 18, total: 60, evaluators: 3 },
    content: {
        classOverview: [
            '前四周记录刚达到分析条件，当前结论主要用于确定本周观察重点。',
        ],
        studentInsights: [
            {
                studentName: '林小杰',
                content: '多次获得美术创作相关表扬',
                suggestion: '可继续提供展示作品的机会。',
                needVerify: false,
            },
        ],
        evaluationInsights: [
            '记录覆盖较分散，建议继续增加具体、连续的个体观察。',
        ],
        classInsights: [
            '现有记录尚未形成明确的班级共性问题，适合继续观察。',
        ],
        actions: [
            '为林小杰提供一次作品展示机会。',
            '本周优先观察尚未覆盖的学生。',
            '记录具体行为，减少笼统的全班评价。',
        ],
    },
};

const C_2025_4_HISTORY: WeeklyActionAdviceReport[] = [
    {
        id: 'history-2026-07-07',
        classId: 'c_2025_4',
        title: '7月7日-13日行动建议',
        className: '2025级四班',
        actionWeekStart: '2026-07-07',
        generatedAt: '2026.07.07 09:12',
        dataRange: '6月23日-7月6日',
        dataWindowWeeks: 2,
        overview: { records: 24, covered: 19, total: 45, evaluators: 4 },
        content: {
            classOverview: [
                '24条记录覆盖19位同学，可以形成初步观察，结论仍需结合日常表现核实。',
            ],
            studentInsights: [
                {
                    studentName: '陈晨',
                    content: '连续获得英语口语和团队协作表扬',
                    suggestion: '可以及时给予正向强化。',
                    needVerify: false,
                },
                {
                    studentName: '王小虎',
                    content: '出现两次课堂提醒',
                    suggestion: '建议继续观察并沟通，不宜直接下结论。',
                    needVerify: true,
                },
            ],
            evaluationInsights: [
                '记录主要来自4位老师，科任教师参与度仍有提升空间。',
            ],
            classInsights: [
                '现有记录以课堂参与和作业表现为主，其他场景观察较少。',
            ],
            actions: [
                '肯定陈晨近期进步，并补充一次具体表现记录。',
                '继续观察王小虎在不同课堂的状态。',
                '优先补充尚未覆盖学生的日常观察。',
            ],
        },
    },
    {
        id: 'history-2026-06-30',
        classId: 'c_2025_4',
        title: '6月30日-7月6日行动建议',
        className: '2025级四班',
        actionWeekStart: '2026-06-30',
        generatedAt: '2026.06.30 10:05',
        dataRange: '6月2日-29日',
        dataWindowWeeks: 4,
        overview: { records: 16, covered: 14, total: 45, evaluators: 3 },
        content: {
            classOverview: [
                '近28天记录刚达到分析条件，当前结论只作为本周观察参考。',
            ],
            studentInsights: [
                {
                    studentName: '林小杰',
                    content: '两次获得美术创作相关表扬',
                    suggestion: '可继续提供展示作品的机会。',
                    needVerify: false,
                },
            ],
            evaluationInsights: [
                '记录覆盖较分散，建议继续增加具体、连续的个体观察。',
            ],
            classInsights: [
                '现有记录尚未形成明确的班级共性问题，适合继续观察。',
            ],
            actions: [
                '为林小杰提供一次作品展示机会。',
                '本周优先观察尚未覆盖的学生。',
                '记录具体行为，减少笼统的全班评价。',
            ],
        },
    },
    {
        id: 'history-2026-06-23',
        classId: 'c_2025_4',
        title: '6月23日-29日行动建议',
        className: '2025级四班',
        actionWeekStart: '2026-06-23',
        generatedAt: '2026.06.23 08:46',
        dataRange: '6月16日-22日',
        dataWindowWeeks: 1,
        overview: { records: 38, covered: 32, total: 45, evaluators: 6 },
        content: {
            classOverview: [
                '38条记录覆盖32位同学。劳动协作表现突出，作业完成是较集中的提醒方向。',
            ],
            studentInsights: [
                {
                    studentName: '赵雪',
                    content: '在集体劳动中主动承担任务',
                    suggestion: '适合公开肯定。',
                    needVerify: false,
                },
                {
                    studentName: '周明',
                    content: '连续出现作业未完成记录',
                    suggestion: '建议了解实际困难。',
                    needVerify: true,
                },
            ],
            evaluationInsights: [
                '体育和艺术活动中的个体记录较少，可适当补充。',
            ],
            classInsights: [
                '集体劳动中的主动协作是本周较明显的班级亮点。',
            ],
            actions: [
                '表扬大扫除中的主动协作行为。',
                '了解连续未交作业学生的实际困难。',
                '补充体育和艺术活动中的个体观察。',
            ],
        },
    },
];

const C_2025_1_HISTORY: WeeklyActionAdviceReport[] = [
    {
        ...CURRENT_TWO_WEEK_ADVICE,
        id: 'history-c-2025-1-2026-07-07',
        title: '7月7日-13日行动建议',
        actionWeekStart: '2026-07-07',
        generatedAt: '2026.07.07 09:18',
        dataRange: '6月23日-7月6日',
    },
    {
        ...CURRENT_WEEKLY_ACTION_ADVICE,
        id: 'history-c-2025-1-2026-06-30',
        classId: 'c_2025_1',
        className: '2025级一班',
        title: '6月30日-7月6日行动建议',
        actionWeekStart: '2026-06-30',
        generatedAt: '2026.06.30 08:55',
        dataRange: '6月23日-29日',
    },
];

const C_2024_2_HISTORY: WeeklyActionAdviceReport[] = [
    {
        ...CURRENT_FOUR_WEEK_ADVICE,
        id: 'history-c-2024-2-2026-07-07',
        title: '7月7日-13日行动建议',
        actionWeekStart: '2026-07-07',
        generatedAt: '2026.07.07 10:20',
        dataRange: '6月9日-7月6日',
    },
];

export const WEEKLY_ACTION_ADVICE_CURRENT_BY_CLASS: Record<string, WeeklyActionAdviceReport> = {
    c_2025_4: CURRENT_WEEKLY_ACTION_ADVICE,
    c_2025_1: CURRENT_TWO_WEEK_ADVICE,
    c_2024_2: CURRENT_FOUR_WEEK_ADVICE,
};

export const WEEKLY_ACTION_ADVICE_HISTORY_BY_CLASS: Record<string, WeeklyActionAdviceReport[]> = {
    c_2025_4: C_2025_4_HISTORY,
    c_2025_1: C_2025_1_HISTORY,
    c_2024_2: C_2024_2_HISTORY,
};

export const WEEKLY_ACTION_ADVICE_HISTORY = C_2025_4_HISTORY;
