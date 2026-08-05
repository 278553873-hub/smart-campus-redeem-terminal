import { readFileSync } from 'node:fs';

const viewSource = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');
const serviceSource = readFileSync(new URL('../services/leaderReportService.ts', import.meta.url), 'utf8');

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
  'getDateRangeError',
  'getCustomRangeCompactLabel',
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
  'aria-label="打开自定义时间段选择"',
  '自定义时间段',
  'type="date"',
  'activePeriod === \'custom\'',
]) {
  requireText(viewSource, required, `学校数据报表自定义时间段交互缺少：${required}`);
}

requireText(viewSource, 'grid h-[var(--tm-report-filter-row-height)] grid-cols-5', '学校报表时间筛选应使用与类型切换相同高度的五等分单行布局');
requireText(viewSource, 'h-[var(--tm-report-period-pill-height)]', '五等分时间筛选需要使用独立 Token 控制紧凑选中色块高度');
requireText(viewSource, 'px-[var(--tm-report-period-pill-inline)]', '时间筛选色块需要随文字宽度收敛并复用水平留白 Token');

for (const forbidden of [
  '按开始日期和结束日期统计',
  '>选择</span>',
  '自定义时间段会同步刷新全部报表模块',
  '当前待确认范围',
  '不能选择未来日期；开始日期不能晚于结束日期。',
]) {
  if (viewSource.includes(forbidden)) {
    throw new Error(`自定义时间段界面不应出现低价值说明文案：${forbidden}`);
  }
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
