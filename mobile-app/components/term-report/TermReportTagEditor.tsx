import React, { useId, useState } from 'react';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import { mobileSheetActionClass } from '../ui/mobileSheetActionStyles';
import { normalizeTermReportTags, validateTermReportTags } from '../../domain/termReportTags';

interface Props {
  tags: readonly string[];
  onClose: () => void;
  onSave: (tags: string[]) => void;
}

export default function TermReportTagEditor({ tags, onClose, onSave }: Props) {
  const id = useId();
  const [draft, setDraft] = useState(() => Array.from({ length: 3 }, (_, i) => tags[i] ?? ''));
  const [error, setError] = useState('');
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateTermReportTags(draft);
    if (validation) { setError(validation); return; }
    try {
      onSave(normalizeTermReportTags(draft));
      onClose();
    } catch {
      setError('未能保存，请重试。填写的内容已保留。');
    }
  };
  return (
    <MobileBottomSheet open title="编辑素养标签" onClose={onClose} showHandle={false}
      footer={<div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onClose} className={`${mobileSheetActionClass} bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-primary)] font-semibold`}>取消</button>
        <button type="submit" form={id} className={`${mobileSheetActionClass} bg-[var(--tm-brand-primary)] text-white font-semibold`}>保存</button>
      </div>}>
      <form id={id} onSubmit={submit} className="space-y-4">
        <p id={`${id}-hint`} className="text-sm text-[var(--tm-text-secondary)]">填写三个不同的素养标签，每个最多 8 个字。</p>
        {draft.map((value, index) => (
          <div key={index} className="space-y-2">
            <label htmlFor={`${id}-${index}`} className="block text-sm font-medium text-[var(--tm-text-primary)]">标签 {index + 1}</label>
            <input id={`${id}-${index}`} value={value} maxLength={8} required
              aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
              onChange={event => { setDraft(previous => previous.map((tag, i) => i === index ? event.target.value : tag)); setError(''); }}
              className="h-12 w-full rounded-[var(--tm-radius-control-compact)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3 text-base text-[var(--tm-text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]" />
          </div>
        ))}
        {error && <p id={`${id}-error`} role="alert" className="text-sm text-[var(--tm-status-negative)]">{error}</p>}
      </form>
    </MobileBottomSheet>
  );
}
