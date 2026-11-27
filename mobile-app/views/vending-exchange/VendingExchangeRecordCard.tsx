import React, { useState } from 'react';
import { GrowthCoinIcon, useGrowthCoinTerms } from '../../../components/GrowthCoinBranding';
import { DEFAULT_PRODUCT_IMAGE, getProductImage, getProductImageScale } from '../../../shared/productImage';
import { formatVendingExchangeStudentLabel, type VendingExchangeRecord } from '../../domain/vendingExchange';
import { formatCoinLedgerTimeLabel } from '../../domain/campusCoinLedger';
import { formatCoinAmount } from '../../utils/coinFormat';
import VendingExchangeStatusTags from './VendingExchangeStatusTags';

interface Props {
  record: VendingExchangeRecord;
  today: string;
  onOpen: (recordId: string) => void;
}

/** 与班级兑换记录共用通栏流水行：左侧媒体、右侧三行信息，筛选及权限由列表层负责。 */
export default function VendingExchangeRecordCard({ record, today, onOpen }: Props) {
  const coinTerms = useGrowthCoinTerms();
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageProduct = { image: record.productImage?.trim() === failedImage ? undefined : record.productImage };
  const imageSrc = getProductImage(imageProduct);
  const studentLabel = formatVendingExchangeStudentLabel(record);
  const timeLabel = record.time.slice(0, 4) === today.slice(0, 4)
    ? formatCoinLedgerTimeLabel(record.time, today) : record.time.slice(0, 16);

  return (
    <button
      type="button"
      onClick={() => onOpen(record.id)}
      aria-haspopup="dialog"
      className="flex w-full items-center gap-[var(--tm-space-3)] px-[var(--tm-report-page-inline)] py-[var(--tm-space-3)] text-left transition-colors [transition-duration:var(--tm-duration-fast)] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none"
    >
      <span className="block h-14 w-14 shrink-0">
        <span className="block h-14 w-14 overflow-hidden rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)] outline outline-1 -outline-offset-1 outline-[var(--tm-product-image-outline)]">
          <img src={imageSrc} alt={`${record.productName}商品图`} width={56} height={56} loading="lazy" decoding="async" className="h-full w-full object-contain" style={{ scale: getProductImageScale(imageProduct) }} onError={imageSrc !== DEFAULT_PRODUCT_IMAGE ? () => setFailedImage(imageSrc) : undefined} />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-[var(--tm-space-3)]">
          <span className="min-w-0 truncate text-[length:var(--tm-font-size-body)] [font-weight:var(--tm-font-weight-semibold)] text-[var(--tm-text-primary)]">
            {record.productName}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[length:var(--tm-font-size-body)] [font-weight:var(--tm-font-weight-semibold)] tabular-nums text-[var(--tm-text-primary)]" aria-label={`商品单价${formatCoinAmount(record.unitPrice)}${coinTerms.name}`}>
            <GrowthCoinIcon alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{formatCoinAmount(record.unitPrice)}</span>
          </span>
        </span>
        <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{studentLabel}</span>
        <span className="mt-1 flex min-h-[var(--tm-tag-min-height)] flex-wrap items-center justify-between gap-x-[var(--tm-space-3)] gap-y-[var(--tm-space-1)]">
          <time dateTime={record.time.replace(' ', 'T')} className="text-[length:var(--tm-font-size-meta)] tabular-nums text-[var(--tm-text-tertiary)]">{timeLabel}</time>
          <span className="ml-auto flex min-w-0 max-w-full shrink-0 justify-end"><VendingExchangeStatusTags record={record} /></span>
        </span>
      </span>
      <span className="sr-only">查看兑换详情</span>
    </button>
  );
}
