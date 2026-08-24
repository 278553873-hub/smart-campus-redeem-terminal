import React, { useMemo, useRef, useState } from 'react';
import {
    Camera,
    Check,
    ChevronLeft,
    ChevronRight,
    Image,
    Plus,
} from 'lucide-react';
import type { ClassInfo, TeacherDepartment, TeacherProfile, TeacherTeachingAssignment } from '../types';
import type { TeacherSpaceOption } from './MeView';
import { MobileCard } from '../components/ui/MobileCard';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileClassCascadePicker from '../components/ui/MobileClassCascadePicker';
import { MobileEditableRow } from '../components/ui/MobileEditableRow';
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
    const [editingTeachingSubject, setEditingTeachingSubject] = useState<string | null>(null);
    const [activeGrade, setActiveGrade] = useState('');
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const albumInputRef = useRef<HTMLInputElement>(null);

    const classesByGrade = useMemo(() => groupClassesByGrade(classes), [classes]);
    const gradeOptions = useMemo(() => Object.keys(classesByGrade), [classesByGrade]);
    const teachingGroups = useMemo(() => groupTeachingAssignmentsBySubject(draft.teachingAssignments, classes), [draft.teachingAssignments, classes]);
    const schoolNameLocked = currentSpace.type === 'school';
    const showManagementResponsibilities = currentSpace.type !== 'personal';
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

    const selectDepartment = (department?: TeacherDepartment) => {
        setSelectedDepartmentId(department?.id ?? '');
        applyProfileChange(prev => ({
            ...prev,
            departmentId: department?.id ?? '',
            departmentName: department?.name ?? '',
        }));
        setMode('idle');
    };

    const clearDepartment = () => {
        selectDepartment();
    };

    const openTeachingEditor = (group?: TeachingGroup) => {
        resetCascadeSelection(group?.classIds ?? []);
        setSelectedSubject(group?.subject ?? '');
        setEditingTeachingSubject(group?.subject ?? null);
        setMode('teachingClasses');
    };

    const saveTeachingAssignments = () => {
        if (!selectedSubject || selectedClassIds.size === 0) return;
        const selectedIds = Array.from(selectedClassIds);
        applyProfileChange(prev => {
            const retainedAssignments = editingTeachingSubject
                ? prev.teachingAssignments.filter(item => item.subject !== editingTeachingSubject)
                : prev.teachingAssignments;
            const existingKeys = new Set(retainedAssignments.map(item => `${item.classId}-${item.subject}`));
            const additions = selectedIds
                .map(classId => ({ classId, subject: selectedSubject }))
                .filter(item => !existingKeys.has(`${item.classId}-${item.subject}`));
            return { ...prev, teachingAssignments: [...retainedAssignments, ...additions] };
        });
        resetSelection();
        setSelectedSubject('');
        setEditingTeachingSubject(null);
        setMode('idle');
    };

    const clearTeachingGroup = (group: TeachingGroup) => {
        const classSet = new Set(group.classIds);
        applyProfileChange(prev => ({
            ...prev,
            teachingAssignments: prev.teachingAssignments.filter(item => item.subject !== group.subject || !classSet.has(item.classId)),
        }));
        setEditingTeachingSubject(null);
        setSelectedSubject('');
        resetSelection();
        setMode('idle');
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

    const renderClassSelectorSheet = () => {
        const isTeaching = mode === 'teachingClasses';
        const title = isTeaching ? (editingTeachingSubject ? '编辑任教信息' : '添加任教信息') : '选择带班班级';
        const onPrimary = isTeaching ? saveTeachingAssignments : saveRoleClasses;
        const primaryDisabled = selectedClassIds.size === 0 || (isTeaching && !selectedSubject);

        return (
            <MobileBottomSheet
                open
                title={title}
                onClose={() => setMode('idle')}
                size="tall"
                footerDivider={false}
                footer={(
                    <div className="space-y-2">
                        <button
                            type="button"
                            disabled={primaryDisabled}
                            onClick={onPrimary}
                            className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-bold text-[var(--tm-text-inverse)] transition-transform active:scale-[0.98] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
                        >
                            {primaryDisabled ? (selectedClassIds.size === 0 ? '请先选择班级' : '请先选择学科') : '完成'}
                        </button>
                        {!isTeaching && (
                            <button
                                type="button"
                                onClick={clearHomeroomClasses}
                                className="flex h-11 w-full items-center justify-center text-sm font-medium text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]"
                            >
                                清空带班班级
                            </button>
                        )}
                        {isTeaching && editingTeachingSubject && (
                            <button
                                type="button"
                                onClick={() => {
                                    const group = teachingGroups.find(item => item.subject === editingTeachingSubject);
                                    if (group) clearTeachingGroup(group);
                                }}
                                className="flex h-11 w-full items-center justify-center text-sm font-medium text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]"
                            >
                                清空任教信息
                            </button>
                        )}
                    </div>
                )}
            >
                <div className="flex min-h-[420px] flex-col gap-3 py-1">
                <div className={`${isTeaching ? 'h-[270px] shrink-0' : 'min-h-0 flex-1'} overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)]`}>
                    <MobileClassCascadePicker
                        groups={gradeOptions.map(grade => ({ gradeLabel: grade, classes: classesByGrade[grade] || [] }))}
                        selectedClassIds={selectedClassIds}
                        activeGrade={activeGrade}
                        onActiveGradeChange={setActiveGrade}
                        onToggleClass={toggleClass}
                    />
                </div>
                {isTeaching && (
                    <div className="shrink-0" aria-label="下方选择任教学科">
                        <h3 className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>任教学科</h3>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                            {subjects.map(subject => (
                                <button
                                    key={subject}
                                    type="button"
                                    onClick={() => setSelectedSubject(subject)}
                                    aria-pressed={selectedSubject === subject}
                                    className={`flex min-h-11 items-center justify-center rounded-[var(--tm-radius-control)] border px-2 text-xs font-semibold transition-colors ${selectedSubject === subject ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
                                >
                                    {subject}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                </div>
            </MobileBottomSheet>
        );
    };

    const renderGradeLeaderSelectorSheet = () => (
        <MobileBottomSheet
            open
            title="选择分管年级"
            onClose={() => setMode('idle')}
            footerDivider={false}
            footer={(
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={saveGradeLeaderGrades}
                        className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-bold text-[var(--tm-text-inverse)] active:scale-[0.98]"
                    >
                        完成
                    </button>
                    <button
                        type="button"
                        onClick={clearGradeLeaderGrades}
                        className="flex h-11 w-full items-center justify-center text-sm font-medium text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]"
                    >
                        清空分管年级
                    </button>
                </div>
            )}
        >
            <div className="grid grid-cols-2 gap-2 pb-1">
                {gradeOptions.map(grade => {
                        const selected = selectedGrades.has(grade);
                        return (
                            <button
                                key={grade}
                                type="button"
                                onClick={() => toggleGrade(grade)}
                                aria-pressed={selected}
                                className={`flex min-h-11 items-center justify-center rounded-[var(--tm-radius-control)] border px-3 text-sm font-semibold transition-colors ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'}`}
                            >
                                {grade}
                            </button>
                        );
                })}
            </div>
        </MobileBottomSheet>
    );

    const renderDepartmentSelectorSheet = () => (
        <MobileBottomSheet
            open
            title="选择部门"
            onClose={() => setMode('idle')}
            footerDivider={false}
            footer={selectedDepartmentId ? (
                <button
                    type="button"
                    onClick={clearDepartment}
                    className="flex h-11 w-full items-center justify-center text-sm font-medium text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]"
                >
                    清空部门
                </button>
            ) : undefined}
        >
            <div className="divide-y divide-[var(--tm-border-subtle)] pb-1">
                {departments.map(department => {
                    const selected = selectedDepartmentId === department.id;
                    return (
                        <button
                            key={department.id}
                            type="button"
                            onClick={() => selectDepartment(department)}
                            aria-pressed={selected}
                            className="flex min-h-14 w-full items-center justify-between text-left text-sm font-medium text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]"
                        >
                            <span>{department.name}</span>
                            {selected && <Check className="h-4 w-4 text-[var(--tm-brand-primary)]" aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>
        </MobileBottomSheet>
    );

    const renderAvatarSheet = () => (
        <MobileBottomSheet open title="更换头像" onClose={() => setMode('idle')}>
            <div className="space-y-2 pb-1">
                <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-brand-primary-soft)] px-4 text-left font-semibold text-[var(--tm-brand-primary-pressed)] active:bg-[var(--tm-brand-primary-soft-strong)]">
                    <Camera className="h-5 w-5" aria-hidden="true" />
                    拍照
                </button>
                <button type="button" onClick={() => albumInputRef.current?.click()} className="flex h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-4 text-left font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]">
                    <Image className="h-5 w-5" aria-hidden="true" />
                    从相册选择
                </button>
            </div>
        </MobileBottomSheet>
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

    const renderTextEditorSheet = (
        title: string,
        label: string,
        value: string,
        onValueChange: (value: string) => void,
        onSave: () => void,
        maxLength: number,
    ) => (
        <MobileBottomSheet
            open
            title={title}
            onClose={() => setMode('idle')}
            footerDivider={false}
            footer={(
                <button
                    type="button"
                    disabled={!value.trim()}
                    onClick={onSave}
                    className="h-12 w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-sm font-bold text-[var(--tm-text-inverse)] active:scale-[0.98] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
                >
                    完成
                </button>
            )}
        >
            <label className="block py-2">
                <span className={`${phoneText.label} text-[var(--tm-text-tertiary)]`}>{label}</span>
                <input
                    value={value}
                    onChange={event => onValueChange(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter' && value.trim()) onSave();
                    }}
                    autoFocus
                    maxLength={maxLength}
                    className="mt-2 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-4 text-sm font-medium text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]"
                    aria-label={label}
                />
            </label>
        </MobileBottomSheet>
    );

    const renderNameDialog = () => renderTextEditorSheet('修改姓名', '姓名', nameDraft, setNameDraft, saveName, 20);
    const renderSchoolDialog = () => renderTextEditorSheet('修改学校', '学校', schoolDraft, setSchoolDraft, saveSchoolName, 30);


    const roleSummary = (ids: string[]) => ids.length > 0 ? summarizeClassIds(ids, classes) : '未设置';
    const gradeLeaderSummary = draft.gradeLeaderGrades.length > 0 ? draft.gradeLeaderGrades.join('、') : '未设置';
    const renderConfigValue = (value: string, selected: boolean) => (
        <span className={`min-w-0 truncate text-right text-sm ${selected ? 'font-semibold text-[var(--tm-text-primary)]' : 'font-medium text-[var(--tm-text-tertiary)]'}`}>{value}</span>
    );

    const fieldLabelClass = 'text-sm font-medium text-[var(--tm-text-tertiary)]';
    const editableRowLayoutClass = 'grid min-h-14 w-full grid-cols-[80px_minmax(0,1fr)] items-center gap-3 py-1.5 text-left';
    const rowValueClass = 'flex min-w-0 items-center justify-end gap-2 text-sm font-semibold text-[var(--tm-text-primary)]';

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)] font-sans text-[var(--tm-text-primary)]">
            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={readAvatarFile} />
            <input ref={albumInputRef} type="file" accept="image/*" className="hidden" onChange={readAvatarFile} />

            <header className="flex h-11 shrink-0 items-center justify-between bg-[var(--tm-page-plain-header-bg)] px-4">
                <button onClick={onBack} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回我的页面">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className={`${phoneText.navTitle} text-[var(--tm-text-primary)]`}>个人信息编辑</h1>
                <div className="h-11 w-11" aria-hidden="true" />
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 no-scrollbar">
                <MobileCard variant="hero" padding="lg" className="teacher-avatar-card text-center">
                    <button type="button" onClick={() => setMode('avatar')} className="group mx-auto block" aria-label="更换头像">
                        <div className="relative mx-auto h-24 w-24 rounded-full bg-[linear-gradient(145deg,var(--tm-bg-surface),var(--tm-brand-primary-soft-strong),var(--tm-brand-secondary-soft))] p-[3px] [box-shadow:var(--tm-shadow-avatar)] ring-1 ring-white/90">
                            <span className="block h-full w-full overflow-hidden rounded-full bg-[var(--tm-bg-surface)]">
                                <img src={draft.avatar} alt="老师头像" className="h-full w-full object-cover object-center" />
                            </span>
                            <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[var(--tm-brand-primary)] text-white [box-shadow:var(--tm-shadow-icon)] transition-transform group-active:scale-95">
                                <Camera className="h-4 w-4" />
                            </span>
                        </div>
                    </button>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-basic-info-card">
                    <div className="mb-2 flex h-8 items-center">
                        <h2 className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>基础资料</h2>
                    </div>
                    <div className="divide-y divide-[var(--tm-border-subtle)]">
                        <MobileEditableRow
                            onClick={() => { setNameDraft(draft.name); setMode('name'); }}
                            className={editableRowLayoutClass}
                            aria-label={`修改姓名，当前${draft.name}`}
                        >
                            <span className={fieldLabelClass}>姓名</span>
                            <span className={rowValueClass}>
                                <span className="truncate">{draft.name}</span>
                                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                            </span>
                        </MobileEditableRow>
                        {schoolNameLocked ? (
                            <div className="grid min-h-14 grid-cols-[80px_minmax(0,1fr)] items-center gap-3 py-1.5">
                                <span className={fieldLabelClass}>学校</span>
                                {renderConfigValue(displaySchoolName || '未设置', Boolean(displaySchoolName))}
                            </div>
                        ) : (
                            <MobileEditableRow
                                onClick={() => { setSchoolDraft(draft.schoolName); setMode('school'); }}
                                className={editableRowLayoutClass}
                                aria-label={`修改学校，当前${displaySchoolName || '未设置'}`}
                            >
                                <span className={fieldLabelClass}>学校</span>
                                <span className={`flex min-w-0 items-center justify-end gap-2 text-sm ${displaySchoolName ? 'font-semibold text-[var(--tm-text-primary)]' : 'font-medium text-[var(--tm-text-tertiary)]'}`}>
                                    <span className="truncate">{displaySchoolName || '未设置'}</span>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                                </span>
                            </MobileEditableRow>
                        )}
                        <MobileEditableRow onClick={openDepartmentSelector} className={editableRowLayoutClass} aria-label={`修改部门，当前${draft.departmentName || '未设置'}`}>
                            <span className={fieldLabelClass}>部门</span>
                            <span className={`flex min-w-0 items-center justify-end gap-2 text-sm ${draft.departmentName ? 'font-semibold text-[var(--tm-text-primary)]' : 'font-medium text-[var(--tm-text-tertiary)]'}`}>
                                <span className="truncate">{draft.departmentName || '未设置'}</span>
                                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                            </span>
                        </MobileEditableRow>
                    </div>
                </MobileCard>

                <MobileCard variant="card" padding="md" className="teacher-teaching-card">
                    <div className="mb-2 flex h-11 items-center justify-between">
                        <h2 className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>任教信息</h2>
                        <button type="button" onClick={() => openTeachingEditor()} className="group flex h-11 items-center justify-center" aria-label="添加任教信息">
                            <span className="flex h-7 items-center gap-1 rounded-lg border border-[var(--tm-brand-primary)] bg-[var(--tm-bg-surface)] px-2.5 text-xs font-semibold text-[var(--tm-brand-primary)] transition-[background-color,transform] group-active:scale-95 group-active:bg-[var(--tm-brand-primary-soft)]">
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                添加
                            </span>
                        </button>
                    </div>

                    <div className="divide-y divide-[var(--tm-border-subtle)]">
                        {teachingGroups.length > 0 && (
                            teachingGroups.map(group => (
                                <MobileEditableRow key={group.subject} onClick={() => openTeachingEditor(group)} className={editableRowLayoutClass} aria-label={`编辑${group.subject}任教信息，当前${group.summary}`}>
                                    <span className={fieldLabelClass}>{group.subject}</span>
                                    <span className={rowValueClass}>
                                        <span className="line-clamp-2 text-right leading-5">{group.summary}</span>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                                    </span>
                                </MobileEditableRow>
                            ))
                        )}
                    </div>
                </MobileCard>

                {showManagementResponsibilities && (
                    <MobileCard variant="card" padding="md" className="teacher-management-card">
                        <div className="mb-2 flex h-8 items-center">
                            <h2 className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>管理职责</h2>
                        </div>
                        <div className="divide-y divide-[var(--tm-border-subtle)]">
                            <MobileEditableRow onClick={() => openRoleSelector('homeroom', draft.homeroomClassIds)} className={editableRowLayoutClass} aria-label={`修改带班班级，当前${roleSummary(draft.homeroomClassIds)}`}>
                                <span className={fieldLabelClass}>带班班级</span>
                                <span className="flex min-w-0 items-center justify-end gap-2">
                                    {renderConfigValue(roleSummary(draft.homeroomClassIds), draft.homeroomClassIds.length > 0)}
                                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                                </span>
                            </MobileEditableRow>
                            <MobileEditableRow onClick={openGradeLeaderSelector} className={editableRowLayoutClass} aria-label={`修改分管年级，当前${gradeLeaderSummary}`}>
                                <span className={fieldLabelClass}>分管年级</span>
                                <span className="flex min-w-0 items-center justify-end gap-2">
                                    {renderConfigValue(gradeLeaderSummary, draft.gradeLeaderGrades.length > 0)}
                                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                                </span>
                            </MobileEditableRow>
                        </div>
                    </MobileCard>
                )}

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
