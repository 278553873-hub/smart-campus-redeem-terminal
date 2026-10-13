import {
  GROWTH_RECORD_CATEGORIES,
  getCategoryDefinition,
  type GrowthRecord,
  type GrowthRecordCategory,
  type GrowthRecordLevel,
  type GrowthRecordRank,
  type TeacherEvalDimension,
} from './growthRecord.ts';
import { GROWTH_SCORE_TABLE, GROWTH_SCORE_YEARLY_CAP, RANK_TIER_INDEX } from './scoringTable.ts';

export interface ScoringRange {
  id: string;
  label: string;
  start: string;
  end: string;
}

/** 演示基准日期为 2026-10-12，当前学期为 2026 秋季学期。 */
export const CURRENT_ACADEMIC_YEAR: ScoringRange = {
  id: '2026-2027',
  label: '2026-2027 学年',
  start: '2026-09-01',
  end: '2027-08-31',
};

export const CURRENT_TERM: ScoringRange = {
  id: '2026-autumn',
  label: '2026 秋季学期',
  start: '2026-09-01',
  end: '2027-01-31',
};

/** 演示数据中的历史学年，用于说明累计积分同样按学年分别封顶。 */
export const PREVIOUS_ACADEMIC_YEAR: ScoringRange = {
  id: '2025-2026',
  label: '2025-2026 学年',
  start: '2025-09-01',
  end: '2026-08-31',
};

export const isWithinRange = (date: string, range: ScoringRange) => date >= range.start && date <= range.end;

export const getRecordPoints = (
  category: GrowthRecordCategory,
  level: GrowthRecordLevel,
  rank: GrowthRecordRank,
): number => GROWTH_SCORE_TABLE[category].tierScores[level][RANK_TIER_INDEX[rank]];

export interface CategoryAggregate {
  category: GrowthRecordCategory;
  dimension: TeacherEvalDimension;
  /** 计入积分的那条记录（同类别分值最高者） */
  countedRecordId: string;
  countedPoints: number;
  /** 该类别在区间内的原始分值与记录条数 */
  rawPoints: number;
  recordCount: number;
}

export interface GrowthSummary {
  /** 计入积分（同类取最高 + 学年合计封顶后） */
  countedPoints: number;
  /** 封顶前的合计分值，用于说明封顶是否生效 */
  rawCountedPoints: number;
  /** 每学年合计封顶分值 */
  yearlyCap: number;
  /** 本学年是否触发合计封顶 */
  capped: boolean;
  recordCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  aggregates: CategoryAggregate[];
  dimensionPoints: Array<{ dimension: TeacherEvalDimension; points: number }>;
}

/** 未通过的记录不参与计分与聚合。 */
export const collectCountableRecords = (records: GrowthRecord[], range: ScoringRange) => (
  records.filter(record => record.reviewStatus !== '未通过' && isWithinRange(record.issuedAt, range))
);

/**
 * 按类别聚合：同类别只认分值最高的一条，并按类别封顶。
 * 分值相同时取落款日期更早的一条，保证结果稳定。
 */
export const aggregateByCategory = (records: GrowthRecord[], range: ScoringRange): CategoryAggregate[] => {
  const countable = collectCountableRecords(records, range);
  return GROWTH_RECORD_CATEGORIES.flatMap(category => {
    const categoryRecords = countable.filter(record => record.category === category);
    if (categoryRecords.length === 0) return [];
    const best = [...categoryRecords].sort((left, right) => (
      right.points - left.points || left.issuedAt.localeCompare(right.issuedAt)
    ))[0];
    return [{
      category,
      dimension: getCategoryDefinition(category).dimension,
      countedRecordId: best.id,
      countedPoints: best.points,
      rawPoints: categoryRecords.reduce((sum, record) => sum + record.points, 0),
      recordCount: categoryRecords.length,
    }];
  });
};

export const summarizeGrowth = (records: GrowthRecord[], range: ScoringRange): GrowthSummary => {
  const aggregates = aggregateByCategory(records, range);
  const rangeRecords = records.filter(record => isWithinRange(record.issuedAt, range));
  const dimensionPoints = aggregates.reduce<Array<{ dimension: TeacherEvalDimension; points: number }>>(
    (list, aggregate) => {
      const existing = list.find(item => item.dimension === aggregate.dimension);
      if (existing) {
        existing.points += aggregate.countedPoints;
      } else {
        list.push({ dimension: aggregate.dimension, points: aggregate.countedPoints });
      }
      return list;
    },
    [],
  );

  const rawCountedPoints = aggregates.reduce((sum, aggregate) => sum + aggregate.countedPoints, 0);
  const countedPoints = Math.min(rawCountedPoints, GROWTH_SCORE_YEARLY_CAP);

  return {
    countedPoints,
    rawCountedPoints,
    yearlyCap: GROWTH_SCORE_YEARLY_CAP,
    capped: countedPoints < rawCountedPoints,
    recordCount: rangeRecords.length,
    approvedCount: rangeRecords.filter(record => record.reviewStatus === '已通过').length,
    pendingCount: rangeRecords.filter(record => record.reviewStatus === '待审核').length,
    rejectedCount: rangeRecords.filter(record => record.reviewStatus === '未通过').length,
    aggregates,
    dimensionPoints: dimensionPoints.sort((left, right) => right.points - left.points),
  };
};

/**
 * 累计积分：按学年分别「同类取最高 + 学年合计封顶」后相加。
 * 与单学年展示口径一致，避免跨年重复累计导致分值虚高。
 */
export const summarizeTotalPoints = (records: GrowthRecord[], academicYears: ScoringRange[]): number => (
  academicYears.reduce((total, year) => total + summarizeGrowth(records, year).countedPoints, 0)
);

/** 保留两位小数并去掉多余的 0，避免 0.1 + 0.2 这类浮点误差出现在页面上。 */
export const formatPoints = (points: number): string => {
  const rounded = Math.round(points * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  const fixed = rounded.toFixed(2);
  return fixed.endsWith('0') ? fixed.slice(0, -1) : fixed;
};

export interface DraftScoreImpact {
  /** 落款日期是否落在本学期区间 */
  inCurrentTerm: boolean;
  /** 提交后本学期积分的增量 */
  delta: number;
  /** 本学期同类别已有最高分 */
  sameCategoryBest: number;
  yearCap: number;
}

/** 提交前试算：这条记录会让本学期积分变化多少。 */
export const previewDraftImpact = (
  records: GrowthRecord[],
  fields: { category: GrowthRecordCategory; level: GrowthRecordLevel; rank: GrowthRecordRank; issuedAt: string },
): DraftScoreImpact => {
  const points = getRecordPoints(fields.category, fields.level, fields.rank);
  const candidate: GrowthRecord = {
    id: 'preview-candidate',
    title: 'preview',
    category: fields.category,
    dimension: getCategoryDefinition(fields.category).dimension,
    level: fields.level,
    rank: fields.rank,
    issuer: '',
    issuedAt: fields.issuedAt,
    points,
    source: 'manual',
    reviewStatus: '待审核',
  };
  const before = summarizeGrowth(records, CURRENT_TERM).countedPoints;
  const after = summarizeGrowth([...records, candidate], CURRENT_TERM).countedPoints;
  const sameCategoryBest = collectCountableRecords(records, CURRENT_TERM)
    .filter(record => record.category === fields.category)
    .reduce((best, record) => Math.max(best, record.points), 0);
  return {
    inCurrentTerm: isWithinRange(fields.issuedAt, CURRENT_TERM),
    delta: Math.round((after - before) * 100) / 100,
    sameCategoryBest,
    yearCap: GROWTH_SCORE_YEARLY_CAP,
  };
};
