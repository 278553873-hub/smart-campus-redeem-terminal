import React from 'react';
import { phoneRadius, phoneShadow } from '../../styles/teacherMobileTokens';

type MobileCardVariant = 'flat' | 'card' | 'raised' | 'hero' | 'ai' | 'metric';
type MobileCardPadding = 'none' | 'sm' | 'md' | 'lg';

interface MobileCardProps {
  children: React.ReactNode;
  variant?: MobileCardVariant;
  padding?: MobileCardPadding;
  className?: string;
}

const variantClass: Record<MobileCardVariant, string> = {
  flat: `bg-white ${phoneRadius.lg} ${phoneShadow.none}`,
  card: `bg-white ${phoneRadius.xl} ${phoneShadow.card}`,
  raised: `bg-white ${phoneRadius.xl} ${phoneShadow.raised}`,
  hero: `bg-white ${phoneRadius.sheet} ${phoneShadow.raised}`,
  ai: `bg-white ${phoneRadius.xl} ${phoneShadow.raised} border border-[var(--tm-brand-primary-soft-strong)]`,
  metric: `bg-white ${phoneRadius.xl} ${phoneShadow.card}`,
};

const paddingClass: Record<MobileCardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  variant = 'card',
  padding = 'md',
  className = '',
}) => {
  return <div className={`${variantClass[variant]} ${paddingClass[padding]} ${className}`}>{children}</div>;
};
