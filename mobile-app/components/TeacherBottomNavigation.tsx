import { ASSETS } from '../assets/images';
import MobileBottomNavigation from './ui/MobileBottomNavigation';

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
    return <MobileBottomNavigation
        activeTab={activeTab}
        items={tabItems.map(item => ({ ...item, badgeCount: item.id === 'me' ? pendingCollectionCount : 0 }))}
        onTabChange={onTabChange}
        ariaLabel="教师端主要导航"
    />;
}
