import React from 'react';

export function MoralPanelTabs<T extends string>({ id, ariaLabel, items, value, onChange }: {
  id: string; ariaLabel: string; items: ReadonlyArray<{ id: T; label: string }>; value: T; onChange: (value: T) => void;
}) {
  return <div className="moral-panel-tabs" role="tablist" aria-label={ariaLabel}>{items.map((item, index) => <button key={item.id} type="button"
    id={`${id}-${item.id}`} role="tab" aria-selected={value === item.id} aria-controls={`${id}-content`} tabIndex={value === item.id ? 0 : -1} onClick={() => onChange(item.id)}
    onKeyDown={event => {
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : event.key === 'ArrowRight' ? (index + 1) % items.length : event.key === 'ArrowLeft' ? (index + items.length - 1) % items.length : null;
      if (next === null) return;
      event.preventDefault();
      onChange(items[next].id);
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
    }}>{item.label}</button>)}</div>;
}
