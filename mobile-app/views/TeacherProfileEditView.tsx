import React, { useMemo, useRef, useState } from 'react';
import {
    Camera,
    ChevronLeft,
    Image,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import type { ClassInfo, TeacherDepartment, TeacherProfile, TeacherTeachingAssignment } from '../types';
import type { TeacherSpaceOption } from './MeView';
import { ASSETS } from '../assets/images';
import { MobileCard } from '../components/ui/MobileCard';
import { phoneText } from '../styles/teacherMobileTokens';

interface TeacherProfileEditViewProps {
    profile: TeacherProfile;
    classes: ClassInfo[];
    subjects: string[];
    departments: TeacherDepartment[];
    currentSpace: TeacherSpaceOption;
    onBack: () => void;
    onChange: (profile: TeacherProfile) => void;
}

type EditorMode = 'idle' | 'avatar' | 'name' | 'school' | 'teachingClasses' | 'homeroom' | 'gradeLeader' | 'department';

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

const TeacherProfileEditView: React.FC<TeacherProfileEditViewProps> = ({ profile, classes, subjects, departments, currentSpace, onBack, onChange }) => {
    const [draft, setDraft] = useState<TeacherProfile>(profile);
    const [nameDraft, setNameDraft] = useState(profile.name);
    const [schoolDraft, setSchoolDraft] = useState(profile.schoolName);
    const [mode, setMode] = useState<EditorMode>('idle');
    const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
    const [selectedGrades, setSelectedGrades] = useState<Set<string>>(new Set());
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(profile.departmentId);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [activeGrade, setActiveGrade] = useState('');
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const albumInputRef = useRef<HTMLInputElement>(null);

    const classesByGrade = useMemo(() => groupClassesByGrade(classes), [classes]);
    const gradeOptions = useMemo(() => Object.keys(classesByGrade), [classesByGrade]);
    const teachingGroups = useMemo(() => groupTeachingAssignmentsBySubject(draft.teachingAssignments, classes), [draft.teachingAssignments, classes]);
    const schoolNameLocked = currentSpace.type === 'school';
    const displaySchoolName = schoolNameLocked ? currentSpace.title : draft.schoolName;

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

    const openDepartmentSelector = () => {
        setSelectedDepartmentId(draft.departmentId);
        setMode('department');
    };

    const saveDepartment = () => {
        const department = departments.find(item => item.id === selectedDepartmentId);
        if (!department) return;
        applyProfileChange(prev => ({ ...prev, departmentId: department.id, departmentName: department.name }));
        setMode('idle');
    };

    const clearDepartment = () => {
        setSelectedDepartmentId('');
        applyProfileChange(prev => ({ ...prev, departmentId: '', departmentName: '' }));
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

    const renderSheetFrame = (title: string, children: React.ReactNode, footer: React.ReactNode) => (
        <div className="absolute inset-0 z-[120] flex items-end bg-[var(--tm-mask)]" onClick={() => setMode('idle')}>
            <div
                className="bottom-sheet flex max-h-[86%] w-full min-h-0 flex-col rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-sheet)]"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={event => event.stopPropagation()}
            >
                <div className="shrink-0 px-5 pb-3 pt-3">
                    <div className="mx-auto mb-3 h-1.5 w-9 rounded-full bg-[var(--tm-brand-primary-soft-strong)]" aria-hidden="true" />
                    <h2 className={`${phoneText.sectionTitle} text-center text-[var(--tm-text-primary)]`}>{title}</h2>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden px-5">
                    {children}
                </div>
                <div className="shrink-0 space-y-1 border-t border-[var(--tm-border-subtle)] px-5 pb-5 pt-3">
                    {footer}
                </div>
            </div>
        </div>
    );

    const renderClassSelectorSheet = () => {
        const isTeaching = mode === 'teachingClasses';
        const isHomeroom = mode === 'homeroom';
        const title = isTeaching ? '新增任教班级' : '选择带班班级';
        const onPrimary = isTeaching ? saveTeachingAssignments : saveRoleClasses;
        const primaryDisabled = selectedClassIds.size === 0 || (isTeaching && !selectedSubject);
        const activeGradeClasses = classesByGrade[activeGrade] || [];
        const activeSelectedCount = activeGradeClasses.filter(classInfo => selectedClassIds.has(classInfo.id)).length;

        return renderSheetFrame(
            title,
            <div className="flex h-full min-h-[420px] flex-col gap-3">
                <div className={`${isTeaching ? 'h-[270px] shrink-0' : 'min-h-0 flex-1'} overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)]`}>
                    <div className="grid h-full min-h-0 grid-cols-[92px_1fr]" aria-label="班级级联选择">
                        <div className="min-h-0 overflow-y-auto overscroll-contain border-r border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-2 no-scrollbar" aria-label="左侧先选年级">
                            {gradeOptions.map(grade => {
                                const selectedCount = (classesByGrade[grade] || []).filter(classInfo => selectedClassIds.has(classInfo.id)).length;
                                return (
                                    <button
                                        key={grade}
                                        type="button"
                                        onClick={() => setActiveGrade(grade)}
                                        className={`mb-2 flex min-h-11 w-full flex-col items-center justify-center rounded-[var(--tm-radius-control)] text-xs font-extrabold transition-all last:mb-0 active:scale-95 ${activeGrade === grade ? 'bg-[var(--tm-brand-primary)] text-white shadow-[var(--tm-shadow-icon)]' : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-brand-primary-soft)] active:text-[var(--tm-brand-primary-pressed)]'}`}
                                    >
                                        <span>{grade}</span>
                                        {selectedCount > 0 && <span className={`mt-0.5 text-[11px] ${activeGrade === grade ? 'text-white/80' : 'text-[var(--tm-brand-primary-pressed)]'}`}>{selectedCount}个</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex min-h-0 min-w-0 flex-col p-3" aria-label="右侧再选该年级下的班级">
                            <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className={`${phoneText.sectionTitle} truncate text-[var(--tm-text-primary)]`}>{activeGrade || '选择年级'}</h3>
                                    <p className="mt-1 text-xs text-[var(--tm-text-tertiary)]">已选 {activeSelectedCount} / {activeGradeClasses.length} 个班</p>
                                </div>
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
                                            aria-label={`${selected ? '取消选择' : '选择'}${classInfo.name}`}
                                            className={`flex min-h-12 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] border px-3 text-left text-sm font-bold transition-all active:scale-[0.99] ${selected ? 'border-[var(--tm-brand-primary-soft-strong)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-pressed)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
                                        >
                                            <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-black ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-white' : 'border-[var(--tm-border-control)] text-transparent'}`}>✓</span>
                                            <span className="min-w-0 flex-1 truncate">{classInfo.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                {isTeaching && (
                    <div className="shrink-0 rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-3" aria-label="下方选择任教学科">
                        <h3 className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>选择任教学科</h3>
                        <div className="mt-3 grid grid-cols-4 gap-2">
                            {subjects.map(subject => (
                                <button
                                    key={subject}
                                    type="button"
                                    onClick={() => setSelectedSubject(subject)}
                                    aria-pressed={selectedSubject === subject}
                                    className={`flex min-h-11 items-center justify-center rounded-[var(--tm-radius-control)] border px-2 text-xs font-extrabold transition-all active:scale-95 ${selectedSubject === subject ? 'border-[var(--tm-brand-primary-soft-strong)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-pressed)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>,
            <>
                <button
                    type="button"
                    disabled={primaryDisabled}
                    onClick={onPrimary}
                    className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-extrabold text-white shadow-[var(--tm-shadow-icon)] transition-all active:scale-[0.98] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)] disabled:shadow-none"
                >
                    {primaryDisabled ? (selectedClassIds.size === 0 ? '请先选择班级' : '请先选择学科') : '保存'}
                </button>
                <button
                    type="button"
                    onClick={isTeaching ? () => setMode('idle') : clearHomeroomClasses}
                    className="flex h-10 w-full items-center justify-center rounded-[var(--tm-radius-control)] text-sm font-medium text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]"
                >
                    暂不选择
                </button>
            </>
        );
    };

    const renderGradeLeaderSelectorSheet = () => (
        renderSheetFrame(
            '选择分管年级',
            <div className="max-h-[360px] overflow-y-auto pb-1">
                <div className="grid grid-cols-2 gap-3">
                    {gradeOptions.map(grade => {
                        const selected = selectedGrades.has(grade);
                        return (
                            <button
                                key={grade}
                                type="button"
                                onClick={() => toggleGrade(grade)}
                                aria-pressed={selected}
                                className={`flex min-h-14 items-center justify-center rounded-[var(--tm-radius-inner)] border px-3 text-sm font-bold transition-all active:scale-95 ${selected ? 'border-[var(--tm-brand-primary-soft-strong)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-pressed)] shadow-[var(--tm-shadow-control)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] shadow-[var(--tm-shadow-control)]'}`}
                            >
                                {grade}
                            </button>
                        );
                    })}
                </div>
            </div>,
            <>
                <button
                    type="button"
                    onClick={saveGradeLeaderGrades}
                    className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-extrabold text-white shadow-[var(--tm-shadow-icon)] transition-all active:scale-[0.98]"
                >
                    保存
                </button>
                <button
                    type="button"
                    onClick={clearGradeLeaderGrades}
                    className="flex h-10 w-full items-center justify-center rounded-[var(--tm-radius-control)] text-sm font-medium text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]"
                >
                    暂不选择
                </button>
            </>
        )
    );

    const renderDepartmentSelectorSheet = () => (
        renderSheetFrame(
            '选择部门',
            <div className="max-h-[360px] overflow-y-auto pb-1">
                <div className="space-y-2">
                    {departments.map(department => {
                        const selected = selectedDepartmentId === department.id;
                        return (
                            <button
                                key={department.id}
                                type="button"
                                onClick={() => setSelectedDepartmentId(department.id)}
                                aria-pressed={selected}
                                className={`flex min-h-14 w-full items-center justify-between rounded-[var(--tm-radius-inner)] border px-4 text-left transition-all active:scale-[0.99] ${selected ? 'border-[var(--tm-brand-primary-soft-strong)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-pressed)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)]'}`}
                            >
                                <span className="text-sm font-bold">{department.name}</span>
                                {selected && <span className="rounded-full bg-[var(--tm-brand-primary)] px-2.5 py-1 text-[11px] font-bold text-white">当前</span>}
                            </button>
                        );
                    })}
                </div>
            </div>,
            <>
                <button
                    type="button"
                    disabled={!selectedDepartmentId}
                    onClick={saveDepartment}
                    className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-extrabold text-white shadow-[var(--tm-shadow-icon)] transition-all active:scale-[0.98] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)] disabled:shadow-none"
                >
                    保存
                </button>
                <button
                    type="button"
                    onClick={clearDepartment}
                    className="flex h-10 w-full items-center justify-center rounded-[var(--tm-radius-control)] text-sm font-medium text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]"
                >
                    暂不选择
                </button>
            </>
        )
    );

    const renderAvatarSheet = () => (
        <div className="absolute inset-0 z-[130] flex items-end bg-[var(--tm-mask)] px-4 pb-5" onClick={() => setMode('idle')}>
            <div className="w-full rounded-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-sheet)]" onClick={event => event.stopPropagation()}>
                <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[var(--tm-brand-primary-soft-strong)]" aria-hidden="true" />
                <h3 className={`px-2 text-center ${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>更换头像</h3>
                <div className="mt-5 space-y-2">
                    <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-brand-primary-soft)] px-4 text-left font-bold text-[var(--tm-brand-primary-pressed)] active:bg-[var(--tm-brand-primary-soft-strong)]">
                        <Camera className="h-5 w-5" />
                        拍照
                    </button>
                    <button type="button" onClick={() => albumInputRef.current?.click()} className="flex h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-4 text-left font-bold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]">
                        <Image className="h-5 w-5" />
                        从相册选择
                    </button>
                    <button type="button" onClick={() => setMode('idle')} className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] text-sm font-bold text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]">
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

    const saveSchoolName = () => {
        const normalizedSchoolName = schoolDraft.trim();
        if (!normalizedSchoolName) return;
        applyProfileChange(prev => ({ ...prev, schoolName: normalizedSchoolName }));
        setMode('idle');
    };

    const renderNameDialog = () => (
        <div className="absolute inset-0 z-[130] flex items-center bg-[var(--tm-mask)] px-5" onClick={() => setMode('idle')}>
            <div className="w-full rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-5 shadow-[var(--tm-shadow-sheet)]" onClick={event => event.stopPropagation()}>
                <h3 className={`text-center ${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>修改姓名</h3>
                <input
                    value={nameDraft}
                    onChange={event => setNameDraft(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') saveName();
                    }}
                    autoFocus
                    maxLength={20}
                    className="mt-5 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-4 text-base font-bold text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:bg-[var(--tm-bg-surface)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]"
                    aria-label="教师姓名"
                />
                <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => setMode('idle')} className="flex h-11 flex-1 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] text-sm font-bold text-[var(--tm-text-secondary)]">取消</button>
                    <button type="button" disabled={!nameDraft.trim()} onClick={saveName} className="flex h-11 flex-1 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-extrabold text-white disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">确定</button>
                </div>
            </div>
        </div>
    );

    const renderSchoolDialog = () => (
        <div className="absolute inset-0 z-[130] flex items-center bg-[var(--tm-mask)] px-5" onClick={() => setMode('idle')}>
            <div className="w-full rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-5 shadow-[var(--tm-shadow-sheet)]" onClick={event => event.stopPropagation()}>
                <h3 className={`text-center ${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>修改学校</h3>
                <input
                    value={schoolDraft}
                    onChange={event => setSchoolDraft(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') saveSchoolName();
                    }}
                    autoFocus
                    maxLength={30}
                    className="mt-5 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-4 text-base font-bold text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:bg-[var(--tm-bg-surface)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]"
                    aria-label="学校名称"
                />
                <div className="mt-4 flex gap-3">
                    <button type="button" onClick={() => setMode('idle')} className="flex h-11 flex-1 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] text-sm font-bold text-[var(--tm-text-secondary)]">取消</button>
                    <button type="button" disabled={!schoolDraft.trim()} onClick={saveSchoolName} className="flex h-11 flex-1 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-extrabold text-white disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">确定</button>
                </div>
            </div>
        </div>
    );

    const roleSummary = (ids: string[]) => ids.length > 0 ? summarizeClassIds(ids, classes) : '暂未选择';
    const gradeLeaderSummary = draft.gradeLeaderGrades.length > 0 ? draft.gradeLeaderGrades.join('、') : '暂未选择';
    const displayAvatar = draft.avatar === ASSETS.AVATAR.TEACHER_LIU
        ? ASSETS.AVATAR.TEACHER_LIU_RAW
        : draft.avatar;
    const renderConfigValue = (value: string, selected: boolean) => (
        <p className={`min-w-0 truncate text-right text-sm ${selected ? 'font-bold text-[var(--tm-text-primary)]' : 'font-normal text-[var(--tm-text-tertiary)]'}`}>{value}</p>
    );

    const editButtonClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)] transition active:scale-95 active:bg-[var(--tm-brand-primary-soft-strong)]';
    const fieldLabelClass = 'text-sm font-medium text-[var(--tm-text-tertiary)]';

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)] font-sans text-[var(--tm-text-primary)]">
            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={readAvatarFile} />
            <input ref={albumInputRef} type="file" accept="image/*" className="hidden" onChange={readAvatarFile} />

            <div className="shrink-0 px-5 pt-3">
                <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] shadow-[var(--tm-shadow-control)] ring-1 ring-[var(--tm-border-subtle)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回">
                    <ChevronLeft className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-8 pt-2">
                <MobileCard variant="hero" padding="lg" className="teacher-avatar-card text-center">
                    <button type="button" onClick={() => setMode('avatar')} className="group mx-auto block" aria-label="更换头像">
                        <div className="relative mx-auto h-24 w-24 rounded-full bg-[linear-gradient(145deg,var(--tm-bg-surface),var(--tm-brand-primary-soft-strong),var(--tm-brand-secondary-soft))] p-[3px] shadow-[var(--tm-shadow-avatar)] ring-1 ring-white/90">
                            <span className="block h-full w-full overflow-hidden rounded-full bg-[var(--tm-bg-surface)]">
                                <img src={displayAvatar} alt="老师头像" className="h-full w-full object-cover object-center" />
                            </span>
                            <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[var(--tm-brand-primary)] text-white shadow-[var(--tm-shadow-icon)] transition-transform group-active:scale-95">
                                <Camera className="h-4 w-4" />
                            </span>
                        </div>
                    </button>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-name-card">
                    <div className="flex items-center justify-between gap-3">
                        <div className="grid min-w-0 flex-1 grid-cols-[96px_1fr] items-center gap-3">
                            <span className={fieldLabelClass}>姓名</span>
                            <h2 className="min-w-0 truncate text-right text-sm font-bold text-[var(--tm-text-primary)]">{draft.name}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setNameDraft(draft.name); setMode('name'); }}
                            className={editButtonClass}
                            aria-label="修改姓名"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-school-card">
                    <div className="flex items-center justify-between gap-3">
                        <div className="grid min-w-0 flex-1 grid-cols-[96px_1fr] items-center gap-3">
                            <span className={fieldLabelClass}>学校</span>
                            {renderConfigValue(displaySchoolName || '暂未选择', Boolean(displaySchoolName))}
                        </div>
                        {!schoolNameLocked && (
                            <button
                                type="button"
                                onClick={() => { setSchoolDraft(draft.schoolName); setMode('school'); }}
                                className={editButtonClass}
                                aria-label="修改学校"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-teaching-card">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="grid min-w-0 flex-1 grid-cols-[96px_1fr] items-center gap-3">
                            <span className={fieldLabelClass}>任教班级</span>
                        </div>
                        <button type="button" onClick={() => { resetCascadeSelection(); setMode('teachingClasses'); }} className={editButtonClass} aria-label="添加任教班级">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    {teachingGroups.length > 0 && (
                        <div className="space-y-2">
                            {teachingGroups.map(group => (
                                <div key={group.subject} className="flex items-center gap-3 rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] px-4 py-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[15px] font-bold text-[var(--tm-text-primary)]">{group.subject}</span>
                                            <span className="rounded-full bg-[var(--tm-brand-primary-soft)] px-2 py-1 text-[11px] font-bold text-[var(--tm-brand-primary-pressed)]">{group.classIds.length} 个班</span>
                                        </div>
                                        <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--tm-text-secondary)]">{group.summary}</p>
                                    </div>
                                    <button type="button" onClick={() => removeTeachingGroup(group)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-disabled)] transition active:scale-95 active:bg-[var(--tm-status-negative-soft)] active:text-[var(--tm-status-negative)]" aria-label={`删除${group.subject}任教范围`}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-homeroom-card">
                    <div className="flex items-center justify-between gap-3">
                        <div className="grid min-w-0 flex-1 grid-cols-[96px_1fr] items-center gap-3">
                            <span className={fieldLabelClass}>带班班级</span>
                            {renderConfigValue(roleSummary(draft.homeroomClassIds), draft.homeroomClassIds.length > 0)}
                        </div>
                        <button type="button" onClick={() => openRoleSelector('homeroom', draft.homeroomClassIds)} className={editButtonClass} aria-label="修改带班班级">
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-grade-leader-card">
                    <div className="flex items-center justify-between gap-3">
                        <div className="grid min-w-0 flex-1 grid-cols-[96px_1fr] items-center gap-3">
                            <span className={fieldLabelClass}>分管年级</span>
                            {renderConfigValue(gradeLeaderSummary, draft.gradeLeaderGrades.length > 0)}
                        </div>
                        <button type="button" onClick={openGradeLeaderSelector} className={editButtonClass} aria-label="修改分管年级">
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-department-card">
                    <div className="flex items-center justify-between gap-3">
                        <div className="grid min-w-0 flex-1 grid-cols-[96px_1fr] items-center gap-3">
                            <span className={fieldLabelClass}>部门设置</span>
                            {renderConfigValue(draft.departmentName || '暂未选择', Boolean(draft.departmentName))}
                        </div>
                        <button type="button" onClick={openDepartmentSelector} className={editButtonClass} aria-label="修改部门设置">
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                </MobileCard>

            </div>

            {mode === 'avatar' && renderAvatarSheet()}
            {mode === 'name' && renderNameDialog()}
            {mode === 'school' && renderSchoolDialog()}
            {(mode === 'teachingClasses' || mode === 'homeroom') && renderClassSelectorSheet()}
            {mode === 'gradeLeader' && renderGradeLeaderSelectorSheet()}
            {mode === 'department' && renderDepartmentSelectorSheet()}
        </div>
    );
};

export default TeacherProfileEditView;
