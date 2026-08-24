import React from 'react';
import {
  HOMEWORK_STATUS_META,
  HOMEWORK_STATUS_VALUES,
  type HomeworkStatus,
} from '../../domain/homework';

interface HomeworkStatusButtonGroupProps {
  value?: HomeworkStatus | null;
  onChange: (status: HomeworkStatus) => void;
  ariaLabel: string;
  showAllTones?: boolean;
  size?: 'default' | 'compact';
}

const statusTone: Record<HomeworkStatus, { soft: string; selected: string }> = {
  excellent: {
    soft: 'border border-[var(--tm-chart-positive)]/20 bg-[var(--tm-chart-positive-soft)] text-[var(--tm-chart-positive-text)]',
    selected: 'border-0 bg-[var(--tm-chart-positive)] text-[var(--tm-text-inverse)]',
  },
  good: {
    soft: 'border border-[var(--tm-chart-data-default)]/20 bg-[var(--tm-chart-data-default-soft)] text-[var(--tm-chart-data-default-text)]',
    selected: 'border-0 bg-[var(--tm-chart-data-default)] text-[var(--tm-text-inverse)]',
  },
  pass: {
    soft: 'border border-[var(--tm-chart-warning)]/20 bg-[var(--tm-chart-warning-soft)] text-[var(--tm-chart-warning-text)]',
    selected: 'border-0 bg-[var(--tm-chart-warning)] text-[var(--tm-text-inverse)]',
  },
  pending_pass: {
    soft: 'border border-[var(--tm-brand-primary)]/20 bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]',
    selected: 'border-0 bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]',
  },
  missing: {
    soft: 'border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]',
    selected: 'border-0 bg-[var(--tm-text-secondary)] text-[var(--tm-text-inverse)]',
  },
};

const HomeworkStatusButtonGroup: React.FC<HomeworkStatusButtonGroupProps> = ({
  value,
  onChange,
  ariaLabel,
  showAllTones = false,
  size = 'default',
}) => (
  <div className="grid grid-cols-5 gap-[var(--tm-space-1)]" role="group" aria-label={ariaLabel}>
    {HOMEWORK_STATUS_VALUES.map(status => {
      const selected = value === status;
      const tone = selected || showAllTones
        ? statusTone[status][selected ? 'selected' : 'soft']
        : 'border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]';
      return (
        <button
          key={status}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(status)}
          className={`flex min-h-[var(--tm-size-touch)] min-w-0 items-center justify-center p-0 text-[length:var(--tm-font-size-badge)] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] ${size === 'compact' ? '' : `rounded-[var(--tm-radius-control)] transition-[background-color,border-color,color] [transition-duration:var(--tm-duration-fast)] ${tone}`}`}
        >
          {size === 'compact' ? (
            <span className={`flex h-9 w-full items-center justify-center rounded-[8px] px-0.5 transition-[background-color,border-color,color] [transition-duration:var(--tm-duration-fast)] ${tone}`}>
              {HOMEWORK_STATUS_META[status].label}
            </span>
          ) : HOMEWORK_STATUS_META[status].label}
        </button>
      );
    })}
  </div>
);

export default HomeworkStatusButtonGroup;
