import { DEMO_TEACHER_ACCOUNTS, findDemoTeacherAccount, isDemoTeacherPhone } from '../../shared/demoTeacherAccounts.ts';
import { DEMO_TEACHER_PREVIEW_SECURITY_CODE, hasDemoTeacherSupportAccess, verifyDemoTeacherSupportAccess } from '../../shared/demoTeacherSupportAccess.ts';
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

export type DemoTeacherSwitchResult = { session: TeacherLoginSession } | { error: string } | { needsSecurityCode: true };
export interface TeacherSupportDialogPreview {
  registered: boolean;
  codeEntered?: boolean;
}

export type DemoTeacherSwitchHandler = (phone: string, code: string | undefined, signal: AbortSignal, dialogPreview?: TeacherSupportDialogPreview) => Promise<DemoTeacherSwitchResult>;

export async function resolveDemoTeacherSwitch(
  currentPhone: string | undefined, input: string, code?: string, preview = false, signal?: AbortSignal, dialogPreview?: TeacherSupportDialogPreview,
): Promise<DemoTeacherSwitchResult> {
  if (!currentPhone || (!preview && !hasDemoTeacherSupportAccess(currentPhone))) return { error: '当前账号未获排查授权' };
  if (!isDemoTeacherPhone(input)) return { error: '请输入正确的手机号' };
  const target = findDemoTeacherAccount(input)
    ?? (dialogPreview?.registered ? DEMO_TEACHER_ACCOUNTS.find(account => account.phone !== currentPhone) : undefined);
  if (dialogPreview?.registered === false || !target) return { error: '该手机号未注册，请核对后重试' };
  if (target.phone === currentPhone) return { error: '当前已登录此账号' };

  if (dialogPreview?.codeEntered === false) {
    if (!code) return { needsSecurityCode: true };
    if (code !== DEMO_TEACHER_PREVIEW_SECURITY_CODE) return { error: '安全码有误，请重试' };
  } else if (dialogPreview?.codeEntered !== true) {
    const verification = await verifyDemoTeacherSupportAccess(currentPhone, code, preview, signal);
    if (verification.status === 'error') return { error: verification.error };
    if (verification.status === 'require-code') return { needsSecurityCode: true };
  }

  const account = resolveDemoTeacherLoginAccount(target.phone);
  return { session: { account, spaceId: account.schoolSpaceIds[0] ?? 'personal' } };
}
