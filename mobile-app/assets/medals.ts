import { ASSETS } from './images';
import type { MedalIcon } from '../domain/medal';

const PLATFORM_MEDAL_IMAGE_ASSETS: Record<string, string> = {
  'platform-deyu-star': ASSETS.MEDALS.PLATFORM_DEYU_STAR,
  'platform-zhiyu-star': ASSETS.MEDALS.PLATFORM_ZHIYU_STAR,
  'platform-tiyu-star': ASSETS.MEDALS.PLATFORM_TIYU_STAR,
  'platform-meiyu-star': ASSETS.MEDALS.PLATFORM_MEIYU_STAR,
  'platform-laoyu-star': ASSETS.MEDALS.PLATFORM_LAOYU_STAR,
  'platform-three-good-student': ASSETS.MEDALS.SEMESTER_THREE_GOOD,
  'platform-excellent-cadre': ASSETS.MEDALS.SEMESTER_CADRE,
  'platform-excellent-young-pioneer': ASSETS.MEDALS.SEMESTER_YOUNG_PIONEER,
  'platform-excellent-student': ASSETS.MEDALS.SEMESTER_EXCELLENT_STUDENT,
  'platform-progress-star': ASSETS.MEDALS.DAILY_PROGRESS,
  'platform-diligent-star': ASSETS.MEDALS.DAILY_DILIGENT,
  'platform-civilized-star': ASSETS.MEDALS.DAILY_CIVILIZED,
  'platform-disciplined-star': ASSETS.MEDALS.DAILY_DISCIPLINED,
  'platform-friendly-star': ASSETS.MEDALS.DAILY_FRIENDLY,
  'platform-sports-talent': ASSETS.MEDALS.ACTIVITY_SPORTS,
  'platform-art-talent': ASSETS.MEDALS.ACTIVITY_ART,
  'platform-tech-talent': ASSETS.MEDALS.ACTIVITY_TECH,
  'platform-reading-talent': ASSETS.MEDALS.ACTIVITY_READING,
  'platform-performance-talent': ASSETS.MEDALS.ACTIVITY_PERFORMANCE,
};


export function resolveMedalIcon(medalId: string, fallback: MedalIcon): MedalIcon {
  const src = PLATFORM_MEDAL_IMAGE_ASSETS[medalId];
  return src ? { type: 'image', src, alt: '' } : fallback;
}
