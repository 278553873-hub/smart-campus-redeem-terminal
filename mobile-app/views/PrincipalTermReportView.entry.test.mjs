import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./PrincipalTermReportView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const sheetSource = fs.readFileSync(new URL('../components/ui/MobileNoticeSheet.tsx', import.meta.url), 'utf8');

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
  'generated={principalTermReportGenerated}',
  'onGenerated={() => setPrincipalTermReportGenerated(true)}',
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
  '学期核心数据',
  '总体判断',
  '班级与教师使用情况',
  '优秀成果与亮点',
  '代表性实践',
  '五育与指标体系观察',
  '需要关注的问题',
  '下学期深化建议',
  '本报告由AI基于本学期学校评价数据生成，仅供学校管理与工作复盘参考',
]) {
  requireText(viewSource, required, `学期学校报告缺少内容或状态：${required}`);
}

requireText(viewSource, 'aria-label="返回"', '学期报告页应提供明确返回入口。');
requireText(viewSource, 'aria-label="查看往期学期报告"', '学期报告页应提供往期报告入口。');
requireText(viewSource, 'reportData?: PrincipalTermReportContent;', '学期报告页应支持复用历史报告内容。');
requireText(viewSource, 'focus-visible:ring-2', '学期报告交互控件应保留键盘焦点。');
forbidText(viewSource, '<textarea', '当前学期报告页不应开放对话输入。');
forbidText(viewSource, '发消息', '当前学期报告页不应出现聊天入口。');

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
