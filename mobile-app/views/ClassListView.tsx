import React, { useState } from 'react';
import { ClassInfo } from '../types';
import { UsersIcon, ChartIcon, FileTextIcon, WechatMoreIcon, TrophyIcon, GiftIcon, ScanFaceIcon, ShieldIcon } from '../components/Icons';

interface ClassListViewProps {
    classes: ClassInfo[];
    onSelectClass: (classId: string) => void;
    onViewClassReport: (classId: string) => void;
    onOpenExportModal: () => void;
    onViewLeaderboard: () => void;
    onViewRewardVerification: (classId: string) => void;
    onViewFaceUpdate: (classId: string) => void;
    onViewBankPassword: (classId: string) => void;
}

const ClassListView: React.FC<ClassListViewProps> = ({
    classes,
    onSelectClass,
    onViewClassReport,
    onOpenExportModal,
    onViewLeaderboard,
    onViewRewardVerification,
    onViewFaceUpdate,
    onViewBankPassword
}) => {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    return (
        <div className="p-4 space-y-4 pb-40">

            {/* Top Action Area: Leaderboard & Summary */}
            <div className="flex items-center justify-between px-1">
                <button
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2.5 rounded-2xl text-[13px] font-black shadow-lg shadow-amber-200 active:scale-95 transition-all border border-amber-300/30"
                    onClick={onViewLeaderboard}
                >
                    <div className="p-1 bg-white/20 rounded-lg">
                        <TrophyIcon className="w-4 h-4 text-white" />
                    </div>
                    班级排行榜
                </button>

                <span className="text-xs font-bold text-slate-400 bg-slate-100/50 px-2.5 py-1 rounded-full border border-slate-100 h-fit">
                    共 {classes.length} 个班级
                </span>
            </div>

            {classes.map((cls) => {
                // Separate tags logic for visual distinction
                const isHeadTeacher = cls.tags.includes('班主任');
                const subjectTags = cls.tags.filter(t => t !== '班主任');

                return (
                    <div key={cls.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative group transition-all">
                        {/* Background decoration */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-1">{cls.name}</h3>
                                        <p className="text-sm text-slate-500">{cls.gradeLevel} · 共{cls.studentCount}人</p>
                                    </div>
                                    {/* Tags Display - Aligned to the left info block */}
                                    <div className="flex gap-1.5 flex-wrap">
                                        {isHeadTeacher && (
                                            <span className="text-[10px] px-2 py-0.5 bg-indigo-600 text-white rounded-md whitespace-nowrap font-bold shadow-sm shadow-indigo-200">
                                                班主任
                                            </span>
                                        )}
                                        {subjectTags.map(tag => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md whitespace-nowrap font-medium">
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
                                            className="p-1.5 rounded-full text-slate-400  active:bg-slate-200 transition-colors relative"
                                        >
                                            <WechatMoreIcon className="w-5 h-5" />
                                            {cls.hasPendingRewards && (
                                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white"></div>
                                            )}
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenuId === cls.id && (
                                            <>
                                                <div className="fixed inset-0 z-20 cursor-default" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}></div>
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-30 animate-in fade-in zoom-in duration-200 origin-top-right">
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
                                                            onOpenExportModal();
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-700 active:bg-slate-50 rounded-lg transition-colors text-left"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                            <FileTextIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span>导出期末报告</span>
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
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-50 active:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    <UsersIcon className="w-4 h-4" />
                                    学生列表
                                </button>
                                <button
                                    onClick={() => onViewClassReport(cls.id)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 active:bg-blue-100 text-blue-600 py-2.5 rounded-xl text-sm font-semibold transition-colors"
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
    );
};

export default ClassListView;
