import React from 'react';
import { ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import { MobileCard } from '../components/ui/MobileCard';
import { mobileSheetActionClass } from '../components/ui/mobileSheetActionStyles';
import { STATUS_LABELS, type DevelopmentRecord } from './data';

export const primaryAction = `${mobileSheetActionClass} flex w-full items-center justify-center gap-2 bg-[var(--tm-brand-primary)] px-4 font-semibold text-white disabled:opacity-40 active:bg-[var(--tm-brand-primary-pressed)]`;
export const secondaryAction = `${mobileSheetActionClass} flex w-full items-center justify-center gap-2 bg-[var(--tm-bg-surface-soft)] px-4 font-semibold text-[var(--tm-text-primary)]`;
export const fieldClass = 'min-h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 py-3 text-[length:var(--tm-font-size-body)] text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-0';
export const metaClass = 'text-[length:var(--tm-font-size-meta)] leading-5 text-[var(--tm-text-secondary)]';
export const bodyClass = 'text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-primary)]';
export function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="space-y-[var(--tm-space-3)]"><div className="flex min-h-[var(--tm-size-touch)] items-center justify-between gap-2"><h2 className="text-[length:var(--tm-font-size-section-title)] font-bold">{title}</h2>{action}</div>{children}</section>;
}
export function SelectButton({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label?: string }) {
  return <button type="button" aria-label={label} onClick={onClick} className="flex min-h-[var(--tm-size-touch)] items-center gap-1 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]"><span className="truncate">{children}</span><ChevronDown size={16} aria-hidden="true" /></button>;
}
export function RowButton({ children, description, onClick, icon }: { children: React.ReactNode; description?: React.ReactNode; onClick: () => void; icon?: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="flex min-h-[var(--tm-size-touch)] w-full items-center gap-3 py-3 text-left">{icon && <span className="text-[var(--tm-action-icon-neutral)]" aria-hidden="true">{icon}</span>}<span className="min-w-0 flex-1"><span className="block text-[length:var(--tm-font-size-card-title)] font-semibold">{children}</span>{description && <span className={`mt-1 block ${metaClass}`}>{description}</span>}</span><ChevronRight size={18} className="shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" /></button>;
}
export function StatusLabel({ record }: { record: DevelopmentRecord }) {
  const tone = record.status === 'approved' ? 'text-[var(--tm-status-positive-strong)]' : record.status === 'returned' ? 'text-[var(--tm-status-negative-strong)]' : 'text-[var(--tm-text-secondary)]';
  return <span className={`shrink-0 text-[length:var(--tm-font-size-meta)] ${tone}`}>{STATUS_LABELS[record.status]}</span>;
}
export function ScoreChange({ delta }: { delta: number }) {
  return <span className={`font-semibold tabular-nums ${delta < 0 ? 'text-[var(--tm-score-negative)]' : delta > 0 ? 'text-[var(--tm-status-positive-strong)]' : 'text-[var(--tm-text-secondary)]'}`}>{delta === 0 ? '仅归档' : `${delta > 0 ? '+' : ''}${delta}分`}</span>;
}
export function EmptyState({ title = '暂无记录', description = '换个筛选条件试试。' }: { title?: string; description?: string }) {
  return <div className="flex flex-col items-center gap-3 px-4 py-8 text-center"><FolderOpen size={28} className="text-[var(--tm-text-tertiary)]" aria-hidden="true" /><p className="text-[length:var(--tm-font-size-card-title)] font-semibold">{title}</p><p className={metaClass}>{description}</p></div>;
}
export function Metric({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return <div><p className={metaClass}>{label}</p><p className="mt-1 text-[length:var(--tm-font-size-metric)] font-bold tabular-nums">{value}<span className="ml-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{unit}</span></p></div>;
}
export function RecordList({ records, teacherNames, indicatorNames, onOpen, showNames = false }: { records: DevelopmentRecord[]; teacherNames: Record<string, string>; indicatorNames: Record<string, string>; onOpen: (record: DevelopmentRecord) => void; showNames?: boolean }) {
  if (!records.length) return <EmptyState />;
  let previousMonth = '';
  return <div className="space-y-3">{[...records].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).map(record => {
    const month = record.date.slice(0, 7); const newMonth = month !== previousMonth; previousMonth = month;
    return <React.Fragment key={record.id}>{newMonth && <h3 className={`px-1 pt-2 ${metaClass}`}>{month.replace('-', '年')}月</h3>}<MobileCard padding="none"><button type="button" onClick={() => onOpen(record)} className="w-full p-4 text-left"><div className="mb-2 flex items-center justify-between gap-2"><span className={metaClass}>{record.date}{showNames ? ` · ${teacherNames[record.teacherId]}` : ''}</span><StatusLabel record={record} /></div><h4 className="text-[length:var(--tm-font-size-card-title)] font-semibold leading-6">{record.title}</h4><div className="mt-3 flex items-center justify-between gap-2 text-[length:var(--tm-font-size-compact)]"><span className="min-w-0 truncate text-[var(--tm-text-secondary)]">{[indicatorNames[record.indicatorId], record.level].filter(Boolean).join(' · ')}</span>{record.status === 'approved' ? <ScoreChange delta={record.delta} /> : <span className="shrink-0 text-[var(--tm-text-secondary)]">尚未计分</span>}</div></button></MobileCard></React.Fragment>;
  })}</div>;
}
