import React from 'react';
import MobileSelectField from './ui/MobileSelectField';
import { normalizeCoinRuleAmount, type ScoreCoinRule } from '../../shared/growthCoinRules';

const controlClass = 'h-11 min-w-0 rounded-[var(--tm-form-control-radius)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] text-center text-[14px] font-semibold text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]';

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
      className={`${controlClass} w-[60px] flex-none px-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
    />
  );
};

const rowClass = 'grid h-12 grid-cols-[minmax(72px,1fr)_minmax(0,1.8fr)] items-center gap-3 px-1';
const labelClass = 'whitespace-nowrap text-[13px] font-semibold text-[var(--tm-text-secondary)]';
const titleClass = 'text-[15px] font-bold text-[var(--tm-text-primary)]';

interface ScoreCoinFieldsProps {
  rule: ScoreCoinRule;
  onChange: (rule: ScoreCoinRule) => void;
}

/** 由页面使用与定期发放相同的表单卡片承载，各板块只负责自己的业务字段。 */
export const ScoreCoinAmountFields: React.FC<ScoreCoinFieldsProps> = ({ rule, onChange }) => (
  <>
    <h2 className={titleClass}>发放数量</h2>
    <div className={rowClass}>
      <span className={labelClass}>发放规则</span>
      <div className="flex min-w-0 items-center justify-self-end gap-2">
        <span className="shrink-0 whitespace-nowrap text-[13px] text-[var(--tm-text-secondary)]">1分=</span>
        <AmountInput value={rule.coinsPerPoint} label="每加1分获得的成长币" onChange={coinsPerPoint => onChange({ ...rule, coinsPerPoint })} />
        <span className="shrink-0 text-[13px] font-semibold text-[var(--tm-brand-reward-strong)]">币</span>
      </div>
    </div>
  </>
);

export const ScoreCoinLimitFields: React.FC<ScoreCoinFieldsProps & { limitSwitch: React.ReactNode }> = ({ rule, onChange, limitSwitch }) => (
  <>
    <h2 className={titleClass}>发放上限</h2>
    <div className="flex flex-col gap-3">
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 px-1">
        <span className={`${labelClass} leading-5`}>限制发放数量</span>
        <div className="flex h-11 shrink-0 items-center">{limitSwitch}</div>
      </div>
      {rule.limitEnabled && (
        <div className="grid min-h-12 grid-cols-[52px_minmax(0,1fr)] items-center gap-2 px-1">
          <span className={labelClass}>上限规则</span>
          <div className="flex min-w-0 items-center justify-self-end gap-1 whitespace-nowrap text-[12px] text-[var(--tm-text-secondary)]">
            <MobileSelectField<ScoreCoinRule['limitPeriod']>
              label="发放上限周期" value={rule.limitPeriod} className="w-[72px]"
              options={[{ value: 'daily', label: '每天' }, { value: 'weekly', label: '每周' }, { value: 'monthly', label: '每月' }]}
              onChange={limitPeriod => onChange({ ...rule, limitPeriod })}
            />
            <span className="shrink-0">每人</span>
            <AmountInput value={rule.limitAmount} label="每人每周期发放上限" onChange={limitAmount => onChange({ ...rule, limitAmount })} />
            <span className="shrink-0 font-semibold text-[var(--tm-brand-reward-strong)]">币</span>
          </div>
        </div>
      )}
    </div>
  </>
);
