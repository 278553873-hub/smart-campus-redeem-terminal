import type { ParentEvaluationVisibilitySettings } from '../types';

export const DEFAULT_PARENT_EVALUATION_VISIBILITY: ParentEvaluationVisibilitySettings = {
  positive: 'summaryAndDetails',
  negative: 'summaryAndDetails',
};

export const getParentEvaluationVisibilitySettings = (
  settings?: Partial<ParentEvaluationVisibilitySettings>,
): ParentEvaluationVisibilitySettings => ({
  ...DEFAULT_PARENT_EVALUATION_VISIBILITY,
  ...settings,
});
