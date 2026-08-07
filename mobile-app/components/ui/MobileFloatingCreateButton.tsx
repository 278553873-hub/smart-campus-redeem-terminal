import React from 'react';
import { Plus } from 'lucide-react';

interface MobileFloatingCreateButtonProps {
  label: string;
  onClick: () => void;
  emphasis?: 'default' | 'raised';
}

const MobileFloatingCreateButton: React.FC<MobileFloatingCreateButtonProps> = ({ label, onClick, emphasis = 'default' }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className={`absolute z-40 flex h-[var(--tm-size-floating-action)] w-[var(--tm-size-floating-action)] items-center justify-center rounded-full bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] ${emphasis === 'raised' ? '[box-shadow:var(--tm-shadow-floating-raised)]' : '[box-shadow:var(--tm-shadow-floating)]'} transition-[transform,background-color,box-shadow] [transition-duration:var(--tm-duration-fast)] active:scale-[0.94] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2`}
    style={{
      right: 'var(--tm-space-5)',
      bottom: 'calc(var(--tm-space-5) + env(safe-area-inset-bottom))',
    }}
  >
    <Plus className="h-6 w-6" strokeWidth={2.4} aria-hidden="true" />
  </button>
);

export default MobileFloatingCreateButton;
