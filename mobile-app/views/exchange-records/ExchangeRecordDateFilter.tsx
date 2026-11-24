import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import MobileDatePickerSheet, { type MobileDateRange } from '../../components/ui/MobileDatePickerSheet';
import { calendarMonthRange } from '../../components/ui/mobileDatePickerModel';

interface Props {
  range: MobileDateRange;
  viewedMonth: string;
  today: string;
  active: boolean;
  onChange: (range: MobileDateRange) => void;
}

export function formatExchangeRecordMonth(month: string) {
  return `${month.slice(0, 4)}年${Number(month.slice(5, 7))}月`;
}

export default function ExchangeRecordDateFilter({ range, viewedMonth, today, active, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [pickerValue, setPickerValue] = useState(() => calendarMonthRange(viewedMonth, undefined, today));
  const start = range.start.replaceAll('-', '/');
  const end = range.end.replaceAll('-', '/');
  const monthLabel = formatExchangeRecordMonth(viewedMonth);
  const label = start ? `${start}—${end}` : monthLabel;

  useEffect(() => {
    if (!active) setOpen(false);
  }, [active]);

  const openPicker = () => {
    setPickerValue(range.start ? range : calendarMonthRange(viewedMonth, undefined, today));
    setOpen(true);
  };

  return <>
    <button
      type="button"
      className="-ml-[var(--tm-space-1)] flex min-h-[var(--tm-size-touch)] min-w-0 items-center pr-[var(--tm-space-1)] text-left text-[length:var(--tm-font-size-body)] font-semibold tabular-nums text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
      onClick={openPicker}
      aria-label={`选择日期，${label}`}
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      {start ? <span><span className="whitespace-nowrap">{start}—</span><wbr /><span className="whitespace-nowrap">{end}</span></span> : <span>{monthLabel}</span>}
      <ChevronDown aria-hidden="true" className="ml-0.5 h-4 w-4 shrink-0 text-[var(--tm-text-secondary)]" />
    </button>
    <MobileDatePickerSheet
      shape="subtle"
      open={open && active}
      mode="range"
      title="选择日期"
      value={pickerValue}
      max={today}
      showPresets={false}
      onConfirm={(dateRange, mode) => onChange(mode === 'month' ? { start: '', end: dateRange.end } : dateRange)}
      onClose={() => setOpen(false)}
    />
  </>;
}
