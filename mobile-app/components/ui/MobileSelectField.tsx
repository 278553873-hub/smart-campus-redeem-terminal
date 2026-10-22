import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import MobileBottomSheet from './MobileBottomSheet';

interface MobileSelectFieldProps<T extends string> {
    label: string;
    value: T;
    options: readonly { value: T; label: string }[];
    onChange: (value: T) => void;
    className?: string;
}

/** 手机表单选择字段：公共底部弹窗承载选项，选中后回填，不提交外层表单。 */
export default function MobileSelectField<T extends string>({ label, value, options, onChange, className = 'w-full' }: MobileSelectFieldProps<T>) {
    const [open, setOpen] = React.useState(false);
    const selected = options.find(option => option.value === value);
    return <>
        <button type="button" aria-label={`${label}，当前${selected?.label ?? ''}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}
            className={`relative flex h-11 min-w-0 shrink-0 items-center justify-center rounded-[var(--tm-form-control-radius)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] pl-2 pr-6 text-[14px] font-semibold text-[var(--tm-input-text)] [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] ${className}`}>
            <span className="min-w-0 truncate">{selected?.label}</span>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
        </button>
        <MobileBottomSheet open={open} title={label} onClose={() => setOpen(false)}>
            <div role="group" aria-label={label}>
                {options.map(option => <button key={option.value} type="button" aria-pressed={option.value === value}
                    onClick={() => { onChange(option.value); setOpen(false); }}
                    className="flex min-h-12 w-full items-center justify-between gap-3 px-2 text-left text-[14px] font-medium text-[var(--tm-text-primary)] [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]">
                    <span>{option.label}</span>
                    {option.value === value && <Check aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--tm-brand-primary)]" />}
                </button>)}
            </div>
        </MobileBottomSheet>
    </>;
}
