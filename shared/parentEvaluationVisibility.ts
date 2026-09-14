export type ParentEvaluationVisibility = 'hidden' | 'summary' | 'summaryAndDetails';

export interface ParentEvaluationVisibilitySettings {
  positive: ParentEvaluationVisibility;
  negative: ParentEvaluationVisibility;
}

export interface SchoolParentEvaluationVisibilityConfig {
  settings: ParentEvaluationVisibilitySettings;
  allowHomeroomTeacherCustomization: boolean;
}

export const DEFAULT_PARENT_EVALUATION_VISIBILITY: ParentEvaluationVisibilitySettings = {
  positive: 'summary',
  negative: 'hidden',
};
export const DEFAULT_SCHOOL_PARENT_EVALUATION_CONFIG: SchoolParentEvaluationVisibilityConfig = {
  settings: DEFAULT_PARENT_EVALUATION_VISIBILITY,
  allowHomeroomTeacherCustomization: true,
};

export const PARENT_EVALUATION_VISIBILITY_UPDATED_EVENT = 'parent-evaluation-visibility-updated';
export const SCHOOL_PARENT_EVALUATION_VISIBILITY_UPDATED_EVENT = 'school-parent-evaluation-visibility-updated';

const STORAGE_KEY = 'campus-parent-evaluation-visibility:v1';
const SCHOOL_STORAGE_KEY = 'campus-school-parent-evaluation-visibility:v1';

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
type SchoolVisibilityStore = Record<string, SchoolParentEvaluationVisibilityConfig>;

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

const readSchoolStore = (): SchoolVisibilityStore => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SCHOOL_STORAGE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as SchoolVisibilityStore
      : {};
  } catch {
    return {};
  }
};

export const readSchoolParentEvaluationVisibility = (
  schoolId = 'default_school',
): SchoolParentEvaluationVisibilityConfig => {
  const store = readSchoolStore();
  const raw = store[schoolId];
  if (!raw) return DEFAULT_SCHOOL_PARENT_EVALUATION_CONFIG;
  return {
    settings: getParentEvaluationVisibilitySettings(raw.settings),
    allowHomeroomTeacherCustomization: typeof raw.allowHomeroomTeacherCustomization === 'boolean'
      ? raw.allowHomeroomTeacherCustomization
      : true,
  };
};

export const writeSchoolParentEvaluationVisibility = (
  schoolId = 'default_school',
  config: SchoolParentEvaluationVisibilityConfig,
  resetClassOverrides = false,
): SchoolParentEvaluationVisibilityConfig => {
  const normalized: SchoolParentEvaluationVisibilityConfig = {
    settings: getParentEvaluationVisibilitySettings(config.settings),
    allowHomeroomTeacherCustomization: Boolean(config.allowHomeroomTeacherCustomization),
  };

  if (typeof window === 'undefined') return normalized;

  // 1. 保存学校级配置
  const schoolStore = {
    ...readSchoolStore(),
    [schoolId]: normalized,
  };
  window.localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(schoolStore));

  // 2. 方案 B：如果关闭了自主设置或显式指定重置，则将各班级个性化设置重置/同化为学校规则
  if (!normalized.allowHomeroomTeacherCustomization || resetClassOverrides) {
    const classStore = readStore();
    const updatedClassStore: VisibilityStore = {};
    Object.keys(classStore).forEach(classId => {
      updatedClassStore[classId] = { ...normalized.settings };
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClassStore));
  }

  window.dispatchEvent(new CustomEvent(SCHOOL_PARENT_EVALUATION_VISIBILITY_UPDATED_EVENT, {
    detail: { schoolId, config: normalized },
  }));

  return normalized;
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

export const getEffectiveParentEvaluationVisibility = (
  classId: string,
  schoolId = 'default_school',
): {
  settings: ParentEvaluationVisibilitySettings;
  isReadOnly: boolean;
  allowCustomization: boolean;
} => {
  const schoolConfig = readSchoolParentEvaluationVisibility(schoolId);
  if (!schoolConfig.allowHomeroomTeacherCustomization) {
    return {
      settings: schoolConfig.settings,
      isReadOnly: true,
      allowCustomization: false,
    };
  }
  const rawClassSettings = readStore()[classId];
  return {
    settings: rawClassSettings
      ? getParentEvaluationVisibilitySettings(rawClassSettings)
      : schoolConfig.settings,
    isReadOnly: false,
    allowCustomization: true,
  };
};
