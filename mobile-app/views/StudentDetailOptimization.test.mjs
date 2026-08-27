import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const appSource = read('../App.tsx');
const typesSource = read('../types.ts');
const constantsSource = read('../constants.ts');
const dashboardSource = read('./DashboardView.tsx');
const screenBackgroundSource = read('../components/TeacherMobileScreenBackground.tsx');
const tokenSource = read('../styles/teacherMobileTokens.ts');
const basicEditSource = read('./StudentBasicEditView.tsx');
const mobileEditableRowSource = read('../components/ui/MobileEditableRow.tsx');
const coinDetailSource = read('./StudentCoinDetailView.tsx');
const compactSegmentSource = read('../components/ui/CompactSegmentedControl.tsx');
const textSelectionSource = read('../components/ui/TextSelectionControl.tsx');
const evaluationRecordsSource = read('./StudentEvaluationRecordsView.tsx');
const termSelectorSource = read('../components/student-detail/StudentTermSelector.tsx');
const timeRangeSelectorSource = read('../components/student-detail/StudentTimeRangeSelector.tsx');
const coinFormatSource = read('../utils/coinFormat.ts');
const coinFlowSource = read('../domain/campusCoinFlow.ts');
const questionnaireStoreSource = read('../../shared/questionnaireStore.ts');
const collectionHistorySource = read('./student-collection/StudentCollectionHistoryTab.tsx');
const collectionDetailSource = read('./student-collection/StudentCollectionRecordDetailView.tsx');
const growthCoinTerminologySource = read('../../shared/growthCoinTerminology.ts');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(mobileEditableRowSource, 'before:inset-y-0 before:-left-4 before:-right-4', '统一字段行按压底色应拉通整个卡片行。');
requireText(mobileEditableRowSource, 'active:before:bg-[var(--tm-bg-surface-soft)]', '统一字段行按下时应使用浅灰反馈，不使用主题色填充。');
if (mobileEditableRowSource.includes('before:rounded')) {
  throw new Error('统一字段行按压底色不应设置圆角。');
}

requireText(typesSource, "status?: 'active' | 'left';", 'Student 类型应包含在校/离校状态。');
requireText(typesSource, 'reservedPhones?: string[];', 'Student 类型应包含多个预留手机。');
requireText(typesSource, 'CampusCoinIssueRecord', '类型层应定义校园币发放记录。');
requireText(typesSource, 'CampusCoinConsumeRecord', '类型层应定义校园币消耗记录。');
requireText(typesSource, 'CampusCoinSettlementEstimate', '类型层应定义可跟随周/月配置变化的校园币结算预估。');
requireText(typesSource, 'CoinIssuanceConfig', '货币发放配置应由共享类型层统一定义。');
requireText(typesSource, 'estimatedAt: string;', '校园币预估应包含估算截止时间。');
requireText(typesSource, 'ruleVersion: string;', '校园币预估应保留计算规则版本，便于接口结果追溯。');

requireText(constantsSource, 'GET_MOCK_CAMPUS_COIN_DETAIL', 'Mock 数据应提供按学生生成校园币详情的方法。');
requireText(constantsSource, 'issueRecords', '校园币 Mock 应包含发放情况。');
requireText(constantsSource, 'consumeRecords', '校园币 Mock 应包含消耗情况。');
requireText(constantsSource, 'settlementEstimate', '校园币 Mock 应包含结算预估。');
requireText(constantsSource, 'sunshinePool', '校园币预估应读取阳光保底比例计算保底奖池。');
requireText(constantsSource, 'rankingPool', '校园币预估应读取积分排行比例计算排行奖池。');
requireText(constantsSource, "category: 'growth_award'", '成长嘉奖流水应使用明确分类，不根据文案猜测。');
requireText(constantsSource, "startDate: '2025-12-29', endDate: '2026-01-04'", 'Mock 数据应直接展示跨年成长嘉奖边界。');
requireText(coinFlowSource, "start.year !== end.year", '成长嘉奖跨年时应展示完整年份。');
requireText(coinFlowSource, "`${start.month}月${start.day}日-${end.month}月${end.day}日奖励`", '同年周奖励应省略年份并保留完整月日。');
requireText(coinDetailSource, 'item.categoryLabel', '校园币流水第一层应展示分类。');
requireText(coinDetailSource, 'item.detail', '校园币流水第二层应展示明细。');
requireText(coinDetailSource, 'formatCampusCoinFlowTime(item.time)', '校园币流水第三层应独立展示时间。');
requireText(coinDetailSource, '`${record.productName} ×${record.quantity}`', '兑换商品数量应统一使用乘号。');

requireText(appSource, "'student_basic_edit'", 'App 路由应包含学生基础信息编辑子页面。');
requireText(appSource, "'student_coin_detail'", 'App 路由应包含校园币详情子页面。');
requireText(appSource, 'studentOverrides', 'App 应维护本次会话内的学生资料覆盖状态。');
requireText(appSource, 'handleChangeStudentBasicInfo', 'App 应提供学生基础信息实时更新处理。');
const basicInfoChangeHandlerSource = appSource.match(/const handleChangeStudentBasicInfo = \(student: Student\) => \{([\s\S]*?)\n    \};/)?.[1] ?? '';
requireText(basicInfoChangeHandlerSource, 'setStudentOverrides', '实时修改基础信息后应更新学生资料覆盖状态。');
requireText(basicInfoChangeHandlerSource, 'setSelectedStudent(student)', '实时修改基础信息后应同步当前学生详情。');
if (basicInfoChangeHandlerSource.includes('goBack()')) {
  throw new Error('基础信息实时生效后应停留在编辑页，不应自动返回。');
}
requireText(appSource, '<StudentBasicEditView', 'App 应渲染学生基础信息编辑页。');
requireText(appSource, '<StudentCoinDetailView', 'App 应渲染校园币详情页。');
requireText(appSource, "lazy(() => import('./views/StudentCoinDetailView'))", '校园币详情等低频子页面应按需加载。');
requireText(coinDetailSource, '<CompactSegmentedControl', '校园币收入/支出应复用紧凑分段控件。');
requireText(coinDetailSource, '<TextSelectionControl', '校园币分类应复用仅文字高亮的选择控件。');
requireText(compactSegmentSource, 'min-h-[var(--tm-selection-touch-height)]', '紧凑分段控件必须通过组件 Token 保留44像素触控区。');
requireText(textSelectionSource, "? 'font-semibold text-[var(--tm-selection-text-active)]'", '分类选中态应只使用组件级主题红文字。');
if (textSelectionSource.includes("? 'bg-[var(--tm-brand-primary-soft)]")) {
  throw new Error('仅文字选择控件的选中态不得增加底色。');
}
requireText(appSource, '<Suspense fallback={<TeacherRouteSkeleton />}>', '低频子页面加载时应提供稳定的页面骨架。');
requireText(appSource, 'GET_MOCK_CAMPUS_COIN_DETAIL(activeStudent, coinIssuanceConfig, activeStudentClassSize)', '校园币详情应实时读取学校货币发放配置和班级人数。');
requireText(appSource, 'onEditBasicInfo={() => navigateTo(\'student_basic_edit\')}', '学生详情页应能进入基础信息编辑页。');
requireText(appSource, 'onViewCampusCoins={() => navigateTo(\'student_coin_detail\')}', '学生详情页资产区应能进入校园币详情页。');
requireText(appSource, 'currentView !== \'student_detail\'', '学生详情页应由页面内部渲染标题栏，App 不应重复渲染通用标题栏。');
requireText(appSource, 'onBack={goBack}', '学生详情页必须保留返回能力。');
requireText(appSource, "'student_detail'", '学生详情页应具备独立沉浸背景判断。');
requireText(appSource, 'TeacherMobileScreenBackground', '应提供教师手机端公共屏幕背景组件。');
requireText(appSource, "'student_detail', 'student_archive'", '学生详情页应纳入屏幕级背景页面集合。');
const plainBackgroundList = appSource.match(/const PLAIN_BACKGROUND_VIEWS: ViewState\[\] = \[([^\]]+)\]/)?.[1] ?? '';
requireText(plainBackgroundList, "'student_detail'", '学生详情页应使用纯白标题栏、浅灰内容区背景。');
requireText(plainBackgroundList, "'student_archive'", '学生成长档案应使用纯色分层背景，不使用氛围渐变。');
requireText(appSource, '<TeacherMobileScreenBackground variant="plain" />', '学生详情页所属页面集合应返回公共纯色屏幕背景。');
requireText(appSource, '<TeacherMobileScreenBackground variant="student-detail" />', '学生详情页应使用独立的纯色公共背景。');
requireText(screenBackgroundSource, "variant === 'student-detail'", '公共屏幕背景组件应实现学生详情背景变体。');
const studentDetailBackgroundBlock = screenBackgroundSource.match(/if \(variant === 'student-detail'\) \{([\s\S]*?)\n    \}/)?.[1] ?? '';
requireText(studentDetailBackgroundBlock, 'return <div className="absolute inset-0 bg-[var(--tm-page-plain-content-bg)]"', '学生详情应使用与内容区一致的全屏纯色底色。');
if (studentDetailBackgroundBlock.includes('gradient') || studentDetailBackgroundBlock.includes('--tm-glow-')) {
  throw new Error('学生详情屏幕背景不应继续使用渐变或弥散光。');
}
if (tokenSource.includes("'--tm-student-detail-header-height'")) {
  throw new Error('固定高度线性渐变移除后，应清理失效的学生详情背景高度 Token。');
}
requireText(tokenSource, "'--tm-student-detail-profile-bg'", '学生信息卡的品牌氛围应由组件 Token 统一管理。');
requireText(dashboardSource, '[background:var(--tm-student-detail-profile-bg)]', '学生信息卡应使用独立的品牌氛围背景 Token。');
for (const token of [
  '--tm-student-detail-asset-bg',
  '--tm-student-detail-asset-border',
  '--tm-student-detail-asset-height',
  '--tm-student-detail-asset-chevron-space',
]) {
  requireText(tokenSource, `'${token}'`, `学生详情组合卡缺少资产带组件 Token：${token}`);
  requireText(dashboardSource, `var(${token})`, `学生详情资产带未消费组件 Token：${token}`);
}
requireText(appSource, "hasPlainBackground ? 'z-[2]' : 'z-auto'", '学生详情内容层必须高于纯白标题背景，避免返回、档案和学籍入口被遮挡。');
requireText(appSource, "'student_collection_detail'", 'App 路由应包含学生采集记录详情页。');
requireText(appSource, 'getCompletedStudentCollectionHistory(', '学生详情必须从问卷数据层读取已完成采集记录。');
requireText(appSource, '<StudentCollectionRecordDetailView', '点击采集记录后必须进入独立详情页。');
requireText(appSource, "setStudentDetailInitialSection('collection')", '从采集详情返回后应保持在采集记录子页面。');
requireText(appSource, "setStudentDetailInitialSection('evaluation')", '从学生列表进入详情时必须默认展示评价记录。');
if (appSource.includes("setStudentDetailInitialSection('overview')") || appSource.includes("setStudentDetailInitialSection('growth')")) {
  throw new Error('学生详情入口不应继续写入已移除的成长概览页签。');
}

requireText(dashboardSource, 'onEditBasicInfo', '学生详情总览应接收基础信息编辑入口。');
const scrollHandledViews = appSource.match(/const viewHandlesScroll = \[([^\]]+)\]/)?.[1] ?? '';
requireText(scrollHandledViews, "'student_detail'", '学生详情页应在手机屏幕内自行管理滚动。');
requireText(dashboardSource, 'relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent', '学生详情根容器应占满屏幕、保持透明，并支持固定标题栏布局。');
requireText(dashboardSource, 'min-h-0 flex-1 overflow-y-auto pb-safe no-scrollbar', '学生详情标题栏下方内容应独立滚动，避免底部抽屉挂到长页面底部。');
requireText(dashboardSource, 'aria-label="编辑基础信息"', '学生头像编辑入口必须保留无障碍标签。');
requireText(dashboardSource, '<Camera', '学生头像右下角必须展示相机图标。');
const studentProfileCardSource = dashboardSource.slice(
  dashboardSource.indexOf('{/* A. Student Profile Card */}'),
  dashboardSource.indexOf('{/* 2. Scrollable Content */}'),
);
if (studentProfileCardSource.includes('<Pencil')) {
  throw new Error('学生身份卡顶部不应继续展示独立铅笔编辑按钮。');
}
if (dashboardSource.indexOf('aria-label="编辑基础信息"') < dashboardSource.indexOf('<div className="flex min-w-0 items-start gap-4">')) {
  throw new Error('基础信息编辑入口必须绑定在学生卡片的头像上。');
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
requireText(dashboardSource, 'GROWTH_COIN_TERMS.name', '学生详情顶部应独立展示成长币名称。');
requireText(dashboardSource, 'GROWTH_COIN_TERMS.available', '学生详情顶部应展示可用金额。');
requireText(dashboardSource, 'GROWTH_COIN_TERMS.saved', '学生详情顶部应展示已存金额。');
requireText(dashboardSource, 'src="/assets/coin.png"', '成长币金额应使用货柜机同款金币图标。');
if (dashboardSource.includes('发放、消耗与本月结算预估') || dashboardSource.includes('最近发放') || dashboardSource.includes('本月预估')) {
  throw new Error('学生详情总览页不应再展示校园币发放、消耗或月预估信息。');
}
requireText(dashboardSource, 'onViewCampusCoins', '学生详情顶部资产区应保留查看明细入口回调。');
requireText(dashboardSource, 'B. Student Assets Band', '成长币余额应放在组合信息卡内部的资产带。');
requireText(dashboardSource, 'h-[var(--tm-student-detail-asset-height)]', '资产带应使用组件 Token 固定高度，避免内容变化引发布局跳动。');
requireText(dashboardSource, 'grid-cols-[var(--tm-student-detail-asset-label-width)_1px_minmax(0,1fr)_1px_minmax(0,1fr)_var(--tm-student-detail-asset-chevron-space)]', '成长币名称、两项等宽余额和箭头必须使用相互独立的栅格区域。');
requireText(tokenSource, "'--tm-student-detail-asset-label-width': '80px'", '成长币标题区应使用组件 Token 固定宽度。');
requireText(dashboardSource, 'text-sm font-semibold tabular-nums', '资产金额应使用 14px 半粗字重降低视觉重量。');
requireText(dashboardSource, 'tabular-nums text-[var(--tm-text-primary)]', '资产金额应使用主文字暖黑色，不重复使用奖励金文字色。');
requireText(dashboardSource, 'flex h-full items-center justify-center', '资产下钻箭头应使用独立固定宽度区域，不得挤压已存余额。');
if (dashboardSource.includes('absolute right-3')) {
  throw new Error('资产下钻箭头不应继续叠加在已存余额区域。');
}
requireText(dashboardSource, 'aria-label={`查看${GROWTH_COIN_TERMS.details}', '资产摘要条整行应提供完整的可访问下钻语义。');
if (dashboardSource.includes('明细 <ChevronRight')) {
  throw new Error('资产摘要条不应重复展示“明细”文字按钮。');
}
if (dashboardSource.includes('bg-blue-50 px-3 text-[11px] font-bold text-blue-600')) {
  throw new Error('查看明细操作不应使用蓝色强调按钮样式。');
}
requireText(dashboardSource, 'formatCoinAmount', '学生详情页金额应使用统一校园币格式化函数。');
requireText(dashboardSource, 'A. Student Profile Card', '学生信息卡应独立置顶。');
requireText(dashboardSource, 'Student Detail Navigation', '学生详情页应提供独立导航层。');
requireText(dashboardSource, 'aria-label="返回"', '学生详情独立导航层必须保留返回按钮。');
requireText(dashboardSource, '<ChevronLeft', '学生详情独立导航层应使用返回图标。');
requireText(dashboardSource, 'bg-[var(--tm-page-plain-header-bg)]', '学生详情标题栏应使用教师端纯白标题栏背景 Token。');
requireText(dashboardSource, '<h1 className=', '学生详情标题栏应使用页面主标题语义。');
requireText(dashboardSource, '<StudentDetailHeader title="学生详情"', '学生详情标题栏应显示“学生详情”。');
requireText(dashboardSource, 'text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]', '学生详情标题应居中并使用教师端标题字号与文字 Token。');
requireText(dashboardSource, '[padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]', '学生详情标题栏应避让微信右上角胶囊安全区。');
requireText(dashboardSource, 'h-[var(--tm-size-touch)] w-[var(--tm-size-touch)]', '学生详情返回按钮应保持 44 像素触控区域。');
requireText(dashboardSource, 'mx-4 mt-4 overflow-hidden rounded-[var(--tm-radius-card)]', '学生基本信息应与白色标题栏保持间距，并呈现为有左右留白的独立卡片。');
const studentProfileBackgroundToken = tokenSource.match(/'--tm-student-detail-profile-bg': ([^\n]+)/)?.[1] ?? '';
requireText(studentProfileBackgroundToken, 'var(--tm-bg-surface-glass)', '学生信息卡背景 Token 应继承教师端轻玻璃表面。');
if (dashboardSource.includes('mt-4 text-xs font-medium text-slate-500')) {
  throw new Error('学生状态不应单独占一行，应移动到姓名下方的信息标签组。');
}
if (dashboardSource.includes('BadgeCheck className="h-3 w-3"')) {
  throw new Error('学生顶部信息卡不应重复展示学籍状态标签，状态由独立管理行承载。');
}
if (dashboardSource.includes('w-full bg-white px-5 pb-5 pt-3')) {
  throw new Error('首个学生信息卡不应继续使用纯白背景。');
}
if (dashboardSource.includes('总资产') || dashboardSource.includes('totalCampusAssets')) {
  throw new Error('资产卡不应展示总资产，只展示成长币名称、可用、已存和查看明细。');
}
const studentCombinedCardSource = dashboardSource.slice(
  dashboardSource.indexOf('{/* A. Student Profile Card */}'),
  dashboardSource.indexOf('{/* 2. Scrollable Content */}'),
);
if (!studentCombinedCardSource.includes('GROWTH_COIN_TERMS.name') || !studentCombinedCardSource.includes('GROWTH_COIN_TERMS.available') || !studentCombinedCardSource.includes('GROWTH_COIN_TERMS.saved')) {
  throw new Error('成长币名称、可用和已存必须并入学生组合信息卡。');
}
const studentAssetBandSource = studentCombinedCardSource.slice(studentCombinedCardSource.indexOf('{/* B. Student Assets Band */}'));
if (studentAssetBandSource.includes('text-base font-bold') || studentAssetBandSource.includes('className="block')) {
  throw new Error('可用和已存应单行轻量展示，不得继续使用上下两行或大号粗体金额。');
}
if (studentAssetBandSource.includes('--tm-brand-reward-strong')) {
  throw new Error('金币图标已承担校园币语义，资产金额不应继续使用奖励金文字色。');
}
if (studentCombinedCardSource.includes('mx-4 mt-3') || studentCombinedCardSource.includes('[box-shadow:var(--tm-shadow-card)] active:bg')) {
  throw new Error('资产带不应继续保留独立卡片外间距或第二层阴影。');
}
requireText(dashboardSource, 'pt-[var(--mini-program-status-bar-height,0px)]', '学生详情导航应避让模拟手机状态栏。');
requireText(appSource, "contentTopInsetMode={currentView === 'student_detail' ? 'none' : 'status-bar'}", '学生详情应独立接管顶部安全区，其他页面保持原有状态栏内缩。');
requireText(dashboardSource, '<StudentTermSelector value={selectedTerm}', '成长报告必须使用学期选择器。');
requireText(termSelectorSource, '<StudentTimeRangeSelector', '学期筛选必须复用学生详情通用时间选择器。');
requireText(timeRangeSelectorSource, 'h-11 w-full', '时间选择器必须满足 44px 触控高度。');
requireText(timeRangeSelectorSource, 'bg-[var(--tm-bg-surface)]', '学生学期筛选必须使用白色表面。');
requireText(timeRangeSelectorSource, '[box-shadow:var(--tm-shadow-control)]', '学生学期筛选必须使用统一控件轻阴影。');
requireText(timeRangeSelectorSource, 'focus-visible:bg-[var(--tm-bg-surface)]', '学生学期筛选聚焦后必须保持白色表面。');
requireText(termSelectorSource, '（本学期）', '学期选择器必须明确当前学期。');
requireText(dashboardSource, "selectedTermOption.isCurrent ? '本学期' : '该学期'", '五育积分标题应根据当前选择的学期显示。');
if (dashboardSource.includes('>实时</span>')) {
  throw new Error('五育积分板块不应显示实时标签。');
}
requireText(dashboardSource, 'selectedTermOption', '评价记录页必须读取当前选择的学期数据。');
const evaluationSource = dashboardSource.slice(dashboardSource.indexOf('const renderEvaluationTab'), dashboardSource.indexOf('const renderReportTab'));
requireText(evaluationSource, '<StudentTermSelector value={selectedTerm}', '评价记录页必须提供学期筛选。');
requireText(evaluationSource, 'onChange={setSelectedTerm}', '评价记录页学期筛选必须更新详情页当前学期。');
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
  '--tm-chart-edu-virtue',
  '--tm-edu-virtue',
  '--tm-brand-reward-soft',
  '--tm-brand-primary-soft',
  '办理离校',
]) {
  requireText(dashboardSource, required, `学生详情页未完整接入新设计 Token：${required}`);
}
requireText(evaluationRecordsSource, '--tm-record-positive-bg', '评价记录卡片应使用正向记录 Token。');
requireText(evaluationRecordsSource, '--tm-record-negative-bg', '评价记录卡片应使用负向记录 Token。');
requireText(dashboardSource, 'showClassAvg', '五育能力模型应保留班级平均开关。');
requireText(evaluationSource, 'aria-expanded={showAbilityModel}', '五育积分摘要应提供可访问的能力模型展开入口。');
requireText(evaluationSource, 'showAbilityModel &&', '五育雷达图默认应折叠，避免下压评价记录。');
requireText(evaluationSource, '<FiveEducationRadar scores={currentScores}', '展开后必须复用现有五育雷达图。');
if (dashboardSource.includes('showFiveComparison') || dashboardSource.includes('班级对比')) {
  throw new Error('五育能力模型不应使用语义重复的班级对比入口。');
}
requireText(evaluationSource, '<StudentEvaluationRecordsView', '评价记录页必须直接展示评价记录列表。');
requireText(evaluationSource, 'embedded', '评价记录必须复用页内模式，避免复制筛选与列表逻辑。');
requireText(evaluationSource, 'selectedTerm={selectedTerm}', '评价记录必须跟随当前选择的学期。');
requireText(evaluationSource, 'onSelectRecord={(record) => {', '点击评价记录后必须渐进披露单条详情。');
requireText(evaluationSource, 'setActiveEvaluationRecordId(record.id);', '点击评价记录后必须保存当前记录用于详情抽屉。');
if (evaluationSource.includes('bodyGrowthMetrics') || evaluationSource.includes('onViewBodyMeasurements') || evaluationSource.includes('>成长数据<')) {
  throw new Error('评价记录页不应展示成长数据摘要或入口。');
}
if (dashboardSource.includes('上月对比') || dashboardSource.includes('showLastMonth') || dashboardSource.includes('年级平均')) {
  throw new Error('五育能力模型不应再展示上月对比或年级平均，应改为当前与班级平均。');
}
requireText(dashboardSource, "useState<'evaluation' | 'report'>", '学生详情一级页签只应保留评价记录和成长报告。');
requireText(dashboardSource, "initialSection = 'evaluation'", '学生详情应默认进入评价记录。');
if (dashboardSource.includes('>成长概览</span>') || dashboardSource.includes("activeTab === 'collection'")) {
  throw new Error('学生详情不应继续展示成长概览或采集记录一级页签。');
}
requireText(dashboardSource, '>评价记录</span>', '学生详情必须提供评价记录页签。');
requireText(dashboardSource, '成长报告', '学生详情必须保留成长报告页签。');
const studentDetailTabsSource = dashboardSource.slice(dashboardSource.indexOf('aria-label="学生详情内容"'), dashboardSource.indexOf('{/* D. Content Area */}'));
requireText(studentDetailTabsSource, 'text-[var(--tm-brand-primary)]', '学生详情一级页签选中态应使用标准主题红。');
if (studentDetailTabsSource.includes('text-[var(--tm-brand-primary-strong)]')) {
  throw new Error('学生详情一级页签不得继续使用偏深的强主题红。');
}
requireText(evaluationRecordsSource, '>评价记录</h3>', '学生详情必须保留评价记录板块。');
requireText(dashboardSource, "activeTab === 'evaluation' && renderEvaluationTab()", '实时五育积分和评价列表必须收敛到评价记录页签。');
requireText(dashboardSource, "activeTab === 'report' && renderReportTab()", '阶段报告必须收敛到成长报告页签。');
requireText(dashboardSource, 'title="评价详情"', '单条评价记录详情必须使用公共底部抽屉。');
requireText(dashboardSource, 'open={Boolean(activeEvaluationRecord)}', '评价详情抽屉应由当前选中的记录控制。');
requireText(dashboardSource, '<EvaluationRecordDetailContent record={activeEvaluationRecord} />', '评价详情抽屉必须复用通用详情内容。');
requireText(dashboardSource, 'initialRecordPage="edit"', '修改评价应从详情抽屉渐进披露到独立编辑页。');
requireText(dashboardSource, 'onBack={() => setShowEvaluationRecordEditor(false)}', '取消或保存修改后应回到同一条详情抽屉。');
if (dashboardSource.includes('if (activeEvaluationRecordId) {')) {
  throw new Error('点击单条评价记录后不应再切换为完整详情页。');
}
requireText(evaluationRecordsSource, 'record.evaluation_date >= activeTerm.startDate', '评价记录必须按所选学期过滤。');
requireText(evaluationRecordsSource, 'ariaLabel="筛选评价记录学期"', '评价记录二级页必须继承并允许切换学期。');
requireText(dashboardSource, 'showMoreActionsSheet', '学生详情应使用统一的更多操作抽屉收敛低频能力。');
requireText(dashboardSource, 'aria-label="更多学生操作"', '学生卡片顶部应保留可访问的更多操作入口。');
requireText(dashboardSource, 'onClick={() => setShowMoreActionsSheet(true)}', '更多入口应打开公共操作抽屉。');
requireText(dashboardSource, '<Ellipsis', '更多入口应使用标准三点图标。');
requireText(dashboardSource, 'id="student-resources-heading"', '更多操作抽屉应将下钻内容分组为学生资料。');
requireText(dashboardSource, 'id="student-enrollment-heading"', '更多操作抽屉应将当前状态分组为学籍状态。');
requireText(dashboardSource, '办理离校', '在校学生应在学籍状态分组中提供明确的办理离校操作。');
if (dashboardSource.includes('showEnrollmentManagement') || dashboardSource.includes('showStatusActionSheet')) {
  throw new Error('学籍状态已在更多操作中直接管理，不应再进入子页面或状态抽屉。');
}
requireText(dashboardSource, '<FolderOpen', '学生资料入口应使用文件夹图标表达资料语义。');
if (dashboardSource.includes('BookOpenCheck')) {
  throw new Error('学生成长档案入口不应继续使用语义含混的带勾书本图标。');
}
const studentCardStart = dashboardSource.indexOf('{/* A. Student Profile Card */}');
const studentCardEnd = dashboardSource.indexOf('{/* 2. Scrollable Content */}');
const moreActionIndex = dashboardSource.indexOf('aria-label="更多学生操作"');
if (moreActionIndex < studentCardStart || moreActionIndex > studentCardEnd) {
  throw new Error('学生卡片更多入口必须放在身份卡内部。');
}
requireText(dashboardSource, '<MobileBottomSheet', '学生更多操作必须复用公共底部抽屉。');
requireText(dashboardSource, 'title="更多操作"', '低频操作抽屉必须使用明确标题。');
requireText(dashboardSource, '>成长档案</span>', '更多操作抽屉必须保留成长档案入口。');
requireText(dashboardSource, '>采集记录</span>', '更多操作抽屉必须提供采集记录入口。');
requireText(dashboardSource, 'onOpenStudentArchive();', '成长档案入口必须进入现有档案页面。');
requireText(dashboardSource, 'setShowCollectionHistory(true)', '采集记录入口必须进入独立子页面。');
requireText(dashboardSource, '<StudentDetailHeader title="采集记录"', '采集记录子页面必须有明确标题和返回路径。');
requireText(dashboardSource, 'overflow-y-auto px-4 pb-safe pt-4 no-scrollbar', '采集记录筛选器与顶部标题栏之间应保留 16px 标准间距。');
requireText(dashboardSource, '<StudentCollectionHistoryTab', '采集记录子页面必须复用独立业务组件。');
requireText(collectionHistorySource, '<MobileEmptyState', '采集记录空状态应复用教师手机端公共缺省组件。');
requireText(collectionHistorySource, 'ASSETS.DEFAULT_STATE.WORRIED_CLIPBOARD', '采集记录为空时应使用担忧清单长颈鹿缺省图。');
if (collectionHistorySource.includes('<ClipboardCheck')) {
  throw new Error('采集记录空状态不应继续使用临时剪贴板图标。');
}
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
requireText(basicEditSource, 'student-avatar-card', '学生头像应作为独立卡片展示。');
requireText(basicEditSource, 'student-profile-fields-card', '姓名、性别、学号、出生日期和所在班级应归入同一张资料卡。');
requireText(basicEditSource, 'student-guardian-card', '家长联系方式应作为独立卡片展示。');
const studentAvatarCardSource = basicEditSource.slice(
  basicEditSource.indexOf('student-avatar-card'),
  basicEditSource.indexOf('student-profile-fields-card'),
);
const studentProfileFieldsCardSource = basicEditSource.slice(
  basicEditSource.indexOf('student-profile-fields-card'),
  basicEditSource.indexOf('student-guardian-card'),
);
for (const field of ['姓名', '性别', '学号', '出生日期', '所在班级']) {
  requireText(studentProfileFieldsCardSource, field, `学生资料卡缺少字段：${field}`);
}
requireText(studentProfileFieldsCardSource, '>基础资料</h2>', '基础资料卡应展示与家长联系方式一致的分组标题。');
if (studentProfileFieldsCardSource.includes('<IconBadge')) {
  throw new Error('基础资料卡标题不应增加装饰性图标。');
}
requireText(studentProfileFieldsCardSource, 'grid-cols-[72px_minmax(0,1fr)]', '基础资料字段应采用左侧标签、右侧值的紧凑结构。');
requireText(studentProfileFieldsCardSource, 'divide-y divide-[var(--tm-border-subtle)]', '基础资料字段之间应保留浅色单边分隔线。');
requireText(studentProfileFieldsCardSource, '<MobileEditableRow', '基础资料可编辑字段应复用手机端统一字段行按压状态。');
if (studentProfileFieldsCardSource.includes('<input')) {
  throw new Error('基础资料卡不应常驻文字或日期输入框，应通过字段弹窗渐进编辑。');
}
requireText(studentProfileFieldsCardSource, "openFieldEditor('name')", '点击姓名整行应进入字段编辑弹窗。');
requireText(studentProfileFieldsCardSource, "openFieldEditor('studentNo')", '点击学号整行应进入字段编辑弹窗。');
requireText(studentProfileFieldsCardSource, "openFieldEditor('birthDate')", '点击出生日期整行应进入字段编辑弹窗。');
requireText(studentProfileFieldsCardSource, "formatBirthDate(draft.birthDate)", '出生日期应使用中文日期或未设置状态展示。');
if ((studentProfileFieldsCardSource.match(/<ChevronRight/g) ?? []).length < 4) {
  throw new Error('姓名、学号、出生日期和所在班级都应通过右箭头表达下钻编辑。');
}
if (studentAvatarCardSource.includes('姓名') || studentAvatarCardSource.includes('所在班级')) {
  throw new Error('头像独立卡片不应混入基础资料字段。');
}
requireText(studentAvatarCardSource, 'h-24 w-24', '学生头像卡应复用教师个人信息页的头像尺寸。');
requireText(studentAvatarCardSource, 'bg-[var(--tm-brand-primary)]', '学生头像卡应使用与教师个人信息一致的相机角标。');
requireText(basicEditSource, 'bg-[var(--tm-bg-page)] font-sans', '学生基础信息编辑页应使用与教师个人信息编辑页一致的页面底色。');
requireText(basicEditSource, 'bg-[var(--tm-page-plain-header-bg)] px-4', '学生基础信息编辑页标题栏应保持纯白，与浅灰内容区形成分层。');
if (basicEditSource.includes('overflow-hidden bg-transparent font-sans')) {
  throw new Error('学生基础信息编辑页不应继续透出应用外层纯白背景。');
}
if (basicEditSource.includes('border-white/40 bg-white/38')) {
  throw new Error('学生基础信息编辑页标题栏不应使用半透明白色。');
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
requireText(basicEditSource, 'open={showClassPicker}', '所在班级应使用底部弹窗承载级联选择。');
requireText(basicEditSource, 'title="选择班级"', '班级选择弹窗应使用明确标题。');
requireText(basicEditSource, 'onClick={() => selectClass(item)}', '点击具体班级后应立即应用选择。');
requireText(basicEditSource, 'setToastMessage(`已调整至${formatCompactClassName(item.name)}`)', '换班成功后应提供轻量结果反馈。');
requireText(basicEditSource, 'aria-label={`选择所在班级，当前${formatCompactClassName(draft.class)}`}', '所在班级入口应整行可点击并说明当前值。');
if (basicEditSource.includes('>更换</span>') || basicEditSource.includes('toggleClassPicker')) {
  throw new Error('所在班级入口不应保留“更换”文案或页内展开逻辑。');
}
if (basicEditSource.includes('确认换班') || basicEditSource.includes('确认调整班级')) {
  throw new Error('换班选择后应直接生效，不应增加二次确认。');
}
requireText(basicEditSource, '添加联系方式', '基础信息编辑页应支持新增多个家长联系方式。');
requireText(basicEditSource, 'removeContact', '基础信息编辑页应支持删除家长联系方式。');
requireText(typesSource, "export type GuardianRelation = '家长' | '爸爸' | '妈妈' | '爷爷' | '奶奶' | '外公' | '外婆' | '其他';", '学生基础信息应定义家长关系选项。');
requireText(typesSource, 'guardianContacts?: GuardianContact[];', 'Student 类型应包含家长联系方式结构。');
requireText(basicEditSource, "const guardianRelationOptions: GuardianRelation[] = ['家长', '爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '其他'];", '基础信息编辑页应提供家长关系选择。');
requireText(basicEditSource, "contact.relation === '其他'", '选择其他关系时应显示自定义关系输入框。');
requireText(basicEditSource, 'confirmSystemAvatar', '基础信息编辑页应确认系统头像后再写入学生资料。');
if (basicEditSource.includes('保存基础信息')) {
  throw new Error('基础信息编辑页采用实时生效，不应保留底部保存按钮。');
}
requireText(basicEditSource, 'onChange(normalizedStudent)', '基础信息字段校验通过后应独立更新学生资料。');
requireText(basicEditSource, "setToastMessage('保存失败，请重试')", '独立保存失败后应提供可执行的重试提示。');
requireText(basicEditSource, 'restoreLastPersistedDraft', '独立保存失败后应回滚到最近一次成功数据。');
requireText(appSource, 'onChange={handleChangeStudentBasicInfo}', 'App 应接收基础信息页的实时更新。');
if (basicEditSource.includes('onSave')) {
  throw new Error('基础信息编辑组件不应继续暴露整页保存回调。');
}
requireText(basicEditSource, 'open={editingField !== null}', '姓名、学号和出生日期应复用同一个字段编辑弹窗。');
requireText(basicEditSource, 'disabled={!canSaveField}', '字段未变化或不合法时不得提交。');
requireText(basicEditSource, 'onClick={saveField}', '字段弹窗确认后应独立保存当前字段。');
requireText(basicEditSource, 'focus:ring-[var(--tm-input-focus-ring)]', '字段弹窗输入框应使用透明的输入焦点令牌，不得使用主题色填充。');
requireText(basicEditSource, 'getContactValidationErrors', '家长联系方式保存前必须分别校验手机号和关系。');
requireText(basicEditSource, "errors.phone = '该手机号已添加'", '新增或编辑联系方式时应阻止保存重复手机号。');
requireText(basicEditSource, 'guardian-phone-error', '手机号错误应就近关联到手机号字段。');
requireText(basicEditSource, 'guardian-relation-other-error', '具体关系错误应就近关联到具体关系字段。');
requireText(basicEditSource, "relationOther: relation === '其他' ? previous.relationOther : ''", '从其他关系切回预设关系时应清理无效的具体关系数据。');
requireText(basicEditSource, 'open={contactSheetOpen}', '新增与编辑联系方式应复用同一个底部弹窗。');
requireText(basicEditSource, 'contactSheetMode !== null && deleteContactIndex === null', '删除确认打开时应暂时隐藏编辑弹窗，避免叠加两个焦点陷阱。');
requireText(basicEditSource, "contactSheetMode === 'edit' ? '编辑联系方式' : '添加联系方式'", '联系方式弹窗应根据新增或编辑状态展示对应标题。');
requireText(basicEditSource, 'openEditContact(index)', '点击已有联系方式应进入编辑弹窗。');
requireText(basicEditSource, 'disabled={!canSaveContact}', '联系方式填写不完整时不得保存。');
requireText(basicEditSource, 'formatGuardianPhone(contact.phone)', '联系方式列表应隐藏手机号中间四位。');
requireText(basicEditSource, 'onClick={requestDeleteContact}', '删除入口应收敛在联系方式编辑弹窗中。');
requireText(basicEditSource, 'border border-[var(--tm-brand-primary)] bg-[var(--tm-bg-surface)]', '添加按钮应使用主题色边框和白色底。');
requireText(basicEditSource, '添加\n                </span>', '联系方式卡片按钮名称应简化为“添加”。');
requireText(basicEditSource, 'className={relationSelectClass}', '关系选择应使用明确的可编辑样式。');
requireText(basicEditSource, 'appearance-none', '关系选择应覆盖移动端原生置灰外观。');
requireText(basicEditSource, '[-webkit-text-fill-color:var(--tm-text-primary)] opacity-100', '关系选择文字应保持主文字色和正常透明度。');
const guardianCardSource = basicEditSource.slice(
  basicEditSource.indexOf('student-guardian-card'),
  basicEditSource.indexOf('<MobileBottomSheet', basicEditSource.indexOf('student-guardian-card')),
);
if (guardianCardSource.includes('<IconBadge')) {
  throw new Error('家长联系方式卡标题不应增加装饰性图标。');
}
requireText(guardianCardSource, 'className="group flex h-11 items-center justify-center"', '联系方式添加按钮应保留 44 像素触控高度。');
requireText(guardianCardSource, 'className="flex h-7 items-center gap-1', '联系方式添加按钮的可见描边高度应收敛为 28 像素。');
requireText(guardianCardSource, 'grid-cols-[72px_minmax(0,1fr)]', '联系方式应与基础资料复用左侧标签、右侧值的两列结构。');
requireText(guardianCardSource, 'className={compactLabelClass}>{getGuardianRelationLabel(contact)}</span>', '联系方式关系应使用灰色标签层级。');
requireText(guardianCardSource, 'tabular-nums text-[var(--tm-text-primary)]', '联系方式手机号应使用黑色主信息层级。');
requireText(guardianCardSource, 'divide-y divide-[var(--tm-border-subtle)]', '联系方式子项之间应保留浅色单边分隔线。');
requireText(guardianCardSource, '<MobileEditableRow', '联系方式应复用手机端统一字段行按压状态。');
if (guardianCardSource.includes('<input') || guardianCardSource.includes('<select')) {
  throw new Error('家长联系方式卡片应保持只读，编辑控件应收敛到底部弹窗。');
}
requireText(basicEditSource, 'open={deleteContactIndex !== null}', '删除已有联系方式前必须打开确认弹窗。');
requireText(basicEditSource, 'onConfirm={removeContact}', '确认后才可删除已有联系方式。');
requireText(basicEditSource, 'formatGuardianPhone(deletingContact.phone)', '删除确认应展示正在删除的脱敏手机号。');
requireText(basicEditSource, '删除后，该手机将无法查看学生报告', '删除联系方式确认文案应说明学生报告访问影响。');
requireText(basicEditSource, '暂无联系方式', '删除最后一条联系方式后应展示真实空状态。');
requireText(basicEditSource, 'h-full min-h-0 overflow-hidden', '基础信息编辑子页面应使用手机壳内高度，避免底部按钮裁切。');
requireText(basicEditSource, 'StudentBasicEditView', '基础信息编辑页应独立封装。');
requireText(basicEditSource, "max={editingField === 'birthDate' ? maxBirthDate : undefined}", '出生日期弹窗不得允许选择未来日期。');
requireText(basicEditSource, "return '未设置';", '出生日期为空时应显示未设置，不展示浏览器年月日占位。');
requireText(basicEditSource, 'aria-pressed={draft.gender === option.value}', '性别选中状态应能被辅助技术识别。');
requireText(basicEditSource, 'aria-pressed={classPickerYear === year}', '班级年份选中状态应能被辅助技术识别。');
requireText(basicEditSource, 'h-11 w-11 items-center justify-center', '标题栏返回按钮应满足 44 像素最小触控尺寸。');
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

for (const required of ['收入', '支出', '${GROWTH_COIN_TERMS.name}收支记录', 'GROWTH_COIN_TERMS.details']) {
  requireText(coinDetailSource, required, `校园币详情页缺少收支流水能力：${required}`);
}
requireText(coinDetailSource, 'CampusCoinDetail', '校园币详情页应使用校园币详情类型。');
requireText(coinDetailSource, 'issueRecords.map', '校园币详情页应展示发放流水列表。');
requireText(coinDetailSource, 'consumeRecords.map', '校园币详情页应展示消耗流水列表。');
requireText(coinDetailSource, 'line-clamp-2', '校园币流水标题和说明应至少支持两行展示。');
requireText(coinDetailSource, 'activeFilter', '校园币详情页应参考货柜机流水明细提供收支筛选。');
requireText(coinDetailSource, 'activeCategory', '校园币详情页应参考货柜机流水明细提供类型筛选。');
requireText(coinDetailSource, 'formatCoinAmount', '校园币详情页金额应使用统一校园币格式化函数。');
requireText(coinDetailSource, "type FlowFilter = 'income' | 'expense'", '校园币流水一级页签只应保留收入和支出。');
requireText(coinDetailSource, 'categoryOptionsByFilter', '校园币收入和支出应分别维护各自的分类按钮。');
requireText(coinDetailSource, 'aria-label="筛选流水年份"', '校园币年份应使用独立下拉筛选。');
requireText(coinDetailSource, '<select', '校园币年份筛选应支持大量年份选项。');
requireText(coinDetailSource, 'ariaLabel="按收支类型筛选"', '收入和支出筛选必须保留明确的按钮组标签。');
requireText(coinDetailSource, 'semantics="group"', '收入和支出属于过滤条件，应使用按钮组语义。');
requireText(compactSegmentSource, "aria-pressed={semantics === 'group' ? selected : undefined}", '收入和支出筛选按钮应通过共享控件暴露选中状态。');
if (coinDetailSource.includes('role="tablist"') || coinDetailSource.includes('role="tab"')) {
  throw new Error('校园币收入和支出是过滤条件，不应误用内容页签语义。');
}
requireText(coinDetailSource, 'new Date().getFullYear()', '校园币年份不应写死，应跟随当前年份和现有记录动态生成。');
if (coinDetailSource.includes('showFilterSheet') || coinDetailSource.includes('<MobileBottomSheet')) {
  throw new Error('校园币分类和年份筛选已前置，不应继续保留筛选抽屉。');
}
requireText(coinDetailSource, '<MobileEmptyState', '校园币筛选无结果时应复用公共缺省组件。');
requireText(coinDetailSource, 'ASSETS.DEFAULT_STATE.MAGNIFIER', '校园币筛选无结果时应使用搜索无结果缺省图。');
requireText(coinDetailSource, 'grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]', '成长币资产摘要应保持可用与已存等分，并支持长金额收缩。');
requireText(coinDetailSource, 'groupedFlowItems', '校园币流水应按月份分组。');
requireText(coinDetailSource, 'divide-y divide-[var(--tm-border-subtle)]', '同月流水应使用连续列表与分隔线组织。');
requireText(textSelectionSource, 'min-h-[var(--tm-selection-touch-height)]', '校园币分类按钮应使用选择控件触控尺寸 Token，且不低于 44px。');
if (coinDetailSource.includes('学期')) {
  throw new Error('校园币是持续资产，不应使用学期筛选。');
}
for (const required of [
  'settlementEstimate',
  '本周预计可得',
  '本月预计可得',
  '阳光保底',
  '排名奖励',
  '学校暂未开启自动发放',
]) {
  requireText(coinDetailSource, required, `校园币详情缺少结算预估信息：${required}`);
}
requireText(coinDetailSource, 'GROWTH_COIN_TERMS.name', '可用、已存与结算预估应组成明确的成长币板块。');
requireText(coinDetailSource, '收支明细', '流水筛选和列表应归入明确的收支明细板块。');
requireText(coinDetailSource, 'text-[length:var(--tm-font-size-body)] font-semibold leading-none tabular-nums', '预计可得属于预测值，应使用14px半粗字重。');
requireText(coinDetailSource, 'text-[length:var(--tm-font-size-card-title)] font-semibold tabular-nums', '可用和已存属于已确认资产，应使用15px半粗字重。');

for (const required of ["name: '成长币'", "available: '可用'", "saved: '已存'", "details: '成长币明细'"]) {
  requireText(growthCoinTerminologySource, required, `教师手机端缺少统一成长币术语：${required}`);
}
requireText(coinDetailSource, 'text-[length:var(--tm-font-size-card-title)] font-semibold leading-none tabular-nums', '单笔流水金额应与流水标题保持15px半粗层级。');
for (const oversizedAmountToken of ['--tm-font-size-metric', '--tm-font-size-group-title']) {
  if (coinDetailSource.includes(oversizedAmountToken)) {
    throw new Error(`校园币金额不应继续使用大号统计或组标题字号：${oversizedAmountToken}`);
  }
}
requireText(coinDetailSource, 'bg-[var(--tm-brand-reward-soft)]', '结算预估与收入流水图标应使用浅金表面建立校园币语义。');
requireText(coinDetailSource, "item.type === 'income' ? 'bg-[var(--tm-brand-reward-soft)]' : 'bg-[var(--tm-brand-primary-soft)]'", '流水图标应按收入和支出使用有限的语义色。');
requireText(coinDetailSource, 'overflow-y-auto bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-space-4)]', '校园币明细应使用浅灰页面底承托白色内容卡片。');
requireText(coinDetailSource, 'id="coin-overview-title" className="flex min-h-[var(--tm-size-touch)] items-center px-[var(--tm-space-4)]', '账户概览标题应纳入账户卡片头部。');
requireText(coinDetailSource, 'overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]', '账户资产与结算预估应组成一张由浅灰页面承托的语义卡片。');
requireText(coinDetailSource, 'p-[var(--tm-space-2)] pb-[var(--tm-space-4)] [box-shadow:var(--tm-shadow-card)]', '收支卡应以 8px 内缩匹配 20px 外圆角与 12px 控件圆角。');
requireText(coinDetailSource, 'className="flex min-h-[var(--tm-size-touch)] items-center justify-between px-[var(--tm-space-2)]">\n                <h2 id="coin-flow-title"', '收支明细标题和年份筛选应纳入同一卡片头部，并与流水内容保持 16px 视觉对齐。');
requireText(coinDetailSource, 'flex min-h-[var(--tm-size-touch)] items-center justify-between gap-[var(--tm-space-3)]', '结算预估应使用单行横向摘要，减少板块占高。');
requireText(coinDetailSource, 'bg-[var(--tm-filter-bg)]', '年份筛选的默认和有值状态应使用透明筛选表面 Token。');
requireText(coinDetailSource, 'border-[var(--tm-filter-border)]', '年份筛选不应显示容器边界。');
requireText(coinDetailSource, '[box-shadow:var(--tm-filter-shadow)]', '年份筛选不应显示容器阴影。');
requireText(coinDetailSource, 'focus-visible:bg-[var(--tm-filter-focus-bg)]', '年份筛选激活时应继续使用透明筛选表面 Token。');
requireText(coinDetailSource, '[outline:var(--tm-filter-focus-outline)]', '年份筛选应通过手机端筛选 Token 明确取消激活描边。');
const coinYearSelect = coinDetailSource.match(/<select[\s\S]*?<\/select>/)?.[0] ?? '';
if (coinYearSelect.includes('focus-visible:ring')) {
  throw new Error('手机端年份下拉聚焦时不应增加描边或焦点环。');
}
requireText(compactSegmentSource, 'rounded-[var(--tm-radius-control)] bg-[var(--tm-selection-segment-track-bg)]', '收入和支出按钮的焦点边界应匹配分段控件圆角。');
requireText(compactSegmentSource, 'transition-[background-color,color,box-shadow]', '收入和支出选中态只应过渡实际变化的属性。');
requireText(compactSegmentSource, 'active:scale-[0.96]', '校园币分段控件应提供克制的手机端按压反馈。');
if (coinDetailSource.includes('] transition [transition-duration:')) {
  throw new Error('校园币页面不得使用监听全部属性的 transition 简写。');
}
requireText(coinDetailSource, 'className="divide-y divide-[var(--tm-border-subtle)]"', '月度流水应在白色板块内使用连续列表。');
if (coinDetailSource.includes('divide-y divide-[var(--tm-border-subtle)] overflow-hidden rounded-[var(--tm-radius-card)]')) {
  throw new Error('通栏白色收支板块内不应继续嵌套月度流水卡片。');
}
for (const redundantGrayBand of [
  'id="coin-overview-title" className="-mx-[var(--tm-space-4)]',
  'items-center justify-between bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-space-4)]',
]) {
  if (coinDetailSource.includes(redundantGrayBand)) {
    throw new Error('校园币明细不应继续使用通栏浅灰标题带切割页面。');
  }
}
for (const redundantSettlementText of ['estimateDateLabel', 'settlementLabel', '每周一结算', '每月1日结算']) {
  if (coinDetailSource.includes(redundantSettlementText)) {
    throw new Error(`结算预估不应展示低频结算时间信息：${redundantSettlementText}`);
  }
}
requireText(coinDetailSource, 'mt-[var(--tm-space-4)]', '两张一级卡片应通过紧凑且稳定的灰底间距建立板块层级。');
requireText(coinDetailSource, '--tm-size-touch', '校园币页面控件应使用统一触控尺寸 Token。');
requireText(coinDetailSource, '--tm-duration-fast', '校园币页面交互动效应使用统一时长 Token。');
requireText(coinDetailSource, '--tm-focus-ring', '校园币非输入控件应保留可见的键盘焦点样式。');
if (coinDetailSource.includes('focus-visible:ring-offset-2')) {
  throw new Error('校园币年份下拉不应增加品牌色描边或外环。');
}
requireText(coinDetailSource, 'motion-reduce:transition-none', '校园币页面过渡应尊重减少动态效果设置。');
for (const hardcodedClass of ['min-h-11', 'text-[14px]', 'text-[13px]', 'text-lg']) {
  if (coinDetailSource.includes(hardcodedClass)) {
    throw new Error(`校园币页面不应继续使用可由 Token 替代的硬编码样式：${hardcodedClass}`);
  }
}
if (coinDetailSource.includes('gradient') || coinDetailSource.includes('--tm-brand-reward-strong')) {
  throw new Error('结算预估不应使用渐变或大面积奖励色文字。');
}
if (coinDetailSource.includes('mb-1 truncate text-base') || coinDetailSource.includes('truncate text-xs font-bold')) {
  throw new Error('校园币流水不应继续强制单行截断标题和来源。');
}

requireText(coinFormatSource, 'maximumFractionDigits: 2', '校园币金额最多保留 2 位小数。');
requireText(coinFormatSource, 'minimumFractionDigits: 0', '校园币金额小数为 0 时不应展示小数位。');
