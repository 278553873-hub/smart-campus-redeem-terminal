export type TeacherSpaceType = 'personal' | 'collaboration' | 'school';

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
    classRecordEnabled?: boolean;
    classLeaderboardSettlementCycle?: ClassLeaderboardSettlementCycle;
    enabledManagementTools?: TeacherManagementToolId[];
    headteacherAssistantEnabled?: boolean;
    evaluationScopes?: HeadteacherAssistantScope[];
    homeworkAiEnabled?: boolean;
    homeworkOperator?: boolean;
}

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
