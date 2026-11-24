import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transform } from 'esbuild';

const detailSource = fs.readFileSync(new URL('./VendingExchangeDetailSheet.tsx', import.meta.url), 'utf8');
const panelSource = fs.readFileSync(new URL('./VendingExchangeRecordsPanel.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
const classViewSource = fs.readFileSync(new URL('../ClassExchangeRecordView.tsx', import.meta.url), 'utf8');
const cardSource = fs.readFileSync(new URL('./VendingExchangeRecordCard.tsx', import.meta.url), 'utf8');
const flowSource = fs.readFileSync(new URL('../../../shared/growthCoinFlow.ts', import.meta.url), 'utf8');

const assertOk = (condition, message) => {
  if (!condition) throw new Error(message);
};

const has = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

has(detailSource, '未出货，退币', '兑换详情应提供老师手动退币入口。');
has(detailSource, 'canRefund && onRequestRefund', '已退币或无权限时不得展示退币入口。');
has(panelSource, '<GrowthCoinIcon', '手动退币确认弹窗的成长币应使用金币图标。');
has(classViewSource, '<GrowthCoinIcon', '撤回本次兑换确认弹窗的成长币应使用金币图标。');
has(classViewSource, 'showFilterAction={false}', '班级兑换记录中的货柜记录隐藏右侧筛选入口。');
has(panelSource, 'showFilterAction && (', '记录面板应支持隐藏右侧筛选入口。');
has(panelSource, '<MobileDatePickerSheet', '班级兑换记录的货柜页签必须保留日期入口。');
has(cardSource, 'h-14 w-14', '货柜商品图应使用正方形媒体区，不套用班级头像的宽扁区域。');
has(cardSource, 'width={56} height={56}', '货柜商品图应按56像素正方形输出。');
has(panelSource, 'border-t border-[var(--tm-border-subtle)]', '跨月记录应使用同色分隔线而不是明显间距。');
assertOk(!panelSource.includes('pb-[var(--tm-layout-list-gap-compact)]'), '货柜兑换列表跨月不得保留额外间距。');
assertOk(!panelSource.includes('pb-[var(--tm-space-2)]') && !classViewSource.includes('pb-[var(--tm-space-2)]'), '日期与统计行不应额外增加底部留白，需保持上下居中。');
has(panelSource, '<span className="sr-only">{coinTerms.name}</span>', '确认弹窗的成长币图标应保留读屏名称但不显示文字。');
has(classViewSource, '<span className="sr-only">{GROWTH_COIN_TERMS.name}</span>', '撤回兑换弹窗的成长币图标应保留读屏名称但不显示文字。');
has(panelSource, 'onRefundRecord', '记录面板应把退币动作交给上层写入。');
has(panelSource, "detail.status === 'completed' && detail.refundStatus === 'none'", '只有成功且未退币的货柜记录可手动退币。');
has(panelSource, '确认未出货并退币', '手动退币必须先二次确认。');
has(panelSource, '已退回', '退币成功后应给出结果反馈。');
has(appSource, 'handleRefundVendingRecord', 'App 应统一处理货柜手动退币。');
has(appSource, 'manualRefunds={manualVendingRefundsForSpace}', '货柜管理与班级兑换记录应共用同一份手动退币结果。');
has(appSource, "refundReason: 'exchange_revoked'", '学生流水应按撤回兑换记录老师手动退币。');
has(flowSource, "record.category === 'vending_exchange' || item.refundReason === 'exchange_revoked'", '货柜支出应按关联原单识别手动或自动退还。');

const { code } = await transform(detailSource.replace(/^import .*;$/gm, ''), { loader: 'tsx', format: 'cjs', jsx: 'transform' });
const detailModule = { exports: {} };
vm.runInNewContext(code, {
  module: detailModule, React,
  MobileBottomSheet: ({ children }) => children,
  GrowthCoinIcon: () => null,
  useGrowthCoinTerms: () => ({ name: '成长币' }),
  formatCoinAmount: String,
  VendingExchangeStatusTags: () => null,
});
const renderDetail = fields => renderToStaticMarkup(React.createElement(detailModule.exports.default, {
  record: { status: 'failed', refundStatus: 'refunded', refundedAmount: 20, ...fields },
  onClose() {},
}));
const refundedAt = '2026-11-05 10:34:00';
for (const [fields, operator, time] of [
  [{ refundReason: 'not_dispensed', refundedAt }, '系统', refundedAt],
  [{}, '系统', '—'],
  [{ refundReason: 'exchange_revoked', refundedBy: '李老师', refundedAt }, '李老师', refundedAt],
  [{ refundReason: 'exchange_revoked', refundedBy: '李老师' }, '李老师', '—'],
  [{ refundReason: 'exchange_revoked', refundedAt }, '—', refundedAt],
  [{ refundStatus: 'pending' }, '—', '—'],
  [{ refundStatus: 'none' }, '—', '—'],
  [{ status: 'completed', refundStatus: 'pending' }, '—', '—'],
  [{ status: 'completed', refundedAt }, '系统', refundedAt],
]) {
  const html = renderDetail(fields);
  assert.match(html, new RegExp(`>退币人</dt><dd[^>]*>${operator}</dd>`));
  assert.match(html, new RegExp(`>退币时间</dt><dd[^>]*>${time}</dd>`));
  assert.doesNotMatch(html, /退币方式|操作人|操作老师|老师手动撤回/);
}
assert.doesNotMatch(renderDetail({ status: 'completed', refundStatus: 'none' }), />退币(?:人|时间)</);

console.log('货柜手动退币入口与流水关联断言通过');
