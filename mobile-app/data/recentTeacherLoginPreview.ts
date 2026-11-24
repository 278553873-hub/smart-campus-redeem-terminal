import { DEMO_TEACHER_SCHOOL_NAMES } from '../../shared/demoTeacherAccounts.ts';
import type { RecentTeacherLogin } from './recentTeacherLogins';

const teachers = [
    ['林晓', 'school-star', ['school-star', 'school-qizhong', 'school-qinghe']],
    ['陈雨', 'school-qizhong', ['school-star', 'school-qizhong']],
    ['周宁', 'personal', ['school-star', 'school-qinghe']],
    ['何静', 'school-qinghe'],
    ['徐文', 'school-star'],
    ['孙蕾', 'school-qizhong'],
    ['郑远', 'school-qinghe'],
    ['罗晨', 'school-star'],
    ['方妍', 'personal'],
    ['吴然', 'school-qizhong'],
] as const;

export const PREVIEW_RECENT_TEACHER_LOGINS: RecentTeacherLogin[] = teachers.map(([name, spaceId, schools], index) => ({
    name,
    schoolName: spaceId === 'personal' ? '个人空间' : DEMO_TEACHER_SCHOOL_NAMES[spaceId],
    spaceId,
    account: {
        phone: `19000006${String(index + 1).padStart(3, '0')}`,
        schoolSpaceIds: schools ?? (spaceId === 'personal' ? [] : [spaceId]),
        collaborationSpaceIds: [],
    },
}));
