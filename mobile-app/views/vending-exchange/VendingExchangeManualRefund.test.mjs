import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { transform } from 'esbuild';
import { formatVendingExchangeClassLabel, getVendingExchangeOperations } from '../../domain/vendingExchange.ts';

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
has(detailSource, '已出货，补扣', '退款后应可确认出货并补扣。');
has(panelSource, '<GrowthCoinIcon', '手动退币确认弹窗的成长币应使用金币图标。');
has(classViewSource, '<GrowthCoinIcon', '撤回本次兑换确认弹窗的成长币应使用金币图标。');
has(classViewSource, 'showFilterAction={false}', '班级兑换记录中的货柜记录隐藏右侧筛选入口。');
has(panelSource, 'showFilterAction && (', '记录面板应支持隐藏右侧筛选入口。');
has(panelSource, '<ExchangeRecordDateFilter', '班级兑换记录的货柜页签必须保留日期入口。');
has(cardSource, 'h-14 w-14', '货柜商品图应使用正方形媒体区，不套用班级头像的宽扁区域。');
has(cardSource, 'width={56} height={56}', '货柜商品图应按56像素正方形输出。');
has(panelSource, 'border-t border-[var(--tm-border-subtle)]', '跨月记录应使用同色分隔线而不是明显间距。');
assertOk(!panelSource.includes('pb-[var(--tm-layout-list-gap-compact)]'), '货柜兑换列表跨月不得保留额外间距。');
assertOk(!panelSource.includes('pb-[var(--tm-space-2)]') && !classViewSource.includes('pb-[var(--tm-space-2)]'), '日期与统计行不应额外增加底部留白，需保持上下居中。');
has(panelSource, '<span className="sr-only">{coinTerms.name}</span>', '确认弹窗的成长币图标应保留读屏名称但不显示文字。');
has(classViewSource, '<span className="sr-only">{GROWTH_COIN_TERMS.name}</span>', '撤回兑换弹窗的成长币图标应保留读屏名称但不显示文字。');
has(panelSource, 'actions.confirm(confirmation.record, confirmation.preview)', '确认后以老师看到的订单及金额提交。');
has(panelSource, '确认未出货并退币', '退币必须先二次确认。');
has(panelSource, 'confirmDisabled={submitting}', '提交时禁用确认按钮。');
has(panelSource, 'confirmPreview.available', '余额不足时应提示可用余额。');
has(panelSource, 'confirmPreview.shortfall', '余额不足时应提示差额。');
has(panelSource, '「{confirmation.record.productName}」？', '货柜确认弹窗应按原样显示商品名称。');
has(panelSource, '已退回', '退币成功后应给出结果反馈。');
assert.equal(appSource.split('actions={vendingExchangeActions}').length - 1, 2, '两个入口共用操作。');
assert.equal(appSource.split('corrections={coinAccount.vendingCorrections}').length - 1, 2, '两个入口共用同一份纠错结果。');
has(flowSource, "record.category === 'vending_exchange' || item.refundReason === 'exchange_revoked'", '货柜支出应按关联原单识别手动或自动退还。');

const { code } = await transform(detailSource.replace(/^import .*;$/gm, ''), { loader: 'tsx', format: 'cjs', jsx: 'transform' });
const detailModule = { exports: {} };
vm.runInNewContext(code, {
  module: detailModule, React,
  MobileBottomSheet: ({ children, footer }) => React.createElement(React.Fragment, null, children, footer),
  formatVendingExchangeClassLabel, getVendingExchangeOperations,
  GrowthCoinIcon: () => null,
  useGrowthCoinTerms: () => ({ name: '成长币' }),
  formatCoinAmount: String,
  VendingExchangeStatusTags: ({ record }) => React.createElement('span', { 'data-status': record.status }),
});
const renderDetail = (fields, correction) => renderToStaticMarkup(React.createElement(detailModule.exports.default, {
  record: {
    id: 'order-1', studentName: '林天雅', studentNo: '20250301', className: '2025级3班', gradeName: '二年级',
    productName: '铅笔*12', time: '2026-11-05 10:33:00',
    terminalDeviceName: '一号货柜', channelName: 'A06', orderNo: 'HG1001',
    unitPrice: 20, chargedAmount: 20, status: 'failed', refundStatus: 'refunded', refundedAmount: 20, ...fields,
  },
  onClose() {},
  onRequestCorrection() {},
  correction,
}));
const refundedAt = '2026-11-05 10:34:00';
const legacy = { refundReason: 'not_dispensed', refundedAt };
const detailPage = renderDetail(legacy, 'charge');
assert.doesNotMatch(detailPage, /role="tablist"|role="tabpanel"/);
const studentInfo = detailPage.match(/>学生信息<\/h2>(.*?)<\/section>/)?.[1] ?? '';
const fieldLabels = html => [...html.matchAll(/<dt[^>]*>([^<]+)<\/dt>/g)].map(match => match[1]);
assert.deepEqual(fieldLabels(studentInfo), ['学生姓名', '所在班级']);
assert.match(studentInfo, />林天雅<\/dd>/);
assert.match(studentInfo, />2025级3班<\/dd>/);
assert.doesNotMatch(studentInfo, /data-status=|铅笔/);
assert.doesNotMatch(detailPage, /兑换概况|学号|商品分类|兑换数量|兑换时单价|原扣币|二年级|首次兑换/);
assert.match(detailPage, /已出货，补扣<\/button>/);
assert.doesNotMatch(detailPage, /未出货，退币<\/button>/);
assert.doesNotMatch(renderDetail(legacy), /已出货，补扣<\/button>/);

const exchangeInfo = detailPage.match(/>兑换信息<\/h2>(.*?)<\/section>/)?.[1] ?? '';
assert.deepEqual(fieldLabels(exchangeInfo), ['商品', '价格', '货柜', '兑换单号']);
assert.match(exchangeInfo, />商品<\/dt><dd[^>]*>铅笔\*12<\/dd>/);
assert.match(exchangeInfo, />价格<\/dt><dd[^>]*><span[^>]*>20<span/);
assert.match(exchangeInfo, /data-status="failed"/);
assert.equal(studentInfo.match(/<dl class="([^"]+)"/)?.[1], exchangeInfo.match(/<dl class="([^"]+)"/)?.[1], '两个区块使用同一种项和值样式');
assert.match(exchangeInfo, /一号货柜 · A06 货道.*?HG1001.*?<table aria-label="兑换操作记录"/, '货柜、货道合并并与单号和操作记录放在同一个兑换信息区');
const headings = [...exchangeInfo.matchAll(/<th scope="col"[^>]*>([^<]+)<\/th>/g)].map(match => match[1]);
assert.deepEqual(headings, ['操作人', '操作时间', '操作']);
assert.match(exchangeInfo, /未出货，自动退币/);
assert.match(exchangeInfo, /系统/);
assert.match(exchangeInfo, /<time dateTime="2026-11-05T10:34">/);
assert.match(exchangeInfo, /<tbody class="[^"]*font-size-meta[^"]*tm-font-regular[^"]*text-secondary/);
assert.match(exchangeInfo, /兑换，扣币<\/span><span[^>]*>20<span class="sr-only"> 成长币<\/span>/);
assert.match(exchangeInfo, /<td[^>]*>林天雅<\/td><td[^>]*><time dateTime="2026-11-05T10:33"><span class="whitespace-nowrap">2026-11-05<\/span>\s+<span class="whitespace-nowrap">10:33<\/span><\/time><\/td><td[^>]*><div class="flex flex-wrap[^"]*"><span>兑换，扣币/);
assert.ok(exchangeInfo.indexOf('未出货，自动退币') < exchangeInfo.indexOf('兑换，扣币'), '自动退币显示在原兑换前');
assert.match(renderDetail({ refundReason: 'exchange_revoked', refundedBy: '李老师' }), /李老师/);
const originalOnly = renderDetail({ status: 'completed', refundStatus: 'none' }, 'refund');
assert.equal((originalOnly.match(/<tbody[^>]*>(.*?)<\/tbody>/)?.[1].match(/<tr\b/g) ?? []).length, 1, '未经纠错的订单也显示首次兑换');
assert.match(originalOnly, /兑换，扣币/);

const correctedRecord = { status: 'completed', refundStatus: 'none', operations: [
  { type: 'system_refund', amount: 20, operator: '系统', time: refundedAt },
  { type: 'charge', amount: 12, shortfall: 8, operator: '张老师', time: '2026-11-05 11:20:00' },
] };
const correctedDetail = renderDetail(correctedRecord, 'refund');
assert.match(correctedDetail, />价格<\/dt><dd[^>]*><span[^>]*>20<span/, '部分补扣后仍展示兑换时价格');
assert.match(correctedDetail, /少扣/);
assert.ok(correctedDetail.indexOf('张老师') < correctedDetail.indexOf('系统'), '操作记录按最新在前展示');
assert.ok(correctedDetail.indexOf('系统') < correctedDetail.indexOf('兑换，扣币'), '多次纠错后原兑换仍在最后');
assert.match(correctedDetail, /未出货，退币<\/button>/);

console.log('货柜兑换详情、内嵌操作记录和纠错入口断言通过');
