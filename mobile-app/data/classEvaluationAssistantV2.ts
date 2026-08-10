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
    overallRank: number;
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
        dataRangeLabel: '8月3日-8月7日',
        status: 'in_progress',
        snapshotLabel: '截至8月7日 16:36',
        overallRank: 2,
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
        overallRank: 1,
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
        overallRank: 3,
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
        id: 'CE-20260807-001', classId: 'c_2025_4', date: '2026-08-07', dimension: '健体班级', indicator: '早操精神风貌',
        finding: '队列中有8名学生说话，达到6至10人扣1分的区间。', deduction: 1, classDeduction: 1, teacherDeduction: 0,
        responsibility: 'class', rule: '精神风貌不符合要求6至10人扣1分，本项满分1分，扣完即止。', rectificationStatus: 'pending',
        actions: [{ title: '下楼前完成一次队列静默检查', owner: '体育委员', verification: '连续3天早操说话人数不超过5人' }],
    },
    {
        id: 'CE-20260807-002', classId: 'c_2025_4', date: '2026-08-07', dimension: '美净班级', indicator: '午检卫生',
        finding: '地面发现两处纸屑，后排桌椅未对齐。', deduction: 0.4, classDeduction: 0.2, teacherDeduction: 0.2,
        responsibility: 'shared', rule: '午检问题按处扣分，班级行为与当堂教师组织责任各承担50%。', rectificationStatus: 'resolved',
        actions: [{ title: '午休结束后按区域完成两分钟复位', owner: '值日组与当堂教师', verification: '次日午检地面无垃圾且桌椅对齐' }],
    },
    {
        id: 'CE-20260806-001', classId: 'c_2025_4', date: '2026-08-06', dimension: '文雅班级', indicator: '路队放学',
        finding: '放学路队未携带班牌。', deduction: 1, classDeduction: 1, teacherDeduction: 0,
        responsibility: 'class', rule: '未按要求携带班牌，每次扣1分。', rectificationStatus: 'resolved',
        actions: [{ title: '将班牌交接加入放学前清单', owner: '路队长', verification: '连续5个放学日均完成班牌交接' }],
    },
    {
        id: 'CE-20260805-001', classId: 'c_2025_4', date: '2026-08-05', dimension: '健体班级', indicator: '眼操教师组织',
        finding: '眼操期间当堂教师未巡视和提醒动作。', deduction: 0.3, classDeduction: 0, teacherDeduction: 0.3,
        responsibility: 'teacher', rule: '眼操教师未组织或未关注，按教师组织责任扣0.3分。', rectificationStatus: 'reviewing',
        actions: [{ title: '眼操开始后完成一次全班巡视', owner: '当堂教师', verification: '下一次抽查记录为已组织且动作提醒到位' }],
    },
    {
        id: 'CE-20260807-004', classId: 'c_2025_4', date: '2026-08-07', dimension: '美净班级', indicator: '公区保洁',
        finding: '楼梯转角垃圾在复查时仍未清理。', deduction: 1, classDeduction: 1, teacherDeduction: 0,
        responsibility: 'class', rule: '公区问题首次提醒后仍未整改，每次扣1分。', rectificationStatus: 'pending',
        actions: [{ title: '值日结束前由组长复查楼梯转角', owner: '公区值日组长', verification: '连续3次复查均在规定时间内完成清理' }],
    },
    {
        id: 'CE-20260807-005', classId: 'c_2025_4', date: '2026-08-07', dimension: '文雅班级', indicator: '图书管理',
        finding: '漂流书栈发现一本图书卷角。', deduction: 0.1, classDeduction: 0.1, teacherDeduction: 0,
        responsibility: 'class', rule: '图书出现破损或卷角，每本扣0.1分。', rectificationStatus: 'resolved',
        actions: [{ title: '归还图书时检查封面与书角', owner: '图书管理员', verification: '下周抽查未发现新增破损' }],
    },
    {
        id: 'CE-20260804-001', classId: 'c_2025_4', date: '2026-08-04', dimension: '美净班级', indicator: '晨检用具',
        finding: '清洁用具缺少一把扫帚，摆放区未复位。', deduction: 0.2, classDeduction: 0.1, teacherDeduction: 0.1,
        responsibility: 'shared', rule: '晨检用具缺失或未归位，班级与教师组织责任各承担50%。', rectificationStatus: 'resolved',
        actions: [{ title: '晨检前按清单清点清洁用具', owner: '劳动委员与值岗教师', verification: '连续一周用具齐全且定点归位' }],
    },
    {
        id: 'CE-20260807-003', classId: 'c_2025_4', date: '2026-08-07', dimension: '健体班级', indicator: '早操教师到岗',
        finding: '负责教师在队列出发后到岗。', deduction: 0.5, classDeduction: 0, teacherDeduction: 0.5,
        responsibility: 'teacher', rule: '早操负责教师迟到，每次扣0.5分。', rectificationStatus: 'reviewing',
        actions: [{ title: '将早操到岗提醒提前至集合前5分钟', owner: '负责教师', verification: '连续5天在学生队列出发前到岗' }],
    },
    {
        id: 'CE-20260802-001', classId: 'c_2025_4', date: '2026-08-02', dimension: '诗意中队', indicator: '班级文化',
        finding: '展示栏有一处作品信息未更新。', deduction: 0.2, classDeduction: 0.2, teacherDeduction: 0,
        responsibility: 'class', rule: '班级文化展示信息未按周期更新，每处扣0.2分。', rectificationStatus: 'resolved',
        actions: [{ title: '每周五核对展示栏信息', owner: '宣传委员', verification: '下周检查信息完整且为当前周期' }],
    },
    {
        id: 'CE-20260801-001', classId: 'c_2025_4', date: '2026-08-01', dimension: '安全教育', indicator: '课间安全',
        finding: '楼梯转角有学生追逐。', deduction: 0.3, classDeduction: 0.3, teacherDeduction: 0,
        responsibility: 'class', rule: '课间在楼道追逐，每人次扣0.3分。', rectificationStatus: 'resolved',
        actions: [{ title: '课间安排安全岗提醒', owner: '安全委员', verification: '连续一周无楼道追逐记录' }],
    },
    {
        id: 'CE-20260731-001', classId: 'c_2025_4', date: '2026-07-31', dimension: '安全教育', indicator: '安全教育记录',
        finding: '班会安全教育记录提交延迟。', deduction: 0.2, classDeduction: 0, teacherDeduction: 0.2,
        responsibility: 'teacher', rule: '安全教育记录未按时提交，每次扣0.2分。', rectificationStatus: 'resolved',
        actions: [{ title: '班会结束后当天提交记录', owner: '班主任', verification: '后续记录均于当天提交' }],
    },
    {
        id: 'CE-20260730-001', classId: 'c_2025_4', date: '2026-07-30', dimension: '健体班级', indicator: '眼操动作',
        finding: '抽查发现4名学生动作不规范。', deduction: 0.8, classDeduction: 0.8, teacherDeduction: 0,
        responsibility: 'class', rule: '眼操动作不规范按人数区间扣分。', rectificationStatus: 'resolved',
        actions: [{ title: '眼操前由领操员提示动作', owner: '健康委员', verification: '下次抽查动作不规范不超过2人' }],
    },
    {
        id: 'CE-20260729-001', classId: 'c_2025_4', date: '2026-07-29', dimension: '文雅班级', indicator: '文明用语',
        finding: '课间出现两次不文明用语。', deduction: 0.4, classDeduction: 0.4, teacherDeduction: 0,
        responsibility: 'class', rule: '出现不文明用语，每人次扣0.2分。', rectificationStatus: 'resolved',
        actions: [{ title: '班会复盘文明用语情景', owner: '班长', verification: '下周无同类记录' }],
    },
    {
        id: 'CE-20260728-001', classId: 'c_2025_4', date: '2026-07-28', dimension: '文雅班级', indicator: '路队秩序',
        finding: '放学队列有学生离队。', deduction: 0.2, classDeduction: 0.2, teacherDeduction: 0,
        responsibility: 'class', rule: '路队中途离队，每人次扣0.2分。', rectificationStatus: 'resolved',
        actions: [{ title: '放学前确认路队分组', owner: '路队长', verification: '连续一周无人中途离队' }],
    },
    {
        id: 'CE-20260727-001', classId: 'c_2025_4', date: '2026-07-27', dimension: '美净班级', indicator: '桌椅整齐',
        finding: '午检发现两组桌椅未对齐。', deduction: 0.4, classDeduction: 0.4, teacherDeduction: 0,
        responsibility: 'class', rule: '桌椅未按基准线摆放，每组扣0.2分。', rectificationStatus: 'resolved',
        actions: [{ title: '离班前按地面标线复位桌椅', owner: '值日组', verification: '连续一周午检桌椅对齐' }],
    },
    {
        id: 'CE-20260726-001', classId: 'c_2025_4', date: '2026-07-26', dimension: '诗意中队', indicator: '图书角管理',
        finding: '图书角分类标签缺失。', deduction: 0.4, classDeduction: 0.4, teacherDeduction: 0,
        responsibility: 'class', rule: '图书角分类标签缺失，每处扣0.4分。', rectificationStatus: 'resolved',
        actions: [{ title: '补齐图书角分类标签', owner: '图书管理员', verification: '复核时标签完整清晰' }],
    },
    {
        id: 'CE-20260724-001', classId: 'c_2025_4', date: '2026-07-24', dimension: '健体班级', indicator: '早操队列',
        finding: '早操队列两次出现间距不齐。', deduction: 0.6, classDeduction: 0.6, teacherDeduction: 0,
        responsibility: 'class', rule: '早操队列不齐，每次扣0.3分。', rectificationStatus: 'resolved',
        actions: [{ title: '集合后由体育委员校准间距', owner: '体育委员', verification: '下周检查队列间距整齐' }],
    },
    {
        id: 'CE-20260723-001', classId: 'c_2025_4', date: '2026-07-23', dimension: '健体班级', indicator: '眼操动作',
        finding: '抽查发现3名学生动作不规范。', deduction: 0.4, classDeduction: 0.4, teacherDeduction: 0,
        responsibility: 'class', rule: '眼操动作不规范按人数区间扣分。', rectificationStatus: 'resolved',
        actions: [{ title: '眼操前提示穴位动作', owner: '健康委员', verification: '下次抽查动作全部规范' }],
    },
    {
        id: 'CE-20260722-001', classId: 'c_2025_4', date: '2026-07-22', dimension: '文雅班级', indicator: '课间礼仪',
        finding: '课间有学生大声喧哗。', deduction: 0.4, classDeduction: 0.4, teacherDeduction: 0,
        responsibility: 'class', rule: '公共区域大声喧哗，每人次扣0.2分。', rectificationStatus: 'resolved',
        actions: [{ title: '课间安排文明观察员', owner: '班长', verification: '下周无公共区域喧哗记录' }],
    },
    {
        id: 'CE-20260721-001', classId: 'c_2025_4', date: '2026-07-21', dimension: '美净班级', indicator: '晨检卫生',
        finding: '窗台发现积灰。', deduction: 0.3, classDeduction: 0.3, teacherDeduction: 0,
        responsibility: 'class', rule: '晨检发现卫生死角，每处扣0.3分。', rectificationStatus: 'resolved',
        actions: [{ title: '值日清单增加窗台擦拭', owner: '值日组', verification: '下周晨检窗台无积灰' }],
    },
    {
        id: 'CE-20260720-001', classId: 'c_2025_4', date: '2026-07-20', dimension: '美净班级', indicator: '用具归位',
        finding: '拖把使用后未归位。', deduction: 0.3, classDeduction: 0.3, teacherDeduction: 0,
        responsibility: 'class', rule: '清洁用具未定点归位，每件扣0.3分。', rectificationStatus: 'resolved',
        actions: [{ title: '值日结束后清点用具', owner: '劳动委员', verification: '连续一周用具定点归位' }],
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
    classDeduction: 0,
    teacherDeduction: 0,
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
