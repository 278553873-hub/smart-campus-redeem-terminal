import type { TeacherSpaceOption } from '../domain/teacherSpaceAccess';
import { DEMO_TEACHER_SCHOOL_NAMES } from '../../shared/demoTeacherAccounts';

const CLASS_RECORD_ENABLED_SPACE_IDS = new Set(['school-qizhong', 'school-star']);
export const TEACHER_SPACE_OPTIONS: TeacherSpaceOption[] = ([
    { id: 'personal', title: '我创建的班级', type: 'personal', role: 'owner' },
    { id: 'collab-li', title: '李明老师的班级', type: 'collaboration', role: 'collaborator' },
    { id: 'school-qizhong', title: DEMO_TEACHER_SCHOOL_NAMES['school-qizhong'], type: 'school', schoolType: 'primary', role: 'homeroomTeacher', classLeaderboardSettlementCycle: 'week', enabledManagementTools: [], headteacherAssistantEnabled: true, evaluationScopes: ['class'] },
    { id: 'school-star', title: DEMO_TEACHER_SCHOOL_NAMES['school-star'], type: 'school', schoolType: 'twelveYear', role: 'leader', classLeaderboardSettlementCycle: 'week', enabledManagementTools: ['schoolReport', 'moralEducationCockpit', 'termReport', 'principalAssistant'], headteacherAssistantEnabled: true, evaluationScopes: ['student', 'class'], homeworkAiEnabled: true, homeworkOperator: true },
    { id: 'school-qinghe', title: DEMO_TEACHER_SCHOOL_NAMES['school-qinghe'], type: 'school', schoolType: 'primary', role: 'homeroomTeacher', enabledManagementTools: [], headteacherAssistantEnabled: true, evaluationScopes: ['student'] },
] satisfies TeacherSpaceOption[]).map(space => ({
    ...space,
    classRecordEnabled: CLASS_RECORD_ENABLED_SPACE_IDS.has(space.id),
}));
