import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');

for (const required of [
  'const buildZeroStartBarOption',
  'const animateBarChartFromZero',
  'const setBarChartOptionWithReplay',
  'lastAnimationKeyRef.current !== animationKey',
  'chart.setOption(buildZeroStartBarOption(option), true)',
  'chart.setOption(option, false)',
]) {
  if (!source.includes(required)) {
    throw new Error(`柱状图从 0 开始动画缺少通用能力：${required}`);
  }
}

const animationHelperStart = source.indexOf('const animateBarChartFromZero');
const replayHelperStart = source.indexOf('const setBarChartOptionWithReplay');
const animationHelperSource = source.slice(animationHelperStart, replayHelperStart);
const rafCount = (animationHelperSource.match(/requestAnimationFrame\(\(\) => \{/g) ?? []).length;
if (rafCount < 2) {
  throw new Error('柱状图新挂载时需要延后到第二帧再设置真实值，确保切换报表 tab 也能看到从 0 开始的动画');
}

const chartNames = ['FiveEducationBarChart', 'GradeCoverageChart', 'ClassCoverageChart', 'ClassEvaluationRecordsChart'];
for (const chartName of chartNames) {
  const start = source.indexOf(`const ${chartName}`);
  if (start === -1) throw new Error(`缺少柱状图组件：${chartName}`);
  const nextStart = chartNames
    .map(name => source.indexOf(`const ${name}`, start + 1))
    .filter(index => index > start)
    .sort((a, b) => a - b)[0] ?? source.indexOf('const LeaderReportView', start);
  const chartSource = source.slice(start, nextStart > start ? nextStart : source.length);

  for (const required of [
    'animationDurationUpdate: 650',
    "animationEasingUpdate: 'cubicOut'",
    'setBarChartOptionWithReplay(chart, option',
    'valueAnimation: true',
    'precision: 0',
  ]) {
    if (!chartSource.includes(required)) {
      throw new Error(`${chartName} 需要重新加载时从 0 过渡到当前值，缺少：${required}`);
    }
  }
}

const classRecordsChartStart = source.indexOf('const ClassEvaluationRecordsChart');
const classRecordsChartEnd = source.indexOf('const LeaderReportView', classRecordsChartStart);
const classRecordsChartSource = source.slice(classRecordsChartStart, classRecordsChartEnd);
for (const required of [
  'const displayedProgress = useAnimatedProgress(dataAnimationKey)',
  'value: item.evaluationRecords * displayedProgress',
  'Math.round(Number(params.value ?? 0))',
  'setBarChartOptionWithReplay(chart, option, dataAnimationKey, lastAnimationKeyRef);',
]) {
  if (!classRecordsChartSource.includes(required)) {
    throw new Error(`班级评价数弹窗需要使用连续高度并将标签单独取整，缺少：${required}`);
  }
}
if (classRecordsChartSource.includes('Math.round(item.evaluationRecords * displayedProgress)')) {
  throw new Error('班级评价数柱体高度不得逐帧取整，否则会产生明显阶梯跳动');
}

const classChartStart = source.indexOf('const ClassCoverageChart');
const classChartEnd = source.indexOf('const LeaderReportView', classChartStart);
const classChartSource = source.slice(classChartStart, classChartEnd);
for (const required of [
  'const sortedClasses = useMemo(() =>',
  'const displayedProgress = useAnimatedProgress(dataAnimationKey)',
  'Math.round(rate(item.covered, item.total) * displayedProgress)',
  '[classes]',
]) {
  if (!classChartSource.includes(required)) {
    throw new Error(`班级覆盖率弹窗的柱体和柱上文字必须由页面侧进度从 0 驱动，缺少：${required}`);
  }
}

for (const chartSource of [classChartSource, classRecordsChartSource]) {
  if (chartSource.includes('lastAnimationKeyRef, () => {\n            chart.resize();')) {
    throw new Error('班级明细柱状图不得在每帧数据更新后调用 resize，应仅由 ResizeObserver 处理尺寸变化');
  }
}
