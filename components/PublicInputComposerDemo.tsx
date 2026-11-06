import MobilePhotoCapture from '../mobile-app/components/ui/MobilePhotoCapture';
import PreviewToggle from './PreviewToggle';
import React, { useState } from 'react';
import PhoneMockup from './PhoneMockup';
import MobileInputComposer from '../mobile-app/components/ui/MobileInputComposer';
import TeacherMobileScreenBackground from '../mobile-app/components/TeacherMobileScreenBackground';
import { useHoldToTalk } from '../mobile-app/hooks/useHoldToTalk';

const parameters = [
  ['mode / onModeChange', "'voice' | 'text' / 回调", '当前输入模式与切换回调。'],
  ['value / onChange', 'string / 回调', '文字草稿及更新回调。'],
  ['onSubmit', '回调', '提交有效文字；业务处理由调用方负责。'],
  ['onCameraClick', '可选回调', '传入时显示拍照入口，不传则隐藏。'],
  ['attachments / onRemoveAttachment', '照片列表 / 删除回调', '录入条上方展示待发送照片；有照片时最右侧显示发送。最多 9 张由采集层控制。'],
  ['shadow', "'subtle' | 'floating'", '默认轻阴影；记录页用 floating，两个助理用 subtle。'],
  ['voice', 'VoiceController（语音控制器）', '通过 useHoldToTalk 接入语音会话、音量及取消能力。'],
  ['disabled', 'boolean', '禁用拍照、语音和发送；保留文字草稿及模式切换。'],
  ['placeholder / voiceLabel / sendLabel', 'string', '输入提示、语音入口及发送按钮的可读名称。'],
] as const;
export default function PublicInputComposerDemo() {
  const [camera, setCamera] = useState(true);
  const [shadow, setShadow] = useState<'subtle' | 'floating'>('subtle');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [draft, setDraft] = useState('');
  const [fallback, setFallback] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [sent, setSent] = useState<{ id: string; url: string }[]>([]);
  const urls = React.useRef(new Set<string>());
  React.useEffect(() => () => urls.current.forEach(url => URL.revokeObjectURL(url)), []);
  const removePhoto = (id: string) => {
    const photo = photos.find(item => item.id === id);
    if (photo) { URL.revokeObjectURL(photo.url); urls.current.delete(photo.url); }
    setPhotos(items => items.filter(item => item.id !== id));
  };
  const submit = (text: string) => {
    if (!text.trim() && !photos.length) return;
    sent.forEach(photo => { URL.revokeObjectURL(photo.url); urls.current.delete(photo.url); });
    setSent(photos); setPhotos([]); setDraft('');
  };
  const voice = useHoldToTalk(submit, () => { setFallback(true); setMode('text'); });
  const usage = `<MobileInputComposer\n  mode={mode}\n  value={draft}\n  voice={voice}\n  shadow="${shadow}"\n${camera ? '  onCameraClick={openCamera}\n' : ''}  onModeChange={setMode}\n  onChange={setDraft}\n  onSubmit={submit}\n/>`;

  return <section className="grid h-full min-h-0 grid-cols-[440px_minmax(0,1fr)] overflow-hidden max-[1120px]:grid-cols-1 max-[1120px]:overflow-y-auto" aria-label="录入控件组件说明">
    <div className="teacher-mobile-app relative min-h-0 overflow-hidden max-[1120px]:h-[700px]">
      <div className="absolute inset-y-4 left-[46%] w-[900px] -translate-x-1/2">
        <PhoneMockup showDeviceFrame hideCapsule={cameraOpen} contentTopInsetMode={cameraOpen ? "none" : "status-bar"} chromeAppearance={cameraOpen ? "dark" : "light"} screenOverlayRootId="teacher-mobile-overlay-root" screenBackground={<TeacherMobileScreenBackground variant="record" />}>
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
            <header className="flex h-11 shrink-0 items-center px-5 text-[17px] font-semibold text-[var(--tm-text-primary)]">录入控件</header>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{sent.length > 0 && <div className="grid grid-cols-3 gap-2" aria-label="已发送照片">{sent.map(photo => <img key={photo.id} src={photo.url} alt="已发送的照片" className="aspect-square w-full rounded-lg object-cover" />)}</div>}</div>
            {cameraOpen && <MobilePhotoCapture remaining={9 - photos.length} thumbnail={photos.at(-1)?.url} onClose={() => setCameraOpen(false)} onSelect={files => {
              const additions = files.slice(0, 9 - photos.length).map(file => { const url = URL.createObjectURL(file); urls.current.add(url); return { id: url, url }; });
              setPhotos(items => [...items, ...additions].slice(0, 9)); setCameraOpen(false);
            }} />}
            <div className="absolute inset-x-3 bottom-6">
              <MobileInputComposer mode={mode} value={draft} shadow={shadow} voice={voice} attachments={photos} onRemoveAttachment={removePhoto} sendLabel="发送记录"
                placeholder={fallback ? '当前环境暂不支持语音，请输入文字' : '请输入'}
                onModeChange={next => { setMode(next); setFallback(false); }} onChange={setDraft} onSubmit={() => submit(draft)}
                onCameraClick={camera ? () => { voice.cancel(); if (photos.length < 9) setCameraOpen(true); } : undefined} />
            </div>
          </div>
        </PhoneMockup>
      </div>
    </div>
    <article className="min-h-0 overflow-y-auto border-l border-slate-200 bg-white px-8 py-7 max-[1120px]:overflow-visible max-[1120px]:border-l-0 max-[1120px]:border-t max-[720px]:px-5">
      <header className="pb-5">
        <p className="text-xs font-semibold text-[var(--tm-brand-primary)]">通用组件层 · 教师手机端</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">录入控件</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">记录页、班主任助理和校长助理共用 MobileInputComposer，拍照能力与阴影档位由参数控制。</p>
      </header>
      <section className="border-t border-slate-200 py-5" aria-labelledby="composer-preview-config">
        <h3 id="composer-preview-config" className="text-sm font-semibold text-slate-950">预览配置</h3>
        <div className="mt-3 flex flex-col gap-1">
          <PreviewToggle checked={camera} label="显示拍照入口" onChange={checked => { voice.cancel(); setCamera(checked); }} />
          <PreviewToggle checked={shadow === 'floating'} label="阴影加强" onChange={checked => setShadow(checked ? 'floating' : 'subtle')} />
        </div>
      </section>
      <section className="border-t border-slate-200 py-5" aria-labelledby="composer-parameters">
        <h3 id="composer-parameters" className="text-sm font-semibold text-slate-950">核心入参</h3>
        <div className="mt-3 overflow-x-auto"><table className="w-full border-collapse text-left text-xs leading-5">
          <thead><tr className="border-b border-slate-200 text-slate-500"><th scope="col" className="py-2 pr-3 font-medium">参数</th><th scope="col" className="py-2 pr-3 font-medium">类型</th><th scope="col" className="py-2 font-medium">用途</th></tr></thead>
          <tbody>{parameters.map(([name, type, description]) => <tr key={name} className="border-b border-slate-100 align-top"><th scope="row" className="py-2.5 pr-3 font-mono font-medium text-slate-800">{name}</th><td className="py-2.5 pr-3 text-slate-500">{type}</td><td className="py-2.5 text-slate-600">{description}</td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="border-t border-slate-200 py-5" aria-labelledby="composer-usage"><h3 id="composer-usage" className="text-sm font-semibold text-slate-950">使用示例</h3><pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100"><code>{usage}</code></pre>
        <p className="mt-3 text-xs leading-5 text-slate-500">语音控制器由 useHoldToTalk 提供；记录页演示通过 createSession 注入评价会话，业务层负责最终提交。</p>
      </section>

    </article>
  </section>;
}
