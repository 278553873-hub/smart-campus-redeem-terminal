import React, { useEffect, useRef } from 'react';

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
  variant?: 'text' | 'underline' | 'page' | 'card';
  panelId?: string;
  className?: string;
  semantics?: 'tabs' | 'group';
  static?: boolean;
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
  panelId,
  className = '',
  semantics = 'tabs',
  static: isStatic = false,
}: TextSelectionControlProps<TValue>) => {
  const isPage = variant === 'page';
  const isCard = variant === 'card';
  const hasUnderline = isPage || variant === 'underline';
  const usesArrowKeys = semantics === 'tabs' && (hasUnderline || isCard);
  const equalWidth = isPage || isCard || fullWidth;
  const tabListRef = useRef<HTMLDivElement>(null);
  const layout = isPage
    ? 'relative grid h-[var(--tm-selection-touch-height)] w-full shrink-0 overflow-x-auto no-scrollbar bg-[var(--tm-page-plain-header-bg)]'
    : equalWidth ? 'grid w-full' : 'flex w-full overflow-x-auto no-scrollbar';
  const itemLayout = isPage
    ? 'relative flex min-w-[var(--tm-selection-touch-height)] items-center justify-center whitespace-nowrap px-[var(--tm-space-1)] focus-visible:ring-inset'
    : isCard
      ? 'relative isolate flex min-w-0 items-center justify-center focus-visible:ring-inset'
      : hasUnderline
      ? `relative ${fullWidth ? 'min-w-0' : 'shrink-0'} px-0 pb-[var(--tm-space-2)] focus-visible:ring-inset`
      : fullWidth ? 'min-w-0 px-[var(--tm-space-1)]' : 'shrink-0 px-[var(--tm-space-3)]';
  const fontSize = isPage || size === 'body' ? 'text-[length:var(--tm-font-size-body)]'
    : size === 'section' ? 'text-[length:var(--tm-font-size-section-title)]' : 'text-[length:var(--tm-font-size-meta)]';
  const transition = isPage || isCard || isStatic ? 'transition-colors' : 'transition-[color,transform] active:scale-[0.96] motion-reduce:active:scale-100';

  useEffect(() => {
    const tabList = tabListRef.current;
    if (!tabList || tabList.scrollWidth <= tabList.clientWidth) return;
    const selected = tabList.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    if (!selected) return;
    const left = selected.offsetLeft;
    const right = left + selected.offsetWidth;
    if (left < tabList.scrollLeft) tabList.scrollLeft = left;
    else if (right > tabList.scrollLeft + tabList.clientWidth) tabList.scrollLeft = right - tabList.clientWidth;
  }, [isPage, items.length, value]);

  return (
    <div
      ref={isPage ? tabListRef : undefined}
      className={`${layout} ${hasUnderline && !equalWidth ? 'gap-[var(--tm-space-8)]' : ''} min-h-[var(--tm-selection-touch-height)] ${className}`}
      style={equalWidth ? { gridTemplateColumns: `repeat(${items.length}, minmax(${isPage ? 'max-content' : '0'}, 1fr))` } : undefined}
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
            aria-controls={semantics === 'tabs' ? panelId : undefined}
            tabIndex={usesArrowKeys ? (selected ? 0 : -1) : undefined}
            onClick={() => onChange(item.value)}
            onKeyDown={event => {
              if (!usesArrowKeys) return;
              const index = items.findIndex(option => option.value === item.value);
              const next = event.key === 'ArrowRight' ? (index + 1) % items.length : event.key === 'ArrowLeft' ? (index - 1 + items.length) % items.length : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : undefined;
              if (next === undefined) return;
              event.preventDefault();
              onChange(items[next].value);
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
            }}
            className={`min-h-[var(--tm-selection-touch-height)] ${itemLayout} ${fontSize} ${transition} [transition-duration:var(--tm-duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none ${(hasUnderline || isCard)
              ? (selected ? '[font-weight:var(--tm-font-weight-bold)] text-[var(--tm-text-primary)]' : '[font-weight:var(--tm-font-weight-regular)] text-[var(--tm-text-secondary)]')
              : selected
              ? 'font-semibold text-[var(--tm-selection-text-active)]'
              : `font-medium ${inactiveTone === 'primary' ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-selection-text-inactive)]'}`}`}
          >
            {item.label}
            {hasUnderline && <span aria-hidden="true" className={`pointer-events-none absolute bottom-0 left-1/2 h-[var(--tm-selection-underline-height)] w-[var(--tm-selection-underline-width)] -translate-x-1/2 rounded-full bg-[var(--tm-brand-primary)] ${selected ? 'opacity-100' : 'opacity-0'}`} />}
          </button>
        );
      })}
    </div>
  );
};

export default TextSelectionControl;
