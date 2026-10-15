import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, Eraser } from 'lucide-react';
import { ASSETS } from '../assets/images';
import MobileAvatarCollage from '../components/ui/MobileAvatarCollage';
import MobileDatePickerSheet, { type MobilePeriodOption } from '../components/ui/MobileDatePickerSheet';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import MobileToast from '../components/ui/MobileToast';
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

const toMonthValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const formatMonthLabel = (month: string) => {
  const [year, monthValue] = month.split('-');
  return `${year}年${Number(monthValue)}月`;
};

const ClassExchangeRecordView: React.FC<ClassExchangeRecordViewProps> = ({ students, entries, onRevokeEntry, onBack }) => {
  const today = useMemo(() => new Date(), []);
  const todayKey = formatCoinLedgerDateKey(today);
  const [filter, setFilter] = useState<{ type: 'month'; month: string }>(() => ({ type: 'month', month: toMonthValue(new Date()) }));
  const [sheetOpen, setSheetOpen] = useState(false);
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

  const monthPeriods = useMemo<MobilePeriodOption[]>(() => {
    const currentYear = today.getFullYear();
    const entryYears = entries.map(entry => Number(entry.time.slice(0, 4))).filter(Number.isFinite);
    const firstYear = Math.min(currentYear - 2, ...entryYears);
    const lastYear = Math.max(currentYear, ...entryYears);
    return Array.from({ length: (lastYear - firstYear + 1) * 12 }, (_, index) => {
      const year = firstYear + Math.floor(index / 12);
      const month = index % 12 + 1;
      const id = `${year}-${String(month).padStart(2, '0')}`;
      return {
        id,
        type: 'month',
        label: formatMonthLabel(id),
        startDate: `${id}-01`,
        endDate: `${id}-${new Date(year, month, 0).getDate()}`,
      };
    });
  }, [entries, today]);

  const detailEntry = entries.find(entry => entry.id === detailEntryId) ?? null;

  const revokeEntry = () => {
    if (!detailEntry) return;
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

      <div className="flex shrink-0 items-center justify-between gap-[var(--tm-space-3)] px-[var(--tm-report-page-inline)] pb-[var(--tm-space-2)]">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className="-ml-[var(--tm-space-1)] flex min-h-[var(--tm-size-touch)] items-center pr-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] font-semibold tabular-nums text-[var(--tm-text-primary)]"
        >
          {formatMonthLabel(filter.month)}
          <ChevronDown aria-hidden="true" className="ml-0.5 h-4 w-4 text-[var(--tm-text-secondary)]" />
        </button>
        <span className="shrink-0 text-[length:var(--tm-font-size-compact)] tabular-nums text-[var(--tm-text-secondary)]">共 {effectiveCount} 笔</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-[var(--tm-space-6)] no-scrollbar">
        {filteredEntries.length > 0 ? (
          <ul className="divide-y divide-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]" aria-label="兑换记录">
            {filteredEntries.map(entry => (
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
                      <span className="flex shrink-0 items-center gap-1">
                        <strong className={`flex items-center gap-1 text-[length:var(--tm-font-size-body)] font-semibold tabular-nums ${entry.revoked ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--tm-chart-negative-text)]'}`}>
                          <span className="sr-only">{entry.type === 'redeem' ? '消耗' : '清空'}{formatCoinAmount(entry.totalAmount)}{GROWTH_COIN_TERMS.name}</span>
                          <img src="/assets/coin.png" alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                          <span aria-hidden="true">-{formatCoinAmount(entry.totalAmount)}</span>
                        </strong>
                        {entry.revoked && <span className="shrink-0 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">已撤回</span>}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{getCoinLedgerEntryTitle(entry)}</span>
                    <time dateTime={entry.time.replace(' ', 'T')} className="mt-1 block text-[length:var(--tm-font-size-meta)] tabular-nums text-[var(--tm-text-tertiary)]">{formatCoinLedgerTimeLabel(entry.time, todayKey)}</time>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title="暂无记录" className="py-12" />
        )}
      </div>

      <MobileDatePickerSheet
        open={sheetOpen}
        mode="month"
        monthSelection="wheel"
        value={filter.month}
        periods={monthPeriods}
        currentPeriodId={toMonthValue(today)}
        onConfirm={month => setFilter({ type: 'month', month })}
        onClose={() => setSheetOpen(false)}
      />

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
