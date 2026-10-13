import React from 'react';
import { ChevronRight } from 'lucide-react';
import {
  GROWTH_RECORD_SOURCE_LABELS,
  type GrowthRecord,
  type GrowthReviewStatus,
} from '../domain/growthRecord.ts';
import { formatPoints } from '../domain/scoring.ts';
import { CATEGORY_ICONS } from './categoryIcons.tsx';

const STATUS_TONES: Record<GrowthReviewStatus, { background: string; color: string }> = {
  已通过: { background: 'var(--tm-status-positive-soft)', color: 'var(--tm-status-positive-strong)' },
  待审核: { background: 'var(--tm-brand-reward-soft)', color: 'var(--tm-brand-reward-strong)' },
  未通过: { background: 'var(--tm-status-negative-soft)', color: 'var(--tm-status-negative-strong)' },
};

interface RecordCardProps {
  record: GrowthRecord;
  onOpen: (record: GrowthRecord) => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onOpen }) => {
  const Icon = CATEGORY_ICONS[record.category];
  const tone = STATUS_TONES[record.reviewStatus];

  return (
    <button
      type="button"
      onClick={() => onOpen(record)}
      className="w-full rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)] text-left transition-transform duration-150 ease-out active:scale-[0.99]"
      style={{ boxShadow: 'var(--tm-shadow-card)' }}
    >
      <div className="flex items-start gap-[var(--tm-space-3)]">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)]"
          aria-hidden="true"
        >
          <Icon className="h-[18px] w-[18px]" color="var(--tm-brand-primary)" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-[var(--tm-text-primary)]">{record.title}</h3>
          <p className="mt-1 text-[12px] font-medium leading-none text-[var(--tm-text-tertiary)]">
            {record.category} · {record.level} · {record.rank}
          </p>
          <p className="mt-1.5 text-[12px] font-medium leading-none text-[var(--tm-text-secondary)]">
            {record.issuedAt} · {GROWTH_RECORD_SOURCE_LABELS[record.source]}
          </p>
          {record.reviewStatus === '未通过' && record.reviewNote && (
            <p className="mt-1.5 text-[12px] font-semibold leading-snug text-[var(--tm-status-negative-strong)]">
              {record.reviewNote}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="text-[18px] font-bold leading-none text-[var(--tm-brand-primary)]">
            {formatPoints(record.points)}
            <span className="ml-0.5 text-[12px] font-semibold text-[var(--tm-text-secondary)]">分</span>
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[12px] font-semibold leading-tight"
            style={{ background: tone.background, color: tone.color }}
          >
            {record.reviewStatus}
          </span>
          <ChevronRight className="h-4 w-4" color="var(--tm-text-tertiary)" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
};

export default RecordCard;
