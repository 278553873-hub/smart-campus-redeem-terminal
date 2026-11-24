export const DEMO_TEACHER_SCHOOL_NAMES = {
    'school-star': '星河实验学校',
    'school-qizhong': '成都七中初中附属小学',
    'school-qinghe': '青禾实验小学',
} as const;

export interface DemoTeacherAccount {
    id: string;
    name: string;
    phone: string;
    schoolSpaceIds: readonly (keyof typeof DEMO_TEACHER_SCHOOL_NAMES)[];
    collaborationSpaceIds: readonly string[];
}

export const DEMO_TEACHER_ACCOUNTS = [
    { id: 'teacher-liufei', name: '刘飞', phone: '19000000000', schoolSpaceIds: ['school-star', 'school-qizhong', 'school-qinghe'], collaborationSpaceIds: ['collab-li'] },
    { id: 'demo-teacher-zhouning', name: '周宁', phone: '15200001332', schoolSpaceIds: [], collaborationSpaceIds: [] },
    { id: 'demo-teacher-chenyu', name: '陈雨', phone: '19900008610', schoolSpaceIds: ['school-star', 'school-qizhong', 'school-qinghe'], collaborationSpaceIds: ['collab-li'] },
] as const satisfies readonly DemoTeacherAccount[];

export const DEMO_UNREGISTERED_TEACHER_PHONE = '19000000001';

export function findDemoTeacherAccount(input: string): DemoTeacherAccount | undefined {
    const phone = input.trim();
    return DEMO_TEACHER_ACCOUNTS.find(account => account.phone === phone);
}

export const isDemoTeacherPhone = (phone: string) => /^1\d{10}$/.test(phone.trim());
