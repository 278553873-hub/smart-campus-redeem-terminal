import React from 'react';
import MobileBottomSheet from './MobileBottomSheet';

interface MobileConfirmSheetProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onClose: () => void;
}

const buttonBase = 'inline-flex min-h-[52px] items-center justify-center rounded-[var(--tm-radius-control)] px-4 text-[length:var(--tm-font-size-body)] font-bold transition-[transform,background-color,opacity] [transition-duration:var(--tm-duration-fast)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2';

const MobileConfirmSheet: React.FC<MobileConfirmSheetProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = '取消',
  tone = 'primary',
  onConfirm,
  onClose,
}) => (
  <MobileBottomSheet open={open} title={title} onClose={onClose}>
    <p className="text-pretty text-[length:var(--tm-font-size-body)] font-medium leading-6 text-[var(--tm-text-secondary)]">{description}</p>
    <div className="mt-5 grid grid-cols-2 gap-3">
      <button type="button" onClick={onClose} className={`${buttonBase} border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]`}>
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={`${buttonBase} text-[var(--tm-text-inverse)] ${tone === 'danger' ? 'bg-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-strong)]' : 'bg-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-pressed)]'}`}
      >
        {confirmLabel}
      </button>
    </div>
  </MobileBottomSheet>
);

export default MobileConfirmSheet;
