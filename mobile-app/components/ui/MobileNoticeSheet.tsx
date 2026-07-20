import React, { useEffect, useId, useRef } from 'react';
import { CalendarClock, X } from 'lucide-react';
import { IconBadge } from './IconBadge';

interface MobileNoticeSheetProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onDismiss: () => void;
}

const MobileNoticeSheet: React.FC<MobileNoticeSheetProps> = ({
  open,
  title,
  message,
  confirmLabel = '知道了',
  onDismiss,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => confirmRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onDismiss, open]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-[120] flex items-end bg-[var(--tm-mask)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <button type="button" className="absolute inset-0" onClick={onDismiss} aria-label="关闭提示" />
      <section className="relative w-full rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 [box-shadow:var(--tm-shadow-sheet)]">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-[var(--tm-border-subtle)]" aria-hidden="true" />
        <div className="mt-2 flex min-h-12 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <IconBadge icon={CalendarClock} size="md" tone="reward" />
            <h2 id={titleId} className="text-[17px] font-semibold text-[var(--tm-text-primary)]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-text-secondary)] transition active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
            aria-label="关闭"
          >
            <X className="h-5 w-5" strokeWidth={2.1} />
          </button>
        </div>
        <p id={descriptionId} className="mt-4 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{message}</p>
        <button
          ref={confirmRef}
          type="button"
          onClick={onDismiss}
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[15px] font-semibold text-white transition active:scale-[0.99] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2"
        >
          {confirmLabel}
        </button>
      </section>
    </div>
  );
};

export default MobileNoticeSheet;
