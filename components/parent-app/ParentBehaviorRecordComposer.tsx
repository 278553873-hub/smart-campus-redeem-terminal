import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MobileInputComposer from '../../mobile-app/components/ui/MobileInputComposer';
import MobilePhotoCapture from '../../mobile-app/components/ui/MobilePhotoCapture';
import { useHoldToTalk } from '../../mobile-app/hooks/useHoldToTalk';
import { todayForParentRecord, type ParentBehaviorDraft } from '../../shared/parentBehaviorRecords';
import { correctParentRecordText } from '../../shared/parentRecordText';
import voiceOnboardingArrow from '../../mobile-app/assets/resources/teacher-mobile-icons/by-page/02-记录/记录首页/voice-onboarding-arrow-solid-gold.svg';

interface Props {
  draft: ParentBehaviorDraft;
  onChange: (draft: ParentBehaviorDraft) => void;
  onSave: (draft: ParentBehaviorDraft) => boolean;
  error?: string;
  photoEnabled?: boolean;
  disabled?: boolean;
  showFirstRecordGuide?: boolean;
}

const MAX_PHOTOS = 3;
const readPhoto = (file: File): Promise<string> => new Promise((resolve, reject) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { reject(new Error('请选择 JPG、PNG 或 WebP 图片。')); return; }
  if (file.size > 10 * 1024 * 1024) { reject(new Error('单张图片不能超过10MB。')); return; }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    try {
      const ratio = Math.min(1, 1200 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('图片读取失败，请重新选择。');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    } catch { reject(new Error('图片读取失败，请重新选择。')); }
    finally { URL.revokeObjectURL(url); }
  };
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片读取失败，请重新选择。')); };
  image.src = url;
});

/** 家长业务适配：公共输入控件只负责交互，草稿及保存仍按当前孩子隔离。 */
export default function ParentBehaviorRecordComposer({ draft, onChange, onSave, error, photoEnabled = true, disabled = false, showFirstRecordGuide = false }: Props) {
  const [mode, setMode] = useState<'text' | 'voice'>('voice');
  const [feedback, setFeedback] = useState('');
  const [readingImages, setReadingImages] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const latestDraft = useRef(draft);
  latestDraft.current = draft;
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (disabled || !photoEnabled) setCameraOpen(false); }, [disabled, photoEnabled]);
  const changeDraft = (next: ParentBehaviorDraft) => {
    latestDraft.current = next;
    setFeedback('');
    onChange(next);
  };
  const submit = (spokenText?: string) => {
    if (disabled || readingImages) return;
    const current = latestDraft.current;
    const content = correctParentRecordText([current.content.trim(), spokenText?.trim()].filter(Boolean).join('\n'));
    const next = { ...current, content, images: photoEnabled ? current.images : [], occurredOn: todayForParentRecord() };
    if (!content && !next.images.length) return;
    if (content.length > 2000) {
      changeDraft(next);
      setFeedback('记录内容最多2000字，请精简后再发送。');
      return;
    }
    // 先保留语音转写；保存失败后可以直接编辑或重新发送。
    changeDraft(next);
    if (onSave(next)) latestDraft.current = { ...next, content: '', images: [] };
  };
  const voice = useHoldToTalk(submit, () => {
    setFeedback('当前无法使用语音，请使用文字输入。');
    setMode('text');
  });
  const addPhotos = async (files: File[]) => {
    if (disabled || !photoEnabled || !files.length) return;
    if (files.length + latestDraft.current.images.length > MAX_PHOTOS) { setFeedback('最多添加3张图片。'); return; }
    setReadingImages(true);
    setFeedback('');
    try {
      const images = await Promise.all(files.map(readPhoto));
      if (mounted.current) changeDraft({ ...latestDraft.current, images: [...latestDraft.current.images, ...images] });
    } catch (reason) {
      if (mounted.current) setFeedback(reason instanceof Error ? reason.message : '图片读取失败，请重试。');
    } finally { if (mounted.current) setReadingImages(false); }
  };
  return <div className="mx-auto w-full max-w-md shrink-0 px-3 pt-2 pb-[calc(var(--pm-space-3)+var(--mini-program-bottom-safe-area,0px))]">
    {showFirstRecordGuide && <div aria-hidden="true" className="pointer-events-none relative mb-[var(--pm-space-2)] h-[72px]">
      <img src={voiceOnboardingArrow} alt="" className="teacher-record-onboarding-arrow absolute bottom-0 left-1/2 h-[72px] w-[64px]" />
    </div>}
    {(error || feedback) && <p role="alert" className="mb-2 px-1 text-[length:var(--pm-font-size-compact)] leading-relaxed text-[var(--pm-status-negative-strong)]">{error || feedback}</p>}
    {readingImages && <p role="status" className="mb-2 px-1 text-[length:var(--pm-font-size-compact)] text-[var(--pm-text-secondary)]">正在添加图片…</p>}
    <MobileInputComposer
      shadow="floating" mode={mode} value={draft.content} placeholder="记录孩子的表现" sendLabel="发送记录"
      voice={voice} disabled={disabled || readingImages} maxAttachments={MAX_PHOTOS}
      attachments={photoEnabled ? draft.images.map((url, index) => ({ id: String(index), url })) : []}
      onRemoveAttachment={id => changeDraft({ ...latestDraft.current, images: latestDraft.current.images.filter((_, index) => String(index) !== id) })}
      onModeChange={setMode} onChange={content => changeDraft({ ...latestDraft.current, content })} onSubmit={() => submit()}
      onCameraClick={photoEnabled ? () => { voice.cancel(); setCameraOpen(true); } : undefined}
    />
    {cameraOpen && photoEnabled && !disabled && createPortal(<MobilePhotoCapture remaining={MAX_PHOTOS - draft.images.length} thumbnail={draft.images.at(-1)} onClose={() => setCameraOpen(false)} onSelect={files => { setCameraOpen(false); void addPhotos(files); }} />, document.getElementById('teacher-mobile-overlay-root') ?? document.body)}
  </div>;
}
