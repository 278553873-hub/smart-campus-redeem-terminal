import type { MoralEducationCockpitSnapshot, MoralEducationScoreNode } from '../../mobile-app/services/moralEducationCockpitService';
import { countMoralEvaluationEvents, createMoralDemoEvaluationEvents } from './moralEducationScreenEvaluations';

export type MoralScreenDemoSnapshot = MoralEducationCockpitSnapshot & {
  summary: MoralEducationCockpitSnapshot['summary'] & { evaluationCount: number };
};

export const MORAL_DEMO_CLASS_COUNTS = [5, 8, 12, 6, 10, 7] as const;
const round = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10;
const sum = (values: number[]) => round(values.reduce((total, value) => total + value, 0));

const allocate = (total: number, weights: number[]) => {
  const weightTotal = weights.reduce((value, weight) => value + weight, 0);
  const raw = weights.map(weight => total * weight / weightTotal);
  const values = raw.map(Math.floor);
  const remainder = total - values.reduce((value, item) => value + item, 0);
  raw.map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
    .slice(0, remainder).forEach(item => values[item.index]++);
  return values;
};

/** 驾驶舱专用模拟名册，沿用班评指标、周期和总量，不改写手机端报表。 */
export function createMoralScreenDemoSnapshot(source: MoralEducationCockpitSnapshot & { summary: { evaluationCount?: number } }): MoralScreenDemoSnapshot {
  const grades = source.grades.map((grade, gradeIndex) => {
    const count = MORAL_DEMO_CLASS_COUNTS[gradeIndex] ?? grade.classes.length;
    const report = source.gradeReports.find(item => item.gradeId === grade.id);
    const deduction = sum((report?.dimensions ?? []).map(item => item.deduction));
    const issues = (report?.dimensions ?? []).reduce((total, item) => total + item.issueCount, 0);
    const weights = Array.from({ length: count }, (_, index) => 4 + (index * 7 + gradeIndex * 3) % 13);
    const deductions = allocate(Math.round(deduction * 10), weights);
    const issueCounts = allocate(issues, weights);
    const classes = weights.map((_, index) => ({
      id: `${grade.id}c${index + 1}`, gradeId: grade.id, name: `${grade.name}${index + 1}班`,
      score: round(source.summary.maxScore - deductions[index] / 10),
      maxScore: source.summary.maxScore, deduction: deductions[index] / 10, issueCount: issueCounts[index], rank: 0,
    })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'zh-CN'))
      .map((item, index) => ({ ...item, rank: index + 1 }));
    return { ...grade, classes };
  });
  const classRanking = grades.flatMap(grade => grade.classes)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'zh-CN'))
    .map((item, index) => ({ ...item, rank: index + 1 }));
  const classCount = classRanking.length;
  const gradeReports = source.gradeReports.map(report => {
    const count = report.gradeId === 'all' ? classCount : grades.find(grade => grade.id === report.gradeId)?.classes.length ?? 0;
    const score = (maximum: number, deduction: number) => count ? round(Math.max(0, maximum - deduction / count)) : 0;
    const tree = (nodes: MoralEducationScoreNode[]): MoralEducationScoreNode[] => nodes.map(node => ({
      ...node, averageScore: score(node.maxScore, node.deduction), children: tree(node.children),
    }));
    return {
      ...report,
      dimensions: report.dimensions.map(item => ({ ...item, averageScore: score(item.maxScore, item.deduction) })),
      scoreTree: tree(report.scoreTree),
    };
  });
  return {
    ...source, grades, classRanking, gradeReports,
    summary: {
      ...source.summary,
      evaluationCount: Number.isSafeInteger(source.summary.evaluationCount) && source.summary.evaluationCount! >= 0
        ? source.summary.evaluationCount!
        : countMoralEvaluationEvents(createMoralDemoEvaluationEvents(source.period, classRanking.map(item => item.id)), source.period),
      averageScore: classCount ? round(sum(classRanking.map(item => item.score)) / classCount) : 0,
      cumulativeDeduction: sum(classRanking.map(item => item.deduction)),
      issueCount: classRanking.reduce((total, item) => total + item.issueCount, 0),
      highestScore: classRanking[0]?.score ?? 0,
      lowestScore: classRanking.at(-1)?.score ?? 0,
    },
  };
}
