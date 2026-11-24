import { GrowthCoinIcon, useGrowthCoinTerms } from '../../components/GrowthCoinBranding';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Eraser } from 'lucide-react';
import { ASSETS } from '../assets/images';
import MobileAvatarCollage from '../components/ui/MobileAvatarCollage';
import { localToday, type MobileDateRange } from '../components/ui/mobileDatePickerModel';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import MobileTag from '../components/ui/MobileTag';
import MobileToast from '../components/ui/MobileToast';
import ReportDateRangeTabs from '../components/report/ReportDateRangeTabs';
import ExchangeRecordDateFilter, { formatExchangeRecordMonth } from './exchange-records/ExchangeRecordDateFilter';
import VendingExchangeRecordsPanel from './vending-exchange/VendingExchangeRecordsPanel';
import {
  countActiveCoinLedgerEntries,
  filterCoinLedgerEntries,
  formatCoinLedgerFullTime,
  formatCoinLedgerStudentSummary,
  formatCoinLedgerTimeLabel,
  getCoinLedgerEntryTitle,
  getCoinLedgerMonthKey,
  isCoinLedgerEntryRevocable,
  type CampusCoinLedgerEntry,
} from '../domain/campusCoinLedger';
import { formatCoinAmount } from '../utils/coinFormat';
import type { VendingExchangeRecord } from '../domain/vendingExchange';
import type { ClassInfo, Student } from '../types';

interface ClassExchangeRecordViewProps {
  /** 仅用于把记录里的学生对应到头像。 */
  students: Student[];
  entries: CampusCoinLedgerEntry[];
  onRevokeEntry: (entryId: string) => void;
  onBack: () => void;
  /** 校内有货柜机时传入；即使暂无兑换也保留货柜页签。 */
  cabinet?: {
    schoolId: string;
    classInfo: ClassInfo;
    records: readonly VendingExchangeRecord[];
  } | null;
  onRefundRecord?: (record: VendingExchangeRecord) => void;
  canRefundRecord?: (record: VendingExchangeRecord) => boolean;
}

const tabs = [
  { value: 'class', label: '班级兑换记录' },
  { value: 'cabinet', label: '货柜兑换记录' },
] as const;

const ClassExchangeRecordView: React.FC<ClassExchangeRecordViewProps> = ({ students, entries, onRevokeEntry, onBack, cabinet = null, onRefundRecord, canRefundRecord }) => {
  const GROWTH_COIN_TERMS = useGrowthCoinTerms();
  const [todayKey] = useState(localToday);
  const [dateRange, setDateRange] = useState<MobileDateRange>(() => ({ start: '', end: todayKey }));
  const [viewedMonth, setViewedMonth] = useState(() => todayKey.slice(0, 7));
  const scrollRef = useRef<HTMLDivElement>(null);
  const monthSectionRefs = useRef(new Map<string, HTMLElement>());
  const [detailEntryId, setDetailEntryId] = useState<string | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [statusToast, setStatusToast] = useState('');
  const [selectedTab, setSelectedTab] = useState<'class' | 'cabinet'>('class');
  const hasCabinet = Boolean(cabinet);
  const activeTab = hasCabinet ? selectedTab : 'class';

  useEffect(() => {
    if (!hasCabinet) setSelectedTab('class');
  }, [hasCabinet]);

  useEffect(() => {
    if (!statusToast) return undefined;
    const timer = window.setTimeout(() => setStatusToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [statusToast]);

  const avatarByStudentId = useMemo(() => new Map(students.map(student => [
    student.id,
    student.avatar || (student.gender === 'female' ? ASSETS.AVATAR.GENERIC_GIRL : ASSETS.AVATAR.GENERIC_BOY),
  ])), [students]);

  const matchingEntries = useMemo(() => filterCoinLedgerEntries(entries, { type: 'range', ...dateRange })
    .sort((left, right) => right.time.localeCompare(left.time) || left.id.localeCompare(right.id)), [entries, dateRange]);

  const entryGroups = useMemo(() => {
    const groups = new Map<string, CampusCoinLedgerEntry[]>([[dateRange.end.slice(0, 7), []]]);
    for (const entry of matchingEntries) {
      const month = getCoinLedgerMonthKey(entry.time);
      const monthEntries = groups.get(month) ?? [];
      monthEntries.push(entry);
      groups.set(month, monthEntries);
    }
    return [...groups.entries()].map(([month, monthEntries]) => ({ month, entries: monthEntries }));
  }, [matchingEntries, dateRange.end]);

  const viewedEntries = dateRange.start ? matchingEntries : entryGroups.find(group => group.month === viewedMonth)?.entries ?? [];

  const effectiveCount = countActiveCoinLedgerEntries(viewedEntries);

  const detailEntry = entries.find(entry => entry.id === detailEntryId) ?? null;

  const handleClassScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (activeTab !== 'class' || dateRange.start) return;
    const element = event.currentTarget;
    let currentMonth = entryGroups[0].month;
    for (const group of entryGroups) {
      const section = monthSectionRefs.current.get(group.month);
      if (!section || section.offsetTop > element.scrollTop + 1) break;
      currentMonth = group.month;
    }
    setViewedMonth(currentMonth);
  };

  const updateDateRange = (range: MobileDateRange) => {
    setDateRange(range);
    setViewedMonth(range.end.slice(0, 7));
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const changeTab = (next: 'class' | 'cabinet') => {
    setDetailEntryId(null);
    setShowRevokeConfirm(false);
    setSelectedTab(next);
  };

  const revokeEntry = () => {
    if (!detailEntry || !isCoinLedgerEntryRevocable(detailEntry)) return;
    const targetId = detailEntry.id;
    setShowRevokeConfirm(false);
    setDetailEntryId(null);
    onRevokeEntry(targetId);
    setStatusToast(`已撤回本次兑换，${GROWTH_COIN_TERMS.name}已退回`);
  };

  const renderLeadingIcon = (entry: CampusCoinLedgerEntry) => {
    if (entry.type === 'clear' || entry.shares.length === 0) {
      return (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--tm-status-negative-soft)] text-[var(--tm-status-negative-strong)]">
          <Eraser aria-hidden="true" className="h-5 w-5" />
        </span>
      );
    }
    return (
      <MobileAvatarCollage
        avatars={entry.shares.map(share => ({
          id: share.studentId,
          src: avatarByStudentId.get(share.studentId) ?? ASSETS.AVATAR.GENERIC_BOY,
        }))}
        fallbackSrc={ASSETS.AVATAR.GENERIC_BOY}
        label={`${entry.shares.length}名学生兑换`}
      />
    );
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">兑换记录</h1>
      </header>

      {cabinet && (
        <ReportDateRangeTabs
          value={activeTab}
          items={tabs}
          onChange={changeTab}
          ariaLabel="兑换记录分类"
          semantics="tabs"
          className="shrink-0"
        />
      )}

      <div
        role={hasCabinet ? 'tabpanel' : undefined}
        aria-label={hasCabinet ? '班级兑换记录' : undefined}
        hidden={activeTab !== 'class'}
        className={activeTab === 'class' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}
      >
        <div role="group" aria-label="兑换记录日期" className="flex shrink-0 items-center justify-between gap-[var(--tm-space-3)] px-[var(--tm-report-page-inline)]">
          <ExchangeRecordDateFilter range={dateRange} viewedMonth={viewedMonth} today={todayKey} active={activeTab === 'class'} onChange={updateDateRange} />
          <span aria-live="polite" className="shrink-0 text-[length:var(--tm-font-size-compact)] tabular-nums text-[var(--tm-text-secondary)]">共 {effectiveCount} 笔</span>
        </div>

        <div ref={scrollRef} onScroll={handleClassScroll} data-view-scroll-root={activeTab === 'class' ? '' : undefined} className="relative min-h-0 flex-1 overflow-y-auto pb-[var(--tm-space-6)] no-scrollbar">
          {matchingEntries.length > 0 ? entryGroups.map((group, index) => (
            <section
              key={group.month}
              ref={element => {
                if (element) monthSectionRefs.current.set(group.month, element);
                else monthSectionRefs.current.delete(group.month);
              }}
              aria-labelledby={`class-month-${group.month}`}
              className={`bg-[var(--tm-bg-surface)] ${index > 0 ? 'border-t border-[var(--tm-border-subtle)]' : ''}`}
            >
              <h2 id={`class-month-${group.month}`} className="sr-only">{formatExchangeRecordMonth(group.month)}</h2>
              {group.entries.length > 0 ? <ul className="divide-y divide-[var(--tm-border-subtle)]" aria-label={`${formatExchangeRecordMonth(group.month)}兑换记录`}>
                {group.entries.map(entry => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => setDetailEntryId(entry.id)}
                      className="flex w-full items-center gap-[var(--tm-space-3)] px-[var(--tm-report-page-inline)] py-[var(--tm-space-3)] text-left"
                    >
                      <span className="block h-11 w-[calc(var(--tm-size-touch)+var(--tm-space-4))] shrink-0">{renderLeadingIcon(entry)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-[var(--tm-space-3)]">
                          <span className={`min-w-0 truncate text-[length:var(--tm-font-size-body)] font-semibold ${entry.revoked ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--tm-text-primary)]'}`}>{formatCoinLedgerStudentSummary(entry.shares)}</span>
                          <strong className={`flex shrink-0 items-center gap-1 text-[length:var(--tm-font-size-body)] font-semibold tabular-nums ${entry.revoked ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--tm-chart-negative-text)]'}`}>
                            <span className="sr-only">{entry.type === 'redeem' ? '消耗' : '清空'}{formatCoinAmount(entry.totalAmount)}{GROWTH_COIN_TERMS.name}</span>
                            <span aria-hidden="true">-{formatCoinAmount(entry.totalAmount)}</span>
                            <GrowthCoinIcon alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                          </strong>
                        </span>
                        <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{getCoinLedgerEntryTitle(entry, GROWTH_COIN_TERMS.name)}</span>
                        <span className="mt-1 flex min-h-[var(--tm-tag-min-height)] flex-wrap items-center justify-between gap-x-[var(--tm-space-3)] gap-y-[var(--tm-space-1)]">
                          <time dateTime={entry.time.replace(' ', 'T')} className="text-[length:var(--tm-font-size-meta)] tabular-nums text-[var(--tm-text-tertiary)]">{formatCoinLedgerTimeLabel(entry.time, todayKey)}</time>
                          {entry.revoked && <span className="ml-auto shrink-0"><MobileTag tone="neutral">已撤回</MobileTag></span>}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul> : <p className="px-[var(--tm-report-page-inline)] py-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] tm-font-regular text-[var(--tm-text-secondary)]">该月暂无兑换记录</p>}
            </section>
          )) : (
            <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title={dateRange.start || dateRange.end !== todayKey ? '暂无符合条件的兑换记录' : '暂无兑换记录'} className="py-12" />
          )}
        </div>
      </div>

      {cabinet && (
        <div
          role="tabpanel"
          aria-label="货柜兑换记录"
          hidden={activeTab !== 'cabinet'}
          className={activeTab === 'cabinet' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}
        >
          <VendingExchangeRecordsPanel
            key={`${cabinet.schoolId}-${cabinet.classInfo.id}`}
            schoolId={cabinet.schoolId}
            authorizedClasses={[cabinet.classInfo]}
            records={cabinet.records}
            active={activeTab === 'cabinet'}
            onRefundRecord={onRefundRecord}
            canRefundRecord={canRefundRecord}
            showFilterAction={false}
          />
        </div>
      )}

      <MobileBottomSheet
        open={Boolean(detailEntry)}
        title={detailEntry ? (detailEntry.type === 'clear' ? getCoinLedgerEntryTitle(detailEntry, GROWTH_COIN_TERMS.name) : '兑换详情') : ''}
        onClose={() => setDetailEntryId(null)}
        footer={detailEntry && isCoinLedgerEntryRevocable(detailEntry) ? (
          <button
            type="button"
            onClick={() => setShowRevokeConfirm(true)}
            className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-status-negative)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-status-negative-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
          >
            撤回本次兑换
          </button>
        ) : undefined}
      >
        {detailEntry && (
          <div className="pb-2">
            <div className="flex items-center justify-between gap-[var(--tm-space-3)] rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface-soft)] px-3 py-2.5">
              <span className="min-w-0">
                <span className="block text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">{detailEntry.type === 'redeem' ? '兑换商品' : '操作类型'}</span>
                <span className="mt-0.5 block truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">
                  {getCoinLedgerEntryTitle(detailEntry, GROWTH_COIN_TERMS.name)}
                </span>
              </span>
              <strong className={`flex shrink-0 items-center gap-1 text-[length:var(--tm-font-size-body)] font-semibold tabular-nums ${detailEntry.revoked ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--tm-chart-negative-text)]'}`}>
                <span aria-hidden="true">-{formatCoinAmount(detailEntry.totalAmount)}</span>
                <GrowthCoinIcon alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="sr-only">共扣除{formatCoinAmount(detailEntry.totalAmount)}{GROWTH_COIN_TERMS.name}</span>
              </strong>
            </div>

            <h3 className="mb-1 mt-[var(--tm-space-4)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">
              涉及学生（{detailEntry.shares.length} 人）
            </h3>
            <ul className="divide-y divide-[var(--tm-border-subtle)]">
              {detailEntry.shares.map(share => {
                // 清空全部口径的学生会被扣两笔：先用可用余额，再用已存（银行）余额。
                const bankAmount = share.bankAmount ?? 0;
                return (
                  <li key={share.studentId} className="flex items-center gap-[var(--tm-space-3)] py-2.5">
                    <img
                      src={avatarByStudentId.get(share.studentId) ?? ASSETS.AVATAR.GENERIC_BOY}
                      alt=""
                      decoding="async"
                      className="h-9 w-9 shrink-0 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)]">{share.studentName}</span>
                    {bankAmount > 0 ? (
                      <span className="flex shrink-0 flex-col items-end gap-0.5">
                        <strong className="flex items-center gap-1 text-[length:var(--tm-font-size-compact)] font-semibold tabular-nums text-[var(--tm-chart-negative-text)]">
                          <span aria-hidden="true">-{formatCoinAmount(share.amount)}</span>
                          <GrowthCoinIcon alt="" aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                          <span className="sr-only">{GROWTH_COIN_TERMS.available}扣除{formatCoinAmount(share.amount)}{GROWTH_COIN_TERMS.name}</span>
                        </strong>
                        <span className="text-[length:var(--tm-font-size-badge)] font-medium tabular-nums text-[var(--tm-text-tertiary)]">
                          <span aria-hidden="true">{GROWTH_COIN_TERMS.saved} -{formatCoinAmount(bankAmount)}</span>
                          <span className="sr-only">{GROWTH_COIN_TERMS.saved}扣除{formatCoinAmount(bankAmount)}{GROWTH_COIN_TERMS.name}</span>
                        </span>
                      </span>
                    ) : (
                      <strong className="flex shrink-0 items-center gap-1 text-[length:var(--tm-font-size-compact)] font-semibold tabular-nums text-[var(--tm-chart-negative-text)]">
                        <span aria-hidden="true">-{formatCoinAmount(share.amount)}</span>
                        <GrowthCoinIcon alt="" aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                        <span className="sr-only">扣除{formatCoinAmount(share.amount)}{GROWTH_COIN_TERMS.name}</span>
                      </strong>
                    )}
                  </li>
                );
              })}
            </ul>

            <dl className="mt-[var(--tm-space-4)] space-y-2 border-t border-[var(--tm-border-subtle)] pt-[var(--tm-space-3)] text-[length:var(--tm-font-size-meta)]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--tm-text-tertiary)]">{detailEntry.type === 'redeem' ? '兑换人' : '操作人'}</dt>
                <dd className="font-medium text-[var(--tm-text-secondary)]">{detailEntry.operator}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--tm-text-tertiary)]">{detailEntry.type === 'redeem' ? '兑换时间' : '操作时间'}</dt>
                <dd className="font-medium tabular-nums text-[var(--tm-text-secondary)]">{formatCoinLedgerFullTime(detailEntry.time)}</dd>
              </div>
              {detailEntry.revoked && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--tm-text-tertiary)]">撤回人</dt>
                  <dd className="font-medium text-[var(--tm-text-secondary)]">{detailEntry.revokedBy?.trim() || '—'}</dd>
                </div>
              )}
              {detailEntry.revoked && detailEntry.revokedAt && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--tm-text-tertiary)]">撤回时间</dt>
                  <dd className="font-medium tabular-nums text-[var(--tm-text-secondary)]">{formatCoinLedgerFullTime(detailEntry.revokedAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </MobileBottomSheet>

      <MobileConfirmSheet shape="subtle"
        open={showRevokeConfirm}
        tone="danger"
        title="撤回本次兑换"
        description={detailEntry ? (
          <>将退回 {detailEntry.shares.length} 名学生共 {formatCoinAmount(detailEntry.totalAmount)}<span className="inline-flex items-center gap-[var(--tm-space-1)]"><GrowthCoinIcon alt="" aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="sr-only">{GROWTH_COIN_TERMS.name}</span></span>，撤回后这条记录保留并标记为已撤回。</>
        ) : ''}
        confirmLabel="撤回"
        onConfirm={revokeEntry}
        onClose={() => setShowRevokeConfirm(false)}
      />

      {statusToast && <MobileToast message={statusToast} />}
    </div>
  );
};

export default ClassExchangeRecordView;
