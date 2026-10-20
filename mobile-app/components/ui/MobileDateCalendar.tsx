import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarCells, dateAllowed, isCalendarDate, localToday, shiftDate, type MobileDateRange } from './mobileDatePickerModel';

interface MobileDateCalendarProps {
  shape?: 'default' | 'subtle';
  value: MobileDateRange;
  min?: string;
  max?: string;
  initialDate?: string;
  onSelect: (date: string) => void;
}

/** 无弹层的日历内容，可供单日与范围选择共用。 */
export default function MobileDateCalendar({ value, min, max, initialDate, onSelect, shape = 'default' }: MobileDateCalendarProps) {
  const today = localToday();
  const lower = isCalendarDate(min ?? '') ? min! : '1900-01-01';
  const upper = isCalendarDate(max ?? '') ? max! : '2100-12-31';
  const clamp = (date: string) => date < lower ? lower : date > upper ? upper : date;
  const initial = clamp(isCalendarDate(initialDate ?? '') ? initialDate! : isCalendarDate(value.start) ? value.start : today);
  const [month, setMonth] = useState(initial.slice(0, 7));
  const [focusDate, setFocusDate] = useState(initial);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const [year, monthNumber] = month.split('-').map(Number);
  const monthValue = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;
  const previousMonth = monthValue(monthNumber === 1 ? year - 1 : year, monthNumber === 1 ? 12 : monthNumber - 1);
  const nextMonth = monthValue(monthNumber === 12 ? year + 1 : year, monthNumber === 12 ? 1 : monthNumber + 1);
  const changeMonth = (next: string) => {
    const bounded = next < lower.slice(0, 7) ? lower.slice(0, 7) : next > upper.slice(0, 7) ? upper.slice(0, 7) : next;
    setMonth(bounded);
    setFocusDate(clamp(`${bounded}-01`));
  };
  const handleKey = (event: React.KeyboardEvent, date: string) => {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let target: string;
    if (event.key in offsets) target = shiftDate(date, offsets[event.key]);
    else if (event.key === 'Home' || event.key === 'End') {
      const weekday = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
      target = shiftDate(date, event.key === 'Home' ? -weekday : 6 - weekday);
    } else return;
    event.preventDefault();
    target = clamp(target);
    setFocusDate(target);
    setMonth(target.slice(0, 7));
    requestAnimationFrame(() => buttons.current.get(target)?.focus());
  };
  const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]';
  if (lower > upper) return <p role="status" className="px-4 py-6 text-center text-[var(--tm-text-secondary)]">暂无可选日期</p>;
  return (
    <div>
      <div className="flex items-center justify-between px-[var(--tm-sheet-inline)] pb-[var(--tm-space-2)]">
        <button type="button" aria-label="上个月" disabled={previousMonth < lower.slice(0, 7)} onClick={() => changeMonth(previousMonth)} className={`flex h-11 w-11 items-center justify-center text-[var(--tm-text-secondary)] disabled:text-[var(--tm-text-disabled)] ${focusClass}`}><ChevronLeft className="h-5 w-5" /></button>
        <div className="flex items-center gap-1">
          <select aria-label="选择年份" value={year} onChange={event => changeMonth(monthValue(Number(event.target.value), monthNumber))} className={`h-11 bg-transparent text-[length:var(--tm-font-size-body)] leading-5 font-semibold ${focusClass}`}>
            {Array.from({ length: Number(upper.slice(0, 4)) - Number(lower.slice(0, 4)) + 1 }, (_, i) => Number(lower.slice(0, 4)) + i).map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select aria-label="选择月份" value={monthNumber} onChange={event => changeMonth(monthValue(year, Number(event.target.value)))} className={`h-11 bg-transparent text-[length:var(--tm-font-size-body)] leading-5 font-semibold ${focusClass}`}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m} disabled={monthValue(year, m) < lower.slice(0, 7) || monthValue(year, m) > upper.slice(0, 7)}>{m}月</option>)}
          </select>
        </div>
        <button type="button" aria-label="下个月" disabled={nextMonth > upper.slice(0, 7)} onClick={() => changeMonth(nextMonth)} className={`flex h-11 w-11 items-center justify-center text-[var(--tm-text-secondary)] disabled:text-[var(--tm-text-disabled)] ${focusClass}`}><ChevronRight className="h-5 w-5" /></button>
      </div>
      <div className="grid grid-cols-7" aria-hidden="true">{['一','二','三','四','五','六','日'].map(day => <span key={day} className="py-2 text-center text-[length:var(--tm-font-size-body)] text-[var(--tm-text-secondary)]">{day}</span>)}</div>
      <div className="grid grid-cols-7" role="group" aria-label={`${year}年${monthNumber}月日历`}>
        {calendarCells(month).map(date => {
          const inMonth = date.slice(0, 7) === month;
          const disabled = !dateAllowed(date, lower, upper) || !inMonth;
          const endpoint = date === value.start || date === value.end;
          const inRange = Boolean(value.start && value.end && date > value.start && date < value.end);
          return <button key={date} ref={node => { if (node) buttons.current.set(date, node); else buttons.current.delete(date); }} type="button" disabled={disabled} tabIndex={!disabled && date === focusDate ? 0 : -1} aria-label={`${date.replaceAll('-', '/')} ${date === value.start ? '开始日期' : date === value.end ? '结束日期' : ''}`} aria-pressed={endpoint || inRange} aria-current={date === today ? 'date' : undefined} onKeyDown={event => handleKey(event, date)} onFocus={() => setFocusDate(date)} onClick={() => { setFocusDate(date); onSelect(date); }} className={`relative flex min-h-[var(--tm-size-touch)] items-center justify-center text-[length:var(--tm-font-size-body)] leading-5 tabular-nums ${focusClass} ${inRange && inMonth ? 'bg-[var(--tm-brand-primary-soft)]' : ''} ${!inMonth ? 'invisible' : ''} disabled:text-[var(--tm-text-disabled)]`}>
            <span className={`flex h-9 w-9 items-center justify-center ${shape === 'subtle' ? 'rounded-[var(--tm-radius-control-compact)]' : 'rounded-[var(--tm-radius-control)]'} ${endpoint ? 'bg-[var(--tm-brand-primary)] font-semibold text-[var(--tm-text-inverse)]' : date === today ? 'font-semibold text-[var(--tm-brand-primary)]' : ''}`}>{Number(date.slice(-2))}</span>
          </button>;
        })}
      </div>
    </div>
  );
}
