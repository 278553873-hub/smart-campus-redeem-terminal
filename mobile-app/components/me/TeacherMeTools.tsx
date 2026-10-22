import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface MenuEntry<TId extends string = string> {
    id: TId;
    title: string;
    labelLines?: readonly string[];
    icon?: LucideIcon;
    imageSrc?: string;
    imageAlt?: string;
    imageClassName?: string;
    imageBadgeSrc?: string;
    imageBadgeAlt?: string;
    onClick?: () => void;
    plainImage?: boolean;
}

interface ToolSectionProps {
    title: string;
    children: React.ReactNode;
}

const secondaryIconClass = 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]';

const toolCardSurfaceClass = 'bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card-ambient)]';

export const ToolSection: React.FC<ToolSectionProps> = ({ title, children }) => (
    <section className={`relative overflow-hidden rounded-[var(--tm-radius-card-compact)] p-4 ${toolCardSurfaceClass}`}>
        <h3 className="flex items-center gap-3 text-[17px] font-bold leading-snug text-[var(--tm-text-primary)]">
            <span className="h-7 w-1.5 rounded-full bg-[var(--tm-brand-primary)]" aria-hidden="true" />
            {title}
        </h3>
        {children}
    </section>
);

export const ToolGrid: React.FC<{ items: MenuEntry[]; columns?: 2 | 3 | 4; variant?: 'primary' | 'secondary' }> = ({ items, columns = 4, variant = 'primary' }) => (
    <div className={`mt-4 grid ${columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-x-3 ${variant === 'secondary' ? 'gap-y-3' : 'gap-y-4'} mb-[var(--tm-space-1)]`}>
        {items.map(item => {
            const Icon = item.icon;
            const isSecondary = variant === 'secondary';
            return (
                <button
                    key={item.id}
                    type="button"
                    aria-label={item.title}
                    onClick={item.onClick}
                    className={`${isSecondary ? 'min-h-[72px]' : 'min-h-[82px]'} group flex flex-col items-center justify-start gap-2 rounded-[var(--tm-radius-control-compact)] py-1 text-center`}
                >
                    {item.imageSrc ? (
                        <span className="relative flex h-12 w-12 items-center justify-center overflow-visible rounded-[var(--tm-radius-inner)]">
                            {item.plainImage ? (
                                <img
                                    src={item.imageSrc}
                                    alt={item.imageAlt ?? item.title}
                                    className={item.imageClassName ?? 'h-12 w-12 rounded-[var(--tm-radius-inner)] object-cover [box-shadow:var(--tm-shadow-icon)]'}
                                />
                            ) : (
                                <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[var(--tm-radius-inner)] bg-[linear-gradient(145deg,var(--tm-brand-primary-soft),var(--tm-brand-secondary-soft))] [box-shadow:var(--tm-shadow-icon)] ring-1 ring-[var(--tm-brand-primary-soft-strong)]">
                                    <img src={item.imageSrc} alt={item.imageAlt ?? item.title} className={item.imageClassName ?? 'relative h-11 w-11 object-contain'} />
                                </span>
                            )}
                            {item.imageBadgeSrc && (
                                <img
                                    src={item.imageBadgeSrc}
                                    alt={item.imageBadgeAlt ?? ''}
                                    className="pointer-events-none absolute -bottom-1 -right-2 h-6 w-6 object-contain"
                                />
                            )}
                        </span>
                    ) : isSecondary && Icon ? (
                        <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-full ${secondaryIconClass}`}>
                            <Icon className="h-[19px] w-[19px]" strokeWidth={2.35} />
                        </span>
                    ) : Icon ? (
                        <span className={`relative flex h-12 w-12 items-center justify-center rounded-[var(--tm-radius-control-compact)] ${secondaryIconClass}`}>
                            <Icon className="relative h-[23px] w-[23px]" strokeWidth={2.15} />
                        </span>
                    ) : (
                        null
                    )}
                    <span className={`max-w-[72px] whitespace-nowrap text-[12px] [font-weight:var(--tm-font-weight-minimum)] leading-[18px] text-[var(--tm-text-primary)]`}>
                        {item.labelLines?.map(line => <span key={line} className="block">{line}</span>) ?? item.title}
                    </span>
                </button>
            );
        })}
    </div>
);
