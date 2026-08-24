import React from 'react';

export interface MobileSlidingSegmentedControlItem<TValue extends string> {
  value: TValue;
  label: React.ReactNode;
  indicatorClassName: string;
  activeTextClassName: string;
}

interface MobileSlidingSegmentedControlProps<TValue extends string> {
  value: TValue;
  items: ReadonlyArray<MobileSlidingSegmentedControlItem<TValue>>;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  className: string;
  semantics?: 'tabs' | 'group';
}

const MobileSlidingSegmentedControl = <TValue extends string,>({
  value,
  items,
  onChange,
  ariaLabel,
  className,
  semantics = 'tabs',
}: MobileSlidingSegmentedControlProps<TValue>) => {
  const selectedIndex = Math.max(0, items.findIndex(item => item.value === value));
  const selectedItem = items[selectedIndex];

  return (
    <div
      className={`relative flex h-[var(--mini-program-title-bar-height,44px)] items-center ${className}`}
      role={semantics === 'tabs' ? 'tablist' : 'group'}
      aria-label={ariaLabel}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[var(--tm-record-scope-visual-height)] -translate-y-1/2 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-glass)] [box-shadow:var(--tm-shadow-control)]"
        aria-hidden="true"
      />
      <div
        data-sliding-indicator
        className={`pointer-events-none absolute left-0.5 top-1/2 z-[1] h-8 rounded-[var(--tm-radius-control)] ${selectedItem?.indicatorClassName ?? ''} transition-[transform,background-color] [transition-duration:220ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none`}
        style={{
          width: `calc((100% - 4px) / ${items.length})`,
          transform: `translate3d(${selectedIndex * 100}%, -50%, 0)`,
        }}
        aria-hidden="true"
      />
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
            className="relative z-10 flex h-[var(--tm-size-touch)] min-w-0 flex-1 items-center justify-center px-0.5 text-[14px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
          >
            <span className={`relative z-10 flex h-8 w-full items-center justify-center rounded-[var(--tm-radius-control)] transition-colors [transition-duration:160ms] motion-reduce:transition-none ${selected ? item.activeTextClassName : 'text-[var(--tm-text-secondary)]'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileSlidingSegmentedControl;
