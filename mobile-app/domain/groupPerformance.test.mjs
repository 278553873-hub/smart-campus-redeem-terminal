import assert from 'node:assert/strict';
import { createDemoGroupPerformanceSummary, summarizeGroupPerformance } from './groupPerformance.ts';

const records = [
  { groupId: 'writing-1', scoreChange: 3 },
  { groupId: 'writing-1', scoreChange: -1 },
  { groupId: 'reading-1', scoreChange: 5 },
];

assert.deepEqual(summarizeGroupPerformance(records, 'writing-1'), {
  praiseCount: 1,
  criticismCount: 1,
});
assert.deepEqual(summarizeGroupPerformance(records, 'reading-1'), {
  praiseCount: 1,
  criticismCount: 0,
});
assert.deepEqual(
  createDemoGroupPerformanceSummary('writing-1'),
  createDemoGroupPerformanceSummary('writing-1'),
  '演示数据应只由小组 ID 稳定派生。',
);

console.log('小组原始评价事件汇总校验通过。');
