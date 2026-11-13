import React from 'react';

interface MobileTagProps {
    children: React.ReactNode;
    tone: 'brand' | 'secondary' | 'positive' | 'negative' | 'warning' | 'neutral' | 'blue' | 'jade' | 'gold' | 'orange';
    size?: 'badge' | 'meta';
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

export default function MobileTag({ children, tone, size = 'badge' }: MobileTagProps) {
    return (
        <span className={`inline-flex min-h-[var(--tm-tag-min-height)] items-center justify-center whitespace-nowrap rounded-[var(--tm-tag-radius)] px-[var(--tm-tag-padding-inline)] py-[var(--tm-tag-padding-block)] leading-[var(--tm-tag-line-height)] ${size === 'meta' ? 'text-[length:var(--tm-tag-font-size)]' : 'text-[length:var(--tm-font-size-badge)]'} ${toneClasses[tone]}`}>
            {children}
        </span>
    );
}
