import type { EvaluationCardDisplaySettings } from '../types';

export interface LegacyEvaluationCardDisplaySettings {
  showPraiseCount?: boolean;
  showCriticismCount?: boolean;
}

export const DEFAULT_EVALUATION_CARD_DISPLAY_SETTINGS: EvaluationCardDisplaySettings = {
  showEvaluation: true,
  showPraise: true,
  showCriticism: true,
};

export const getEvaluationCardDisplaySettings = (
  settings?: Partial<EvaluationCardDisplaySettings> & LegacyEvaluationCardDisplaySettings,
): EvaluationCardDisplaySettings => {
  const migratedShowPraise = settings?.showPraise
    ?? settings?.showPraiseCount
    ?? DEFAULT_EVALUATION_CARD_DISPLAY_SETTINGS.showPraise;
  const migratedShowCriticism = settings?.showCriticism
    ?? settings?.showCriticismCount
    ?? DEFAULT_EVALUATION_CARD_DISPLAY_SETTINGS.showCriticism;
  const hasSelectedContent = migratedShowPraise || migratedShowCriticism;

  return {
    showEvaluation: settings?.showEvaluation ?? hasSelectedContent,
    showPraise: hasSelectedContent ? migratedShowPraise : true,
    showCriticism: hasSelectedContent ? migratedShowCriticism : true,
  };
};
