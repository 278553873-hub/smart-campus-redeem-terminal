import React from 'react';

export interface ReportDateRangeTab<TValue extends string> {
  value: TValue;
  label: React.ReactNode;
}

interface ReportDateRangeTabsProps<TValue extends string> {
  value: TValue;
  items: ReadonlyArray<ReportDateRangeTab<TValue>>;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  className?: string;
}

const ReportDateRangeTabs = <TValue extends string,>({
  value,
  items,
  onChange,
  ariaLabel,
  className = '',
}: ReportDateRangeTabsProps<TValue>) => (
  <div
    className={`${className} grid h-[var(--tm-size-touch)] grid-cols-5 bg-[var(--tm-page-plain-header-bg)] px-[var(--tm-report-page-inline)]`}
    role="group"
    aria-label={ariaLabel}
  >
    {items.map(item => {
      const selected = value === item.value;
      return (
        <button
          key={item.value}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(item.value)}
          className={`relative flex h-full min-w-0 items-center justify-center whitespace-nowrap px-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] transition-[color,scale] [transition-duration:var(--tm-duration-standard)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transform-none ${selected
            ? 'font-semibold text-[var(--tm-brand-primary)]'
            : 'font-medium text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]'}`}
        >
          <span>{item.label}</span>
          <span
            aria-hidden="true"
            className={`absolute bottom-0 left-1/2 h-[var(--tm-report-date-indicator-height)] w-[var(--tm-report-date-indicator-width)] -translate-x-1/2 rounded-full bg-[var(--tm-brand-primary)] transition-opacity [transition-duration:var(--tm-duration-standard)] ${selected ? 'opacity-100' : 'opacity-0'}`}
          />
        </button>
      );
    })}
  </div>
);

export default ReportDateRangeTabs;
