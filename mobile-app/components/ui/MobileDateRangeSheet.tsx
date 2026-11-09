import React, { useEffect, useMemo, useRef, useState } from 'react';
import MobileBottomSheet from './MobileBottomSheet';
import MobileDateRangePicker from './MobileDateRangePicker';
import MobileMonthWheel from './MobileMonthWheel';
import TextSelectionControl from './TextSelectionControl';
import { mobileSheetActionClass } from './mobileSheetActionStyles';
import { calendarMonthOptions, calendarMonthRange, dateRangePresets, isCalendarDate, localToday, rangeError, type MobileDateRange, type MobileDateRangeSelectionMode } from './mobileDatePickerModel';
import type { MobileDateRangeSheetProps } from './mobileDatePickerTypes';

const selectionModes = [
  { value: 'month', label: '选择月份' },
  { value: 'range', label: '选择时间段' },
] as const;

const availableMonth = (candidate: string, months: ReadonlyArray<string>) => {
  if (!months.length) return '';
  return months.includes(candidate) ? candidate : candidate < months[0] ? months[0] : months[months.length - 1];
};

/** 两种查询输入共用一个弹层；各自维护草稿，只在确认时输出日期范围。 */
export default function MobileDateRangeSheet(props: MobileDateRangeSheetProps) {
  const { open, value, min, max, onClose } = props;
  const months = useMemo(() => calendarMonthOptions(min, max), [min, max]);
  const committedMode = useRef(props.defaultSelectionMode ?? 'month');
  const [selectionMode, setSelectionMode] = useState<MobileDateRangeSelectionMode>(committedMode.current);
  const [rangeDraft, setRangeDraft] = useState<MobileDateRange>({ ...value });
  const [monthDraft, setMonthDraft] = useState(() => availableMonth((isCalendarDate(value.start) ? value.start : localToday()).slice(0, 7), months));
  const [session, setSession] = useState(0);
  const [settling, setSettling] = useState(false);
  useEffect(() => {
    if (!open) return;
    setSelectionMode(committedMode.current);
    setRangeDraft({ ...value });
    const candidate = (isCalendarDate(value.start) ? value.start : localToday()).slice(0, 7);
    setMonthDraft(availableMonth(candidate, months));
    setSession(current => current + 1);
    setSettling(false);
    // 每次打开恢复已确认的模式和值；父页面重渲染不覆盖当前草稿。
  }, [open]);
  const presets = props.showPresets === false ? [] : props.presets ?? dateRangePresets(localToday(), props.currentTerm, min, max);
  const selectedMonth = availableMonth(monthDraft, months);
  const draft = selectionMode === 'month' ? calendarMonthRange(selectedMonth, min, max) : rangeDraft;
  const error = rangeError(draft, min, max) || props.validate?.(draft) || '';
  const complete = () => {
    if (error || settling) return;
    committedMode.current = selectionMode;
    props.onConfirm({ ...draft }, selectionMode);
    onClose();
  };
  const selectMode = (mode: MobileDateRangeSelectionMode) => {
    setSelectionMode(mode);
    setSettling(false);
  };
  const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]';
  const confirmAppearance = error
    ? 'bg-[var(--tm-input-disabled-bg)] text-[var(--tm-input-disabled-text)]'
    : `bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] ${settling ? 'opacity-[0.85]' : 'opacity-100'}`;
  const footer = <div className="tm-date-range-actions grid grid-cols-2 gap-[var(--tm-space-4)]">
    <button type="button" onClick={onClose} className={`${mobileSheetActionClass} flex items-center justify-center bg-[var(--tm-bg-surface-soft)] font-medium text-[var(--tm-text-primary)] ${focus}`}>取消</button>
    <button type="button" disabled={Boolean(error) || settling} onClick={complete} className={`${mobileSheetActionClass} flex items-center justify-center font-medium ${confirmAppearance} transition-opacity [transition-duration:var(--tm-duration-fast)] motion-reduce:transition-none ${focus}`}>{props.confirmLabel ?? '确定'}</button>
  </div>;
  return <MobileBottomSheet open={open} title={props.title ?? '选择日期'} onClose={onClose} showHandle={false} contentInset="none" flushContentBottom footerSpacing="section" footer={footer} titleContent={
    <div className="relative top-[var(--tm-space-2)] flex h-full items-center pl-[var(--tm-space-2)]">
      <TextSelectionControl value={selectionMode} items={selectionModes} onChange={selectMode} ariaLabel="日期选择方式" variant="underline" size="section" static />
    </div>
  }>
    <div className="tm-date-filter-content pt-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-medium leading-5" data-presets={presets.length > 0} data-selection-mode={selectionMode} role="tabpanel" aria-label={selectionMode === 'month' ? '选择月份' : '选择时间段'}>
      {selectionMode === 'month' ? <>
        <MobileMonthWheel key={session} value={selectedMonth} months={months} onSelect={setMonthDraft} onSettlingChange={setSettling} />
        {selectedMonth && error && <p role="status" className="px-[var(--tm-sheet-inline)] pt-3 text-center text-[var(--tm-text-secondary)]">{error}</p>}
      </> : <MobileDateRangePicker key={session} value={rangeDraft} onChange={setRangeDraft} settling={settling} onSettlingChange={setSettling} presets={presets} min={min} max={max} error={error} validate={props.validate} />}
    </div>
  </MobileBottomSheet>;
}
