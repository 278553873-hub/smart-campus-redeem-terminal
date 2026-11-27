import {
  getClassEvaluationScoreChange,
  type ClassEvaluationRecord,
} from "./classEvaluationAssistantV2.ts";
import type { ClassLeaderboardSettlementCycle } from "./teacherSpaceAccess";

export type ClassReportPeriodType = "day" | "week" | "month";
export type ClassReportDirection = "negative" | "positive";
export interface ClassReportPeriod {
  id: string;
  type: ClassReportPeriodType;
  startDate: string;
  endDate: string;
  label: string;
}
export interface ClassReportClass {
  id: string;
  name: string;
  gradeId: string;
  gradeName: string;
}
export interface ClassReportScoreRule {
  dimension: string;
  baseScore: number;
  minScore: number;
  maxScore: number;
}
export interface ClassReportIndicator {
  id: string;
  name: string;
  amount: number;
  recordCount: number;
  classIds: string[];
  children: ClassReportIndicator[];
}

const round = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
const parseDate = (value: string) => new Date(`${value}T12:00:00`);
const dateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
export const shiftReportDate = (value: string, days: number) => {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return dateKey(date);
};

export function getClassReportPeriod(
  type: ClassReportPeriodType,
  date: string,
): ClassReportPeriod {
  const day = parseDate(date);
  let startDate = date;
  let endDate = date;
  if (type === "week") {
    startDate = shiftReportDate(date, -((day.getDay() + 6) % 7));
    endDate = shiftReportDate(startDate, 6);
  }
  if (type === "month") {
    startDate = dateKey(new Date(day.getFullYear(), day.getMonth(), 1));
    endDate = dateKey(new Date(day.getFullYear(), day.getMonth() + 1, 0));
  }
  const labels = {
    day: `${date.replaceAll("-", ".")} 周${"日一二三四五六"[day.getDay()]}`,
    week: `${startDate.replaceAll("-", ".")}–${endDate.slice(5).replace("-", ".")}`,
    month: `${day.getFullYear()}年${day.getMonth() + 1}月`,
  };
  return { id: startDate, type, startDate, endDate, label: labels[type] };
}

export function getClassReportPeriods(
  type: ClassReportPeriodType,
  firstDate: string,
  today: string,
) {
  const periods: ClassReportPeriod[] = [];
  let period = getClassReportPeriod(type, firstDate);
  while (period.startDate <= today) {
    periods.push(period);
    period = getClassReportPeriod(type, shiftReportDate(period.endDate, 1));
  }
  return periods;
}

export function filterClassReportRecords(
  records: readonly ClassEvaluationRecord[],
  period: ClassReportPeriod,
  classIds: readonly string[],
) {
  const allowedClasses = new Set(classIds);
  return records.filter(
    (record) =>
      record.date >= period.startDate &&
      record.date <= period.endDate &&
      allowedClasses.has(record.classId),
  );
}

export function getClassReportSummary(
  records: readonly ClassEvaluationRecord[],
) {
  const positive = records.filter(
    (record) => getClassEvaluationScoreChange(record) > 0,
  );
  const negative = records.filter(
    (record) => getClassEvaluationScoreChange(record) < 0,
  );
  return {
    positiveCount: positive.length,
    negativeCount: negative.length,
    addition: round(
      positive.reduce(
        (sum, record) => sum + getClassEvaluationScoreChange(record),
        0,
      ),
    ),
    deduction: round(
      negative.reduce(
        (sum, record) => sum - getClassEvaluationScoreChange(record),
        0,
      ),
    ),
  };
}

export interface ClassReportOverview {
  totalCount: number;
  positiveCount: number;
  negativeCount: number;
  addition: number;
  deduction: number;
  evaluatedClassCount: number;
  totalClassCount: number;
  coverageRate: number;
  positiveClassCount: number;
  negativeClassCount: number;
  positiveRatio: number;
  negativeRatio: number;
  totalDelta: number | null;
  positiveDelta: number | null;
  negativeDelta: number | null;
}

export function getClassReportOverview(
  records: readonly ClassEvaluationRecord[],
  totalClassCount: number,
  previousRecords?: readonly ClassEvaluationRecord[] | null,
): ClassReportOverview {
  const summary = getClassReportSummary(records);
  const totalCount = summary.positiveCount + summary.negativeCount;
  const evaluatedClasses = new Set<string>();
  const positiveClasses = new Set<string>();
  const negativeClasses = new Set<string>();
  for (const record of records) {
    const score = getClassEvaluationScoreChange(record);
    if (score === 0) continue;
    evaluatedClasses.add(record.classId);
    if (score > 0) positiveClasses.add(record.classId);
    else negativeClasses.add(record.classId);
  }
  const coverageRate = totalClassCount > 0
    ? Math.round((evaluatedClasses.size / totalClassCount) * 100)
    : 0;
  const positiveRatio = totalCount > 0
    ? Math.round((summary.positiveCount / totalCount) * 100)
    : 0;
  const negativeRatio = totalCount > 0 ? 100 - positiveRatio : 0;
  const previousSummary = previousRecords ? getClassReportSummary(previousRecords) : null;
  const previousTotal = previousSummary
    ? previousSummary.positiveCount + previousSummary.negativeCount
    : null;
  return {
    totalCount,
    ...summary,
    evaluatedClassCount: evaluatedClasses.size,
    totalClassCount,
    coverageRate,
    positiveClassCount: positiveClasses.size,
    negativeClassCount: negativeClasses.size,
    positiveRatio,
    negativeRatio,
    totalDelta: previousTotal === null ? null : totalCount - previousTotal,
    positiveDelta: previousSummary === null ? null : summary.positiveCount - previousSummary.positiveCount,
    negativeDelta: previousSummary === null ? null : summary.negativeCount - previousSummary.negativeCount,
  };
}

/** 按完整指标路径聚合，避免同名三级事项合并。分值来自原始流水。 */
export function getClassReportIndicators(
  records: readonly ClassEvaluationRecord[],
  direction: ClassReportDirection,
) {
  const roots: ClassReportIndicator[] = [];
  for (const record of records) {
    const score = getClassEvaluationScoreChange(record);
    if (direction === "positive" ? score <= 0 : score >= 0) continue;
    let children = roots;
    record.indicatorPath.forEach((name, index) => {
      const id = JSON.stringify(record.indicatorPath.slice(0, index + 1));
      let node = children.find((item) => item.id === id);
      if (!node) {
        node = {
          id,
          name,
          amount: 0,
          recordCount: 0,
          classIds: [],
          children: [],
        };
        children.push(node);
      }
      node.amount = round(node.amount + Math.abs(score));
      node.recordCount += 1;
      if (!node.classIds.includes(record.classId))
        node.classIds.push(record.classId);
      children = node.children;
    });
  }
  return roots;
}

/** 上下限仅应用于考核分；月度从当月流水重算，不相加周得分。 */
export function getClassReportRanking(
  records: readonly ClassEvaluationRecord[],
  classes: readonly ClassReportClass[],
  rules: readonly ClassReportScoreRule[],
  period: ClassReportPeriod,
  assessmentCycle: ClassLeaderboardSettlementCycle,
) {
  if (period.type !== assessmentCycle) return [];
  const periodRecords = filterClassReportRecords(
    records,
    period,
    classes.map((item) => item.id),
  );
  const ranked = classes
    .map((classInfo) => {
      const classRecords = periodRecords.filter(
        (record) => record.classId === classInfo.id,
      );
      const score = round(
        rules.reduce((total, rule) => {
          const delta = classRecords
            .filter((record) => record.dimension === rule.dimension)
            .reduce(
              (sum, record) => sum + getClassEvaluationScoreChange(record),
              0,
            );
          return (
            total +
            Math.max(
              rule.minScore,
              Math.min(rule.maxScore, rule.baseScore + delta),
            )
          );
        }, 0),
      );
      return { ...classInfo, score, rank: 0 };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.name.localeCompare(b.name, "zh-CN", { numeric: true }),
    );
  return ranked.map((item) => ({
    ...item,
    rank: ranked.findIndex((other) => other.score === item.score) + 1,
  }));
}
