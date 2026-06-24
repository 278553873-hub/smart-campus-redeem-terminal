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
requireSource("{ title: '登录', pages: ['login', 'profile', 'home', 'classCreate', 'classJoin', 'studentAdd', 'record'] }", '首次进入流程和老用户进入流程应合并为登录流程。');
requireSource("新用户首次登录", '01 登录页后应展示新用户首次登录分支。');
requireSource("新用户已填写姓名，但未完成新手引导", '01 登录页后应展示新用户已填写姓名但未完成新手引导分支。');
requireSource("老用户登录", '01 登录页后应展示老用户登录分支。');
requireSource("<PageNodeButton item=\"login\" lane={lane.title} />", '登录流程应以普通页面节点展示 01 登录页。');
requireSource("<PageNodeButton item=\"record\" lane={lane.title} />", '登录流程应以普通页面节点展示 13 记录页。');
requireSource("title: '班级(个人版)',\n    pages: ['classListPersonal'],\n    branchGroups: [\n      {\n        branches: [\n          { text: '班主任', pages: ['classDetail'] },\n          { text: '非班主任', pages: ['classDetailMember'] },\n        ],\n      },\n      {\n        branches: [\n          { text: '班主任', pages: ['teacherList'] },\n          { text: '非班主任', pages: ['teacherListMember'] },\n        ],\n      },\n    ],\n    tailPages: ['parentBindingList', 'studentList', 'studentBatchEdit'],", '个人版班级流程应从 07A 后并行进入 08A/08B，再并行进入 09A/09B，且不应包含 12 添加学生。');
requireSource("title: '班级(学校版)',\n    pages: ['classListSchool'],\n    branchGroups: [\n      {\n        branches: [\n          { text: '班主任', pages: ['classDetailSchoolHead'] },\n          { text: '非班主任', pages: ['classDetailMember'] },\n        ],\n      },\n      {\n        branches: [\n          { text: '班主任', pages: ['teacherList'] },\n          { text: '非班主任', pages: ['teacherListMember'] },\n        ],\n      },\n    ],\n    tailPages: ['parentBindingList', 'studentList', 'studentBatchEdit'],", '学校版班级流程应从 07B 后并行进入 08C/08B，再并行进入 09A/09B。');
requireSource("if (pageKey === 'classListPersonal') return '07A';", '个人版班级列表应编号为 07A。');
requireSource("if (pageKey === 'classListSchool') return '07B';", '学校版班级列表应编号为 07B。');
requireSource("const [schoolClassTeachingOnly, setSchoolClassTeachingOnly] = useState(false);", '07B 学校版班级列表应支持只显示任教班级筛选状态。');
requireSource("<PageNodeButton item={item} lane={lane.title} />", '班级流程应使用普通页面节点列表，不使用共用虚拟分组。');
requireSource("grid min-w-full grid-cols-[96px_max-content]", '页面导航地图流程名称列应保持 96px，右侧内容由整体地图横向撑开。');
requireSource("whitespace-nowrap text-xs font-black text-gray-500", '页面导航地图流程名称不应换行。');
requireSource("const active = page === item && activeInviteNode < 0;", '页面导航地图点击任一页面节点时，相同页面在其他流程中也应一起选中。');
requireSource("新用户首次登录", '登录流程应展示新用户首次登录分支。');
requireSource("新用户已填写姓名，但未完成新手引导", '登录流程应展示新用户已填写姓名但未完成新手引导分支。');
requireSource("老用户登录", '登录流程应展示老用户登录分支。');
requireSource('grid w-[152px] shrink-0 grid-cols-[20px_1fr_12px] items-center gap-2 text-[11px] font-black leading-4 text-gray-500', '登录分支条件列应固定宽度，允许文案换行，并让三个分支的第一个页面节点左对齐。');
requireSource('<section className="overflow-x-auto rounded-2xl bg-white p-4">', '页面导航地图应由整体容器统一横向滑动。');
requireSource('<div className="w-max min-w-full space-y-3">', '页面导航地图内容应作为一个整体撑开横向宽度。');
requireSource('className="grid min-w-full grid-cols-[96px_max-content] items-center gap-3"', '页面导航地图每行不应各自形成横向滚动框架。');
const pageDirectoryStart = source.indexOf('const renderPageDirectory = () =>');
const pageDirectoryEnd = source.indexOf('const renderParentFlowNodes', pageDirectoryStart);
const pageDirectorySource = source.slice(pageDirectoryStart, pageDirectoryEnd);
if (pageDirectorySource.includes('min-w-[192px]') || pageDirectorySource.includes('whitespace-nowrap">新用户已填写姓名，但未完成新手引导')) {
  failures.push('登录分支条件不应再用不换行宽文案顶开节点，应允许换行并固定条件列宽度。');
}
const pageDirectoryScrollCount = (pageDirectorySource.match(/overflow-x-auto/g) || []).length;
if (pageDirectoryScrollCount !== 1) {
  failures.push('页面导航地图内部流程行不应再单独横向滑动，应由整个导航地图统一滑动。');
}
const namedUserBranchStart = pageDirectorySource.indexOf('新用户已填写姓名，但未完成新手引导');
const namedUserBranchEnd = pageDirectorySource.indexOf('</div>', pageDirectorySource.indexOf('<PageNodeButton item="home" lane={lane.title} />', namedUserBranchStart));
const namedUserBranch = pageDirectorySource.slice(namedUserBranchStart, namedUserBranchEnd);
if (!namedUserBranch.includes('<PageNodeButton item="home" lane={lane.title} />')) {
  failures.push('新用户已填写姓名但未完成新手引导分支应直接到 03 新手首页。');
}
if (namedUserBranch.includes('classCreate') || namedUserBranch.includes('classJoin') || namedUserBranch.includes('studentAdd') || namedUserBranch.includes('record')) {
  failures.push('新用户已填写姓名但未完成新手引导分支后续节点不用画出来。');
}
if (source.includes('BranchLabel') || source.includes('MergeRail') || source.includes('FlowLine')) {
  failures.push('页面导航地图已回滚线条方案，不应继续保留 BranchLabel、MergeRail 或 FlowLine。');
}
if (source.includes('lane="班级共用"')) {
  failures.push('页面导航地图已回滚共用虚拟分组，不应继续使用“班级共用”lane。');
}
if (source.includes("{ title: '班级', pages: ['classList'")) {
  failures.push('页面导航地图不应再保留未区分版本的“班级”流程。');
}
if (source.includes("| 'classList'\n") || source.includes("'classList',")) {
  failures.push('页面类型不应再保留未区分版本的 classList，应使用 classListPersonal/classListSchool。');
}
const classListRenderStart = source.indexOf("if (page === 'classListPersonal' || page === 'classListSchool')");
const classListRenderEnd = source.indexOf("if (page === 'classDetail' || page === 'classDetailMember')", classListRenderStart);
const classListRender = source.slice(classListRenderStart, classListRenderEnd);
if (!classListRender.includes("const isSchoolList = page === 'classListSchool';")) {
  failures.push('班级列表页必须通过 07A/07B 页面状态区分个人版和学校版。');
}
if (!classListRender.includes("!isSchoolList && (\n              <section className=\"flex items-center justify-end\">")) {
  failures.push('07A 个人版班级列表页应在右上角展示班级操作入口，07B 不展示该入口。');
}
if (!classListRender.includes("const gradeFilterOptions: SchoolClassGradeFilter[] = ['全部', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'];")) {
  failures.push('07B 学校版班级列表顶部应提供覆盖 K12 的年级筛选选项。');
}
if (!classListRender.includes("const schoolVisibleClassCards = classCards.filter((item) => {") || !classListRender.includes("const matchGrade = schoolClassGradeFilter === '全部' || inferGradeLabel(item.stage, item.entryYearValue) === schoolClassGradeFilter;")) {
  failures.push('07B 学校版班级列表应按年级筛选班级卡片。');
}
if (!classListRender.includes("const matchTeaching = !schoolClassTeachingOnly || item.tags.some((tag) => tag !== '班主任');")) {
  failures.push('07B 学校版班级列表应支持只显示任教班级。');
}
if (!classListRender.includes('<select') || !classListRender.includes('value={schoolClassGradeFilter}') || !classListRender.includes('setSchoolClassGradeFilter(event.target.value as SchoolClassGradeFilter)')) {
  failures.push('07B 学校版班级列表应使用下拉选择控件筛选年级，适配 K12 多年级场景。');
}
if (classListRender.includes('>年级筛选</label>') || classListRender.includes('>年级筛选</div>')) {
  failures.push('07B 学校版班级列表的筛选器不应显示“年级筛选”提示文案。');
}
if (!classListRender.includes('<section className="flex items-center justify-between gap-3">') || !classListRender.includes('className="relative w-28"')) {
  failures.push('07B 学校版班级列表筛选器应在同一行左侧展示年级下拉，并保持紧凑宽度。');
}
if (!classListRender.includes('任教班级') || !classListRender.includes('setSchoolClassTeachingOnly((current) => !current)') || !classListRender.includes('aria-pressed={schoolClassTeachingOnly}')) {
  failures.push('07B 学校版班级列表应在年级筛选同一行提供任教班级即时筛选按钮。');
}
if (classListRender.includes('setSchoolClassGradeFilter(item)') || classListRender.includes('aria-pressed={schoolClassGradeFilter === item}')) {
  failures.push('07B 学校版班级列表不应使用横向胶囊按钮做年级筛选。');
}
if (!classListRender.includes('aria-label="打开班级操作"') || !classListRender.includes('aria-label="班级操作"') || !classListRender.includes('创建班级') || !classListRender.includes('加入班级') || !classListRender.includes('显示设置')) {
  failures.push('07A 个人版班级列表应通过右上角加号弹层提供创建班级、加入班级和显示设置。');
}
if (classListRender.includes('<ClassEntryCard type="create"') || classListRender.includes('<ClassEntryCard type="join"')) {
  failures.push('07A 主页面不应继续展示创建班级和加入班级大入口卡片。');
}
if (!classListRender.includes('const personalClassCards = classCards') || !classListRender.includes('.sort((a, b) => Number(b.isCreator) - Number(a.isCreator));')) {
  failures.push('07A 个人版班级列表应将我创建的班级固定排在我加入的班级上方。');
}
if (source.includes("{isCreator ? '我创建' : '我加入'}")) {
  failures.push('07A/07B 班级卡片不应使用文字标签区分我创建和我加入。');
}
if (!classListRender.includes('const visiblePersonalClassCards = personalClassCards.filter((item) => personalVisibleClassCodes.includes(item.code));') || !classListRender.includes('const createdClassCards = visiblePersonalClassCards.filter((item) => item.isCreator);') || !classListRender.includes('const joinedClassCards = visiblePersonalClassCards.filter((item) => !item.isCreator);')) {
  failures.push('07A 个人版班级列表应拆分创建的班级和加入的班级。');
}
if (!classListRender.includes('创建的班级') || !classListRender.includes('加入的班级')) {
  failures.push('07A 个人版班级列表应使用轻分组标题区分创建的班级和加入的班级。');
}
if (!source.includes('<div className="relative rounded-2xl bg-gray-50 p-4">')) {
  failures.push('班级卡片应保持统一卡片样式，不再通过卡片视觉层级区分关系。');
}
requireSource("return currentSpace.type === 'school' ? 'classListSchool' : 'classListPersonal';", '底部导航和回流入口应按当前版本进入 07A/07B。');
requireSource("if (next === 'home') {", '从页面导航地图点击 03 新手首页时应有专门重置逻辑。');
requireSource("setClassCreated(false);\n      setJoinedClassHasStudents(false);\n      setStudentCount(0);\n      setRecordCount(0);", '从页面导航地图点击 03 新手首页时应默认所有步骤未完成。');
requireSource("if (pageKey === 'record') return '13';", '记录页应编号为 13。');
requireSource("title: '记录页'", '13 页面名称应为记录页。');
const recordRenderStart = source.indexOf("if (page === 'record')");
const recordRenderEnd = source.indexOf("if (page === 'textInput')", recordRenderStart);
const recordRender = source.slice(recordRenderStart, recordRenderEnd);
if (recordRender.includes('<TabHeader title="记录"') || recordRender.includes('<ScreenHeader title="记录"')) {
  failures.push('13 记录页不应展示页面标题栏。');
}
if (recordRender.includes('AI说明')) {
  failures.push('13 记录页不应展示 AI 说明入口。');
}
if (recordRender.includes('recordCount === 0')) {
  failures.push('13 记录页不应再按记录数量展示多个状态，应固定展示记录引导内容。');
}
if (recordRender.includes('原始语音 + 转文字') || recordRender.includes('AI解读')) {
  failures.push('13 记录页不应展示识别举例案例。');
}
requireSource("const stepsDone = classCreated && hasStudents;", '03 新手首页只应以获得班级和确认学生作为完成条件。');
requireSource("const currentStep = !classCreated ? 'class' : !hasStudents ? 'student' : 'done';", '03 新手首页不应再要求完成第三个首次记录步骤。');
if (source.includes("currentStep === 'record'") || source.includes('label="3. 完成首次记录"')) {
  failures.push('03 新手首页不应继续展示第 3 步完成首次记录。');
}
requireSource('先做好这两步准备吧', '03 新手首页引导标题应使用新的两步准备文案。');
requireSource('想用 AI 记录学生的日常行为？先完成两个小步骤。', '03 新手首页引导说明应使用新的 AI 记录准备文案。');
requireSource("setJoinedClassHasStudents(true);\n        navigate('record');", '加入已有班级且已有学生后应直接进入 13 记录页。');
requireSource('试试通过语音描述一下内容：', '13 记录页空状态应展示语音记录引导。');
requireSource('张三同学今天主动帮助同学解决问题，值得表扬。', '13 记录页应展示学生正向行为语音示例。');
requireSource('2025级1班全体同学积极参加体育锻炼。', '13 记录页应展示班级整体记录语音示例。');
requireSource('2025级1班的1号，2号，3号，4号，7号同学在语文课堂上积极举手发言。', '13 记录页应展示多学生课堂表现语音示例。');
requireSource('李四同学昨天言语辱骂王五同学。', '13 记录页应展示负向事件语音示例。');
requireSource("if (pageKey === 'minePersonal') return '14A';", '我的页仅有个人版状态应编号为 14A。');
requireSource("if (pageKey === 'mineSchool') return '14B';", '我的页拥有多个版本状态应编号为 14B。');
requireSource("if (pageKey === 'teacherBasicInfoPersonal') return '15A';", '15A 页面应为个人版基本信息设置。');
requireSource("if (pageKey === 'teacherBasicInfoSchool') return '15B';", '15B 页面应为学校版基本信息设置。');
requireSource("if (pageKey === 'mineSettings') return '16';", '16 页面应为设置。');
requireSource("if (pageKey === 'termManagement') return '17';", '17 页面应为学期管理。');
requireSource("title: '我的（仅有个人版）'", '14A 页面标题应为我的（仅有个人版）。');
requireSource("title: '我的（拥有多个版本）'", '14B 页面标题应为我的（拥有多个版本）。');
requireSource("{ title: '我的(个人版)', pages: ['minePersonal', 'teacherBasicInfoPersonal', 'suggestionFeedback'] }", '我的(个人版)流程应为 14A 到 15A/22。');
requireSource("{ title: '我的(学校版)', pages: ['mineSchool', 'teacherBasicInfoSchool', 'mineSettings', 'subjectManagement', 'departmentManagement', 'coinIssuanceManagement', 'suggestionFeedback'] }", '我的(学校版)流程应为 14B 到 15B/16/18/19/21/22。');
if (source.includes("{ title: '班级(个人版)', pages: ['classListPersonal', 'classDetail', 'classDetailMember', 'teacherList', 'teacherListMember', 'parentBindingList', 'studentList', 'studentBatchEdit'] },\n  'classDetailSchoolHead',")) {
  failures.push('页面导航流程数组不能混入裸页面 key，否则 C端改造右侧目录会在 lane.pages.map 时报错。');
}
if (source.includes("{ title: '班级(学校版)', pages: ['classListSchool', 'classDetailSchoolHead', 'classDetailMember', 'teacherList', 'teacherListMember', 'parentBindingList', 'studentList', 'studentBatchEdit'] },\n  'classDetailSchoolHead',")) {
  failures.push('页面导航流程数组不能在学校版流程后混入裸页面 key。');
}
if (source.includes("{ title: '班级(个人版)', pages: ['classListPersonal', 'classDetail', 'classDetailMember'")) {
  failures.push('班级(个人版)不应把 08A 和 08B 表达成串行页面，应作为并行分支。');
}
if (source.includes("{ title: '班级(学校版)', pages: ['classListSchool', 'classDetailSchoolHead', 'classDetailMember'")) {
  failures.push('班级(学校版)不应把 08C 和 08B 表达成串行页面，应作为并行分支。');
}
if (source.includes("tailPages: ['teacherList', 'teacherListMember'")) {
  failures.push('09A 和 09B 不应放在公共后续流程中串行展示，应作为第二组并行分支。');
}
requireSource("lane.title === '我的(个人版)'", '页面导航地图应单独渲染我的(个人版)流程。');
requireSource("<PageNodeButton item=\"minePersonal\" lane={lane.title} />\n                <span className=\"shrink-0 text-sm font-black text-gray-400\">→</span>\n                <div className=\"grid shrink-0 grid-cols-2 gap-2\">\n                  <PageNodeButton item=\"teacherBasicInfoPersonal\" lane={lane.title} />\n                  <PageNodeButton item=\"suggestionFeedback\" lane={lane.title} />", '我的(个人版)应表达 14A 到 15A/22。');
requireSource("lane.title === '我的(学校版)'", '页面导航地图应单独渲染我的(学校版)流程。');
requireSource("<PageNodeButton item=\"mineSchool\" lane={lane.title} />\n                <span className=\"shrink-0 text-sm font-black text-gray-400\">→</span>\n                <div className=\"grid shrink-0 grid-cols-3 gap-2\">\n                  <PageNodeButton item=\"teacherBasicInfoSchool\" lane={lane.title} />", '我的(学校版)应表达 14B 到 15B/16/17/18/19/21。');
if (source.includes("<PageNodeButton item=\"schoolUsageReport\" lane={lane.title} />")) {
  failures.push('页面导航地图中不应继续展示 20 学校数据报表。');
}
requireSource("<PageNodeButton item=\"coinIssuanceManagement\" lane={lane.title} />", '页面导航地图中应展示 21 货币发放管理。');
requireSource("<PageNodeButton item=\"suggestionFeedback\" lane={lane.title} />", '页面导航地图中应展示 22 建议反馈。');
requireSource("modules: ['教师信息', '头像', '姓名', '扫一扫', '设置', '了解学校版'", '14A 应展示教师信息、扫一扫、设置、了解学校版入口。');
requireSource("modules: ['教师信息', '头像', '姓名', '扫一扫', '设置', '当前版本入口'", '14B 应展示教师信息、扫一扫、设置、当前版本入口。');
requireSource("14B 不展示“了解学校版”按钮。", '14B 说明应明确不展示了解学校版按钮。');
requireSource("更多工具在 14A 和 14B 都展示", '14A/14B 说明应明确都展示更多工具。');
requireSource("const [showSpaceSelectSheet, setShowSpaceSelectSheet] = useState(false);", '14B 应能打开切换版本弹层。');
requireSource("aria-label=\"切换版本\"", '空间切换弹层 aria-label 应为切换版本。');
requireSource("aria-label=\"进入基本信息设置\"", '头像应进入基本信息设置页。');
requireSource("onClick={() => navigate(hasMultipleVersions ? 'teacherBasicInfoSchool' : 'teacherBasicInfoPersonal')}", '点击头像应按 14A/14B 导航到 15A/15B 基本信息设置页。');
requireSource("aria-label=\"扫一扫\"", '我的页右上角应提供扫一扫入口。');
requireSource("aria-label=\"设置\"", '我的页右上角应提供设置入口。');
requireSource("onClick={() => navigate('mineSettings')}", '点击设置 icon 应进入设置页。');
requireSource("className=\"mt-2 inline-flex max-w-full items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-xs font-black text-gray-600 active:bg-gray-100\"", '切换入口应贴近学校/版本文本，形成可切换信息胶囊。');
requireSource("<ArrowLeftRight size={13} className=\"shrink-0\" />", '14B 切换版本入口应使用小图标提示可切换。');
requireSource("<h3 className=\"text-base font-black\">切换版本</h3>", '空间切换弹层标题应为切换版本。');
requireSource("const teacherSpaces: TeacherSpaceProfile[] = [", '空间切换应来自统一空间列表。');
requireSource("{ id: 'personal', title: '个人版', type: 'personal' }", '空间列表应包含个人版。');
requireSource("{ id: 'schoolA', title: '成都七中初中附属小学', type: 'school' }", '空间列表应包含学校A。');
requireSource("{ id: 'schoolB', title: '星河实验小学', type: 'school' }", '空间列表应包含学校B。');
requireSource("const defaultTeacherSpaceId: TeacherSpaceId = 'schoolB';", '14B 默认版本应为星河实验小学。');
requireSource("const [currentSpaceId, setCurrentSpaceId] = useState<TeacherSpaceId>(defaultTeacherSpaceId);", '当前空间默认值应使用统一默认空间配置。');
requireSource("navigate('mineSchool');", '14B 代表用户拥有多个版本，切换到个人版后也应停留在 14B。');
requireSource("const hasMultipleVersions = page === 'mineSchool';", '我的页应区分“是否拥有多个版本”和“当前切到哪个版本”。');
requireSource("const isCurrentSchoolVersion = currentSpace.type === 'school';", '14B 管理工具应按当前切换版本展示学校版或个人版能力。');
requireSource("!hasMultipleVersions && (", '只有 14A 才展示了解学校版按钮。');
requireSource(">了解学校版</button>", '14A 应展示了解学校版按钮。');

requirePrd('- 未登录 → 01 登录页', 'PRD 启动页应指向 01 登录页。');
requirePrd('- 登录页', 'PRD 页面结构应使用登录页命名。');
requirePrd('- 登录流程', 'PRD 页面结构应使用登录流程合并首次进入和老用户进入。');
requirePrd('  - 01 登录页后分为三条分支', 'PRD 应说明 01 登录页后分三条分支。');
requirePrd('  - 分支条件：新用户首次登录', 'PRD 应说明新用户首次登录分支条件。');
requirePrd('  - 分支条件：新用户已填写姓名，但未完成新手引导', 'PRD 应说明新用户已填写姓名但未完成新手引导分支条件。');
requirePrd('  - 分支条件：老用户登录', 'PRD 应说明老用户登录分支条件。');
requirePrd('  - 新用户首次登录 → 02 完善信息 → 03 新手首页', 'PRD 应说明新用户首次登录分支进入完善信息和新手首页。');
requirePrd('  - 新用户已填写姓名，但未完成新手引导 → 03 新手首页；页面导航地图中该分支后续节点不用画出来', 'PRD 应说明已填写姓名但未完成新手引导分支只画到 03。');
requireSource('页面导航地图中，01 登录页后合并展示三条分支：新用户首次登录、新用户已填写姓名但未完成新手引导、老用户登录。', '页面详情应同步说明登录流程三条分支。');
requirePrd('  - 03 新手首页 → 04 创建班级 / 05 加入班级', 'PRD 应说明 03 后平行进入 04/05。');
requirePrd('  - 04 创建班级、05 加入班级为平行路径，后续都接入 12 添加学生', 'PRD 应说明 04/05 共同接入 12 添加学生。');
requirePrd('  - 12 添加学生 → 13 记录页', 'PRD 应说明 12 添加学生后进入 13 记录页。');
requirePrd('  - 老用户登录 → 13 记录页', 'PRD 应说明老用户登录分支直接进入记录页。');
requirePrd('- 13 记录页', 'PRD 应给记录页对应编号 13。');
requirePrd('  - 03 新手首页只保留 2 个步骤：获得班级、确认学生；不再要求完成第 3 个“首次记录”步骤', 'PRD 应说明 03 新手首页只保留两步。');
requirePrd('  - 页面不按记录数量区分多个状态，固定展示记录引导内容', 'PRD 应说明 13 记录页不区分多个状态。');
requirePrd('  - 不展示 AI 说明，不展示识别举例案例', 'PRD 应说明 13 记录页不展示 AI 说明和识别案例。');
requirePrd('  - 展示语音记录引导：试试通过语音描述一下内容', 'PRD 应说明 13 记录页展示语音记录引导。');
requirePrd('- 班级(个人版)', 'PRD 应拆出班级(个人版)流程。');
requirePrd('  - 07A 班级列表（个人版）→ 创建班级 / 加入班级', 'PRD 应说明个人版班级列表保留创建班级和加入班级入口。');
requirePrd('- 班级(学校版)', 'PRD 应新增班级(学校版)流程。');
requirePrd('  - 07B 班级列表（学校版）不需要创建班级、加入班级', 'PRD 应说明学校版班级列表不需要创建班级和加入班级。');
requirePrd('  - 学生列表 → 学生/分组切换、搜索、多选、性别筛选、学生详情', 'PRD 学生管理不应再把新增学生挂在学生列表路径中。');
requirePrd('- 14A 我的（仅有个人版）', 'PRD 应拆出 14A 我的。');
requirePrd('- 14B 我的（拥有多个版本）', 'PRD 应拆出 14B 我的。');
requirePrd('  - 不展示“了解学校版”按钮', 'PRD 14B 应明确不展示了解学校版按钮。');
requirePrd('  - 头像 → 15 基本信息设置', 'PRD 应明确头像进入基本信息设置。');
requirePrd('  - 右上角 → 扫一扫 icon、设置 icon', 'PRD 应明确右上角有扫一扫和设置 icon。');
requirePrd('  - 切换版本弹窗 → 个人版 / 多个学校版，列表只展示版本名称和当前标签，不展示备注文案', 'PRD 切换空间弹窗应支持多个学校版且禁止备注文案。');

if (source.includes("| 'spaceSelect'")) {
  failures.push('页面类型不应再包含 spaceSelect。');
}
if (source.includes("if (pageKey === 'spaceSelect') return '02A';") || prd.includes('- 02A 空间选择弹窗')) {
  failures.push('页面导航地图和 PRD 不应再出现 02A 空间选择。');
}
const mineSchoolMetaStart = source.indexOf("mineSchool: {");
const mineSchoolMetaEnd = source.indexOf("teacherBasicInfoPersonal: {", mineSchoolMetaStart);
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
const mineRenderEnd = source.indexOf("if (page === 'teacherBasicInfoPersonal' || page === 'teacherBasicInfoSchool')", mineRenderStart);
const mineRender = source.slice(mineRenderStart, mineRenderEnd);
if (!mineRender.includes("const hasMultipleVersions = page === 'mineSchool';")) {
  failures.push('14B 应代表用户拥有多个版本，不能只按当前切换版本判断页面身份。');
}
if (!mineRender.includes("const isCurrentSchoolVersion = currentSpace.type === 'school';")) {
  failures.push('14B 管理工具应按当前切换版本判断学校版/个人版能力。');
}
if (!mineRender.includes("!hasMultipleVersions && (")) {
  failures.push('了解学校版按钮必须只在 14A 展示。');
}
if (mineRender.includes("{hasMultipleVersions && (\n              <section className=\"rounded-3xl bg-gray-50 p-4\">")) {
  failures.push('学校基础信息卡片不能只在 14B 展示，14A 也需要展示。');
}
if (mineRender.includes("<span>当前版本</span>")) {
  failures.push('14B 不应再使用独立整行“当前版本”按钮，占用我的页空间。');
}
if (!mineRender.includes("aria-label=\"进入基本信息设置\"") || !mineRender.includes("aria-label=\"切换版本\"")) {
  failures.push('我的页必须具备头像基本信息入口和学校/版本切换入口。');
}
if (mineRender.includes("'修改密码'") || mineRender.includes("'隐私协议'") || mineRender.includes("'用户协议'") || mineRender.includes("退出登录")) {
  failures.push('修改密码、隐私协议、用户协议和退出登录不应继续出现在我的页主体。');
}

if (recordRender.includes('<ScreenHeader title="记录"')) {
  failures.push('13 记录页顶部不应展示返回按钮。');
}

requireSource("navigate('home');", '04 创建班级页「稍后添加」应保存后返回 03 新手首页（即 home）。');
requireSource("保存并添加学生", '04 创建班级页应保留主按钮「保存并添加学生」。');
requireSource("稍后添加", '04 创建班级页应展示次要入口「稍后添加」。');

if (source.includes("{ title: '老用户', pages: ['login', 'record'] }")) {
  failures.push('页面导航地图不应再保留独立老用户流程，应合并到登录流程分支。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi space switch assertions passed');
