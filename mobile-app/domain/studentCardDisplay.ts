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

// 演示学校基础分；接入学校计分配置时由数据层提供实际值。
export const DEMO_STUDENT_BASE_SCORE = 100;

export const STUDENT_TOTAL_DISPLAY_OPTIONS = [
  { value: 'icon', label: '图标' },
  { value: 'score', label: '总分' },
  { value: 'scoreWithBase', label: '总分+基础分' },
] as const;

export const getStudentCardTotalScore = (
  netScore: number,
  levelForm: StudentCardDisplaySettings['levelForm'],
  baseScore: number,
): number => netScore + (levelForm === 'scoreWithBase' ? baseScore : 0);
