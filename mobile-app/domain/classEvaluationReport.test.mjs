import assert from "node:assert/strict";
import {
  filterClassReportRecords,
  getClassReportIndicators,
  getClassReportOverview,
  getClassReportPeriod,
  getClassReportPeriods,
  getClassReportRanking,
  getClassReportSummary,
} from "./classEvaluationReport.ts";

const classes = [
  { id: "a", name: "一班", gradeId: "g1" },
  { id: "b", name: "二班", gradeId: "g1" },
];
const rules = ["A", "B"].map((dimension) => ({
  dimension,
  baseScore: 5,
  minScore: 0,
  maxScore: 10,
}));
const record = (id, date, dimension, scoreChange) => ({
  id,
  date,
  classId: "a",
  dimension,
  indicatorPath: [dimension, "常规", "同名事项"],
  scoreChange,
  deduction: 0,
});
const records = [
  record("1", "2026-11-23", "A", -5),
  record("2", "2026-11-24", "A", -2),
  record("3", "2026-11-23", "B", 5),
  record("4", "2026-11-24", "B", 3),
];
const week = getClassReportPeriod("week", "2026-11-24");
const day = getClassReportPeriod("day", "2026-11-24");
const daily = filterClassReportRecords(records, day, ["a"]);
assert.deepEqual(getClassReportSummary(daily), {
  positiveCount: 1,
  negativeCount: 1,
  addition: 3,
  deduction: 2,
});
assert.equal(
  getClassReportRanking(records, classes, rules, week, "week")[0].score,
  10,
);
assert.deepEqual(
  getClassReportRanking(records, classes, rules, week, "week").map(
    (item) => item.rank,
  ),
  [1, 1],
);
assert.deepEqual(
  getClassReportRanking(records, classes, rules, day, "week"),
  [],
);
assert.deepEqual(
  getClassReportRanking(records, classes, rules, week, "month"),
  [],
);
assert.equal(
  getClassReportRanking(
    records,
    classes,
    rules,
    getClassReportPeriod("month", "2026-11-24"),
    "month",
  )[0].score,
  10,
);
assert.deepEqual(
  getClassReportSummary([
    { ...records[0], scoreChange: undefined, deduction: 2 },
  ]),
  { positiveCount: 0, negativeCount: 1, addition: 0, deduction: 2 },
);
assert.equal(getClassReportIndicators(records, "negative")[0].amount, 7);
assert.equal(getClassReportIndicators(records, "positive")[0].amount, 8);
const sameNames = getClassReportIndicators(
  [...records, record("5", "2026-11-24", "B", -1)],
  "negative",
);
assert.equal(sameNames.length, 2);
assert.notEqual(
  sameNames[0].children[0].children[0].id,
  sameNames[1].children[0].children[0].id,
);
assert.deepEqual(
  getClassReportSummary(filterClassReportRecords(records, day, ["b"])),
  { positiveCount: 0, negativeCount: 0, addition: 0, deduction: 0 },
);
const crossMonth = getClassReportPeriod("week", "2026-11-01");
assert.equal(crossMonth.startDate, "2026-10-26");
assert.equal(crossMonth.endDate, "2026-11-01");
assert.equal(getClassReportPeriod("month", "2024-02-15").endDate, "2024-02-29");
const months = getClassReportPeriods("month", "2026-10-01", "2026-11-26");
assert.deepEqual(
  months.map((item) => item.id),
  ["2026-10-01", "2026-11-01"],
);
const crossMonthRecords = [
  record("6", "2026-10-31", "A", -1),
  record("7", "2026-11-01", "A", -2),
];
assert.equal(
  getClassReportSummary(
    filterClassReportRecords(
      crossMonthRecords,
      getClassReportPeriod("month", "2026-11-01"),
      ["a"],
    ),
  ).deduction,
  2,
);
console.log(
  "班评日周月统计、上下限后流水、同名指标、同分排名与跨月归属检查通过",
);

// 班级名单按完整指标路径去重，并与进入明细的记录范围一致。
const multiClass = getClassReportIndicators(
  [...records, { ...records[1], id: "other-class", classId: "b" }],
  "negative",
);
const leaf = multiClass[0].children[0].children[0];
assert.deepEqual(leaf.classIds, ["a", "b"]);
assert.equal(leaf.recordCount, 3);
assert.equal(leaf.amount, 9);
assert.deepEqual(multiClass[0].classIds, ["a", "b"]);

const overview = getClassReportOverview(records, 2, daily);
assert.deepEqual(overview, {
  totalCount: 4,
  positiveCount: 2,
  negativeCount: 2,
  addition: 8,
  deduction: 7,
  evaluatedClassCount: 1,
  totalClassCount: 2,
  coverageRate: 50,
  positiveClassCount: 1,
  negativeClassCount: 1,
  positiveRatio: 50,
  negativeRatio: 50,
  totalDelta: 2,
  positiveDelta: 1,
  negativeDelta: 1,
});
assert.equal(getClassReportOverview(records, 2, null).totalDelta, null);
console.log("指标班级去重与明细汇总检查通过");
