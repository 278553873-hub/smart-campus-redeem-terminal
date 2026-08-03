import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./PrincipalPeriodicReportView.tsx', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../data/principalPeriodicReports.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const feedbackSource = fs.readFileSync(new URL('../components/AssistantReportFeedback.tsx', import.meta.url), 'utf8');
const headerSource = fs.readFileSync(new URL('../components/AssistantSubpageHeader.tsx', import.meta.url), 'utf8');
const cssSource = fs.readFileSync(new URL('../index.css', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

for (const required of [
  "import PrincipalPeriodicReportView from './views/PrincipalPeriodicReportView';",
  "'principal_weekly_report'",
  "'principal_monthly_report'",
  "{currentView === 'principal_weekly_report' && (",
  "{currentView === 'principal_monthly_report' && (",
  'status={principalWeeklyReportTask.status}',
  'status={principalMonthlyReportTask.status}',
  'visibleStepCount={principalWeeklyReportTask.visibleStepCount}',
  'visibleStepCount={principalMonthlyReportTask.visibleStepCount}',
  'onRetry={principalWeeklyReportTask.retry}',
  'onRetry={principalMonthlyReportTask.retry}',
  "onOpenHistory={() => navigateTo('principal_weekly_history')}",
  "onOpenHistory={() => navigateTo('principal_monthly_history')}",
]) {
  requireText(appSource, required, `App 未完整接入校长周月报告：${required}`);
}

for (const required of [
  'report.analysisSteps.slice(0, visibleStepCount)',
  'report.loadingTitle',
  'report.metricsTitle',
  'report.judgementTitle',
  'report.findingsTitle',
  'report.actionsTitle',
  'report.notice',
  "label={kind === 'weekly' ? '往期建议' : '往期复盘'}",
  'reportData?: PrincipalPeriodicReportContent;',
  "status === 'empty'",
  "status === 'failed'",
  'principal-report-page',
]) {
  requireText(viewSource, required, `校长周月报告页缺少状态、内容或无障碍能力：${required}`);
}

requireText(feedbackSource, '重新生成', '报告生成失败后应提供明确的重试操作。');
requireText(headerSource, "backLabel = '返回'", '校长报告共享标题栏应提供明确返回入口。');
requireText(headerSource, 'focus-visible:ring-2', '校长报告共享标题栏应保留键盘焦点。');
requireText(viewSource, '<AssistantHistoryLink', '校长周月报告应使用图标加文字的历史入口。');
requireText(cssSource, '.principal-report-screen-background', '校长报告应使用屏幕级统一渐变背景。');
requireText(cssSource, 'var(--tm-role-principal-accent-soft)', '校长报告渐变应引用管理金角色令牌。');

for (const required of [
  '正在核对上周学校数据',
  '正在生成本周管理建议',
  '上周核心数据',
  '本周优先判断',
  '上周关键信号',
  '本周管理动作',
  '正在汇总上月学校数据',
  '正在生成上月学校复盘',
  '月度核心数据',
  '月度总体判断',
  '改善进展',
  '持续问题',
  '下月管理动作',
  '本报告由AI基于学校上一完整自然周的评价数据生成',
  '本报告由AI基于学校上一个完整自然月的评价数据生成',
]) {
  requireText(dataSource, required, `校长周月报告示例数据缺少关键内容：${required}`);
}

forbidText(viewSource, '<textarea', '校长周月报告页不应开放对话输入。');
forbidText(viewSource, '发消息', '校长周月报告页不应出现聊天入口。');

console.log('PrincipalPeriodicReportView entry assertions passed');
