import { classReportIndicatorDemoPaths } from '../../mobile-app/data/classReportIndicatorDemo';
import type { LeaderReportSnapshot } from '../../mobile-app/services/leaderReportService';
import type { EducationKey, ScreenIndicatorGroupUsage, ScreenReportSnapshot } from './studentEvaluationScreenModel';

// 每个学校一级指标独立展示、累计；乐创不能与求知共用一个统计标识。
const EDUCATION_BY_LEVEL_ONE: Record<string, EducationKey> = {
  崇德: 'virtue', 求知: 'wisdom', 向阳: 'fitness', 尚美: 'aesthetic', 躬行: 'labor', 乐创: 'innovation',
};
const seed = (text: string) => Array.from(text).reduce((value, character) => (value * 31 + character.codePointAt(0)!) >>> 0, 7);
const indicatorId = (...parts: string[]) => parts.join('-').replace(/\s+/g, '-');

// 累计分配避免取整后丢失记录。低频项保留零值，不以补录制造全部覆盖。
const distribute = (total: number, weights: number[]) => {
  const weight = weights.reduce((sum, value) => sum + value, 0);
  let cumulativeWeight = 0;
  let allocated = 0;
  return weights.map(value => {
    cumulativeWeight += value;
    const cumulative = weight ? Math.round(cumulativeWeight / weight * total) : 0;
    const count = cumulative - allocated;
    allocated = cumulative;
    return count;
  });
};

// 共享演示服务仍按五类给汇总。只在Demo适配学校的六个一级名称，保持原总量。
// 原智育存量按学校指标使用量拆分至求知、乐创，后续评价按独立标识直接累计。
export function alignDemoLevelOneStats(report: LeaderReportSnapshot, indicatorUsage: ScreenIndicatorGroupUsage[]): ScreenReportSnapshot {
  const sourceKey = (group: ScreenIndicatorGroupUsage) => group.dimension === 'innovation' ? 'wisdom' : group.dimension;
  const countField = report.period === 'term' ? 'termCount' : report.period === 'month' ? 'monthCount' : 'weekCount';
  const groupCount = (group: ScreenIndicatorGroupUsage) => group.children.reduce((sum, second) => sum + second.children.reduce((value, third) =>
    value + (report.period === 'today' ? Math.round(third.weekCount * .18) : third[countField]), 0), 0);
  const values = new Map<string, { plusScore: number; minusScore: number; positiveEventCount: number; negativeEventCount: number }>();
  report.fiveEducationStats.forEach(source => {
    const groups = indicatorUsage.filter(group => sourceKey(group) === source.key);
    const counts = groups.map(groupCount);
    const weights = counts.some(Boolean) ? counts : groups.map(group => group.children.reduce((sum, second) => sum + second.children.length, 0));
    const positive = distribute(source.positiveEventCount, weights);
    const negative = distribute(source.negativeEventCount, weights);
    const plus = distribute(source.plusScore, positive.some(Boolean) ? positive : weights);
    const minus = distribute(source.minusScore, negative.some(Boolean) ? negative : weights);
    groups.forEach((group, index) => values.set(group.id, {
      plusScore: plus[index], minusScore: minus[index], positiveEventCount: positive[index], negativeEventCount: negative[index],
    }));
  });
  return { ...report, indicatorUsage, fiveEducationStats: indicatorUsage.map(group => {
    const stat = values.get(group.id) ?? { plusScore: 0, minusScore: 0, positiveEventCount: 0, negativeEventCount: 0 };
    const netScore = stat.plusScore - stat.minusScore;
    return { ...stat, key: group.dimension!, name: group.name, netScore, score: netScore, eventCount: stat.positiveEventCount + stat.negativeEventCount };
  }) };
}

export function buildDemoIndicatorUsage(totals: { week: number; month: number; term: number }): ScreenIndicatorGroupUsage[] {
  // 与“学生评价指标”目录读取同一份底层路径，避免引入目录页面的图片及班评资源。
  const levels: ScreenIndicatorGroupUsage[] = [];
  classReportIndicatorDemoPaths.forEach(([firstName, secondName, thirdName]) => {
    let first = levels.find(item => item.name === firstName);
    if (!first) {
      first = { id: indicatorId('student', firstName), name: firstName, dimension: EDUCATION_BY_LEVEL_ONE[firstName], children: [] };
      levels.push(first);
    }
    let second = first.children.find(item => item.name === secondName);
    if (!second) {
      second = { id: indicatorId(first.id, secondName), name: secondName, children: [] };
      first.children.push(second);
    }
    second.children.push({ id: indicatorId(second.id, thirdName), name: thirdName, weekCount: 0, monthCount: 0, termCount: 0 });
  });
  const leaves = levels.flatMap(first => first.children.flatMap(second => second.children.map(third => {
    const value = seed(third.id);
    const availability = seed(second.id) % 7 === 0 ? 0 : value % 10;
    const weight = 1 + value % 19;
    return { id: third.id, availability, weight };
  })));
  const weights = (minimum: number) => leaves.map(leaf => leaf.availability >= minimum ? leaf.weight : 0);
  const week = distribute(totals.week, weights(4));
  const monthExtra = distribute(Math.max(0, totals.month - totals.week), weights(2));
  const termExtra = distribute(Math.max(0, totals.term - totals.month), weights(1));
  const counts = new Map(leaves.map((leaf, index) => [leaf.id, {
    weekCount: week[index],
    monthCount: week[index] + monthExtra[index],
    termCount: week[index] + monthExtra[index] + termExtra[index],
  }]));
  return levels.map(first => ({
    id: first.id,
    name: first.name,
    dimension: first.dimension,
    children: first.children.map(second => ({
      id: second.id,
      name: second.name,
      children: second.children.map(third => ({ id: third.id, name: third.name, ...counts.get(third.id)! })),
    })),
  }));
}
