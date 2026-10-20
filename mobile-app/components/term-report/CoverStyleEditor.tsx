import React, { useState } from 'react';
import { ImagePlus, ChevronRight, ChevronDown } from 'lucide-react';
import MobilePageHeader from '../ui/MobilePageHeader';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import CompactSegmentedControl from '../ui/CompactSegmentedControl';
import { COVER_THEMES, COVER_THEME_LABELS, resolveCoverImage, type CoverStyle, type ReportAppearance } from '../../domain/termReportAppearance';
import { readCoverUpload } from '../../services/termReportAppearanceStore';
import CoverPreview from './CoverPreview';
import { getTermReportCover } from '../../assets/termReportCovers';

export default function CoverStyleEditor({ config, initialStyle, scope, grades, onSave, onBack }: {
  config: ReportAppearance; initialStyle: CoverStyle; scope: string; grades: string[];
  onSave: (style: CoverStyle, assets: ReportAppearance['assets']) => void; onBack: () => void;
}) {
  const [style, setStyle] = useState({ ...initialStyle });
  const [assets, setAssets] = useState(config.assets);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [grade, setGrade] = useState(grades[0]);
  const [mode, setMode] = useState<'mobile' | 'a4'>('mobile');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [panel, setPanel] = useState<'image' | 'background' | null>(null);
  const dirty = JSON.stringify(style) !== JSON.stringify(initialStyle);
  const back = () => dirty || uploading ? setDiscard(true) : onBack();
  const selectedImage = resolveCoverImage(style, gender);
  const image = selectedImage ? assets[selectedImage.imageId] : undefined;
  const change = (patch: Partial<CoverStyle>) => { setStyle(value => ({ ...value, ...patch })); setError(''); };
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    setUploading(true); setError('');
    try {
      const asset = await readCoverUpload(file);
      const id = crypto.randomUUID();
      setAssets(previous => ({ ...previous, [id]: asset }));
      change(style.splitByGender ? { artwork: 'custom', genderImages: { ...style.genderImages, [gender]: { imageId: id, scale: 100, layout: 'cutout' } } } : { imageId: id, artwork: 'custom' });
    } catch (cause) { setError((cause as Error).message); }
    finally { setUploading(false); }
  };
  const changeImage = (fields: Partial<NonNullable<typeof selectedImage>>) => {
    if (style.splitByGender && selectedImage) change({ genderImages: { ...style.genderImages, [gender]: { ...selectedImage, ...fields } } });
    else change({ ...(fields.scale !== undefined ? { imageScale: fields.scale } : {}), ...(fields.layout ? { imageLayout: fields.layout } : {}) });
  };
  const previewConfig = { ...config, assets };
  const preview = <CoverPreview config={previewConfig} style={style} grade={grade} gender={gender} mode={mode} />;
  return <div className="report-management">
    <MobilePageHeader title={`${scope}封面`} onBack={back} />
    <div className="report-management__body">
      <div>
        <div className="mx-auto max-w-[230px]">{preview}</div>
        <button onClick={() => setExpanded(true)} className="mx-auto mt-1 flex min-h-11 items-center gap-1 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">预览<ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
      </div>
      <section className="report-management__surface !py-0">
        <button onClick={() => setPanel(panel === 'image' ? null : 'image')} className="report-management__row" aria-expanded={panel === 'image'} aria-controls="cover-image-options"><span className="flex-1">图片</span><span className="report-management__secondary">{style.artwork === 'students' ? '自动匹配' : style.artwork === 'preset' ? '指定插画' : '自定义'}</span><ChevronDown className={`h-4 w-4 text-[var(--tm-text-secondary)] ${panel === 'image' ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
        {panel === 'image' && <div id="cover-image-options" className="space-y-4 pb-4">
        <CompactSegmentedControl fullWidth semantics="group" ariaLabel="主图来源" value={style.artwork} onChange={artwork => change({ artwork, ...(artwork === 'preset' && !style.preset ? { preset: { grade: '一年级', gender: 'male' } } : {}) })} items={[{ value: 'students', label: '随学段与性别' }, { value: 'preset', label: '指定插画' }, { value: 'custom', label: '上传主图' }]} />
        {style.artwork === 'preset' && <>
          <label className="report-management__field">插画学段<select className="report-management__input" value={style.preset?.grade ?? '一年级'} onChange={event => change({ preset: { grade: event.target.value, gender: style.preset?.gender ?? 'male' } })}>{[['一年级', '小学低段'], ['三年级', '小学中段'], ['五年级', '小学高段'], ['七年级', '初中']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3">{(['male', 'female'] as const).map(value => <button key={value} aria-pressed={style.preset?.gender === value} className={`rounded-[var(--tm-radius-control)] p-2 text-sm ${style.preset?.gender === value ? 'bg-[var(--tm-brand-primary-soft)] ring-1 ring-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)]'}`} onClick={() => change({ preset: { grade: style.preset?.grade ?? '一年级', gender: value } })}><img src={getTermReportCover({ grade: style.preset?.grade ?? '一年级', gender: value }).src} alt="" className="mx-auto h-24 w-24 object-contain" />{value === 'male' ? '男生插画' : '女生插画'}</button>)}</div>
        </>}
        {style.artwork === 'custom' && <>
          <label className={`report-management__button relative w-full ${uploading ? 'opacity-50' : ''}`}>
            <ImagePlus className="h-5 w-5" aria-hidden="true" />{uploading ? '正在读取…' : image ? '更换主图' : '上传图片'}
            <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="上传封面主图" disabled={uploading} onChange={upload} className="absolute inset-0 w-full cursor-pointer opacity-0" />
          </label>
          <p className="report-management__secondary">PNG、JPG、WebP，最大 10 MB。</p>
          {image && <details className="report-management__secondary"><summary className="flex min-h-11 cursor-pointer items-center">调整图片</summary><div className="space-y-3 pt-2">
          <CompactSegmentedControl fullWidth semantics="group" ariaLabel="图片类型" value={selectedImage?.layout ?? style.imageLayout} onChange={layout => changeImage({ layout, scale: layout === 'scene' ? Math.min(selectedImage?.scale ?? 100, 100) : selectedImage?.scale ?? 100 })} items={[{ value: 'cutout', label: '透明背景形象' }, { value: 'scene', label: '完整场景图片' }]} />
          <label className="report-management__field">主图大小 · {selectedImage?.scale ?? 100}%<input aria-label="主图大小" type="range" min={10} max={400} step={5} value={selectedImage?.scale ?? 100} onChange={event => changeImage({ scale: Number(event.target.value) })} className="h-11 w-full accent-[var(--tm-brand-primary)]" /></label>
          </div></details>}
        </>}
        </div>}
        <button onClick={() => setPanel(panel === 'background' ? null : 'background')} className="report-management__row border-t border-[var(--tm-border-subtle)]" aria-expanded={panel === 'background'} aria-controls="cover-background-options"><span className="flex-1">背景</span><span className="report-management__swatch" data-theme={style.theme} /><span className="report-management__secondary">{COVER_THEME_LABELS[style.theme]}</span><ChevronDown className={`h-4 w-4 text-[var(--tm-text-secondary)] ${panel === 'background' ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
        {panel === 'background' && <div id="cover-background-options" className="pb-4">
        <div className="flex flex-wrap gap-1" role="group" aria-label="背景配色">
          {COVER_THEMES.map(theme => <button key={theme} aria-pressed={style.theme === theme} onClick={() => change({ theme })} className={`flex min-h-16 min-w-[52px] flex-1 flex-col items-center justify-center gap-2 rounded-[var(--tm-radius-control)] text-xs ${style.theme === theme ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)] ring-1 ring-inset ring-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-secondary)]'}`}><span className="report-management__swatch" data-theme={theme} />{COVER_THEME_LABELS[theme]}</button>)}
        </div>
        </div>}
      </section>
      {error && <p role="alert" className="report-management__error">{error}</p>}
    </div>
    <div className="report-management__footer"><button disabled={uploading || (style.artwork === 'custom' && !image)} onClick={() => { try { onSave(style, assets); } catch (cause) { setError((cause as Error).message); } }} className="report-management__button report-management__button--primary">保存</button></div>
    {discard && <MobileBottomSheet open title="放弃本次修改？" onClose={() => setDiscard(false)} footer={<div className="flex gap-3"><button className="report-management__button flex-1" onClick={() => setDiscard(false)}>继续编辑</button><button className="report-management__button flex-1" onClick={onBack}>放弃修改</button></div>}><span /></MobileBottomSheet>}
    {expanded && <MobileBottomSheet open size="tall" title="封面预览" onClose={() => setExpanded(false)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <CompactSegmentedControl<'mobile' | 'a4'> semantics="group" ariaLabel="预览尺寸" value={mode} onChange={setMode} items={[{ value: 'mobile', label: '手机' }, { value: 'a4', label: 'A4' }]} />
        <CompactSegmentedControl<'male' | 'female'> semantics="group" ariaLabel="预览性别" value={gender} onChange={setGender} items={[{ value: 'male', label: '男生' }, { value: 'female', label: '女生' }]} />
        {grades.length > 1 && <select aria-label="预览年级" value={grade} onChange={event => setGrade(event.target.value)} className="report-management__input">{grades.map(value => <option key={value}>{value}</option>)}</select>}
      </div>
      {preview}
    </MobileBottomSheet>}
  </div>;
}
