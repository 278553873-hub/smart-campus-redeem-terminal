import React from 'react';
import { ChevronRight } from 'lucide-react';
import { GrowthCoinIcon, useGrowthCoinTerms } from '../../../components/GrowthCoinBranding';
import { formatCoinAmount } from '../../utils/coinFormat';

interface Props {
  balance: number;
  bankDeposit: number;
  onOpen: () => void;
}

/** 货币身份与两项余额固定分栏；标签和金额单行，超长数字在自身区域横向查看。 */
export default function StudentCoinAssetBand({ balance, bankDeposit, onOpen }: Props) {
  const terms = useGrowthCoinTerms();
  const balances = [
    { key: 'available', label: terms.available, value: formatCoinAmount(balance) },
    { key: 'saved', label: terms.saved, value: formatCoinAmount(bankDeposit) },
  ];
  return <button type="button" onClick={onOpen}
    aria-label={`查看校园币明细，${terms.available}${balances[0].value}，${terms.saved}${balances[1].value}`}
    className="grid min-h-[var(--tm-student-detail-asset-height)] w-full grid-cols-[var(--tm-student-detail-asset-label-width)_minmax(0,1fr)_var(--tm-student-detail-asset-chevron-space)] items-start gap-x-[var(--tm-space-2)] border-t border-[var(--tm-student-detail-asset-border)] bg-[var(--tm-student-detail-asset-bg)] py-[var(--tm-space-2)] pl-[var(--tm-space-4)] pr-[var(--tm-space-3)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]">
    <span className="flex min-h-8 min-w-0 items-center gap-[var(--tm-space-2)]">
      <GrowthCoinIcon className="h-[var(--tm-student-detail-asset-icon-size)] w-[var(--tm-student-detail-asset-icon-size)] shrink-0" alt="" />
      <span className="min-w-0 text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-primary)] [overflow-wrap:anywhere]">{terms.name}</span>
    </span>
    <span className="grid min-h-8 min-w-0 grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-center gap-x-[var(--tm-space-2)]">
      {balances.map((item, index) => <React.Fragment key={item.key}>
        {index > 0 && <span className="h-3 w-px bg-[var(--tm-border-subtle)]" aria-hidden="true" />}
        <span className="flex min-w-0 items-baseline gap-[var(--tm-space-1)] whitespace-nowrap">
        <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">{item.label}</span>
        <span className="min-w-0 overflow-x-auto whitespace-nowrap text-[length:var(--tm-font-size-compact)] font-semibold leading-5 tabular-nums text-[var(--tm-text-primary)] no-scrollbar">{item.value}</span>
        </span>
      </React.Fragment>)}
    </span>
    <span className="flex h-8 w-[var(--tm-student-detail-asset-chevron-space)] items-center justify-center" aria-hidden="true">
      <ChevronRight className="h-4 w-4 text-[var(--tm-text-tertiary)]" />
    </span>
  </button>;
}
