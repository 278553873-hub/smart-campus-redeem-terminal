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

requireSource("subtitle: '首次体验填写姓名和学校。'", '02 完善信息元信息应说明填写姓名和学校。');
requireSource("modules: ['页面标题', '姓名输入框', '学校输入框', '进入体验按钮']", '02 完善信息模块应包含学校输入框。');
requireSource("const [teacherSchoolName, setTeacherSchoolName] = useState('');", '02 完善信息应保存学校名称文本。');

const profileRenderStart = source.indexOf("if (page === 'profile')");
const profileRenderEnd = source.indexOf("if (page === 'home')", profileRenderStart);
const profileRender = source.slice(profileRenderStart, profileRenderEnd);

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
if (profileRender.includes('搜索学校') || profileRender.includes('选择学校')) {
  failures.push('02 完善信息学校字段当前不应做搜索或选择交互。');
}

requirePrd('  - 填写姓名和学校名称 → 个人体验首页', 'PRD 应说明完善信息页填写姓名和学校名称后进入个人体验首页。');
requirePrd('  - 学校名称为必填文本框，不做强校验和搜索匹配', 'PRD 应说明学校名称必填但不强校验。');
requirePrd('  - 学校字段提示：填写学校后，可更快找到同校老师创建的班级', 'PRD 应记录学校字段的激励文案。');

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log('TeacherCMobileLowFi 02 完善信息测试通过');
