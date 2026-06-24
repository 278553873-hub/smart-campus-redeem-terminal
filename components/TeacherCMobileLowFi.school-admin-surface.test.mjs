import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const failures = [];

const requireSource = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireSource("'schoolAdmin'", 'C端改造顶部导航类型应包含学校后台端。');
requireSource("{ key: 'schoolAdmin', label: '学校后台端' }", 'C端改造顶部导航应新增学校后台端。');
requireSource("schoolAdmin: 60,", '学校后台端默认原型区宽度应为 60%。');
requireSource('const renderSchoolAdminPrototype = () =>', '学校后台端应有独立低保真原型面板。');
requireSource("if (surface === 'schoolAdmin') return renderSchoolAdminPrototype();", '点击学校后台端应切换到学校后台端原型。');
requireSource("if (surface === 'schoolAdmin') return renderStaticPrdPanel(schoolAdminPrdBlocks);", '学校后台端应有对应 PRD 面板。');
requireSource("type SchoolAdminLoginTab = 'password' | 'sms' | 'scan';", '学校后台端登录方式应包含密码、验证码、扫码。');
requireSource("const [schoolAdminLoginTab, setSchoolAdminLoginTab] = useState<SchoolAdminLoginTab>('scan');", '学校后台端应默认展示扫码登录。');
requireSource("const [schoolAdminLoggedIn, setSchoolAdminLoggedIn] = useState(false);", '学校后台端应有登录前后状态。');
requireSource("{ key: 'password', label: '密码登录' }", '学校后台端应保留密码登录。');
requireSource("{ key: 'sms', label: '验证码登录' }", '学校后台端应保留验证码登录。');
requireSource("{ key: 'scan', label: '扫码登录' }", '学校后台端应新增扫码登录。');
requireSource('bg-[#f5f7fa]', '学校后台端登录页低保真应基于 demo-学校-PC端登录页背景。');
requireSource('max-w-[440px] rounded bg-white/95 p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)]', '学校后台端登录卡片应沿用 demo-学校-PC端登录页单卡居中结构。');
requireSource('乐途AI智慧教育平台', '学校后台端登录页应沿用 PC 端登录页品牌标题。');
requireSource('学校端安全登录', '学校后台端登录页应沿用 PC 端登录页副标题。');
requireSource('border-[#2a68ff] bg-[#2a68ff] text-white shadow-md shadow-blue-200', '登录方式选中态应沿用 PC 端登录 tab 样式。');
requireSource('请输入手机号（演示环境任意输入）', '密码/验证码登录应沿用 PC 端登录页手机号字段。');
requireSource('请输入密码（演示环境任意输入）', '密码登录应沿用 PC 端密码占位。');
requireSource('请输入验证码（演示验证码：123456）', '验证码登录应沿用 PC 端验证码占位。');
requireSource('忘记密码？', '学校后台端登录页应保留 PC 端忘记密码入口。');
requireSource("已扫码，立即登录", '扫码登录应能进入后台首页演示，并使用登录页主按钮样式。');
requireSource("type TeacherSpaceId = 'personal' | 'schoolA' | 'schoolB';", '空间模型应支持一个老师拥有多个学校空间。');
requireSource("const teacherSpaces: TeacherSpaceProfile[] = [", '学校后台端应从空间列表渲染。');
requireSource("{ id: 'personal', title: '个人版', type: 'personal' }", '空间列表应包含个人空间。');
requireSource("{ id: 'schoolA', title: '成都七中初中附属小学', type: 'school' }", '空间列表应包含第一个学校空间。');
requireSource("{ id: 'schoolB', title: '星河实验小学', type: 'school' }", '空间列表应包含第二个学校空间。');
requireSource('teacherSpaces.map((space)', '学校后台端原型应渲染多个空间，而不是写死二段切换。');
requireSource('const [showSchoolAdminSpaceMenu, setShowSchoolAdminSpaceMenu] = useState(true);', '学校后台端空间菜单应有独立开关状态。');
requireSource('setShowSchoolAdminSpaceMenu(false);', '学校后台端选择任意空间后应关闭菜单。');
requireSource('onClick={() => selectSchoolAdminSpace(space.id)}', '学校后台端空间切换应通过选择函数关闭菜单。');
requireSource("navigate('mineSchool');", '14B 代表用户拥有多个版本，教师端切换学校/个人版后应仍停留在 14B。');
requireSource('aria-label="切换空间"', '学校后台端应在右上角身份区提供空间切换入口。');
requireSource('aria-expanded={showSchoolAdminSpaceMenu}', '学校后台端切换入口应表达弹窗展开状态。');
requireSource('ChevronDown,', '学校后台端使用下拉箭头时必须正确导入 ChevronDown。');
requireSource("currentSpace.type === 'personal' ? '个人老师' : '管理员'", '学校后台端身份区应展示当前身份。');
requireSource('{currentSpace.title}</span>', '学校后台端身份区应展示当前空间名称。');
requireSource('absolute right-0 top-[52px]', '空间列表应从右上角身份区下方展开。');
requireSource("const currentSpaceIsPersonal = currentSpace.type === 'personal';", '学校后台端应识别当前是否为个人版。');
requireSource("{ key: 'admin', label: '管理后台', meta: '开通学生：2530', enabledInPersonal: false }", '我的应用中管理后台入口应标记为个人版不可见，并沿用现有学校 PC 首页业务信息。');
requireSource("{ key: 'screen', label: '课堂大屏', meta: '有效期至：2027-09-01', enabledInPersonal: true }", '我的应用应基于现有学校 PC 首页保留课堂大屏。');
requireSource("const schoolAdminPromoCards = ['积分银行', 'AI素养评价', '素养指南针'];", '学校后台端低保真应基于现有学校 PC 首页右侧产品卡。');
requireSource("const schoolAdminWorkspaceTabs = currentSpaceIsPersonal ? ['首页', '课堂大屏'] : ['首页', '学校管理后台', '积分银行（一体机）', '课堂大屏'];", '顶部应复刻现有 PC 工作台 tab，并在个人版过滤学校管理后台。');
requireSource('const visibleSchoolAdminApplications = schoolAdminApplications.filter((item) => !currentSpaceIsPersonal || item.enabledInPersonal);', '切换到个人版后首页我的应用应过滤管理后台入口。');
requireSource('<div className="text-base font-black">我的应用</div>', '后台首页应展示我的应用区域。');
requireSource('visibleSchoolAdminApplications.map((item)', '我的应用应按当前版本过滤后渲染。');
requireSource('<div className="text-base font-black">更多应用</div>', '低保真应保留现有学校 PC 首页的更多应用区域。');
requireSource('<div className="text-sm font-black">服务与支持</div>', '低保真应保留现有学校 PC 首页的服务与支持区域。');
requireSource('后台登录支持密码登录、验证码登录和扫码登录三种方式。', 'PRD 应说明新增扫码登录。');
requireSource('顶部提供个人版 / 学校版切换；一个账号可切换到个人空间或多个学校空间。', 'PRD 应说明顶部版本切换。');
requireSource('切换到个人版后，首页“我的应用”不展示“管理后台”入口。', 'PRD 应说明个人版不展示管理后台入口。');
requireSource('编辑学生信息添加家长手机号时，若该手机号已作为 3 个孩子的家长手机号，则提示不能添加。', 'PRD 应说明编辑学生信息添加家长手机号时的 3 个孩子上限校验。');

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
if (!schoolAdminBlock.includes('我的应用') || !schoolAdminBlock.includes('管理后台')) {
  failures.push('学校后台端 demo 应展示首页我的应用，并在学校版包含管理后台入口。');
}
if (schoolAdminBlock.includes("label: '数据报表'") || schoolAdminBlock.includes("label: '期末报告'") || schoolAdminBlock.includes("label: '工作台'")) {
  failures.push('学校后台端低保真不应新造应用入口，应基于 demo-学校-PC端当前首页应用内容。');
}
if (schoolAdminBlock.includes('用于管理') || schoolAdminBlock.includes('可进行')) {
  failures.push('学校后台端原型不应出现低信息量说明文案。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi school admin surface assertions passed');
