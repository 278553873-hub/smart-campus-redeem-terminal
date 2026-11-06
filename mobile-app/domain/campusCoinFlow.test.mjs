import assert from 'node:assert/strict';
import {
  formatCampusCoinFlowTime,
  formatGrowthAwardDetail,
  getCampusCoinIssueDetail,
} from './campusCoinFlow.ts';

assert.equal(
  formatGrowthAwardDetail({ type: 'weekly', startDate: '2026-08-17', endDate: '2026-08-23' }),
  '每周奖励（8月17日—8月23日）',
  '同月周奖励应标明每周发放并完整展示两端月日，不显示年份。',
);
assert.equal(
  formatGrowthAwardDetail({ type: 'weekly', startDate: '2026-08-31', endDate: '2026-09-06' }),
  '每周奖励（8月31日—9月6日）',
  '跨月周奖励应完整展示两端月份。',
);
assert.equal(
  formatGrowthAwardDetail({ type: 'weekly', startDate: '2025-12-29', endDate: '2026-01-04' }),
  '每周奖励（2025年12月29日—2026年1月4日）',
  '跨年周奖励应完整展示两端年份。',
);
assert.equal(
  formatGrowthAwardDetail({ type: 'monthly', month: '2026-08' }),
  '每月奖励（2026年8月）',
  '月奖励应包含奖励周期的年份，与到账时间分开。',
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

assert.equal(formatGrowthAwardDetail({ type: 'score', indicatorNames: ['尊师孝亲'], scoreChange: 2 }), '加分奖励（尊师孝亲，+2分）');
assert.equal(formatGrowthAwardDetail({ type: 'score', indicatorNames: ['团结互助', '主动服务'], scoreChange: 3 }), '加分奖励（团结互助；主动服务，+3分）');
assert.equal(formatGrowthAwardDetail({ type: 'score', indicatorNames: [' 尊师孝亲 ', '', '尊师孝亲'], scoreChange: 0.5 }), '加分奖励（尊师孝亲，+0.5分）', '清理空项与重复指标，保留小数分值');
assert.equal(formatGrowthAwardDetail({ type: 'score', scoreChange: 2 }), '加分奖励（评价加2分）', '历史缺少指标时不编造奖励原因');
assert.equal(formatGrowthAwardDetail({ type: 'score', indicatorNames: ['认真完成劳动实践并主动帮助同学'], scoreChange: 2 }), '加分奖励（认真完成劳动实践并主动帮助同学，+2分）', '完整保留已存指标，不再截短');
const scoreRecord = { id: 'score', category: 'growth_award', award: { type: 'score', indicatorNames: ['尊师孝亲'], scoreChange: 2 }, amount: 4, time: '2026-10-23 10:30' };
assert.equal(getCampusCoinIssueDetail(scoreRecord), '加分奖励（尊师孝亲，+2分）', '说明展示评价加分，不拿到账币数替代分值');
const { toGrowthCoinIncomeFlow, getGrowthCoinFlowDetail } = await import('../../shared/growthCoinFlow.ts');
const flow = toGrowthCoinIncomeFlow(scoreRecord);
assert.equal(flow.amount, 4);
assert.equal(flow.category, 'growth_award');
assert.equal(getGrowthCoinFlowDetail(flow), getCampusCoinIssueDetail(scoreRecord), '货柜和家长端与教师端格式一致');
assert.equal(getGrowthCoinFlowDetail({ ...flow, growthAward: undefined, detail: '历史奖励说明' }), '历史奖励说明', '兼容没有结构化奖励快照的旧流水');
console.log('成长嘉奖三端文案检查通过：完整指标、旧数据兼容、周期与跨年格式、分值与币数区分');
