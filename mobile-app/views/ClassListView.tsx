import React, { useMemo, useState } from 'react';
import { ClassInfo, Student, TeacherProfile } from '../types';
import { UsersIcon, ChartIcon, WechatMoreIcon, TrophyIcon, GiftIcon, ScanFaceIcon, ShieldIcon, FileTextIcon, CloseIcon } from '../components/Icons';

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
}

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
    onViewHomeworkEntry
}) => {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
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

    return (
        <div className="relative h-full overflow-hidden">
            <div className="relative z-10 h-full overflow-y-auto p-4 space-y-4 pb-40 no-scrollbar">

            {/* Top Action Area: Leaderboard & Summary */}
            <div className="flex flex-col items-start gap-4 px-1">
                <button
                    className="h-10 rounded-full border border-cyan-100 bg-white/85 px-4 text-cyan-700 shadow-sm backdrop-blur-md transition-all active:scale-95 flex items-center gap-2 text-sm font-semibold"
                    onClick={onViewLeaderboard}
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
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
                    <div key={cls.id} className={`h-[160px] bg-white/95 rounded-[22px] px-5 py-3 shadow-[0_9px_24px_rgba(15,23,42,0.045)] border border-slate-100/80 relative group transition-all ${activeMenuId === cls.id ? 'z-[130]' : 'z-0'}`}>
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
                                            <span key={tag} className="text-xs px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg whitespace-nowrap font-normal">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    {/* Menu Button */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === cls.id ? null : cls.id);
                                            }}
                                            className="min-h-11 min-w-11 flex items-center justify-center rounded-full text-slate-400 active:bg-slate-200 transition-colors relative"
                                        >
                                            <WechatMoreIcon className="w-5 h-5" />
                                            {cls.hasPendingRewards && (
                                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white"></div>
                                            )}
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenuId === cls.id && (
                                            <>
                                                <div className="fixed inset-0 z-[110] cursor-default" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}></div>
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1.5 z-[120] animate-in fade-in zoom-in duration-200 origin-top-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(null);
                                                            onViewRewardVerification(cls.id);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 active:bg-slate-50 rounded-lg transition-colors text-left border-b border-slate-50 relative"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                                            <GiftIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span>兑换奖励</span>
                                                        {cls.hasPendingRewards && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500"></div>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(null);
                                                            onViewFaceUpdate(cls.id);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 active:bg-slate-50 rounded-lg transition-colors text-left border-b border-slate-50"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                            <ScanFaceIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span>更新人脸数据</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(null);
                                                            onViewHomeworkEntry(cls.id);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 active:bg-slate-50 rounded-lg transition-colors text-left border-b border-slate-50"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                            <FileTextIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span>作业录入</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(null);
                                                            onViewBankPassword(cls.id);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 active:bg-slate-50 rounded-lg transition-colors text-left border-b border-slate-50"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                            <ShieldIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span>设置兑换密码</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuId(null);
                                                            setLeftStudentClassId(cls.id);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 active:bg-slate-50 rounded-lg transition-colors text-left"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                            <UsersIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span>离校学生</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

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
