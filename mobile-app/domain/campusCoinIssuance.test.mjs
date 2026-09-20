import assert from 'node:assert/strict';
import { getClassBudgetTotal, getRankingReward, getRankingRewards, isCoinIssuanceEligible, normalizeMinimumEvaluationCount, sumPositiveScores } from './campusCoinIssuance.ts';

assert.equal(normalizeMinimumEvaluationCount(0), 1);
assert.equal(normalizeMinimumEvaluationCount(2.9), 2);
assert.equal(isCoinIssuanceEligible({ enabled: true, periodEvaluationCount: 1, minimumEvaluationCount: 1 }), true);
assert.equal(isCoinIssuanceEligible({ enabled: true, periodEvaluationCount: 0, minimumEvaluationCount: 1 }), false);
assert.equal(isCoinIssuanceEligible({ enabled: false, periodEvaluationCount: 10, minimumEvaluationCount: 1 }), false);
assert.equal(getClassBudgetTotal({ budgetMode: 'per_class', budgetAmount: 500, classStudentCount: 10 }), 500);
assert.equal(getClassBudgetTotal({ budgetMode: 'per_student', budgetAmount: 10, classStudentCount: 50 }), 500);

console.log('Campus coin issuance eligibility assertions passed');

// 得分奖励：按分数占比分配（班级预算 1000，积分排行占比 10% → 排行池 100）
const demoRewards = getRankingRewards({
  rankingPool: 100,
  students: [
    { id: 'a', score: 1 },
    { id: 'b', score: 9 },
    { id: 'c', score: 90 },
  ],
});
assert.deepEqual(demoRewards.map(row => row.reward), [1, 9, 90]);
assert.deepEqual(demoRewards.map(row => row.share), [0.01, 0.09, 0.9]);
assert.equal(demoRewards.reduce((sum, row) => sum + row.reward, 0), 100);

// 同分同额：分数相同的学生奖励完全一致
assert.equal(
  getRankingReward({ rankingPool: 100, score: 20, totalPositiveScore: 100 }),
  getRankingReward({ rankingPool: 100, score: 20, totalPositiveScore: 100 }),
);

// 0 分与负分不参与分配
assert.equal(getRankingReward({ rankingPool: 100, score: 0, totalPositiveScore: 100 }), 0);
assert.equal(getRankingReward({ rankingPool: 100, score: -5, totalPositiveScore: 100 }), 0);
assert.equal(getRankingReward({ rankingPool: 100, score: 10, totalPositiveScore: 0 }), 0);
assert.equal(getRankingReward({ rankingPool: 0, score: 10, totalPositiveScore: 100 }), 0);
assert.equal(getRankingReward({ rankingPool: Number.NaN, score: 10, totalPositiveScore: 100 }), 0);

// 全班正分总和只累计正分
assert.equal(sumPositiveScores([1, 9, 90, 0, -5]), 100);
assert.equal(sumPositiveScores([]), 0);

// 奖励保留两位小数
assert.equal(getRankingReward({ rankingPool: 100, score: 1, totalPositiveScore: 3 }), 33.33);

console.log('Campus coin ranking reward assertions passed');

