/** 三端共用的奖励快照；历史文案读取记录本身，不读取当前发放设置。 */
export type GrowthCoinIncomeCategory = 'growth_award' | 'class_reward' | 'bank_interest';
export type GrowthCoinExpenseCategory = 'vending_exchange' | 'class_exchange' | 'manual_clear';
export type GrowthCoinFlowCategory = GrowthCoinIncomeCategory | GrowthCoinExpenseCategory;
export type GrowthCoinAwardPeriod =
  | { type: 'weekly'; startDate: string; endDate: string }
  | { type: 'monthly'; month: string };
export interface GrowthCoinScoreAward {
  type: 'score';
  /** 本次正向加分，与实际到账币数分别保存。 */
  scoreChange: number;
  /** 最末级指标名称，不保存老师描述或完整指标路径。 */
  indicatorNames?: readonly string[];
}
export type GrowthCoinAward = GrowthCoinAwardPeriod | GrowthCoinScoreAward;
export type GrowthCoinIssueRecord = { id: string; amount: number; time: string } & (
  | { category: 'growth_award'; period: GrowthCoinAwardPeriod }
  | { category: 'growth_award'; award: GrowthCoinScoreAward }
  | { category: 'class_reward' | 'bank_interest'; detail: string }
);

export interface GrowthCoinFlowRecord {
  id: string;
  category: GrowthCoinFlowCategory;
  detail: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  growthAward?: GrowthCoinAward;
}

export const GROWTH_COIN_FLOW_LABELS: Record<GrowthCoinFlowCategory, string> = {
  growth_award: '成长嘉奖', class_reward: '班级奖励', bank_interest: '银行利息',
  vending_exchange: '货柜兑换', class_exchange: '班级兑换', manual_clear: '手动清空',
};
export const GROWTH_COIN_INCOME_CATEGORIES: GrowthCoinIncomeCategory[] = ['growth_award', 'class_reward', 'bank_interest'];
export const GROWTH_COIN_EXPENSE_CATEGORIES: GrowthCoinExpenseCategory[] = ['vending_exchange', 'class_exchange', 'manual_clear'];

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
};

export const formatGrowthAwardDetail = (award: GrowthCoinAward): string => {
  if (award.type === 'score') {
    const names = [...new Set((award.indicatorNames ?? []).map(name => name.trim()).filter(Boolean))];
    const score = Number(award.scoreChange.toFixed(2));
    if (!names.length) return `加分奖励（评价加${score}分）`;
    const characters = Array.from(names[0]);
    const name = characters.length > 8 ? `${characters.slice(0, 8).join('')}…` : names[0];
    return `加分奖励（${name}${names.length > 1 ? `等${names.length}项` : ''}，+${score}分）`;
  }
  if (award.type === 'monthly') {
    const { month } = parseDateKey(`${award.month}-01`);
    return `每月奖励（${month}月）`;
  }
  const start = parseDateKey(award.startDate);
  const end = parseDateKey(award.endDate);
  return start.year !== end.year
    ? `每周奖励（${start.year}年${start.month}月${start.day}日-${end.year}年${end.month}月${end.day}日）`
    : `每周奖励（${start.month}月${start.day}日-${end.month}月${end.day}日）`;
};

export const getCampusCoinIssueDetail = (record: GrowthCoinIssueRecord): string => (
  record.category === 'growth_award'
    ? formatGrowthAwardDetail('award' in record ? record.award : record.period)
    : record.detail
);

export const toGrowthCoinIncomeFlow = (record: GrowthCoinIssueRecord): GrowthCoinFlowRecord => ({
  id: record.id, category: record.category, detail: getCampusCoinIssueDetail(record),
  amount: record.amount, type: 'income', date: record.time,
  ...(record.category === 'growth_award' ? { growthAward: 'award' in record ? record.award : record.period } : {}),
});

export const getGrowthCoinFlowDetail = (record: GrowthCoinFlowRecord): string => (
  record.category === 'growth_award' && record.growthAward
    ? formatGrowthAwardDetail(record.growthAward)
    : record.detail
);

export const formatCampusCoinFlowTime = (value: string): string => {
  const [date, time] = value.split(' ');
  const { month, day } = parseDateKey(date);
  return `${month}月${day}日${time ? ` ${time.slice(0, 5)}` : ''}`;
};
