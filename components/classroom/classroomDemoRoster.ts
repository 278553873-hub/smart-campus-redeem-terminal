import { GET_MOCK_STUDENTS_FOR_CLASS, MOCK_CLASSES } from '../../mobile-app/constants';

/** 两端演示使用同一班级/学生主键；显示名称不作为领取存储键。 */
export const CLASSROOM_DEMO_CLASSES = MOCK_CLASSES.map(info => `${info.admissionYear}级${info.classNumber}班`);
export function getClassroomDemoClassId(name: string) {
  const info = MOCK_CLASSES.find(info => `${info.admissionYear}级${info.classNumber}班` === name);
  if (!info) throw new Error('未找到对应班级');
  return info.id;
}
export function getClassroomDemoStudents(name: string) {
  return GET_MOCK_STUDENTS_FOR_CLASS(getClassroomDemoClassId(name));
}
