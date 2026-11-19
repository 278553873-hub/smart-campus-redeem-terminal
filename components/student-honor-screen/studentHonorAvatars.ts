import { getSystemStudentAvatar } from '../../mobile-app/assets/studentAvatarCatalog';
import { getMockClassSeed, getMockStudentNameAt } from '../../mobile-app/data/studentNamePool';
import type { GrowthStudent } from '../student-growth-screen/studentGrowthModel';

/** 演示沿用教师手机端头像库及班级种子规则，正式学生头像优先。 */
export function getHonorStudentAvatar(student: GrowthStudent & { avatar?: string; gender?: 'male' | 'female' }) {
  if (student.avatar) return student.avatar;
  const classId = student.classId ?? student.id;
  const index = Math.max(0, Number(student.id.match(/-student-(\d+)$/)?.[1] ?? 1) - 1);
  const gender = student.gender ?? getMockStudentNameAt(classId, index).g;
  return getSystemStudentAvatar(gender, getMockClassSeed(classId) * 31 + index * 17);
}
