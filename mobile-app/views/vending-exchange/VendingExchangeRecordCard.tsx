import React, { useState } from 'react';
import { GrowthCoinIcon, useGrowthCoinTerms } from '../../../components/GrowthCoinBranding';
import { DEFAULT_PRODUCT_IMAGE, getProductImage, getProductImageScale } from '../../../shared/productImage';
import { MobileCard } from '../../components/ui/MobileCard';
import type { VendingExchangeRecord } from '../../domain/vendingExchange';
import { formatCoinLedgerTimeLabel } from '../../domain/campusCoinLedger';
import { formatCoinAmount } from '../../utils/coinFormat';
import VendingExchangeStatusTags from './VendingExchangeStatusTags';

interface Props {
  record: VendingExchangeRecord;
  today: string;
  onOpen: (recordId: string) => void;
}

/** 展示兑换时的学生、商品与结果快照；筛选及权限由列表层负责。 */
export default function VendingExchangeRecordCard({ record, today, onOpen }: Props) {
  const coinTerms = useGrowthCoinTerms();
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageProduct = { image: record.productImage?.trim() === failedImage ? undefined : record.productImage };
  const imageSrc = getProductImage(imageProduct);
  const studentLabel = record.className ? `${record.studentName}（${record.className}）` : record.studentName;
  const timeLabel = record.time.slice(0, 4) === today.slice(0, 4)
    ? formatCoinLedgerTimeLabel(record.time, today) : record.time.slice(0, 16);

  return (
    <MobileCard variant="flat" shape="subtle" padding="none">
      <button
        type="button"
        onClick={() => onOpen(record.id)}
        aria-haspopup="dialog"
        className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-[var(--tm-space-3)] rounded-[var(--tm-radius-card-compact)] px-[var(--tm-space-4)] py-[var(--tm-space-3)] text-left transition-colors [transition-duration:var(--tm-duration-fast)] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none"
      >
        <span className="block aspect-square w-[calc(var(--tm-space-8)*2)] overflow-hidden rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)] outline outline-1 -outline-offset-1 outline-[var(--tm-product-image-outline)]">
          <img src={imageSrc} alt={`${record.productName}商品图`} width={64} height={64} loading="lazy" decoding="async" className="h-full w-full object-contain" style={{ scale: getProductImageScale(imageProduct) }} onError={imageSrc !== DEFAULT_PRODUCT_IMAGE ? () => setFailedImage(imageSrc) : undefined} />
        </span>
        <span className="flex min-w-0 flex-col gap-[var(--tm-space-2)]">
          <span className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-[var(--tm-space-3)]">
            <span className="break-words text-pretty text-[length:var(--tm-font-size-body)] [font-weight:var(--tm-font-weight-semibold)] leading-[var(--tm-space-5)] text-[var(--tm-text-primary)] [overflow-wrap:anywhere]">
              {record.productName}{record.quantity > 1 && <span className="ml-[var(--tm-space-1)] whitespace-nowrap tabular-nums text-[var(--tm-text-secondary)]">×{record.quantity}</span>}
            </span>
            <span className="inline-flex items-baseline gap-[var(--tm-space-1)] whitespace-nowrap text-[length:var(--tm-font-size-body)] [font-weight:var(--tm-font-weight-semibold)] leading-[var(--tm-space-5)] tabular-nums text-[var(--tm-text-primary)]" aria-label={`商品单价${formatCoinAmount(record.unitPrice)}${coinTerms.name}`}>
              <GrowthCoinIcon alt="" aria-hidden="true" className="h-[var(--tm-space-4)] w-[var(--tm-space-4)] shrink-0 self-center" />
              <span>{formatCoinAmount(record.unitPrice)}</span>
            </span>
          </span>
          <span className="flex min-w-0 flex-col gap-[calc(var(--tm-space-1)/2)]">
            <span className="break-words text-pretty text-[length:var(--tm-font-size-meta)] tm-font-regular leading-[1.5] text-[var(--tm-text-secondary)] [overflow-wrap:anywhere]">{studentLabel}</span>
            <span className="flex flex-wrap items-center justify-between gap-x-[var(--tm-space-3)] gap-y-[var(--tm-space-1)]">
              <time dateTime={record.time.replace(' ', 'T')} className="shrink-0 text-[length:var(--tm-font-size-meta)] tm-font-regular leading-[1.5] tabular-nums text-[var(--tm-text-tertiary)]">{timeLabel}</time>
              <span className="ml-auto flex min-w-0 max-w-full justify-end"><VendingExchangeStatusTags record={record} /></span>
            </span>
          </span>
        </span>
        <span className="sr-only">查看兑换详情</span>
      </button>
    </MobileCard>
  );
}
