import React, { useEffect, useRef } from 'react';

export interface MobileWheelOption {
  value: string;
  label: string;
}

export interface MobileWheelColumn {
  key: string;
  ariaLabel: string;
  value: string;
  options: MobileWheelOption[];
  onChange: (value: string) => void;
}

interface MobileWheelPickerProps {
  columns: MobileWheelColumn[];
  className?: string;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEM_COUNT = 5;
const SETTLE_DELAY = 140;

const MobileWheelPicker: React.FC<MobileWheelPickerProps> = ({ columns, className = '' }) => {
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const settleTimers = useRef<Record<string, number | undefined>>({});
  const wheelHeight = ITEM_HEIGHT * VISIBLE_ITEM_COUNT;
  const columnSignature = columns.map(column => `${column.key}:${column.value}:${column.options.length}`).join('|');

  useEffect(() => {
    columns.forEach(column => {
      const element = columnRefs.current[column.key];
      if (!element) return;
      const index = column.options.findIndex(option => option.value === column.value);
      if (index < 0) return;
      const target = index * ITEM_HEIGHT;
      if (Math.abs(element.scrollTop - target) > 1) element.scrollTop = target;
    });
  }, [columnSignature]);

  useEffect(() => () => {
    Object.values(settleTimers.current).forEach(timer => {
      if (timer) window.clearTimeout(timer);
    });
  }, []);

  const commitScrollPosition = (column: MobileWheelColumn) => {
    const element = columnRefs.current[column.key];
    if (!element) return;
    const index = Math.min(column.options.length - 1, Math.max(0, Math.round(element.scrollTop / ITEM_HEIGHT)));
    const nextOption = column.options[index];
    if (nextOption && nextOption.value !== column.value) column.onChange(nextOption.value);
  };

  const handleScroll = (column: MobileWheelColumn) => {
    const pending = settleTimers.current[column.key];
    if (pending) window.clearTimeout(pending);
    settleTimers.current[column.key] = window.setTimeout(() => commitScrollPosition(column), SETTLE_DELAY);
  };

  const moveSelection = (column: MobileWheelColumn, offset: number) => {
    const index = column.options.findIndex(option => option.value === column.value);
    if (index < 0) return;
    const nextOption = column.options[Math.min(column.options.length - 1, Math.max(0, index + offset))];
    if (nextOption) column.onChange(nextOption.value);
  };

  return (
    <div className={`relative isolate flex items-stretch ${className}`} style={{ height: wheelHeight }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1 top-1/2 z-0 h-[var(--tm-size-touch)] -translate-y-1/2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)]"
      />
      {columns.map(column => {
        const selectedId = `${column.key}-option-${column.value}`;
        return (
          <div key={column.key} className="relative min-w-0 flex-1">
            <div
              ref={node => { columnRefs.current[column.key] = node; }}
              role="listbox"
              aria-label={column.ariaLabel}
              aria-activedescendant={selectedId}
              tabIndex={0}
              onScroll={() => handleScroll(column)}
              onKeyDown={event => {
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  moveSelection(column, -1);
                } else if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  moveSelection(column, 1);
                }
              }}
              style={{ paddingTop: ITEM_HEIGHT * 2, paddingBottom: ITEM_HEIGHT * 2 }}
              className="relative z-10 h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain no-scrollbar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
            >
              {column.options.map(option => {
                const selected = option.value === column.value;
                return (
                  <div
                    key={option.value}
                    id={`${column.key}-option-${option.value}`}
                    role="option"
                    aria-selected={selected}
                    className={`flex h-[var(--tm-size-touch)] snap-center items-center justify-center text-[length:var(--tm-font-size-body)] tabular-nums ${selected ? 'font-semibold text-[var(--tm-text-primary)]' : 'font-medium text-[var(--tm-text-tertiary)]'}`}
                  >
                    {option.label}
                  </div>
                );
              })}
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[var(--tm-size-touch)] bg-gradient-to-b from-[var(--tm-bg-surface)] to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[var(--tm-size-touch)] bg-gradient-to-t from-[var(--tm-bg-surface)] to-transparent" />
          </div>
        );
      })}
    </div>
  );
};

export default MobileWheelPicker;
