/** 全校统一的 AI 宠物配置；等级门槛按每级新增的有效正向加分计算。 */
export const DEFAULT_PET_LEVEL_POINTS = [5, 10, 10, 10, 10, 20, 20, 40, 40];
export interface SchoolClassPetSettings {
  enabled: boolean;
  claimMethod: 'teacher' | 'student';
  /** 扣分扣经验时，仍保留已解锁阶段与形象，不重新生图。 */
  deductExperience: boolean;
  levelPoints: number[];
}
export const validPetLevelPoints = (values: unknown): values is number[] => (
  Array.isArray(values) && values.length === 9
  && values.every(value => Number.isSafeInteger(value) && value > 0)
  && Number.isSafeInteger(values.reduce((sum, value) => sum + value, 0))
);
const storageKey = (schoolId: string) => `campus-school-class-pet:v1:${encodeURIComponent(schoolId)}`;
export function readSchoolClassPetSettings(schoolId: string): SchoolClassPetSettings {
  const fallback: SchoolClassPetSettings = { claimMethod: 'teacher', enabled: false, deductExperience: false, levelPoints: [...DEFAULT_PET_LEVEL_POINTS] };
  if (typeof window === 'undefined') return fallback;
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey(schoolId)) ?? 'null');
    return { claimMethod: value?.claimMethod === 'student' ? 'student' : 'teacher', enabled: value?.enabled === true, deductExperience: value?.deductExperience === true, levelPoints: validPetLevelPoints(value?.levelPoints) ? [...value.levelPoints] : fallback.levelPoints };
  } catch { return fallback; }
}
export function writeSchoolClassPetSettings(schoolId: string, settings: SchoolClassPetSettings) {
  if (!validPetLevelPoints(settings.levelPoints)) throw new Error('请填写有效的升级分数');
  window.localStorage.setItem(storageKey(schoolId), JSON.stringify(settings));
  window.dispatchEvent(new Event('school-class-pet-settings-updated'));
}
