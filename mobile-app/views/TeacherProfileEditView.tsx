import React, { useMemo, useRef, useState } from 'react';
import {
    BookOpen,
    Camera,
    ChevronLeft,
    Image,
    Landmark,
    Plus,
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
    onSave: (profile: TeacherProfile) => void;
}

type EditorMode = 'idle' | 'avatar' | 'teachingClasses' | 'teachingSubject' | 'homeroom' | 'gradeLeader' | 'department';

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

const TeacherProfileEditView: React.FC<TeacherProfileEditViewProps> = ({ profile, classes, subjects, departments, onBack, onSave }) => {
    const [draft, setDraft] = useState<TeacherProfile>(profile);
    const [mode, setMode] = useState<EditorMode>('idle');
    const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
    const [selectedGrades, setSelectedGrades] = useState<Set<string>>(new Set());
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const albumInputRef = useRef<HTMLInputElement>(null);

    const classesByGrade = useMemo(() => groupClassesByGrade(classes), [classes]);
    const gradeOptions = useMemo(() => Object.keys(classesByGrade), [classesByGrade]);
    const teachingGroups = useMemo(() => groupTeachingAssignmentsBySubject(draft.teachingAssignments, classes), [draft.teachingAssignments, classes]);

    const resetSelection = () => setSelectedClassIds(new Set());

    const toggleClass = (classId: string) => {
        setSelectedClassIds(prev => {
            const next = new Set(prev);
            if (next.has(classId)) next.delete(classId);
            else next.add(classId);
            return next;
        });
    };

    const toggleGradeClasses = (gradeClasses: ClassInfo[]) => {
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
        setSelectedClassIds(new Set(ids));
        setMode(targetMode);
    };

    const saveRoleClasses = () => {
        const ids = Array.from(selectedClassIds);
        setDraft(prev => ({ ...prev, homeroomClassIds: ids }));
        resetSelection();
        setMode('idle');
    };

    const clearHomeroomClasses = () => {
        setDraft(prev => ({ ...prev, homeroomClassIds: [] }));
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
        setDraft(prev => ({ ...prev, gradeLeaderGrades: Array.from(selectedGrades) }));
        setSelectedGrades(new Set());
        setMode('idle');
    };

    const saveDepartment = (department: TeacherDepartment) => {
        setDraft(prev => ({ ...prev, departmentId: department.id, departmentName: department.name }));
        setMode('idle');
    };

    const addTeachingAssignments = (subject: string) => {
        const selectedIds = Array.from(selectedClassIds);
        setDraft(prev => {
            const existingKeys = new Set(prev.teachingAssignments.map(item => `${item.classId}-${item.subject}`));
            const additions = selectedIds
                .map(classId => ({ classId, subject }))
                .filter(item => !existingKeys.has(`${item.classId}-${item.subject}`));
            return { ...prev, teachingAssignments: [...prev.teachingAssignments, ...additions] };
        });
        resetSelection();
        setMode('idle');
    };

    const removeTeachingGroup = (group: TeachingGroup) => {
        const classSet = new Set(group.classIds);
        setDraft(prev => ({
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
                setDraft(prev => ({ ...prev, avatar: reader.result as string }));
            }
            setMode('idle');
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    const renderClassSelectorPage = () => {
        const isTeaching = mode === 'teachingClasses';
        const title = isTeaching ? '选择任教班级' : '选择班主任班级';
        const primaryText = isTeaching ? '下一步：选择学科' : '保存班主任班级';
        const onPrimary = isTeaching ? () => setMode('teachingSubject') : saveRoleClasses;

        return (
            <div className="flex h-full min-h-0 overflow-hidden flex-col bg-slate-50 font-sans text-slate-900">
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
                    <button onClick={() => setMode('idle')} className="flex h-11 w-11 -ml-3 items-center justify-center rounded-full text-slate-500 active:bg-slate-100">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h2 className={`${phoneText.navTitle} text-slate-900`}>{title}</h2>
                    <div className="w-11" />
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div className="mb-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium leading-relaxed text-blue-700">
                        {isTeaching ? '先选择一个或多个班级，下一步再为这些班级选择同一任教学科。' : '可按年级批量选择，也可以单独选择具体班级。'}
                    </div>

                    <div className="space-y-3">
                        {Object.entries(classesByGrade).map(([grade, gradeClasses]) => {
                            const allSelected = gradeClasses.every(classInfo => selectedClassIds.has(classInfo.id));
                            const selectedCount = gradeClasses.filter(classInfo => selectedClassIds.has(classInfo.id)).length;

                            return (
                                <MobileCard key={grade} variant="card" padding="md">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div>
                                            <h3 className={`${phoneText.sectionTitle} text-slate-900`}>{grade}</h3>
                                            <p className="mt-1 text-xs text-slate-400">已选 {selectedCount} / {gradeClasses.length} 个班</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleGradeClasses(gradeClasses)}
                                            className={`rounded-full px-3 py-2 text-xs font-bold transition-colors ${allSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 active:bg-blue-100'}`}
                                        >
                                            {allSelected ? '取消全选' : '全选本年级'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {gradeClasses.map(classInfo => {
                                            const selected = selectedClassIds.has(classInfo.id);
                                            return (
                                                <button
                                                    key={classInfo.id}
                                                    type="button"
                                                    onClick={() => toggleClass(classInfo.id)}
                                                    className={`min-h-11 rounded-xl border text-sm font-bold transition-all active:scale-95 ${selected ? 'border-blue-200 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-500'}`}
                                                >
                                                    {getClassShortLabel(classInfo)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </MobileCard>
                            );
                        })}
                    </div>
                </div>

                <div className="shrink-0 space-y-2 border-t border-slate-100 bg-white px-5 pb-6 pt-3">
                    <button
                        type="button"
                        disabled={selectedClassIds.size === 0}
                        onClick={onPrimary}
                        className="flex h-12 w-full items-center justify-center rounded-2xl bg-blue-600 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                    >
                        {selectedClassIds.size > 0 ? `${primaryText}（已选 ${selectedClassIds.size} 个班）` : '请先选择班级'}
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

    const renderSubjectSelectorPage = () => (
        <div className="flex h-full min-h-0 overflow-hidden flex-col bg-slate-50 font-sans text-slate-900">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
                <button onClick={() => setMode('teachingClasses')} className="flex h-11 w-11 -ml-3 items-center justify-center rounded-full text-slate-500 active:bg-slate-100">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className={`${phoneText.navTitle} text-slate-900`}>选择任教学科</h2>
                <div className="w-11" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
                <MobileCard variant="card" padding="md">
                    <p className="text-xs font-medium text-slate-400">将学科应用到</p>
                    <h3 className="mt-2 text-base font-bold leading-relaxed text-slate-900">
                        {summarizeClassIds(Array.from(selectedClassIds), classes)}
                    </h3>
                </MobileCard>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            type="button"
                            onClick={() => addTeachingAssignments(subject)}
                            className="flex min-h-14 items-center justify-center rounded-2xl border border-slate-100 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition-all active:scale-95 active:border-blue-200 active:bg-blue-50 active:text-blue-600"
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderGradeLeaderSelectorPage = () => (
        <div className="flex h-full min-h-0 overflow-hidden flex-col bg-slate-50 font-sans text-slate-900">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
                <button onClick={() => setMode('idle')} className="flex h-11 w-11 -ml-3 items-center justify-center rounded-full text-slate-500 active:bg-slate-100">
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
                    onClick={() => {
                        setDraft(prev => ({ ...prev, gradeLeaderGrades: [] }));
                        setSelectedGrades(new Set());
                        setMode('idle');
                    }}
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
                <button onClick={() => setMode('idle')} className="flex h-11 w-11 -ml-3 items-center justify-center rounded-full text-slate-500 active:bg-slate-100">
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
                        setDraft(prev => ({ ...prev, departmentId: '', departmentName: '' }));
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

    const roleSummary = (ids: string[]) => ids.length > 0 ? summarizeClassIds(ids, classes) : '暂未选择';
    const gradeLeaderSummary = draft.gradeLeaderGrades.length > 0 ? draft.gradeLeaderGrades.join('、') : '暂未选择';

    if (mode === 'teachingClasses' || mode === 'homeroom') return renderClassSelectorPage();
    if (mode === 'teachingSubject') return renderSubjectSelectorPage();
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
                <button onClick={() => onSave(draft)} className="text-sm font-extrabold text-blue-600 active:text-blue-700">
                    保存
                </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 pb-8">
                <MobileCard variant="hero" padding="lg" className="text-center">
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

                <MobileCard variant="card" padding="md">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <IconBadge icon={BookOpen} size="md" tone="blue" />
                            <div>
                                <h2 className={`${phoneText.sectionTitle} text-slate-900`}>任教班级与学科</h2>
                                <p className="mt-1 text-xs text-slate-400">先选班级，再选学科</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => { resetSelection(); setMode('teachingClasses'); }} className="flex h-10 items-center gap-1 rounded-full bg-blue-50 px-3 text-xs font-extrabold text-blue-600 active:bg-blue-100">
                            <Plus className="h-4 w-4" />
                            添加
                        </button>
                    </div>

                    {teachingGroups.length === 0 ? (
                        <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm font-medium text-slate-400">暂未配置任教范围</div>
                    ) : (
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

                <MobileCard variant="card" padding="md">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <IconBadge icon={Sparkles} size="md" tone="violet" />
                            <div>
                                <h2 className={`${phoneText.sectionTitle} text-slate-900`}>担任班主任的班级</h2>
                                <p className="mt-1 text-xs text-slate-400">{roleSummary(draft.homeroomClassIds)}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => openRoleSelector('homeroom', draft.homeroomClassIds)} className="rounded-full bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-600 active:bg-violet-100">修改</button>
                    </div>
                </MobileCard>

                <MobileCard variant="card" padding="md">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <IconBadge icon={Users} size="md" tone="brand" />
                            <div>
                                <h2 className={`${phoneText.sectionTitle} text-slate-900`}>担任年级组长的年级</h2>
                                <p className="mt-1 text-xs text-slate-400">{gradeLeaderSummary}</p>
                            </div>
                        </div>
                        <button type="button" onClick={openGradeLeaderSelector} className="rounded-full bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-600 active:bg-indigo-100">修改</button>
                    </div>
                </MobileCard>

                <MobileCard variant="card" padding="md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <IconBadge icon={Landmark} size="md" tone="brand" />
                            <div>
                                <h2 className={`${phoneText.sectionTitle} text-slate-900`}>部门设置</h2>
                                <p className="mt-1 text-xs text-slate-400">{draft.departmentName || '暂未选择'}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setMode('department')} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-600 active:bg-blue-100">修改</button>
                    </div>
                </MobileCard>
            </div>

            {mode === 'avatar' && renderAvatarSheet()}
        </div>
    );
};

export default TeacherProfileEditView;
