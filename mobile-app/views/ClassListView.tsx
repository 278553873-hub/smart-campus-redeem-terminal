import React, { useMemo, useState } from 'react';
import { ClassInfo, Student, TeacherProfile } from '../types';
import { UsersIcon, ChartIcon, WechatMoreIcon, TrophyIcon, GiftIcon, ScanFaceIcon, ShieldIcon, FileTextIcon, CloseIcon, EditIcon, UserPlusIcon } from '../components/Icons';

interface ClassListViewProps {
    classes: ClassInfo[];
    teacherProfile: TeacherProfile;
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
    onEditClassInfo: (classId: string) => void;
}

type ClassActionTone = 'amber' | 'indigo' | 'emerald' | 'blue' | 'slate' | 'cyan' | 'violet';

interface ClassActionItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: ClassActionTone;
    hasBadge?: boolean;
    onClick: () => void;
}

interface ClassActionGroup {
    title: string;
    items: ClassActionItem[];
}

const actionToneClass: Record<ClassActionTone, string> = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
};

const ClassListView: React.FC<ClassListViewProps> = ({
    classes,
    teacherProfile,
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
    onEditClassInfo
}) => {
    const [activeActionClassId, setActiveActionClassId] = useState<string | null>(null);
    const [showTeachingOnly, setShowTeachingOnly] = useState(false);
    const [leftStudentClassId, setLeftStudentClassId] = useState<string | null>(null);

    const teachingClassIds = useMemo(() => (
        new Set(teacherProfile.teachingAssignments.map(assignment => assignment.classId))
    ), [teacherProfile.teachingAssignments]);

    const visibleClasses = showTeachingOnly
        ? classes.filter(cls => teachingClassIds.has(cls.id))
        : classes;
    const leftStudentClass = useMemo(() => classes.find(cls => cls.id === leftStudentClassId) || null, [classes, leftStudentClassId]);
    const leftStudents = useMemo(() => (
        leftStudentClassId ? getStudentsForClass(leftStudentClassId).filter(student => student.status === 'left') : []
    ), [getStudentsForClass, leftStudentClassId]);
    const showLeftStudentSheet = leftStudentClassId !== null;
    const activeActionClass = useMemo(() => classes.find(cls => cls.id === activeActionClassId) || null, [classes, activeActionClassId]);

    const closeActionSheet = () => setActiveActionClassId(null);

    const runClassAction = (action: (classId: string) => void) => {
        if (!activeActionClass) return;
        const classId = activeActionClass.id;
        closeActionSheet();
        action(classId);
    };

    const actionGroups: ClassActionGroup[] = activeActionClass ? [
        {
            title: '日常操作',
            items: [
                {
                    label: '兑换奖励',
                    icon: GiftIcon,
                    tone: 'amber',
                    hasBadge: activeActionClass.hasPendingRewards,
                    onClick: () => runClassAction(onViewRewardVerification),
                },
                {
                    label: '作业录入',
                    icon: FileTextIcon,
                    tone: 'blue',
                    onClick: () => runClassAction(onViewHomeworkEntry),
                },
            ],
        },
        {
            title: '学生信息更新',
            items: [
                {
                    label: '批量修改学生',
                    icon: UsersIcon,
                    tone: 'slate',
                    onClick: () => runClassAction(onSelectClass),
                },
                {
                    label: '设置兑换密码',
                    icon: ShieldIcon,
                    tone: 'indigo',
                    onClick: () => runClassAction(onViewBankPassword),
                },
                {
                    label: '更新人脸数据',
                    icon: ScanFaceIcon,
                    tone: 'emerald',
                    onClick: () => runClassAction(onViewFaceUpdate),
                },
            ],
        },
        {
            title: '班级维护',
            items: [
                {
                    label: '离校学生',
                    icon: UsersIcon,
                    tone: 'slate',
                    onClick: () => runClassAction(setLeftStudentClassId),
                },
                {
                    label: '编辑班级信息',
                    icon: EditIcon,
                    tone: 'violet',
                    onClick: () => runClassAction(onEditClassInfo),
                },
            ],
        },
        {
            title: '协同管理',
            items: [
                {
                    label: '邀请老师加入',
                    icon: UserPlusIcon,
                    tone: 'cyan',
                    onClick: () => runClassAction(onInviteTeacher),
                },
            ],
        },
    ] : [];

    return (
        <div className="relative h-full overflow-hidden">
            <div className="relative z-10 h-full overflow-y-auto p-4 space-y-4 pb-40 no-scrollbar">

            {/* Top Action Area: Leaderboard & Summary */}
            <div className="flex flex-col items-start gap-4 px-1">
                <button
                    className="h-10 rounded bg-gradient-to-r from-cyan-500 to-blue-500 px-4 text-white shadow-sm transition-all active:scale-95 flex items-center gap-2 text-sm font-semibold"
                    onClick={onViewLeaderboard}
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-white/18 text-white">
                        <TrophyIcon className="w-4 h-4" />
                    </div>
                    班级排行榜
                </button>

                <button
                    type="button"
                    aria-pressed={showTeachingOnly}
                    onClick={() => setShowTeachingOnly(prev => !prev)}
                    className={`h-[10px] rounded-[14px] border-0 px-0 text-xs font-semibold leading-[10px] transition-all active:scale-95 ${showTeachingOnly ? 'bg-transparent text-slate-500 shadow-none' : 'bg-transparent text-slate-500'}`}
                >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] leading-none ${showTeachingOnly ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                            ✓
                        </span>
                        只显示任教班级
                    </span>
                </button>
            </div>

            {visibleClasses.map((cls) => {
                // Separate tags logic for visual distinction
                const isHeadTeacher = cls.tags.includes('班主任');
                const subjectTags = cls.tags.filter(t => t !== '班主任');

                return (
                    <div key={cls.id} className="h-[160px] bg-white rounded-[22px] px-5 py-3 shadow-[0_9px_24px_rgba(15,23,42,0.045)] border border-slate-100/80 relative group transition-all">
                        {/* Background decoration */}
                        <div className="absolute inset-0 rounded overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50 rounded-bl-full opacity-60 -mr-4 -mt-4"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-1">{cls.name}</h3>
                                        <p className="text-sm text-slate-500">{cls.gradeLevel} · 共{cls.studentCount}人</p>
                                    </div>
                                    {/* Tags Display - Aligned to the left info block */}
                                    <div className="flex gap-1.5 flex-wrap">
                                        {isHeadTeacher && (
                                            <span className="text-[11px] px-2 py-0.5 bg-indigo-600 text-white rounded-lg whitespace-nowrap font-semibold shadow-sm shadow-indigo-100">
                                                班主任
                                            </span>
                                        )}
                                        {subjectTags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-100 rounded-lg whitespace-nowrap font-normal">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        type="button"
                                        aria-label={`${cls.name}更多操作`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveActionClassId(cls.id);
                                        }}
                                        className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-400 transition-colors active:bg-slate-200"
                                    >
                                        <WechatMoreIcon className="w-5 h-5" />
                                        {cls.hasPendingRewards && (
                                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white"></div>
                                        )}
                                    </button>

                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => onSelectClass(cls.id)}
                                    className="h-[38px] rounded-[14px] flex-1 flex items-center justify-center gap-2 bg-slate-50 active:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors"
                                >
                                    <UsersIcon className="w-4 h-4" />
                                    学生列表
                                </button>
                                <button
                                    onClick={() => onViewClassReport(cls.id)}
                                    className="h-[38px] rounded-[14px] flex-1 flex items-center justify-center gap-2 bg-cyan-50 active:bg-cyan-100 text-cyan-700 text-sm font-semibold transition-colors"
                                >
                                    <ChartIcon className="w-4 h-4" />
                                    班级报告
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
            </div>

            {activeActionClass && (
                <div className="absolute inset-0 z-[145] flex items-end bg-slate-950/45 backdrop-blur-[2px]">
                    <button aria-label="关闭班级更多操作" className="absolute inset-0" onClick={closeActionSheet} />
                    <div className="relative w-full rounded-t-[30px] bg-white px-5 pb-5 pt-4 shadow-[0_-18px_50px_rgba(15,23,42,0.18)] animate-in slide-in-from-bottom-4 fade-in duration-200">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="min-w-0">
                                <h3 className="truncate text-[18px] font-semibold text-slate-900">{activeActionClass.name}</h3>
                                <p className="mt-0.5 text-xs font-medium text-slate-400">更多操作</p>
                            </div>
                            <button onClick={closeActionSheet} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-400 active:bg-slate-50" aria-label="关闭">
                                <CloseIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[58vh] space-y-4 overflow-y-auto pb-1 no-scrollbar">
                            {actionGroups.map(group => (
                                <section key={group.title}>
                                    <h4 className="mb-2 px-1 text-xs font-semibold text-slate-400">{group.title}</h4>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {group.items.map(item => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.label}
                                                    type="button"
                                                    onClick={item.onClick}
                                                    className="relative flex min-h-[56px] items-center gap-3 rounded-[18px] border border-slate-100 bg-slate-50/65 px-3 text-left transition active:scale-[0.98] active:bg-slate-100"
                                                >
                                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border ${actionToneClass[item.tone]}`}>
                                                        <Icon className="h-[18px] w-[18px]" />
                                                    </span>
                                                    <span className="min-w-0 flex-1 text-[14px] font-semibold leading-snug text-slate-700">{item.label}</span>
                                                    {item.hasBadge && (
                                                        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                                                    )}
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
                <div className="absolute inset-0 z-[150] flex items-end bg-black/55">
                    <button aria-label="关闭离校学生" className="absolute inset-0" onClick={() => setLeftStudentClassId(null)} />
                    <div className="relative max-h-[72%] w-full rounded-t-[32px] bg-white px-5 pb-5 pt-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-center">
                            <h3 className="text-[20px] font-black text-slate-800">离校学生</h3>
                            <button onClick={() => setLeftStudentClassId(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full active:bg-slate-50">
                                <CloseIcon className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="max-h-[440px] space-y-3 overflow-y-auto pb-4">
                            {leftStudents.length === 0 && (
                                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-400">
                                    暂无离校学生
                                </div>
                            )}
                            {leftStudents.map(student => (
                                <div key={student.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                                    <img
                                        src={student.avatar}
                                        alt={`${student.name}头像`}
                                        className="h-11 w-11 shrink-0 rounded-full border border-slate-100 bg-slate-50 object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[15px] font-black text-slate-800">{student.name}</div>
                                        <div className="mt-1 truncate text-xs font-medium text-slate-400">{student.studentNo || student.id} · {leftStudentClass?.name || student.class}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRestoreStudentStatus(student)}
                                        className="h-10 shrink-0 rounded-full bg-emerald-50 px-3 text-xs font-black text-emerald-700 active:scale-95"
                                    >
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
