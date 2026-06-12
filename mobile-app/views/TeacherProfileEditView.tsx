import React, { useMemo, useRef, useState } from 'react';
import {
    BookOpen,
    Camera,
    ChevronLeft,
    Image,
    Landmark,
    Pencil,
    Sparkles,
    Trash2,
    Users,
} from 'lucide-react';
import type { ClassInfo, TeacherDepartment, TeacherProfile, TeacherTeachingAssignment } from '../types';
import { IconBadge } from '../components/ui/IconBadge';
import { MobileCard } from '../components/ui/MobileCard';
import { phoneText } from '../styles/phoneTokens';

interface TeacherProfileEditViewProps {
    profile: TeacherProfile;
    classes: ClassInfo[];
    subjects: string[];
    departments: TeacherDepartment[];
    onBack: () => void;
    onChange: (profile: TeacherProfile) => void;
}

type EditorMode = 'idle' | 'avatar' | 'name' | 'teachingClasses' | 'homeroom' | 'gradeLeader' | 'department';

interface TeachingGroup {
    subject: string;
    classIds: string[];
    summary: string;
}

const getClassOrder = (classInfo: ClassInfo) => Number(classInfo.id.split('_')[2] || 0);
const getGradeLabel = (classInfo: ClassInfo) => classInfo.name.match(/^(.+?级)/)?.[1] || classInfo.gradeLevel;
const getClassShortLabel = (classInfo: ClassInfo) => `${getClassOrder(classInfo)}班`;

const groupClassesByGrade = (classes: ClassInfo[]) => {
    return classes.reduce<Record<string, ClassInfo[]>>((groups, classInfo) => {
        const grade = getGradeLabel(classInfo);
        groups[grade] = groups[grade] || [];
        groups[grade].push(classInfo);
        groups[grade].sort((a, b) => getClassOrder(a) - getClassOrder(b));
        return groups;
    }, {});
};

const summarizeClassIds = (classIds: string[], classes: ClassInfo[]) => {
    const classMap = new Map(classes.map(classInfo => [classInfo.id, classInfo]));
    const selectedClasses = classIds
        .map(id => classMap.get(id))
        .filter((classInfo): classInfo is ClassInfo => Boolean(classInfo))
        .sort((a, b) => getGradeLabel(b).localeCompare(getGradeLabel(a), 'zh-CN') || getClassOrder(a) - getClassOrder(b));

    const gradeGroups = selectedClasses.reduce<Record<string, number[]>>((groups, classInfo) => {
        const grade = getGradeLabel(classInfo);
        groups[grade] = groups[grade] || [];
        groups[grade].push(getClassOrder(classInfo));
        return groups;
    }, {});

    const rangeText = (orders: number[]) => {
        const sorted = [...new Set(orders)].sort((a, b) => a - b);
        const ranges: string[] = [];
        let start = sorted[0];
        let prev = sorted[0];

        for (let i = 1; i <= sorted.length; i += 1) {
            const current = sorted[i];
            if (current === prev + 1) {
                prev = current;
                continue;
            }
            ranges.push(start === prev ? `${start}班` : `${start}-${prev}班`);
            start = current;
            prev = current;
        }

        return ranges.join('、');
    };

    return Object.entries(gradeGroups)
        .map(([grade, orders]) => `${grade}${rangeText(orders)}`)
        .join('、');
};

export const groupTeachingAssignmentsBySubject = (assignments: TeacherTeachingAssignment[], classes: ClassInfo[]): TeachingGroup[] => {
    const groups = assignments.reduce<Record<string, string[]>>((result, assignment) => {
        result[assignment.subject] = result[assignment.subject] || [];
        result[assignment.subject].push(assignment.classId);
        return result;
    }, {});

    return Object.entries(groups).map(([subject, classIds]) => ({
        subject,
        classIds: [...new Set(classIds)],
        summary: summarizeClassIds(classIds, classes),
    }));
};

const TeacherProfileEditView: React.FC<TeacherProfileEditViewProps> = ({ profile, classes, subjects, departments, onBack, onChange }) => {
    const [draft, setDraft] = useState<TeacherProfile>(profile);
    const [nameDraft, setNameDraft] = useState(profile.name);
    const [mode, setMode] = useState<EditorMode>('idle');
    const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
    const [selectedGrades, setSelectedGrades] = useState<Set<string>>(new Set());
    const [selectedSubject, setSelectedSubject] = useState('');
    const [activeGrade, setActiveGrade] = useState('');
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const albumInputRef = useRef<HTMLInputElement>(null);

    const classesByGrade = useMemo(() => groupClassesByGrade(classes), [classes]);
    const gradeOptions = useMemo(() => Object.keys(classesByGrade), [classesByGrade]);
    const teachingGroups = useMemo(() => groupTeachingAssignmentsBySubject(draft.teachingAssignments, classes), [draft.teachingAssignments, classes]);

    const applyProfileChange = (updater: (current: TeacherProfile) => TeacherProfile) => {
        const next = updater(draft);
        setDraft(next);
        onChange(next);
    };

    const resetSelection = () => setSelectedClassIds(new Set());

    const resetCascadeSelection = (ids: string[] = []) => {
        setSelectedClassIds(new Set(ids));
        const firstSelectedClass = ids.map(id => classes.find(classInfo => classInfo.id === id)).find(Boolean);
        setActiveGrade(firstSelectedClass ? getGradeLabel(firstSelectedClass) : gradeOptions[0] || '');
    };

    const toggleClass = (classId: string) => {
        setSelectedClassIds(prev => {
            const next = new Set(prev);
            if (next.has(classId)) next.delete(classId);
            else next.add(classId);
            return next;
        });
    };

    const toggleActiveGradeClasses = () => {
        const gradeClasses = classesByGrade[activeGrade] || [];
        setSelectedClassIds(prev => {
            const next = new Set(prev);
            const allSelected = gradeClasses.every(classInfo => next.has(classInfo.id));
            gradeClasses.forEach(classInfo => {
                if (allSelected) next.delete(classInfo.id);
                else next.add(classInfo.id);
            });
            return next;
        });
    };

    const openRoleSelector = (targetMode: Extract<EditorMode, 'homeroom'>, ids: string[]) => {
        resetCascadeSelection(ids);
        setMode(targetMode);
    };

    const saveRoleClasses = () => {
        const ids = Array.from(selectedClassIds);
        applyProfileChange(prev => ({ ...prev, homeroomClassIds: ids }));
        resetSelection();
        setMode('idle');
    };

    const clearHomeroomClasses = () => {
        applyProfileChange(prev => ({ ...prev, homeroomClassIds: [] }));
        resetSelection();
        setMode('idle');
    };

    const openGradeLeaderSelector = () => {
        setSelectedGrades(new Set(draft.gradeLeaderGrades));
        setMode('gradeLeader');
    };

    const toggleGrade = (grade: string) => {
        setSelectedGrades(prev => {
            const next = new Set(prev);
            if (next.has(grade)) next.delete(grade);
            else next.add(grade);
            return next;
        });
    };

    const saveGradeLeaderGrades = () => {
        applyProfileChange(prev => ({ ...prev, gradeLeaderGrades: Array.from(selectedGrades) }));
        setSelectedGrades(new Set());
        setMode('idle');
    };

    const clearGradeLeaderGrades = () => {
        applyProfileChange(prev => ({ ...prev, gradeLeaderGrades: [] }));
        setSelectedGrades(new Set());
        setMode('idle');
    };

    const saveDepartment = (department: TeacherDepartment) => {
        applyProfileChange(prev => ({ ...prev, departmentId: department.id, departmentName: department.name }));
        setMode('idle');
    };

    const saveTeachingAssignments = () => {
        if (!selectedSubject || selectedClassIds.size === 0) return;
        const selectedIds = Array.from(selectedClassIds);
        applyProfileChange(prev => {
            const existingKeys = new Set(prev.teachingAssignments.map(item => `${item.classId}-${item.subject}`));
            const additions = selectedIds
                .map(classId => ({ classId, subject: selectedSubject }))
                .filter(item => !existingKeys.has(`${item.classId}-${item.subject}`));
            return { ...prev, teachingAssignments: [...prev.teachingAssignments, ...additions] };
        });
        resetSelection();
        setSelectedSubject('');
        setMode('idle');
    };

    const removeTeachingGroup = (group: TeachingGroup) => {
        const classSet = new Set(group.classIds);
        applyProfileChange(prev => ({
            ...prev,
            teachingAssignments: prev.teachingAssignments.filter(item => item.subject !== group.subject || !classSet.has(item.classId)),
        }));
    };

    const readAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                applyProfileChange(prev => ({ ...prev, avatar: reader.result as string }));
            }
            setMode('idle');
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const renderClassSelectorPage = () => {
        const isTeaching = mode === 'teachingClasses';
        const isHomeroom = mode === 'homeroom';
        const title = isTeaching ? '新增任教信息' : '选择班主任班级';
        const primaryText = isTeaching ? '保存任教信息' : '保存班主任班级';
        const onPrimary = isTeaching ? saveTeachingAssignments : saveRoleClasses;
        const primaryDisabled = selectedClassIds.size === 0 || (isTeaching && !selectedSubject);
        const activeGradeClasses = classesByGrade[activeGrade] || [];
        const activeSelectedCount = activeGradeClasses.filter(classInfo => selectedClassIds.has(classInfo.id)).length;
        const activeAllSelected = activeGradeClasses.length > 0 && activeGradeClasses.every(classInfo => selectedClassIds.has(classInfo.id));

        return (
            <div className="flex h-full min-h-0 overflow-hidden flex-col bg-slate-50 font-sans text-slate-900">
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
                    <button onClick={() => setMode('idle')} className="flex h-11 w-11 -ml-3 items-center justify-center rounded-full text-slate-500 active:bg-slate-100" aria-label="返回">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h2 className={`${phoneText.navTitle} text-slate-900`}>{title}</h2>
                    <div className="w-11" />
                </div>

                <div className="flex-1 overflow-hidden px-5 py-4">
                    <div className="flex h-full min-h-0 flex-col gap-3">
                        <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                            <div className="grid h-full min-h-0 grid-cols-[92px_1fr]" aria-label="班级级联选择">
                                <div className="overflow-y-auto border-r border-slate-100 bg-slate-50/80 p-2 no-scrollbar" aria-label="左侧先选年级">
                                    {gradeOptions.map(grade => {
                                        const selectedCount = (classesByGrade[grade] || []).filter(classInfo => selectedClassIds.has(classInfo.id)).length;
                                        return (
                                            <button
                                                key={grade}
                                                type="button"
                                                onClick={() => setActiveGrade(grade)}
                                                className={`mb-2 flex min-h-11 w-full flex-col items-center justify-center rounded-2xl text-xs font-extrabold transition-all last:mb-0 active:scale-95 ${activeGrade === grade ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-500 active:bg-blue-50 active:text-blue-600'}`}
                                            >
                                                <span>{grade}</span>
                                                {selectedCount > 0 && <span className={`mt-0.5 text-[10px] ${activeGrade === grade ? 'text-blue-100' : 'text-blue-500'}`}>{selectedCount}个</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex min-w-0 flex-col p-3" aria-label="右侧再选该年级下的班级">
                                    <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className={`${phoneText.sectionTitle} truncate text-slate-900`}>{activeGrade || '选择年级'}</h3>
                                            <p className="mt-1 text-xs text-slate-400">已选 {activeSelectedCount} / {activeGradeClasses.length} 个班</p>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={activeGradeClasses.length === 0}
                                            onClick={toggleActiveGradeClasses}
                                            className={`shrink-0 rounded-full px-3 py-2 text-xs font-extrabold transition-colors disabled:bg-slate-100 disabled:text-slate-300 ${activeAllSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 active:bg-blue-100'}`}
                                        >
                                            {activeAllSelected ? '取消全选' : '全选本年级'}
                                        </button>
                                    </div>
                                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 no-scrollbar">
                                        {activeGradeClasses.map(classInfo => {
                                            const selected = selectedClassIds.has(classInfo.id);
                                            return (
                                                <button
                                                    key={classInfo.id}
                                                    type="button"
                                                    onClick={() => toggleClass(classInfo.id)}
                                                    aria-pressed={selected}
                                                    aria-label={`${selected ? '取消选择' : '选择'}${activeGrade}${getClassShortLabel(classInfo)}`}
                                                    className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3 text-left text-sm font-bold transition-all active:scale-[0.99] ${selected ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-600 active:bg-white'}`}
                                                >
                                                    <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-transparent'}`}>✓</span>
                                                    <span className="min-w-0 flex-1 truncate">{getClassShortLabel(classInfo)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {isTeaching && (
                            <div className="shrink-0 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
                                <h3 className={`${phoneText.sectionTitle} text-slate-900`}>选择任教学科</h3>
                                <div className="mt-3 grid grid-cols-4 gap-2">
                                    {subjects.map(subject => (
                                        <button
                                            key={subject}
                                            type="button"
                                            onClick={() => setSelectedSubject(subject)}
                                            aria-pressed={selectedSubject === subject}
                                            className={`flex min-h-11 items-center justify-center rounded-2xl border px-2 text-xs font-extrabold transition-all active:scale-95 ${selectedSubject === subject ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-600 active:bg-white'}`}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-5 pb-6 pt-3">
                    <button
                        type="button"
                        disabled={primaryDisabled}
                        onClick={onPrimary}
                        className="flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                    >
                        {selectedClassIds.size === 0 ? '请先选择班级' : (isTeaching && !selectedSubject ? '请先选择学科' : `${primaryText}（已选 ${selectedClassIds.size} 个班）`)}
                    </button>
                    {!isTeaching && (
                        <button
                            type="button"
                            onClick={clearHomeroomClasses}
                            className="flex h-11 w-full items-center justify-center rounded-2xl text-sm font-bold text-rose-500 active:bg-rose-50"
                        >
                            清除班主任班级
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderGradeLeaderSelectorPage = () => (
        <div className="flex h-full min-h-0 overflow-hidden flex-col bg-slate-50 font-sans text-slate-900">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
                <button onClick={() => setMode('idle')} className="flex h-11 w-11 -ml-3 items-center justify-center rounded-full text-slate-500 active:bg-slate-100" aria-label="返回">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className={`${phoneText.navTitle} text-slate-900`}>选择年级组长年级</h2>
                <div className="w-11" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="grid grid-cols-2 gap-3">
                    {gradeOptions.map(grade => {
                        const selected = selectedGrades.has(grade);
                        return (
                            <button
                                key={grade}
                                type="button"
                                onClick={() => toggleGrade(grade)}
                                aria-pressed={selected}
                                className={`flex min-h-14 items-center justify-center rounded-2xl border px-3 text-sm font-bold transition-all active:scale-95 ${selected ? 'border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-100 bg-white text-slate-600 shadow-sm'}`}
                            >
                                {grade}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-5 pb-6 pt-3">
                <button
                    type="button"
                    onClick={saveGradeLeaderGrades}
                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-indigo-600 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
                >
                    保存年级组长年级（已选 {selectedGrades.size} 个年级）
                </button>
                <button
                    type="button"
                    onClick={clearGradeLeaderGrades}
                    className="flex h-11 w-full items-center justify-center rounded-2xl text-sm font-bold text-rose-500 active:bg-rose-50"
                >
                    清除年级组长年级
                </button>
            </div>
        </div>
    );

    const renderDepartmentSelectorPage = () => (
        <div className="flex h-full min-h-0 overflow-hidden flex-col bg-slate-50 font-sans text-slate-900">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
                <button onClick={() => setMode('idle')} className="flex h-11 w-11 -ml-3 items-center justify-center rounded-full text-slate-500 active:bg-slate-100" aria-label="返回">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className={`${phoneText.navTitle} text-slate-900`}>选择部门</h2>
                <div className="w-11" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="space-y-2">
                    {departments.map(department => {
                        const selected = draft.departmentId === department.id;
                        return (
                            <button
                                key={department.id}
                                type="button"
                                onClick={() => saveDepartment(department)}
                                className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-4 text-left transition-all active:scale-[0.99] ${selected ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-700 shadow-sm'}`}
                            >
                                <span className="text-sm font-bold">{department.name}</span>
                                {selected && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white">当前</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 bg-white px-5 pb-6 pt-3">
                <button
                    type="button"
                    onClick={() => {
                        applyProfileChange(prev => ({ ...prev, departmentId: '', departmentName: '' }));
                        setMode('idle');
                    }}
                    className="flex h-11 w-full items-center justify-center rounded-2xl text-sm font-bold text-rose-500 active:bg-rose-50"
                >
                    清除部门
                </button>
            </div>
        </div>
    );

    const renderAvatarSheet = () => (
        <div className="absolute inset-0 z-[130] flex items-end bg-slate-950/30 px-4 pb-5" onClick={() => setMode('idle')}>
            <div className="w-full rounded-[32px] bg-white p-4 shadow-2xl" onClick={event => event.stopPropagation()}>
                <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
                <h3 className="px-2 text-center text-lg font-extrabold text-slate-900">更换头像</h3>
                <div className="mt-5 space-y-2">
                    <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex h-14 w-full items-center gap-3 rounded-2xl bg-blue-50 px-4 text-left font-bold text-blue-600 active:bg-blue-100">
                        <Camera className="h-5 w-5" />
                        拍照
                    </button>
                    <button type="button" onClick={() => albumInputRef.current?.click()} className="flex h-14 w-full items-center gap-3 rounded-2xl bg-slate-50 px-4 text-left font-bold text-slate-700 active:bg-slate-100">
                        <Image className="h-5 w-5" />
                        从相册选择
                    </button>
                    <button type="button" onClick={() => setMode('idle')} className="flex h-12 w-full items-center justify-center rounded-2xl text-sm font-bold text-slate-400 active:bg-slate-50">
                        取消
                    </button>
                </div>
            </div>
        </div>
    );

    const saveName = () => {
        const normalizedName = nameDraft.trim();
        if (!normalizedName) return;
        applyProfileChange(prev => ({ ...prev, name: normalizedName }));
        setMode('idle');
    };

    const renderNameDialog = () => (
        <div className="absolute inset-0 z-[130] flex items-center bg-slate-950/30 px-5" onClick={() => setMode('idle')}>
            <div className="w-full rounded-3xl bg-white p-5 shadow-2xl" onClick={event => event.stopPropagation()}>
                <h3 className="text-center text-lg font-extrabold text-slate-900">修改姓名</h3>
                <input
                    value={nameDraft}
                    onChange={event => setNameDraft(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') saveName();
                    }}
                    autoFocus
                    maxLength={20}
                    className="mt-5 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-900 outline-none focus:border-blue-400 focus:bg-white"
                    aria-label="教师姓名"
                />
                <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => setMode('idle')} className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-600">取消</button>
                    <button type="button" disabled={!nameDraft.trim()} onClick={saveName} className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-blue-600 text-sm font-extrabold text-white disabled:bg-slate-200 disabled:text-slate-400">确定</button>
                </div>
            </div>
        </div>
    );

    const roleSummary = (ids: string[]) => ids.length > 0 ? summarizeClassIds(ids, classes) : '暂未选择';
    const gradeLeaderSummary = draft.gradeLeaderGrades.length > 0 ? draft.gradeLeaderGrades.join('、') : '暂未选择';

    if (mode === 'teachingClasses' || mode === 'homeroom') return renderClassSelectorPage();
    if (mode === 'gradeLeader') return renderGradeLeaderSelectorPage();
    if (mode === 'department') return renderDepartmentSelectorPage();

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={readAvatarFile} />
            <input ref={albumInputRef} type="file" accept="image/*" className="hidden" onChange={readAvatarFile} />

            <div className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur">
                <button onClick={onBack} className="flex h-11 w-11 -ml-3 items-center justify-center rounded-full text-slate-500 active:bg-slate-100" aria-label="返回">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className={`${phoneText.navTitle} text-slate-900`}>编辑教师信息</h1>
                <div className="w-11" />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 pb-8">
                <MobileCard variant="hero" padding="lg" className="teacher-avatar-card text-center">
                    <button type="button" onClick={() => setMode('avatar')} className="group mx-auto block" aria-label="更换头像">
                        <div className="relative mx-auto h-24 w-24 rounded-full bg-blue-50 p-1.5 shadow-inner">
                            <img src={draft.avatar} alt="老师头像" className="h-full w-full rounded-full object-cover ring-2 ring-white" />
                            <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-blue-600 text-white shadow-lg transition-transform group-active:scale-95">
                                <Camera className="h-4 w-4" />
                            </span>
                        </div>
                        <span className="mt-3 block text-sm font-bold text-blue-600">更换头像</span>
                    </button>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-name-card">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <IconBadge icon={Pencil} size="md" tone="brand" />
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-400">姓名</p>
                                <h2 className="mt-1 truncate text-base font-extrabold text-slate-900">{draft.name}</h2>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setNameDraft(draft.name); setMode('name'); }}
                            className="shrink-0 rounded-full bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-600 active:bg-blue-100"
                            aria-label="修改姓名"
                        >
                            修改
                        </button>
                    </div>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-teaching-card">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <IconBadge icon={BookOpen} size="md" tone="blue" />
                            <div className="min-w-0">
                                <h3 className={`${phoneText.itemTitle} truncate text-slate-900`}>任教信息</h3>
                                <p className="mt-1 truncate text-xs text-slate-400">{teachingGroups.length > 0 ? `${teachingGroups.length} 个学科 · ${draft.teachingAssignments.length} 个班级关系` : '暂未配置'}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => { resetCascadeSelection(); setMode('teachingClasses'); }} className="shrink-0 rounded-full bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-600 active:bg-blue-100">添加</button>
                    </div>
                    {teachingGroups.length > 0 && (
                        <div className="space-y-2">
                            {teachingGroups.map(group => (
                                <div key={group.subject} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-extrabold text-slate-900">{group.subject}</span>
                                            <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">{group.classIds.length} 个班</span>
                                        </div>
                                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{group.summary}</p>
                                    </div>
                                    <button type="button" onClick={() => removeTeachingGroup(group)} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 active:bg-rose-50 active:text-rose-500" aria-label={`删除${group.subject}任教范围`}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-homeroom-card">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <IconBadge icon={Sparkles} size="md" tone="violet" />
                            <div className="min-w-0">
                                <h3 className={`${phoneText.itemTitle} truncate text-slate-900`}>担任班主任的班级</h3>
                                <p className="mt-1 truncate text-xs text-slate-400">{roleSummary(draft.homeroomClassIds)}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => openRoleSelector('homeroom', draft.homeroomClassIds)} className="shrink-0 rounded-full bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-600 active:bg-violet-100">修改</button>
                    </div>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-grade-leader-card">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <IconBadge icon={Users} size="md" tone="brand" />
                            <div className="min-w-0">
                                <h3 className={`${phoneText.itemTitle} truncate text-slate-900`}>担任年级组长的年级</h3>
                                <p className="mt-1 truncate text-xs text-slate-400">{gradeLeaderSummary}</p>
                            </div>
                        </div>
                        <button type="button" onClick={openGradeLeaderSelector} className="shrink-0 rounded-full bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-600 active:bg-indigo-100">修改</button>
                    </div>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-department-card">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <IconBadge icon={Landmark} size="md" tone="brand" />
                            <div className="min-w-0">
                                <h3 className={`${phoneText.itemTitle} truncate text-slate-900`}>部门设置</h3>
                                <p className="mt-1 truncate text-xs text-slate-400">{draft.departmentName || '暂未选择'}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setMode('department')} className="shrink-0 rounded-full bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-600 active:bg-blue-100">修改</button>
                    </div>
                </MobileCard>

            </div>

            {mode === 'avatar' && renderAvatarSheet()}
            {mode === 'name' && renderNameDialog()}
        </div>
    );
};

export default TeacherProfileEditView;
