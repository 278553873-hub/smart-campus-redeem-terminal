import React from 'react';
import { ChevronLeft } from 'lucide-react';

// 页面容器保持透明，顶部氛围光由屏幕级背景（TeacherMobileScreenBackground）统一提供。
export const pageBackground = 'bg-transparent';
export const sectionSurface = 'rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)]';
export const primaryButton = 'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-5 text-[15px] font-bold text-white shadow-[var(--tm-shadow-card)] transition active:scale-[0.98] active:bg-[var(--tm-brand-primary-strong)] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none';
export const secondaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-4 text-[14px] font-semibold text-[var(--tm-text-secondary)] shadow-sm transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)] disabled:opacity-45';
export const iconButton = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)]';
export const inputClass = 'w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-white px-3.5 text-[14px] font-medium text-[var(--tm-text-primary)] outline-none transition placeholder:text-[var(--tm-text-tertiary)] focus:border-[var(--tm-brand-primary)] focus:ring-4 focus:ring-[var(--tm-focus-ring)]';

export const PageHeader: React.FC<{ title: string; onBack: () => void; action?: React.ReactNode }> = ({ title, onBack, action }) => (
  <header className="sticky top-0 z-40 flex h-11 shrink-0 items-center justify-between bg-white/38 px-4 backdrop-blur-md">
    <button type="button" onClick={onBack} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回">
      <ChevronLeft className="h-5 w-5" />
    </button>
    <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-bold text-[var(--tm-text-primary)]">{title}</h1>
    <div className="-mr-2 flex h-10 min-w-10 items-center justify-end whitespace-nowrap pl-1">{action}</div>
  </header>
);

export const BottomAction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-x-0 bottom-0 z-30 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_28px_-24px_var(--tm-shadow-neutral)] backdrop-blur-xl">
    {children}
  </div>
);

export const BottomSheet: React.FC<{ open: boolean; label: string; onDismiss: () => void; children: React.ReactNode }> = ({ open, label, onDismiss, children }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]" onClick={onDismiss}>
      <section className="max-h-[88%] w-full overflow-y-auto rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[var(--tm-shadow-sheet)]" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={label}>
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[var(--tm-brand-primary-soft-strong)]" aria-hidden="true" />
        {children}
      </section>
    </div>
  );
};

export const StatusPill: React.FC<{ children: React.ReactNode; className: string }> = ({ children, className }) => (
  <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[11px] font-bold ${className}`}>{children}</span>
);

export const Toast: React.FC<{ message: string }> = ({ message }) => {
  if (!message) return null;
  return <div className="pointer-events-none absolute inset-x-5 bottom-24 z-[70] rounded-[15px] bg-[var(--tm-text-primary)] px-4 py-3 text-center text-[13px] font-semibold text-[var(--tm-text-inverse)] shadow-[var(--tm-shadow-card-raised)]">{message}</div>;
};
