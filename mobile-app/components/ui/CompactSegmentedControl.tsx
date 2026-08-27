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
  density?: 'default' | 'compact';
  motion?: 'static' | 'sliding';
}

const CompactSegmentedControl = <TValue extends string,>({
  value,
  items,
  onChange,
  ariaLabel,
  fullWidth = false,
  className = '',
  semantics = 'tabs',
  density = 'default',
  motion = 'static',
}: CompactSegmentedControlProps<TValue>) => {
  const selectedIndex = Math.max(0, items.findIndex(item => item.value === value));
  const compact = density === 'compact';
  const activeHeightClass = compact
    ? 'h-[var(--tm-selection-segment-compact-active-height)]'
    : 'h-[var(--tm-selection-segment-visible-height)]';

  return (
    <div
      className={`${fullWidth ? 'grid w-full' : 'inline-grid'} relative h-[var(--tm-selection-touch-height)] items-center ${compact ? 'text-[length:var(--tm-selection-segment-compact-font-size)]' : 'text-[length:var(--tm-font-size-body)]'} ${className}`}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      role={semantics === 'tabs' ? 'tablist' : 'group'}
      aria-label={ariaLabel}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 ${compact ? 'h-[var(--tm-selection-segment-compact-track-height)] rounded-[var(--tm-selection-segment-compact-track-radius)] bg-[var(--tm-selection-segment-track-bg)]' : 'h-[var(--tm-selection-touch-height)] rounded-[var(--tm-radius-control)] bg-[var(--tm-selection-segment-track-bg)]'}`}
      />
      {motion === 'sliding' && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 ${compact ? 'inset-x-[var(--tm-selection-segment-compact-inset)]' : 'inset-x-[var(--tm-space-1)]'}`}
        >
          <span
            data-sliding-indicator
            className={`block rounded-[var(--tm-radius-control)] bg-[var(--tm-selection-segment-active-bg)] [box-shadow:var(--tm-selection-segment-active-shadow)] transition-transform [transition-duration:var(--tm-selection-segment-slide-duration)] [transition-timing-function:var(--tm-selection-segment-slide-easing)] motion-reduce:transition-none ${activeHeightClass}`}
            style={{
              width: `${100 / Math.max(items.length, 1)}%`,
              transform: `translate3d(${selectedIndex * 100}%, 0, 0)`,
            }}
          />
        </span>
      )}
      {items.map(item => {
        const selected = item.value === value;
        const selectedClass = motion === 'sliding'
          ? (selected ? 'text-[var(--tm-selection-segment-active-text)]' : 'text-[var(--tm-selection-segment-inactive-text)]')
          : (selected
            ? 'bg-[var(--tm-selection-segment-active-bg)] text-[var(--tm-selection-segment-active-text)] [box-shadow:var(--tm-selection-segment-active-shadow)]'
            : 'text-[var(--tm-selection-segment-inactive-text)]');

        return (
          <button
            key={item.value}
            type="button"
            role={semantics === 'tabs' ? 'tab' : undefined}
            aria-selected={semantics === 'tabs' ? selected : undefined}
            aria-pressed={semantics === 'group' ? selected : undefined}
            onClick={() => onChange(item.value)}
            className={`${fullWidth ? 'min-w-0' : 'min-w-[72px]'} relative z-10 flex min-h-[var(--tm-selection-touch-height)] items-center justify-center font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] ${motion === 'sliding' ? 'px-0.5' : 'p-[var(--tm-space-1)] transition-transform [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100'}`}
          >
            <span className={`relative z-10 flex w-full items-center justify-center rounded-[var(--tm-radius-control)] px-[var(--tm-space-2)] [transition-duration:var(--tm-duration-fast)] motion-reduce:transition-none ${motion === 'sliding' ? 'transition-colors' : 'transition-[background-color,color,box-shadow]'} ${activeHeightClass} ${selectedClass}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CompactSegmentedControl;
