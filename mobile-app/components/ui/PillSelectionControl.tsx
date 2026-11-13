import React from 'react';

export interface PillSelectionControlItem<TValue extends string> {
  value: TValue;
  label: React.ReactNode;
}

interface PillSelectionControlProps<TValue extends string> {
  value: TValue;
  items: ReadonlyArray<PillSelectionControlItem<TValue>>;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  className?: string;
  semantics?: 'tabs' | 'group';
  fullWidth?: boolean;
}

const PillSelectionControl = <TValue extends string,>({
  value,
  items,
  onChange,
  ariaLabel,
  className = '',
  semantics = 'group',
  fullWidth = false,
}: PillSelectionControlProps<TValue>) => (
  <div
    className={`${fullWidth ? 'grid w-full' : 'flex overflow-x-auto no-scrollbar'} gap-[var(--tm-space-2)] py-[var(--tm-space-1)] ${className}`}
    style={fullWidth ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` } : undefined}
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
          className={`flex min-h-[var(--tm-selection-touch-height)] ${fullWidth ? 'min-w-0' : 'min-w-[var(--tm-selection-pill-min-width)] shrink-0'} items-center justify-center transition-transform [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none motion-reduce:active:scale-100`}
        >
          <span className={`flex h-[var(--tm-selection-pill-visible-height)] w-full items-center justify-center rounded-[var(--tm-selection-pill-radius)] border px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold transition-[background-color,border-color,color] [transition-duration:var(--tm-duration-fast)] ${selected
            ? 'border-[var(--tm-selection-pill-active-border)] bg-[var(--tm-selection-pill-active-bg)] text-[var(--tm-selection-pill-active-text)] active:bg-[var(--tm-selection-pill-pressed-bg)]'
            : 'border-[var(--tm-selection-pill-inactive-border)] bg-[var(--tm-selection-pill-inactive-bg)] text-[var(--tm-selection-pill-inactive-text)] active:bg-[var(--tm-selection-pill-inactive-pressed-bg)]'}`}
          >
            {item.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default PillSelectionControl;
