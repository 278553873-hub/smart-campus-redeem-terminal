import fs from 'node:fs';
import assert from 'node:assert/strict';

const viewSource = fs.readFileSync(new URL('./ClassExchangeRecordView.tsx', import.meta.url), 'utf8');
const wheelSource = fs.readFileSync(new URL('../components/ui/MobileWheelPicker.tsx', import.meta.url), 'utf8');
const ledgerSource = fs.readFileSync(new URL('../domain/campusCoinLedger.ts', import.meta.url), 'utf8');
const demoSource = fs.readFileSync(new URL('../data/campusCoinLedger.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const rewardSource = fs.readFileSync(new URL('./reward-verification/RewardVerificationView.tsx', import.meta.url), 'utf8');
const cabinetDemoSource = fs.readFileSync(new URL('./class-exchange-records/ClassExchangeRecordsDemoView.tsx', import.meta.url), 'utf8');
const dateFilterSource = fs.readFileSync(new URL('./exchange-records/ExchangeRecordDateFilter.tsx', import.meta.url), 'utf8');
const vendingPanelSource = fs.readFileSync(new URL('./vending-exchange/VendingExchangeRecordsPanel.tsx', import.meta.url), 'utf8');
const previewSource = fs.readFileSync(new URL('../../components/ClassExchangePreviewControls.tsx', import.meta.url), 'utf8');
const studentCoinSource = fs.readFileSync(new URL('./StudentCoinDetailView.tsx', import.meta.url), 'utf8');
const coinFlowSource = fs.readFileSync(new URL('../../shared/growthCoinFlow.ts', import.meta.url), 'utf8');
const dangerSheetSource = fs.readFileSync(new URL('../components/ui/MobileDangerConfirmSheet.tsx', import.meta.url), 'utf8');

const has = (source, needle, message) => assert.ok(source.includes(needle), message);

const headerStart = viewSource.indexOf('<header');
const headerTag = headerStart >= 0 ? viewSource.slice(headerStart, viewSource.indexOf('>', headerStart) + 1) : '';
assert.ok(headerTag.length > 0, '兑换记录页应自绘标题栏。');
has(headerTag, 'bg-[var(--tm-page-plain-header-bg)]', '兑换记录页标题栏应使用白色表面。');
assert.match(appSource, /const hasPlainPageOwnHeader = [^\n]*currentView === 'class_exchange_records'/, '兑换记录页应由页面自绘标题栏。');
has(appSource, '!hasPlainPageOwnHeader && (', '全局标题栏应跳过兑换记录页。');
has(appSource, 'hasPlainBackground && !hasStudentDetailBackground && !hasPlainPageOwnHeader', 'plain 页面顶部色带应跳过兑换记录页。');

assert.ok(!viewSource.includes('getTeacherClassDisplayName'), '兑换记录页不应显示班级名称。');
has(viewSource, '<ReportDateRangeTabs', '兑换记录页应使用与货柜管理一致的页签样式。');
has(viewSource, "label: '班级兑换记录'", '兑换记录页应提供班级兑换记录页签。');
has(viewSource, "label: '货柜兑换记录'", '学校来源应提供货柜兑换记录页签。');
has(viewSource, 'semantics="tabs"', '兑换记录页签应使用标准页签语义。');
has(viewSource, 'ariaLabel="兑换记录分类"', '兑换记录页签应有明确的读屏名称。');
has(viewSource, '<VendingExchangeRecordsPanel', '货柜兑换记录应复用货柜管理的记录面板。');
has(viewSource, 'onRefundRecord={onRefundRecord}', '货柜兑换记录应把老师手动退币动作交给上层。');
has(viewSource, 'viewedMonth', '兑换记录页应记录当前浏览月份。');
for (const panel of [viewSource, vendingPanelSource]) {
  has(panel, '<ExchangeRecordDateFilter', '班级和货柜记录应使用同一个日期筛选入口。');
}
has(dateFilterSource, '<MobileDatePickerSheet', '时间筛选应使用公共日期选择器。');
has(dateFilterSource, 'mode="range"', '兑换记录应支持选择月份和时间段。');
has(dateFilterSource, 'showPresets={false}', '日期选择器应与货柜筛选一致，隐藏快捷日期。');
has(viewSource, "filterCoinLedgerEntries(entries, { type: 'range', ...dateRange })", '班级列表只应展示日期命中的记录。');
has(viewSource, 'hasCabinet ? selectedTab :', '切换到无货柜机时立即回到班级记录。');
has(cabinetDemoSource, "space.type !== 'school' || !hasCabinet", '无货柜机的学校与个人空间只展示班级记录。');
has(previewSource, '<PreviewSegmentTrack', '货柜机状态应沿用桌面预览分段控件。');

has(viewSource, 'className="divide-y divide-[var(--tm-border-subtle)]"', '成长币记录应使用通栏分隔列表。');
has(viewSource, 'bg-[var(--tm-bg-surface)]', '成长币记录列表应使用连续白底。');
assert.ok(!viewSource.includes('--tm-shadow-card'), '成长币记录列表不应使用卡片阴影。');
has(viewSource, '>兑换记录<', '页面标题应使用兑换记录。');
has(rewardSource, '兑换记录', '兑换奖励更多操作入口应同步使用兑换记录。');
has(rewardSource, '清空货币', '清空操作应使用清空货币。');

// 展示层只做展示：批次模型、演示数据与规则都在领域层与数据层。
assert.ok(!viewSource.includes('createCoinLedger'), '兑换记录页不应自己生成流水。');
assert.ok(!viewSource.includes('productTemplates'), '兑换记录页不应内置演示商品。');
has(viewSource, "from '../domain/campusCoinLedger'", '兑换记录页应复用领域层的成长币记录模型。');
has(viewSource, 'entries: CampusCoinLedgerEntry[]', '兑换记录页的流水应通过属性传入。');
has(viewSource, 'onRevokeEntry: (entryId: string) => void', '撤回应由上层写入，页面只负责发起。');
has(viewSource, 'entryGroups', '兑换记录应按月份分组展示。');
has(viewSource, 'onScroll={handleClassScroll}', '滚动进入新月份时应更新顶部月份。');
has(viewSource, 'countActiveCoinLedgerEntries(viewedEntries)', '笔数统计应复用领域层实现。');
has(viewSource, 'formatCoinLedgerStudentSummary(entry.shares)', '多人同批兑换应汇总为一条记录的学生摘要。');
has(viewSource, 'getCoinLedgerEntryTitle(entry, GROWTH_COIN_TERMS.name)', '记录标题应复用领域层实现并使用学校货币名称。');

has(ledgerSource, 'export interface CampusCoinLedgerEntry', '领域层应定义批次记录模型。');
has(ledgerSource, 'operator: string;', '批次记录应带操作老师，便于追溯。');
has(ledgerSource, 'shares: CampusCoinLedgerShare[];', '批次记录应保存每个学生的扣减份额。');
has(ledgerSource, "export type CampusCoinLedgerEntryType = 'redeem' | 'clear';", '兑换与清空应共用一条时间线。');
has(ledgerSource, 'export const applyCoinLedgerPatch', '领域层应提供变更合并能力。');
has(ledgerSource, 'export const isCoinLedgerEntryRevocable', '领域层应定义撤回规则。');
has(ledgerSource, "entry.type === 'redeem' && !entry.revoked", '未撤回的班级兑换均可撤回。');
has(ledgerSource, 'export const expandCoinLedgerForStudent', '领域层应支持把批次展开成学生自己的流水。');
has(ledgerSource, 'export const expandCoinLedgerRefundsForStudent', '撤回后应按学生生成独立退还收入，保留原支出。');

has(demoSource, 'export const createDemoCoinLedger', '演示流水应由数据层统一生成。');
has(demoSource, "type: 'clear'", '手动清空成长币应作为一类记录进入同一时间线。');

has(appSource, 'const getCoinLedgerForClass = (classId: string)', 'App 应按班级汇总成长币记录。');
has(appSource, 'handleRecordCoinRedeem', '兑换成功后应写入成长币记录。');
has(appSource, 'handleRecordCoinClear', '清空成长币后应写入成长币记录。');
has(appSource, 'handleRevokeCoinLedgerEntry', '撤回应写回成长币记录。');
has(appSource, '<ClassExchangeRecordsDemoView', '兑换记录页应通过演示适配层注入货柜记录。');
has(appSource, 'entries={getCoinLedgerForClass(selectedClassInfo.id)}', '兑换记录页应读取同一份流水。');
has(cabinetDemoSource, 'createDemoVendingExchangeRecords', '货柜兑换记录应复用货柜管理的演示数据。');
has(cabinetDemoSource, 'filter(record => record.classId === classInfo.id)', '货柜兑换记录应按当前班级截取。');
has(cabinetDemoSource, 'applyManualVendingRefunds', '班级兑换记录应合并货柜手动退币结果。');
has(appSource, 'expandCoinLedgerForStudent(entries, activeStudent.id)', '学生侧支出应从批次流水展开。');
has(appSource, 'expandCoinLedgerRefundsForStudent(entries, activeStudent.id)', '学生侧收入应读取同一批次的撤回退还。');

has(rewardSource, 'onRecordCoinRedeem(', '兑换成功后应上报记录。');
has(rewardSource, 'onRecordCoinClear(clearedShares)', '清空成长币后应上报记录。');
has(ledgerSource, 'export const buildCoinClearShares', '清空份额应由领域层按口径折算。');
has(ledgerSource, "scope === 'all' ? target.bankAmount : 0", '只清可用时不应扣减已存。');
has(ledgerSource, "export const DEFAULT_COIN_CLEAR_SCOPE: CampusCoinClearScope = 'all';", '清空成长币默认口径应为可用加已存。');
has(rewardSource, 'buildCoinClearShares(', '兑换奖励页应复用领域层口径折算清空份额。');
has(rewardSource, 'clearScopeOptions', '兑换奖励页应提供清空口径选项。');
has(rewardSource, 'MobileRadioOptionCard', '清空口径应复用公共单选选项卡。');
has(rewardSource, 'renderClearAmount(clearAvailableAmount)', '只清可用选项要写出本次清掉的金额。');
has(rewardSource, 'renderClearAmount(clearTotalAmount)', '一起清空选项要写出可用加已存的合计。');
has(rewardSource, '<dt className="text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{GROWTH_COIN_TERMS.saved}</dt>', '已存金额应作为确认细节单列一行。');
has(rewardSource, 'hasBankToClear &&', '没有已存可清时不应展示口径选择与已存明细，避免“已存 0 不受影响”这类废话。');
assert.ok(!rewardSource.includes('Landmark'), '可用与已存都是成长币，不应使用银行图标区分。');
assert.ok(!rewardSource.includes('CompactSegmentedControl'), '清空口径不应使用分段控件表达危险级别，避免嵌套圆角与 tab 语义。');
has(dangerSheetSource, 'children?: React.ReactNode;', '危险确认浮层应提供内容插槽承载口径选择。');
assert.ok(!rewardSource.includes('showBankBalanceOnCard'), '学生卡不应随清空口径改变布局，避免网格抖动。');
has(studentCoinSource, 'manual_clear', '学生成长币明细应支持手动清空分类。');
has(coinFlowSource, "manual_clear: '手动清空'", '手动清空的分类名称应复用公共流水文案。');
assert.ok(!studentCoinSource.includes('bank_clear'), '清空可用与清空已存不应再拆成两个支出分类。');
has(ledgerSource, 'formatCoinClearDetail', '领域层应把一次清空合并成一条学生流水，并在明细里写清清掉了哪部分资产。');
has(viewSource, 'share.bankAmount', '记录详情应按学生展示被扣的已存金额。');

has(viewSource, '兑换详情', '点击记录应打开详情抽屉。');
has(viewSource, '涉及学生（', '详情抽屉应按学生展示扣减明细。');
has(viewSource, '兑换人', '详情应展示原兑换人。');
has(viewSource, '撤回人', '详情应单独展示撤回人。');
has(viewSource, "detailEntry.revokedBy?.trim() || '—'", '历史记录缺少撤回人时应展示占位。');
has(appSource, 'const revokedBy = teacherProfile.name', '撤回时应记录当前操作人的姓名。');
has(viewSource, '撤回本次兑换', '可撤回的兑换记录应提供撤回入口。');
has(viewSource, 'isCoinLedgerEntryRevocable(detailEntry)', '撤回入口应复用规则，不传入当天日期。');
has(viewSource, '<MobileConfirmSheet', '撤回应先经过二次确认。');
has(viewSource, 'tone="danger"', '撤回确认应使用危险色。');
has(viewSource, '已撤回', '撤回后的记录应显示已撤回状态。');
has(viewSource, 'MobileToast', '撤回后应给出结果反馈。');
assert.ok(!viewSource.includes('单人撤回'), '撤回以整批为单位，不提供单个学生撤回。');

has(wheelSource, 'snap-y snap-mandatory', '滚轮选择应使用滚动吸附对齐选中项。');
has(wheelSource, 'role="listbox"', '滚轮列应向读屏暴露列表语义。');

console.log('ClassExchangeRecordView assertions passed');
