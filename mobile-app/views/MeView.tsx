import React from 'react';
import {
    BookOpen,
    CalendarRange,
    Camera,
    Check,
    ChevronRight,
    ClipboardList,
    Coins,
    FileCog,
    FileSliders,
    ScanLine,
    MessageCircle,
    MonitorSmartphone,
    Settings,
    UsersRound,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import { ToolGrid, ToolSection, type MenuEntry } from '../components/me/TeacherMeTools';
import ClassSourceTrigger, { ClassSourceIcon } from '../components/ClassSourceTrigger';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileTag from '../components/ui/MobileTag';
import type { TeacherProfile } from '../types';
import {
    getTeacherSchoolTypeLabel,
    getTeacherSpaceMenuPolicy,
    type TeacherManagementToolId,
    type TeacherMoreToolId,
    type TeacherSpaceOption,
} from '../domain/teacherSpaceAccess';

export type { TeacherSpaceOption } from '../domain/teacherSpaceAccess';

const getClassSourceTypeLabel = (space: TeacherSpaceOption) => (
    space.type === 'personal' ? '个人' : space.type === 'collaboration' ? '协作' : '学校'
);

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
    onOpenParentEvaluationVisibility: () => void;
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
    onOpenReportManagement: () => void;
    onOpenAiHeadteacherAssistant: () => void;
    onOpenAiPrincipalAssistant: () => void;
    onToggleSpaceSheet: () => void;
}

const settingsButtonClass = 'flex h-11 w-11 shrink-0 items-center justify-end text-[var(--tm-text-secondary)]';
const reportToolImageClass = 'h-14 w-14 max-w-none rounded-[var(--tm-radius-inner)] object-cover';
const assistantToolImageClass = 'h-12 w-12 rounded-[var(--tm-radius-inner)] object-cover';
const toolCardSurfaceClass = 'bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card-ambient)]';

export const ClassSourceSheet: React.FC<{
    currentSpace: TeacherSpaceOption;
    spaceOptions: TeacherSpaceOption[];
    onClose: () => void;
    onSelectSpace: (spaceId: string) => void;
}> = ({ currentSpace, spaceOptions, onClose, onSelectSpace }) => (
    <MobileBottomSheet open title="切换班级来源" onClose={onClose} contentTone="plain">
        <div className="space-y-[var(--tm-layout-card-gap)] py-[var(--tm-space-3)]">
            {spaceOptions.map(space => {
                const isActive = space.id === currentSpace.id;
                const schoolTypeLabel = getTeacherSchoolTypeLabel(space);
                const sourceTypeLabel = getClassSourceTypeLabel(space);
                const versionLabel = space.type === 'school' ? '学校版' : '个人版';
                return (
                    <button
                        key={space.id}
                        type="button"
                        aria-pressed={isActive}
                        aria-label={`${isActive ? '当前' : '切换至'}${space.title}，${versionLabel}，${sourceTypeLabel}${schoolTypeLabel ? `，${schoolTypeLabel}` : ''}`}
                        onClick={() => {
                            onClose();
                            onSelectSpace(space.id);
                        }}
                        className="flex min-h-[72px] w-full items-center justify-between rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] px-4 py-3 text-left shadow-none [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                    >
                        <span className="flex min-w-0 flex-1 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--tm-text-secondary)]">
                                <ClassSourceIcon type={space.type} className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 flex-1 space-y-1">
                                <span className="block truncate text-[length:var(--tm-font-size-body)] font-medium leading-5 text-[var(--tm-text-primary)]">{space.title}</span>
                                <span className="flex flex-wrap items-center gap-1.5">
                                    <MobileTag tone="brand">{versionLabel}</MobileTag>
                                    {schoolTypeLabel && <MobileTag tone="secondary">{schoolTypeLabel}</MobileTag>}
                                </span>
                            </span>
                        </span>
                        <span className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
                            {isActive && <Check className="h-5 w-5 text-[var(--tm-brand-primary)]" strokeWidth={2.5} />}
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
    onOpenParentEvaluationVisibility,
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
    onOpenReportManagement,
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
            title: '成长币发放',
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
            id: 'parentEvaluationVisibility',
            title: '家长端展示',
            icon: MonitorSmartphone,
            onClick: onOpenParentEvaluationVisibility,
        },
        {
            id: 'reportManagement',
            title: '报告配置',
            icon: FileSliders,
            onClick: onOpenReportManagement,
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
                    <div className="relative z-10 flex w-full items-center gap-4">
                        <button
                            type="button"
                            onClick={onEditTeacherProfile}
                            className="relative shrink-0 overflow-visible rounded-full text-left"
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

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={onEditTeacherProfile}
                                    className="flex min-h-11 max-w-full items-center text-left min-w-0 flex-1"
                                    aria-label="编辑姓名"
                                >
                                    <h2 className="truncate text-[22px] font-extrabold leading-tight tracking-tight text-[var(--tm-text-primary)]">{teacherName}</h2>
                                </button>
                                <button
                                    type="button"
                                    onClick={onOpenSettings}
                                    className={settingsButtonClass}
                                    aria-label="设置"
                                >
                                    <Settings className="h-[22px] w-[22px]" strokeWidth={2.2} />
                                </button>
                            </div>
                            <ClassSourceTrigger
                                name={classSourceName}
                                type={currentSpace.type}
                                onClick={onToggleSpaceSheet}
                                expanded={isSpaceSheetOpen}
                                density="compact"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-[var(--tm-layout-card-gap)] px-5 pt-0">
                {pendingCollectionCount > 0 && (
                    <button
                        type="button"
                        onClick={onOpenAssignedCollections}
                        className={`flex min-h-12 w-full items-center gap-3 rounded-[var(--tm-radius-card-compact)] px-4 text-left ${toolCardSurfaceClass}`}
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><ClipboardList className="h-4 w-4" /></span>
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
