export const PARENT_GROWTH_COIN_FEATURE_UPDATED_EVENT = 'parent-growth-coin-feature-updated';

const STORAGE_KEY = 'campus-parent-growth-coin-feature:v2';
const LEGACY_STORAGE_KEY = 'campus-parent-bank-feature:v1';

export interface ParentGrowthCoinFeatureSettings {
  enabled: boolean;
  bankEnabled: boolean;
}

type FeatureStore = Record<string, unknown>;

const readStore = (key: string): FeatureStore => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const readParentGrowthCoinFeatures = (classId: string): ParentGrowthCoinFeatureSettings => {
  const legacyEnabled = readStore(LEGACY_STORAGE_KEY)[classId];
  // 旧开关同时控制成长币和银行，迁移时保留原来的开放状态。
  const fallback = typeof legacyEnabled === 'boolean' ? legacyEnabled : true;
  const stored = readStore(STORAGE_KEY)[classId];
  const settings = stored && typeof stored === 'object' ? stored as Partial<ParentGrowthCoinFeatureSettings> : {};
  return {
    enabled: typeof settings.enabled === 'boolean' ? settings.enabled : fallback,
    bankEnabled: typeof settings.bankEnabled === 'boolean' ? settings.bankEnabled : fallback,
  };
};

export const writeParentGrowthCoinFeatures = (classId: string, settings: ParentGrowthCoinFeatureSettings) => {
  if (typeof window === 'undefined') return settings;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readStore(STORAGE_KEY), [classId]: settings }));
  window.dispatchEvent(new CustomEvent(PARENT_GROWTH_COIN_FEATURE_UPDATED_EVENT, { detail: { classId, ...settings } }));
  return settings;
};
