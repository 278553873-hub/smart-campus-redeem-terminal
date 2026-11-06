import type { ClassroomDisplayConfig } from '../../shared/classroomDisplay';
import type { StudentCardDisplaySettings } from '../../mobile-app/types';

/** 宠物卡与随机点名复用档位配置；总分与成长值同排，不额外占行。 */
export function getClassroomPetCardLayout(layout: ClassroomDisplayConfig['studentCard'], _settings?: StudentCardDisplaySettings) {
  // 身份与进度区统一使用8像素左右内边距；宠物画布独立计算，保持原有体量和位置。
  const paddingTop = 10;
  const paddingBottom = 10;
  const paddingHorizontal = 8;
  // 等级移到进度条上方后，顶部只保留身份行，将剩余高度还给宠物。
  const headerHeight = layout.pet.identityHeight;
  const progressHeight = 28;
  const gap = 8;
  const borderWidth = 0;
  const imageHeight = layout.pet.cardHeight - paddingTop - paddingBottom - headerHeight - progressHeight - gap * 2 - borderWidth * 2;
  // 基准画布受纵向空间与两侧6像素留白约束；实际展示体量由阶段比例控制，允许利用外围留白。
  const artworkViewportSize = Math.min(imageHeight, layout.pet.width - 12);
  return { ...layout.pet, imageHeight, artworkViewportSize, paddingTop, paddingBottom, paddingHorizontal, headerHeight, progressHeight, gap };
}
