import React from 'react';
import {
    BookOpen,
    CalendarRange,
    Camera,
    ChevronRight,
    ClipboardList,
    Coins,
    FileCog,
    ScanLine,
    MessageCircle,
    Settings,
    UsersRound,
    type LucideIcon,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import ClassSourceTrigger from '../components/ClassSourceTrigger';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import type { TeacherProfile } from '../types';
import {
    getTeacherSpaceMenuPolicy,
    type TeacherManagementToolId,
    type TeacherMoreToolId,
    type TeacherSpaceOption,
} from '../domain/teacherSpaceAccess';

export type { TeacherSpaceOption } from '../domain/teacherSpaceAccess';

interface MeViewProps {
    teacherProfile: TeacherProfile;
    currentSpace: TeacherSpaceOption;
    isSpaceSheetOpen: boolean;
    onNavigateToFiles: () => void;
    onEditTeacherProfile: () => void;
    onOpenTermGenerateModal: () => void;
    onViewLeaderReport: () => void;
    onOpenMoralEducationCockpit: () => void;
    onOpenWeeklyDutySchedule: () => void;
    onOpenHomeworkBatchImport: () => void;
    onOpenSettings: () => void;
    onOpenSubjectManagement: () => void;
    onOpenDepartmentManagement: () => void;
    onOpenCoinIssuance: () => void;
    onOpenSuggestionFeedback: () => void;
    onOpenQuestionnaire: () => void;
    pendingCollectionCount: number;
    onOpenAssignedCollections: () => void;
    onOpenArchiveDesign: () => void;
    onOpenAiHeadteacherAssistant: () => void;
    onOpenAiPrincipalAssistant: () => void;
    onToggleSpaceSheet: () => void;
}

interface MenuEntry<TId extends string = string> {
    id: TId;
    title: string;
    labelLines?: readonly string[];
    icon?: LucideIcon;
    imageSrc?: string;
    imageAlt?: string;
    imageClassName?: string;
    imageBadgeSrc?: string;
    imageBadgeAlt?: string;
    onClick?: () => void;
    plainImage?: boolean;
}

interface ToolSectionProps {
    title: string;
    children: React.ReactNode;
}

const secondaryIconClass = 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]';

const settingsButtonClass = 'absolute right-0 top-6 flex h-11 w-11 items-center justify-end text-[var(--tm-text-secondary)] transition active:scale-95 active:text-[var(--tm-brand-primary)]';
const reportToolImageClass = 'h-14 w-14 max-w-none rounded-[var(--tm-radius-inner)] object-cover';
const assistantToolImageClass = 'h-12 w-12 rounded-[var(--tm-radius-inner)] object-cover';
const toolCardSurfaceClass = 'bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card-ambient)]';

const ToolSection: React.FC<ToolSectionProps> = ({ title, children }) => (
    <section className={`relative overflow-hidden rounded-[var(--tm-radius-card)] p-4 ${toolCardSurfaceClass}`}>
        <h3 className="flex items-center gap-3 text-[17px] font-bold leading-snug text-[var(--tm-text-primary)]">
            <span className="h-7 w-1.5 rounded-full bg-[var(--tm-brand-primary)]" aria-hidden="true" />
            {title}
        </h3>
        {children}
    </section>
);

const ToolGrid: React.FC<{ items: MenuEntry[]; columns?: 2 | 3 | 4; variant?: 'primary' | 'secondary' }> = ({ items, columns = 4, variant = 'primary' }) => (
    <div className={`mt-4 grid ${columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-x-3 ${variant === 'secondary' ? 'gap-y-3' : 'gap-y-4'} mb-[var(--tm-space-1)]`}>
        {items.map(item => {
            const Icon = item.icon;
            const isSecondary = variant === 'secondary';
            return (
                <button
                    key={item.id}
                    type="button"
                    aria-label={item.title}
                    onClick={item.onClick}
                    className={`${isSecondary ? 'min-h-[72px]' : 'min-h-[82px]'} group flex flex-col items-center justify-start gap-2 rounded-[var(--tm-radius-inner)] py-1 text-center transition duration-200 active:scale-[0.97] active:bg-[var(--tm-brand-primary-soft)]/60`}
                >
                    {item.imageSrc ? (
                        <span className="relative flex h-12 w-12 items-center justify-center overflow-visible rounded-[var(--tm-radius-inner)]">
                            {item.plainImage ? (
                                <img
                                    src={item.imageSrc}
                                    alt={item.imageAlt ?? item.title}
                                    className={item.imageClassName ?? 'h-12 w-12 rounded-[var(--tm-radius-inner)] object-cover [box-shadow:var(--tm-shadow-icon)]'}
                                />
                            ) : (
                                <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[var(--tm-radius-inner)] bg-[linear-gradient(145deg,var(--tm-brand-primary-soft),var(--tm-brand-secondary-soft))] [box-shadow:var(--tm-shadow-icon)] ring-1 ring-[var(--tm-brand-primary-soft-strong)]">
                                    <img src={item.imageSrc} alt={item.imageAlt ?? item.title} className={item.imageClassName ?? 'relative h-11 w-11 object-contain'} />
                                </span>
                            )}
                            {item.imageBadgeSrc && (
                                <img
                                    src={item.imageBadgeSrc}
                                    alt={item.imageBadgeAlt ?? ''}
                                    className="pointer-events-none absolute -bottom-1 -right-2 h-6 w-6 object-contain"
                                />
                            )}
                        </span>
                    ) : isSecondary && Icon ? (
                        <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-full ${secondaryIconClass}`}>
                            <Icon className="h-[19px] w-[19px]" strokeWidth={2.35} />
                        </span>
                    ) : Icon ? (
                        <span className={`relative flex h-12 w-12 items-center justify-center rounded-[var(--tm-radius-inner)] ${secondaryIconClass}`}>
                            <Icon className="relative h-[23px] w-[23px]" strokeWidth={2.15} />
                        </span>
                    ) : (
                        null
                    )}
                    <span className="max-w-[72px] whitespace-nowrap text-[12px] font-medium leading-[18px] text-[var(--tm-text-primary)]">
                        {item.labelLines?.map(line => <span key={line} className="block">{line}</span>) ?? item.title}
                    </span>
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
    <MobileBottomSheet open title="切换班级来源" onClose={onClose}>
        <div className="space-y-3">
            {spaceOptions.map(space => {
                const isActive = space.id === currentSpace.id;
                const tag = getClassSourceTag(space);
                return (
                    <button
                        key={space.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onSelectSpace(space.id)}
                        className={`flex min-h-[60px] w-full items-center justify-between rounded-[var(--tm-radius-inner)] px-4 text-left transition-transform [transition-duration:var(--tm-duration-fast)] ease-out active:scale-[0.96] ${isActive ? 'bg-[var(--tm-brand-primary-soft)] ring-[1.5px] ring-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-card)]' : 'bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card-on-white)]'}`}
                    >
                        <span className="min-w-0 truncate text-[17px] font-semibold leading-[22px] text-[var(--tm-text-primary)]">{space.title}</span>
                        <span className="ml-3 flex shrink-0 items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-[13px] font-medium leading-[18px] ${isActive ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-pressed)]' : 'bg-[var(--tm-brand-secondary-soft)] text-[var(--tm-brand-secondary-strong)]'}`}>{tag}</span>
                            {isActive && <span className="rounded-full bg-[var(--tm-brand-primary)] px-3 py-1 text-[13px] font-semibold leading-[18px] text-[var(--tm-text-inverse)]">当前</span>}
                        </span>
                    </button>
                );
            })}
        </div>
    </MobileBottomSheet>
);

const MeView: React.FC<MeViewProps> = ({
    teacherProfile,
    currentSpace,
    isSpaceSheetOpen,
    onNavigateToFiles,
    onEditTeacherProfile,
    onOpenTermGenerateModal,
    onViewLeaderReport,
    onOpenMoralEducationCockpit,
    onOpenWeeklyDutySchedule,
    onOpenHomeworkBatchImport,
    onOpenSettings,
    onOpenSubjectManagement,
    onOpenDepartmentManagement,
    onOpenCoinIssuance,
    onOpenSuggestionFeedback,
    onOpenQuestionnaire,
    pendingCollectionCount,
    onOpenAssignedCollections,
    onOpenArchiveDesign,
    onOpenAiHeadteacherAssistant,
    onOpenAiPrincipalAssistant,
    onToggleSpaceSheet,
}) => {
    const menuPolicy = getTeacherSpaceMenuPolicy(currentSpace);
    const allowedManagementTools = new Set(menuPolicy.managementTools);
    const allowedMoreTools = new Set(menuPolicy.moreTools);

    const allPrimaryTools: MenuEntry<TeacherManagementToolId>[] = [
        {
            id: 'headteacherAssistant',
            title: '班主任助理',
            imageSrc: ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT,
            imageAlt: '班主任助理图标',
            imageClassName: assistantToolImageClass,
            imageBadgeSrc: ASSETS.MANAGEMENT.AI_ART_BADGE,
            imageBadgeAlt: 'AI标签',
            plainImage: true,
            onClick: onOpenAiHeadteacherAssistant,
        },
        {
            id: 'principalAssistant',
            title: '校长助理',
            imageSrc: ASSETS.MANAGEMENT.AI_PRINCIPAL_ASSISTANT,
            imageAlt: '校长助理图标',
            imageClassName: assistantToolImageClass,
            imageBadgeSrc: ASSETS.MANAGEMENT.AI_ART_BADGE,
            imageBadgeAlt: 'AI标签',
            plainImage: true,
            onClick: onOpenAiPrincipalAssistant,
        },
        {
            id: 'schoolReport',
            title: '学生评价报表',
            labelLines: ['学评报表'],
            imageSrc: ASSETS.MANAGEMENT.SCHOOL_REPORT_V2,
            imageAlt: '学生评价报表图标',
            imageClassName: reportToolImageClass,
            plainImage: true,
            onClick: onViewLeaderReport,
        },
        {
            id: 'moralEducationCockpit',
            title: '班级评价报表',
            labelLines: ['班评报表'],
            imageSrc: ASSETS.MANAGEMENT.CLASS_EVALUATION_REPORT,
            imageAlt: '班级评价报表图标',
            imageClassName: reportToolImageClass,
            plainImage: true,
            onClick: onOpenMoralEducationCockpit,
        },
        {
            id: 'termReport',
            title: '期末报告',
            imageSrc: ASSETS.MANAGEMENT.TERM_REPORT_V2,
            imageAlt: '期末报告图标',
            imageClassName: reportToolImageClass,
            plainImage: true,
            onClick: onOpenTermGenerateModal,
        },
    ];
    const primaryTools = allPrimaryTools.filter(item => allowedManagementTools.has(item.id));

    const allMoreTools: MenuEntry<TeacherMoreToolId>[] = [
        {
            id: 'homeworkBatchImport',
            title: '作业录入',
            labelLines: ['作业录入'],
            icon: ScanLine,
            onClick: onOpenHomeworkBatchImport,
        },
        {
            id: 'coinIssuance',
            title: '货币发放',
            icon: Coins,
            onClick: onOpenCoinIssuance,
        },
        {
            id: 'questionnaire',
            title: '问卷采集',
            icon: ClipboardList,
            onClick: onOpenQuestionnaire,
        },
        {
            id: 'weeklyDutySchedule',
            title: '值周安排',
            icon: CalendarRange,
            onClick: onOpenWeeklyDutySchedule,
        },
        {
            id: 'archiveDesign',
            title: '档案设计',
            icon: FileCog,
            onClick: onOpenArchiveDesign,
        },
        {
            id: 'subjectManagement',
            title: '科目管理',
            icon: BookOpen,
            onClick: onOpenSubjectManagement,
        },
        {
            id: 'departmentManagement',
            title: '部门管理',
            icon: UsersRound,
            onClick: onOpenDepartmentManagement,
        },
        {
            id: 'suggestionFeedback',
            title: '建议反馈',
            icon: MessageCircle,
            onClick: onOpenSuggestionFeedback,
        },
    ];
    const moreTools = allMoreTools.filter(item => allowedMoreTools.has(item.id));

    const teacherName = teacherProfile.name || '刘飞';
    const classSourceName = currentSpace.title || '成都市未来实验小学';

    return (
        <div
            className="relative overflow-hidden bg-transparent font-sans text-[var(--tm-text-primary)]"
        >
            <div className="relative px-5 pt-5">
                <div className="relative z-10 flex min-h-[132px] items-center">
                    <div className="relative z-10 flex w-full items-start gap-4">
                        <button
                            type="button"
                            onClick={onEditTeacherProfile}
                            className="relative shrink-0 overflow-visible rounded-full text-left transition-transform active:scale-95"
                            aria-label="编辑教师信息"
                        >
                            <div className="h-20 w-20 rounded-full bg-[linear-gradient(145deg,var(--tm-bg-surface),var(--tm-brand-primary-soft-strong),var(--tm-brand-secondary-soft))] p-[3px] [box-shadow:var(--tm-shadow-avatar)] ring-1 ring-white/90">
                                <span className="block h-full w-full overflow-hidden rounded-full bg-white">
                                    <img
                                        src={teacherProfile.avatar}
                                        alt={`${teacherName}头像`}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </span>
                            </div>
                            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-icon)]" aria-hidden="true">
                                <Camera className="h-4 w-4" strokeWidth={2.3} />
                            </span>
                        </button>

                        <div className="min-w-0 flex-1 pt-3">
                            <h2 className="truncate text-[22px] font-extrabold leading-tight tracking-tight text-[var(--tm-text-primary)]">{teacherName}</h2>
                            <ClassSourceTrigger
                                name={classSourceName}
                                type={currentSpace.type}
                                onClick={onToggleSpaceSheet}
                                expanded={isSpaceSheetOpen}
                                className="mt-2"
                                density="compact"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={onOpenSettings}
                            className={settingsButtonClass}
                            aria-label="设置"
                        >
                            <Settings className="h-[22px] w-[22px]" strokeWidth={2.2} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-3 px-5 pt-0">
                {pendingCollectionCount > 0 && (
                    <button
                        type="button"
                        onClick={onOpenAssignedCollections}
                        className={`flex min-h-12 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-4 text-left transition active:scale-[0.98] active:bg-[var(--tm-brand-primary-soft)] ${toolCardSurfaceClass}`}
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><ClipboardList className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">待填写采集</span>
                        <span className="flex shrink-0 items-center gap-1.5">
                            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--tm-status-negative)] px-1.5 text-[11px] font-bold tabular-nums text-white">{pendingCollectionCount}</span>
                            <ChevronRight className="h-4 w-4 text-[var(--tm-text-disabled)]" />
                        </span>
                    </button>
                )}
                {primaryTools.length > 0 && (
                    <ToolSection title="管理工具">
                        <ToolGrid items={primaryTools} columns={4} />
                    </ToolSection>
                )}

                {moreTools.length > 0 && (
                    <ToolSection title="更多工具">
                        <ToolGrid items={moreTools} columns={4} variant="secondary" />
                    </ToolSection>
                )}
            </div>
        </div>
    );
};

export default MeView;
