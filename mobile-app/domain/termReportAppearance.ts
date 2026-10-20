/** 报告封面配置：学校标识共享，学校与学段分别保存样式；素材集中存储，复制时不重复图片。 */
export const COVER_THEMES = ['gender', 'blue', 'violet', 'sage', 'sand'] as const;
export type CoverTheme = typeof COVER_THEMES[number];
export interface CoverImage { imageId: string; scale: number; layout: 'cutout' | 'scene' }
export interface CoverStyle {
  theme: CoverTheme;
  artwork: 'students' | 'preset' | 'custom' | 'none';
  preset?: { grade: string; gender: 'male' | 'female' };
  imageId?: string;
  splitByGender?: boolean;
  genderImages?: Partial<Record<'male' | 'female', CoverImage>>;
  imageLayout: 'cutout' | 'scene';
  imageScale: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  imageRotation?: number;
}
export interface CoverAsset { src: string; width: number; height: number; name: string }
export const REPORT_STAGES = [
  { id: 'primary-lower', label: '小学低段', grades: ['一年级', '二年级'] },
  { id: 'primary-middle', label: '小学中段', grades: ['三年级', '四年级'] },
  { id: 'primary-upper', label: '小学高段', grades: ['五年级', '六年级'] },
  { id: 'junior', label: '初中', grades: ['七年级', '八年级', '九年级'] },
  { id: 'high', label: '高中', grades: ['高一', '高二', '高三'] },
] as const;
export type ReportStageId = typeof REPORT_STAGES[number]['id'];
export interface ReportAppearance {
  version: 2;
  enabled: boolean;
  mode: 'school' | 'stage';
  schoolName: string;
  logoId?: string;
  defaultCover: CoverStyle;
  stages: Partial<Record<ReportStageId, CoverStyle>>;
  assets: Record<string, CoverAsset>;
}
export const DEFAULT_COVER_STYLE: CoverStyle = { theme: 'gender', artwork: 'students', imageLayout: 'cutout', imageScale: 100 };
export const COVER_THEME_LABELS: Record<CoverTheme, string> = { gender: '随性别', blue: '晴空蓝', violet: '浅藤紫', sage: '青竹绿', sand: '暖沙金' };
export const createReportAppearance = (schoolName = ''): ReportAppearance => ({ version: 2, enabled: false, mode: 'school', schoolName, defaultCover: { ...DEFAULT_COVER_STYLE }, stages: {}, assets: {} });
export function normalizeReportGrade(grade: string): string {
  const value = grade.trim().replace(/^小学/, '');
  const junior = /^初([一二三123])$/.exec(value);
  if (junior) return ({ 一: '七年级', 二: '八年级', 三: '九年级', '1': '七年级', '2': '八年级', '3': '九年级' } as Record<string, string>)[junior[1]];
  return value.replace(/^([1-9])年级$/, (_, number) => '一二三四五六七八九'[Number(number) - 1] + '年级');
}
export function reportStageForGrade(grade: string) {
  const normalized = normalizeReportGrade(grade);
  return REPORT_STAGES.find(stage => (stage.grades as readonly string[]).includes(normalized));
}
export function getReportStages(grades: readonly string[]) {
  return REPORT_STAGES.filter(stage => grades.some(grade => reportStageForGrade(grade)?.id === stage.id));
}
export const resolveStageCover = (config: ReportAppearance, stage: ReportStageId) => config.stages[stage] ?? config.defaultCover;
export function resolveCoverStyle(config: ReportAppearance, grade: string) {
  if (!config.enabled) return DEFAULT_COVER_STYLE;
  return simplifyReportAppearance(config).defaultCover;
}
export function setStageCover(config: ReportAppearance, stage: ReportStageId, style: CoverStyle): ReportAppearance {
  return { ...config, stages: { ...config.stages, [stage]: { ...style } } };
}
export function followSchoolCover(config: ReportAppearance, stage: ReportStageId): ReportAppearance {
  const stages = { ...config.stages };
  delete stages[stage];
  return { ...config, stages };
}
export function copyCoverToStages(config: ReportAppearance, style: CoverStyle, targets: ReportStageId[]): ReportAppearance {
  return targets.reduce((next, stage) => setStageCover(next, stage, style), config);
}
// 切换配置范围保留另一种模式的设置，便于恢复。
export const unifySchoolCover = (config: ReportAppearance, style: CoverStyle): ReportAppearance => ({ ...config, mode: 'school', defaultCover: { ...style } });
export function effectiveReportAppearance(config: ReportAppearance, schoolName: string): ReportAppearance {
  return config.enabled ? simplifyReportAppearance({ ...config, schoolName }) : createReportAppearance(schoolName);
}
/** 第一版个性化封面全校统一。保留旧学段素材，但不参与实际选图。 */
export function simplifyReportAppearance(config: ReportAppearance): ReportAppearance {
  const previous = config.defaultCover;
  const image = previous.imageId && config.assets[previous.imageId]
    ? { imageId: previous.imageId, scale: previous.imageScale, layout: previous.imageLayout }
    : previous.genderImages?.male ?? previous.genderImages?.female;
  const defaultCover: CoverStyle = {
    ...previous, splitByGender: false, theme: previous.theme === 'gender' ? 'blue' : previous.theme,
    ...(previous.artwork === 'custom' && image ? { imageId: image.imageId, imageScale: image.scale, imageLayout: image.layout } : {}),
    artwork: previous.artwork === 'students' ? 'none' : previous.artwork,
  };
  return { ...config, mode: 'school', defaultCover };
}
export const normalizeCoverRotation = (degrees: number) => Number.isFinite(degrees) ? ((degrees + 180) % 360 + 360) % 360 - 180 : 0;
export function constrainCoverPlacement(scale: number, x = 0, y = 0) {
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0));
  return { imageScale: clamp(scale, 10, 400), imageOffsetX: clamp(x, -250, 250), imageOffsetY: clamp(y, -250, 250) };
}
export function resolveCoverImage(style: CoverStyle, gender: 'male' | 'female'): CoverImage | undefined {
  if (style.artwork !== 'custom') return undefined;
  if (style.splitByGender) return style.genderImages?.[gender];
  return style.imageId ? { imageId: style.imageId, scale: style.imageScale, layout: style.imageLayout } : undefined;
}
export function validateReportAppearance(config: ReportAppearance): string | null {
  if (config.version !== 2 || typeof config.enabled !== 'boolean' || !['school', 'stage'].includes(config.mode)) return '封面配置无效，请重试。';
  if (!config.schoolName.trim() || config.schoolName.length > 40) return '请填写学校名称，最多 40 个字。';
  for (const style of [config.defaultCover, ...Object.values(config.stages)]) {
    if (!COVER_THEMES.includes(style.theme) || !['students', 'preset', 'custom', 'none'].includes(style.artwork) || !['cutout', 'scene'].includes(style.imageLayout)) return '封面样式无效，请重新选择。';
    if (!Number.isFinite(style.imageScale) || style.imageScale < 10 || style.imageScale > 400) return '主图大小应在 10% 至 400% 之间。';
    if (!Number.isFinite(style.imageRotation ?? 0) || Math.abs(style.imageRotation ?? 0) > 180) return '图片角度无效，请重新调整。';
    if ([style.imageOffsetX ?? 0, style.imageOffsetY ?? 0].some(value => !Number.isFinite(value) || Math.abs(value) > 250)) return '图片位置超出可调整范围。';
    if (style.artwork === 'preset' && (!style.preset || !['一年级', '三年级', '五年级', '七年级'].includes(style.preset.grade) || !['male', 'female'].includes(style.preset.gender))) return '请选择指定插画。';
    if (style.artwork === 'custom') {
      for (const gender of ['male', 'female'] as const) {
        const image = resolveCoverImage(style, gender);
        if (!image || !config.assets[image.imageId]) return style.splitByGender ? `请上传${gender === 'male' ? '男生' : '女生'}封面。` : '请上传封面图。';
        if (!Number.isFinite(image.scale) || image.scale < 10 || image.scale > 400 || !['cutout', 'scene'].includes(image.layout)) return '图片设置无效，请重新调整。';
      }
    }
  }
  if (config.logoId && !config.assets[config.logoId]) return '学校标识未加载，请重新上传。';
  return null;
}
export function pruneCoverAssets(config: ReportAppearance): ReportAppearance {
  const used = new Set([config.logoId, ...[config.defaultCover, ...Object.values(config.stages)].filter(style => style.artwork === 'custom').flatMap(style => [style.imageId, style.genderImages?.male?.imageId, style.genderImages?.female?.imageId])]);
  return { ...config, schoolName: config.schoolName.trim(), assets: Object.fromEntries(Object.entries(config.assets).filter(([id]) => used.has(id))) };
}
