import React, { useId, useState } from 'react';
import MobileDateWheel from './MobileDateWheel';
import { localToday, rangeError, setRangeEndpoint, type MobileDateRange, type MobileDateRangePreset } from './mobileDatePickerModel';

interface Props {
  value: MobileDateRange;
  onChange: (value: MobileDateRange) => void;
  presets: ReadonlyArray<MobileDateRangePreset>;
  min?: string;
  max?: string;
  error: string;
  settling?: boolean;
  onSettlingChange?: (settling: boolean) => void;
  validate?: (value: MobileDateRange) => string;
}

/** 起止日期切换，共用一组日期滚轮。 */
export default function MobileDateRangePicker({ value, onChange, presets, min, max, error, settling, onSettlingChange, validate }: Props) {
  const [activeField, setActiveField] = useState<keyof MobileDateRange>('start');
  const [position, setPosition] = useState(0);
  const errorId = useId();
  const activate = (field: keyof MobileDateRange) => {
    setActiveField(field);
    setPosition(p => p + 1);
    if (!value[field]) {
      const candidate = value.start || localToday();
      const initial = min && candidate < min ? min : max && candidate > max ? max : candidate;
      onChange(setRangeEndpoint(value, field, initial));
    }
  };
  const chooseDay = (date: string) => onChange(setRangeEndpoint(value, activeField, date));
  const lower = activeField === 'end' && value.start ? (min && min > value.start ? min : value.start) : min;
  const currentDate = value[activeField] || value.start;
  const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]';
  const message = value.start && value.end ? error : '';
  const announcement = !value.start ? '请选择开始日期' : !value.end ? '请选择结束日期' : `正在选择${activeField === 'start' ? '开始' : '结束'}日期`;
  return <>
    <div className="px-[var(--tm-sheet-inline)]">
      {presets.length > 0 && <div className="mb-[var(--tm-space-6)] grid grid-cols-5 gap-1.5" role="group" aria-label="快捷日期范围">{presets.map(preset => {
        const selected = value.start === preset.value.start && value.end === preset.value.end;
        return <button key={preset.label} type="button" aria-pressed={selected} disabled={Boolean(rangeError(preset.value, min, max) || validate?.(preset.value))} onClick={() => { onChange({ ...preset.value }); setActiveField('start'); setPosition(p => p + 1); }} className={`group flex min-h-[var(--tm-size-touch)] min-w-0 items-center rounded-[var(--tm-selection-pill-radius)] bg-transparent text-[length:var(--tm-font-size-body)] leading-5 font-medium ${focus}`}><span className={`flex h-[var(--tm-date-shortcut-height)] w-full items-center justify-center whitespace-nowrap rounded-[var(--tm-selection-pill-radius)] border px-1 ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'border-[var(--tm-border-subtle)] bg-transparent text-[var(--tm-text-secondary)]'} group-disabled:border-[var(--tm-border-subtle)] group-disabled:bg-transparent group-disabled:text-[var(--tm-text-disabled)]`}>{preset.label}</span></button>;
      })}</div>}
      <div className="mb-[var(--tm-space-6)] grid grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)] items-end gap-1" role="group" aria-label="编辑日期范围">
        {(['start', 'end'] as const).map((field, index) => <React.Fragment key={field}>
          {index === 1 && <span className="flex h-[var(--tm-date-row-height)] items-center justify-center text-[length:var(--tm-font-size-body)] text-[var(--tm-text-secondary)]">至</span>}
          <div className="min-w-0 space-y-2">
            <span className="block text-center text-[length:var(--tm-font-size-body)] leading-5 text-[var(--tm-text-secondary)]">{field === 'start' ? '开始日期' : '结束日期'}</span>
            <button type="button" disabled={settling} aria-label={field === 'start' ? '选择开始时间' : '选择结束时间'} aria-pressed={activeField === field} aria-describedby={message || !value[field] ? errorId : undefined} onClick={() => activate(field)} className={`flex h-[var(--tm-date-row-height)] w-full min-w-0 items-center justify-center rounded-[var(--tm-date-control-radius)] whitespace-nowrap px-1 text-[length:var(--tm-font-size-body)] leading-5 font-medium tabular-nums ${focus} ${!value[field] ? 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-tertiary)]' : activeField === field ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-primary)]'}`}>
              {value[field] ? value[field].replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_, year, month, day) => `${year}年${Number(month)}月${Number(day)}日`) : '轻触选择日期'}
            </button>
          </div>
        </React.Fragment>)}
      </div>
      <p id={errorId} role="status" className={message ? 'mb-3 text-center text-[length:var(--tm-font-size-body)] leading-5 text-[var(--tm-text-secondary)]' : 'sr-only'}>{message || announcement}</p>
    </div>
    <MobileDateWheel key={`${position}-${activeField}`} value={currentDate} min={lower} max={max} onSelect={chooseDay} onSettlingChange={onSettlingChange} />
  </>;
}
