import { toGrowthCoinIncomeFlow, type GrowthCoinIssueRecord, type GrowthCoinFlowRecord } from './growthCoinFlow.ts';

/** 三端统一的历史流水样例；切换当前规则不重写已经到账的历史记录。 */
export const createDemoGrowthCoinIssueRecords = (studentId: string): GrowthCoinIssueRecord[] => {
  const seed = Array.from(studentId).reduce((total, char) => total + char.charCodeAt(0), 0);
  return [
    { id: `${studentId}-score-1`, category: 'growth_award', award: { type: 'score', indicatorNames: ['尊师孝亲'], scoreChange: 2 }, amount: 4, time: '2026-10-23 10:30' },
    { id: `${studentId}-score-2`, category: 'growth_award', award: { type: 'score', indicatorNames: ['团结互助', '主动服务'], scoreChange: 3 }, amount: 6, time: '2026-10-22 14:20' },
    { id: `${studentId}-score-legacy`, category: 'growth_award', award: { type: 'score', scoreChange: 1 }, amount: 1, time: '2026-10-21 09:10' },
    { id: `${studentId}-issue-1`, category: 'growth_award', period: { type: 'weekly', startDate: '2026-02-16', endDate: '2026-02-22' }, amount: 100 + seed % 25, time: '2026-02-23 09:00' },
    { id: `${studentId}-issue-2`, category: 'class_reward', detail: '流动红旗', amount: 12 + seed % 9, time: '2026-02-03 10:30' },
    { id: `${studentId}-issue-3`, category: 'bank_interest', detail: '定期7天', amount: 8 + seed % 6, time: '2026-02-05 16:20' },
    { id: `${studentId}-issue-monthly`, category: 'growth_award', period: { type: 'monthly', month: '2026-01' }, amount: 100 + seed % 25, time: '2026-02-01 09:00' },
    { id: `${studentId}-issue-cross-year`, category: 'growth_award', period: { type: 'weekly', startDate: '2025-12-29', endDate: '2026-01-04' }, amount: 92 + seed % 25, time: '2026-01-05 09:00' },
  ];
};

export const createDemoGrowthCoinFlows = (studentId: string): GrowthCoinFlowRecord[] => [
  ...createDemoGrowthCoinIssueRecords(studentId).map(toGrowthCoinIncomeFlow),
  { id: `${studentId}-vending`, category: 'vending_exchange', detail: '炫彩盲盒 ×1', amount: 35, type: 'expense', date: '2026-03-05 14:15' },
  { id: `${studentId}-class-exchange`, category: 'class_exchange', detail: '卡通笔袋 ×1', amount: 45, type: 'expense', date: '2026-01-20 16:40' },
];
