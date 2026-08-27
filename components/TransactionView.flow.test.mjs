import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TransactionView.tsx', import.meta.url), 'utf8');

for (const text of [
  "category: 'growth_award'",
  "detail: '3月奖励'",
  "category: 'class_reward'",
  "detail: '流动红旗'",
  "category: 'bank_interest'",
  "detail: '活期存单'",
  "detail: '炫彩盲盒 ×1'",
  "detail: '卡通笔袋 ×1'",
  "detail: '2025年12月29日-2026年1月4日奖励'",
  'CATEGORY_LABELS',
  'formatFlowTime',
  'groupedTransactions',
  'tx.detail',
  'CATEGORY_LABELS[tx.category]',
]) {
  if (!source.includes(text)) throw new Error(`货柜机流程明细缺少三级结构内容：${text}`);
}

for (const forbidden of ['货柜兑换（炫彩盲盒）', '月度分红', '银行利息（活期存单）', '班级奖励 (流动红旗)', 'tx.title', 'tx.date}</span>']) {
  if (source.includes(forbidden)) throw new Error(`货柜机流程明细仍保留旧文案或旧字段：${forbidden}`);
}

console.log('货柜机流程明细三级结构检查通过');
