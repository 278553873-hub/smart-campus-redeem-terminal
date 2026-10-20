import React, { useState } from 'react';
import { ChevronDown, Settings2, Smartphone } from 'lucide-react';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import {
  teacherGradientSchemeOptions,
  teacherGradientStyleOptions,
  type TeacherGradientPreviewConfig,
} from '../styles/teacherGradientPreview';
import type { DevelopmentIndicator } from './data';
import { ruleUsesLevels } from './recordLevels';
import { metaClass, primaryAction, secondaryAction } from './ui';

interface Props {
  isManager: boolean;
  onActorChange: (id: string) => void;
  showPhoneShell: boolean;
  onPhoneShellChange: (show: boolean) => void;
  preview: TeacherGradientPreviewConfig;
  onPreviewChange: (preview: TeacherGradientPreviewConfig) => void;
  indicators: DevelopmentIndicator[];
  onIndicatorsChange: (indicators: DevelopmentIndicator[]) => void;
  onReset: () => void;
  storageError: boolean;
}

// 演示工具独立于手机业务页面，配色选项与渐变算法使用教师手机端同一来源。
const cardClass = 'rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl';
const selectClass = 'h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[12px] font-semibold text-slate-700 outline-none transition-colors focus:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400';

export default function DemoControls({
  isManager, onActorChange, showPhoneShell, onPhoneShellChange,
  preview, onPreviewChange, indicators, onIndicatorsChange, onReset, storageError,
}: Props) {
  const [controlsOpen, setControlsOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  return <aside className="td-demo-controls" aria-label="教师评价演示控制">
    <button
      type="button" role="switch" aria-checked={showPhoneShell} aria-label="模拟真实手机"
      onClick={() => onPhoneShellChange(!showPhoneShell)}
      className="flex min-h-11 items-center justify-between gap-2 self-end rounded-full border border-slate-200/80 bg-white/90 px-3 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-colors active:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      <Smartphone size={16} className="shrink-0 text-slate-600" aria-hidden="true" />
      <span className="whitespace-nowrap text-[12px] font-semibold text-slate-700">模拟真实手机</span>
      <span className={`relative h-[22px] w-10 shrink-0 rounded-full p-0.5 transition-colors ${showPhoneShell ? 'bg-slate-800' : 'bg-slate-300'}`} aria-hidden="true">
        <span className={`block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${showPhoneShell ? 'translate-x-[18px]' : 'translate-x-0'}`} />
      </span>
    </button>

    <section className={cardClass} aria-label="外观设置">
      <PreviewSelect label="配色方案" ariaLabel="选择渐变配色方案" value={preview.schemeId} options={teacherGradientSchemeOptions} onChange={schemeId => onPreviewChange({ ...preview, schemeId })} />
      <PreviewSelect label="渐变样式" ariaLabel="选择渐变样式" value={preview.styleId} options={teacherGradientStyleOptions} onChange={styleId => onPreviewChange({ ...preview, styleId })} />
    </section>

    <section className="w-full rounded-lg border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)]" aria-label="演示身份切换">
      <CompactSegmentedControl
        value={isManager ? 'manager' : 'teacher'}
        items={[{ value: 'teacher', label: '教师' }, { value: 'manager', label: '管理者' }]}
        onChange={role => onActorChange(role === 'manager' ? 't2' : 't1')}
        ariaLabel="演示身份" motion="sliding" fullWidth
      />
    </section>

    <section className={`${cardClass} min-h-0`} aria-label="指标演示配置">
      <button type="button" onClick={() => setControlsOpen(!controlsOpen)} aria-expanded={controlsOpen} aria-controls="development-indicator-controls" className="flex min-h-11 w-full items-center gap-2 px-1 text-left text-[13px] font-semibold text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400 rounded-lg">
        <Settings2 size={16} aria-hidden="true" />
        <span className="flex-1">指标演示配置</span>
        <ChevronDown size={16} className={`transition-transform motion-reduce:transition-none ${controlsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {controlsOpen && <div id="development-indicator-controls" className="td-indicator-controls space-y-4 px-1 pb-1">
        <p className={metaClass}>设置仅影响新提交，历史记录保持原样。</p>
        {indicators.map(indicator => <fieldset key={indicator.id} className="border-t border-slate-100 pt-3">
          <legend className="pr-2 text-[13px] font-semibold">{indicator.name}</legend>
          <PreviewSelect label="评价角色" ariaLabel={`${indicator.name}评价角色`} value={indicator.roles.join(',')} options={[{ id: 'teacher,manager', label: '教师、管理者' }, { id: 'teacher', label: '教师' }, { id: 'manager', label: '管理者' }]} onChange={roles => onIndicatorsChange(indicators.map(item => item.id === indicator.id ? { ...item, roles: roles.split(',') as DevelopmentIndicator['roles'] } : item))} />
          <label className="flex min-h-11 items-center gap-2 text-[13px] text-slate-600">
            <input type="checkbox" aria-label={`${indicator.name}需审核`} checked={indicator.requiresReview} onChange={event => onIndicatorsChange(indicators.map(item => item.id === indicator.id ? { ...item, requiresReview: event.target.checked } : item))} />需审核
          </label>
          <label className="flex min-h-11 items-center gap-2 text-[13px] text-slate-600">
            <input type="checkbox" aria-label={`${indicator.name}区分等级`} checked={indicator.distinguishLevels} onChange={event => onIndicatorsChange(indicators.map(item => item.id === indicator.id ? { ...item, distinguishLevels: event.target.checked } : item))} />区分等级
          </label>
          {indicator.distinguishLevels && <p className={metaClass}>校级、区级、市级、省级、国家级</p>}
          {!indicator.distinguishLevels && ruleUsesLevels(indicator.rule) && <p role="status" className={metaClass}>当前评分标准含等级条件，请开启区分等级或同步调整评分标准。</p>}
        </fieldset>)}
        {resetConfirm ? <div>
          <p className={metaClass}>将清除本轮新增记录并恢复预置配置。</p>
          <div className="mt-2 flex gap-2">
            <button type="button" className={secondaryAction} onClick={() => setResetConfirm(false)}>取消</button>
            <button type="button" className={primaryAction} onClick={() => { onReset(); setResetConfirm(false); setControlsOpen(false); }}>重置</button>
          </div>
        </div> : <button type="button" className={secondaryAction} onClick={() => setResetConfirm(true)}>重置演示数据</button>}
        <p className={metaClass}>虚构演示数据。文字、语音和图片识别均为预置模拟，未接入真实AI。</p>
      </div>}
    </section>
    {storageError && <p role="alert" className={metaClass}>浏览器未允许保存数据，刷新后将恢复预置记录。</p>}
  </aside>;
}

function PreviewSelect<T extends string>({ label, ariaLabel, value, options, onChange }: {
  label: string; ariaLabel: string; value: T;
  options: ReadonlyArray<{ id: T; label: string }>; onChange: (value: T) => void;
}) {
  return <label className="flex min-h-11 items-center gap-2">
    <span className="w-14 shrink-0 pl-1 text-[11px] font-bold text-slate-500">{label}</span>
    <span className="relative min-w-0 flex-1">
      <select aria-label={ariaLabel} value={value} onChange={event => onChange(event.target.value as T)} className={selectClass}>
        {options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 text-slate-400 -translate-y-1/2" aria-hidden="true" />
    </span>
  </label>;
}
