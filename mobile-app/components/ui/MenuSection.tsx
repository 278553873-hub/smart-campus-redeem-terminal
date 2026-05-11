import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { phoneText, type PhoneTone } from '../../styles/phoneTokens';
import { IconBadge } from './IconBadge';
import { MobileCard } from './MobileCard';

interface MenuSectionProps {
  title: string;
  icon: LucideIcon;
  tone?: PhoneTone;
  children: React.ReactNode;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ title, icon, tone = 'neutral', children }) => {
  return (
    <MobileCard variant="card" padding="none" className="overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <IconBadge icon={icon} size="md" tone={tone} />
        <h3 className={`${phoneText.sectionTitle} text-slate-900`}>{title}</h3>
      </div>
      <div className="mx-5 h-px bg-slate-100/80" />
      <div className="divide-y divide-slate-100/80">{children}</div>
    </MobileCard>
  );
};
