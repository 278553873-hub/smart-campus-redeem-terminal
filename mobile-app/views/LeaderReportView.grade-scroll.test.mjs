import { readFileSync } from 'node:fs';

import { getLeaderReportSnapshot } from '../services/leaderReportService.ts';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');

for (const required of [
  'const GradeChartViewport',
  'overflow-x-auto overscroll-x-contain',
  '可左右滑动查看全部年级',
  'const GRADE_CHART_VISIBLE_ITEM_COUNT = 5',
  'const GRADE_CHART_ITEM_WIDTH = 60',
  'width: scrollable ? `${GRADE_CHART_AXIS_WIDTH + gradeCount * GRADE_CHART_ITEM_WIDTH}px` : \'100%\'',
  'const observeReportChartSize',
  'stopObservingResize = observeReportChartSize(chart, chartRef.current)',
]) {
  if (!source.includes(required)) {
    throw new Error(`多年级图表缺少横向滑动能力：${required}`);
  }
}

if (source.includes("chartInstanceRef.current?.on('finished', handleResize)")) {
  throw new Error('年级图表完成绘制时不应同步触发 resize，否则会产生 ECharts 运行告警');
}

if ((source.match(/<GradeChartViewport/g) ?? []).length !== 2) {
  throw new Error('年级覆盖率与年级评价数必须复用同一个横向滑动容器');
}

for (const period of ['today', 'week', 'month', 'term']) {
  const snapshot = await getLeaderReportSnapshot({ period });
  if (snapshot.gradeCoverages.length !== 12) {
    throw new Error(`${period} 周期的 Mock 数据应覆盖小学一年级至高三，共 12 个年级`);
  }

  for (const grade of snapshot.gradeCoverages) {
    if (grade.total <= 0 || grade.covered <= 0 || grade.evaluationRecords <= 0) {
      throw new Error(`${period} 周期的 ${grade.name} 不应出现无数据状态`);
    }
    if (grade.classes.length === 0) {
      throw new Error(`${period} 周期的 ${grade.name} 至少应包含一个班级`);
    }
    for (const classInfo of grade.classes) {
      if (classInfo.total <= 0 || classInfo.covered <= 0 || classInfo.evaluationRecords <= 0) {
        throw new Error(`${period} 周期的 ${classInfo.name} 不应出现无数据状态`);
      }
    }
  }
}
