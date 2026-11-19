import { TEACHER_SPACE_OPTIONS } from '../../mobile-app/data/teacherSpaces';
import { getLeaderReportSnapshot } from '../../mobile-app/services/leaderReportService';
import { createEvaluationScreenSnapshot, SCREEN_PERIODS, type EvaluationScreenPeriods } from './studentEvaluationScreenModel';
import { alignDemoLevelOneStats, buildDemoIndicatorUsage } from './studentEvaluationScreenIndicators';
import { createDemoGrowthTrend } from './studentEvaluationScreenGrowth';
import { PRINCIPAL_PERIODIC_REPORTS, getPrincipalWeeklyReport } from '../../mobile-app/data/principalPeriodicReports';
import { adaptPrincipalPeriodicReport } from '../../mobile-app/domain/assistantReportAdapters';

// Demo完整姓名，与报表演示ID固定对应；不将“姓+老师”作为完整姓名展示。
const DEMO_TEACHER_NAMES: Record<string, string> = {
  t1: '周婧怡', t2: '林晓芸', t3: '陈思敏', t4: '赵子航',
  t5: '刘思远', t6: '黄一鸣', t7: '吴佳宁', t8: '何嘉慧',
  t9: '马文博', t10: '郑雅雯', t11: '王静怡', t12: '孙浩然',
  t13: '冯梓涵', t14: '许安然', t15: '高明远', t16: '孙建华',
};

export const withDemoTeacherNames = (report: Awaited<ReturnType<typeof getLeaderReportSnapshot>>) => {
  const name = (id: string, original: string) => DEMO_TEACHER_NAMES[id] ?? original;
  return {
    ...report,
    teachers: report.teachers.map(teacher => ({ ...teacher, name: name(teacher.id, teacher.name) })),
    activeRanking: report.activeRanking.map(teacher => ({ ...teacher, name: name(teacher.id, teacher.name) })),
    lowRanking: report.lowRanking.map(teacher => ({ ...teacher, name: name(teacher.id, teacher.name) })),
    teacherScoreSummaries: report.teacherScoreSummaries.map(teacher => ({ ...teacher, teacherName: name(teacher.teacherId, teacher.teacherName) })),
  };
};

// 原始演示报表的年级分布与教师侧总量分别造数；Demo按总记录数分配，确保分项之和等于总量。
export const reconcileDemoGradeRecords = (report: Awaited<ReturnType<typeof getLeaderReportSnapshot>>) => {
  const totalWeight = report.gradeCoverages.reduce((sum, grade) => sum + grade.evaluationRecords, 0);
  if (!totalWeight) return report;
  let cumulativeWeight = 0;
  let allocated = 0;
  return { ...report, gradeCoverages: report.gradeCoverages.map(grade => {
    cumulativeWeight += grade.evaluationRecords;
    const cumulative = Math.round(cumulativeWeight / totalWeight * report.summary.totalEvaluationCount);
    const evaluationRecords = cumulative - allocated;
    allocated = cumulative;
    const classWeight = grade.classes.reduce((sum, item) => sum + item.evaluationRecords, 0);
    let classCumulativeWeight = 0;
    let classAllocated = 0;
    return { ...grade, evaluationRecords, classes: grade.classes.map(item => {
      classCumulativeWeight += item.evaluationRecords;
      const classCumulative = classWeight ? Math.round(classCumulativeWeight / classWeight * evaluationRecords) : 0;
      const records = classCumulative - classAllocated;
      classAllocated = classCumulative;
      return { ...item, evaluationRecords: records };
    }) };
  }) };
};

// 大屏仅适配既有报表；真实接口和实时事件源可在这一层替换。
export const loadStudentEvaluationScreen = async (now = Date.now()): Promise<EvaluationScreenPeriods> => {
  const schoolName = TEACHER_SPACE_OPTIONS.find(space => space.id === 'school-star')?.title ?? '星河实验学校';
  const reports = await Promise.all(SCREEN_PERIODS.map(async ({ key }) => [key, await getLeaderReportSnapshot({ period: key })] as const));
  const recordTotal = (key: 'week' | 'month' | 'term') => reports.find(([period]) => period === key)![1].summary.totalEvaluationCount;
  const indicatorUsage = buildDemoIndicatorUsage({ week: recordTotal('week'), month: recordTotal('month'), term: recordTotal('term') });
  const alignedReports = reports.map(([key, report]) => [key, alignDemoLevelOneStats(withDemoTeacherNames(reconcileDemoGradeRecords(report)), indicatorUsage)] as const);
  const growthTrend = createDemoGrowthTrend(alignedReports.find(([key]) => key === 'week')![1], now);
  const entries = alignedReports.map(([key, report]) => [key, createEvaluationScreenSnapshot(
    report, schoolName, now, growthTrend,
  )] as const);
  const periods = Object.fromEntries(entries) as EvaluationScreenPeriods;
  // 两端复用同一份演示周报，覆盖日期按上一个完整自然周计算；不代表接入真实学校数据。
  periods.week.principalReports = {
    weekly: adaptPrincipalPeriodicReport(getPrincipalWeeklyReport(now), schoolName),
    monthly: adaptPrincipalPeriodicReport(PRINCIPAL_PERIODIC_REPORTS.monthly, schoolName),
  };
  return periods;
};
