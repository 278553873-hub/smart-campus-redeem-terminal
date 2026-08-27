import assert from 'node:assert/strict';
import {
  formatCampusCoinFlowTime,
  formatGrowthAwardDetail,
  getCampusCoinIssueDetail,
} from './campusCoinFlow.ts';

assert.equal(
  formatGrowthAwardDetail({ type: 'weekly', startDate: '2026-08-17', endDate: '2026-08-23' }),
  '8月17日-8月23日奖励',
  '同月周奖励应完整展示两端月日，不显示年份。',
);
assert.equal(
  formatGrowthAwardDetail({ type: 'weekly', startDate: '2026-08-31', endDate: '2026-09-06' }),
  '8月31日-9月6日奖励',
  '跨月周奖励应完整展示两端月份。',
);
assert.equal(
  formatGrowthAwardDetail({ type: 'weekly', startDate: '2025-12-29', endDate: '2026-01-04' }),
  '2025年12月29日-2026年1月4日奖励',
  '跨年周奖励应完整展示两端年份。',
);
assert.equal(
  formatGrowthAwardDetail({ type: 'monthly', month: '2026-08' }),
  '8月奖励',
  '月奖励已有年份筛选，应只展示月份。',
);
assert.equal(
  getCampusCoinIssueDetail({
    id: 'class-reward',
    category: 'class_reward',
    detail: '流动红旗',
    amount: 20,
    time: '2026-08-24 10:30',
  }),
  '流动红旗',
  '班级奖励应直接展示后台配置文案。',
);
assert.equal(formatCampusCoinFlowTime('2026-08-24 09:00'), '8月24日 09:00');
