import {
    calculateClassEvaluationSnapshot,
    type ClassEvaluationRecord,
    type ClassEvaluationSnapshot,
} from '../domain/classEvaluationAssistantV2.ts';

export type ClassEvaluationWeekStatus = 'in_progress' | 'settled';

export interface ClassEvaluationDimensionRanking {
    dimension: string;
    score: number;
    maxScore: number;
    gradeRank: number;
    schoolRank: number;
    gapToFirst: number;
    recordCount: number;
    tiedForFirst?: boolean;
}

export interface ClassEvaluationWeek {
    id: string;
    start: string;
    end: string;
    label: string;
    dataRangeLabel: string;
    status: ClassEvaluationWeekStatus;
    snapshotLabel: string;
    gradeRank: number;
    schoolRank: number;
    dimensionRankings: ClassEvaluationDimensionRanking[];
    summary: string;
    focus: string;
}

export const CLASS_EVALUATION_WEEKS: ClassEvaluationWeek[] = [
    {
        id: '2026-08-03_2026-08-09',
        start: '2026-08-03',
        end: '2026-08-09',
        label: '8月3日-8月9日',
        dataRangeLabel: '8月3日-8月9日',
        status: 'in_progress',
        snapshotLabel: '截至8月7日 16:36',
        gradeRank: 2,
        schoolRank: 5,
        dimensionRankings: [
            { dimension: '诗意中队', score: 20, maxScore: 20, gradeRank: 1, schoolRank: 2, gapToFirst: 0, recordCount: 0, tiedForFirst: true },
            { dimension: '安全教育', score: 20, maxScore: 20, gradeRank: 1, schoolRank: 1, gapToFirst: 0, recordCount: 0 },
            { dimension: '健体班级', score: 18.2, maxScore: 20, gradeRank: 3, schoolRank: 7, gapToFirst: 0.4, recordCount: 3 },
            { dimension: '文雅班级', score: 18.9, maxScore: 20, gradeRank: 2, schoolRank: 4, gapToFirst: 0.3, recordCount: 2 },
            { dimension: '美净班级', score: 18.4, maxScore: 20, gradeRank: 4, schoolRank: 9, gapToFirst: 1.2, recordCount: 3 },
        ],
        summary: '诗意中队、安全教育暂列第1',
        focus: '健体班级距第1仅差0.4分',
    },
    {
        id: '2026-07-27_2026-08-02',
        start: '2026-07-27',
        end: '2026-08-02',
        label: '7月27日-8月2日',
        dataRangeLabel: '7月27日-8月2日',
        status: 'settled',
        snapshotLabel: '已结算',
        gradeRank: 1,
        schoolRank: 2,
        dimensionRankings: [
            { dimension: '诗意中队', score: 19.8, maxScore: 20, gradeRank: 2, schoolRank: 3, gapToFirst: 0.2, recordCount: 1 },
            { dimension: '安全教育', score: 19.5, maxScore: 20, gradeRank: 2, schoolRank: 4, gapToFirst: 0.5, recordCount: 2 },
            { dimension: '健体班级', score: 19.2, maxScore: 20, gradeRank: 1, schoolRank: 2, gapToFirst: 0, recordCount: 1 },
            { dimension: '文雅班级', score: 19.4, maxScore: 20, gradeRank: 3, schoolRank: 6, gapToFirst: 0.5, recordCount: 2 },
            { dimension: '美净班级', score: 19.6, maxScore: 20, gradeRank: 1, schoolRank: 1, gapToFirst: 0, recordCount: 1, tiedForFirst: true },
        ],
        summary: '健体班级第1，美净班级并列第1',
        focus: '安全教育距第1差0.5分',
    },
    {
        id: '2026-07-20_2026-07-26',
        start: '2026-07-20',
        end: '2026-07-26',
        label: '7月20日-7月26日',
        dataRangeLabel: '7月20日-7月26日',
        status: 'settled',
        snapshotLabel: '已结算',
        gradeRank: 3,
        schoolRank: 8,
        dimensionRankings: [
            { dimension: '诗意中队', score: 19.6, maxScore: 20, gradeRank: 2, schoolRank: 4, gapToFirst: 0.3, recordCount: 1 },
            { dimension: '安全教育', score: 20, maxScore: 20, gradeRank: 1, schoolRank: 1, gapToFirst: 0, recordCount: 0, tiedForFirst: true },
            { dimension: '健体班级', score: 19, maxScore: 20, gradeRank: 3, schoolRank: 8, gapToFirst: 0.7, recordCount: 2 },
            { dimension: '文雅班级', score: 19.6, maxScore: 20, gradeRank: 1, schoolRank: 2, gapToFirst: 0, recordCount: 1 },
            { dimension: '美净班级', score: 19.4, maxScore: 20, gradeRank: 2, schoolRank: 5, gapToFirst: 0.4, recordCount: 2 },
        ],
        summary: '安全教育并列第1，文雅班级第1',
        focus: '健体班级距第1差0.7分',
    },
];

export const DEFAULT_CLASS_EVALUATION_WEEK_ID = CLASS_EVALUATION_WEEKS[0].id;
export const CLASS_EVALUATION_PERIOD = CLASS_EVALUATION_WEEKS[0];

export const CLASS_EVALUATION_RECORDS: ClassEvaluationRecord[] = [
    {
        id: 'CE-20260807-001', classId: 'c_2025_4', date: '2026-08-07', dimension: '健体班级', indicator: '精神风貌',
        indicatorPath: ['健体班级', '早操体锻', '精神风貌'],
        finding: '队列中有8名学生说话，达到6至10人扣1分的区间。', deduction: 1,
        rule: '精神风貌不符合要求6至10人扣1分，本项满分1分，扣完即止。',
    },
    {
        id: 'CE-20260807-002', classId: 'c_2025_4', date: '2026-08-07', dimension: '美净班级', indicator: '午检',
        indicatorPath: ['美净班级', '班级清洁', '午检'],
        finding: '地面发现两处纸屑，后排桌椅未对齐。', deduction: 0.4,
        rule: '午检发现纸屑或桌椅未对齐，按问题数量累计扣0.4分。',
    },
    {
        id: 'CE-20260806-001', classId: 'c_2025_4', date: '2026-08-06', dimension: '文雅班级', indicator: '路队放学',
        indicatorPath: ['文雅班级', '班级路队放学', '路队放学'],
        finding: '放学路队未携带班牌。', deduction: 1,
        rule: '未按要求携带班牌，每次扣1分。',
    },
    {
        id: 'CE-20260805-001', classId: 'c_2025_4', date: '2026-08-05', dimension: '健体班级', indicator: '教师组织管理',
        indicatorPath: ['健体班级', '眼保健操', '教师组织管理'],
        finding: '眼操期间当堂教师未巡视和提醒动作。', deduction: 0.3,
        rule: '眼操期间未按要求组织或巡视，每次扣0.3分。',
    },
    {
        id: 'CE-20260807-004', classId: 'c_2025_4', date: '2026-08-07', dimension: '美净班级', indicator: '晨检',
        indicatorPath: ['美净班级', '班级清洁', '晨检'],
        finding: '楼梯转角发现垃圾未清理。', deduction: 1,
        rule: '公区发现垃圾未清理，每次扣1分。',
    },
    {
        id: 'CE-20260807-005', classId: 'c_2025_4', date: '2026-08-07', dimension: '文雅班级', indicator: '班级文化建设',
        indicatorPath: ['文雅班级', '班级常规', '班级文化建设'],
        finding: '班级文化展示区有一处张贴内容卷角。', deduction: 0.1,
        rule: '班级文化建设内容张贴不整洁，发现一处问题扣0.1分。',
    },
    {
        id: 'CE-20260804-001', classId: 'c_2025_4', date: '2026-08-04', dimension: '美净班级', indicator: '晨检',
        indicatorPath: ['美净班级', '班级清洁', '晨检'],
        finding: '清洁用具缺少一把扫帚，摆放区未复位。', deduction: 0.2,
        rule: '晨检发现清洁用具缺失或未归位，每次扣0.2分。',
    },
    {
        id: 'CE-20260807-003', classId: 'c_2025_4', date: '2026-08-07', dimension: '健体班级', indicator: '教师组织管理',
        indicatorPath: ['健体班级', '早操体锻', '教师组织管理'],
        finding: '负责教师在队列出发后到岗。', deduction: 0.5,
        rule: '早操负责教师迟到，每次扣0.5分。',
    },
    {
        id: 'CE-20260802-001', classId: 'c_2025_4', date: '2026-08-02', dimension: '诗意中队', indicator: '少先队文化宣传',
        indicatorPath: ['诗意中队', '中队文化建设', '少先队文化宣传'],
        finding: '展示栏有一处作品信息未更新。', deduction: 0.2,
        rule: '班级文化展示信息未按周期更新，每处扣0.2分。',
    },
    {
        id: 'CE-20260801-001', classId: 'c_2025_4', date: '2026-08-01', dimension: '安全教育', indicator: '公共秩序',
        indicatorPath: ['安全教育', '班级安全秩序', '公共秩序'],
        finding: '楼梯转角有学生追逐。', deduction: 0.3,
        rule: '课间在楼道追逐，每人次扣0.3分。',
    },
    {
        id: 'CE-20260731-001', classId: 'c_2025_4', date: '2026-07-31', dimension: '安全教育', indicator: '安全记录本',
        indicatorPath: ['安全教育', '班级安全教育', '安全记录本'],
        finding: '班会安全教育记录提交延迟。', deduction: 0.2,
        rule: '安全教育记录未按时提交，每次扣0.2分。',
    },
    {
        id: 'CE-20260730-001', classId: 'c_2025_4', date: '2026-07-30', dimension: '健体班级', indicator: '眼操动作',
        indicatorPath: ['健体班级', '眼保健操', '眼操动作'],
        finding: '抽查发现4名学生动作不规范。', deduction: 0.8,
        rule: '眼操动作不规范按人数区间扣分。',
    },
    {
        id: 'CE-20260729-001', classId: 'c_2025_4', date: '2026-07-29', dimension: '文雅班级', indicator: '协调精灵反馈登记',
        indicatorPath: ['文雅班级', '班级协调精灵到岗反馈', '协调精灵反馈登记'],
        finding: '课间出现两次不文明用语。', deduction: 0.4,
        rule: '出现不文明用语，每人次扣0.2分。',
    },
    {
        id: 'CE-20260728-001', classId: 'c_2025_4', date: '2026-07-28', dimension: '文雅班级', indicator: '路队放学',
        indicatorPath: ['文雅班级', '班级路队放学', '路队放学'],
        finding: '放学队列有学生离队。', deduction: 0.2,
        rule: '路队中途离队，每人次扣0.2分。',
    },
    {
        id: 'CE-20260727-001', classId: 'c_2025_4', date: '2026-07-27', dimension: '美净班级', indicator: '午检',
        indicatorPath: ['美净班级', '班级清洁', '午检'],
        finding: '午检发现两组桌椅未对齐。', deduction: 0.4,
        rule: '桌椅未按基准线摆放，每组扣0.2分。',
    },
    {
        id: 'CE-20260726-001', classId: 'c_2025_4', date: '2026-07-26', dimension: '诗意中队', indicator: '图书管理',
        indicatorPath: ['诗意中队', '中队文化建设', '图书管理'],
        finding: '图书角分类标签缺失。', deduction: 0.4,
        rule: '图书角分类标签缺失，每处扣0.4分。',
    },
    {
        id: 'CE-20260724-001', classId: 'c_2025_4', date: '2026-07-24', dimension: '健体班级', indicator: '队列队形',
        indicatorPath: ['健体班级', '早操体锻', '队列队形'],
        finding: '早操队列两次出现间距不齐。', deduction: 0.6,
        rule: '早操队列不齐，每次扣0.3分。',
    },
    {
        id: 'CE-20260723-001', classId: 'c_2025_4', date: '2026-07-23', dimension: '健体班级', indicator: '眼操动作',
        indicatorPath: ['健体班级', '眼保健操', '眼操动作'],
        finding: '抽查发现3名学生动作不规范。', deduction: 0.4,
        rule: '眼操动作不规范按人数区间扣分。',
    },
    {
        id: 'CE-20260722-001', classId: 'c_2025_4', date: '2026-07-22', dimension: '文雅班级', indicator: '协调精灵反馈登记',
        indicatorPath: ['文雅班级', '班级协调精灵到岗反馈', '协调精灵反馈登记'],
        finding: '课间有学生大声喧哗。', deduction: 0.4,
        rule: '公共区域大声喧哗，每人次扣0.2分。',
    },
    {
        id: 'CE-20260721-001', classId: 'c_2025_4', date: '2026-07-21', dimension: '美净班级', indicator: '晨检',
        indicatorPath: ['美净班级', '班级清洁', '晨检'],
        finding: '窗台发现积灰。', deduction: 0.3,
        rule: '晨检发现卫生死角，每处扣0.3分。',
    },
    {
        id: 'CE-20260720-001', classId: 'c_2025_4', date: '2026-07-20', dimension: '美净班级', indicator: '晨检',
        indicatorPath: ['美净班级', '班级清洁', '晨检'],
        finding: '拖把使用后未归位。', deduction: 0.3,
        rule: '清洁用具未定点归位，每件扣0.3分。',
    },
];

const getWeekById = (weekId: string) => (
    CLASS_EVALUATION_WEEKS.find(week => week.id === weekId) ?? CLASS_EVALUATION_WEEKS[0]
);

const snapshotOnly = (classId: string, week: ClassEvaluationWeek, deduction: number): ClassEvaluationSnapshot => ({
    id: `${classId}:${week.start}:${week.end}`,
    classId,
    periodStart: week.start,
    periodEnd: week.end,
    fullScore: 100,
    finalScore: 100 - deduction,
    deduction,
    recordCount: 0,
    hasRecordDetails: false,
});

const fallbackDeductionsByClass: Record<string, number> = {
    c_2025_1: 1.5,
    c_2024_2: 0,
    c_2025_7: 2.2,
};

export const getClassEvaluationWeek = (weekId: string) => getWeekById(weekId);

export const getClassEvaluationRecords = (
    classId: string,
    weekId = DEFAULT_CLASS_EVALUATION_WEEK_ID,
) => {
    const week = getWeekById(weekId);
    return CLASS_EVALUATION_RECORDS.filter(record => (
        record.classId === classId
        && record.date >= week.start
        && record.date <= week.end
    ));
};

export const getClassEvaluationSnapshot = (
    classId: string,
    weekId = DEFAULT_CLASS_EVALUATION_WEEK_ID,
): ClassEvaluationSnapshot => {
    const week = getWeekById(weekId);
    if (classId === 'c_2025_4') {
        return calculateClassEvaluationSnapshot(
            classId,
            week.start,
            week.end,
            CLASS_EVALUATION_RECORDS,
        );
    }
    return snapshotOnly(classId, week, fallbackDeductionsByClass[classId] ?? 0);
};
