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
  semantics?: 'group' | 'tabs';
}

const ReportDateRangeTabs = <TValue extends string,>({
  value,
  items,
  onChange,
  ariaLabel,
  className = '',
  semantics = 'group',
}: ReportDateRangeTabsProps<TValue>) => (
  <div
    className={`${className} grid h-[var(--tm-size-touch)] grid-cols-5 bg-[var(--tm-page-plain-header-bg)] px-[var(--tm-report-page-inline)]`}
    style={items.length === 5 ? undefined : { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    role={semantics === 'tabs' ? 'tablist' : 'group'}
    aria-label={ariaLabel}
  >
    {items.map(item => {
      const selected = value === item.value;
      return (
        <button
          key={item.value}
          type="button"
          role={semantics === 'tabs' ? 'tab' : undefined}
          aria-pressed={semantics === 'group' ? selected : undefined}
          aria-selected={semantics === 'tabs' ? selected : undefined}
          tabIndex={semantics === 'tabs' ? (selected ? 0 : -1) : undefined}
          onClick={() => onChange(item.value)}
          onKeyDown={event => {
            if (semantics !== 'tabs') return;
            const index = items.findIndex(option => option.value === item.value);
            const next = event.key === 'ArrowRight' ? (index + 1) % items.length
              : event.key === 'ArrowLeft' ? (index - 1 + items.length) % items.length
              : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : undefined;
            if (next === undefined) return;
            event.preventDefault();
            onChange(items[next].value);
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
          }}
          className={`relative flex h-full min-w-0 items-center justify-center whitespace-nowrap px-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] transition-colors [transition-duration:var(--tm-duration-standard)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] ${selected
            ? 'font-semibold text-[var(--tm-brand-primary)]'
            : 'font-medium text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]'}`}
        >
          <span>{item.label}</span>
          <span
            aria-hidden="true"
            className={`absolute bottom-0 left-1/2 h-[var(--tm-report-date-indicator-height)] w-[var(--tm-report-date-indicator-width)] -translate-x-1/2 rounded-full bg-[var(--tm-brand-primary)] transition-opacity [transition-duration:var(--tm-duration-standard)] motion-reduce:transition-none ${selected ? 'opacity-100' : 'opacity-0'}`}
          />
        </button>
      );
    })}
  </div>
);

export default ReportDateRangeTabs;
