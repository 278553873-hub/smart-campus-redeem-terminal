import React, { useEffect, useMemo, useState } from 'react';
import { Student, ClassInfo, GroupPlan, StudentGroup, type GroupCardDisplaySettings, type StudentCardDisplaySettings, type StudentGroupAvatarKey } from '../types';
import { GET_MOCK_GROUP_PLANS_FOR_CLASS } from '../constants';
import { BackIcon, MaleIcon, FemaleIcon, CheckIcon, CheckCircleIcon, CircleIcon, SearchIcon, ChevronDownIcon, PlusIcon, MenuIcon, EditIcon, DeleteIcon, CloseIcon, EyeIcon, RetryIcon } from '../components/Icons';
import { ASSETS } from '../assets/images';
import {
    getAvailableStudentGroupAvatarKey,
    getStudentGroupAvatarOption,
    studentGroupAvatarKeys,
    studentGroupAvatarOptions,
} from '../assets/groupAvatarCatalog';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import MobileSearchInput from '../components/ui/MobileSearchInput';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileSettingsSwitchRow from '../components/ui/MobileSettingsSwitchRow';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import MobileToast from '../components/ui/MobileToast';
import GroupPerformanceMeta from '../components/group/GroupPerformanceMeta';
import StudentCompactSelectGrid, { type StudentCompactSelectSection } from '../components/student/StudentCompactSelectGrid';
import StudentPerformanceAvatar from '../components/student-performance/StudentPerformanceAvatar';
import {
    StudentPerformanceCounts,
    StudentPerformanceLevelIcons,
} from '../components/student-performance/StudentPerformanceMeta';
import {
    createDemoStudentPerformanceSummary,
    getStudentPerformanceLevel,
    type StudentPerformanceSummary,
} from '../domain/studentPerformance';
import {
    createDemoGroupPerformanceSummary,
    type GroupPerformanceSummary,
} from '../domain/groupPerformance';
import {
    createEvaluationCountCheckpoint,
    getEvaluationCountsSinceCheckpoint,
    type EvaluationCountCheckpoint,
} from '../domain/evaluationCountCheckpoint';
import { getStudentCardDisplaySettings } from '../domain/studentCardDisplay';
import { getGroupCardDisplaySettings } from '../domain/groupCardDisplay';

type EvaluationRecountTarget = 'student' | 'group';

interface ClassDetailViewProps {
    classInfo: ClassInfo;
    students: Student[];
    currentTeacherName: string;
    onSelectStudent: (student: Student) => void;
    // Lifted selection props
    isSelectionMode: boolean;
    onToggleSelectionMode: () => void;
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
    onGroupSelectionStateChange?: (state: { active: boolean; count: number }) => void;
    onStartRecord?: (studentIds: string[]) => void;
    onViewRecords?: () => void;
    onBack?: () => void;
    onGroupingEditorChange?: (open: boolean) => void;
    performanceByStudentId?: Record<string, StudentPerformanceSummary>;
    groupPerformanceByGroupId?: Record<string, GroupPerformanceSummary>;
    levelNetScoreByStudentId?: Record<string, number>;
    canResetStudentEvaluationCounts: boolean;
    canConfigureCardDisplay: boolean;
    onUpdateStudentCardDisplaySettings: (settings: StudentCardDisplaySettings) => void;
    onUpdateGroupCardDisplaySettings: (settings: GroupCardDisplaySettings) => void;
}

const getClassRosterNumber = (studentNo: string) => {
    const trailingDigits = studentNo.match(/(\d+)$/)?.[1];
    if (!trailingDigits) return studentNo.slice(-2);
    return trailingDigits.slice(-2).padStart(2, '0');
};

// 头像点缀色：不承载语义，按序轮换品牌派生的低饱和浅底，丰富花名册层次。
const getAvatarStyle = (student: Student, index: number) => {
    const avatarTones = [
        ['bg-[var(--tm-tag-jade-soft)]', 'text-[var(--tm-tag-jade-strong)]', 'border-[var(--tm-tag-jade-border)]'],
        ['bg-[var(--tm-tag-orange-soft)]', 'text-[var(--tm-tag-orange-strong)]', 'border-[var(--tm-tag-orange-border)]'],
        ['bg-[var(--tm-tag-red-soft)]', 'text-[var(--tm-tag-red-strong)]', 'border-[var(--tm-tag-red-border)]'],
        ['bg-[var(--tm-tag-gold-soft)]', 'text-[var(--tm-tag-gold-strong)]', 'border-[var(--tm-tag-gold-border)]'],
    ];
    return avatarTones[index % avatarTones.length];
};

const GroupAvatar: React.FC<{ avatarKey?: StudentGroupAvatarKey; index?: number; size?: 'card' | 'sheet' }> = ({ avatarKey, index = 0, size = 'card' }) => {
    const avatar = getStudentGroupAvatarOption(avatarKey, index);
    return (
        <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] ${size === 'sheet' ? 'h-14 w-14' : 'h-11 w-11'}`} aria-hidden="true">
            <img src={avatar.src} alt="" className="h-full w-full object-cover" decoding="async" />
        </span>
    );
};

const getGroupMemberSummary = (members: Student[]) => {
    if (members.length === 0) return '暂无学生';
    const names = members.slice(0, 3).map(student => student.name).join('、');
    return members.length > 3
        ? `${names}等${members.length}名学生`
        : `${names}，共${members.length}名学生`;
};

const getGroupedStudentSelectionSections = (
    visibleStudents: Student[],
    membershipByStudentId: Map<string, StudentGroup>,
    groups: StudentGroup[],
): StudentCompactSelectSection[] => {
    const sections: StudentCompactSelectSection[] = [];
    const ungroupedStudents = visibleStudents.filter(student => !membershipByStudentId.has(student.id));
    if (ungroupedStudents.length > 0) sections.push({ id: 'ungrouped', label: '未分组', students: ungroupedStudents });

    groups.forEach(group => {
        const groupStudents = visibleStudents.filter(student => membershipByStudentId.get(student.id)?.id === group.id);
        if (groupStudents.length > 0) sections.push({ id: group.id, label: group.name, students: groupStudents });
    });
    return sections;
};

interface StudentRosterCardProps {
    student: Student;
    index: number;
    performance: StudentPerformanceSummary;
    levelNetScore?: number;
    displaySettings: StudentCardDisplaySettings;
    showSelection: boolean;
    selected: boolean;
    selectionStatus?: string;
    onClick: () => void;
}

const StudentRosterCard: React.FC<StudentRosterCardProps> = ({
    student,
    index,
    performance,
    levelNetScore,
    displaySettings,
    showSelection,
    selected,
    selectionStatus,
    onClick,
}) => {
    const [bgClass, textClass, borderClass] = getAvatarStyle(student, index);
    const studentNo = student.studentNo || student.id;
    const rosterNumber = getClassRosterNumber(studentNo);
    const level = getStudentPerformanceLevel(levelNetScore ?? performance.netScore);
    const showPerformanceCounts = displaySettings.showPraiseCount || displaySettings.showCriticismCount;
    const visiblePerformanceRowCount = Number(displaySettings.showLevel) + Number(showPerformanceCounts);
    const cardHeightClass = visiblePerformanceRowCount === 2
        ? 'h-[var(--tm-student-card-height-full)]'
        : visiblePerformanceRowCount === 1
            ? 'h-[var(--tm-student-card-height-compact)]'
            : 'h-[var(--tm-student-card-height-minimal)]';
    const accessibilityDetails = [
        `${student.name}，学号${studentNo}`,
        displaySettings.showLevel ? `等级分值${levelNetScore ?? performance.netScore}分` : '',
        displaySettings.showPraiseCount ? `被表扬${performance.praiseCount}次` : '',
        displaySettings.showCriticismCount ? `被批评${performance.criticismCount}次` : '',
        selectionStatus ?? '',
    ].filter(Boolean).join('，');

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={showSelection ? selected : undefined}
            aria-label={accessibilityDetails}
            className={`relative flex w-full min-w-0 select-none flex-col items-center overflow-visible rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] py-1 text-center [box-shadow:var(--tm-shadow-card)] transition-[transform,box-shadow] [transition-duration:var(--tm-duration-standard)] active:scale-[0.96] motion-reduce:transition-none ${cardHeightClass}`}
        >
            {showSelection && (
                <span className={`absolute -right-1 -top-1 z-20 flex h-[18px] w-[18px] items-center justify-center rounded-full animate-in fade-in zoom-in duration-200 ${selected ? 'bg-[var(--tm-brand-primary)]' : 'bg-white'}`}>
                    {selected
                        ? <CheckIcon className="h-3 w-3 text-white [stroke-width:3]" />
                        : <CircleIcon className="h-[18px] w-[18px] fill-white text-[var(--tm-border-subtle)]" />
                    }
                </span>
            )}
            <span className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
                {displaySettings.showLevel && <StudentPerformanceLevelIcons level={level} />}
                <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center">
                    <StudentPerformanceAvatar
                        compact
                        student={{ ...student, avatar: student.avatar || (student.gender === 'female' ? ASSETS.AVATAR.STUDENT_GIRL_DEFAULT : undefined) }}
                        fallbackText={student.name.slice(-1)}
                        fallbackClassName={`${bgClass} ${textClass} border ${borderClass}`}
                        level={level}
                        showLevelProgress={displaySettings.showLevel}
                    />
                </span>
                {showPerformanceCounts && (
                    <StudentPerformanceCounts
                        summary={performance}
                        showPraiseCount={displaySettings.showPraiseCount}
                        showCriticismCount={displaySettings.showCriticismCount}
                    />
                )}
            </span>
            <span className="flex h-4 w-full shrink-0 items-center justify-center px-0.5">
                <span className="inline-flex min-w-0 max-w-full items-center justify-center gap-0.5">
                    <span
                        aria-label={`学号${studentNo}`}
                        className="flex h-[14px] w-4 shrink-0 items-center justify-center rounded-[4px] bg-[var(--tm-bg-surface-muted)] font-mono text-[9px] font-semibold leading-none tabular-nums text-[var(--tm-text-tertiary)]"
                    >
                        {rosterNumber}
                    </span>
                    <span className="block min-w-0 max-w-[52px] truncate text-[13px] font-semibold leading-4 text-[var(--tm-text-primary)]">
                        {student.name}
                    </span>
                </span>
            </span>
        </button>
    );
};

interface ClassDetailTabToolbarProps {
    children: React.ReactNode;
    rowClassName?: string;
}

const ClassDetailTabToolbar: React.FC<ClassDetailTabToolbarProps> = ({ children, rowClassName = '' }) => (
    <div className="class-detail-tab-toolbar sticky top-0 z-10 shrink-0 bg-[var(--tm-bg-surface)] px-4 py-1">
        <div className={`flex min-h-11 items-center ${rowClassName}`}>{children}</div>
    </div>
);

interface ClassDetailMultiSelectButtonProps {
    active: boolean;
    onClick: () => void;
}

const ClassDetailMultiSelectButton: React.FC<ClassDetailMultiSelectButtonProps> = ({ active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`min-h-11 shrink-0 rounded-[var(--tm-radius-control)] px-2.5 text-[13px] font-semibold transition active:scale-95 ${active ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-primary)]'}`}
    >
        {active ? '取消' : '多选'}
    </button>
);

interface OnlyUngroupedFilterProps {
    checked: boolean;
    ungroupedCount: number;
    onChange: (checked: boolean) => void;
}

const OnlyUngroupedFilter: React.FC<OnlyUngroupedFilterProps> = ({ checked, ungroupedCount, onChange }) => (
    <label className="flex min-h-11 select-none items-center gap-2 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-primary)]">
        <input
            type="checkbox"
            checked={checked}
            onChange={event => onChange(event.target.checked)}
            className="sr-only"
        />
        <span
            aria-hidden="true"
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] transition-colors [transition-duration:var(--tm-duration-fast)] ${checked ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-muted)]'}`}
        >
            {checked && <CheckIcon className="h-3.5 w-3.5 text-[var(--tm-text-inverse)] [stroke-width:3]" />}
        </span>
        <span>仅看未分组</span>
        {checked && (
            <span className="ml-auto text-[length:var(--tm-font-size-meta)] font-normal text-[var(--tm-text-secondary)]">{ungroupedCount}人</span>
        )}
    </label>
);

const MobileActionToast: React.FC<{ message: string }> = ({ message }) => (
    message ? (
        <div className="pointer-events-none absolute bottom-[64px] left-1/2 z-30 w-max max-w-[calc(100%-16px)] -translate-x-1/2 rounded-full bg-[var(--tm-text-primary)] px-3.5 py-2 text-center text-[length:var(--tm-font-size-compact)] font-semibold leading-5 text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-card-raised)]" role="status" aria-live="polite">
            {message}
        </div>
    ) : null
);

const ClassDetailView: React.FC<ClassDetailViewProps> = ({
    classInfo,
    students,
    currentTeacherName,
    onSelectStudent,
    isSelectionMode,
    onToggleSelectionMode,
    selectedIds,
    onSelectionChange,
    onGroupSelectionStateChange,
    onBack,
    onGroupingEditorChange,
    performanceByStudentId = {},
    groupPerformanceByGroupId = {},
    levelNetScoreByStudentId = {},
    canResetStudentEvaluationCounts,
    canConfigureCardDisplay,
    onUpdateStudentCardDisplaySettings,
    onUpdateGroupCardDisplaySettings,
}) => {
    const studentCardDisplaySettings = getStudentCardDisplaySettings(classInfo.studentCardDisplaySettings);
    const groupCardDisplaySettings = getGroupCardDisplaySettings(classInfo.groupCardDisplaySettings);
    const [activeView, setActiveView] = useState<'student' | 'group'>('student');
    const [searchQuery, setSearchQuery] = useState('');
    const [groupPlans, setGroupPlans] = useState<GroupPlan[]>(() => GET_MOCK_GROUP_PLANS_FOR_CLASS(classInfo.id, students, currentTeacherName));
    const [activeGroupPlanId, setActiveGroupPlanId] = useState('');
    const [showGroupPlanSheet, setShowGroupPlanSheet] = useState(false);
    const [isGroupSelectionMode, setIsGroupSelectionMode] = useState(false);
    const [groupSelectionIds, setGroupSelectionIds] = useState<Set<string>>(new Set());
    const [groupEditor, setGroupEditor] = useState<{ mode: 'create' | 'add-group'; planId: string; name: string; groups: StudentGroup[] } | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [showNewGroupNameSheet, setShowNewGroupNameSheet] = useState(false);
    const [newStudentGroupName, setNewStudentGroupName] = useState('');
    const [showNewStudentGroupNameSheet, setShowNewStudentGroupNameSheet] = useState(false);
    const [addStudentGroupStep, setAddStudentGroupStep] = useState<'name' | 'members'>('name');
    const [addGroupShowOnlyUngrouped, setAddGroupShowOnlyUngrouped] = useState(true);
    const [groupPlanActionTarget, setGroupPlanActionTarget] = useState<GroupPlan | null>(null);
    const [renameGroupPlanTarget, setRenameGroupPlanTarget] = useState<GroupPlan | null>(null);
    const [renameGroupPlanName, setRenameGroupPlanName] = useState('');
    const [deleteGroupPlanTarget, setDeleteGroupPlanTarget] = useState<GroupPlan | null>(null);
    const [groupDetailTargetId, setGroupDetailTargetId] = useState<string | null>(null);
    const [groupDetailMode, setGroupDetailMode] = useState<'view' | 'adjust' | 'settings'>('view');
    const [adjustStudentGroupMemberIds, setAdjustStudentGroupMemberIds] = useState<Set<string>>(new Set());
    const [adjustStudentGroupSearchQuery, setAdjustStudentGroupSearchQuery] = useState('');
    const [adjustStudentGroupShowOnlyUngrouped, setAdjustStudentGroupShowOnlyUngrouped] = useState(true);
    const [renameStudentGroupName, setRenameStudentGroupName] = useState('');
    const [studentGroupAvatarKey, setStudentGroupAvatarKey] = useState<StudentGroupAvatarKey>(studentGroupAvatarKeys[0]);
    const [dissolveStudentGroupTargetId, setDissolveStudentGroupTargetId] = useState<string | null>(null);
    const [groupingToastMessage, setGroupingToastMessage] = useState('');
    const [studentSelectionMoveNotice, setStudentSelectionMoveNotice] = useState('');
    const [showDiscardGroupingConfirm, setShowDiscardGroupingConfirm] = useState(false);
    const [draftActiveGroupId, setDraftActiveGroupId] = useState('');
    const [draftSearchQuery, setDraftSearchQuery] = useState('');
    const [moreActionTarget, setMoreActionTarget] = useState<EvaluationRecountTarget | null>(null);
    const [cardDisplayTarget, setCardDisplayTarget] = useState<EvaluationRecountTarget | null>(null);
    const [recountTarget, setRecountTarget] = useState<EvaluationRecountTarget | null>(null);
    const [recountSelectedIds, setRecountSelectedIds] = useState<Set<string>>(new Set());
    const [showRecountConfirmation, setShowRecountConfirmation] = useState(false);
    const [recountAcknowledged, setRecountAcknowledged] = useState(false);
    const [recountCountdown, setRecountCountdown] = useState(5);
    const [recountConfirmationNotice, setRecountConfirmationNotice] = useState('');
    const [studentCountCheckpoints, setStudentCountCheckpoints] = useState<Record<string, EvaluationCountCheckpoint>>({});
    const [groupCountCheckpoints, setGroupCountCheckpoints] = useState<Record<string, EvaluationCountCheckpoint>>({});
    const activeStudents = useMemo(() => students.filter(student => (student.status ?? 'active') === 'active'), [students]);
    const activeStudentKey = activeStudents.map(student => student.id).join('|');
    const studentsByGender = useMemo(() => ({
        male: activeStudents.filter(student => student.gender === 'male'),
        female: activeStudents.filter(student => student.gender === 'female'),
    }), [activeStudents]);
    const hasSearchQuery = searchQuery.trim().length > 0;

    useEffect(() => {
        const nextPlans = GET_MOCK_GROUP_PLANS_FOR_CLASS(classInfo.id, activeStudents, currentTeacherName);
        setGroupPlans(nextPlans);
        setActiveGroupPlanId(nextPlans[0]?.id || '');
        setShowGroupPlanSheet(false);
        setIsGroupSelectionMode(false);
        setGroupSelectionIds(new Set());
        onGroupSelectionStateChange?.({ active: false, count: 0 });
        setGroupEditor(null);
        setNewGroupName('');
        setShowNewGroupNameSheet(false);
        setNewStudentGroupName('');
        setShowNewStudentGroupNameSheet(false);
        setAddStudentGroupStep('name');
        setAddGroupShowOnlyUngrouped(true);
        setGroupPlanActionTarget(null);
        setRenameGroupPlanTarget(null);
        setDeleteGroupPlanTarget(null);
        setGroupDetailTargetId(null);
        setGroupDetailMode('view');
        setAdjustStudentGroupMemberIds(new Set());
        setAdjustStudentGroupSearchQuery('');
        setAdjustStudentGroupShowOnlyUngrouped(true);
        setRenameStudentGroupName('');
        setDissolveStudentGroupTargetId(null);
        setGroupingToastMessage('');
        setStudentSelectionMoveNotice('');
        setShowDiscardGroupingConfirm(false);
        setDraftSearchQuery('');
        setSearchQuery('');
        setMoreActionTarget(null);
        setCardDisplayTarget(null);
        setRecountTarget(null);
        setRecountSelectedIds(new Set());
        setShowRecountConfirmation(false);
        setRecountAcknowledged(false);
        setRecountCountdown(5);
        setRecountConfirmationNotice('');
        setStudentCountCheckpoints({});
        setGroupCountCheckpoints({});
    }, [activeStudentKey, classInfo.id, currentTeacherName]);

    useEffect(() => {
        if (!groupingToastMessage) return undefined;
        const timer = window.setTimeout(() => setGroupingToastMessage(''), 1800);
        return () => window.clearTimeout(timer);
    }, [groupingToastMessage]);

    useEffect(() => {
        if (!studentSelectionMoveNotice) return undefined;
        const timer = window.setTimeout(() => setStudentSelectionMoveNotice(''), 1800);
        return () => window.clearTimeout(timer);
    }, [studentSelectionMoveNotice]);

    useEffect(() => {
        if (!recountConfirmationNotice) return undefined;
        const timer = window.setTimeout(() => setRecountConfirmationNotice(''), 1800);
        return () => window.clearTimeout(timer);
    }, [recountConfirmationNotice]);

    useEffect(() => {
        if (!activeGroupPlanId && groupPlans.length > 0) {
            setActiveGroupPlanId(groupPlans[0].id);
        }
    }, [activeGroupPlanId, groupPlans]);

    useEffect(() => {
        if (!showRecountConfirmation || recountCountdown <= 0) return undefined;
        const timer = window.setTimeout(() => setRecountCountdown(current => Math.max(0, current - 1)), 1000);
        return () => window.clearTimeout(timer);
    }, [recountCountdown, showRecountConfirmation]);

    const isGroupingEditorOpen = Boolean(groupEditor || moreActionTarget || cardDisplayTarget || recountTarget || showRecountConfirmation);

    useEffect(() => {
        onGroupingEditorChange?.(isGroupingEditorOpen);
        return () => onGroupingEditorChange?.(false);
    }, [isGroupingEditorOpen, onGroupingEditorChange]);

    const orderedGroupPlans = useMemo(() => (
        [...groupPlans].sort((left, right) => {
            const leftOwned = left.ownerName === currentTeacherName ? 0 : 1;
            const rightOwned = right.ownerName === currentTeacherName ? 0 : 1;
            return leftOwned - rightOwned;
        })
    ), [currentTeacherName, groupPlans]);

    const activeGroupPlan = useMemo(() => (
        groupPlans.find(plan => plan.id === activeGroupPlanId) || orderedGroupPlans[0] || null
    ), [activeGroupPlanId, groupPlans, orderedGroupPlans]);

    const isActiveGroupPlanOwnedByCurrentTeacher = Boolean(activeGroupPlan && activeGroupPlan.ownerName === currentTeacherName);
    const hasActiveStudentGroups = Boolean(activeGroupPlan?.groups.length);

    const studentById = useMemo(() => new Map(activeStudents.map(student => [student.id, student])), [activeStudents]);

    const getBaseStudentPerformance = (student: Student) => (
        performanceByStudentId[student.id] ?? createDemoStudentPerformanceSummary(student)
    );
    const getDisplayedStudentPerformance = (student: Student) => getEvaluationCountsSinceCheckpoint(
        getBaseStudentPerformance(student),
        studentCountCheckpoints[student.id],
    );
    const getBaseGroupPerformance = (groupId: string) => (
        groupPerformanceByGroupId[groupId] ?? createDemoGroupPerformanceSummary(groupId)
    );
    const getDisplayedGroupPerformance = (groupId: string) => getEvaluationCountsSinceCheckpoint(
        getBaseGroupPerformance(groupId),
        groupCountCheckpoints[groupId],
    );

    const groupDetailTarget = activeGroupPlan?.groups.find(group => group.id === groupDetailTargetId) ?? null;
    const groupDetailMembers = groupDetailTarget?.memberIds.map(id => studentById.get(id)).filter(Boolean) as Student[] | undefined;
    const dissolveStudentGroupTarget = activeGroupPlan?.groups.find(group => group.id === dissolveStudentGroupTargetId) ?? null;

    const activeGroupMembershipByStudentId = useMemo(() => {
        const membership = new Map<string, StudentGroup>();
        activeGroupPlan?.groups.forEach(group => group.memberIds.forEach(studentId => membership.set(studentId, group)));
        return membership;
    }, [activeGroupPlan]);

    const activeGroupUngroupedCount = activeStudents.filter(student => !activeGroupMembershipByStudentId.has(student.id)).length;

    const recountSelectedGroups = activeGroupPlan?.groups.filter(group => recountSelectedIds.has(group.id)) ?? [];
    const recountSelectedStudents = activeStudents.filter(student => recountSelectedIds.has(student.id));
    const recountSelectedCount = recountTarget === 'group' ? recountSelectedGroups.length : recountSelectedStudents.length;

    const adjustStudentGroupVisibleStudents = useMemo(() => {
        const normalizedQuery = adjustStudentGroupSearchQuery.trim().replace(/\s+/g, '').toLowerCase();
        return activeStudents.filter(student => {
            const assignedGroup = activeGroupMembershipByStudentId.get(student.id);
            const isCurrentOrSelected = assignedGroup?.id === groupDetailTarget?.id || adjustStudentGroupMemberIds.has(student.id);
            if (adjustStudentGroupShowOnlyUngrouped && assignedGroup && !isCurrentOrSelected) return false;
            return !normalizedQuery
                || student.name.includes(normalizedQuery)
                || student.id.toLowerCase().includes(normalizedQuery)
                || (student.studentNo || '').toLowerCase().includes(normalizedQuery);
        });
    }, [activeGroupMembershipByStudentId, activeStudents, adjustStudentGroupMemberIds, adjustStudentGroupSearchQuery, adjustStudentGroupShowOnlyUngrouped, groupDetailTarget?.id]);

    const addGroupUngroupedStudentIds = useMemo(() => {
        if (groupEditor?.mode !== 'add-group') return null;
        const sourcePlan = groupPlans.find(plan => plan.id === groupEditor.planId);
        const assignedIds = new Set(sourcePlan?.groups.flatMap(group => group.memberIds) ?? []);
        return new Set(activeStudents.filter(student => !assignedIds.has(student.id)).map(student => student.id));
    }, [activeStudents, groupEditor?.mode, groupEditor?.planId, groupPlans]);

    const draftActiveGroup = groupEditor?.groups.find(group => group.id === draftActiveGroupId) || groupEditor?.groups[0] || null;

    const addGroupMovedStudentCount = useMemo(() => (
        groupEditor?.mode === 'add-group'
            ? (draftActiveGroup?.memberIds.filter(studentId => activeGroupMembershipByStudentId.has(studentId)).length ?? 0)
            : 0
    ), [activeGroupMembershipByStudentId, draftActiveGroup?.memberIds, groupEditor?.mode]);

    const adjustStudentGroupMovedStudentCount = useMemo(() => (
        groupDetailTarget
            ? Array.from(adjustStudentGroupMemberIds).filter(studentId => {
                const assignedGroup = activeGroupMembershipByStudentId.get(studentId);
                return assignedGroup && assignedGroup.id !== groupDetailTarget.id;
            }).length
            : 0
    ), [activeGroupMembershipByStudentId, adjustStudentGroupMemberIds, groupDetailTarget]);

    const draftVisibleStudents = useMemo(() => {
        const normalizedQuery = draftSearchQuery.trim().replace(/\s+/g, '').toLowerCase();
        return activeStudents.filter(student => {
            const isSelected = draftActiveGroup?.memberIds.includes(student.id) ?? false;
            if (groupEditor?.mode === 'add-group' && addGroupShowOnlyUngrouped && !addGroupUngroupedStudentIds?.has(student.id) && !isSelected) return false;
            return !normalizedQuery
                || student.name.includes(normalizedQuery)
                || student.id.toLowerCase().includes(normalizedQuery)
                || (student.studentNo || '').toLowerCase().includes(normalizedQuery);
        });
    }, [activeStudents, addGroupShowOnlyUngrouped, addGroupUngroupedStudentIds, draftActiveGroup?.memberIds, draftSearchQuery, groupEditor?.mode]);

    const draftStudentSelectionSections = useMemo<StudentCompactSelectSection[]>(() => (
        groupEditor?.mode === 'add-group' && !addGroupShowOnlyUngrouped
            ? getGroupedStudentSelectionSections(draftVisibleStudents, activeGroupMembershipByStudentId, activeGroupPlan?.groups ?? [])
            : [{ id: 'visible-students', students: draftVisibleStudents }]
    ), [activeGroupMembershipByStudentId, activeGroupPlan?.groups, addGroupShowOnlyUngrouped, draftVisibleStudents, groupEditor?.mode]);

    const adjustStudentSelectionSections = useMemo<StudentCompactSelectSection[]>(() => (
        !adjustStudentGroupShowOnlyUngrouped
            ? getGroupedStudentSelectionSections(adjustStudentGroupVisibleStudents, activeGroupMembershipByStudentId, activeGroupPlan?.groups ?? [])
            : [{ id: 'visible-students', students: adjustStudentGroupVisibleStudents }]
    ), [activeGroupMembershipByStudentId, activeGroupPlan?.groups, adjustStudentGroupShowOnlyUngrouped, adjustStudentGroupVisibleStudents]);

    const visibleStudents = useMemo(() => {
        const normalizedSearchQuery = searchQuery.trim().replace(/\s+/g, '').toLowerCase();
        return activeStudents.filter(student => {
            return !normalizedSearchQuery
                || student.name.includes(normalizedSearchQuery)
                || student.id.toLowerCase().includes(normalizedSearchQuery)
                || (student.studentNo || '').toLowerCase().includes(normalizedSearchQuery);
        });
    }, [activeStudents, searchQuery]);

    const isStudentRecountSelection = recountTarget === 'student';
    const isGroupRecountSelection = recountTarget === 'group';
    const activeStudentSelectionIds = isStudentRecountSelection ? recountSelectedIds : selectedIds;
    const isStudentSelectionActive = isSelectionMode || isStudentRecountSelection;
    const isGroupSelectionActive = isGroupSelectionMode || isGroupRecountSelection;
    const isAllVisibleSelected = useMemo(() => {
        return visibleStudents.length > 0 && visibleStudents.every(student => activeStudentSelectionIds.has(student.id));
    }, [activeStudentSelectionIds, visibleStudents]);
    const isMaleQuickSelectionActive = studentsByGender.male.length > 0
        && activeStudentSelectionIds.size === studentsByGender.male.length
        && studentsByGender.male.every(student => activeStudentSelectionIds.has(student.id));
    const isFemaleQuickSelectionActive = studentsByGender.female.length > 0
        && activeStudentSelectionIds.size === studentsByGender.female.length
        && studentsByGender.female.every(student => activeStudentSelectionIds.has(student.id));

    const updateActiveStudentSelection = (next: Set<string>) => {
        if (isStudentRecountSelection) {
            setRecountSelectedIds(next);
            return;
        }
        onGroupSelectionStateChange?.({ active: false, count: 0 });
        onSelectionChange(next);
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(activeStudentSelectionIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        updateActiveStudentSelection(newSet);
    };

    const handleStudentClick = (student: Student) => {
        if (isStudentSelectionActive) {
            toggleSelection(student.id);
        } else {
            onSelectStudent(student);
        }
    };

    const handleSelectAllVisibleStudents = () => {
        const next = new Set(activeStudentSelectionIds);
        visibleStudents.forEach(student => next.add(student.id));
        updateActiveStudentSelection(next);
    };

    const handleClearVisibleStudents = () => {
        const visibleIds = new Set(visibleStudents.map(student => student.id));
        const next = new Set(Array.from(activeStudentSelectionIds).filter(id => !visibleIds.has(id)));
        updateActiveStudentSelection(next);
    };

    const handleInvertVisibleStudents = () => {
        const next = new Set(activeStudentSelectionIds);
        visibleStudents.forEach(student => {
            if (next.has(student.id)) next.delete(student.id);
            else next.add(student.id);
        });
        updateActiveStudentSelection(next);
    };

    const handleToggleGenderSelection = (gender: Student['gender']) => {
        const genderStudents = studentsByGender[gender];
        const isCurrentQuickSelectionActive = gender === 'male'
            ? isMaleQuickSelectionActive
            : isFemaleQuickSelectionActive;
        updateActiveStudentSelection(isCurrentQuickSelectionActive
            ? new Set()
            : new Set(genderStudents.map(student => student.id)));
    };

    const handleRestoreSearchMode = () => {
        if (!isSelectionMode) return;
        onToggleSelectionMode();
    };

    const handleSwitchView = (view: 'student' | 'group') => {
        if (activeView === view) return;
        if (isSelectionMode) onToggleSelectionMode();
        setIsGroupSelectionMode(false);
        setGroupSelectionIds(new Set());
        onGroupSelectionStateChange?.({ active: false, count: 0 });
        onSelectionChange(new Set());
        setActiveView(view);
    };

    const handleToggleGroupSelection = (groupId: string) => {
        const next = new Set(groupSelectionIds);
        if (next.has(groupId)) next.delete(groupId);
        else next.add(groupId);
        setGroupSelectionIds(next);
        onGroupSelectionStateChange?.({ active: true, count: next.size });
        const memberIds = activeGroupPlan?.groups
            .filter(group => next.has(group.id))
            .flatMap(group => group.memberIds) ?? [];
        onSelectionChange(new Set(memberIds));
    };

    const resetRecountConfirmation = () => {
        setShowRecountConfirmation(false);
        setRecountAcknowledged(false);
        setRecountCountdown(5);
        setRecountConfirmationNotice('');
    };

    const handleCancelRecount = () => {
        setMoreActionTarget(null);
        setRecountTarget(null);
        setRecountSelectedIds(new Set());
        resetRecountConfirmation();
        setSearchQuery('');
    };

    const handleOpenCardDisplaySettings = (target: EvaluationRecountTarget) => {
        if (!canConfigureCardDisplay) return;
        setMoreActionTarget(null);
        setCardDisplayTarget(target);
    };

    const handleStartRecountSelection = (target: EvaluationRecountTarget) => {
        if (target === 'student' && !canResetStudentEvaluationCounts) return;
        if (target === 'group' && !isActiveGroupPlanOwnedByCurrentTeacher) return;
        setMoreActionTarget(null);
        setRecountTarget(target);
        setRecountSelectedIds(new Set());
        resetRecountConfirmation();
        setSearchQuery('');
    };

    const handleToggleRecountGroup = (groupId: string) => {
        const next = new Set(recountSelectedIds);
        if (next.has(groupId)) next.delete(groupId);
        else next.add(groupId);
        setRecountSelectedIds(next);
    };

    const handleToggleAllRecountGroups = () => {
        const groupIds = activeGroupPlan?.groups.map(group => group.id) ?? [];
        const allSelected = groupIds.length > 0 && groupIds.every(groupId => recountSelectedIds.has(groupId));
        setRecountSelectedIds(allSelected ? new Set() : new Set(groupIds));
    };

    const handleOpenRecountConfirmation = () => {
        if (recountSelectedCount === 0) return;
        setRecountAcknowledged(false);
        setRecountCountdown(5);
        setRecountConfirmationNotice('');
        setShowRecountConfirmation(true);
    };

    const handleToggleRecountAcknowledgement = (checked: boolean) => {
        setRecountAcknowledged(checked);
        if (checked) setRecountConfirmationNotice('');
    };

    const handleConfirmRecount = () => {
        if (!recountTarget || recountSelectedCount === 0 || recountCountdown > 0) return;
        if (!recountAcknowledged) {
            setRecountConfirmationNotice('请先勾选我已知晓');
            return;
        }
        const resetAt = new Date().toISOString();
        if (recountTarget === 'student') {
            setStudentCountCheckpoints(current => {
                const next = { ...current };
                recountSelectedStudents.forEach(student => {
                    next[student.id] = createEvaluationCountCheckpoint(getBaseStudentPerformance(student), resetAt);
                });
                return next;
            });
        } else {
            setGroupCountCheckpoints(current => {
                const next = { ...current };
                recountSelectedGroups.forEach(group => {
                    next[group.id] = createEvaluationCountCheckpoint(getBaseGroupPerformance(group.id), resetAt);
                });
                return next;
            });
        }
        const successMessage = recountTarget === 'student'
            ? `${recountSelectedCount}名学生已从现在开始重新计数`
            : `${recountSelectedCount}个小组已从现在开始重新计数`;
        handleCancelRecount();
        setGroupingToastMessage(successMessage);
    };

    const createDraftGroups = (planId: string, groupName = '第1组') => ([{
        id: `${planId}-group-1-${Date.now()}`,
        name: groupName,
        memberIds: [],
        avatarKey: studentGroupAvatarKeys[0],
    }]);

    const handleStartFirstGrouping = () => {
        let targetPlan = activeGroupPlan?.ownerName === currentTeacherName ? activeGroupPlan : null;
        if (!targetPlan) {
            const nextPlan: GroupPlan = {
                id: `${classInfo.id}-custom-plan-${Date.now()}`,
                name: '常用分组',
                subject: '自定义',
                ownerName: currentTeacherName,
                groups: [],
            };
            targetPlan = nextPlan;
            setGroupPlans(current => [...current, nextPlan]);
        }
        setActiveGroupPlanId(targetPlan.id);
        setNewStudentGroupName('');
        setAddStudentGroupStep('name');
        setAddGroupShowOnlyUngrouped(true);
        setGroupEditor(null);
        setDraftSearchQuery('');
        setStudentSelectionMoveNotice('');
        setShowGroupPlanSheet(false);
        setShowNewStudentGroupNameSheet(true);
    };

    const handleStartNewGrouping = () => {
        setNewGroupName('');
        setNewStudentGroupName('');
        setGroupEditor(null);
        setDraftSearchQuery('');
        setStudentSelectionMoveNotice('');
        setAddGroupShowOnlyUngrouped(true);
        setShowGroupPlanSheet(false);
        setShowNewGroupNameSheet(true);
    };

    const handleCreateNamedGrouping = () => {
        const name = newGroupName.trim();
        const groupName = newStudentGroupName.trim();
        if (!name || !groupName) return;
        if (groupEditor?.mode === 'create') {
            setGroupEditor({
                ...groupEditor,
                name,
                groups: groupEditor.groups.map((group, index) => index === 0 ? { ...group, name: groupName } : group),
            });
        } else {
            const planId = `${classInfo.id}-custom-plan-${Date.now()}`;
            const groups = createDraftGroups(planId, groupName);
            setDraftActiveGroupId(groups[0].id);
            setGroupEditor({ mode: 'create', planId, name, groups });
        }
        setDraftSearchQuery('');
        setStudentSelectionMoveNotice('');
        setAddStudentGroupStep('members');
        setShowNewGroupNameSheet(false);
        setShowNewStudentGroupNameSheet(true);
    };

    const handleToggleDraftStudent = (studentId: string) => {
        if (!groupEditor || !draftActiveGroup) return;
        const isSelected = draftActiveGroup.memberIds.includes(studentId);
        const assignedGroup = groupEditor.mode === 'add-group' ? activeGroupMembershipByStudentId.get(studentId) : undefined;
        const student = studentById.get(studentId);
        if (!isSelected && assignedGroup && student) {
            setStudentSelectionMoveNotice(`${student.name}将从${assignedGroup.name}移入`);
        }
        setGroupEditor(current => {
            if (!current) return current;
            return {
                ...current,
                groups: current.groups.map(group => {
                    if (group.id === draftActiveGroup.id) {
                        return {
                            ...group,
                            memberIds: group.memberIds.includes(studentId)
                                ? group.memberIds.filter(id => id !== studentId)
                                : [...group.memberIds, studentId],
                        };
                    }
                    return { ...group, memberIds: group.memberIds.filter(id => id !== studentId) };
                }),
            };
        });
    };

    const handleStartAddStudentGroup = () => {
        if (!activeGroupPlan || !isActiveGroupPlanOwnedByCurrentTeacher) return;
        setNewStudentGroupName('');
        setAddStudentGroupStep('name');
        setAddGroupShowOnlyUngrouped(true);
        setStudentSelectionMoveNotice('');
        setShowNewStudentGroupNameSheet(true);
    };

    const handleConfirmStudentGroupName = () => {
        const groupName = newStudentGroupName.trim();
        if (!activeGroupPlan || !isActiveGroupPlanOwnedByCurrentTeacher || !groupName) return;
        if (groupEditor?.mode === 'add-group') {
            setGroupEditor({
                ...groupEditor,
                groups: groupEditor.groups.map((group, index) => index === 0 ? { ...group, name: groupName } : group),
            });
            setAddStudentGroupStep('members');
            return;
        }
        const nextGroup: StudentGroup = {
            id: `${activeGroupPlan.id}-group-${Date.now()}`,
            name: groupName,
            memberIds: [],
            avatarKey: getAvailableStudentGroupAvatarKey(
                activeGroupPlan.groups.map(group => group.avatarKey),
                activeGroupPlan.groups.length,
            ),
        };
        setDraftActiveGroupId(nextGroup.id);
        setDraftSearchQuery('');
        setGroupEditor({ mode: 'add-group', planId: activeGroupPlan.id, name: activeGroupPlan.name, groups: [nextGroup] });
        setAddStudentGroupStep('members');
    };

    const handleReturnToStudentGroupName = () => {
        if (groupEditor?.mode === 'create') {
            setStudentSelectionMoveNotice('');
            setNewGroupName(groupEditor.name);
            setNewStudentGroupName(draftActiveGroup?.name || '');
            setShowNewStudentGroupNameSheet(false);
            setShowNewGroupNameSheet(true);
            return;
        }
        if (groupEditor?.mode !== 'add-group') return;
        setStudentSelectionMoveNotice('');
        setNewStudentGroupName(draftActiveGroup?.name || '');
        setAddStudentGroupStep('name');
    };

    const handleConfirmDiscardGrouping = () => {
        setShowDiscardGroupingConfirm(false);
        setShowNewGroupNameSheet(false);
        setShowNewStudentGroupNameSheet(false);
        setNewGroupName('');
        setNewStudentGroupName('');
        setAddStudentGroupStep('name');
        setGroupEditor(null);
        setDraftSearchQuery('');
        setStudentSelectionMoveNotice('');
    };

    const handleCloseNewGroupingDetails = () => {
        if (groupEditor?.mode === 'create') {
            setShowDiscardGroupingConfirm(true);
            return;
        }
        setShowNewGroupNameSheet(false);
        setNewGroupName('');
        setNewStudentGroupName('');
    };

    const handleCloseStudentGroupNameSheet = () => {
        if (groupEditor?.mode === 'create') {
            setShowDiscardGroupingConfirm(true);
            return;
        }
        setShowNewStudentGroupNameSheet(false);
        setNewStudentGroupName('');
        setAddStudentGroupStep('name');
        setAddGroupShowOnlyUngrouped(true);
        setStudentSelectionMoveNotice('');
        if (groupEditor?.mode === 'add-group') {
            setGroupEditor(null);
            setDraftSearchQuery('');
        }
    };

    const handleCloseDiscardGroupingConfirm = () => {
        setShowDiscardGroupingConfirm(false);
    };

    const resetAdjustStudentGroupDraft = () => {
        setAdjustStudentGroupMemberIds(new Set());
        setAdjustStudentGroupSearchQuery('');
        setAdjustStudentGroupShowOnlyUngrouped(true);
        setStudentSelectionMoveNotice('');
    };

    const handleOpenStudentGroupDetail = (groupId: string) => {
        setGroupDetailTargetId(groupId);
        setGroupDetailMode('view');
        resetAdjustStudentGroupDraft();
    };

    const handleStartAdjustStudentGroup = () => {
        if (!groupDetailTarget || !isActiveGroupPlanOwnedByCurrentTeacher) return;
        setAdjustStudentGroupMemberIds(new Set(groupDetailTarget.memberIds));
        setAdjustStudentGroupSearchQuery('');
        setAdjustStudentGroupShowOnlyUngrouped(true);
        setGroupDetailMode('adjust');
    };

    const handleToggleAdjustStudentGroupMember = (studentId: string) => {
        const assignedGroup = activeGroupMembershipByStudentId.get(studentId);
        const student = studentById.get(studentId);
        if (!adjustStudentGroupMemberIds.has(studentId) && assignedGroup && assignedGroup.id !== groupDetailTarget?.id && student) {
            setStudentSelectionMoveNotice(`${student.name}将从${assignedGroup.name}移入`);
        }
        setAdjustStudentGroupMemberIds(current => {
            const next = new Set(current);
            if (next.has(studentId)) next.delete(studentId);
            else next.add(studentId);
            return next;
        });
    };

    const handleBackToStudentGroupDetail = () => {
        setGroupDetailMode('view');
        setRenameStudentGroupName('');
        resetAdjustStudentGroupDraft();
    };

    const handleCloseStudentGroupDetail = () => {
        setGroupDetailTargetId(null);
        setGroupDetailMode('view');
        setRenameStudentGroupName('');
        resetAdjustStudentGroupDraft();
    };

    const handleOpenGroupMemberStudent = (student: Student) => {
        handleCloseStudentGroupDetail();
        onSelectStudent(student);
    };

    const handleSaveAdjustStudentGroup = () => {
        if (!activeGroupPlan || !groupDetailTarget || !isActiveGroupPlanOwnedByCurrentTeacher) return;
        const movedStudentCount = adjustStudentGroupMovedStudentCount;
        const memberIds = activeStudents
            .filter(student => adjustStudentGroupMemberIds.has(student.id))
            .map(student => student.id);
        const memberIdSet = new Set(memberIds);
        setGroupPlans(current => current.map(plan => plan.id === activeGroupPlan.id
            ? {
                ...plan,
                groups: plan.groups.map(group => group.id === groupDetailTarget.id
                    ? { ...group, memberIds }
                    : { ...group, memberIds: group.memberIds.filter(studentId => !memberIdSet.has(studentId)) }),
            }
            : plan));
        setGroupDetailMode('view');
        resetAdjustStudentGroupDraft();
        if (movedStudentCount > 0) {
            setGroupingToastMessage(`${movedStudentCount}名学生已从原小组移入`);
        }
    };

    const handleStartEditStudentGroup = () => {
        if (!groupDetailTarget || !activeGroupPlan || !isActiveGroupPlanOwnedByCurrentTeacher) return;
        const groupIndex = activeGroupPlan.groups.findIndex(group => group.id === groupDetailTarget.id);
        setRenameStudentGroupName(groupDetailTarget.name);
        setStudentGroupAvatarKey(getStudentGroupAvatarOption(groupDetailTarget.avatarKey, Math.max(groupIndex, 0)).key);
        setGroupDetailMode('settings');
    };

    const handleSaveStudentGroupSettings = () => {
        const name = renameStudentGroupName.trim();
        if (!activeGroupPlan || !groupDetailTarget || !name || !isActiveGroupPlanOwnedByCurrentTeacher) return;
        setGroupPlans(current => current.map(plan => plan.id === activeGroupPlan.id
            ? {
                ...plan,
                groups: plan.groups.map(group => group.id === groupDetailTarget.id
                    ? { ...group, name, avatarKey: studentGroupAvatarKey }
                    : group),
            }
            : plan));
        setGroupDetailMode('view');
        setRenameStudentGroupName('');
    };

    const handleRequestDissolveStudentGroup = () => {
        if (!groupDetailTarget || !isActiveGroupPlanOwnedByCurrentTeacher) return;
        setDissolveStudentGroupTargetId(groupDetailTarget.id);
    };

    const handleConfirmDissolveStudentGroup = () => {
        if (!activeGroupPlan || !dissolveStudentGroupTarget || !isActiveGroupPlanOwnedByCurrentTeacher) return;
        setGroupPlans(current => current.map(plan => plan.id === activeGroupPlan.id
            ? { ...plan, groups: plan.groups.filter(group => group.id !== dissolveStudentGroupTarget.id) }
            : plan));
        setDissolveStudentGroupTargetId(null);
        setGroupDetailTargetId(null);
        setGroupDetailMode('view');
        resetAdjustStudentGroupDraft();
    };

    const handleOpenGroupPlanActions = (plan: GroupPlan) => {
        if (plan.ownerName !== currentTeacherName) return;
        setShowGroupPlanSheet(false);
        setGroupPlanActionTarget(plan);
    };

    const handleStartRenameGroupPlan = () => {
        if (!groupPlanActionTarget) return;
        setRenameGroupPlanName(groupPlanActionTarget.name);
        setRenameGroupPlanTarget(groupPlanActionTarget);
        setGroupPlanActionTarget(null);
    };

    const handleConfirmRenameGroupPlan = () => {
        const name = renameGroupPlanName.trim();
        if (!renameGroupPlanTarget || !name) return;
        setGroupPlans(current => current.map(plan => (
            plan.id === renameGroupPlanTarget.id ? { ...plan, name } : plan
        )));
        setRenameGroupPlanTarget(null);
        setRenameGroupPlanName('');
    };

    const handleRequestDeleteGroupPlan = () => {
        if (!groupPlanActionTarget) return;
        setDeleteGroupPlanTarget(groupPlanActionTarget);
        setGroupPlanActionTarget(null);
    };

    const handleConfirmDeleteGroupPlan = () => {
        if (!deleteGroupPlanTarget || deleteGroupPlanTarget.ownerName !== currentTeacherName) return;
        const deletedPlanId = deleteGroupPlanTarget.id;
        const deletedPlanIndex = orderedGroupPlans.findIndex(plan => plan.id === deletedPlanId);
        const remainingPlans = orderedGroupPlans.filter(plan => plan.id !== deletedPlanId);
        const nextPlan = remainingPlans[Math.min(Math.max(deletedPlanIndex, 0), remainingPlans.length - 1)] ?? null;
        setGroupPlans(current => current.filter(plan => plan.id !== deletedPlanId));
        if (activeGroupPlanId === deletedPlanId) setActiveGroupPlanId(nextPlan?.id || '');
        setDeleteGroupPlanTarget(null);
        setIsGroupSelectionMode(false);
        setGroupSelectionIds(new Set());
        onSelectionChange(new Set());
    };

    const handleFinishGrouping = () => {
        if (!groupEditor) return;
        if (groupEditor.mode === 'add-group') {
            const nextGroup = groupEditor.groups[0];
            if (!nextGroup || nextGroup.memberIds.length === 0) return;
            const movedStudentCount = addGroupMovedStudentCount;
            const nextMemberIds = new Set(nextGroup.memberIds);
            setGroupPlans(current => current.map(plan => plan.id === groupEditor.planId
                ? {
                    ...plan,
                    groups: [
                        ...plan.groups.map(group => ({
                            ...group,
                            memberIds: group.memberIds.filter(studentId => !nextMemberIds.has(studentId)),
                        })),
                        nextGroup,
                    ],
                }
                : plan));
            setActiveGroupPlanId(groupEditor.planId);
            setShowNewStudentGroupNameSheet(false);
            setAddStudentGroupStep('name');
            setAddGroupShowOnlyUngrouped(true);
            setGroupEditor(null);
            setDraftSearchQuery('');
            setActiveView('group');
            if (movedStudentCount > 0) {
                setGroupingToastMessage(`${movedStudentCount}名学生已从原小组移入`);
            }
            return;
        }
        const nextPlan: GroupPlan = {
            id: groupEditor.planId,
            name: groupEditor.name,
            subject: '自定义',
            ownerName: currentTeacherName,
            groups: groupEditor.groups,
        };
        setGroupPlans(current => [...current, nextPlan]);
        setActiveGroupPlanId(nextPlan.id);
        setShowNewStudentGroupNameSheet(false);
        setNewGroupName('');
        setNewStudentGroupName('');
        setAddStudentGroupStep('name');
        setAddGroupShowOnlyUngrouped(true);
        setGroupEditor(null);
        setDraftSearchQuery('');
        setActiveView('group');
    };

    const renderStudentToolbar = () => {
        if (isStudentRecountSelection) {
            return (
                <ClassDetailTabToolbar rowClassName="gap-1">
                    <div className="min-w-0 flex-1">
                        <MobileSearchInput
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="搜索姓名、学号"
                            aria-label="搜索要重新计数的学生"
                            density="compact"
                            appearance="filled"
                            containerClassName="flex min-h-11 items-center"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={isAllVisibleSelected ? handleClearVisibleStudents : handleSelectAllVisibleStudents}
                        className="min-h-11 shrink-0 px-2 text-[13px] font-semibold text-[var(--tm-text-primary)] active:text-[var(--tm-brand-primary)]"
                    >
                        {isAllVisibleSelected ? '取消全选' : '全选'}
                    </button>
                    <button type="button" onClick={handleCancelRecount} className="min-h-11 shrink-0 px-2 text-[13px] font-semibold text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]">
                        取消
                    </button>
                </ClassDetailTabToolbar>
            );
        }

        return (
        <ClassDetailTabToolbar rowClassName="student-action-row gap-1.5">
            <div className={`relative text-left transition-all duration-300 ease-out ${isSelectionMode ? 'w-11 flex-none opacity-70' : 'min-w-0 flex-1 opacity-100'}`}>
                    {isSelectionMode ? (
                        <button
                            type="button"
                            onClick={handleRestoreSearchMode}
                            aria-label="恢复搜索"
                            className="flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white [box-shadow:var(--tm-shadow-control)]">
                                <SearchIcon className="h-4 w-4 text-[var(--tm-text-disabled)]" />
                            </span>
                        </button>
                    ) : (
                        <MobileSearchInput
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="搜索姓名、学号"
                            aria-label="搜索学生"
                            density="compact"
                            appearance="filled"
                            containerClassName="flex min-h-11 items-center"
                        />
                    )}
            </div>

            <div className="selection-tools-next-to-cancel ml-auto flex shrink-0 items-center gap-1">
                    {isSelectionMode && (
                        <>
                            <button
                                type="button"
                                onClick={isAllVisibleSelected ? handleClearVisibleStudents : handleSelectAllVisibleStudents}
                                className="flex min-h-11 shrink-0 items-center justify-center p-0 text-[13px] font-semibold text-[var(--tm-text-secondary)] transition active:scale-95"
                            >
                                <span className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white px-3 [box-shadow:var(--tm-shadow-control)]">
                                    {isAllVisibleSelected ? '取消全选' : '全选'}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={handleInvertVisibleStudents}
                                className="flex min-h-11 shrink-0 items-center justify-center p-0 text-[13px] font-semibold text-[var(--tm-text-secondary)] transition active:scale-95"
                            >
                                <span className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white px-3 [box-shadow:var(--tm-shadow-control)]">反选</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleToggleGenderSelection('male')}
                                aria-label={isMaleQuickSelectionActive ? '取消全选男生' : '全选男生'}
                                aria-pressed={isMaleQuickSelectionActive}
                                className="flex h-11 w-11 shrink-0 items-center justify-center transition active:scale-95"
                            >
                                <span className={`flex h-8 w-10 items-center justify-center rounded-full border transition-colors [transition-duration:var(--tm-duration-standard)] [box-shadow:var(--tm-shadow-control)] ${isMaleQuickSelectionActive ? 'border-[var(--tm-gender-male-selection-bg)] bg-[var(--tm-gender-male-selection-bg)] text-white' : 'border-[var(--tm-border-subtle)] bg-white text-[var(--tm-gender-male)]'}`}>
                                    <MaleIcon className="h-4 w-4" />
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleToggleGenderSelection('female')}
                                aria-label={isFemaleQuickSelectionActive ? '取消全选女生' : '全选女生'}
                                aria-pressed={isFemaleQuickSelectionActive}
                                className="flex h-11 w-11 shrink-0 items-center justify-center transition active:scale-95"
                            >
                                <span className={`flex h-8 w-10 items-center justify-center rounded-full border transition-colors [transition-duration:var(--tm-duration-standard)] [box-shadow:var(--tm-shadow-control)] ${isFemaleQuickSelectionActive ? 'border-[var(--tm-gender-female-selection-bg)] bg-[var(--tm-gender-female-selection-bg)] text-white' : 'border-[var(--tm-border-subtle)] bg-white text-[var(--tm-gender-female)]'}`}>
                                    <FemaleIcon className="h-4 w-4" />
                                </span>
                            </button>
                        </>
                    )}

                    <ClassDetailMultiSelectButton
                        active={isSelectionMode}
                        onClick={() => {
                            if (!isSelectionMode) {
                                setSearchQuery('');
                            }
                            onGroupSelectionStateChange?.({ active: false, count: 0 });
                            onToggleSelectionMode();
                        }}
                    />
                    {!isSelectionMode && activeStudents.length > 0 && (canConfigureCardDisplay || canResetStudentEvaluationCounts) && (
                        <button type="button" onClick={() => setMoreActionTarget('student')} aria-label="学生更多操作" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-primary)]">
                            <MenuIcon className="h-5 w-5" />
                        </button>
                    )}
            </div>
        </ClassDetailTabToolbar>
        );
    };

    const renderStudentGrid = () => (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-40 pt-3">
            <div className="student-roster-grid grid shrink-0 gap-x-2.5 gap-y-3">
                {visibleStudents.map((student, index) => {
                    const isSelected = activeStudentSelectionIds.has(student.id);
                    const performance = getDisplayedStudentPerformance(student);
                    return (
                        <StudentRosterCard
                            key={student.id}
                            student={student}
                            index={index}
                            performance={performance}
                            levelNetScore={levelNetScoreByStudentId[student.id]}
                            displaySettings={studentCardDisplaySettings}
                            showSelection={isStudentSelectionActive}
                            selected={isSelected}
                            onClick={() => handleStudentClick(student)}
                        />
                    );
                })}
            </div>

            {visibleStudents.length === 0 && (
                <MobileEmptyState
                    imageSrc={hasSearchQuery ? ASSETS.DEFAULT_STATE.MAGNIFIER : ASSETS.DEFAULT_STATE.CHAIR}
                    title={hasSearchQuery ? '没有匹配的学生' : '暂无学生'}
                    className="flex-1 pb-14"
                    imageClassName="w-[68%] min-w-[178px] max-w-[224px]"
                />
            )}

            <div className="h-10 shrink-0" aria-hidden="true" />
        </div>
    );

    const renderGroupView = () => (
        <div className="flex min-h-0 flex-1 flex-col bg-[var(--tm-page-plain-content-bg)]">
            {activeGroupPlan && (hasActiveStudentGroups || orderedGroupPlans.length > 1) && (
                <ClassDetailTabToolbar rowClassName="justify-between gap-2">
                    {isGroupRecountSelection ? (
                        <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)]">选择小组</span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowGroupPlanSheet(true)}
                            aria-label="切换分组"
                            className="flex min-h-11 min-w-0 flex-1 items-center pr-2 text-left active:text-[var(--tm-brand-primary)]"
                        >
                            <span className="flex max-w-full items-center gap-1">
                                <span className="truncate text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)]">{activeGroupPlan.name}</span>
                                <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-[var(--tm-text-tertiary)]" />
                            </span>
                        </button>
                    )}
                    <div className="flex shrink-0 items-center gap-1">
                        {isGroupRecountSelection ? (
                            <>
                                <button type="button" onClick={handleToggleAllRecountGroups} className="min-h-11 shrink-0 px-2 text-[13px] font-semibold text-[var(--tm-text-primary)] active:text-[var(--tm-brand-primary)]">
                                    {activeGroupPlan.groups.length > 0 && activeGroupPlan.groups.every(group => recountSelectedIds.has(group.id)) ? '取消全选' : '全选'}
                                </button>
                                <button type="button" onClick={handleCancelRecount} className="min-h-11 shrink-0 px-2 text-[13px] font-semibold text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]">
                                    取消
                                </button>
                            </>
                        ) : (
                            <>
                                <ClassDetailMultiSelectButton
                                    active={isGroupSelectionMode}
                                    onClick={() => {
                                        const nextActive = !isGroupSelectionMode;
                                        setIsGroupSelectionMode(nextActive);
                                        setGroupSelectionIds(new Set());
                                        onSelectionChange(new Set());
                                        onGroupSelectionStateChange?.({ active: nextActive, count: 0 });
                                        if (isSelectionMode !== nextActive) onToggleSelectionMode();
                                    }}
                                />
                                {!isGroupSelectionMode && hasActiveStudentGroups && (canConfigureCardDisplay || isActiveGroupPlanOwnedByCurrentTeacher) && (
                                    <button type="button" onClick={() => setMoreActionTarget('group')} aria-label="小组更多操作" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-primary)]">
                                        <MenuIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </ClassDetailTabToolbar>
            )}

            <div className="flex-1 overflow-y-auto px-4 pb-40 pt-3">
                {activeGroupPlan && hasActiveStudentGroups ? (
                    <div className="space-y-3">
                        {activeGroupPlan.groups.map((group, index) => {
                            const isSelected = isGroupRecountSelection ? recountSelectedIds.has(group.id) : groupSelectionIds.has(group.id);
                            const members = group.memberIds.map(id => studentById.get(id)).filter(Boolean) as Student[];
                            const groupPerformance = getDisplayedGroupPerformance(group.id);
                            return (
                                <button
                                    type="button"
                                    key={group.id}
                                    onClick={() => isGroupRecountSelection
                                        ? handleToggleRecountGroup(group.id)
                                        : isGroupSelectionMode
                                            ? handleToggleGroupSelection(group.id)
                                            : handleOpenStudentGroupDetail(group.id)}
                                    aria-pressed={isGroupSelectionActive ? isSelected : undefined}
                                    aria-label={isGroupSelectionActive
                                        ? `${isSelected ? '取消选择' : '选择'}${group.name}`
                                        : `查看${group.name}`}
                                    className="relative flex min-h-[76px] w-full items-center gap-3 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-4 py-3 text-left [box-shadow:var(--tm-shadow-card)] transition-[transform,background-color] [transition-duration:var(--tm-duration-fast)] active:scale-[0.99]"
                                >
                                    <GroupAvatar avatarKey={group.avatarKey} index={index} />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{group.name}</span>
                                        <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{getGroupMemberSummary(members)}</span>
                                    </span>
                                    {!isGroupSelectionActive && (groupCardDisplaySettings.showPraiseCount || groupCardDisplaySettings.showCriticismCount) && (
                                        <GroupPerformanceMeta
                                            summary={groupPerformance}
                                            orientation="vertical"
                                            showPraiseCount={groupCardDisplaySettings.showPraiseCount}
                                            showCriticismCount={groupCardDisplaySettings.showCriticismCount}
                                            className="w-6 shrink-0"
                                        />
                                    )}
                                    {isGroupSelectionActive && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {isSelected ? <CheckCircleIcon className="h-5 w-5 text-[var(--tm-brand-primary)]" /> : <CircleIcon className="h-5 w-5 text-[var(--tm-border-subtle)]" />}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                        {isActiveGroupPlanOwnedByCurrentTeacher && !isGroupSelectionActive && (
                            <button
                                type="button"
                                onClick={handleStartAddStudentGroup}
                                className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]"
                            >
                                <PlusIcon className="h-4 w-4" />
                                添加小组
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex min-h-[380px] flex-col items-center justify-center gap-4">
                        <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.CHAIR} title="还没有分组" className="py-4" />
                        <button
                            type="button"
                            onClick={handleStartFirstGrouping}
                            className="flex min-h-11 items-center justify-center gap-1.5 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-5 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-brand-primary-pressed)]"
                        >
                            <PlusIcon className="h-4 w-4" />
                            开始分组
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative flex h-full flex-col bg-transparent">
            <div className="class-detail-titlebar-switcher sticky top-0 z-[45] flex h-11 items-center justify-between border-b border-white/40 bg-white/38 px-4 backdrop-blur-md">
                {onBack || recountTarget ? (
                    <button onClick={recountTarget ? handleCancelRecount : onBack} aria-label={recountTarget ? '退出重新计数' : '返回班级列表'} className="flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]">
                        <BackIcon className="h-5 w-5 text-[var(--tm-text-secondary)]" />
                    </button>
                ) : (
                    <div className="w-10" aria-hidden="true" />
                )}
                {recountTarget ? (
                    <h1 className="text-[15px] font-bold text-[var(--tm-text-primary)]">重新计数</h1>
                ) : (
                    <div className="grid w-40 grid-cols-2 text-center text-[15px] font-bold" role="tablist" aria-label="班级成员视图">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeView === 'student'}
                        onClick={() => handleSwitchView('student')}
                        className={`relative h-11 transition-colors active:scale-95 ${activeView === 'student' ? 'text-[var(--tm-brand-primary-strong)]' : 'text-[var(--tm-text-secondary)]'}`}
                    >
                        学生
                        {activeView === 'student' && <span className="absolute bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[var(--tm-brand-primary)]" />}
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeView === 'group'}
                        onClick={() => handleSwitchView('group')}
                        className={`relative h-11 transition-colors active:scale-95 ${activeView === 'group' ? 'text-[var(--tm-brand-primary-strong)]' : 'text-[var(--tm-text-secondary)]'}`}
                    >
                        分组
                        {activeView === 'group' && <span className="absolute bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[var(--tm-brand-primary)]" />}
                    </button>
                    </div>
                )}
                <div className="w-10" aria-hidden="true" />
            </div>

            {activeView === 'student' ? (
                <>
                    {renderStudentToolbar()}
                    {renderStudentGrid()}
                </>
            ) : renderGroupView()}

            {recountTarget && (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[60] mx-auto max-w-md px-4">
                    <button
                        type="button"
                        onClick={handleOpenRecountConfirmation}
                        disabled={recountSelectedCount === 0}
                        className="pointer-events-auto mx-auto flex min-h-[var(--tm-recount-bottom-action-height)] w-full max-w-[var(--tm-recount-bottom-action-max-width)] items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-floating)] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)] disabled:[box-shadow:var(--tm-shadow-control)]"
                    >
                        {`重新计数（${recountSelectedCount}）`}
                    </button>
                </div>
            )}

            <MobileBottomSheet
                open={Boolean(moreActionTarget)}
                title={moreActionTarget === 'group' ? '小组操作' : '学生操作'}
                onClose={() => setMoreActionTarget(null)}
            >
                <div className="space-y-1 pb-2">
                    {canConfigureCardDisplay && moreActionTarget && (
                        <button
                            type="button"
                            onClick={() => handleOpenCardDisplaySettings(moreActionTarget)}
                            className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]"
                        >
                            <EyeIcon className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" />
                            {moreActionTarget === 'group' ? '小组卡片展示' : '学生卡片展示'}
                        </button>
                    )}
                    {moreActionTarget && (
                        (moreActionTarget === 'student' && canResetStudentEvaluationCounts)
                        || (moreActionTarget === 'group' && isActiveGroupPlanOwnedByCurrentTeacher)
                    ) && (
                        <button
                            type="button"
                            onClick={() => handleStartRecountSelection(moreActionTarget)}
                            className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]"
                        >
                            <RetryIcon className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" />
                            重新计数
                        </button>
                    )}
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet
                open={Boolean(cardDisplayTarget)}
                title={cardDisplayTarget === 'group' ? '小组卡片展示' : '学生卡片展示'}
                onClose={() => setCardDisplayTarget(null)}
            >
                <div className="space-y-2 pb-2">
                    {cardDisplayTarget === 'student' ? (
                        <>
                            <MobileSettingsSwitchRow
                                label="显示等级"
                                checked={studentCardDisplaySettings.showLevel}
                                onChange={showLevel => onUpdateStudentCardDisplaySettings({ ...studentCardDisplaySettings, showLevel })}
                            />
                            <MobileSettingsSwitchRow
                                label="显示加分次数"
                                checked={studentCardDisplaySettings.showPraiseCount}
                                onChange={showPraiseCount => onUpdateStudentCardDisplaySettings({ ...studentCardDisplaySettings, showPraiseCount })}
                            />
                            <MobileSettingsSwitchRow
                                label="显示扣分次数"
                                checked={studentCardDisplaySettings.showCriticismCount}
                                onChange={showCriticismCount => onUpdateStudentCardDisplaySettings({ ...studentCardDisplaySettings, showCriticismCount })}
                            />
                        </>
                    ) : cardDisplayTarget === 'group' ? (
                        <>
                            <MobileSettingsSwitchRow
                                label="显示加分次数"
                                checked={groupCardDisplaySettings.showPraiseCount}
                                onChange={showPraiseCount => onUpdateGroupCardDisplaySettings({ ...groupCardDisplaySettings, showPraiseCount })}
                            />
                            <MobileSettingsSwitchRow
                                label="显示扣分次数"
                                checked={groupCardDisplaySettings.showCriticismCount}
                                onChange={showCriticismCount => onUpdateGroupCardDisplaySettings({ ...groupCardDisplaySettings, showCriticismCount })}
                            />
                        </>
                    ) : null}
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet
                open={showRecountConfirmation}
                title="确认重新计数"
                onClose={resetRecountConfirmation}
                footerDivider={false}
                footer={(
                    <div className="relative">
                        <MobileActionToast message={recountConfirmationNotice} />
                        <button type="button" onClick={handleConfirmRecount} disabled={recountCountdown > 0} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative)] px-4 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-status-negative-strong)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">
                            {recountCountdown > 0 ? `${recountCountdown}秒后可确认` : '确认重新计数'}
                        </button>
                    </div>
                )}
            >
                <div className="space-y-4 pb-2">
                    <p className="text-pretty text-[length:var(--tm-font-size-body)] font-medium leading-6 text-[var(--tm-text-secondary)]">
                        重新计数以后，卡片上的数字将清零。已有的评价记录、积分等不受影响。
                    </p>
                    <label className="flex min-h-11 select-none items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-primary)]">
                        <input
                            type="checkbox"
                            checked={recountAcknowledged}
                            onChange={event => handleToggleRecountAcknowledgement(event.target.checked)}
                            className="sr-only"
                        />
                        <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] transition-colors [transition-duration:var(--tm-duration-fast)] ${recountAcknowledged ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface)]'}`}>
                            {recountAcknowledged && <CheckIcon className="h-3.5 w-3.5 text-[var(--tm-text-inverse)] [stroke-width:3]" />}
                        </span>
                        <span>重置后不可恢复，我已知晓</span>
                    </label>
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet open={showGroupPlanSheet} title="切换分组方案" onClose={() => setShowGroupPlanSheet(false)}>
                <div className="pb-2">
                    <div className="space-y-1">
                        {orderedGroupPlans.map(plan => {
                            const memberCount = new Set(plan.groups.flatMap(group => group.memberIds)).size;
                            const isCurrent = plan.id === activeGroupPlan?.id;
                            const isOwned = plan.ownerName === currentTeacherName;
                            return (
                                <div key={plan.id} className="flex min-h-[68px] items-center rounded-[var(--tm-radius-control)] active:bg-[var(--tm-bg-surface-soft)]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveGroupPlanId(plan.id);
                                            setShowGroupPlanSheet(false);
                                            setIsGroupSelectionMode(false);
                                            setGroupSelectionIds(new Set());
                                            onSelectionChange(new Set());
                                        }}
                                        aria-pressed={isCurrent}
                                        className="flex min-h-[68px] min-w-0 flex-1 items-center gap-3 px-3 text-left"
                                    >
                                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isCurrent ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`}>
                                            {isCurrent && <CheckIcon className="h-3 w-3 text-white [stroke-width:3]" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{plan.name}</span>
                                            <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{plan.ownerName}创建 · {plan.groups.length}个小组 · {memberCount}人</span>
                                        </span>
                                    </button>
                                    {isOwned && (
                                        <button type="button" onClick={() => handleOpenGroupPlanActions(plan)} aria-label={`管理${plan.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-muted)]">
                                            <MenuIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <button type="button" onClick={groupPlans.length > 0 ? handleStartNewGrouping : handleStartFirstGrouping} className="mt-2 flex min-h-[52px] w-full items-center gap-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tm-brand-primary)] text-white"><PlusIcon className="h-4 w-4" /></span>
                        {groupPlans.length > 0 ? '新建另一套分组' : '开始分组'}
                    </button>
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet open={showNewGroupNameSheet} title="新建另一套分组" onClose={handleCloseNewGroupingDetails} footerDivider={false} footer={(
                <button type="button" onClick={handleCreateNamedGrouping} disabled={!newGroupName.trim() || !newStudentGroupName.trim()} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">选择学生</button>
            )}>
                <div className="space-y-4 py-2">
                    <label className="block">
                        <span className="mb-2 block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">分组方案名称</span>
                        <input value={newGroupName} onChange={event => setNewGroupName(event.target.value)} maxLength={20} placeholder="例如：数学分组" aria-label="分组方案名称" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)]" />
                    </label>
                    <label className="block">
                        <span className="mb-2 block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">第一个小组名称</span>
                        <input value={newStudentGroupName} onChange={event => setNewStudentGroupName(event.target.value)} maxLength={20} placeholder="例如：数学1组" aria-label="第一个小组名称" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)]" />
                    </label>
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet
                open={showNewStudentGroupNameSheet}
                title={addStudentGroupStep === 'name' ? '添加小组' : '选择学生'}
                size={addStudentGroupStep === 'members' ? 'tall' : 'content'}
                contentInset={addStudentGroupStep === 'members' ? 'compact' : 'standard'}
                contentTone={addStudentGroupStep === 'members' ? 'plain' : 'surface'}
                footerDivider={false}
                onClose={handleCloseStudentGroupNameSheet}
                header={addStudentGroupStep === 'members' ? (
                    <header className="grid h-14 shrink-0 grid-cols-[44px_1fr_44px] items-center px-2">
                        <button type="button" onClick={handleReturnToStudentGroupName} aria-label="返回上一步" className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
                            <BackIcon className="h-5 w-5" />
                        </button>
                        <h2 className="truncate text-center text-[17px] font-semibold text-[var(--tm-text-primary)]">选择学生</h2>
                        <button type="button" onClick={handleCloseStudentGroupNameSheet} aria-label="关闭选择学生" className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
                            <CloseIcon className="h-5 w-5" />
                        </button>
                    </header>
                ) : undefined}
                footer={addStudentGroupStep === 'name' ? (
                    <button type="button" onClick={handleConfirmStudentGroupName} disabled={!newStudentGroupName.trim()} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">选择学生</button>
                ) : (
                    <div className="relative">
                        <MobileActionToast message={studentSelectionMoveNotice} />
                        <button type="button" onClick={handleFinishGrouping} disabled={!draftActiveGroup?.memberIds.length} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">
                            {draftActiveGroup?.memberIds.length
                                ? `完成（${draftActiveGroup.memberIds.length}人${addGroupMovedStudentCount > 0 ? `，含移动${addGroupMovedStudentCount}人` : ''}）`
                                : '完成'}
                        </button>
                    </div>
                )}
            >
                {addStudentGroupStep === 'name' ? (
                    <label className="block py-2">
                        <span className="mb-2 block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">小组名称</span>
                        <input value={newStudentGroupName} onChange={event => setNewStudentGroupName(event.target.value)} maxLength={20} placeholder="例如：语文1组" aria-label="小组名称" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)]" />
                    </label>
                ) : (
                    <div className="min-h-full">
                        <div className="sticky top-0 z-20 -mx-3 bg-[var(--tm-bg-surface)] px-3 py-2">
                            <MobileSearchInput value={draftSearchQuery} onChange={event => setDraftSearchQuery(event.target.value)} placeholder="搜索姓名、学号" aria-label="搜索学生" density="compact" appearance="filled" containerClassName="flex min-h-11 items-center" />
                        </div>
                        {groupEditor?.mode === 'add-group' && (
                            <OnlyUngroupedFilter
                                checked={addGroupShowOnlyUngrouped}
                                ungroupedCount={addGroupUngroupedStudentIds?.size ?? 0}
                                onChange={setAddGroupShowOnlyUngrouped}
                            />
                        )}
                        <StudentCompactSelectGrid
                            sections={draftStudentSelectionSections}
                            className={groupEditor?.mode === 'add-group' ? 'pt-1' : 'pt-3'}
                            isSelected={studentId => draftActiveGroup?.memberIds.includes(studentId) ?? false}
                            getSelectionDescription={student => {
                                const assignedGroup = groupEditor?.mode === 'add-group' ? activeGroupMembershipByStudentId.get(student.id) : undefined;
                                return assignedGroup ? `当前在${assignedGroup.name}` : '未分组';
                            }}
                            onToggle={handleToggleDraftStudent}
                        />
                        {draftVisibleStudents.length === 0 && (
                            <MobileEmptyState
                                imageSrc={draftSearchQuery.trim() ? ASSETS.DEFAULT_STATE.MAGNIFIER : ASSETS.DEFAULT_STATE.CHAIR}
                                title={draftSearchQuery.trim() ? '没有匹配的学生' : groupEditor?.mode === 'add-group' && addGroupShowOnlyUngrouped ? '没有未分组学生' : '暂无学生'}
                                className="min-h-[320px] py-4"
                            />
                        )}
                    </div>
                )}
            </MobileBottomSheet>

            <MobileBottomSheet
                open={Boolean(groupDetailTarget)}
                title={groupDetailMode === 'adjust' ? '调整学生' : groupDetailMode === 'settings' ? '小组设置' : '小组详情'}
                size="tall"
                contentInset="compact"
                contentTone="plain"
                footerDivider={false}
                onClose={handleCloseStudentGroupDetail}
                header={(
                    <header className="flex h-14 shrink-0 items-center px-2">
                        {groupDetailMode !== 'view' ? (
                            <>
                                <button type="button" onClick={handleBackToStudentGroupDetail} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回小组详情">
                                    <BackIcon className="h-5 w-5" />
                                </button>
                                <h2 className="min-w-0 flex-1 truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">{groupDetailMode === 'adjust' ? '调整学生' : '小组设置'}</h2>
                            </>
                        ) : (
                            <div className="min-w-0 flex-1 pl-2">
                                <h2 className="truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">小组详情</h2>
                            </div>
                        )}
                        <div className="flex shrink-0 items-center">
                            <button type="button" onClick={handleCloseStudentGroupDetail} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="关闭小组详情">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </header>
                )}
                footer={groupDetailMode === 'adjust' ? (
                    <div className="relative">
                        <MobileActionToast message={studentSelectionMoveNotice} />
                        <button type="button" onClick={handleSaveAdjustStudentGroup} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)]">
                            {`保存（${adjustStudentGroupMemberIds.size}人${adjustStudentGroupMovedStudentCount > 0 ? `，含移动${adjustStudentGroupMovedStudentCount}人` : ''}）`}
                        </button>
                    </div>
                ) : groupDetailMode === 'settings' ? (
                    <button type="button" onClick={handleSaveStudentGroupSettings} disabled={!renameStudentGroupName.trim()} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">
                        保存
                    </button>
                ) : isActiveGroupPlanOwnedByCurrentTeacher ? (
                    <button type="button" onClick={handleStartAdjustStudentGroup} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)]">
                        调整学生
                    </button>
                ) : undefined}
            >
                {groupDetailMode === 'view' ? (
                    <div className="min-h-full pb-3">
                        <div className="-mx-3 flex min-h-[84px] items-center gap-3 bg-[var(--tm-bg-surface)] px-4 py-3">
                            <GroupAvatar avatarKey={groupDetailTarget?.avatarKey} index={Math.max(activeGroupPlan?.groups.findIndex(group => group.id === groupDetailTarget?.id) ?? 0, 0)} size="sheet" />
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{groupDetailTarget?.name}</div>
                                <div className="mt-1 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">{groupDetailMembers?.length || 0}名学生</div>
                            </div>
                            {isActiveGroupPlanOwnedByCurrentTeacher && (
                                <div className="-mr-1 flex shrink-0 items-center gap-1">
                                    <button type="button" onClick={handleStartEditStudentGroup} className="flex min-h-11 shrink-0 items-center gap-1 px-1.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]" aria-label="编辑小组信息">
                                        <EditIcon className="h-4 w-4 text-[var(--tm-action-icon-neutral)]" />
                                        编辑
                                    </button>
                                    <button type="button" onClick={handleRequestDissolveStudentGroup} className="flex min-h-11 shrink-0 items-center gap-1 px-1.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-status-negative)] active:text-[var(--tm-status-negative-strong)]" aria-label="解散小组">
                                        <DeleteIcon className="h-4 w-4 text-[var(--tm-action-icon-danger)]" />
                                        解散
                                    </button>
                                </div>
                            )}
                        </div>
                        {(groupDetailMembers?.length || 0) > 0 ? (
                            <div className="student-roster-grid grid gap-x-2.5 gap-y-3 pt-3">
                                {groupDetailMembers?.map((student, index) => {
                                    const performance = getDisplayedStudentPerformance(student);
                                    return (
                                        <StudentRosterCard
                                            key={student.id}
                                            student={student}
                                            index={index}
                                            performance={performance}
                                            levelNetScore={levelNetScoreByStudentId[student.id]}
                                            displaySettings={studentCardDisplaySettings}
                                            showSelection={false}
                                            selected={false}
                                            onClick={() => handleOpenGroupMemberStudent(student)}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.CHAIR} title="暂无学生" className="min-h-[360px] py-4" />
                        )}
                    </div>
                ) : groupDetailMode === 'adjust' ? (
                    <div className="min-h-full">
                        <div className="sticky top-0 z-20 -mx-3 bg-[var(--tm-bg-surface)] px-3 py-2">
                            <MobileSearchInput value={adjustStudentGroupSearchQuery} onChange={event => setAdjustStudentGroupSearchQuery(event.target.value)} placeholder="搜索姓名、学号" aria-label="搜索学生" density="compact" appearance="filled" containerClassName="flex min-h-11 items-center" />
                        </div>
                        <OnlyUngroupedFilter
                            checked={adjustStudentGroupShowOnlyUngrouped}
                            ungroupedCount={activeGroupUngroupedCount}
                            onChange={setAdjustStudentGroupShowOnlyUngrouped}
                        />
                        <StudentCompactSelectGrid
                            sections={adjustStudentSelectionSections}
                            className="pt-1"
                            isSelected={studentId => adjustStudentGroupMemberIds.has(studentId)}
                            getSelectionDescription={student => {
                                const assignedGroup = activeGroupMembershipByStudentId.get(student.id);
                                return assignedGroup ? `当前在${assignedGroup.name}` : '未分组';
                            }}
                            onToggle={handleToggleAdjustStudentGroupMember}
                        />
                        {adjustStudentGroupVisibleStudents.length === 0 && (
                            <MobileEmptyState
                                imageSrc={adjustStudentGroupSearchQuery.trim() ? ASSETS.DEFAULT_STATE.MAGNIFIER : ASSETS.DEFAULT_STATE.CHAIR}
                                title={adjustStudentGroupSearchQuery.trim() ? '没有匹配的学生' : adjustStudentGroupShowOnlyUngrouped ? '没有未分组学生' : '暂无学生'}
                                className="min-h-[320px] py-4"
                            />
                        )}
                    </div>
                ) : (
                    <div className="-mx-3 min-h-full space-y-3 pb-3">
                        <section className="bg-[var(--tm-bg-surface)] px-4 py-4">
                            <h3 className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">小组头像</h3>
                            <div className="mt-3 grid grid-cols-4 gap-3">
                                {studentGroupAvatarOptions.map((preset) => {
                                    const selected = preset.key === studentGroupAvatarKey;
                                    return (
                                        <button
                                            type="button"
                                            key={preset.key}
                                            onClick={() => setStudentGroupAvatarKey(preset.key)}
                                            aria-pressed={selected}
                                            aria-label={`${selected ? '已选择' : '选择'}${preset.label}小组头像`}
                                            className={`relative aspect-square min-w-0 overflow-hidden rounded-[var(--tm-radius-inner)] border-2 bg-[var(--tm-bg-surface-soft)] transition-transform active:scale-95 ${selected ? 'border-[var(--tm-brand-primary)] ring-2 ring-[var(--tm-brand-primary-soft-strong)]' : 'border-transparent'}`}
                                        >
                                            <img src={preset.src} alt="" className="h-full w-full object-cover" decoding="async" />
                                            {selected && (
                                                <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[var(--tm-brand-primary)] text-white [box-shadow:var(--tm-shadow-icon)]" aria-hidden="true">
                                                    <CheckIcon className="h-3.5 w-3.5 [stroke-width:3]" />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                        <section className="bg-[var(--tm-bg-surface)] px-4 py-4">
                            <label className="block">
                                <span className="mb-2 block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">小组名称</span>
                                <input value={renameStudentGroupName} onChange={event => setRenameStudentGroupName(event.target.value)} maxLength={20} aria-label="小组名称" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none" />
                            </label>
                        </section>
                    </div>
                )}
            </MobileBottomSheet>

            <MobileBottomSheet open={Boolean(groupPlanActionTarget)} title={groupPlanActionTarget?.name || '分组管理'} onClose={() => setGroupPlanActionTarget(null)}>
                <div className="space-y-1 pb-2">
                    <button type="button" onClick={handleStartRenameGroupPlan} className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]">
                        <EditIcon className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" />
                        重命名
                    </button>
                    <button type="button" onClick={handleRequestDeleteGroupPlan} className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-soft)]">
                        <DeleteIcon className="h-5 w-5 text-[var(--tm-action-icon-danger)]" />
                        删除这套分组
                    </button>
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet open={Boolean(renameGroupPlanTarget)} title="重命名分组" onClose={() => setRenameGroupPlanTarget(null)} footerDivider={false} footer={(
                <button type="button" onClick={handleConfirmRenameGroupPlan} disabled={!renameGroupPlanName.trim()} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">保存</button>
            )}>
                <label className="block py-2">
                    <span className="mb-2 block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">分组名称</span>
                    <input value={renameGroupPlanName} onChange={event => setRenameGroupPlanName(event.target.value)} maxLength={20} aria-label="新的分组名称" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none" />
                </label>
            </MobileBottomSheet>

            <MobileConfirmSheet
                open={Boolean(deleteGroupPlanTarget)}
                title={`删除“${deleteGroupPlanTarget?.name || ''}”？`}
                description={`其中的${deleteGroupPlanTarget?.groups.length || 0}个小组将一起删除，学生信息不会受到影响。`}
                confirmLabel="确认删除"
                tone="danger"
                onClose={() => setDeleteGroupPlanTarget(null)}
                onConfirm={handleConfirmDeleteGroupPlan}
            />

            <MobileConfirmSheet
                open={Boolean(dissolveStudentGroupTarget)}
                title={`解散“${dissolveStudentGroupTarget?.name || ''}”？`}
                description={`组内${dissolveStudentGroupTarget?.memberIds.length || 0}名学生将变为未分组，学生信息不会删除。`}
                confirmLabel="确认解散"
                tone="danger"
                onClose={() => setDissolveStudentGroupTargetId(null)}
                onConfirm={handleConfirmDissolveStudentGroup}
            />

            <MobileConfirmSheet
                open={showDiscardGroupingConfirm}
                title="放弃本次创建？"
                description="已完成的分组内容不会保存。"
                confirmLabel="放弃创建"
                tone="danger"
                onClose={handleCloseDiscardGroupingConfirm}
                onConfirm={handleConfirmDiscardGrouping}
            />

            <MobileToast message={groupingToastMessage} />

        </div>
    );
};

export default ClassDetailView;
