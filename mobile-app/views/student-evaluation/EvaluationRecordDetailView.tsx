import React from 'react';
import { Bot, ChevronLeft, History, LockKeyhole, Pencil } from 'lucide-react';
import { phoneText } from '../../styles/teacherMobileTokens';
import type { StudentEvaluationRecord } from './types';

interface EvaluationRecordDetailViewProps {
  record: StudentEvaluationRecord;
  canEdit: boolean;
  onBack: () => void;
  onEdit: () => void;
}

const formatRevisionTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replaceAll('/', '-');
};

const EvaluationRecordDetailView: React.FC<EvaluationRecordDetailViewProps> = ({ record, canEdit, onBack, onEdit }) => {
  const resultSurfaceClass = record.isBad
    ? 'border-[var(--tm-record-negative-border)] bg-[var(--tm-record-negative-bg)]'
    : 'border-[var(--tm-record-positive-border)] bg-[var(--tm-record-positive-bg)]';
  const resultTextClass = record.isBad
    ? 'text-[var(--tm-record-negative-text)]'
    : 'text-[var(--tm-record-positive-text)]';
  const revisions = [...(record.revisions ?? [])].reverse();

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent font-sans">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-4 backdrop-blur-md">
        <button type="button" onClick={onBack} aria-label="返回评价记录" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className={`${phoneText.navTitle} text-[var(--tm-text-primary)]`}>评价详情</h1>
        {canEdit ? (
          <button type="button" onClick={onEdit} aria-label="修改评价" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]">
            <Pencil className="h-4 w-4" />
          </button>
        ) : <div className="h-11 w-11" aria-hidden="true" />}
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-4 no-scrollbar">
        <article className={`rounded-[var(--tm-radius-inner)] border p-4 shadow-[var(--tm-shadow-card)] ${resultSurfaceClass}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-[var(--tm-text-secondary)]">{record.evaluation_date}</p>
              <p className="mt-1 text-[13px] font-semibold text-[var(--tm-text-primary)]">{record.teacherName}</p>
            </div>
            <span className={`text-[24px] font-bold leading-none tabular-nums ${resultTextClass}`}>
              {record.scoreChange > 0 ? `+${record.scoreChange}` : record.scoreChange}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-[var(--tm-brand-primary)]" />
            <h2 className="text-[14px] font-semibold text-[var(--tm-text-primary)]">AI 智能解读</h2>
          </div>
          <p className="mt-2 text-[14px] leading-6 text-[var(--tm-text-primary)]">{record.aiComment}</p>
          <div className="mt-4 border-t border-[var(--tm-border-subtle)] pt-3">
            <p className="text-[12px] leading-5 text-[var(--tm-text-secondary)]">{record.indicatorPath.join(' / ')}</p>
          </div>
        </article>

        <section className="mt-4 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-[var(--tm-text-tertiary)]" />
            <h2 className="text-[14px] font-semibold text-[var(--tm-text-primary)]">原始记录</h2>
          </div>
          <p className="mt-3 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{record.description}</p>
          {record.auditReason && <p className="mt-3 border-t border-[var(--tm-border-subtle)] pt-3 text-[12px] leading-5 text-[var(--tm-text-secondary)]">{record.auditReason}</p>}
        </section>

        {revisions.length > 0 && (
          <section className="mt-4 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-[var(--tm-text-tertiary)]" />
              <h2 className="text-[14px] font-semibold text-[var(--tm-text-primary)]">修改记录</h2>
            </div>
            <div className="mt-3 divide-y divide-[var(--tm-border-subtle)]">
              {revisions.map(revision => (
                <div key={revision.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-[12px] font-medium text-[var(--tm-text-primary)]">{revision.editedByTeacherName} · {formatRevisionTime(revision.editedAt)}</p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--tm-text-secondary)]">{revision.reason || '更新本人评价'}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default EvaluationRecordDetailView;
