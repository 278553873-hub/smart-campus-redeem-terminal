import React, { useState } from 'react';
import MobileSettingsSwitchRow from '../components/ui/MobileSettingsSwitchRow';
import { MobileCard } from '../components/ui/MobileCard';
import { type DevelopmentIndicator, type EvaluationPeriodMode } from './data';
import { ruleUsesLevels } from './recordLevels';
import { bodyClass, metaClass, primaryAction, RowButton } from './ui';

const pageClass = 'min-h-0 flex-1 space-y-4 overflow-y-auto bg-[var(--tm-page-plain-content-bg)] px-5 py-4';
const footerClass = 'shrink-0 bg-[var(--tm-bg-surface)] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3';

export function IndicatorSettingsPage({ indicators, onSave }: { indicators: DevelopmentIndicator[]; onSave: (indicators: DevelopmentIndicator[]) => void }) {
  const [selected, setSelected] = useState<DevelopmentIndicator | null>(null);
  const [error, setError] = useState('');
  return <>
    {!selected ? <div className={pageClass}>
      <p className={metaClass}>设置仅影响新提交的记录，历史记录保持原样。</p>
      {[...new Set(indicators.map(item => item.dimension))].map(dimension => <section key={dimension}>
        <h2 className={`mb-2 ${bodyClass} font-semibold`}>{dimension}</h2>
        <MobileCard padding="none"><div className="px-4">{indicators.filter(item => item.dimension === dimension).map(item => <RowButton key={item.id} onClick={() => { setSelected({ ...item, roles: [...item.roles] }); setError(''); }} description={`${item.roles.map(role => role === 'teacher' ? '教师' : '管理者').join('、')} · ${item.requiresReview ? '需审核' : '免审'}${item.distinguishLevels ? ' · 区分等级' : ''}`}>{item.name}</RowButton>)}</div></MobileCard>
      </section>)}
    </div> : <>
      <div className={pageClass}>
        <button type="button" onClick={() => setSelected(null)} className="min-h-11 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-brand-primary)]">返回指标列表</button>
        <h2 className="text-[length:var(--tm-font-size-section-title)] font-bold">{selected.name}</h2>
        <MobileCard><fieldset><legend className={`mb-2 ${bodyClass} font-semibold`}>评价角色</legend>{(['teacher', 'manager'] as const).map(role => <label key={role} className={`flex min-h-11 items-center gap-3 ${bodyClass}`}><input type="checkbox" checked={selected.roles.includes(role)} onChange={event => { setSelected({ ...selected, roles: event.target.checked ? (['teacher', 'manager'] as const).filter(item => item === role || selected.roles.includes(item)) : selected.roles.filter(item => item !== role) }); setError(''); }} className="h-5 w-5 accent-[var(--tm-brand-primary)]" />{role === 'teacher' ? '教师' : '管理者'}</label>)}</fieldset></MobileCard>
        <MobileCard>
          <MobileSettingsSwitchRow label="需审核" checked={selected.requiresReview} onChange={requiresReview => setSelected({ ...selected, requiresReview })} surface="plain" shape="subtle" />
          <MobileSettingsSwitchRow label="区分等级" checked={selected.distinguishLevels} onChange={distinguishLevels => { setSelected({ ...selected, distinguishLevels }); setError(''); }} surface="plain" shape="subtle" />
        </MobileCard>
        <p className={metaClass}>评分标准：{selected.rule}</p>
        {error && <p role="alert" className={`${bodyClass} text-[var(--tm-status-negative-strong)]`}>{error}</p>}
      </div>
      <footer className={footerClass}><button type="button" className={primaryAction} onClick={() => {
        if (!selected.roles.length) { setError('请至少选择一种评价角色。'); return; }
        if (!selected.distinguishLevels && ruleUsesLevels(selected.rule)) { setError('当前评分标准含等级条件，请保留“区分等级”。'); return; }
        onSave(indicators.map(item => item.id === selected.id ? selected : item)); setSelected(null);
      }}>保存</button></footer>
    </>}
  </>;
}

export function PeriodSettingsPage({ periodMode, onSave }: { periodMode: EvaluationPeriodMode; onSave: (mode: EvaluationPeriodMode) => void }) {
  const [selectedMode, setSelectedMode] = useState<EvaluationPeriodMode>(periodMode);
  return <>
    <div className={pageClass}>
      <fieldset><legend className={`mb-3 ${bodyClass} font-semibold`}>考核周期按</legend>
        <div className="space-y-3">
          <MobileCard><label className="flex min-h-11 cursor-pointer items-center gap-3"><input type="radio" name="development-period-mode" checked={selectedMode === 'semester'} onChange={() => setSelectedMode('semester')} className="h-5 w-5 shrink-0 accent-[var(--tm-brand-primary)]" /><span className="min-w-0"><span className={`${bodyClass} block font-semibold`}>按学期</span><span className={`${metaClass} mt-1 block`}>分第一学期、第二学期统计，可切换历史学期。</span></span></label></MobileCard>
          <MobileCard><label className="flex min-h-11 cursor-pointer items-center gap-3"><input type="radio" name="development-period-mode" checked={selectedMode === 'academic-year'} onChange={() => setSelectedMode('academic-year')} className="h-5 w-5 shrink-0 accent-[var(--tm-brand-primary)]" /><span className="min-w-0"><span className={`${bodyClass} block font-semibold`}>按学年</span><span className={`${metaClass} mt-1 block`}>按每年9月1日至次年8月31日统计，可切换历史学年。</span></span></label></MobileCard>
        </div>
      </fieldset>
      <p className={metaClass}>设置后，档案、报表和助理分析会按所选方式展示周期，之后仍可切换历史周期。</p>
    </div>
    <footer className={footerClass}><button type="button" className={primaryAction} onClick={() => onSave(selectedMode)}>保存</button></footer>
  </>;
}
