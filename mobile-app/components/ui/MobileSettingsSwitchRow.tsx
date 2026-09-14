import React from 'react';

interface MobileSettingsSwitchRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  surface?: 'soft' | 'plain';
  className?: string;
}

const MobileSettingsSwitchRow: React.FC<MobileSettingsSwitchRowProps> = ({
  label,
  checked,
  onChange,
  surface = 'soft',
  className = '',
}) => {
  const surfaceClass = surface === 'plain'
    ? 'rounded-[var(--tm-radius-control)] bg-transparent px-[var(--tm-space-1)]'
    : 'rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)]';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex min-h-[52px] w-full items-center justify-between gap-[var(--tm-space-4)] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tm-border-control)] ${surfaceClass} ${className}`}
    >
      <span className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{label}</span>
      <span
        aria-hidden="true"
        className={`flex h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors [transition-duration:var(--tm-duration-standard)] motion-reduce:transition-none ${checked ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-border-control)]'}`}
      >
        <span className={`h-5 w-5 rounded-full bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-control)] transition-transform [transition-duration:var(--tm-duration-standard)] motion-reduce:transition-none ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </span>
    </button>
  );
};

export default MobileSettingsSwitchRow;
