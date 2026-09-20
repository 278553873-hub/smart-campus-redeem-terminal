import type { StudentCardDisplaySettings } from '../types';
import {
  DEFAULT_EVALUATION_CARD_DISPLAY_SETTINGS,
  getEvaluationCardDisplaySettings,
  type LegacyEvaluationCardDisplaySettings,
} from './evaluationCardDisplay';

export const DEFAULT_STUDENT_CARD_DISPLAY_SETTINGS: StudentCardDisplaySettings = {
  showLevel: true,
  levelForm: 'icon',
  ...DEFAULT_EVALUATION_CARD_DISPLAY_SETTINGS,
};

export const getStudentCardDisplaySettings = (
  settings?: Partial<StudentCardDisplaySettings> & LegacyEvaluationCardDisplaySettings,
): StudentCardDisplaySettings => ({
  showLevel: settings?.showLevel ?? DEFAULT_STUDENT_CARD_DISPLAY_SETTINGS.showLevel,
  levelForm: settings?.levelForm ?? DEFAULT_STUDENT_CARD_DISPLAY_SETTINGS.levelForm,
  ...getEvaluationCardDisplaySettings(settings),
});
