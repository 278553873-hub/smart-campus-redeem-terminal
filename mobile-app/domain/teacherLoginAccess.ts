export interface TeacherLoginAccount {
  phone: string;
  schoolSpaceIds: readonly string[];
  collaborationSpaceIds: readonly string[];
}

export interface TeacherLoginSession {
  account: TeacherLoginAccount;
  spaceId: string;
}

export type TeacherLoginDestination =
  | { type: 'school' | 'personal'; spaceId: string }
  | { type: 'school-guide' };

/** 每次登录先检查学校关联，个人版选择不能覆盖后来补录的学校关系。 */
export const resolveTeacherLoginDestination = (
  account: TeacherLoginAccount,
  personalConfirmed: boolean,
): TeacherLoginDestination => {
  if (account.schoolSpaceIds.length > 0) {
    return { type: 'school', spaceId: account.schoolSpaceIds[0] };
  }
  return personalConfirmed ? { type: 'personal', spaceId: 'personal' } : { type: 'school-guide' };
};

export const maskTeacherLoginPhone = (phone: string): string => phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');

const personalChoiceKey = (phone: string) => `teacher-personal-entry:v1:${phone}`;

export const readTeacherPersonalChoice = (phone: string): boolean => {
  try {
    return window.localStorage.getItem(personalChoiceKey(phone)) === 'confirmed';
  } catch {
    return false;
  }
};

export const confirmTeacherPersonalChoice = (phone: string): void => {
  try {
    window.localStorage.setItem(personalChoiceKey(phone), 'confirmed');
  } catch {
    // 存储受限时仍允许本次进入个人版。
  }
};
