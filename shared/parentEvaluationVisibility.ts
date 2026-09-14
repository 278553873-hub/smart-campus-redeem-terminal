export type ParentEvaluationVisibility = 'hidden' | 'summary' | 'summaryAndDetails';

export interface ParentEvaluationVisibilitySettings {
  positive: ParentEvaluationVisibility;
  negative: ParentEvaluationVisibility;
}

export const DEFAULT_PARENT_EVALUATION_VISIBILITY: ParentEvaluationVisibilitySettings = {
  positive: 'summary',
  negative: 'hidden',
};

export const PARENT_EVALUATION_VISIBILITY_UPDATED_EVENT = 'parent-evaluation-visibility-updated';

const STORAGE_KEY = 'campus-parent-evaluation-visibility:v1';
const VISIBILITY_VALUES = new Set<ParentEvaluationVisibility>([
  'hidden',
  'summary',
  'summaryAndDetails',
]);

const isVisibility = (value: unknown): value is ParentEvaluationVisibility => (
  typeof value === 'string' && VISIBILITY_VALUES.has(value as ParentEvaluationVisibility)
);

export const getParentEvaluationVisibilitySettings = (
  settings?: Partial<ParentEvaluationVisibilitySettings> | null,
): ParentEvaluationVisibilitySettings => ({
  positive: isVisibility(settings?.positive)
    ? settings.positive
    : DEFAULT_PARENT_EVALUATION_VISIBILITY.positive,
  negative: isVisibility(settings?.negative)
    ? settings.negative
    : DEFAULT_PARENT_EVALUATION_VISIBILITY.negative,
});

export const canShowParentEvaluationSummary = (visibility: ParentEvaluationVisibility) => (
  visibility !== 'hidden'
);

export const canShowParentEvaluationDetails = (visibility: ParentEvaluationVisibility) => (
  visibility === 'summaryAndDetails'
);

type VisibilityStore = Record<string, Partial<ParentEvaluationVisibilitySettings>>;

const readStore = (): VisibilityStore => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as VisibilityStore
      : {};
  } catch {
    return {};
  }
};

export const readParentEvaluationVisibility = (
  classId: string,
): ParentEvaluationVisibilitySettings => (
  getParentEvaluationVisibilitySettings(readStore()[classId])
);

export const writeParentEvaluationVisibility = (
  classId: string,
  settings: ParentEvaluationVisibilitySettings,
) => {
  const normalized = getParentEvaluationVisibilitySettings(settings);
  if (typeof window === 'undefined') return normalized;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...readStore(),
    [classId]: normalized,
  }));
  window.dispatchEvent(new CustomEvent(PARENT_EVALUATION_VISIBILITY_UPDATED_EVENT, {
    detail: { classId, settings: normalized },
  }));
  return normalized;
};
