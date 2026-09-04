import React from 'react';
import { Building2, ChevronDown, UserRound, UsersRound } from 'lucide-react';
import type { TeacherSpaceType } from '../domain/teacherSpaceAccess';

interface ClassSourceTriggerProps {
    name: string;
    type: TeacherSpaceType;
    onClick?: () => void;
    expanded?: boolean;
    className?: string;
    variant?: 'surface' | 'quiet';
    density?: 'default' | 'compact';
}

const SOURCE_ICONS = {
    personal: UserRound,
    collaboration: UsersRound,
    school: Building2,
} satisfies Record<TeacherSpaceType, typeof UserRound>;

export const ClassSourceIcon: React.FC<{
    type: TeacherSpaceType;
    className?: string;
    strokeWidth?: number;
}> = ({ type, className, strokeWidth = 2.2 }) => {
    const SourceIcon = SOURCE_ICONS[type];
    return <SourceIcon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
};

const ClassSourceTrigger: React.FC<ClassSourceTriggerProps> = ({
    name,
    type,
    onClick,
    expanded,
    className = '',
    variant = 'surface',
    density = 'default',
}) => {
    const isCompactSurface = variant === 'surface' && density === 'compact';
    const variantClass = variant === 'quiet'
        ? 'gap-1.5 rounded-[var(--tm-radius-control)] px-1 text-[13px] font-medium text-[var(--tm-text-secondary)] shadow-none active:bg-[var(--tm-bg-surface-muted)] active:text-[var(--tm-text-primary)]'
        : isCompactSurface
            ? 'group text-[13px] font-semibold text-[var(--tm-text-primary)]'
            : 'gap-2 rounded-full bg-[var(--tm-bg-surface-glass)] px-3.5 text-[13px] font-semibold text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-bg-surface-soft)]';

    const content = (
        <>
            <ClassSourceIcon type={type} className={`h-4 w-4 shrink-0 ${variant === 'quiet' ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--tm-brand-primary)]'}`} />
            <span className="min-w-0 truncate">{name}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--tm-text-disabled)]" strokeWidth={2.2} />
        </>
    );

    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex min-h-11 max-w-full items-center text-left transition-[transform,background-color,color] [transition-duration:var(--tm-duration-fast)] active:scale-[0.98] ${variantClass} ${className}`}
            aria-label={`切换班级来源，当前${name}`}
            aria-expanded={expanded}
        >
            {isCompactSurface ? (
                <span className="inline-flex h-9 max-w-full items-center gap-2 rounded-full bg-[var(--tm-bg-surface-glass)] px-3 [box-shadow:var(--tm-shadow-control)] group-active:bg-[var(--tm-bg-surface-soft)]">
                    {content}
                </span>
            ) : content}
        </button>
    );
};

export default ClassSourceTrigger;
