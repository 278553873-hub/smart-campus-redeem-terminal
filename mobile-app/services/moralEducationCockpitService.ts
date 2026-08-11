export type MoralEducationPeriodType = 'week' | 'month' | 'term';

export type MoralEducationDimensionColor =
    | 'indicator1'
    | 'indicator2'
    | 'indicator3'
    | 'indicator4'
    | 'indicator5';

export interface MoralEducationPeriodOption {
    id: string;
    type: MoralEducationPeriodType;
    startDate: string;
    endDate: string;
    label: string;
    trendLabel: string;
}

// 保留旧类型别名，避免已有调用方在迁移期间失效。
export type MoralEducationWeekOption = MoralEducationPeriodOption;

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
    period: MoralEducationPeriodOption;
    week: MoralEducationPeriodOption;
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

interface PeriodDefinition {
    option: MoralEducationPeriodOption;
    weeks: WeekConfig[];
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
    { id: '2025-12-15_2025-12-21', startDate: '2025-12-15', endDate: '2025-12-21', averageScore: 96.4, issueScale: 0.84 },
    { id: '2025-12-22_2025-12-28', startDate: '2025-12-22', endDate: '2025-12-28', averageScore: 96.6, issueScale: 0.82 },
    { id: '2026-01-05_2026-01-11', startDate: '2026-01-05', endDate: '2026-01-11', averageScore: 96.5, issueScale: 0.86 },
    { id: '2026-02-23_2026-03-01', startDate: '2026-02-23', endDate: '2026-03-01', averageScore: 96.8, issueScale: 0.78 },
    { id: '2026-03-09_2026-03-15', startDate: '2026-03-09', endDate: '2026-03-15', averageScore: 96.7, issueScale: 0.82 },
    { id: '2026-04-06_2026-04-12', startDate: '2026-04-06', endDate: '2026-04-12', averageScore: 96.6, issueScale: 0.86 },
    { id: '2026-05-11_2026-05-17', startDate: '2026-05-11', endDate: '2026-05-17', averageScore: 96.4, issueScale: 0.9 },
    { id: '2026-06-08_2026-06-14', startDate: '2026-06-08', endDate: '2026-06-14', averageScore: 96.5, issueScale: 0.88 },
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

const formatWeekTrendLabel = (startDate: string, endDate: string) => {
    const start = parseDateParts(startDate);
    const end = parseDateParts(endDate);
    return `${start.month}.${String(start.day).padStart(2, '0')}-${end.month}.${String(end.day).padStart(2, '0')}`;
};

const toWeekOption = (config: WeekConfig): MoralEducationPeriodOption => ({
    id: config.id,
    type: 'week',
    startDate: config.startDate,
    endDate: config.endDate,
    label: formatWeekLabel(config.startDate, config.endDate),
    trendLabel: formatWeekTrendLabel(config.startDate, config.endDate),
});

const groupBy = <T>(items: T[], getKey: (item: T) => string) => {
    const groups = new Map<string, T[]>();
    items.forEach(item => {
        const key = getKey(item);
        groups.set(key, [...(groups.get(key) ?? []), item]);
    });
    return groups;
};

const createMonthDefinitions = (): PeriodDefinition[] => Array.from(
    groupBy(WEEK_CONFIGS, config => config.startDate.slice(0, 7)),
).map(([id, weeks]) => {
    const { year, month } = parseDateParts(weeks[0].startDate);
    return {
        option: {
            id,
            type: 'month',
            startDate: weeks[0].startDate,
            endDate: weeks[weeks.length - 1].endDate,
            label: `${year}年${month}月`,
            trendLabel: `${month}月`,
        },
        weeks,
    };
});

const termKey = (config: WeekConfig) => config.startDate < '2026-02-01' ? '2025-2026-1' : '2025-2026-2';

const createTermDefinitions = (): PeriodDefinition[] => Array.from(
    groupBy(WEEK_CONFIGS, termKey),
).map(([id, weeks]) => {
    const isFirstTerm = id.endsWith('-1');
    return {
        option: {
            id,
            type: 'term',
            startDate: weeks[0].startDate,
            endDate: weeks[weeks.length - 1].endDate,
            label: `2025-2026学年${isFirstTerm ? '第一' : '第二'}学期`,
            trendLabel: isFirstTerm ? '第一学期' : '第二学期',
        },
        weeks,
    };
});

const PERIOD_DEFINITIONS: Record<MoralEducationPeriodType, PeriodDefinition[]> = {
    week: WEEK_CONFIGS.map(config => ({ option: toWeekOption(config), weeks: [config] })),
    month: createMonthDefinitions(),
    term: createTermDefinitions(),
};

const distributeCount = (total: number, index: number) => {
    const base = Math.floor(total / CLASS_COUNT_PER_GRADE);
    return base + (index < total % CLASS_COUNT_PER_GRADE ? 1 : 0);
};

const createWeeklyClasses = (config: WeekConfig) => BASE_GRADES.flatMap(grade => {
    const scoreAdjustments = [0.8, -0.6, 0.2, -1.1, 0.7];
    const scaledIssueCount = scaleCount(grade.issueCount, config.issueScale);
    return scoreAdjustments.map((adjustment, index): MoralEducationClassSummary => {
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
});

const rankClasses = (classes: MoralEducationClassSummary[]) => classes
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, 'zh-CN'))
    .map((classItem, index) => ({ ...classItem, rank: index + 1 }));

const createRankedData = (configs: WeekConfig[]) => {
    const weeklyClasses = configs.map(createWeeklyClasses);
    const classIds = weeklyClasses[0]?.map(classItem => classItem.id) ?? [];
    const aggregatedClasses = classIds.map(id => {
        const periodItems = weeklyClasses.flat().filter(classItem => classItem.id === id);
        const base = periodItems[0];
        return {
            ...base,
            score: roundOne(sumBy(periodItems, item => item.score) / periodItems.length),
            deduction: sumBy(periodItems, item => item.deduction),
            issueCount: sumBy(periodItems, item => item.issueCount),
        };
    });
    const classRanking = rankClasses(aggregatedClasses);
    const grades = BASE_GRADES.map(grade => ({
        id: grade.id,
        name: grade.name,
        classes: rankClasses(aggregatedClasses.filter(classItem => classItem.gradeId === grade.id)),
    }));
    return { classRanking, grades };
};

const createSummary = (configs: WeekConfig[]) => {
    const { classRanking } = createRankedData(configs);
    return {
        averageScore: roundOne(sumBy(classRanking, item => item.score) / classRanking.length),
        maxScore: SCHOOL_MAX_SCORE,
        cumulativeDeduction: sumBy(classRanking, item => item.deduction),
        issueCount: sumBy(classRanking, item => item.issueCount),
        highestScore: classRanking[0]?.score ?? 0,
        lowestScore: classRanking[classRanking.length - 1]?.score ?? 0,
    };
};

const createDimensions = (configs: WeekConfig[], classCount: number): MoralEducationDimensionStat[] => {
    const dimensionWeightTotal = sumBy(BASE_DIMENSIONS, item => item.deductionWeight);
    return BASE_DIMENSIONS.map(item => {
        const weeklyStats = configs.map(config => {
            const summary = createSummary([config]);
            const deduction = roundOne(summary.cumulativeDeduction * item.deductionWeight / dimensionWeightTotal);
            return {
                averageScore: clampScore(DIMENSION_MAX_SCORE - deduction / classCount, DIMENSION_MAX_SCORE),
                deduction,
                issueCount: scaleCount(item.issueCount, config.issueScale),
            };
        });
        return {
            id: item.id,
            name: item.name,
            averageScore: roundOne(sumBy(weeklyStats, stat => stat.averageScore) / weeklyStats.length),
            maxScore: DIMENSION_MAX_SCORE,
            deduction: sumBy(weeklyStats, stat => stat.deduction),
            issueCount: sumBy(weeklyStats, stat => stat.issueCount),
            color: item.color,
        };
    });
};

const createProblems = (configs: WeekConfig[], classCount: number): MoralEducationProblemStat[] => BASE_PROBLEMS.map(item => ({
    ...item,
    recordCount: sumBy(configs, config => scaleCount(item.recordCount, config.issueScale)),
    affectedClassCount: Math.min(classCount, Math.max(...configs.map(config => scaleCount(item.affectedClassCount, config.issueScale)))),
    deduction: sumBy(configs, config => roundOne(item.deduction * config.issueScale)),
}));

export const getMoralEducationCockpitPeriods = async (
    type: MoralEducationPeriodType,
): Promise<MoralEducationPeriodOption[]> => PERIOD_DEFINITIONS[type].map(item => item.option);

export const getMoralEducationCockpitWeeks = async (): Promise<MoralEducationWeekOption[]> => (
    getMoralEducationCockpitPeriods('week')
);

export const getMoralEducationCockpitSnapshot = async (
    query: { periodType?: MoralEducationPeriodType; periodId?: string; weekId?: string } = {},
): Promise<MoralEducationCockpitSnapshot> => {
    const periodType = query.periodType ?? 'week';
    const definitions = PERIOD_DEFINITIONS[periodType];
    const requestedId = query.periodId ?? query.weekId;
    const selectedIndex = definitions.findIndex(item => item.option.id === requestedId);
    const configIndex = requestedId && selectedIndex >= 0 ? selectedIndex : definitions.length - 1;
    const definition = definitions[configIndex] ?? definitions[definitions.length - 1];
    const { grades, classRanking } = createRankedData(definition.weeks);
    const summary = createSummary(definition.weeks);
    const dimensions = createDimensions(definition.weeks, classRanking.length);
    const trendStartIndex = Math.max(0, configIndex - TREND_WINDOW_SIZE + 1);
    const trend = definitions.slice(trendStartIndex, configIndex + 1).map(item => {
        const itemSummary = createSummary(item.weeks);
        return {
            label: item.option.trendLabel,
            averageScore: itemSummary.averageScore,
            deduction: itemSummary.cumulativeDeduction,
        };
    });

    return {
        period: definition.option,
        week: definition.option,
        summary,
        dimensions,
        trend,
        grades,
        classRanking,
        problems: createProblems(definition.weeks, classRanking.length),
    };
};
