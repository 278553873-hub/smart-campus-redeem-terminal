import {
  Award,
  BookOpenCheck,
  FlaskConical,
  FileText,
  GraduationCap,
  Megaphone,
  MonitorSmartphone,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { GrowthRecordCategory } from '../domain/growthRecord.ts';

/** 类别图标：让老师在档案里扫一眼就能定位材料，不依赖颜色区分。 */
export const CATEGORY_ICONS: Record<GrowthRecordCategory, LucideIcon> = {
  教学比赛: Trophy,
  教学成果与课程开发: BookOpenCheck,
  论文与著作: FileText,
  课题研究: FlaskConical,
  培训进修: GraduationCap,
  荣誉表彰: Award,
  学生发展与辅导: Users,
  示范引领: Megaphone,
  数字素养与创新实践: MonitorSmartphone,
};
