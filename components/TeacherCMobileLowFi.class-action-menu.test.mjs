import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("type ClassActionKey = 'reward' | 'batchStudents'", '07 班级列表更多操作应新增批量修改学生 action。');
requireText("| 'studentBatchEdit'", 'C 端原型应新增批量修改学生信息页面。');
requireText("if (pageKey === 'studentBatchEdit') return '11A';", '批量修改学生信息页应有独立页面编号。');
requireText("title: '日常操作'", '07 班级列表更多操作应保留日常操作分组。');
requireText("{ key: 'homework' as const, label: '作业录入', icon: FileText }", '作业录入应归入日常操作。');
requireText("{ key: 'reward' as const, label: '兑换奖励', icon: Gift }", '兑换奖励应归入日常操作。');
requireText("title: '学生管理'", '班级更多操作应使用学生管理分组。');
requireText("{ key: 'batchStudents' as const, label: '批量修改学生', icon: Users }", '学生管理应包含批量修改学生。');
requireText("openStudentBatchEdit();", '批量修改学生入口应打开独立页面，不应继续借道学生列表。');
requireText("{ key: 'face' as const, label: '更新人脸数据', icon: ScanFace }", '学生管理应包含更新人脸数据。');
requireText("{ key: 'password' as const, label: '设置兑换密码', icon: Shield }", '学生管理应包含设置兑换密码。');
requireText("{ key: 'leftStudents' as const, label: '离校学生管理', icon: Users }", '学生管理应将离校学生管理放在最后。');
requireText("onClick={() => runClassAction('classInfo')}", '顶部班级名称行应进入班级详情。');
requireText('aria-label={`查看${activeClassAction.name}班级详情`}', '顶部班级详情入口应提供明确的无障碍名称。');
requireText("if (isOrdinaryTeacher && (item.key === 'batchStudents' || item.key === 'face' || item.key === 'password')) return false;", '普通老师不应看到批量修改、更新人脸和设置兑换密码。');
requireText("if (item.key === 'inviteTeacher') return activeClassPermissions.canInviteTeacher;", '普通老师不应看到邀请老师。');
requireText("if (item.key === 'inviteParent') return activeClassPermissions.canInviteParent;", '普通老师不应看到邀请家长。');
requireText("if (item.key === 'leftStudents') return activeClassPermissions.canManageLeftStudents;", '普通老师不应看到离校学生管理。');
requireText("if (!permissions.canManageLeftStudents) return;", '离校学生管理操作触发时应再次校验角色权限。');
requireText("const isOrdinaryTeacherPreview = next === 'classActionTeacherPreview';", '07C 应使用普通老师菜单预览状态，07D 使用班主任和副班主任菜单预览状态。');
requireText('if (isClassActionPreviewPage(page)) {', '共享操作弹层应使用独立预览画布，不复用版本化班级列表。');
if (source.includes("title: '校园币兑换'")) {
  failures.push('07 班级列表更多操作不应继续出现校园币兑换分组。');
}
const classActionGroupsStart = source.indexOf('  const classActionGroups = [');
const classActionGroupsEnd = source.indexOf('\n  const ClassCard =', classActionGroupsStart);
const classActionGroupsBlock = source.slice(classActionGroupsStart, classActionGroupsEnd);
const expectedGroupTitles = ["title: '日常操作'", "title: '学生管理'", "title: '协同管理'"];
for (let index = 1; index < expectedGroupTitles.length; index += 1) {
  if (classActionGroupsBlock.indexOf(expectedGroupTitles[index - 1]) >= classActionGroupsBlock.indexOf(expectedGroupTitles[index])) {
    failures.push('班级更多操作分组应依次为日常操作、学生管理、协同管理。');
    break;
  }
}
if (classActionGroupsBlock.includes("title: '班级维护'")) {
  failures.push('班级更多操作不应保留班级维护分组。');
}
if (classActionGroupsBlock.includes("key: 'classInfo'")) {
  failures.push('班级详情不应继续占用操作分组中的宫格位置。');
}
if (source.includes("{ key: 'leftStudents' as const, label: '离校学生', icon: Users }")) {
  failures.push('班级更多操作中不应继续使用“离校学生”旧文案。');
}

if (source.includes("{ key: 'classInfo' as const, label: '班级信息管理', icon: Settings }")) {
  failures.push('班级更多操作中不应继续使用“班级信息管理”旧文案。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi class action menu assertions passed');
