import React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { phoneText, type PhoneTone } from '../../styles/phoneTokens';
import { IconBadge } from './IconBadge';

interface MenuItemProps {
  title: string;
  icon: LucideIcon;
  tone?: PhoneTone;
  description?: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  title,
  icon,
  tone = 'neutral',
  description,
  value,
  onClick,
  danger = false,
  disabled = false,
}) => {
  const interactive = Boolean(onClick) && !disabled;
  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-4 text-left">
        <IconBadge icon={icon} size="md" tone={danger ? 'danger' : tone} />
        <div className="min-w-0 flex-1">
          <span className={`block truncate ${phoneText.itemTitle} ${danger ? 'text-rose-600' : 'text-slate-900'}`}>{title}</span>
          {description && <p className={`mt-1.5 line-clamp-2 text-slate-400 ${phoneText.helper}`}>{description}</p>}
        </div>
      </div>
      <div className="ml-3 flex shrink-0 items-center gap-2">
        {value && <span className="max-w-[120px] truncate text-[15px] font-normal leading-snug text-slate-400">{value}</span>}
        {interactive && <ChevronRight className="h-5 w-5 text-slate-300" strokeWidth={2} />}
      </div>
    </>
  );

  const className = `flex min-h-[64px] w-full items-center justify-between px-5 py-4 transition-all ${
    disabled ? 'opacity-50' : interactive ? 'active:bg-slate-50 active:scale-[0.99]' : ''
  }`;

  if (interactive) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
};
