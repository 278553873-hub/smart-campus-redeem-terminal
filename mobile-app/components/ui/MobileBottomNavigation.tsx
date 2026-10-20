export interface MobileNavigationItem<T extends string> {
    id: T;
    label: string;
    icon: { active: string; default: string; opticalSize?: number };
    badgeCount?: number;
}

interface Props<T extends string> {
    activeTab: T;
    items: readonly MobileNavigationItem<T>[];
    onTabChange: (tab: T) => void;
    ariaLabel: string;
}

/** 导航基础能力与图片状态；入口、名称和资源由业务模块传入。 */
export default function MobileBottomNavigation<T extends string>({ activeTab, items, onTabChange, ariaLabel }: Props<T>) {
    return <nav className="absolute bottom-0 left-0 right-0 z-50 h-16 border-0 bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-navigation)]" aria-label={ariaLabel}>
        <div className="grid h-full items-center text-center" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
            {items.map(({ id, label, icon, badgeCount = 0 }) => {
                const isActive = activeTab === id;
                return <button key={id} type="button" onClick={() => onTabChange(id)} aria-current={isActive ? 'page' : undefined}
                    className={`flex h-full min-w-0 flex-col items-center justify-center gap-1 transition-colors [transition-duration:var(--tm-duration-fast)] ${isActive ? 'text-[var(--tm-brand-primary)]' : 'text-[var(--tm-nav-item-default)]'}`}>
                    <span className="relative flex h-[22px] w-[22px] items-center justify-center">
                        <img src={isActive ? icon.active : icon.default} alt="" aria-hidden="true"
                            style={icon.opticalSize ? { width: icon.opticalSize, height: icon.opticalSize } : undefined}
                            className={`h-[22px] w-[22px] max-w-none shrink-0 object-contain transition-transform [transition-duration:var(--tm-duration-fast)] ease-out motion-reduce:transition-none ${isActive ? 'scale-100' : 'scale-90'}`} />
                        {badgeCount > 0 && <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--tm-status-negative)] px-1 text-[9px] font-bold leading-none tabular-nums text-white">{badgeCount > 9 ? '9+' : badgeCount}</span>}
                    </span>
                    <span className="text-xs font-medium">{label}</span>
                </button>;
            })}
        </div>
    </nav>;
}
