import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const prd = fs.readFileSync(new URL('../docs/PRD-ToC个人教师自助开通改造.md', import.meta.url), 'utf8');
const failures = [];

const requireSource = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};
const requirePrd = (text, message) => {
  if (!prd.includes(text)) failures.push(message);
};
const getBlock = (startText, endText) => {
  const start = source.indexOf(startText);
  const end = source.indexOf(endText, start);
  return start >= 0 && end > start ? source.slice(start, end) : '';
};

requireSource("type ClassRole = 'headTeacher' | 'deputyHeadTeacher' | 'teacher';", '班级成员必须使用班主任、副班主任、普通老师三角色模型。');
requireSource('const classRolePermissions: Record<ClassRole', '三角色权限必须集中维护，不能散落在页面判断中。');
requireSource("| 'classDetailDeputy'", 'C 端原型应包含 08D 副班主任班级详情。');
requireSource("| 'teacherListDeputy'", 'C 端原型应包含 09C 副班主任老师列表。');
requireSource("| 'classListPersonalTeacherActions'", 'C 端原型应包含 07C 个人版普通老师更多操作。');
requireSource("| 'classListSchoolTeacherActions'", 'C 端原型应包含 07D 学校版普通老师更多操作。');
requireSource("if (pageKey === 'classListPersonalTeacherActions') return '07C';", '07C 应对应个人版普通老师更多操作。');
requireSource("if (pageKey === 'classListSchoolTeacherActions') return '07D';", '07D 应对应学校版普通老师更多操作。');
requireSource("pages: ['classListPersonal', 'classListPersonalTeacherActions']", '个人版班级流程应从 07A 进入 07C 普通老师菜单状态。');
requireSource("pages: ['classListSchool', 'classListSchoolTeacherActions']", '学校版班级流程应从 07B 进入 07D 普通老师菜单状态。');
requireSource("if (pageKey === 'classDetailDeputy') return '08D';", '08D 应对应副班主任班级详情。');
requireSource("if (pageKey === 'teacherListDeputy') return '09C';", '09C 应对应副班主任老师列表。');
requireSource("{ text: '副班主任', pages: ['classDetailDeputy'] }", '班级流程必须单独展示副班主任详情分支。');
requireSource("{ text: '普通老师', pages: ['classDetailMember'] }", '班级流程必须单独展示普通老师详情分支。');
requireSource("{ text: '副班主任', pages: ['teacherListDeputy'] }", '老师列表流程必须单独展示副班主任分支。');
requireSource("{ text: '普通老师', pages: ['teacherListMember'] }", '老师列表流程必须单独展示普通老师分支。');

const permissionBlock = getBlock('const classRolePermissions:', 'const getClassRoleForPage');
for (const text of [
  'headTeacher: {',
  'deputyHeadTeacher: {',
  'teacher: {',
  'canEditClass: true',
  'canInviteTeacher: true',
  'canInviteParent: true',
  'canManageDeputy: true',
  'canManageTeachers: true',
  'canManageParentBindings: true',
  'canEditClass: false',
  'canInviteTeacher: false',
  'canInviteParent: false',
]) {
  if (!permissionBlock.includes(text)) failures.push(`角色权限表缺少：${text}`);
}

const detailBlock = getBlock(
  "if (page === 'classDetail' || page === 'classDetailMember' || page === 'classDetailSchoolHead' || page === 'classDetailDeputy')",
  "if (page === 'teacherList' || page === 'teacherListDeputy' || page === 'teacherListMember')"
);
for (const text of [
  'const permissions = classRolePermissions[classRole];',
  '{permissions.canEditClass && (',
  '{permissions.canInviteTeacher && (',
  '{permissions.canInviteParent && (',
  "classRole === 'deputyHeadTeacher' ? 'teacherListDeputy' : 'teacherListMember'",
  "permissions.canManageParentBindings ? 'parentBindingList' : 'parentBindingListMember'",
  '{permissions.canManageDeputy && (',
  '<ScreenHeader title="班级详情" />',
]) {
  if (!detailBlock.includes(text)) failures.push(`班级详情权限渲染缺少：${text}`);
}
if (detailBlock.includes('班级详情（班主任）') || detailBlock.includes('班级详情（非班主任）')) {
  failures.push('真实页面标题不应展示角色逻辑说明。');
}

const teacherListBlock = getBlock(
  "if (page === 'teacherList' || page === 'teacherListDeputy' || page === 'teacherListMember')",
  "if (page === 'parentBindingList' || page === 'parentBindingListMember')"
);
for (const text of [
  'const permissions = classRolePermissions[classRole];',
  "permissions.canManageTeachers && teacher.id !== 'teacher-current'",
  '{permissions.canInviteTeacher && (',
  '{primaryClassTeachers.map(renderTeacherRow)}',
  '{otherClassTeachers.map(renderTeacherRow)}',
]) {
  if (!teacherListBlock.includes(text)) failures.push(`老师列表权限渲染缺少：${text}`);
}
requireSource("if (!activeTeacherAction || !classRolePermissions[getClassRoleForPage(page)].canManageDeputy) return null;", '老师角色操作弹层必须再次校验班主任权限。');
requireSource("activeTeacherAction.isDeputyHeadTeacher ? '取消副班主任' : '设为副班主任'", '班主任应支持设置或取消副班主任。');
requireSource("if (item.key === 'inviteTeacher') return activeClassPermissions.canInviteTeacher;", '班级更多操作必须按角色过滤邀请老师。');
requireSource("if (item.key === 'inviteParent') return activeClassPermissions.canInviteParent;", '班级更多操作必须按角色过滤邀请家长。');
requireSource("if (item.key === 'editClass') return activeClassPermissions.canEditClass;", '班级更多操作必须按角色过滤编辑班级。');
requireSource("const isPersonalOrdinaryTeacher = isPersonalClassListPage(page) && isOrdinaryTeacher;", '个人版普通老师的班级更多操作必须覆盖 07A 和 07C 页面状态。');
requireSource("return item.key === 'homework' || item.key === 'reward' || item.key === 'viewClass';", '个人版普通老师的班级更多操作只应保留日常操作和查看班级信息。');
requireSource("{ key: 'viewClass' as const, label: '查看班级信息', icon: Eye }", '个人版普通老师应可从班级更多操作进入只读班级详情。');
requireSource("if (key === 'viewClass' && activeClassProfile.role !== 'teacher') return;", '查看班级信息入口必须限制在普通老师场景。');
requireSource("if (next === 'classListPersonalTeacherActions' || next === 'classListSchoolTeacherActions')", '进入 07C/07D 时应初始化普通老师菜单预览。');
requireSource("setActiveClassAction({ name: ordinaryTeacherClass.name, code: ordinaryTeacherClass.code });", '进入 07C/07D 时应默认展开班级更多操作。');
requireSource('teacher.isHeadTeacher && <span', '老师卡片应展示班主任标签。');
requireSource('teacher.isDeputyHeadTeacher && <span', '老师卡片应展示副班主任标签。');
requireSource('teacher.subjects.map((subject)', '老师卡片应展示多个任教学科。');
requireSource('const primaryClassTeachers = classTeachers.filter((teacher) => teacher.isHeadTeacher || teacher.isDeputyHeadTeacher);', '老师列表应将班主任和副班主任置顶。');
requireSource('{primaryClassTeachers.length > 0 && otherClassTeachers.length > 0 && <div className="h-px bg-gray-200" />}', '置顶老师和普通老师之间应有弱分隔线。');

requirePrd('| 编辑班级基本信息 | 可以 | 可以 | 不可以 |', 'PRD 应明确班级编辑权限。');
requirePrd('| 邀请老师 | 可以 | 可以 | 不可以 |', 'PRD 应明确邀请老师权限。');
requirePrd('| 邀请家长绑定 | 可以 | 可以 | 不可以 |', 'PRD 应明确邀请家长权限。');
requirePrd('| 设置或取消副班主任 | 可以 | 不可以 | 不可以 |', 'PRD 应明确副班主任设置权限。');
requirePrd('普通老师不展示编辑班级、邀请老师和邀请家长入口', 'PRD 应要求普通老师无权限入口直接隐藏。');
requirePrd('个人版普通老师的班级卡片更多操作只保留作业录入、兑换奖励和查看班级信息', 'PRD 应明确个人版普通老师的班级卡片菜单差异。');
requirePrd('07C 普通老师更多操作（个人版）', 'PRD 应包含 07C 个人版普通老师菜单状态。');
requirePrd('07D 普通老师更多操作（学校版）', 'PRD 应包含 07D 学校版普通老师菜单状态。');
requirePrd('09C 老师列表（副班主任）', 'PRD 应包含 09C 副班主任老师列表规则。');

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi class role permission assertions passed');
