import { ASSETS } from '../assets/images';
import type { MobileNavigationItem } from '../components/ui/MobileBottomNavigation';
import archiveActive from '../assets/resources/teacher-development-navigation/archive-active.png';
import archiveDefault from '../assets/resources/teacher-development-navigation/archive-default.png';
import reportActive from '../assets/resources/teacher-development-navigation/report-active.png';
import reportDefault from '../assets/resources/teacher-development-navigation/report-default.png';

type Tab = 'record' | 'archive' | 'report' | 'me';
export const developmentNavigationItems: readonly MobileNavigationItem<Tab>[] = [
    { id: 'record', label: '记录', icon: { active: ASSETS.TEACHER_BOTTOM_NAVIGATION.RECORD.ACTIVE, default: ASSETS.TEACHER_BOTTOM_NAVIGATION.RECORD.DEFAULT } },
    // 补偿生成图较大的透明留白，使徽章的可见体积与原导航一致。
    { id: 'archive', label: '档案', icon: { active: archiveActive, default: archiveDefault, opticalSize: 25 } },
    { id: 'report', label: '报表', icon: { active: reportActive, default: reportDefault, opticalSize: 25 } },
    { id: 'me', label: '我的', icon: { active: ASSETS.TEACHER_BOTTOM_NAVIGATION.ME.ACTIVE, default: ASSETS.TEACHER_BOTTOM_NAVIGATION.ME.DEFAULT } },
];
