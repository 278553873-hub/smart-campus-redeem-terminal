import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import { FeaturePageBody, FeaturePanel, SwitchControl, featureFormPrimaryButtonClass } from './MeFeatureViews';
import { readSchoolClassPetSettings, writeSchoolClassPetSettings, validPetLevelPoints, type SchoolClassPetSettings } from '../../shared/classPetSettings';

const EXPERIENCE_STAGES = [
  { name: '初生蛋', levels: [1], color: 'egg' },
  { name: '幼年期', levels: [2, 3], color: 'juvenile' },
  { name: '成长期', levels: [4, 5], color: 'growth' },
  { name: '成熟期', levels: [6, 7], color: 'mature' },
  { name: '完全体', levels: [8, 9], color: 'complete' },
  { name: '究极体', levels: [10], color: 'ultimate' },
];

export default function ClassPetSettingsView({ schoolId }: { schoolId: string }) {
  const [config, setConfig] = useState(() => readSchoolClassPetSettings(schoolId));
  const [advanced, setAdvanced] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const save = (next: SchoolClassPetSettings) => {
    try {
      writeSchoolClassPetSettings(schoolId, next);
      setConfig(next);
      setNotice('');
      return true;
    } catch {
      setNotice('保存失败，请重试');
      return false;
    }
  };
  const labelClass = 'text-[14px] font-bold text-[var(--tm-text-primary)]';
  const rowClass = 'flex min-h-[60px] items-center justify-between gap-3';
  return <FeaturePageBody spacing="compact">
    <FeaturePanel variant="form" className="px-4 py-2">
      <div className={rowClass}>
        <span className={labelClass}>开启AI宠物</span>
        <SwitchControl checked={config.enabled} label="开启AI宠物" onChange={enabled => save({ ...config, enabled })} />
      </div>
    </FeaturePanel>
    {config.enabled && <>
      <FeaturePanel variant="form" className="space-y-4 p-4">
        <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">基础设置</h2>
        <div className="space-y-3">
          <div className="grid min-h-12 grid-cols-[minmax(72px,1fr)_minmax(0,2.8fr)] items-center gap-3 px-1">
            <h3 className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">领取方式</h3>
            <div className="ml-auto flex w-[190px] max-w-full min-w-0 justify-end">
              <CompactSegmentedControl
                value={config.claimMethod}
                items={[
                  { value: 'teacher', label: '班主任领取' },
                  { value: 'student', label: '学生领取' },
                ]}
                ariaLabel="领取方式" semantics="group" variant="settings" shape="subtle" motion="sliding" fullWidth
                onChange={claimMethod => save({ ...config, claimMethod })}
              />
            </div>
          </div>
          <div className="grid min-h-12 grid-cols-[minmax(72px,1fr)_minmax(0,2.8fr)] items-center gap-3 px-1">
            <h3 className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">扣分处理</h3>
            <div className="ml-auto flex w-[190px] max-w-full min-w-0 justify-end">
              <CompactSegmentedControl
                value={config.deductExperience ? 'deduct' : 'keep'}
                items={[{ value: 'keep', label: '不扣经验' }, { value: 'deduct', label: '扣经验' }]}
                ariaLabel="扣分处理方式" semantics="group" variant="settings" shape="subtle" motion="sliding" fullWidth
                onChange={value => save({ ...config, deductExperience: value === 'deduct' })}
              />
            </div>
          </div>
        </div>
        <p className="text-[13px] leading-5 text-[var(--tm-text-secondary)]">
          {config.deductExperience ? '扣分时扣除等量经验，已解锁的进化阶段和宠物形象保留，不会退回上一阶段。' : '扣分不影响宠物经验。'}
        </p>
      </FeaturePanel>
      <FeaturePanel variant="form" className="px-4 py-2">
        <h2 className="pt-2 text-[15px] font-bold text-[var(--tm-text-primary)]">高级设置</h2>
        <button type="button" className={`${rowClass} w-full text-left [-webkit-tap-highlight-color:transparent]`} onClick={() => {
          setDraft(config.levelPoints.map((_, index) => String(config.levelPoints.slice(0, index + 1).reduce((sum, value) => sum + value, 0)))); setError(''); setAdvanced(true);
        }}>
          <span className={labelClass}>升级经验</span><ChevronRight className="h-4 w-4 text-[var(--tm-text-secondary)]" aria-hidden="true" />
        </button>
      </FeaturePanel>
    </>}
    <p role="status" aria-live="polite" className="text-[13px] text-[var(--tm-text-secondary)]">{notice}</p>
    <MobileBottomSheet open={advanced} title="升级经验" onClose={() => setAdvanced(false)} size="tall" footer={<button type="button" className={featureFormPrimaryButtonClass} onClick={() => {
      const thresholds = draft.map(value => /^\d+$/.test(value) ? Number(value) : NaN);
      const points = thresholds.map((value, index) => value - (index === 0 ? 0 : thresholds[index - 1]));
      if (!validPetLevelPoints(points)) { setError('累计经验须为正整数，且每一级必须高于前一级'); return; }
      if (save({ ...config, levelPoints: points })) setAdvanced(false);
    }}>保存</button>}>
      <div className="space-y-4">
        <p className="text-[13px] leading-5 text-[var(--tm-text-secondary)]">设置达到每一级所需的累计经验。2级首次孵化，此后每跨两级进入新阶段。</p>
        {EXPERIENCE_STAGES.map(stage => <section key={stage.name} aria-label={`${stage.name} ${stage.levels.join('至')}级`} className="overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-muted)]" style={{ borderTop: `4px solid var(--tm-pet-stage-${stage.color})` }}>
          <h3 className="px-4 pt-3 text-center text-[14px] font-bold text-[var(--tm-text-primary)]">{stage.name}</h3>
          <div className={`grid gap-4 p-4 ${stage.levels.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {stage.levels.map(level => <label key={level} className="flex min-w-0 flex-col items-center gap-2">
              <span className="text-[15px] font-semibold text-[var(--tm-text-primary)]">{level}级{level === 10 ? ' · 满级' : ''}</span>
              {level === 1 ? <span className="flex h-11 items-center text-[14px] text-[var(--tm-text-secondary)]">0经验</span> : <span className="flex min-w-0 items-center gap-1 text-[12px] text-[var(--tm-text-secondary)]">
                <input aria-label={`${stage.name}${level}级所需累计经验`} inputMode="numeric" value={draft[level - 2] ?? ''} onChange={event => {
                  setDraft(previous => previous.map((item, index) => index === level - 2 ? event.target.value : item)); setError('');
                }} className="h-11 w-20 min-w-0 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-2 text-center text-[14px] tabular-nums text-[var(--tm-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-brand-primary)]" />经验
              </span>}
            </label>)}
          </div>
        </section>)}
        {error && <p role="alert" className="text-[13px] text-[var(--tm-status-negative)]">{error}</p>}
      </div>
    </MobileBottomSheet>
  </FeaturePageBody>;
}
