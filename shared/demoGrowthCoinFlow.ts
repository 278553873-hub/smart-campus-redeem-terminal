import {
  toGrowthCoinIncomeFlow, toGrowthCoinExpenseFlow,
  type GrowthCoinIssueRecord, type GrowthCoinConsumeRecord, type GrowthCoinFlowRecord,
} from './growthCoinFlow.ts';

/** 三端统一的历史快照；切换当前发币设置不重写历史。 */
export const createDemoGrowthCoinIssueRecords = (studentId: string): GrowthCoinIssueRecord[] => [
  { id: `${studentId}-score-1`, category: 'growth_award', award: { type: 'score', scoreChange: 5, indicators: [
    { path: ['德育', '文明礼仪', '尊师孝亲'], scoreChange: 2 },
    { path: ['智育', '学习习惯', '专注听讲'], scoreChange: 3 },
  ] }, amount: 5, time: '2026-10-26 09:30' },
  { id: `${studentId}-score-supplement`, category: 'growth_award', award: { type: 'score', adjustment: 'supplement', scoreChange: 2, indicators: [
    { path: ['德育', '文明礼仪', '尊师孝亲'], scoreChange: 1 },
    { path: ['智育', '学习习惯', '专注听讲'], scoreChange: 1 },
  ] }, amount: 4, time: '2026-10-26 09:35' },
  { id: `${studentId}-score-revoked`, category: 'growth_award', award: { type: 'score', scoreChange: 5, indicators: [
    { path: ['德育', '文明礼仪', '尊师孝亲'], scoreChange: 5 },
  ] }, amount: 5, time: '2026-10-25 09:30' },
  { id: `${studentId}-score-object`, category: 'growth_award', award: { type: 'score', scoreChange: 2, indicators: [
    { path: ['德育', '日常规范', '文明用餐'], scoreChange: 2 },
  ] }, amount: 2, time: '2026-10-24 09:30' },
  { id: `${studentId}-score-change`, category: 'growth_award', award: { type: 'score', scoreChange: 3, indicators: [
    { path: ['智育', '学习习惯', '专注听讲'], scoreChange: 3 },
  ] }, amount: 3, time: '2026-10-23 09:30' },
  { id: `${studentId}-score-legacy`, category: 'growth_award', award: { type: 'score', scoreChange: 1 }, amount: 1, time: '2026-10-21 09:10' },
  { id: `${studentId}-issue-1`, category: 'growth_award', period: { type: 'weekly', startDate: '2026-10-26', endDate: '2026-11-01' }, amount: 20, time: '2026-11-02 00:00' },
  { id: `${studentId}-issue-2`, category: 'class_reward', detail: '运动会奖励', amount: 10, time: '2026-10-26 09:35' },
  { id: `${studentId}-issue-3`, category: 'bank_interest', detail: '存款利息', amount: 5, time: '2026-10-26 09:35' },
  { id: `${studentId}-issue-monthly`, category: 'growth_award', period: { type: 'monthly', month: '2026-10' }, amount: 80, time: '2026-11-01 00:00' },
  { id: `${studentId}-issue-cross-year`, category: 'growth_award', period: { type: 'weekly', startDate: '2025-12-29', endDate: '2026-01-04' }, amount: 20, time: '2026-01-05 00:00' },
  { id: `${studentId}-refund`, category: 'exchange_refund', productName: '笔记本', quantity: 1, amount: 20, time: '2026-10-26 09:35', relatedRecordId: `${studentId}-vending-refunded` },
];

export const createDemoGrowthCoinConsumeRecords = (studentId: string): GrowthCoinConsumeRecord[] => [
  { id: `${studentId}-vending`, category: 'vending_exchange', productName: '铅笔', quantity: 3, amount: 30, time: '2026-10-26 09:35' },
  { id: `${studentId}-class-exchange`, category: 'class_exchange', productName: '免作业卡', quantity: 1, amount: 10, time: '2026-10-26 09:35' },
  { id: `${studentId}-vending-refunded`, category: 'vending_exchange', productName: '笔记本', quantity: 1, amount: 20, time: '2026-10-26 09:30' },
  // 应撤回5币、可用2币：只记实际扣除的2币。存款和未来奖励不参与抵扣。
  { id: `${studentId}-recovery`, category: 'award_recovery', reason: 'evaluation_revoked', amount: 2, time: '2026-10-25 09:35', relatedRecordId: `${studentId}-score-revoked` },
  { id: `${studentId}-recovery-object`, category: 'award_recovery', reason: 'evaluation_targets_changed', amount: 2, time: '2026-10-24 09:35', relatedRecordId: `${studentId}-score-object` },
  { id: `${studentId}-recovery-score`, category: 'award_recovery', reason: 'evaluation_score_changed', amount: 2, time: '2026-10-23 09:35', relatedRecordId: `${studentId}-score-change` },
  { id: `${studentId}-clear`, category: 'manual_clear', productName: '可用成长币、已存成长币', quantity: 1, amount: 30, time: '2026-10-20 09:35' },
];

export const createDemoGrowthCoinFlows = (studentId: string): GrowthCoinFlowRecord[] => [
  ...createDemoGrowthCoinIssueRecords(studentId).map(toGrowthCoinIncomeFlow),
  ...createDemoGrowthCoinConsumeRecords(studentId).map(toGrowthCoinExpenseFlow),
];
