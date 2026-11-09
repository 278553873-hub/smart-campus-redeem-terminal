import { BookOpen, ClipboardList, Heart, Star, Users, UserRound, Footprints, Palette, Sprout, Pause, Play, Maximize, Minimize, SlidersHorizontal, RefreshCw, GraduationCap, ChevronLeft, ChevronRight, NotebookPen, ListChecks, UserCheck, type LucideProps } from 'lucide-react';

const screenIcons = {
  book: BookOpen, records: ClipboardList, evaluation: Star, students: Users, teacher: UserRound,
  virtue: Heart, wisdom: BookOpen, fitness: Footprints, aesthetic: Palette, labor: Sprout,
  pause: Pause, play: Play, maximize: Maximize, minimize: Minimize, settings: SlidersHorizontal, refresh: RefreshCw,
  school: GraduationCap, previous: ChevronLeft, next: ChevronRight, notebook: NotebookPen, checklist: ListChecks, participation: UserCheck,
} as const;
export type ScreenIconName = keyof typeof screenIcons;

/** 公共展示页统一使用项目已有的 Lucide 线性图标。图表路径不属于图标。 */
export function ScreenIcon({ name, ...props }: LucideProps & { name: ScreenIconName }) {
  const Icon = screenIcons[name];
  return <Icon size={24} strokeWidth={1.65} aria-hidden="true" {...props} />;
}
