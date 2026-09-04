import type { ClassInfo } from '../types';

export type TeacherSpaceType = 'personal' | 'collaboration' | 'school';

export type TeacherSchoolType = 'primary' | 'middle' | 'high' | 'nineYear' | 'twelveYear' | 'completeMiddle';

export const TEACHER_SCHOOL_TYPE_LABELS: Record<TeacherSchoolType, string> = {
    primary: '小学',
    middle: '初中',
    high: '高中',
    nineYear: '九年一贯制',
    twelveYear: '十二年一贯制',
    completeMiddle: '完全中学',
};

const PRIMARY_GRADE_LABELS = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
const MIDDLE_GRADE_LABELS = ['七年级', '八年级', '九年级'];
const HIGH_GRADE_LABELS = ['高一', '高二', '高三'];

const CLASS_NUMBER_LABELS: Record<string, string> = {
    一: '1',
    二: '2',
    三: '3',
    四: '4',
    五: '5',
    六: '6',
    七: '7',
    八: '8',
    九: '9',
    十: '10',
};

const normalizeTeacherClassName = (name: string) => name.replace(
    /([小初高]?\d{4}级)(一|二|三|四|五|六|七|八|九|十)班$/,
    (_match, grade: string, classNumber: string) => `${grade}${CLASS_NUMBER_LABELS[classNumber]}班`,
);

export const getTeacherSchoolGradeOptions = (space: TeacherSpaceOption): string[] | undefined => {
    if (space.type !== 'school' || !space.schoolType) return undefined;
    if (space.schoolType === 'primary') return [...PRIMARY_GRADE_LABELS];
    if (space.schoolType === 'middle') return [...MIDDLE_GRADE_LABELS];
    if (space.schoolType === 'high') return [...HIGH_GRADE_LABELS];
    if (space.schoolType === 'nineYear') return [...PRIMARY_GRADE_LABELS, ...MIDDLE_GRADE_LABELS];
    if (space.schoolType === 'twelveYear') return [...PRIMARY_GRADE_LABELS, ...MIDDLE_GRADE_LABELS, ...HIGH_GRADE_LABELS];
    return [...MIDDLE_GRADE_LABELS, ...HIGH_GRADE_LABELS];
};

export type TeacherSpaceRole =
    | 'owner'
    | 'collaborator'
    | 'administrator'
    | 'leader'
    | 'homeroomTeacher'
    | 'teacher';

export type HeadteacherAssistantScope = 'student' | 'class';

export type ClassLeaderboardSettlementCycle = 'week' | 'month';

export interface TeacherSpaceOption {
    id: string;
    title: string;
    type: TeacherSpaceType;
    role: TeacherSpaceRole;
    schoolType?: TeacherSchoolType;
    classRecordEnabled?: boolean;
    classLeaderboardSettlementCycle?: ClassLeaderboardSettlementCycle;
    enabledManagementTools?: TeacherManagementToolId[];
    headteacherAssistantEnabled?: boolean;
    evaluationScopes?: HeadteacherAssistantScope[];
    homeworkAiEnabled?: boolean;
    homeworkOperator?: boolean;
}

export const getTeacherSchoolTypeLabel = (space: TeacherSpaceOption): string | undefined => (
    space.type === 'school' && space.schoolType ? TEACHER_SCHOOL_TYPE_LABELS[space.schoolType] : undefined
);

type TeacherClassDisplayInfo = Pick<ClassInfo, 'name' | 'gradeLevel' | 'educationStage'>;

const getClassEducationStage = (classInfo: TeacherClassDisplayInfo) => {
    if (classInfo.educationStage) return classInfo.educationStage;
    if (/^(七|八|九)年级/.test(classInfo.gradeLevel)) return 'middle';
    if (classInfo.gradeLevel.startsWith('高')) return 'high';
    return 'primary';
};

export const getTeacherClassDisplayName = (classInfo: TeacherClassDisplayInfo, space: TeacherSpaceOption): string => {
    const normalizedName = normalizeTeacherClassName(classInfo.name);
    if (space.type !== 'school' || !space.schoolType) return normalizedName;

    const prefixBySchoolType: Partial<Record<TeacherSchoolType, Record<'primary' | 'middle' | 'high', string>>> = {
        nineYear: { primary: '小', middle: '初', high: '' },
        twelveYear: { primary: '小', middle: '初', high: '高' },
        completeMiddle: { primary: '', middle: '初', high: '高' },
    };
    const prefix = prefixBySchoolType[space.schoolType]?.[getClassEducationStage(classInfo)] ?? '';
    if (!prefix || normalizedName.startsWith(prefix)) return normalizedName;
    return `${prefix}${normalizedName}`;
};

export type TeacherManagementToolId =
    | 'schoolReport'
    | 'moralEducationCockpit'
    | 'termReport'
    | 'headteacherAssistant'
    | 'headteacherAssistantV2'
    | 'principalAssistant';

export type TeacherMoreToolId =
    | 'homeworkBatchImport'
    | 'coinIssuance'
    | 'questionnaire'
    | 'weeklyDutySchedule'
    | 'archiveDesign'
    | 'subjectManagement'
    | 'departmentManagement'
    | 'suggestionFeedback';

export interface TeacherSpaceMenuPolicy {
    managementTools: TeacherManagementToolId[];
    moreTools: TeacherMoreToolId[];
}

export type TeacherClassMembership = 'created' | 'joined' | 'school';

export interface TeacherClassActionPolicy {
    canUseDailyActions: boolean;
    canManuallyEnterHomework: boolean;
    canUpdateStudents: boolean;
    canMaintainClass: boolean;
    canInviteTeacher: boolean;
    canInviteParent: boolean;
}

interface TeacherClassAccessContext {
    space: TeacherSpaceOption;
    classId: string;
    membership: TeacherClassMembership;
    teachingClassIds: Set<string>;
    homeroomClassIds: Set<string>;
    deputyHomeroomClassIds?: Set<string>;
}

const ALL_MANAGEMENT_TOOLS: TeacherManagementToolId[] = [
    'schoolReport',
    'moralEducationCockpit',
    'termReport',
    'headteacherAssistant',
    'principalAssistant',
];

const ALL_MORE_TOOLS: TeacherMoreToolId[] = [
    'coinIssuance',
    'questionnaire',
    'weeklyDutySchedule',
    'archiveDesign',
    'subjectManagement',
    'departmentManagement',
    'suggestionFeedback',
];

const SPACE_MENU_POLICIES: Record<TeacherSpaceRole, TeacherSpaceMenuPolicy> = {
    owner: {
        managementTools: ['termReport'],
        moreTools: ['subjectManagement', 'departmentManagement', 'coinIssuance', 'suggestionFeedback'],
    },
    collaborator: {
        managementTools: [],
        moreTools: ['suggestionFeedback'],
    },
    administrator: {
        managementTools: ALL_MANAGEMENT_TOOLS,
        moreTools: ALL_MORE_TOOLS,
    },
    leader: {
        managementTools: ALL_MANAGEMENT_TOOLS,
        moreTools: ALL_MORE_TOOLS,
    },
    homeroomTeacher: {
        managementTools: ['headteacherAssistant'],
        moreTools: ['suggestionFeedback', 'questionnaire'],
    },
    teacher: {
        managementTools: [],
        moreTools: ['suggestionFeedback', 'questionnaire'],
    },
};

export const getTeacherSpaceMenuPolicy = (space: TeacherSpaceOption): TeacherSpaceMenuPolicy => {
    const policy = SPACE_MENU_POLICIES[space.role];
    const configuredManagementTools = space.enabledManagementTools
        ? [...space.enabledManagementTools]
        : [...policy.managementTools];
    const managementTools: TeacherManagementToolId[] = [];
    configuredManagementTools.forEach(tool => {
        if (tool === 'headteacherAssistant' || tool === 'headteacherAssistantV2') {
            if (!managementTools.includes('headteacherAssistant')) managementTools.push('headteacherAssistant');
            return;
        }
        managementTools.push(tool);
    });
    if (getHeadteacherAssistantScopes(space).length > 0 && !managementTools.includes('headteacherAssistant')) {
        const principalAssistantIndex = managementTools.indexOf('principalAssistant');
        if (principalAssistantIndex >= 0) managementTools.splice(principalAssistantIndex, 0, 'headteacherAssistant');
        else managementTools.push('headteacherAssistant');
    }

    const moreTools = [...policy.moreTools];
    if (
        space.type === 'school'
        && space.homeworkAiEnabled === true
        && space.homeworkOperator === true
        && !moreTools.includes('homeworkBatchImport')
    ) {
        moreTools.unshift('homeworkBatchImport');
    }

    return {
        managementTools,
        moreTools,
    };
};

export const getHeadteacherAssistantScopes = (
    space: TeacherSpaceOption,
): HeadteacherAssistantScope[] => {
    if (space.headteacherAssistantEnabled === false) return [];
    if (space.evaluationScopes) {
        return Array.from(new Set(space.evaluationScopes));
    }
    const configuredManagementTools = space.enabledManagementTools
        ?? SPACE_MENU_POLICIES[space.role].managementTools;
    const scopes: HeadteacherAssistantScope[] = [];
    if (configuredManagementTools.includes('headteacherAssistant')) scopes.push('student');
    if (configuredManagementTools.includes('headteacherAssistantV2')) scopes.push('class');
    return scopes;
};

export const canTeacherSpaceRecordClass = (space: TeacherSpaceOption): boolean => (
    space.type === 'school' && space.classRecordEnabled === true
);

export const canManagePersonalClasses = (space: TeacherSpaceOption): boolean => (
    space.type === 'personal' && space.role === 'owner'
);

export const canViewClassLeaderboard = (space: TeacherSpaceOption): boolean => (
    space.type === 'school' && space.classRecordEnabled === true
);

export const getTeacherClassActionPolicy = ({
    space,
    classId,
    membership,
    teachingClassIds,
    homeroomClassIds,
    deputyHomeroomClassIds = new Set<string>(),
}: TeacherClassAccessContext): TeacherClassActionPolicy => {
    const isClassOwner = membership === 'created' && space.type === 'personal' && space.role === 'owner';
    const isHomeroomTeacher = space.type === 'school' && homeroomClassIds.has(classId);
    const isDeputyHomeroomTeacher = space.type === 'school' && deputyHomeroomClassIds.has(classId);
    const isAssignedTeacher = teachingClassIds.has(classId) || isHomeroomTeacher || isDeputyHomeroomTeacher;
    const canManageClass = isClassOwner || isHomeroomTeacher || isDeputyHomeroomTeacher;

    return {
        canUseDailyActions: canManageClass || isAssignedTeacher || membership === 'joined' || space.type === 'collaboration' || space.type === 'school',
        canManuallyEnterHomework: isClassOwner || isAssignedTeacher || membership === 'joined' || space.type === 'collaboration',
        canUpdateStudents: canManageClass,
        canMaintainClass: canManageClass,
        canInviteTeacher: canManageClass,
        canInviteParent: canManageClass,
    };
};
