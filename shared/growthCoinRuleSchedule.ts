import { getGrowthCoinMode, getScoreCoinRule, type GrowthCoinConfig } from './growthCoinRules.ts';

const withoutPending = ({ pendingChange: _pending, ...config }: GrowthCoinConfig): GrowthCoinConfig => config;

/** 业务读取有效规则；设置页单独读取待生效草稿。时间统一按学校使用的北京时间计算。 */
export const getEffectiveGrowthCoinConfig = (config: GrowthCoinConfig, now = new Date()): GrowthCoinConfig => (
  config.pendingChange && Date.parse(config.pendingChange.effectiveAt) <= now.getTime()
    ? withoutPending(config.pendingChange.config)
    : withoutPending(config)
);

export const getEditableGrowthCoinConfig = (config: GrowthCoinConfig): GrowthCoinConfig => (
  withoutPending(config.pendingChange?.config ?? config)
);

export const getNextGrowthCoinCycle = (config: GrowthCoinConfig, now = new Date()): string => {
  const period = getGrowthCoinMode(config) === 'score' && getScoreCoinRule(config).limitEnabled
    ? getScoreCoinRule(config).limitPeriod : config.period;
  const chinaTime = new Date(now.getTime() + 8 * 3600000);
  const year = chinaTime.getUTCFullYear();
  const month = chinaTime.getUTCMonth();
  const day = chinaTime.getUTCDate();
  const nextMidnight = period === 'monthly'
    ? Date.UTC(year, month + 1, 1)
    : period === 'daily' ? Date.UTC(year, month, day + 1)
      : Date.UTC(year, month, day + ((8 - chinaTime.getUTCDay()) % 7 || 7));
  return new Date(nextMidnight - 8 * 3600000).toISOString();
};

export const formatGrowthCoinEffectiveTime = (time: string): string => {
  const date = new Date(Date.parse(time) + 8 * 3600000);
  return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日 00:00`;
};

const comparable = (config: GrowthCoinConfig) => JSON.stringify({
  enabled: config.enabled,
  mode: getGrowthCoinMode(config),
  period: config.period,
  budgetMode: config.budgetMode,
  budgetAmount: config.budgetAmount,
  sunshineRatio: config.sunshineRatio,
  minimumEvaluationCount: config.minimumEvaluationCount,
  scoreRule: getScoreCoinRule(config),
});

export interface GrowthCoinSaveNotice {
  message: string;
}

/** 仅规则变化返回弹窗内容；外观变化和重复保存交由页面显示通用轻提示。 */
export const saveGrowthCoinRule = (saved: GrowthCoinConfig, draft: GrowthCoinConfig, now = new Date()): {
  config: GrowthCoinConfig;
  notice: GrowthCoinSaveNotice | null;
} => {
  const active = getEffectiveGrowthCoinConfig(saved, now);
  const next = withoutPending(draft);
  if (comparable(active) === comparable(next)) return { config: next, notice: null };
  return {
    config: next,
    notice: {
      message: !next.enabled
        ? '成长币发放已关闭。'
        : getGrowthCoinMode(next) === 'score'
          ? '新规则已生效，加分后按新规则立即发放。'
          : '新规则已生效，将在下一次定期结算时按新规则发放。',
    },
  };
};
