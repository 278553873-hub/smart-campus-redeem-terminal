import React, { useEffect, useId, useRef } from 'react';
import './MobileWheelPicker.css';

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
  emphasis?: 'standard' | 'subtle';
  itemHeight?: number;
  fadeEdges?: 'short' | 'gradual';
  onSettlingChange?: (settling: boolean) => void;
}

const VISIBLE_ITEM_COUNT = 5;
const SETTLE_DELAY = 140;

const MobileWheelPicker: React.FC<MobileWheelPickerProps> = ({ columns, className = '', emphasis = 'standard', itemHeight = 44, fadeEdges = 'short', onSettlingChange }) => {
  const id = useId();
  const latestColumns = useRef(columns);
  const settlingCallback = useRef(onSettlingChange);
  latestColumns.current = columns;
  settlingCallback.current = onSettlingChange;
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const settleTimers = useRef<Record<string, number | undefined>>({});
  const wheelHeight = itemHeight * VISIBLE_ITEM_COUNT;
  const columnSignature = columns.map(column => `${column.key}:${column.value}:${column.options.map(option => option.value).join(',')}`).join('|');

  useEffect(() => {
    columns.forEach(column => {
      const element = columnRefs.current[column.key];
      if (!element || settleTimers.current[column.key]) return;
      const index = column.options.findIndex(option => option.value === column.value);
      if (index < 0) return;
      const target = index * itemHeight;
      if (Math.abs(element.scrollTop - target) > 1) element.scrollTop = target;
    });
  }, [columnSignature, itemHeight]);

  useEffect(() => () => {
    Object.values(settleTimers.current).forEach(timer => {
      if (timer) window.clearTimeout(timer);
    });
    settlingCallback.current?.(false);
  }, []);

  const commitScrollPosition = (key: string) => {
    const column = latestColumns.current.find(item => item.key === key);
    settleTimers.current[key] = undefined;
    if (!column) return;
    const element = columnRefs.current[column.key];
    if (!element) return;
    const index = Math.min(column.options.length - 1, Math.max(0, Math.round(element.scrollTop / itemHeight)));
    const nextOption = column.options[index];
    element.scrollTop = index * itemHeight;
    if (nextOption && nextOption.value !== column.value) column.onChange(nextOption.value);
    settlingCallback.current?.(Object.values(settleTimers.current).some(Boolean));
  };

  const handleScroll = (column: MobileWheelColumn) => {
    const pending = settleTimers.current[column.key];
    if (pending) window.clearTimeout(pending);
    const element = columnRefs.current[column.key];
    const selectedIndex = column.options.findIndex(option => option.value === column.value);
    if (!pending && element && Math.abs(element.scrollTop - selectedIndex * itemHeight) < 1) return;
    settlingCallback.current?.(true);
    settleTimers.current[column.key] = window.setTimeout(() => commitScrollPosition(column.key), SETTLE_DELAY);
  };

  const selectOption = (column: MobileWheelColumn, value: string) => {
    const pending = settleTimers.current[column.key];
    if (pending) window.clearTimeout(pending);
    settleTimers.current[column.key] = undefined;
    column.onChange(value);
    settlingCallback.current?.(Object.values(settleTimers.current).some(Boolean));
  };

  const moveSelection = (column: MobileWheelColumn, offset: number) => {
    const index = column.options.findIndex(option => option.value === column.value);
    if (index < 0) return;
    const nextOption = column.options[Math.min(column.options.length - 1, Math.max(0, index + offset))];
    if (nextOption) selectOption(column, nextOption.value);
  };

  return (
    <div className={`relative isolate flex items-stretch ${className}`} style={{ height: wheelHeight }}>
      <div
        aria-hidden="true"
        style={{ height: itemHeight }}
        className="pointer-events-none absolute inset-x-1 top-1/2 z-0 -translate-y-1/2 rounded-[var(--tm-wheel-radius,var(--tm-radius-control))] bg-[var(--tm-bg-surface-soft)]"
      />
      {columns.map(column => {
        const selectedId = `${id}-${column.key}-option-${column.value}`;
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
                } else if (event.key === 'Home' || event.key === 'End') {
                  event.preventDefault();
                  const option = event.key === 'Home' ? column.options[0] : column.options[column.options.length - 1];
                  if (option) selectOption(column, option.value);
                }
              }}
              style={{ paddingTop: itemHeight * 2, paddingBottom: itemHeight * 2 }}
              className="tm-wheel-scroll relative z-10 h-full touch-pan-y snap-y snap-mandatory overflow-y-scroll overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
            >
              {column.options.map(option => {
                const selected = option.value === column.value;
                return (
                  <div
                    key={option.value}
                    id={`${id}-${column.key}-option-${option.value}`}
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectOption(column, option.value)}
                    style={{ height: itemHeight }}
                    className={`flex cursor-pointer snap-center items-center justify-center tabular-nums ${emphasis === 'subtle' ? `text-[length:var(--tm-font-size-body)] leading-5 ${selected ? 'font-medium' : 'font-normal'}` : `text-[length:var(--tm-font-size-body)] ${selected ? 'font-semibold' : 'font-medium'}`} ${selected ? 'text-[var(--tm-text-primary)]' : emphasis === 'subtle' ? 'text-[var(--tm-wheel-inactive-text)]' : 'text-[var(--tm-text-tertiary)]'}`}
                  >
                    {option.label}
                  </div>
                );
              })}
            </div>
            <div aria-hidden="true" style={{ height: itemHeight * (fadeEdges === 'gradual' ? 2 : 1) }} className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-[var(--tm-bg-surface)] to-transparent" />
            <div aria-hidden="true" style={{ height: itemHeight * (fadeEdges === 'gradual' ? 2 : 1) }} className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[var(--tm-bg-surface)] to-transparent" />
          </div>
        );
      })}
    </div>
  );
};

export default MobileWheelPicker;
