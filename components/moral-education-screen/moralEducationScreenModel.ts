import {
  getMoralEducationCockpitPeriods,
  getMoralEducationCockpitSnapshot,
  type MoralEducationClassSummary,
  type MoralEducationGradeReport,
  type MoralEducationPeriodOption,
} from '../../mobile-app/services/moralEducationCockpitService';
import { createMoralScreenDemoSnapshot, type MoralScreenDemoSnapshot } from './moralEducationScreenDemo';

export type MoralScreenDataset = { periods: MoralEducationPeriodOption[]; snapshots: MoralScreenDemoSnapshot[] };
export const roundMoralScore = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;

const reportProblems = (report?: MoralEducationGradeReport) => (report?.problemDimensions ?? [])
  .flatMap(dimension => dimension.categories.flatMap(category => category.details.map(detail => ({
    ...detail, path: [dimension.name, category.name, detail.name], dimensionId: dimension.id,
  })))).sort((a, b) => b.recordCount - a.recordCount || b.deduction - a.deduction || a.id.localeCompare(b.id));

const rankClasses = (source: MoralEducationClassSummary[], gradeNames: Map<string, string>) => {
  const sorted = [...source].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'zh-CN'));
  return sorted.map((item, index) => ({
    ...item,
    name: item.name.replace(/^\d{4}级/, gradeNames.get(item.gradeId) ?? ''),
    rank: sorted.findIndex(other => roundMoralScore(other.score) === roundMoralScore(item.score)) + 1,
    tied: sorted.some((other, otherIndex) => otherIndex !== index && roundMoralScore(other.score) === roundMoralScore(item.score)),
  }));
};

const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
  && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

/** 只读班评服务的已有周期，不把历史报表改写为当前周。 */
export async function loadMoralScreenDataset(): Promise<MoralScreenDataset> {
  const periods = (await getMoralEducationCockpitPeriods('week'))
    .filter(period => validDate(period.startDate) && validDate(period.endDate) && period.startDate <= period.endDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const snapshots = await Promise.all(periods.map(async period => createMoralScreenDemoSnapshot(await getMoralEducationCockpitSnapshot({ periodType: 'week', periodId: period.id }))));
  return { periods, snapshots };
}

export function selectMoralScreen(dataset: MoralScreenDataset, periodId: string, gradeId = 'all') {
  const index = dataset.periods.findIndex(period => period.id === periodId);
  const snapshot = dataset.snapshots[index];
  if (!snapshot) return null;
  const gradeNames = new Map(snapshot.grades.map(grade => [grade.id, grade.name]));
  const sourceClasses = gradeId === 'all' ? snapshot.classRanking : snapshot.grades.find(grade => grade.id === gradeId)?.classes ?? [];
  const classes = rankClasses(sourceClasses, gradeNames);
  const report = snapshot.gradeReports.find(item => item.gradeId === gradeId);
  const schoolProblems = snapshot.gradeReports.find(item => item.gradeId === 'all')?.problemDimensions ?? [];
  const schoolIssueCount = schoolProblems.reduce((total, item) => total + item.recordCount, 0);
  const schoolReport = snapshot.gradeReports.find(item => item.gradeId === 'all');
  const previousReport = dataset.snapshots[index - 1]?.gradeReports.find(item => item.gradeId === 'all');
  const problems = reportProblems(report);
  const sum = (values: number[]) => roundMoralScore(values.reduce((total, value) => total + value, 0));
  const average = (values: number[]) => values.length ? roundMoralScore(sum(values) / values.length) : 0;
  return {
    period: snapshot.period,
    grades: snapshot.grades.map(grade => ({
      id: grade.id, name: grade.name, classCount: grade.classes.length,
      ranking: rankClasses(grade.classes, gradeNames),
      averageScore: average(grade.classes.map(item => item.score)),
      issueCount: (snapshot.gradeReports.find(item => item.gradeId === grade.id)?.problemDimensions ?? []).reduce((total, item) => total + item.recordCount, 0),
      topProblems: reportProblems(snapshot.gradeReports.find(item => item.gradeId === grade.id)).slice(0, 3),
    })),
    classes,
    dimensions: report?.dimensions ?? [],
    problemDistribution: schoolProblems.map(item => ({
      id: item.id, name: item.name, recordCount: item.recordCount,
      percentage: schoolIssueCount ? item.recordCount / schoolIssueCount * 100 : 0,
    })),
    problems,
    problemChanges: (schoolReport?.dimensions ?? []).map(dimension => {
      const currentCount = schoolProblems.find(item => item.id === dimension.id)?.recordCount ?? 0;
      const comparable = previousReport?.dimensions.some(item => item.id === dimension.id);
      const previousCount = comparable ? previousReport!.problemDimensions.find(item => item.id === dimension.id)?.recordCount ?? 0 : null;
      return { id: dimension.id, name: dimension.name, currentCount, previousCount, delta: previousCount === null ? null : currentCount - previousCount };
    }),
    summary: {
      evaluationCount: snapshot.summary.evaluationCount,
      classCount: classes.length,
      averageScore: average(classes.map(item => item.score)),
      maxScore: snapshot.summary.maxScore,
      deduction: sum((report?.dimensions ?? []).map(item => item.deduction)),
      issueCount: problems.reduce((total, item) => total + item.recordCount, 0),
    },
    trend: dataset.snapshots.slice(Math.max(0, index - 4), index + 1).flatMap(item => item.trend.slice(-1)),
  };
}

export type MoralScreenSnapshot = NonNullable<ReturnType<typeof selectMoralScreen>>;

export type MoralProblemRankingMetric = 'recordCount' | 'deduction';
export function rankMoralProblems(problems: MoralScreenSnapshot['problems'], metric: MoralProblemRankingMetric) {
  return [...problems].sort((a, b) => b[metric] - a[metric]
    || (metric === 'recordCount' ? b.deduction - a.deduction : b.recordCount - a.recordCount)
    || a.id.localeCompare(b.id));
}
