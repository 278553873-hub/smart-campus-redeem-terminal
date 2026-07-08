import React from 'react';
import {
    ArrowLeftRight,
    BarChart3,
    BookOpen,
    Building2,
    Camera,
    Coins,
    FileText,
    MessageCircle,
    ScanLine,
    Settings,
    UsersRound,
    type LucideIcon,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import type { TeacherProfile } from '../types';

export interface TeacherSpaceOption {
    id: string;
    title: string;
    type: 'personal' | 'collaboration' | 'school';
}

interface MeViewProps {
    teacherProfile: TeacherProfile;
    currentSpace: TeacherSpaceOption;
    isSpaceSheetOpen: boolean;
    onNavigateToFiles: () => void;
    onEditTeacherProfile: () => void;
    onOpenTermGenerateModal: () => void;
    onViewLeaderReport: () => void;
    onOpenSettings: () => void;
    onOpenSubjectManagement: () => void;
    onOpenDepartmentManagement: () => void;
    onOpenCoinIssuance: () => void;
    onOpenSuggestionFeedback: () => void;
    onOpenAiHeadteacherAssistant: () => void;
    onToggleSpaceSheet: () => void;
}

type IconTone = 'blue' | 'cyan' | 'amber' | 'violet' | 'green' | 'pink' | 'slate';

interface MenuEntry {
    title: string;
    icon?: LucideIcon;
    imageSrc?: string;
    imageAlt?: string;
    imageBadgeSrc?: string;
    imageBadgeAlt?: string;
    tone?: IconTone;
    onClick?: () => void;
}

interface ToolSectionProps {
    title: string;
    children: React.ReactNode;
}

const iconToneClass: Record<IconTone, string> = {
    blue: 'from-[#3B82F6] to-[#7F9EED] text-white shadow-[0_16px_34px_-22px_rgba(59,130,246,0.92)]',
    cyan: 'from-[#23D3C0] to-[#58C3CF] text-white shadow-[0_16px_34px_-22px_rgba(35,211,192,0.88)]',
    amber: 'from-[#FDBA4B] to-[#F59E8B] text-white shadow-[0_16px_34px_-22px_rgba(245,158,11,0.86)]',
    violet: 'from-[#A78BFA] to-[#AD94ED] text-white shadow-[0_16px_34px_-22px_rgba(139,92,246,0.82)]',
    green: 'from-[#57D9A3] to-[#70BD9B] text-white shadow-[0_16px_34px_-22px_rgba(16,185,129,0.78)]',
    pink: 'from-[#FB7185] to-[#DF82AA] text-white shadow-[0_16px_34px_-22px_rgba(244,63,94,0.72)]',
    slate: 'from-[#CBD5E1] to-[#94A3B8] text-white shadow-[0_16px_34px_-22px_rgba(100,116,139,0.68)]',
};

const secondaryIconClass = 'bg-[#EEF7FF] text-[#2F9FF4]';
const topActionButtonClass = 'flex h-12 w-12 items-center justify-center rounded-full bg-white/74 text-slate-600 shadow-[0_12px_28px_-20px_rgba(15,23,42,0.45)] backdrop-blur transition active:scale-95 active:bg-white/86 active:text-[#1E9AAA]';

const ToolSection: React.FC<ToolSectionProps> = ({ title, children }) => (
    <section className="relative overflow-hidden rounded-[30px] border border-white/90 bg-white p-5 shadow-[0_20px_46px_-36px_rgba(35,96,145,0.34)] ring-1 ring-slate-100/80">
        <h3 className="flex items-center gap-3 text-[17px] font-bold leading-snug text-slate-950">
            <span className="h-7 w-1.5 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_18px_rgba(88,195,207,0.38)]" aria-hidden="true" />
            {title}
        </h3>
        {children}
    </section>
);

const ToolGrid: React.FC<{ items: MenuEntry[]; columns?: 2 | 3 | 4; variant?: 'primary' | 'secondary' }> = ({ items, columns = 4, variant = 'primary' }) => (
    <div className={`mt-6 grid ${columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-x-2 gap-y-6`}>
        {items.map(item => {
            const Icon = item.icon;
            const isSecondary = variant === 'secondary';
            const tone = item.tone ?? 'blue';

            return (
                <button
                    key={item.title}
                    type="button"
                    onClick={item.onClick}
                    className={`${isSecondary ? 'min-h-[78px] gap-2' : 'min-h-[92px] gap-2.5'} group flex flex-col items-center justify-start rounded-[20px] text-center transition duration-200 active:scale-[0.97] active:bg-white/54`}
                >
                    {item.imageSrc ? (
                        <span className="relative flex h-12 w-12 items-center justify-center overflow-visible rounded-[17px] bg-gradient-to-br from-[#F4FEFF] to-[#ECF4FF] shadow-[0_14px_28px_-22px_rgba(30,64,175,0.76)] ring-1 ring-cyan-100/80">
                            <span className="pointer-events-none absolute inset-[1px] rounded-[16px] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.18)_62%,rgba(255,255,255,0)_100%)]" aria-hidden="true" />
                            <img src={item.imageSrc} alt={item.imageAlt ?? item.title} className="relative h-11 w-11 object-contain" />
                            {item.imageBadgeSrc && (
                                <img
                                    src={item.imageBadgeSrc}
                                    alt={item.imageBadgeAlt ?? ''}
                                    className="pointer-events-none absolute -bottom-2 -right-2 h-6 w-6 object-contain drop-shadow-[0_5px_8px_rgba(79,70,229,0.20)]"
                                />
                            )}
                        </span>
                    ) : isSecondary && Icon ? (
                        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${secondaryIconClass}`}>
                            <Icon className="h-6 w-6" strokeWidth={2.35} />
                        </span>
                    ) : Icon ? (
                        <span className={`relative flex h-12 w-12 items-center justify-center rounded-[17px] bg-gradient-to-br ${iconToneClass[tone]}`}>
                            <span className="pointer-events-none absolute inset-[1px] rounded-[16px] bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0)_46%)]" aria-hidden="true" />
                            <Icon className="relative h-[23px] w-[23px]" strokeWidth={2.15} />
                        </span>
                    ) : (
                        null
                    )}
                    <span className="max-w-[72px] whitespace-nowrap text-[12px] font-semibold leading-[18px] text-slate-800">{item.title}</span>
                </button>
            );
        })}
    </div>
);

const getClassSourceTag = (space: TeacherSpaceOption) => {
    if (space.type === 'personal') return '个人';
    if (space.type === 'collaboration') return '协作';
    return '学校';
};

export const ClassSourceSheet: React.FC<{
    currentSpace: TeacherSpaceOption;
    spaceOptions: TeacherSpaceOption[];
    onClose: () => void;
    onSelectSpace: (spaceId: string) => void;
}> = ({ currentSpace, spaceOptions, onClose, onSelectSpace }) => (
    <div
        className="absolute inset-0 z-[70] flex items-end bg-[rgba(72,118,156,0.18)] backdrop-blur-[1px]"
        onClick={onClose}
    >
        <section
            className="w-full rounded-t-[28px] bg-[rgba(248,252,255,0.96)] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-1px_0_rgba(30,154,170,0.10),0_-20px_52px_-34px_rgba(35,96,145,0.42)] backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
            aria-label="切换班级来源"
        >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-cyan-200/70" aria-hidden="true" />
            <div className="mb-5 flex min-h-11 items-center">
                <div className="text-balance text-[17px] font-semibold leading-[22px] text-slate-950">切换班级来源</div>
            </div>
            <div className="space-y-3">
                {spaceOptions.map(space => {
                    const isActive = space.id === currentSpace.id;
                    const tag = getClassSourceTag(space);
                    return (
                        <button
                            key={space.id}
                            type="button"
                            onClick={() => onSelectSpace(space.id)}
                            className={`flex min-h-[60px] w-full items-center justify-between rounded-[18px] px-4 text-left active:scale-[0.96] transition-transform duration-150 ease-out ${isActive ? 'bg-[rgba(236,253,255,0.92)] shadow-[0_0_0_1.5px_rgba(30,154,170,0.36),0_1px_2px_-1px_rgba(30,154,170,0.16),0_12px_24px_-22px_rgba(30,154,170,0.42)]' : 'bg-white/92 shadow-[0_0_0_1px_rgba(35,96,145,0.10),0_1px_2px_-1px_rgba(35,96,145,0.08),0_8px_18px_-18px_rgba(35,96,145,0.20)]'}`}
                        >
                            <span className="min-w-0 truncate text-[17px] font-semibold leading-[22px] text-slate-950">{space.title}</span>
                            <span className="ml-3 flex shrink-0 items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-[13px] font-medium leading-[18px] ${isActive ? 'bg-white/84 text-[#1E9AAA]' : 'bg-[#EEF7FF] text-slate-500'}`}>{tag}</span>
                                {isActive && <span className="rounded-full bg-[#1E9AAA] px-3 py-1 text-[13px] font-semibold leading-[18px] text-white shadow-[0_8px_18px_-12px_rgba(30,154,170,0.78)]">当前</span>}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    </div>
);

const MeView: React.FC<MeViewProps> = ({
    teacherProfile,
    currentSpace,
    isSpaceSheetOpen,
    onNavigateToFiles,
    onEditTeacherProfile,
    onOpenTermGenerateModal,
    onViewLeaderReport,
    onOpenSettings,
    onOpenSubjectManagement,
    onOpenDepartmentManagement,
    onOpenCoinIssuance,
    onOpenSuggestionFeedback,
    onOpenAiHeadteacherAssistant,
    onToggleSpaceSheet,
}) => {
    const showDemoFeedback = (label: string) => {
        window.alert(`${label}功能演示中`);
    };

    const primaryTools: MenuEntry[] = [
        {
            title: '学校报表',
            icon: BarChart3,
            tone: 'blue',
            onClick: onViewLeaderReport,
        },
        {
            title: '期末报告',
            icon: FileText,
            tone: 'cyan',
            onClick: onOpenTermGenerateModal,
        },
        {
            title: 'AI班主任助理',
            imageSrc: ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT,
            imageAlt: 'AI班主任助理图标',
            imageBadgeSrc: ASSETS.MANAGEMENT.AI_ART_BADGE,
            imageBadgeAlt: 'AI标签',
            onClick: onOpenAiHeadteacherAssistant,
        },
        {
            title: '校长助理',
            imageSrc: ASSETS.MANAGEMENT.AI_PRINCIPAL_ASSISTANT,
            imageAlt: '校长助理图标',
            imageBadgeSrc: ASSETS.MANAGEMENT.AI_ART_BADGE,
            imageBadgeAlt: 'AI标签',
            onClick: () => showDemoFeedback('校长助理'),
        },
    ];

    const moreTools: MenuEntry[] = [
        {
            title: '科目管理',
            icon: BookOpen,
            tone: 'blue',
            onClick: onOpenSubjectManagement,
        },
        {
            title: '部门管理',
            icon: UsersRound,
            tone: 'green',
            onClick: onOpenDepartmentManagement,
        },
        {
            title: '货币发放',
            icon: Coins,
            tone: 'amber',
            onClick: onOpenCoinIssuance,
        },
        {
            title: '建议反馈',
            icon: MessageCircle,
            tone: 'pink',
            onClick: onOpenSuggestionFeedback,
        },
    ];

    const teacherName = teacherProfile.name || '刘飞飞老师';
    const classSourceName = currentSpace.title || '成都市未来实验小学';
    const displayAvatar = teacherProfile.avatar === ASSETS.AVATAR.TEACHER_LIU
        ? ASSETS.AVATAR.TEACHER_LIU_RAW
        : teacherProfile.avatar;

    return (
        <div className="relative min-h-screen overflow-hidden pb-24 font-sans text-slate-900">
            <div className="relative px-5 pt-7">
                <div className="relative z-10 min-h-[164px]">
                    <div className="relative z-10 flex items-start gap-5 pt-6">
                        <button
                            type="button"
                            onClick={onEditTeacherProfile}
                            className="relative shrink-0 overflow-visible rounded-full text-left transition-transform active:scale-95"
                            aria-label="编辑教师信息"
                        >
                            <div className="h-[96px] w-[96px] rounded-full bg-gradient-to-br from-white via-cyan-100/80 to-blue-100/70 p-[3px] shadow-[0_18px_28px_-18px_rgba(37,99,235,0.34)] ring-1 ring-white/90">
                                <span className="block h-full w-full overflow-hidden rounded-full bg-white">
                                    <img
                                        src={displayAvatar}
                                        alt={`${teacherName}头像`}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </span>
                            </div>
                            <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white text-blue-500 shadow-[0_10px_22px_-14px_rgba(37,99,235,0.62)]" aria-hidden="true">
                                <Camera className="h-4 w-4" strokeWidth={2.3} />
                            </span>
                        </button>

                        <div className="min-w-0 flex-1 pt-4">
                            <h2 className="truncate text-[22px] font-extrabold leading-tight tracking-tight text-slate-950">{teacherName}</h2>
                            <button
                                type="button"
                                onClick={onToggleSpaceSheet}
                                className="mt-3 inline-flex max-w-full min-h-9 items-center gap-2 rounded-full border border-blue-100/80 bg-white/74 px-3.5 text-[13px] font-semibold text-blue-600 shadow-[0_14px_28px_-20px_rgba(37,99,235,0.62)] backdrop-blur-xl transition-transform active:scale-[0.98]"
                                aria-expanded={isSpaceSheetOpen}
                            >
                                <Building2 className="h-4 w-4 shrink-0" strokeWidth={2.3} />
                                <span className="truncate">{classSourceName}</span>
                                <ArrowLeftRight className="h-3.5 w-3.5 shrink-0 text-blue-400" strokeWidth={2.3} />
                            </button>
                        </div>

                        <div className="absolute right-4 top-2 flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                onClick={() => showDemoFeedback('扫一扫')}
                                className={topActionButtonClass}
                                aria-label="扫一扫"
                            >
                                <ScanLine className="h-5 w-5" strokeWidth={2.2} />
                            </button>
                            <button
                                type="button"
                                onClick={onOpenSettings}
                                className={topActionButtonClass}
                                aria-label="设置"
                            >
                                <Settings className="h-5 w-5" strokeWidth={2.2} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-4 px-5 pt-0">
                <ToolSection title="管理工具">
                    <ToolGrid items={primaryTools} columns={4} />
                </ToolSection>

                <ToolSection title="更多工具">
                    <ToolGrid items={moreTools} variant="secondary" />
                </ToolSection>
                <div className="h-10" />
            </div>
        </div>
    );
};

export default MeView;
