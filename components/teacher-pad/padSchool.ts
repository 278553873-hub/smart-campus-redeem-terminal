import { TEACHER_SPACE_OPTIONS } from '../../mobile-app/data/teacherSpaces';

// 与教师手机端默认学校共用配置；首期移植范围由 Pad 导航控制。
export const padSchool = TEACHER_SPACE_OPTIONS.find(space => space.id === 'school-star')!;
