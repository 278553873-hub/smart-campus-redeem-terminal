import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Modal } from '@arco-design/web-react';
import { ChevronRight } from 'lucide-react';
import MobileBottomSheet from '../mobile-app/components/ui/MobileBottomSheet';
import { COIN_ICON_PRESETS } from '../shared/growthCoinBranding';
import { readCoinIconUpload } from '../shared/growthCoinIconUpload';
import { saveCoinBranding } from '../shared/growthCoinBrandingStore';
import { useCoinSchoolId, useGrowthCoinBranding } from './GrowthCoinBranding';
import type { GrowthCoinSaveNotice } from '../shared/growthCoinRuleSchedule';

export const useCoinBrandingDraft = () => {
  const schoolId = useCoinSchoolId();
  const saved = useGrowthCoinBranding();
  const [draft, setDraft] = useState(saved);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setDraft(saved); setError(''); }, [saved, schoolId]);
  const commit = (): boolean | null => {
    if (busy) return null;
    try {
      const changed = draft.name.trim() !== saved.name || draft.iconUrl !== saved.iconUrl;
      if (changed) saveCoinBranding(schoolId, draft);
      setError('');
      return changed;
    } catch (cause) { setError((cause as Error).message); return null; }
  };
  return { draft, setDraft, error, setError, busy, setBusy, commit };
};

export const withCoinBrandingSaveNotice = (notice: GrowthCoinSaveNotice, changed: boolean): GrowthCoinSaveNotice => (
  !changed ? notice : notice.headline === '继续使用当前规则'
    ? { headline: '名称与图标已立即生效', detail: notice.detail }
    : { ...notice, detail: `名称与图标已立即生效。${notice.detail}` }
);

const GrowthCoinBrandFields: React.FC<{
  editor: ReturnType<typeof useCoinBrandingDraft>;
  variant?: 'mobile' | 'pc';
}> = ({ editor, variant = 'mobile' }) => {
  const { draft, setDraft, error, setError, busy, setBusy } = editor;
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);
  const uploadInput = useRef<HTMLInputElement>(null);
  useEffect(() => () => { requestId.current += 1; }, []);
  const mobile = variant === 'mobile';
  const choose = (iconUrl: string) => { setDraft(value => ({ ...value, iconUrl })); setError(''); setOpen(false); };
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    const id = ++requestId.current;
    setBusy(true); setError('');
    try { const iconUrl = await readCoinIconUpload(file); if (id === requestId.current) choose(iconUrl); }
    catch (cause) { if (id === requestId.current) setError((cause as Error).message); }
    finally { if (id === requestId.current) setBusy(false); }
  };
  const rowClass = mobile
    ? 'grid min-h-12 grid-cols-[minmax(72px,1fr)_minmax(0,1.8fr)] items-center gap-3 px-1'
    : 'grid grid-cols-[120px_minmax(0,1fr)] items-center gap-y-5';
  const labelClass = mobile ? 'whitespace-nowrap text-[13px] font-semibold text-[var(--tm-text-secondary)]' : 'text-sm text-[#4E5969]';
  const picker = <div className="space-y-4">
    <div className="grid grid-cols-4 gap-2" role="group" aria-label="系统货币图标">
      {COIN_ICON_PRESETS.map(icon => <button key={icon.url} type="button" disabled={busy} aria-label={icon.name} aria-pressed={draft.iconUrl === icon.url}
        onClick={() => choose(icon.url)} className={`flex aspect-square min-h-11 items-center justify-center rounded-lg border p-3 focus-visible:outline-none focus-visible:ring-2 ${mobile
          ? `focus-visible:ring-[var(--tm-focus-ring)] ${draft.iconUrl === icon.url ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary-soft)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`
          : `focus-visible:ring-[rgb(var(--primary-6))] ${draft.iconUrl === icon.url ? 'border-[rgb(var(--primary-6))] bg-[var(--color-primary-light-1)]' : 'border-[var(--color-border-2)] bg-[var(--color-bg-2)]'}`}`}>
        <img src={icon.url} alt="" className="h-12 w-12 max-w-full object-contain" />
      </button>)}
    </div>
    <input ref={uploadInput} type="file" accept="image/png,image/jpeg,image/webp" aria-label="上传货币图标" disabled={busy} onChange={upload} className="hidden" />
    {mobile ? <button type="button" disabled={busy} onClick={() => uploadInput.current?.click()}
      className="flex h-[var(--tm-sheet-action-height)] w-full items-center justify-center rounded-[var(--tm-sheet-action-radius)] bg-[var(--tm-brand-primary)] px-4 text-[length:var(--tm-sheet-action-font-size)] font-bold text-[var(--tm-text-inverse)] active:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2">
      {busy ? '正在读取…' : '上传自定义图标'}
    </button> : <Button type="primary" long loading={busy} onClick={() => uploadInput.current?.click()}>上传自定义图标</Button>}
    <p className="text-xs leading-5 text-gray-500">PNG、JPG、WebP，最大5MB，建议使用正方形图片。</p>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </div>;
  return <>
    <h2 className={mobile ? 'text-[15px] font-bold text-[var(--tm-text-primary)]' : 'm-0 mb-5 text-base font-semibold leading-6 text-[#1D2129]'}>名称与图标</h2>
    <div className="space-y-3">
      <label className={rowClass}>
        <span className={labelClass}>货币名称</span>
        {mobile ? <input value={draft.name} maxLength={8} onChange={event => { setDraft({ ...draft, name: event.target.value }); setError(''); }} aria-label="货币名称"
          placeholder="成长币" className="h-11 w-[144px] max-w-full min-w-0 justify-self-end rounded-[var(--tm-form-control-radius)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 text-right text-[14px] font-semibold text-[var(--tm-input-text)] outline-none focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
          : <Input value={draft.name} maxLength={8} onChange={name => { setDraft({ ...draft, name }); setError(''); }} aria-label="货币名称" placeholder="成长币" style={{ width: 160 }} />}
      </label>
      <button type="button" disabled={busy} onClick={() => setOpen(true)}
        aria-label="更换货币图标" aria-haspopup="dialog" aria-expanded={open}
        className={`${rowClass} min-h-12 w-full border-0 bg-transparent text-left disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${mobile
          ? 'rounded-[var(--tm-form-control-radius)] active:bg-[var(--tm-bg-surface-soft)] focus-visible:ring-[var(--tm-focus-ring)]'
          : 'rounded-[var(--border-radius-medium)] hover:bg-[var(--color-fill-1)] active:bg-[var(--color-fill-2)] focus-visible:ring-[rgb(var(--primary-6))]'}`}>
        <span className={labelClass}>货币图标</span>
        <span className={`flex items-center gap-2 ${mobile ? 'justify-self-end' : 'justify-self-start'}`}>
          <img src={draft.iconUrl} alt="" className="h-8 w-8 object-contain" />
          <ChevronRight aria-hidden="true" className={`h-4 w-4 shrink-0 ${mobile ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--color-text-3)]'}`} />
        </span>
      </button>
    </div>
    {error && !open && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {mobile ? <MobileBottomSheet open={open} title="选择货币图标" onClose={() => { if (!busy) setOpen(false); }}>{picker}</MobileBottomSheet>
      : <Modal visible={open} title="选择货币图标" footer={null} onCancel={() => { if (!busy) setOpen(false); }}>{picker}</Modal>}
  </>;
};

export default GrowthCoinBrandFields;
