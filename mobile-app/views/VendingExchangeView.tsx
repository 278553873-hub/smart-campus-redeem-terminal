import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useGrowthCoinTerms } from '../../components/GrowthCoinBranding';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import MobileSearchInput from '../components/ui/MobileSearchInput';
import MobileDatePickerSheet from '../components/ui/MobileDatePickerSheet';
import MobileOptionPickerSheet from '../components/ui/MobileOptionPickerSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import { currentTermToDateRange, dateRangePresets, localToday } from '../components/ui/mobileDatePickerModel';
import { ASSETS } from '../assets/images';
import type { ClassInfo } from '../types';
import {
  createVendingExchangeFilter, filterVendingExchangeRecords, scopeVendingExchangeRecords,
  VENDING_EXCHANGE_STATUS_LABELS, VENDING_REFUND_STATUS_LABELS, type VendingExchangeFilter, type VendingExchangeRecord,
} from '../domain/vendingExchange';
import { formatCoinAmount } from '../utils/coinFormat';
import VendingExchangeFilterSheet from './vending-exchange/VendingExchangeFilterSheet';
import VendingExchangeDetailSheet from './vending-exchange/VendingExchangeDetailSheet';

interface Props {
  schoolId: string;
  authorizedClasses: readonly ClassInfo[];
  records: readonly VendingExchangeRecord[];
  onBack: () => void;
  today?: string;
}

const filterButtonClass = 'flex min-h-[var(--tm-size-touch)] min-w-0 items-center gap-1 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]';
const PAGE_SIZE = 30;

export default function VendingExchangeView({ schoolId, authorizedClasses, records, onBack, today: suppliedToday }: Props) {
  const coinTerms = useGrowthCoinTerms();
  const [today] = useState(() => suppliedToday ?? localToday());
  const [filter, setFilter] = useState(() => createVendingExchangeFilter(today));
  const [activeSheet, setActiveSheet] = useState<'date' | 'category' | 'more' | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scopedRecords = useMemo(() => scopeVendingExchangeRecords(records, {
    schoolId, classIds: authorizedClasses.map(item => item.id),
  }), [records, schoolId, authorizedClasses]);
  const matches = useMemo(() => filterVendingExchangeRecords(scopedRecords, filter), [scopedRecords, filter]);
  const categoryOptions = useMemo(() => [...new Map(scopedRecords.map(record => [record.categoryId, {
    value: record.categoryId, label: record.categoryName,
  }])).values()], [scopedRecords]);
  const terminalOptions = useMemo(() => [...new Map(scopedRecords.map(record => [record.terminalDeviceId, {
    value: record.terminalDeviceId, label: record.terminalDeviceName,
  }])).values()], [scopedRecords]);
  const presets = dateRangePresets(today, currentTermToDateRange(today), undefined, today);
  const crossYear = filter.dateRange.start.slice(0, 4) !== filter.dateRange.end.slice(0, 4);
  const dateLabel = filter.dateRange.start === `${today.slice(0, 7)}-01` && filter.dateRange.end === today ? '本月'
    : presets.find(item => item.value.start === filter.dateRange.start && item.value.end === filter.dateRange.end)?.label
      ?? `${filter.dateRange.start.slice(crossYear ? 0 : 5).replaceAll('-', '/')}—${filter.dateRange.end.slice(crossYear ? 0 : 5).replaceAll('-', '/')}`;
  const categoryLabel = categoryOptions.find(item => item.value === filter.categoryId)?.label ?? '全部分类';
  const detail = scopedRecords.find(record => record.id === detailId) ?? null;
  const updateFilter = (patch: Partial<VendingExchangeFilter>) => {
    setFilter(current => ({ ...current, ...patch }));
    setVisibleCount(PAGE_SIZE);
    scrollRef.current?.scrollTo({ top: 0 });
  };
  const clearFilters = () => updateFilter(createVendingExchangeFilter(today));
  const chips: { key: string; label: string; clear: () => void }[] = [
    ...(filter.gradeName ? [{ key: 'grade', label: filter.gradeName, clear: () => updateFilter({ gradeName: '', classId: '' }) }] : []),
    ...(filter.classId ? [{ key: 'class', label: authorizedClasses.find(item => item.id === filter.classId)?.name ?? '所选班级', clear: () => updateFilter({ classId: '' }) }] : []),
    ...(filter.terminalDeviceId ? [{ key: 'terminal', label: terminalOptions.find(item => item.value === filter.terminalDeviceId)?.label ?? '所选终端设备', clear: () => updateFilter({ terminalDeviceId: '' }) }] : []),
    ...(filter.status ? [{ key: 'status', label: VENDING_EXCHANGE_STATUS_LABELS[filter.status], clear: () => updateFilter({ status: '' }) }] : []),
  ];
  const moreFilterCount = Number(Boolean(filter.gradeName || filter.classId)) + Number(Boolean(filter.terminalDeviceId)) + Number(Boolean(filter.status));
  const hasQuery = Boolean(filter.studentName || filter.categoryId || moreFilterCount
    || filter.dateRange.start !== `${today.slice(0, 7)}-01` || filter.dateRange.end !== today);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]">
      <MobilePageHeader title="货柜兑换明细" onBack={onBack} />
      <div className="shrink-0 bg-[var(--tm-bg-surface)] px-4 pt-3">
        <MobileSearchInput shape="subtle" appearance="filled" placeholder="搜索学生姓名" aria-label="搜索学生姓名" value={filter.studentName} onChange={event => updateFilter({ studentName: event.target.value })} />
        <div className="mt-1 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3">
          <button type="button" className={filterButtonClass} onClick={() => setActiveSheet('date')} aria-label={`选择日期，${filter.dateRange.start}至${filter.dateRange.end}`} aria-haspopup="dialog"><span className="truncate">{dateLabel}</span><ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" /></button>
          <button type="button" className={filterButtonClass} onClick={() => setActiveSheet('category')} aria-label={`商品分类，${categoryLabel}`} aria-haspopup="dialog"><span className="truncate">{categoryLabel}</span><ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" /></button>
          <button type="button" className={filterButtonClass} onClick={() => setActiveSheet('more')} aria-haspopup="dialog"><SlidersHorizontal aria-hidden="true" className="h-4 w-4" /><span>筛选{moreFilterCount > 0 ? `(${moreFilterCount})` : ''}</span></button>
        </div>
        {chips.length > 0 && <div className="flex flex-wrap gap-x-3" aria-label="已生效筛选条件">
          {chips.map(chip => <button key={chip.key} type="button" onClick={chip.clear} aria-label={`清除${chip.label}筛选`} className="flex min-h-[var(--tm-size-touch)] max-w-full items-center gap-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-brand-primary)]"><span className="truncate">{chip.label}</span><X className="h-3 w-3 shrink-0" aria-hidden="true" /></button>)}
        </div>}
      </div>
      <div className="flex min-h-[var(--tm-size-touch)] shrink-0 items-center justify-between px-4 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">
        <span role="status" aria-live="polite">共 {matches.length} 条</span>
        {hasQuery && matches.length > 0 && <button type="button" onClick={clearFilters} className="min-h-[var(--tm-size-touch)] px-1 text-[var(--tm-brand-primary)]">清除筛选</button>}
      </div>
      <div ref={scrollRef} data-view-scroll-root className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 no-scrollbar" onScroll={event => {
        const element = event.currentTarget;
        if (element.scrollHeight - element.scrollTop - element.clientHeight < 120) setVisibleCount(current => Math.min(matches.length, current + PAGE_SIZE));
      }}>
        {matches.length > 0 ? <>
          <ul aria-label="货柜兑换记录" className="divide-y divide-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]">
            {matches.slice(0, visibleCount).map(record => <li key={record.id}>
              <button type="button" onClick={() => setDetailId(record.id)} aria-haspopup="dialog" className="block w-full px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]">
                <span className="flex items-start justify-between gap-3 text-[length:var(--tm-font-size-body)] font-semibold leading-6">
                  <span className="min-w-0 break-words">{record.productName} ×{record.quantity}</span>
                  <span className="shrink-0 tabular-nums" aria-label={`实际扣币${formatCoinAmount(record.chargedAmount)}${coinTerms.name}`}>{formatCoinAmount(record.chargedAmount)}<span className="ml-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{coinTerms.name}</span></span>
                </span>
                <span className="mt-1 block text-[length:var(--tm-font-size-body)] font-medium leading-6 text-[var(--tm-text-secondary)]">{record.studentName} · {record.gradeName} · {record.className}</span>
                <span className="mt-1 block break-words text-[length:var(--tm-font-size-meta)] font-medium leading-5 text-[var(--tm-text-tertiary)]"><time dateTime={record.time.replace(' ', 'T')}>{record.time.slice(record.time.slice(0, 4) === today.slice(0, 4) ? 5 : 0, 16)}</time> · {record.terminalDeviceName}</span>
                {(record.status !== 'completed' || record.refundStatus !== 'none') && <span className={`mt-1 block text-[length:var(--tm-font-size-meta)] font-medium ${record.status === 'failed' ? 'text-[var(--tm-status-negative-strong)]' : 'text-[var(--tm-text-secondary)]'}`}>
                  {VENDING_EXCHANGE_STATUS_LABELS[record.status]}{record.refundStatus !== 'none' ? ` · ${VENDING_REFUND_STATUS_LABELS[record.refundStatus]}` : ''}
                </span>}
              </button>
            </li>)}
          </ul>
          {visibleCount < matches.length && <button type="button" onClick={() => setVisibleCount(current => current + PAGE_SIZE)} className="min-h-12 w-full text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-secondary)]">加载更多</button>}
        </> : <div className="py-8 text-center">
          <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title={hasQuery ? '暂无符合条件的兑换记录' : '暂无兑换记录'} />
          {hasQuery && <button type="button" className="mt-3 min-h-[var(--tm-size-touch)] px-4 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-brand-primary)]" onClick={clearFilters}>清除筛选</button>}
        </div>}
      </div>
      <MobileDatePickerSheet shape="subtle" open={activeSheet === 'date'} mode="range" title="选择日期" value={filter.dateRange} max={today} currentTerm={currentTermToDateRange(today)} onConfirm={dateRange => updateFilter({ dateRange })} onClose={() => setActiveSheet(null)} />
      <MobileOptionPickerSheet open={activeSheet === 'category'} title="商品分类" options={[{ value: '', label: '全部分类' }, ...categoryOptions]} value={filter.categoryId} onChange={categoryId => updateFilter({ categoryId })} onClose={() => setActiveSheet(null)} />
      <VendingExchangeFilterSheet open={activeSheet === 'more'} value={filter} classes={authorizedClasses} terminals={terminalOptions} onConfirm={updateFilter} onClose={() => setActiveSheet(null)} />
      <VendingExchangeDetailSheet record={detail} onClose={() => setDetailId(null)} />
    </div>
  );
}
