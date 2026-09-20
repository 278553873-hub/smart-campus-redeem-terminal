import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, Eraser } from 'lucide-react';
import { ASSETS } from '../assets/images';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import MobileToast from '../components/ui/MobileToast';
import MobileWheelPicker, { type MobileWheelColumn, type MobileWheelOption } from '../components/ui/MobileWheelPicker';
import { GROWTH_COIN_TERMS } from '../../shared/growthCoinTerminology';
import {
  countActiveCoinLedgerEntries,
  filterCoinLedgerEntries,
  formatCoinLedgerDateKey,
  formatCoinLedgerFullTime,
  formatCoinLedgerStudentSummary,
  formatCoinLedgerTimeLabel,
  getCoinLedgerEntryTitle,
  isCoinLedgerEntryRevocable,
  type CampusCoinLedgerEntry,
  type CampusCoinLedgerFilter,
} from '../domain/campusCoinLedger';
import { formatCoinAmount } from '../utils/coinFormat';
import type { Student } from '../types';

interface ClassExchangeRecordViewProps {
  /** 仅用于把记录里的学生对应到头像。 */
  students: Student[];
  entries: CampusCoinLedgerEntry[];
  onRevokeEntry: (entryId: string) => void;
  onBack: () => void;
}

type SheetTab = 'month' | 'range';
type RangeField = 'start' | 'end';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toMonthValue = (date: Date) => toDateInputValue(date).slice(0, 7);

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

const formatMonthLabel = (month: string) => {
  const [year, monthValue] = month.split('-');
  return `${year}年${Number(monthValue)}月`;
};

const formatDateLabel = (value: string) => {
  const [year, month, day] = value.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
};

const formatRangeLabel = (start: string, end: string) => {
  const [, startMonth, startDay] = start.split('-');
  const [, endMonth, endDay] = end.split('-');
  return `${Number(startMonth)}月${Number(startDay)}日-${Number(endMonth)}月${Number(endDay)}日`;
};

const MONTH_OPTIONS: MobileWheelOption[] = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  return { value: String(month).padStart(2, '0'), label: `${month}月` };
});

const createDayOptions = (year: number, month: number): MobileWheelOption[] => (
  Array.from({ length: daysInMonth(year, month) }, (_, index) => {
    const day = index + 1;
    return { value: String(day).padStart(2, '0'), label: `${day}日` };
  })
);

const ClassExchangeRecordView: React.FC<ClassExchangeRecordViewProps> = ({ students, entries, onRevokeEntry, onBack }) => {
  const today = useMemo(() => startOfDay(new Date()), []);
  const todayKey = formatCoinLedgerDateKey(today);
  const [filter, setFilter] = useState<CampusCoinLedgerFilter>(() => ({ type: 'month', month: toMonthValue(new Date()) }));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<SheetTab>('month');
  const [draftMonth, setDraftMonth] = useState(() => toMonthValue(new Date()));
  const [draftRange, setDraftRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [activeRangeField, setActiveRangeField] = useState<RangeField>('start');
  const [detailEntryId, setDetailEntryId] = useState<string | null>(null);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [statusToast, setStatusToast] = useState('');

  useEffect(() => {
    if (!statusToast) return undefined;
    const timer = window.setTimeout(() => setStatusToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [statusToast]);

  const avatarByStudentId = useMemo(() => new Map(students.map(student => [
    student.id,
    student.avatar || (student.gender === 'female' ? ASSETS.AVATAR.GENERIC_GIRL : ASSETS.AVATAR.GENERIC_BOY),
  ])), [students]);

  const filteredEntries = useMemo(() => filterCoinLedgerEntries(entries, filter), [entries, filter]);

  const effectiveCount = countActiveCoinLedgerEntries(filteredEntries);

  const yearOptions = useMemo<MobileWheelOption[]>(() => {
    const currentYear = today.getFullYear();
    const years = new Set<number>([currentYear, currentYear - 1, currentYear - 2]);
    entries.forEach(entry => years.add(Number(entry.time.slice(0, 4))));
    return Array.from(years).sort((left, right) => left - right).map(year => ({ value: String(year), label: `${year}年` }));
  }, [entries, today]);

  const detailEntry = entries.find(entry => entry.id === detailEntryId) ?? null;

  const activeDate = draftRange[activeRangeField] || toDateInputValue(today);
  const activeYear = Number(activeDate.slice(0, 4));
  const activeMonth = Number(activeDate.slice(5, 7));

  const openFilterSheet = () => {
    setDraftMonth(filter.type === 'month' ? filter.month : toMonthValue(today));
    setDraftRange(filter.type === 'range' ? { start: filter.start, end: filter.end } : { start: '', end: '' });
    setActiveRangeField('start');
    setSheetTab(filter.type === 'range' ? 'range' : 'month');
    setSheetOpen(true);
  };

  const activateRangeField = (field: RangeField) => {
    setActiveRangeField(field);
    setDraftRange(current => (current[field] ? current : { ...current, [field]: toDateInputValue(today) }));
  };

  const changeSheetTab = (nextTab: SheetTab) => {
    setSheetTab(nextTab);
    if (nextTab === 'range') activateRangeField('start');
  };

  const updateActiveDate = (patch: { year?: string; month?: string; day?: string }) => {
    const year = Number(patch.year ?? activeYear);
    const month = Number(patch.month ?? activeMonth);
    const day = Math.min(Number(patch.day ?? activeDate.slice(8, 10)), daysInMonth(year, month));
    const nextValue = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setDraftRange(current => ({ ...current, [activeRangeField]: nextValue }));
  };

  const monthColumns: MobileWheelColumn[] = [
    {
      key: 'draft-month-year',
      ariaLabel: '年份',
      value: draftMonth.slice(0, 4),
      options: yearOptions,
      onChange: value => setDraftMonth(current => `${value}-${current.slice(5, 7)}`),
    },
    {
      key: 'draft-month-value',
      ariaLabel: '月份',
      value: draftMonth.slice(5, 7),
      options: MONTH_OPTIONS,
      onChange: value => setDraftMonth(current => `${current.slice(0, 4)}-${value}`),
    },
  ];

  const rangeColumns: MobileWheelColumn[] = [
    { key: 'range-year', ariaLabel: '年份', value: String(activeYear), options: yearOptions, onChange: value => updateActiveDate({ year: value }) },
    { key: 'range-month', ariaLabel: '月份', value: String(activeMonth).padStart(2, '0'), options: MONTH_OPTIONS, onChange: value => updateActiveDate({ month: value }) },
    { key: 'range-day', ariaLabel: '日期', value: activeDate.slice(8, 10), options: createDayOptions(activeYear, activeMonth), onChange: value => updateActiveDate({ day: value }) },
  ];

  const rangeOrderInvalid = Boolean(draftRange.start && draftRange.end && draftRange.start > draftRange.end);
  const confirmDisabled = sheetTab === 'range' && (!draftRange.start || !draftRange.end || rangeOrderInvalid);

  const applyFilter = () => {
    if (confirmDisabled) return;
    setFilter(sheetTab === 'month'
      ? { type: 'month', month: draftMonth }
      : { type: 'range', start: draftRange.start, end: draftRange.end });
    setSheetOpen(false);
  };

  const revokeEntry = () => {
    if (!detailEntry) return;
    const targetId = detailEntry.id;
    setShowRevokeConfirm(false);
    setDetailEntryId(null);
    onRevokeEntry(targetId);
    setStatusToast(`已撤回本次兑换，${GROWTH_COIN_TERMS.name}已退回`);
  };

  const filterLabel = filter.type === 'month'
    ? formatMonthLabel(filter.month)
    : formatRangeLabel(filter.start, filter.end);

  const renderLeadingIcon = (entry: CampusCoinLedgerEntry) => {
    if (entry.type === 'clear' || entry.shares.length === 0) {
      return (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--tm-status-negative-soft)] text-[var(--tm-status-negative-strong)]">
          <Eraser aria-hidden="true" className="h-5 w-5" />
        </span>
      );
    }
    if (entry.shares.length === 1) {
      return (
        <img
          src={avatarByStudentId.get(entry.shares[0].studentId) ?? ASSETS.AVATAR.GENERIC_BOY}
          alt=""
          decoding="async"
          className="h-11 w-11 shrink-0 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover"
        />
      );
    }
    return (
      <span aria-hidden="true" className="relative h-11 w-11 shrink-0">
        <img src={avatarByStudentId.get(entry.shares[0].studentId) ?? ASSETS.AVATAR.GENERIC_BOY} alt="" decoding="async" className="absolute left-0 top-0 h-8 w-8 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover ring-2 ring-[var(--tm-bg-surface)]" />
        <img src={avatarByStudentId.get(entry.shares[1].studentId) ?? ASSETS.AVATAR.GENERIC_GIRL} alt="" decoding="async" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover ring-2 ring-[var(--tm-bg-surface)]" />
      </span>
    );
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">{GROWTH_COIN_TERMS.name}记录</h1>
      </header>

      <div className="flex shrink-0 items-center justify-between gap-[var(--tm-space-3)] px-[var(--tm-report-page-inline)] pb-[var(--tm-space-2)]">
        <button
          type="button"
          onClick={openFilterSheet}
          aria-haspopup="dialog"
          className="-ml-[var(--tm-space-1)] flex min-h-[var(--tm-size-touch)] items-center pr-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] font-semibold tabular-nums text-[var(--tm-text-primary)]"
        >
          {filterLabel}
          <ChevronDown aria-hidden="true" className="ml-0.5 h-4 w-4 text-[var(--tm-text-secondary)]" />
        </button>
        <span className="shrink-0 text-[length:var(--tm-font-size-compact)] tabular-nums text-[var(--tm-text-secondary)]">共 {effectiveCount} 笔</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-[var(--tm-space-6)] no-scrollbar">
        {filteredEntries.length > 0 ? (
          <ul className="divide-y divide-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]" aria-label={`${GROWTH_COIN_TERMS.name}记录`}>
            {filteredEntries.map(entry => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setDetailEntryId(entry.id)}
                  className="flex w-full items-center gap-[var(--tm-space-3)] px-[var(--tm-report-page-inline)] py-[var(--tm-space-3)] text-left"
                >
                  {renderLeadingIcon(entry)}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-[var(--tm-space-3)]">
                      <span className={`min-w-0 truncate text-[length:var(--tm-font-size-body)] font-semibold ${entry.revoked ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--tm-text-primary)]'}`}>{formatCoinLedgerStudentSummary(entry.shares)}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <strong className={`flex items-center gap-1 text-[length:var(--tm-font-size-body)] font-semibold tabular-nums ${entry.revoked ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--tm-chart-negative-text)]'}`}>
                          <span className="sr-only">{entry.type === 'redeem' ? '消耗' : '清空'}{formatCoinAmount(entry.totalAmount)}{GROWTH_COIN_TERMS.name}</span>
                          <img src="/assets/coin.png" alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                          <span aria-hidden="true">-{formatCoinAmount(entry.totalAmount)}</span>
                        </strong>
                        {entry.revoked && <span className="shrink-0 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">已撤回</span>}
                      </span>
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-[length:var(--tm-font-size-meta)]">
                      <span className="min-w-0 truncate font-medium text-[var(--tm-text-secondary)]">{getCoinLedgerEntryTitle(entry)}</span>
                      <span aria-hidden="true" className="shrink-0 text-[var(--tm-text-tertiary)]">·</span>
                      <time className="shrink-0 tabular-nums text-[var(--tm-text-tertiary)]">{formatCoinLedgerTimeLabel(entry.time, todayKey)}</time>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title="暂无记录" className="py-12" />
        )}
      </div>

      <MobileBottomSheet
        open={sheetOpen}
        title="选择时间范围"
        onClose={() => setSheetOpen(false)}
        footer={(
          <div className="flex gap-[var(--tm-space-3)]">
            <button type="button" onClick={() => setSheetOpen(false)} className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]">取消</button>
            <button type="button" disabled={confirmDisabled} onClick={applyFilter} className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">确定</button>
          </div>
        )}
      >
        <CompactSegmentedControl
          value={sheetTab}
          onChange={changeSheetTab}
          ariaLabel="选择时间的方式"
          fullWidth
          motion="sliding"
          semantics="tabs"
          items={[
            { value: 'month', label: '选择月份' },
            { value: 'range', label: '选择时间段' },
          ]}
        />

        {sheetTab === 'month' ? (
          <MobileWheelPicker className="mt-[var(--tm-space-4)]" columns={monthColumns} />
        ) : (
          <div className="mt-[var(--tm-space-4)]">
            <div className="flex items-center gap-[var(--tm-space-2)]">
              {(['start', 'end'] as RangeField[]).map((field, index) => (
                <React.Fragment key={field}>
                  {index === 1 && <span aria-hidden="true" className="shrink-0 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">至</span>}
                  <button
                    type="button"
                    aria-pressed={activeRangeField === field}
                    onClick={() => activateRangeField(field)}
                    className="min-w-0 flex-1 text-center"
                  >
                    <span className="block text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{field === 'start' ? '开始日期' : '结束日期'}</span>
                    <span className={`mt-1.5 flex h-11 items-center justify-center rounded-[var(--tm-radius-control)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] tabular-nums ${draftRange[field] ? 'font-semibold' : 'font-medium'} ${activeRangeField === field ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-tertiary)]'}`}>
                      {draftRange[field] ? formatDateLabel(draftRange[field]) : '轻触选择日期'}
                    </span>
                  </button>
                </React.Fragment>
              ))}
            </div>
            {rangeOrderInvalid && (
              <p className="mt-2 text-center text-[length:var(--tm-font-size-meta)] text-[var(--tm-status-negative-strong)]">结束日期需晚于开始日期</p>
            )}
            <MobileWheelPicker className="mt-[var(--tm-space-3)]" columns={rangeColumns} />
          </div>
        )}
      </MobileBottomSheet>

      <MobileBottomSheet
        open={Boolean(detailEntry)}
        title={detailEntry ? (detailEntry.type === 'clear' ? getCoinLedgerEntryTitle(detailEntry) : '兑换详情') : ''}
        onClose={() => setDetailEntryId(null)}
        footer={detailEntry && isCoinLedgerEntryRevocable(detailEntry, todayKey) ? (
          <button
            type="button"
            onClick={() => setShowRevokeConfirm(true)}
            className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative-soft)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-status-negative-strong)] active:bg-[var(--tm-bg-surface-muted)]"
          >
            撤回本次兑换
          </button>
        ) : undefined}
      >
        {detailEntry && (
          <div className="pb-2">
            <div className="flex items-center justify-between gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-3 py-2.5">
              <span className="min-w-0">
                <span className="block text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">{detailEntry.type === 'redeem' ? '兑换商品' : '操作类型'}</span>
                <span className="mt-0.5 block truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">
                  {getCoinLedgerEntryTitle(detailEntry)}
                </span>
              </span>
              <strong className={`flex shrink-0 items-center gap-1 text-[length:var(--tm-font-size-body)] font-semibold tabular-nums ${detailEntry.revoked ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--tm-chart-negative-text)]'}`}>
                <img src="/assets/coin.png" alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span aria-hidden="true">-{formatCoinAmount(detailEntry.totalAmount)}</span>
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
                          <img src="/assets/coin.png" alt="" aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                          <span aria-hidden="true">-{formatCoinAmount(share.amount)}</span>
                          <span className="sr-only">{GROWTH_COIN_TERMS.available}扣除{formatCoinAmount(share.amount)}{GROWTH_COIN_TERMS.name}</span>
                        </strong>
                        <span className="text-[length:var(--tm-font-size-badge)] font-medium tabular-nums text-[var(--tm-text-tertiary)]">
                          <span aria-hidden="true">{GROWTH_COIN_TERMS.saved} -{formatCoinAmount(bankAmount)}</span>
                          <span className="sr-only">{GROWTH_COIN_TERMS.saved}扣除{formatCoinAmount(bankAmount)}{GROWTH_COIN_TERMS.name}</span>
                        </span>
                      </span>
                    ) : (
                      <strong className="flex shrink-0 items-center gap-1 text-[length:var(--tm-font-size-compact)] font-semibold tabular-nums text-[var(--tm-chart-negative-text)]">
                        <img src="/assets/coin.png" alt="" aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                        <span aria-hidden="true">-{formatCoinAmount(share.amount)}</span>
                        <span className="sr-only">扣除{formatCoinAmount(share.amount)}{GROWTH_COIN_TERMS.name}</span>
                      </strong>
                    )}
                  </li>
                );
              })}
            </ul>

            <dl className="mt-[var(--tm-space-4)] space-y-2 border-t border-[var(--tm-border-subtle)] pt-[var(--tm-space-3)] text-[length:var(--tm-font-size-meta)]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--tm-text-tertiary)]">操作老师</dt>
                <dd className="font-medium text-[var(--tm-text-secondary)]">{detailEntry.operator}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--tm-text-tertiary)]">操作时间</dt>
                <dd className="font-medium tabular-nums text-[var(--tm-text-secondary)]">{formatCoinLedgerFullTime(detailEntry.time)}</dd>
              </div>
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

      <MobileConfirmSheet
        open={showRevokeConfirm}
        tone="danger"
        title="撤回本次兑换"
        description={detailEntry
          ? `将退回 ${detailEntry.shares.length} 名学生共 ${formatCoinAmount(detailEntry.totalAmount)} ${GROWTH_COIN_TERMS.name}，撤回后这条记录保留并标记为已撤回。已有的评价记录、积分和银行不受影响。`
          : ''}
        confirmLabel="撤回"
        onConfirm={revokeEntry}
        onClose={() => setShowRevokeConfirm(false)}
      />

      {statusToast && <MobileToast message={statusToast} />}
    </div>
  );
};

export default ClassExchangeRecordView;
