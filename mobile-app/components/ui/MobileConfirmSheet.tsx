import React from 'react';
import MobileBottomSheet from './MobileBottomSheet';

interface MobileConfirmSheetProps {
  open: boolean;
  shape?: 'default' | 'subtle';
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onClose: () => void;
}

const buttonBase = 'inline-flex min-h-[52px] items-center justify-center px-4 text-[length:var(--tm-font-size-body)] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2';

const MobileConfirmSheet: React.FC<MobileConfirmSheetProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = '取消',
  shape = 'default',
  tone = 'primary',
  onConfirm,
  onClose,
}) => (
  <MobileBottomSheet open={open} title={title} onClose={onClose}>
    <p className="text-pretty text-[length:var(--tm-font-size-body)] font-medium leading-6 text-[var(--tm-text-secondary)]">{description}</p>
    <div className={`grid grid-cols-2 ${shape === 'subtle' ? 'mt-[var(--tm-layout-card-gap)] gap-[var(--tm-layout-card-gap)]' : 'mt-5 gap-3'}`}>
      <button type="button" onClick={onClose} className={`${buttonBase} ${shape === 'subtle' ? 'rounded-[var(--tm-radius-control-compact)]' : 'rounded-[var(--tm-radius-control)]'} border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)]`}>
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={`${buttonBase} ${shape === 'subtle' ? 'rounded-[var(--tm-radius-control-compact)]' : 'rounded-[var(--tm-radius-control)]'} text-[var(--tm-text-inverse)] ${tone === 'danger' ? 'bg-[var(--tm-status-negative)]' : 'bg-[var(--tm-brand-primary)]'}`}
      >
        {confirmLabel}
      </button>
    </div>
  </MobileBottomSheet>
);

export default MobileConfirmSheet;
