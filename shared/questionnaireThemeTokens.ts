import learningHeader from '../mobile-app/assets/resources/highlight-defaults/daily-classroom-thinking.png';
import growthHeader from '../mobile-app/assets/resources/highlight-defaults/daily-default-growth.png';
import sportsHeader from '../mobile-app/assets/resources/highlight-defaults/daily-sports-vitality.png';
import creativityHeader from '../mobile-app/assets/resources/highlight-defaults/daily-art-creativity.png';
import ambientFlowHeader from '../mobile-app/assets/resources/header-defaults/ambient-flow.png';
import ambientTechHeader from '../mobile-app/assets/resources/header-defaults/ambient-tech.png';

export const questionnaireThemePalette = {
  red: {
    50: '#FFF1F1',
    100: '#FFE2E2',
    200: '#FFC7C7',
    500: '#E02727',
    600: '#CC2020',
    700: '#BA352E',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F8F6F5',
    100: '#F1EEEC',
    200: '#E7E2DF',
    400: '#A49C97',
    450: '#918985',
    500: '#6D6764',
    550: '#7B7572',
    900: '#171513',
  },
  green: {
    50: '#F4FBF4',
    500: '#48A04D',
    700: '#2E7D32',
  },
} as const;

export type QuestionnaireThemeId = 'classic-red' | 'growth-green' | 'learning-blue';
export type QuestionnaireHeaderImageId = 'none' | 'ambient-flow' | 'ambient-tech' | 'learning' | 'growth' | 'sports' | 'creativity';

export const questionnaireHeaderImageOptions: Array<{
  id: QuestionnaireHeaderImageId;
  label: string;
  image?: string;
}> = [
  { id: 'none', label: '无头图' },
  { id: 'ambient-flow', label: '通用头图一', image: ambientFlowHeader },
  { id: 'ambient-tech', label: '通用头图二', image: ambientTechHeader },
  { id: 'learning', label: '学习探索', image: learningHeader },
  { id: 'growth', label: '成长记录', image: growthHeader },
  { id: 'sports', label: '活力运动', image: sportsHeader },
  { id: 'creativity', label: '兴趣创造', image: creativityHeader },
];

export const getQuestionnaireHeaderImage = (headerImageId: QuestionnaireHeaderImageId = 'none') => (
  questionnaireHeaderImageOptions.find(option => option.id === headerImageId)?.image
);

export const getQuestionnaireThemeIdForArchiveTheme = (themeId?: string): QuestionnaireThemeId => ({
  sky: 'learning-blue',
  leaf: 'growth-green',
}[themeId ?? ''] as QuestionnaireThemeId | undefined) ?? 'classic-red';

export const questionnaireThemeOptions: Array<{
  id: QuestionnaireThemeId;
  label: string;
  swatch: string;
}> = [
  { id: 'classic-red', label: '经典红', swatch: '#E02727' },
  { id: 'growth-green', label: '成长绿', swatch: '#4D8F63' },
  { id: 'learning-blue', label: '学习蓝', swatch: '#477EAE' },
];

const questionnaireThemeAccent: Record<QuestionnaireThemeId, {
  primary: string;
  strong: string;
  soft: string;
  softStrong: string;
  page: string;
  focusRing: string;
}> = {
  'classic-red': {
    primary: questionnaireThemePalette.red[500],
    strong: questionnaireThemePalette.red[700],
    soft: questionnaireThemePalette.red[50],
    softStrong: questionnaireThemePalette.red[100],
    page: questionnaireThemePalette.neutral[50],
    focusRing: 'rgba(224, 39, 39, 0.16)',
  },
  'growth-green': {
    primary: '#4D8F63',
    strong: '#356D49',
    soft: '#EEF7F0',
    softStrong: '#DCECDF',
    page: '#F5F9F5',
    focusRing: 'rgba(77, 143, 99, 0.18)',
  },
  'learning-blue': {
    primary: '#477EAE',
    strong: '#315F88',
    soft: '#EEF5FA',
    softStrong: '#DCEAF4',
    page: '#F4F8FB',
    focusRing: 'rgba(71, 126, 174, 0.18)',
  },
};

export const getQuestionnaireThemeCssVariables = (
  themeId: QuestionnaireThemeId = 'classic-red',
  options?: { inputAppearance?: 'theme' | 'teacher-mobile' },
) => {
  const accent = questionnaireThemeAccent[themeId] ?? questionnaireThemeAccent['classic-red'];
  const useTeacherMobileInput = options?.inputAppearance === 'teacher-mobile';
  return {
  '--tm-brand-primary': accent.primary,
  '--tm-brand-primary-strong': accent.strong,
  '--tm-brand-primary-pressed': accent.strong,
  '--tm-brand-primary-soft': accent.soft,
  '--tm-brand-primary-soft-strong': accent.softStrong,
  '--tm-status-positive': questionnaireThemePalette.green[500],
  '--tm-status-positive-strong': questionnaireThemePalette.green[700],
  '--tm-status-positive-soft': questionnaireThemePalette.green[50],
  '--tm-status-negative': questionnaireThemePalette.red[500],
  '--tm-status-negative-strong': questionnaireThemePalette.red[700],
  '--tm-status-negative-soft': questionnaireThemePalette.red[50],
  '--tm-bg-page': accent.page,
  '--tm-bg-surface': questionnaireThemePalette.neutral[0],
  '--tm-bg-surface-soft': questionnaireThemePalette.neutral[50],
  '--tm-bg-surface-muted': questionnaireThemePalette.neutral[100],
  '--tm-bg-page-glass': 'rgba(255, 249, 246, 0.92)',
  '--tm-bg-surface-glass': 'rgba(255, 255, 255, 0.92)',
  '--tm-text-primary': questionnaireThemePalette.neutral[900],
  '--tm-text-secondary': questionnaireThemePalette.neutral[500],
  '--tm-text-tertiary': questionnaireThemePalette.neutral[550],
  '--tm-text-disabled': questionnaireThemePalette.neutral[400],
  '--tm-text-inverse': questionnaireThemePalette.neutral[0],
  '--tm-border-subtle': questionnaireThemePalette.neutral[200],
  '--tm-border-control': questionnaireThemePalette.neutral[450],
  '--tm-input-bg': questionnaireThemePalette.neutral[0],
  '--tm-input-border': useTeacherMobileInput ? questionnaireThemePalette.neutral[200] : questionnaireThemePalette.neutral[450],
  '--tm-input-text': questionnaireThemePalette.neutral[900],
  '--tm-input-placeholder': questionnaireThemePalette.neutral[550],
  '--tm-questionnaire-progress': questionnaireThemePalette.neutral[900],
  '--tm-focus-ring': accent.primary,
  '--tm-input-focus-border': useTeacherMobileInput ? questionnaireThemePalette.neutral[200] : accent.primary,
  '--tm-input-focus-ring': useTeacherMobileInput ? 'transparent' : accent.focusRing,
  '--tm-mask': 'rgba(23, 21, 19, 0.42)',
  '--tm-shadow-card': '0 10px 28px -20px rgba(64, 60, 58, 0.18)',
  '--tm-shadow-control': '0 6px 16px -12px rgba(64, 60, 58, 0.18)',
  '--tm-shadow-sheet': '0 -20px 52px -34px rgba(64, 60, 58, 0.18)',
  '--tm-radius-control': '12px',
  '--tm-radius-inner': '16px',
  '--tm-radius-card': '20px',
  '--tm-radius-sheet': '28px',
  '--tm-size-touch': '44px',
  '--tm-font-size-page-title': '22px',
  '--tm-font-size-document-title': '22px',
  '--tm-font-size-group-title': '18px',
  '--tm-font-size-form-group-label': '14px',
  '--tm-font-size-question-title': '16px',
  '--tm-font-size-control': '14px',
  '--tm-font-size-section-title': '17px',
  '--tm-font-size-card-title': '15px',
  '--tm-font-size-body': '14px',
  '--tm-font-size-compact': '13px',
  '--tm-font-size-meta': '12px',
  '--tm-font-size-badge': '11px',
  '--tm-duration-fast': '150ms',
  '--tm-duration-panel': '300ms',
} satisfies Record<`--${string}`, string>;
};

export const questionnaireThemeCssVariables = getQuestionnaireThemeCssVariables();
