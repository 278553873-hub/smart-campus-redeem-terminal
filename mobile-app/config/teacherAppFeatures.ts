import { getTeacherRecordScopes, type HeadteacherAssistantScope, type TeacherManagementToolId, type TeacherMoreToolId, type TeacherSpaceOption } from '../domain/teacherSpaceAccess';

export type TeacherAppEdition = 'full' | 'lite';

export interface TeacherAppFeatures {
    recordScopes: readonly HeadteacherAssistantScope[];
    bluetoothDevices: boolean;
    wechatLogin: boolean;
    miniProgramCapsule: boolean;
    classManagement: boolean;
    campaigns: boolean;
    assignedCollections: boolean;
    meTools?: {
        managementTools: readonly TeacherManagementToolId[];
        moreTools: readonly TeacherMoreToolId[];
    };
}

/** 版本只控制产品开放范围；学校权限仍由原业务规则判断。 */
export const teacherAppFeatures: Record<TeacherAppEdition, TeacherAppFeatures> = {
    full: {
        recordScopes: ['student', 'class'],
        bluetoothDevices: false,
        wechatLogin: true,
        miniProgramCapsule: true,
        classManagement: true,
        campaigns: true,
        assignedCollections: true,
    },
    lite: {
        recordScopes: ['class'],
        bluetoothDevices: true,
        wechatLogin: true,
        miniProgramCapsule: false,
        classManagement: false,
        campaigns: false,
        assignedCollections: false,
        meTools: {
            managementTools: [],
            moreTools: ['bluetoothDevices'],
        },
    },
};

export const resolveTeacherAppRecordScopes = (edition: TeacherAppEdition, space: TeacherSpaceOption) => (
    getTeacherRecordScopes(space).filter(scope => teacherAppFeatures[edition].recordScopes.includes(scope))
);
