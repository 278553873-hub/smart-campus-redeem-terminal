import fs from 'node:fs';
import assert from 'node:assert/strict';
import { formatGrowthAwardDetail, getGrowthCoinFlowDetail, toGrowthCoinExpenseFlow } from '../../shared/growthCoinFlow.ts';
import { getStudentGrowthTrend } from '../domain/studentDetailGrowth.ts';
import { CURRENT_STUDENT_TERM, STUDENT_TERM_OPTIONS } from '../domain/studentTerms.ts';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const appSource = read('../App.tsx');
const typesSource = read('../types.ts');
const constantsSource = read('../constants.ts');
const dashboardSource = read('./DashboardView.tsx');
const overviewSource = read('../components/student-detail/StudentDetailOverview.tsx');
const overviewStyles = read('../components/student-detail/StudentDetailOverview.css');
const timelineSource = read('../components/student-detail/StudentDetailTimeline.tsx');
const growthChartSource = read('../components/student-detail/StudentDetailGrowthChart.tsx');
const dashboardStyles = read('./DashboardView.css');
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
const coinFlowSource = read('../../shared/growthCoinFlow.ts');
const coinDemoSource = read('../../shared/demoGrowthCoinFlow.ts');
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
requireText(coinDemoSource, "category: 'growth_award'", '成长嘉奖流水应使用明确分类，不根据文案猜测。');
requireText(coinDemoSource, "startDate: '2025-12-29', endDate: '2026-01-04'", 'Mock 数据应直接展示跨年成长嘉奖边界。');
requireText(coinFlowSource, "start.year !== end.year", '成长嘉奖跨年时应展示完整年份。');
assert.equal(formatGrowthAwardDetail({ type: 'weekly', startDate: '2026-10-26', endDate: '2026-11-01' }), '每周奖励（10月26日—11月1日）');
assert.equal(formatGrowthAwardDetail({ type: 'monthly', month: '2026-10' }), '每月奖励（2026年10月）');
requireText(coinDetailSource, 'item.categoryLabel', '校园币流水第一层应展示分类。');
requireText(coinDetailSource, 'item.detail', '校园币流水第二层应展示明细。');
requireText(coinDetailSource, 'formatCampusCoinFlowTime(item.time)', '校园币流水第三层应独立展示时间。');
assert.equal(getGrowthCoinFlowDetail(toGrowthCoinExpenseFlow({ id: 'exchange', category: 'vending_exchange', productName: '铅笔', quantity: 3, amount: 30, time: '2026-10-26 09:35' })), '铅笔');

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
requireText(appSource, 'currentView !== \'student_detail\'', '学生详情应独立管理顶部区域，App 不为此页面渲染通用标题栏。');
requireText(appSource, 'onBack={goBack}', '学生详情页必须保留返回能力。');
requireText(appSource, "'student_detail'", '学生详情页应具备独立沉浸背景判断。');
requireText(appSource, 'TeacherMobileScreenBackground', '应提供教师手机端公共屏幕背景组件。');
requireText(appSource, "'student_detail', 'student_archive'", '学生详情页应纳入屏幕级背景页面集合。');
const plainBackgroundList = appSource.match(/const PLAIN_BACKGROUND_VIEWS: ViewState\[\] = \[([^\]]+)\]/)?.[1] ?? '';
requireText(plainBackgroundList, "'student_detail'", '学生详情子页面应继续使用纯白标题栏、浅灰内容区背景。');
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
requireText(dashboardStyles, '.student-detail-page[data-overview]', '暖色主题应只用于学生详情首页。');
requireText(appSource, "hasPlainBackground ? 'z-[2]' : 'z-auto'", '学生详情内容层必须高于纯白标题背景，避免返回、档案和学籍入口被遮挡。');
requireText(appSource, "'student_collection_detail'", 'App 路由应包含学生采集记录详情页。');
requireText(appSource, 'getCompletedStudentCollectionHistory(', '学生详情必须从问卷数据层读取已完成采集记录。');
requireText(appSource, '<StudentCollectionRecordDetailView', '点击采集记录后必须进入独立详情页。');
requireText(appSource, "setStudentDetailInitialSection('collection')", '从采集详情返回后应保持在采集记录子页面。');
requireText(appSource, "setStudentDetailInitialSection('evaluation')", '从学生列表进入详情时应使用学生概况默认入口。');
if (appSource.includes("setStudentDetailInitialSection('overview')") || appSource.includes("setStudentDetailInitialSection('growth')")) {
  throw new Error('学生详情入口不应继续写入已移除的成长概览页签。');
}

requireText(dashboardSource, 'onEditBasicInfo', '学生详情总览应接收基础信息编辑入口。');
const scrollHandledViews = appSource.match(/const viewHandlesScroll = [^\n]*?\[([^\]]+)\]/)?.[1] ?? '';
requireText(scrollHandledViews, "'student_detail'", '学生详情页应在手机屏幕内自行管理滚动。');
requireText(scrollHandledViews, "'student_initial_imaging_report'", '初成像报告页应使用嵌入页面自身滚动。');
requireText(dashboardSource, 'relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent', '学生详情根容器应占满屏幕并容纳独立滚动区域。');
requireText(dashboardSource, 'min-h-0 flex-1 overflow-y-auto pb-safe no-scrollbar', '学生详情内容应独立滚动，避免底部抽屉挂到长页面底部。');
requireText(dashboardSource, '<StudentDetailOverview', '学生详情首页应通过独立组件展示资料和快捷入口。');
requireText(overviewSource, '编辑信息', '资料卡右上角应展示编辑信息入口。');
requireText(overviewSource, 'onClick={onEdit} className="student-detail-profile-edit"', '编辑信息应打开现有资料编辑页。');
requireText(overviewSource, '<StudentDetailProfileGlass />', '资料卡应使用独立的连续轮廓。');
assert.doesNotMatch(overviewStyles, /\.student-detail-profile-surface::(?:before|after)/, '前层卡面不应由两块底色拼接。');
assert.match(overviewStyles, /\.student-detail-profile-avatar-frame\s*\{[^}]*width:/, '头像应有独立的尺寸限制。');
assert.match(overviewStyles, /\.student-detail-profile-edit\s*\{[^}]*justify-content:\s*flex-end/, '编辑信息和箭头应在右上编辑区内靠右对齐。');
assert.match(overviewStyles, /\.student-detail-profile-metrics\s*\{[^}]*grid-template-columns:\s*repeat\(3,/, '资料卡应等分为三列统计。');
requireText(overviewSource, 'student.studentNo || student.id', '学生详情应优先显示实际学号。');
requireText(dashboardSource, 'formatCompactClassName', '学生详情应在无班级数据时格式化学生班级名称。');
const metricsSource = overviewSource.match(/const metrics = \[([\s\S]*?)\];/)?.[1] ?? '';
requireText(metricsSource, 'label: coinTerms.name', '资料卡应使用学校配置的成长币名称。');
requireText(metricsSource, 'value: coinBalance', '资料卡应展示可用成长币余额。');
requireText(metricsSource, 'onOpen: onOpenCoins', '点击成长币统计应进入明细。');
requireText(metricsSource, "label: '档案', value: archiveCount, onOpen: onOpenArchive", '档案统计应显示实际数量并可进入档案。');
requireText(metricsSource, "label: '问卷', value: questionnaireCount, onOpen: onOpenQuestionnaires", '问卷统计应显示实际数量并可进入问卷记录。');
assert.doesNotMatch(metricsSource, /总分|奖章|totalScore|medalCount/, '资料卡统计区应只展示成长币、档案、问卷。');
requireText(dashboardSource, 'onOpenMedals={onViewMedals}', '奖章快捷入口应使用教师端页面导航。');
requireText(appSource, "navigateTo('student_medal_detail')", '奖章快捷入口应进入独立的奖章明细页。');
assert.match(appSource, /\{isStudentMedalDetailView\s*&&\s*\(\s*<StudentMedalDetailView\b[^>]*onBack=\{goBack\}/, '奖章明细应使用学生详情的返回历史。');
assert.doesNotMatch(dashboardSource, /showMedals|title="学生奖章"/, '学生详情不得通过弹窗展示奖章明细。');
requireText(overviewSource, 'campusCoinDetail.balance', '首页成长币卡应读取可用余额。');
requireText(overviewSource, 'formatCoinAmount', '成长币金额应使用统一格式化函数。');
requireText(overviewSource, 'useGrowthCoinTerms', '成长币入口应使用学校配置的货币名称。');
const shortcutsSource = overviewSource.slice(overviewSource.indexOf('className="student-detail-shortcuts"'));
assert.doesNotMatch(shortcutsSource, /<img\b|GrowthCoinIcon/, '快捷入口的玻璃素材应作为装饰背景，名称、数量和箭头由页面渲染。');
requireText(shortcutsSource, 'onClick={onOpenMedals}', '奖章快捷入口应打开奖章明细。');
assert.doesNotMatch(shortcutsSource, /onOpenCoins|coinBalance/, '成长币入口应位于资料卡统计区。');
const shortcutStyle = overviewStyles.match(/\.student-detail-shortcut\s*\{([^}]+)\}/)?.[1] ?? '';
requireText(shortcutStyle, 'min-height: calc(var(--tm-size-touch) + var(--tm-space-4))', '快捷入口应为两行内容和触控区域预留高度。');
assert.match(overviewStyles, /\.student-detail-shortcut-copy\s*\{[^}]*grid-area:\s*1 \/ 1;/, '快捷入口的名称和数量应使用独立文字列。');
assert.match(overviewStyles, /\.student-detail-shortcut::before\s*\{[^}]*grid-area:\s*1 \/ 2;/, '玻璃素材应使用独立列，避免覆盖数量。');
requireText(overviewSource, 'onClick={onOpenReports}', '成长报告卡应可进入报告目录。');
requireText(dashboardSource, 'onOpenCoins={onViewCampusCoins}', '学生详情应接入现有成长币明细。');
assert.match(dashboardSource, /\{!isOverview\s*&&\s*\(\s*<StudentDetailHeader\b/, '学生详情子页面保留标题栏。');
const overviewCall = dashboardSource.match(/<StudentDetailOverview\b[\s\S]*?onBack=\{onBack\}/)?.[0] ?? '';
requireText(overviewCall, 'onBack={onBack}', '学生资料卡应承接首页返回操作。');
assert.match(overviewSource, /<button\b[^>]*onClick=\{onBack\}[^>]*aria-label="返回"/, '学生资料卡必须有可访问的返回按钮。');
assert.match(overviewSource, /<h1\b[^>]*id="student-detail-profile-name"/, '学生姓名应成为首页的主标题。');
requireText(dashboardStyles, '--mini-program-status-bar-height', '资料卡上方应避让模拟手机状态栏。');
const overviewBackStyle = overviewStyles.match(/\.student-detail-profile-back\s*\{([^}]+)\}/)?.[1] ?? '';
requireText(overviewBackStyle, 'width: var(--tm-size-touch)', '学生详情返回按钮应保持44像素触控宽度。');
requireText(overviewBackStyle, 'height: var(--tm-size-touch)', '学生详情返回按钮应保持44像素触控高度。');
requireText(dashboardStyles, '--mini-program-status-bar-height', '学生详情首页应避让模拟手机状态栏。');
requireText(appSource, "currentView === 'student_detail' || isStudentMedalDetailView ? 'none' : 'status-bar'", '学生详情和奖章明细应独立管理顶部安全区。');
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
requireText(dashboardSource, 'width={Math.max(28, String(s.score).length * 8 + 12)}', '当前分值底色标签应适应负分与多位积分。');
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
requireText(evaluationRecordsSource, '--tm-record-positive-text', '评价记录正分应使用统一文字色。');
requireText(evaluationRecordsSource, '--tm-record-negative-text', '评价记录负分应使用统一文字色。');
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
requireText(evaluationSource, 'onSelectRecord={openEvaluationRecord}', '全部评价点击记录后应打开对应详情。');
requireText(dashboardSource, 'setActiveEvaluationRecordId(record.id);', '选择评价后应保存记录编号。');
if (evaluationSource.includes('bodyGrowthMetrics') || evaluationSource.includes('onViewBodyMeasurements') || evaluationSource.includes('>成长数据<')) {
  throw new Error('评价记录页不应展示成长数据摘要或入口。');
}
if (dashboardSource.includes('上月对比') || dashboardSource.includes('showLastMonth') || dashboardSource.includes('年级平均')) {
  throw new Error('五育能力模型不应再展示上月对比或年级平均，应改为当前与班级平均。');
}
assert.match(dashboardSource, /<StudentDetailGrowthChart\s+indicators=\{teacherIndicatorCatalogs\.student\.levels\}\s+scores=\{currentScores\}\s+records=\{evaluationRecords\}\s+term=\{selectedTermOption\}\s+totalScore=\{totalScore\}/, '首页曲线应读取学生评价目录、所选学期积分和实际评价。');
assert.match(dashboardSource, /termSelector=\{SHOW_OVERVIEW_TERM_SELECTOR && \(\s*<StudentTermSelector\s+value=\{selectedTerm\}[\s\S]*?onChange=\{setSelectedTerm\}\s+variant="glass"/, '顶部学期胶囊启用时应复用详情页学期状态。');
assert.match(overviewStyles, /\.student-detail-profile-toolbar\s*\{[^}]*position:\s*relative;\s*z-index:\s*[1-9]\d*;/, '整个工具栏应显示在向上延伸的金色背景之上。');
assert.match(dashboardSource, /<StudentDetailTimeline\b[^>]*records=\{evaluationRecords\}\s+term=\{selectedTermOption\}/, '动态应使用所选学期的评价记录。');
requireText(growthChartSource, '五育成长曲线', '学生详情应展示五育成长曲线。');
requireText(growthChartSource, '按周', '五育曲线应能按周查看。');
requireText(growthChartSource, '按月', '五育曲线应能按月查看。');
for (const period of ['week', 'month']) {
  const trendOptions = {
    records: [], indicator: { name: '向阳', legacyName: '体育' }, term: CURRENT_STUDENT_TERM,
    period, today: '2026-11-26',
  };
  const expectedCount = period === 'week' ? 5 : 3;
  assert.deepEqual(getStudentGrowthTrend({ ...trendOptions, scores: [] }).map(point => point.value), Array(expectedCount).fill(0), '零积分应保留本学期有效周期并显示 0 分。');
  const scores = [{ category: 'physical', label: '体育', score: 60 }];
  assert.deepEqual(getStudentGrowthTrend({ ...trendOptions, scores }).map(point => point.value), Array(expectedCount).fill(60), '已知的学期积分无变化时应保留真实累计值。');
}
assert.match(timelineSource, /<h2\b[^>]*>动态<\/h2>/, '首页动态应使用板块标题。');
assert.doesNotMatch(timelineSource, /里程碑|aria-pressed/, '首页动态应直接展示评价记录。');
requireText(timelineSource, 'record.images?.[0]', '动态缩略图应读取评价附图。');
requireText(timelineSource, '全部评价', '首页应可打开完整的评价记录。');
requireText(dashboardSource, "section === 'evaluation' && renderEvaluationTab()", '全部评价应保留完整筛选和五育摘要。');
requireText(dashboardSource, "section === 'report' && renderReportTab()", '成长报告应在独立目录呈现。');
requireText(evaluationRecordsSource, '>评价记录</h3>', '评价记录应保留完整板块。');
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
requireText(dashboardSource, 'onOpenStudentActions={() => setShowMoreActionsSheet(true)}', '学籍状态应打开操作抽屉。');
requireText(dashboardSource, 'title="学籍状态"', '学籍抽屉应使用明确标题。');
requireText(dashboardSource, '办理离校', '在校学生应保留办理离校操作。');
requireText(dashboardSource, '<MobileBottomSheet', '学生详情应复用公共底部抽屉。');
requireText(dashboardSource, 'onOpenArchive={onOpenStudentArchive}', '成长档案统计位应直达档案页面。');
requireText(dashboardSource, "onOpenQuestionnaires={() => openSection('collection')}", '问卷统计位应直达已完成采集。');
requireText(dashboardSource, "collection: '问卷采集记录'", '问卷采集记录应使用明确标题。');
requireText(dashboardSource, '<StudentCollectionHistoryTab', '采集记录子页面必须复用独立业务组件。');
requireText(collectionHistorySource, '<MobileEmptyState', '采集记录空状态应复用教师手机端公共缺省组件。');
requireText(collectionHistorySource, 'ASSETS.DEFAULT_STATE.WORRIED_CLIPBOARD', '采集记录为空时应使用担忧清单长颈鹿缺省图。');
if (collectionHistorySource.includes('<ClipboardCheck')) {
  throw new Error('采集记录空状态不应继续使用临时剪贴板图标。');
}
requireText(dashboardSource, 'termOptions={STUDENT_TERM_OPTIONS}', '采集记录必须复用成长数据的学期定义。');
requireText(dashboardSource, 'selectedTerm={selectedTerm}', '成长报告与采集记录必须共享所选学期。');
requireText(dashboardSource, 'onSelectedTermChange={setSelectedTerm}', '采集记录必须能够切换共享学期。');
assert.equal(CURRENT_STUDENT_TERM.value, '2026-fall', '学生详情当前学期必须与演示日期保持一致。');
assert.equal(STUDENT_TERM_OPTIONS[1].value, '2025-spring', '学生详情应保留上一个学期。');
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
requireText(basicEditSource, 'classPickerGrade', '所在班级选择应采用左侧年级、右侧班级的级联状态。');
requireText(basicEditSource, 'gradeOptions.map', '所在班级选择左侧应展示年级选项。');
requireText(basicEditSource, 'classOptions.map', '所在班级选择右侧应根据年份展示班级选项。');
requireText(basicEditSource, 'grid-cols-[92px_1fr]', '班级级联应采用左右两栏布局。');
requireText(basicEditSource, 'aria-label="左侧先选年级"', '班级级联左侧应先选年级。');
requireText(basicEditSource, 'aria-label="右侧再选该年级下的班级"', '班级级联右侧应展示该年级下的班级。');
requireText(basicEditSource, 'getTeacherClassDisplayName(item, currentSpace)', '右侧班级应展示当前学校版式的紧凑班级名。');
requireText(basicEditSource, 'open={showClassPicker}', '所在班级应使用底部弹窗承载级联选择。');
requireText(basicEditSource, 'title="选择班级"', '班级选择弹窗应使用明确标题。');
requireText(basicEditSource, 'onClick={() => selectClass(item)}', '点击具体班级后应立即应用选择。');
requireText(basicEditSource, 'setToastMessage(`已调整至${getTeacherClassDisplayName(item, currentSpace)}`)', '换班成功后应提供轻量结果反馈。');
requireText(basicEditSource, 'aria-label={`选择所在班级，当前${displayStudentClassName}`}', '所在班级入口应整行可点击并说明当前值。');
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
requireText(basicEditSource, "getTeacherSchoolGradeOptions(currentSpace)", '基础信息编辑页使用年级选项时必须具备对应依赖。');
requireText(basicEditSource, "getTeacherClassDisplayName, getTeacherSchoolGradeOptions, type TeacherSpaceOption", '基础信息编辑页必须导入年级选项依赖，避免进入页面后运行时空白。');
requireText(basicEditSource, "max={editingField === 'birthDate' ? maxBirthDate : undefined}", '出生日期弹窗不得允许选择未来日期。');
requireText(basicEditSource, "return '未设置';", '出生日期为空时应显示未设置，不展示浏览器年月日占位。');
requireText(basicEditSource, 'aria-pressed={draft.gender === option.value}', '性别选中状态应能被辅助技术识别。');
requireText(basicEditSource, 'aria-pressed={classPickerGrade === grade}', '班级年级选中状态应能被辅助技术识别。');
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

for (const required of ['收入', '支出', '${GROWTH_COIN_TERMS.name}收支记录', '校园币明细']) {
  requireText(coinDetailSource, required, `校园币详情页缺少收支流水能力：${required}`);
}
requireText(coinDetailSource, 'CampusCoinDetail', '校园币详情页应使用校园币详情类型。');
requireText(coinDetailSource, 'issueRecords.map', '校园币详情页应展示发放流水列表。');
requireText(coinDetailSource, 'consumeRecords.map', '校园币详情页应展示消耗流水列表。');
requireText(coinDetailSource, 'break-words', '校园币流水的说明应能自动换行。');
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
requireText(coinDetailSource, 'grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]', '成长币资产摘要应保持两项余额等宽，并以独立短竖线分区。');
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
requireText(coinDetailSource, 'id="coin-overview-title" className="flex min-h-[var(--tm-size-touch)] items-center', '账户概览标题应纳入账户卡片头部。');
requireText(coinDetailSource, 'overflow-hidden rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]', '账户资产与结算预估应组成一张由浅灰页面承托的语义卡片。');
requireText(coinDetailSource, 'p-[var(--tm-space-2)] pb-[var(--tm-space-4)] [box-shadow:var(--tm-shadow-card)]', '收支卡应保留 8px 基础内缩，不随圆角调整而压缩内容。');
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
requireText(coinDetailSource, 'shape="subtle"', '收支分段应显式接入8像素控件形态。');
requireText(compactSegmentSource, "borderRadius: 'var(--tm-form-control-radius)'", '分段轨道应消费统一控件圆角令牌。');
requireText(compactSegmentSource, 'transition-[background-color,color,box-shadow]', '收入和支出选中态只应过渡实际变化的属性。');
requireText(compactSegmentSource, 'focus-visible:ring-inset', '校园币分段控件应保留键盘焦点反馈。');
if (coinDetailSource.includes('] transition [transition-duration:')) {
  throw new Error('校园币页面不得使用监听全部属性的 transition 简写。');
}
requireText(coinDetailSource, 'className="divide-y divide-[var(--tm-border-subtle)]"', '月度流水应在白色板块内使用连续列表。');
if (coinDetailSource.includes('divide-y divide-[var(--tm-border-subtle)] overflow-hidden rounded-[var(--tm-radius-card-compact)]')) {
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
requireText(coinDetailSource, 'mt-[var(--tm-layout-card-gap)]', '两张一级卡片应使用统一板块间距。');
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
