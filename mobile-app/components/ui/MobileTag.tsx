import React from 'react';

interface MobileTagProps {
    children: React.ReactNode;
    tone: 'brand' | 'secondary' | 'positive' | 'negative' | 'warning' | 'neutral' | 'blue' | 'jade' | 'gold' | 'orange';
    size?: 'badge' | 'meta';
    emphasis?: 'soft' | 'solid';
}

const toneClasses = {
    blue: 'bg-[var(--tm-tag-blue-soft)] tm-font-regular text-[var(--tm-tag-blue-strong)]',
    jade: 'bg-[var(--tm-tag-jade-soft)] tm-font-regular text-[var(--tm-tag-jade-strong)]',
    gold: 'bg-[var(--tm-tag-gold-soft)] tm-font-regular text-[var(--tm-tag-gold-strong)]',
    orange: 'bg-[var(--tm-tag-orange-soft)] tm-font-regular text-[var(--tm-tag-orange-strong)]',
    brand: 'bg-[var(--tm-brand-primary-soft)] font-semibold text-[var(--tm-brand-primary)]',
    secondary: 'bg-[var(--tm-brand-secondary-soft)] tm-font-regular text-[var(--tm-brand-secondary)]',
    positive: 'bg-[var(--tm-status-positive-soft)] tm-font-regular text-[var(--tm-status-positive-strong)]',
    negative: 'bg-[var(--tm-status-negative-soft)] tm-font-regular text-[var(--tm-status-negative-strong)]',
    warning: 'bg-[var(--tm-tag-orange-soft)] tm-font-regular text-[var(--tm-tag-orange-strong)]',
    neutral: 'bg-[var(--tm-bg-surface-muted)] tm-font-regular text-[var(--tm-text-secondary)]',
};

const solidToneClasses: Record<MobileTagProps['tone'], string> = {
    brand: 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]',
    secondary: 'bg-[var(--tm-brand-secondary-strong)] text-[var(--tm-text-inverse)]',
    positive: 'bg-[var(--tm-status-positive-strong)] text-[var(--tm-text-inverse)]',
    negative: 'bg-[var(--tm-status-negative-strong)] text-[var(--tm-text-inverse)]',
    warning: 'bg-[var(--tm-tag-orange-strong)] text-[var(--tm-text-inverse)]',
    neutral: 'bg-[var(--tm-text-secondary)] text-[var(--tm-text-inverse)]',
    blue: 'bg-[var(--tm-tag-blue-strong)] text-[var(--tm-text-inverse)]',
    jade: 'bg-[var(--tm-tag-jade-strong)] text-[var(--tm-text-inverse)]',
    gold: 'bg-[var(--tm-tag-gold-strong)] text-[var(--tm-text-inverse)]',
    orange: 'bg-[var(--tm-tag-orange-strong)] text-[var(--tm-text-inverse)]',
};

export default function MobileTag({ children, tone, size = 'badge', emphasis = 'soft' }: MobileTagProps) {
    return (
        <span className={`inline-flex min-h-[var(--tm-tag-min-height)] items-center justify-center whitespace-nowrap rounded-[var(--tm-tag-radius)] px-[var(--tm-tag-padding-inline)] py-[var(--tm-tag-padding-block)] leading-[var(--tm-tag-line-height)] ${size === 'meta' ? 'text-[length:var(--tm-tag-font-size)]' : 'text-[length:var(--tm-font-size-badge)]'} ${emphasis === 'solid' ? `font-semibold ${solidToneClasses[tone]}` : toneClasses[tone]}`}>
            {children}
        </span>
    );
}
