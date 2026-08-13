import React from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';

export interface StudentTimeRangeOption {
  value: string;
  label: string;
}

interface StudentTimeRangeSelectorProps {
  value: string;
  options: StudentTimeRangeOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
}

const StudentTimeRangeSelector: React.FC<StudentTimeRangeSelectorProps> = ({
  value,
  options,
  onChange,
  ariaLabel,
}) => (
  <div className="relative">
    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-brand-primary)]" />
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      aria-label={ariaLabel}
      className="h-11 w-full appearance-none rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] pl-10 pr-10 text-[13px] font-medium text-[var(--tm-input-text)] [box-shadow:var(--tm-shadow-control)] outline-none"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
  </div>
);

export default StudentTimeRangeSelector;
