import React, { useEffect, useMemo, useState } from 'react';
import { Student, ClassInfo, GroupPlan } from '../types';
import { GET_MOCK_GROUP_PLANS_FOR_CLASS } from '../constants';
import { BackIcon, MaleIcon, FemaleIcon, CheckCircleIcon, CircleIcon, SearchIcon, ChevronDownIcon, PlusIcon, EditIcon, CloseIcon } from '../components/Icons';

interface ClassDetailViewProps {
    classInfo: ClassInfo;
    students: Student[];
    onSelectStudent: (student: Student) => void;
    // Lifted selection props
    isSelectionMode: boolean;
    onToggleSelectionMode: () => void;
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
    onStartRecord?: (studentIds: string[]) => void;
    onViewRecords?: () => void;
    onBack?: () => void;
}

type StudentGenderFilter = 'all' | 'male' | 'female';

// Helper to get consistent color based on index or string
const getAvatarStyle = (student: Student, index: number) => {
    // Palette: [Background, Text, Border]
    const malePalettes = [
        ['bg-blue-50', 'text-blue-600', 'border-blue-100'],
        ['bg-indigo-50', 'text-indigo-600', 'border-indigo-100'],
        ['bg-cyan-50', 'text-cyan-600', 'border-cyan-100'],
        ['bg-sky-50', 'text-sky-600', 'border-sky-100'],
    ];

    const femalePalettes = [
        ['bg-pink-50', 'text-pink-600', 'border-pink-100'],
        ['bg-rose-50', 'text-rose-600', 'border-rose-100'],
        ['bg-purple-50', 'text-purple-600', 'border-purple-100'],
        ['bg-fuchsia-50', 'text-fuchsia-600', 'border-fuchsia-100'],
    ];

    const palettes = student.gender === 'male' ? malePalettes : femalePalettes;
    return palettes[index % palettes.length];
};

const ClassDetailView: React.FC<ClassDetailViewProps> = ({
    classInfo,
    students,
    onSelectStudent,
    isSelectionMode,
    onToggleSelectionMode,
    selectedIds,
    onSelectionChange,
    onBack,
}) => {
    const [activeView, setActiveView] = useState<'student' | 'group'>('student');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectionGenderFilter, setSelectionGenderFilter] = useState<StudentGenderFilter>('all');
    const [groupPlans, setGroupPlans] = useState<GroupPlan[]>(() => GET_MOCK_GROUP_PLANS_FOR_CLASS(classInfo.id, students));
    const [activeGroupPlanId, setActiveGroupPlanId] = useState('');
    const [showGroupPlanSheet, setShowGroupPlanSheet] = useState(false);
    const [isGroupSelectionMode, setIsGroupSelectionMode] = useState(false);
    const [groupSelectionIds, setGroupSelectionIds] = useState<Set<string>>(new Set());
    const activeStudents = useMemo(() => students.filter(student => (student.status ?? 'active') === 'active'), [students]);

    useEffect(() => {
        const nextPlans = GET_MOCK_GROUP_PLANS_FOR_CLASS(classInfo.id, activeStudents);
        setGroupPlans(nextPlans);
        setActiveGroupPlanId(nextPlans[0]?.id || '');
        setShowGroupPlanSheet(false);
        setIsGroupSelectionMode(false);
        setGroupSelectionIds(new Set());
        setSearchQuery('');
        setSelectionGenderFilter('all');
    }, [activeStudents, classInfo.id]);

    useEffect(() => {
        if (!activeGroupPlanId && groupPlans.length > 0) {
            setActiveGroupPlanId(groupPlans[0].id);
        }
    }, [activeGroupPlanId, groupPlans]);

    const activeGroupPlan = useMemo(() => {
        return groupPlans.find(plan => plan.id === activeGroupPlanId) || groupPlans[0] || null;
    }, [activeGroupPlanId, groupPlans]);

    const studentById = useMemo(() => new Map(activeStudents.map(student => [student.id, student])), [activeStudents]);

    const visibleStudents = useMemo(() => {
        const normalizedSearchQuery = searchQuery.trim().replace(/\s+/g, '').toLowerCase();
        return activeStudents.filter(student => {
            const matchesSearch = !normalizedSearchQuery
                || student.name.includes(normalizedSearchQuery)
                || student.id.toLowerCase().includes(normalizedSearchQuery)
                || (student.studentNo || '').toLowerCase().includes(normalizedSearchQuery);
            const matchesGender = !isSelectionMode
                || selectionGenderFilter === 'all'
                || student.gender === selectionGenderFilter;
            return matchesSearch && matchesGender;
        });
    }, [activeStudents, isSelectionMode, searchQuery, selectionGenderFilter]);

    const isAllVisibleSelected = useMemo(() => {
        return visibleStudents.length > 0 && visibleStudents.every(student => selectedIds.has(student.id));
    }, [selectedIds, visibleStudents]);

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


    const handleRestoreSearchMode = () => {
        if (!isSelectionMode) return;
        setSelectionGenderFilter('all');
        onToggleSelectionMode();
    };

    const handleSwitchView = (view: 'student' | 'group') => {
        if (activeView === view) return;
        if (isSelectionMode) onToggleSelectionMode();
        setIsGroupSelectionMode(false);
        setGroupSelectionIds(new Set());
        setActiveView(view);
    };

    const handleToggleGroupSelection = (groupId: string) => {
        const next = new Set(groupSelectionIds);
        if (next.has(groupId)) next.delete(groupId);
        else next.add(groupId);
        setGroupSelectionIds(next);
    };

    const handleCreateGroupPlan = () => {
        const index = groupPlans.length + 1;
        const firstStudentIds = activeStudents.slice(0, 6).map(student => student.id);
        const nextPlan: GroupPlan = {
            id: `${classInfo.id}-custom-plan-${Date.now()}`,
            name: `新分组方案${index}`,
            subject: '自定义',
            ownerName: '当前教师',
            groups: [{
                id: `${classInfo.id}-custom-plan-${index}-group-1`,
                name: '第1组',
                memberIds: firstStudentIds,
            }],
        };
        setGroupPlans(prev => [...prev, nextPlan]);
        setActiveGroupPlanId(nextPlan.id);
        setShowGroupPlanSheet(false);
    };

    const handleCreateGroup = () => {
        if (!activeGroupPlan) return;
        const groupIndex = activeGroupPlan.groups.length + 1;
        setGroupPlans(prev => prev.map(plan => {
            if (plan.id !== activeGroupPlan.id) return plan;
            return {
                ...plan,
                groups: [
                    ...plan.groups,
                    {
                        id: `${plan.id}-custom-group-${Date.now()}`,
                        name: `第${groupIndex}组`,
                        memberIds: [],
                    },
                ],
            };
        }));
    };

    const renderStudentToolbar = () => (
        <div className="bg-white/92 px-4 pb-2 pt-1.5 backdrop-blur-xl border-b border-white/70 shadow-sm sticky top-0 z-10">
            <div className="student-action-row flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleRestoreSearchMode}
                    aria-label={isSelectionMode ? "恢复搜索" : "搜索学生"}
                    className={`relative text-left transition-all duration-300 ease-out ${isSelectionMode ? 'w-10 flex-none opacity-70' : 'min-w-0 flex-1 opacity-100'} ${isSelectionMode ? 'active:scale-95' : ''}`}
                >
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="搜索姓名、学号"
                        disabled={isSelectionMode}
                        className={`h-9 w-full rounded-full border border-slate-200 bg-slate-50/95 pl-9 pr-3 text-[13px] font-medium text-slate-700 outline-none placeholder:text-slate-400 transition-all duration-300 ease-out focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100 ${isSelectionMode ? 'pointer-events-none pr-0 text-transparent placeholder:text-transparent' : ''}`}
                    />
                </button>

                <div className="selection-tools-next-to-cancel ml-auto flex shrink-0 items-center gap-1.5">
                    {isSelectionMode && (
                        <>
                            <button
                                onClick={isAllVisibleSelected ? handleClearVisibleStudents : handleSelectAllVisibleStudents}
                                className="h-8 shrink-0 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition active:scale-95"
                            >
                                {isAllVisibleSelected ? '取消全选' : '全选'}
                            </button>
                            <button onClick={() => setSelectionGenderFilter('male')} className={`flex h-8 min-w-10 items-center justify-center rounded-full border px-2.5 shadow-sm transition active:scale-95 ${selectionGenderFilter === 'male' ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-slate-200 bg-white text-cyan-600'}`}><MaleIcon className="h-4 w-4" /></button>
                            <button onClick={() => setSelectionGenderFilter('female')} className={`flex h-8 min-w-10 items-center justify-center rounded-full border px-2.5 shadow-sm transition active:scale-95 ${selectionGenderFilter === 'female' ? 'border-rose-400 bg-rose-400 text-white' : 'border-slate-200 bg-white text-rose-500'}`}><FemaleIcon className="h-4 w-4" /></button>
                        </>
                    )}

                    <button
                        onClick={() => {
                            if (isSelectionMode) {
                                setSelectionGenderFilter('all');
                            } else {
                                setSearchQuery('');
                            }
                            onToggleSelectionMode();
                        }}
                        className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-bold transition-all active:scale-95 ${isSelectionMode ? 'border border-slate-200 bg-white text-slate-600 shadow-sm' : 'bg-cyan-700 text-white shadow-sm shadow-cyan-100'}`}
                    >
                        {isSelectionMode ? '取消' : '多选'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStudentGrid = () => (
        <div className="flex-1 overflow-y-auto p-4 pb-40">
            <div className="grid grid-cols-3 gap-3">
                {visibleStudents.map((student, index) => {
                    const isSelected = selectedIds.has(student.id);
                    const [bgClass, textClass, borderClass] = getAvatarStyle(student, index);
                    const nameChar = student.name.slice(-1);

                    return (
                        <div
                            key={student.id}
                            onClick={() => handleStudentClick(student)}
                            className={`relative rounded-[16px] p-3 flex flex-col items-center transition-all duration-200 cursor-pointer select-none group ${isSelectionMode && isSelected ? 'bg-cyan-50 ring-1.5 ring-cyan-600 shadow-sm' : 'bg-white/95 border border-slate-100/80'}`}
                        >
                            {isSelectionMode && (
                                <div className="absolute top-2 right-2 z-10 animate-in fade-in zoom-in duration-200">
                                    {isSelected
                                        ? <CheckCircleIcon className="w-5 h-5 text-cyan-600 fill-white" />
                                        : <CircleIcon className="w-5 h-5 text-slate-200 fill-white" />
                                    }
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-full mb-2.5 flex items-center justify-center text-lg font-semibold shadow-sm relative shrink-0 transition-transform ${!student.avatar ? `${bgClass} ${textClass} border ${borderClass}` : 'bg-slate-50 border border-slate-100'}`}>
                                {student.avatar ? (
                                    <img src={student.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    nameChar
                                )}

                                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm ${student.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`}>
                                    {student.gender === 'male'
                                        ? <MaleIcon className="w-2.5 h-2.5 text-white" />
                                        : <FemaleIcon className="w-2.5 h-2.5 text-white" />
                                    }
                                </div>
                            </div>

                            <div className="w-full text-center flex flex-col items-center">
                                <div className={`text-[14px] font-bold leading-tight mb-1.5 w-full break-words ${isSelected ? 'text-cyan-800' : 'text-slate-800'}`}>
                                    {student.name}
                                </div>
                                <div className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md tracking-tight w-fit max-w-full ${isSelected ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-50 text-slate-400'}`}>
                                    {student.studentNo || student.id}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {visibleStudents.length === 0 && (
                <div className="mt-16 rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm font-medium text-slate-400">没有匹配的学生</div>
            )}

            <div className="h-10 text-center mt-8">
                <span className="text-xs text-slate-300 tracking-wide opacity-60">- {visibleStudents.length} Students -</span>
            </div>
        </div>
    );

    const renderGroupView = () => (
        <div className="flex flex-1 min-h-0 flex-col">
            <div className="space-y-4 bg-white/84 px-4 pb-4 pt-2 backdrop-blur-xl border-b border-white/70 shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => setShowGroupPlanSheet(true)}
                        className="flex h-11 min-w-[132px] items-center justify-center gap-2 rounded-full px-5 text-[17px] font-black text-slate-800 active:bg-slate-50"
                    >
                        {activeGroupPlan?.subject || '分组方案'}
                        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <button onClick={handleCreateGroup} className="flex h-11 min-w-[120px] items-center justify-center gap-1 rounded-[14px] border border-cyan-100 bg-white px-4 text-sm font-bold text-cyan-700 active:scale-95">
                        <PlusIcon className="h-4 w-4" />
                        + 新增分组
                    </button>
                    <button
                        onClick={() => {
                            setIsGroupSelectionMode(prev => !prev);
                            setGroupSelectionIds(new Set());
                        }}
                        className={`h-10 rounded-full px-4 text-sm font-bold active:scale-95 ${isGroupSelectionMode ? 'bg-slate-700 text-white' : 'bg-cyan-700 text-white'}`}
                    >
                        {isGroupSelectionMode ? '取消' : '多选分组'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-40">
                <div className="space-y-3">
                    {(activeGroupPlan?.groups || []).map((group, index) => {
                        const isSelected = groupSelectionIds.has(group.id);
                        const members = group.memberIds.map(id => studentById.get(id)).filter(Boolean) as Student[];
                        const previewNames = members.slice(0, 4).map(student => student.name).join('、');
                        return (
                            <button
                                key={group.id}
                                onClick={() => isGroupSelectionMode && handleToggleGroupSelection(group.id)}
                                className={`relative w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition active:scale-[0.99] ${isSelected ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-100'}`}
                            >
                                {isGroupSelectionMode && (
                                    <div className="absolute right-3 top-3">
                                        {isSelected ? <CheckCircleIcon className="h-5 w-5 text-amber-500" /> : <CircleIcon className="h-5 w-5 text-slate-200" />}
                                    </div>
                                )}
                                <div className="flex items-start gap-3 pr-8">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-base font-black text-amber-500">{index + 1}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[16px] font-black text-slate-800">{group.name}</div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-500">{activeGroupPlan?.ownerName}</span>
                                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-500">{members.length}名学生</span>
                                        </div>
                                        <div className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-slate-400">
                                            {previewNames || '暂未添加学生'}{members.length > 4 ? `等${members.length}人` : ''}
                                        </div>
                                    </div>
                                </div>
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
                    <button onClick={onBack} aria-label="返回班级列表" className="flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100">
                        <BackIcon className="h-5 w-5 text-slate-600" />
                    </button>
                ) : (
                    <div className="w-10" aria-hidden="true" />
                )}
                <div className="grid w-40 grid-cols-2 text-center text-[15px] font-bold text-slate-800">
                    <button onClick={() => handleSwitchView('student')} className="relative h-9 active:scale-95">
                        学生
                        {activeView === 'student' && <span className="absolute bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-cyan-700" />}
                    </button>
                    <button onClick={() => handleSwitchView('group')} className="relative h-9 active:scale-95">
                        分组
                        {activeView === 'group' && <span className="absolute bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-cyan-700" />}
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

            {showGroupPlanSheet && (
                <div className="absolute inset-0 z-50 flex items-end bg-black/55">
                    <button aria-label="关闭分组方案" className="absolute inset-0" onClick={() => setShowGroupPlanSheet(false)} />
                    <div className="relative max-h-[72%] w-full rounded-t-[32px] bg-white px-5 pb-5 pt-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-center">
                            <h3 className="text-[20px] font-black text-slate-800">分组方案</h3>
                            <button onClick={() => setShowGroupPlanSheet(false)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full active:bg-slate-50">
                                <CloseIcon className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="max-h-[440px] space-y-3 overflow-y-auto pb-4">
                            {groupPlans.map(plan => (
                                <button
                                    key={plan.id}
                                    onClick={() => {
                                        setActiveGroupPlanId(plan.id);
                                        setShowGroupPlanSheet(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left active:scale-[0.99] ${plan.id === activeGroupPlan?.id ? 'border-amber-300 bg-amber-50/40' : 'border-slate-100 bg-white'}`}
                                >
                                    <div>
                                        <div className="text-[17px] font-black text-slate-800">{plan.name}</div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-500">{plan.ownerName}</span>
                                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-500">{plan.groups.length}个小组</span>
                                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-500">{activeStudents.length}名学生</span>
                                        </div>
                                    </div>
                                    <EditIcon className="h-5 w-5 shrink-0 text-amber-500" />
                                </button>
                            ))}
                        </div>
                        <button onClick={handleCreateGroupPlan} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-[16px] font-black text-slate-800 active:scale-95">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-700 text-white"><PlusIcon className="h-5 w-5" /></span>
                            添加分组方案
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ClassDetailView;
