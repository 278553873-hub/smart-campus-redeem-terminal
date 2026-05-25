import React from 'react';
import {
    BarChart3,
    BriefcaseBusiness,
    Camera,
    FileText,
    Info,
    KeyRound,
    ShieldCheck,
    Smartphone,
    UserRound,
    type LucideIcon,
} from 'lucide-react';
import { MenuItem } from '../components/ui/MenuItem';
import { MenuSection } from '../components/ui/MenuSection';
import { phoneText, type PhoneTone } from '../styles/phoneTokens';
import type { TeacherProfile } from '../types';
import { ASSETS } from '../assets/images';

interface MeViewProps {
    teacherProfile: TeacherProfile;
    onNavigateToFiles: () => void;
    onEditTeacherProfile: () => void;
    onOpenGenerateModal: () => void;
    onOpenTermGenerateModal: () => void;
    onViewLeaderReport: () => void;
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

const MeView: React.FC<MeViewProps> = ({ teacherProfile, onNavigateToFiles, onEditTeacherProfile, onViewLeaderReport }) => {
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
        <div className="relative min-h-screen overflow-hidden bg-[#F4FCFF] pb-24 font-sans text-slate-900">
            <div className="pointer-events-none absolute -left-24 -right-28 top-0 h-[420px] opacity-75 blur-[30px]" aria-hidden="true">
                <img
                    src={ASSETS.MANAGEMENT.TEACHER_ME_HERO_BG}
                    alt=""
                    className="h-full w-full scale-125 object-cover object-right-top"
                />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-[190px] h-[360px] opacity-60" aria-hidden="true">
                <img
                    src={ASSETS.MANAGEMENT.TEACHER_ME_HERO_BG}
                    alt=""
                    className="h-full w-full scale-150 object-cover object-right-bottom blur-2xl"
                />
            </div>

            <div className="relative px-5 pt-4">
                <div className="relative z-10 min-h-[173px] overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-38px_rgba(14,116,144,0.5)] ring-1 ring-cyan-100/70">
                    <img
                        src={ASSETS.MANAGEMENT.TEACHER_ME_HERO_BG}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover object-right-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/55 via-white/14 to-white/4" aria-hidden="true" />

                    <div className="relative z-10 flex min-h-[173px] items-center gap-4 px-5 py-5">
                        <button
                            type="button"
                            onClick={onEditTeacherProfile}
                            className="relative shrink-0 rounded-full text-left transition-transform active:scale-95"
                            aria-label="编辑教师信息"
                        >
                            <div className="h-[92px] w-[92px] rounded-full bg-white/86 p-1.5 shadow-[0_18px_42px_-24px_rgba(15,23,42,0.45)] backdrop-blur">
                                <img
                                    src={teacherProfile.avatar}
                                    alt="刘飞飞老师头像"
                                    className="h-full w-full rounded-full bg-slate-50 object-cover ring-2 ring-white"
                                />
                            </div>
                        </button>

                        <div className="min-w-0 flex-1">
                            <h2 className={`${phoneText.pageTitle} text-slate-950`}>刘飞飞老师</h2>
                            <p className={`mt-2 text-slate-600 ${phoneText.itemTitle}`}>成都七中初中附属小学</p>
                            <button
                                type="button"
                                onClick={onEditTeacherProfile}
                                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/90 bg-white/88 px-4 text-sm font-extrabold text-blue-600 shadow-[0_14px_28px_-18px_rgba(37,99,235,0.8)] backdrop-blur-xl transition-transform active:scale-[0.98]"
                            >
                                <Camera className="h-4 w-4" strokeWidth={2.4} />
                                编辑教师信息
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-3 px-5 pt-4">
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
