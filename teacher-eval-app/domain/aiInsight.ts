import type { GrowthRecord } from './growthRecord.ts';
import { formatPoints } from './scoring.ts';

/**
 * 记录卡上的一句话 AI 解读：说清这条按什么口径算分、当前处于什么状态。
 * 只写一句，不重复解释显而易见的信息。
 */
export const describeRecordAiInsight = (record: GrowthRecord): string => {
  if (record.reviewStatus === '未通过') {
    return record.reviewNote ? '审核未通过：' + record.reviewNote : '审核未通过，按审核意见补充材料后再提交。';
  }
  const basis = '按「' + record.category + ' · ' + record.level + ' · ' + record.rank + '」计 '
    + formatPoints(record.points) + ' 分';
  return record.reviewStatus === '待审核' ? basis + '，待学校审核确认。' : basis + '，已计入本学年积分。';
};

/** 待确认卡片的解读：说明 AI 为什么这么归类，以及提交后会发生什么。 */
export const describeDraftBasis = (category: string, level: string, rank: string): string => (
  '按「' + category + ' · ' + level + ' · ' + rank + '」计算'
);
