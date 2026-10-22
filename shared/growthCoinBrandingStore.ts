import { DEFAULT_COIN_BRANDING, resolveCoinSchoolId, validateCoinBranding, type GrowthCoinBranding } from './growthCoinBranding.ts';

const prefix = 'school-growth-coin-branding:v1:';
const changedEvent = 'school-growth-coin-branding-changed';
const cache = new Map<string, { raw: string | null; value: GrowthCoinBranding }>();
const keyFor = (schoolId: string) => `${prefix}${encodeURIComponent(resolveCoinSchoolId(schoolId))}`;

export const readCoinBranding = (schoolId: string): GrowthCoinBranding => {
  if (typeof localStorage === 'undefined') return DEFAULT_COIN_BRANDING;
  const key = keyFor(schoolId);
  let raw: string | null;
  try { raw = localStorage.getItem(key); } catch { return DEFAULT_COIN_BRANDING; }
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value;
  let value: GrowthCoinBranding = DEFAULT_COIN_BRANDING;
  try { if (raw) value = validateCoinBranding(JSON.parse(raw)); } catch { /* 损坏或旧数据回退默认，不改写余额与记录。 */ }
  cache.set(key, { raw, value });
  return value;
};

export const saveCoinBranding = (schoolId: string, draft: GrowthCoinBranding): GrowthCoinBranding => {
  if (!schoolId.trim()) throw new Error('未找到当前学校，请重新进入设置');
  const value = validateCoinBranding(draft);
  const key = keyFor(schoolId);
  const raw = JSON.stringify(value);
  try { localStorage.setItem(key, raw); } catch { throw new Error('保存失败，请清理浏览器存储空间后重试'); }
  cache.set(key, { raw, value });
  window.dispatchEvent(new CustomEvent(changedEvent, { detail: key }));
  return value;
};

/** 单字段即时更新，合并最新存储值，避免覆盖另一字段的修改。 */
export const updateCoinBranding = (schoolId: string, patch: Partial<GrowthCoinBranding>): GrowthCoinBranding => (
  saveCoinBranding(schoolId, { ...readCoinBranding(schoolId), ...patch })
);

export const subscribeCoinBranding = (schoolId: string, listener: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const key = keyFor(schoolId);
  const onLocalChange = (event: Event) => { if ((event as CustomEvent).detail === key) listener(); };
  const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) listener(); };
  window.addEventListener(changedEvent, onLocalChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(changedEvent, onLocalChange);
    window.removeEventListener('storage', onStorage);
  };
};
