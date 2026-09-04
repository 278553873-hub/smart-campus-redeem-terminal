import React, { useEffect, useMemo, useState } from 'react';
import {
    Check,
    ChevronDown,
    ChevronRight,
    Copy,
    LogIn,
    MessageCircle,
    Plus,
    SlidersHorizontal,
    UsersRound,
    X,
} from 'lucide-react';
import { ClassInfo, Student, TeacherProfile, type SchoolStudentTeam } from '../types';
import {
    UsersIcon,
    ChartIcon,
    WechatMoreIcon,
    GiftIcon,
    AwardIcon,
    ScanFaceIcon,
    ShieldIcon,
    FileTextIcon,
    UserPlusIcon,
} from '../components/Icons';
import ClassInviteFlow, { type ClassInviteAudience } from '../components/class/ClassInviteFlow';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import MobileSlidingSegmentedControl from '../components/ui/MobileSlidingSegmentedControl';
import StudentTeamEditorView, { type StudentTeamEditorMode, type StudentTeamEditorValue } from './student-team/StudentTeamEditorView';
import StudentTeamManagementActions from './student-team/StudentTeamManagementActions';
import { ASSETS } from '../assets/images';
import {
    canManagePersonalClasses,
    canViewClassLeaderboard,
    getTeacherClassActionPolicy,
    getTeacherClassDisplayName,
    getTeacherSchoolGradeOptions,
    type TeacherClassMembership,
    type TeacherSpaceOption,
} from '../domain/teacherSpaceAccess';
import { formatClassCode } from '../domain/classInfo';
import { copyText } from '../utils/copyText';

interface ClassListViewProps {
    classes: ClassInfo[];
    teacherProfile: TeacherProfile;
    currentSpace: TeacherSpaceOption;
    classMembershipById: Record<string, TeacherClassMembership>;
    addDemoTopBreathingSpace?: boolean;
    onCreateClass: () => void;
    onJoinClass: () => void;
    onSelectClass: (classId: string) => void;
    getStudentsForClass: (classId: string) => Student[];
    onRestoreStudentStatus: (student: Student) => void;
    onViewClassReport: (classId: string) => void;
    onViewLeaderboard: () => void;
    onViewRewardVerification: (classId: string) => void;
    onViewMedalIssuance: (classId: string) => void;
    onBatchEditStudents: (classId: string) => void;
    onViewFaceUpdate: (classId: string) => void;
    onViewBankPassword: (classId: string) => void;
    onViewHomeworkEntry: (classId: string) => void;
    onEditClassInfo: (classId: string) => void;
    activeListTab: 'class' | 'team';
    onListTabChange: (tab: 'class' | 'team') => void;
    studentTeams: SchoolStudentTeam[];
    studentTeamEditableClasses: ClassInfo[];
    allStudents: Student[];
    currentTeacherId: string;
    isSchoolManager: boolean;
    canCreateStudentTeam: boolean;
    onCreateStudentTeam: (value: StudentTeamEditorValue) => void;
    onUpdateStudentTeam: (teamId: string, value: StudentTeamEditorValue) => void;
    onArchiveStudentTeam: (teamId: string) => void;
    onSelectStudentTeam: (teamId: string) => void;
}

type ClassActionGroupTone = 'daily' | 'student' | 'collaboration';

interface ClassActionItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
}

interface ClassActionGroup {
    title: string;
    tone: ClassActionGroupTone;
    items: ClassActionItem[];
}

const actionGroupIconClass: Record<ClassActionGroupTone, string> = {
    daily: 'text-[var(--tm-class-action-daily-icon)]',
    student: 'text-[var(--tm-class-action-student-icon)]',
    collaboration: 'text-[var(--tm-class-action-collaboration-icon)]',
};

const actionGroupIconBackgroundClass: Record<ClassActionGroupTone, string> = {
    daily: 'bg-[var(--tm-class-action-daily-bg)]',
    student: 'bg-[var(--tm-class-action-student-bg)]',
    collaboration: 'bg-[var(--tm-class-action-collaboration-bg)]',
};

const ClassListView: React.FC<ClassListViewProps> = ({
    classes,
    teacherProfile,
    currentSpace,
    classMembershipById,
    addDemoTopBreathingSpace = false,
    onCreateClass,
    onJoinClass,
    onSelectClass,
    getStudentsForClass,
    onRestoreStudentStatus,
    onViewClassReport,
    onViewLeaderboard,
    onViewRewardVerification,
    onViewMedalIssuance,
    onBatchEditStudents,
    onViewFaceUpdate,
    onViewBankPassword,
    onViewHomeworkEntry,
    onEditClassInfo,
    activeListTab,
    onListTabChange,
    studentTeams,
    studentTeamEditableClasses,
    allStudents,
    currentTeacherId,
    isSchoolManager,
    canCreateStudentTeam,
    onCreateStudentTeam,
    onUpdateStudentTeam,
    onArchiveStudentTeam,
    onSelectStudentTeam,
}) => {
    const [activeActionClassId, setActiveActionClassId] = useState<string | null>(null);
    const [showTeachingOnly, setShowTeachingOnly] = useState(false);
    const [showGradeFilter, setShowGradeFilter] = useState(false);
    const [showParticipatingTeamsOnly, setShowParticipatingTeamsOnly] = useState(false);
    const [gradeFilter, setGradeFilter] = useState('全部');
    const [leftStudentClassId, setLeftStudentClassId] = useState<string | null>(null);
    const [showClassManagement, setShowClassManagement] = useState(false);
    const [showDisplaySettings, setShowDisplaySettings] = useState(false);
    const [hiddenClassIdsBySpace, setHiddenClassIdsBySpace] = useState<Record<string, string[]>>({});
    const [copyFeedback, setCopyFeedback] = useState<{ classId: string; message: string; success: boolean } | null>(null);
    const [inviteContext, setInviteContext] = useState<{ audience: ClassInviteAudience; classInfo: ClassInfo } | null>(null);
    const [activeActionTeamId, setActiveActionTeamId] = useState<string | null>(null);
    const [teamEditor, setTeamEditor] = useState<{ mode: StudentTeamEditorMode; teamId?: string } | null>(null);
    const [studentTeamInviteId, setStudentTeamInviteId] = useState<string | null>(null);
    const [archiveStudentTeamId, setArchiveStudentTeamId] = useState<string | null>(null);

    const teachingClassIds = useMemo(() => (
        new Set(teacherProfile.teachingAssignments.map(assignment => assignment.classId))
    ), [teacherProfile.teachingAssignments]);
    const homeroomClassIds = useMemo(() => new Set(teacherProfile.homeroomClassIds), [teacherProfile.homeroomClassIds]);
    const deputyHomeroomClassIds = useMemo(() => (
        new Set(teacherProfile.deputyHomeroomClassIds ?? [])
    ), [teacherProfile.deputyHomeroomClassIds]);
    const assignedClassIds = useMemo(() => (
        new Set([...teachingClassIds, ...homeroomClassIds, ...deputyHomeroomClassIds])
    ), [deputyHomeroomClassIds, homeroomClassIds, teachingClassIds]);
    const hiddenClassIds = useMemo(() => new Set(hiddenClassIdsBySpace[currentSpace.id] ?? []), [currentSpace.id, hiddenClassIdsBySpace]);
    const isSchoolSpace = currentSpace.type === 'school';
    const canManagePersonal = canManagePersonalClasses(currentSpace);
    const showLeaderboard = canViewClassLeaderboard(currentSpace);

    const gradeOptions = useMemo(() => (
        ['全部', ...(getTeacherSchoolGradeOptions(currentSpace) ?? Array.from(new Set(classes.map(classInfo => classInfo.gradeLevel))))]
    ), [classes, currentSpace]);

    const visibleClasses = useMemo(() => classes.filter(classInfo => {
        if (!isSchoolSpace && hiddenClassIds.has(classInfo.id)) return false;
        if (isSchoolSpace && gradeFilter !== '全部' && classInfo.gradeLevel !== gradeFilter) return false;
        if (isSchoolSpace && showTeachingOnly && !assignedClassIds.has(classInfo.id)) return false;
        return true;
    }), [assignedClassIds, classes, gradeFilter, hiddenClassIds, isSchoolSpace, showTeachingOnly]);
    const visibleStudentTeams = useMemo(() => studentTeams.filter(team => (
        !showParticipatingTeamsOnly
        || team.ownerId === currentTeacherId
        || team.collaboratorIds.includes(currentTeacherId)
    )), [currentTeacherId, showParticipatingTeamsOnly, studentTeams]);

    const leftStudentClass = useMemo(() => classes.find(classInfo => classInfo.id === leftStudentClassId) || null, [classes, leftStudentClassId]);
    const leftStudents = useMemo(() => (
        leftStudentClassId ? getStudentsForClass(leftStudentClassId).filter(student => student.status === 'left') : []
    ), [getStudentsForClass, leftStudentClassId]);
    const showLeftStudentSheet = leftStudentClassId !== null;
    const activeActionClass = useMemo(() => classes.find(classInfo => classInfo.id === activeActionClassId) || null, [classes, activeActionClassId]);
    const activeActionTeam = useMemo(() => studentTeams.find(team => team.id === activeActionTeamId) || null, [activeActionTeamId, studentTeams]);
    const editingStudentTeam = useMemo(() => studentTeams.find(team => team.id === teamEditor?.teamId), [studentTeams, teamEditor?.teamId]);
    const invitedStudentTeam = useMemo(() => studentTeams.find(team => team.id === studentTeamInviteId), [studentTeamInviteId, studentTeams]);
    const archivedStudentTeam = useMemo(() => studentTeams.find(team => team.id === archiveStudentTeamId), [archiveStudentTeamId, studentTeams]);

    useEffect(() => {
        setActiveActionClassId(null);
        setLeftStudentClassId(null);
        setShowClassManagement(false);
        setShowDisplaySettings(false);
        setShowGradeFilter(false);
        setGradeFilter('全部');
        setShowTeachingOnly(false);
        setShowParticipatingTeamsOnly(false);
        setActiveActionTeamId(null);
        setTeamEditor(null);
        setStudentTeamInviteId(null);
        setArchiveStudentTeamId(null);
    }, [currentSpace.id]);

    useEffect(() => {
        if (!copyFeedback) return;
        const timer = window.setTimeout(() => setCopyFeedback(null), 1600);
        return () => window.clearTimeout(timer);
    }, [copyFeedback]);

    const getMembership = (classId: string): TeacherClassMembership => (
        isSchoolSpace ? 'school' : classMembershipById[classId] ?? 'joined'
    );

    const getActionPolicy = (classId: string) => getTeacherClassActionPolicy({
        space: currentSpace,
        classId,
        membership: getMembership(classId),
        teachingClassIds,
        homeroomClassIds,
        deputyHomeroomClassIds,
    });

    const closeActionSheet = () => setActiveActionClassId(null);
    const closeTeamActionSheet = () => setActiveActionTeamId(null);

    const openTeamEditor = (mode: StudentTeamEditorMode, teamId?: string) => {
        closeTeamActionSheet();
        setTeamEditor({ mode, teamId });
    };

    const openStudentTeamInvite = () => {
        if (!activeActionTeam) return;
        setStudentTeamInviteId(activeActionTeam.id);
        closeTeamActionSheet();
    };

    const openArchiveStudentTeam = () => {
        if (!activeActionTeam) return;
        setArchiveStudentTeamId(activeActionTeam.id);
        closeTeamActionSheet();
    };

    const runClassAction = (action: (classId: string) => void) => {
        if (!activeActionClass) return;
        const classId = activeActionClass.id;
        closeActionSheet();
        action(classId);
    };

    const openInviteFlow = (audience: ClassInviteAudience) => {
        if (!activeActionClass) return;
        setInviteContext({ audience, classInfo: activeActionClass });
        closeActionSheet();
    };

    const activeActionPolicy = activeActionClass ? getActionPolicy(activeActionClass.id) : null;
    const actionGroups: ClassActionGroup[] = activeActionClass && activeActionPolicy ? ([
        activeActionPolicy.canUseDailyActions ? {
            title: '日常操作',
            tone: 'daily',
            items: [
                ...(activeActionPolicy.canManuallyEnterHomework ? [{
                    label: '作业录入',
                    icon: FileTextIcon,
                    onClick: () => runClassAction(onViewHomeworkEntry),
                }] : []),
                {
                    label: '兑换奖励',
                    icon: GiftIcon,
                    onClick: () => runClassAction(onViewRewardVerification),
                },
                {
                    label: '颁发奖章',
                    icon: AwardIcon,
                    onClick: () => runClassAction(onViewMedalIssuance),
                },
            ],
        } : null,
        activeActionPolicy.canUpdateStudents || activeActionPolicy.canMaintainClass ? {
            title: '学生管理',
            tone: 'student',
            items: [
                ...(activeActionPolicy.canUpdateStudents ? [{
                    label: '批量修改',
                    icon: UsersIcon,
                    onClick: () => runClassAction(onBatchEditStudents),
                },
                {
                    label: '更新人脸',
                    icon: ScanFaceIcon,
                    onClick: () => runClassAction(onViewFaceUpdate),
                },
                {
                    label: '兑换密码',
                    icon: ShieldIcon,
                    onClick: () => runClassAction(onViewBankPassword),
                },
                ] : []),
                ...(activeActionPolicy.canMaintainClass ? [
                    {
                        label: '离校管理',
                        icon: UsersIcon,
                        onClick: () => runClassAction(setLeftStudentClassId),
                    },
                ] : []),
            ],
        } : null,
        activeActionPolicy.canInviteTeacher || activeActionPolicy.canInviteParent ? {
            title: '协同管理',
            tone: 'collaboration',
            items: [
                ...(activeActionPolicy.canInviteTeacher ? [{
                    label: '邀请老师',
                    icon: UserPlusIcon,
                    onClick: () => openInviteFlow('teacher'),
                }] : []),
                ...(activeActionPolicy.canInviteParent ? [{
                    label: '邀请家长',
                    icon: MessageCircle,
                    onClick: () => openInviteFlow('parent'),
                }] : []),
            ],
        } : null,
    ] as Array<ClassActionGroup | null>).filter((group): group is ClassActionGroup => group !== null) : [];

    const copyClassCode = async (classInfo: ClassInfo) => {
        const success = await copyText(classInfo.classCode);
        if (success) {
            setCopyFeedback({ classId: classInfo.id, message: '班级号已复制', success: true });
            return;
        }
        setCopyFeedback({ classId: classInfo.id, message: '复制失败，请重试', success: false });
    };

    const toggleClassVisibility = (classId: string) => {
        setHiddenClassIdsBySpace(current => {
            const hiddenIds = new Set(current[currentSpace.id] ?? []);
            if (hiddenIds.has(classId)) hiddenIds.delete(classId);
            else hiddenIds.add(classId);
            return { ...current, [currentSpace.id]: Array.from(hiddenIds) };
        });
    };

    const renderClassCard = (classInfo: ClassInfo) => {
        const displayClassName = getTeacherClassDisplayName(classInfo, currentSpace);
        const isHeadTeacher = homeroomClassIds.has(classInfo.id);
        const isDeputyHeadTeacher = deputyHomeroomClassIds.has(classInfo.id);
        const classRole = isHeadTeacher ? '班主任' : isDeputyHeadTeacher ? '副班主任' : null;
        const subjectTags = Array.from(new Set(
            teacherProfile.teachingAssignments
                .filter(assignment => assignment.classId === classInfo.id)
                .map(assignment => assignment.subject)
        ));
        const hasRelationshipTags = Boolean(classRole) || subjectTags.length > 0;

        return (
            <article key={classInfo.id} className={`relative flex ${hasRelationshipTags ? 'min-h-[var(--tm-class-list-card-min-height)]' : 'min-h-[var(--tm-class-list-card-compact-min-height)]'} flex-col rounded-[var(--tm-class-list-card-radius)] bg-white px-4 pb-1 pt-3 [box-shadow:var(--tm-shadow-card)]`}>
                <div className="relative min-w-0 flex-1 pr-10">
                    <h3 className="min-w-0 truncate text-lg font-[550] text-[var(--tm-text-primary)]">{displayClassName}</h3>
                    {hasRelationshipTags && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {classRole && (
                                <span className="min-h-5 whitespace-nowrap rounded-md bg-[var(--tm-brand-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--tm-brand-primary)]">
                                    {classRole}
                                </span>
                            )}
                            {subjectTags.map(tag => (
                                <span key={tag} className="min-h-5 whitespace-nowrap rounded-md bg-[var(--tm-brand-secondary-soft)] px-2 py-0.5 text-[11px] tm-font-regular text-[var(--tm-brand-secondary)]">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="mt-1.5 flex min-h-5 items-center text-[13px] font-[450] text-[var(--tm-text-secondary)]">
                        <span>{classInfo.gradeLevel}</span>
                        <span className="mx-1.5 text-[var(--tm-text-disabled)]" aria-hidden="true">·</span>
                        <span>{classInfo.studentCount}人</span>
                    </div>
                    <button
                        type="button"
                        aria-label={`${displayClassName}更多操作`}
                        onClick={() => setActiveActionClassId(classInfo.id)}
                        className="absolute -right-2 -top-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-disabled)] transition-colors active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-secondary)]"
                    >
                        <WechatMoreIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-2 pt-1">
                    <div className="h-[var(--tm-class-list-divider-thickness)] bg-[var(--tm-class-list-divider)]" aria-hidden="true" />
                    <div className="relative grid h-[var(--tm-class-list-card-action-content-height)] grid-cols-2 items-center">
                        <button
                            type="button"
                            onClick={() => onSelectClass(classInfo.id)}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] px-1 text-sm font-medium text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                        >
                            <UsersIcon className="h-[var(--tm-class-list-action-icon-size)] w-[var(--tm-class-list-action-icon-size)] text-[var(--tm-brand-primary)] [stroke-width:2.2]" aria-hidden="true" />
                            学生列表
                        </button>
                        <button
                            type="button"
                            onClick={() => onViewClassReport(classInfo.id)}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] px-1 text-sm font-medium text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                        >
                            <ChartIcon className="h-[var(--tm-class-list-action-icon-size)] w-[var(--tm-class-list-action-icon-size)] text-[var(--tm-brand-primary)] [stroke-width:2.2]" aria-hidden="true" />
                            班级报告
                        </button>
                        <span className="pointer-events-none absolute left-1/2 top-1/2 h-[var(--tm-class-list-divider-vertical-height)] w-[var(--tm-class-list-divider-thickness)] -translate-x-1/2 -translate-y-1/2 bg-[var(--tm-class-list-divider)]" aria-hidden="true" />
                    </div>
                </div>
            </article>
        );
    };

    const renderStudentTeamCard = (team: SchoolStudentTeam) => (
        <article key={team.id} className="flex min-h-[92px] items-center rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-2 py-3 [box-shadow:var(--tm-shadow-card)]">
            <button
                type="button"
                onClick={() => onSelectStudentTeam(team.id)}
                className="flex min-h-[68px] min-w-0 flex-1 items-center gap-3 rounded-[var(--tm-radius-inner)] px-2 text-left transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                aria-label={`${team.name}，${team.ownerName}负责，${team.memberIds.length}人`}
            >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-secondary-soft)] text-[var(--tm-brand-secondary-strong)]">
                    <UsersRound className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">{team.name}</span>
                    <span className="mt-1 block truncate text-[13px] text-[var(--tm-text-secondary)]">{team.ownerName}负责 · {team.memberIds.length}人</span>
                </span>
            </button>
            {team.ownerId === currentTeacherId && (
                <button type="button" aria-label={`${team.name}更多操作`} onClick={() => setActiveActionTeamId(team.id)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-disabled)] transition-colors active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-secondary)]">
                    <WechatMoreIcon className="h-5 w-5" />
                </button>
            )}
        </article>
    );

    return (
        <div className="relative h-full overflow-hidden">
            {copyFeedback && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`pointer-events-none absolute left-1/2 top-20 z-[80] -translate-x-1/2 whitespace-nowrap rounded-[var(--tm-radius-control)] px-4 py-2 text-[13px] font-semibold text-white [box-shadow:var(--tm-shadow-card-raised)] ${copyFeedback.success ? 'bg-[var(--tm-text-primary)]' : 'bg-[var(--tm-status-negative)]'}`}
                >
                    {copyFeedback.message}
                </div>
            )}
            <div className={`relative z-10 h-full ${isSchoolSpace && activeListTab === 'class' ? 'space-y-[var(--tm-class-list-toolbar-card-gap)]' : 'space-y-3'} overflow-y-auto px-4 pb-[calc(var(--teacher-tabbar-height,66px)+var(--teacher-tabbar-bottom,16px)+var(--tm-space-3))] no-scrollbar ${addDemoTopBreathingSpace ? 'pt-5' : 'pt-0'}`}>
                <section className="space-y-0 px-1">
                    <div className="flex h-[var(--mini-program-title-bar-height,44px)] items-center [padding-right:var(--mini-program-capsule-right-inset,0px)]">
                        {isSchoolSpace ? (
                            <MobileSlidingSegmentedControl
                                value={activeListTab}
                                items={[
                                    {
                                        value: 'class',
                                        label: '班级',
                                        indicatorClassName: 'bg-[var(--tm-record-student-soft)]',
                                        activeTextClassName: 'text-[var(--tm-record-student-text)]',
                                    },
                                    {
                                        value: 'team',
                                        label: '社团与团队',
                                        indicatorClassName: 'bg-[var(--tm-record-class-soft)]',
                                        activeTextClassName: 'text-[var(--tm-record-class-text)]',
                                    },
                                ]}
                                onChange={onListTabChange}
                                ariaLabel="班级内容分类"
                                className="w-[192px]"
                            />
                        ) : (
                            <h1 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">班级</h1>
                        )}
                    </div>

                    {activeListTab === 'class' && canManagePersonal && classes.length > 0 && (
                        <div className="flex min-h-11 items-center justify-between gap-3">
                            <span className="text-[13px] font-medium text-[var(--tm-text-tertiary)]">
                                {hiddenClassIds.size > 0
                                    ? `显示${visibleClasses.length}/${classes.length}个班级`
                                    : `共${classes.length}个班级`}
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowClassManagement(true)}
                                className="-mr-2 inline-flex min-h-11 items-center gap-1.5 rounded-[var(--tm-radius-control)] px-2 text-[13px] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                班级管理
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}

                    {activeListTab === 'class' && isSchoolSpace && (
                        <div className="space-y-0">
                            <div className="flex min-h-11 items-center justify-between gap-2 max-[359px]:flex-wrap">
                                <div className="flex min-w-0 items-center gap-1">
                                    <button
                                        type="button"
                                        aria-label="按年级筛选班级"
                                        aria-haspopup="dialog"
                                        aria-expanded={showGradeFilter}
                                        onClick={() => setShowGradeFilter(true)}
                                        className="inline-flex min-h-11 w-[96px] shrink-0 items-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-control)] px-3 text-[13px] font-medium text-[var(--tm-text-secondary)] transition-[background-color,color,transform] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] focus-visible:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                                    >
                                        <span>{gradeFilter === '全部' ? '全部年级' : gradeFilter}</span>
                                        <ChevronDown className="h-4 w-4 text-[var(--tm-text-tertiary)]" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-pressed={showTeachingOnly}
                                        onClick={() => setShowTeachingOnly(current => !current)}
                                        className={`flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--tm-radius-control)] bg-transparent px-2 text-[13px] font-medium transition-[background-color,color,transform] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] focus-visible:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] ${showTeachingOnly ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-text-secondary)]'}`}
                                    >
                                        <span className={`flex h-4 w-4 items-center justify-center rounded-[5px] ${showTeachingOnly ? 'bg-[var(--tm-brand-primary)] text-white' : 'border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`} aria-hidden="true">
                                            {showTeachingOnly && <Check className="h-3 w-3" strokeWidth={3} />}
                                        </span>
                                        任教班级
                                    </button>
                                </div>
                            {showLeaderboard && (
                                <button
                                    type="button"
                                    aria-label="查看班级排行榜"
                                    onClick={onViewLeaderboard}
                                    className="inline-flex min-h-11 shrink-0 items-center justify-self-end gap-1 rounded-[var(--tm-radius-control)] px-2 text-[13px] font-medium text-[var(--tm-brand-primary)] transition-[background-color,color,transform] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] active:bg-[var(--tm-brand-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2"
                                >
                                    班级排行榜
                                    <span aria-hidden="true" className="ml-px inline-flex h-4 w-4 items-center justify-center text-[16px] leading-none">›</span>
                                </button>
                            )}
                            </div>
                            <span
                                className="block h-[18px] whitespace-nowrap pl-3 text-[12px] font-medium leading-[18px] tabular-nums text-[var(--tm-text-secondary)]"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {visibleClasses.length}个班级
                            </span>
                        </div>
                    )}

                    {activeListTab === 'team' && (
                        <div className="grid min-h-11 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                            {isSchoolManager ? (
                                <button
                                    type="button"
                                    aria-pressed={showParticipatingTeamsOnly}
                                    onClick={() => setShowParticipatingTeamsOnly(current => !current)}
                                    className={`flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-[var(--tm-radius-control)] bg-transparent px-2.5 text-[13px] font-medium transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)] focus-visible:bg-[var(--tm-bg-surface-soft)] ${showParticipatingTeamsOnly ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-text-secondary)]'}`}
                                >
                                    <span className={`flex h-4 w-4 items-center justify-center rounded-[5px] ${showParticipatingTeamsOnly ? 'bg-[var(--tm-brand-primary)] text-white' : 'border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`} aria-hidden="true">
                                        {showParticipatingTeamsOnly && <Check className="h-3 w-3" strokeWidth={3} />}
                                    </span>
                                    我参与的
                                </button>
                            ) : <span />}
                            <span className="justify-self-end whitespace-nowrap text-[12px] font-medium text-[var(--tm-text-tertiary)]" aria-live="polite" aria-atomic="true">
                                {visibleStudentTeams.length}个社团或团队
                            </span>
                            {canCreateStudentTeam && (
                                <button
                                    type="button"
                                    onClick={() => openTeamEditor('create')}
                                    className="-mr-2 inline-flex min-h-11 items-center gap-1.5 rounded-[var(--tm-radius-control)] px-2 text-[13px] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]"
                                >
                                    <Plus className="h-4 w-4" />
                                    新建
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {activeListTab === 'class' && (
                    <div className="space-y-[var(--tm-space-3)]">
                        {visibleClasses.map(renderClassCard)}
                    </div>
                )}

                {activeListTab === 'team' && visibleStudentTeams.map(renderStudentTeamCard)}

                {activeListTab === 'class' && (
                    <>
                        {visibleClasses.length === 0 && (
                            <section className="px-2 py-6 text-center">
                                <MobileEmptyState
                                    imageSrc={ASSETS.DEFAULT_STATE.CHAIR}
                                    title={isSchoolSpace ? '没有符合条件的班级' : classes.length === 0 ? '暂无班级' : '暂无显示班级'}
                                    imageClassName="w-[72%] min-w-[188px] max-w-[236px]"
                                />
                                {isSchoolSpace ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGradeFilter('全部');
                                            setShowTeachingOnly(false);
                                        }}
                                        className="mt-3 min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] px-4 text-sm font-semibold text-[var(--tm-brand-primary)]"
                                    >
                                        清除筛选
                                    </button>
                                ) : classes.length === 0 ? (
                                    <div className="mt-3 grid gap-1.5">
                                        <button type="button" onClick={onCreateClass} className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] px-3 text-sm font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft-strong)]">
                                            <Plus className="h-4 w-4" aria-hidden="true" />
                                            创建班级
                                        </button>
                                        <button type="button" onClick={onJoinClass} className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] px-3 text-sm font-semibold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
                                            <LogIn className="h-4 w-4" aria-hidden="true" />
                                            加入已有班级
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => setShowDisplaySettings(true)} className="mt-3 min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] px-4 text-sm font-semibold text-[var(--tm-brand-primary)]">调整显示</button>
                                )}
                            </section>
                        )}
                    </>
                )}

                {activeListTab === 'team' && visibleStudentTeams.length === 0 && (
                    <section className="px-2 py-6 text-center">
                        <MobileEmptyState
                            imageSrc={ASSETS.DEFAULT_STATE.CHAIR}
                            title={showParticipatingTeamsOnly ? '还没有参与社团或团队' : '暂无社团或团队'}
                            imageClassName="w-[72%] min-w-[188px] max-w-[236px]"
                        />
                        {showParticipatingTeamsOnly && (
                            <button type="button" onClick={() => setShowParticipatingTeamsOnly(false)} className="mt-3 min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] px-4 text-sm font-semibold text-[var(--tm-brand-primary)]">
                                查看全部
                            </button>
                        )}
                    </section>
                )}
            </div>

            <MobileBottomSheet open={showGradeFilter} title="选择年级" onClose={() => setShowGradeFilter(false)} contentInset="none">
                <div className="space-y-1 px-4 pb-[var(--tm-space-4)]">
                    {gradeOptions.map(option => {
                        const selected = gradeFilter === option;
                        return (
                            <button
                                key={option}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => {
                                    setGradeFilter(option);
                                    setShowGradeFilter(false);
                                }}
                                className={`flex min-h-11 w-full items-center rounded-[var(--tm-radius-control)] px-3 text-left text-[13px] font-medium transition-[background-color,color,transform] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] ${selected ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]' : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
                            >
                                {option === '全部' ? '全部年级' : option}
                            </button>
                        );
                    })}
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet open={Boolean(activeActionTeam)} title="更多操作" onClose={closeTeamActionSheet}>
                {activeActionTeam && (
                    <StudentTeamManagementActions
                        onEditMembers={() => openTeamEditor('members', activeActionTeam.id)}
                        onEditSettings={() => openTeamEditor('settings', activeActionTeam.id)}
                        onInvite={openStudentTeamInvite}
                        onArchive={openArchiveStudentTeam}
                    />
                )}
            </MobileBottomSheet>

            <StudentTeamEditorView
                open={Boolean(teamEditor)}
                mode={teamEditor?.mode ?? 'create'}
                team={editingStudentTeam}
                classes={studentTeamEditableClasses}
                allStudents={allStudents}
                getStudentsForClass={getStudentsForClass}
                getClassLabel={classInfo => getTeacherClassDisplayName(classInfo, currentSpace)}
                onClose={() => setTeamEditor(null)}
                onSave={value => {
                    if (teamEditor?.teamId) onUpdateStudentTeam(teamEditor.teamId, value);
                    else onCreateStudentTeam(value);
                    setTeamEditor(null);
                }}
            />

            {invitedStudentTeam && (
                <ClassInviteFlow open audience="teacher" studentTeam={{ id: invitedStudentTeam.id, name: invitedStudentTeam.name }} inviterName={teacherProfile.name} schoolName={currentSpace.title} onClose={() => setStudentTeamInviteId(null)} />
            )}

            <MobileConfirmSheet
                open={Boolean(archivedStudentTeam)}
                title={archivedStudentTeam ? `解散${archivedStudentTeam.name}` : '解散社团或团队'}
                description="解散后不再显示该团队，已有学生评价记录不受影响。"
                confirmLabel="确认解散"
                tone="danger"
                onClose={() => setArchiveStudentTeamId(null)}
                onConfirm={() => {
                    if (archiveStudentTeamId) onArchiveStudentTeam(archiveStudentTeamId);
                    setArchiveStudentTeamId(null);
                }}
            />

            <MobileBottomSheet open={canManagePersonal && showClassManagement} title="班级管理" onClose={() => setShowClassManagement(false)}>
                <div className="space-y-[var(--tm-space-2)]">
                    {[
                        { label: '创建班级', icon: Plus, onClick: onCreateClass },
                        { label: '加入班级', icon: LogIn, onClick: onJoinClass },
                        { label: '显示设置', icon: SlidersHorizontal, onClick: () => setShowDisplaySettings(true) },
                    ].map(item => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => {
                                    setShowClassManagement(false);
                                    item.onClick();
                                }}
                                className="flex min-h-[56px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-3)] text-left active:bg-[var(--tm-bg-surface-muted)]"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]"><Icon className="h-[18px] w-[18px]" /></span>
                                <span className="flex-1 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{item.label}</span>
                                <ChevronRight className="h-4 w-4 text-[var(--tm-text-disabled)]" />
                            </button>
                        );
                    })}
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet open={showDisplaySettings} title="显示班级" onClose={() => setShowDisplaySettings(false)}>
                <div className="space-y-[var(--tm-space-2)]">
                    {classes.map(classInfo => {
                        const visible = !hiddenClassIds.has(classInfo.id);
                        return (
                            <button
                                key={classInfo.id}
                                type="button"
                                onClick={() => toggleClassVisibility(classInfo.id)}
                                className="flex min-h-[56px] w-full items-center justify-between gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-left active:bg-[var(--tm-bg-surface-muted)]"
                                aria-pressed={visible}
                            >
                                <span className="min-w-0 truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{getTeacherClassDisplayName(classInfo, currentSpace)}</span>
                                <span className={`flex h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${visible ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-muted)] ring-1 ring-inset ring-[var(--tm-border-subtle)]'}`}>
                                    <span className={`h-5 w-5 rounded-full bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-control)] transition-transform ${visible ? 'translate-x-5' : 'translate-x-0'}`} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet
                open={Boolean(activeActionClass && actionGroups.length > 0)}
                title="班级更多操作"
                onClose={closeActionSheet}
                showHandle={false}
                header={activeActionClass ? (
                    <header className="shrink-0 px-[var(--tm-space-4)] pb-[var(--tm-class-action-header-bottom-space)] pt-[var(--tm-space-5)]">
                        <div>
                            <div className="flex items-center gap-[var(--tm-space-2)]">
                                <button
                                    type="button"
                                    onClick={() => runClassAction(onEditClassInfo)}
                                    className="flex min-h-[var(--tm-size-touch)] min-w-0 flex-1 items-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-control)] text-left active:bg-[var(--tm-bg-surface-soft)]"
                                    aria-label={`查看${getTeacherClassDisplayName(activeActionClass, currentSpace)}班级详情`}
                                >
                                    <span className="flex min-w-0 items-baseline gap-[var(--tm-space-2)]">
                                        <span className="min-w-0 truncate text-[length:var(--tm-font-size-group-title)] font-semibold text-[var(--tm-text-primary)]">{getTeacherClassDisplayName(activeActionClass, currentSpace)}</span>
                                        <span className="flex shrink-0 items-center gap-[var(--tm-space-1)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">
                                            详情
                                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={closeActionSheet}
                                    className="-mr-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]"
                                    aria-label="关闭班级更多操作"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => copyClassCode(activeActionClass)}
                                className="inline-flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)] active:text-[var(--tm-brand-primary)]"
                                aria-label={`复制${getTeacherClassDisplayName(activeActionClass, currentSpace)}班级号${activeActionClass.classCode}`}
                            >
                                <span>班级号</span>
                                <span className="tabular-nums text-[var(--tm-text-primary)]">{formatClassCode(activeActionClass.classCode)}</span>
                                {copyFeedback?.classId === activeActionClass.id && copyFeedback.success
                                    ? <Check className="h-4 w-4 text-[var(--tm-status-positive)]" />
                                    : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                    </header>
                ) : undefined}
            >
                {activeActionClass && (
                    <div className="space-y-[var(--tm-class-action-group-gap)]">
                        {actionGroups.map(group => (
                            <section key={group.title}>
                                <h4 className="mb-[var(--tm-class-action-title-grid-gap)] px-[var(--tm-space-1)] text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-tertiary)]">{group.title}</h4>
                                <div className="grid grid-cols-4 gap-x-[var(--tm-space-3)] gap-y-[var(--tm-space-3)]">
                                    {group.items.map(item => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.label}
                                                type="button"
                                                onClick={item.onClick}
                                                className="group flex min-h-[var(--tm-action-grid-item-height)] min-w-0 flex-col items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] px-1 text-center transition-colors active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none"
                                            >
                                                <span className={`flex h-[var(--tm-action-grid-icon-bg-size)] w-[var(--tm-action-grid-icon-bg-size)] shrink-0 items-center justify-center rounded-[var(--tm-action-grid-icon-radius)] ${actionGroupIconBackgroundClass[group.tone]}`}>
                                                    <Icon className={`h-[var(--tm-action-grid-icon-size)] w-[var(--tm-action-grid-icon-size)] ${actionGroupIconClass[group.tone]}`} />
                                                </span>
                                                <span className="h-[var(--tm-action-grid-label-height)] max-w-full truncate whitespace-nowrap text-[length:var(--tm-font-size-meta)] font-medium leading-[18px] text-[var(--tm-text-primary)]">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </MobileBottomSheet>

            <MobileBottomSheet open={showLeftStudentSheet} title="离校学生" onClose={() => setLeftStudentClassId(null)}>
                <div className="space-y-[var(--tm-space-3)]">
                    {leftStudents.length === 0 && (
                        <div className="rounded-[var(--tm-radius-card)] border border-dashed border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-8)] text-center text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)]">
                            暂无离校学生
                        </div>
                    )}
                    {leftStudents.map(student => (
                        <div key={student.id} className="flex items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-3)]">
                            <img src={student.avatar} alt={`${student.name}头像`} className="h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 rounded-full bg-[var(--tm-bg-surface)] object-cover" />
                            <div className="min-w-0 flex-1">
                                <div className="text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{student.name}</div>
                                <div className="mt-[var(--tm-space-1)] truncate text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">{student.studentNo || student.id} · {leftStudentClass ? getTeacherClassDisplayName(leftStudentClass, currentSpace) : student.class}</div>
                            </div>
                            <button type="button" onClick={() => onRestoreStudentStatus(student)} className="min-h-[var(--tm-size-touch)] shrink-0 rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-status-positive-strong)] active:scale-95">
                                恢复
                            </button>
                        </div>
                    ))}
                </div>
            </MobileBottomSheet>

            {inviteContext && (
                <ClassInviteFlow
                    open
                    audience={inviteContext.audience}
                    classInfo={inviteContext.classInfo}
                    inviterName={teacherProfile.name}
                    schoolName={currentSpace.title}
                    getClassLabel={classInfoItem => getTeacherClassDisplayName(classInfoItem, currentSpace)}
                    onClose={() => setInviteContext(null)}
                />
            )}
        </div>
    );
};

export default ClassListView;
