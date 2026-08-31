export type MedalScope = 'platform' | 'school' | 'class';

export type MedalIconKey = 'award' | 'book' | 'heart' | 'star' | 'trophy';

export interface MedalDefinition {
  id: string;
  name: string;
  scope: MedalScope;
  icon: MedalIconKey;
  quantity: 1;
}

export interface MedalAwardRecord {
  id: string;
  medalId: string;
  studentId: string;
  quantity: number;
  awardedAt: string;
}

export type MedalDisplayContext = 'issuance' | 'studentDetail' | 'termReport';

export const MEDAL_DISPLAY_SPECS: Record<MedalDisplayContext, {
  iconSize: number;
  itemMinHeight: number;
  showQuantity: boolean;
}> = {
  issuance: { iconSize: 44, itemMinHeight: 100, showQuantity: false },
  studentDetail: { iconSize: 32, itemMinHeight: 56, showQuantity: true },
  termReport: { iconSize: 24, itemMinHeight: 40, showQuantity: true },
};

export const DEFAULT_PLATFORM_MEDALS: MedalDefinition[] = [
  { id: 'platform-reading-star', name: '阅读之星', scope: 'platform', icon: 'book', quantity: 1 },
  { id: 'platform-helpful-star', name: '互助之星', scope: 'platform', icon: 'heart', quantity: 1 },
  { id: 'platform-growth-star', name: '成长之星', scope: 'platform', icon: 'star', quantity: 1 },
  { id: 'platform-all-round-star', name: '全能之星', scope: 'platform', icon: 'trophy', quantity: 1 },
];

export const DEFAULT_SCHOOL_MEDALS: MedalDefinition[] = [
  { id: 'school-discipline-star', name: '守纪之星', scope: 'school', icon: 'award', quantity: 1 },
  { id: 'school-practice-star', name: '实践之星', scope: 'school', icon: 'trophy', quantity: 1 },
  { id: 'school-collaboration-star', name: '合作之星', scope: 'school', icon: 'heart', quantity: 1 },
];

export const DEFAULT_CLASS_MEDALS: MedalDefinition[] = [
  { id: 'class-morning-star', name: '晨读小达人', scope: 'class', icon: 'book', quantity: 1 },
  { id: 'class-team-star', name: '团队小标兵', scope: 'class', icon: 'heart', quantity: 1 },
  { id: 'class-progress-star', name: '进步小明星', scope: 'class', icon: 'star', quantity: 1 },
];
