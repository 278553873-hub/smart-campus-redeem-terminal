import {
  teacherBrandCssVariables,
  teacherTypographySemantic,
  teacherEvaluationScoreSemantic,
  phoneSpace,
} from '../../mobile-app/styles/teacherMobileTokens';
import { parentMobileColorSemantic as color, parentGrowthColors, parentGrowthPaint, parentRecordSummaryColors } from './parentMobileColors';

export { parentMobilePalette, parentMobileColorSemantic, parentGrowthColors, parentGrowthPaint, parentRecordSummaryColors } from './parentMobileColors';
export const parentTypographySemantic = teacherTypographySemantic;
export const parentEvaluationScoreSemantic = teacherEvaluationScoreSemantic;
export const parentSpace = phoneSpace;

type TeacherVariable = keyof typeof teacherBrandCssVariables;
type ParentVariable<T extends string> = T extends `--tm-${infer Name}` ? `--pm-${Name}` : never;
type ParentBaseline = { [Key in TeacherVariable as ParentVariable<Key>]: string };
const toParentReference = (value: string) => value.replaceAll('--tm-', '--pm-');

/** 教师端全量令牌的同源副本：变量及引用一并更名，避免只复制数值后出现悬空引用。 */
export const parentTeacherBaselineVariables = Object.fromEntries(
  Object.entries(teacherBrandCssVariables).map(([key, value]) => [key.replace('--tm-', '--pm-'), toParentReference(value)]),
) as ParentBaseline;

// 仅替换阴影颜色，偏移、模糊、扩散和层数完全保留教师端值。
const tintShadow = (source: string, tint: string) => source.replace(/rgba?\([^)]*\)|#[\da-fA-F]{6,8}/g, tint);

/** 家长端相对教师基线的颜色差异白名单；尺寸与布局不得在这里覆盖。 */
export const parentMobileColorOverrides = {
  '--pm-bg-page-glass': color.controlGlass,
  '--pm-bg-surface-glass': color.cardGlass,
  '--pm-shadow-card': tintShadow(parentTeacherBaselineVariables['--pm-shadow-card'], parentGrowthColors.shadowCard),
  '--pm-shadow-control': tintShadow(parentTeacherBaselineVariables['--pm-shadow-control'], parentGrowthColors.shadowAction),
  '--pm-shadow-avatar': tintShadow(parentTeacherBaselineVariables['--pm-shadow-avatar'], parentGrowthColors.shadowAvatar),
} as const satisfies Partial<ParentBaseline>;

/** 家长专属绘制语义；仅取方案二配色，几何规则仍由教师基线/具体组件负责。 */
export const parentMobilePaintVariables = {
  '--pm-page-gradient': parentGrowthPaint.background,
  '--pm-bg-brand-soft': color.brandSurface,
  '--pm-border-brand-soft': color.brandBorder,
  '--pm-status-attention': color.alert,
  '--pm-status-attention-soft': color.secondarySoft,
  '--pm-growth-card-bg': color.cardGlass,
  '--pm-growth-evaluation-bg': parentGrowthPaint.evaluationBackground,
  '--pm-growth-evaluation-border': 'transparent',
  '--pm-growth-balance-bg': parentGrowthPaint.balanceBackground,
  '--pm-growth-message-bg': color.controlGlass,
  '--pm-growth-decoration-color': parentGrowthColors.orbit,
  '--pm-growth-decoration-soft-color': parentGrowthColors.orbitSoft,
  '--pm-growth-decoration-faint-color': parentGrowthColors.orbitFaint,
  '--pm-growth-shadow-card-color': parentGrowthColors.shadowCard,
  '--pm-growth-shadow-action-color': parentGrowthColors.shadowAction,
  '--pm-growth-shadow-avatar-color': parentGrowthColors.shadowAvatar,
  '--pm-growth-shadow-illustration-color': parentGrowthColors.shadowIllustration,
} as const;

/** 手机内容区规则：纯色子页沿用教师中性阴影，成长首页继续使用自己的配色。 */
export const parentMobileContentVariables = {
  '--pm-scrollbar-width': 'none',
  '--pm-scrollbar-size': '0px',
  '--pm-content-card-shadow': parentTeacherBaselineVariables['--pm-shadow-card'],
  '--pm-content-control-shadow': parentTeacherBaselineVariables['--pm-shadow-control'],
  '--pm-date-option-min-height': 'calc(var(--pm-date-row-height) + var(--pm-space-2))',
  '--pm-record-summary-total-bg': parentRecordSummaryColors.total.surface,
  '--pm-record-summary-total-text': parentRecordSummaryColors.total.text,
  '--pm-record-summary-praise-bg': parentRecordSummaryColors.praise.surface,
  '--pm-record-summary-praise-text': parentRecordSummaryColors.praise.text,
  '--pm-record-summary-improve-bg': parentRecordSummaryColors.improve.surface,
  '--pm-record-summary-improve-text': parentRecordSummaryColors.improve.text,
} as const;

/** 老组件命名兼容。每个别名指向现行教师同源语义，不再维护独立尺寸或选中态。 */
export const parentLegacyAliases = {
  '--pm-font-size-display': 'var(--pm-font-size-document-title)',
  '--pm-font-size-value': 'var(--pm-font-size-group-title)',
  '--pm-font-size-nav-title': 'var(--pm-font-size-section-title)',
  '--pm-radius-field': 'var(--pm-radius-control-compact)',
  '--pm-segment-track-bg': 'var(--pm-selection-segment-track-bg)',
  '--pm-segment-active-bg': 'var(--pm-selection-segment-active-bg)',
  '--pm-segment-active-text': 'var(--pm-selection-segment-active-text)',
  '--pm-segment-active-shadow': 'var(--pm-selection-segment-active-shadow)',
  '--pm-segment-inactive-text': 'var(--pm-selection-segment-inactive-text)',
  '--pm-select-card-active-bg': 'var(--pm-selection-card-selected-bg)',
  '--pm-select-card-active-border': 'var(--pm-selection-card-selected-border)',
  '--pm-select-card-active-text': 'var(--pm-selection-card-title-text)',
  '--pm-select-card-active-shadow': 'var(--pm-selection-card-shadow)',
  '--pm-icon-blue-gradient': 'var(--pm-brand-primary)',
  '--pm-icon-green-gradient': 'var(--pm-status-positive)',
  '--pm-icon-orange-gradient': 'var(--pm-brand-secondary)',
  '--pm-icon-soft-blue-gradient': 'var(--pm-brand-primary-soft)',
} as const;

export const parentMobileTokens = {
  ...parentTeacherBaselineVariables,
  ...parentMobileColorOverrides,
  ...parentMobilePaintVariables,
  ...parentMobileContentVariables,
  ...parentLegacyAliases,
} as const;

/** 公共组件仍读取 tm 变量：在家长根容器内桥接到 pm，不改写教师端全局主题。 */
export const parentSharedComponentBridge = Object.fromEntries(
  Object.keys(teacherBrandCssVariables).map(key => [key, `var(${key.replace('--tm-', '--pm-')})`]),
) as Record<TeacherVariable, string>;

export const parentMobileCssVariables = {
  ...parentSharedComponentBridge,
  ...parentMobileTokens,
} as const;
