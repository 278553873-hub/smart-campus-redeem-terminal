import type { StudentCardDisplaySettings } from '../../mobile-app/types';
import type { ClassroomDisplayConfig } from '../../shared/classroomDisplay';

/** 两种展示模式共用内容区尺寸，切换时保留学生信息的身份行位置。 */
export function getClassroomStudentCardLayout(
  layout: ClassroomDisplayConfig['studentCard'],
  settings: StudentCardDisplaySettings,
) {
  const hasVisibleValues = settings.showEvaluation && (settings.showPraise || settings.showCriticism);
  const visibleRows = Number(settings.showLevel) + Number(hasVisibleValues);
  const cardHeight = visibleRows === 2
    ? layout.fullHeight
    : visibleRows === 1
      ? layout.countsHeight
      : layout.identityOnlyHeight;
  const bodyHeight = layout.avatarSize
    + (settings.showLevel ? layout.levelHeight + layout.levelAvatarGap : 0)
    + (hasVisibleValues ? layout.countHeight + layout.avatarCountGap : 0);

  return { cardHeight, bodyHeight };
}
