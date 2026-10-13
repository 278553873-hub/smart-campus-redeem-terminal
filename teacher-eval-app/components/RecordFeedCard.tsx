import React from 'react';
import { Play } from 'lucide-react';
import {
  GROWTH_RECORD_SOURCE_LABELS,
  type GrowthRecord,
  type GrowthReviewStatus,
} from '../domain/growthRecord.ts';
import { formatPoints } from '../domain/scoring.ts';
import { describeRecordAiInsight } from '../domain/aiInsight.ts';
import { CATEGORY_ICONS } from './categoryIcons.tsx';

const STATUS_TONES: Record<GrowthReviewStatus, { background: string; color: string }> = {
  已通过: { background: 'var(--tm-status-positive-soft)', color: 'var(--tm-status-positive-strong)' },
  待审核: { background: 'var(--tm-brand-reward-soft)', color: 'var(--tm-brand-reward-strong)' },
  未通过: { background: 'var(--tm-status-negative-soft)', color: 'var(--tm-status-negative-strong)' },
};

const formatVoiceDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return minutes + ':' + rest;
};

interface RecordFeedCardProps {
  record: GrowthRecord;
  onOpen: (record: GrowthRecord) => void;
}

const RecordFeedCard: React.FC<RecordFeedCardProps> = ({ record, onOpen }) => {
  const Icon = CATEGORY_ICONS[record.category];
  const tone = STATUS_TONES[record.reviewStatus];

  return (
    <button
      type="button"
      onClick={() => onOpen(record)}
      className="w-full rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)] text-left"
      style={{ boxShadow: 'var(--tm-shadow-card)' }}
    >
      <div className="flex items-center gap-[var(--tm-space-2)]">
        <span className="text-[13px] font-semibold tabular-nums text-[var(--tm-text-primary)]">{record.issuedAt}</span>
        <span className="text-[12px] font-medium text-[var(--tm-text-tertiary)]">
          {GROWTH_RECORD_SOURCE_LABELS[record.source]}
        </span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold leading-tight"
          style={{ background: tone.background, color: tone.color }}
        >
          {record.reviewStatus}
        </span>
      </div>

      <div className="mt-[var(--tm-space-3)] border-t border-[var(--tm-border-subtle)] pt-[var(--tm-space-3)]">
        {record.evidenceImage ? (
          <img
            src={record.evidenceImage}
            alt={record.evidenceLabel ?? '证明材料'}
            className="h-[76px] w-[104px] rounded-[var(--tm-radius-control)] object-cover"
          />
        ) : record.source === 'voice' && record.voiceSeconds ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tm-bg-surface-soft)] px-2.5 py-1.5">
            <Play className="h-3 w-3" color="var(--tm-text-secondary)" strokeWidth={2.4} aria-hidden="true" />
            <span className="text-[12px] font-semibold text-[var(--tm-text-secondary)]">原始语音</span>
            <span className="text-[12px] font-medium tabular-nums text-[var(--tm-text-tertiary)]">
              {formatVoiceDuration(record.voiceSeconds)}
            </span>
          </span>
        ) : null}
        {record.inputText && (
          <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-relaxed text-[var(--tm-text-primary)]">
            {record.inputText}
          </p>
        )}
      </div>

      <div className="mt-[var(--tm-space-3)] rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-3)]">
        <div className="flex items-center gap-[var(--tm-space-2)]">
          <span className="h-3.5 w-[3px] rounded-full bg-[var(--tm-brand-primary)]" aria-hidden="true" />
          <span className="text-[13px] font-bold text-[var(--tm-text-primary)]">AI 智能解读</span>
          <span className="ml-auto text-[17px] font-bold leading-none text-[var(--tm-brand-primary)]">
            {formatPoints(record.points)}
            <span className="ml-0.5 text-[11px] font-semibold text-[var(--tm-text-secondary)]">分</span>
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" color="var(--tm-text-secondary)" strokeWidth={2.2} aria-hidden="true" />
          <span className="text-[12px] font-medium text-[var(--tm-text-secondary)]">
            {record.category} · {record.level} · {record.rank}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-[12px] font-medium text-[var(--tm-text-tertiary)]">
          {describeRecordAiInsight(record)}
        </p>
      </div>
    </button>
  );
};

export default RecordFeedCard;
