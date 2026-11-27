import { DEFAULT_SCHOOL_MEDALS, PLATFORM_MEDALS, type StudentMedalAward, type MedalDefinition, type MedalIcon } from './medal.ts';
import type { TeacherProfile } from '../types';

export interface MedalCompositionRule {
  requiredMedalIds: string[];
  resultMedalId: string;
}

export interface SchoolMedalSettings {
  enabled: boolean;
  homeroomCanIssue: boolean;
  availableMedalIds: string[];
  customMedals: MedalDefinition[];
  archivedCustomMedals?: MedalDefinition[];
  rules: MedalCompositionRule[];
}

export interface SchoolMedalAward extends StudentMedalAward {
  classId: string;
  teacherId: string;
  source: 'teacher' | 'composed';
}

const DEFAULT_SCHOOL_MANUAL_MEDAL_IDS = [
  'platform-progress-star', 'platform-diligent-star', 'platform-civilized-star',
  'platform-disciplined-star', 'platform-friendly-star', 'platform-sports-talent',
  'platform-art-talent', 'platform-tech-talent', 'platform-reading-talent',
  'platform-performance-talent', 'platform-three-good-student', 'platform-excellent-cadre',
  'platform-excellent-young-pioneer', 'platform-excellent-student', 'platform-deyu-star',
  'platform-zhiyu-star', 'platform-tiyu-star', 'platform-meiyu-star', 'platform-laoyu-star',
];

export const createDefaultSchoolMedalSettings = (): SchoolMedalSettings => ({
  enabled: true,
  homeroomCanIssue: true,
  availableMedalIds: [...DEFAULT_SCHOOL_MANUAL_MEDAL_IDS],
  customMedals: [...DEFAULT_SCHOOL_MEDALS],
  rules: [],
});

const getActiveSchoolMedalCatalog = (settings: SchoolMedalSettings) => [...PLATFORM_MEDALS, ...settings.customMedals];

export const getSchoolMedalCatalog = (settings: SchoolMedalSettings) => [
  ...getActiveSchoolMedalCatalog(settings),
  ...(settings.archivedCustomMedals ?? []),
];

export const getSchoolManualMedalCatalog = (settings: SchoolMedalSettings) => {
  const composed = new Set(settings.rules.map(rule => rule.resultMedalId));
  return getActiveSchoolMedalCatalog(settings).filter(medal => !composed.has(medal.id));
};

export const getManuallyIssuableMedals = (settings: SchoolMedalSettings) => {
  if (!settings.enabled) return [];
  const available = new Set(settings.availableMedalIds);
  return getSchoolManualMedalCatalog(settings).filter(medal => available.has(medal.id));
};

export type SchoolMedalAvailabilityChange = 'add' | 'remove';

export const SCHOOL_MEDAL_NAME_MAX_LENGTH = 12;

export interface SchoolCustomMedalInput {
  id?: string;
  name: string;
  icon: MedalIcon;
  available?: boolean;
}

export function changeSchoolMedalAvailability(
  settings: SchoolMedalSettings,
  change: SchoolMedalAvailabilityChange,
  medalIds: readonly string[],
): SchoolMedalSettings {
  const manualIds = new Set(getSchoolManualMedalCatalog(settings).map(medal => medal.id));
  const available = new Set(settings.enabled ? settings.availableMedalIds : []);
  let changed = false;
  for (const id of medalIds) {
    if (!manualIds.has(id)) continue;
    if (change === 'remove') changed = available.delete(id) || changed;
    else if (!available.has(id)) {
      available.add(id);
      changed = true;
    }
  }
  return changed ? { ...settings, enabled: true, availableMedalIds: [...available] } : settings;
}

export function changeSchoolCustomMedal(
  settings: SchoolMedalSettings,
  input: SchoolCustomMedalInput,
  newId: () => string,
): SchoolMedalSettings {
  const name = input.name.trim();
  if (!name || name.length > SCHOOL_MEDAL_NAME_MAX_LENGTH) {
    throw new Error(`请输入 1 至 ${SCHOOL_MEDAL_NAME_MAX_LENGTH} 字的奖章名称`);
  }
  const existing = input.id ? settings.customMedals.find(medal => medal.id === input.id) : undefined;
  if (input.id && !existing) throw new Error('奖章已更新，请返回重新选择');
  if (getActiveSchoolMedalCatalog(settings).some(medal => medal.id !== input.id && medal.name.trim() === name)) {
    throw new Error('已有同名奖章，请换一个名称');
  }

  const medal: MedalDefinition = { id: existing?.id ?? newId(), name, scope: 'school', icon: input.icon, quantity: 1 };
  const next = {
    ...settings,
    customMedals: existing
      ? settings.customMedals.map(item => item.id === existing.id ? medal : item)
      : [...settings.customMedals, medal],
  };
  if (!existing) return changeSchoolMedalAvailability(next, 'add', [medal.id]);
  if (input.available === undefined) return next;
  return changeSchoolMedalAvailability(next, input.available ? 'add' : 'remove', [medal.id]);
}

export function removeSchoolCustomMedal(settings: SchoolMedalSettings, medalId: string): SchoolMedalSettings {
  const medal = settings.customMedals.find(item => item.id === medalId);
  if (!medal) return settings;
  return {
    ...settings,
    customMedals: settings.customMedals.filter(item => item.id !== medalId),
    // 历史发放记录按编号读取定义，删除后继续保留对应名称和图片。
    archivedCustomMedals: [...(settings.archivedCustomMedals ?? []), medal],
    availableMedalIds: settings.availableMedalIds.filter(id => id !== medalId),
  };
}

export const canIssueSchoolMedals = (
  settings: SchoolMedalSettings,
  teacher: Pick<TeacherProfile, 'homeroomClassIds' | 'teachingAssignments'>,
  classId: string,
) => settings.enabled && (
  (settings.homeroomCanIssue && teacher.homeroomClassIds.includes(classId))
  || teacher.teachingAssignments.some(assignment => assignment.classId === classId)
);

export const isCompositionRuleAvailable = (rule: MedalCompositionRule, available: ReadonlySet<string>) => (
  available.has(rule.resultMedalId) && rule.requiredMedalIds.every(id => available.has(id))
);

export function validateMedalCompositionRule(
  settings: SchoolMedalSettings,
  rule: MedalCompositionRule,
  previousResultId?: string,
): string {
  if (!rule.resultMedalId || new Set(rule.requiredMedalIds).size < 2) return '请选择至少两枚所需奖章和一枚合成奖章';
  const available = new Set(settings.availableMedalIds);
  if (!isCompositionRuleAvailable(rule, available)) return '请选择已启用的奖章';
  const recipes = new Map(settings.rules
    .filter(recipe => recipe.resultMedalId !== previousResultId)
    .map(recipe => [recipe.resultMedalId, recipe.requiredMedalIds]));
  if (recipes.has(rule.resultMedalId)) return '这枚奖章已有合成规则';

  const pending = [...rule.requiredMedalIds];
  const visited = new Set<string>();
  while (pending.length) {
    const medalId = pending.pop()!;
    if (medalId === rule.resultMedalId) return '所需奖章和合成奖章之间不能循环依赖';
    if (visited.has(medalId)) continue;
    visited.add(medalId);
    pending.push(...(recipes.get(medalId) ?? []));
  }
  return '';
}

export function createSchoolMedalAwards(
  settings: SchoolMedalSettings,
  previousAwards: SchoolMedalAward[],
  { classId, teacherId, teacherName, studentIds, medalIds, awardedAt, batchId }: {
    classId: string;
    teacherId: string;
    teacherName?: string;
    studentIds: string[];
    medalIds: string[];
    awardedAt: string;
    batchId: string;
  },
): SchoolMedalAward[] {
  const available = new Set(settings.availableMedalIds);
  const manualMedalIds = [...new Set(medalIds)];
  const issuable = new Set(getManuallyIssuableMedals(settings).map(medal => medal.id));
  if (!settings.enabled || !manualMedalIds.length || !studentIds.length || manualMedalIds.some(id => !issuable.has(id))) return [];
  const activeRules = settings.rules.filter(rule => isCompositionRuleAvailable(rule, available));
  const studentAwards = new Map([...new Set(studentIds)].map(id => [id, new Set<string>()]));
  previousAwards.forEach(award => studentAwards.get(award.studentId)?.add(award.medalId));
  const awards: SchoolMedalAward[] = [];

  for (const [studentId, earnedMedals] of studentAwards) {
    const addAward = (medalId: string, source: SchoolMedalAward['source']) => {
      earnedMedals.add(medalId);
      awards.push({ id: `${batchId}-${awards.length}`, studentId, medalId, classId, teacherId, teacherName, quantity: 1, awardedAt, source });
    };
    manualMedalIds.forEach(id => addAward(id, 'teacher'));
    let composed: boolean;
    do {
      composed = false;
      for (const rule of activeRules) {
        if (earnedMedals.has(rule.resultMedalId) || !rule.requiredMedalIds.every(id => earnedMedals.has(id))) continue;
        addAward(rule.resultMedalId, 'composed');
        composed = true;
      }
    } while (composed);
  }
  return awards;
}
