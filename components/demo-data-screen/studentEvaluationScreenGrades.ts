import type { ScreenReportSnapshot } from './studentEvaluationScreenModel';

export interface ScreenGradeEvaluationCount {
  id: string;
  name: string;
  evaluationTimes: number;
}

/** 共享报表暂无年级评价次数。仅在Demo按班级规模分配独立次数，不换算成长记录条数。 */
export const createDemoGradeEvaluationCounts = (report: ScreenReportSnapshot): ScreenGradeEvaluationCount[] => {
  const weights = report.gradeCoverages.map(grade => Math.max(1, grade.classes.length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cumulativeWeight = 0;
  let allocated = 0;
  return report.gradeCoverages.map((grade, index) => {
    cumulativeWeight += weights[index];
    const cumulative = Math.round(cumulativeWeight / totalWeight * report.summary.totalRecords);
    const evaluationTimes = cumulative - allocated;
    allocated = cumulative;
    return { id: grade.id, name: grade.name, evaluationTimes };
  });
};

export const getGradeEvaluationPage = (grades: ScreenGradeEvaluationCount[], page: number) => {
  const pages = Math.max(1, Math.ceil(grades.length / 6));
  const current = Math.max(0, page) % pages;
  return { pages, current, grades: grades.slice(current * 6, current * 6 + 6) };
};
