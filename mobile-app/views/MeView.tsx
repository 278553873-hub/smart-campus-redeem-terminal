import React from 'react';
import {
    BarChart3,
    BookOpen,
    BriefcaseBusiness,
    FileText,
    Info,
    KeyRound,
    Landmark,
    PenTool,
    ShieldCheck,
    Smartphone,
    Sparkles,
    UserRound,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import { IconBadge } from '../components/ui/IconBadge';
import { MenuItem } from '../components/ui/MenuItem';
import { MenuSection } from '../components/ui/MenuSection';
import { MobileCard } from '../components/ui/MobileCard';
import { phoneText, phoneTone, type PhoneTone } from '../styles/phoneTokens';

interface MeViewProps {
    onNavigateToFiles: () => void;
    onOpenGenerateModal: () => void;
    onOpenTermGenerateModal: () => void;
    onViewLeaderReport: () => void;
}

interface ProfileTag {
    label: string;
    icon: LucideIcon;
    tone: Extract<PhoneTone, 'brand' | 'violet' | 'blue'>;
}

interface MenuEntry {
    title: string;
    icon: LucideIcon;
    tone: PhoneTone;
    description?: string;
    value?: string;
    onClick?: () => void;
}

interface MenuGroup {
    title: string;
    icon: LucideIcon;
    tone: PhoneTone;
    items: MenuEntry[];
}

const profileTags: ProfileTag[] = [
    { label: '学发中心', icon: Landmark, tone: 'brand' },
    { label: '年级组长', icon: Users, tone: 'violet' },
    { label: '班主任', icon: Sparkles, tone: 'violet' },
    { label: '物理', icon: BookOpen, tone: 'blue' },
];

const ProfileTagChip: React.FC<ProfileTag> = ({ label, icon: Icon, tone }) => (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${phoneText.label} ${phoneTone[tone].soft}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        {label}
    </span>
);

const MeView: React.FC<MeViewProps> = ({ onNavigateToFiles, onViewLeaderReport }) => {
    const teacherAvatarUrl = ASSETS.AVATAR.TEACHER_LIU;

    const menuGroups: MenuGroup[] = [
        {
            title: '管理工具',
            icon: BriefcaseBusiness,
            tone: 'brand',
            items: [
                {
                    title: '学校数据报表',
                    icon: BarChart3,
                    tone: 'violet',
                    onClick: onViewLeaderReport,
                },
            ],
        },
        {
            title: '我的资料',
            icon: UserRound,
            tone: 'violet',
            items: [
                {
                    title: '我的文件',
                    icon: FileText,
                    tone: 'success',
                    onClick: onNavigateToFiles,
                },
            ],
        },
        {
            title: '账号安全',
            icon: ShieldCheck,
            tone: 'success',
            items: [
                {
                    title: '登录账号',
                    icon: Smartphone,
                    tone: 'blue',
                    value: '139****0121',
                },
                {
                    title: '修改密码',
                    icon: KeyRound,
                    tone: 'blue',
                },
            ],
        },
        {
            title: '关于产品',
            icon: Info,
            tone: 'warning',
            items: [
                {
                    title: '版本信息',
                    value: 'v2.4.0-REBUILT',
                    icon: Info,
                    tone: 'blue',
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
            <div className="px-5 pt-4">
                <MobileCard variant="hero" padding="lg" className="overflow-hidden">
                    <div className="flex items-center gap-5">
                        <div className="relative shrink-0">
                            <div className="h-[92px] w-[92px] rounded-full bg-blue-50 p-1.5 shadow-inner">
                                <img
                                    src={teacherAvatarUrl}
                                    alt="刘飞飞老师头像"
                                    className="h-full w-full rounded-full bg-slate-50 object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0">
                                <IconBadge icon={PenTool} size="sm" tone="brand" shape="circle" className="border-[3px] border-white bg-indigo-600 text-white" />
                            </div>
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className={`${phoneText.pageTitle} text-slate-900`}>刘飞飞老师</h2>
                            <p className={`mt-2 text-slate-400 ${phoneText.itemTitle}`}>成都七中初中附属小学</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {profileTags.map(tag => <ProfileTagChip key={tag.label} {...tag} />)}
                            </div>
                        </div>
                    </div>
                </MobileCard>
            </div>

            <div className="space-y-3 px-5 pt-4">
                {menuGroups.map(group => (
                    <MenuSection key={group.title} title={group.title} icon={group.icon} tone={group.tone}>
                        {group.items.map(item => <MenuItem key={item.title} {...item} />)}
                    </MenuSection>
                ))}
                <div className="h-10" />
            </div>
        </div>
    );
};

export default MeView;
