import React, { useId, useState } from 'react';
import { Info } from 'lucide-react';

/** 轻量点击说明，统一图标、提示样式和关闭方式。 */
export default function MobileInfoHint({ label, children, align = 'left' }: {
    label: string;
    children: React.ReactNode;
    align?: 'left' | 'center' | 'inset';
}) {
    const [open, setOpen] = useState(false);
    const id = useId();
    return (
        <span className="relative inline-flex shrink-0">
            <button
                type="button"
                aria-label={label}
                aria-expanded={open}
                aria-controls={open ? id : undefined}
                aria-describedby={open ? id : undefined}
                onClick={() => setOpen(current => !current)}
                onBlur={() => setOpen(false)}
                onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-tertiary)] transition-colors active:text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
            >
                <Info aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            {open && (
                <span id={id} role="tooltip" className={`absolute top-full z-20 mt-2 w-56 rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-text-primary)] px-3 py-2 text-left text-xs font-medium leading-relaxed text-white ${align === 'center' ? 'left-1/2 -translate-x-1/2' : align === 'inset' ? '-left-16' : 'left-0'}`}>
                    {children}
                </span>
            )}
        </span>
    );
}
