import { getNextGrowthCoinCycle } from './growthCoinRuleSchedule.ts';
import { getGrowthCoinMode, getScoreCoinRule, type GrowthCoinConfig } from './growthCoinRules.ts';

export type CoinRuleScenario = 'periodic-periodic' | 'score-score' | 'periodic-score' | 'score-periodic';
export const COIN_RULE_SCENARIOS: { value: CoinRuleScenario; label: string }[] = [
  { value: 'periodic-periodic', label: '定期发放 → 定期发放' },
  { value: 'score-score', label: '加分就发 → 加分就发' },
  { value: 'periodic-score', label: '定期发放 → 加分就发' },
  { value: 'score-periodic', label: '加分就发 → 定期发放' },
];

export const describeCoinRule = (config: GrowthCoinConfig): string => {
  if (!config.enabled) return '已关闭发币';
  if (getGrowthCoinMode(config) === 'score') {
    const rule = getScoreCoinRule(config);
    const period = { daily: '每天', weekly: '每周', monthly: '每月' }[rule.limitPeriod];
    return `加分就发；1分=${rule.coinsPerPoint}币；${rule.limitEnabled ? `${period}每人上限${rule.limitAmount}币` : '不限制发币数量'}`;
  }
  return `定期发放；${config.period === 'weekly' ? '每周一' : '每月1号'}发币；至少评价${config.minimumEvaluationCount}次；${config.budgetMode === 'per_student' ? '每人' : '每班'}预算${config.budgetAmount}币；阳光保底${config.sunshineRatio}%，积分排行${100 - config.sunshineRatio}%`;
};

export const getCoinRuleConfirmation = (before: GrowthCoinConfig, after: GrowthCoinConfig, now = new Date()) => {
  const from = getGrowthCoinMode(before);
  const to = getGrowthCoinMode(after);
  const scenario: CoinRuleScenario = `${from}-${to}`;
  const nextDate = new Date(Date.parse(getNextGrowthCoinCycle({ ...after, mode: 'periodic' }, now)) + 8 * 3600000);
  const nextIssueDate = `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, '0')}-${String(nextDate.getUTCDate()).padStart(2, '0')}`;
  const messages: Record<CoinRuleScenario, string> = {
    'periodic-periodic': `确认后，${nextIssueDate} 发币将按新规则执行。`,
    'score-score': '确认后，后续加分按新规则即时发币。',
    'periodic-score': '确认后，停止定期发币，后续加分按新规则即时发币。',
    'score-periodic': `确认后，停止即时发币，${nextIssueDate} 将按新规则定期发币。`,
  };
  return {
    title: !after.enabled ? '确认关闭发币？' : !before.enabled ? '确认开启发币？' : from === to
      ? `确认修改${to === 'score' ? '加分' : '定期'}发币规则？`
      : `确认切换为“${to === 'score' ? '加分就发' : '定期发放'}”？`,
    message: !after.enabled ? '确认后，立即停止发币。' : messages[scenario],
    before: describeCoinRule(before),
    after: describeCoinRule(after),
  };
};

export const COIN_RULE_PREVIEW_EVENT = 'coin-rule-confirmation-preview';
export const COIN_RULE_PAGE_EVENT = 'coin-rule-page-visible';
export const makeCoinRulePreview = (saved: GrowthCoinConfig, draft: GrowthCoinConfig, scenario: CoinRuleScenario) => {
  const [from, to] = scenario.split('-') as ('periodic' | 'score')[];
  const before = { ...saved, enabled: true, mode: from };
  const after = { ...draft, enabled: true, mode: to };
  if (from === to) {
    if (to === 'periodic' && before.budgetAmount === after.budgetAmount) after.budgetAmount += 100;
    if (to === 'score' && getScoreCoinRule(before).coinsPerPoint === getScoreCoinRule(after).coinsPerPoint) {
      after.scoreRule = { ...getScoreCoinRule(after), coinsPerPoint: getScoreCoinRule(after).coinsPerPoint + 1 };
    }
  }
  return { before, after, preview: true };
};
