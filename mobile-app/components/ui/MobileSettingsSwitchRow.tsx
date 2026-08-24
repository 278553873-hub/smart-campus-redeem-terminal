import React from 'react';

interface MobileSettingsSwitchRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const MobileSettingsSwitchRow: React.FC<MobileSettingsSwitchRowProps> = ({
  label,
  checked,
  onChange,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex min-h-[56px] w-full items-center justify-between gap-[var(--tm-space-4)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-left active:bg-[var(--tm-bg-surface-muted)] focus-visible:bg-[var(--tm-bg-surface-muted)] focus-visible:outline-none"
  >
    <span className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{label}</span>
    <span
      aria-hidden="true"
      className={`flex h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors [transition-duration:var(--tm-duration-standard)] motion-reduce:transition-none ${checked ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-muted)]'}`}
    >
      <span className={`h-6 w-6 rounded-full bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-control)] transition-transform [transition-duration:var(--tm-duration-standard)] motion-reduce:transition-none ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </span>
  </button>
);

export default MobileSettingsSwitchRow;
