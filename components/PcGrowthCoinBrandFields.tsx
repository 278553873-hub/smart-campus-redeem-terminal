import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Tabs } from '@arco-design/web-react';
import { Check, Plus } from 'lucide-react';
import { COIN_ICON_PRESETS, validateCoinName } from '../shared/growthCoinBranding';
import { readCoinIconUpload } from '../shared/growthCoinIconUpload';
import { useCoinBrandingEditor } from './GrowthCoinBrandFields';

/** PC 页内编辑；仅共享外观存储与校验，不复用手机端设置行交互。 */
export default function PcGrowthCoinBrandFields({ editor }: {
  editor: ReturnType<typeof useCoinBrandingEditor>;
}) {
  const { draft, apply, error, setError, busy, setBusy } = editor;
  const [iconTab, setIconTab] = useState(draft.iconUrl === draft.customIconUrl ? 'custom' : 'preset');
  const [name, setName] = useState(draft.name);
  const [nameError, setNameError] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [errorField, setErrorField] = useState<'name' | 'icon'>('icon');
  const validateName = () => {
    try { validateCoinName(name); setNameError(''); return true; }
    catch (cause) { setNameError((cause as Error).message); return false; }
  };
  const saveName = () => {
    if (busy || !validateName()) return;
    setErrorField('name');
    setNameSaved(apply({ name }));
  };
  const chooseIcon = (iconUrl: string) => { setErrorField('icon'); apply({ iconUrl }); };
  const iconClass = (selected: boolean) => `relative flex h-20 w-20 items-center justify-center rounded border bg-[var(--color-bg-2)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary-6))] ${selected ? 'border-[rgb(var(--primary-6))]' : 'border-[var(--color-border-2)]'}`;
  const selectedMark = <Check aria-hidden="true" className="absolute bottom-1 right-1 h-4 w-4 text-[rgb(var(--primary-6))]" />;
  const uploadInput = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  useEffect(() => setName(draft.name), [draft.name]);
  useEffect(() => {
    setIconTab(draft.iconUrl === draft.customIconUrl ? 'custom' : 'preset');
  }, [draft.iconUrl, draft.customIconUrl]);
  useEffect(() => () => { requestId.current += 1; }, []);
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const id = ++requestId.current;
    setErrorField('icon');
    setBusy(true);
    setError('');
    try {
      const iconUrl = await readCoinIconUpload(file);
      if (id === requestId.current) apply({ iconUrl });
    } catch (cause) {
      if (id === requestId.current) setError((cause as Error).message);
    } finally {
      if (id === requestId.current) setBusy(false);
    }
  };
  return <div className="pc-coin-settings-sections">
    <h4 className="m-0 mb-4 text-base font-semibold">名称与图标</h4>
    <div className="pc-coin-settings-fields">
      <label htmlFor="pc-growth-coin-name" className="text-sm text-[var(--color-text-2)]">货币名称</label>
      <div><form className="flex flex-wrap items-center gap-3" onSubmit={event => { event.preventDefault(); saveName(); }}>
        <Input id="pc-growth-coin-name" value={name} maxLength={8} placeholder="请输入1至8个字" disabled={busy}
          onBlur={validateName} aria-invalid={Boolean(nameError || (errorField === 'name' && error))} aria-describedby="pc-growth-coin-name-feedback"
          style={{ width: 280, maxWidth: '100%' }} onChange={value => { setName(value); setNameError(''); setNameSaved(false); if (errorField === 'name') setError(''); }} />
        <Button htmlType="submit" disabled={busy || !name.trim() || name === draft.name}>保存名称</Button>
        {nameSaved && <span role="status" className="text-[13px] text-[var(--color-text-2)]">已保存</span>}
      </form>
      <div id="pc-growth-coin-name-feedback">
        {(nameError || (errorField === 'name' && error)) && <p role="alert" className="mt-2 text-[13px] text-[rgb(var(--danger-6))]">{nameError || error}</p>}
      </div></div>
      <span className="self-start pt-2 text-sm text-[var(--color-text-2)]">货币图标</span>
      <div>
        <Tabs activeTab={iconTab} onChange={setIconTab} destroyOnHide={false}>
          <Tabs.TabPane key="preset" title="默认图标" disabled={busy}>
        <div className="flex flex-wrap gap-3" role="group" aria-label="选择货币图标">
          {COIN_ICON_PRESETS.map(icon => <button key={icon.url} type="button" disabled={busy}
            aria-label={icon.name} aria-pressed={draft.iconUrl === icon.url}
            onClick={() => chooseIcon(icon.url)}
            className={iconClass(draft.iconUrl === icon.url)}>
            <img src={icon.url} alt="" className="h-14 w-14 object-contain" />
            {draft.iconUrl === icon.url && selectedMark}
          </button>)}
          {!COIN_ICON_PRESETS.some(icon => icon.url === draft.iconUrl) && draft.iconUrl !== draft.customIconUrl && <div className={iconClass(true)} aria-label="当前旧版图标"><img src={draft.iconUrl} alt="当前旧版图标" className="h-14 w-14 object-contain" />{selectedMark}</div>}
        </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="custom" title="自定义上传" disabled={busy}>
          <div className="flex w-20 flex-col items-center gap-2">
            <button type="button" disabled={busy} aria-label={draft.customIconUrl ? '选择自定义图标' : '上传自定义图标'}
              aria-pressed={draft.customIconUrl ? draft.iconUrl === draft.customIconUrl : undefined}
              onClick={() => draft.customIconUrl ? chooseIcon(draft.customIconUrl) : uploadInput.current?.click()}
              className={iconClass(Boolean(draft.customIconUrl && draft.iconUrl === draft.customIconUrl))}>
              {draft.customIconUrl ? <img src={draft.customIconUrl} alt="" className="h-14 w-14 object-contain" />
                : <span className="flex flex-col items-center gap-1 text-[var(--color-text-2)]"><Plus aria-hidden="true" size={20} /><span className="text-xs">上传</span></span>}
              {draft.customIconUrl && draft.iconUrl === draft.customIconUrl && selectedMark}
            </button>
            {draft.customIconUrl && <Button type="text" size="small" loading={busy} onClick={() => uploadInput.current?.click()}>更换图片</Button>}
          </div>
        {busy && <p role="status" className="mt-2 text-[13px] text-[var(--color-text-2)]">正在处理图片…</p>}
        <p className="mb-0 mt-2 text-[13px] leading-5 text-[var(--color-text-2)]">PNG、JPG、WebP，最大5MB，建议使用正方形图片。</p>
          </Tabs.TabPane>
        </Tabs>
        <input ref={uploadInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={upload} disabled={busy} aria-label="上传货币图标" />
      </div>
    </div>
    {errorField === 'icon' && error && <p role="alert" className="pc-coin-settings-field-help mt-4 text-sm text-[rgb(var(--danger-6))]">{error}</p>}
  </div>;
}
