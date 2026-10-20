import React from 'react';
import { normalizeCoinRuleAmount, type ScoreCoinRule } from '../../shared/growthCoinRules';

const controlClass = 'h-11 min-w-0 rounded-[var(--tm-form-control-radius)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 text-center text-[14px] font-semibold text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]';

const AmountInput: React.FC<{ value: number; label: string; onChange: (value: number) => void }> = ({ value, label, onChange }) => {
  const [draft, setDraft] = React.useState(String(value));
  React.useEffect(() => setDraft(String(value)), [value]);
  return (
    <input
      aria-label={label}
      type="number"
      min="0.01"
      step="0.01"
      inputMode="decimal"
      value={draft}
      onChange={event => {
        const raw = event.target.value;
        if (!/^\d*(\.\d{0,2})?$/.test(raw)) return;
        setDraft(raw);
        if (Number(raw) > 0) onChange(normalizeCoinRuleAmount(Number(raw)));
      }}
      onBlur={() => {
        const amount = normalizeCoinRuleAmount(Number(draft), value);
        setDraft(String(amount));
        onChange(amount);
      }}
      className={`${controlClass} w-full flex-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
    />
  );
};

const rowClass = 'grid min-h-12 grid-cols-[minmax(72px,1fr)_minmax(0,1.8fr)] items-center gap-3 px-1';
const labelClass = 'whitespace-nowrap text-[13px] font-semibold text-[var(--tm-text-secondary)]';
const titleClass = 'text-[15px] font-bold text-[var(--tm-text-primary)]';
const hintClass = 'pl-1 text-[12px] font-medium leading-5 text-[var(--tm-text-tertiary)]';

interface ScoreCoinFieldsProps {
  rule: ScoreCoinRule;
  onChange: (rule: ScoreCoinRule) => void;
}

/** 由页面使用与定期发放相同的表单卡片承载，各板块只负责自己的业务字段。 */
export const ScoreCoinAmountFields: React.FC<ScoreCoinFieldsProps> = ({ rule, onChange }) => (
  <>
    <h2 className={titleClass}>发放数量</h2>
    <div className={rowClass}>
      <span className={labelClass}>每加 1 分</span>
      <div className="flex w-[144px] max-w-full min-w-0 items-center justify-self-end gap-2">
        <AmountInput value={rule.coinsPerPoint} label="每加1分获得的成长币" onChange={coinsPerPoint => onChange({ ...rule, coinsPerPoint })} />
        <span className="shrink-0 text-[13px] font-semibold text-[var(--tm-brand-reward-strong)]">币</span>
      </div>
    </div>
    <p className={hintClass}>扣分不扣币，负分不影响加分得币。</p>
  </>
);

export const ScoreCoinLimitFields: React.FC<ScoreCoinFieldsProps & { limitSwitch: React.ReactNode }> = ({ rule, onChange, limitSwitch }) => (
  <>
    <h2 className={titleClass}>发放上限</h2>
    <div className="space-y-3">
      <div className={rowClass}>
        <span className={labelClass}>限制发放数量</span>
        <div className="justify-self-end">{limitSwitch}</div>
      </div>
      {rule.limitEnabled && (
        <>
          <div className={rowClass}>
            <span className={labelClass}>上限周期</span>
            <select aria-label="发放上限周期" value={rule.limitPeriod} onChange={event => onChange({ ...rule, limitPeriod: event.target.value as ScoreCoinRule['limitPeriod'] })} className={`${controlClass} w-[172px] max-w-full justify-self-end`}>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          </div>
          <div className={rowClass}>
            <span className={labelClass}>每人上限</span>
            <div className="flex w-[144px] max-w-full min-w-0 items-center justify-self-end gap-2">
              <AmountInput value={rule.limitAmount} label="每人每周期发放上限" onChange={limitAmount => onChange({ ...rule, limitAmount })} />
              <span className="shrink-0 text-[13px] font-semibold text-[var(--tm-brand-reward-strong)]">币</span>
            </div>
          </div>
          <p className={hintClass}>全校统一上限。领满后仍可加分，兑换不恢复额度。</p>
        </>
      )}
    </div>
  </>
);
