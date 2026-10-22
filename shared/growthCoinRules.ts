/** 学校成长币规则。缺少新增字段的历史配置继续使用定期发放。 */
export type GrowthCoinIssuanceMode = 'periodic' | 'score';

export interface ScoreCoinRule {
  coinsPerPoint: number;
  limitEnabled: boolean;
  limitPeriod: 'daily' | 'weekly' | 'monthly';
  limitAmount: number;
}

export interface GrowthCoinRuleOptions {
  mode?: GrowthCoinIssuanceMode;
  scoreRule?: ScoreCoinRule;
}

export interface GrowthCoinConfig extends GrowthCoinRuleOptions {
  enabled: boolean;
  period: 'weekly' | 'monthly';
  budgetMode: 'per_class' | 'per_student';
  budgetAmount: number;
  sunshineRatio: number;
  /** 本结算周期内班级至少需要发起的评价次数。 */
  minimumEvaluationCount: number;
  pendingChange?: {
    effectiveAt: string;
    config: Omit<GrowthCoinConfig, 'pendingChange'>;
  };
}

export const DEFAULT_SCORE_COIN_RULE: Readonly<ScoreCoinRule> = {
  coinsPerPoint: 1,
  limitEnabled: true,
  limitPeriod: 'weekly',
  limitAmount: 20,
};

export const GROWTH_COIN_MODES = [
  { value: 'periodic', label: '定期发放' },
  { value: 'score', label: '加分就发' },
] as const;

export const GROWTH_COIN_ENABLE_HELP = '开启后，系统将按照设置的规则自动给学生发放成长币。';

export const GROWTH_COIN_MODE_DESCRIPTIONS: Record<GrowthCoinIssuanceMode, string> = {
  periodic: '预算可控度高，按周 / 月统一结算、即时性低，老师漏评也有币，加分越多币越多，总预算不超支',
  score: '预算可控度中，加分就发币，即时性高，扣分不扣币，加分多的班级币越多，各班币量不一致',
};

export const getGrowthCoinMode = (config: GrowthCoinRuleOptions): GrowthCoinIssuanceMode => (
  config.mode === 'score' ? 'score' : 'periodic'
);

export const normalizeCoinRuleAmount = (value: number, fallback = 1): number => (
  Number.isFinite(value) && value > 0 ? Math.max(0.01, Math.round(value * 100) / 100) : fallback
);

export const getScoreCoinRule = (config: GrowthCoinRuleOptions): ScoreCoinRule => {
  const rule = { ...DEFAULT_SCORE_COIN_RULE, ...config.scoreRule };
  return {
    coinsPerPoint: normalizeCoinRuleAmount(rule.coinsPerPoint),
    limitEnabled: rule.limitEnabled !== false,
    limitPeriod: rule.limitPeriod === 'daily' ? 'daily' : rule.limitPeriod === 'monthly' ? 'monthly' : 'weekly',
    limitAmount: normalizeCoinRuleAmount(rule.limitAmount, DEFAULT_SCORE_COIN_RULE.limitAmount),
  };
};

export const getScoreCoinRuleSummary = (config: GrowthCoinRuleOptions): string => {
  const rule = getScoreCoinRule(config);
  return `加 1 分得 ${rule.coinsPerPoint} 币${rule.limitEnabled
    ? `，每人每${rule.limitPeriod === 'daily' ? '天' : rule.limitPeriod === 'weekly' ? '周' : '月'}最多获得 ${rule.limitAmount} 币`
    : '，不设发放上限'}`;
};

/** 按本次正向加分发币；periodIssued 是该学生本周期累计发放量，不是当前余额。
 * 评价总分、消费、扣分、存取款均不参与额度计算。正式发放需由服务端原子记账并去重。
 */
export const calculateScoreCoinAward = (
  config: GrowthCoinRuleOptions & { enabled: boolean },
  addedScore: number,
  periodIssued: number,
): number => {
  if (!config.enabled || getGrowthCoinMode(config) !== 'score' || !Number.isFinite(addedScore) || addedScore <= 0) return 0;
  const rule = getScoreCoinRule(config);
  const awardCents = Math.round(addedScore * rule.coinsPerPoint * 100);
  if (!Number.isSafeInteger(awardCents)) return 0;
  if (!rule.limitEnabled) return awardCents / 100;
  // 未取得有效累计值时不发放，防止额度查询失败被当成零。
  if (!Number.isFinite(periodIssued) || periodIssued < 0) return 0;
  const remainingCents = Math.max(0, Math.round(rule.limitAmount * 100) - Math.round(periodIssued * 100));
  return Math.min(awardCents, remainingCents) / 100;
};
