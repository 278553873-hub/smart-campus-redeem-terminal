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
  size?: 'body' | 'compact' | 'section';
  variant?: 'text' | 'underline';
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
  variant = 'text',
  className = '',
  semantics = 'tabs',
}: TextSelectionControlProps<TValue>) => (
  <div
    className={`${fullWidth ? 'grid w-full' : 'flex w-full overflow-x-auto no-scrollbar'} ${variant === 'underline' && !fullWidth ? 'gap-[var(--tm-space-8)]' : ''} min-h-[var(--tm-selection-touch-height)] ${className}`}
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
          tabIndex={variant === 'underline' && semantics === 'tabs' ? (selected ? 0 : -1) : undefined}
          onClick={() => onChange(item.value)}
          onKeyDown={event => {
            if (variant !== 'underline' || semantics !== 'tabs') return;
            const index = items.findIndex(option => option.value === item.value);
            const next = event.key === 'ArrowRight' ? (index + 1) % items.length : event.key === 'ArrowLeft' ? (index - 1 + items.length) % items.length : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : undefined;
            if (next === undefined) return;
            event.preventDefault();
            onChange(items[next].value);
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
          }}
          className={`min-h-[var(--tm-selection-touch-height)] ${variant === 'underline' ? `relative ${fullWidth ? 'min-w-0' : 'shrink-0'} px-0 pb-[var(--tm-space-2)] focus-visible:ring-inset` : fullWidth ? 'min-w-0 px-[var(--tm-space-1)]' : 'shrink-0 px-[var(--tm-space-3)]'} ${size === 'section' ? 'text-[length:var(--tm-font-size-section-title)]' : size === 'body' ? 'text-[length:var(--tm-font-size-body)]' : 'text-[length:var(--tm-font-size-meta)]'} transition-[color,transform] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none motion-reduce:active:scale-100 ${variant === 'underline'
            ? (selected ? 'font-bold text-[var(--tm-text-primary)]' : 'font-medium text-[var(--tm-text-secondary)]')
            : selected
            ? 'font-semibold text-[var(--tm-selection-text-active)]'
            : `font-medium ${inactiveTone === 'primary' ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-selection-text-inactive)]'}`}`}
        >
          {item.label}
          {variant === 'underline' && <span aria-hidden="true" className={`pointer-events-none absolute bottom-0 left-1/2 h-[var(--tm-selection-underline-height)] w-[var(--tm-selection-underline-width)] -translate-x-1/2 rounded-full bg-[var(--tm-brand-primary)] ${selected ? 'opacity-100' : 'opacity-0'}`} />}
        </button>
      );
    })}
  </div>
);

export default TextSelectionControl;
