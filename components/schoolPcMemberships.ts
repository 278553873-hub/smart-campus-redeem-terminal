import { getClassroomDemoClassNames } from './classroom/classroomDemoRoster';
import { RECENT_TEACHER_LOGIN_PHONE, resolveDemoTeacherLoginAccount } from '../mobile-app/data/teacherLoginAccounts';
import { INITIAL_TEACHER_PROFILES_BY_SPACE } from '../mobile-app/data/teacherProfile';
import { TEACHER_SPACE_OPTIONS } from '../mobile-app/data/teacherSpaces';
import { getTeacherSchoolTypeLabel } from '../mobile-app/domain/teacherSpaceAccess';

export type PcPortalApp = 'teacher' | 'all-in-one' | 'smart-big-screen';

export interface SchoolPcMembership {
  id: string;
  name: string;
  type: 'school' | 'personal';
  schoolTypeLabel?: string;
  role: string;
  canManageSchool: boolean;
  enrolledStudentCount?: number;
  classroomClassNames: readonly string[];
  availableApps: readonly PcPortalApp[];
}

// 学校电脑端各演示登录方式共用同一账号。学校版均开放管理后台，内部功能按角色提供。
export function getDemoSchoolPcMemberships(): SchoolPcMembership[] {
  const account = resolveDemoTeacherLoginAccount(RECENT_TEACHER_LOGIN_PHONE);
  return [...account.schoolSpaceIds, 'personal'].flatMap(id => {
    const space = TEACHER_SPACE_OPTIONS.find(item => item.id === id);
    if (!space || space.type === 'collaboration') return [];
    const profile = INITIAL_TEACHER_PROFILES_BY_SPACE[id];

    const canManageSchool = id === 'school-star';
    const classIds = new Set([
      ...(profile?.homeroomClassIds ?? []),
      ...(profile?.deputyHomeroomClassIds ?? []),
      ...(profile?.teachingAssignments.map(item => item.classId) ?? []),
    ]);
    const classroomClassNames = getClassroomDemoClassNames(canManageSchool ? undefined : classIds);
    const availableApps: PcPortalApp[] = space.type === 'school' ? ['teacher'] : [];
    if (canManageSchool) availableApps.push('all-in-one');
    availableApps.push('smart-big-screen');

    return [{
      id,
      name: space.type === 'personal' ? (profile?.schoolName ?? '个人空间') : space.title,
      type: space.type,
      schoolTypeLabel: getTeacherSchoolTypeLabel(space),
      role: space.type === 'personal' ? '教师' : canManageSchool ? '学校管理员' : '班主任',
      canManageSchool,
      enrolledStudentCount: canManageSchool ? 2530 : undefined,
      classroomClassNames,
      availableApps,
    }];
  });
}
