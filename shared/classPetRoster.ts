import { readSchoolClassPetSettings, type SchoolClassPetSettings } from './classPetSettings';

export const CLASS_PET_ROSTER_EVENT = 'class-pet-roster-updated';
export interface PetEvaluation { id: string; score: number; recordedAt: string }
export interface ClassPetRoster {
  claimedAt: string;
  view: 'pet' | 'student-info';
  students: Record<string, { evaluations: PetEvaluation[]; highestStage: number }>;
}
const key = (schoolId: string, classId: string) => `campus-class-pet-roster:v1:${encodeURIComponent(schoolId)}:${encodeURIComponent(classId)}`;
export function readClassPetRoster(schoolId: string, classId: string): ClassPetRoster | null {
  try {
    const value = JSON.parse(window.localStorage.getItem(key(schoolId, classId)) ?? 'null');
    return value && typeof value.claimedAt === 'string' && value.students && typeof value.students === 'object' ? value : null;
  } catch { return null; }
}
export function saveClassPetRoster(schoolId: string, classId: string, roster: ClassPetRoster) {
  window.localStorage.setItem(key(schoolId, classId), JSON.stringify(roster));
  window.dispatchEvent(new Event(CLASS_PET_ROSTER_EVENT));
}
/** 一次保存全班领取结果；重复确认不会重置经验或覆盖领取时间。 */
export function claimClassPetEggs(schoolId: string, classId: string, studentIds: string[], now = new Date().toISOString()) {
  const settings = readSchoolClassPetSettings(schoolId);
  if (!settings.enabled || settings.claimMethod !== 'teacher') throw new Error('当前学校未开放教师领取');
  const existing = readClassPetRoster(schoolId, classId);
  if (existing) return existing;
  if (!studentIds.length) throw new Error('班级暂无学生，暂时无法领取');
  const roster: ClassPetRoster = { claimedAt: now, view: 'pet', students: Object.fromEntries(studentIds.map(id => [id, { evaluations: [], highestStage: 0 }])) };
  saveClassPetRoster(schoolId, classId, roster);
  return roster;
}
const stageForLevel = (level: number) => level === 1 ? 0 : Math.min(5, Math.floor(level / 2));
export function getClaimedPetGrowth(evaluations: PetEvaluation[], settings: SchoolClassPetSettings, highestStage = 0) {
  const experience = Math.max(0, evaluations.reduce((sum, record) => sum + (record.score > 0 || settings.deductExperience ? record.score : 0), 0));
  let level = 1, start = 0;
  while (level < 10 && experience >= start + settings.levelPoints[level - 1]) start += settings.levelPoints[level++ - 1];
  const stage = Math.max(highestStage, stageForLevel(level));
  const stageFloor = stage === 0 ? 1 : stage === 5 ? 10 : stage * 2;
  const shownLevel = Math.max(level, stageFloor);
  return { experience, level: shownLevel, stage, levelCurrent: shownLevel > level ? 0 : experience - start, levelTarget: shownLevel === 10 ? 0 : settings.levelPoints[shownLevel - 1], isMaxLevel: shownLevel === 10, ratio: shownLevel > level ? 0 : level === 10 ? 1 : (experience - start) / settings.levelPoints[level - 1] };
}
/** 仅接收已完成的学生评价；领取前的记录、重复回调不重复累计。 */
export function updateClassPetEvaluation(schoolId: string, classId: string, studentIds: string[], evaluation: PetEvaluation, remove = false) {
  const settings = readSchoolClassPetSettings(schoolId);
  const roster = readClassPetRoster(schoolId, classId);
  if (!settings.enabled || !roster || evaluation.recordedAt < roster.claimedAt) return;
  for (const id of studentIds) {
    const pet = roster.students[id];
    if (!pet) continue;
    pet.evaluations = pet.evaluations.filter(item => item.id !== evaluation.id);
    if (!remove && Number.isFinite(evaluation.score)) pet.evaluations.push(evaluation);
    pet.highestStage = getClaimedPetGrowth(pet.evaluations, settings, pet.highestStage).stage;
  }
  saveClassPetRoster(schoolId, classId, roster);
}
