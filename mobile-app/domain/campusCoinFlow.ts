import type { CampusCoinGrowthAwardPeriod, CampusCoinIssueRecord } from '../types';

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
};

export const formatGrowthAwardDetail = (period: CampusCoinGrowthAwardPeriod) => {
  if (period.type === 'monthly') {
    const { month } = parseDateKey(`${period.month}-01`);
    return `每月奖励（${month}月）`;
  }

  const start = parseDateKey(period.startDate);
  const end = parseDateKey(period.endDate);
  if (start.year !== end.year) {
    return `每周奖励（${start.year}年${start.month}月${start.day}日-${end.year}年${end.month}月${end.day}日）`;
  }
  return `每周奖励（${start.month}月${start.day}日-${end.month}月${end.day}日）`;
};

export const getCampusCoinIssueDetail = (record: CampusCoinIssueRecord) => (
  record.category === 'growth_award' ? formatGrowthAwardDetail(record.period) : record.detail
);

export const formatCampusCoinFlowTime = (value: string) => {
  const [date, time] = value.split(' ');
  const { month, day } = parseDateKey(date);
  return `${month}月${day}日${time ? ` ${time.slice(0, 5)}` : ''}`;
};
