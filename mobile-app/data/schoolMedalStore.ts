import type { TeacherProfile } from '../types';
import {
  canIssueSchoolMedals,
  changeSchoolMedalAvailability,
  createDefaultSchoolMedalSettings,
  createSchoolMedalAwards,
  type SchoolMedalAward,
  type SchoolMedalAvailabilityChange,
  type SchoolMedalSettings,
} from '../domain/schoolMedals.ts';

export const SCHOOL_MEDAL_SETTINGS_UPDATED = 'school-medal-settings-updated';
const settingsKey = (schoolId: string) => `campus-school-medal-settings:v1:${schoolId}`;
const awardsKey = (schoolId: string) => `campus-school-medal-awards:v1:${schoolId}`;

export function readSchoolMedalSettings(schoolId: string): SchoolMedalSettings {
  try {
    return JSON.parse(window.localStorage.getItem(settingsKey(schoolId)) ?? 'null') ?? createDefaultSchoolMedalSettings();
  } catch {
    return createDefaultSchoolMedalSettings();
  }
}

export function subscribeToSchoolMedalSettings(schoolId: string, onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === settingsKey(schoolId)) onChange();
  };
  window.addEventListener(SCHOOL_MEDAL_SETTINGS_UPDATED, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(SCHOOL_MEDAL_SETTINGS_UPDATED, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function writeSchoolMedalSettings(schoolId: string, settings: SchoolMedalSettings) {
  window.localStorage.setItem(settingsKey(schoolId), JSON.stringify(settings));
  window.dispatchEvent(new Event(SCHOOL_MEDAL_SETTINGS_UPDATED));
}

export async function updateSchoolMedalAvailability(
  schoolId: string,
  change: SchoolMedalAvailabilityChange,
  medalIds: readonly string[],
) {
  const update = () => {
    const settings = readSchoolMedalSettings(schoolId);
    const next = changeSchoolMedalAvailability(settings, change, medalIds);
    if (next !== settings) writeSchoolMedalSettings(schoolId, next);
  };
  if (navigator.locks) await navigator.locks.request(settingsKey(schoolId), update);
  else update();
}

export async function issueSchoolMedals(
  schoolId: string,
  teacher: TeacherProfile,
  classId: string,
  studentIds: string[],
  medalIds: string[],
) {
  const issue = async () => {
    const settings = readSchoolMedalSettings(schoolId);
    if (!canIssueSchoolMedals(settings, teacher, classId)) throw new Error('学校已关闭奖章功能或调整了发放权限');
    const key = awardsKey(schoolId);
    const previous: SchoolMedalAward[] = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    const awards = createSchoolMedalAwards(settings, previous, {
      classId, teacherId: teacher.id, studentIds, medalIds,
      awardedAt: new Date().toISOString(), batchId: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    });
    if (!awards.length) throw new Error('可发放的奖章已更新，请重新选择');
    window.localStorage.setItem(key, JSON.stringify([...previous, ...awards]));
    return awards.filter(award => award.source === 'composed');
  };
  // 按学校顺序提交，避免多个标签页同时写入时覆盖奖章记录。
  return navigator.locks ? navigator.locks.request(awardsKey(schoolId), issue) : issue();
}
