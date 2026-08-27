import { ASSETS } from '../assets/images';

export type TeacherBottomTab = 'record' | 'class' | 'me';

interface TeacherBottomNavigationProps {
    activeTab: TeacherBottomTab;
    pendingCollectionCount?: number;
    onTabChange: (tab: TeacherBottomTab) => void;
}

const tabItems: Array<{
    id: TeacherBottomTab;
    label: string;
    icon: {
        active: string;
        default: string;
    };
}> = [
    {
        id: 'record',
        label: '记录',
        icon: {
            active: ASSETS.TEACHER_BOTTOM_NAVIGATION.RECORD.ACTIVE,
            default: ASSETS.TEACHER_BOTTOM_NAVIGATION.RECORD.DEFAULT,
        },
    },
    {
        id: 'class',
        label: '班级',
        icon: {
            active: ASSETS.TEACHER_BOTTOM_NAVIGATION.CLASS.ACTIVE,
            default: ASSETS.TEACHER_BOTTOM_NAVIGATION.CLASS.DEFAULT,
        },
    },
    {
        id: 'me',
        label: '我的',
        icon: {
            active: ASSETS.TEACHER_BOTTOM_NAVIGATION.ME.ACTIVE,
            default: ASSETS.TEACHER_BOTTOM_NAVIGATION.ME.DEFAULT,
        },
    },
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
                {tabItems.map(({ id, label, icon }) => {
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
                            className={`group flex h-full min-w-0 flex-col items-center justify-center gap-1 transition-colors [transition-duration:var(--tm-duration-fast)] ${tone}`}
                        >
                            <span className="relative flex h-[22px] w-[22px] items-center justify-center">
                                <img
                                    src={isActive ? icon.active : icon.default}
                                    alt=""
                                    className={`h-[22px] w-[22px] object-contain transition-transform [transition-duration:var(--tm-duration-fast)] ease-out group-active:scale-[0.86] motion-reduce:transition-none ${isActive ? 'scale-100' : 'scale-90'}`}
                                    aria-hidden="true"
                                />
                                {id === 'me' && pendingCollectionCount > 0 && (
                                    <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--tm-status-negative)] px-1 text-[9px] font-bold leading-none tabular-nums text-white">
                                        {pendingCollectionCount > 9 ? '9+' : pendingCollectionCount}
                                    </span>
                                )}
                            </span>
                            <span className="text-xs font-medium">{label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
