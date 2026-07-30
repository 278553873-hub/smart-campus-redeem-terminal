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

requireSource("if (pageKey === 'profile') return '02A';", '首次登录完善信息页应编号为 02A。');
requireSource("if (pageKey === 'profileInvite') return '02B';", '受邀完善信息页应编号为 02B。');
requireSource("subtitle: '首次登录时补全教师基础资料。'", '02A 元信息应只描述首次登录场景。');
requireSource("subtitle: '接受班级邀请前补全教师资料。'", '02B 元信息应只描述受邀补资料场景。');
requireSource("const [teacherSchoolName, setTeacherSchoolName] = useState('');", '02 完善信息应保存学校名称文本。');

const profileRenderStart = source.indexOf("if (page === 'profile' || page === 'profileInvite')");
const profileRenderEnd = source.indexOf("if (page === 'home')", profileRenderStart);
const profileRender = source.slice(profileRenderStart, profileRenderEnd);
const phoneLoginRenderStart = source.indexOf('const renderPhoneLoginSheet = () =>');
const phoneLoginRenderEnd = source.indexOf('const renderAvatarSheet = () =>', phoneLoginRenderStart);
const phoneLoginRender = source.slice(phoneLoginRenderStart, phoneLoginRenderEnd);

if (!phoneLoginRender.includes('验证码登录') || !phoneLoginRender.includes('密码登录')) {
  failures.push('教师登录弹窗应使用“验证码登录 / 密码登录”作为登录方式名称。');
}
if (phoneLoginRender.includes('>\n              手机号登录\n') || phoneLoginRender.includes('>\n              账号登录\n')) {
  failures.push('教师登录弹窗不应继续使用含义模糊的“手机号登录 / 账号登录”Tab 文案。');
}
if (!phoneLoginRender.includes('onPointerDown={dismissPhoneLoginKeyboard}')) {
  failures.push('教师登录弹窗遮罩点击应只收起软键盘。');
}
if (!phoneLoginRender.includes('aria-label="关闭手机号登录弹窗"') || !phoneLoginRender.includes('<X size={18} aria-hidden="true" />')) {
  failures.push('教师登录弹窗应提供明确且可访问的关闭按钮。');
}
if (phoneLoginRender.includes('className="absolute inset-0 cursor-default" onClick={() => setShowPhoneLoginSheet(false)}')) {
  failures.push('教师登录弹窗不应通过点击遮罩直接关闭。');
}

if (!profileRender.includes("const canEnterExperience = Boolean(teacherName.trim() && teacherSchoolName.trim());")) {
  failures.push('02 完善信息进入体验按钮应要求姓名和学校都已填写。');
}
if (!profileRender.includes('学校') || !profileRender.includes('value={teacherSchoolName}') || !profileRender.includes('setTeacherSchoolName(event.target.value)')) {
  failures.push('02 完善信息应提供学校名称文本输入框。');
}
if (!profileRender.includes('placeholder="请输入学校名称"')) {
  failures.push('02 完善信息学校输入框 placeholder 应为“请输入学校名称”。');
}
if (!profileRender.includes('填写学校后，可更快找到同校老师创建的班级')) {
  failures.push('02 完善信息应展示同校班级匹配收益文案。');
}
if (!profileRender.includes("const isInviteProfile = page === 'profileInvite';") || !profileRender.includes('<ScreenHeader title="完善信息" />')) {
  failures.push('02A/02B 应通过独立页面路由切换内容，但页面标题统一使用“完善信息”。');
}
if (!profileRender.includes('任教学科（选填）') || !profileRender.includes('aria-pressed={selected}')) {
  failures.push('邀请态应允许通过可访问的多选控件补充任教学科。');
}
if (!profileRender.includes('onClick={completeTeacherProfile}')) {
  failures.push('资料提交后应由统一状态判断继续普通注册或受邀流程。');
}
if (profileRender.includes('搜索学校') || profileRender.includes('选择学校')) {
  failures.push('02 完善信息学校字段当前不应做搜索或选择交互。');
}

requirePrd('  - 填写姓名和学校名称 → 个人体验首页', 'PRD 应说明完善信息页填写姓名和学校名称后进入个人体验首页。');
requirePrd('  - 学校名称为必填文本框，不做强校验和搜索匹配', 'PRD 应说明学校名称必填但不强校验。');
requirePrd('  - 学校字段提示：填写学校后，可更快找到同校老师创建的班级', 'PRD 应记录学校字段的激励文案。');
requirePrd('- 02A 首次登录完善信息', 'PRD 应独立定义 02A 首次登录完善信息。');
requirePrd('- 02B 受邀完善信息', 'PRD 应独立定义 02B 受邀完善信息。');
requirePrd('手机号登录弹窗：包含“验证码登录”和“密码登录”两个 Tab；验证码登录为手机号 + 验证码，密码登录为手机号 + 密码。', 'PRD 应使用具体登录凭证命名两个登录方式。');
requirePrd('点击弹窗外遮罩只让输入框失焦并收起软键盘，不关闭弹窗、不清空输入内容或重置登录方式', 'PRD 应明确登录弹窗遮罩点击不会关闭或重置表单。');

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log('TeacherCMobileLowFi 登录及 02 完善信息测试通过');
