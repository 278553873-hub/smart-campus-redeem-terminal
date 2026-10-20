import React, { useState } from 'react';
import PhoneMockup from './PhoneMockup';
import MobileInputComposer, { type VoicePressState } from '../mobile-app/components/ui/MobileInputComposer';
import TeacherMobileScreenBackground from '../mobile-app/components/TeacherMobileScreenBackground';
import { useHoldToTalk } from '../mobile-app/hooks/useHoldToTalk';

const parameters = [
  ['mode / onModeChange', "'voice' | 'text' / 回调", '当前输入模式与切换回调。'],
  ['value / onChange', 'string / 回调', '文字草稿及更新回调。'],
  ['onSubmit', '回调', '提交有效文字；业务处理由调用方负责。'],
  ['onCameraClick', '可选回调', '传入时显示拍照入口，不传则隐藏。'],
  ['shadow', "'subtle' | 'floating'", '默认轻阴影；记录页用 floating，两个助理用 subtle。'],
  ['voice', 'VoiceController（语音控制器）', '通过 useHoldToTalk 接入语音会话、音量及取消能力。'],
  ['disabled', 'boolean', '禁用拍照、语音和发送；保留文字草稿及模式切换。'],
  ['placeholder / voiceLabel / sendLabel', 'string', '输入提示、语音入口及发送按钮的可读名称。'],
] as const;
const samples = ['今天同学们积极参与课堂讨论。', '值日小组主动整理了图书角。', '同学们互相帮助，按时完成小组任务。'];
const controlClass = 'min-h-11 w-full rounded-[var(--tm-radius-control-compact)] border border-slate-200 bg-white px-3 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]';

export default function PublicInputComposerDemo() {
  const [scene, setScene] = useState<'record' | 'headteacher' | 'principal'>('record');
  const [camera, setCamera] = useState(true);
  const [shadow, setShadow] = useState<'subtle' | 'floating'>('floating');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [draft, setDraft] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [statePreview, setStatePreview] = useState<'interactive' | VoicePressState>('interactive');
  const [status, setStatus] = useState('尚未提交');
  const [fallback, setFallback] = useState(false);
  const cameraInput = React.useRef<HTMLInputElement>(null);
  const submit = (text: string) => {
    if (!text.trim() || disabled) return;
    setStatus(`已提交：${text.trim()}`);
    setDraft('');
  };
  const voice = useHoldToTalk(submit, () => { setFallback(true); setMode('text'); });
  const title = scene === 'record' ? '记录' : scene === 'headteacher' ? '班主任助理' : '校长助理';
  const changeScene = (next: typeof scene) => {
    voice.cancel(); setScene(next); setCamera(next === 'record');
    setShadow(next === 'record' ? 'floating' : 'subtle');
    setStatePreview('interactive'); setMode('voice'); setFallback(false);
  };
  const previewVoice = statePreview === 'interactive' ? voice : {
    ...voice, state: statePreview, start: () => {}, move: () => {}, release: () => {}, cancel: () => {},
  };
  const usage = `<MobileInputComposer\n  mode={mode}\n  value={draft}\n  voice={voice}\n  shadow="${shadow}"\n${camera ? '  onCameraClick={openCamera}\n' : ''}  onModeChange={setMode}\n  onChange={setDraft}\n  onSubmit={submit}\n/>`;

  return <section className="grid h-full min-h-0 grid-cols-[440px_minmax(0,1fr)] overflow-hidden max-[1120px]:grid-cols-1 max-[1120px]:overflow-y-auto" aria-label="语音与文字输入组件说明">
    <div className="teacher-mobile-app relative min-h-0 overflow-hidden max-[1120px]:h-[700px]">
      <div className="absolute inset-y-4 left-[46%] w-[900px] -translate-x-1/2">
        <PhoneMockup showDeviceFrame contentTopInsetMode="status-bar" screenOverlayRootId="teacher-mobile-overlay-root" screenBackground={<TeacherMobileScreenBackground variant="record" />}>
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
            <header className="flex h-11 shrink-0 items-center px-5 text-[17px] font-semibold text-[var(--tm-text-primary)]">{title}</header>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-32 pt-3">
              {samples.concat(samples).map((text, index) => <article key={index} className="rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
                <p className="text-[12px] text-[var(--tm-text-tertiary)]">{index < 3 ? '今天' : '昨天'}</p>
                <p className="mt-2 text-[14px] leading-6 text-[var(--tm-text-primary)]">{text}</p>
              </article>)}
            </div>
            <div className="absolute inset-x-3 bottom-6">
              <MobileInputComposer mode={mode} value={draft} disabled={disabled} shadow={shadow} voice={previewVoice}
                placeholder={fallback ? '当前环境暂不支持语音，请输入文字' : '请输入'}
                onModeChange={next => { setMode(next); setFallback(false); }} onChange={setDraft} onSubmit={() => submit(draft)}
                onCameraClick={camera ? () => cameraInput.current?.click() : undefined} />
            </div>
          </div>
        </PhoneMockup>
      </div>
    </div>
    <article className="min-h-0 overflow-y-auto border-l border-slate-200 bg-white px-8 py-7 max-[1120px]:overflow-visible max-[1120px]:border-l-0 max-[1120px]:border-t max-[720px]:px-5">
      <header className="pb-5">
        <p className="text-xs font-semibold text-[var(--tm-brand-primary)]">通用组件层 · 教师手机端</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">语音与文字输入</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">记录页、班主任助理和校长助理共用 MobileInputComposer，拍照能力与阴影档位由参数控制。</p>
      </header>
      <section className="space-y-3 border-t border-slate-200 py-5" aria-labelledby="composer-preview-config">
        <h3 id="composer-preview-config" className="text-sm font-semibold text-slate-950">预览配置</h3>
        <label className="block text-sm text-slate-600">使用场景<select className={`mt-1 ${controlClass}`} value={scene} onChange={event => changeScene(event.target.value as typeof scene)}>
          <option value="record">记录页</option><option value="headteacher">班主任助理</option><option value="principal">校长助理</option>
        </select></label>
        <label className="flex min-h-11 items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={camera} onChange={event => { voice.cancel(); setCamera(event.target.checked); }} className="h-4 w-4 accent-[var(--tm-brand-primary)]" />显示拍照入口</label>
        <label className="block text-sm text-slate-600">阴影档位<select className={`mt-1 ${controlClass}`} value={shadow} onChange={event => setShadow(event.target.value as typeof shadow)}><option value="floating">悬浮阴影</option><option value="subtle">轻阴影</option></select></label>
        <label className="block text-sm text-slate-600">输入模式<select className={`mt-1 ${controlClass}`} value={mode} onChange={event => { voice.cancel(); setMode(event.target.value as typeof mode); setStatePreview('interactive'); }}><option value="voice">语音</option><option value="text">文字</option></select></label>
        <label className="block text-sm text-slate-600">语音状态<select className={`mt-1 ${controlClass}`} value={statePreview} onChange={event => { voice.cancel(); setStatePreview(event.target.value as typeof statePreview); setMode('voice'); }}><option value="interactive">跟随实际操作</option><option value="listening">按住录音</option><option value="canceling">上移取消</option></select></label>
        <label className="flex min-h-11 items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={disabled} onChange={event => { voice.cancel(); setDisabled(event.target.checked); }} className="h-4 w-4 accent-[var(--tm-brand-primary)]" />禁用提交</label>
        <p className="text-xs leading-5 text-slate-500">状态选项只展示外观；选择“跟随实际操作”后，按住说话会使用浏览器语音能力。拍照入口在本预览中打开图片选择，不上传文件。</p>
      </section>
      <p role="status" className="mb-5 break-words rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{status}</p>
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
      <input ref={cameraInput} type="file" accept="image/*" className="hidden" aria-label="选择预览图片" onChange={event => { const file = event.target.files?.[0]; if (file) setStatus(`已选择图片：${file.name}`); event.target.value = ''; }} />
    </article>
  </section>;
}
