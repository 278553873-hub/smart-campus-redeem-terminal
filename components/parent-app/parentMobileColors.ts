import { teacherBrandPalette, teacherBrandSemantic } from '../../mobile-app/styles/teacherMobileTokens';

/** 基础色板继承教师端；家长端只提取成长页方案二的颜色，不提取字号、尺寸或布局。 */
export const parentMobilePalette = teacherBrandPalette;
const palette = parentMobilePalette;
const teacher = teacherBrandSemantic;

export const parentMobileColorSemantic = {
  ...teacher,
  // 通用页面底色沿用教师中性色；方案二的红橙底色仅由 parentGrowthColors 提供。
  // 普通表单和明细仍使用白色/浅暖灰分层；红橙浅底用于品牌强调区域。
  brandSurface: teacher.primarySoft,
  brandBorder: palette.red[200],
  alert: teacher.secondary,
  inverse: teacher.surface,
  cardGlass: `${teacher.surface}DF`,
  controlGlass: `${teacher.surface}91`,
} as const;

/** 成长记录的统计摘要专用浅色；待改进次数与明细扣分色分别表达。 */
export const parentRecordSummaryColors = {
  total: { surface: '#EDF5FD', text: '#326EA0' },
  praise: { surface: '#EAF8F2', text: '#18775D' },
  improve: { surface: '#FFF3E7', text: '#A45D2E' },
} as const;

/** 方案二的颜色与透明度。这里不允许出现宽高、字号、圆角、阴影偏移或插画设置。 */
export const parentGrowthColors = {
  ink: teacher.textPrimary,
  muted: teacher.textSecondary,
  brand: teacher.primaryStrong,
  positive: teacher.positive,
  actionStart: teacher.primary,
  actionEnd: teacher.primary,
  surface: teacher.primarySoft,
  border: palette.red[200],
  alert: teacher.secondary,
  inverse: teacher.surface,
  pageCoral: `${palette.red[300]}85`,
  pageCoralSoft: `${palette.red[200]}70`,
  pageApricot: palette.orange[200],
  pageApricotSoft: `${palette.orange[100]}90`,
  pageTop: palette.red[100],
  pageMiddle: teacher.primarySoft,
  pageBottom: teacher.surfaceSoft,
  evaluationStart: `${teacher.surface}ed`,
  evaluationEnd: `${teacher.primarySoft}e8`,
  evaluationBorderStart: palette.orange[200],
  evaluationBorderMiddle: palette.red[300],
  evaluationBorderEnd: palette.red[200],
  cardSurface: `${teacher.surface}DF`,
  balanceStart: teacher.primarySoft,
  balanceEnd: teacher.secondarySoft,
  messageSurface: `${teacher.surface}91`,
  shadowCard: `${teacher.primaryStrong}10`,
  shadowAction: `${teacher.primary}20`,
  shadowAvatar: `${teacher.primaryStrong}12`,
  shadowIllustration: `${teacher.primaryStrong}15`,
  orbit: `${teacher.surface}55`,
  orbitSoft: `${teacher.surface}15`,
  orbitFaint: `${teacher.surface}12`,
} as const;

const color = parentGrowthColors;
/** 配色配方仅定义画面填色，不设置控件结构、渐变区域大小或装饰形状。 */
export const parentGrowthPaint = {
  background: `radial-gradient(ellipse at 100% 16%,${color.pageCoral} 0,${color.pageCoralSoft} 24%,transparent 59%),radial-gradient(ellipse at 0 0,${color.pageApricot} 0,${color.pageApricotSoft} 28%,transparent 57%),linear-gradient(180deg,${color.pageTop},${color.pageMiddle} 48%,${color.pageBottom} 86%)`,
  evaluationBackground: `linear-gradient(115deg,${color.evaluationStart},${color.evaluationEnd}) padding-box,linear-gradient(125deg,${color.evaluationBorderStart},${color.evaluationBorderMiddle} 70%,${color.evaluationBorderEnd}) border-box`,
  balanceBackground: `linear-gradient(110deg,${color.balanceStart},${color.balanceEnd})`,
} as const;
