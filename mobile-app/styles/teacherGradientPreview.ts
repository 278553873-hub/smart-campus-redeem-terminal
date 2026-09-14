import { questionnaireThemeOptions } from '../../shared/questionnaireThemeTokens';
import {
  teacherBrandPalette,
  teacherBrandSemantic,
  teacherReportChartPalette,
} from './teacherMobileTokens';

const questionnaireThemeSwatch = (id: 'growth-green' | 'learning-blue') => (
  questionnaireThemeOptions.find(option => option.id === id)?.swatch ?? teacherBrandSemantic.primary
);

const learningBlue = questionnaireThemeSwatch('learning-blue');

const teacherGradientSchemes = [
  { id: 'scheme-1', label: '方案一 · 青蓝平衡', toneA: learningBlue, toneB: teacherBrandPalette.jade[500], toneC: teacherBrandPalette.red[500], baseTop: teacherReportChartPalette.sky.soft },
  { id: 'scheme-2', label: '方案二 · 蓝金晨光', toneA: teacherReportChartPalette.sky.fill, toneB: teacherBrandPalette.gold[500], toneC: teacherBrandPalette.red[500], baseTop: teacherBrandPalette.gold[50] },
  { id: 'scheme-3', label: '方案三 · 翡翠成长', toneA: teacherBrandPalette.jade[500], toneB: teacherBrandPalette.green[500], toneC: teacherBrandPalette.red[500], baseTop: teacherBrandPalette.jade[50] },
  { id: 'scheme-4', label: '方案四 · 金青清风', toneA: teacherBrandPalette.gold[500], toneB: teacherReportChartPalette.cyan.fill, toneC: teacherBrandPalette.red[500], baseTop: teacherBrandPalette.gold[50] },
  { id: 'scheme-5', label: '方案五 · 蓝绿清晨', toneA: teacherReportChartPalette.sky.fill, toneB: teacherBrandPalette.green[500], toneC: teacherBrandPalette.red[500], baseTop: teacherBrandPalette.green[50] },
  { id: 'scheme-6', label: '方案六 · 红青平衡', toneA: teacherBrandPalette.red[500], toneB: teacherReportChartPalette.cyan.fill, toneC: teacherBrandPalette.gold[500], baseTop: teacherBrandPalette.red[50] },
  { id: 'scheme-7', label: '方案七 · 红金暖阳', toneA: teacherBrandPalette.red[500], toneB: teacherBrandPalette.gold[500], toneC: teacherBrandPalette.orange[500], baseTop: teacherBrandPalette.red[50] },
  { id: 'scheme-8', label: '方案八 · 红蓝清晖', toneA: teacherBrandPalette.red[500], toneB: teacherReportChartPalette.sky.fill, toneC: teacherBrandPalette.jade[500], baseTop: teacherBrandPalette.red[50] },
  { id: 'scheme-9', label: '方案九 · 红绿朝气', toneA: teacherBrandPalette.red[500], toneB: teacherBrandPalette.green[500], toneC: teacherReportChartPalette.coral.fill, baseTop: teacherReportChartPalette.coral.soft },
  { id: 'scheme-10', label: '方案十 · 橙绿活力', toneA: teacherBrandPalette.orange[500], toneB: teacherBrandPalette.green[500], toneC: teacherBrandPalette.red[500], baseTop: teacherBrandPalette.orange[50] },
  { id: 'scheme-11', label: '方案十一 · 红蓝清透', toneA: teacherBrandPalette.red[500], toneB: teacherReportChartPalette.sky.fill, toneC: teacherBrandPalette.red[500], baseTop: teacherBrandSemantic.surface, cleanDiffuse: true },
  { id: 'scheme-exclusive', label: '小班化专属', toneA: teacherBrandSemantic.surface, toneB: teacherBrandSemantic.surface, toneC: teacherBrandSemantic.surface, baseTop: teacherBrandSemantic.surface, imageUrl: '/assets/teacher-style-exclusive.png' },
] as const;

export type TeacherGradientSchemeId = typeof teacherGradientSchemes[number]['id'];

export const teacherGradientSchemeOptions: ReadonlyArray<{
  id: TeacherGradientSchemeId;
  label: string;
}> = teacherGradientSchemes.map(({ id, label }) => ({ id, label }));

export const teacherGradientStyleOptions = [
  { id: 'diffuse', label: '弥散' },
  { id: 'linear', label: '线性' },
  { id: 'aurora', label: '极光' },
  { id: 'conic', label: '柔旋' },
] as const;

export type TeacherGradientStyleId = typeof teacherGradientStyleOptions[number]['id'];

export interface TeacherGradientPreviewConfig {
  schemeId: TeacherGradientSchemeId;
  styleId: TeacherGradientStyleId;
}

export const defaultTeacherGradientPreview: TeacherGradientPreviewConfig = {
  schemeId: 'scheme-6',
  styleId: 'diffuse',
};

// 家长手机端沿用教师端同一套预览方案，但默认采用方案八的红蓝弥散基调。
// 具体颜色与渐变算法仍只维护在本文件，避免家长端复制出第二套视觉数值。
export const defaultParentGradientPreview: TeacherGradientPreviewConfig = {
  schemeId: 'scheme-8',
  styleId: 'diffuse',
};

const withAlpha = (hex: string, opacity: number) => {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
};

export interface TeacherGradientPreviewVisual {
  backgroundColor: string;
  backgroundImage: string;
  overlayBackgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
}

export type TeacherGradientDirection = 'forward' | 'reverse';

export const getTeacherGradientPreviewVisual = ({
  schemeId,
  styleId,
}: TeacherGradientPreviewConfig, direction: TeacherGradientDirection = 'forward'): TeacherGradientPreviewVisual => {
  const scheme = teacherGradientSchemes.find(item => item.id === schemeId)
    ?? teacherGradientSchemes.find(item => item.id === defaultTeacherGradientPreview.schemeId)
    ?? teacherGradientSchemes[0];
  const { toneA, toneB, toneC, baseTop } = scheme;
  const leadingTone = direction === 'reverse' ? toneB : toneA;
  const trailingTone = direction === 'reverse' ? toneA : toneB;

  if ('imageUrl' in scheme && scheme.imageUrl) {
    const underlayScheme = teacherGradientSchemes.find(item => item.id === 'scheme-2') ?? scheme;
    const underlayLeadingTone = direction === 'reverse' ? underlayScheme.toneB : underlayScheme.toneA;
    const underlayTrailingTone = direction === 'reverse' ? underlayScheme.toneA : underlayScheme.toneB;
    const underlayTailWash = `linear-gradient(180deg, transparent 52%, ${withAlpha(underlayTrailingTone, 0.05)} 100%)`;
    return {
      backgroundColor: underlayScheme.baseTop,
      backgroundImage: [
        `url(${scheme.imageUrl})`,
        underlayTailWash,
        `radial-gradient(ellipse 84% 50% at -8% 24%, ${withAlpha(underlayLeadingTone, 0.16)} 0%, transparent 72%)`,
        `radial-gradient(ellipse 82% 52% at 108% 34%, ${withAlpha(underlayTrailingTone, 0.14)} 0%, transparent 74%)`,
        `radial-gradient(ellipse 44% 24% at 20% -2%, ${withAlpha(underlayScheme.toneC, 0.04)} 0%, transparent 70%)`,
        `linear-gradient(180deg, ${underlayScheme.baseTop} 0%, ${teacherBrandSemantic.pageMid} 52%, ${teacherBrandSemantic.surface} 82%)`,
      ].join(', '),
      backgroundSize: 'contain, auto, auto, auto, auto, auto',
      backgroundPosition: 'center bottom, center, center, center, center, center',
      backgroundRepeat: 'no-repeat',
    };
  }

  const tailWash = `linear-gradient(180deg, transparent 52%, ${withAlpha(trailingTone, 0.05)} 100%)`;

  if (styleId === 'linear') {
    return {
      backgroundColor: baseTop,
      backgroundImage: [
        tailWash,
        `linear-gradient(180deg, transparent 0%, transparent 38%, ${withAlpha(teacherBrandSemantic.surface, 0.52)} 64%, ${teacherBrandSemantic.surface} 86%)`,
        `linear-gradient(142deg, ${withAlpha(toneC, 0.05)} 0%, ${withAlpha(leadingTone, 0.15)} 42%, ${withAlpha(trailingTone, 0.14)} 72%, ${teacherBrandSemantic.surface} 100%)`,
      ].join(', '),
    };
  }

  if (styleId === 'aurora') {
    return {
      backgroundColor: baseTop,
      backgroundImage: [
        tailWash,
        `radial-gradient(ellipse 42% 22% at 8% 0%, ${withAlpha(toneC, 0.035)} 0%, transparent 72%)`,
        `linear-gradient(180deg, ${baseTop} 0%, ${teacherBrandSemantic.pageMid} 58%, ${teacherBrandSemantic.surface} 84%)`,
      ].join(', '),
      overlayBackgroundImage: `linear-gradient(108deg, transparent 4%, ${withAlpha(leadingTone, 0.2)} 20%, transparent 38%, ${withAlpha(trailingTone, 0.18)} 58%, transparent 76%, ${withAlpha(toneC, 0.1)} 90%, transparent 98%)`,
    };
  }

  if (styleId === 'conic') {
    return {
      backgroundColor: baseTop,
      backgroundImage: [
        tailWash,
        `linear-gradient(180deg, transparent 0%, ${withAlpha(teacherBrandSemantic.surface, 0.18)} 36%, ${teacherBrandSemantic.surface} 84%)`,
        `radial-gradient(circle at 50% 28%, ${withAlpha(teacherBrandSemantic.surface, 0.56)} 0%, transparent 42%)`,
        `conic-gradient(from 218deg at 50% 26%, ${withAlpha(toneC, 0.07)}, ${withAlpha(leadingTone, 0.14)}, ${withAlpha(trailingTone, 0.13)}, ${withAlpha(leadingTone, 0.1)}, ${withAlpha(toneC, 0.07)})`,
      ].join(', '),
    };
  }

  if ('cleanDiffuse' in scheme && scheme.cleanDiffuse) {
    return {
      backgroundColor: teacherBrandSemantic.surface,
      backgroundImage: [
        tailWash,
        `radial-gradient(ellipse 62% 42% at -12% 22%, ${withAlpha(leadingTone, 0.11)} 0%, transparent 70%)`,
        `radial-gradient(ellipse 60% 44% at 112% 30%, ${withAlpha(trailingTone, 0.1)} 0%, transparent 72%)`,
        `linear-gradient(180deg, ${teacherBrandSemantic.surface} 0%, ${teacherBrandSemantic.pageMid} 56%, ${teacherBrandSemantic.surface} 86%)`,
      ].join(', '),
    };
  }

  return {
    backgroundColor: baseTop,
    backgroundImage: [
      tailWash,
      `radial-gradient(ellipse 84% 50% at -8% 24%, ${withAlpha(leadingTone, 0.16)} 0%, transparent 72%)`,
      `radial-gradient(ellipse 82% 52% at 108% 34%, ${withAlpha(trailingTone, 0.14)} 0%, transparent 74%)`,
      `radial-gradient(ellipse 44% 24% at 20% -2%, ${withAlpha(toneC, 0.04)} 0%, transparent 70%)`,
      `linear-gradient(180deg, ${baseTop} 0%, ${teacherBrandSemantic.pageMid} 52%, ${teacherBrandSemantic.surface} 82%)`,
    ].join(', '),
  };
};
