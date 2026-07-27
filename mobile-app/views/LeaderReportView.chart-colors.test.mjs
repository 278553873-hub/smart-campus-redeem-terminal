import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');

for (const required of [
  "type CoverageLevel = 'low' | 'medium' | 'high'",
  "percent >= 80 ? 'high' : percent >= 60 ? 'medium' : 'low'",
  'low: teacherBrandSemantic.negative',
  'medium: teacherBrandSemantic.secondary',
  'high: teacherBrandSemantic.positive',
  'getCoverageChartColor(percent)',
  'getCoverageChartColor(targetPercent)',
  'getCoverageTone(percent)',
  'getCoverageTone(rate(selectedGrade.covered, selectedGrade.total)).text',
]) {
  if (!source.includes(required)) {
    throw new Error(`覆盖率需要按低于60%、60%至80%、80%以上统一映射三档颜色，缺少：${required}`);
  }
}

if (source.includes('const coverageChartColor = teacherBrandSemantic.positive')) {
  throw new Error('覆盖率图表不得退化为固定绿色');
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
for (const required of ["tone: 'brand'", "tone: 'secondary'", "item.tone === 'brand'"]) {
  if (!indicatorSource.includes(required)) {
    throw new Error(`二、三级指标覆盖率需要保持品牌红与辅助橙的层级差异，缺少：${required}`);
  }
}

const gradeRecordsStart = source.indexOf('const GradeEvaluationRecordsChart');
const classCoverageStart = source.indexOf('const ClassCoverageChart', gradeRecordsStart);
const gradeRecordsSource = source.slice(gradeRecordsStart, classCoverageStart);
for (const required of [
  'color: teacherBrandSemantic.primary',
  'color: `${teacherBrandSemantic.primaryHover}CC`',
  'color: teacherBrandSemantic.primaryPressed',
]) {
  if (!gradeRecordsSource.includes(required)) {
    throw new Error(`年级评价数需要使用品牌红系列，缺少：${required}`);
  }
}

const classRecordsStart = source.indexOf('const ClassEvaluationRecordsChart');
const viewStart = source.indexOf('const LeaderReportView', classRecordsStart);
const classRecordsSource = source.slice(classRecordsStart, viewStart);
for (const required of [
  'color: teacherBrandSemantic.secondary',
  'color: `${teacherBrandSemantic.secondaryStrong}CC`',
  'color: teacherBrandSemantic.secondaryStrong',
]) {
  if (!classRecordsSource.includes(required)) {
    throw new Error(`班级评价数需要使用辅助橙系列，缺少：${required}`);
  }
}
