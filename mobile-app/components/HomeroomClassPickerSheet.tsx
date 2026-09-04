import React, { useEffect, useId, useRef } from 'react';
import { Check, X } from 'lucide-react';
import type { ClassInfo } from '../types';

interface HomeroomClassPickerSheetProps {
    classes: ClassInfo[];
    selectedClassId?: string;
    getClassLabel?: (classInfo: ClassInfo) => string;
    onSelect: (classId: string) => void;
    onClose: () => void;
}

const HomeroomClassPickerSheet: React.FC<HomeroomClassPickerSheetProps> = ({
    classes,
    selectedClassId,
    getClassLabel = classInfo => classInfo.name,
    onSelect,
    onClose,
}) => {
    const titleId = useId();
    const dialogRef = useRef<HTMLElement>(null);
    const selectedButtonRef = useRef<HTMLButtonElement>(null);
    const firstButtonRef = useRef<HTMLButtonElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const previousActiveElement = document.activeElement as HTMLElement | null;
        const frame = window.requestAnimationFrame(() => {
            (selectedButtonRef.current ?? firstButtonRef.current)?.focus();
        });
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCloseRef.current();
                return;
            }
            if (event.key !== 'Tab' || !dialogRef.current) return;

            const focusableElements = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
            );
            if (focusableElements.length === 0) return;
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.cancelAnimationFrame(frame);
            document.removeEventListener('keydown', handleKeyDown);
            previousActiveElement?.focus();
        };
    }, []);

    return (
        <div className="absolute inset-0 z-[120] flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]">
            <button type="button" tabIndex={-1} className="absolute inset-0" onClick={onClose} aria-label="关闭选择班级" />
            <section
                ref={dialogRef}
                className="relative w-full rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 [box-shadow:var(--tm-shadow-sheet)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="mx-auto h-1.5 w-10 rounded-full bg-[var(--tm-border-subtle)]" aria-hidden="true" />
                <div className="mt-2 flex h-12 items-center justify-between">
                    <h2 id={titleId} className="text-[17px] font-semibold text-[var(--tm-text-primary)]">选择班级</h2>
                    <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-text-secondary)] transition active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]" aria-label="关闭">
                        <X className="h-5 w-5" strokeWidth={2.1} />
                    </button>
                </div>
                <div className="max-h-[52vh] overflow-y-auto no-scrollbar">
                    {classes.map((classInfo, index) => {
                        const selected = classInfo.id === selectedClassId;
                        return (
                            <button
                                key={classInfo.id}
                                ref={selected ? selectedButtonRef : index === 0 ? firstButtonRef : undefined}
                                type="button"
                                onClick={() => onSelect(classInfo.id)}
                                className={`flex min-h-14 w-full items-center border-b border-[var(--tm-border-subtle)] px-1 text-left transition active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] ${selected ? 'text-[var(--tm-brand-primary-strong)]' : 'text-[var(--tm-text-primary)]'}`}
                                aria-current={selected ? 'true' : undefined}
                            >
                                <span className="min-w-0 flex-1 text-[15px] font-semibold">{getClassLabel(classInfo)}</span>
                                {selected && <Check className="h-5 w-5 shrink-0" strokeWidth={2.3} aria-hidden="true" />}
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default HomeroomClassPickerSheet;
