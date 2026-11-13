import React, { useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import MobileDatePickerSheet from '../../components/ui/MobileDatePickerSheet';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import { calendarMonthRange, localToday } from '../../components/ui/mobileDatePickerModel';
import { mobileFilterButtonClass, mobileFilterIconClass } from '../../components/ui/mobileFilterStyles';
import { ASSETS } from '../../assets/images';
import type { ClassInfo } from '../../types';
import type { VendingCabinetInventory } from '../../domain/vendingInventory';
import {
  createVendingExchangeFilter, filterVendingExchangeRecords, groupVendingExchangeRecordsByMonth, scopeVendingExchangeRecords,
  type VendingExchangeFilter, type VendingExchangeRecord,
} from '../../domain/vendingExchange';
import VendingExchangeDetailSheet from './VendingExchangeDetailSheet';
import VendingExchangeRecordCard from './VendingExchangeRecordCard';
import VendingExchangeFilterSheet, { type VendingMoreFilter } from './VendingExchangeFilterSheet';

interface Props {
  schoolId: string;
  authorizedClasses: readonly ClassInfo[];
  cabinets?: readonly VendingCabinetInventory[];
  records: readonly VendingExchangeRecord[];
  today?: string;
  active?: boolean;
}

const PAGE_SIZE = 30;

export default function VendingExchangeRecordsPanel({ schoolId, authorizedClasses, cabinets = [], records, today: suppliedToday, active = true }: Props) {
  const [today] = useState(() => suppliedToday ?? localToday());
  const [filter, setFilter] = useState(() => createVendingExchangeFilter(today));
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(() => calendarMonthRange(today.slice(0, 7), undefined, today));
  const [viewedMonth, setViewedMonth] = useState(() => today.slice(0, 7));
  const monthHeadingId = useId();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const monthSectionRefs = useRef(new Map<string, HTMLElement>());
  const scopedRecords = useMemo(() => scopeVendingExchangeRecords(records, {
    schoolId, classIds: authorizedClasses.map(item => item.id),
  }), [records, schoolId, authorizedClasses]);
  const terminals = useMemo(() => {
    const options = new Map(cabinets.filter(item => item.schoolId === schoolId).map(item => [item.id, { value: item.id, label: item.name }]));
    for (const record of scopedRecords) {
      if (!options.has(record.terminalDeviceId)) options.set(record.terminalDeviceId, { value: record.terminalDeviceId, label: record.terminalDeviceName });
    }
    return [...options.values()];
  }, [cabinets, scopedRecords, schoolId]);
  const terminalDeviceId = terminals.find(item => item.value === filter.terminalDeviceId)?.value ?? terminals[0]?.value ?? '';
  const categories = useMemo(() => {
    const groups = new Map<string, { value: string; label: string; products: Map<string, { value: string; label: string }> }>();
    for (const record of scopedRecords) {
      const group = groups.get(record.categoryId) ?? { value: record.categoryId, label: record.categoryName, products: new Map() };
      group.products.set(record.productId, { value: record.productId, label: record.productName });
      groups.set(record.categoryId, group);
    }
    return [...groups.values()].map(({ products, ...group }) => ({ ...group, options: [...products.values()] }));
  }, [scopedRecords]);
  const matches = useMemo(() => filterVendingExchangeRecords(scopedRecords, { ...filter, terminalDeviceId }), [scopedRecords, filter, terminalDeviceId]);
  const monthGroups = useMemo(() => groupVendingExchangeRecordsByMonth(
    matches.slice(0, visibleCount), filter.dateRange.end.slice(0, 7),
  ), [matches, visibleCount, filter.dateRange.end]);
  const dateLabel = filter.dateRange.start
    ? `${filter.dateRange.start.replaceAll('-', '/')}—${filter.dateRange.end.replaceAll('-', '/')}`
    : `${viewedMonth.slice(0, 4)}年${Number(viewedMonth.slice(5, 7))}月`;
  const detail = scopedRecords.find(record => record.id === detailId) ?? null;
  const updateFilter = (changes: VendingMoreFilter | Pick<VendingExchangeFilter, 'dateRange'>) => {
    setFilter(current => ({ ...current, ...changes }));
    setVisibleCount(PAGE_SIZE);
    setViewedMonth(('dateRange' in changes ? changes.dateRange : filter.dateRange).end.slice(0, 7));
    scrollRef.current?.scrollTo({ top: 0 });
  };
  const openDatePicker = (month: string) => {
    setDatePickerValue(filter.dateRange.start ? { ...filter.dateRange } : calendarMonthRange(month, undefined, today));
    setDateSheetOpen(true);
  };
  const hasMoreQuery = Boolean(filter.status || filter.categoryId || filter.productId || filter.productIds?.length || filter.gradeName || filter.classId || filter.classIds?.length || terminalDeviceId !== (terminals[0]?.value ?? ''));
  const hasQuery = Boolean(hasMoreQuery || filter.dateRange.start || filter.dateRange.end !== today);

  return (
    <div className="isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)]">
      <div role="group" aria-label="兑换记录筛选" className="relative z-20 flex shrink-0 items-center justify-between gap-[var(--tm-space-3)] bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-report-page-inline)]">
        <button type="button" className="-ml-[var(--tm-space-1)] flex min-h-[var(--tm-size-touch)] items-center pr-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] font-semibold tabular-nums text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]" onClick={() => openDatePicker(viewedMonth)} aria-label={`选择日期，${dateLabel}`} aria-haspopup="dialog" aria-expanded={dateSheetOpen}><span className="whitespace-nowrap">{dateLabel}</span><ChevronDown aria-hidden="true" className="ml-0.5 h-4 w-4 text-[var(--tm-text-secondary)]" /></button>
        <button type="button" className={`${mobileFilterButtonClass} ${hasMoreQuery ? '!text-[var(--tm-brand-primary)]' : ''}`} aria-label={hasMoreQuery ? '筛选兑换记录，已有筛选条件' : '筛选兑换记录'} aria-haspopup="dialog" aria-expanded={filterSheetOpen} onClick={() => setFilterSheetOpen(true)}><SlidersHorizontal aria-hidden="true" className={mobileFilterIconClass} /><span>筛选</span></button>
      </div>
      <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)]">
        <div className="flex min-h-0 flex-1 flex-col px-[var(--tm-space-4)]">
          <div ref={scrollRef} data-view-scroll-root={active ? '' : undefined} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[var(--tm-space-6)] no-scrollbar" onScroll={event => {
            const element = event.currentTarget;
            let currentMonth = monthGroups[0].month;
            for (const group of monthGroups) {
              const section = monthSectionRefs.current.get(group.month);
              if (!section || section.offsetTop > element.scrollTop + 1) break;
              currentMonth = group.month;
            }
            setViewedMonth(currentMonth);
            if (element.scrollHeight - element.scrollTop - element.clientHeight < 120) setVisibleCount(current => Math.min(matches.length, current + PAGE_SIZE));
          }}>
            {monthGroups.map(group => {
              const monthLabel = `${group.month.slice(0, 4)}年${Number(group.month.slice(5, 7))}月`;
              return <section key={group.month} ref={element => {
                if (element) monthSectionRefs.current.set(group.month, element);
                else monthSectionRefs.current.delete(group.month);
              }} aria-labelledby={`${monthHeadingId}-${group.month}`} className="pb-[var(--tm-layout-list-gap-compact)]">
                <h2 id={`${monthHeadingId}-${group.month}`} className="sr-only">
                  {monthLabel}
                </h2>
                {group.records.length > 0 ? <ul aria-label={`${monthLabel}货柜兑换记录`} className="space-y-[var(--tm-layout-list-gap-compact)]">
                  {group.records.map(record => <li key={record.id}>
                    <VendingExchangeRecordCard record={record} today={today} onOpen={setDetailId} />
                  </li>)}
                </ul> : matches.length > 0 ? <p className="py-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] tm-font-regular text-[var(--tm-text-secondary)]">该月暂无兑换记录</p>
                  : <div className="py-[var(--tm-space-8)] text-center"><MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title={hasQuery ? '暂无符合条件的兑换记录' : '暂无兑换记录'} /></div>}
              </section>;
            })}
            {visibleCount < matches.length && <button type="button" onClick={() => setVisibleCount(current => current + PAGE_SIZE)} className="min-h-[var(--tm-size-touch)] w-full text-[length:var(--tm-font-size-body)] tm-font-regular text-[var(--tm-text-secondary)]">加载更多</button>}
          </div>
        </div>
      </div>
      <MobileDatePickerSheet shape="subtle" open={dateSheetOpen && active} mode="range" title="选择日期" value={datePickerValue} max={today} showPresets={false} onConfirm={(dateRange, selectionMode) => updateFilter({ dateRange: selectionMode === 'month' ? { start: '', end: dateRange.end } : dateRange })} onClose={() => setDateSheetOpen(false)} />
      <VendingExchangeFilterSheet open={filterSheetOpen && active} value={{ ...filter, terminalDeviceId }} terminals={terminals} classes={authorizedClasses} categories={categories} onConfirm={updateFilter} onClose={() => setFilterSheetOpen(false)} />
      <VendingExchangeDetailSheet record={detail} onClose={() => setDetailId(null)} />
    </div>
  );
}
