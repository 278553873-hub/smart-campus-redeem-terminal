import React from 'react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import { GrowthCoinIcon, useGrowthCoinTerms } from '../../../components/GrowthCoinBranding';
import type { VendingExchangeRecord } from '../../domain/vendingExchange';
import { formatCoinAmount } from '../../utils/coinFormat';
import VendingExchangeStatusTags from './VendingExchangeStatusTags';

function CoinAmount({ amount }: { amount: number }) {
  const coinTerms = useGrowthCoinTerms();
  return <span className="inline-flex items-center gap-[var(--tm-space-1)]" aria-label={`${formatCoinAmount(amount)}${coinTerms.name}`}>
    <GrowthCoinIcon alt="" aria-hidden="true" className="h-[var(--tm-space-4)] w-[var(--tm-space-4)] shrink-0" />{formatCoinAmount(amount)}
  </span>;
}

export default function VendingExchangeDetailSheet({ record, onClose }: { record: VendingExchangeRecord | null; onClose: () => void }) {
  const groups: { title: string; rows: [string, React.ReactNode][] }[] = record ? [
    { title: '兑换结果', rows: [
      ['兑换状态', <VendingExchangeStatusTags record={record} />],
      ...(record.refundStatus !== 'none' || record.status === 'failed' ? [['已退币数', <CoinAmount amount={record.refundedAmount} />] as [string, React.ReactNode]] : []),
    ] },
    { title: '商品信息', rows: [
      ['商品名称', record.productName], ['商品分类', record.categoryName], ['兑换数量', `${record.quantity}件`],
      ['兑换时单价', <CoinAmount amount={record.unitPrice} />], ['实际扣币', <CoinAmount amount={record.chargedAmount} />],
    ] },
    { title: '学生信息', rows: [['学生姓名', record.studentName], ['学号', record.studentNo || '—'], ['年级', record.gradeName], ['班级', record.className]] },
    { title: '兑换信息', rows: [['兑换时间', record.time], ['终端设备名称', record.terminalDeviceName], ['货道', record.channelName], ['兑换单号', record.orderNo]] },
  ] : [];
  return (
    <MobileBottomSheet open={Boolean(record)} title="兑换详情" onClose={onClose}>
      <div className="divide-y divide-[var(--tm-border-subtle)] pb-[var(--tm-space-4)]">
        {groups.map(group => (
          <section key={group.title} className="py-[var(--tm-space-3)] first:pt-0">
            <h2 className="mb-[var(--tm-space-2)] text-[length:var(--tm-font-size-form-group-label)] [font-weight:var(--tm-font-weight-semibold)] text-[var(--tm-text-primary)]">{group.title}</h2>
            <dl className="space-y-[var(--tm-space-3)]">
              {group.rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] tm-font-regular leading-relaxed">
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
