import React, { useState } from 'react';
import { Undo2 } from 'lucide-react';
import CoverPreview from './CoverPreview';
import { COVER_THEME_LABELS, constrainCoverPlacement, simplifyReportAppearance, resolveCoverImage, type CoverStyle, type ReportAppearance } from '../../domain/termReportAppearance';
import { readCoverUpload } from '../../services/termReportAppearanceStore';

export type SchoolCoverDraft = Pick<ReportAppearance, 'defaultCover' | 'logoId' | 'assets'>;
export type CoverTool = 'image' | 'background' | 'logo';
export default function SchoolCoverSettings({ config, draft, grade, onChange, onBusyChange, onUndo, onSave, saveError = '' }: {
  config: ReportAppearance; draft: SchoolCoverDraft | null; grade: string;
  onSave: () => void; saveError?: string;
  onChange: (draft: SchoolCoverDraft) => void; onBusyChange: (busy: boolean) => void; onUndo?: () => void;
}) {
  const [imageSelected, setImageSelected] = useState(true);
  const [tool, setTool] = useState<CoverTool>('image');
  const value = simplifyReportAppearance({ ...config, ...draft });
  const style = value.defaultCover;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selectedImage = resolveCoverImage(style, 'male');
  const hasImage = Boolean(selectedImage && value.assets[selectedImage.imageId]);
  const logo = value.logoId ? value.assets[value.logoId] : undefined;
  const patch = (fields: Partial<SchoolCoverDraft>) => { onChange({ defaultCover: style, logoId: value.logoId, assets: value.assets, ...fields }); setError(''); };
  const changeStyle = (fields: Partial<CoverStyle>) => patch({ defaultCover: { ...style, ...fields } });
  const upload = async (event: React.ChangeEvent<HTMLInputElement>, slot: 'logo' | 'image') => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    setBusy(true); onBusyChange(true); setError('');
    try {
      const asset = await readCoverUpload(file);
      const imageId = crypto.randomUUID();
      const assets = { ...value.assets, [imageId]: asset };
      if (slot === 'logo') patch({ logoId: imageId, assets });
      else { setImageSelected(true); patch({ assets, defaultCover: { ...style, artwork: 'custom', splitByGender: false, imageId, ...constrainCoverPlacement(100), imageRotation: 0, imageLayout: file.type === 'image/jpeg' ? 'scene' : 'cutout' } }); }
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); onBusyChange(false); }
  };
  return <div className="school-cover-workspace">
    <section className="school-cover-workspace__canvas" aria-label="封面实时预览">
      <CoverPreview fit config={value} style={style} grade={grade} gender="male" hideArtwork={!hasImage && style.artwork !== 'preset'} artworkEditor={hasImage ? { selected: tool === 'image' && imageSelected, disabled: busy, onSelect: () => { setTool('image'); setImageSelected(true); }, onDeselect: () => setImageSelected(false), onChange: changeStyle } : undefined} />
    </section>
    <div className="school-cover-workspace__tools">
      <div className="school-cover-workspace__toolbar">
        <div className="school-cover-workspace__tool-switch" role="group" aria-label="封面工具">
          {([{ value: 'image', label: '封面图' }, { value: 'background', label: '背景' }, { value: 'logo', label: '校徽' }] as const).map(item => <button key={item.value} type="button" disabled={busy} aria-pressed={tool === item.value} onClick={() => { setTool(item.value); if (item.value === 'image') setImageSelected(true); }} className="school-cover-workspace__tool">{item.label}</button>)}
        </div>
      </div>
      <section className="school-cover-workspace__panel" aria-label={tool === 'image' ? '封面图设置' : tool === 'background' ? '背景色设置' : '校徽设置'}>
        {tool === 'image' && <>
          <div className="flex items-center gap-2">
            <label className="report-management__button relative flex-1 focus-within:ring-2 focus-within:ring-[var(--tm-focus-ring)]">{hasImage ? '更换封面图' : '上传封面图'}<input disabled={busy} type="file" accept="image/png,image/jpeg,image/webp" aria-label="上传封面图" onChange={event => upload(event, 'image')} className="absolute inset-0 w-full cursor-pointer opacity-0" /></label>
            {hasImage && <button disabled={busy} className="report-management__button" onClick={() => changeStyle({ ...constrainCoverPlacement(100), imageRotation: 0 })}>重置</button>}
          </div>
          {!hasImage && <p className="report-management__secondary mt-2">PNG、JPG、WebP，单张最大 10 MB</p>}
        </>}
        {tool === 'background' && <div className="flex items-center gap-2" role="group" aria-label="背景配色">{(['blue', 'violet', 'sage', 'sand'] as const).map(theme => <button disabled={busy} key={theme} aria-pressed={style.theme === theme} onClick={() => changeStyle({ theme })} className={`flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-[var(--tm-form-control-radius)] text-sm ${style.theme === theme ? 'bg-[var(--tm-brand-primary-soft)] ring-1 ring-inset ring-[var(--tm-brand-primary)]' : ''}`}><span className="report-management__swatch" data-theme={theme} />{COVER_THEME_LABELS[theme]}</button>)}</div>}
        {tool === 'logo' && <div className="flex flex-wrap items-center justify-center gap-3">
          {logo && <img src={logo.src} alt="学校标识" className="h-10 max-w-[90px] object-contain" />}
          <label className="report-management__button relative focus-within:ring-2 focus-within:ring-[var(--tm-focus-ring)]">{logo ? '更换校徽' : '上传校徽（选填）'}<input disabled={busy} type="file" accept="image/png,image/jpeg,image/webp" aria-label="上传学校标识" onChange={event => upload(event, 'logo')} className="absolute inset-0 w-full cursor-pointer opacity-0" /></label>
          {logo && <button disabled={busy} className="report-management__button" onClick={() => patch({ logoId: undefined })}>移除</button>}
        </div>}
      {busy && <p role="status" className="report-management__secondary">正在读取…</p>}
      {(error || saveError) && <p role="alert" className="report-management__error">{error || saveError}</p>}
      </section>
      <div className="school-cover-workspace__save">
        {onUndo && <button disabled={busy} className="school-cover-workspace__undo" aria-label="撤销上次修改" onClick={onUndo}><Undo2 className="h-5 w-5" aria-hidden="true" /></button>}
        <button disabled={busy || !draft} className="report-management__button report-management__button--primary flex-1" onClick={onSave}>保存</button>
      </div>

    </div>
  </div>;
}
