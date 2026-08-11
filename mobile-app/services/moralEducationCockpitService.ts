export type MoralEducationDimensionColor =
    | 'indicator1'
    | 'indicator2'
    | 'indicator3'
    | 'indicator4'
    | 'indicator5';

export interface MoralEducationWeekOption {
    id: string;
    startDate: string;
    endDate: string;
    label: string;
    trendLabel: string;
}

export interface MoralEducationDimensionStat {
    id: string;
    name: string;
    averageScore: number;
    maxScore: number;
    deduction: number;
    issueCount: number;
    color: MoralEducationDimensionColor;
}

export interface MoralEducationTrendPoint {
    label: string;
    averageScore: number;
    deduction: number;
}

export interface MoralEducationClassSummary {
    id: string;
    gradeId: string;
    name: string;
    score: number;
    maxScore: number;
    deduction: number;
    issueCount: number;
    rank: number;
}

export interface MoralEducationGradeSummary {
    id: string;
    name: string;
    classes: MoralEducationClassSummary[];
}

export interface MoralEducationProblemStat {
    id: string;
    dimension: string;
    indicator: string;
    recordCount: number;
    affectedClassCount: number;
    deduction: number;
}

export interface MoralEducationCockpitSnapshot {
    week: MoralEducationWeekOption;
    summary: {
        averageScore: number;
        maxScore: number;
        cumulativeDeduction: number;
        issueCount: number;
        highestScore: number;
        lowestScore: number;
    };
    dimensions: MoralEducationDimensionStat[];
    trend: MoralEducationTrendPoint[];
    grades: MoralEducationGradeSummary[];
    classRanking: MoralEducationClassSummary[];
    problems: MoralEducationProblemStat[];
}

interface WeekConfig {
    id: string;
    startDate: string;
    endDate: string;
    averageScore: number;
    issueScale: number;
}

const SCHOOL_MAX_SCORE = 100;
const DIMENSION_MAX_SCORE = 20;
const CLASS_COUNT_PER_GRADE = 5;
const TREND_WINDOW_SIZE = 4;

const roundOne = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;
const clampScore = (value: number, maxScore = SCHOOL_MAX_SCORE) => Math.max(0, Math.min(maxScore, roundOne(value)));
const scaleCount = (value: number, factor: number) => Math.max(0, Math.round(value * factor));
const sumBy = <T>(items: T[], getValue: (item: T) => number) => roundOne(items.reduce((sum, item) => sum + getValue(item), 0));

const WEEK_CONFIGS: WeekConfig[] = [
    { id: '2026-07-06_2026-07-12', startDate: '2026-07-06', endDate: '2026-07-12', averageScore: 96.9, issueScale: 0.8 },
    { id: '2026-07-13_2026-07-19', startDate: '2026-07-13', endDate: '2026-07-19', averageScore: 96.7, issueScale: 0.86 },
    { id: '2026-07-20_2026-07-26', startDate: '2026-07-20', endDate: '2026-07-26', averageScore: 96.5, issueScale: 0.92 },
    { id: '2026-07-27_2026-08-02', startDate: '2026-07-27', endDate: '2026-08-02', averageScore: 96.3, issueScale: 0.96 },
    { id: '2026-08-03_2026-08-09', startDate: '2026-08-03', endDate: '2026-08-09', averageScore: 96.1, issueScale: 1 },
];

const BASE_DIMENSIONS = [
    { id: 'poetic', name: '诗意中队', deductionWeight: 12.4, issueCount: 9, color: 'indicator1' as const },
    { id: 'safety', name: '安全教育', deductionWeight: 7.1, issueCount: 6, color: 'indicator2' as const },
    { id: 'fitness', name: '健体班级', deductionWeight: 32.5, issueCount: 16, color: 'indicator3' as const },
    { id: 'civilized', name: '文雅班级', deductionWeight: 24.6, issueCount: 12, color: 'indicator4' as const },
    { id: 'clean', name: '美净班级', deductionWeight: 29.2, issueCount: 18, color: 'indicator5' as const },
];

const BASE_GRADES = [
    { id: 'g1', name: '一年级', scoreOffset: 1.2, issueCount: 7 },
    { id: 'g2', name: '二年级', scoreOffset: 0.7, issueCount: 9 },
    { id: 'g3', name: '三年级', scoreOffset: -0.5, issueCount: 12 },
    { id: 'g4', name: '四年级', scoreOffset: 0.3, issueCount: 8 },
    { id: 'g5', name: '五年级', scoreOffset: -1.2, issueCount: 15 },
    { id: 'g6', name: '六年级', scoreOffset: -0.5, issueCount: 10 },
];

const BASE_PROBLEMS = [
    { id: 'p1', dimension: '健体班级', indicator: '早操队列', recordCount: 14, affectedClassCount: 7, deduction: 15.2 },
    { id: 'p2', dimension: '美净班级', indicator: '班级清洁', recordCount: 12, affectedClassCount: 8, deduction: 12.4 },
    { id: 'p3', dimension: '文雅班级', indicator: '协调精灵反馈登记', recordCount: 9, affectedClassCount: 5, deduction: 4.5 },
    { id: 'p4', dimension: '健体班级', indicator: '眼操纪律', recordCount: 8, affectedClassCount: 6, deduction: 5.2 },
    { id: 'p5', dimension: '文雅班级', indicator: '班级内务', recordCount: 7, affectedClassCount: 5, deduction: 4.8 },
];

const parseDateParts = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return { year, month, day };
};

const formatWeekLabel = (startDate: string, endDate: string) => {
    const start = parseDateParts(startDate);
    const end = parseDateParts(endDate);
    const endText = `${String(end.month).padStart(2, '0')}.${String(end.day).padStart(2, '0')}`;
    return `${start.year}.${String(start.month).padStart(2, '0')}.${String(start.day).padStart(2, '0')} - ${endText}`;
};

const formatTrendLabel = (startDate: string, endDate: string) => {
    const start = parseDateParts(startDate);
    const end = parseDateParts(endDate);
    return `${start.month}.${String(start.day).padStart(2, '0')}-${end.month}.${String(end.day).padStart(2, '0')}`;
};

const toWeekOption = (config: WeekConfig): MoralEducationWeekOption => ({
    id: config.id,
    startDate: config.startDate,
    endDate: config.endDate,
    label: formatWeekLabel(config.startDate, config.endDate),
    trendLabel: formatTrendLabel(config.startDate, config.endDate),
});

const distributeCount = (total: number, index: number) => {
    const base = Math.floor(total / CLASS_COUNT_PER_GRADE);
    return base + (index < total % CLASS_COUNT_PER_GRADE ? 1 : 0);
};

const createGrades = (config: WeekConfig): MoralEducationGradeSummary[] => BASE_GRADES.map(grade => {
    const scoreAdjustments = [0.8, -0.6, 0.2, -1.1, 0.7];
    const scaledIssueCount = scaleCount(grade.issueCount, config.issueScale);
    const classes = scoreAdjustments.map((adjustment, index): MoralEducationClassSummary => {
        const score = clampScore(config.averageScore + grade.scoreOffset + adjustment);
        return {
            id: `${grade.id}c${index + 1}`,
            gradeId: grade.id,
            name: `${grade.name}${index + 1}班`,
            score,
            maxScore: SCHOOL_MAX_SCORE,
            deduction: roundOne(SCHOOL_MAX_SCORE - score),
            issueCount: distributeCount(scaledIssueCount, index),
            rank: 0,
        };
    });
    return { id: grade.id, name: grade.name, classes };
});

const createRankedData = (config: WeekConfig) => {
    const grades = createGrades(config);
    const classRanking = grades
        .flatMap(grade => grade.classes)
        .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, 'zh-CN'))
        .map((classItem, index) => ({ ...classItem, rank: index + 1 }));
    const rankMap = new Map(classRanking.map(classItem => [classItem.id, classItem.rank]));
    return {
        classRanking,
        grades: grades.map(grade => ({
            ...grade,
            classes: grade.classes.map(classItem => ({ ...classItem, rank: rankMap.get(classItem.id) ?? 0 })),
        })),
    };
};

const createSummary = (config: WeekConfig) => {
    const { classRanking } = createRankedData(config);
    const averageScore = roundOne(sumBy(classRanking, item => item.score) / classRanking.length);
    return {
        averageScore,
        maxScore: SCHOOL_MAX_SCORE,
        cumulativeDeduction: sumBy(classRanking, item => item.deduction),
        issueCount: sumBy(classRanking, item => item.issueCount),
        highestScore: classRanking[0]?.score ?? 0,
        lowestScore: classRanking[classRanking.length - 1]?.score ?? 0,
    };
};

export const getMoralEducationCockpitWeeks = async (): Promise<MoralEducationWeekOption[]> => (
    WEEK_CONFIGS.map(toWeekOption)
);

export const getMoralEducationCockpitSnapshot = async (
    query: { weekId?: string } = {},
): Promise<MoralEducationCockpitSnapshot> => {
    const selectedIndex = WEEK_CONFIGS.findIndex(item => item.id === query.weekId);
    const fallbackIndex = WEEK_CONFIGS.length - 1;
    const configIndex = query.weekId && selectedIndex >= 0 ? selectedIndex : fallbackIndex;
    const config = WEEK_CONFIGS[configIndex] ?? WEEK_CONFIGS[fallbackIndex];
    const { grades, classRanking } = createRankedData(config);
    const summary = createSummary(config);
    const dimensionWeightTotal = sumBy(BASE_DIMENSIONS, item => item.deductionWeight);
    let allocatedDeduction = 0;
    const dimensions = BASE_DIMENSIONS.map((item, index): MoralEducationDimensionStat => {
        const deduction = index === BASE_DIMENSIONS.length - 1
            ? roundOne(summary.cumulativeDeduction - allocatedDeduction)
            : roundOne(summary.cumulativeDeduction * item.deductionWeight / dimensionWeightTotal);
        allocatedDeduction = roundOne(allocatedDeduction + deduction);
        return {
            id: item.id,
            name: item.name,
            averageScore: clampScore(DIMENSION_MAX_SCORE - deduction / classRanking.length, DIMENSION_MAX_SCORE),
            maxScore: DIMENSION_MAX_SCORE,
            deduction,
            issueCount: scaleCount(item.issueCount, config.issueScale),
            color: item.color,
        };
    });

    const trendStartIndex = Math.max(0, configIndex - TREND_WINDOW_SIZE + 1);
    const trend = WEEK_CONFIGS.slice(trendStartIndex, configIndex + 1).map(item => {
        const itemSummary = createSummary(item);
        return {
            label: formatTrendLabel(item.startDate, item.endDate),
            averageScore: itemSummary.averageScore,
            deduction: itemSummary.cumulativeDeduction,
        };
    });

    return {
        week: toWeekOption(config),
        summary,
        dimensions,
        trend,
        grades,
        classRanking,
        problems: BASE_PROBLEMS.map(item => ({
            ...item,
            recordCount: scaleCount(item.recordCount, config.issueScale),
            affectedClassCount: Math.min(classRanking.length, scaleCount(item.affectedClassCount, config.issueScale)),
            deduction: roundOne(item.deduction * config.issueScale),
        })),
    };
};
