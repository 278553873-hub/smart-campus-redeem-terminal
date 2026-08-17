import { NotebookPen, School, UserRound, type LucideIcon } from 'lucide-react';

export type TeacherBottomTab = 'record' | 'class' | 'me';

interface TeacherBottomNavigationProps {
    activeTab: TeacherBottomTab;
    pendingCollectionCount?: number;
    onTabChange: (tab: TeacherBottomTab) => void;
}

const tabItems: Array<{
    id: TeacherBottomTab;
    label: string;
    icon: LucideIcon;
}> = [
    { id: 'record', label: '记录', icon: NotebookPen },
    { id: 'class', label: '班级', icon: School },
    { id: 'me', label: '我的', icon: UserRound },
];

export default function TeacherBottomNavigation({
    activeTab,
    pendingCollectionCount = 0,
    onTabChange,
}: TeacherBottomNavigationProps) {
    return (
        <nav
            className="absolute bottom-0 left-0 right-0 z-50 h-16 border-0 bg-white/95 [box-shadow:var(--tm-shadow-navigation)] backdrop-blur-xl"
            aria-label="教师端主要导航"
        >
            <div className="grid h-full grid-cols-3 items-center text-center">
                {tabItems.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTab === id;
                    const tone = isActive
                        ? 'text-[var(--tm-brand-primary)]'
                        : 'text-[var(--tm-nav-item-default)]';

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onTabChange(id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex h-full min-w-0 flex-col items-center justify-center gap-1 transition-[color,transform] duration-150 active:scale-95 ${tone}`}
                        >
                            <span className="relative flex h-[21px] w-[21px] items-center justify-center">
                                <Icon
                                    className="h-[21px] w-[21px]"
                                    strokeWidth={isActive ? 2.5 : 2}
                                    aria-hidden="true"
                                />
                                {id === 'me' && pendingCollectionCount > 0 && (
                                    <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--tm-status-negative)] px-1 text-[9px] font-bold leading-none tabular-nums text-white">
                                        {pendingCollectionCount > 9 ? '9+' : pendingCollectionCount}
                                    </span>
                                )}
                            </span>
                            <span className={isActive ? 'text-xs font-semibold' : 'text-xs font-medium'}>{label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
