import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./TermReportView.tsx', import.meta.url), 'utf8');
const mainViewStart = source.indexOf('const TermReportView');
if (mainViewStart < 0) {
  throw new Error('找不到 TermReportView 主组件');
}
const mainView = source.slice(mainViewStart);

const slice = (startMarker, endMarker) => {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + 1);
  if (start < 0 || end < 0) throw new Error(`找不到源码片段：${startMarker} -> ${endMarker}`);
  return source.slice(start, end);
};

const anchorBar = slice('const MobileAnchorBar', '// --- MAIN WRAPPER ---');
const headerBlock = slice('{/* Header */}', '{/* Mobile Anchor Navigation');
const subjectReportPage = slice('const PageSubjectReportsWithTabs', 'const PageFuturePotential');

for (const forbidden of [
  'viewMode',
  'setViewMode',
  'handlePrint',
  'window.print',
  '<Printer',
  "['mobile', 'a4'].map",
  "viewMode === 'a4'",
  "viewMode === 'mobile'",
]) {
  if (mainView.includes(forbidden)) {
    throw new Error(`学期报告手机端不应保留手机/A4切换或打印入口：${forbidden}`);
  }
}

for (const required of [
  '] : [];',
  '{isMale && mobileAnchorItems.length > 0 && (',
  '<MobileAnchorBar activeSection={activeSection} onNavigate={scrollToSection} items={mobileAnchorItems} />',
  '{mobilePages.map((page, i) => <React.Fragment key={i}>{page}</React.Fragment>)}',
  '<PageSubjectReportsWithTabs',
  "onClick={showSubjectSubPage ? () => setShowSubjectSubPage(false) : onBack}",
  "{showSubjectSubPage ? '学科报告' : '学期报告'}",
]) {
  if (!mainView.includes(required)) {
    throw new Error(`学期报告手机端需要保留连续阅读与学科详情能力：${required}`);
  }
}


for (const forbidden of ['border-b', 'shadow-sm']) {
  if (anchorBar.includes(forbidden)) {
    throw new Error(`学期报告锚点栏不应产生多余横线：${forbidden}`);
  }
}

for (const forbidden of ['border-b border-slate-100', 'shadow-sm']) {
  if (headerBlock.includes(forbidden)) {
    throw new Error(`学期报告顶部栏不应产生多余横线：${forbidden}`);
  }
}


for (const forbidden of [
  'title="学科详情"',
  'Subject Details',
  'Semester Grade',
  '<X className="w-4 h-4 text-slate-500" />',
  'onBack?: () => void',
]) {
  if (subjectReportPage.includes(forbidden)) {
    throw new Error(`学科报告页不应保留旧标题、关闭按钮或英文文案：${forbidden}`);
  }
}

for (const required of [
  '学期等级',
  'const PageSubjectReportsWithTabs = ({ student, mode = \'a4\', id, initialSubject }',
]) {
  if (!subjectReportPage.includes(required)) {
    throw new Error(`学科报告页缺少中文化或返回逻辑配套结构：${required}`);
  }
}

console.log('term report mobile-only assertions passed');
