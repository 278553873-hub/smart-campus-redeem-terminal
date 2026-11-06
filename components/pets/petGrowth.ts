// 各阶段新增加分门槛；累计节点分别为 5、25、45、85、165 分。
export const PET_EVOLUTION_STEPS = [
  { from: '初生蛋', to: '幼年期', requiredScore: 5 },
  { from: '幼年期', to: '成长期', requiredScore: 20 },
  { from: '成长期', to: '成熟期', requiredScore: 20 },
  { from: '成熟期', to: '完全体', requiredScore: 40 },
  { from: '完全体', to: '究极体', requiredScore: 80 },
] as const;
export const EGG_HATCH_SCORE = PET_EVOLUTION_STEPS[0].requiredScore;

export const PET_STAGE_KEYS = ['egg', 'juvenile', 'growth', 'mature', 'complete', 'ultimate'] as const;
export type PetStageKey = (typeof PET_STAGE_KEYS)[number];
export const PET_STAGE_LABELS = ['初生蛋', '幼年期', '成长期', '成熟期', '完全体', '究极体'] as const;

// 首次孵化升一级；其后每个阶段拆为两级，保持原有进化累计节点不变。
export const PET_LEVEL_STEPS = PET_EVOLUTION_STEPS.flatMap((step, index) =>
  index === 0 ? [step.requiredScore] : [step.requiredScore / 2, step.requiredScore / 2],
);
export const PET_MAX_LEVEL = PET_LEVEL_STEPS.length + 1;

/** 由伙伴本轮有效加分分别推导六阶段进度与十级升级进度。 */
export function getPetGrowth(praiseScore: number, levelPoints: readonly number[] = PET_LEVEL_STEPS, minimumStage = 0) {
  const earned = Number.isFinite(praiseScore) ? Math.max(0, praiseScore) : 0;
  const stageLevels = [1, 2, 4, 6, 8, 10];
  const levelThreshold = (level: number) => levelPoints.slice(0, level - 1).reduce((sum, value) => sum + value, 0);
  let earnedLevel = 1;
  while (earnedLevel < 10 && earned >= levelThreshold(earnedLevel + 1)) earnedLevel++;
  const naturalStage = earnedLevel === 1 ? 0 : Math.min(5, Math.floor(earnedLevel / 2));
  const stageIndex = Math.max(naturalStage, Math.min(5, Math.max(0, minimumStage)));
  const level = Math.max(earnedLevel, stageLevels[stageIndex]);
  const stageStart = levelThreshold(stageLevels[stageIndex]);
  const isUltimate = stageIndex === 5;
  const target = isUltimate ? 0 : levelThreshold(stageLevels[stageIndex + 1]) - stageStart;
  const current = isUltimate ? 0 : Math.max(0, earned - stageStart);
  const levelStart = levelThreshold(level);
  const isMaxLevel = level === 10;
  const levelTarget = isMaxLevel ? 0 : levelPoints[level - 1];
  const levelCurrent = isMaxLevel ? 0 : Math.max(0, earned - levelStart);
  return {
    earned, stageIndex, stageStart, target, current, isUltimate,
    level, levelStart, levelTarget, levelCurrent, isMaxLevel,
    levelRemaining: isMaxLevel ? 0 : levelTarget - levelCurrent,
    levelRatio: isMaxLevel ? 1 : levelCurrent / levelTarget,
    stageKey: PET_STAGE_KEYS[stageIndex],
    stageLabel: PET_STAGE_LABELS[stageIndex],
    nextStageLabel: isUltimate ? null : PET_STAGE_LABELS[stageIndex + 1],
    remaining: isUltimate ? 0 : target - current,
    ratio: isUltimate ? 1 : current / target,
  };
}

/** 当前蛋阶段只累计有效正向加分，不使用净分、基础分或评价次数。 */
export function getEggGrowth(praiseScore: number, target: number = EGG_HATCH_SCORE) {
  const earned = Number.isFinite(praiseScore) ? Math.max(0, praiseScore) : 0;
  const required = Number.isFinite(target) && target > 0 ? target : EGG_HATCH_SCORE;
  return {
    earned,
    target: required,
    current: Math.min(earned, required),
    remaining: Math.max(0, required - earned),
    ratio: Math.min(1, earned / required),
    ready: earned >= required,
  };
}
