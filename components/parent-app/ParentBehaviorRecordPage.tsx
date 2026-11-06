import { createPortal } from 'react-dom';
import MobilePhotoCapture from '../../mobile-app/components/ui/MobilePhotoCapture';
import { correctParentRecordText } from '../../shared/parentRecordText';
import React, { useEffect, useRef, useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import MobileInputComposer from '../../mobile-app/components/ui/MobileInputComposer';
import { useHoldToTalk } from '../../mobile-app/hooks/useHoldToTalk';
import { type ParentBehaviorDraft } from '../../shared/parentBehaviorRecords';


interface Props {
  child: { name: string; className: string; avatar?: string };
  header: React.ReactNode;
  draft: ParentBehaviorDraft;
  onChange: (draft: ParentBehaviorDraft) => void;
  onSave: (draft: ParentBehaviorDraft) => void;
  error?: string;
  photoEnabled?: boolean;
  saved?: boolean;
}

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

export default function ParentBehaviorRecordPage({ child, header, draft, onChange, onSave, error, photoEnabled = true, saved = false }: Props) {
  const [mode, setMode] = useState<'text' | 'voice'>('voice');
  const [editing, setEditing] = useState(false);
  const transcript = useRef<HTMLTextAreaElement>(null);
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [readingImages, setReadingImages] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const latestDraft = useRef(draft);
  latestDraft.current = draft;
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const appendText = (value: string) => {
    const current = latestDraft.current;
    const content = [current.content.trim(), correctParentRecordText(value)].filter(Boolean).join('\n');
    if (content.length > 2000) { setFeedback('记录内容最多2000字，请精简后再添加。'); return false; }
    const next = { ...current, content };
    latestDraft.current = next;
    onChange(next);
    onSave(photoEnabled ? next : { ...next, images: [] });
    setEditing(false);
    setInputText('');
    setFeedback('');
    return true;
  };
  const voice = useHoldToTalk(appendText, () => {
    setFeedback('当前无法使用语音，请使用文字输入。');
    setMode('text');
  });
  const addPhotos = async (files: File[] | null) => {
    if (!photoEnabled || !files?.length) return;
    if (files.length + latestDraft.current.images.length > 3) { setFeedback('最多添加3张图片。'); return; }
    setReadingImages(true); setFeedback('');
    try {
      const images = await Promise.all(Array.from(files).map(readPhoto));
      if (mounted.current) { const next = { ...latestDraft.current, images: [...latestDraft.current.images, ...images] }; onChange(next); onSave(next); }
    } catch (reason) { if (mounted.current) setFeedback(reason instanceof Error ? reason.message : '图片读取失败，请重试。'); }
    finally { if (mounted.current) setReadingImages(false); }
  };
  return <div className="relative flex min-h-0 flex-1 flex-col text-[var(--pm-text-primary)]">
    {header}
    <div className="px-4 pt-3">
      {!draft.content.trim() && !draft.images.length && !editing && <p className="py-5 text-center text-[length:var(--pm-font-size-body)] leading-relaxed text-[var(--pm-text-secondary)]">按住下方按钮说一说孩子的表现，<br />也可切换文字输入。</p>}
      {(Boolean(draft.content.trim()) || draft.images.length > 0 || editing) && <>
      <div className="flex min-h-[var(--pm-size-touch)] items-center justify-between gap-3">
        <label htmlFor="parent-record-transcript" className="text-[length:var(--pm-font-size-body)] font-semibold">预览记录</label>
        {(Boolean(draft.content.trim()) || editing) && <button type="button" aria-label={editing ? '完成编辑预览记录' : '编辑预览记录'} aria-controls="parent-record-transcript" aria-pressed={editing}
          className="flex h-[var(--pm-size-touch)] w-[var(--pm-size-touch)] items-center justify-center rounded-[var(--pm-radius-control-compact)] text-[var(--pm-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--pm-brand-primary)]"
          onClick={() => { if (editing) { onSave(latestDraft.current); setEditing(false); return; } setEditing(true); requestAnimationFrame(() => transcript.current?.focus()); }}>
          {editing ? <Check size={18} aria-hidden="true" /> : <Pencil size={18} aria-hidden="true" />}
        </button>}
      </div>
      <textarea ref={transcript} id="parent-record-transcript" rows={3} maxLength={2000} onBlur={() => { if (editing) { onSave(latestDraft.current); setEditing(false); } }} readOnly={!editing} aria-readonly={!editing} value={draft.content}
        onChange={event => onChange({ ...draft, content: event.target.value })}
        placeholder="通过下方语音或文字输入，记录孩子的表现。"
        className={`w-full resize-none rounded-[var(--pm-radius-control-compact)] p-3 text-[length:var(--pm-font-size-body)] leading-relaxed outline-none focus:outline-none focus:ring-0 ${editing ? 'bg-[var(--pm-bg-surface)]' : 'bg-[var(--pm-bg-surface-soft)]'}`} />
      </>}
      {saved && !error && !feedback && !editing && <p role="status" className="mt-2 text-[length:var(--pm-font-size-meta)] text-[var(--pm-text-tertiary)]">已自动保存</p>}
      {(error || feedback) && <p role="alert" className="mt-3 text-[14px] leading-6 text-[var(--pm-status-negative-strong)]">{error || feedback}</p>}
      {readingImages && <p role="status" className="mt-3 text-[14px] text-[var(--pm-text-secondary)]">正在添加图片…</p>}
    </div>
    <div className="shrink-0 px-3 pt-2 pb-[calc(12px+var(--mini-program-bottom-safe-area,0px))]">
      <MobileInputComposer attachments={photoEnabled ? draft.images.map((url, index) => ({ id: String(index), url })) : []}
        onRemoveAttachment={id => { const next = { ...latestDraft.current, images: latestDraft.current.images.filter((_, index) => String(index) !== id) }; latestDraft.current = next; onChange(next); if (next.content.trim() || next.images.length) onSave(next); }} shadow="floating" mode={mode} value={inputText} placeholder="补充孩子的表现" sendLabel="整理文字" voice={voice} disabled={readingImages}
        onModeChange={setMode} onChange={setInputText} onSubmit={() => appendText(inputText)} onCameraClick={photoEnabled ? () => { voice.cancel(); if (draft.images.length >= 3) { setFeedback('最多添加3张图片。'); return; } setCameraOpen(true); } : undefined} />
    </div>
    {cameraOpen && photoEnabled && createPortal(<MobilePhotoCapture remaining={3 - draft.images.length} thumbnail={draft.images.at(-1)} onClose={() => setCameraOpen(false)} onSelect={files => { setCameraOpen(false); void addPhotos(files); }} />, document.getElementById('teacher-mobile-overlay-root') ?? document.body)}
  </div>;
}
