import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];

const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText('const copyClassCode = async (code: string) => {', '班级号复制能力应统一封装。');
requireText('await navigator.clipboard.writeText(code);', '复制操作应真正写入剪贴板。');
requireText("showClassActionToast('班级号已复制');", '复制成功应给出明确反馈。');
requireText("showClassActionToast('复制失败，请重试');", '复制失败应给出可操作反馈。');
requireText('role="status" aria-live="polite"', '复制结果应以非打断方式向读屏用户播报。');
requireText('onClick={() => void copyClassCode(code)}', '班级卡片的班级号应支持复制。');
requireText('onClick={() => void copyClassCode(activeClassAction.code)}', '班级更多操作弹窗的班级号应支持复制。');
requireText('role="dialog" aria-modal="true" aria-label="班级更多操作"', '班级更多操作弹窗应具备完整的对话框语义。');
requireText('onClick={() => void copyClassCode(activeClassProfile.code)}', '班级详情的班级号应支持复制。');
requireText('const getClassDetailPageForProfile = (profile: ClassProfile): PageKey => {', '编辑班级信息应能根据空间和身份进入班级详情。');
requireText("if (profile.role === 'deputyHeadTeacher') return 'classDetailDeputy';", '副班主任应进入对应班级详情。');
requireText("if (profile.role === 'teacher') return 'classDetailMember';", '普通老师应进入只读班级详情。');
requireText("return getClassListPageForCurrentSpace() === 'classListSchool' ? 'classDetailSchoolHead' : 'classDetail';", '班主任班级详情应区分学校版和个人版。');

const copyEntryCount = (source.match(/onClick=\{\(\) => void copyClassCode\(/g) ?? []).length;
if (copyEntryCount !== 3) failures.push('班级卡片、更多操作弹窗和班级详情应共有 3 个复制入口。');

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi 班级号复制测试通过');
