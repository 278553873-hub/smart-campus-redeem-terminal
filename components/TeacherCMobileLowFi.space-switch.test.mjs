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

requireSource("title: '登录页'", '01 页面名称应为登录页。');
requireSource("{ title: '首次进入', pages: ['login', 'profile', 'home', 'classCreate', 'classJoin', 'studentAdd', 'record'] }", '首次进入流程应补全为 01 登录页 → 02 完善信息 → 03 新手首页 → 04/05 → 12 → 13。');
requireSource("<PageNodeButton item=\"home\" lane={lane.title} />\n                <span className=\"shrink-0 text-sm font-black text-gray-400\">→</span>\n                <div className=\"grid shrink-0 grid-rows-2 gap-2\">\n                  <PageNodeButton item=\"classCreate\" lane={lane.title} />\n                  <PageNodeButton item=\"classJoin\" lane={lane.title} />\n                </div>\n                <span className=\"shrink-0 text-sm font-black text-gray-400\">→</span>\n                <PageNodeButton item=\"studentAdd\" lane={lane.title} />\n                <span className=\"shrink-0 text-sm font-black text-gray-400\">→</span>\n                <PageNodeButton item=\"record\" lane={lane.title} />", '03 后应平行展示 04 创建班级和 05 加入班级，并共同指向 12 添加学生，再进入 13 记录页。');
requireSource("{ title: '班级', pages: ['classList', 'classDetail', 'classDetailMember', 'teacherList', 'teacherListMember', 'parentBindingList', 'studentList'] }", '班级流程不应再包含 12 添加学生。');
requireSource("if (next === 'home') {", '从页面导航地图点击 03 新手首页时应有专门重置逻辑。');
requireSource("setClassCreated(false);\n      setJoinedClassHasStudents(false);\n      setStudentCount(0);\n      setRecordCount(0);", '从页面导航地图点击 03 新手首页时应默认所有步骤未完成。');
requireSource("if (pageKey === 'record') return '13';", '记录页应编号为 13。');
requireSource("title: '记录页'", '13 页面名称应为记录页。');
requireSource("if (page === 'record') {\n      return (\n        <>\n          <TabHeader title=\"记录\" />", '13 记录页顶部应使用无返回按钮标题栏。');
requireSource("if (pageKey === 'minePersonal') return '14A';", '我的页仅有个人版状态应编号为 14A。');
requireSource("if (pageKey === 'mineSchool') return '14B';", '我的页拥有学校版状态应编号为 14B。');
requireSource("if (pageKey === 'profileEdit') return '15';", '个人信息页应顺延为 15。');
requireSource("title: '我的（仅有个人版）'", '14A 页面标题应为我的（仅有个人版）。');
requireSource("title: '我的（拥有学校版）'", '14B 页面标题应为我的（拥有学校版）。');
requireSource("<PageNodeButton item=\"minePersonal\" lane={lane.title} />\n                  <PageNodeButton item=\"mineSchool\" lane={lane.title} />", '页面导航地图中 14A 和 14B 应平行展示。');
requireSource("<PageNodeButton item=\"profileEdit\" lane={lane.title} />", '页面导航地图中 14A/14B 应共同指向 15 个人信息。');
requireSource("modules: ['教师卡片', '头像', '姓名', '编辑按钮', '了解学校版'", '14A 应展示了解学校版入口。');
requireSource("modules: ['教师卡片', '头像', '姓名', '当前版本入口', '编辑按钮', '切换版本弹窗'", '14B 应展示当前版本入口和切换版本弹窗。');
requireSource("14B 不展示“了解学校版”按钮。", '14B 说明应明确不展示了解学校版按钮。');
requireSource("const [showSpaceSelectSheet, setShowSpaceSelectSheet] = useState(false);", '14B 应能打开切换版本弹层。');
requireSource("aria-label=\"切换版本\"", '空间切换弹层 aria-label 应为切换版本。');
requireSource("<h3 className=\"text-base font-black\">切换版本</h3>", '空间切换弹层标题应为切换版本。');
requireSource("const teacherSpaces: TeacherSpaceProfile[] = [", '空间切换应来自统一空间列表。');
requireSource("{ id: 'personal', title: '个人版', type: 'personal' }", '空间列表应包含个人版。');
requireSource("{ id: 'schoolA', title: '成都七中初中附属小学', type: 'school' }", '空间列表应包含学校A。');
requireSource("{ id: 'schoolB', title: '星河实验小学', type: 'school' }", '空间列表应包含学校B。');
requireSource("selectedSpace?.type === 'school' ? 'mineSchool' : 'minePersonal'", '切换空间后应按空间类型进入对应我的状态页。');
requireSource("!hasSchoolSpace && (", '14A 才展示了解学校版按钮。');
requireSource(">了解学校版</button>", '14A 应展示了解学校版按钮。');

requirePrd('- 未登录 → 01 登录页', 'PRD 启动页应指向 01 登录页。');
requirePrd('- 登录页', 'PRD 页面结构应使用登录页命名。');
requirePrd('  - 03 新手首页 → 04 创建班级 / 05 加入班级', 'PRD 应说明 03 后平行进入 04/05。');
requirePrd('  - 04 创建班级、05 加入班级为平行路径，后续都接入 12 添加学生', 'PRD 应说明 04/05 共同接入 12 添加学生。');
requirePrd('  - 12 添加学生 → 13 记录页', 'PRD 应说明 12 添加学生后进入 13 记录页。');
requirePrd('- 13 记录页', 'PRD 应给记录页对应编号 13。');
requirePrd('  - 学生列表 → 学生/分组切换、搜索、多选、性别筛选、学生详情', 'PRD 学生管理不应再把新增学生挂在学生列表路径中。');
requirePrd('- 14A 我的（仅有个人版）', 'PRD 应拆出 14A 我的。');
requirePrd('- 14B 我的（拥有学校版）', 'PRD 应拆出 14B 我的。');
requirePrd('  - 不展示“了解学校版”按钮', 'PRD 14B 应明确不展示了解学校版按钮。');
requirePrd('  - 切换版本弹窗 → 个人版 / 多个学校版，列表只展示版本名称和当前标签，不展示备注文案', 'PRD 切换空间弹窗应支持多个学校版且禁止备注文案。');

if (source.includes("| 'spaceSelect'")) {
  failures.push('页面类型不应再包含 spaceSelect。');
}
if (source.includes("if (pageKey === 'spaceSelect') return '02A';") || prd.includes('- 02A 空间选择弹窗')) {
  failures.push('页面导航地图和 PRD 不应再出现 02A 空间选择。');
}
const mineSchoolMetaStart = source.indexOf("mineSchool: {");
const mineSchoolMetaEnd = source.indexOf("profileEdit: {", mineSchoolMetaStart);
const mineSchoolMeta = source.slice(mineSchoolMetaStart, mineSchoolMetaEnd);
if (mineSchoolMeta.includes("{ label: '了解学校版'") || mineSchoolMeta.includes("'了解学校版',")) {
  failures.push('14B 页面元信息不应包含了解学校版。');
}

const spaceSheetStart = source.indexOf('const renderSpaceSelectSheet = () =>');
const spaceSheetEnd = source.indexOf('const renderTeachingSheet = () =>', spaceSheetStart);
const spaceSheet = source.slice(spaceSheetStart, spaceSheetEnd);
if (spaceSheet.includes('个人体验数据') || spaceSheet.includes('学校统一数据')) {
  failures.push('切换版本弹窗不应展示个人体验数据或学校统一数据备注。');
}
if (source.includes("{ id: 'school' as const, title: '成都七中初中附属小学'")) {
  failures.push('空间切换不应写死单个 school，应支持多个学校版。');
}

const mineRenderStart = source.indexOf("if (page === 'minePersonal' || page === 'mineSchool')");
const mineRenderEnd = source.indexOf("if (page === 'profileEdit')", mineRenderStart);
const mineRender = source.slice(mineRenderStart, mineRenderEnd);
if (!mineRender.includes("!hasSchoolSpace && (")) {
  failures.push('了解学校版按钮必须只在 14A 展示。');
}

const recordRenderStart = source.indexOf("if (page === 'record')");
const recordRenderEnd = source.indexOf("if (page === 'textInput')", recordRenderStart);
const recordRender = source.slice(recordRenderStart, recordRenderEnd);
if (recordRender.includes('<ScreenHeader title="记录"')) {
  failures.push('13 记录页顶部不应展示返回按钮。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi space switch assertions passed');

requireSource("navigate('home');", '04 创建班级页「稍后添加」应保存后返回 03 新手首页（即 home）。');
requireSource("保存并添加学生", '04 创建班级页应保留主按钮「保存并添加学生」。');
requireSource("稍后添加", '04 创建班级页应展示次要入口「稍后添加」。');

requireSource("{ title: '老用户', pages: ['login', 'record'] }", '页面导航地图应包含老用户流程：登录页直接进入记录页。');
