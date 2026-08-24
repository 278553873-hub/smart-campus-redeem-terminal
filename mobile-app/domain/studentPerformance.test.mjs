import assert from 'node:assert/strict';
import {
  applyStudentPerformanceEvent,
  getStudentLevelNetScore,
  getStudentPerformanceLevel,
  revertStudentPerformanceEvent,
  summarizeStudentPerformance,
} from './studentPerformance.ts';

assert.deepEqual(getStudentPerformanceLevel(-5), {
  tier: 'star',
  iconCount: 0,
  progress: 0,
  nextIconTier: 'star',
  isMaxLevel: false,
});

const boundaryCases = [
  [0, 'star', 0, 0, 'star', false],
  [1, 'star', 0, 0.5, 'star', false],
  [2, 'star', 1, 0, 'star', false],
  [9, 'star', 4, 0.5, 'moon', false],
  [10, 'moon', 1, 0, 'moon', false],
  [49, 'moon', 4, 0.9, 'sun', false],
  [50, 'sun', 1, 0, 'sun', false],
  [249, 'sun', 4, 0.98, 'crown', false],
  [250, 'crown', 1, 0, 'crown', false],
  [999, 'crown', 3, 0.996, 'crown', false],
  [1000, 'crown', 4, 1, null, true],
];

for (const [score, tier, iconCount, progress, nextIconTier, isMaxLevel] of boundaryCases) {
  assert.deepEqual(getStudentPerformanceLevel(score), {
    tier,
    iconCount,
    progress,
    nextIconTier,
    isMaxLevel,
  }, `${score}分的等级边界换算应与PRD一致。`);
}

assert.deepEqual(getStudentPerformanceLevel(7), {
  tier: 'star',
  iconCount: 3,
  progress: 0.5,
  nextIconTier: 'star',
  isMaxLevel: false,
});

assert.deepEqual(getStudentPerformanceLevel(47), {
  tier: 'moon',
  iconCount: 4,
  progress: 0.7,
  nextIconTier: 'sun',
  isMaxLevel: false,
});

assert.deepEqual(getStudentPerformanceLevel(52), {
  tier: 'sun',
  iconCount: 1,
  progress: 0.04,
  nextIconTier: 'sun',
  isMaxLevel: false,
});

assert.deepEqual(summarizeStudentPerformance([
  { scoreChange: 5 },
  { scoreChange: 1 },
  { scoreChange: -3 },
]), {
  netScore: 3,
  praiseCount: 2,
  criticismCount: 1,
});

const crossTermRecords = [
  { evaluation_date: '2025-12-20', scoreChange: 8 },
  { evaluation_date: '2026-03-01', scoreChange: 3 },
  { evaluation_date: '2026-07-31', scoreChange: -1 },
  { evaluation_date: '2026-08-01', scoreChange: 5 },
];
const currentTerm = { startDate: '2026-02-23', endDate: '2026-07-31' };

assert.equal(getStudentLevelNetScore(crossTermRecords, 'term', currentTerm), 2, '学期等级只应汇总当前学期评价。');
assert.equal(getStudentLevelNetScore(crossTermRecords, 'cumulative', currentTerm), 15, '累计等级应汇总全部历史评价。');

const moonBoundarySummary = { netScore: 10, praiseCount: 6, criticismCount: 1 };
const downgradedSummary = applyStudentPerformanceEvent(moonBoundarySummary, -1);
assert.deepEqual(downgradedSummary, {
  netScore: 9,
  praiseCount: 6,
  criticismCount: 2,
});
assert.deepEqual(getStudentPerformanceLevel(downgradedSummary.netScore), {
  tier: 'star',
  iconCount: 4,
  progress: 0.5,
  nextIconTier: 'moon',
  isMaxLevel: false,
});
assert.deepEqual(revertStudentPerformanceEvent(downgradedSummary, -1), moonBoundarySummary);

console.log('学生等级换算与奖惩统计校验通过。');
