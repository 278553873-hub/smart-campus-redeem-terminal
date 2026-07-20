import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { phoneRadius, phoneTone, type PhoneTone } from '../../styles/teacherMobileTokens';

type IconBadgeSize = 'sm' | 'md' | 'lg' | 'xl';
type IconBadgeShape = 'rounded' | 'circle';

interface IconBadgeProps {
  icon: LucideIcon;
  size?: IconBadgeSize;
  tone?: PhoneTone;
  shape?: IconBadgeShape;
  className?: string;
}

const sizeClass: Record<IconBadgeSize, { box: string; icon: string; stroke: number }> = {
  sm: { box: 'h-8 w-8', icon: 'h-4 w-4', stroke: 2.1 },
  md: { box: 'h-10 w-10', icon: 'h-5 w-5', stroke: 2 },
  lg: { box: 'h-12 w-12', icon: 'h-6 w-6', stroke: 2 },
  xl: { box: 'h-14 w-14', icon: 'h-7 w-7', stroke: 1.9 },
};

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon: Icon,
  size = 'md',
  tone = 'neutral',
  shape = 'rounded',
  className = '',
}) => {
  const sizing = sizeClass[size];
  const radius = shape === 'circle' ? phoneRadius.full : size === 'sm' ? phoneRadius.md : phoneRadius.lg;

  return (
    <div className={`flex shrink-0 items-center justify-center border ${sizing.box} ${radius} ${phoneTone[tone].box} ${className}`}>
      <Icon className={sizing.icon} strokeWidth={sizing.stroke} />
    </div>
  );
};
