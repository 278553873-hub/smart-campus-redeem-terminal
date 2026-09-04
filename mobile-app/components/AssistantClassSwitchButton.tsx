import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { ClassInfo } from '../types';

interface AssistantClassSwitchButtonProps {
    activeClass?: ClassInfo;
    classLabel?: string;
    onClick?: () => void;
    className?: string;
    variant?: 'default' | 'quiet';
}

const AssistantClassSwitchButton: React.FC<AssistantClassSwitchButtonProps> = ({
    activeClass,
    classLabel,
    onClick,
    className = '',
    variant = 'default',
}) => {
    const switchable = Boolean(onClick);
    const variantClass = variant === 'quiet'
        ? 'px-1 text-[13px] font-medium text-[var(--tm-text-secondary)] enabled:active:text-[var(--tm-text-primary)]'
        : 'px-2 text-[14px] font-semibold text-[var(--tm-text-primary)] enabled:active:bg-[var(--tm-role-headteacher-glass-surface)]';

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!switchable}
            className={`flex min-h-11 max-w-[190px] min-w-0 items-center gap-1 rounded-[var(--tm-radius-control)] transition-[scale,color,background-color] duration-150 ease-out enabled:active:scale-[0.96] disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)] ${variantClass} ${className}`}
            aria-label={switchable
                ? `切换班级，当前${classLabel ?? activeClass?.name ?? '未选择'}`
                : `当前班级，${classLabel ?? activeClass?.name ?? '未选择'}`}
        >
            <span className="truncate">{classLabel ?? activeClass?.name ?? '选择班级'}</span>
            {switchable && (
                <ChevronDown className={`${variant === 'quiet' ? 'h-3.5 w-3.5' : 'h-4 w-4'} shrink-0 text-[var(--tm-text-tertiary)]`} strokeWidth={2.1} aria-hidden="true" />
            )}
        </button>
    );
};

export default AssistantClassSwitchButton;
