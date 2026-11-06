import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createDemoGrowthCoinFlows } from '../shared/demoGrowthCoinFlow.ts';
import { GROWTH_COIN_FLOW_LABELS, getGrowthCoinFlowDetail } from '../shared/growthCoinFlow.ts';

const source = fs.readFileSync(new URL('./TransactionView.tsx', import.meta.url), 'utf8');
const flows = createDemoGrowthCoinFlows('student-a');
assert.equal(GROWTH_COIN_FLOW_LABELS.growth_award, '成长嘉奖');
assert.ok(flows.some(record => getGrowthCoinFlowDetail(record) === '加分奖励（德育 / 文明礼仪 / 尊师孝亲，+2分；智育 / 学习习惯 / 专注听讲，+3分）'));
assert.ok(flows.some(record => getGrowthCoinFlowDetail(record).startsWith('每周奖励（')));
assert.ok(flows.some(record => getGrowthCoinFlowDetail(record).startsWith('每月奖励（')));
assert.ok(flows.some(record => record.category === 'bank_interest'));
assert.ok(flows.some(record => record.category === 'class_reward'));
assert.ok(flows.some(record => getGrowthCoinFlowDetail(record) === '铅笔×3'));
assert.ok(flows.some(record => record.category === 'exchange_refund'));
assert.ok(flows.some(record => record.category === 'award_recovery'));
assert.equal(new Set(flows.map(record => record.id)).size, flows.length);
for (const text of ['createDemoGrowthCoinFlows(student.id)', 'getGrowthCoinFlowDetail(tx, { coinName: coinTerms.name })', 'CATEGORY_LABELS[tx.category]', 'formatFlowTime(tx.date)']) {
  assert.ok(source.includes(text), `货柜流水应使用统一数据与三级结构：${text}`);
}
assert.ok(source.includes('getGrowthCoinFlowStatus(tx, transactions)'), '状态须从完整流水判断，不受筛选影响');
assert.ok(!source.includes('line-clamp-2'), '完整指标和各项分值不能被截断');
console.log('货柜流水检查通过：完整指标、补发、退款、撤回分类与关联状态');
