import React from 'react';
import { ChevronLeft, X } from 'lucide-react';
import CompactSegmentedControl, { type CompactSegmentedControlItem } from '../../mobile-app/components/ui/CompactSegmentedControl';
import {
  parentButtonTone,
  parentIconTone,
  parentRadius,
  parentShadow,
  parentSurface,
  parentText,
  parentTypography,
} from './ParentStyleTokens';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

/** 普通子页标题栏，与正文滚动区分开挂载。 */
export const ParentPageHeader = ({ title, onBack, backLabel = '返回' }: {
  title: string;
  onBack: () => void;
  backLabel?: string;
}) => (
  <header className="relative flex h-[var(--pm-size-touch)] shrink-0 items-center bg-[var(--pm-page-plain-header-bg)] px-[var(--pm-space-4)]">
    <button type="button" onClick={onBack} aria-label={backLabel}
      className="-ml-[var(--pm-space-2)] flex h-[var(--pm-size-touch)] w-[var(--pm-size-touch)] shrink-0 items-center justify-center rounded-[var(--pm-radius-control-compact)] text-[var(--pm-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pm-focus-ring)]">
      <ChevronLeft className="h-[var(--pm-space-5)] w-[var(--pm-space-5)]" aria-hidden="true" />
    </button>
    <h1 className="pointer-events-none absolute inset-x-[calc(var(--pm-size-touch)+var(--pm-space-4))] truncate text-center text-[length:var(--pm-font-size-nav-title)] font-[var(--pm-font-weight-bold)] text-[var(--pm-text-primary)]">{title}</h1>
  </header>
);

interface ParentPageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const ParentPageShell: React.FC<ParentPageShellProps> = ({ children, className = '' }) => (
  <div className={cx('relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain no-scrollbar bg-transparent text-[var(--pm-text-primary)] antialiased', parentTypography.body, className)}>
    {children}
  </div>
);

interface ParentCardProps {
  as?: 'div' | 'section' | 'article';
  children: React.ReactNode;
  className?: string;
  shape?: 'default' | 'subtle';
}

export const ParentCard: React.FC<ParentCardProps> = ({ as: Component = 'section', children, className = '', shape = 'default' }) => (
  <Component className={cx(parentSurface.card, shape === 'subtle' ? 'rounded-[var(--pm-radius-card-compact)] [box-shadow:var(--pm-content-card-shadow)]' : cx(parentRadius.card, parentShadow.card), 'min-w-0 p-4 text-pretty', className)}>
    {children}
  </Component>
);

/** 与教师问卷采集共用滑块实现；组件必须在父页面更新时保持挂载。 */
export const ParentSegmentedControl = <TValue extends string,>({ value, items, onChange, ariaLabel }: {
  value: TValue;
  items: ReadonlyArray<CompactSegmentedControlItem<TValue>>;
  onChange: (value: TValue) => void;
  ariaLabel: string;
}) => (
  <div
    style={{ '--tm-selection-segment-active-shadow': 'var(--pm-content-control-shadow)' } as React.CSSProperties}
    onKeyDown={event => {
      const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!offset && event.key !== 'Home' && event.key !== 'End') return;
      const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
      const current = buttons.indexOf(event.target as HTMLButtonElement);
      if (current < 0 || items.length === 0) return;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + offset + items.length) % items.length;
      event.preventDefault();
      onChange(items[next].value);
      buttons[next]?.focus({ preventScroll: true });
    }}
  >
    <CompactSegmentedControl shape="subtle" motion="sliding" value={value} items={items} onChange={onChange} ariaLabel={ariaLabel} fullWidth className="!text-[length:var(--pm-font-size-compact)]" />
  </div>
);

export const ParentUnderlineTabs = <TValue extends string,>({ value, items, onChange, ariaLabel }: {
  value: TValue;
  items: ReadonlyArray<CompactSegmentedControlItem<TValue>>;
  onChange: (value: TValue) => void;
  ariaLabel: string;
}) => (
  <div className="relative flex min-h-[var(--pm-size-touch)] border-b border-[var(--pm-border-subtle)]" role="group" aria-label={ariaLabel}>
    {items.map(item => <button key={item.value} type="button" aria-pressed={value === item.value} onClick={() => onChange(item.value)}
      className={`min-h-[var(--pm-size-touch)] min-w-0 flex-1 px-2 text-[length:var(--pm-font-size-body)] transition-colors [transition-duration:var(--pm-duration-fast)] motion-reduce:transition-none ${value === item.value ? 'font-semibold text-[var(--pm-selection-text-active)]' : 'font-medium text-[var(--pm-selection-text-inactive)]'}`}>
      {item.label}
    </button>)}
    <span aria-hidden="true" className="pointer-events-none absolute -bottom-px left-0 flex justify-center transition-transform [transition-duration:var(--pm-selection-segment-slide-duration)] [transition-timing-function:var(--pm-selection-segment-slide-easing)] motion-reduce:transition-none"
      style={{ width: `${100 / Math.max(items.length, 1)}%`, transform: `translateX(${Math.max(0, items.findIndex(item => item.value === value)) * 100}%)` }}>
      <span className="h-[var(--pm-selection-underline-height)] w-[var(--pm-selection-underline-width)] rounded-full bg-[var(--pm-brand-primary)]" />
    </span>
  </div>
);

interface ParentGradientIconProps {
  children: React.ReactNode;
  tone?: keyof typeof parentIconTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const parentGradientIconSize = {
  sm: 'h-[30px] w-[30px]',
  md: 'h-[42px] w-[42px]',
  lg: 'h-[50px] w-[50px]',
} as const;

export const ParentGradientIcon: React.FC<ParentGradientIconProps> = ({
  children,
  tone = 'blue',
  size = 'md',
  className = '',
}) => (
  <span
    className={cx(
      'inline-flex shrink-0 items-center justify-center',
      size === 'sm' ? parentRadius.iconSmall : parentRadius.icon,
      parentGradientIconSize[size],
      parentIconTone[tone],
      className,
    )}
    aria-hidden="true"
  >
    {children}
  </span>
);

interface ParentChildAvatarProps {
  name: string;
  src?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
}

export const ParentChildAvatar: React.FC<ParentChildAvatarProps> = ({
  name,
  src,
  alt,
  className = '',
  imageClassName = '',
}) => {
  const fallbackText = name.trim().charAt(0) || '孩';
  const imageAlt = alt ?? `${name || '孩子'}头像`;

  return (
    <span
      className={cx(
        'inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--pm-radius-inner)]',
        'bg-[var(--pm-icon-soft-blue-gradient)] text-[18px] font-[var(--pm-font-weight-bold)] text-[var(--pm-brand-primary-strong)]',
        '[box-shadow:var(--pm-shadow-control)]',
        className,
      )}
      aria-label={imageAlt}
    >
      {src ? (
        <img
          src={src}
          alt={imageAlt}
          className={cx('h-full w-full object-cover outline outline-1 -outline-offset-1 outline-black/10', imageClassName)}
        />
      ) : (
        fallbackText
      )}
    </span>
  );
};

type ParentButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  tone?: keyof typeof parentButtonTone;
  shape?: 'default' | 'subtle';
};

const parentButtonBase =
  'inline-flex min-h-[var(--pm-size-touch)] items-center justify-center gap-2 px-4 text-[length:var(--pm-font-size-body)] font-[var(--pm-font-weight-semibold)] transition-[transform,background-color,box-shadow,opacity] [transition-duration:var(--pm-duration-fast)] ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

export const ParentPrimaryButton: React.FC<ParentButtonProps> = ({
  children,
  className = '',
  fullWidth = false,
  tone = 'primary',
  shape = 'default',
  type = 'button',
  ...buttonProps
}) => (
  <button
    type={type}
    className={cx(parentButtonBase, shape === 'subtle' ? 'rounded-[var(--pm-radius-control-compact)]' : parentRadius.button, parentButtonTone[tone], fullWidth && 'w-full', className)}
    {...buttonProps}
  >
    {children}
  </button>
);

export const ParentSecondaryButton: React.FC<ParentButtonProps> = ({
  children,
  className = '',
  fullWidth = false,
  tone = 'secondary',
  shape = 'default',
  type = 'button',
  ...buttonProps
}) => (
  <button
    type={type}
    className={cx(parentButtonBase, shape === 'subtle' ? 'rounded-[var(--pm-radius-control-compact)]' : parentRadius.button, parentButtonTone[tone], fullWidth && 'w-full', className)}
    {...buttonProps}
  >
    {children}
  </button>
);

interface ParentBottomSheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ParentBottomSheet: React.FC<ParentBottomSheetProps> = ({
  title,
  onClose,
  children,
  className = '',
}) => (
  <div className="absolute inset-0 z-50 flex items-end bg-[var(--pm-mask)] backdrop-blur-[2px]" onClick={onClose}>
    <section
      className={cx('w-full bg-[var(--pm-bg-surface)] px-5 pb-6 pt-4', parentRadius.sheet, parentShadow.sheet, className)}
      role="dialog"
      onClick={event => event.stopPropagation()}
      aria-modal="true"
      aria-labelledby="parent-bottom-sheet-title"
    >
      <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[var(--pm-border-control)]" aria-hidden="true" />
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="parent-bottom-sheet-title" className={cx(parentTypography.sectionTitle, 'text-balance', parentText.title)}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--pm-bg-surface-muted)] text-[var(--pm-text-secondary)] transition-[transform,background-color] [transition-duration:var(--pm-duration-fast)] ease-out active:scale-[0.98]"
          aria-label="关闭"
        >
          <X size={18} strokeWidth={2.6} />
        </button>
      </div>
      {children}
    </section>
  </div>
);
