import React, { useState } from 'react';
import { LoaderCircle, Sparkles } from 'lucide-react';
import MobileBottomSheet from '../../mobile-app/components/ui/MobileBottomSheet.tsx';
import {
  GROWTH_RECORD_LEVELS,
  GROWTH_RECORD_RANKS,
  GROWTH_RECORD_RANK_HINTS,
  type GrowthRecordCategory,
} from '../domain/growthRecord.ts';
import { GROWTH_SCORE_TABLE } from '../domain/scoringTable.ts';
import { formatPoints, getRecordPoints } from '../domain/scoring.ts';
import type { DraftFields, RecordDraft } from '../domain/recordDraft.ts';

export interface DraftImpact {
  inCurrentTerm: boolean;
  delta: number;
  sameCategoryBest: number;
  cap: number;
}

interface DraftRecordCardProps {
  draft: RecordDraft;
  impact: DraftImpact;
  onChange: (fields: DraftFields) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const DraftRecordCard: React.FC<DraftRecordCardProps> = ({ draft, impact, onChange, onCancel, onConfirm }) => {
  const [sheet, setSheet] = useState<'category' | 'level' | 'rank' | null>(null);
  const { fields } = draft;
  const points = getRecordPoints(fields.category, fields.level, fields.rank);
  const isAiCard = draft.channel !== 'manual';

  const patch = (next: Partial<DraftFields>) => onChange({ ...fields, ...next });

  const sheetOptions = () => {
    if (sheet === 'category') {
      return (Object.keys(GROWTH_SCORE_TABLE) as GrowthRecordCategory[]).map(category => ({
        value: category,
        hint: GROWTH_SCORE_TABLE[category].dimension,
        selected: fields.category === category,
        onSelect: () => patch({ category }),
      }));
    }
    if (sheet === 'level') {
      return GROWTH_RECORD_LEVELS.map(level => ({
        value: level,
        hint: '',
        selected: fields.level === level,
        onSelect: () => patch({ level }),
      }));
    }
    return GROWTH_RECORD_RANKS.map(rank => ({
      value: rank,
      hint: GROWTH_RECORD_RANK_HINTS[rank],
      selected: fields.rank === rank,
      onSelect: () => patch({ rank }),
    }));
  };

  return (
    <div
      className="rounded-[var(--tm-radius-card)] border border-[var(--tm-brand-primary-soft-strong)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)]"
      style={{ boxShadow: 'var(--tm-shadow-card-raised)' }}
    >
      <div className="flex items-center gap-[var(--tm-space-2)]">
        <span className="h-3.5 w-[3px] rounded-full bg-[var(--tm-brand-primary)]" aria-hidden="true" />
        <Sparkles className="h-4 w-4" color="var(--tm-brand-primary)" strokeWidth={2.2} aria-hidden="true" />
        <span className="text-[15px] font-bold text-[var(--tm-text-primary)]">
          {isAiCard ? 'AI 智能解读' : '填写内容'}
        </span>
        {!draft.analyzing && (
          <span className="ml-auto text-[17px] font-bold leading-none text-[var(--tm-brand-primary)]">
            {formatPoints(points)}
            <span className="ml-0.5 text-[11px] font-semibold text-[var(--tm-text-secondary)]">分</span>
          </span>
        )}
      </div>

      {draft.analyzing ? (
        <div className="mt-[var(--tm-space-3)] flex items-center gap-2">
          <LoaderCircle className="h-4 w-4 animate-spin" color="var(--tm-brand-primary)" aria-hidden="true" />
          <span className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">
            {draft.channel === 'photo' ? '正在识别证书…' : '正在转写语音…'}
          </span>
        </div>
      ) : (
        <>
          {draft.evidenceImage && (
            <img
              src={draft.evidenceImage}
              alt={draft.evidenceLabel ?? '证明材料'}
              className="mt-[var(--tm-space-3)] h-[76px] w-[104px] rounded-[var(--tm-radius-control)] object-cover"
            />
          )}
          {draft.inputText && (
            <p className="mt-[var(--tm-space-3)] line-clamp-2 text-[14px] font-medium leading-relaxed text-[var(--tm-text-primary)]">
              {draft.inputText}
            </p>
          )}
          {draft.reasoning && (
            <p className="mt-[var(--tm-space-3)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] text-[12px] font-medium leading-relaxed text-[var(--tm-text-primary)]">
              {draft.reasoning}
            </p>
          )}

          <div className="mt-[var(--tm-space-3)] border-t border-[var(--tm-border-subtle)]">
            <label className="flex min-h-[44px] items-center gap-[var(--tm-space-2)] border-b border-[var(--tm-border-subtle)]">
              <span className="w-16 shrink-0 text-[12px] font-medium text-[var(--tm-text-tertiary)]">事项名称</span>
              <input
                value={fields.title}
                onChange={event => patch({ title: event.target.value })}
                aria-label="事项名称"
                placeholder="填写事项名称"
                className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[var(--tm-text-primary)] outline-none placeholder:text-[var(--tm-input-placeholder)]"
              />
            </label>
            {([
              { id: 'category' as const, label: '类别', value: fields.category },
              { id: 'level' as const, label: '级别', value: fields.level },
              { id: 'rank' as const, label: '等次', value: fields.rank },
            ]).map(row => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSheet(row.id)}
                className="flex min-h-[44px] w-full items-center gap-[var(--tm-space-2)] border-b border-[var(--tm-border-subtle)] text-left"
              >
                <span className="w-16 shrink-0 text-[12px] font-medium text-[var(--tm-text-tertiary)]">{row.label}</span>
                <span className="min-w-0 flex-1 text-[14px] font-semibold text-[var(--tm-text-primary)]">{row.value}</span>
              </button>
            ))}
            <label className="flex min-h-[44px] items-center gap-[var(--tm-space-2)] border-b border-[var(--tm-border-subtle)]">
              <span className="w-16 shrink-0 text-[12px] font-medium text-[var(--tm-text-tertiary)]">颁发单位</span>
              <input
                value={fields.issuer}
                onChange={event => patch({ issuer: event.target.value })}
                aria-label="颁发单位"
                placeholder="填写颁发单位"
                className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[var(--tm-text-primary)] outline-none placeholder:text-[var(--tm-input-placeholder)]"
              />
            </label>
            <label className="flex min-h-[44px] items-center gap-[var(--tm-space-2)]">
              <span className="w-16 shrink-0 text-[12px] font-medium text-[var(--tm-text-tertiary)]">落款日期</span>
              <input
                value={fields.issuedAt}
                onChange={event => patch({ issuedAt: event.target.value })}
                aria-label="落款日期"
                inputMode="numeric"
                className="min-w-0 flex-1 bg-transparent text-[14px] font-medium tabular-nums text-[var(--tm-text-primary)] outline-none"
              />
            </label>
          </div>

          <p className="mt-[var(--tm-space-2)] text-[12px] font-medium leading-relaxed text-[var(--tm-text-tertiary)]">
            {impact.inCurrentTerm
              ? impact.delta > 0
                ? '提交后本学期积分 +' + formatPoints(impact.delta) + ' 分'
                : '本学期同类已有 ' + formatPoints(impact.sameCategoryBest) + ' 分，按同类取最高计入'
              : '落款日期不在本学期区间，将计入对应学年'}
          </p>

          <div className="mt-[var(--tm-space-3)] grid grid-cols-2 gap-[var(--tm-space-2)]">
            <button
              type="button"
              onClick={onCancel}
              className="h-[var(--tm-choice-pill-touch-height)] rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[15px] font-semibold text-[var(--tm-text-secondary)]"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!fields.title.trim()}
              onClick={onConfirm}
              className="h-[var(--tm-choice-pill-touch-height)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[15px] font-semibold text-[var(--tm-text-inverse)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)]"
            >
              确认入档
            </button>
          </div>
        </>
      )}

      <MobileBottomSheet
        open={sheet !== null}
        title={sheet === 'category' ? '选择类别' : sheet === 'level' ? '选择级别' : '选择等次'}
        onClose={() => setSheet(null)}
      >
        <div className="flex flex-col gap-[var(--tm-space-2)]">
          {sheetOptions().map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                option.onSelect();
                setSheet(null);
              }}
              className="flex h-[var(--tm-choice-pill-touch-height)] w-full items-center justify-between gap-2 rounded-[var(--tm-radius-control)] px-[var(--tm-space-3)] text-[15px] font-semibold"
              style={{
                background: option.selected ? 'var(--tm-brand-primary-soft)' : 'var(--tm-bg-surface)',
                color: option.selected ? 'var(--tm-brand-primary)' : 'var(--tm-text-primary)',
                border: '1px solid ' + (option.selected ? 'var(--tm-brand-primary)' : 'var(--tm-border-subtle)'),
              }}
            >
              {option.value}
              {option.hint && (
                <span className="text-[12px] font-medium text-[var(--tm-text-tertiary)]">{option.hint}</span>
              )}
            </button>
          ))}
        </div>
      </MobileBottomSheet>
    </div>
  );
};

export default DraftRecordCard;
