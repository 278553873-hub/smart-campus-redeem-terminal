import assert from 'node:assert/strict';
import {
  GROWTH_COIN_FLOW_LABELS, GROWTH_COIN_INCOME_CATEGORIES, GROWTH_COIN_EXPENSE_CATEGORIES,
  formatGrowthAwardDetail, getGrowthCoinFlowDetail, getGrowthCoinFlowStatus,
  toGrowthCoinIncomeFlow, toGrowthCoinExpenseFlow,
} from './growthCoinFlow.ts';
import { createDemoGrowthCoinFlows, createDemoGrowthCoinIssueRecords, createDemoGrowthCoinConsumeRecords } from './demoGrowthCoinFlow.ts';
import { COIN_FLOW_SCENARIOS } from './coinFlowScenarioExamples.ts';

const records = createDemoGrowthCoinFlows('student-a');
const snapshot = JSON.stringify(records);
const find = suffix => records.find(record => record.id === `student-a-${suffix}`);
assert.deepEqual(GROWTH_COIN_INCOME_CATEGORIES.map(value => GROWTH_COIN_FLOW_LABELS[value]), ['成长嘉奖', '班级奖励', '银行利息', '兑换退还']);
assert.deepEqual(GROWTH_COIN_EXPENSE_CATEGORIES.map(value => GROWTH_COIN_FLOW_LABELS[value]), ['货柜兑换', '班级兑换', '发币撤回', '手动清空']);

// 逐条对照用户确认的右侧规则，防止规则预览已更新而三端仍使用旧数据。
for (const scenario of COIN_FLOW_SCENARIOS) {
  for (const example of scenario.records) {
    if (scenario.id === '03') {
      assert.equal(formatGrowthAwardDetail({ type: 'weekly', startDate: '2026-12-28', endDate: '2027-01-03' }), example.detail);
      continue;
    }
    assert.ok(records.some(record => GROWTH_COIN_FLOW_LABELS[record.category] === example.category
      && getGrowthCoinFlowDetail(record) === example.detail
      && record.amount === Number(example.amount.slice(1))
      && record.type === (example.amount.startsWith('+') ? 'income' : 'expense')
      && (!example.status || getGrowthCoinFlowStatus(record, records) === example.status)), `三端共用数据必须覆盖规则场景：${scenario.scenario}`);
  }
}

const reward = find('score-revoked');
const recovery = find('recovery');
assert.equal(getGrowthCoinFlowStatus(reward, [reward]), undefined, '扣币尚未成功时不标已撤回');
assert.equal(getGrowthCoinFlowStatus(reward, [reward, { ...recovery, amount: 0 }]), undefined, '零余额不产生成功撤回状态');
assert.equal(getGrowthCoinFlowStatus(reward, [reward, recovery]), '已撤回', '实际只扣2币也应标记原奖励已撤回');
assert.equal(getGrowthCoinFlowStatus(reward, [reward, { ...recovery, relatedRecordId: 'another-student' }]), undefined, '其他学生的扣币不能改变当前记录');
assert.equal(getGrowthCoinFlowStatus(find('issue-1'), [{ ...recovery, relatedRecordId: find('issue-1').id }]), undefined, '周期奖励不能因评价修改变为已撤回');

const purchase = find('vending-refunded');
const refund = find('refund');
assert.equal(getGrowthCoinFlowStatus(purchase, [purchase]), undefined, '退款未到账不标已退还');
assert.equal(getGrowthCoinFlowStatus(purchase, [purchase, { ...refund, amount: 10 }]), undefined, '未等额退款不标已退还');
assert.equal(getGrowthCoinFlowStatus(purchase, [purchase, refund]), '已退还');
assert.equal(getGrowthCoinFlowStatus(find('score-supplement'), records), undefined, '补发收入不增加标签');
assert.equal(JSON.stringify(records), snapshot, '格式化和关联状态判断不能改写历史金额、时间或快照');

assert.equal(getGrowthCoinFlowDetail(find('score-1'), { canViewEvaluationDetails: false }), '加分奖励（评价加5分）');
assert.equal(getGrowthCoinFlowDetail(find('score-supplement'), { canViewEvaluationDetails: false }), '评价修改补发（评价加2分）');
assert.equal(getGrowthCoinFlowDetail({ ...find('score-1'), growthAward: undefined }, { canViewEvaluationDetails: false }), '加分奖励', '旧版文本也不能绕过家长权限');
assert.equal(getGrowthCoinFlowDetail(find('clear'), { coinName: '向阳币' }), '可用向阳币、已存向阳币');
assert.equal(getGrowthCoinFlowDetail({ ...find('issue-3'), detail: '定期7天' }), '存款利息');
assert.equal(getGrowthCoinFlowDetail(find('recovery')), '评价撤回', '撤回原因不能被当作商品追加数量');
assert.equal(find('score-supplement').amount, 4, '增加2分按原规则到账4币，分值与币数分别保存');

assert.deepEqual(records, [
  ...createDemoGrowthCoinIssueRecords('student-a').map(toGrowthCoinIncomeFlow),
  ...createDemoGrowthCoinConsumeRecords('student-a').map(toGrowthCoinExpenseFlow),
], '教师端的收入、支出快照应与货柜和家长端完全同源');
assert.equal(new Set(records.map(record => record.id)).size, records.length);
assert.ok(records.every(record => record.amount > 0), '扣分、币数不变、余额为零不生成虚假的零金额流水');
console.log('校园币流水规则检查通过：17个展示场景、关联状态、不可变历史和家长权限');
