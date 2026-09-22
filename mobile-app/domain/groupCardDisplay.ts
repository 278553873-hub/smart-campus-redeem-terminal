import type { GroupCardDisplaySettings } from '../types';
import {
  DEFAULT_EVALUATION_CARD_DISPLAY_SETTINGS,
  getEvaluationCardDisplaySettings,
  type LegacyEvaluationCardDisplaySettings,
} from './evaluationCardDisplay';

export const DEFAULT_GROUP_CARD_DISPLAY_SETTINGS: GroupCardDisplaySettings = {
  ...DEFAULT_EVALUATION_CARD_DISPLAY_SETTINGS,
  showLevel: true,
  levelForm: 'icon',
};

export const getGroupCardDisplaySettings = (
  settings?: Partial<GroupCardDisplaySettings> & LegacyEvaluationCardDisplaySettings,
): GroupCardDisplaySettings => {
  const evaluationSettings = getEvaluationCardDisplaySettings(settings);
  return {
    ...evaluationSettings,
    showLevel: settings?.showLevel ?? DEFAULT_GROUP_CARD_DISPLAY_SETTINGS.showLevel,
    levelForm: settings?.levelForm ?? DEFAULT_GROUP_CARD_DISPLAY_SETTINGS.levelForm,
  };
};
