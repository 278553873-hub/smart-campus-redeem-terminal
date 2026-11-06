import React from 'react';

const PreviewToggle: React.FC<{
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}> = ({ checked, label, onChange }) => (
  <label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
    <input
      type="checkbox"
      checked={checked}
      onChange={event => onChange(event.target.checked)}
      className="h-4 w-4 accent-[var(--tm-brand-primary)]"
    />
    {label}
  </label>
);

export default PreviewToggle;
