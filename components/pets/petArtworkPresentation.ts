import type { PetStageKey } from './petGrowth';

/** 以预留画布为基准；各阶段在既有尺寸上统一放大10%，不改变卡片尺寸或生长规则。 */
export const PET_STAGE_ARTWORK_SCALE: Record<PetStageKey, number> = {
  egg: 0.77,
  juvenile: 0.88,
  growth: 0.946,
  mature: 1.012,
  complete: 1.067,
  ultimate: 1.1,
};
