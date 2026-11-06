import { groupParentRecordsByMonth } from '../../shared/parentRecordMonths';
import { createPortal } from 'react-dom';
import { ImageGallery, ImagePreview } from '../media/ImageGallery';
import ParentRecordCard from './ParentRecordCard';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import MobileBottomSheet from '../../mobile-app/components/ui/MobileBottomSheet';
import { ChevronDown, ChevronRight, MoreHorizontal, NotebookPen } from 'lucide-react';
import { todayForParentRecord, type ParentBehaviorRecord } from '../../shared/parentBehaviorRecords';
import { ParentCard, ParentPrimaryButton } from './ParentUI';

export default function ParentBehaviorRecordList({ records, childName, onCreate, onEdit, onDelete }: {
  records: ParentBehaviorRecord[]; childName: string; onCreate?: () => void; onEdit?: (record: ParentBehaviorRecord) => void; onDelete?: (record: ParentBehaviorRecord) => void;
}) {
  const [preview, setPreview] = useState<{ record: ParentBehaviorRecord; index: number } | null>(null);
  const [menuRecord, setMenuRecord] = useState<ParentBehaviorRecord | null>(null);
  const months = useMemo(() => groupParentRecordsByMonth(records), [records]);
  const monthIdPrefix = useId();
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [visibleMonths, setVisibleMonths] = useState(1);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasMore = visibleMonths < months.length;
  useEffect(() => {
    const element = sentinel.current;
    if (!element || !hasMore || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) setVisibleMonths(count => Math.min(count + 1, months.length));
    }, { rootMargin: '0px', threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [visibleMonths, months.length, hasMore]);
  return <section className="px-5 pt-2" aria-label={`${childName}的家长记录`}>
    {records.length ? <div className="space-y-[var(--pm-space-4)]">{months.slice(0, visibleMonths).map((group, groupIndex) => <section key={group.month} aria-label={group.label} className="space-y-[var(--pm-space-2)]">
      <div className="flex items-center justify-between gap-3">
      <h2 className="min-w-0 flex-1">
        <button type="button" aria-expanded={!collapsedMonths[group.month]} aria-controls={`${monthIdPrefix}-${group.month}`} onClick={() => setCollapsedMonths(previous => ({ ...previous, [group.month]: !previous[group.month] }))}
          className="flex min-h-[var(--pm-size-touch)] w-full items-center gap-2 rounded-[var(--pm-radius-control-compact)] px-1 text-left text-[length:var(--pm-font-size-card-title)] font-semibold text-[var(--pm-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--pm-brand-primary)]">
          {group.label}{collapsedMonths[group.month] ? <ChevronRight size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
        </button>
      </h2>
      {groupIndex === 0 && onCreate && <button type="button" onClick={onCreate} className="min-h-[var(--pm-size-touch)] shrink-0 rounded-[var(--pm-radius-control-compact)] px-1 text-[length:var(--pm-font-size-body)] font-semibold text-[var(--pm-brand-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--pm-brand-primary)]">记录表现</button>}
      </div>
      <div id={`${monthIdPrefix}-${group.month}`} hidden={Boolean(collapsedMonths[group.month])} className="space-y-[var(--pm-space-2)]">
      {group.records.map(record => <ParentRecordCard key={record.id} content={record.content}
      footer={<><span className="break-words">{record.author}</span><time dateTime={record.occurredOn}>{record.occurredOn === todayForParentRecord() ? '今天' : record.occurredOn.replaceAll('-', '.')} {new Date(record.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}</time></>}
      topAction={<button type="button" aria-label="记录更多操作" aria-haspopup="dialog" onClick={() => setMenuRecord(record)} className="flex h-[var(--pm-size-touch)] w-[var(--pm-size-touch)] items-center justify-center rounded-[var(--pm-radius-control-compact)] text-[var(--pm-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--pm-brand-primary)]"><MoreHorizontal size={20} aria-hidden="true" /></button>}>
        {record.images.length > 0 && <ImageGallery images={record.images} label="记录图片" className="mt-3 [--media-radius:var(--pm-radius-control-compact)]" onSelect={index => setPreview({ record, index })} />}
      </ParentRecordCard>)}</div></section>)}
      {hasMore && <div ref={sentinel} className="py-3 text-center"><button type="button" onClick={() => setVisibleMonths(count => Math.min(count + 1, months.length))} className="min-h-[var(--pm-size-touch)] text-[length:var(--pm-font-size-compact)] text-[var(--pm-text-secondary)]">查看更早记录</button></div>}
    </div> : <ParentCard shape="subtle" className="py-8 text-center">
      <NotebookPen size={32} className="mx-auto text-[var(--pm-text-tertiary)]" aria-hidden="true" />
      <p className="mt-4 text-[length:var(--pm-font-size-card-title)] font-medium">还没有家长记录</p>
      <p className="mt-2 text-[length:var(--pm-font-size-body)] text-[var(--pm-text-secondary)]">记下孩子在日常生活中的点滴表现</p>
      {onCreate && <ParentPrimaryButton shape="subtle" onClick={onCreate} className="mt-5">记录第一件事</ParentPrimaryButton>}
    </ParentCard>}
    {preview && createPortal(<ImagePreview key={preview.record.id} images={preview.record.images} initialIndex={preview.index} label="记录图片" onClose={() => setPreview(null)} topInset="max(var(--mini-program-status-bar-height, 0px), env(safe-area-inset-top, 0px))" />, document.getElementById('teacher-mobile-overlay-root') ?? document.body)}
    <MobileBottomSheet open={Boolean(menuRecord)} title="记录操作" onClose={() => setMenuRecord(null)}>
      <button type="button" className="min-h-11 w-full text-left" onClick={() => { if (menuRecord) onEdit?.(menuRecord); setMenuRecord(null); }}>修改</button>
      <button type="button" className="min-h-11 w-full text-left text-[var(--pm-status-negative-strong)]" onClick={() => { if (menuRecord) onDelete?.(menuRecord); setMenuRecord(null); }}>删除</button>
    </MobileBottomSheet>
  </section>;
}
