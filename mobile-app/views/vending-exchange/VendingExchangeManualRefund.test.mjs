import fs from 'node:fs';

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
has(detailSource, "record?.refundReason === 'exchange_revoked'", '手动退币应按撤回兑换展示审计信息。');
has(detailSource, '老师手动撤回', '详情应明确退币由老师手动发起。');
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

console.log('货柜手动退币入口与流水关联断言通过');
