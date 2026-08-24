import type { GroupCardDisplaySettings } from '../types';

export const DEFAULT_GROUP_CARD_DISPLAY_SETTINGS: GroupCardDisplaySettings = {
  showPraiseCount: true,
  showCriticismCount: true,
};

export const getGroupCardDisplaySettings = (
  settings?: Partial<GroupCardDisplaySettings>,
): GroupCardDisplaySettings => ({
  ...DEFAULT_GROUP_CARD_DISPLAY_SETTINGS,
  ...settings,
});
