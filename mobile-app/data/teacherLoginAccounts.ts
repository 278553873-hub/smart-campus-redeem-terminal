import { DEMO_TEACHER_ACCOUNTS, findDemoTeacherAccount, isDemoTeacherPhone } from '../../shared/demoTeacherAccounts.ts';
import { hasDemoTeacherSupportAccess } from '../../shared/demoTeacherSupportAccess.ts';
import type { TeacherLoginAccount, TeacherLoginSession } from '../domain/teacherLoginAccess';

export const RECENT_TEACHER_LOGIN_PHONE = DEMO_TEACHER_ACCOUNTS[0].phone;
export const WECHAT_TEACHER_LOGIN_PHONES = [DEMO_TEACHER_ACCOUNTS[1].phone, DEMO_TEACHER_ACCOUNTS[2].phone] as const;

/** 演示账号关联；正式接入时以登录接口返回的学校、协作关系替换。 */
export const resolveDemoTeacherLoginAccount = (phone: string): TeacherLoginAccount => {
  const teacher = findDemoTeacherAccount(phone);
  return {
    phone,
    schoolSpaceIds: teacher?.schoolSpaceIds ?? [],
    collaborationSpaceIds: teacher?.collaborationSpaceIds ?? [],
  };
};

export function resolveDemoTeacherSwitch(currentPhone: string | undefined, input: string):
  { session: TeacherLoginSession; error?: never } | { session?: never; error: string } {
  if (!hasDemoTeacherSupportAccess(currentPhone)) return { error: '当前账号未获排查授权' };
  if (!isDemoTeacherPhone(input)) return { error: '请输入正确的手机号' };
  const target = findDemoTeacherAccount(input);
  if (!target) return { error: '该手机号未注册，请核对后重试' };
  if (target.phone === currentPhone) return { error: '当前已登录此账号' };

  const account = resolveDemoTeacherLoginAccount(target.phone);
  return { session: { account, spaceId: account.schoolSpaceIds[0] ?? 'personal' } };
}
