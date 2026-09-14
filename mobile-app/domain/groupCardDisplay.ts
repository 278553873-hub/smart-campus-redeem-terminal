import type { GroupCardDisplaySettings } from '../types';
import {
  DEFAULT_EVALUATION_CARD_DISPLAY_SETTINGS,
  getEvaluationCardDisplaySettings,
  type LegacyEvaluationCardDisplaySettings,
} from './evaluationCardDisplay';

export const DEFAULT_GROUP_CARD_DISPLAY_SETTINGS: GroupCardDisplaySettings = {
  ...DEFAULT_EVALUATION_CARD_DISPLAY_SETTINGS,
};

export const getGroupCardDisplaySettings = (
  settings?: Partial<GroupCardDisplaySettings> & LegacyEvaluationCardDisplaySettings,
): GroupCardDisplaySettings => getEvaluationCardDisplaySettings(settings);
