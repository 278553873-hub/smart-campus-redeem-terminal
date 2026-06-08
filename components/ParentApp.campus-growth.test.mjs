import { readFileSync } from 'node:fs';

const parentSource = readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const failures = [];

const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message ?? `缺少：${text}`);
};

const forbidText = (source, text, message) => {
  if (source.includes(text)) failures.push(message ?? `不应出现：${text}`);
};

// 家长端真实页面和流程边界：只保护已有功能，不锁死具体视觉实现。
for (const required of [
  "type Screen = 'binding' | 'growth' | 'reports' | 'reportDetail' | 'bank' | 'growthRecords'",
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
  '新增绑定',
  'ChildSwitcherSheet',
  "aria-label=\"切换孩子\"",
  "child.id === activeChildId ? '当前' : '切换'",
  'setActiveChildId(child.id); setShowChildSwitcher(false);',
  'activeChild.className',
  'activeChild.studentNo',
  'avatar: string;',
  "import { ASSETS } from '../mobile-app/assets/images';",
  'GrowthChildProfileCard',
  'GrowthSummaryCards',
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
  'setSelectedGrowthDate(new Date())} className="ml-2 h-10 rounded-full border border-emerald-200 px-4 text-[16px] font-bold text-emerald-600 active:bg-emerald-50"',
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
  '预估分红总额',
  '成长奖励',
  '得分奖励',
  'indicatorPath',
  'createdAt',
  "['崇德', '仪容仪表', '举止得体']",
]) {
  requireText(parentSource, required, `家长端成长/切换孩子功能边界被破坏：${required}`);
}

for (const required of [
  '月度报告',
  '期末报告',
  '报告详情',
  'activeChild.reports.map',
  "setActiveReportId(report.id); setScreen('reportDetail')",
  'activeReport.summary',
  'activeReport.highlights.map',
]) {
  requireText(parentSource, required, `家长端报告流程边界被破坏：${required}`);
}

for (const required of [
  '积分银行',
  '钱包',
  '存款',
  "type BankTab = 'deposit' | 'list'",
  'activeBankTab',
  '签署新存单',
  '我的存单',
  '存钱计划',
  '存入金额',
  '签署存单',
  '确认签署这份存单?',
  '我再想想',
  '确认签署',
  '取出',
  '活期存单',
  '定期存单',
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
  "const bankTopSpacing = showPhoneShell ? 'mt-14' : 'mt-5'",
  'hasParentOverlay',
  "screen !== 'binding' && screen !== 'growthRecords' && !hasParentOverlay",
]) {
  requireText(parentSource, required, `家长端银行流程边界被破坏：${required}`);
}

for (const tab of ["key: 'growth', label: '成长'", "key: 'reports', label: '报告'", "key: 'bank', label: '银行'"]) {
  requireText(parentSource, tab, `底部菜单缺少固定入口：${tab}`);
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

for (const forbiddenConcept of ['高光时刻', '智能生成状态', '成长画像', 'AI成长洞察', '收益预估入口', '查看成长报告']) {
  forbidText(parentSource, forbiddenConcept, `样式统一不得新增真实方案外入口或概念文案：${forbiddenConcept}`);
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
