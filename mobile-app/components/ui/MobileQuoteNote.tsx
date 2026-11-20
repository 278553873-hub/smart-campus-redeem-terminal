import React from 'react';
import { Quote, Triangle } from 'lucide-react';

interface MobileQuoteNoteProps {
  ariaLabel: string;
  summary: React.ReactNode;
  supplement?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

const MobileQuoteNote: React.FC<MobileQuoteNoteProps> = ({
  ariaLabel,
  summary,
  supplement,
  className = '',
  iconClassName = 'text-[var(--tm-brand-primary-strong)]',
}) => (
  <div
    role="note"
    aria-label={ariaLabel}
    className={`relative rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-3)] ${className}`}
  >
    <Triangle
      aria-hidden="true"
      fill="currentColor"
      strokeWidth={0}
      className="absolute -top-2 left-1/2 h-3 w-4 -translate-x-1/2 text-[var(--tm-bg-surface-soft)]"
    />
    <div className="flex items-start gap-[var(--tm-space-2)]">
      <Quote aria-hidden="true" fill="currentColor" strokeWidth={1.5} className={`mt-0.5 h-4 w-4 shrink-0 ${iconClassName}`} />
      <div className="min-w-0">
        <p className="text-pretty text-[length:var(--tm-font-size-body)] font-semibold leading-5 text-[var(--tm-text-primary)]">{summary}</p>
        {supplement && <p className="mt-[var(--tm-space-1)] text-pretty text-[length:var(--tm-font-size-compact)] tm-font-regular leading-5 text-[var(--tm-text-tertiary)]">{supplement}</p>}
      </div>
    </div>
  </div>
);

export default MobileQuoteNote;
