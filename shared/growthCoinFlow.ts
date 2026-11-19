/** 三端共用的奖励快照；历史文案读取记录本身，不读取当前发放设置。 */
export type GrowthCoinIncomeCategory = 'growth_award' | 'class_reward' | 'bank_interest' | 'exchange_refund';
export type GrowthCoinExpenseCategory = 'vending_exchange' | 'class_exchange' | 'award_recovery' | 'manual_clear';
export type GrowthCoinFlowCategory = GrowthCoinIncomeCategory | GrowthCoinExpenseCategory;
export type GrowthCoinAwardPeriod =
  | { type: 'weekly'; startDate: string; endDate: string }
  | { type: 'monthly'; month: string };
export interface GrowthCoinScoreAward {
  type: 'score';
  /** 本次正向加分，与实际到账币数分别保存。 */
  scoreChange: number;
  /** 发币时的完整指标路径及各项分值；补发时只保存增加的分值。 */
  indicators?: readonly { path: readonly string[]; scoreChange: number }[];
  adjustment?: 'supplement';
  /** 兼容旧流水，不能根据当前指标配置补造历史路径。 */
  indicatorNames?: readonly string[];
}
export type GrowthCoinAward = GrowthCoinAwardPeriod | GrowthCoinScoreAward;
/** 历史退款未存原因时沿用货柜未出货退还，班级撤回须明确记录。 */
export type GrowthCoinExchangeRefundReason = 'not_dispensed' | 'exchange_revoked';
export type GrowthCoinIssueRecord = { id: string; amount: number; time: string; relatedRecordId?: string } & (
  | { category: 'growth_award'; period: GrowthCoinAwardPeriod }
  | { category: 'growth_award'; award: GrowthCoinScoreAward }
  | { category: 'class_reward' | 'bank_interest'; detail: string }
  | { category: 'exchange_refund'; productName: string; quantity: number; refundReason?: GrowthCoinExchangeRefundReason }
);

export type GrowthCoinRecoveryReason = 'evaluation_revoked' | 'evaluation_targets_changed' | 'evaluation_score_changed';
const RECOVERY_REASON_LABELS: Record<GrowthCoinRecoveryReason, string> = {
  evaluation_revoked: '评价撤回', evaluation_targets_changed: '评价对象修改', evaluation_score_changed: '评价分数修改',
};

export type GrowthCoinConsumeRecord = {
  id: string;
  amount: number;
  time: string;
  /** 发币撤回关联原收入；金额是实际扣币数，不是应扣数。 */
  relatedRecordId?: string;
} & (
  | { category: Exclude<GrowthCoinExpenseCategory, 'award_recovery'>; productName: string; quantity: number }
  | { category: 'award_recovery'; reason: GrowthCoinRecoveryReason }
);

export interface GrowthCoinFlowRecord {
  id: string;
  category: GrowthCoinFlowCategory;
  detail: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  growthAward?: GrowthCoinAward;
  productName?: string;
  quantity?: number;
  refundReason?: GrowthCoinExchangeRefundReason;
  relatedRecordId?: string;
}

export const GROWTH_COIN_FLOW_LABELS: Record<GrowthCoinFlowCategory, string> = {
  growth_award: '成长嘉奖', class_reward: '班级奖励', bank_interest: '银行利息', exchange_refund: '兑换退还',
  vending_exchange: '货柜兑换', class_exchange: '班级兑换', award_recovery: '发币撤回', manual_clear: '手动清空',
};
export const GROWTH_COIN_INCOME_CATEGORIES: GrowthCoinIncomeCategory[] = ['growth_award', 'class_reward', 'bank_interest', 'exchange_refund'];
export const GROWTH_COIN_EXPENSE_CATEGORIES: GrowthCoinExpenseCategory[] = ['vending_exchange', 'class_exchange', 'award_recovery', 'manual_clear'];

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month, day };
};

export const formatGrowthAwardDetail = (award: GrowthCoinAward): string => {
  if (award.type === 'score') {
    const title = award.adjustment === 'supplement' ? '评价修改补发' : '加分奖励';
    const indicators = (award.indicators ?? []).filter(item => item.scoreChange > 0);
    if (indicators.length) {
      return `${title}（${indicators.map(item => `${item.path.join(' / ')}，+${Number(item.scoreChange.toFixed(2))}分`).join('；')}）`;
    }
    const names = [...new Set((award.indicatorNames ?? []).map(name => name.trim()).filter(Boolean))];
    const score = Number(award.scoreChange.toFixed(2));
    if (!names.length) return `${title}（评价加${score}分）`;
    return `${title}（${names.join('；')}，+${score}分）`;
  }
  if (award.type === 'monthly') {
    const { year, month } = parseDateKey(`${award.month}-01`);
    return `每月奖励（${year}年${month}月）`;
  }
  const start = parseDateKey(award.startDate);
  const end = parseDateKey(award.endDate);
  return start.year !== end.year
    ? `每周奖励（${start.year}年${start.month}月${start.day}日—${end.year}年${end.month}月${end.day}日）`
    : `每周奖励（${start.month}月${start.day}日—${end.month}月${end.day}日）`;
};

const formatExchangeRefundDetail = (productName: string, quantity: number, reason?: GrowthCoinExchangeRefundReason) => (
  reason === 'exchange_revoked' ? `撤回兑换 · ${productName}` : `未出货退还 · ${productName}×${quantity}`
);

export const getCampusCoinIssueDetail = (record: GrowthCoinIssueRecord): string => {
  if (record.category === 'growth_award') return formatGrowthAwardDetail('award' in record ? record.award : record.period);
  if (record.category === 'bank_interest') return '存款利息';
  if (record.category === 'exchange_refund') return formatExchangeRefundDetail(record.productName, record.quantity, record.refundReason);
  return record.detail;
};

export const toGrowthCoinIncomeFlow = (record: GrowthCoinIssueRecord): GrowthCoinFlowRecord => ({
  id: record.id, category: record.category, detail: getCampusCoinIssueDetail(record),
  amount: record.amount, type: 'income', date: record.time,
  relatedRecordId: record.relatedRecordId,
  ...(record.category === 'growth_award' ? { growthAward: 'award' in record ? record.award : record.period } : {}),
  ...(record.category === 'exchange_refund' ? { productName: record.productName, quantity: record.quantity, refundReason: record.refundReason } : {}),
});

export const toGrowthCoinExpenseFlow = (record: GrowthCoinConsumeRecord): GrowthCoinFlowRecord => ({
  id: record.id, category: record.category, amount: record.amount, type: 'expense', date: record.time,
  detail: record.category === 'award_recovery' ? RECOVERY_REASON_LABELS[record.reason] : record.productName,
  ...(record.category !== 'award_recovery' ? { productName: record.productName, quantity: record.quantity } : {}),
  relatedRecordId: record.relatedRecordId,
});

/** 权限过滤与文案在同一出口处理，避免新字段绕过家长端的明细权限。 */
export const getGrowthCoinFlowDetail = (
  record: GrowthCoinFlowRecord,
  { canViewEvaluationDetails = true, coinName = '成长币' }: { canViewEvaluationDetails?: boolean; coinName?: string } = {},
): string => {
  if (record.category === 'growth_award') {
    if (!canViewEvaluationDetails && record.growthAward?.type === 'score') {
      return formatGrowthAwardDetail({ ...record.growthAward, indicators: [], indicatorNames: [] });
    }
    if (!canViewEvaluationDetails && !record.growthAward) return '加分奖励';
    if (record.growthAward) return formatGrowthAwardDetail(record.growthAward);
  }
  if (record.category === 'bank_interest') return '存款利息';
  if (record.category === 'manual_clear') return record.detail.replaceAll('成长币', coinName);
  if (record.productName != null && record.quantity != null) {
    const product = `${record.productName}×${record.quantity}`;
    if (record.category === 'exchange_refund') return formatExchangeRefundDetail(record.productName, record.quantity, record.refundReason);
    if (record.category === 'vending_exchange' || record.category === 'class_exchange') return product;
  }
  return record.detail;
};

/** 只根据实际到账的关联流水显示状态；原金额和时间不变，周期奖励不随评价撤回。 */
export const getGrowthCoinFlowStatus = (record: GrowthCoinFlowRecord, records: readonly GrowthCoinFlowRecord[]): '已撤回' | '已退还' | undefined => {
  if (record.category === 'growth_award' && record.growthAward?.type === 'score'
    && records.some(item => item.category === 'award_recovery' && item.type === 'expense' && item.amount > 0 && item.relatedRecordId === record.id)) return '已撤回';
  if ((record.category === 'vending_exchange' || record.category === 'class_exchange') && record.amount > 0) {
    // 货柜退款可能是老师手动撤回或货柜机自动未出货；班级兑换只接受明确的撤回原因。
    const refunds = records.filter(item => item.category === 'exchange_refund' && item.type === 'income'
      && item.amount > 0 && item.relatedRecordId === record.id
      && (record.category === 'vending_exchange' || item.refundReason === 'exchange_revoked'));
    const refunded = refunds.reduce((total, item) => total + item.amount, 0);
    // 关联原单即视为已退还；老师手动撤回与货柜未出货自动退币共用同一关联口径。
    if (Math.round(refunded * 100) >= Math.round(record.amount * 100)) {
      return record.category === 'class_exchange' || refunds.some(item => item.refundReason === 'exchange_revoked') ? '已撤回' : '已退还';
    }
  }
  return undefined;
};

export const formatCampusCoinFlowTime = (value: string): string => {
  const [date, time] = value.split(' ');
  const { month, day } = parseDateKey(date);
  return `${month}月${day}日${time ? ` ${time.slice(0, 5)}` : ''}`;
};
