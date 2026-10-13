import React from 'react';

interface SegmentedControlProps {
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
}

/** 两档视图切换用它最省地方，底轨沿用记录页同源的轻玻璃。 */
const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange, ariaLabel }) => (
  <div
    role="tablist"
    aria-label={ariaLabel}
    className="flex h-[var(--tm-selection-segment-compact-track-height)] items-center gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] p-[3px]"
  >
    {options.map(option => {
      const active = option.id === value;
      return (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(option.id)}
          className="h-[var(--tm-selection-segment-compact-active-height)] flex-1 rounded-[calc(var(--tm-radius-control)-2px)] text-[14px] font-semibold transition-colors duration-200"
          style={{
            background: active ? 'var(--tm-bg-surface)' : 'transparent',
            color: active ? 'var(--tm-brand-primary)' : 'var(--tm-text-secondary)',
            boxShadow: active ? 'var(--tm-shadow-control)' : 'none',
          }}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;
