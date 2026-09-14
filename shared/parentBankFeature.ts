export const PARENT_BANK_FEATURE_UPDATED_EVENT = 'parent-bank-feature-updated';

const STORAGE_KEY = 'campus-parent-bank-feature:v1';

type BankFeatureStore = Record<string, boolean>;

const readStore = (): BankFeatureStore => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as BankFeatureStore
      : {};
  } catch {
    return {};
  }
};

export const readParentBankFeatureEnabled = (classId: string) => (
  readStore()[classId] ?? true
);

export const writeParentBankFeatureEnabled = (classId: string, enabled: boolean) => {
  if (typeof window === 'undefined') return enabled;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...readStore(),
    [classId]: enabled,
  }));
  window.dispatchEvent(new CustomEvent(PARENT_BANK_FEATURE_UPDATED_EVENT, {
    detail: { classId, enabled },
  }));
  return enabled;
};
