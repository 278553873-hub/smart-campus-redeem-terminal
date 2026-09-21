import { teacherBrandCssVariables } from '../../mobile-app/styles/teacherMobileTokens';

/**
 * 家长端 Token（设计令牌）
 *
 * 家长端现在直接采用教师手机端的 Token（设计令牌）值和节奏，保留 pm 前缀只是为了隔离业务代码：
 * - 所有颜色、字号、圆角、阴影、间距和动效均映射到教师端 --tm-*；
 * - 教师端品牌红与家长端保持一致，形成同一产品套件的统一识别；
 * - 业务页面仍只消费家长端语义名，后续可在不改页面结构的情况下做角色级调整。
 */
export const parentMobileCssVariables = {
  ...teacherBrandCssVariables,
  '--pm-brand-primary': 'var(--tm-brand-primary)',
  '--pm-brand-primary-strong': 'var(--tm-brand-primary-strong)',
  '--pm-brand-primary-hover': 'var(--tm-brand-primary-hover)',
  '--pm-brand-primary-pressed': 'var(--tm-brand-primary-pressed)',
  '--pm-brand-primary-soft': '#FEF2F2',
  '--pm-brand-primary-soft-strong': 'var(--tm-brand-primary-soft-strong)',
  '--pm-brand-secondary': 'var(--tm-brand-secondary)',
  '--pm-brand-secondary-strong': 'var(--tm-brand-secondary-strong)',
  '--pm-brand-secondary-soft': 'var(--tm-brand-secondary-soft)',
  '--pm-brand-reward': 'var(--tm-brand-reward)',
  '--pm-brand-reward-strong': 'var(--tm-brand-reward-strong)',
  '--pm-brand-reward-soft': 'var(--tm-brand-reward-soft)',
  '--pm-status-positive': 'var(--tm-status-positive)',
  '--pm-status-positive-strong': 'var(--tm-status-positive-strong)',
  '--pm-status-positive-soft': 'var(--tm-status-positive-soft)',
  '--pm-status-negative': 'var(--tm-status-negative)',
  '--pm-status-negative-strong': 'var(--tm-status-negative-strong)',
  '--pm-status-negative-soft': 'var(--tm-status-negative-soft)',
  '--pm-status-attention': 'var(--tm-brand-secondary)',
  '--pm-status-attention-soft': 'var(--tm-brand-secondary-soft)',
  // 家长端专属底色：解绑教师端办公低饱和暖灰(#F8F6F5)，升级为清透亮白渐变，彻底告别沉闷发灰
  '--pm-bg-page': '#F8FAFC',
  '--pm-bg-page-low': '#F1F5F9',
  '--pm-page-gradient': 'linear-gradient(180deg, #FAFCFE 0%, #F5F7FA 52%, #EFF3F8 100%)',
  '--pm-bg-surface': '#FFFFFF',
  // 容器次级浅底：升级为轻盈通透的纯净微冷浅底，去除生硬死灰块
  '--pm-bg-surface-soft': '#F4F7FA',
  '--pm-bg-surface-muted': 'rgba(15, 23, 42, 0.05)',
  '--pm-text-primary': 'var(--tm-text-primary)',
  '--pm-text-secondary': '#334155',
  '--pm-text-tertiary': '#64748B',
  '--pm-text-disabled': 'var(--tm-text-disabled)',
  '--pm-text-inverse': 'var(--tm-text-inverse)',
  '--pm-nav-item-default': 'var(--tm-nav-item-default)',
  // 细边框描边：从生硬的泥灰线条细化为通透微羽化轻描边
  '--pm-border-subtle': 'rgba(226, 232, 240, 0.75)',
  '--pm-border-control': 'rgba(203, 213, 225, 0.8)',
  // 分段选择与Tab切换专属令牌：告别水泥灰槽，升级为正常的一体化纯白底轨 + 品牌红高质感滑块
  '--pm-segment-track-bg': '#FFFFFF',
  '--pm-segment-active-bg': 'var(--pm-brand-primary)',
  '--pm-segment-active-shadow': '0 1px 3px rgba(224, 39, 39, 0.25)',
  '--pm-segment-active-text': '#FFFFFF',
  '--pm-segment-inactive-text': 'var(--pm-text-secondary)',
  // 选项卡片专属令牌：纯白底 + 1px 精细品牌描边（告别厚重粗边框与廉价淡粉红），配柔和微光晕
  '--pm-select-card-active-bg': '#FFFFFF',
  '--pm-select-card-active-border': 'var(--pm-brand-primary)',
  '--pm-select-card-active-text': 'var(--pm-brand-primary-strong)',
  '--pm-select-card-active-shadow': '0 2px 8px -1px rgba(224, 39, 39, 0.08)',
  '--pm-focus-ring': 'var(--tm-focus-ring)',
  '--pm-mask': 'var(--tm-mask)',
  '--pm-icon-blue-gradient': 'var(--tm-brand-primary)',
  '--pm-icon-green-gradient': 'var(--tm-status-positive)',
  '--pm-icon-orange-gradient': 'var(--tm-brand-secondary)',
  '--pm-icon-soft-blue-gradient': 'var(--tm-brand-primary-soft)',
  // 短数字输入/展示框专属令牌：8px 圆角配 52px 高度，表单更紧致，不显松散
  '--pm-radius-field': '8px',
  '--pm-radius-control': 'var(--tm-radius-control)',
  '--pm-radius-inner': 'var(--tm-radius-inner)',
  '--pm-radius-card': 'var(--tm-radius-card)',
  '--pm-radius-sheet': 'var(--tm-radius-sheet)',
  '--pm-size-touch': 'var(--tm-size-touch)',
  '--pm-font-size-page-title': 'var(--tm-font-size-page-title)',
  '--pm-font-size-section-title': 'var(--tm-font-size-section-title)',
  '--pm-font-size-card-title': 'var(--tm-font-size-card-title)',
  '--pm-font-size-body': 'var(--tm-font-size-body)',
  '--pm-font-size-compact': 'var(--tm-font-size-compact)',
  '--pm-font-size-meta': 'var(--tm-font-size-meta)',
  '--pm-font-size-metric': 'var(--tm-font-size-metric)',
  '--pm-font-size-display': 'var(--tm-font-size-document-title)',
  '--pm-font-size-value': 'var(--tm-font-size-group-title)',
  '--pm-font-weight-regular': 'var(--tm-font-weight-regular)',
  '--pm-font-weight-semibold': 'var(--tm-font-weight-semibold)',
  '--pm-font-weight-bold': 'var(--tm-font-weight-bold)',
  '--pm-space-1': 'var(--tm-space-1)',
  '--pm-space-2': 'var(--tm-space-2)',
  '--pm-space-3': 'var(--tm-space-3)',
  '--pm-space-4': 'var(--tm-space-4)',
  '--pm-space-5': 'var(--tm-space-5)',
  '--pm-space-6': 'var(--tm-space-6)',
  '--pm-space-8': 'var(--tm-space-8)',
  '--pm-shadow-card': 'var(--tm-shadow-card)',
  '--pm-shadow-avatar': 'var(--tm-shadow-avatar)',
  '--pm-shadow-control': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
  '--pm-shadow-floating': 'var(--tm-shadow-floating)',
  '--pm-shadow-sheet': 'var(--tm-shadow-sheet)',
  '--pm-shadow-navigation': 'var(--tm-shadow-navigation)',
  '--pm-duration-fast': 'var(--tm-duration-fast)',
  '--pm-duration-standard': 'var(--tm-duration-standard)',
} as const;

export const parentSurface = {
  background: 'bg-[var(--pm-page-gradient)]',
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
  track: 'bg-[var(--pm-bg-surface)] border border-[var(--pm-border-subtle)] p-1 rounded-[var(--pm-radius-inner)] shadow-sm',
  active: 'bg-[var(--pm-brand-primary)] text-white font-bold rounded-[var(--pm-radius-control)] [box-shadow:0_1px_3px_rgba(224,39,39,0.25)]',
  inactive: 'text-[var(--pm-text-secondary)] font-medium active:bg-slate-50',
} as const;

export const parentSelectCardTone = {
  active: 'border border-[var(--pm-select-card-active-border)] bg-[var(--pm-select-card-active-bg)] text-[var(--pm-select-card-active-text)] [box-shadow:var(--pm-select-card-active-shadow)] font-bold',
  inactive: 'border border-[var(--pm-border-subtle)] bg-[var(--pm-bg-surface)] text-[var(--pm-text-secondary)] active:bg-[var(--pm-bg-surface-soft)]',
} as const;
