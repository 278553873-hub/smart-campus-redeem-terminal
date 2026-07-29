export interface RecordDistributionSummaryInput {
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
    label: string;
    addScore: number;
    deductScore: number;
    netScore: number;
}

export interface EducationEventSummaryItem {
    label: string;
    value: number;
}

export interface ClassReportChartAnalysis {
    summary: string;
    supplement?: string;
}

const joinLabels = (labels: string[]) => labels.join('、');

const getExtremeItems = <T,>(items: T[], getValue: (item: T) => number, mode: 'max' | 'min') => {
    if (items.length === 0) return { items: [] as T[], value: 0 };

    const value = mode === 'max'
        ? Math.max(...items.map(getValue))
        : Math.min(...items.map(getValue));

    return {
        items: items.filter(item => getValue(item) === value),
        value,
    };
};

const getRecordTrendConclusion = (positiveDifference: number, negativeDifference: number) => {
    const positiveState = Math.sign(positiveDifference);
    const negativeState = -Math.sign(negativeDifference);

    if (positiveState === 0 && negativeState === 0) {
        return '班级评价与上周期基本持平';
    }
    if (positiveState >= 0 && negativeState >= 0) {
        return '班级评价较上周期改善';
    }
    if (positiveState <= 0 && negativeState <= 0) {
        return '班级评价较上周期回落';
    }
    return '正向和负向事件的变化不一致，暂时不判断整体趋势';
};

const getRecordBenchmarkConclusion = (input: RecordDistributionSummaryInput) => {
    const positiveDifference = input.positive - input.gradeAveragePositive;
    const negativeDifference = input.negative - input.gradeAverageNegative;

    if (positiveDifference < 0 && negativeDifference > 0) {
        return '正向偏低且负向偏高，可先检查记录是否充分，再结合具体事件判断原因';
    }
    if (positiveDifference < 0) {
        return '正向评价仍低于年级平均，可检查记录是否充分、是否集中于少数学生';
    }
    if (negativeDifference > 0) {
        return '负向事件高于年级平均，可查看是否集中在特定学生、场景或指标';
    }
    if (positiveDifference === 0 && negativeDifference === 0) {
        return '整体与年级平均持平，可继续观察后续变化';
    }
    return '整体达到或优于年级平均，可继续观察趋势是否稳定';
};

export const getRecordDistributionOverview = (
    input: Pick<RecordDistributionSummaryInput, 'positive' | 'negative'>,
): RecordDistributionOverview => {
    const total = Math.max(0, input.positive) + Math.max(0, input.negative);
    if (total === 0) return { positivePercentage: 0, negativePercentage: 0 };

    const positivePercentage = Math.round((Math.max(0, input.positive) / total) * 100);
    return {
        positivePercentage,
        negativePercentage: 100 - positivePercentage,
    };
};

export const getRecordDistributionComparisonRows = (
    input: RecordDistributionSummaryInput,
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

export const getRecordDistributionAnalysis = (input: RecordDistributionSummaryInput): ClassReportChartAnalysis => {
    const positiveDifference = input.positive - input.previousPositive;
    const negativeDifference = input.negative - input.previousNegative;

    return {
        summary: getRecordTrendConclusion(positiveDifference, negativeDifference),
        supplement: getRecordBenchmarkConclusion(input),
    };
};

const buildEducationScoreAnalysis = (items: EducationScoreSummaryItem[]): ClassReportChartAnalysis => {
    if (items.length === 0) {
        return {
            summary: '本周期数据较少',
            supplement: '建议再积累一些记录后判断五育表现',
        };
    }

    const highestNet = getExtremeItems(items, item => item.netScore, 'max');
    const lowestNet = getExtremeItems(items, item => item.netScore, 'min');
    const highestDeduction = getExtremeItems(items, item => item.deductScore, 'max');

    const highestLabels = joinLabels(highestNet.items.map(item => item.label));
    const lowestLabels = joinLabels(lowestNet.items.map(item => item.label));
    const deductionLabels = joinLabels(highestDeduction.items.map(item => item.label));
    const netScoresAreEqual = highestNet.value === lowestNet.value;

    if (netScoresAreEqual && highestDeduction.value === 0) {
        return {
            summary: '五育净得分较为均衡',
            supplement: '各维度暂无扣分，可以继续观察后续表现',
        };
    }
    if (netScoresAreEqual && highestDeduction.items.length === items.length) {
        return {
            summary: '五育净得分和扣分均较为均衡',
            supplement: '可以继续观察各维度后续表现',
        };
    }
    if (netScoresAreEqual) {
        return {
            summary: '五育净得分较为均衡',
            supplement: `${deductionLabels}扣分相对较多，建议结合具体事件看看原因`,
        };
    }
    if (highestDeduction.value === 0) {
        return {
            summary: `${highestLabels}净得分相对较高`,
            supplement: `${lowestLabels}相对较低，建议结合记录看看，是评价频次有差异，还是实际表现确有不同`,
        };
    }
    if (lowestLabels === deductionLabels) {
        return {
            summary: `${highestLabels}净得分相对较高`,
            supplement: `${lowestLabels}净得分较低且扣分较多，建议结合具体事件看看原因`,
        };
    }
    return {
        summary: `${highestLabels}净得分相对较高`,
        supplement: `建议结合具体记录看看${lowestLabels}得分偏低、${deductionLabels}扣分较多的原因`,
    };
};

export const getEducationScoreAnalysis = (items: EducationScoreSummaryItem[]) => buildEducationScoreAnalysis(items);

const buildEducationEventAnalysis = (items: EducationEventSummaryItem[]): ClassReportChartAnalysis => {
    const normalizedItems = items.map(item => ({ ...item, value: Math.max(0, item.value) }));
    const total = normalizedItems.reduce((sum, item) => sum + item.value, 0);
    if (items.length === 0 || total === 0) {
        return {
            summary: '本周期记录较少',
            supplement: '建议再积累一些记录后判断五育评价情况',
        };
    }

    const highest = getExtremeItems(normalizedItems, item => item.value, 'max');
    const lowest = getExtremeItems(normalizedItems, item => item.value, 'min');
    const highestShare = (highest.value / total) * 100;
    const lowestShare = (lowest.value / total) * 100;

    if (highest.value === lowest.value) {
        return {
            summary: '五育评价记录分布较均衡',
            supplement: '可以继续观察各维度的记录情况',
        };
    }

    const shareDifference = highestShare - lowestShare;
    if (shareDifference <= 5) {
        return {
            summary: '五育评价记录分布较均衡',
            supplement: '可以继续观察各维度的记录情况',
        };
    }

    const highestLabels = joinLabels(highest.items.map(item => item.label));
    const lowestLabels = joinLabels(lowest.items.map(item => item.label));
    if (shareDifference <= 10) {
        return {
            summary: `${highestLabels}记录相对较多，${lowestLabels}相对较少`,
            supplement: '建议看看是否与评价场景或记录习惯有关',
        };
    }
    return {
        summary: `评价记录主要集中在${highestLabels}，${lowestLabels}相对较少`,
        supplement: '建议看看是否有些场景或维度记录得比较少',
    };
};

export const getEducationEventAnalysis = (items: EducationEventSummaryItem[]) => buildEducationEventAnalysis(items);
