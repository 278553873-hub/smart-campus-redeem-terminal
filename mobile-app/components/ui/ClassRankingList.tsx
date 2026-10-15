import React from 'react';
import { ChevronRight } from 'lucide-react';
import MobileRankingBadge from './MobileRankingBadge';

export interface ClassRankingListItem {
  id: string;
  name: string;
  rank: number;
  score: number;
  deduction?: number;
}

interface ClassRankingListProps {
  items: ReadonlyArray<ClassRankingListItem>;
  ariaLabel: string;
  onViewAll?: () => void;
  actionLabel?: string;
}

const ClassRankingList: React.FC<ClassRankingListProps> = ({
  items,
  ariaLabel,
  onViewAll,
  actionLabel = '查看完整排名',
}) => (
  <div>
    <div role="list" aria-label={ariaLabel}>
      {items.map(item => (
        <div
          key={item.id}
          role="listitem"
          className="grid min-h-[58px] grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--tm-border-subtle)] last:border-b-0"
        >
          <MobileRankingBadge rank={item.rank} />
          <span className="min-w-0 truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{item.name}</span>
          <span className="text-right">
            <strong className="block text-[15px] font-bold tabular-nums text-[var(--tm-text-primary)]">{item.score}分</strong>
            {item.deduction !== undefined && (
              <span className="mt-0.5 block text-[11px] tabular-nums text-[var(--tm-chart-negative-text)]">扣{item.deduction}分</span>
            )}
          </span>
        </div>
      ))}
    </div>
    {onViewAll && (
      <button
        type="button"
        onClick={onViewAll}
        className="mt-1 flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-1 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-brand-primary)] transition-colors active:text-[var(--tm-brand-primary-pressed)]"
      >
        <span>{actionLabel}</span>
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={2.25} />
      </button>
    )}
  </div>
);

export default ClassRankingList;
