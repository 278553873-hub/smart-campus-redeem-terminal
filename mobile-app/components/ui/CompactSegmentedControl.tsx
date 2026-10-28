import React from 'react';

export interface CompactSegmentedControlItem<TValue extends string> {
  value: TValue;
  label: React.ReactNode;
  weight?: number;
}

interface CompactSegmentedControlProps<TValue extends string> {
  value: TValue;
  items: ReadonlyArray<CompactSegmentedControlItem<TValue>>;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  fullWidth?: boolean;
  sizing?: 'equal' | 'content';
  className?: string;
  semantics?: 'tabs' | 'group';
  density?: 'default' | 'compact';
  motion?: 'static' | 'sliding';
  variant?: 'default' | 'settings';
  shape?: 'default' | 'subtle';
  disabled?: boolean;
}

const CompactSegmentedControl = <TValue extends string,>({
  value,
  items,
  onChange,
  ariaLabel,
  fullWidth = false,
  sizing = 'equal',
  className = '',
  semantics = 'tabs',
  density = 'default',
  motion = 'static',
  variant = 'default',
  shape = 'default',
  disabled = false,
}: CompactSegmentedControlProps<TValue>) => {
  const contentSizing = sizing === 'content';
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = React.useState<{ width: number; left: number } | null>(null);
  React.useEffect(() => {
    if (!contentSizing) return;
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button'));
      const button = buttons[items.findIndex(item => item.value === value)];
      if (!button) return;
      // 滑块使用容器内的布局坐标；屏幕坐标会包含手机预览的祖先缩放。
      setIndicator({ width: button.offsetWidth, left: button.offsetLeft });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [contentSizing, value, items]);
  const selectedIndex = Math.max(0, items.findIndex(item => item.value === value));
  const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  const selectedWeight = items[selectedIndex]?.weight ?? 1;
  const precedingWeight = items.slice(0, selectedIndex).reduce((sum, item) => sum + (item.weight ?? 1), 0);
  const settingsVariant = variant === 'settings';
  const compact = !settingsVariant && density === 'compact';
  const subtleShape = shape === 'subtle';
  const trackRadiusStyle = subtleShape ? { borderRadius: 'var(--tm-form-control-radius)' } : undefined;
  const activeRadiusStyle = subtleShape ? {
    borderRadius: compact
      ? 'var(--tm-form-segment-compact-active-radius)'
      : 'var(--tm-form-segment-active-radius)',
  } : undefined;
  const effectiveMotion = settingsVariant ? 'sliding' : motion;
  const settingsWidth = settingsVariant
    ? items.length > 0
      ? `calc(var(--tm-selection-segment-settings-item-width) * ${items.length})`
      : undefined
    : undefined;
  const activeHeightClass = compact
    ? 'h-[var(--tm-selection-segment-compact-active-height)]'
    : 'h-[var(--tm-selection-segment-visible-height)]';
  const motionInsetClass = compact
    ? 'px-[var(--tm-selection-segment-compact-inset)]'
    : 'px-[var(--tm-space-1)]';

  return (
    <div
      ref={rootRef}
      className={`${fullWidth ? 'grid w-full' : 'inline-grid'} relative h-[var(--tm-selection-touch-height)] items-center ${compact ? 'text-[length:var(--tm-selection-segment-compact-font-size)]' : 'text-[length:var(--tm-font-size-body)]'} ${contentSizing ? 'px-[var(--tm-space-1)]' : ''} ${className}`}
      style={{
        gridTemplateColumns: contentSizing ? `repeat(${items.length}, max-content)` : items.map(item => `minmax(0, ${item.weight ?? 1}fr)`).join(' '),
        width: contentSizing ? 'max-content' : fullWidth ? undefined : settingsWidth,
      }}
      role={semantics === 'tabs' ? 'tablist' : 'group'}
      aria-label={ariaLabel}
    >
      <span
        aria-hidden="true"
        style={trackRadiusStyle}
        className={`pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 ${compact ? 'h-[var(--tm-selection-segment-compact-track-height)] rounded-[var(--tm-selection-segment-compact-track-radius)] bg-[var(--tm-selection-segment-track-bg)]' : 'h-[var(--tm-selection-touch-height)] rounded-[var(--tm-selection-segment-track-radius)] bg-[var(--tm-selection-segment-track-bg)]'}`}
      />
      {effectiveMotion === 'sliding' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2"
        >
          <span
            data-sliding-indicator
            className={`block transition-[transform,width] [transition-duration:var(--tm-selection-segment-slide-duration)] [transition-timing-function:var(--tm-selection-segment-slide-easing)] motion-reduce:transition-none ${activeHeightClass}`}
            style={{
              width: contentSizing && indicator ? indicator.width : `${100 * selectedWeight / Math.max(totalWeight, 1)}%`,
              transform: contentSizing && indicator ? `translate3d(${indicator.left}px, 0, 0)` : `translate3d(${100 * precedingWeight / selectedWeight}%, 0, 0)`,
            }}
          >
            <span
              style={activeRadiusStyle}
              className={`block h-full bg-[var(--tm-selection-segment-active-bg)] [box-shadow:var(--tm-selection-segment-active-shadow)] ${contentSizing ? 'rounded-[var(--tm-selection-segment-active-radius)]' : compact ? 'mx-[var(--tm-selection-segment-compact-inset)] rounded-[var(--tm-selection-segment-compact-active-radius)]' : 'mx-[var(--tm-space-1)] rounded-[var(--tm-selection-segment-active-radius)]'}`}
            />
          </span>
        </span>
      )}
      {items.map(item => {
        const selected = item.value === value;
        const selectedClass = effectiveMotion === 'sliding'
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
            disabled={disabled}
            onClick={() => !disabled && onChange(item.value)}
            className={`${fullWidth || settingsVariant ? 'min-w-0' : 'min-w-[72px]'} relative z-10 flex min-h-[var(--tm-selection-touch-height)] items-center justify-center font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] ${disabled ? 'cursor-not-allowed opacity-75' : ''} ${contentSizing ? 'px-0' : effectiveMotion === 'sliding' ? motionInsetClass : (compact ? 'px-[var(--tm-selection-segment-compact-inset)] py-0' : 'p-[var(--tm-space-1)]')}`}
          >
            <span style={activeRadiusStyle} className={`relative z-10 flex w-full items-center justify-center ${contentSizing ? 'whitespace-nowrap px-[var(--tm-space-3)]' : settingsVariant ? 'whitespace-nowrap px-[var(--tm-space-1)]' : 'px-[var(--tm-space-2)]'} [transition-duration:var(--tm-duration-fast)] motion-reduce:transition-none ${compact ? 'rounded-[var(--tm-selection-segment-compact-active-radius)]' : 'rounded-[var(--tm-radius-control)]'} ${effectiveMotion === 'sliding' ? 'transition-colors' : 'transition-[background-color,color,box-shadow]'} ${activeHeightClass} ${selectedClass}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CompactSegmentedControl;
