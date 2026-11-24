import { DEFAULT_SCHOOL_MEDALS, PLATFORM_MEDALS, type MedalAwardRecord, type MedalDefinition } from './medal.ts';
import type { TeacherProfile } from '../types';

export interface MedalCompositionRule {
  requiredMedalIds: string[];
  resultMedalId: string;
}

export interface SchoolMedalSettings {
  enabled: boolean;
  homeroomCanIssue: boolean;
  subjectTeacherCanIssue: boolean;
  availableMedalIds: string[];
  customMedals: MedalDefinition[];
  rules: MedalCompositionRule[];
}

export interface SchoolMedalAward extends MedalAwardRecord {
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
  subjectTeacherCanIssue: false,
  availableMedalIds: [...DEFAULT_SCHOOL_MANUAL_MEDAL_IDS],
  customMedals: [...DEFAULT_SCHOOL_MEDALS],
  rules: [],
});

export const getSchoolMedalCatalog = (settings: SchoolMedalSettings) => [...PLATFORM_MEDALS, ...settings.customMedals];

export const getSchoolManualMedalCatalog = (settings: SchoolMedalSettings) => {
  const composed = new Set(settings.rules.map(rule => rule.resultMedalId));
  return getSchoolMedalCatalog(settings).filter(medal => !composed.has(medal.id));
};

export const getManuallyIssuableMedals = (settings: SchoolMedalSettings) => {
  if (!settings.enabled) return [];
  const available = new Set(settings.availableMedalIds);
  return getSchoolManualMedalCatalog(settings).filter(medal => available.has(medal.id));
};

export type SchoolMedalAvailabilityChange = 'add' | 'remove';

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

export const canIssueSchoolMedals = (
  settings: SchoolMedalSettings,
  teacher: Pick<TeacherProfile, 'homeroomClassIds' | 'teachingAssignments'>,
  classId: string,
) => settings.enabled && (
  (settings.homeroomCanIssue && teacher.homeroomClassIds.includes(classId))
  || (settings.subjectTeacherCanIssue && teacher.teachingAssignments.some(assignment => assignment.classId === classId))
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
  { classId, teacherId, studentIds, medalIds, awardedAt, batchId }: {
    classId: string;
    teacherId: string;
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
      awards.push({ id: `${batchId}-${awards.length}`, studentId, medalId, classId, teacherId, quantity: 1, awardedAt, source });
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
