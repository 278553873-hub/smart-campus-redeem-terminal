import { createSchoolBasicInfo, normalizeSchoolBasicInfo, validateSchoolBasicInfo, type SchoolBasicInfo } from './schoolBasicInfo';

export const SCHOOL_BASIC_INFO_CHANGED = 'school-basic-info-changed';
export const schoolBasicInfoKey = (schoolId: string) => `campus-school-basic-info:v1:${encodeURIComponent(schoolId)}`;

/** 当前演示使用浏览器存储，按学校隔离；正式接入可在此替换为配置服务。 */
export const readSchoolBasicInfo = (schoolId: string, schoolName: string): SchoolBasicInfo => {
  const fallback = createSchoolBasicInfo(schoolName);
  if (typeof window === 'undefined') return fallback;
  try {
    const record = JSON.parse(window.localStorage.getItem(schoolBasicInfoKey(schoolId)) ?? 'null');
    if (record?.version !== 1 || typeof record.displayName !== 'string' || typeof record.logoUrl !== 'string' || typeof record.features !== 'string') return fallback;
    const value = normalizeSchoolBasicInfo(record);
    return Object.keys(validateSchoolBasicInfo(value)).length ? fallback : value;
  } catch { return fallback; }
};

export const saveSchoolBasicInfo = (schoolId: string, value: SchoolBasicInfo): SchoolBasicInfo => {
  const next = normalizeSchoolBasicInfo(value);
  const errors = validateSchoolBasicInfo(next);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  try { window.localStorage.setItem(schoolBasicInfoKey(schoolId), JSON.stringify({ version: 1, ...next })); }
  catch { throw new Error('保存失败，请检查浏览器存储空间后重试，当前修改已保留。'); }
  window.dispatchEvent(new CustomEvent(SCHOOL_BASIC_INFO_CHANGED, { detail: { schoolId } }));
  return next;
};
