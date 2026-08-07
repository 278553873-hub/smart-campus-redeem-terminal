export type TeacherSpaceType = 'personal' | 'collaboration' | 'school';

export type TeacherSpaceRole =
    | 'owner'
    | 'collaborator'
    | 'administrator'
    | 'leader'
    | 'homeroomTeacher'
    | 'teacher';

export interface TeacherSpaceOption {
    id: string;
    title: string;
    type: TeacherSpaceType;
    role: TeacherSpaceRole;
    classRecordEnabled?: boolean;
    enabledManagementTools?: TeacherManagementToolId[];
}

export type TeacherManagementToolId =
    | 'schoolReport'
    | 'termReport'
    | 'headteacherAssistant'
    | 'headteacherAssistantV2'
    | 'principalAssistant';

export type TeacherMoreToolId =
    | 'subjectManagement'
    | 'departmentManagement'
    | 'coinIssuance'
    | 'suggestionFeedback'
    | 'questionnaire'
    | 'archiveDesign';

export interface TeacherSpaceMenuPolicy {
    managementTools: TeacherManagementToolId[];
    moreTools: TeacherMoreToolId[];
}

export type TeacherClassMembership = 'created' | 'joined' | 'school';

export interface TeacherClassActionPolicy {
    canUseDailyActions: boolean;
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
    'termReport',
    'headteacherAssistant',
    'principalAssistant',
];

const ALL_MORE_TOOLS: TeacherMoreToolId[] = [
    'subjectManagement',
    'departmentManagement',
    'coinIssuance',
    'suggestionFeedback',
    'questionnaire',
    'archiveDesign',
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
    return {
        managementTools: space.enabledManagementTools
            ? [...space.enabledManagementTools]
            : [...policy.managementTools],
        moreTools: [...policy.moreTools],
    };
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
        canUpdateStudents: canManageClass,
        canMaintainClass: canManageClass,
        canInviteTeacher: canManageClass,
        canInviteParent: canManageClass,
    };
};
