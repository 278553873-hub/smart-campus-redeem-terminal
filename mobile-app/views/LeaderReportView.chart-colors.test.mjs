import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');

for (const required of [
  'teacherReportChartSemantic',
  'virtue: teacherReportChartSemantic.education.virtue',
  'wisdom: teacherReportChartSemantic.education.wisdom',
  'fitness: teacherReportChartSemantic.education.fitness',
  'aesthetic: teacherReportChartSemantic.education.aesthetic',
  'labor: teacherReportChartSemantic.education.labor',
  'teacherReportChartSemantic.grid',
  'teacherReportChartSemantic.tooltip',
]) {
  if (!source.includes(required)) {
    throw new Error(`学校数据报表未完整消费最新图表语义 Token：${required}`);
  }
}

for (const required of [
  "type PercentageLevel = 'low' | 'medium' | 'high'",
  "percent >= 80 ? 'high' : percent >= 60 ? 'medium' : 'low'",
  'bg-[var(--tm-chart-percentage-low)]',
  'text-[var(--tm-chart-percentage-low-text)]',
  'bg-[var(--tm-chart-percentage-low-soft)]',
  'bg-[var(--tm-chart-percentage-medium)]',
  'text-[var(--tm-chart-percentage-medium-text)]',
  'bg-[var(--tm-chart-percentage-high)]',
  'text-[var(--tm-chart-percentage-high-text)]',
  'teacherReportChartSemantic.percentage[getPercentageLevel(percent)].fill',
  'getCoverageChartColor(percent)',
  'getCoverageChartColor(rate(item.covered, item.total))',
  'getCoveragePercentageTone(percent)',
  'getCoveragePercentageTone(rate(selectedGrade.covered, selectedGrade.total)).text',
]) {
  if (!source.includes(required)) {
    throw new Error(`年级、班级与指标覆盖率需要统一消费百分比语义 Token，缺少：${required}`);
  }
}

const overviewStart = source.indexOf('const OverviewCard');
const overviewEnd = source.indexOf('interface TeacherRowProps', overviewStart);
const overviewSource = source.slice(overviewStart, overviewEnd);
for (const required of ['tone="brand"', 'tone="secondary"', 'tone="reward"']) {
  if (!overviewSource.includes(required)) {
    throw new Error(`数据总览缺少差异化类型色：${required}`);
  }
}

const indicatorStart = source.indexOf('const IndicatorUsageSummaryCard');
const indicatorEnd = source.indexOf('const IndicatorUsageSheet', indicatorStart);
const indicatorSource = source.slice(indicatorStart, indicatorEnd);
for (const required of [
  'const tone = getCoveragePercentageTone(item.coverageRate)',
  'bg-[var(--tm-chart-grid)]',
]) {
  if (!indicatorSource.includes(required)) {
    throw new Error(`指标覆盖率需要使用与年级覆盖率相同的百分比语义 Token，缺少：${required}`);
  }
}

for (const forbidden of [
  'tm-brand-primary-soft',
  'tm-brand-secondary-soft',
  'text-[var(--tm-brand-primary)]',
  'text-[var(--tm-brand-primary-pressed)]',
  'bg-[var(--tm-bg-surface-muted)]',
  'tm-chart-data-default',
  'tm-chart-series-total',
  "tone: 'brand'",
  "tone: 'secondary'",
  "tone: 'data'",
  "tone: 'comparison'",
]) {
  if (indicatorSource.includes(forbidden)) {
    throw new Error(`指标使用情况不应用品牌红橙暗示预警：${forbidden}`);
  }
}

const gradeRecordsStart = source.indexOf('const GradeEvaluationRecordsChart');
const classCoverageStart = source.indexOf('const ClassCoverageChart', gradeRecordsStart);
const gradeRecordsSource = source.slice(gradeRecordsStart, classCoverageStart);
for (const required of [
  'color: teacherReportChartSemantic.dataDefault',
  'color: teacherReportChartSemantic.dataDefaultText',
]) {
  if (!gradeRecordsSource.includes(required)) {
    throw new Error(`年级评价数需要使用普通数据蓝色语义，缺少：${required}`);
  }
}

const classRecordsStart = source.indexOf('const ClassEvaluationRecordsChart');
const viewStart = source.indexOf('const LeaderReportView', classRecordsStart);
const classRecordsSource = source.slice(classRecordsStart, viewStart);
for (const required of [
  'color: teacherReportChartSemantic.dataDefault',
  'color: teacherReportChartSemantic.dataDefaultText',
]) {
  if (!classRecordsSource.includes(required)) {
    throw new Error(`班级评价数需要使用普通数据蓝色语义，缺少：${required}`);
  }
}
