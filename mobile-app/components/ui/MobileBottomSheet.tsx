import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'content' | 'tall' | 'full';
  contentInset?: 'standard' | 'compact' | 'none';
  contentTone?: 'surface' | 'plain';
  footer?: React.ReactNode;
  footerDivider?: boolean;
  header?: React.ReactNode;
  headerAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  showHandle?: boolean;
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  open,
  title,
  onClose,
  children,
  size = 'content',
  contentInset = 'standard',
  contentTone = 'surface',
  footer,
  footerDivider = false,
  header,
  headerAction,
  showHandle = true,
}) => {
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
        className={`relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-sheet)] animate-in slide-in-from-bottom [animation-duration:var(--tm-duration-panel)] ${size === 'full' ? 'h-[94%] max-h-[94%]' : size === 'tall' ? 'h-[86%] max-h-[86%]' : 'max-h-[86%]'}`}
      >
        <div className="relative z-20 shrink-0 bg-[var(--tm-bg-surface)]">
          {showHandle && <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-[var(--tm-border-subtle)]" aria-hidden="true" />}
          {header ?? (
            <header className="flex h-14 shrink-0 items-center justify-between px-4">
              <h2 className="min-w-0 flex-1 truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">{title}</h2>
              <div className="-mr-2 flex shrink-0 items-center">
                {headerAction && (
                  <button
                    type="button"
                    onClick={headerAction.onClick}
                    disabled={headerAction.disabled}
                    className="group flex h-[var(--tm-size-touch)] min-w-[var(--tm-size-touch)] items-center justify-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                  >
                    <span className="flex h-7 items-center justify-center rounded-[8px] border border-[var(--tm-brand-primary)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary)] transition-[background-color,color,border-color] [transition-duration:var(--tm-duration-fast)] group-active:bg-[var(--tm-brand-primary-soft)] group-active:text-[var(--tm-brand-primary-pressed)] group-disabled:border-[var(--tm-border-control)] group-disabled:text-[var(--tm-text-disabled)]">
                      {headerAction.label}
                    </span>
                  </button>
                )}
                <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label={`关闭${title}`}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>
          )}
        </div>
        <div className={`relative z-0 isolate min-h-0 flex-1 overflow-y-auto overscroll-contain [clip-path:inset(0)] no-scrollbar ${contentTone === 'plain' ? 'bg-[var(--tm-page-plain-content-bg)]' : 'bg-[var(--tm-bg-surface)]'} ${contentInset === 'none' ? '' : contentInset === 'compact' ? 'px-3' : 'px-[var(--tm-space-4)]'} ${footer ? 'pb-[var(--tm-space-4)]' : 'pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))]'}`}>{children}</div>
        {footer && (
          <footer className={`relative z-20 shrink-0 bg-[var(--tm-bg-surface-glass)] px-4 pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-3 ${footerDivider ? 'border-solid border-[var(--tm-border-subtle)] [border-top-width:var(--tm-sheet-footer-divider-width)]' : ''}`}>
            {footer}
          </footer>
        )}
      </section>
    </div>,
    portalRoot,
  );
};

export default MobileBottomSheet;
