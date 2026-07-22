import fs from 'node:fs';

const historyViewSource = fs.readFileSync(new URL('./PrincipalReportHistoryView.tsx', import.meta.url), 'utf8');
const historyDataSource = fs.readFileSync(new URL('../data/principalReportHistory.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const prdSource = fs.readFileSync(new URL('../../docs/PRD-校长助理周月学期报告.md', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

for (const required of [
  "import PrincipalReportHistoryView from './views/PrincipalReportHistoryView';",
  "'principal_weekly_history'",
  "'principal_monthly_history'",
  "'principal_term_history'",
  "{currentView === 'principal_weekly_history' && (",
  "{currentView === 'principal_monthly_history' && (",
  "{currentView === 'principal_term_history' && (",
  'kind="weekly"',
  'kind="monthly"',
  'kind="term"',
]) {
  requireText(appSource, required, `App 未完整接入校长报告历史：${required}`);
}

for (const required of [
  "weekly: '往期管理建议'",
  "monthly: '往期学校复盘'",
  "term: '往期学期报告'",
  'setSelectedReport(report)',
  'setSelectedReport(null)',
  'reportData={selectedReport.report}',
  'generated',
  'aria-label="返回当前报告"',
  'focus-visible:ring-2',
  '生成于{report.generatedDate}',
]) {
  requireText(historyViewSource, required, `校长报告历史页缺少列表、详情或返回能力：${required}`);
}

for (const required of [
  'principal-weekly-2026-07-13',
  'principal-weekly-2026-07-06',
  'principal-monthly-2026-05',
  'principal-monthly-2026-04',
  'principal-term-2025-2026-1',
  'principal-term-2024-2025-2',
  'PRINCIPAL_REPORT_HISTORY',
]) {
  requireText(historyDataSource, required, `校长报告历史数据缺少演示周期：${required}`);
}

for (const required of [
  '周、月、学期报告生成完成后，正式报告页右上角均展示历史图标',
  '三类历史报告分别展示，不混在同一列表',
  '历史详情 → 历史列表 → 当前报告',
  '历史报告始终读取生成时保存的内容和数据快照',
  '历史列表只返回当前学校、当前用户有权查看的成功报告',
]) {
  requireText(prdSource, required, `校长助理PRD缺少历史规则：${required}`);
}

forbidText(historyViewSource, '重新生成', '历史报告页不应提供重新生成。');
forbidText(historyViewSource, '报告摘要', '历史列表不应展示报告摘要。');

console.log('PrincipalReportHistoryView entry assertions passed');
