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

if (viewSource.includes('grid-cols-5')) {
  throw new Error('时间筛选不应把五个选项硬塞进五等分网格，手机端容易误触');
}

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

for (const required of [
  'min-h-[44px]',
  'rounded-t-[32px]',
  'max-h-[82%]',
  'bg-black/40 backdrop-blur-sm',
  'disabled={Boolean(dateRangeError)}',
  "isFilterPinned ? 'pointer-events-auto' : 'pointer-events-none'",
]) {
  requireText(viewSource, required, `自定义时间段底部抽屉或吸顶筛选需要满足手机触控和状态细节，缺少：${required}`);
}
