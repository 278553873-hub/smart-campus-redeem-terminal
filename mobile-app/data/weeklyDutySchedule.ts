import { createDutyWeeks } from '../domain/weeklyDutySchedule';
import { ASSETS } from '../assets/images';

export interface DutyTeacherOption {
  id: string;
  name: string;
  avatar: string;
}

export const DUTY_TEACHERS: DutyTeacherOption[] = [
  { id: 'teacher-liu-fei', name: '刘飞', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-liu-chang', name: '刘畅', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-liu-siyuan', name: '刘思远', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-liu-yuxin', name: '刘雨欣', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-li-lian', name: '李连', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-zhang-quanyou', name: '张全有', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-chen-simin', name: '陈思敏', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-wang-jingyi', name: '王静怡', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-zhou-jingyi', name: '周婧怡', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-zhao-zihang', name: '赵子航', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-lin-xiaoyun', name: '林晓芸', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-ma-wenbo', name: '马文博', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-wu-jianing', name: '吴佳宁', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-sun-haoran', name: '孙浩然', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-zheng-yawen', name: '郑雅雯', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-huang-yiming', name: '黄一鸣', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-he-jiahui', name: '何嘉慧', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-luo-ziqian', name: '罗子谦', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-song-yutong', name: '宋雨桐', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-tang-zixuan', name: '唐子轩', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-xu-anran', name: '许安然', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-feng-zihan', name: '冯梓涵', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-liang-jiale', name: '梁嘉乐', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
  { id: 'teacher-xie-mingyuan', name: '谢明远', avatar: ASSETS.AVATAR.TEACHER_DEFAULT },
];

export const DUTY_TERM_WEEKS = createDutyWeeks('2026-07-27', 27);

export const INITIAL_DUTY_SCHEDULES: Record<string, string> = {
  '2026-07-27': 'teacher-chen-simin',
  '2026-08-03': 'teacher-li-lian',
  '2026-08-10': 'teacher-zhang-quanyou',
  '2026-08-24': 'teacher-wang-jingyi',
  '2026-09-07': 'teacher-zhao-zihang',
  '2026-09-21': 'teacher-lin-xiaoyun',
  '2026-10-12': 'teacher-ma-wenbo',
};

export const CURRENT_DUTY_WEEK_ID = '2026-08-10';
