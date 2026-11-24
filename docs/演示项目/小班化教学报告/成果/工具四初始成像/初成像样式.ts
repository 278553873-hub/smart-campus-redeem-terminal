export const reportSectionIds = ['observations', 'card', 'five', 'three', 'light', 'watch', 'message'] as const;
export type ReportSectionId = (typeof reportSectionIds)[number];
export type ReportCardId = 'cover' | ReportSectionId;

type CardAppearance = {
  titleStyle: 'band' | 'rule' | 'plain';
  tone: 'jade' | 'gold' | 'neutral';
  texture: 'plain' | 'linen';
};

// 样式是独立的学校模板配置，不进入生成内容或教师的内容修改记录。
export type ReportAppearance = {
  pageTexture: 'paper' | 'plain';
  cardDefaults: CardAppearance;
  cards?: Partial<Record<ReportCardId, Partial<CardAppearance>>>;
};

export const defaultReportAppearance: ReportAppearance = {
  pageTexture: 'paper',
  cardDefaults: { titleStyle: 'band', tone: 'jade', texture: 'plain' },
  cards: {
    cover: { titleStyle: 'rule', texture: 'linen' },
    light: { tone: 'gold' },
    message: { titleStyle: 'rule', tone: 'gold', texture: 'linen' },
  },
};

export function cardAppearanceAttributes(appearance: ReportAppearance, id: ReportCardId) {
  const card = { ...appearance.cardDefaults, ...appearance.cards?.[id] };
  return {
    'data-title-style': card.titleStyle,
    'data-card-tone': card.tone,
    'data-card-texture': card.texture,
  };
}
