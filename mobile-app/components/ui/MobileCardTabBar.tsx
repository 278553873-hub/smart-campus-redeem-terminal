import React from 'react';
import './MobileCardTabBar.css';

interface MobileCardTabBarProps<T extends string> {
  value: T;
  items: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  ariaLabel: string;
  idPrefix: string;
}

/** 与下方浅色底板衔接的卡片页签，复用表单字号与触控尺寸。 */
const MobileCardTabBar = <T extends string,>({ value, items, onChange, ariaLabel, idPrefix }: MobileCardTabBarProps<T>) => (
  <div role="tablist" aria-label={ariaLabel} className="mobile-card-tab-bar"
    style={{ gridTemplateColumns: `repeat(${Math.max(1, items.length)}, minmax(0, 1fr))` }}>
    {items.map((item, index) => {
      const selected = value === item.value;
      return <button
        key={item.value}
        id={`${idPrefix}-tab-${item.value}`}
        type="button"
        role="tab"
        aria-selected={selected}
        aria-controls={`${idPrefix}-panel-${item.value}`}
        tabIndex={selected ? 0 : -1}
        onClick={() => onChange(item.value)}
        onKeyDown={event => {
          const next = event.key === 'ArrowRight' ? (index + 1) % items.length
            : event.key === 'ArrowLeft' ? (index - 1 + items.length) % items.length
            : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : undefined;
          if (next === undefined) return;
          event.preventDefault();
          onChange(items[next].value);
          event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
        }}
        className={`mobile-card-tab-bar__tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] ${selected ? 'font-bold' : 'font-medium'}`}
      ><span className="mobile-card-tab-bar__label">{item.label}</span></button>;
    })}
  </div>
);

export default MobileCardTabBar;
