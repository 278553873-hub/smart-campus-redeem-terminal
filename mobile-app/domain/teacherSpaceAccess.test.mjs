import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  canManagePersonalClasses,
  canViewClassLeaderboard,
  getHeadteacherAssistantScopes,
  getTeacherClassActionPolicy,
  getTeacherSpaceMenuPolicy,
} from './teacherSpaceAccess.ts';

const policyFor = (type, role) => getTeacherSpaceMenuPolicy({ id: `${type}-${role}`, title: '测试来源', type, role });

assert.deepEqual(policyFor('personal', 'owner'), {
  managementTools: ['termReport'],
  moreTools: ['subjectManagement', 'departmentManagement', 'coinIssuance', 'suggestionFeedback'],
});

assert.deepEqual(policyFor('collaboration', 'collaborator'), {
  managementTools: [],
  moreTools: ['suggestionFeedback'],
});

for (const role of ['administrator', 'leader']) {
  assert.deepEqual(policyFor('school', role), {
    managementTools: ['schoolReport', 'moralEducationCockpit', 'termReport', 'headteacherAssistant', 'principalAssistant'],
    moreTools: ['subjectManagement', 'departmentManagement', 'coinIssuance', 'suggestionFeedback', 'questionnaire', 'archiveDesign'],
  });
}

assert.deepEqual(policyFor('school', 'homeroomTeacher'), {
  managementTools: ['headteacherAssistant'],
  moreTools: ['suggestionFeedback', 'questionnaire'],
});

assert.deepEqual(policyFor('school', 'teacher'), {
  managementTools: [],
  moreTools: ['suggestionFeedback', 'questionnaire'],
});

const schoolWithTools = (enabledManagementTools) => getTeacherSpaceMenuPolicy({
  id: 'school-configured',
  title: '配置学校',
  type: 'school',
  role: 'homeroomTeacher',
  enabledManagementTools,
});

assert.deepEqual(schoolWithTools(['headteacherAssistant']), {
  managementTools: ['headteacherAssistant'],
  moreTools: ['suggestionFeedback', 'questionnaire'],
});
assert.deepEqual(schoolWithTools(['headteacherAssistantV2']), {
  managementTools: ['headteacherAssistant'],
  moreTools: ['suggestionFeedback', 'questionnaire'],
});
assert.deepEqual(schoolWithTools(['headteacherAssistant', 'headteacherAssistantV2']), {
  managementTools: ['headteacherAssistant'],
  moreTools: ['suggestionFeedback', 'questionnaire'],
});

const assistantScopesFor = (enabledManagementTools) => getHeadteacherAssistantScopes({
  id: 'school-configured',
  title: '配置学校',
  type: 'school',
  role: 'homeroomTeacher',
  enabledManagementTools,
});

assert.deepEqual(assistantScopesFor(['headteacherAssistant']), ['student']);
assert.deepEqual(assistantScopesFor(['headteacherAssistantV2']), ['class']);
assert.deepEqual(assistantScopesFor(['headteacherAssistant', 'headteacherAssistantV2']), ['student', 'class']);
assert.deepEqual(assistantScopesFor([]), []);

const classPolicyFor = ({ type, role, membership = 'school', classId = 'class-1', teaching = [], homeroom = [], deputyHomeroom = [] }) => (
  getTeacherClassActionPolicy({
    space: { id: `${type}-${role}`, title: '测试来源', type, role },
    classId,
    membership,
    teachingClassIds: new Set(teaching),
    homeroomClassIds: new Set(homeroom),
    deputyHomeroomClassIds: new Set(deputyHomeroom),
  })
);

assert.equal(canManagePersonalClasses({ id: 'personal', title: '个人', type: 'personal', role: 'owner' }), true);
assert.equal(canManagePersonalClasses({ id: 'collab', title: '协作', type: 'collaboration', role: 'collaborator' }), false);
assert.equal(canViewClassLeaderboard({ id: 'school-enabled', title: '学校', type: 'school', role: 'teacher', classRecordEnabled: true }), true);
assert.equal(canViewClassLeaderboard({ id: 'school-disabled', title: '学校', type: 'school', role: 'teacher', classRecordEnabled: false }), false);
assert.equal(canViewClassLeaderboard({ id: 'personal-enabled', title: '个人', type: 'personal', role: 'owner', classRecordEnabled: true }), false);

assert.deepEqual(classPolicyFor({ type: 'personal', role: 'owner', membership: 'created' }), {
  canUseDailyActions: true,
  canUpdateStudents: true,
  canMaintainClass: true,
  canInviteTeacher: true,
  canInviteParent: true,
});

assert.deepEqual(classPolicyFor({ type: 'personal', role: 'owner', membership: 'joined' }), {
  canUseDailyActions: true,
  canUpdateStudents: false,
  canMaintainClass: false,
  canInviteTeacher: false,
  canInviteParent: false,
});

assert.deepEqual(classPolicyFor({ type: 'school', role: 'teacher', classId: 'class-1', teaching: ['class-1'] }), {
  canUseDailyActions: true,
  canUpdateStudents: false,
  canMaintainClass: false,
  canInviteTeacher: false,
  canInviteParent: false,
});

assert.deepEqual(classPolicyFor({ type: 'school', role: 'teacher', classId: 'class-1' }), {
  canUseDailyActions: true,
  canUpdateStudents: false,
  canMaintainClass: false,
  canInviteTeacher: false,
  canInviteParent: false,
});

assert.deepEqual(classPolicyFor({ type: 'school', role: 'teacher', classId: 'class-1', deputyHomeroom: ['class-1'] }), {
  canUseDailyActions: true,
  canUpdateStudents: true,
  canMaintainClass: true,
  canInviteTeacher: true,
  canInviteParent: true,
});

const meViewSource = fs.readFileSync(new URL('../views/MeView.tsx', import.meta.url), 'utf8');
assert.ok(meViewSource.includes('getTeacherSpaceMenuPolicy(currentSpace)'), '我的页应从统一权限规则读取菜单。');
assert.ok(meViewSource.includes('{primaryTools.length > 0 && ('), '管理工具为空时应隐藏整个分组。');
assert.ok(meViewSource.includes('{moreTools.length > 0 && ('), '更多工具为空时应隐藏整个分组。');
assert.ok(!meViewSource.includes('teacherProfile.gradeLeaderGrades.length > 0'), '菜单权限不应继续通过教师资料字段猜测。');

console.log('Teacher space access policy assertions passed');
