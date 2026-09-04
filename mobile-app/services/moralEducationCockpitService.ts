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

export interface MoralEducationProblemDetailStat {
    id: string;
    name: string;
    recordCount: number;
    deduction: number;
}

export interface MoralEducationProblemCategoryStat {
    id: string;
    name: string;
    recordCount: number;
    deduction: number;
    details: MoralEducationProblemDetailStat[];
}

export interface MoralEducationProblemDimensionStat {
    id: string;
    name: string;
    recordCount: number;
    deduction: number;
    categories: MoralEducationProblemCategoryStat[];
}

export interface MoralEducationScoreNode {
    id: string;
    name: string;
    level: 1 | 2 | 3;
    averageScore: number;
    maxScore: number;
    deduction: number;
    color: MoralEducationDimensionColor;
    children: MoralEducationScoreNode[];
}

export interface MoralEducationGradeReport {
    gradeId: string;
    dimensions: MoralEducationDimensionStat[];
    scoreTree: MoralEducationScoreNode[];
    problemDimensions: MoralEducationProblemDimensionStat[];
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
    trend: MoralEducationTrendPoint[];
    grades: MoralEducationGradeSummary[];
    classRanking: MoralEducationClassSummary[];
    gradeReports: MoralEducationGradeReport[];
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
const DEMO_FIRST_GRADE_ADMISSION_YEAR = 2025;

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

const BASE_PROBLEM_DIMENSIONS = [
    {
        id: 'poetic',
        name: '诗意中队',
        categories: [
            {
                id: 'poetic-culture',
                name: '班级文化',
                details: [
                    { id: 'class-culture-layout', name: '班级文化布置', recordWeight: 5, deductionWeight: 5.2 },
                    { id: 'reading-corner', name: '图书角管理', recordWeight: 4, deductionWeight: 4.1 },
                ],
            },
            {
                id: 'poetic-activity',
                name: '活动参与',
                details: [
                    { id: 'class-activity', name: '班级活动参与', recordWeight: 3, deductionWeight: 3.1 },
                ],
            },
        ],
    },
    {
        id: 'safety',
        name: '安全教育',
        categories: [
            {
                id: 'safety-campus',
                name: '校园安全',
                details: [
                    { id: 'corridor-safety', name: '楼道通行安全', recordWeight: 4, deductionWeight: 3.4 },
                    { id: 'activity-safety', name: '课间活动安全', recordWeight: 3, deductionWeight: 2.2 },
                ],
            },
            {
                id: 'safety-education',
                name: '安全教育',
                details: [
                    { id: 'safety-task', name: '安全教育任务', recordWeight: 2, deductionWeight: 1.5 },
                ],
            },
        ],
    },
    {
        id: 'fitness',
        name: '健体班级',
        categories: [
            {
                id: 'fitness-exercises',
                name: '两操管理',
                details: [
                    { id: 'morning-exercise-line', name: '早操队列', recordWeight: 14, deductionWeight: 15.2 },
                    { id: 'eye-exercise-discipline', name: '眼操纪律', recordWeight: 8, deductionWeight: 5.2 },
                ],
            },
            {
                id: 'fitness-activity',
                name: '体育活动',
                details: [
                    { id: 'activity-attendance', name: '体育活动出勤', recordWeight: 6, deductionWeight: 7.1 },
                    { id: 'equipment-return', name: '器材归还', recordWeight: 4, deductionWeight: 5 },
                ],
            },
        ],
    },
    {
        id: 'civilized',
        name: '文雅班级',
        categories: [
            {
                id: 'civilized-etiquette',
                name: '文明礼仪',
                details: [
                    { id: 'civilized-feedback', name: '文明行为反馈登记', recordWeight: 9, deductionWeight: 4.5 },
                    { id: 'language-etiquette', name: '文明用语', recordWeight: 6, deductionWeight: 8.1 },
                ],
            },
            {
                id: 'civilized-routine',
                name: '班级常规',
                details: [
                    { id: 'class-housekeeping', name: '班级内务', recordWeight: 7, deductionWeight: 4.8 },
                    { id: 'classroom-discipline', name: '课前纪律', recordWeight: 5, deductionWeight: 7.2 },
                ],
            },
        ],
    },
    {
        id: 'clean',
        name: '美净班级',
        categories: [
            {
                id: 'clean-environment',
                name: '环境卫生',
                details: [
                    { id: 'class-cleaning', name: '班级清洁', recordWeight: 12, deductionWeight: 12.4 },
                    { id: 'public-area-cleaning', name: '公共区域清洁', recordWeight: 8, deductionWeight: 7.8 },
                ],
            },
            {
                id: 'clean-habit',
                name: '卫生习惯',
                details: [
                    { id: 'waste-sorting', name: '垃圾分类', recordWeight: 6, deductionWeight: 5.2 },
                    { id: 'desk-organization', name: '桌椅物品整理', recordWeight: 5, deductionWeight: 3.8 },
                ],
            },
        ],
    },
] as const;

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
    const admissionYear = DEMO_FIRST_GRADE_ADMISSION_YEAR - BASE_GRADES.findIndex(item => item.id === grade.id);
    return scoreAdjustments.map((adjustment, index): MoralEducationClassSummary => {
        const score = clampScore(config.averageScore + grade.scoreOffset + adjustment);
        return {
            id: `${grade.id}c${index + 1}`,
            gradeId: grade.id,
            name: `${admissionYear}级${index + 1}班`,
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

const distributeInteger = (total: number, weights: number[]) => {
    const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
    const rawValues = weights.map(weight => total * weight / weightTotal);
    const values = rawValues.map(Math.floor);
    let remainder = total - values.reduce((sum, value) => sum + value, 0);
    rawValues
        .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
        .sort((left, right) => right.fraction - left.fraction || left.index - right.index)
        .forEach(item => {
            if (remainder <= 0) return;
            values[item.index] += 1;
            remainder -= 1;
        });
    return values;
};

const gradeWeights = BASE_GRADES.map(grade => grade.issueCount);

const createProblemDetailTotals = (configs: WeekConfig[]) => {
    const details = BASE_PROBLEM_DIMENSIONS.flatMap(dimension => (
        dimension.categories.flatMap(category => category.details)
    ));
    const recordWeights = details.map(detail => configs.reduce(
        (sum, config) => sum + scaleCount(detail.recordWeight, config.issueScale),
        0,
    ));
    const deductionWeights = details.map(detail => sumBy(
        configs,
        config => roundOne(detail.deductionWeight * config.issueScale),
    ));
    const summary = createSummary(configs);
    const recordCounts = distributeInteger(summary.issueCount, recordWeights);
    const deductionTenths = distributeInteger(Math.round(summary.cumulativeDeduction * 10), deductionWeights);
    return new Map(details.map((detail, index) => [detail.id, {
        recordCount: recordCounts[index],
        deductionTenths: deductionTenths[index],
    }]));
};

const createProblemDimensions = (
    configs: WeekConfig[],
    gradeId: string,
): MoralEducationProblemDimensionStat[] => {
    const gradeIndex = BASE_GRADES.findIndex(grade => grade.id === gradeId);
    const detailTotals = createProblemDetailTotals(configs);
    return BASE_PROBLEM_DIMENSIONS.map(dimension => {
        const categories = dimension.categories.map(category => {
            const details = category.details.map(detail => {
                const total = detailTotals.get(detail.id) ?? { recordCount: 0, deductionTenths: 0 };
                const gradeRecordCounts = distributeInteger(total.recordCount, gradeWeights);
                const gradeDeductionTenths = distributeInteger(total.deductionTenths, gradeRecordCounts);
                const recordCount = gradeId === 'all'
                    ? total.recordCount
                    : gradeRecordCounts[gradeIndex] ?? 0;
                const deductionTenths = gradeId === 'all'
                    ? total.deductionTenths
                    : gradeDeductionTenths[gradeIndex] ?? 0;
                return {
                    id: detail.id,
                    name: detail.name,
                    recordCount,
                    deduction: roundOne(deductionTenths / 10),
                };
            }).filter(detail => detail.recordCount > 0 && detail.deduction > 0);
            return {
                id: category.id,
                name: category.name,
                recordCount: details.reduce((sum, detail) => sum + detail.recordCount, 0),
                deduction: sumBy(details, detail => detail.deduction),
                details,
            };
        }).filter(category => category.details.length > 0);
        return {
            id: dimension.id,
            name: dimension.name,
            recordCount: categories.reduce((sum, category) => sum + category.recordCount, 0),
            deduction: sumBy(categories, category => category.deduction),
            categories,
        };
    }).filter(dimension => dimension.categories.length > 0);
};

const createDimensions = (
    configs: WeekConfig[],
    gradeId: string,
    problemDimensions: MoralEducationProblemDimensionStat[],
): MoralEducationDimensionStat[] => {
    const classCount = gradeId === 'all' ? BASE_GRADES.length * CLASS_COUNT_PER_GRADE : CLASS_COUNT_PER_GRADE;
    return BASE_DIMENSIONS.map(item => {
        const problemDimension = problemDimensions.find(dimension => dimension.id === item.id);
        const deduction = problemDimension?.deduction ?? 0;
        return {
            id: item.id,
            name: item.name,
            averageScore: clampScore(
                DIMENSION_MAX_SCORE - deduction / classCount / configs.length,
                DIMENSION_MAX_SCORE,
            ),
            maxScore: DIMENSION_MAX_SCORE,
            deduction,
            issueCount: problemDimension?.recordCount ?? 0,
            color: item.color,
        };
    });
};

const distributeMaxScores = (maxScore: number, itemCount: number) => (
    distributeInteger(Math.round(maxScore * 10), Array.from({ length: itemCount }, () => 1))
        .map(value => roundOne(value / 10))
);

const createScoreTree = (
    configs: WeekConfig[],
    gradeId: string,
    dimensions: MoralEducationDimensionStat[],
    problemDimensions: MoralEducationProblemDimensionStat[],
): MoralEducationScoreNode[] => {
    const classCount = gradeId === 'all' ? BASE_GRADES.length * CLASS_COUNT_PER_GRADE : CLASS_COUNT_PER_GRADE;
    const scoreDivisor = classCount * configs.length;
    return dimensions.map(dimension => {
        const problemDimension = problemDimensions.find(item => item.id === dimension.id);
        const configuredDimension = BASE_PROBLEM_DIMENSIONS.find(item => item.id === dimension.id);
        const configuredCategories = configuredDimension?.categories ?? [];
        const categoryMaxScores = distributeMaxScores(dimension.maxScore, configuredCategories.length);
        const children = configuredCategories.map((configuredCategory, categoryIndex): MoralEducationScoreNode => {
            const category = problemDimension?.categories.find(item => item.id === configuredCategory.id);
            const categoryDeduction = category?.deduction ?? 0;
            const categoryMaxScore = categoryMaxScores[categoryIndex];
            const detailMaxScores = distributeMaxScores(categoryMaxScore, configuredCategory.details.length);
            return {
                id: configuredCategory.id,
                name: configuredCategory.name,
                level: 2,
                averageScore: clampScore(categoryMaxScore - categoryDeduction / scoreDivisor, categoryMaxScore),
                maxScore: categoryMaxScore,
                deduction: categoryDeduction,
                color: dimension.color,
                children: configuredCategory.details.map((configuredDetail, detailIndex): MoralEducationScoreNode => {
                    const detail = category?.details.find(item => item.id === configuredDetail.id);
                    const detailDeduction = detail?.deduction ?? 0;
                    return {
                        id: configuredDetail.id,
                        name: configuredDetail.name,
                        level: 3,
                        averageScore: clampScore(detailMaxScores[detailIndex] - detailDeduction / scoreDivisor, detailMaxScores[detailIndex]),
                        maxScore: detailMaxScores[detailIndex],
                        deduction: detailDeduction,
                        color: dimension.color,
                        children: [],
                    };
                }),
            };
        });
        return {
            id: dimension.id,
            name: dimension.name,
            level: 1,
            averageScore: dimension.averageScore,
            maxScore: dimension.maxScore,
            deduction: dimension.deduction,
            color: dimension.color,
            children,
        };
    });
};

const createGradeReport = (configs: WeekConfig[], gradeId: string): MoralEducationGradeReport => {
    const problemDimensions = createProblemDimensions(configs, gradeId);
    const dimensions = createDimensions(configs, gradeId, problemDimensions);
    return {
        gradeId,
        dimensions,
        scoreTree: createScoreTree(configs, gradeId, dimensions, problemDimensions),
        problemDimensions,
    };
};

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
    const gradeReports = ['all', ...BASE_GRADES.map(grade => grade.id)]
        .map(gradeId => createGradeReport(definition.weeks, gradeId));
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
        trend,
        grades,
        classRanking,
        gradeReports,
    };
};
