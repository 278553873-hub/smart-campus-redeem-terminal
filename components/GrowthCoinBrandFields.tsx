import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Modal } from '@arco-design/web-react';
import { Check, ChevronRight } from 'lucide-react';
import MobileBottomSheet from '../mobile-app/components/ui/MobileBottomSheet';
import { COIN_ICON_PRESETS, type GrowthCoinBranding } from '../shared/growthCoinBranding';
import { readCoinIconUpload } from '../shared/growthCoinIconUpload';
import { updateCoinBranding } from '../shared/growthCoinBrandingStore';
import { useCoinSchoolId, useGrowthCoinBranding } from './GrowthCoinBranding';

export const useCoinBrandingEditor = () => {
  const schoolId = useCoinSchoolId();
  const draft = useGrowthCoinBranding();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const apply = (patch: Partial<GrowthCoinBranding>): boolean => {
    try {
      updateCoinBranding(schoolId, patch);
      setError('');
      return true;
    } catch (cause) { setError((cause as Error).message); return false; }
  };
  return { draft, error, setError, busy, setBusy, apply };
};

const GrowthCoinBrandFields: React.FC<{
  editor: ReturnType<typeof useCoinBrandingEditor>;
  variant?: 'mobile' | 'pc';
}> = ({ editor, variant = 'mobile' }) => {
  const { draft, error, setError, busy, setBusy, apply } = editor;
  const [open, setOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const nameFormId = React.useId();
  const editName = () => { setNameDraft(draft.name); setError(''); setNameOpen(true); };
  const confirmName = () => {
    if (apply({ name: nameDraft })) { setNameOpen(false); }
  };
  const requestId = useRef(0);
  const uploadInput = useRef<HTMLInputElement>(null);
  useEffect(() => () => { requestId.current += 1; }, []);
  const mobile = variant === 'mobile';
  const choose = (iconUrl: string) => {
    if (apply({ iconUrl })) { setOpen(false); }
  };
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
  const editableRowClass = `${rowClass} min-h-12 w-full border-0 bg-transparent text-left disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${mobile
    ? '[-webkit-tap-highlight-color:transparent] focus-visible:ring-[var(--tm-focus-ring)]'
    : 'rounded-[var(--border-radius-medium)] hover:bg-[var(--color-fill-1)] active:bg-[var(--color-fill-2)] focus-visible:ring-[rgb(var(--primary-6))]'}`;
  const arrowClass = `h-4 w-4 shrink-0 ${mobile ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--color-text-3)]'}`;
  const nameForm = <form id={nameFormId} onSubmit={event => { event.preventDefault(); confirmName(); }} className="space-y-3">
    {/* 与登录抽屉一致：入场不聚焦输入框，避免键盘及浏览器滚动打断上滑。 */}
    {mobile ? <input value={nameDraft} maxLength={8} onChange={event => { setNameDraft(event.target.value); setError(''); }} aria-label="货币名称" placeholder="请输入1至8个字"
      className="h-11 w-full rounded-[var(--tm-form-control-radius)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 text-[14px] text-[var(--tm-input-text)] outline-none focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
      : <Input autoFocus value={nameDraft} maxLength={8} onChange={value => { setNameDraft(value); setError(''); }} aria-label="货币名称" placeholder="请输入1至8个字" />}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </form>;
  const picker = <div className="space-y-4">
    <div className="grid grid-cols-4 gap-3 p-1" role="group" aria-label="系统货币图标">
      {COIN_ICON_PRESETS.map(icon => <button key={icon.url} type="button" disabled={busy} aria-label={icon.name} aria-pressed={draft.iconUrl === icon.url}
        onClick={() => choose(icon.url)} className={`relative flex aspect-square min-h-11 min-w-0 items-center justify-center border-2 p-2 motion-safe:transition-transform enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 ${mobile
          ? `rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface-soft)] focus-visible:ring-[var(--tm-focus-ring)] ${draft.iconUrl === icon.url ? 'border-[var(--tm-brand-primary)] ring-2 ring-[var(--tm-brand-primary-soft-strong)]' : 'border-transparent'}`
          : `rounded-[var(--border-radius-large)] bg-[var(--color-fill-1)] focus-visible:ring-[rgb(var(--primary-6))] ${draft.iconUrl === icon.url ? 'border-[rgb(var(--primary-6))] ring-2 ring-[var(--color-primary-light-2)]' : 'border-transparent'}`}`}>
        <img src={icon.url} alt="" className="absolute inset-0 h-full w-full object-contain p-2" />
        {draft.iconUrl === icon.url && <span aria-hidden="true"
          className={`absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${mobile
            ? 'border-[var(--tm-bg-surface)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-icon)]'
            : 'border-[var(--color-bg-2)] bg-[rgb(var(--primary-6))] text-white'}`}>
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>}
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
      <button type="button" disabled={busy} onClick={editName} aria-label={`修改货币名称，当前${draft.name}`} aria-haspopup="dialog" aria-expanded={nameOpen} className={editableRowClass}>
        <span className={labelClass}>货币名称</span>
        <span className={`flex min-w-0 items-center gap-2 text-[14px] ${mobile ? 'justify-self-end text-[var(--tm-text-primary)]' : 'justify-self-start text-[var(--color-text-1)]'}`}>
          <span className="truncate">{draft.name}</span><ChevronRight aria-hidden="true" className={arrowClass} />
        </span>
      </button>
      <button type="button" disabled={busy} onClick={() => { setError(''); setOpen(true); }}
        aria-label="更换货币图标" aria-haspopup="dialog" aria-expanded={open}
        className={editableRowClass}>
        <span className={labelClass}>货币图标</span>
        <span className={`flex items-center gap-2 ${mobile ? 'justify-self-end' : 'justify-self-start'}`}>
          <img src={draft.iconUrl} alt="" className="h-8 w-8 object-contain" />
          <ChevronRight aria-hidden="true" className={`h-4 w-4 shrink-0 ${mobile ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--color-text-3)]'}`} />
        </span>
      </button>
    </div>
    {error && !open && !nameOpen && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {mobile ? <MobileBottomSheet open={nameOpen} title="修改货币名称" onClose={() => { setNameOpen(false); setError(''); }}
      footer={<button type="submit" form={nameFormId} disabled={!nameDraft.trim()} className="flex h-[var(--tm-sheet-action-height)] w-full items-center justify-center rounded-[var(--tm-sheet-action-radius)] bg-[var(--tm-brand-primary)] px-4 text-[length:var(--tm-sheet-action-font-size)] font-bold text-[var(--tm-text-inverse)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]">完成</button>}>
      {nameForm}
    </MobileBottomSheet> : <Modal visible={nameOpen} title="修改货币名称" okText="完成" cancelText="取消" okButtonProps={{ disabled: !nameDraft.trim() }} onOk={confirmName} onCancel={() => { setNameOpen(false); setError(''); }}>{nameForm}</Modal>}
    {mobile ? <MobileBottomSheet open={open} title="选择货币图标" onClose={() => { if (!busy) setOpen(false); }}>{picker}</MobileBottomSheet>
      : <Modal visible={open} title="选择货币图标" footer={null} onCancel={() => { if (!busy) setOpen(false); }}>{picker}</Modal>}
  </>;
};

export default GrowthCoinBrandFields;
