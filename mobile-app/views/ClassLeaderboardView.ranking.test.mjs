import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./ClassLeaderboardView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const accessSource = readFileSync(new URL('../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');
const pillSource = readFileSync(new URL('../components/ui/PillSelectionControl.tsx', import.meta.url), 'utf8');
const rankingListSource = readFileSync(new URL('../components/ui/ClassRankingList.tsx', import.meta.url), 'utf8');
const periodCalendarSource = readFileSync(new URL('../components/report/ReportPeriodCalendar.tsx', import.meta.url), 'utf8');
const bottomSheetSource = readFileSync(new URL('../components/ui/MobileBottomSheet.tsx', import.meta.url), 'utf8');
const guidelineSource = readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');

for (const required of [
  'const getRankedClasses =',
  '.sort((left, right) => right.score - left.score',
  'previousScore === item.score ? previousRank : index + 1',
  'const [showFullRanking, setShowFullRanking] = useState(false)',
  'onViewAll={rankings.length > 5 ? () => setShowFullRanking(true) : undefined}',
  'title={`${activeGrade}完整排名`}',
  'ariaLabel="完整排名评价维度"',
  'items={rankings}',
]) {
  if (!source.includes(required)) throw new Error(`班级排行榜排序、并列名次或完整排名缺少：${required}`);
}

for (const required of [
  "export type ClassLeaderboardSettlementCycle = 'week' | 'month'",
  'classLeaderboardSettlementCycle?: ClassLeaderboardSettlementCycle',
]) {
  if (!accessSource.includes(required)) throw new Error(`学校来源应配置排行榜结算方式，缺少：${required}`);
}

for (const required of [
  "classLeaderboardSettlementCycle: 'week'",
  "settlementCycle={activeTeacherSpace.classLeaderboardSettlementCycle ?? 'week'}",
]) {
  if (!appSource.includes(required)) throw new Error(`应用层应向排行榜传入学校结算方式，缺少：${required}`);
}

for (const required of [
  'settlementCycle: ClassLeaderboardSettlementCycle',
  'const createSettlementPeriods =',
  "if (settlementCycle === 'month')",
  "type: 'week'",
  'title={periodPickerTitle}',
  '<ReportPeriodCalendar',
  'aria-label={`查看上一${periodUnitLabel}`}',
  'aria-label={`查看下一${periodUnitLabel}`}',
  "aria-label={`打开${settlementCycle === 'week' ? '周历' : '月份'}选择，当前${selectedPeriodLabel}`}",
  'text-[length:var(--tm-font-size-body)]',
  'setSelectedPeriodId(periodId)',
]) {
  if (!source.includes(required)) throw new Error(`排行榜应只按学校结算周期切换历史榜单，缺少：${required}`);
}

for (const forbidden of [
  'ReportDateRangeTabs',
  "type TimeRange =",
  "label: '今日'",
  "label: '本学期'",
  "label: '自定义'",
  'Math.random',
  '${selectedPeriod?.label} · ${activeGrade}',
]) {
  if (source.includes(forbidden)) throw new Error(`排行榜不得保留查询型日期栏或随机跳榜：${forbidden}`);
}

const periodSwitcherIndex = source.indexOf('aria-label="排行榜周期切换"');
const rankingSectionIndex = source.indexOf('<section className="rounded-[var(--tm-radius-card)]');
const gradeFilterIndex = source.indexOf('aria-label="班级排行榜年级筛选"');
const rankingListIndex = source.indexOf('ariaLabel="班级排行榜前五名"');
if (!(periodSwitcherIndex >= 0 && periodSwitcherIndex < rankingSectionIndex && gradeFilterIndex > rankingSectionIndex && rankingListIndex > gradeFilterIndex)) {
  throw new Error('周期切换必须位于卡片上方，年级和评价维度必须位于班级排行榜卡片内。');
}

for (const required of [
  '<select',
  'aria-label="班级排行榜年级筛选"',
  'text-[length:var(--tm-font-size-compact)]',
  '<PillSelectionControl',
  'ariaLabel="班级排行榜维度"',
]) {
  if (!source.includes(required)) throw new Error(`排行榜局部筛选缺少：${required}`);
}

for (const required of [
  'const recentRecords = [',
  'aria-label="全校最新评价记录"',
  'role="listitem"',
  'record.score > 0',
  'onClick={onOpenEvaluationRecords}',
]) {
  if (!source.includes(required)) throw new Error(`评价记录应保持全校独立口径并同时表达加扣分，缺少：${required}`);
}

for (const required of [
  'grid min-h-[58px] grid-cols-[32px_minmax(0,1fr)_auto]',
  'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]',
  'text-[var(--tm-text-primary)]">{item.score}分',
]) {
  if (!rankingListSource.includes(required)) throw new Error(`统一班级排名列表缺少：${required}`);
}

for (const required of [
  'min-h-[var(--tm-selection-touch-height)]',
  'h-[var(--tm-selection-pill-visible-height)]',
]) {
  if (!pillSource.includes(required)) throw new Error(`排行榜维度筛选缺少统一触控或可见高度：${required}`);
}

if (source.includes('ActivityIcon')) throw new Error('评价记录卡片标题不应展示图标。');
if (source.includes('weekDisplay="calendar"')) throw new Error('排行榜应直接复用班级评价报表的公共周期选择样式。');
for (const required of ["headerAction={settlementCycle === 'week' && currentPeriod ? {", "label: '本周'", 'setSelectedPeriodId(currentPeriod.id)', 'setIsPeriodSheetOpen(false)']) {
  if (!source.includes(required)) throw new Error(`排行榜选择周弹窗标题栏缺少本周快捷定位能力：${required}`);
}
for (const required of ['headerAction?: {', 'headerAction.onClick', 'h-[var(--tm-size-touch)]', 'h-7', 'rounded-[8px]', 'border-[var(--tm-brand-primary)]', 'text-[var(--tm-brand-primary)]']) {
  if (!bottomSheetSource.includes(required)) throw new Error(`公共底部弹窗标题栏操作位缺少：${required}`);
}
for (const forbidden of ['shortcutLabel="本周"', 'onShortcut=', 'onSelect(currentPeriod.id)']) {
  if (periodCalendarSource.includes(forbidden)) throw new Error(`本周快捷操作不应侵入月份周历导航：${forbidden}`);
}

for (const required of [
  '排行榜页面只包含“班级排行榜”和“评价记录”两个业务板块',
  '按周结算的学校只允许切换当前周和历史周',
  '周期切换控件直接位于页面标题栏下方',
  '选择周弹窗标题栏右侧展示“本周”快捷按钮',
  '年级和评价维度都是排行榜局部条件',
  '评价记录不继承排行榜的结算周期、年级或评价维度',
]) {
  if (!guidelineSource.includes(required)) throw new Error(`教师手机端规范未固化排行榜结算与筛选作用域：${required}`);
}

console.log('Class leaderboard settlement and scope checks passed.');
