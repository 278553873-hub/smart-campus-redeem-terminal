import { MOCK_SUBJECTS } from '../constants';
import { ASSETS } from '../assets/images';
import type { TeacherProfile, TeacherDepartment } from '../types';

export const createTeachingAssignments = (classIds: string[], subject: string) => (
    classIds.map(classId => ({ classId, subject }))
);

export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
    id: 'teacher-liufei',
    name: '刘飞',
    avatar: ASSETS.AVATAR.TEACHER_DEFAULT,
    schoolName: '星河实验学校',
    departmentId: 'student-development',
    departmentName: '学发中心',
    teachingAssignments: [
        ...createTeachingAssignments(['c_2025_2', 'c_2025_3', 'c_2025_4', 'c_2025_5', 'c_2025_6', 'c_2025_7'], '体育'),
        ...createTeachingAssignments(['c_2024_1', 'c_2024_2', 'c_2024_3', 'c_2024_4', 'c_2024_5', 'c_2024_6', 'c_2024_7', 'c_2024_8', 'c_2024_9', 'c_2024_10'], '体育'),
        ...createTeachingAssignments(['c_2025_1'], '语文'),
        ...createTeachingAssignments(['c_2025_1'], '书法'),
    ],
    homeroomClassIds: ['c_2025_4', 'c_2025_1', 'c_2024_2', 'c_2025_7'],
    gradeLeaderGrades: ['一年级'],
};


export const TEACHER_PROFILE_SUBJECTS = Array.from(new Set(MOCK_SUBJECTS.map(subject => subject.subject)));
export const TEACHER_PROFILE_DEPARTMENTS: TeacherDepartment[] = [
    { id: 'student-development', name: '学发中心' },
    { id: 'moral-education', name: '德育处' },
    { id: 'academic-affairs', name: '教务处' },
    { id: 'physical-education', name: '艺体组' },
    { id: 'grade-office', name: '年级办公室' },
];

export const INITIAL_TEACHER_PROFILES_BY_SPACE: Record<string, TeacherProfile> = {
    personal: {
        ...DEFAULT_TEACHER_PROFILE,
        name: '大飞',
        schoolName: '个人空间',
        departmentId: '',
        departmentName: '',
        teachingAssignments: createTeachingAssignments(['c_2025_1'], '语文'),
        homeroomClassIds: ['c_2025_1'],
        gradeLeaderGrades: [],
    },
    'collab-li': {
        ...DEFAULT_TEACHER_PROFILE,
        schoolName: '星河实验学校',
        departmentId: '',
        departmentName: '',
        teachingAssignments: createTeachingAssignments(['c_2025_2'], '体育'),
        homeroomClassIds: [],
        gradeLeaderGrades: [],
    },
    'school-qizhong': {
        ...DEFAULT_TEACHER_PROFILE,
        schoolName: '成都七中初中附属小学',
        departmentId: 'physical-education',
        departmentName: '艺体组',
        teachingAssignments: createTeachingAssignments(['c_2025_4'], '体育'),
        homeroomClassIds: ['c_2025_4'],
        gradeLeaderGrades: [],
    },
    'school-star': DEFAULT_TEACHER_PROFILE,
    'school-qinghe': {
        ...DEFAULT_TEACHER_PROFILE,
        schoolName: '青禾实验小学',
        departmentId: 'physical-education',
        departmentName: '艺体组',
        teachingAssignments: createTeachingAssignments(['c_2025_3', 'c_2025_6'], '体育'),
        homeroomClassIds: ['c_2025_3'],
        gradeLeaderGrades: [],
    },
};

