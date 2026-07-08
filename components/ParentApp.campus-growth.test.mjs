import { readFileSync } from 'node:fs';

const parentSource = readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const fluidNavSource = readFileSync(new URL('./parent-app/ParentFluidGlassNav.tsx', import.meta.url), 'utf8');

const failures = [];

const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message ?? `缺少：${text}`);
};

const forbidText = (source, text, message) => {
  if (source.includes(text)) failures.push(message ?? `不应出现：${text}`);
};

// 家长端真实页面和流程边界：只保护已有功能，不锁死具体视觉实现。
for (const required of [
  "type Screen = 'binding' | 'growth' | 'reports' | 'archiveList' | 'archiveDetail' | 'questionnaireForm' | 'questionnaireDetail' | 'reportDetail' | 'bank' | 'growthRecords' | 'todo'",
  "useState<Screen>(() => defaultHasBoundChild ? 'growth' : 'binding')",
  'showPhoneShell?: boolean',
  'showDeviceFrame={showPhoneShell}',
  'contentTopInsetMode="status-bar"',
  '绑定孩子',
  '学校编号',
  '学生姓名',
  '学生学号',
  "const [bindForm, setBindForm] = useState({ schoolCode: '', studentName: '', studentNo: '' })",
  'shouldShowStudentBindFields',
  'canSubmitBinding',
  'disabled={!canSubmitBinding}',
  'submitBinding',
  'openBinding',
  'bindingReturnTarget',
  'returnToChildSwitcher',
  '返回切换孩子',
]) {
  requireText(parentSource, required, `家长端绑定流程边界被破坏：${required}`);
}

for (const required of [
  '切换孩子',
  '绑定其他孩子',
  'ChildSwitcherSheet',
  "aria-label=\"切换孩子\"",
  'const isCurrentChild = child.id === activeChild?.id;',
  'setActiveChildId(child.id); setShowChildSwitcher(false);',
  'activeChild.className',
  'studentNo',
  'avatar: string;',
  "import { ASSETS } from '../mobile-app/assets/images';",
  'GrowthChildProfileCard',
  'GrowthSummaryCards',
  'MessageBellEntry',
  'TodoPage',
  "setScreen('todo')",
  "<Header title=\"待办\" showBack backLabel=\"返回成长页\" onBack={() => setScreen('growth')} />",
  'questionPrompt',
  'questionTypeLabel',
  '请补充内容',
  'placeholder="请填写具体内容"',
  'rows={3}',
  'min-h-[96px] w-full resize-none',
  'absolute bottom-0 left-0 right-0 z-30',
  'sticky top-0 z-40',
  'aria-label="返回成长页"',
  '单选',
  '多选',
  'text-[18px] font-black leading-[1.4]',
  '全部记录',
  'ChevronRight',
  'GrowthRecords',
  'GrowthCalendar',
  "type GrowthRangeMode = 'day' | 'week' | 'month' | 'term'",
  "type GrowthTermKey = 'first' | 'second'",
  "const [growthRangeMode, setGrowthRangeMode] = useState<GrowthRangeMode>('day')",
  'GrowthRangeTabs',
  'GrowthWeekStrip',
  'GrowthMonthSummary',
  'GrowthTermSummary',
  '<ParentCard as="section" className="mx-5 mt-3 p-4">',
  'className={`flex h-[58px] flex-col items-center justify-center rounded-[18px] px-3 text-[15px] font-bold',
  '<span className="mt-1 flex h-2 items-center justify-center gap-1">',
  'const PARENT_RANGE_SHORTCUT_CLASS',
  'const PARENT_PRESSABLE_CLASS',
  'setSelectedGrowthDate(new Date())} className={PARENT_RANGE_SHORTCUT_CLASS}',
  'getGrowthRangeRecords',
  'getGrowthDayRecords',
  'selectedGrowthDate',
  'selectedDateRecords',
  'selectedGrowthRangeRecords',
  'hasPraise',
  'hasImprove',
  '当天统计',
  '本周统计',
  '本月统计',
  '本学期统计',
  "['day', '日']",
  "['week', '周']",
  "['month', '月']",
  "['term', '学期']",
  "growthRangeMode === mode ? 'bg-emerald-600 text-white shadow-[0_12px_24px_-18px_rgba(5,150,105,0.9)]'",
  "selected ? 'bg-emerald-600 text-white'",
  "selected ? 'bg-emerald-600 text-white shadow-[0_14px_28px_-20px_rgba(5,150,105,0.9)]'",
  '本周',
  'getGrowthMonthWeekRanges',
  'formatWeekRange',
  'const monthCells = Array.from({ length: 12 }, (_, index) => index)',
  'setSelectedGrowthDate(new Date(year, monthIndex, 1))',
  "aria-label={`${monthIndex + 1}月`}",
  '本月',
  'getGrowthTermInfo',
  'getGrowthTermRanges',
  'setSelectedGrowthDate(new Date(range.start))',
  '本学期',
  '上学期',
  '下学期',
  '上个月',
  '下个月',
  '当天统计',
  '{selectedPraiseCount}<span className="ml-0.5 text-[11px]">次</span>',
  '{selectedImproveCount}<span className="ml-0.5 text-[11px]">次</span>',
  '本月净得分',
  '预计可得',
  '成长奖励',
  '得分奖励',
  'indicatorPath',
  'createdAt',
  "['崇德', '仪容仪表', '举止得体']",
]) {
  requireText(parentSource, required, `家长端成长/切换孩子功能边界被破坏：${required}`);
}

for (const required of [
  '学生档案',
  '档案明细',
  'archives',
  'templateName',
  'healthInfo',
  'contentGroups',
  'sourceRecords',
  '来源记录',
  '健康信息',
  '档案摘要',
  'activeArchive.summary.map',
  '综合印象',
  '优势线索',
  '近期关注',
  '基础信息',
  '档案内容',
  '建档来源',
  '学习与认知',
  '兴趣与交往',
  '家庭与发展目标',
  '的档案',
  '档案类型',
  '一年级学生初始档案袋',
  '一年级入学建档',
  '建档日期',
  '特殊健康提醒',
  '过敏史',
  '建档教师签字',
  '家长确认',
  '学业基础',
  '兴趣偏好',
  '认知特点',
  '交往风格',
  '性格与家庭',
  '优先发展目标',
  '初始光芒定位',
  '未来一学期内驱力培养的优先关注方向',
  '一年级学生家长问卷',
  '一年级学生访谈信息表',
  '一年级教师观察表',
  'formIntro',
  'formSections',
  'isLongIntroLabel',
  'splitArchiveOptions',
  'isArchiveOptionSelected',
  'getQuestionTypeLabel',
  '孩子有没有需要老师特别留意的健康问题（如过敏、哮喘等）？',
  '遇到不懂的事，你会问“为什么”吗？',
  '课堂专注 / (上课/集会)',
  '典型事例描述',
  '家长问卷',
  'title="档案"',
  'aria-label={`查看${activeChild.name}档案`}',
  "setScreen('archiveList')",
  "setScreen('archiveDetail')",
  "setScreen('questionnaireDetail')",
  '月度报告',
  '期末报告',
  '报告详情',
  'activeChild.reports.map',
  "setActiveReportId(report.id); setScreen('reportDetail');",
  'activeReport.summary',
  'activeReport.highlights.map',
  'activeReport.focus',
  'activeReport.suggestion',
  '总览',
  '亮点',
  '关注',
  '建议',
]) {
  requireText(parentSource, required, `家长端档案/报告流程边界被破坏：${required}`);
}

for (const required of [
  '积分银行',
  '钱包',
  '存款',
  "type BankTab = 'deposit' | 'list'",
  'activeBankTab',
  '签署新存单',
  '我的存单',
  'activeChild.deposits.length',
  '存钱计划',
  '存入金额',
  '签署存单',
  '确认签署这份存单?',
  '我再想想',
  '确认签署',
  '取出',
  '活期存单',
  '定期存单',
  '定期到期日',
  '到期可得',
  'attentionSoft',
  '提前取出',
  '未到期取出将按活期利息计算',
  '到账金额',
  '确认提前取出',
  '单日利息',
  '到期利息',
  '到期时间',
  'const PARENT_BANK_TERMS',
  'PARENT_BANK_TERMS.map',
  'productName:',
  'termLabel:',
  'dailyRate:',
  'setSelectedBankScheme(scheme); setShowDepositConfirm(true);',
  'const CURRENT_DEPOSIT_PROJECTION_DAYS = [7, 30, 60, 90];',
  'CURRENT_DEPOSIT_PROJECTION_DAYS.map(days =>',
  'showDepositReview && selectedBankScheme',
  'setShowDepositReview(true)',
  'onClick={submitDeposit}',
  'setShowDepositReview(false);',
  'withdrawTarget &&',
  'withdrawDeposit',
  "onClick={() => setScreen('bank')}",
  'aria-label="进入积分银行"',
  'Header title="积分银行" showBack backLabel="返回成长页"',
  "const bankTopSpacing = 'mt-3'",
  'hasParentOverlay',
  "screen === 'growth' || screen === 'reports' || screen === 'mine'",
]) {
  requireText(parentSource, required, `家长端银行流程边界被破坏：${required}`);
}

for (const tab of ["key: 'growth', label: '成长'", "key: 'reports', label: '报告'", "key: 'mine', label: '我的'"]) {
  requireText(parentSource, tab, `底部菜单缺少固定入口：${tab}`);
}

for (const required of [
  "const labels = ['成长', '报告', '我的']",
  "['表扬 +3', '报告', '家长', '我的']",
]) {
  requireText(fluidNavSource, required, `家长端底栏应保持成长/报告/我的：${required}`);
}

for (const required of [
  "type MineSheet = 'profile' | 'privacy' | 'logout' | null",
  'const PARENT_PROFILE',
  "if (screen === 'mine') return MinePage();",
  'const MinePage = () =>',
  '家长信息',
  '已绑定孩子',
  '隐私协议',
  '退出登录',
  'onClick={confirmLogout}',
]) {
  requireText(parentSource, required, `家长端我的页边界被破坏：${required}`);
}

for (const forbiddenTab of ["key: 'bank', label: '银行'"]) {
  forbidText(parentSource, forbiddenTab, `银行不应继续作为底部一级入口：${forbiddenTab}`);
}

for (const required of [
  '<ParentApp showPhoneShell={showParentPhoneShell} />',
  "currentApp === 'admin' || currentApp === 'parent'",
  '家长-手机端',
]) {
  requireText(appSource, required, `AppSwitcher 家长端入口边界被破坏：${required}`);
}

// 新样式迁移边界：允许当前阶段失败，后续接入家长端通用组件后转绿。
for (const requiredStyle of [
  'ParentPageShell',
  'ParentCard',
  'ParentGradientIcon',
  'ParentChildAvatar',
  'ParentPrimaryButton',
  'ParentBottomSheet',
]) {
  requireText(parentSource, requiredStyle, `家长端应使用新的通用组件：${requiredStyle}`);
}

// 旧冲突样式边界：禁止继续固化黄色主按钮、教师端主按钮 token 和深色强按钮。
for (const forbiddenStyle of [
  'bg-[#FFC210] text-[#653C16]',
  'parent-teacher-token-primary-button',
  'bg-slate-900 text-white',
  'bg-slate-950 text-white',
  'contentTopInsetMode="full-chrome"',
]) {
  forbidText(parentSource, forbiddenStyle, `家长端新视觉不应继续使用旧冲突样式：${forbiddenStyle}`);
}

for (const forbiddenBusiness of ['兑换奖励', '兑换商品', '货柜兑换', "type: 'exchange'", '兑换记录']) {
  forbidText(parentSource, forbiddenBusiness, `家长端不能提供或强化兑换相关能力：${forbiddenBusiness}`);
}

for (const forbiddenConcept of ['高光时刻', '智能生成状态', '成长画像', 'AI成长洞察', '收益预估入口', '查看成长报告', "key: 'questionnaire'", "key: 'archive', label: '档案'"]) {
  forbidText(parentSource, forbiddenConcept, `样式统一不得新增真实方案外入口或概念文案：${forbiddenConcept}`);
}

for (const forbiddenNav of [
  "const labels = ['成长', '档案', '银行']",
  "['表扬 +3', '档案', '920', '银行']",
]) {
  forbidText(fluidNavSource, forbiddenNav, `家长端底栏残留了旧档案一级入口：${forbiddenNav}`);
}

for (const oldMessageCopy of ['title="消息"', 'aria-label={`消息，${messageCount}条待处理`}']) {
  forbidText(parentSource, oldMessageCopy, `问卷待办不应继续用泛化消息入口：${oldMessageCopy}`);
}

for (const oldMessageSheet of ['showMessageCenter', 'ParentMessageCenterSheet']) {
  forbidText(parentSource, oldMessageSheet, `待办应进入子页面，不应继续使用弹窗：${oldMessageSheet}`);
}

for (const oldQuestionnaireLayout of ['min-h-[430px]', 'shadow-[0_18px_36px_-30px_rgba(16,185,129,0.6)]', '<Header title="待填写问卷" showBack', '<Header title="问卷" showBack', '<Header title="" showBack', '可选择多项', 'text-[20px] font-black leading-[1.35]', 'placeholder="请填写"', 'pl-[50px]']) {
  forbidText(parentSource, oldQuestionnaireLayout, `问卷填写页不应保留旧布局/复杂选中态：${oldQuestionnaireLayout}`);
}

for (const oldQuestionnaireDetailSelectedStyle of ['border-emerald-500 bg-emerald-500 text-white', 'CheckCircle2 size={12}', 'shadow-[0_10px_24px_-22px_rgba(16,185,129,0.65)]']) {
  forbidText(parentSource, oldQuestionnaireDetailSelectedStyle, `已填写问卷选中态不应保留旧复杂图标/阴影：${oldQuestionnaireDetailSelectedStyle}`);
}

for (const oldSourceDetail of ['最常被家长看到的变化', '家庭支持重点']) {
  forbidText(parentSource, oldSourceDetail, `来源详情页必须展示文档原始问卷，不应保留泛化摘要：${oldSourceDetail}`);
}

for (const wrongAnswerLabel of ['模拟答案']) {
  forbidText(parentSource, wrongAnswerLabel, `来源详情页应展示用户勾选结果，不应出现答案说明文案：${wrongAnswerLabel}`);
}

for (const crowdedProfileText of ['学号 {activeChild.studentNo}']) {
  forbidText(parentSource, crowdedProfileText, `成长页学生信息卡不应展示学号：${crowdedProfileText}`);
}

for (const removedGrowthRecordsContent of ['当天明细']) {
  forbidText(parentSource, removedGrowthRecordsContent, `成长数据页不应保留已删除板块：${removedGrowthRecordsContent}`);
}

for (const removedWeekModeContent of ['上一周', '下一周']) {
  forbidText(parentSource, removedWeekModeContent, `周筛选应改为月份周色块，不再使用逐周切换：${removedWeekModeContent}`);
}

for (const removedMonthModeContent of ['有记录天数']) {
  forbidText(parentSource, removedMonthModeContent, `月筛选应展示 1 月到 12 月色块，不再使用月度概览块：${removedMonthModeContent}`);
}

for (const fixedCalendarHeight of ['h-[400px]']) {
  forbidText(parentSource, fixedCalendarHeight, `成长数据筛选卡片应按内容自适应高度，避免日历超框：${fixedCalendarHeight}`);
}

for (const legacy of ['智批作文', 'AI Guardian', '作文综合评分', '深度诊断报告']) {
  forbidText(parentSource, legacy, `家长手机端不应保留旧作文批改方案文案：${legacy}`);
}

const emojiPattern = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u;
for (const [name, source] of [['ParentApp.tsx', parentSource], ['App.tsx', appSource]]) {
  if (emojiPattern.test(source)) failures.push(`${name} 不应出现 emoji。`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('parent campus growth app assertions passed');
