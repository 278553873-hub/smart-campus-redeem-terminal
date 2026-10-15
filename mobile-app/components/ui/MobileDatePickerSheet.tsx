import { mobileSheetActionClass } from './mobileSheetActionStyles';
import React, { useEffect, useState } from 'react';
import './MobileDatePickerSheet.css';
import MobileBottomSheet from './MobileBottomSheet';
import MobileDateCalendar from './MobileDateCalendar';
import MobileWheelPicker, { type MobileWheelColumn } from './MobileWheelPicker';
import MobileDateRangePicker from './MobileDateRangePicker';
import MobilePeriodPicker, { type MobilePeriodOption, type MobilePeriodType, periodTypeLabels } from './MobilePeriodPicker';
import { dateRangePresets, dateAllowed, localToday, rangeError, type MobileDateRange } from './mobileDatePickerModel';

export type { MobileDateRange, MobilePeriodOption };
interface CommonProps { open: boolean; title?: string; onClose: () => void; confirmLabel?: string }
interface DateLimits { min?: string; max?: string }
export type MobileDatePickerSheetProps = CommonProps & (
  | (DateLimits & { mode: 'single'; showTodayButton?: boolean; value: string; onConfirm: (date: string) => void })
  | (DateLimits & { mode: 'range'; currentTerm?: MobileDateRange; value: MobileDateRange; onConfirm: (range: MobileDateRange) => void; showPresets?: boolean; presets?: ReadonlyArray<{ label: string; value: MobileDateRange }>; validate?: (range: MobileDateRange) => string })
  | { mode: MobilePeriodType; monthSelection?: 'grid' | 'wheel'; value: string; periods: MobilePeriodOption[]; currentPeriodId?: string; onConfirm: (id: string) => void }
);

/** 日期与月份滚轮先暂存再确认；周期网格点击即生效。 */
export default function MobileDatePickerSheet(props: MobileDatePickerSheetProps) {
  const { open, mode, onClose } = props;
  const [draft, setDraft] = useState<MobileDateRange>({ start: '', end: '' });
  const [session, setSession] = useState(0);
  const [settling, setSettling] = useState(false);
  useEffect(() => {
    if (!open) return;
    setDraft(mode === 'range' ? { ...props.value } : { start: props.value, end: props.value });
    setSession(current => current + 1);
    setSettling(false);
    // 只在重新打开或切换类型时重置草稿；父页面重渲染不覆盖正在选择的日期。
  }, [open, mode]);
  const isMonthWheel = props.mode === 'month' && props.monthSelection === 'wheel';
  const isPeriod = (mode === 'week' || mode === 'month' || mode === 'term') && !isMonthWheel;
  const months = 'periods' in props ? props.periods.filter(period => period.type === 'month').sort((a, b) => a.startDate.localeCompare(b.startDate)) : [];
  const selectedMonth = months.find(period => period.id === draft.start) ?? months.find(period => period.id === props.value) ?? months[0];
  const selectedYear = selectedMonth?.startDate.slice(0, 4) ?? '';
  const yearMonths = months.filter(period => period.startDate.startsWith(`${selectedYear}-`));
  const selectMonth = (id: string) => setDraft({ start: id, end: id });
  const monthColumns: MobileWheelColumn[] = isMonthWheel ? [
    {
      key: 'month-year', ariaLabel: '年份', value: selectedYear,
      options: [...new Set(months.map(period => period.startDate.slice(0, 4)))].map(year => ({ value: year, label: `${year}年` })),
      onChange: year => {
        const available = months.filter(period => period.startDate.startsWith(`${year}-`));
        const next = available.find(period => period.startDate.slice(5, 7) === selectedMonth?.startDate.slice(5, 7)) ?? available[0];
        if (next) selectMonth(next.id);
      },
    },
    {
      key: 'month-value', ariaLabel: '月份', value: selectedMonth?.id ?? '',
      options: yearMonths.map(period => ({ value: period.id, label: `${Number(period.startDate.slice(5, 7))}月` })),
      onChange: selectMonth,
    },
  ] : [];
  const title = props.title ?? (mode === 'single' ? '选择日期' : mode === 'range' ? '选择时间段' : `选择${periodTypeLabels[mode]}`);
  const min = 'min' in props ? props.min : undefined;
  const max = 'max' in props ? props.max : undefined;
  const error = isMonthWheel ? (months.some(period => period.id === draft.start) ? '' : '请选择可用月份') : mode === 'range'
    ? rangeError(draft, min, max) || props.validate?.(draft) || ''
    : dateAllowed(draft.start, min, max) ? '' : '请选择可用日期';
  const complete = () => {
    if (error || settling) return;
    if (props.mode === 'range') props.onConfirm({ ...draft });
    else if (props.mode === 'single' || (props.mode === 'month' && props.monthSelection === 'wheel')) props.onConfirm(draft.start);
    onClose();
  };
  const currentPeriod = 'periods' in props ? props.periods.find(period => period.id === props.currentPeriodId && period.type === mode) : undefined;
  const control = 'min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] px-3 text-[length:var(--tm-font-size-body)] leading-5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]';
  const confirmAppearance = error
    ? 'bg-[var(--tm-input-disabled-bg)] text-[var(--tm-input-disabled-text)]'
    : `bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] ${settling ? 'opacity-[0.85]' : 'opacity-100'}`;
  const confirmButton = (
    <button type="button" disabled={Boolean(error) || settling} onClick={complete} className={`${mobileSheetActionClass} flex w-full items-center justify-center ${confirmAppearance} ${mode === 'range' ? 'font-medium' : 'font-semibold'} transition-opacity [transition-duration:var(--tm-duration-fast)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]`}>
      {props.confirmLabel ?? (mode === 'range' || isMonthWheel ? '确定' : '完成')}
    </button>
  );
  const footer = isPeriod ? undefined : mode === 'range' || isMonthWheel ? (
    <div className="tm-date-range-actions grid grid-cols-2 gap-[var(--tm-space-4)]">
      <button type="button" onClick={onClose} className={`${mobileSheetActionClass} flex items-center justify-center bg-[var(--tm-bg-surface-soft)] font-medium text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]`}>取消</button>
      {confirmButton}
    </div>
  ) : confirmButton;
  return (
    <MobileBottomSheet open={open} title={title} onClose={onClose} showHandle={false} contentInset="none" footer={footer} headerAction={!isMonthWheel && currentPeriod && 'periods' in props ? {
      label: mode === 'week' ? '本周' : mode === 'month' ? '本月' : '本学期',
      onClick: () => { props.onConfirm(currentPeriod.id); onClose(); },
    } : undefined}>
      <div className="pt-[var(--tm-sheet-content-gap)] text-[length:var(--tm-font-size-body)] font-medium leading-5">
        {isMonthWheel ? (
          <div className="px-[var(--tm-sheet-inline)]">
            <MobileWheelPicker key={session} columns={monthColumns} onSettlingChange={setSettling} />
          </div>
        ) : 'periods' in props ? (
          <div className="px-[var(--tm-sheet-inline)]"><MobilePeriodPicker key={`${mode}-${open}`} periods={props.periods.filter(period => period.type === mode)} selectedPeriodId={props.value} onSelect={id => { props.onConfirm(id); onClose(); }} /></div>
        ) : mode === 'range' ? (
          <MobileDateRangePicker key={session} value={draft} onChange={setDraft} settling={settling} onSettlingChange={setSettling} presets={props.showPresets === false ? [] : props.presets ?? dateRangePresets(localToday(), props.currentTerm, min, max)} min={min} max={max} error={error} validate={props.validate} />
        ) : (
          <>
            <div className="px-[var(--tm-sheet-inline)] pb-[var(--tm-space-3)]">
              <div className="flex min-h-11 items-center justify-between gap-3 text-[length:var(--tm-font-size-body)] font-medium" aria-live="polite">
                <span>{draft.start || '请选择日期'}</span>
                {mode === 'single' && props.showTodayButton !== false && <button type="button" disabled={!dateAllowed(localToday(), min, max)} onClick={() => { const today = localToday(); setDraft({ start: today, end: today }); setSession(s => s + 1); }} className={`${control} text-[var(--tm-brand-primary)] disabled:text-[var(--tm-text-disabled)]`}>今天</button>}
              </div>
            </div>
            <MobileDateCalendar key={session} value={draft} min={min} max={max} onSelect={date => setDraft({ start: date, end: date })} />
          </>
        )}
      </div>
    </MobileBottomSheet>
  );
}
