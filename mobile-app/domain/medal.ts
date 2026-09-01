export type MedalScope = 'platform' | 'school' | 'class';

export type MedalIconKey = 'award' | 'book' | 'heart' | 'star' | 'trophy';
export interface MedalIconImage {
  type: 'image';
  src: string;
  alt?: string;
}
export type MedalIcon = MedalIconKey | MedalIconImage;

export interface MedalDefinition {
  id: string;
  name: string;
  scope: MedalScope;
  icon: MedalIcon;
  quantity: 1;
}

export interface MedalAwardRecord {
  id: string;
  medalId: string;
  studentId: string;
  quantity: number;
  awardedAt: string;
}

export interface MedalSummary {
  definition: MedalDefinition;
  quantity: number;
}

export const summarizeMedalAwards = (records: MedalAwardRecord[], definitions: MedalDefinition[]): MedalSummary[] => (
  definitions.flatMap(definition => {
    const quantity = records
      .filter(record => record.medalId === definition.id)
      .reduce((total, record) => total + record.quantity, 0);
    return quantity > 0 ? [{ definition, quantity }] : [];
  })
);

export type MedalDisplayContext = 'issuance' | 'studentDetail' | 'termReport';

export const MEDAL_DISPLAY_SPECS: Record<MedalDisplayContext, {
  iconSize: number;
  itemMinHeight: number;
  showQuantity: boolean;
}> = {
  issuance: { iconSize: 64, itemMinHeight: 112, showQuantity: false },
  studentDetail: { iconSize: 32, itemMinHeight: 56, showQuantity: true },
  termReport: { iconSize: 24, itemMinHeight: 40, showQuantity: true },
};

export const DEFAULT_PLATFORM_MEDALS: MedalDefinition[] = [
  { id: 'platform-deyu-star', name: '德育之星', scope: 'platform', icon: 'award', quantity: 1 },
  { id: 'platform-zhiyu-star', name: '智育之星', scope: 'platform', icon: 'book', quantity: 1 },
  { id: 'platform-tiyu-star', name: '体育之星', scope: 'platform', icon: 'trophy', quantity: 1 },
  { id: 'platform-meiyu-star', name: '美育之星', scope: 'platform', icon: 'star', quantity: 1 },
  { id: 'platform-laoyu-star', name: '劳育之星', scope: 'platform', icon: 'heart', quantity: 1 },
];

export const DEFAULT_SEMESTER_MEDALS: MedalDefinition[] = [
  { id: 'platform-three-good-student', name: '三好学生', scope: 'platform', icon: 'award', quantity: 1 },
  { id: 'platform-excellent-cadre', name: '优秀班干部', scope: 'platform', icon: 'award', quantity: 1 },
  { id: 'platform-excellent-young-pioneer', name: '优秀少先队员', scope: 'platform', icon: 'award', quantity: 1 },
  { id: 'platform-excellent-student', name: '优秀学生', scope: 'platform', icon: 'award', quantity: 1 },
];

export const DEFAULT_DAILY_MEDALS: MedalDefinition[] = [
  { id: 'platform-progress-star', name: '进步之星', scope: 'platform', icon: 'star', quantity: 1 },
  { id: 'platform-diligent-star', name: '勤学之星', scope: 'platform', icon: 'book', quantity: 1 },
  { id: 'platform-civilized-star', name: '文明之星', scope: 'platform', icon: 'award', quantity: 1 },
  { id: 'platform-disciplined-star', name: '守纪之星', scope: 'platform', icon: 'trophy', quantity: 1 },
  { id: 'platform-friendly-star', name: '友善之星', scope: 'platform', icon: 'heart', quantity: 1 },
];

export const DEFAULT_ACTIVITY_MEDALS: MedalDefinition[] = [
  { id: 'platform-sports-talent', name: '运动达人', scope: 'platform', icon: 'trophy', quantity: 1 },
  { id: 'platform-art-talent', name: '艺术达人', scope: 'platform', icon: 'star', quantity: 1 },
  { id: 'platform-tech-talent', name: '科技达人', scope: 'platform', icon: 'award', quantity: 1 },
  { id: 'platform-reading-talent', name: '阅读达人', scope: 'platform', icon: 'book', quantity: 1 },
  { id: 'platform-performance-talent', name: '表演达人', scope: 'platform', icon: 'star', quantity: 1 },
];

export const DEFAULT_SCHOOL_MEDALS: MedalDefinition[] = [];

export const DEFAULT_CLASS_MEDALS: MedalDefinition[] = [
  { id: 'class-morning-star', name: '晨读小达人', scope: 'class', icon: 'book', quantity: 1 },
  { id: 'class-team-star', name: '团队小标兵', scope: 'class', icon: 'heart', quantity: 1 },
  { id: 'class-progress-star', name: '进步小明星', scope: 'class', icon: 'star', quantity: 1 },
];
