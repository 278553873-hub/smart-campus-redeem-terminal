/** 家长组件样式适配层。唯一令牌源：parentMobileTokens.ts。 */
export { parentMobileCssVariables } from './parentMobileTokens';

export const parentSurface = {
  background: '[background:var(--pm-page-gradient)]',
  card: 'bg-[var(--pm-bg-surface)]',
  subtle: 'border border-[var(--pm-border-subtle)] bg-[var(--pm-bg-surface-soft)]',
} as const;

export const parentText = {
  title: 'text-[var(--pm-text-primary)]',
  body: 'text-[var(--pm-text-secondary)]',
  muted: 'text-[var(--pm-text-tertiary)]',
  weak: 'text-[var(--pm-text-disabled)]',
  success: 'text-[var(--pm-status-positive-strong)]',
  attention: 'text-[var(--pm-status-attention)]',
} as const;

export const parentTypography = {
  pageTitle: 'text-[length:var(--pm-font-size-page-title)] font-[var(--pm-font-weight-bold)] leading-tight',
  sectionTitle: 'text-[length:var(--pm-font-size-section-title)] font-[var(--pm-font-weight-semibold)] leading-snug',
  cardTitle: 'text-[length:var(--pm-font-size-card-title)] font-[var(--pm-font-weight-semibold)] leading-snug',
  body: 'text-[length:var(--pm-font-size-body)] font-[var(--pm-font-weight-regular)] leading-relaxed',
  compact: 'text-[length:var(--pm-font-size-compact)] font-[var(--pm-font-weight-regular)] leading-snug',
  meta: 'text-[length:var(--pm-font-size-meta)] font-[var(--pm-font-weight-regular)] leading-snug',
  metric: 'text-[length:var(--pm-font-size-metric)] font-[var(--pm-font-weight-bold)] leading-none',
} as const;

export const parentIconTone = {
  blue: 'bg-[var(--pm-icon-blue-gradient)] text-[var(--pm-text-inverse)] [box-shadow:var(--pm-shadow-control)]',
  green: 'bg-[var(--pm-icon-green-gradient)] text-[var(--pm-text-inverse)] [box-shadow:var(--pm-shadow-control)]',
  orange: 'bg-[var(--pm-icon-orange-gradient)] text-[var(--pm-text-inverse)] [box-shadow:var(--pm-shadow-control)]',
  negative: 'bg-[var(--evaluation-score-negative)] text-[var(--pm-text-inverse)] [box-shadow:var(--pm-shadow-control)]',
  softBlue: 'bg-[var(--pm-icon-soft-blue-gradient)] text-[var(--pm-brand-primary-strong)] [box-shadow:var(--pm-shadow-control)]',
} as const;

export const parentButtonTone = {
  primary: 'bg-[var(--pm-brand-primary)] text-[var(--pm-text-inverse)] [box-shadow:var(--pm-shadow-control)] active:bg-[var(--pm-brand-primary-pressed)]',
  secondary: 'border border-[var(--pm-border-control)] bg-[var(--pm-bg-surface)] text-[var(--pm-brand-primary-strong)] shadow-none active:bg-[var(--pm-brand-primary-soft)]',
  neutral: 'bg-[var(--pm-bg-surface-muted)] text-[var(--pm-text-secondary)] shadow-none active:bg-[var(--pm-border-subtle)]',
  attention: 'bg-[var(--pm-status-attention)] text-[var(--pm-text-inverse)] [box-shadow:var(--pm-shadow-control)]',
  attentionSoft: 'border border-[var(--pm-status-attention)]/30 bg-[var(--pm-status-attention-soft)] text-[var(--pm-status-attention)] shadow-none',
} as const;

export const parentRadius = {
  icon: 'rounded-[var(--pm-radius-inner)]',
  iconSmall: 'rounded-[var(--pm-radius-control)]',
  card: 'rounded-[var(--pm-radius-card)]',
  cardLarge: 'rounded-[var(--pm-radius-card)]',
  input: 'rounded-[var(--pm-radius-control)]',
  field: 'rounded-[var(--pm-radius-field)]',
  button: 'rounded-[var(--pm-radius-control)]',
  sheet: 'rounded-t-[var(--pm-radius-sheet)]',
} as const;

export const parentShadow = {
  card: '[box-shadow:var(--pm-shadow-card)]',
  floating: '[box-shadow:var(--pm-shadow-floating)]',
  sheet: '[box-shadow:var(--pm-shadow-sheet)]',
} as const;

export const parentSegmentTone = {
  track: 'bg-[var(--pm-selection-segment-track-bg)] p-1 rounded-[var(--pm-radius-control-compact)]',
  active: 'bg-[var(--pm-selection-segment-active-bg)] text-[var(--pm-selection-segment-active-text)] font-[var(--pm-font-weight-semibold)] rounded-[var(--pm-form-segment-active-radius)] [box-shadow:var(--pm-selection-segment-active-shadow)]',
  inactive: 'text-[var(--pm-selection-segment-inactive-text)] font-[var(--pm-font-weight-regular)] active:bg-[var(--pm-bg-surface-soft)]',
} as const;

export const parentSelectCardTone = {
  active: 'border border-[var(--pm-select-card-active-border)] bg-[var(--pm-select-card-active-bg)] text-[var(--pm-select-card-active-text)] [box-shadow:var(--pm-select-card-active-shadow)] font-bold',
  inactive: 'border border-[var(--pm-border-subtle)] bg-[var(--pm-bg-surface)] text-[var(--pm-text-secondary)] active:bg-[var(--pm-bg-surface-soft)]',
} as const;

export const parentDateControl = {
  iconButton: 'flex h-[var(--pm-size-touch)] w-[var(--pm-size-touch)] shrink-0 items-center justify-center rounded-[var(--pm-radius-control-compact)] text-[var(--pm-text-secondary)] transition-colors [transition-duration:var(--pm-duration-fast)] active:bg-[var(--pm-bg-surface-soft)]',
  shortcut: 'ml-1 min-h-[var(--pm-size-touch)] shrink-0 rounded-[var(--pm-radius-control-compact)] px-2 text-[length:var(--pm-font-size-compact)] font-semibold text-[var(--pm-brand-primary)] transition-colors [transition-duration:var(--pm-duration-fast)] active:bg-[var(--pm-brand-primary-soft)]',
  option: 'flex min-h-[var(--pm-date-option-min-height)] min-w-0 flex-col items-center justify-center rounded-[var(--pm-radius-control-compact)] border bg-[var(--pm-selection-card-bg)] px-2 py-2 text-[length:var(--pm-font-size-body)] font-medium tabular-nums transition-[border-color,color] [transition-duration:var(--pm-duration-fast)] motion-reduce:transition-none',
  selected: 'border-[var(--pm-selection-card-selected-border)] text-[var(--pm-brand-primary)]',
  unselected: 'border-[var(--pm-selection-card-border)] text-[var(--pm-text-secondary)]',
} as const;
