import React from 'react';

export interface CompactSegmentedControlItem<TValue extends string> {
  value: TValue;
  label: React.ReactNode;
}

interface CompactSegmentedControlProps<TValue extends string> {
  value: TValue;
  items: ReadonlyArray<CompactSegmentedControlItem<TValue>>;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  fullWidth?: boolean;
  className?: string;
  semantics?: 'tabs' | 'group';
}

const CompactSegmentedControl = <TValue extends string,>({
  value,
  items,
  onChange,
  ariaLabel,
  fullWidth = false,
  className = '',
  semantics = 'tabs',
}: CompactSegmentedControlProps<TValue>) => (
  <div
    className={`${fullWidth ? 'grid w-full' : 'inline-grid'} h-[var(--tm-selection-touch-height)] rounded-[var(--tm-radius-control)] bg-[var(--tm-selection-segment-track-bg)] ${className}`}
    style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    role={semantics === 'tabs' ? 'tablist' : 'group'}
    aria-label={ariaLabel}
  >
    {items.map(item => {
      const selected = item.value === value;
      return (
        <button
          key={item.value}
          type="button"
          role={semantics === 'tabs' ? 'tab' : undefined}
          aria-selected={semantics === 'tabs' ? selected : undefined}
          aria-pressed={semantics === 'group' ? selected : undefined}
          onClick={() => onChange(item.value)}
          className={`${fullWidth ? 'min-w-0' : 'min-w-[72px]'} flex min-h-[var(--tm-selection-touch-height)] items-center justify-center p-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] font-semibold transition-transform [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none motion-reduce:active:scale-100`}
        >
          <span className={`flex h-[var(--tm-selection-segment-visible-height)] w-full items-center justify-center rounded-[calc(var(--tm-radius-control)-var(--tm-space-1))] px-[var(--tm-space-2)] transition-[background-color,color,box-shadow] [transition-duration:var(--tm-duration-fast)] motion-reduce:transition-none ${selected
            ? 'bg-[var(--tm-selection-segment-active-bg)] text-[var(--tm-selection-segment-active-text)] [box-shadow:var(--tm-selection-segment-active-shadow)]'
            : 'text-[var(--tm-selection-segment-inactive-text)]'}`}
          >
            {item.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default CompactSegmentedControl;
