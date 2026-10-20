import React from 'react';
import { ASSETS } from '../assets/images';
import type { DevelopmentIndicator, DevelopmentRecord } from './data';
import { recordFieldRows } from './indicatorFields';
import RecordLevelBadge from './RecordLevelBadge';

interface Props {
  record: DevelopmentRecord;
  indicator?: DevelopmentIndicator;
  teacherName: string;
  actorId?: string;
}

/** 列表、审核与详情共用：通用结果和指标明细各自成卡。 */
export default function RecordRecognitionCards({ record, indicator, teacherName, actorId }: Props) {
  const isNegative = record.delta < 0;
  const isNeutral = record.delta === 0 || record.status === 'returned' || record.status === 'withdrawn';
  const surfaceClass = isNeutral
    ? 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)]'
    : isNegative
      ? 'border-[var(--tm-record-negative-border)] bg-[var(--tm-record-negative-bg)]'
      : 'border-[var(--tm-record-positive-border)] bg-[var(--tm-record-positive-bg)]';
  const accentClass = isNeutral ? 'bg-[var(--tm-text-tertiary)]' : isNegative ? 'bg-[var(--tm-score-negative)]' : 'bg-[var(--tm-status-positive)]';
  const scoreClass = isNeutral
    ? 'border-[var(--tm-border-subtle)] text-[var(--tm-text-secondary)]'
    : isNegative ? 'border-[var(--tm-record-negative-border)] text-[var(--tm-score-negative)]' : 'border-[var(--tm-record-positive-border)] text-[var(--tm-status-positive)]';
  const hasScore = record.status !== 'returned' && record.status !== 'withdrawn' && record.delta !== 0;
  const score = record.delta > 0 ? `+${record.delta}` : `${record.delta}`;
  const scoreLabel = record.status === 'returned' ? '未通过' : record.status === 'withdrawn' ? '已撤回' : record.status === 'pending' ? '待审核' : '仅归档';
  const details = recordFieldRows(record, indicator);

  return <div className="space-y-3">
    <div aria-label="AI 智能解读" className={`rounded-[var(--tm-radius-inner)] border p-3.5 ${surfaceClass}`}>
      <div className="mb-3 grid grid-cols-[26px_auto_1fr_auto] items-center gap-2">
        <img src={ASSETS.MANAGEMENT.AI_BOT} alt="" aria-hidden="true" className="h-[26px] w-[26px] object-contain" />
        <span className="text-[14px] font-semibold text-[var(--tm-text-primary)]">AI 智能解读</span>
        <span className={`h-1 w-6 rounded-full opacity-75 ${accentClass}`} aria-hidden="true" />
        <span className={`flex min-h-10 min-w-[68px] items-center justify-center gap-1 rounded-[var(--tm-radius-control)] border bg-white/90 px-2.5 ${scoreClass}`}>
          {hasScore ? <><span className="text-[22px] font-bold leading-none tabular-nums">{score}</span><span className="text-[10px] font-medium text-[var(--tm-text-secondary)]">{record.status === 'pending' ? '待审核' : '分'}</span></> : <span className="text-[12px] font-semibold">{scoreLabel}</span>}
        </span>
      </div>
      <dl className="grid grid-cols-[38px_minmax(0,1fr)] gap-x-2 gap-y-2 text-[13px] font-medium leading-[1.55] text-[var(--tm-text-primary)]">
        <dt className="pt-1 text-[12px] text-[var(--tm-text-secondary)]">时间：</dt>
        <dd className="flex min-h-7 items-center"><time dateTime={record.date}>{record.date.replace('-', '年').replace('-', '月')}日</time></dd>
        <dt className="pt-1 text-[12px] text-[var(--tm-text-secondary)]">对象：</dt>
        <dd className="flex min-h-7 items-center font-semibold">{teacherName}{record.teacherId === actorId ? '(本人)' : ''}</dd>
        <dt className="pt-1 text-[12px] text-[var(--tm-text-secondary)]">指标：</dt>
        <dd className="min-w-0 break-words py-1">{indicator ? `${indicator.dimension} - ${indicator.name}` : '指标已调整'}</dd>
      </dl>
    </div>
    {details.length > 0 && <div aria-label="事项明细" className="rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-3.5">
      <p className="mb-3 text-[14px] font-semibold text-[var(--tm-text-primary)]">事项明细</p>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px] leading-[1.55]">
        {details.map(field => <React.Fragment key={field.key}>
          <dt className="text-[12px] text-[var(--tm-text-secondary)]">{field.label}</dt>
          <dd className="min-w-0 whitespace-pre-wrap break-words font-medium text-[var(--tm-text-primary)]">{field.key === 'level' ? <RecordLevelBadge record={record} indicator={indicator} /> : field.display}</dd>
        </React.Fragment>)}
      </dl>
    </div>}
  </div>;
}
