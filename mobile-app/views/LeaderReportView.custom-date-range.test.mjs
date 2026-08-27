import { readFileSync } from 'node:fs';

const viewSource = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');
const serviceSource = readFileSync(new URL('../services/leaderReportService.ts', import.meta.url), 'utf8');
const reportDateTabsSource = readFileSync(new URL('../components/report/ReportDateRangeTabs.tsx', import.meta.url), 'utf8');

const requireText = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

for (const required of [
  "type LeaderReportPeriod = 'today' | 'week' | 'month' | 'term' | 'custom'",
  'export interface LeaderReportDateRange',
  'export type LeaderReportQuery',
  'getCustomPeriodScale',
  'getLeaderReportSnapshot = async (query: LeaderReportQuery)',
]) {
  requireText(serviceSource, required, `学校数据报表服务需要支持自定义时间段查询，缺少：${required}`);
}

for (const required of [
  'showCustomDateSheet',
  'draftDateRange',
  'confirmedDateRange',
  'openCustomDateSheet',
  'applyCustomDateRange',
  'handleReportPeriodChange',
  'getDateRangeError',
  'getCustomQuickDateRange',
  'customDateQuickRanges',
  "{ key: 'yesterday', label: '昨天' }",
  "{ key: 'lastWeek', label: '上周' }",
  "{ key: 'lastMonth', label: '上月' }",
  '设为{quickRange.label}',
  '选择统计时间',
  '开始日期',
  '结束日期',
  '确认使用',
  '不能选择未来日期',
  '开始日期不能晚于结束日期',
  'type="date"',
  'activePeriod === \'custom\'',
]) {
  requireText(viewSource, required, `学校数据报表自定义时间段交互缺少：${required}`);
}

for (const required of [
  '<ReportDateRangeTabs',
  'items={leaderReportDateTabs}',
  'ariaLabel="学生评价报表时间范围"',
  '自定义时间：',
  '{confirmedDateRange.startDate} 至 {confirmedDateRange.endDate}',
  'aria-label="修改自定义日期范围"',
  'onClick={openCustomDateSheet}',
  'after:-inset-1.5',
  '<PencilLine aria-hidden="true"',
]) {
  requireText(viewSource, required, `学校报表日期选择需要复用班级报告交互，缺少：${required}`);
}
requireText(reportDateTabsSource, 'grid h-[var(--tm-size-touch)] grid-cols-5', '学校报表日期筛选应复用班级报告的五等分开放式文字页签');
requireText(reportDateTabsSource, 'h-[var(--tm-report-date-indicator-height)]', '学校报表日期选中态应复用班级报告底部短线');

for (const forbidden of ['--tm-report-period-pill-height', '--tm-report-period-pill-inline', '--tm-report-period-font-size']) {
  if (viewSource.includes(forbidden)) {
    throw new Error(`学校报表日期筛选不应保留旧实底胶囊 Token：${forbidden}`);
  }
}

for (const forbidden of [
  '按开始日期和结束日期统计',
  '>选择</span>',
  '>修改日期</',
  '自定义时间段会同步刷新全部报表模块',
  '当前待确认范围',
  '不能选择未来日期；开始日期不能晚于结束日期。',
]) {
  if (viewSource.includes(forbidden)) {
    throw new Error(`自定义时间段界面不应出现低价值说明文案：${forbidden}`);
  }
}

const periodChangeStart = viewSource.indexOf('const handleReportPeriodChange');
const periodChangeEnd = viewSource.indexOf('const applyCustomDateRange', periodChangeStart);
const periodChangeSource = viewSource.slice(periodChangeStart, periodChangeEnd);
for (const required of [
  "if (confirmedDateRange)",
  "setActivePeriod('custom')",
  'return;',
  'openCustomDateSheet()',
]) {
  requireText(periodChangeSource, required, `已有自定义日期时应在当前页面会话内直接恢复，缺少：${required}`);
}

const customDateSheetStart = viewSource.indexOf('{showCustomDateSheet && (');
const classCoverageSheetStart = viewSource.indexOf('{showClassCoverageSheet', customDateSheetStart);
const customDateSheetSource = viewSource.slice(customDateSheetStart, classCoverageSheetStart);

if (customDateSheetSource.includes('leaderReportPeriods.slice(0, 3)')) {
  throw new Error('自定义时间段快捷操作不应继续复用今日/本周/本月，应使用昨天/上周/上月');
}

for (const forbidden of ['设为今日', '设为本周', '设为本月']) {
  if (customDateSheetSource.includes(forbidden)) {
    throw new Error(`自定义时间段快捷操作不应出现低价值选项：${forbidden}`);
  }
}

for (const required of [
  'min-h-[44px]',
  'rounded-t-[32px]',
  'max-h-[82%]',
  'bg-[var(--tm-mask)] backdrop-blur-sm',
  'disabled={Boolean(dateRangeError)}',
  "activePeriod === 'custom' && confirmedDateRange",
]) {
  requireText(viewSource, required, `自定义时间段底部抽屉或静态筛选需要满足手机触控和状态细节，缺少：${required}`);
}
