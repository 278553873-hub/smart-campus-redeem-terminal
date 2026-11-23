import React, { useEffect, useId, useRef } from 'react';
import './MobileGlassActionDialog.css';

interface MobileGlassActionDialogProps {
  title: string;
  actions: readonly { label: string; onSelect: () => void }[];
  returnFocusRef: { readonly current: HTMLButtonElement | null };
  onClose: () => void;
}

// Mounted on demand inside a positioned screen with its background made inert.
export default function MobileGlassActionDialog({ title, actions, returnFocusRef, onClose }: MobileGlassActionDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const trigger = returnFocusRef.current;
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [returnFocusRef]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const panel = event.currentTarget;
    const buttons = panel.querySelectorAll('button');
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    const active = document.activeElement;
    const atBoundary = active === panel || active === (event.shiftKey ? first : last);
    if (atBoundary) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus({ preventScroll: true });
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-[var(--tm-space-4)]">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="mobile-glass-action-dialog relative max-h-full w-full max-w-[240px] overflow-y-auto overscroll-contain rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] p-[var(--tm-space-2)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-floating)] outline-none"
      >
        <h2 id={titleId} className="flex min-h-11 items-center px-[var(--tm-space-3)] text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{title}</h2>
        <ul className="divide-y divide-[var(--tm-border-subtle)]">
          {actions.map(({ label, onSelect }) => (
            <li key={label}>
              <button
                type="button"
                onClick={onSelect}
                className="flex min-h-[var(--tm-size-touch)] w-full items-center rounded-[var(--tm-radius-control-compact)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] text-left text-[length:var(--tm-font-size-card-title)] font-medium active:bg-[var(--tm-bg-surface-glass)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
