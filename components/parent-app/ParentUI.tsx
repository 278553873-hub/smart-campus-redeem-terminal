import React from 'react';
import { X } from 'lucide-react';
import {
  parentButtonTone,
  parentIconTone,
  parentRadius,
  parentShadow,
  parentSurface,
  parentText,
} from './ParentStyleTokens';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

interface ParentPageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const ParentPageShell: React.FC<ParentPageShellProps> = ({ children, className = '' }) => (
  <div className={cx('relative flex-1 overflow-y-auto no-scrollbar bg-transparent text-slate-800 antialiased', className)}>
    {children}
  </div>
);

interface ParentCardProps {
  as?: 'div' | 'section' | 'article';
  children: React.ReactNode;
  className?: string;
}

export const ParentCard: React.FC<ParentCardProps> = ({ as: Component = 'section', children, className = '' }) => (
  <Component className={cx(parentSurface.card, parentRadius.card, parentShadow.card, 'p-4 text-pretty', className)}>
    {children}
  </Component>
);

interface ParentGradientIconProps {
  children: React.ReactNode;
  tone?: keyof typeof parentIconTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const parentGradientIconSize = {
  sm: 'h-[30px] w-[30px] rounded-[10px]',
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
        'inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[18px]',
        'bg-gradient-to-br from-[#8FD7FF] to-[#BCEFFF] text-[18px] font-black text-white',
        'shadow-[0_14px_26px_-20px_rgba(13,180,241,0.66)]',
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
};

const parentButtonBase =
  'inline-flex min-h-11 items-center justify-center gap-2 px-4 text-[14px] font-black transition-[transform,background-color,box-shadow,opacity] duration-150 ease-out active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

export const ParentPrimaryButton: React.FC<ParentButtonProps> = ({
  children,
  className = '',
  fullWidth = false,
  tone = 'primary',
  type = 'button',
  ...buttonProps
}) => (
  <button
    type={type}
    className={cx(parentButtonBase, parentRadius.button, parentButtonTone[tone], fullWidth && 'w-full', className)}
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
  type = 'button',
  ...buttonProps
}) => (
  <button
    type={type}
    className={cx(parentButtonBase, parentRadius.button, parentButtonTone[tone], fullWidth && 'w-full', className)}
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
  <div className="absolute inset-0 z-50 flex items-end bg-slate-900/18 backdrop-blur-[2px]" onClick={onClose}>
    <section
      className={cx('w-full border border-white/90 bg-white px-5 pb-6 pt-4', parentRadius.sheet, parentShadow.sheet, className)}
      role="dialog"
      onClick={event => event.stopPropagation()}
      aria-modal="true"
      aria-labelledby="parent-bottom-sheet-title"
    >
      <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-slate-200" aria-hidden="true" />
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="parent-bottom-sheet-title" className={cx('text-[17px] font-black text-balance', parentText.title)}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-[transform,background-color] duration-150 ease-out active:scale-[0.96]"
          aria-label="关闭"
        >
          <X size={18} strokeWidth={2.6} />
        </button>
      </div>
      {children}
    </section>
  </div>
);
