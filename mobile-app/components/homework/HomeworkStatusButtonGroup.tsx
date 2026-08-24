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
          className={`min-h-[var(--tm-size-touch)] min-w-0 rounded-[var(--tm-radius-control)] px-0.5 text-[length:var(--tm-font-size-badge)] font-semibold transition-[background-color,border-color,color] [transition-duration:var(--tm-duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] ${tone}`}
        >
          {HOMEWORK_STATUS_META[status].label}
        </button>
      );
    })}
  </div>
);

export default HomeworkStatusButtonGroup;
