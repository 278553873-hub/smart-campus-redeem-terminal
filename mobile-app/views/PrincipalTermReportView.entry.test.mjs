import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./PrincipalTermReportView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const sheetSource = fs.readFileSync(new URL('../components/ui/MobileNoticeSheet.tsx', import.meta.url), 'utf8');
const headerSource = fs.readFileSync(new URL('../components/AssistantSubpageHeader.tsx', import.meta.url), 'utf8');
const cardsSource = fs.readFileSync(new URL('../components/assistant-report/AssistantReportCards.tsx', import.meta.url), 'utf8');
const adapterSource = fs.readFileSync(new URL('../domain/assistantReportAdapters.ts', import.meta.url), 'utf8');
const contractSource = fs.readFileSync(new URL('../domain/assistantReport.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

for (const required of [
  "import PrincipalTermReportView from './views/PrincipalTermReportView';",
  "'principal_term_report'",
  "{currentView === 'principal_term_report' && (",
  'status={principalTermReportTask.status}',
  'visibleStepCount={principalTermReportTask.visibleStepCount}',
  'onRetry={principalTermReportTask.retry}',
  "onOpenHistory={() => navigateTo('principal_term_history')}",
]) {
  requireText(appSource, required, `App 未完整接入学期学校报告：${required}`);
}

for (const required of [
  '正在核对本学期学校数据',
  '正在分析班级与教师使用情况',
  '正在提炼典型成果与重点问题',
  '正在生成学校学期报告',
  '学生综合素质评价系统学期运营报告',
  '<AssistantReportCards',
  'resolveAssistantReportDocument(',
]) {
  requireText(viewSource, required, `学期学校报告缺少内容或状态：${required}`);
}

requireText(headerSource, "backLabel = '返回'", '学期报告页应通过共享标题栏提供明确返回入口。');
requireText(viewSource, 'label="往期报告"', '学期报告页应提供带文字的往期报告入口。');
requireText(viewSource, '<AssistantHistoryLink', '学期报告应复用图标加文字的历史入口。');
requireText(viewSource, 'reportData?: PrincipalTermReportContent;', '学期报告页应支持复用历史报告内容。');
requireText(viewSource, 'reportPayload?: unknown;', '学期报告页应承接接口返回的结构化报告。');
requireText(headerSource, 'focus-visible:ring-2', '学期报告交互控件应保留键盘焦点。');
requireText(viewSource, "status === 'empty'", '学期报告应处理无有效数据状态。');
requireText(viewSource, "status === 'failed'", '学期报告应处理生成失败状态。');
requireText(viewSource, 'principal-report-page', '学期报告应使用校长助理渐变背景。');
forbidText(viewSource, 'bg-[var(--tm-bg-surface)] px-5 pb-6 pt-5', '学期报告首屏不应使用整块白底截断屏幕渐变。');
forbidText(viewSource, '<textarea', '当前学期报告页不应开放对话输入。');
forbidText(viewSource, '发消息', '当前学期报告页不应出现聊天入口。');

for (const required of ["key: 'conclusion'", "key: 'actions'", "key: 'metrics'", "['usage', report.usage]", "['highlights', report.highlights]", "key: 'practices'", "['indicator_insights', report.indicatorInsights]", "['concerns', report.concerns]"]) {
  requireText(adapterSource, required, `学期报告适配器缺少区块：${required}`);
}
requireText(contractSource, "cardOrder: ['conclusion', 'actions', 'metrics', 'usage', 'highlights', 'practices', 'indicator_insights', 'concerns']", '学期报告应先展示总体判断和行动。');
requireText(cardsSource, '<MobileBottomSheet', '学期报告证据应通过公共底部抽屉披露。');

for (const required of [
  'role="dialog"',
  'aria-modal="true"',
  "event.key === 'Escape'",
  'h-11 w-11',
  'min-h-12 w-full',
  'var(--tm-shadow-sheet)',
]) {
  requireText(sheetSource, required, `统一提示浮层缺少无障碍或设计令牌：${required}`);
}

console.log('PrincipalTermReportView entry assertions passed');
