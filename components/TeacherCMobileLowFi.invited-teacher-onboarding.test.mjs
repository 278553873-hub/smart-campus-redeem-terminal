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

requireSource("| { type: 'classInviteProfile' }", '被邀请流程应包含资料不完整状态。');
requireSource("{ label: '已登录资料不完整', desc: '进入 02B 完善信息', target: { type: 'classInviteProfile' } }", '顶部页面导航应将受邀资料不完整分支指向 02B。');
requireSource("jumpToPage('profileInvite');", '受邀资料不完整时应进入独立的 02B 路由。');
requireSource("school: '成都七中初中附属小学'", '邀请上下文应携带邀请方学校。');
requireSource("const [inviteTeachingSubjects, setInviteTeachingSubjects] = useState<string[]>([]);", '受邀资料补全应保存选填任教学科。');
requireSource("{ id: 'teacher-current', name: currentTeacherDisplayName", '班级成员应使用账号级稳定标识，不应使用可能重名的姓名作为身份。');
requireSource('key={teacher.id}', '老师列表渲染应使用稳定成员标识。');
requireSource("setTeacherSchoolName((schoolName) => schoolName.trim() || inviteClass.school);", '首次受邀补资料时应默认带入邀请方学校。');
requireSource("const isInviteProfile = page === 'profileInvite';", '02B 应通过独立页面路由区分受邀状态。');
requireSource("${inviteClass.inviter}邀请你加入「${inviteClass.name}」", '邀请态资料页应只展示邀请人和目标班级。');
requireSource('任教学科（选填）', '受邀资料页应允许选填任教学科。');
requireSource("const completeTeacherProfile = () =>", '资料保存后应按普通注册或受邀流程继续。');
requireSource("setShowInviteConfirmSheet(true);", '受邀资料补全后仍应进入加入确认，不应静默加入。');
requireSource("const openInvitedClassList = (showJoinConfirm = false) =>", '受邀老师应统一进入邀请方学校的班级列表。');
requireSource("navigate('classListSchool');", '受邀老师确认加入前后都应落在学校版班级列表。');
requireSource("const getInvitedSchoolSpaceId = (): TeacherSpaceId =>", '受邀流程应集中解析邀请方对应的学校空间。');
requireSource("space.type === 'school' && space.title === inviteClass.school", '受邀流程应按邀请方学校匹配学校空间。');
requireSource("个人版在账号注册成功时自动创建", '原型 PRD 应明确个人版创建时机。');
requireSource("你的个人资料和个人版不会受到影响", '退出班级确认应明确资料与个人版保留。');
requireSource("setCurrentSpaceId('personal');", '退出最后一个受邀班级后应切换到个人空间。');
requireSource("navigate('home');", '退出最后一个受邀班级后应回到个人版新手首页。');

requirePrd('账号、教师资料、个人版空间和班级成员关系必须分开管理', 'PRD 应拆分四类核心数据。');
requirePrd('用户首次成功注册账号时，系统同步创建一个空的个人版空间', 'PRD 应明确注册即创建个人版。');
requirePrd('姓名必填；所在学校默认带入邀请方学校并允许修改；任教学科选填', 'PRD 应明确受邀资料字段规则。');
requirePrd('邀请摘要只显示邀请人和目标班级，不重复展示学校名称', 'PRD 应明确 02B 邀请摘要不重复学校名称。');
requirePrd('班级邀请只授予目标班级权限，不自动授予邀请方学校的全校权限', 'PRD 应明确班级邀请的权限边界。');
requirePrd('退出最后一个受邀班级后进入个人版新手首页', 'PRD 应明确退出最后班级后的落点。');
requirePrd('同意加入后停留在该班级列表，不自动进入班级详情', 'PRD 应明确资料完整老师同意加入后的列表落点。');
requirePrd('资料完整且已加入：直接进入邀请方学校的班级列表', 'PRD 应明确已加入老师再次打开邀请后的列表落点。');

const joinedInviteBranch = source.slice(
  source.indexOf("if (target.type === 'classInviteJoined')"),
  source.indexOf("if (target.type === 'classInviteConfirm')"),
);
if (!joinedInviteBranch.includes('openInvitedClassList();') || joinedInviteBranch.includes('classDetail')) {
  failures.push('已加入老师再次打开邀请时应进入班级列表，不应进入班级详情。');
}

const completeLoginFlow = source.slice(
  source.indexOf('const completeLogin = () =>'),
  source.indexOf('const completeTeacherProfile = () =>'),
);
if (completeLoginFlow.indexOf("if (!teacherName.trim() || !teacherSchoolName.trim())") > completeLoginFlow.indexOf('if (inviteeAlreadyJoined)')) {
  failures.push('受邀登录后应先校验资料完整性，再判断是否已经加入班级。');
}

const inviteConfirmSheet = source.slice(
  source.indexOf('const renderInviteConfirmSheet = () =>'),
  source.indexOf('const renderClassEditSheet = () =>'),
);
if (inviteConfirmSheet.includes("navigate('classDetailMember')")) {
  failures.push('同意加入后不应自动进入班级详情。');
}

if (source.includes('key={teacher.name}')) {
  failures.push('老师可能重名，列表不能继续使用姓名作为渲染标识。');
}

if (source.includes('${inviteClass.school} · ${inviteClass.name}')) {
  failures.push('02B 邀请摘要不应重复展示学校名称。');
}

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log('TeacherCMobileLowFi 被邀请教师首次登录与退出兜底测试通过');
