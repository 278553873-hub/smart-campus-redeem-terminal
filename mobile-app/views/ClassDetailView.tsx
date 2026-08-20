import React, { useEffect, useMemo, useState } from 'react';
import { Student, ClassInfo, GroupPlan, StudentGroup } from '../types';
import { GET_MOCK_GROUP_PLANS_FOR_CLASS } from '../constants';
import { BackIcon, MaleIcon, FemaleIcon, CheckIcon, CheckCircleIcon, CircleIcon, SearchIcon, ChevronDownIcon, PlusIcon, MenuIcon, EditIcon, DeleteIcon } from '../components/Icons';
import { ASSETS } from '../assets/images';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import MobileSearchInput from '../components/ui/MobileSearchInput';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
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
    onStartRecord?: (studentIds: string[]) => void;
    onViewRecords?: () => void;
    onBack?: () => void;
    onGroupingEditorChange?: (open: boolean) => void;
    performanceByStudentId?: Record<string, StudentPerformanceSummary>;
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

const ClassDetailView: React.FC<ClassDetailViewProps> = ({
    classInfo,
    students,
    currentTeacherName,
    onSelectStudent,
    isSelectionMode,
    onToggleSelectionMode,
    selectedIds,
    onSelectionChange,
    onBack,
    onGroupingEditorChange,
    performanceByStudentId = {},
}) => {
    const [activeView, setActiveView] = useState<'student' | 'group'>('student');
    const [searchQuery, setSearchQuery] = useState('');
    const [groupPlans, setGroupPlans] = useState<GroupPlan[]>(() => GET_MOCK_GROUP_PLANS_FOR_CLASS(classInfo.id, students, currentTeacherName));
    const [activeGroupPlanId, setActiveGroupPlanId] = useState('');
    const [showGroupPlanSheet, setShowGroupPlanSheet] = useState(false);
    const [isGroupSelectionMode, setIsGroupSelectionMode] = useState(false);
    const [groupSelectionIds, setGroupSelectionIds] = useState<Set<string>>(new Set());
    const [groupEditor, setGroupEditor] = useState<{ mode: 'create' | 'edit'; planId: string; name: string; groups: StudentGroup[] } | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [showNewGroupNameSheet, setShowNewGroupNameSheet] = useState(false);
    const [groupPlanActionTarget, setGroupPlanActionTarget] = useState<GroupPlan | null>(null);
    const [renameGroupPlanTarget, setRenameGroupPlanTarget] = useState<GroupPlan | null>(null);
    const [renameGroupPlanName, setRenameGroupPlanName] = useState('');
    const [deleteGroupPlanTarget, setDeleteGroupPlanTarget] = useState<GroupPlan | null>(null);
    const [deleteDraftGroupTarget, setDeleteDraftGroupTarget] = useState<StudentGroup | null>(null);
    const [showDiscardGroupingConfirm, setShowDiscardGroupingConfirm] = useState(false);
    const [draftActiveGroupId, setDraftActiveGroupId] = useState('');
    const [draftSearchQuery, setDraftSearchQuery] = useState('');
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
        setGroupEditor(null);
        setShowNewGroupNameSheet(false);
        setGroupPlanActionTarget(null);
        setRenameGroupPlanTarget(null);
        setDeleteGroupPlanTarget(null);
        setDeleteDraftGroupTarget(null);
        setShowDiscardGroupingConfirm(false);
        setDraftSearchQuery('');
        setSearchQuery('');
    }, [activeStudentKey, classInfo.id, currentTeacherName]);

    useEffect(() => {
        if (!activeGroupPlanId && groupPlans.length > 0) {
            setActiveGroupPlanId(groupPlans[0].id);
        }
    }, [activeGroupPlanId, groupPlans]);

    const isGroupingEditorOpen = Boolean(groupEditor);

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

    const studentById = useMemo(() => new Map(activeStudents.map(student => [student.id, student])), [activeStudents]);

    const draftMembershipByStudentId = useMemo(() => {
        const membership = new Map<string, string>();
        groupEditor?.groups.forEach(group => group.memberIds.forEach(studentId => membership.set(studentId, group.id)));
        return membership;
    }, [groupEditor]);

    const draftVisibleStudents = useMemo(() => {
        const normalizedQuery = draftSearchQuery.trim().replace(/\s+/g, '').toLowerCase();
        return activeStudents.filter(student => (
            !normalizedQuery
            || student.name.includes(normalizedQuery)
            || student.id.toLowerCase().includes(normalizedQuery)
            || (student.studentNo || '').toLowerCase().includes(normalizedQuery)
        ));
    }, [activeStudents, draftSearchQuery]);

    const draftActiveGroup = groupEditor?.groups.find(group => group.id === draftActiveGroupId) || groupEditor?.groups[0] || null;
    const draftUnassignedCount = activeStudents.filter(student => !draftMembershipByStudentId.has(student.id)).length;

    const visibleStudents = useMemo(() => {
        const normalizedSearchQuery = searchQuery.trim().replace(/\s+/g, '').toLowerCase();
        return activeStudents.filter(student => {
            return !normalizedSearchQuery
                || student.name.includes(normalizedSearchQuery)
                || student.id.toLowerCase().includes(normalizedSearchQuery)
                || (student.studentNo || '').toLowerCase().includes(normalizedSearchQuery);
        });
    }, [activeStudents, searchQuery]);

    const isAllVisibleSelected = useMemo(() => {
        return visibleStudents.length > 0 && visibleStudents.every(student => selectedIds.has(student.id));
    }, [selectedIds, visibleStudents]);
    const isMaleQuickSelectionActive = studentsByGender.male.length > 0
        && selectedIds.size === studentsByGender.male.length
        && studentsByGender.male.every(student => selectedIds.has(student.id));
    const isFemaleQuickSelectionActive = studentsByGender.female.length > 0
        && selectedIds.size === studentsByGender.female.length
        && studentsByGender.female.every(student => selectedIds.has(student.id));

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        onSelectionChange(newSet);
    };

    const handleStudentClick = (student: Student) => {
        if (isSelectionMode) {
            toggleSelection(student.id);
        } else {
            onSelectStudent(student);
        }
    };

    const handleSelectAllVisibleStudents = () => {
        const next = new Set(selectedIds);
        visibleStudents.forEach(student => next.add(student.id));
        onSelectionChange(next);
    };

    const handleClearVisibleStudents = () => {
        const visibleIds = new Set(visibleStudents.map(student => student.id));
        const next = new Set(Array.from(selectedIds).filter(id => !visibleIds.has(id)));
        onSelectionChange(next);
    };

    const handleInvertVisibleStudents = () => {
        const next = new Set(selectedIds);
        visibleStudents.forEach(student => {
            if (next.has(student.id)) next.delete(student.id);
            else next.add(student.id);
        });
        onSelectionChange(next);
    };

    const handleToggleGenderSelection = (gender: Student['gender']) => {
        const genderStudents = studentsByGender[gender];
        const isCurrentQuickSelectionActive = gender === 'male'
            ? isMaleQuickSelectionActive
            : isFemaleQuickSelectionActive;
        onSelectionChange(isCurrentQuickSelectionActive
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
        onSelectionChange(new Set());
        setActiveView(view);
    };

    const handleToggleGroupSelection = (groupId: string) => {
        const next = new Set(groupSelectionIds);
        if (next.has(groupId)) next.delete(groupId);
        else next.add(groupId);
        setGroupSelectionIds(next);
        const memberIds = activeGroupPlan?.groups
            .filter(group => next.has(group.id))
            .flatMap(group => group.memberIds) ?? [];
        onSelectionChange(new Set(memberIds));
    };

    const createDraftGroups = (planId: string) => ([{
        id: `${planId}-group-1-${Date.now()}`,
        name: '第1组',
        memberIds: [],
    }]);

    const handleStartFirstGrouping = () => {
        const planId = `${classInfo.id}-custom-plan-${Date.now()}`;
        const groups = createDraftGroups(planId);
        setDraftActiveGroupId(groups[0].id);
        setDraftSearchQuery('');
        setGroupEditor({ mode: 'create', planId, name: '常用分组', groups });
        setShowGroupPlanSheet(false);
    };

    const handleStartNewGrouping = () => {
        setNewGroupName('');
        setShowGroupPlanSheet(false);
        setShowNewGroupNameSheet(true);
    };

    const handleCreateNamedGrouping = () => {
        const name = newGroupName.trim();
        if (!name) return;
        const planId = `${classInfo.id}-custom-plan-${Date.now()}`;
        const groups = createDraftGroups(planId);
        setDraftActiveGroupId(groups[0].id);
        setDraftSearchQuery('');
        setShowNewGroupNameSheet(false);
        setGroupEditor({ mode: 'create', planId, name, groups });
    };

    const handleEditActiveGrouping = () => {
        if (!activeGroupPlan || !isActiveGroupPlanOwnedByCurrentTeacher) return;
        const groups = activeGroupPlan.groups.map(group => ({ ...group, memberIds: [...group.memberIds] }));
        setDraftActiveGroupId(groups[0]?.id || '');
        setDraftSearchQuery('');
        setGroupEditor({ mode: 'edit', planId: activeGroupPlan.id, name: activeGroupPlan.name, groups });
    };

    const handleToggleDraftStudent = (studentId: string) => {
        if (!groupEditor || !draftActiveGroup) return;
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

    const handleAddDraftGroup = () => {
        if (!groupEditor) return;
        let nextIndex = 1;
        while (groupEditor.groups.some(group => group.name === `第${nextIndex}组`)) nextIndex += 1;
        const nextGroup = {
            id: `${groupEditor.planId}-group-${nextIndex}-${Date.now()}`,
            name: `第${nextIndex}组`,
            memberIds: [],
        };
        setGroupEditor(current => current ? { ...current, groups: [...current.groups, nextGroup] } : current);
        setDraftActiveGroupId(nextGroup.id);
    };

    const handleRequestCloseGroupEditor = () => {
        if (!groupEditor) return;
        if (groupEditor.mode === 'create') {
            setShowDiscardGroupingConfirm(true);
            return;
        }
        setGroupEditor(null);
        setDraftSearchQuery('');
    };

    const handleConfirmDiscardGrouping = () => {
        setShowDiscardGroupingConfirm(false);
        setGroupEditor(null);
        setDraftSearchQuery('');
    };

    const handleConfirmDeleteDraftGroup = () => {
        if (!groupEditor || !deleteDraftGroupTarget || groupEditor.groups.length <= 1) return;
        const deletedIndex = groupEditor.groups.findIndex(group => group.id === deleteDraftGroupTarget.id);
        const remainingGroups = groupEditor.groups
            .filter(group => group.id !== deleteDraftGroupTarget.id)
            .map((group, index) => ({ ...group, name: `第${index + 1}组` }));
        const nextActiveGroup = remainingGroups[Math.min(Math.max(deletedIndex, 0), remainingGroups.length - 1)];
        setGroupEditor({ ...groupEditor, groups: remainingGroups });
        setDraftActiveGroupId(nextActiveGroup.id);
        setDeleteDraftGroupTarget(null);
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
        const nextPlan: GroupPlan = {
            id: groupEditor.planId,
            name: groupEditor.name,
            subject: '自定义',
            ownerName: currentTeacherName,
            groups: groupEditor.groups,
        };
        setGroupPlans(current => groupEditor.mode === 'edit'
            ? current.map(plan => plan.id === nextPlan.id ? nextPlan : plan)
            : [...current, nextPlan]);
        setActiveGroupPlanId(nextPlan.id);
        setGroupEditor(null);
        setDraftSearchQuery('');
        setActiveView('group');
    };

    const renderStudentToolbar = () => (
        <div className="sticky top-0 z-10 border-b border-white/70 bg-white/92 px-4 py-1 backdrop-blur-xl shadow-sm">
            <div className="student-action-row flex min-h-11 items-center gap-1.5">
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

                    <button
                        onClick={() => {
                            if (!isSelectionMode) {
                                setSearchQuery('');
                            }
                            onToggleSelectionMode();
                        }}
                        className={`min-h-11 shrink-0 rounded-[var(--tm-radius-control)] px-2.5 text-[13px] font-semibold transition active:scale-95 ${isSelectionMode ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-primary)]'}`}
                    >
                        {isSelectionMode ? '取消' : '多选'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStudentGrid = () => (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-40 pt-3">
            <div className="student-roster-grid grid shrink-0 gap-x-2.5 gap-y-3">
                {visibleStudents.map((student, index) => {
                    const isSelected = selectedIds.has(student.id);
                    const [bgClass, textClass, borderClass] = getAvatarStyle(student, index);
                    const nameChar = student.name.slice(-1);
                    const studentNo = student.studentNo || student.id;
                    const rosterNumber = getClassRosterNumber(studentNo);
                    const performance = performanceByStudentId[student.id] ?? createDemoStudentPerformanceSummary(student);
                    const level = getStudentPerformanceLevel(performance.netScore);

                    return (
                        <button
                            type="button"
                            key={student.id}
                            onClick={() => handleStudentClick(student)}
                            aria-pressed={isSelectionMode ? isSelected : undefined}
                            aria-label={`${student.name}，学号${studentNo}，净得分${performance.netScore}分，被表扬${performance.praiseCount}次，被批评${performance.criticismCount}次`}
                            className="relative flex h-[120px] min-w-0 select-none flex-col items-center overflow-visible rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] py-1 text-center [box-shadow:var(--tm-shadow-card)] transition-[transform,box-shadow] [transition-duration:var(--tm-duration-standard)] active:scale-[0.96] motion-reduce:transition-none"
                        >
                            {isSelectionMode && (
                                <span className={`absolute -right-1 -top-1 z-20 flex h-[18px] w-[18px] items-center justify-center rounded-full animate-in fade-in zoom-in duration-200 ${isSelected ? 'bg-[var(--tm-brand-primary)]' : 'bg-white'}`}>
                                    {isSelected
                                        ? <CheckIcon className="h-3 w-3 text-white [stroke-width:3]" />
                                        : <CircleIcon className="h-[18px] w-[18px] fill-white text-[var(--tm-border-subtle)]" />
                                    }
                                </span>
                            )}
                            <StudentPerformanceLevelIcons level={level} />
                            <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center">
                                <StudentPerformanceAvatar
                                    compact
                                    student={{ ...student, avatar: student.avatar || (student.gender === 'female' ? ASSETS.AVATAR.STUDENT_GIRL_DEFAULT : undefined) }}
                                    fallbackText={nameChar}
                                    fallbackClassName={`${bgClass} ${textClass} border ${borderClass}`}
                                    level={level}
                                />
                            </span>
                            <StudentPerformanceCounts summary={performance} />
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
            <div className="sticky top-0 z-10 border-b border-[var(--tm-border-subtle)] bg-[var(--tm-page-plain-header-bg)] px-4 pb-3 pt-1 [box-shadow:var(--tm-shadow-control)]">
                <div className="flex min-h-11 items-center justify-center">
                    {activeGroupPlan ? (
                        <button
                            type="button"
                            onClick={() => setShowGroupPlanSheet(true)}
                            aria-label="切换分组"
                            className="flex min-h-11 max-w-[80%] items-center justify-center gap-1.5 px-3 text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)] active:text-[var(--tm-brand-primary)]"
                        >
                            <span className="truncate">{activeGroupPlan.name}</span>
                            <ChevronDownIcon className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
                        </button>
                    ) : (
                        <span className="text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">分组</span>
                    )}
                </div>
                {activeGroupPlan && (
                    <div className="flex min-h-8 items-center justify-between gap-2">
                        <div className="min-w-0 truncate text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
                            {activeGroupPlan.ownerName}创建
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            {isActiveGroupPlanOwnedByCurrentTeacher && (
                                <button
                                    type="button"
                                    onClick={handleEditActiveGrouping}
                                    className="flex min-h-11 items-center justify-center px-2.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] active:text-[var(--tm-brand-primary-pressed)]"
                                >
                                    调整分组
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsGroupSelectionMode(prev => !prev);
                                    setGroupSelectionIds(new Set());
                                    onSelectionChange(new Set());
                                }}
                                className="flex min-h-11 items-center justify-center px-2.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] active:text-[var(--tm-brand-primary)]"
                            >
                                {isGroupSelectionMode ? '取消' : '多选'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-40 pt-3">
                {activeGroupPlan ? (
                    <div className="space-y-3">
                        {activeGroupPlan.groups.map((group, index) => {
                            const isSelected = groupSelectionIds.has(group.id);
                            const members = group.memberIds.map(id => studentById.get(id)).filter(Boolean) as Student[];
                            const previewNames = members.slice(0, 4).map(student => student.name).join('、');
                            return (
                                <button
                                    type="button"
                                    key={group.id}
                                    onClick={() => isGroupSelectionMode && handleToggleGroupSelection(group.id)}
                                    disabled={!isGroupSelectionMode}
                                    aria-pressed={isGroupSelectionMode ? isSelected : undefined}
                                    className="relative flex min-h-[88px] w-full items-center gap-3 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-4 py-3 text-left [box-shadow:var(--tm-shadow-card)] transition-[transform,background-color] [transition-duration:var(--tm-duration-fast)] active:scale-[0.99]"
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-tag-gold-soft)] text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-tag-gold-strong)]">{index + 1}</span>
                                    <span className="min-w-0 flex-1 pr-7">
                                        <span className="block truncate text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{group.name}</span>
                                        <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{members.length}名学生 · {previewNames || '暂未添加学生'}{members.length > 4 ? '等' : ''}</span>
                                    </span>
                                    {isGroupSelectionMode && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {isSelected ? <CheckCircleIcon className="h-5 w-5 text-[var(--tm-brand-primary)]" /> : <CircleIcon className="h-5 w-5 text-[var(--tm-border-subtle)]" />}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
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

    const renderGroupEditor = () => (
        <div className="absolute inset-0 z-40 flex min-h-0 flex-col bg-[var(--tm-page-plain-content-bg)]">
            <header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-page-plain-header-bg)] px-2">
                <button type="button" onClick={handleRequestCloseGroupEditor} aria-label="返回分组" className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
                    <BackIcon className="h-5 w-5" />
                </button>
                <h2 className="max-w-[56%] truncate text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">{groupEditor?.mode === 'create' ? '创建分组' : '调整分组'}</h2>
                <div className="w-11" aria-hidden="true" />
            </header>
            <div className="shrink-0 border-b border-[var(--tm-border-subtle)] bg-[var(--tm-page-plain-header-bg)] px-4 pb-3 pt-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="truncate text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{groupEditor?.name}</div>
                        <div className="mt-1 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">已分组 {activeStudents.length - draftUnassignedCount}/{activeStudents.length}</div>
                    </div>
                    <button type="button" onClick={handleFinishGrouping} className="flex min-h-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)]">完成</button>
                </div>
                <div className="mt-3 flex items-center gap-1">
                    <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto no-scrollbar">
                        {groupEditor?.groups.map(group => (
                            <button
                                type="button"
                                key={group.id}
                                onClick={() => setDraftActiveGroupId(group.id)}
                                aria-pressed={group.id === draftActiveGroup?.id}
                                className="flex min-h-11 shrink-0 items-center justify-center"
                            >
                                <span className={`flex h-[var(--tm-selection-pill-visible-height)] items-center gap-1.5 rounded-[var(--tm-selection-pill-radius)] border px-3 text-[length:var(--tm-font-size-compact)] font-semibold ${group.id === draftActiveGroup?.id ? 'border-[var(--tm-selection-pill-active-border)] bg-[var(--tm-selection-pill-active-bg)] text-[var(--tm-selection-pill-active-text)]' : 'border-[var(--tm-selection-pill-inactive-border)] bg-[var(--tm-selection-pill-inactive-bg)] text-[var(--tm-selection-pill-inactive-text)]'}`}>
                                    {group.name}<span className="text-[length:var(--tm-font-size-meta)] opacity-80">{group.memberIds.length}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddDraftGroup} aria-label="添加小组" className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-[var(--tm-brand-primary)]"><span className="flex h-[var(--tm-selection-pill-visible-height)] w-8 items-center justify-center rounded-[var(--tm-selection-pill-radius)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-brand-primary-soft)]"><PlusIcon className="h-4 w-4" /></span></button>
                    {groupEditor && groupEditor.groups.length > 1 ? (
                        <button type="button" onClick={() => draftActiveGroup && setDeleteDraftGroupTarget(draftActiveGroup)} aria-label={`删除${draftActiveGroup?.name || '当前小组'}`} className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-soft)]">
                            <DeleteIcon className="h-[18px] w-[18px]" />
                        </button>
                    ) : <div className="h-11 w-11 shrink-0" aria-hidden="true" />}
                </div>
            </div>
            <div className="shrink-0 bg-[var(--tm-page-plain-content-bg)] px-4 py-2">
                <MobileSearchInput value={draftSearchQuery} onChange={event => setDraftSearchQuery(event.target.value)} placeholder="搜索姓名、学号" aria-label="搜索分组学生" density="compact" containerClassName="flex min-h-11 items-center" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-1">
                <div className="grid grid-cols-4 gap-x-2.5 gap-y-3">
                    {draftVisibleStudents.map((student, index) => {
                        const assignedGroupId = draftMembershipByStudentId.get(student.id);
                        const assignedGroup = groupEditor?.groups.find(group => group.id === assignedGroupId);
                        const isSelected = assignedGroupId === draftActiveGroup?.id;
                        const [bgClass, textClass, borderClass] = getAvatarStyle(student, index);
                        const studentNo = student.studentNo || student.id;
                        return (
                            <button
                                type="button"
                                key={student.id}
                                onClick={() => handleToggleDraftStudent(student.id)}
                                aria-pressed={isSelected}
                                aria-label={`${student.name}${assignedGroup ? `，当前在${assignedGroup.name}` : '，未分组'}`}
                                className="relative flex h-[96px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-1 text-center [box-shadow:var(--tm-shadow-card)] transition-[transform,opacity] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96]"
                            >
                                <span className={`absolute right-1 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full ${isSelected ? 'bg-[var(--tm-brand-primary)]' : 'bg-white'}`}>
                                    {isSelected ? <CheckIcon className="h-3 w-3 text-white [stroke-width:3]" /> : <CircleIcon className="h-[18px] w-[18px] text-[var(--tm-border-subtle)]" />}
                                </span>
                                <span className={`flex h-10 w-10 items-center justify-center rounded-full border text-[length:var(--tm-font-size-card-title)] font-semibold ${bgClass} ${textClass} ${borderClass} ${assignedGroup && !isSelected ? 'opacity-55' : ''}`}>{student.name.slice(-1)}</span>
                                <span className="w-full truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{student.name}</span>
                                <span className={`max-w-full truncate text-[length:var(--tm-font-size-badge)] ${assignedGroup && !isSelected ? 'text-[var(--tm-text-tertiary)]' : 'text-[var(--tm-text-secondary)]'}`}>{assignedGroup ? assignedGroup.name : `学号${getClassRosterNumber(studentNo)}`}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="class-detail-titlebar-switcher sticky top-0 z-[45] flex h-11 items-center justify-between border-b border-white/40 bg-white/38 px-4 backdrop-blur-md">
                {onBack ? (
                    <button onClick={onBack} aria-label="返回班级列表" className="flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-soft)]">
                        <BackIcon className="h-5 w-5 text-[var(--tm-text-secondary)]" />
                    </button>
                ) : (
                    <div className="w-10" aria-hidden="true" />
                )}
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
                <div className="w-10" aria-hidden="true" />
            </div>

            {activeView === 'student' ? (
                <>
                    {renderStudentToolbar()}
                    {renderStudentGrid()}
                </>
            ) : renderGroupView()}

            <MobileBottomSheet open={showGroupPlanSheet} title="切换分组" onClose={() => setShowGroupPlanSheet(false)}>
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
                                            <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{plan.ownerName}创建 · {plan.groups.length}个小组 · {memberCount}人</span>
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
                    <button type="button" onClick={groupPlans.some(plan => plan.ownerName === currentTeacherName) ? handleStartNewGrouping : handleStartFirstGrouping} className="mt-2 flex min-h-[52px] w-full items-center gap-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tm-brand-primary)] text-white"><PlusIcon className="h-4 w-4" /></span>
                        {groupPlans.some(plan => plan.ownerName === currentTeacherName) ? '新建另一套分组' : '开始分组'}
                    </button>
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet open={showNewGroupNameSheet} title="新建另一套分组" onClose={() => setShowNewGroupNameSheet(false)} footer={(
                <button type="button" onClick={handleCreateNamedGrouping} disabled={!newGroupName.trim()} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">开始分组</button>
            )}>
                <label className="block py-2">
                    <span className="mb-2 block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">分组名称</span>
                    <input value={newGroupName} onChange={event => setNewGroupName(event.target.value)} placeholder="例如：写作分组" aria-label="分组名称" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)]" />
                </label>
            </MobileBottomSheet>

            <MobileBottomSheet open={Boolean(groupPlanActionTarget)} title={groupPlanActionTarget?.name || '分组管理'} onClose={() => setGroupPlanActionTarget(null)}>
                <div className="space-y-1 pb-2">
                    <button type="button" onClick={handleStartRenameGroupPlan} className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]">
                        <EditIcon className="h-5 w-5 text-[var(--tm-brand-primary)]" />
                        重命名
                    </button>
                    <button type="button" onClick={handleRequestDeleteGroupPlan} className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-soft)]">
                        <DeleteIcon className="h-5 w-5" />
                        删除这套分组
                    </button>
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet open={Boolean(renameGroupPlanTarget)} title="重命名分组" onClose={() => setRenameGroupPlanTarget(null)} footer={(
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
                open={Boolean(deleteDraftGroupTarget)}
                title={`删除“${deleteDraftGroupTarget?.name || ''}”？`}
                description={`组内${deleteDraftGroupTarget?.memberIds.length || 0}名学生将变为未分组。`}
                confirmLabel="确认删除"
                tone="danger"
                onClose={() => setDeleteDraftGroupTarget(null)}
                onConfirm={handleConfirmDeleteDraftGroup}
            />

            <MobileConfirmSheet
                open={showDiscardGroupingConfirm}
                title="放弃本次创建？"
                description="已完成的分组内容不会保存。"
                confirmLabel="放弃创建"
                tone="danger"
                onClose={() => setShowDiscardGroupingConfirm(false)}
                onConfirm={handleConfirmDiscardGrouping}
            />

            {groupEditor && renderGroupEditor()}

        </div>
    );
};

export default ClassDetailView;
