import React from 'react';
import MobileTag from '../../components/ui/MobileTag';
import { VENDING_EXCHANGE_STATUS_LABELS, VENDING_REFUND_STATUS_LABELS, type VendingExchangeRecord, type VendingExchangeStatus } from '../../domain/vendingExchange';

const tones = { completed: 'positive', failed: 'negative' } as const satisfies Record<VendingExchangeStatus, string>;

export default function VendingExchangeStatusTags({ record, stacked = false }: { record: VendingExchangeRecord; stacked?: boolean }) {
  return <span className={`inline-flex gap-[var(--tm-space-1)] ${stacked ? 'flex-col items-end' : 'flex-wrap items-center justify-end'}`}>
    <MobileTag size="meta" tone={tones[record.status]}>{VENDING_EXCHANGE_STATUS_LABELS[record.status]}</MobileTag>
    {(record.refundStatus !== 'none' || record.status === 'failed') && <MobileTag size="meta" tone={record.refundStatus === 'pending' ? 'warning' : 'neutral'}>{VENDING_REFUND_STATUS_LABELS[record.refundStatus]}</MobileTag>}
  </span>;
}
