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
} from 'lucide-react';
import { ClassInfo, Student, TeacherProfile } from '../types';
import {
    UsersIcon,
    ChartIcon,
    WechatMoreIcon,
    TrophyIcon,
    GiftIcon,
    ScanFaceIcon,
    ShieldIcon,
    FileTextIcon,
    CloseIcon,
    EditIcon,
    UserPlusIcon,
} from '../components/Icons';
import ClassSourceTrigger from '../components/ClassSourceTrigger';
import {
    canManagePersonalClasses,
    canViewClassLeaderboard,
    getTeacherClassActionPolicy,
    type TeacherClassMembership,
    type TeacherSpaceOption,
} from '../domain/teacherSpaceAccess';

interface ClassListViewProps {
    classes: ClassInfo[];
    teacherProfile: TeacherProfile;
    currentSpace: TeacherSpaceOption;
    classMembershipById: Record<string, TeacherClassMembership>;
    addDemoTopBreathingSpace?: boolean;
    showClassSourceSwitcher: boolean;
    isSpaceSheetOpen: boolean;
    onOpenClassSourceSwitcher: () => void;
    onCreateClass: () => void;
    onJoinClass: () => void;
    onSelectClass: (classId: string) => void;
    getStudentsForClass: (classId: string) => Student[];
    onRestoreStudentStatus: (student: Student) => void;
    onViewClassReport: (classId: string) => void;
    onViewLeaderboard: () => void;
    onViewRewardVerification: (classId: string) => void;
    onViewFaceUpdate: (classId: string) => void;
    onViewBankPassword: (classId: string) => void;
    onViewHomeworkEntry: (classId: string) => void;
    onInviteTeacher: (classId: string) => void;
    onInviteParent: (classId: string) => void;
    onEditClassInfo: (classId: string) => void;
}

type ClassActionTone = 'brand' | 'secondary' | 'reward' | 'positive' | 'neutral';

interface ClassActionItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: ClassActionTone;
    onClick: () => void;
}

interface ClassActionGroup {
    title: string;
    items: ClassActionItem[];
}

const actionToneClass: Record<ClassActionTone, string> = {
    brand: 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]',
    secondary: 'bg-[var(--tm-brand-secondary-soft)] text-[var(--tm-brand-secondary-strong)]',
    reward: 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]',
    positive: 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive)]',
    neutral: 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]',
};

const formatClassCode = (classCode: string) => classCode.replace(/(\d{4})(?=\d)/, '$1 ');

const ClassListView: React.FC<ClassListViewProps> = ({
    classes,
    teacherProfile,
    currentSpace,
    classMembershipById,
    addDemoTopBreathingSpace = false,
    showClassSourceSwitcher,
    isSpaceSheetOpen,
    onOpenClassSourceSwitcher,
    onCreateClass,
    onJoinClass,
    onSelectClass,
    getStudentsForClass,
    onRestoreStudentStatus,
    onViewClassReport,
    onViewLeaderboard,
    onViewRewardVerification,
    onViewFaceUpdate,
    onViewBankPassword,
    onViewHomeworkEntry,
    onInviteTeacher,
    onInviteParent,
    onEditClassInfo,
}) => {
    const [activeActionClassId, setActiveActionClassId] = useState<string | null>(null);
    const [showTeachingOnly, setShowTeachingOnly] = useState(false);
    const [gradeFilter, setGradeFilter] = useState('全部');
    const [leftStudentClassId, setLeftStudentClassId] = useState<string | null>(null);
    const [showPersonalClassActions, setShowPersonalClassActions] = useState(false);
    const [showDisplaySettings, setShowDisplaySettings] = useState(false);
    const [hiddenClassIdsBySpace, setHiddenClassIdsBySpace] = useState<Record<string, string[]>>({});
    const [copyFeedback, setCopyFeedback] = useState<{ classId: string; message: string; success: boolean } | null>(null);

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
        ['全部', ...Array.from(new Set(classes.map(classInfo => classInfo.gradeLevel)))]
    ), [classes]);

    const visibleClasses = useMemo(() => classes.filter(classInfo => {
        if (!isSchoolSpace && hiddenClassIds.has(classInfo.id)) return false;
        if (isSchoolSpace && gradeFilter !== '全部' && classInfo.gradeLevel !== gradeFilter) return false;
        if (isSchoolSpace && showTeachingOnly && !assignedClassIds.has(classInfo.id)) return false;
        return true;
    }), [assignedClassIds, classes, gradeFilter, hiddenClassIds, isSchoolSpace, showTeachingOnly]);

    const leftStudentClass = useMemo(() => classes.find(classInfo => classInfo.id === leftStudentClassId) || null, [classes, leftStudentClassId]);
    const leftStudents = useMemo(() => (
        leftStudentClassId ? getStudentsForClass(leftStudentClassId).filter(student => student.status === 'left') : []
    ), [getStudentsForClass, leftStudentClassId]);
    const showLeftStudentSheet = leftStudentClassId !== null;
    const activeActionClass = useMemo(() => classes.find(classInfo => classInfo.id === activeActionClassId) || null, [classes, activeActionClassId]);

    useEffect(() => {
        setActiveActionClassId(null);
        setLeftStudentClassId(null);
        setShowPersonalClassActions(false);
        setShowDisplaySettings(false);
        setGradeFilter('全部');
        setShowTeachingOnly(false);
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
    });

    const closeActionSheet = () => setActiveActionClassId(null);

    const runClassAction = (action: (classId: string) => void) => {
        if (!activeActionClass) return;
        const classId = activeActionClass.id;
        closeActionSheet();
        action(classId);
    };

    const activeActionPolicy = activeActionClass ? getActionPolicy(activeActionClass.id) : null;
    const actionGroups: ClassActionGroup[] = activeActionClass && activeActionPolicy ? [
        activeActionPolicy.canUseDailyActions ? {
            title: '日常操作',
            items: [
                {
                    label: '兑换奖励',
                    icon: GiftIcon,
                    tone: 'reward',
                    onClick: () => runClassAction(onViewRewardVerification),
                },
                {
                    label: '作业录入',
                    icon: FileTextIcon,
                    tone: 'brand',
                    onClick: () => runClassAction(onViewHomeworkEntry),
                },
            ],
        } : null,
        activeActionPolicy.canUpdateStudents ? {
            title: '学生信息更新',
            items: [
                {
                    label: '批量修改学生',
                    icon: UsersIcon,
                    tone: 'neutral',
                    onClick: () => runClassAction(onSelectClass),
                },
                {
                    label: '设置兑换密码',
                    icon: ShieldIcon,
                    tone: 'secondary',
                    onClick: () => runClassAction(onViewBankPassword),
                },
                {
                    label: '更新人脸数据',
                    icon: ScanFaceIcon,
                    tone: 'positive',
                    onClick: () => runClassAction(onViewFaceUpdate),
                },
            ],
        } : null,
        activeActionPolicy.canMaintainClass ? {
            title: '班级维护',
            items: [
                {
                    label: '离校学生',
                    icon: UsersIcon,
                    tone: 'neutral',
                    onClick: () => runClassAction(setLeftStudentClassId),
                },
                {
                    label: '编辑班级信息',
                    icon: EditIcon,
                    tone: 'brand',
                    onClick: () => runClassAction(onEditClassInfo),
                },
            ],
        } : null,
        activeActionPolicy.canInviteTeacher || activeActionPolicy.canInviteParent ? {
            title: '协同管理',
            items: [
                ...(activeActionPolicy.canInviteTeacher ? [{
                    label: '邀请老师加入',
                    icon: UserPlusIcon,
                    tone: 'secondary' as const,
                    onClick: () => runClassAction(onInviteTeacher),
                }] : []),
                ...(activeActionPolicy.canInviteParent ? [{
                    label: '邀请家长加入',
                    icon: MessageCircle,
                    tone: 'brand' as const,
                    onClick: () => runClassAction(onInviteParent),
                }] : []),
            ],
        } : null,
    ].filter((group): group is ClassActionGroup => Boolean(group)) : [];

    const copyClassCode = async (classInfo: ClassInfo) => {
        try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
            await navigator.clipboard.writeText(classInfo.classCode);
            setCopyFeedback({ classId: classInfo.id, message: '班级号已复制', success: true });
        } catch {
            setCopyFeedback({ classId: classInfo.id, message: '复制失败，请重试', success: false });
        }
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
        const isHeadTeacher = homeroomClassIds.has(classInfo.id);
        const isDeputyHeadTeacher = deputyHomeroomClassIds.has(classInfo.id);
        const classRole = isHeadTeacher ? '班主任' : isDeputyHeadTeacher ? '副班主任' : null;
        const subjectTags = Array.from(new Set(
            teacherProfile.teachingAssignments
                .filter(assignment => assignment.classId === classInfo.id)
                .map(assignment => assignment.subject)
        ));
        const hasRelationshipTags = Boolean(classRole) || subjectTags.length > 0;
        const classActionPolicy = getActionPolicy(classInfo.id);
        const hasMoreActions = Object.values(classActionPolicy).some(Boolean);

        return (
            <article key={classInfo.id} className="relative rounded-[var(--tm-radius-card)] bg-white px-4 py-3 shadow-[var(--tm-shadow-card)]">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold text-[var(--tm-text-primary)]">{classInfo.name}</h3>
                        {hasRelationshipTags && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {classRole && (
                                    <span className="whitespace-nowrap rounded-lg bg-[var(--tm-brand-secondary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--tm-brand-secondary-strong)]">
                                        {classRole}
                                    </span>
                                )}
                                {subjectTags.map(tag => (
                                    <span key={tag} className="whitespace-nowrap rounded-lg bg-[var(--tm-bg-surface-muted)] px-2 py-0.5 text-xs font-normal text-[var(--tm-text-secondary)]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    {hasMoreActions && (
                        <button
                            type="button"
                            aria-label={`${classInfo.name}更多操作`}
                            onClick={() => setActiveActionClassId(classInfo.id)}
                            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-disabled)] transition-colors active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-secondary)]"
                        >
                            <WechatMoreIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>

                <div className="mt-1 flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13px] text-[var(--tm-text-secondary)]">
                    <span>{classInfo.gradeLevel} · {classInfo.studentCount}人</span>
                    <button
                        type="button"
                        onClick={() => copyClassCode(classInfo)}
                        className="-mr-2 inline-flex min-h-11 items-center gap-1.5 rounded-[var(--tm-radius-control)] px-2 text-[13px] font-normal text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-brand-primary)]"
                        aria-label={`复制${classInfo.name}班级号${classInfo.classCode}`}
                    >
                        <span>班级号</span>
                        <span className="font-semibold tabular-nums text-[var(--tm-text-primary)]">{formatClassCode(classInfo.classCode)}</span>
                        {copyFeedback?.classId === classInfo.id && copyFeedback.success
                            ? <Check className="h-3.5 w-3.5 text-[var(--tm-status-positive)]" />
                            : <Copy className="h-3.5 w-3.5" />}
                    </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        onClick={() => onSelectClass(classInfo.id)}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-sm font-semibold text-[var(--tm-brand-primary)] transition-colors active:bg-[var(--tm-brand-primary-soft-strong)]"
                    >
                        <UsersIcon className="h-4 w-4" />
                        学生列表
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewClassReport(classInfo.id)}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-sm font-semibold text-[var(--tm-text-primary)] transition-colors active:bg-[var(--tm-bg-surface-muted)]"
                    >
                        <ChartIcon className="h-4 w-4" />
                        班级报告
                    </button>
                </div>
            </article>
        );
    };

    return (
        <div className="relative h-full overflow-hidden">
            {copyFeedback && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`pointer-events-none absolute left-1/2 top-20 z-[80] -translate-x-1/2 whitespace-nowrap rounded-[var(--tm-radius-control)] px-4 py-2 text-[13px] font-semibold text-white shadow-[var(--tm-shadow-card-raised)] ${copyFeedback.success ? 'bg-[var(--tm-text-primary)]' : 'bg-[var(--tm-status-negative)]'}`}
                >
                    {copyFeedback.message}
                </div>
            )}
            <div className={`relative z-10 h-full space-y-4 overflow-y-auto px-4 pb-40 no-scrollbar ${addDemoTopBreathingSpace ? 'pt-5' : 'pt-3'}`}>
                <section className="space-y-3 px-1">
                    <div className="flex min-h-11 items-center justify-between gap-2 [padding-right:var(--mini-program-capsule-right-inset,0px)]">
                        {showClassSourceSwitcher ? (
                            <ClassSourceTrigger
                                name={currentSpace.title}
                                type={currentSpace.type}
                                expanded={isSpaceSheetOpen}
                                onClick={onOpenClassSourceSwitcher}
                                variant="quiet"
                                className="min-w-0 flex-1"
                            />
                        ) : (
                            <h1 className="truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">{currentSpace.title}</h1>
                        )}

                        {canManagePersonal && (
                            <button
                                type="button"
                                onClick={() => setShowPersonalClassActions(true)}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--tm-brand-primary)] shadow-[var(--tm-shadow-control)] active:scale-95 active:bg-[var(--tm-brand-primary-soft)]"
                                aria-label="打开班级操作"
                            >
                                <Plus className="h-5 w-5" strokeWidth={2.4} />
                            </button>
                        )}
                    </div>

                    {isSchoolSpace && (
                        <div className={`grid gap-2 ${showLeaderboard ? 'grid-cols-[minmax(72px,1fr)_auto_auto]' : 'grid-cols-[minmax(0,1fr)_auto]'}`}>
                            <label className="relative min-w-0">
                                <span className="sr-only">按年级筛选班级</span>
                                <select
                                    value={gradeFilter}
                                    onChange={event => setGradeFilter(event.target.value)}
                                    className="min-h-11 w-full appearance-none rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-3 pr-9 text-[13px] font-medium text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)] outline-none focus:ring-2 focus:ring-[var(--tm-brand-primary)]"
                                    aria-label="按年级筛选班级"
                                >
                                    {gradeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
                            </label>
                            <button
                                type="button"
                                aria-pressed={showTeachingOnly}
                                onClick={() => setShowTeachingOnly(current => !current)}
                                className={`flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-[var(--tm-radius-control)] px-2.5 text-[13px] font-medium [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.98] ${showTeachingOnly ? 'bg-[var(--tm-brand-primary)] text-white' : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)]'}`}
                            >
                                <span className={`flex h-4 w-4 items-center justify-center rounded-[5px] text-[10px] ${showTeachingOnly ? 'bg-white text-[var(--tm-brand-primary)]' : 'ring-1 ring-inset ring-[var(--tm-border-control)]'}`}>
                                    {showTeachingOnly && '✓'}
                                </span>
                                任教班级
                            </button>
                            {showLeaderboard && (
                                <button
                                    type="button"
                                    className="flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-2.5 text-[13px] font-semibold text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.98] active:bg-[var(--tm-brand-primary-soft)]"
                                    onClick={onViewLeaderboard}
                                >
                                    <TrophyIcon className="h-4 w-4" />
                                    排行榜
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {visibleClasses.map(renderClassCard)}

                {visibleClasses.length === 0 && (
                    <section className="rounded-[var(--tm-radius-card)] bg-white p-6 text-center shadow-[var(--tm-shadow-card)]">
                        <p className="text-sm font-semibold text-[var(--tm-text-primary)]">{isSchoolSpace ? '没有符合条件的班级' : '暂无显示班级'}</p>
                        <button
                            type="button"
                            onClick={() => {
                                if (isSchoolSpace) {
                                    setGradeFilter('全部');
                                    setShowTeachingOnly(false);
                                } else {
                                    setShowDisplaySettings(true);
                                }
                            }}
                            className="mt-3 min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] px-4 text-sm font-semibold text-[var(--tm-brand-primary)]"
                        >
                            {isSchoolSpace ? '清除筛选' : '调整显示'}
                        </button>
                    </section>
                )}
            </div>

            {showPersonalClassActions && (
                <div className="fixed inset-0 z-[145] flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="班级操作">
                    <button aria-label="关闭班级操作" className="absolute inset-0" onClick={() => setShowPersonalClassActions(false)} />
                    <section className="relative w-full rounded-t-[var(--tm-radius-sheet)] bg-white px-5 pb-5 pt-3 shadow-[var(--tm-shadow-sheet)]">
                        <div className="mx-auto h-1.5 w-10 rounded-full bg-[var(--tm-border-subtle)]" aria-hidden="true" />
                        <div className="mt-2 flex min-h-12 items-center justify-between">
                            <h2 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">班级操作</h2>
                            <button type="button" onClick={() => setShowPersonalClassActions(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="关闭">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-2 space-y-2">
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
                                            setShowPersonalClassActions(false);
                                            item.onClick();
                                        }}
                                        className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-3 text-left active:bg-[var(--tm-bg-surface-muted)]"
                                    >
                                        <span className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control)] bg-white text-[var(--tm-brand-primary)]"><Icon className="h-[18px] w-[18px]" /></span>
                                        <span className="flex-1 text-sm font-semibold text-[var(--tm-text-primary)]">{item.label}</span>
                                        <ChevronRight className="h-4 w-4 text-[var(--tm-text-disabled)]" />
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>
            )}

            {showDisplaySettings && (
                <div className="fixed inset-0 z-[150] flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="显示班级">
                    <button aria-label="关闭显示设置" className="absolute inset-0" onClick={() => setShowDisplaySettings(false)} />
                    <section className="relative max-h-[72%] w-full rounded-t-[var(--tm-radius-sheet)] bg-white px-5 pb-5 pt-3 shadow-[var(--tm-shadow-sheet)]">
                        <div className="mx-auto h-1.5 w-10 rounded-full bg-[var(--tm-border-subtle)]" aria-hidden="true" />
                        <div className="mt-2 flex min-h-12 items-center justify-between">
                            <h2 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">显示班级</h2>
                            <button type="button" onClick={() => setShowDisplaySettings(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="关闭">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-2 max-h-[48vh] space-y-2 overflow-y-auto pb-1 no-scrollbar">
                            {classes.map(classInfo => {
                                const visible = !hiddenClassIds.has(classInfo.id);
                                return (
                                    <button
                                        key={classInfo.id}
                                        type="button"
                                        onClick={() => toggleClassVisibility(classInfo.id)}
                                        className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-4 text-left active:bg-[var(--tm-bg-surface-muted)]"
                                        aria-pressed={visible}
                                    >
                                        <span className="min-w-0 truncate text-sm font-semibold text-[var(--tm-text-primary)]">{classInfo.name}</span>
                                        <span className={`flex h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${visible ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-muted)] ring-1 ring-inset ring-[var(--tm-border-subtle)]'}`}>
                                            <span className={`h-5 w-5 rounded-full bg-white shadow-[var(--tm-shadow-control)] transition-transform ${visible ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                </div>
            )}

            {activeActionClass && actionGroups.length > 0 && (
                <div className="fixed inset-0 z-[145] flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label={`${activeActionClass.name}更多操作`}>
                    <button aria-label="关闭班级更多操作" className="absolute inset-0" onClick={closeActionSheet} />
                    <div className="relative w-full rounded-t-[var(--tm-radius-sheet)] bg-white px-5 pb-5 pt-4 shadow-[var(--tm-shadow-sheet)] animate-in slide-in-from-bottom-4 fade-in [animation-duration:var(--tm-duration-standard)]">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="min-w-0">
                                <h3 className="truncate text-[18px] font-semibold text-[var(--tm-text-primary)]">{activeActionClass.name}</h3>
                                <p className="mt-0.5 text-xs font-medium tabular-nums text-[var(--tm-text-disabled)]">班级号 {formatClassCode(activeActionClass.classCode)}</p>
                            </div>
                            <button onClick={closeActionSheet} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-disabled)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="关闭">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[58vh] space-y-4 overflow-y-auto pb-1 no-scrollbar">
                            {actionGroups.map(group => (
                                <section key={group.title}>
                                    <h4 className="mb-2 px-1 text-xs font-semibold text-[var(--tm-text-disabled)]">{group.title}</h4>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {group.items.map(item => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.label}
                                                    type="button"
                                                    onClick={item.onClick}
                                                    className="relative flex min-h-[56px] items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-3 text-left transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-muted)]"
                                                >
                                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${actionToneClass[item.tone]}`}>
                                                        <Icon className="h-[18px] w-[18px]" />
                                                    </span>
                                                    <span className="min-w-0 flex-1 text-[14px] font-semibold leading-snug text-[var(--tm-text-primary)]">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showLeftStudentSheet && (
                <div className="fixed inset-0 z-[150] flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="离校学生">
                    <button aria-label="关闭离校学生" className="absolute inset-0" onClick={() => setLeftStudentClassId(null)} />
                    <div className="relative max-h-[72%] w-full rounded-t-[var(--tm-radius-sheet)] bg-white px-5 pb-5 pt-5 shadow-[var(--tm-shadow-sheet)]">
                        <div className="mb-4 flex items-center justify-center">
                            <h3 className="text-[20px] font-semibold text-[var(--tm-text-primary)]">离校学生</h3>
                            <button onClick={() => setLeftStudentClassId(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full active:bg-[var(--tm-bg-surface-soft)]" aria-label="关闭">
                                <CloseIcon className="h-5 w-5 text-[var(--tm-text-disabled)]" />
                            </button>
                        </div>
                        <div className="max-h-[440px] space-y-3 overflow-y-auto pb-4">
                            {leftStudents.length === 0 && (
                                <div className="rounded-[var(--tm-radius-card)] border border-dashed border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-8 text-center text-sm font-semibold text-[var(--tm-text-secondary)]">
                                    暂无离校学生
                                </div>
                            )}
                            {leftStudents.map(student => (
                                <div key={student.id} className="flex items-center gap-3 rounded-[var(--tm-radius-inner)] bg-white p-3 shadow-[var(--tm-shadow-card)]">
                                    <img src={student.avatar} alt={`${student.name}头像`} className="h-11 w-11 shrink-0 rounded-full bg-[var(--tm-bg-surface-soft)] object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[15px] font-semibold text-[var(--tm-text-primary)]">{student.name}</div>
                                        <div className="mt-1 truncate text-xs font-medium text-[var(--tm-text-disabled)]">{student.studentNo || student.id} · {leftStudentClass?.name || student.class}</div>
                                    </div>
                                    <button type="button" onClick={() => onRestoreStudentStatus(student)} className="min-h-11 shrink-0 rounded-full bg-[var(--tm-status-positive-soft)] px-3 text-xs font-semibold text-[var(--tm-status-positive-strong)] active:scale-95">
                                        恢复
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassListView;
