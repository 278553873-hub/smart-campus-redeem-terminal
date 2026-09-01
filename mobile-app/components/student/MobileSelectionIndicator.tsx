import React from 'react';
import { CheckIcon, CircleIcon } from '../Icons';

interface MobileSelectionIndicatorProps {
  selected: boolean;
  showUnselected?: boolean;
  className?: string;
}

const MobileSelectionIndicator: React.FC<MobileSelectionIndicatorProps> = ({
  selected,
  showUnselected = true,
  className = '',
}) => {
  if (!selected && !showUnselected) return null;

  return (
    <span
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full ${selected ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'bg-[var(--tm-bg-surface)] text-[var(--tm-border-subtle)]'} ${className}`}
      aria-hidden="true"
    >
      {selected
        ? <CheckIcon className="h-3 w-3 [stroke-width:3]" />
        : <CircleIcon className="h-[18px] w-[18px] fill-[var(--tm-bg-surface)]" />}
    </span>
  );
};

export default MobileSelectionIndicator;
