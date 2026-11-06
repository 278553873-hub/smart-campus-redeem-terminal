import React from 'react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import { useGrowthCoinTerms } from '../../../components/GrowthCoinBranding';
import { VENDING_EXCHANGE_STATUS_LABELS, VENDING_REFUND_STATUS_LABELS, type VendingExchangeRecord } from '../../domain/vendingExchange';
import { formatCoinAmount } from '../../utils/coinFormat';

export default function VendingExchangeDetailSheet({ record, onClose }: { record: VendingExchangeRecord | null; onClose: () => void }) {
  const coinTerms = useGrowthCoinTerms();
  const groups = record ? [
    { title: '兑换结果', rows: [
      ['兑换状态', VENDING_EXCHANGE_STATUS_LABELS[record.status]],
      ...(record.refundStatus !== 'none' || record.status === 'failed' ? [['退币状态', VENDING_REFUND_STATUS_LABELS[record.refundStatus]], ['已退币数', `${formatCoinAmount(record.refundedAmount)}${coinTerms.name}`]] : []),
    ] },
    { title: '商品信息', rows: [
      ['商品名称', record.productName], ['商品分类', record.categoryName], ['兑换数量', `${record.quantity}件`],
      ['兑换时单价', `${formatCoinAmount(record.unitPrice)}${coinTerms.name}`], ['实际扣币', `${formatCoinAmount(record.chargedAmount)}${coinTerms.name}`],
    ] },
    { title: '学生信息', rows: [['学生姓名', record.studentName], ['学号', record.studentNo || '—'], ['年级', record.gradeName], ['班级', record.className]] },
    { title: '兑换信息', rows: [['兑换时间', record.time], ['终端设备名称', record.terminalDeviceName], ['货道', record.channelName], ['兑换单号', record.orderNo]] },
  ] : [];
  return (
    <MobileBottomSheet open={Boolean(record)} title="兑换详情" onClose={onClose}>
      <div className="divide-y divide-[var(--tm-border-subtle)] pb-4">
        {groups.map(group => (
          <section key={group.title} className="py-3 first:pt-0">
            <h2 className="mb-2 text-[length:var(--tm-font-size-form-group-label)] font-semibold text-[var(--tm-text-primary)]">{group.title}</h2>
            <dl className="space-y-3">
              {group.rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 text-[length:var(--tm-font-size-body)] font-medium leading-6">
                  <dt className="shrink-0 text-[var(--tm-text-secondary)]">{label}</dt>
                  <dd className="min-w-0 break-words text-right tabular-nums text-[var(--tm-text-primary)] [overflow-wrap:anywhere]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </MobileBottomSheet>
  );
}
