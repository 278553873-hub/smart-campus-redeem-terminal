import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({ open, title, onClose, children, footer }) => {
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    const mobileOverlayRoot = document.getElementById('teacher-mobile-overlay-root');
    if (mobileOverlayRoot) {
      setPortalRoot(mobileOverlayRoot);
      return undefined;
    }

    const resolveFrame = window.requestAnimationFrame(() => {
      setPortalRoot(document.getElementById('teacher-mobile-overlay-root') ?? document.body);
    });
    return () => window.cancelAnimationFrame(resolveFrame);
  }, []);

  useEffect(() => {
    if (!open || !portalRoot) return undefined;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.focus({ preventScroll: true }));
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusableElements = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ));
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus({ preventScroll: true });
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;
      if (event.shiftKey && (activeElement === firstElement || !dialogRef.current.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus({ preventScroll: true });
      } else if (!event.shiftKey && (activeElement === dialogRef.current || activeElement === lastElement || !dialogRef.current.contains(activeElement))) {
        event.preventDefault();
        firstElement.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [open, portalRoot]);

  if (!open || !portalRoot) return null;

  return createPortal(
    <div className="pointer-events-auto absolute inset-0 z-[1000] flex items-end justify-center bg-[var(--tm-mask)] animate-in fade-in [animation-duration:var(--tm-duration-standard)]">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label={`关闭${title}`} />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative z-10 flex max-h-[86%] w-full max-w-md flex-col rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-sheet)] animate-in slide-in-from-bottom [animation-duration:var(--tm-duration-panel)]"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[var(--tm-border-control)]" aria-hidden="true" />
        <header className="flex h-14 shrink-0 items-center justify-between px-4">
          <h2 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">{title}</h2>
          <button type="button" onClick={onClose} className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label={`关闭${title}`}>
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">{children}</div>
        {footer && (
          <footer className="shrink-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-4 pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-3">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    portalRoot,
  );
};

export default MobileBottomSheet;
