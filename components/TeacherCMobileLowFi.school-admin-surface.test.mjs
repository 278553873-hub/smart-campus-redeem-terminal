import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const failures = [];

const requireSource = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireSource("type CEndSurface = 'summary' | 'teacher' | 'parent' | 'schoolAdmin' | 'ops';", 'C端改造顶部导航应包含学校后台端类型。');
requireSource("{ key: 'schoolAdmin', label: '学校后台端' }", 'C端改造顶部导航应新增学校后台端。');
requireSource('const renderSchoolAdminPrototype = () =>', '学校后台端应有独立低保真原型面板。');
requireSource("if (surface === 'schoolAdmin') return renderSchoolAdminPrototype();", '点击学校后台端应切换到学校后台端原型。');
requireSource("if (surface === 'schoolAdmin') return renderStaticPrdPanel(schoolAdminPrdBlocks);", '学校后台端应有对应 PRD 面板。');
requireSource("type TeacherSpaceId = 'personal' | 'schoolA' | 'schoolB';", '空间模型应支持一个老师拥有多个学校空间。');
requireSource("const teacherSpaces: TeacherSpaceProfile[] = [", '学校后台端应从空间列表渲染。');
requireSource("{ id: 'personal', title: '个人版', type: 'personal' }", '空间列表应包含个人空间。');
requireSource("{ id: 'schoolA', title: '成都七中初中附属小学', type: 'school' }", '空间列表应包含第一个学校空间。');
requireSource("{ id: 'schoolB', title: '星河实验小学', type: 'school' }", '空间列表应包含第二个学校空间。');
requireSource('teacherSpaces.map((space)', '学校后台端原型应渲染多个空间，而不是写死二段切换。');
requireSource('const [showSchoolAdminSpaceMenu, setShowSchoolAdminSpaceMenu] = useState(true);', '学校后台端空间菜单应有独立开关状态。');
requireSource('setShowSchoolAdminSpaceMenu(false);', '学校后台端选择任意空间后应关闭菜单。');
requireSource('onClick={() => selectSchoolAdminSpace(space.id)}', '学校后台端空间切换应通过选择函数关闭菜单。');
requireSource("selectedSpace?.type === 'school' ? 'mineSchool' : 'minePersonal'", '教师端切换空间后应按空间类型进入我的页。');
requireSource('aria-label="切换空间"', '学校后台端应在右上角身份区提供空间切换入口。');
requireSource('aria-expanded={showSchoolAdminSpaceMenu}', '学校后台端切换入口应表达弹窗展开状态。');
requireSource('ChevronDown,', '学校后台端使用下拉箭头时必须正确导入 ChevronDown。');
requireSource("currentSpace.type === 'personal' ? '个人老师' : '管理员'", '学校后台端身份区应展示当前身份。');
requireSource('<span className="mt-1 block truncate text-xs font-black leading-4 text-gray-500">{currentSpace.title}</span>', '学校后台端身份区应展示当前空间名称。');
requireSource('absolute right-0 top-[52px]', '空间列表应从右上角身份区下方展开。');

if (source.includes("const [currentSpaceId, setCurrentSpaceId] = useState<'personal' | 'school'>")) {
  failures.push('currentSpaceId 不应再只支持单个 school。');
}

if (appSource.includes('PcWorkspaceSpace') || appSource.includes('fixedWorkspaceTabs')) {
  failures.push('不应在 PC 工作台顶部新增空间切换；本次只改 C端改造顶部导航。');
}
if (source.includes("home: { label: '首页', icon:") && source.includes("teacher: { label: '学校后台端'")) {
  failures.push('学校后台端不应加到 PC 工作台首页导航里。');
}
const schoolAdminStart = source.indexOf('const renderSchoolAdminPrototype = () =>');
const schoolAdminEnd = source.indexOf('const renderSummaryPrototype = () =>', schoolAdminStart);
const schoolAdminBlock = source.slice(schoolAdminStart, schoolAdminEnd);
if (schoolAdminBlock.includes('>首页</button>') || schoolAdminBlock.includes('>管理后台</button>')) {
  failures.push('学校后台端 demo 应简化，不展示截图中的首页/管理后台模块按钮。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi school admin surface assertions passed');
