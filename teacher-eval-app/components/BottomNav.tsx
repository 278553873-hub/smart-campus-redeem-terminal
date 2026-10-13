import React from 'react';
import { LineChart, SquarePen, User } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'feed', label: '录入', Icon: SquarePen },
  { id: 'growth', label: '成长', Icon: LineChart },
  { id: 'me', label: '我的', Icon: User },
] as const;

interface BottomNavProps {
  activeIndex: number;
  onChange: (index: number) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeIndex, onChange }) => (
  <nav
    aria-label="主导航"
    className="relative z-30 shrink-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] backdrop-blur-lg"
  >
    <div className="grid grid-cols-3 px-[var(--tm-space-2)] pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5">
      {NAV_ITEMS.map(({ id, label, Icon }, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(index)}
            aria-current={active ? 'page' : undefined}
            className="flex h-[52px] flex-col items-center justify-center gap-1 transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            <Icon
              className="h-[22px] w-[22px]"
              strokeWidth={active ? 2.4 : 2}
              color={active ? 'var(--tm-brand-primary)' : 'var(--tm-nav-item-default)'}
              aria-hidden="true"
            />
            <span
              className="text-[12px] font-semibold leading-none"
              style={{ color: active ? 'var(--tm-brand-primary)' : 'var(--tm-nav-item-default)' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
