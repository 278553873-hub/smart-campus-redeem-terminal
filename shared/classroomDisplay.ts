export type ClassroomDisplayMode = 'auto' | 'standard' | 'classroom' | 'distant';
export type ResolvedClassroomDisplayMode = Exclude<ClassroomDisplayMode, 'auto'>;

export interface ClassroomStudentCardLayout {
  width: number;
  gap: number;
  avatarSize: number;
  levelIconSize: number;
  levelHeight: number;
  levelScoreFontSize: number;
  levelAvatarGap: number;
  countHeight: number;
  countFontSize: number;
  countItemHeight: number;
  countItemMinWidth: number;
  countGap: number;
  avatarCountGap: number;
  countIdentityGap: number;
  identityHeight: number;
  nameFontSize: number;
  nameLineHeight: number;
  rosterFontSize: number;
  rosterWidth: number;
  rosterHeight: number;
  fullHeight: number;
  countsHeight: number;
  identityOnlyHeight: number;
}

export interface ClassroomGroupCardLayout {
  width: number;
  gap: number;
  compactHeight: number;
  fullHeight: number;
  avatarSize: number;
  titleFontSize: number;
  memberFontSize: number;
  countFontSize: number;
  countItemHeight: number;
  countItemMinWidth: number;
  countGap: number;
}

export interface ClassroomMemberSelectLayout {
  columnMinWidth: number;
  gap: number;
  minHeight: number;
  avatarSize: number;
  nameFontSize: number;
  studentNoFontSize: number;
}

export interface ClassroomDisplayConfig {
  mode: ResolvedClassroomDisplayMode;
  label: string;
  studentCard: ClassroomStudentCardLayout;
  groupCard: ClassroomGroupCardLayout;
  memberSelect: ClassroomMemberSelectLayout;
  shell: {
    headerHeight: number;
    horizontalPadding: number;
    headerIconSize: number;
    headerFontSize: number;
    classSwitcherHeight: number;
    classSwitcherMinWidth: number;
    classSwitcherFontSize: number;
    classMenuWidth: number;
    classMenuItemHeight: number;
    classMenuFontSize: number;
    classMenuIconSize: number;
    viewSwitcherHeight: number;
    viewSwitcherFontSize: number;
    viewSwitcherIconSize: number;
  };
  filterSidebar: {
    width: number;
    controlHeight: number;
    titleFontSize: number;
    bodyFontSize: number;
    iconSize: number;
    gap: number;
  };
  historySidebar: {
    width: number;
    titleFontSize: number;
    bodyFontSize: number;
    metaFontSize: number;
    controlHeight: number;
    iconSize: number;
  };
  moreActions: {
    titleFontSize: number;
    sectionTitleFontSize: number;
    rowHeight: number;
    bodyFontSize: number;
    descriptionFontSize: number;
    iconSize: number;
  };
  modal: {
    titleFontSize: number;
    bodyFontSize: number;
    labelFontSize: number;
    buttonHeight: number;
    buttonFontSize: number;
    inputHeight: number;
    iconSize: number;
    avatarOptionMinWidth: number;
  };
  evaluation: {
    modalWidth: number;
    optionColumns: number;
    optionGap: number;
    optionHeight: number;
    optionFontSize: number;
    titleFontSize: number;
    tabFontSize: number;
    categoryFontSize: number;
    managerColumns: number;
    managerOptionHeight: number;
    headerHeight: number;
    headerPadding: number;
    avatarSize: number;
    avatarIconSize: number;
    studentNoFontSize: number;
    selectionHintFontSize: number;
    managerHeight: number;
    managerSidebarWidth: number;
    managerHeaderFontSize: number;
    managerRowHeight: number;
    managerMetaFontSize: number;
    managerControlSize: number;
    closeButtonSize: number;
    closeIconSize: number;
    contentPadding: number;
    categoryGap: number;
  };
  toolbar: {
    height: number;
    fontSize: number;
    iconSize: number;
    countFontSize: number;
    groupPlanMetaFontSize: number;
    utilityMinWidth: number;
    groupPlanMinWidth: number;
    groupPlanMenuWidth: number;
    menuButtonSize: number;
    groupPlanActionMenuWidth: number;
    groupPlanActionItemHeight: number;
    groupPlanActionFontSize: number;
    groupPlanActionIconSize: number;
    groupPlanCreateIconSize: number;
  };
  randomPicker: {
    modalWidth: number;
    modalHeight: number;
    studentSlotWidth: number;
    studentSlotHeight: number;
    groupSlotWidth: number;
    groupSlotHeight: number;
    gap: number;
    titleFontSize: number;
    slotLabelFontSize: number;
    slotRadius: number;
    slotPadding: number;
    emptyIconContainerSize: number;
    emptyIconSize: number;
    closeButtonSize: number;
    closeIconSize: number;
    headerPadding: number;
    contentPadding: number;
    footerHeight: number;
    statusFontSize: number;
  };
  quickActions: {
    dockSize: number;
    actionSize: number;
    iconSize: number;
    fanOffsetX: number;
    fanOffsetY: number;
    assistantOffsetX: number;
    assistantOffsetY: number;
    statusTitleFontSize: number;
    statusBodyFontSize: number;
    statusOffset: number;
    statusWidth: number;
  };
  groupDrawerWidth: number;
  formModalWidth: number;
}

export const CLASSROOM_DISPLAY_MODE_OPTIONS: Array<{ value: ClassroomDisplayMode; label: string }> = [
  { value: 'auto', label: '自动' },
  { value: 'standard', label: '小' },
  { value: 'classroom', label: '标准' },
  { value: 'distant', label: '大' },
];

const PERFORMANCE_VALUE_LAYOUTS = {
  standard: { countFontSize: 11, countItemHeight: 18, countItemMinWidth: 24, countGap: 8 },
  classroom: { countFontSize: 13, countItemHeight: 22, countItemMinWidth: 28, countGap: 10 },
  distant: { countFontSize: 15, countItemHeight: 24, countItemMinWidth: 32, countGap: 12 },
} as const;

const DISPLAY_CONFIGS: Record<ResolvedClassroomDisplayMode, ClassroomDisplayConfig> = {
  standard: {
    mode: 'standard',
    label: '标准',
    studentCard: {
      width: 136,
      gap: 12,
      avatarSize: 68,
      levelIconSize: 20,
      levelHeight: 20,
      levelScoreFontSize: 18,
      levelAvatarGap: 3,
      countHeight: 18,
      ...PERFORMANCE_VALUE_LAYOUTS.standard,
      avatarCountGap: 3,
      countIdentityGap: 6,
      identityHeight: 24,
      nameFontSize: 16,
      nameLineHeight: 18,
      rosterFontSize: 15,
      rosterWidth: 24,
      rosterHeight: 20,
      fullHeight: 152,
      countsHeight: 136,
      identityOnlyHeight: 116,
    },
    groupCard: { width: 280, gap: 12, compactHeight: 120, fullHeight: 128, avatarSize: 60, titleFontSize: 17, memberFontSize: 12, ...PERFORMANCE_VALUE_LAYOUTS.standard },
    memberSelect: { columnMinWidth: 82, gap: 8, minHeight: 96, avatarSize: 48, nameFontSize: 12, studentNoFontSize: 12 },
    shell: { headerHeight: 56, horizontalPadding: 24, headerIconSize: 18, headerFontSize: 13, classSwitcherHeight: 44, classSwitcherMinWidth: 220, classSwitcherFontSize: 14, classMenuWidth: 240, classMenuItemHeight: 40, classMenuFontSize: 14, classMenuIconSize: 16, viewSwitcherHeight: 42, viewSwitcherFontSize: 14, viewSwitcherIconSize: 18 },
    filterSidebar: { width: 320, controlHeight: 56, titleFontSize: 17, bodyFontSize: 14, iconSize: 24, gap: 24 },
    historySidebar: { width: 400, titleFontSize: 20, bodyFontSize: 15, metaFontSize: 13, controlHeight: 36, iconSize: 18 },
    moreActions: { titleFontSize: 16, sectionTitleFontSize: 14, rowHeight: 64, bodyFontSize: 14, descriptionFontSize: 12, iconSize: 15 },
    modal: { titleFontSize: 18, bodyFontSize: 14, labelFontSize: 14, buttonHeight: 44, buttonFontSize: 14, inputHeight: 36, iconSize: 21, avatarOptionMinWidth: 72 },
    evaluation: { modalWidth: 840, optionColumns: 5, optionGap: 16, optionHeight: 56, optionFontSize: 15, titleFontSize: 18, tabFontSize: 14, categoryFontSize: 13, managerColumns: 3, managerOptionHeight: 56, headerHeight: 72, headerPadding: 24, avatarSize: 44, avatarIconSize: 20, studentNoFontSize: 14, selectionHintFontSize: 12, managerHeight: 480, managerSidebarWidth: 200, managerHeaderFontSize: 11, managerRowHeight: 52, managerMetaFontSize: 10, managerControlSize: 24, closeButtonSize: 36, closeIconSize: 20, contentPadding: 32, categoryGap: 16 },
    toolbar: { height: 48, fontSize: 14, iconSize: 18, countFontSize: 12, groupPlanMetaFontSize: 12, utilityMinWidth: 220, groupPlanMinWidth: 240, groupPlanMenuWidth: 360, menuButtonSize: 40, groupPlanActionMenuWidth: 144, groupPlanActionItemHeight: 32, groupPlanActionFontSize: 14, groupPlanActionIconSize: 14, groupPlanCreateIconSize: 15 },
    randomPicker: { modalWidth: 840, modalHeight: 540, studentSlotWidth: 180, studentSlotHeight: 195, groupSlotWidth: 300, groupSlotHeight: 140, gap: 48, titleFontSize: 30, slotLabelFontSize: 12, slotRadius: 32, slotPadding: 12, emptyIconContainerSize: 40, emptyIconSize: 24, closeButtonSize: 40, closeIconSize: 20, headerPadding: 40, contentPadding: 40, footerHeight: 90, statusFontSize: 14 },
    quickActions: { dockSize: 64, actionSize: 48, iconSize: 32, fanOffsetX: 21, fanOffsetY: 77, assistantOffsetX: 69, assistantOffsetY: 40, statusTitleFontSize: 12, statusBodyFontSize: 16, statusOffset: 76, statusWidth: 320 },
    groupDrawerWidth: 560,
    formModalWidth: 520,
  },
  classroom: {
    mode: 'classroom',
    label: '课堂',
    studentCard: {
      width: 160,
      gap: 16,
      avatarSize: 80,
      levelIconSize: 24,
      levelHeight: 24,
      levelScoreFontSize: 22,
      levelAvatarGap: 4,
      countHeight: 22,
      ...PERFORMANCE_VALUE_LAYOUTS.classroom,
      avatarCountGap: 4,
      countIdentityGap: 6,
      identityHeight: 28,
      nameFontSize: 18,
      nameLineHeight: 22,
      rosterFontSize: 17,
      rosterWidth: 26,
      rosterHeight: 22,
      fullHeight: 180,
      countsHeight: 156,
      identityOnlyHeight: 132,
    },
    groupCard: { width: 320, gap: 16, compactHeight: 136, fullHeight: 148, avatarSize: 72, titleFontSize: 20, memberFontSize: 14, ...PERFORMANCE_VALUE_LAYOUTS.classroom },
    memberSelect: { columnMinWidth: 96, gap: 12, minHeight: 112, avatarSize: 60, nameFontSize: 13, studentNoFontSize: 14 },
    shell: { headerHeight: 64, horizontalPadding: 32, headerIconSize: 20, headerFontSize: 15, classSwitcherHeight: 48, classSwitcherMinWidth: 240, classSwitcherFontSize: 16, classMenuWidth: 264, classMenuItemHeight: 48, classMenuFontSize: 16, classMenuIconSize: 18, viewSwitcherHeight: 48, viewSwitcherFontSize: 16, viewSwitcherIconSize: 20 },
    filterSidebar: { width: 380, controlHeight: 64, titleFontSize: 19, bodyFontSize: 16, iconSize: 28, gap: 28 },
    historySidebar: { width: 480, titleFontSize: 24, bodyFontSize: 17, metaFontSize: 15, controlHeight: 44, iconSize: 22 },
    moreActions: { titleFontSize: 18, sectionTitleFontSize: 16, rowHeight: 76, bodyFontSize: 16, descriptionFontSize: 14, iconSize: 18 },
    modal: { titleFontSize: 21, bodyFontSize: 16, labelFontSize: 16, buttonHeight: 52, buttonFontSize: 16, inputHeight: 44, iconSize: 24, avatarOptionMinWidth: 88 },
    evaluation: { modalWidth: 960, optionColumns: 4, optionGap: 16, optionHeight: 68, optionFontSize: 17, titleFontSize: 20, tabFontSize: 16, categoryFontSize: 15, managerColumns: 3, managerOptionHeight: 64, headerHeight: 88, headerPadding: 32, avatarSize: 52, avatarIconSize: 24, studentNoFontSize: 16, selectionHintFontSize: 14, managerHeight: 540, managerSidebarWidth: 240, managerHeaderFontSize: 13, managerRowHeight: 64, managerMetaFontSize: 12, managerControlSize: 32, closeButtonSize: 44, closeIconSize: 24, contentPadding: 40, categoryGap: 20 },
    toolbar: { height: 56, fontSize: 16, iconSize: 20, countFontSize: 14, groupPlanMetaFontSize: 14, utilityMinWidth: 248, groupPlanMinWidth: 280, groupPlanMenuWidth: 420, menuButtonSize: 48, groupPlanActionMenuWidth: 160, groupPlanActionItemHeight: 40, groupPlanActionFontSize: 16, groupPlanActionIconSize: 16, groupPlanCreateIconSize: 17 },
    randomPicker: { modalWidth: 1000, modalHeight: 620, studentSlotWidth: 220, studentSlotHeight: 235, groupSlotWidth: 360, groupSlotHeight: 160, gap: 56, titleFontSize: 34, slotLabelFontSize: 14, slotRadius: 28, slotPadding: 16, emptyIconContainerSize: 48, emptyIconSize: 28, closeButtonSize: 48, closeIconSize: 24, headerPadding: 48, contentPadding: 48, footerHeight: 108, statusFontSize: 16 },
    quickActions: { dockSize: 76, actionSize: 58, iconSize: 38, fanOffsetX: 25, fanOffsetY: 90, assistantOffsetX: 82, assistantOffsetY: 47, statusTitleFontSize: 14, statusBodyFontSize: 19, statusOffset: 90, statusWidth: 360 },
    groupDrawerWidth: 640,
    formModalWidth: 560,
  },
  distant: {
    mode: 'distant',
    label: '远距',
    studentCard: {
      width: 184,
      gap: 20,
      avatarSize: 92,
      levelIconSize: 28,
      levelHeight: 28,
      levelScoreFontSize: 26,
      levelAvatarGap: 4,
      countHeight: 24,
      ...PERFORMANCE_VALUE_LAYOUTS.distant,
      avatarCountGap: 4,
      countIdentityGap: 8,
      identityHeight: 32,
      nameFontSize: 20,
      nameLineHeight: 24,
      rosterFontSize: 19,
      rosterWidth: 30,
      rosterHeight: 24,
      fullHeight: 204,
      countsHeight: 178,
      identityOnlyHeight: 150,
    },
    groupCard: { width: 360, gap: 20, compactHeight: 160, fullHeight: 172, avatarSize: 80, titleFontSize: 22, memberFontSize: 16, ...PERFORMANCE_VALUE_LAYOUTS.distant },
    memberSelect: { columnMinWidth: 116, gap: 16, minHeight: 132, avatarSize: 72, nameFontSize: 14, studentNoFontSize: 16 },
    shell: { headerHeight: 72, horizontalPadding: 40, headerIconSize: 24, headerFontSize: 17, classSwitcherHeight: 56, classSwitcherMinWidth: 280, classSwitcherFontSize: 18, classMenuWidth: 304, classMenuItemHeight: 56, classMenuFontSize: 18, classMenuIconSize: 20, viewSwitcherHeight: 56, viewSwitcherFontSize: 18, viewSwitcherIconSize: 24 },
    filterSidebar: { width: 440, controlHeight: 72, titleFontSize: 21, bodyFontSize: 18, iconSize: 32, gap: 32 },
    historySidebar: { width: 560, titleFontSize: 28, bodyFontSize: 19, metaFontSize: 17, controlHeight: 52, iconSize: 26 },
    moreActions: { titleFontSize: 20, sectionTitleFontSize: 18, rowHeight: 88, bodyFontSize: 18, descriptionFontSize: 16, iconSize: 22 },
    modal: { titleFontSize: 24, bodyFontSize: 18, labelFontSize: 18, buttonHeight: 60, buttonFontSize: 18, inputHeight: 52, iconSize: 28, avatarOptionMinWidth: 104 },
    evaluation: { modalWidth: 1120, optionColumns: 4, optionGap: 20, optionHeight: 78, optionFontSize: 19, titleFontSize: 22, tabFontSize: 18, categoryFontSize: 17, managerColumns: 3, managerOptionHeight: 72, headerHeight: 104, headerPadding: 40, avatarSize: 60, avatarIconSize: 28, studentNoFontSize: 18, selectionHintFontSize: 16, managerHeight: 600, managerSidebarWidth: 280, managerHeaderFontSize: 15, managerRowHeight: 76, managerMetaFontSize: 14, managerControlSize: 40, closeButtonSize: 52, closeIconSize: 28, contentPadding: 48, categoryGap: 24 },
    toolbar: { height: 64, fontSize: 18, iconSize: 22, countFontSize: 16, groupPlanMetaFontSize: 16, utilityMinWidth: 280, groupPlanMinWidth: 320, groupPlanMenuWidth: 480, menuButtonSize: 56, groupPlanActionMenuWidth: 176, groupPlanActionItemHeight: 48, groupPlanActionFontSize: 18, groupPlanActionIconSize: 18, groupPlanCreateIconSize: 19 },
    randomPicker: { modalWidth: 1160, modalHeight: 700, studentSlotWidth: 250, studentSlotHeight: 270, groupSlotWidth: 420, groupSlotHeight: 180, gap: 64, titleFontSize: 38, slotLabelFontSize: 16, slotRadius: 28, slotPadding: 20, emptyIconContainerSize: 56, emptyIconSize: 32, closeButtonSize: 56, closeIconSize: 28, headerPadding: 56, contentPadding: 56, footerHeight: 124, statusFontSize: 18 },
    quickActions: { dockSize: 88, actionSize: 68, iconSize: 44, fanOffsetX: 29, fanOffsetY: 104, assistantOffsetX: 95, assistantOffsetY: 54, statusTitleFontSize: 16, statusBodyFontSize: 22, statusOffset: 104, statusWidth: 420 },
    groupDrawerWidth: 720,
    formModalWidth: 620,
  },
};

export const resolveClassroomDisplayMode = (
  mode: ClassroomDisplayMode,
  viewportWidth: number,
  viewportHeight: number,
): ResolvedClassroomDisplayMode => {
  if (mode !== 'auto') return mode;
  if (viewportWidth >= 1920 || viewportHeight >= 1080) return 'distant';
  if (viewportWidth >= 1440 || viewportHeight >= 810) return 'classroom';
  return 'standard';
};

export const getClassroomDisplayConfig = (
  mode: ClassroomDisplayMode,
  viewportWidth = 0,
  viewportHeight = 0,
): ClassroomDisplayConfig => DISPLAY_CONFIGS[resolveClassroomDisplayMode(mode, viewportWidth, viewportHeight)];
