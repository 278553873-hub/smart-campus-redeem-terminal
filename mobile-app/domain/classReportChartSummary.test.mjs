import assert from 'node:assert/strict';
import {
    getEducationEventAnalysis,
    getEducationScoreAnalysis,
    getRecordDistributionAnalysis,
    getRecordDistributionComparisonRows,
    getRecordDistributionOverview,
} from './classReportChartSummary.ts';

const assertTwoPartAnalysis = (analysis, message) => {
    assert.equal(typeof analysis.summary, 'string', `${message}：总结必须是文本`);
    assert.ok(analysis.summary.length > 0, `${message}：总结不能为空`);
    assert.equal(typeof analysis.supplement, 'string', `${message}：补充必须是文本`);
    assert.ok(analysis.supplement.length > 0, `${message}：补充不能为空`);
    assert.ok(analysis.summary.length <= 30, `${message}：总结应保持简短`);
    assert.ok(analysis.supplement.length <= 80, `${message}：补充不应过长`);
    assert.ok(!/\d/.test(`${analysis.summary}${analysis.supplement}`), `${message}：解析不应重复图中数字`);
};

const period = (overrides = {}) => ({
    positive: 60,
    negative: 40,
    coveredStudents: 20,
    totalStudents: 40,
    periodDays: 7,
    sourceKey: 'all',
    ...overrides,
});

const benchmark = (classId, positive = 60, negative = 40, overrides = {}) => ({
    classId,
    ...period({ positive, negative, ...overrides }),
});

const gradeBenchmarks = (positive = 60, negative = 40, overrides = {}) => [
    benchmark('peer-1', positive, negative, overrides),
    benchmark('peer-2', positive, negative, overrides),
    benchmark('peer-3', positive, negative, overrides),
];

const recordAnalysis = ({ current, previous, benchmarks, currentClassId = 'current-class' } = {}) => (
    getRecordDistributionAnalysis({
        currentClassId,
        current: period(current),
        previous: period(previous),
        gradeBenchmarks: benchmarks ?? gradeBenchmarks(),
    })
);

const improvingRecordAnalysis = recordAnalysis({
    current: { positive: 84, negative: 16 },
    previous: { positive: 76, negative: 24 },
    benchmarks: gradeBenchmarks(82, 18),
});
assert.deepEqual(improvingRecordAnalysis, {
    summary: '正向记录占比较上周期上升',
    supplement: '正负向记录构成与年级参照接近',
});
assertTwoPartAnalysis(improvingRecordAnalysis, '评价记录占比上升');

const rawCountCounterExample = getRecordDistributionAnalysis({
    currentClassId: 'current-class',
    current: period({ positive: 375, negative: 72, coveredStudents: 38 }),
    previous: period({ positive: 265, negative: 84, coveredStudents: 35 }),
    gradeBenchmarks: gradeBenchmarks(396, 87, { coveredStudents: 38 }),
});
assert.equal(
    rawCountCounterExample.supplement,
    '正负向记录构成与年级参照接近',
    '本班正向占比更高时，不得因原始正向条数更少而判断低于年级参照',
);

assert.equal(recordAnalysis({
    current: { positive: 180, negative: 40 },
    previous: { positive: 90, negative: 10 },
}).summary, '正向记录占比较上周期下降', '正负向条数都增加时仍应按正向占比判断');

assert.deepEqual(recordAnalysis({
    current: { positive: 0, negative: 0, coveredStudents: 0 },
}), {
    summary: '本周期暂无正负向评价记录',
    supplement: '建议积累有方向的评价记录后再查看分布',
});
assert.equal(recordAnalysis({ current: { positive: 20, negative: 9 } }).summary, '当前记录较少，暂不判断趋势');
assert.equal(recordAnalysis({
    current: { positive: 6000, negative: 4000, coveredStudents: 4999, totalStudents: 10000 },
}).summary, '当前覆盖范围有限，暂不判断趋势');
assert.equal(recordAnalysis({
    current: { positive: 6000, negative: 4000, coveredStudents: 5000, totalStudents: 10000 },
    previous: { positive: 6000, negative: 4000, coveredStudents: 5000, totalStudents: 10000 },
    benchmarks: gradeBenchmarks(6000, 4000, { coveredStudents: 5000, totalStudents: 10000 }),
}).summary, '正负向记录构成变化不大');
assert.equal(recordAnalysis({ previous: { sourceKey: 'mine' } }).summary, '上周期口径不同，暂不比较趋势');
assert.equal(recordAnalysis({ previous: { periodDays: 6 } }).summary, '上周期口径不同，暂不比较趋势');
assert.equal(recordAnalysis({ previous: { positive: 0, negative: 0, coveredStudents: 0 } }).summary, '上周期暂无可比记录');
assert.equal(recordAnalysis({ previous: { positive: 20, negative: 9 } }).summary, '上周期记录较少，暂不比较趋势');
assert.equal(recordAnalysis({ previous: { coveredStudents: 19, totalStudents: 40 } }).summary, '上周期覆盖有限，暂不比较趋势');

for (const [currentPositive, previousPositive, expected] of [
    [60, 50, '正向记录占比较上周期明显上升'],
    [60, 55, '正向记录占比较上周期上升'],
    [60, 56, '正负向记录构成变化不大'],
    [50, 55, '正向记录占比较上周期下降'],
    [50, 60, '正向记录占比较上周期明显下降'],
]) {
    assert.equal(recordAnalysis({
        current: { positive: currentPositive, negative: 100 - currentPositive },
        previous: { positive: previousPositive, negative: 100 - previousPositive },
    }).summary, expected, `周期变化边界 ${currentPositive - previousPositive} 个百分点归属错误`);
}

assert.equal(recordAnalysis({
    current: { positive: 70, negative: 30 },
    benchmarks: gradeBenchmarks(60, 40),
}).supplement, '正向记录占比明显高于年级参照');
assert.equal(recordAnalysis({
    current: { positive: 65, negative: 35 },
    benchmarks: gradeBenchmarks(60, 40),
}).supplement, '正向记录占比高于年级参照');
assert.equal(recordAnalysis({
    current: { positive: 55, negative: 45 },
    benchmarks: gradeBenchmarks(60, 40),
}).supplement, '正向记录占比低于年级参照');
assert.equal(recordAnalysis({
    current: { positive: 50, negative: 50 },
    benchmarks: gradeBenchmarks(60, 40),
}).supplement, '正向记录占比明显低于年级参照');
assert.equal(recordAnalysis({
    benchmarks: gradeBenchmarks().slice(0, 2),
}).supplement, '暂无稳定的年级参照');
assert.equal(recordAnalysis({
    benchmarks: [benchmark('current-class'), benchmark('peer-1'), benchmark('peer-1'), benchmark('peer-2')],
}).supplement, '暂无稳定的年级参照', '当前班和重复班级不得计入年级参照');
assert.equal(recordAnalysis({ current: { positive: -1 } }).summary, '图表数据暂不可用');
assert.equal(recordAnalysis({ current: { sourceKey: undefined } }).summary, '图表数据暂不可用', '缺失来源标识必须安全兜底');
assert.equal(recordAnalysis({
    current: { positive: 10, negative: 10, coveredStudents: 21 },
}).summary, '图表数据暂不可用', '覆盖学生数超过有方向记录数必须触发异常兜底');

assert.deepEqual(getRecordDistributionOverview({ positive: 375, negative: 72 }), {
    positivePercentage: 84,
    negativePercentage: 16,
});
assert.deepEqual(getRecordDistributionOverview({ positive: 0, negative: 0 }), {
    positivePercentage: 0,
    negativePercentage: 0,
});
assert.deepEqual(getRecordDistributionComparisonRows({
    positive: 375,
    negative: 72,
    previousPositive: 265,
    previousNegative: 84,
    gradeAveragePositive: 396,
    gradeAverageNegative: 87,
}), [
    { key: 'positive', label: '正向事件', tone: 'positive', current: 375, previous: 265, gradeAverage: 396 },
    { key: 'negative', label: '负向事件', tone: 'negative', current: 72, previous: 84, gradeAverage: 87 },
]);

const scoreItem = (id, label, eventCount, addScore, deductScore) => ({
    id,
    label,
    eventCount,
    addScore,
    deductScore,
    netScore: addScore - deductScore,
});

const closeScores = getEducationScoreAnalysis([
    scoreItem('a', '崇德', 15, 100, 10),
    scoreItem('b', '求知', 15, 95, 10),
]);
assert.deepEqual(closeScores, {
    summary: '各维度累计净分接近',
    supplement: '各维度累计扣分接近',
});
assertTwoPartAnalysis(closeScores, '累计净分处于容差内');

const differentScores = getEducationScoreAnalysis([
    scoreItem('a', '崇德', 15, 100, 10),
    scoreItem('b', '求知', 15, 94, 10),
]);
assert.deepEqual(differentScores, {
    summary: '崇德累计净分最高，求知最低',
    supplement: '各维度累计扣分接近',
});

assert.deepEqual(getEducationScoreAnalysis([
    scoreItem('a', '崇德', 0, 0, 0),
    scoreItem('b', '求知', 0, 0, 0),
]), {
    summary: '本周期暂无五育得分记录',
    supplement: '建议积累得分记录后再查看分布',
});
assert.equal(getEducationScoreAnalysis([]).summary, '图表数据暂不可用');
assert.equal(getEducationScoreAnalysis([
    scoreItem('a', '崇德', 30, 40, 5),
]).summary, '当前仅有一个维度，无需比较得分');
assert.equal(getEducationScoreAnalysis([
    scoreItem('a', '崇德', 15, 20, 2),
    scoreItem('b', '求知', 14, 20, 2),
]).summary, '当前得分记录较少，暂不比较维度');
assert.equal(getEducationScoreAnalysis([
    scoreItem('a', '崇德', 30, 40, 5),
    scoreItem('b', '求知', 0, 0, 0),
]).summary, '求知本周期暂无得分记录');

const allNegativeScores = getEducationScoreAnalysis([
    scoreItem('a', '崇德', 15, 0, 40),
    scoreItem('b', '求知', 15, 0, 30),
]);
assert.equal(allNegativeScores.summary, '求知累计净分最高，崇德最低', '全负净分应按真实数值排序');
assert.equal(allNegativeScores.supplement, '崇德累计扣分最多，可查看对应评价事件');

assert.equal(getEducationScoreAnalysis([
    scoreItem('a', '崇德', 15, 100, 0),
    scoreItem('b', '求知', 15, 90, 0),
]).supplement, '各维度暂无扣分记录');

assert.equal(getEducationScoreAnalysis([
    scoreItem('same', '崇德', 15, 20, 2),
    scoreItem('same', '求知', 15, 20, 2),
]).summary, '图表数据暂不可用', '重复指标标识必须触发异常兜底');
assert.equal(getEducationScoreAnalysis([{
    ...scoreItem('a', '崇德', 30, 40, 5),
    netScore: 999,
}]).summary, '图表数据暂不可用', '净分汇总关系错误必须触发异常兜底');

const sixDimensionScores = Array.from({ length: 6 }, (_, index) => scoreItem(
    `score-${index}`,
    `维度${String.fromCharCode(65 + index)}`,
    5,
    10 + index,
    1,
));
assert.notEqual(getEducationScoreAnalysis(sixDimensionScores).summary, '当前得分记录较少，暂不比较维度', '六个维度满30条应达到动态门槛');
assert.equal(getEducationScoreAnalysis([
    scoreItem(undefined, '崇德', 15, 20, 2),
    scoreItem('b', '求知', 15, 20, 2),
]).summary, '图表数据暂不可用', '缺失指标标识必须安全兜底');
const longLabelScore = getEducationScoreAnalysis([
    scoreItem('long-a', '这是一个超过八个中文字符的指标名称', 15, 40, 5),
    scoreItem('long-b', '第二个同样超过八个中文字符的名称', 15, 20, 5),
]);
assert.ok(longLabelScore.summary.includes('…') && longLabelScore.summary.length <= 30, '长指标名称必须缩略且不撑破总结长度');
const tiedLongScore = getEducationScoreAnalysis([
    scoreItem('high-a', '第一个很长很长的最高指标名称', 5, 40, 5),
    scoreItem('high-b', '第二个很长很长的最高指标名称', 5, 40, 5),
    scoreItem('high-c', '第三个很长很长的最高指标名称', 5, 40, 5),
    scoreItem('low-a', '第一个很长很长的最低指标名称', 5, 20, 5),
    scoreItem('low-b', '第二个很长很长的最低指标名称', 5, 20, 5),
    scoreItem('low-c', '第三个很长很长的最低指标名称', 5, 20, 5),
]);
assert.ok(tiedLongScore.summary.length <= 30 && tiedLongScore.summary.includes('等'), '多组长并列名称必须回退为紧凑总结');
const manyLongZeroScoreDimensions = getEducationScoreAnalysis([
    scoreItem('active', '有记录维度名称很长很长', 30, 30, 0),
    scoreItem('zero-a', '第一个无记录维度名称很长', 0, 0, 0),
    scoreItem('zero-b', '第二个无记录维度名称很长', 0, 0, 0),
    scoreItem('zero-c', '第三个无记录维度名称很长', 0, 0, 0),
]);
assert.equal(manyLongZeroScoreDimensions.summary, '多个维度本周期暂无得分记录');
assertTwoPartAnalysis(manyLongZeroScoreDimensions, '多个长名称得分维度无记录');

const eventItem = (id, label, value) => ({ id, label, value });

assert.equal(getEducationEventAnalysis([]).summary, '图表数据暂不可用');
assert.deepEqual(getEducationEventAnalysis([
    eventItem('a', '崇德', 0),
    eventItem('b', '求知', 0),
]), {
    summary: '本周期暂无五育评价记录',
    supplement: '建议积累评价记录后再查看分布',
});
assert.equal(getEducationEventAnalysis([
    eventItem('a', '崇德', 30),
]).summary, '当前仅有一个维度，无需比较分布');
assert.equal(getEducationEventAnalysis([
    eventItem('a', '崇德', 15),
    eventItem('b', '求知', 14),
]).summary, '当前记录较少，暂不判断分布');
assert.equal(getEducationEventAnalysis([
    eventItem('a', '崇德', 15),
    eventItem('b', '求知', 15),
]).summary, '各维度记录占比较接近', '两个维度满30条应达到最低门槛');
assert.equal(getEducationEventAnalysis([
    eventItem('a', '崇德', 30),
    eventItem('b', '求知', 0),
]).summary, '本周期记录尚未覆盖求知');

assert.deepEqual(getEducationEventAnalysis([
    eventItem('a', '崇德', 21),
    eventItem('b', '求知', 19),
]), {
    summary: '各维度记录占比较接近',
    supplement: '可继续观察后续记录分布',
}, '占比跨度正好5个百分点应归入接近');
assert.deepEqual(getEducationEventAnalysis([
    eventItem('a', '崇德', 22),
    eventItem('b', '求知', 18),
]), {
    summary: '崇德记录较多，求知较少',
    supplement: '可查看不同维度的评价场景与记录机会',
}, '占比跨度正好10个百分点应归入中度差异');
assert.deepEqual(getEducationEventAnalysis([
    eventItem('a', '崇德', 23),
    eventItem('b', '求知', 17),
]), {
    summary: '崇德记录占比较高，求知较低',
    supplement: '建议优先核查记录较少维度的实际评价事件',
});

const eightSparseDimensions = Array.from({ length: 8 }, (_, index) => eventItem(
    `event-${index}`,
    `维度${String.fromCharCode(65 + index)}`,
    index === 0 ? 4 : 5,
));
assert.equal(getEducationEventAnalysis(eightSparseDimensions).summary, '当前记录较少，暂不判断分布', '八个维度39条未达到动态门槛');
eightSparseDimensions[0].value = 5;
assert.equal(getEducationEventAnalysis(eightSparseDimensions).summary, '各维度记录占比较接近', '八个维度40条达到动态门槛');

const fiveDimensions = Array.from({ length: 5 }, (_, index) => eventItem(
    `five-${index}`,
    `五维${String.fromCharCode(65 + index)}`,
    6,
));
assert.equal(getEducationEventAnalysis(fiveDimensions).summary, '各维度记录占比较接近', '五个维度满30条应达到最低门槛');
assert.equal(getEducationEventAnalysis([
    eventItem(undefined, '崇德', 15),
    eventItem('b', '求知', 15),
]).summary, '图表数据暂不可用', '事件缺失指标标识必须安全兜底');

const tiedEventAnalysis = getEducationEventAnalysis([
    eventItem('a', '崇德', 40),
    eventItem('b', '求知', 40),
    eventItem('c', '向阳', 10),
    eventItem('d', '尚美', 10),
]);
assert.equal(tiedEventAnalysis.summary, '崇德、求知记录占比较高，向阳、尚美较低');
assertTwoPartAnalysis(tiedEventAnalysis, '事件分布并列最高与最低');
const tiedLongEventAnalysis = getEducationEventAnalysis([
    eventItem('high-a', '第一个很长很长的高频指标名称', 40),
    eventItem('high-b', '第二个很长很长的高频指标名称', 40),
    eventItem('high-c', '第三个很长很长的高频指标名称', 40),
    eventItem('low-a', '第一个很长很长的低频指标名称', 10),
    eventItem('low-b', '第二个很长很长的低频指标名称', 10),
    eventItem('low-c', '第三个很长很长的低频指标名称', 10),
]);
assert.ok(tiedLongEventAnalysis.summary.length <= 30 && tiedLongEventAnalysis.summary.includes('等'), '事件分布长并列名称必须回退为紧凑总结');
const collidingLongLabels = getEducationEventAnalysis([
    eventItem('high-a', '共同前缀完全相同甲指标', 40),
    eventItem('high-b', '共同前缀完全相同乙指标', 40),
    eventItem('low', '低频维度', 20),
]);
assert.ok(collidingLongLabels.summary.includes('共同前缀完全相…等'), '长名称缩写相同时不得丢失并列关系');
const manyLongZeroEventDimensions = getEducationEventAnalysis([
    eventItem('active', '有记录维度名称很长很长', 30),
    eventItem('zero-a', '第一个无记录维度名称很长', 0),
    eventItem('zero-b', '第二个无记录维度名称很长', 0),
    eventItem('zero-c', '第三个无记录维度名称很长', 0),
]);
assert.equal(manyLongZeroEventDimensions.summary, '本周期记录尚未覆盖多个维度');
assertTwoPartAnalysis(manyLongZeroEventDimensions, '多个长名称事件维度无记录');

console.log('Class report chart executable rule assertions passed');
