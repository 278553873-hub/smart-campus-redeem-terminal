import assert from 'node:assert/strict';
import {
    getEducationEventAnalysis,
    getEducationScoreAnalysis,
    getRecordDistributionAnalysis,
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

const recordImprovement = getRecordDistributionAnalysis({
    positive: 158,
    negative: 30,
    previousPositive: 112,
    previousNegative: 35,
    gradeAveragePositive: 166,
    gradeAverageNegative: 37,
});

assert.deepEqual(recordImprovement, {
    summary: '班级评价较上周期改善',
    supplement: '正向评价仍低于年级平均，建议查看记录是否充分、是否集中于少数学生，以及正向行为是否确有减少',
});
assertTwoPartAnalysis(recordImprovement, '评价记录改善场景');

const recordDecline = getRecordDistributionAnalysis({
    positive: 80,
    negative: 30,
    previousPositive: 90,
    previousNegative: 25,
    gradeAveragePositive: 85,
    gradeAverageNegative: 28,
});

assert.deepEqual(recordDecline, {
    summary: '班级评价较上周期回落',
    supplement: '正向评价低于年级平均，负向事件则高于年级平均，建议先看看记录是否充分，再结合具体事件判断原因',
});
assertTwoPartAnalysis(recordDecline, '评价记录回落场景');

const recordMixed = getRecordDistributionAnalysis({
    positive: 90,
    negative: 30,
    previousPositive: 80,
    previousNegative: 25,
    gradeAveragePositive: 90,
    gradeAverageNegative: 30,
});

assert.deepEqual(recordMixed, {
    summary: '正向和负向事件的变化不一致，暂时不判断整体趋势',
    supplement: '整体与年级平均持平，可以继续看看后续有没有变化',
});
assertTwoPartAnalysis(recordMixed, '评价记录变化不一致场景');

const educationScore = getEducationScoreAnalysis([
    { label: '德育', addScore: 49, deductScore: 5, netScore: 44 },
    { label: '智育', addScore: 74, deductScore: 9, netScore: 65 },
    { label: '体育', addScore: 165, deductScore: 19, netScore: 146 },
    { label: '美育', addScore: 139, deductScore: 34, netScore: 105 },
    { label: '劳育', addScore: 121, deductScore: 13, netScore: 108 },
]);

assert.deepEqual(educationScore, {
    summary: '体育净得分相对较高',
    supplement: '建议结合具体记录看看德育得分偏低、美育扣分较多的原因',
});
assertTwoPartAnalysis(educationScore, '五育得分常规场景');

const educationScoreWithoutData = getEducationScoreAnalysis([]);
assert.deepEqual(educationScoreWithoutData, {
    summary: '本周期数据较少',
    supplement: '建议再积累一些记录后判断五育表现',
});
assertTwoPartAnalysis(educationScoreWithoutData, '五育得分无数据场景');

const educationEventsBalanced = getEducationEventAnalysis([
    { label: '德育', value: 41 },
    { label: '智育', value: 38 },
    { label: '体育', value: 34 },
    { label: '美育', value: 39 },
    { label: '劳育', value: 36 },
]);

assert.deepEqual(educationEventsBalanced, {
    summary: '五育评价记录分布较均衡',
    supplement: '可以继续观察各维度的记录情况',
});
assertTwoPartAnalysis(educationEventsBalanced, '五育事件均衡场景');

const educationEventsFocused = getEducationEventAnalysis([
    { label: '德育', value: 50 },
    { label: '智育', value: 20 },
    { label: '体育', value: 10 },
    { label: '美育', value: 10 },
    { label: '劳育', value: 10 },
]);

assert.deepEqual(educationEventsFocused, {
    summary: '评价记录主要集中在德育，体育、美育、劳育相对较少',
    supplement: '建议看看是否有些场景或维度记录得比较少',
});
assertTwoPartAnalysis(educationEventsFocused, '五育事件差异明显场景');

const educationEventsWithoutData = getEducationEventAnalysis([]);
assert.deepEqual(educationEventsWithoutData, {
    summary: '本周期记录较少',
    supplement: '建议再积累一些记录后判断五育评价情况',
});
assertTwoPartAnalysis(educationEventsWithoutData, '五育事件无数据场景');

console.log('Class report chart analysis rule assertions passed');
