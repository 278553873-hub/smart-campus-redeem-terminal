import fs from 'node:fs';

const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const taskSource = fs.readFileSync(new URL('../hooks/useReportGenerationTask.ts', import.meta.url), 'utf8');
const pickerSource = fs.readFileSync(new URL('../components/HomeroomClassPickerSheet.tsx', import.meta.url), 'utf8');
const headerSource = fs.readFileSync(new URL('../components/AssistantSubpageHeader.tsx', import.meta.url), 'utf8');
const historyLinkSource = fs.readFileSync(new URL('../components/AssistantHistoryLink.tsx', import.meta.url), 'utf8');
const cssSource = fs.readFileSync(new URL('../index.css', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

for (const required of [
  'simulateLoading={false}',
  'scrollPositionsRef',
  'pendingScrollTopRef',
  'rememberCurrentScroll()',
  'scrollPositionsRef.current[prev] ?? 0',
]) {
  requireText(appSource, required, `助理报告导航缺少缓存直开或滚动恢复：${required}`);
}

for (const required of [
  "'principal_weekly_report'",
  "'principal_weekly_history'",
  "'principal_monthly_report'",
  "'principal_monthly_history'",
  "'principal_term_report'",
  "'principal_term_history'",
  'const hasPrincipalReportBackground = PRINCIPAL_REPORT_VIEWS.includes(currentView);',
  'principal-report-screen-background absolute inset-0 overflow-hidden',
  'const hasHeadteacherReportBackground = HEADTEACHER_REPORT_VIEWS.includes(currentView);',
  'headteacher-report-screen-background absolute inset-0 overflow-hidden',
]) {
  requireText(appSource, required, `校长报告子页面未完整接入屏幕级背景：${required}`);
}

for (const required of [
  'h-11 shrink-0',
  'bg-[var(--tm-bg-page-glass)]',
  'backdrop-blur-xl',
  'h-11 w-11',
]) {
  requireText(headerSource, required, `校长报告标题栏未与教师端子页面规范对齐：${required}`);
}

requireText(cssSource, '.principal-report-screen-background', '校长报告缺少屏幕级红金渐变背景。');
requireText(cssSource, '.headteacher-report-screen-background', '班主任助理报告缺少铺满屏幕的背景。');
requireText(cssSource, 'var(--tm-role-principal-glow-primary)', '校长报告背景应保留角色红氛围光。');
requireText(cssSource, 'var(--tm-role-principal-glow-secondary)', '校长报告背景应保留管理金氛围光。');

for (const required of [
  'min-h-11',
  '<History',
  '<span>{label}</span>',
  'aria-label={`查看${label}`}',
]) {
  requireText(historyLinkSource, required, `助理历史入口缺少文字、图标或触控能力：${required}`);
}

requireText(headerSource, 'var(--mini-program-capsule-right-inset,0px)', '助理标题栏必须避让微信胶囊。');

for (const required of [
  "export type ReportGenerationTaskStatus = 'idle' | 'generating'",
  'startedAtRef',
  "if (status !== 'generating') return;",
  "setStatus(resultRef.current)",
  'retry',
  'reset',
]) {
  requireText(taskSource, required, `应用层报告任务缺少持久状态能力：${required}`);
}

for (const required of [
  'role="dialog"',
  'aria-modal="true"',
  "event.key === 'Escape'",
  "event.key !== 'Tab'",
  'selectedButtonRef',
  'previousActiveElement?.focus()',
  'var(--tm-shadow-sheet)',
  'var(--tm-focus-ring)',
]) {
  requireText(pickerSource, required, `班级选择抽屉缺少焦点管理或设计令牌：${required}`);
}

console.log('Assistant report interaction assertions passed');
