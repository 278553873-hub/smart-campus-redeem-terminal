import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const appSource = read('../App.tsx');
const typesSource = read('../types.ts');
const constantsSource = read('../constants.ts');
const dashboardSource = read('./DashboardView.tsx');
const basicEditSource = read('./StudentBasicEditView.tsx');
const coinDetailSource = read('./StudentCoinDetailView.tsx');
const evaluationRecordsSource = read('./StudentEvaluationRecordsView.tsx');
const termSelectorSource = read('../components/student-detail/StudentTermSelector.tsx');
const timeRangeSelectorSource = read('../components/student-detail/StudentTimeRangeSelector.tsx');
const coinFormatSource = read('../utils/coinFormat.ts');
const questionnaireStoreSource = read('../../shared/questionnaireStore.ts');
const collectionHistorySource = read('./student-collection/StudentCollectionHistoryTab.tsx');
const collectionDetailSource = read('./student-collection/StudentCollectionRecordDetailView.tsx');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(typesSource, "status?: 'active' | 'left';", 'Student 类型应包含在校/离校状态。');
requireText(typesSource, 'reservedPhones?: string[];', 'Student 类型应包含多个预留手机。');
requireText(typesSource, 'CampusCoinIssueRecord', '类型层应定义校园币发放记录。');
requireText(typesSource, 'CampusCoinConsumeRecord', '类型层应定义校园币消耗记录。');
requireText(typesSource, 'CampusCoinMonthlyEstimate', '类型层应定义本月校园币结算预估。');

requireText(constantsSource, 'GET_MOCK_CAMPUS_COIN_DETAIL', 'Mock 数据应提供按学生生成校园币详情的方法。');
requireText(constantsSource, 'issueRecords', '校园币 Mock 应包含发放情况。');
requireText(constantsSource, 'consumeRecords', '校园币 Mock 应包含消耗情况。');
requireText(constantsSource, 'monthlyEstimate', '校园币 Mock 应包含本月结算预估。');

requireText(appSource, "'student_basic_edit'", 'App 路由应包含学生基础信息编辑子页面。');
requireText(appSource, "'student_coin_detail'", 'App 路由应包含校园币详情子页面。');
requireText(appSource, 'studentOverrides', 'App 应维护本次会话内的学生资料覆盖状态。');
requireText(appSource, 'handleSaveStudentBasicInfo', 'App 应提供学生基础信息保存处理。');
requireText(appSource, '<StudentBasicEditView', 'App 应渲染学生基础信息编辑页。');
requireText(appSource, '<StudentCoinDetailView', 'App 应渲染校园币详情页。');
requireText(appSource, 'onEditBasicInfo={() => navigateTo(\'student_basic_edit\')}', '学生详情页应能进入基础信息编辑页。');
requireText(appSource, 'onViewCampusCoins={() => navigateTo(\'student_coin_detail\')}', '学生详情页资产区应能进入校园币详情页。');
requireText(appSource, 'currentView !== \'student_detail\'', '学生详情页不应再显示独立页面标题栏。');
requireText(appSource, 'onBack={goBack}', '学生详情页返回入口应并入首个学生信息卡。');
requireText(appSource, "'student_detail'", '学生详情页应具备独立沉浸背景判断。');
requireText(appSource, 'TeacherMobileScreenBackground', '应提供教师手机端公共屏幕背景组件。');
requireText(appSource, "'student_detail', 'student_archive'", '学生详情页应纳入屏幕级背景页面集合。');
const plainBackgroundList = appSource.match(/const PLAIN_BACKGROUND_VIEWS: ViewState\[\] = \[([^\]]+)\]/)?.[1] ?? '';
requireText(plainBackgroundList, "'student_detail'", '学生详情页应使用纯白标题栏、浅灰内容区背景。');
requireText(appSource, '<TeacherMobileScreenBackground variant="plain" />', '学生详情页所属页面集合应返回公共纯色屏幕背景。');
requireText(appSource, "hasPlainBackground ? 'z-[2]' : 'z-auto'", '学生详情内容层必须高于纯白标题背景，避免返回、档案和学籍入口被遮挡。');
requireText(appSource, "'student_collection_detail'", 'App 路由应包含学生采集记录详情页。');
requireText(appSource, 'getCompletedStudentCollectionHistory(', '学生详情必须从问卷数据层读取已完成采集记录。');
requireText(appSource, '<StudentCollectionRecordDetailView', '点击采集记录后必须进入独立详情页。');
requireText(appSource, "setStudentDetailInitialTab('collection')", '从采集详情返回后应保持在采集记录页签。');
requireText(appSource, "setStudentDetailInitialTab('overview')", '从学生列表进入详情时必须默认展示成长概览。');
if (appSource.includes("setStudentDetailInitialTab('growth')")) {
  throw new Error('学生详情入口不应继续写入已移除的 growth 页签，否则首屏正文为空。');
}

requireText(dashboardSource, 'onEditBasicInfo', '学生详情总览应接收基础信息编辑入口。');
requireText(appSource, "'class_detail', 'student_detail', 'student_archive'", '学生详情页应在手机屏幕内自行管理滚动。');
requireText(dashboardSource, 'relative h-full min-h-0 overflow-hidden bg-transparent', '学生详情根容器应占满屏幕并保持透明，让公共背景完整显示。');
requireText(dashboardSource, 'h-full overflow-y-auto pb-safe no-scrollbar', '学生详情内容应独立滚动，避免底部抽屉挂到长页面底部。');
requireText(dashboardSource, 'aria-label="编辑基础信息"', '学生头像编辑入口必须保留无障碍标签。');
requireText(dashboardSource, '<Camera', '学生头像右下角必须展示相机图标。');
if (dashboardSource.includes('<Pencil')) {
  throw new Error('学生身份卡顶部不应继续展示独立铅笔编辑按钮。');
}
if (dashboardSource.indexOf('aria-label="编辑基础信息"') < dashboardSource.indexOf('<div className="flex min-w-0 items-center gap-4">')) {
  throw new Error('基础信息编辑入口必须绑定在学生头像上，而不是学生卡片顶部操作区。');
}
if (dashboardSource.includes('>编辑基础信息<')) {
  throw new Error('学生详情页不应额外显示“编辑基础信息”文字操作。');
}
if (dashboardSource.includes('handleUpdateFaceClick') || dashboardSource.includes('选择人脸更新方式')) {
  throw new Error('学生详情页头像只负责进入基础信息编辑页，不应直接触发换脸流程。');
}
requireText(dashboardSource, 'formatCompactClassName', '学生详情页班级标签应格式化为 2025级1班。');
if (dashboardSource.includes('{student.grade}{student.class}')) {
  throw new Error('学生详情页班级标签不应显示年级学段和完整中文班名，只显示 2025级1班。');
}
requireText(dashboardSource, '钱包', '顶部学生信息卡应整合钱包金额。');
requireText(dashboardSource, '存款', '顶部学生信息卡应整合存款金额。');
requireText(dashboardSource, 'src="/assets/coin.png"', '钱包和存款金额应使用货柜机同款金币图标。');
if (dashboardSource.includes('发放、消耗与本月结算预估') || dashboardSource.includes('最近发放') || dashboardSource.includes('本月预估')) {
  throw new Error('学生详情总览页不应再展示校园币发放、消耗或月预估信息。');
}
requireText(dashboardSource, 'onViewCampusCoins', '学生详情顶部资产区应保留查看明细入口回调。');
requireText(dashboardSource, '查看明细', '钱包和存款应放在同一资产区域并提供查看明细按钮。');
requireText(dashboardSource, 'text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]', '查看明细操作应使用教师端低视觉权重 Token。');
if (dashboardSource.includes('bg-blue-50 px-3 text-[11px] font-bold text-blue-600')) {
  throw new Error('查看明细操作不应使用蓝色强调按钮样式。');
}
requireText(dashboardSource, 'formatCoinAmount', '学生详情页金额应使用统一校园币格式化函数。');
requireText(dashboardSource, 'A. Student Profile Card', '学生信息卡应独立置顶。');
requireText(dashboardSource, 'aria-label="返回"', '学生详情页返回按钮应并入首个学生信息卡。');
requireText(dashboardSource, '<ChevronLeft', '学生详情页首个卡片应包含返回图标。');
requireText(dashboardSource, 'linear-gradient(135deg,var(--tm-bg-surface)', '首个学生信息区应使用品牌浅红单向浅渐变承接公共暖白背景。');
if (/gradient\([^)]*#[0-9a-fA-F]{3,8}/.test(dashboardSource)) {
  throw new Error('学生身份区渐变不应使用硬编码色值，只允许品牌 Token 渐变，禁止蓝黄绿混合渐变。');
}
if (dashboardSource.includes('mt-4 text-xs font-medium text-slate-500')) {
  throw new Error('学生状态不应单独占一行，应移动到姓名下方的信息标签组。');
}
if (dashboardSource.includes('BadgeCheck className="h-3 w-3"')) {
  throw new Error('学生顶部信息卡不应重复展示学籍状态标签，状态由独立管理行承载。');
}
if (dashboardSource.includes('w-full bg-white px-5 pb-5 pt-3')) {
  throw new Error('首个学生信息卡不应继续使用纯白背景。');
}
requireText(dashboardSource, 'B. Assets Card', '资产展示应独立为第二张卡片。');
if (dashboardSource.includes('总资产') || dashboardSource.includes('totalCampusAssets')) {
  throw new Error('资产卡不应展示总资产，只展示钱包、存款和查看明细。');
}
requireText(dashboardSource, 'flex min-h-[56px] items-center', '资产卡应压缩为单行展示。');
requireText(dashboardSource, '<StudentTermSelector value={selectedTerm}', '成长报告必须使用学期选择器。');
requireText(termSelectorSource, '<StudentTimeRangeSelector', '学期筛选必须复用学生详情通用时间选择器。');
requireText(timeRangeSelectorSource, 'h-11 w-full', '时间选择器必须满足 44px 触控高度。');
requireText(termSelectorSource, '（本学期）', '学期选择器必须明确当前学期。');
requireText(dashboardSource, '本学期五育积分', '五育积分应明确为本学期实时累计结果。');
requireText(dashboardSource, 'currentTermOption', '成长概览必须固定读取当前学期数据。');
const overviewSource = dashboardSource.slice(dashboardSource.indexOf('const renderOverviewTab'), dashboardSource.indexOf('const renderReportTab'));
if (overviewSource.includes('<StudentTermSelector')) {
  throw new Error('成长概览只展示本学期数据，不应提供历史学期筛选。');
}
if (dashboardSource.includes('Filter Bar (Term Selector)') || dashboardSource.includes('merged basic info')) {
  throw new Error('学生信息、资产和学期筛选不应继续使用旧的混合布局。');
}
if (dashboardSource.includes('<School className="mb-1 h-4 w-4 text-slate-400" />{student.class}')) {
  throw new Error('顶部学生身份卡下方不应重复展示所在班级，小标签已包含该信息。');
}
if (dashboardSource.includes('学号<br /><span className="text-slate-900">{student.studentNo || student.id}</span>')) {
  throw new Error('顶部学生身份卡下方不应重复展示学号，上方 ID 标签已包含该信息。');
}
if (dashboardSource.includes('预留手机 {reservedPhoneCount} 个')) {
  throw new Error('学生详情页不应展示预留手机摘要，该信息只在基础信息编辑页维护。');
}
if (dashboardSource.includes('姓名、学号、班级和预留手机')) {
  throw new Error('基础信息不应再作为独立入口卡，应合并到顶部学生身份卡。');
}
requireText(dashboardSource, '班级平均', '五育能力模型应展示班级平均对比。');
requireText(dashboardSource, 'classAvgData.map', '五育能力模型应在图像上展示班级平均具体数值。');
requireText(dashboardSource, 'text-[12px] font-medium', '五育雷达图数值应使用 12px 常规字重。');
requireText(dashboardSource, 'fill={teacherBrandSemantic.textTertiary}', '五育雷达图班级平均分值应使用弱化的中性 Token。');
requireText(dashboardSource, 'width="28"', '当前分值应增加底色标签以提升可读性。');
requireText(dashboardSource, 'showCurrent', '五育能力模型当前标签应可点击隐藏/显示当前分值。');
requireText(dashboardSource, 'onToggleCurrent', '五育能力模型当前图例标签应承担开关功能。');
requireText(dashboardSource, 'onToggleClassAvg', '五育能力模型班级平均图例标签应承担开关功能。');
requireText(dashboardSource, 'aspect-square w-full max-w-[340px]', '五育雷达图应使用响应式正方形，避免小屏溢出。');
requireText(dashboardSource, 'stroke={teacherBrandSemantic.textDisabled}', '班级平均应使用弱化的中性实线展示。');
requireText(dashboardSource, 'border-[var(--tm-text-disabled)]', '班级平均图例应使用中性实线 Token。');
requireText(dashboardSource, 'getFiveEducationTone', '当前分值标签应使用固定五育分类色。');
if (dashboardSource.includes('fill="#F5F3FF"')) {
  throw new Error('班级平均数值不应再使用背景填充。');
}
if (dashboardSource.includes('text-[17px] font-black') || dashboardSource.includes('text-[15px] font-black fill-violet-600')) {
  throw new Error('五育雷达图数值不应加粗显示。');
}
if (dashboardSource.includes('stroke="#C4B5FD"') || dashboardSource.includes('strokeWidth="1.2"')) {
  throw new Error('当前值和班级平均数值标签不应继续使用边框描边样式。');
}
if (dashboardSource.includes('strokeDasharray="6 4"') || dashboardSource.includes('scale-[0.9]')) {
  throw new Error('班级平均不应使用虚线，雷达图也不应继续缩小显示。');
}
for (const legacyColor of ['blue-', 'purple-', 'violet-', 'indigo-', 'cyan-', 'pink-', 'slate-', 'amber-', 'emerald-']) {
  if (dashboardSource.includes(legacyColor)) {
    throw new Error(`学生详情页仍残留旧颜色体系：${legacyColor}`);
  }
}
for (const required of [
  'teacherFiveEducationSemantic',
  '--tm-brand-reward-soft',
  '--tm-brand-primary-soft',
  'aria-label="管理学籍状态"',
]) {
  requireText(dashboardSource, required, `学生详情页未完整接入新设计 Token：${required}`);
}
requireText(evaluationRecordsSource, '--tm-record-positive-bg', '评价记录二级页应使用正向记录 Token。');
requireText(evaluationRecordsSource, '--tm-record-negative-bg', '评价记录二级页应使用负向记录 Token。');
requireText(dashboardSource, 'showClassAvg', '五育能力模型应保留班级平均开关。');
requireText(overviewSource, '<FiveEducationRadar scores={currentScores}', '成长概览必须直接展示五育雷达图。');
if (dashboardSource.includes('showFiveComparison') || dashboardSource.includes('班级对比')) {
  throw new Error('五育雷达图不应再通过班级对比按钮延迟展示。');
}
requireText(overviewSource, '评价记录 {currentTermEvaluationRecords.length}条', '雷达图下方必须以文字链接展示本学期评价记录数量。');
requireText(overviewSource, 'setSelectedTerm(currentTermOption.value)', '评价记录入口必须携带本学期条件进入二级页。');
requireText(overviewSource, 'setShowEvaluationRecords(true)', '评价记录入口必须直接进入评价记录二级页。');
if (overviewSource.includes('showEvaluationPreview') || overviewSource.includes('aria-expanded') || overviewSource.includes('student-evaluation-preview')) {
  throw new Error('成长概览中的评价记录入口不应再原地展开明细。');
}
if (dashboardSource.includes('上月对比') || dashboardSource.includes('showLastMonth') || dashboardSource.includes('年级平均')) {
  throw new Error('五育能力模型不应再展示上月对比或年级平均，应改为当前与班级平均。');
}
requireText(dashboardSource, "useState<'overview' | 'report' | 'collection'>", '学生详情一级页签应拆分为成长概览、成长报告和采集记录。');
requireText(dashboardSource, "initialTab = 'overview'", '学生详情应默认进入成长概览。');
requireText(dashboardSource, '成长概览', '学生详情必须提供成长概览页签。');
requireText(dashboardSource, '成长报告', '学生详情必须保留成长报告页签。');
requireText(dashboardSource, '评价记录', '学生详情必须保留评价记录页签。');
requireText(dashboardSource, '采集记录', '学生详情必须新增采集记录页签。');
requireText(dashboardSource, "activeTab === 'overview' && renderOverviewTab()", '实时五育积分必须只在成长概览展示。');
requireText(dashboardSource, "activeTab === 'report' && renderReportTab()", '阶段报告必须收敛到成长报告页签。');
if (dashboardSource.includes("activeTab === 'evaluation'")) {
  throw new Error('评价记录不应继续占用学生详情一级页签。');
}
requireText(dashboardSource, '<StudentEvaluationRecordsView', '评价记录应进入独立二级页面。');
requireText(evaluationRecordsSource, 'record.evaluation_date >= activeTerm.startDate', '评价记录必须按所选学期过滤。');
requireText(evaluationRecordsSource, 'ariaLabel="筛选评价记录学期"', '评价记录二级页必须继承并允许切换学期。');
requireText(dashboardSource, 'onClick={() => setShowStatusActionSheet(true)}', '学生卡片顶部的学籍入口应直接打开学籍状态抽屉。');
requireText(dashboardSource, '>学籍</span>', '学生卡片顶部必须显示中文“学籍”。');
if (dashboardSource.includes('showMoreActionsSheet') || dashboardSource.includes('aria-label="更多学生操作"')) {
  throw new Error('学籍管理不应再经过只有一个操作的更多菜单。');
}
requireText(dashboardSource, 'aria-label="查看学生成长档案"', '学生成长档案应使用学生卡片顶部的轻量入口。');
requireText(dashboardSource, 'onClick={onOpenStudentArchive}', '学生成长档案入口应直接进入档案页面。');
requireText(dashboardSource, '<FolderOpen', '学生成长档案入口应使用文件夹图标表达档案语义。');
requireText(dashboardSource, '>档案</span>', '学生成长档案入口必须显示中文“档案”。');
const studentHeaderActionsSource = dashboardSource.slice(
  dashboardSource.indexOf('aria-label="查看学生成长档案"'),
  dashboardSource.indexOf('<div className="flex min-w-0 items-center gap-4">'),
);
if ((studentHeaderActionsSource.match(/text-\[var\(--tm-text-secondary\)\]/g) || []).length !== 2) {
  throw new Error('学生卡片顶部的“档案”和“学籍”应统一使用中性深灰。');
}
if (studentHeaderActionsSource.includes('--tm-brand-primary')) {
  throw new Error('学生卡片顶部并列入口不应使用品牌红制造错误的主次关系。');
}
if (dashboardSource.includes('BookOpenCheck')) {
  throw new Error('学生成长档案入口不应继续使用语义含混的带勾书本图标。');
}
if (dashboardSource.indexOf('aria-label="查看学生成长档案"') > dashboardSource.indexOf('{/* 2. Scrollable Content */}')) {
  throw new Error('学生成长档案入口必须位于学生身份卡顶部。');
}
if (dashboardSource.includes('>学生成长档案</span>')) {
  throw new Error('学生成长档案不应继续作为更多操作抽屉中的文字菜单项。');
}
requireText(dashboardSource, '<StudentCollectionHistoryTab items={collectionHistory}', '采集记录页签必须使用独立业务组件。');
requireText(dashboardSource, 'termOptions={STUDENT_TERM_OPTIONS}', '采集记录必须复用成长数据的学期定义。');
requireText(dashboardSource, 'selectedTerm={selectedTerm}', '成长报告与采集记录必须共享所选学期。');
requireText(dashboardSource, 'onSelectedTermChange={setSelectedTerm}', '采集记录必须能够切换共享学期。');
requireText(dashboardSource, "value: '2025-spring'", '学生详情当前学期必须与演示日期保持一致。');
requireText(questionnaireStoreSource, 'getCompletedStudentCollectionHistory', '问卷数据层必须提供按学生查询采集历史的方法。');
requireText(questionnaireStoreSource, "item.studentNo === studentNo && item.status === 'completed'", '学生详情只能展示已完成的学生采集记录。');
requireText(questionnaireStoreSource, 'createdByCurrentTeacher', '学生采集历史查询必须校验任务创建权限。');
requireText(questionnaireStoreSource, 'assignedToCurrentTeacher', '学生采集历史查询必须校验逐生填写分配权限。');
requireText(collectionHistorySource, '家长问卷', '采集记录卡片必须区分家长问卷。');
requireText(collectionHistorySource, '学生采集', '采集记录卡片必须区分学生采集。');
requireText(collectionHistorySource, 'respondentLabel', '采集记录卡片必须展示实际填写人。');
requireText(collectionHistorySource, '<StudentTermSelector', '采集记录必须复用成长报告的学期选择器。');
requireText(collectionHistorySource, 'completedDate >= activeTerm.startDate', '采集记录必须按所选学期过滤。');
requireText(collectionHistorySource, 'getMonthGroup', '采集记录必须在所选学期内按月份聚合。');
for (const extraTimeOption of ['全部时间', '本月', '上月', '自定义时间']) {
  if (collectionHistorySource.includes(extraTimeOption)) {
    throw new Error(`采集记录不应额外提供时间筛选项：${extraTimeOption}`);
  }
}
requireText(collectionHistorySource, 'aria-expanded={isExpanded}', '采集记录时间分组必须支持折叠。');
requireText(collectionHistorySource, 'min-h-[var(--tm-size-touch)]', '采集记录时间分组必须满足 44px 触控尺寸。');
requireText(collectionDetailSource, 'divide-y divide-slate-100', '采集详情必须使用连续问答列表，不得为每道题嵌套卡片。');
requireText(collectionDetailSource, 'formatQuestionnaireAnswer', '采集详情必须统一格式化结构化答案。');
requireText(collectionDetailSource, '返回学生详情', '采集详情必须提供明确返回路径。');
if (dashboardSource.includes("'redemption'")) {
  throw new Error('学生详情页不应再把兑换记录作为与成长报告同级的主要 Tab。');
}
if (dashboardSource.includes('兑换记录')) {
  throw new Error('学生详情页兑换记录应收敛到校园币详情页的消耗情况中。');
}

for (const required of ['头像', '更换头像', '姓名', '性别', '学号', '所在班级', '家长联系方式']) {
  requireText(basicEditSource, required, `基础信息编辑页缺少字段：${required}`);
}
if (basicEditSource.includes('学生状态') || basicEditSource.includes('设为离校') || basicEditSource.includes('学籍状态')) {
  throw new Error('基础信息编辑页不应包含学生状态或设为离校入口，学籍状态应在学生详情页单独操作。');
}
requireText(basicEditSource, 'classPickerYear', '所在班级选择应采用左侧年份、右侧班级的级联状态。');
requireText(basicEditSource, 'yearOptions.map', '所在班级选择左侧应展示 2020级、2021级等年份选项。');
requireText(basicEditSource, 'classOptions.map', '所在班级选择右侧应根据年份展示班级选项。');
requireText(basicEditSource, 'grid-cols-[92px_1fr]', '班级级联应采用左右两栏布局。');
requireText(basicEditSource, 'aria-label="左侧先选入学年级"', '班级级联左侧应先选入学年级。');
requireText(basicEditSource, 'aria-label="右侧再选该年级下的班级"', '班级级联右侧应展示该年级下的班级。');
requireText(basicEditSource, 'formatCompactClassName(item.name)', '右侧班级应展示 2020级1班 这样的紧凑班级名。');
requireText(basicEditSource, '添加联系方式', '基础信息编辑页应支持新增多个家长联系方式。');
requireText(basicEditSource, 'removeContact', '基础信息编辑页应支持删除家长联系方式。');
requireText(typesSource, "export type GuardianRelation = '家长' | '爸爸' | '妈妈' | '爷爷' | '奶奶' | '外公' | '外婆' | '其他';", '学生基础信息应定义家长关系选项。');
requireText(typesSource, 'guardianContacts?: GuardianContact[];', 'Student 类型应包含家长联系方式结构。');
requireText(basicEditSource, "const guardianRelationOptions: GuardianRelation[] = ['家长', '爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '其他'];", '基础信息编辑页应提供家长关系选择。');
requireText(basicEditSource, "contact.relation === '其他'", '选择其他关系时应显示自定义关系输入框。');
requireText(basicEditSource, 'confirmSystemAvatar', '基础信息编辑页应确认系统头像后再写入学生资料。');
requireText(basicEditSource, '保存基础信息', '基础信息编辑页应提供明确保存按钮。');
requireText(basicEditSource, 'h-full min-h-0 overflow-hidden', '基础信息编辑子页面应使用手机壳内高度，避免底部按钮裁切。');
requireText(basicEditSource, 'StudentBasicEditView', '基础信息编辑页应独立封装。');
if (basicEditSource.includes('学生基础资料') || basicEditSource.includes('本次 Demo 保存后在当前会话内生效') || basicEditSource.includes('UserRound')) {
  throw new Error('基础信息编辑页不应展示顶部说明卡，应直接进入表单。');
}
if (basicEditSource.includes('学生头像</div>') || basicEditSource.includes('与基础信息一起保存')) {
  throw new Error('头像区域不应展示多余说明文案，只保留头像和更换头像操作。');
}
requireText(basicEditSource, 'showAvatarSheet', '点击更换头像后应展示头像操作蒙层。');
requireText(basicEditSource, '拍照', '头像操作蒙层应提供拍照入口。');
requireText(basicEditSource, '从相册选择', '头像操作蒙层应提供从相册选择入口。');
requireText(basicEditSource, 'cameraInputRef', '头像操作应复用拍照文件入口。');
requireText(basicEditSource, 'albumInputRef', '头像操作应复用相册文件入口。');

for (const required of ['收入', '支出', '校园币收支记录', '校园币流水']) {
  requireText(coinDetailSource, required, `校园币详情页缺少收支流水能力：${required}`);
}
requireText(coinDetailSource, 'CampusCoinDetail', '校园币详情页应使用校园币详情类型。');
requireText(coinDetailSource, 'issueRecords.map', '校园币详情页应展示发放流水列表。');
requireText(coinDetailSource, 'consumeRecords.map', '校园币详情页应展示消耗流水列表。');
requireText(coinDetailSource, 'line-clamp-2', '校园币流水标题和说明应至少支持两行展示。');
requireText(coinDetailSource, 'activeFilter', '校园币详情页应参考货柜机流水明细提供收支筛选。');
requireText(coinDetailSource, 'activeCategory', '校园币详情页应参考货柜机流水明细提供类型筛选。');
requireText(coinDetailSource, 'formatCoinAmount', '校园币详情页金额应使用统一校园币格式化函数。');
requireText(coinDetailSource, 'showFilterSheet', '校园币年份与交易类型应收进筛选抽屉。');
requireText(coinDetailSource, 'groupedFlowItems', '校园币流水应按月份分组。');
requireText(coinDetailSource, 'divide-y divide-[var(--tm-border-subtle)]', '同月流水应使用连续列表与分隔线组织。');
requireText(coinDetailSource, 'h-11 w-11', '校园币图标按钮应满足 44px 触控尺寸。');
if (coinDetailSource.includes('学期')) {
  throw new Error('校园币是持续资产，不应使用学期筛选。');
}
if (coinDetailSource.includes('monthlyEstimate') || coinDetailSource.includes('预计可得') || coinDetailSource.includes('校园币总额')) {
  throw new Error('校园币详情页只保留收支记录，不应展示预估或金额分布。');
}
if (coinDetailSource.includes('mb-1 truncate text-base') || coinDetailSource.includes('truncate text-xs font-bold')) {
  throw new Error('校园币流水不应继续强制单行截断标题和来源。');
}

requireText(coinFormatSource, 'maximumFractionDigits: 2', '校园币金额最多保留 2 位小数。');
requireText(coinFormatSource, 'minimumFractionDigits: 0', '校园币金额小数为 0 时不应展示小数位。');
