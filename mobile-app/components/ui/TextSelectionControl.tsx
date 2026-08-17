import React from 'react';

export interface TextSelectionControlItem<TValue extends string> {
  value: TValue;
  label: React.ReactNode;
}

interface TextSelectionControlProps<TValue extends string> {
  value: TValue;
  items: ReadonlyArray<TextSelectionControlItem<TValue>>;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  fullWidth?: boolean;
  inactiveTone?: 'primary' | 'secondary';
  size?: 'body' | 'compact';
  className?: string;
  semantics?: 'tabs' | 'group';
}

const TextSelectionControl = <TValue extends string,>({
  value,
  items,
  onChange,
  ariaLabel,
  fullWidth = false,
  inactiveTone = 'secondary',
  size = 'body',
  className = '',
  semantics = 'tabs',
}: TextSelectionControlProps<TValue>) => (
  <div
    className={`${fullWidth ? 'grid w-full' : 'flex w-full overflow-x-auto no-scrollbar'} min-h-[var(--tm-selection-touch-height)] ${className}`}
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
          className={`min-h-[var(--tm-selection-touch-height)] ${fullWidth ? 'min-w-0 px-[var(--tm-space-1)]' : 'shrink-0 px-[var(--tm-space-3)]'} ${size === 'body' ? 'text-[length:var(--tm-font-size-body)]' : 'text-[length:var(--tm-font-size-meta)]'} transition-[color,transform] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none motion-reduce:active:scale-100 ${selected
            ? 'font-semibold text-[var(--tm-selection-text-active)]'
            : `font-medium ${inactiveTone === 'primary' ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-selection-text-inactive)]'}`}`}
        >
          {item.label}
        </button>
      );
    })}
  </div>
);

export default TextSelectionControl;
