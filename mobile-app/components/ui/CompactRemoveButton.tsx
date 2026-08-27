import React from 'react';
import { X } from 'lucide-react';

interface CompactRemoveButtonProps {
  ariaLabel: string;
  className?: string;
  onClick: () => void;
}

const CompactRemoveButton: React.FC<CompactRemoveButtonProps> = ({ ariaLabel, className = '', onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group absolute -right-[var(--tm-compact-remove-corner-offset)] -top-[var(--tm-compact-remove-corner-offset)] z-10 flex h-[var(--tm-compact-remove-control-size)] w-[var(--tm-compact-remove-control-size)] items-center justify-center transition-transform before:absolute before:-inset-[var(--tm-compact-remove-hit-slop)] before:content-[''] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] ${className}`}
    aria-label={ariaLabel}
  >
    <span
      className="flex h-[var(--tm-compact-remove-visible-size)] w-[var(--tm-compact-remove-visible-size)] items-center justify-center rounded-full bg-[var(--tm-compact-remove-bg)] text-[var(--tm-compact-remove-icon)] transition-[background-color] group-active:bg-[var(--tm-compact-remove-pressed-bg)]"
      aria-hidden="true"
    >
      <X className="h-[var(--tm-compact-remove-icon-size)] w-[var(--tm-compact-remove-icon-size)]" />
    </span>
  </button>
);

export default CompactRemoveButton;
