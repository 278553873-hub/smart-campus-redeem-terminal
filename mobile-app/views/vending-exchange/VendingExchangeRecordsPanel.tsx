import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import MobileConfirmSheet from '../../components/ui/MobileConfirmSheet';
import MobileToast from '../../components/ui/MobileToast';
import { GrowthCoinIcon, useGrowthCoinTerms } from '../../../components/GrowthCoinBranding';
import { formatCoinAmount } from '../../utils/coinFormat';
import { localToday } from '../../components/ui/mobileDatePickerModel';
import { mobileFilterButtonClass, mobileFilterIconClass } from '../../components/ui/mobileFilterStyles';
import { ASSETS } from '../../assets/images';
import type { ClassInfo } from '../../types';
import type { VendingCabinetInventory } from '../../domain/vendingInventory';
import {
  createVendingExchangeFilter, filterVendingExchangeRecords, groupVendingExchangeRecordsByMonth, scopeVendingExchangeRecords,
  type VendingCorrectionPreview, type VendingExchangeActions, type VendingExchangeFilter, type VendingExchangeRecord,
} from '../../domain/vendingExchange';
import VendingExchangeDetailSheet from './VendingExchangeDetailSheet';
import VendingExchangeRecordCard from './VendingExchangeRecordCard';
import VendingExchangeFilterSheet, { type VendingMoreFilter } from './VendingExchangeFilterSheet';
import ExchangeRecordDateFilter, { formatExchangeRecordMonth } from '../exchange-records/ExchangeRecordDateFilter';

interface Props {
  schoolId: string;
  authorizedClasses: readonly ClassInfo[];
  cabinets?: readonly VendingCabinetInventory[];
  records: readonly VendingExchangeRecord[];
  today?: string;
  active?: boolean;
  actions?: VendingExchangeActions;
  /** 班级兑换记录保留日期入口，但不提供右侧的货柜、商品等多条件筛选。 */
  showFilterAction?: boolean;
}

const PAGE_SIZE = 30;

export default function VendingExchangeRecordsPanel({
  schoolId, authorizedClasses, cabinets = [], records, today: suppliedToday, active = true, actions, showFilterAction = true,
}: Props) {
  const [today] = useState(() => suppliedToday ?? localToday());
  const coinTerms = useGrowthCoinTerms();
  const [confirmation, setConfirmation] = useState<{ record: VendingExchangeRecord; preview: VendingCorrectionPreview } | null>(null);
  const [confirmError, setConfirmError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [statusToast, setStatusToast] = useState('');
  const [filter, setFilter] = useState(() => createVendingExchangeFilter(today));
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(() => today.slice(0, 7));
  const monthHeadingId = useId();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    if (!statusToast) return undefined;
    const timer = window.setTimeout(() => setStatusToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [statusToast]);
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
  const terminalDeviceId = showFilterAction
    ? terminals.find(item => item.value === filter.terminalDeviceId)?.value ?? terminals[0]?.value ?? ''
    : '';
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
  const viewedMonthCount = useMemo(() => (
    filter.dateRange.start
      ? matches.length
      : matches.filter(record => record.time.slice(0, 7) === viewedMonth).length
  ), [filter.dateRange.start, matches, viewedMonth]);
  const monthGroups = useMemo(() => groupVendingExchangeRecordsByMonth(
    matches.slice(0, visibleCount), filter.dateRange.end.slice(0, 7),
  ), [matches, visibleCount, filter.dateRange.end]);
  const detail = scopedRecords.find(record => record.id === detailId) ?? null;
  const correction = detail ? actions?.preview(detail) : null;
  const requestCorrection = () => {
    if (!detail || !correction) return;
    setConfirmError('');
    setConfirmation({ record: detail, preview: correction });
  };
  const confirmCorrection = async () => {
    if (!confirmation || !actions || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setConfirmError('');
    try {
      const operation = await actions.confirm(confirmation.record, confirmation.preview);
      setConfirmation(null);
      const amount = `${formatCoinAmount(operation.amount)} ${coinTerms.name}`;
      setStatusToast(operation.amount === 0 ? '兑换结果已更新'
        : operation.type === 'refund' ? `已退回 ${amount}` : `已补扣 ${amount}`);
    } catch (error) {
      setConfirmError(error instanceof Error && error.name === 'Error' ? error.message : '保存失败，请重试');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };
  const confirmPreview = confirmation?.preview;
  const isCharge = confirmPreview?.type === 'charge';
  const coinAmount = (amount: number) => <span className="inline-flex items-center gap-[var(--tm-space-1)]">
    {formatCoinAmount(amount)}<GrowthCoinIcon alt="" aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="sr-only">{coinTerms.name}</span>
  </span>;
  const updateFilter = (changes: VendingMoreFilter | Pick<VendingExchangeFilter, 'dateRange'>) => {
    setFilter(current => ({ ...current, ...changes }));
    setVisibleCount(PAGE_SIZE);
    setViewedMonth(('dateRange' in changes ? changes.dateRange : filter.dateRange).end.slice(0, 7));
    scrollRef.current?.scrollTo({ top: 0 });
  };
  const hasMoreQuery = showFilterAction && Boolean(filter.status || filter.categoryId || filter.productId || filter.productIds?.length || filter.gradeName || filter.classId || filter.classIds?.length || terminalDeviceId !== (terminals[0]?.value ?? ''));
  const hasQuery = Boolean(hasMoreQuery || filter.dateRange.start || filter.dateRange.end !== today);

  return (
    <div className="isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)]">
      <div role="group" aria-label={showFilterAction ? '兑换记录筛选' : '兑换记录日期'} className="relative z-20 flex shrink-0 items-center justify-between gap-[var(--tm-space-3)] bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-report-page-inline)]">
        <ExchangeRecordDateFilter range={filter.dateRange} viewedMonth={viewedMonth} today={today} active={active} onChange={dateRange => updateFilter({ dateRange })} />
        <span aria-live="polite" className="ml-auto shrink-0 text-[length:var(--tm-font-size-compact)] tabular-nums text-[var(--tm-text-secondary)]">共 {viewedMonthCount} 笔</span>
        {showFilterAction && (
          <button type="button" className={`${mobileFilterButtonClass} ${hasMoreQuery ? '!text-[var(--tm-brand-primary)]' : ''}`} aria-label={hasMoreQuery ? '筛选兑换记录，已有筛选条件' : '筛选兑换记录'} aria-haspopup="dialog" aria-expanded={filterSheetOpen} onClick={() => setFilterSheetOpen(true)}><SlidersHorizontal aria-hidden="true" className={mobileFilterIconClass} /><span>筛选</span></button>
        )}
      </div>
      <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)]">
        <div className="flex min-h-0 flex-1 flex-col">
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
            {monthGroups.map((group, groupIndex) => {
              const monthLabel = formatExchangeRecordMonth(group.month);
              return <section key={group.month} ref={element => {
                if (element) monthSectionRefs.current.set(group.month, element);
                else monthSectionRefs.current.delete(group.month);
              }} aria-labelledby={`${monthHeadingId}-${group.month}`} className={`bg-[var(--tm-bg-surface)] ${groupIndex > 0 ? 'border-t border-[var(--tm-border-subtle)]' : ''}`}>
                <h2 id={`${monthHeadingId}-${group.month}`} className="sr-only">
                  {monthLabel}
                </h2>
                {group.records.length > 0 ? <ul aria-label={`${monthLabel}货柜兑换记录`} className="divide-y divide-[var(--tm-border-subtle)]">
                  {group.records.map(record => <li key={record.id}>
                    <VendingExchangeRecordCard record={record} today={today} onOpen={setDetailId} />
                  </li>)}
                </ul> : matches.length > 0 ? <p className="px-[var(--tm-report-page-inline)] py-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] tm-font-regular text-[var(--tm-text-secondary)]">该月暂无兑换记录</p>
                  : <div className="py-[var(--tm-space-8)] text-center"><MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title={hasQuery ? '暂无符合条件的兑换记录' : '暂无兑换记录'} /></div>}
              </section>;
            })}
            {visibleCount < matches.length && <button type="button" onClick={() => setVisibleCount(current => current + PAGE_SIZE)} className="min-h-[var(--tm-size-touch)] w-full text-[length:var(--tm-font-size-body)] tm-font-regular text-[var(--tm-text-secondary)]">加载更多</button>}
          </div>
        </div>
      </div>
      {showFilterAction && <VendingExchangeFilterSheet open={filterSheetOpen && active} value={{ ...filter, terminalDeviceId }} terminals={terminals} classes={authorizedClasses} categories={categories} onConfirm={updateFilter} onClose={() => setFilterSheetOpen(false)} />}
      <VendingExchangeDetailSheet record={detail} onClose={() => setDetailId(null)} correction={correction?.type} onRequestCorrection={requestCorrection} />
      <MobileConfirmSheet
        open={Boolean(confirmation && active)}
        title={isCharge ? '确认商品已出货' : '确认未出货并退币'}
        description={confirmation && confirmPreview ? <>
          确认{confirmation.record.studentName}{isCharge ? '已收到' : '未收到'}「{confirmation.record.productName}」？
          {isCharge && confirmPreview.shortfall > 0 && <>可用余额 {coinAmount(confirmPreview.available)}，还差 {coinAmount(confirmPreview.shortfall)}。</>}
          {isCharge ? <>本次补扣 {coinAmount(confirmPreview.amount)}。</> : <>本次退回 {coinAmount(confirmPreview.amount)}。</>}
        </> : ''}
        errorMessage={confirmError}
        confirmLabel={submitting ? '正在保存…' : isCharge
          ? (confirmPreview?.amount ? `确认补扣 ${formatCoinAmount(confirmPreview.amount)}` : '确认已出货')
          : '确认退币'}
        confirmDisabled={submitting}
        onConfirm={confirmCorrection}
        onClose={() => { if (!submittingRef.current) setConfirmation(null); }}
      />
      {statusToast && <MobileToast message={statusToast} />}
    </div>
  );
}
