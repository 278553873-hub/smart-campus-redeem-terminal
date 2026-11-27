import type { StudentTermOption } from '../components/student-detail/StudentTermSelector';
import type { TeacherIndicatorLevelOne } from '../data/teacherIndicatorCatalog';
import type { ScoreItem } from '../types';
import type { StudentEvaluationRecord } from '../views/student-evaluation/types';
import { getClassReportRecordRange } from './classReportEvaluationRecords.ts';

export type StudentGrowthPeriod = 'week' | 'month';
type StudentGrowthIndicator = Pick<TeacherIndicatorLevelOne, 'name' | 'legacyName'>;

const DAY = 86_400_000;
const isoDate = (value: number) => new Date(value).toISOString().slice(0, 10);
const asTime = (date: string) => Date.parse(`${date}T00:00:00Z`);
const localDay = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
});

const matchesStudentIndicator = (indicator: StudentGrowthIndicator, label?: string) => {
  const name = label?.trim();
  return name !== undefined && (name === indicator.name || name === indicator.legacyName);
};

export function getStudentIndicatorTotalScore(scores: readonly ScoreItem[], indicator: StudentGrowthIndicator) {
  return scores.reduce((sum, score) => sum + (matchesStudentIndicator(indicator, score.label) ? score.score : 0), 0);
}

export const getStudentEvaluationDate = (record: StudentEvaluationRecord) => record.evaluation_date.slice(0, 10);

export const getTermValueForEvaluationDate = (date: string, terms: readonly StudentTermOption[]) => (
  terms.find(term => date >= term.startDate && date <= term.endDate)?.value
);

/** 期末分值来自已有的分项积分口径，新加指标从对应记录累计起算。 */
export function getStudentDetailScores({ scores, records, originalRecords, terms, selectedTerm, offsets }: {
  scores: readonly ScoreItem[];
  records: readonly StudentEvaluationRecord[];
  originalRecords: readonly StudentEvaluationRecord[];
  terms: readonly StudentTermOption[];
  selectedTerm: string;
  offsets: Record<string, number>;
}) {
  const scoreByLabel = new Map(scores.map(score => [score.label, { ...score, score: score.score + (offsets[score.category] ?? 0) }]));
  const sumByLabel = (entries: readonly StudentEvaluationRecord[]) => {
    const sums = new Map<string, number>();
    for (const record of entries) {
      const label = record.indicatorPath[0]?.trim();
      if (!label || record.source === 'parent' || getTermValueForEvaluationDate(getStudentEvaluationDate(record), terms) !== selectedTerm) continue;
      if (!Number.isFinite(record.scoreChange)) continue;
      sums.set(label, (sums.get(label) ?? 0) + record.scoreChange);
    }
    return sums;
  };
  const baseline = sumByLabel(originalRecords);
  const current = sumByLabel(records);
  return [
    ...Array.from(scoreByLabel.values(), item => ({ ...item, score: item.score + (current.get(item.label) ?? 0) - (baseline.get(item.label) ?? 0) })),
    ...Array.from(current, ([label, score]) => ({ label, score, category: label })).filter(item => !scoreByLabel.has(item.label)),
  ];
}

/** 从已有分值向前扣回之后发生的实际变动，逐周/月得到同一指标的累计分。 */
export function getStudentGrowthTrend({ records, indicator, scores, term, period, today = localDay.format(new Date()) }: {
  records: readonly StudentEvaluationRecord[];
  indicator: StudentGrowthIndicator;
  scores: readonly ScoreItem[];
  term: StudentTermOption;
  period: StudentGrowthPeriod;
  today?: string;
}) {
  const endDate = today < term.endDate ? today : term.endDate;
  if (endDate < term.startDate) return [];
  const changes = records.flatMap(record => {
    const date = getStudentEvaluationDate(record);
    return record.source !== 'parent' && matchesStudentIndicator(indicator, record.indicatorPath[0])
      && date >= term.startDate && date <= term.endDate && Number.isFinite(record.scoreChange)
      ? [{ date, value: record.scoreChange }] : [];
  });
  const finalScore = getStudentIndicatorTotalScore(scores, indicator);

  const currentPeriodStart = getClassReportRecordRange(period, endDate).start;
  const currentMonth = new Date(asTime(currentPeriodStart));
  const starts = Array.from({ length: 5 }, (_, index) => period === 'week'
    ? isoDate(asTime(currentPeriodStart) - (4 - index) * 7 * DAY)
    : isoDate(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - (4 - index), 1)));

  return starts.flatMap((start, index) => {
    const next = starts[index + 1];
    const end = next ? isoDate(asTime(next) - DAY) : endDate;
    if (end < term.startDate) return [];
    const label = period === 'week' ? start.slice(5).replace('-', '/') : `${Number(start.slice(5, 7))}月`;
    const later = changes.reduce((sum, change) => sum + (change.date > end ? change.value : 0), 0);
    return [{ label, value: Number((finalScore - later).toFixed(10)) }];
  });
}
