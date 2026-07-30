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
requireSource("| 'classActionTeacherPreview'", 'C 端原型应包含 07C 普通老师共享操作弹层。');
requireSource("| 'classActionManagerPreview'", 'C 端原型应包含 07D 班主任/副班主任共享操作弹层。');
requireSource("if (pageKey === 'classActionTeacherPreview') return '07C';", '07C 应对应普通老师共享操作弹层。');
requireSource("if (pageKey === 'classActionManagerPreview') return '07D';", '07D 应对应班主任/副班主任共享操作弹层。');
requireSource("{ title: '班级操作', pages: ['classActionTeacherPreview', 'classActionManagerPreview'], parallel: true }", '导航地图应只展示一组共用班级操作弹层。');
if (
  source.includes('classListPersonalTeacherActions')
  || source.includes('classListPersonalManagerActions')
  || source.includes('classListSchoolTeacherActions')
  || source.includes('classListSchoolManagerActions')
  || source.includes("return '07E'")
  || source.includes("return '07F'")
) {
  failures.push('个人版和学校版相同的班级操作弹层不应继续拆成 07C/07D/07E/07F 四页。');
}
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
requireSource("if (isOrdinaryTeacher && (item.key === 'batchStudents' || item.key === 'face' || item.key === 'password')) return false;", '个人版和学校版普通老师都不能看到学生管理操作。');
requireSource("if (item.key === 'leftStudents') return activeClassPermissions.canManageLeftStudents;", '个人版和学校版普通老师都不能看到离校学生管理。');
requireSource("if (!permissions.canManageLeftStudents) return;", '离校学生管理操作必须再次校验角色权限。');
requireSource("onClick={() => runClassAction('classInfo')}", '所有角色应从顶部班级名称行进入班级详情。');
requireSource("if (key === 'classInfo')", '班级详情应统一进入按角色分流的班级详情页。');
requireSource('if (isClassActionPreviewPage(next)) {', '07C/07D 应使用统一的共享菜单预览判断。');
requireSource("const isOrdinaryTeacherPreview = next === 'classActionTeacherPreview';", '07C 应使用普通老师权限预览。');
requireSource("setActiveClassAction({ name: previewClass.name, code: previewClass.code });", '进入两个共享角色菜单页面时应默认展开班级更多操作。');
requireSource('return <div className="h-full w-full bg-gray-50" aria-hidden="true" />;', '共享操作弹层预览应隐藏班级列表背景。');
requireSource('teacher.isHeadTeacher && <span', '老师卡片应展示班主任标签。');
requireSource('teacher.isDeputyHeadTeacher && <span', '老师卡片应展示副班主任标签。');
requireSource('teacher.subjects.map((subject)', '老师卡片应展示多个任教学科。');
requireSource('const primaryClassTeachers = classTeachers.filter((teacher) => teacher.isHeadTeacher || teacher.isDeputyHeadTeacher);', '老师列表应将班主任和副班主任置顶。');
requireSource('{primaryClassTeachers.length > 0 && otherClassTeachers.length > 0 && <div className="h-px bg-gray-200" />}', '置顶老师和普通老师之间应有弱分隔线。');

requirePrd('| 编辑班级基本信息 | 可以 | 可以 | 不可以 |', 'PRD 应明确班级编辑权限。');
requirePrd('| 邀请老师 | 可以 | 可以 | 不可以 |', 'PRD 应明确邀请老师权限。');
requirePrd('| 邀请家长绑定 | 可以 | 可以 | 不可以 |', 'PRD 应明确邀请家长权限。');
requirePrd('| 设置或取消副班主任 | 可以 | 不可以 | 不可以 |', 'PRD 应明确副班主任设置权限。');
requirePrd('普通老师不展示编辑班级、邀请老师、邀请家长和离校学生管理入口', 'PRD 应要求普通老师无权限入口直接隐藏。');
requirePrd('普通老师的班级卡片更多操作不展示批量修改学生、更新人脸数据、设置兑换密码、邀请老师加入、邀请家长加入和离校学生管理', 'PRD 应明确普通老师的班级卡片菜单差异。');
requirePrd('所有角色都可点击更多操作弹层顶部班级名称行进入“班级详情”', 'PRD 应明确统一班级详情入口。');
requirePrd('07C 普通老师更多操作', 'PRD 应包含 07C 普通老师共享菜单状态。');
requirePrd('07D 班主任与副班主任更多操作', 'PRD 应包含 07D 管理角色共享菜单状态。');
requirePrd('不渲染个人版或学校版班级列表背景', 'PRD 应明确共享弹层预览隐藏版本化背景页面。');
if (prd.includes('07E 普通老师更多操作') || prd.includes('07F 班主任与副班主任更多操作')) {
  failures.push('PRD 不应继续保留 07E/07F 重复菜单状态。');
}
requirePrd('09C 老师列表（副班主任）', 'PRD 应包含 09C 副班主任老师列表规则。');

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi class role permission assertions passed');
