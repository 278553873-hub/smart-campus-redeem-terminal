import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CheckCircle2, ChartNoAxesCombined, ChevronRight, ClipboardCheck, Lightbulb } from 'lucide-react';
import { ASSETS } from '../assets/images';
import AssistantSubpageHeader from '../components/AssistantSubpageHeader';
import { getAssistantGreeting, useAssistantTypewriter } from '../hooks/useAssistantTypewriter';
import AssistantComposer from '../components/assistant-chat/AssistantComposer';
import AssistantConversationThread, { type AssistantChatMessage } from '../components/assistant-chat/AssistantConversationThread';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import { MobileCard } from '../components/ui/MobileCard';
import { SuggestionFeedbackView } from '../views/MeFeatureViews';
import { ALL_PERIODS, type DevelopmentIndicator, type DevelopmentRecord, type TeacherDossier } from './data';
import { answerMeQuestion, personalQuestions, principalQuestions } from './meAssistant';
import { bodyClass, fieldClass, metaClass, primaryAction, RowButton } from './ui';
import type { CollectionAnswer, PersonalSettings } from './useMePreferences';

const formBody = 'min-h-0 flex-1 space-y-4 overflow-y-auto bg-[var(--tm-page-plain-content-bg)] px-5 py-4';
const footerClass = 'shrink-0 bg-[var(--tm-bg-surface)] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3';
const saveError = '保存失败，请检查浏览器存储空间后重试，填写内容已保留。';

export function PersonalSettingsPage({ teacher, settings, onSave }: { teacher: TeacherDossier; settings?: PersonalSettings; onSave: (value: PersonalSettings) => boolean }) {
  const [phone, setPhone] = useState(settings?.phone ?? '');
  const [avatar, setAvatar] = useState(settings?.avatar ?? '');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = async (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { setError('请选择不超过2 MB的 PNG、JPG 或 WebP 图片。'); return; }
    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file);
      });
      setAvatar(image); setError('');
    } catch { setError('图片读取失败，请重新选择。'); }
  };
  return <>
    <div className={formBody}>
      <MobileCard>
        <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-20 w-full items-center justify-between gap-4 text-left" aria-label="更换头像">
          <span className={bodyClass}>头像</span><span className="relative"><img src={avatar || ASSETS.AVATAR.TEACHER_DEFAULT} alt="当前头像" className="h-16 w-16 rounded-full object-cover" /><span className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 text-[var(--tm-brand-primary)]" aria-hidden="true"><Camera size={16} /></span></span>
        </button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" tabIndex={-1} onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} />
      </MobileCard>
      <MobileCard><dl className="space-y-5">{[['姓名', teacher.name], ['学校', teacher.school], ['任教学科', teacher.subject], ['任教年级', teacher.grade], ['身份', teacher.manager ? '管理者' : '教师']].map(([label, value]) => <div key={label} className="flex justify-between gap-5"><dt className={metaClass}>{label}</dt><dd className={`${bodyClass} min-w-0 text-right`}>{value}</dd></div>)}</dl><p className={`mt-4 ${metaClass}`}>任职信息由学校统一维护，如需更正请联系管理员。</p></MobileCard>
      <MobileCard><label className={`block ${bodyClass}`} htmlFor="development-phone">联系手机</label><input id="development-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={11} value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} className={`mt-2 ${fieldClass}`} placeholder="请输入手机号码（选填）" aria-invalid={!!error} aria-describedby={error ? 'profile-error' : undefined} /></MobileCard>
      {error && <p id="profile-error" role="alert" className={`${bodyClass} text-[var(--tm-status-negative-strong)]`}>{error}</p>}
    </div>
    <footer className={footerClass}><button type="button" className={primaryAction} onClick={() => {
      if (phone.trim() && !/^1[3-9]\d{9}$/.test(phone.trim())) { setError('请输入有效的11位手机号码。'); return; }
      if (!onSave({ avatar, phone: phone.trim() })) setError(saveError);
    }}>保存</button></footer>
  </>;
}

export function DevelopmentAssistantPage({ principal, teacher, teachers, records, indicators, periodId, onBack }: { principal: boolean; teacher: TeacherDossier; teachers: TeacherDossier[]; records: DevelopmentRecord[]; indicators: DevelopmentIndicator[]; periodId: string; onBack: () => void }) {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const latestRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const assistantMessage = useMemo(() => `${getAssistantGreeting()}，\n${principal ? '我将为您提供教师成长分析和管理建议。' : '我将陪您梳理成长记录与发展方向。'}`, [principal]);
  const typedMessage = useAssistantTypewriter(assistantMessage);
  const questions = principal ? principalQuestions : personalQuestions;
  const optionIcons = [ChartNoAxesCombined, ClipboardCheck, Lightbulb];
  const send = (question: string) => {
    const text = question.trim(); if (!text) return;
    const id = `${Date.now()}-${messages.length}`;
    setMessages(prev => [...prev, { id: `${id}-user`, role: 'user', content: text }, { id: `${id}-answer`, role: 'assistant', answer: answerMeQuestion(text, principal, teacher, teachers, records, indicators, periodId) }]);
    setDraft('');
  };
  useEffect(() => { if (messages.length && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages.length]);
  return <div className={`${principal ? 'ai-assistant-theme-principal' : 'ai-assistant-theme-headteacher'} relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent font-sans text-[var(--tm-text-primary)]`}>
    <AssistantSubpageHeader onBack={onBack} surface="transparent" />
    <div ref={scrollRef} data-view-scroll-root className="min-h-0 flex-1 overflow-y-auto pb-5 no-scrollbar">
      <section className="relative h-[148px] overflow-hidden px-5">
        <div className="relative z-10 max-w-[59%] pt-3" aria-live="polite">
          <p className="ai-assistant-typewriter-shine min-h-16 whitespace-pre-line text-pretty text-[17px] font-bold leading-7">
            {typedMessage}
            {typedMessage.length < assistantMessage.length && <span className="ml-0.5 inline-block h-5 w-[1.5px] translate-y-1 animate-pulse rounded-full bg-[var(--tm-assistant-role-primary)] motion-reduce:animate-none" aria-hidden="true" />}
          </p>
        </div>
        <img src={principal ? ASSETS.MANAGEMENT.AI_PRINCIPAL_ASSISTANT_CHARACTER : ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER} alt={principal ? 'AI校长助理形象' : 'AI个人助理形象'} className={`pointer-events-none absolute -bottom-1 -right-1 h-[154px] w-[154px] select-none object-contain object-bottom ${principal ? 'drop-shadow-[0_20px_28px_var(--tm-role-principal-shadow)]' : 'drop-shadow-[0_20px_28px_var(--tm-role-headteacher-shadow)]'}`} />
      </section>
      <section className="assistant-agent-glass assistant-context-card relative z-10 mx-4 -mt-5 overflow-hidden rounded-[var(--tm-radius-card-compact)] p-2" aria-label={principal ? '全校教师成长分析能力' : '个人成长记录分析能力'}>
        <div className="mx-3 space-y-[var(--tm-layout-card-gap)] pb-2">
          <p className={`pt-2 ${metaClass}`}>{ALL_PERIODS.find(p => p.id === periodId)?.label}</p>
          {questions.map((question, index) => {
            const Icon = optionIcons[index];
            return <button key={question} type="button" onClick={() => send(question)} className="flex min-h-14 w-full items-center gap-2.5 rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] pl-3 pr-3.5 text-left [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)] motion-reduce:transition-none">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-assistant-role-soft)] text-[var(--tm-assistant-role-text)]" aria-hidden="true"><Icon className="h-[17px] w-[17px]" strokeWidth={2} /></span>
              <span className="min-w-0 flex-1 text-[length:var(--tm-font-size-body)] font-medium leading-5">{question}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
            </button>;
          })}
        </div>
      </section>
      {messages.length > 0 && <AssistantConversationThread messages={messages} replying={false} replyingLabel="正在分析" ariaLabel={principal ? '校长助理对话' : '个人助理对话'} latestAssistantRef={latestRef} />}
    </div>
    <footer className="relative z-30 shrink-0 bg-transparent">
      <AssistantComposer draft={draft} replying={false} suggestedQuestions={questions} placeholder="请输入" onDraftChange={setDraft} onSubmit={send} />
      <p className="px-4 pb-[calc(6px+env(safe-area-inset-bottom))] pt-1 text-center text-[10px] leading-4 text-[var(--tm-text-disabled)]">演示分析仅供参考，审核与计分以实际记录为准。</p>
    </footer>
  </div>;
}

export function DevelopmentQuestionnairePage({ answer, onSave }: { answer?: CollectionAnswer; onSave: (answer: CollectionAnswer) => boolean }) {
  const [view, setView] = useState<'pending' | 'done'>(answer ? 'done' : 'pending');
  const [editing, setEditing] = useState(false);
  const [focus, setFocus] = useState(answer?.focus ?? '');
  const [support, setSupport] = useState(answer?.support ?? '');
  const [error, setError] = useState('');
  return <>
    <div className={formBody}>
      {!editing && <CompactSegmentedControl<'pending' | 'done'> value={view} onChange={setView} items={[{ value: 'pending', label: `待填写${answer ? '' : ' 1'}` }, { value: 'done', label: '已填写' }]} ariaLabel="问卷状态" />}
      {!editing && ((view === 'pending' && !answer) || (view === 'done' && answer)) ? <MobileCard><RowButton onClick={() => setEditing(true)} description={answer ? '已填写 · 查看我的回答' : '教师填写 · 2项内容'}>教师发展需求采集（示例）</RowButton></MobileCard> : !editing ? <div className="py-12 text-center"><CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-[var(--tm-text-tertiary)]" aria-hidden="true" /><p className={metaClass}>{view === 'pending' ? '暂无待填写问卷' : '暂无已填写问卷'}</p></div> : <>
        <h2 className="text-[length:var(--tm-font-size-section-title)] font-bold">教师发展需求采集</h2>
        <MobileCard><fieldset disabled={!!answer}><legend className={`${bodyClass} mb-3 font-semibold`}>1. 您希望重点提升的方向 <span className="text-[var(--tm-status-negative)]">*</span></legend><div className="space-y-1">{['课堂教学', '教研科研', '班级管理', '团队协作'].map(value => <label key={value} className={`flex min-h-11 items-center gap-3 ${bodyClass}`}><input type="radio" name="development-focus" checked={focus === value} onChange={() => { setFocus(value); setError(''); }} className="h-5 w-5 accent-[var(--tm-brand-primary)]" />{value}</label>)}</div></fieldset></MobileCard>
        <MobileCard><label htmlFor="development-support" className={`${bodyClass} block font-semibold`}>2. 希望学校提供哪些支持（选填）</label><textarea id="development-support" rows={4} maxLength={500} readOnly={!!answer} value={support} onChange={e => setSupport(e.target.value)} className={`${fieldClass} mt-3 resize-none`} placeholder="例如研修培训、同伴交流或教学资源" /></MobileCard>
        {error && <p role="alert" className={`${bodyClass} text-[var(--tm-status-negative-strong)]`}>{error}</p>}
      </>}
    </div>
    {editing && <footer className={footerClass}><button type="button" className={primaryAction} onClick={() => {
      if (answer) { setEditing(false); return; }
      if (!focus) { setError('请选择希望重点提升的方向。'); return; }
      if (!onSave({ focus, support: support.trim() })) { setError(saveError); return; }
      setView('done'); setEditing(false);
    }}>{answer ? '返回列表' : '提交问卷'}</button></footer>}
  </>;
}

export function DevelopmentFeedbackPage({ onSave }: { onSave: (text: string, images: string[]) => boolean }) {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return <>
    {submitted ? <div className={`${formBody} flex flex-col items-center justify-center text-center`}><CheckCircle2 className="mb-3 h-10 w-10 text-[var(--tm-brand-primary)]" aria-hidden="true" /><h2 className="text-[17px] font-semibold">反馈已保存</h2><p className={`mt-2 ${metaClass}`}>演示环境仅在本机保存。</p></div> : <>
      <SuggestionFeedbackView
        text={text}
        images={images}
        errorMessage={error}
        onTextChange={value => { setText(value); setError(''); }}
        onAddImage={() => setImages(prev => prev.length >= 5 ? prev : [...prev, `图片${prev.length + 1}`])}
        onRemoveImage={index => setImages(prev => prev.filter((_, imageIndex) => imageIndex !== index))}
        onSubmit={() => { if (onSave(text.trim(), images)) setSubmitted(true); else setError(saveError); }}
      />
    </>}
  </>;
}
