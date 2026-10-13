import React from 'react';
import { GROWTH_RECORD_SOURCE_LABELS, type GrowthRecord, type GrowthReviewStatus } from '../domain/growthRecord.ts';
import { GROWTH_SCORE_TABLE, GROWTH_SCORE_YEARLY_CAP } from '../domain/scoringTable.ts';
import { formatPoints } from '../domain/scoring.ts';
import MobilePageHeader from '../../mobile-app/components/ui/MobilePageHeader.tsx';
import { CATEGORY_ICONS } from '../components/categoryIcons.tsx';

interface RecordDetailViewProps {
  record: GrowthRecord;
  onBack: () => void;
}

const STATUS_TONES: Record<GrowthReviewStatus, { background: string; color: string }> = {
  已通过: { background: 'var(--tm-status-positive-soft)', color: 'var(--tm-status-positive-strong)' },
  待审核: { background: 'var(--tm-brand-reward-soft)', color: 'var(--tm-brand-reward-strong)' },
  未通过: { background: 'var(--tm-status-negative-soft)', color: 'var(--tm-status-negative-strong)' },
};

const RecordDetailView: React.FC<RecordDetailViewProps> = ({ record, onBack }) => {
  const Icon = CATEGORY_ICONS[record.category];
  const rule = GROWTH_SCORE_TABLE[record.category];
  const tone = STATUS_TONES[record.reviewStatus];

  const detailRows = [
    { label: '颁发单位', value: record.issuer },
    { label: '落款日期', value: record.issuedAt },
    { label: '所属维度', value: record.dimension },
    { label: '填报方式', value: GROWTH_RECORD_SOURCE_LABELS[record.source] },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[var(--tm-bg-page)]">
      <MobilePageHeader title="记录详情" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] pb-[var(--tm-space-5)]">
        <section
          aria-label="记录概要"
          className="mt-[var(--tm-space-2)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)]"
          style={{ boxShadow: 'var(--tm-shadow-card)' }}
        >
          <div className="flex items-start gap-[var(--tm-space-3)]">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)]"
              aria-hidden="true"
            >
              <Icon className="h-5 w-5" color="var(--tm-brand-primary)" strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[17px] font-bold leading-snug text-[var(--tm-text-primary)]">{record.title}</h1>
              <p className="mt-1 text-[12px] font-medium text-[var(--tm-text-tertiary)]">{record.category}</p>
            </div>
          </div>
          <div className="mt-[var(--tm-space-3)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--tm-bg-surface-muted)] px-2.5 py-1 text-[12px] font-semibold text-[var(--tm-text-secondary)]">
                {record.level}
              </span>
              <span className="rounded-full bg-[var(--tm-bg-surface-muted)] px-2.5 py-1 text-[12px] font-semibold text-[var(--tm-text-secondary)]">
                {record.rank}
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-[12px] font-semibold"
                style={{ background: tone.background, color: tone.color }}
              >
                {record.reviewStatus}
              </span>
            </div>
            <span className="text-[24px] font-bold leading-none text-[var(--tm-brand-primary)]">
              {formatPoints(record.points)}
              <span className="ml-0.5 text-[12px] font-semibold text-[var(--tm-text-secondary)]">分</span>
            </span>
          </div>
          {record.reviewStatus === '未通过' && record.reviewNote && (
            <p className="mt-[var(--tm-space-3)] rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative-soft)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] text-[13px] font-medium leading-relaxed text-[var(--tm-status-negative-strong)]">
              审核未通过：{record.reviewNote}
            </p>
          )}
        </section>

        <section
          aria-label="记录明细"
          className="mt-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)]"
          style={{ boxShadow: 'var(--tm-shadow-card)' }}
        >
          {detailRows.map(row => (
            <div
              key={row.label}
              className="flex min-h-[48px] items-center justify-between gap-[var(--tm-space-3)] border-b border-[var(--tm-border-subtle)] last:border-b-0"
            >
              <span className="shrink-0 text-[13px] font-medium text-[var(--tm-text-secondary)]">{row.label}</span>
              <span className="min-w-0 text-right text-[14px] font-semibold text-[var(--tm-text-primary)]">{row.value}</span>
            </div>
          ))}
        </section>

        <section
          aria-label="积分依据"
          className="mt-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)]"
          style={{ boxShadow: 'var(--tm-shadow-card)' }}
        >
          <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">积分依据</h2>
          <p className="mt-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] text-[13px] font-semibold tabular-nums text-[var(--tm-text-primary)]">
            {record.category} · {record.level} · {record.rank} = {formatPoints(record.points)} 分
          </p>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-[var(--tm-text-secondary)]">{rule.rule}</p>
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-[var(--tm-text-tertiary)]">
            每学年成长积分合计封顶 {formatPoints(GROWTH_SCORE_YEARLY_CAP)} 分，同类别记录取最高一条计入。
          </p>
        </section>

        <section
          aria-label="证明材料"
          className="mt-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)]"
          style={{ boxShadow: 'var(--tm-shadow-card)' }}
        >
          <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">证明材料</h2>
          {record.evidenceImage ? (
            <img
              src={record.evidenceImage}
              alt={record.evidenceLabel ?? '证明材料'}
              className="mt-3 w-full rounded-[var(--tm-radius-control)] object-cover"
            />
          ) : (
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-[var(--tm-text-tertiary)]">
              本条记录由老师口述或手动填报生成，证书原件由学校档案留存。
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default RecordDetailView;
