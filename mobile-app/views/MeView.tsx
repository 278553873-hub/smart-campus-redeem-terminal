import React from 'react';
import {
    BarChart3,
    BookOpen,
    BriefcaseBusiness,
    Camera,
    FileText,
    Info,
    KeyRound,
    Landmark,
    ShieldCheck,
    Smartphone,
    Sparkles,
    UserRound,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { IconBadge } from '../components/ui/IconBadge';
import { MenuItem } from '../components/ui/MenuItem';
import { MenuSection } from '../components/ui/MenuSection';
import { MobileCard } from '../components/ui/MobileCard';
import { phoneText, type PhoneTone } from '../styles/phoneTokens';
import type { TeacherProfile } from '../types';

interface MeViewProps {
    teacherProfile: TeacherProfile;
    onNavigateToFiles: () => void;
    onEditTeacherProfile: () => void;
    onOpenGenerateModal: () => void;
    onOpenTermGenerateModal: () => void;
    onViewLeaderReport: () => void;
}

interface ProfileTag {
    label: string;
    icon: LucideIcon;
    tone: Extract<PhoneTone, 'brand' | 'violet' | 'blue' | 'success'>;
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

const buildProfileTags = (teacherProfile: TeacherProfile): ProfileTag[] => {
    const subjectTags = Array.from(new Set(teacherProfile.teachingAssignments.map(item => item.subject)))
        .slice(0, 2)
        .map(subject => ({ label: subject, icon: BookOpen, tone: 'blue' as const }));

    return [
        { label: teacherProfile.departmentName || '未设置部门', icon: Landmark, tone: 'brand' },
        ...(teacherProfile.gradeLeaderGrades.length > 0 ? [{ label: '年级组长', icon: Users, tone: 'violet' as const }] : []),
        ...(teacherProfile.homeroomClassIds.length > 0 ? [{ label: '班主任', icon: Sparkles, tone: 'success' as const }] : []),
        ...subjectTags,
    ];
};

const MeView: React.FC<MeViewProps> = ({ teacherProfile, onNavigateToFiles, onEditTeacherProfile, onViewLeaderReport }) => {
    const profileTags = buildProfileTags(teacherProfile);

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
                <MobileCard variant="hero" padding="lg" className="overflow-hidden border-blue-200/40 bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200/70">
                    <div className="flex items-center gap-5">
                        <button
                            type="button"
                            onClick={onEditTeacherProfile}
                            className="relative shrink-0 rounded-full text-left transition-transform active:scale-95"
                            aria-label="编辑教师信息"
                        >
                            <div className="h-[92px] w-[92px] rounded-full bg-white/18 p-1.5 shadow-inner backdrop-blur">
                                <img
                                    src={teacherProfile.avatar}
                                    alt="刘飞飞老师头像"
                                    className="h-full w-full rounded-full bg-slate-50 object-cover ring-2 ring-white/80"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0">
                                <IconBadge icon={Camera} size="sm" tone="brand" shape="circle" className="border-[3px] border-white bg-white text-blue-600" />
                            </div>
                        </button>

                        <div className="min-w-0 flex-1">
                            <h2 className={`${phoneText.pageTitle} text-white`}>刘飞飞老师</h2>
                            <p className={`mt-2 text-white/78 ${phoneText.itemTitle}`}>成都七中初中附属小学</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {profileTags.map(tag => (
                                    <span key={tag.label} className={`inline-flex items-center gap-1.5 rounded-lg border border-white/24 bg-white/16 px-2.5 py-1.5 text-white backdrop-blur ${phoneText.label}`}>
                                        <tag.icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                                        {tag.label}
                                    </span>
                                ))}
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
