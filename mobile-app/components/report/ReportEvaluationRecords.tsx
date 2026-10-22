import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ClassReportEvaluationRecord } from '../../domain/classReportEvaluationRecords';
import { EvaluationRecordDetailContent } from '../../views/student-evaluation/EvaluationRecordDetailView';

export function ReportEvaluationRecordList({ records, onSelect }: {
  records: ClassReportEvaluationRecord[];
  onSelect: (record: ClassReportEvaluationRecord) => void;
}) {
  if (!records.length) return <p className="py-5 text-center text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">当前筛选下暂无评价记录</p>;
  return <ul>{records.map(record => <li key={record.id} className="border-b border-[var(--tm-border-subtle)] last:border-0">
    <button type="button" onClick={() => onSelect(record)} className="flex min-h-[var(--tm-size-touch)] w-full items-start gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)]">{record.studentName}　{record.indicatorPath.at(-1)}</span>
        <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{record.indicatorPath[0]} · {record.teacherName} · {record.evaluation_date.slice(5)}</span>
      </span>
      <span className={`shrink-0 text-[length:var(--tm-font-size-body)] font-semibold tabular-nums ${record.scoreChange < 0 ? 'text-[var(--tm-chart-negative-text)]' : 'text-[var(--tm-chart-positive-text)]'}`}>{record.scoreChange > 0 ? '+' : ''}{record.scoreChange}分</span>
      <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
    </button>
  </li>)}</ul>;
}

export function ReportEvaluationRecordsPage({ records, selected, onSelect }: {
  records: ClassReportEvaluationRecord[];
  selected: ClassReportEvaluationRecord | null;
  onSelect: (record: ClassReportEvaluationRecord) => void;
}) {
  const [limit, setLimit] = useState(30);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listScrollTop = useRef(0);
  useLayoutEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = selected ? 0 : listScrollTop.current;
  }, [selected]);
  useEffect(() => setLimit(30), [records]);
  return <div ref={scrollerRef} onScroll={event => { if (!selected) listScrollTop.current = event.currentTarget.scrollTop; }} className="h-full overflow-y-auto bg-[var(--tm-page-plain-content-bg)] p-[var(--tm-space-4)]">
    {selected ? <>
      <h2 className="mb-3 text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">{selected.studentName}</h2>
      <EvaluationRecordDetailContent record={selected} />
    </> : <>
      <p className="mb-2 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">共 {records.length} 条成长记录</p>
      <div className="rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)]">
        <ReportEvaluationRecordList records={records.slice(0, limit)} onSelect={onSelect} />
        {limit < records.length && <button type="button" onClick={() => setLimit(current => current + 30)} className="min-h-[var(--tm-size-touch)] w-full text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-brand-primary)]">加载更多</button>}
      </div>
    </>}
  </div>;
}
