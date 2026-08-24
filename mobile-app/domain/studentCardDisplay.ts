import type { StudentCardDisplaySettings } from '../types';

export const DEFAULT_STUDENT_CARD_DISPLAY_SETTINGS: StudentCardDisplaySettings = {
  showLevel: true,
  showPraiseCount: true,
  showCriticismCount: true,
};

export const getStudentCardDisplaySettings = (
  settings?: Partial<StudentCardDisplaySettings>,
): StudentCardDisplaySettings => ({
  ...DEFAULT_STUDENT_CARD_DISPLAY_SETTINGS,
  ...settings,
});
