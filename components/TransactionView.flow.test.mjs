import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createDemoGrowthCoinFlows } from '../shared/demoGrowthCoinFlow.ts';
import { GROWTH_COIN_FLOW_LABELS, getGrowthCoinFlowDetail } from '../shared/growthCoinFlow.ts';

const source = fs.readFileSync(new URL('./TransactionView.tsx', import.meta.url), 'utf8');
const flows = createDemoGrowthCoinFlows('student-a');
assert.equal(GROWTH_COIN_FLOW_LABELS.growth_award, '成长嘉奖');
assert.ok(flows.some(record => getGrowthCoinFlowDetail(record) === '加分奖励（尊师孝亲，+2分）'));
assert.ok(flows.some(record => getGrowthCoinFlowDetail(record).startsWith('每周奖励（')));
assert.ok(flows.some(record => getGrowthCoinFlowDetail(record).startsWith('每月奖励（')));
assert.ok(flows.some(record => record.category === 'bank_interest'));
assert.ok(flows.some(record => record.category === 'class_reward'));
assert.ok(flows.some(record => record.detail === '炫彩盲盒 ×1'));
assert.equal(new Set(flows.map(record => record.id)).size, flows.length);
for (const text of ['createDemoGrowthCoinFlows(student.id)', 'getGrowthCoinFlowDetail(tx)', 'CATEGORY_LABELS[tx.category]', 'formatFlowTime(tx.date)']) {
  assert.ok(source.includes(text), `货柜流水应使用统一数据与三级结构：${text}`);
}
console.log('货柜流水检查通过：成长嘉奖分类不变，周期与加分奖励共存，使用三端统一文案');
