import React from 'react';
import { Check } from 'lucide-react';

interface MobileRadioOptionCardProps {
  id: string;
  tag?: string;
  tagTone?: 'neutral' | 'red' | 'orange' | 'jade' | 'gold';
  title: string;
  /** 说明支持带图标的富文本，例如金额前挂金币或银行图标。 */
  description: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

const MobileRadioOptionCard: React.FC<MobileRadioOptionCardProps> = ({
  id,
  tag,
  tagTone = 'neutral',
  title,
  description,
  selected,
  onSelect,
}) => (
  <button
    id={id}
    type="button"
    role="radio"
    aria-checked={selected}
    aria-labelledby={tag ? `${id}-tag ${id}-title` : `${id}-title`}
    aria-describedby={`${id}-description`}
    onClick={onSelect}
    className={`flex w-full items-start gap-[var(--tm-space-3)] rounded-[var(--tm-selection-card-radius)] border bg-[var(--tm-selection-card-bg)] px-[var(--tm-space-4)] py-[var(--tm-space-3)] text-left text-[var(--tm-selection-card-title-text)] [box-shadow:var(--tm-selection-card-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2 ${selected
      ? 'border-[var(--tm-selection-card-selected-border)] bg-[var(--tm-selection-card-selected-bg)]'
      : 'border-[var(--tm-selection-card-border)]'}`}
  >
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${selected
        ? 'bg-[var(--tm-selection-card-check-bg)] text-[var(--tm-text-inverse)]'
        : 'border border-[var(--tm-selection-card-check-border)] bg-[var(--tm-selection-card-bg)] text-transparent'}`}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </span>
    <span className="min-w-0 flex-1">
      <span id={`${id}-title`} className="block text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-selection-card-title-text)]">
        {title}
      </span>
      {tag && (
        <span id={`${id}-tag`} className={`mt-1 inline-flex items-center rounded-[var(--tm-radius-control)] px-2 py-0.5 text-[length:var(--tm-font-size-meta)] font-semibold leading-4 ${{
          neutral: 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]',
          red: 'bg-[var(--tm-tag-red-soft)] text-[var(--tm-tag-red-strong)]',
          orange: 'bg-[var(--tm-tag-orange-soft)] text-[var(--tm-tag-orange-strong)]',
          jade: 'bg-[var(--tm-tag-jade-soft)] text-[var(--tm-tag-jade-strong)]',
          gold: 'bg-[var(--tm-tag-gold-soft)] text-[var(--tm-tag-gold-strong)]',
        }[tagTone]}`}>
          {tag}
        </span>
      )}
      <span id={`${id}-description`} className="mt-1 block text-[length:var(--tm-font-size-meta)] font-medium leading-5 text-[var(--tm-selection-card-description-text)]">
        {description}
      </span>
    </span>
  </button>
);

export default MobileRadioOptionCard;
