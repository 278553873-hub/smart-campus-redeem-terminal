import type { ReactNode } from 'react';

interface MobileFormActionBarProps {
  label: string;
  type: 'button' | 'submit';
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export default function MobileFormActionBar({ label, type, icon, disabled, onClick }: MobileFormActionBarProps) {
  return (
    <footer className="tm-bottom-action-safe-area shrink-0 bg-[var(--tm-bg-surface)] px-[var(--tm-space-5)] pt-[var(--tm-space-4)]">
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className="flex h-[var(--tm-form-action-height)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-form-control-radius)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] transition-colors [transition-duration:var(--tm-duration-fast)] enabled:active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-tertiary)] motion-reduce:transition-none"
      >
        {icon}
        {label}
      </button>
    </footer>
  );
}
