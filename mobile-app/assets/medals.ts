import { ASSETS } from './images';
import activityArtDetail from './resources/medals/detail/activity-art.webp';
import activityPerformanceDetail from './resources/medals/detail/activity-performance.webp';
import activityReadingDetail from './resources/medals/detail/activity-reading.webp';
import activitySportsDetail from './resources/medals/detail/activity-sports.webp';
import activityTechDetail from './resources/medals/detail/activity-tech.webp';
import dailyCivilizedDetail from './resources/medals/detail/daily-civilized.webp';
import dailyDiligentDetail from './resources/medals/detail/daily-diligent.webp';
import dailyDisciplinedDetail from './resources/medals/detail/daily-disciplined.webp';
import dailyFriendlyDetail from './resources/medals/detail/daily-friendly.webp';
import dailyProgressDetail from './resources/medals/detail/daily-progress.webp';
import platformLaoyuDetail from './resources/medals/detail/platform-laoyu-star.webp';
import platformMeiyuDetail from './resources/medals/detail/platform-meiyu-star.webp';
import platformTiyuDetail from './resources/medals/detail/platform-tiyu-star.webp';
import platformZhiyuDetail from './resources/medals/detail/platform-zhiyu-star.webp';
import semesterCadreDetail from './resources/medals/detail/semester-cadre.webp';
import semesterExcellentStudentDetail from './resources/medals/detail/semester-excellent-student.webp';
import semesterThreeGoodDetail from './resources/medals/detail/semester-three-good.webp';
import semesterYoungPioneerDetail from './resources/medals/detail/semester-young-pioneer.webp';
import platformDeyuStarOriginal from './resources/medals/platform-deyu-star-original.png';
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

const PLATFORM_MEDAL_DETAIL_IMAGES: Partial<Record<string, string>> = {
  'platform-deyu-star': platformDeyuStarOriginal,
  'platform-zhiyu-star': platformZhiyuDetail,
  'platform-tiyu-star': platformTiyuDetail,
  'platform-meiyu-star': platformMeiyuDetail,
  'platform-laoyu-star': platformLaoyuDetail,
  'platform-three-good-student': semesterThreeGoodDetail,
  'platform-excellent-cadre': semesterCadreDetail,
  'platform-excellent-young-pioneer': semesterYoungPioneerDetail,
  'platform-excellent-student': semesterExcellentStudentDetail,
  'platform-progress-star': dailyProgressDetail,
  'platform-diligent-star': dailyDiligentDetail,
  'platform-civilized-star': dailyCivilizedDetail,
  'platform-disciplined-star': dailyDisciplinedDetail,
  'platform-friendly-star': dailyFriendlyDetail,
  'platform-sports-talent': activitySportsDetail,
  'platform-art-talent': activityArtDetail,
  'platform-tech-talent': activityTechDetail,
  'platform-reading-talent': activityReadingDetail,
  'platform-performance-talent': activityPerformanceDetail,
};

export function resolveMedalIcon(medalId: string, fallback: MedalIcon): MedalIcon {
  const src = PLATFORM_MEDAL_IMAGE_ASSETS[medalId];
  return src ? { type: 'image', src, alt: '' } : fallback;
}

export function resolveMedalDetailIcon(medalId: string, fallback: MedalIcon): MedalIcon {
  const src = PLATFORM_MEDAL_DETAIL_IMAGES[medalId];
  return src ? { type: 'image', src, alt: '' } : resolveMedalIcon(medalId, fallback);
}
