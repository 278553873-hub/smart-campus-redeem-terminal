import React from 'react';

interface MobileTagProps {
    children: React.ReactNode;
    tone: 'brand' | 'secondary';
}

const toneClasses = {
    brand: 'bg-[var(--tm-brand-primary-soft)] font-semibold text-[var(--tm-brand-primary)]',
    secondary: 'bg-[var(--tm-brand-secondary-soft)] tm-font-regular text-[var(--tm-brand-secondary)]',
};

export default function MobileTag({ children, tone }: MobileTagProps) {
    return (
        <span className={`inline-flex min-h-5 items-center justify-center whitespace-nowrap rounded-[4px] px-2 py-0.5 text-[11px] leading-4 ${toneClasses[tone]}`}>
            {children}
        </span>
    );
}
