import React from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { SwapIcon } from '../Icons';

export interface StudentTimeRangeOption {
  value: string;
  label: string;
}

interface StudentTimeRangeSelectorProps {
  shape?: 'default' | 'subtle' | 'glass';
  value: string;
  options: StudentTimeRangeOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
}

const StudentTimeRangeSelector: React.FC<StudentTimeRangeSelectorProps> = ({
  shape = 'default',
  value,
  options,
  onChange,
  ariaLabel,
}) => {
  const isGlass = shape === 'glass';
  const selectedLabel = options.find(option => option.value === value)?.label ?? options[0]?.label;

  return (
    <div className={isGlass ? 'relative grid min-h-[var(--tm-size-touch)] min-w-0 content-center' : 'relative'}>
      {!isGlass && <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-brand-primary)]" aria-hidden="true" />}
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        aria-label={ariaLabel}
        className={isGlass
          ? 'peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0'
          : `h-11 w-full appearance-none ${shape === 'subtle' ? 'rounded-[var(--tm-radius-control-compact)]' : 'rounded-[var(--tm-radius-control)]'} border border-transparent bg-[var(--tm-bg-surface)] pl-10 pr-10 text-[13px] font-medium text-[var(--tm-input-text)] [box-shadow:var(--tm-shadow-control)] outline-none focus-visible:bg-[var(--tm-bg-surface)]`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {isGlass ? (
        <span aria-hidden="true" className="pointer-events-none flex min-h-8 min-w-0 items-center justify-center gap-1 rounded-full border border-white/90 bg-white/[0.35] px-2 py-1 text-center text-[length:var(--tm-font-size-meta)] font-medium leading-tight text-[var(--tm-student-detail-term-text)] backdrop-blur-md peer-focus-visible:border-[color:var(--tm-brand-reward-strong)]">
          <span className="min-w-0 [overflow-wrap:anywhere]">{selectedLabel}</span>
          <SwapIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </span>
      ) : <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" aria-hidden="true" />}
    </div>
  );
};

export default StudentTimeRangeSelector;
