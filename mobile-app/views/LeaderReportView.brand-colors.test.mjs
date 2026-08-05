import { readFileSync } from 'node:fs';

const viewSource = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');
const tokenSource = readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');

for (const required of [
  'export const teacherBrandSemantic',
  'export const teacherReportChartSemantic',
  "'--tm-brand-primary': teacherBrandSemantic.primary",
  "'--tm-chart-data-default': teacherReportChartSemantic.dataDefault",
  "'--tm-chart-percentage-low': teacherReportChartSemantic.percentage.low.fill",
  "'--tm-chart-percentage-medium': teacherReportChartSemantic.percentage.medium.fill",
  "'--tm-chart-percentage-high': teacherReportChartSemantic.percentage.high.fill",
  "'--tm-chart-positive-text': teacherReportChartSemantic.positiveText",
  "'--tm-chart-negative-text': teacherReportChartSemantic.negativeText",
]) {
  if (!tokenSource.includes(required)) {
    throw new Error(`教师端最新 Token 缺少学校报表需要的语义映射：${required}`);
  }
}

for (const required of [
  'teacherBrandCssVariables',
  'teacherBrandSemantic',
  'teacherReportChartSemantic',
  'style={teacherBrandCssVariables as React.CSSProperties}',
  'bg-[var(--tm-page-plain-content-bg)]',
  'bg-[var(--tm-bg-surface)]',
  'bg-[var(--tm-brand-primary)]',
  'bg-[var(--tm-brand-secondary-soft)]',
  'text-[var(--tm-chart-positive-text)]',
  'text-[var(--tm-chart-negative-text)]',
]) {
  if (!viewSource.includes(required)) {
    throw new Error(`学校数据报表未完整接入品牌或语义 Token：${required}`);
  }
}

if (viewSource.includes('teacherFiveEducationSemantic')) {
  throw new Error('学校数据报表不应继续使用偏深的旧五育品牌色板');
}

for (const legacyColor of ['bg-[#eef7f3]', 'bg-emerald-', 'text-emerald-', 'bg-blue-', 'text-blue-']) {
  if (viewSource.includes(legacyColor)) {
    throw new Error(`学校数据报表仍残留旧主色：${legacyColor}`);
  }
}
