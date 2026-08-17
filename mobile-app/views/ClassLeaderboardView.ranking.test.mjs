import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./ClassLeaderboardView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const pillSource = readFileSync(new URL('../components/ui/PillSelectionControl.tsx', import.meta.url), 'utf8');
const rankingListSource = readFileSync(new URL('../components/ui/ClassRankingList.tsx', import.meta.url), 'utf8');
const dateTabsSource = readFileSync(new URL('../components/report/ReportDateRangeTabs.tsx', import.meta.url), 'utf8');
const textSelectionSource = readFileSync(new URL('../components/ui/TextSelectionControl.tsx', import.meta.url), 'utf8');

for (const required of [
  'const getRankedClasses =',
  '.sort((left, right) => right.score - left.score',
  'let previousScore: number | null = null',
  'let previousRank = 0',
  'previousScore === item.score ? previousRank : index + 1',
  'const [showFullRanking, setShowFullRanking] = useState(false)',
  'onViewAll={data.rankings.length > 5 ? () => setShowFullRanking(true) : undefined}',
  '<MobileBottomSheet',
  '全部班级排名',
  'items={data.rankings}',
  '<ClassRankingList',
]) {
  if (!source.includes(required)) {
    throw new Error(`班级排行榜需要支持降序排序、并列名次和全部排名弹窗，缺少：${required}`);
  }
}

for (const required of [
  'grid min-h-[58px] grid-cols-[32px_minmax(0,1fr)_auto]',
  'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]',
  'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]',
  'bg-[var(--tm-brand-secondary-soft)] text-[var(--tm-brand-secondary-strong)]',
  'text-[var(--tm-text-primary)]">{item.score}分',
  'text-[var(--tm-chart-negative-text)]">扣{item.deduction}分',
  "actionLabel = '查看完整排名'",
]) {
  if (!rankingListSource.includes(required)) {
    throw new Error(`统一班级排名列表缺少连续行、轻量前三名或正确分值语义：${required}`);
  }
}

for (const forbidden of ['Top 5', 'rankBadgeClassName', 'bg-[#FFC107]', 'shadow-[#FFC107]', 'rounded-2xl border border-slate-100']) {
  if (source.includes(forbidden) || rankingListSource.includes(forbidden)) {
    throw new Error(`班级排行榜不应保留独立小卡片、硬编码名次色或英文数量标签：${forbidden}`);
  }
}

if (source.includes('rank: i + 1')) {
  throw new Error('班级排行榜名次不能在模拟数据生成时按原始顺序写死，应排序后重新计算并列名次');
}

if (source.includes('sortedItems[index - 1].rank')) {
  throw new Error('并列名次不能读取排序原始数据上的上一条 rank，否则并列项会得到空值，导致排名数字和背景消失');
}

for (const required of [
  'text-[var(--tm-brand-primary)]',
  '<PillSelectionControl',
  'ariaLabel="班级排行榜维度"',
  '<ReportDateRangeTabs',
  '<TextSelectionControl',
  'ariaLabel="排行榜年级筛选"',
  'bg-[var(--tm-page-plain-content-bg)]',
]) {
  if (!source.includes(required)) {
    throw new Error(`班级排行榜切换控件应使用品牌红，并分离44像素触控区与32像素可见高度，缺少：${required}`);
  }
}

for (const required of [
  'min-h-[var(--tm-selection-touch-height)]',
  'h-[var(--tm-selection-pill-visible-height)]',
  'border-[var(--tm-selection-pill-active-border)] bg-[var(--tm-selection-pill-active-bg)] text-[var(--tm-selection-pill-active-text)]',
  'border-[var(--tm-selection-pill-inactive-border)] bg-[var(--tm-selection-pill-inactive-bg)] text-[var(--tm-selection-pill-inactive-text)]',
]) {
  if (!pillSource.includes(required)) throw new Error(`班级排行榜维度筛选缺少统一胶囊约束：${required}`);
}

if (source.indexOf('<ReportDateRangeTabs') > source.indexOf('<TextSelectionControl')) {
  throw new Error('班级排行榜必须先展示日期切换，再展示年级筛选');
}

for (const required of [
  'grid h-[var(--tm-size-touch)] grid-cols-5',
  'bg-[var(--tm-page-plain-header-bg)]',
  'h-[var(--tm-report-date-indicator-height)] w-[var(--tm-report-date-indicator-width)]',
]) {
  if (!dateTabsSource.includes(required)) throw new Error(`排行榜与班级报告共用的日期栏缺少开放式五等分样式：${required}`);
}

for (const required of [
  'min-h-[var(--tm-selection-touch-height)]',
  'text-[var(--tm-selection-text-active)]',
  'text-[var(--tm-selection-text-inactive)]',
]) {
  if (!textSelectionSource.includes(required)) throw new Error(`排行榜年级筛选应使用无底色纯文字选择：${required}`);
}

if (!appSource.includes("currentView === 'class_leaderboard' || currentView === 'class_evaluation_records' ? 'bg-[var(--tm-page-plain-header-bg)]'")) {
  throw new Error('班级排行榜标题栏必须使用纯白标题栏背景');
}

for (const required of [
  'onOpenEvaluationRecords: () => void',
  'onClick={onOpenEvaluationRecords}',
  "navigateTo('class_evaluation_records')",
  "case 'class_evaluation_records': return '评价记录明细'",
  '<EvaluationRecordsLogView classes={activeSpaceClasses} />',
]) {
  if (!source.includes(required) && !appSource.includes(required)) {
    throw new Error(`评价记录“更多”应进入应用层独立页面，缺少：${required}`);
  }
}

for (const forbidden of ['showRecordsLog', '<EvaluationRecordsLogView onBack=', 'if (showRecordsLog)']) {
  if (source.includes(forbidden)) throw new Error(`排行榜不得通过局部条件返回替换页面：${forbidden}`);
}

for (const forbidden of ['text-blue-', 'text-indigo-', 'bg-indigo-', '#5B50F6']) {
  if (source.includes(forbidden)) {
    throw new Error(`班级排行榜的品牌选中与操作状态不应继续使用蓝紫色：${forbidden}`);
  }
}
