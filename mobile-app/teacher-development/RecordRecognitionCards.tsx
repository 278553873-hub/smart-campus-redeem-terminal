import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ASSETS } from '../assets/images';
import type { DevelopmentIndicator, DevelopmentRecord } from './data';
import RecordLevelBadge from './RecordLevelBadge';
import { formatRecordDate } from './recordDates';
import { recordMatter } from './recordMatter';
import { TEACHERS } from './data';
import { canCorrectRecord, type RecognitionField } from './recordCorrections';

interface Props {
  record: DevelopmentRecord;
  indicator?: DevelopmentIndicator;
  teacherName: string;
  actorId?: string;
  onEdit?: (field: RecognitionField) => void;
}

/** 列表、审核与详情共用五项解读，标签和值使用相同的行高与起始位置。 */
export default function RecordRecognitionCards({ record, indicator, teacherName, actorId, onEdit }: Props) {
  const editable = !!onEdit && !!actorId && canCorrectRecord(record, actorId);
  const manager = !!TEACHERS.find(teacher => teacher.id === actorId)?.manager;
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
  const rows: { label: string; value: React.ReactNode; field?: RecognitionField }[] = [
    { label: '时间', field: 'date', value: <time dateTime={record.date}>{formatRecordDate(record.date)}</time> },
    { label: '对象', field: manager ? 'teacher' : undefined, value: <>{teacherName}{record.teacherId === actorId ? '（本人）' : ''}</> },
    { label: '指标', field: 'indicator', value: indicator ? `${indicator.dimension} · ${indicator.name}` : '指标已调整' },
    { label: '级别', field: 'level', value: <RecordLevelBadge record={record} indicator={indicator} reserveSpace /> },
    { label: '事项', field: 'matter', value: recordMatter(record, indicator) },
  ];
  const ScoreTag = editable ? 'button' : 'span';

  return <div className="space-y-3">
    <div aria-label="AI 智能解读" className={`rounded-[var(--tm-radius-inner)] border p-3.5 ${surfaceClass}`}>
      <div className="mb-3 grid grid-cols-[26px_auto_1fr_auto] items-center gap-2">
        <img src={ASSETS.MANAGEMENT.AI_BOT} alt="" aria-hidden="true" className="h-[26px] w-[26px] object-contain" />
        <span className="text-[14px] font-semibold text-[var(--tm-text-primary)]">AI 智能解读</span>
        <span className={`h-1 w-6 rounded-full opacity-75 ${accentClass}`} aria-hidden="true" />
        <ScoreTag {...(editable ? { type: 'button' as const, onClick: () => onEdit?.('score'), 'aria-label': `修改分数，当前${record.delta}分，查看打分依据`, 'aria-haspopup': 'dialog' as const } : {})} className={`flex min-h-[var(--tm-size-touch)] min-w-[68px] items-center justify-center gap-1 rounded-[var(--tm-radius-control)] border bg-white/90 px-2.5 ${scoreClass} focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-brand-primary)]`}>
          {hasScore ? <><span className="text-[22px] font-bold leading-none tabular-nums">{score}</span><span className="text-[10px] font-medium text-[var(--tm-text-secondary)]">{record.status === 'pending' ? '待审核' : '分'}</span></> : <span className="text-[12px] font-semibold">{scoreLabel}</span>}
        </ScoreTag>
      </div>
      <dl className="text-[13px] font-medium leading-[var(--tm-record-level-size)] text-[var(--tm-text-primary)]">
        {rows.map(row => <React.Fragment key={row.label}>
          <dt className="sr-only">{row.label}</dt>
          <dd className="m-0 min-w-0"><RecognitionRow label={row.label} value={row.value} onClick={editable && row.field ? () => onEdit?.(row.field!) : undefined} /></dd>
        </React.Fragment>)}
      </dl>
    </div>
  </div>;
}

/** 箭头独立定位于整行最右侧并垂直居中，不随值的长度、换行或图标基线移动。 */
function RecognitionRow({ label, value, onClick }: { label: string; value: React.ReactNode; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return <Tag {...(onClick ? { type: 'button' as const, onClick, 'aria-haspopup': 'dialog' as const } : {})} className="relative grid min-h-[var(--tm-size-touch)] w-full min-w-0 grid-cols-[26px_minmax(0,1fr)] items-start gap-x-3 py-[11px] pl-0 pr-7 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-brand-primary)]">
    <span className="text-[var(--tm-text-secondary)]">{label}</span>
    <span className="min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere]">{value}</span>
    {onClick && <span className="pointer-events-none absolute right-0 top-1/2 flex h-[22px] w-4 -translate-y-1/2 items-center justify-center" aria-hidden="true"><ChevronRight size={16} className="shrink-0 text-[var(--tm-text-tertiary)]" /></span>}
  </Tag>;
}
