import type { TeacherProfile } from '../types';
import { DEMO_TEACHER_ACCOUNTS } from '../../shared/demoTeacherAccounts.ts';
import { getDemoStudentMedalAwards } from './demoStudentMedals.ts';
import { PLATFORM_MEDALS, summarizeMedalAwards, summarizeStudentMedalsByTerm, type MedalSummary, type StudentMedalTerm } from '../domain/medal.ts';
import {
  canIssueSchoolMedals,
  changeSchoolCustomMedal,
  changeSchoolMedalAvailability,
  createDefaultSchoolMedalSettings,
  createSchoolMedalAwards,
  getSchoolMedalCatalog,
  removeSchoolCustomMedal,
  type SchoolCustomMedalInput,
  type SchoolMedalAward,
  type SchoolMedalAvailabilityChange,
  type SchoolMedalSettings,
} from '../domain/schoolMedals.ts';

export const SCHOOL_MEDAL_SETTINGS_UPDATED = 'school-medal-settings-updated';
const settingsKey = (schoolId: string) => `campus-school-medal-settings:v1:${schoolId}`;
const awardsKey = (schoolId: string) => `campus-school-medal-awards:v1:${schoolId}`;
const readSchoolMedalAwards = (schoolId: string): SchoolMedalAward[] => (
  JSON.parse(window.localStorage.getItem(awardsKey(schoolId)) ?? '[]')
);
const readSchoolStudentMedalAwards = (schoolId: string, studentId: string) => (
  readSchoolMedalAwards(schoolId).filter(award => award.studentId === studentId)
);

export function readSchoolStudentMedals(schoolId: string, studentId: string, settings: SchoolMedalSettings): MedalSummary[] {
  try {
    const awards = readSchoolStudentMedalAwards(schoolId, studentId);
    return summarizeMedalAwards(awards, getSchoolMedalCatalog(settings));
  } catch {
    return [];
  }
}

export function readSchoolStudentMedalTerms(schoolId: string, studentId: string, settings: SchoolMedalSettings | null, currentTeacher?: Pick<TeacherProfile, 'id' | 'name'>): StudentMedalTerm[] {
  try {
    const awards = settings ? readSchoolStudentMedalAwards(schoolId, studentId) : [];
    const displayAwards = awards.length > 0 ? awards.map(award => ({
      ...award,
      teacherName: award.teacherName || (currentTeacher && currentTeacher.id === award.teacherId ? currentTeacher.name : undefined)
        || DEMO_TEACHER_ACCOUNTS.find(account => account.id === award.teacherId)?.name,
    })) : getDemoStudentMedalAwards(studentId);
    const catalog = settings ? getSchoolMedalCatalog(settings) : PLATFORM_MEDALS;
    return summarizeStudentMedalsByTerm(displayAwards, catalog);
  } catch {
    return summarizeStudentMedalsByTerm([], []);
  }
}

export function readSchoolMedalSettings(schoolId: string): SchoolMedalSettings {
  try {
    const stored = JSON.parse(window.localStorage.getItem(settingsKey(schoolId)) ?? 'null') ?? createDefaultSchoolMedalSettings();
    // 按当前班级任教关系授权，读取时清理旧版科任开关。
    const { subjectTeacherCanIssue: _legacyPermission, ...settings } = stored;
    return settings;
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

async function changeSchoolMedalSettings(
  schoolId: string,
  change: (settings: SchoolMedalSettings) => SchoolMedalSettings,
) {
  const update = async () => {
    const settings = readSchoolMedalSettings(schoolId);
    const next = change(settings);
    if (next !== settings) writeSchoolMedalSettings(schoolId, next);
  };
  return navigator.locks ? navigator.locks.request(settingsKey(schoolId), update) : update();
}

export function updateSchoolMedalAvailability(
  schoolId: string,
  change: SchoolMedalAvailabilityChange,
  medalIds: readonly string[],
) {
  return changeSchoolMedalSettings(schoolId, settings => changeSchoolMedalAvailability(settings, change, medalIds));
}

export function saveSchoolCustomMedal(schoolId: string, input: SchoolCustomMedalInput) {
  return changeSchoolMedalSettings(schoolId, settings => changeSchoolCustomMedal(settings, input, () => (
    `school-custom-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
  )));
}

export function deleteSchoolCustomMedal(schoolId: string, medalId: string) {
  return changeSchoolMedalSettings(schoolId, settings => removeSchoolCustomMedal(settings, medalId));
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
    const previous = readSchoolMedalAwards(schoolId);
    const awards = createSchoolMedalAwards(settings, previous, {
      classId, teacherId: teacher.id, teacherName: teacher.name, studentIds, medalIds,
      awardedAt: new Date().toISOString(), batchId: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    });
    if (!awards.length) throw new Error('可发放的奖章已更新，请重新选择');
    window.localStorage.setItem(awardsKey(schoolId), JSON.stringify([...previous, ...awards]));
    return awards.filter(award => award.source === 'composed');
  };
  // 按学校顺序提交，避免多个标签页同时写入时覆盖奖章记录。
  return navigator.locks ? navigator.locks.request(awardsKey(schoolId), issue) : issue();
}
