import fs from 'node:fs';
import assert from 'node:assert/strict';

const viewSource = fs.readFileSync(new URL('./ClassExchangeRecordView.tsx', import.meta.url), 'utf8');
const wheelSource = fs.readFileSync(new URL('../components/ui/MobileWheelPicker.tsx', import.meta.url), 'utf8');
const ledgerSource = fs.readFileSync(new URL('../domain/campusCoinLedger.ts', import.meta.url), 'utf8');
const demoSource = fs.readFileSync(new URL('../data/campusCoinLedger.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const rewardSource = fs.readFileSync(new URL('./reward-verification/RewardVerificationView.tsx', import.meta.url), 'utf8');
const studentCoinSource = fs.readFileSync(new URL('./StudentCoinDetailView.tsx', import.meta.url), 'utf8');
const dangerSheetSource = fs.readFileSync(new URL('../components/ui/MobileDangerConfirmSheet.tsx', import.meta.url), 'utf8');

const has = (source, needle, message) => assert.ok(source.includes(needle), message);

const headerStart = viewSource.indexOf('<header');
const headerTag = headerStart >= 0 ? viewSource.slice(headerStart, viewSource.indexOf('>', headerStart) + 1) : '';
assert.ok(headerTag.length > 0, '成长币记录页应自绘标题栏。');
has(headerTag, 'bg-[var(--tm-page-plain-header-bg)]', '成长币记录页标题栏应使用白色表面。');
has(appSource, "const hasPlainPageOwnHeader = currentView === 'class_exchange_records';", '成长币记录页应由页面自绘标题栏。');
has(appSource, '!hasPlainPageOwnHeader && (', '全局标题栏应跳过成长币记录页。');
has(appSource, 'hasPlainBackground && !hasStudentDetailBackground && !hasPlainPageOwnHeader', 'plain 页面顶部色带应跳过成长币记录页。');

assert.ok(!viewSource.includes('getTeacherClassDisplayName'), '成长币记录页不应显示班级名称。');
assert.ok(!viewSource.includes('ReportDateRangeTabs'), '成长币记录页不应继续使用五段日期页签。');
has(viewSource, "type: 'month', month: toMonthValue", '成长币记录页应默认按当前月份筛选。');
has(viewSource, "label: '选择月份'", '时间筛选弹窗应提供选择月份页签。');
has(viewSource, "label: '选择时间段'", '时间筛选弹窗应提供选择时间段页签。');
has(viewSource, 'MobileWheelPicker', '时间筛选应使用滚轮选择。');

has(viewSource, 'divide-y divide-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]', '成长币记录应使用通栏分隔列表。');
assert.ok(!viewSource.includes('--tm-shadow-card'), '成长币记录列表不应使用卡片阴影。');
has(viewSource, '>{GROWTH_COIN_TERMS.name}记录<', '页面标题应使用成长币记录。');
has(rewardSource, 'GROWTH_COIN_TERMS.name}记录', '兑换奖励更多操作入口应同步使用成长币记录。');

// 展示层只做展示：批次模型、演示数据与规则都在领域层与数据层。
assert.ok(!viewSource.includes('createCoinLedger'), '成长币记录页不应自己生成流水。');
assert.ok(!viewSource.includes('productTemplates'), '成长币记录页不应内置演示商品。');
has(viewSource, "from '../domain/campusCoinLedger'", '成长币记录页应复用领域层的成长币记录模型。');
has(viewSource, 'entries: CampusCoinLedgerEntry[]', '成长币记录页的流水应通过属性传入。');
has(viewSource, 'onRevokeEntry: (entryId: string) => void', '撤回应由上层写入，页面只负责发起。');
has(viewSource, 'filterCoinLedgerEntries(entries, filter)', '时间筛选应复用领域层实现。');
has(viewSource, 'countActiveCoinLedgerEntries(filteredEntries)', '笔数统计应复用领域层实现。');
has(viewSource, 'formatCoinLedgerStudentSummary(entry.shares)', '多人同批兑换应汇总为一条记录的学生摘要。');
has(viewSource, 'getCoinLedgerEntryTitle(entry)', '记录标题应复用领域层实现。');

has(ledgerSource, 'export interface CampusCoinLedgerEntry', '领域层应定义批次记录模型。');
has(ledgerSource, 'operator: string;', '批次记录应带操作老师，便于追溯。');
has(ledgerSource, 'shares: CampusCoinLedgerShare[];', '批次记录应保存每个学生的扣减份额。');
has(ledgerSource, "export type CampusCoinLedgerEntryType = 'redeem' | 'clear';", '兑换与清空应共用一条时间线。');
has(ledgerSource, 'export const applyCoinLedgerPatch', '领域层应提供变更合并能力。');
has(ledgerSource, 'export const isCoinLedgerEntryRevocable', '领域层应定义撤回规则。');
has(ledgerSource, "entry.type === 'redeem' && !entry.revoked && getCoinLedgerDateKey(entry.time) === todayKey", '撤回只对当天的兑换记录开放。');
has(ledgerSource, 'export const expandCoinLedgerForStudent', '领域层应支持把批次展开成学生自己的流水。');
has(ledgerSource, "filter(entry => !entry.revoked)", '已撤回的记录不应进入学生成长币明细。');

has(demoSource, 'export const createDemoCoinLedger', '演示流水应由数据层统一生成。');
has(demoSource, "type: 'clear'", '手动清空成长币应作为一类记录进入同一时间线。');

has(appSource, 'const getCoinLedgerForClass = (classId: string)', 'App 应按班级汇总成长币记录。');
has(appSource, 'handleRecordCoinRedeem', '兑换成功后应写入成长币记录。');
has(appSource, 'handleRecordCoinClear', '清空成长币后应写入成长币记录。');
has(appSource, 'handleRevokeCoinLedgerEntry', '撤回应写回成长币记录。');
has(appSource, 'entries={getCoinLedgerForClass(selectedClassInfo.id)}', '成长币记录页应读取同一份流水。');
has(appSource, 'expandCoinLedgerForStudent(getCoinLedgerForClass(activeStudentClassId), activeStudent.id)', '学生侧明细应从批次流水展开。');

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
has(studentCoinSource, 'manual_clear', '学生成长币明细应支持清空可用分类。');
has(studentCoinSource, 'bank_clear', '学生成长币明细应支持清空已存分类。');
has(studentCoinSource, '清空已存', '清空已存的分类名称应清晰可读。');
has(viewSource, 'share.bankAmount', '记录详情应按学生展示被扣的已存金额。');

has(viewSource, '兑换详情', '点击记录应打开详情抽屉。');
has(viewSource, '涉及学生（', '详情抽屉应按学生展示扣减明细。');
has(viewSource, '操作老师', '详情抽屉应展示操作老师。');
has(viewSource, '撤回本次兑换', '当天兑换记录应提供撤回入口。');
has(viewSource, 'isCoinLedgerEntryRevocable(detailEntry, todayKey)', '撤回入口只在当天兑换时出现。');
has(viewSource, '<MobileConfirmSheet', '撤回应先经过二次确认。');
has(viewSource, 'tone="danger"', '撤回确认应使用危险色。');
has(viewSource, '已撤回', '撤回后的记录应显示已撤回状态。');
has(viewSource, 'MobileToast', '撤回后应给出结果反馈。');
assert.ok(!viewSource.includes('单人撤回'), '撤回以整批为单位，不提供单个学生撤回。');

has(wheelSource, 'snap-y snap-mandatory', '滚轮选择应使用滚动吸附对齐选中项。');
has(wheelSource, 'role="listbox"', '滚轮列应向读屏暴露列表语义。');

console.log('ClassExchangeRecordView assertions passed');
