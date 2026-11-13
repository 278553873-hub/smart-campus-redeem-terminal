import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { mobileFilterCheckClass } from './mobileFilterStyles';

interface Props {
  open: boolean;
  id: string;
  label: string;
  triggerRef: { readonly current: HTMLButtonElement | null };
  onClose: () => void;
  children: React.ReactNode;
}

/** 放在筛选栏下方的相对定位容器内；保留入口，只遮罩下方内容。 */
export default function MobileFilterDropdown({ open, id, label, triggerRef, onClose, children }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const trigger = triggerRef.current;
    const selected = panel?.querySelector<HTMLElement>('[data-dropdown-selected="true"]');
    (selected ?? panel?.querySelector<HTMLElement>('button') ?? panel)?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // 只有焦点仍在面板或遮罩时归还；切换页签、切换入口时不抢焦点。
      if (document.activeElement === document.body || overlay?.contains(document.activeElement)) {
        if (trigger?.isConnected && !trigger.closest('[hidden]')) trigger.focus({ preventScroll: true });
      }
    };
  }, [open, triggerRef]);

  if (!open) return null;
  return <div ref={overlayRef} className="absolute inset-0 z-40 flex min-h-0 flex-col">
    <button type="button" tabIndex={-1} aria-label="收起筛选" onClick={onClose} className="absolute inset-0 bg-[var(--tm-mask)] [-webkit-tap-highlight-color:transparent]" />
    <section ref={panelRef} id={id} role="dialog" aria-label={label} tabIndex={-1}
      onBlur={event => {
        if (event.relatedTarget && event.relatedTarget !== triggerRef.current && !event.currentTarget.contains(event.relatedTarget as Node)) onClose();
      }}
      className="relative flex max-h-[min(100%,var(--tm-filter-dropdown-max-height))] min-h-0 flex-col overflow-y-auto overscroll-contain bg-[var(--tm-filter-dropdown-bg)] outline-none no-scrollbar">
      {children}
    </section>
  </div>;
}

/** 轻量单选列表：统一行高、细分隔线、主题色文字和右侧勾选。 */
export function MobileDropdownOptionList({ options, value, onChange }: {
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return <div className="px-[var(--tm-space-4)] text-[length:var(--tm-font-size-compact)] [font-weight:var(--tm-font-weight-semibold)]">
    {options.map(option => {
      const selected = value === option.value;
      return <button key={option.value} type="button" aria-pressed={selected} data-dropdown-selected={selected || undefined} onClick={() => onChange(option.value)}
        className={`flex min-h-[var(--tm-size-touch)] w-full items-center justify-between gap-[var(--tm-space-3)] border-b border-[var(--tm-filter-divider)] py-[var(--tm-space-2)] text-left last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] ${selected ? 'text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-primary)]'}`}>
        <span className="min-w-0 break-words">{option.label}</span>
        {selected && <Check aria-hidden="true" className={mobileFilterCheckClass} />}
      </button>;
    })}
  </div>;
}
