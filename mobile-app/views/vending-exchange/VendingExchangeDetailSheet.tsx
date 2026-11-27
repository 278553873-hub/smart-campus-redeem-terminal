import React from 'react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import { GrowthCoinIcon, useGrowthCoinTerms } from '../../../components/GrowthCoinBranding';
import { formatVendingExchangeClassLabel, getVendingExchangeOperations, type VendingCorrection, type VendingExchangeRecord } from '../../domain/vendingExchange';
import { formatCoinAmount } from '../../utils/coinFormat';
import VendingExchangeStatusTags from './VendingExchangeStatusTags';

const operationLabels = {
  exchange: '兑换，扣币',
  system_refund: '未出货，自动退币',
  refund: '未出货，退回',
  charge: '已出货，补扣',
} as const;

const sectionTitleClass = 'text-[length:var(--tm-font-size-form-group-label)] font-semibold text-[var(--tm-text-primary)]';

function CoinAmount({ amount, compact = false }: { amount: number; compact?: boolean }) {
  const coinTerms = useGrowthCoinTerms();
  return <span className="inline-flex items-center gap-[var(--tm-space-1)] tabular-nums">
    <GrowthCoinIcon alt="" aria-hidden="true" className={`shrink-0 ${compact ? 'size-[var(--tm-space-3)]' : 'size-[var(--tm-space-4)]'}`} />{formatCoinAmount(amount)}
    <span className="sr-only"> {coinTerms.name}</span>
  </span>;
}

export default function VendingExchangeDetailSheet({ record, onClose, correction, onRequestCorrection }: {
  record: VendingExchangeRecord | null;
  onClose: () => void;
  correction?: VendingCorrection;
  onRequestCorrection?: () => void;
}) {
  const cabinetLabel = [record?.terminalDeviceName, record?.channelName && `${record.channelName} 货道`].filter(Boolean).join(' · ');
  return (
    <MobileBottomSheet
      open={Boolean(record)}
      title="兑换详情"
      onClose={onClose}
      footer={correction && onRequestCorrection ? (
        <button
          type="button"
          onClick={onRequestCorrection}
          className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] transition active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
        >
          {correction === 'refund' ? '未出货，退币' : '已出货，补扣'}
        </button>
      ) : undefined}
    >
      {record && (
        <div className="divide-y divide-[var(--tm-border-subtle)] pt-[var(--tm-space-3)]">
          <section className="space-y-[var(--tm-space-2)] pb-[var(--tm-space-3)]">
            <h2 className={sectionTitleClass}>学生信息</h2>
            <DetailFields fields={[
              ['学生姓名', record.studentName],
              ['所在班级', formatVendingExchangeClassLabel(record) || '—'],
            ]} />
          </section>
          <section className="pt-[var(--tm-space-3)]">
            <div className="mb-[var(--tm-space-2)] flex flex-wrap items-center justify-between gap-x-[var(--tm-space-3)] gap-y-[var(--tm-space-1)]">
              <h2 className={sectionTitleClass}>兑换信息</h2>
              <VendingExchangeStatusTags record={record} />
            </div>
            <DetailFields fields={[
              ['商品', record.productName],
              ['价格', <CoinAmount amount={record.unitPrice} />],
              ['货柜', cabinetLabel || '—'],
              ['兑换单号', record.orderNo || '—'],
            ]} />
            <VendingExchangeOperationHistory record={record} />
          </section>
        </div>
      )}
    </MobileBottomSheet>
  );
}

function DetailFields({ fields }: { fields: [string, React.ReactNode][] }) {
  return (
    <dl className="space-y-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] leading-5 text-[var(--tm-text-secondary)]">
      {fields.map(([label, value]) => (
        <div key={label} className="flex flex-wrap justify-between gap-x-[var(--tm-space-3)]">
          <dt className="shrink-0">{label}</dt>
          <dd className="ml-auto min-w-0 max-w-full text-right tabular-nums text-[var(--tm-text-primary)] [overflow-wrap:anywhere]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function VendingExchangeOperationHistory({ record }: { record: VendingExchangeRecord }) {
  const operations = [
    { type: 'exchange' as const, amount: record.chargedAmount, operator: record.studentName, time: record.time, shortfall: undefined },
    ...getVendingExchangeOperations(record),
  ].reverse();

  return (
    <table aria-label="兑换操作记录" className="mt-[var(--tm-space-3)] w-full table-fixed border-separate border-spacing-0 text-left">
      <thead className="sticky top-0 z-10 bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
        <tr className="[&>th]:bg-[var(--tm-bg-surface-soft)] [&>th]:py-[var(--tm-space-2)] [&>th]:font-medium [&>th:first-child]:rounded-l-[var(--tm-radius-control)] [&>th:last-child]:rounded-r-[var(--tm-radius-control)]">
          <th scope="col" className="w-[19%] pl-[var(--tm-space-2)] pr-[var(--tm-space-2)]">操作人</th>
          <th scope="col" className="w-[38%] pr-[var(--tm-space-2)]">操作时间</th>
          <th scope="col">操作</th>
        </tr>
      </thead>
      <tbody className="text-[length:var(--tm-font-size-meta)] tm-font-regular leading-5 tabular-nums text-[var(--tm-text-secondary)] [&>tr:not(:last-child)>td]:border-b">
        {operations.map((operation, index) => {
          const time = operation.time?.slice(0, 16);
          return (
            <tr key={operations.length - index} className="[&>td]:border-[var(--tm-border-subtle)] [&>td]:py-[var(--tm-space-3)] [&>td]:align-top">
              <td className="px-[var(--tm-space-2)] [overflow-wrap:anywhere]">{operation.operator}</td>
              <td className="pr-[var(--tm-space-2)]">
                {time ? (
                  <time dateTime={time.replace(' ', 'T')}>
                    <span className="whitespace-nowrap">{time.slice(0, 10)}</span>{' '}
                    <span className="whitespace-nowrap">{time.slice(11)}</span>
                  </time>
                ) : '—'}
              </td>
              <td className="pr-[var(--tm-space-2)]">
                <div className="flex flex-wrap items-center gap-x-[var(--tm-space-1)]">
                  <span>{operationLabels[operation.type]}</span>
                  <CoinAmount amount={operation.amount} compact />
                  {!!operation.shortfall && <span className="inline-flex items-center gap-[var(--tm-space-1)]">少扣 <CoinAmount amount={operation.shortfall} compact /></span>}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
