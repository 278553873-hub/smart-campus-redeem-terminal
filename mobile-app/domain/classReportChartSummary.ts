export const MIN_COMPARABLE_RECORDS = 30;
export const MIN_RECORDS_PER_INDICATOR = 5;
export const MIN_STUDENT_COVERAGE = 0.5;
export const BASIC_SHARE_CHANGE = 0.05;
export const SIGNIFICANT_SHARE_CHANGE = 0.1;
export const SCORE_SIMILARITY_RATIO = 0.05;
export const MIN_GRADE_BENCHMARK_CLASSES = 3;

const COMPARISON_EPSILON = 1e-10;

export interface RecordDistributionPeriodInput {
    positive: number;
    negative: number;
    coveredStudents: number;
    totalStudents: number;
    periodDays: number;
    sourceKey: string;
}

export interface RecordDistributionBenchmarkInput extends RecordDistributionPeriodInput {
    classId: string;
}

export interface RecordDistributionAnalysisInput {
    currentClassId: string;
    current: RecordDistributionPeriodInput;
    previous: RecordDistributionPeriodInput;
    gradeBenchmarks: RecordDistributionBenchmarkInput[];
}

export interface RecordDistributionComparisonInput {
    positive: number;
    negative: number;
    previousPositive: number;
    previousNegative: number;
    gradeAveragePositive: number;
    gradeAverageNegative: number;
}

export interface RecordDistributionComparisonRow {
    key: 'positive' | 'negative';
    label: string;
    tone: 'positive' | 'negative';
    current: number;
    previous: number;
    gradeAverage: number;
}

export interface RecordDistributionOverview {
    positivePercentage: number;
    negativePercentage: number;
}

export interface EducationScoreSummaryItem {
    id: string;
    label: string;
    eventCount: number;
    addScore: number;
    deductScore: number;
    netScore: number;
}

export interface EducationScoreAnalysisOptions {
    scoreUnit?: number;
}

export interface EducationEventSummaryItem {
    id: string;
    label: string;
    value: number;
}

export interface ClassReportChartAnalysis {
    summary: string;
    supplement: string;
}

const DATA_UNAVAILABLE: ClassReportChartAnalysis = {
    summary: '图表数据暂不可用',
    supplement: '数据口径校验未通过，请稍后再查看',
};

const isFiniteNumber = (value: number) => Number.isFinite(value);
const isNonNegativeInteger = (value: number) => Number.isInteger(value) && value >= 0;
const isPositiveInteger = (value: number) => Number.isInteger(value) && value > 0;
const isNonNegativeNumber = (value: number) => isFiniteNumber(value) && value >= 0;
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const shortenLabel = (label: string) => {
    const characters = Array.from(label.trim());
    return characters.length <= 8 ? characters.join('') : `${characters.slice(0, 7).join('')}…`;
};

const getUniqueLabels = (labels: string[]) => [...new Set(labels.map(label => label.trim()))];

const formatLabels = (labels: string[]) => {
    const shortenedLabels = getUniqueLabels(labels).map(shortenLabel);
    if (shortenedLabels.length === 1) return shortenedLabels[0];
    if (shortenedLabels.length === 2 && shortenedLabels[0] !== shortenedLabels[1]) {
        return shortenedLabels.join('、');
    }
    if (shortenedLabels[0] !== shortenedLabels[1]) {
        return `${shortenedLabels[0]}、${shortenedLabels[1]}等多个维度`;
    }
    return `${shortenedLabels[0]}等多个维度`;
};

const formatCompactLabels = (labels: string[]) => {
    const shortenedLabels = getUniqueLabels(labels).map(shortenLabel);
    return shortenedLabels.length === 1 ? shortenedLabels[0] : `${shortenedLabels[0]}等`;
};

const getTextLength = (text: string) => Array.from(text).length;

const getExtremeItems = <T,>(items: T[], getValue: (item: T) => number, mode: 'max' | 'min') => {
    const value = mode === 'max'
        ? Math.max(...items.map(getValue))
        : Math.min(...items.map(getValue));

    return {
        items: items.filter(item => getValue(item) === value),
        value,
    };
};

const getDirectionalTotal = (input: Pick<RecordDistributionPeriodInput, 'positive' | 'negative'>) => (
    input.positive + input.negative
);

const getPositiveShare = (input: Pick<RecordDistributionPeriodInput, 'positive' | 'negative'>) => (
    input.positive / getDirectionalTotal(input)
);

const getStudentCoverage = (input: Pick<RecordDistributionPeriodInput, 'coveredStudents' | 'totalStudents'>) => (
    input.coveredStudents / input.totalStudents
);

const isValidRecordPeriod = (input: RecordDistributionPeriodInput) => (
    isNonNegativeInteger(input.positive)
    && isNonNegativeInteger(input.negative)
    && isNonNegativeInteger(input.coveredStudents)
    && isPositiveInteger(input.totalStudents)
    && input.coveredStudents <= input.totalStudents
    && input.coveredStudents <= getDirectionalTotal(input)
    && isPositiveInteger(input.periodDays)
    && isNonEmptyString(input.sourceKey)
);

const isRecordPeriodSufficient = (input: RecordDistributionPeriodInput) => (
    getDirectionalTotal(input) >= MIN_COMPARABLE_RECORDS
    && getStudentCoverage(input) >= MIN_STUDENT_COVERAGE
);

const getRecordTrendSummary = (
    current: RecordDistributionPeriodInput,
    previous: RecordDistributionPeriodInput,
) => {
    const currentTotal = getDirectionalTotal(current);
    const previousTotal = getDirectionalTotal(previous);

    if (currentTotal === 0) return '本周期暂无正负向评价记录';
    if (currentTotal < MIN_COMPARABLE_RECORDS) return '当前记录较少，暂不判断趋势';
    if (getStudentCoverage(current) < MIN_STUDENT_COVERAGE) return '当前覆盖范围有限，暂不判断趋势';
    if (current.periodDays !== previous.periodDays || current.sourceKey !== previous.sourceKey) {
        return '上周期口径不同，暂不比较趋势';
    }
    if (previousTotal === 0) return '上周期暂无可比记录';
    if (previousTotal < MIN_COMPARABLE_RECORDS) return '上周期记录较少，暂不比较趋势';
    if (getStudentCoverage(previous) < MIN_STUDENT_COVERAGE) return '上周期覆盖有限，暂不比较趋势';

    const difference = getPositiveShare(current) - getPositiveShare(previous);
    if (difference >= SIGNIFICANT_SHARE_CHANGE - COMPARISON_EPSILON) return '正向记录占比较上周期明显上升';
    if (difference >= BASIC_SHARE_CHANGE - COMPARISON_EPSILON) return '正向记录占比较上周期上升';
    if (difference > -BASIC_SHARE_CHANGE + COMPARISON_EPSILON) return '正负向记录构成变化不大';
    if (difference > -SIGNIFICANT_SHARE_CHANGE + COMPARISON_EPSILON) return '正向记录占比较上周期下降';
    return '正向记录占比较上周期明显下降';
};

const getRecordBenchmarkSupplement = (
    currentClassId: string,
    current: RecordDistributionPeriodInput,
    gradeBenchmarks: RecordDistributionBenchmarkInput[],
) => {
    const currentTotal = getDirectionalTotal(current);
    if (currentTotal === 0) return '建议积累有方向的评价记录后再查看分布';
    if (!isRecordPeriodSufficient(current)) return '当前样本不足，不进行年级比较';

    const seenClassIds = new Set<string>();
    const eligibleBenchmarks = gradeBenchmarks.filter(benchmark => {
        if (!isValidRecordPeriod(benchmark) || !isNonEmptyString(benchmark.classId)) return false;
        if (benchmark.classId === currentClassId || seenClassIds.has(benchmark.classId)) return false;
        if (benchmark.periodDays !== current.periodDays || benchmark.sourceKey !== current.sourceKey) return false;
        if (!isRecordPeriodSufficient(benchmark)) return false;
        seenClassIds.add(benchmark.classId);
        return true;
    });

    if (eligibleBenchmarks.length < MIN_GRADE_BENCHMARK_CLASSES) return '暂无稳定的年级参照';

    const benchmarkShare = eligibleBenchmarks.reduce(
        (sum, benchmark) => sum + getPositiveShare(benchmark),
        0,
    ) / eligibleBenchmarks.length;
    const difference = getPositiveShare(current) - benchmarkShare;

    if (difference >= SIGNIFICANT_SHARE_CHANGE - COMPARISON_EPSILON) return '正向记录占比明显高于年级参照';
    if (difference >= BASIC_SHARE_CHANGE - COMPARISON_EPSILON) return '正向记录占比高于年级参照';
    if (difference > -BASIC_SHARE_CHANGE + COMPARISON_EPSILON) return '正负向记录构成与年级参照接近';
    if (difference > -SIGNIFICANT_SHARE_CHANGE + COMPARISON_EPSILON) return '正向记录占比低于年级参照';
    return '正向记录占比明显低于年级参照';
};

export const getRecordDistributionOverview = (
    input: Pick<RecordDistributionPeriodInput, 'positive' | 'negative'>,
): RecordDistributionOverview => {
    if (!isNonNegativeInteger(input.positive) || !isNonNegativeInteger(input.negative)) {
        return { positivePercentage: 0, negativePercentage: 0 };
    }

    const total = getDirectionalTotal(input);
    if (total === 0) return { positivePercentage: 0, negativePercentage: 0 };

    const positivePercentage = Math.round((input.positive / total) * 100);
    return {
        positivePercentage,
        negativePercentage: 100 - positivePercentage,
    };
};

export const getRecordDistributionComparisonRows = (
    input: RecordDistributionComparisonInput,
): RecordDistributionComparisonRow[] => [
    {
        key: 'positive',
        label: '正向事件',
        tone: 'positive',
        current: input.positive,
        previous: input.previousPositive,
        gradeAverage: input.gradeAveragePositive,
    },
    {
        key: 'negative',
        label: '负向事件',
        tone: 'negative',
        current: input.negative,
        previous: input.previousNegative,
        gradeAverage: input.gradeAverageNegative,
    },
];

export const getRecordDistributionAnalysis = (
    input: RecordDistributionAnalysisInput,
): ClassReportChartAnalysis => {
    if (
        !isNonEmptyString(input.currentClassId)
        || !isValidRecordPeriod(input.current)
        || !isValidRecordPeriod(input.previous)
        || !Array.isArray(input.gradeBenchmarks)
    ) {
        return DATA_UNAVAILABLE;
    }

    return {
        summary: getRecordTrendSummary(input.current, input.previous),
        supplement: getRecordBenchmarkSupplement(input.currentClassId, input.current, input.gradeBenchmarks),
    };
};

const isValidScoreItem = (item: EducationScoreSummaryItem) => (
    isNonEmptyString(item.id)
    && isNonEmptyString(item.label)
    && isNonNegativeInteger(item.eventCount)
    && isNonNegativeNumber(item.addScore)
    && isNonNegativeNumber(item.deductScore)
    && isFiniteNumber(item.netScore)
    && Math.abs(item.addScore - item.deductScore - item.netScore) < 1e-9
    && (item.eventCount > 0 || (item.addScore === 0 && item.deductScore === 0))
    && (item.eventCount === 0 || item.addScore + item.deductScore > 0)
);

const getScoreTolerance = (maximumValue: number, scoreUnit: number) => Math.max(
    scoreUnit,
    Math.ceil(((maximumValue * SCORE_SIMILARITY_RATIO) / scoreUnit) - Number.EPSILON) * scoreUnit,
);

export const getEducationScoreAnalysis = (
    items: EducationScoreSummaryItem[],
    options: EducationScoreAnalysisOptions = {},
): ClassReportChartAnalysis => {
    const ids = new Set(items.map(item => item.id));
    if (
        items.length === 0
        || ids.size !== items.length
        || items.some(item => !isValidScoreItem(item))
    ) {
        return DATA_UNAVAILABLE;
    }

    const scoreUnit = isFiniteNumber(options.scoreUnit ?? Number.NaN) && (options.scoreUnit ?? 0) > 0
        ? options.scoreUnit as number
        : 1;
    const totalEvents = items.reduce((sum, item) => sum + item.eventCount, 0);
    if (totalEvents === 0) {
        return {
            summary: '本周期暂无五育得分记录',
            supplement: '建议积累得分记录后再查看分布',
        };
    }
    if (items.length === 1) {
        return {
            summary: '当前仅有一个维度，无需比较得分',
            supplement: '当前仅展示该维度的累计得分',
        };
    }

    const minimumEvents = Math.max(MIN_COMPARABLE_RECORDS, items.length * MIN_RECORDS_PER_INDICATOR);
    if (totalEvents < minimumEvents) {
        return {
            summary: '当前得分记录较少，暂不比较维度',
            supplement: '当前样本不足，不生成维度判断',
        };
    }

    const zeroEventItems = items.filter(item => item.eventCount === 0);
    if (zeroEventItems.length > 0) {
        const detailedSummary = `${formatLabels(zeroEventItems.map(item => item.label))}本周期暂无得分记录`;
        return {
            summary: getTextLength(detailedSummary) <= 30
                ? detailedSummary
                : '多个维度本周期暂无得分记录',
            supplement: '可先查看未产生得分记录的维度',
        };
    }

    const highestNet = getExtremeItems(items, item => item.netScore, 'max');
    const lowestNet = getExtremeItems(items, item => item.netScore, 'min');
    const maximumNetMagnitude = Math.max(...items.map(item => Math.abs(item.netScore)));
    const netTolerance = getScoreTolerance(maximumNetMagnitude, scoreUnit);
    const netRange = highestNet.value - lowestNet.value;
    const highestNetLabels = highestNet.items.map(item => item.label);
    const lowestNetLabels = lowestNet.items.map(item => item.label);
    const detailedScoreSummary = `${formatLabels(highestNetLabels)}累计净分最高，${formatLabels(lowestNetLabels)}最低`;
    const summary = netRange <= netTolerance
        ? '各维度累计净分接近'
        : getTextLength(detailedScoreSummary) <= 30
            ? detailedScoreSummary
            : `${formatCompactLabels(highestNetLabels)}累计净分最高，${formatCompactLabels(lowestNetLabels)}最低`;

    const highestDeduction = getExtremeItems(items, item => item.deductScore, 'max');
    const lowestDeduction = getExtremeItems(items, item => item.deductScore, 'min');
    if (highestDeduction.value === 0) {
        return { summary, supplement: '各维度暂无扣分记录' };
    }

    const deductionTolerance = getScoreTolerance(highestDeduction.value, scoreUnit);
    const deductionRange = highestDeduction.value - lowestDeduction.value;
    return {
        summary,
        supplement: deductionRange <= deductionTolerance
            ? '各维度累计扣分接近'
            : `${formatLabels(highestDeduction.items.map(item => item.label))}累计扣分最多，可查看对应评价事件`,
    };
};

const isValidEventItem = (item: EducationEventSummaryItem) => (
    isNonEmptyString(item.id)
    && isNonEmptyString(item.label)
    && isNonNegativeInteger(item.value)
);

export const getEducationEventAnalysis = (
    items: EducationEventSummaryItem[],
): ClassReportChartAnalysis => {
    const ids = new Set(items.map(item => item.id));
    if (
        items.length === 0
        || ids.size !== items.length
        || items.some(item => !isValidEventItem(item))
    ) {
        return DATA_UNAVAILABLE;
    }

    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return {
            summary: '本周期暂无五育评价记录',
            supplement: '建议积累评价记录后再查看分布',
        };
    }
    if (items.length === 1) {
        return {
            summary: '当前仅有一个维度，无需比较分布',
            supplement: '当前仅展示该维度的事件数量',
        };
    }

    const minimumEvents = Math.max(MIN_COMPARABLE_RECORDS, items.length * MIN_RECORDS_PER_INDICATOR);
    if (total < minimumEvents) {
        return {
            summary: '当前记录较少，暂不判断分布',
            supplement: '当前样本不足，不生成维度判断',
        };
    }

    const zeroEventItems = items.filter(item => item.value === 0);
    if (zeroEventItems.length > 0) {
        const detailedSummary = `本周期记录尚未覆盖${formatLabels(zeroEventItems.map(item => item.label))}`;
        return {
            summary: getTextLength(detailedSummary) <= 30
                ? detailedSummary
                : '本周期记录尚未覆盖多个维度',
            supplement: '可查看相关维度是否存在应记录但未记录的场景',
        };
    }

    const highest = getExtremeItems(items, item => item.value, 'max');
    const lowest = getExtremeItems(items, item => item.value, 'min');
    const shareRange = (highest.value - lowest.value) / total;
    if (shareRange <= BASIC_SHARE_CHANGE + COMPARISON_EPSILON) {
        return {
            summary: '各维度记录占比较接近',
            supplement: '可继续观察后续记录分布',
        };
    }

    const highestLabelItems = highest.items.map(item => item.label);
    const lowestLabelItems = lowest.items.map(item => item.label);
    const highestLabels = formatLabels(highestLabelItems);
    const lowestLabels = formatLabels(lowestLabelItems);
    const detailedModerateSummary = `${highestLabels}记录较多，${lowestLabels}较少`;
    const moderateSummary = getTextLength(detailedModerateSummary) <= 30
        ? detailedModerateSummary
        : `${formatCompactLabels(highestLabelItems)}记录较多，${formatCompactLabels(lowestLabelItems)}较少`;
    if (shareRange <= SIGNIFICANT_SHARE_CHANGE + COMPARISON_EPSILON) {
        return {
            summary: moderateSummary,
            supplement: '可查看不同维度的评价场景与记录机会',
        };
    }

    const detailedSignificantSummary = `${highestLabels}记录占比较高，${lowestLabels}较低`;
    return {
        summary: getTextLength(detailedSignificantSummary) <= 30
            ? detailedSignificantSummary
            : `${formatCompactLabels(highestLabelItems)}记录占比较高，${formatCompactLabels(lowestLabelItems)}较低`,
        supplement: '建议优先核查记录较少维度的实际评价事件',
    };
};
