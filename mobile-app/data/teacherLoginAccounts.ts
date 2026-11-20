import type { TeacherLoginAccount } from '../domain/teacherLoginAccess';

export const RECENT_TEACHER_LOGIN_PHONE = '19000000000';
export const WECHAT_TEACHER_LOGIN_PHONES = ['15200001332', '19900008610'] as const;

/** 演示账号关联；正式接入时以登录接口返回的学校、协作关系替换。 */
export const resolveDemoTeacherLoginAccount = (phone: string): TeacherLoginAccount => {
  const hasSchool = phone === RECENT_TEACHER_LOGIN_PHONE || phone === WECHAT_TEACHER_LOGIN_PHONES[1];
  return {
    phone,
    schoolSpaceIds: hasSchool ? ['school-star', 'school-qizhong', 'school-qinghe'] : [],
    collaborationSpaceIds: hasSchool ? ['collab-li'] : [],
  };
};
