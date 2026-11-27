import React from 'react';
import MobileTag from '../../components/ui/MobileTag';
import { VENDING_EXCHANGE_STATUS_LABELS, VENDING_REFUND_STATUS_LABELS, type VendingExchangeRecord, type VendingExchangeStatus } from '../../domain/vendingExchange';

const tones = { completed: 'positive', failed: 'negative' } as const satisfies Record<VendingExchangeStatus, string>;

export default function VendingExchangeStatusTags({ record, stacked = false }: { record: VendingExchangeRecord; stacked?: boolean }) {
  const lastOperation = record.operations?.at(-1);
  const charge = record.status === 'completed' && lastOperation?.type === 'charge' ? lastOperation : null;
  const chargeLabel = charge && (charge.amount === 0 ? '未扣币' : charge.shortfall ? '部分补扣' : '已补扣');
  const refundLabel = lastOperation?.type === 'refund' && lastOperation.amount === 0
    ? '无需退币' : VENDING_REFUND_STATUS_LABELS[record.refundStatus];
  return <span className={`inline-flex gap-[var(--tm-space-1)] ${stacked ? 'flex-col items-end' : 'flex-wrap items-center justify-end'}`}>
    <MobileTag size="meta" tone={tones[record.status]}>{VENDING_EXCHANGE_STATUS_LABELS[record.status]}</MobileTag>
    {(record.refundStatus !== 'none' || record.status === 'failed') && <MobileTag size="meta" tone={record.refundStatus === 'pending' ? 'warning' : 'neutral'}>{refundLabel}</MobileTag>}
    {charge && <MobileTag size="meta" tone={charge.shortfall ? 'warning' : 'neutral'}>{chargeLabel}</MobileTag>}
  </span>;
}
