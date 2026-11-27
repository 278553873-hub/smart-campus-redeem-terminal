import type { ReactNode } from 'react';
import { ImagePlus } from 'lucide-react';
import CompactRemoveButton from './CompactRemoveButton';

const tileClass = 'relative flex aspect-square min-h-[var(--tm-size-touch)] min-w-0 items-center justify-center rounded-[var(--tm-form-control-radius)] text-[length:var(--tm-font-size-meta)] font-semibold';

interface MobileImageUploadTileProps {
  ariaLabel: string;
  label?: string;
  disabled?: boolean;
  onClick: () => void;
}

export function MobileImageUploadTile({ ariaLabel, label = '上传图片', disabled, onClick }: MobileImageUploadTileProps) {
  return (
    <button type="button" aria-label={ariaLabel} disabled={disabled} onClick={onClick}
      className={`${tileClass} flex-col gap-[var(--tm-space-2)] border border-dashed border-[var(--tm-brand-primary-soft-strong)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]`}>
      <ImagePlus aria-hidden="true" className="h-[var(--tm-space-5)] w-[var(--tm-space-5)]" />
      {label}
    </button>
  );
}

interface MobileImagePreviewTileProps {
  children: ReactNode;
  onRemove: () => void;
  removeLabel: string;
}

export function MobileImagePreviewTile({ children, onRemove, removeLabel }: MobileImagePreviewTileProps) {
  return (
    <div className={`${tileClass} bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]`}>
      {children}
      <CompactRemoveButton onClick={onRemove} ariaLabel={removeLabel} />
    </div>
  );
}

interface MobileImageSelectionTileProps {
  children: ReactNode;
  selected: boolean;
  ariaLabel: string;
  onClick: () => void;
  className?: string;
}

export function MobileImageSelectionTile({ children, selected, ariaLabel, onClick, className = '' }: MobileImageSelectionTileProps) {
  return (
    <button type="button" aria-label={ariaLabel} aria-pressed={selected} onClick={onClick}
      className={`relative flex aspect-square min-h-[var(--tm-size-touch)] min-w-0 items-center justify-center overflow-hidden rounded-[var(--tm-radius-card-compact)] border bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] ${selected ? 'border-[var(--tm-brand-primary)]' : 'border-transparent'} ${className}`}>
      {children}
    </button>
  );
}
