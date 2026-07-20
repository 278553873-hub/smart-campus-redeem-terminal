import React, { useState, useMemo } from 'react';
import { Student, ScoreItem, GrowthReportItem, CampusCoinDetail } from '../types';
import { ASSETS } from '../assets/images';
import {
    MaleIcon, FemaleIcon, ChevronDownIcon, ChevronRightIcon,
    AwardIcon, GrowthIcon
} from '../components/Icons';
import { AlertTriangle, BadgeCheck, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { MOCK_BEHAVIOR_RECORDS } from '../constants';
import { formatCoinAmount } from '../utils/coinFormat';
import type { StudentCollectionHistoryItem } from '../../shared/questionnaireStore';
import StudentCollectionHistoryTab from './student-collection/StudentCollectionHistoryTab';

interface DashboardViewProps {
    student: Student;
    scores: ScoreItem[];
    growthReports: GrowthReportItem[];
    onViewTermReport?: () => void; // New optional prop
    onBack?: () => void;
    onEditBasicInfo: () => void;
    onUpdateStudentStatus: (student: Student, status: Student['status']) => void;
    onViewCampusCoins: () => void;
    campusCoinDetail: CampusCoinDetail;
    collectionHistory: StudentCollectionHistoryItem[];
    onViewCollectionRecord: (item: StudentCollectionHistoryItem) => void;
    initialTab?: 'growth' | 'evaluation' | 'collection';
}

// Helper: Radar Chart Component
const FiveEducationRadar = ({
    scores,
    showCurrent,
    showClassAvg,
    onToggleCurrent,
    onToggleClassAvg
}: {
    scores: ScoreItem[],
    showCurrent: boolean,
    showClassAvg: boolean,
    onToggleCurrent: () => void,
    onToggleClassAvg: () => void
}) => {
    const size = 360;
    const center = size / 2;
    const radius = 126;
    const levels = 4;
    const ORDER = ['moral', 'intellectual', 'physical', 'aesthetic', 'labor'];

    const activeData = useMemo(() => {
        return ORDER.map(cat => {
            const item = scores.find(s => s.category === cat);
            return item ? { ...item, value: Math.max(item.score, 20) } : null;
        }).filter(Boolean) as (ScoreItem & { value: number })[];
    }, [scores]);

    const classAvgData = useMemo(() => {
        return activeData.map(item => {
            const val = { moral: 78, intellectual: 76, physical: 66, aesthetic: 72, labor: 70 }[item.category] || 70;
            return { ...item, score: val, value: Math.max(val, 20) };
        });
    }, [activeData]);

    const getCoordinates = (value: number, index: number, total: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const r = (value / 100) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    const generatePoints = (data: { value: number }[]) => data.map((s, i) => {
        const coords = getCoordinates(s.value, i, data.length);
        return `${coords.x},${coords.y}`;
    }).join(' ');

    const studentPoints = generatePoints(activeData);
    const classAvgPoints = generatePoints(classAvgData);

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'moral': return '#F59E0B';
            case 'intellectual': return '#3B82F6';
            case 'physical': return '#10B981';
            case 'aesthetic': return '#EC4899';
            case 'labor': return '#84CC16';
            default: return '#8B5CF6';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-4 relative">
            <div className="relative h-[360px] w-[360px]">
                <svg width="360" height="360" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                    {[...Array(levels)].map((_, i) => (
                        <polygon
                            key={i}
                            points={activeData.map((_, idx) => {
                                const val = 100 * ((levels - i) / levels);
                                const c = getCoordinates(val, idx, activeData.length);
                                return `${c.x},${c.y}`;
                            }).join(' ')}
                            fill={i === 0 ? "#F8FAFC" : "transparent"}
                            stroke="#E2E8F0"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {activeData.map((_, i) => {
                        const end = getCoordinates(100, i, activeData.length);
                        return <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="#E2E8F0" strokeWidth="1.5" />;
                    })}

                    {activeData.map((s, i) => {
                        const labelCoords = getCoordinates(112, i, activeData.length);
                        return (
                            <text key={`label-${s.category}`} x={labelCoords.x} y={labelCoords.y} textAnchor="middle" dominantBaseline="middle" className="text-sm font-medium fill-slate-500">
                                {s.label}
                            </text>
                        );
                    })}

                    {showClassAvg && (
                        <g className="animate-in fade-in duration-500">
                            <polygon
                                points={classAvgPoints}
                                fill="rgba(139, 92, 246, 0.09)"
                                stroke="#A78BFA"
                                strokeWidth="2"
                            />
                            {classAvgData.map((s, i) => {
                                const coords = getCoordinates(s.value, i, classAvgData.length);
                                const valueY = coords.y + 18;
                                return (
                                    <g key={`class-${s.category}`}>
                                        <circle cx={coords.x} cy={coords.y} r="4" fill="white" stroke="#A78BFA" strokeWidth="1.8" />
                                        <text
                                            x={coords.x}
                                            y={valueY + 1}
                                            textAnchor="middle"
                                            className="text-[12px] font-medium fill-violet-400"
                                        >
                                            {s.score}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    )}

                    {showCurrent && (
                        <g>
                            <polygon
                                points={studentPoints}
                                fill="rgba(59, 130, 246, 0.15)"
                                stroke="#3B82F6"
                                strokeWidth="2.8"
                                className="drop-shadow-sm"
                            />
                            {activeData.map((s, i) => {
                                const coords = getCoordinates(s.value, i, activeData.length);
                                const valueY = coords.y - 17;

                                return (
                                    <g key={i}>
                                        <circle cx={coords.x} cy={coords.y} r="5.5" fill="white" stroke={getCategoryColor(s.category)} strokeWidth="3" />
                                        <rect
                                            x={coords.x - 14}
                                            y={valueY - 14}
                                            width="28"
                                            height="21"
                                            rx="10.5"
                                            fill={getCategoryColor(s.category)}
                                            opacity="0.96"
                                        />
                                        <text
                                            x={coords.x}
                                            y={valueY + 1}
                                            textAnchor="middle"
                                            className="text-[12px] font-medium"
                                            fill="white"
                                        >
                                            {s.score}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    )}
                </svg>
            </div>

            <div className="mt-2 flex items-center gap-3">
                <button
                    type="button"
                    onClick={onToggleCurrent}
                    className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all ${showCurrent ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' : 'bg-slate-50 text-slate-300'}`}
                    aria-pressed={showCurrent}
                >
                    <div className={`h-3 w-3 rounded-full border-2 ${showCurrent ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}`}></div>
                    当前
                </button>

                <button
                    type="button"
                    onClick={onToggleClassAvg}
                    className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all ${showClassAvg ? 'bg-violet-50 text-violet-600 ring-1 ring-violet-100' : 'bg-slate-50 text-slate-300'}`}
                    aria-pressed={showClassAvg}
                >
                    <div className={`h-0 w-6 border-t-2 ${showClassAvg ? 'border-violet-300' : 'border-slate-300'}`}></div>
                    班级平均
                </button>
            </div>
        </div>
    );
};

const DashboardView: React.FC<DashboardViewProps> = ({
    student,
    scores,
    growthReports,
    onViewTermReport,
    onBack,
    onEditBasicInfo,
    onUpdateStudentStatus,
    onViewCampusCoins,
    campusCoinDetail,
    collectionHistory,
    onViewCollectionRecord,
    initialTab = 'growth',
}) => {
    const [activeTab, setActiveTab] = useState<'growth' | 'evaluation' | 'collection'>(initialTab);

    // UI States
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['subject_reports']));
    const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

    const [showCurrent, setShowCurrent] = useState(true);
    const [showClassAvg, setShowClassAvg] = useState(true);
    const [showStatusActionSheet, setShowStatusActionSheet] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const toggleSection = (id: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedSections(newSet);
    };

    const validScores = scores.filter(s => s.category !== 'creativity');
    const studentStatusLabel = student.status === 'left' ? '离校' : '在校';
    const formatCompactClassName = (className: string) => {
        const match = className.match(/^(\d{4}级)(.+)$/);
        const classNumberMap: Record<string, string> = {
            一: '1',
            二: '2',
            三: '3',
            四: '4',
            五: '5',
            六: '6',
            七: '7',
            八: '8',
            九: '9',
            十: '10',
        };
        if (!match) return className;
        const classText = match[2].replace('班', '');
        return `${match[1]}${classNumberMap[classText] ?? classText}班`;
    };

    const renderRecordTab = () => renderEvaluationTab();

    // --- Sub-renderers ---

    const renderGrowthTab = () => (
        <div className="space-y-3 pb-24 animate-in fade-in duration-300">
            {/* C. Term Selector */}
            <div className="flex items-center gap-3">
                <button className="flex min-h-11 items-center gap-1.5 rounded-full border border-slate-100 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm transition-all active:opacity-60">
                    <span>2025-2026学年 上学期</span>
                    <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />
                </button>
            </div>

            {/* D. Radar Chart Card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="relative z-10 flex items-center justify-between px-5 pb-2 pt-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <AwardIcon className="h-4 w-4 text-amber-500" />
                        五育能力模型
                    </h3>
                </div>
                <div className="relative z-0 -my-4 flex w-full justify-center opacity-100">
                    <div className="-mb-1 -mt-1 origin-center">
                        <FiveEducationRadar scores={validScores} showCurrent={showCurrent} showClassAvg={showClassAvg} onToggleCurrent={() => setShowCurrent(prev => !prev)} onToggleClassAvg={() => setShowClassAvg(prev => !prev)} />
                    </div>
                </div>
                <div className="h-6" />
            </div>

            {/* Term Report */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                    onClick={() => toggleSection('term_report')}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-slate-800 font-bold text-sm active:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                            <FileTextIcon className="w-4 h-4" />
                        </div>
                        <span>期末综合素质报告</span>
                    </div>
                    {expandedSections.has('term_report') ? <ChevronDownIcon className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedSections.has('term_report') && (
                    <div className="px-4 pb-4 pl-[3.25rem]">
                        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <span className="text-xs text-slate-500">2025-2026学年 上学期</span>
                            <button onClick={onViewTermReport} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-md font-bold shadow-sm active:scale-95 transition-all">查看</button>
                        </div>
                    </div>
                )}
            </div>


            {/* Monthly Growth Reports */}
            {growthReports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <button
                        onClick={() => toggleSection(`growth_${report.id}`)}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-slate-800 font-bold text-sm active:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                <GrowthIcon />
                            </div>
                            <span>{report.title}</span>
                        </div>
                        {expandedSections.has(`growth_${report.id}`) ? <ChevronDownIcon className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
                    </button>
                    {expandedSections.has(`growth_${report.id}`) && (
                        <div className="px-4 pb-4 pl-[3.25rem]">
                            <div className="bg-amber-50/30 rounded-lg p-3 text-xs text-slate-600 leading-relaxed border border-amber-100/50">
                                <p className="mb-2 line-clamp-2">本月在德育方面表现优异，积极参与班级事务，乐于助人...</p>
                                <button className="text-amber-700 font-bold flex items-center gap-1 text-[11px]">查看完整报告 <ChevronRightIcon className="w-3 h-3" /></button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderEvaluationTab = () => (
        <div className="space-y-3 pb-24 pt-2 animate-in fade-in duration-300">
            {(MOCK_BEHAVIOR_RECORDS as any[]).map((rec) => (
                <div key={rec.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    {/* Header: Path & Score */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            {rec.indicatorPath.map((path: string, idx: number) => (
                                <React.Fragment key={idx}>
                                    <span className={`px-1.5 py-0.5 rounded-md ${idx === rec.indicatorPath.length - 1 ? "bg-slate-100 text-slate-700 font-bold" : "text-slate-400"}`}>{path}</span>
                                    {idx < rec.indicatorPath.length - 1 && <span className="text-slate-300">/</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex items-start gap-3">
                        <div className="flex-1">
                            <div className="mb-2">
                                <p className="text-[14px] leading-relaxed text-slate-800 text-justify">
                                    {rec.aiComment}
                                </p>
                            </div>

                            {/* Footer Infos */}
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                                <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{rec.evaluation_date}</span>
                                <span>{rec.teacherName}</span>
                                <button
                                    onClick={() => setExpandedRecordId(expandedRecordId === rec.id ? null : rec.id)}
                                    className="text-blue-600 font-medium ml-auto"
                                >
                                    {expandedRecordId === rec.id ? '收起' : '详情'}
                                </button>
                            </div>
                        </div>

                        {/* Score Badge */}
                        <div className={`shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center font-black border tracking-tight ${rec.isBad ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            <span className="text-[9px] uppercase opacity-50 scale-75">Score</span>
                            <span className="text-sm leading-none -mt-0.5">{rec.scoreChange > 0 ? `+${rec.scoreChange}` : rec.scoreChange}</span>
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedRecordId === rec.id && (
                        <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-600 leading-relaxed animate-in slide-in-from-top-1">
                            <div className="mb-2">
                                <span className="inline-block text-[10px] text-white bg-slate-300 px-1.5 py-0.5 rounded mb-1 mr-2">原文</span>
                                {rec.description}
                            </div>
                            {rec.auditReason && (
                                <div className="p-2 bg-amber-50 rounded border border-amber-100/50 text-amber-900/80">
                                    <span className="font-bold mr-1">AI 判定:</span>
                                    {rec.auditReason}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
            <div className="text-center py-6 text-xs text-slate-300">
                - 仅展示最近一年的记录 -
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F7F9FC] font-sans pb-safe">

            {/* A. Student Profile Card */}
            <div className="w-full rounded-b-3xl border-b border-slate-100 px-5 pb-5 pt-3 shadow-sm relative overflow-hidden bg-[radial-gradient(circle_at_16%_8%,rgba(219,234,254,0.95),transparent_36%),radial-gradient(circle_at_82%_4%,rgba(254,243,199,0.78),transparent_31%),radial-gradient(circle_at_62%_76%,rgba(220,252,231,0.62),transparent_34%),linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_72%,#F7F9FC_100%)]">
                <div className="absolute right-0 top-0 w-36 h-36 bg-gradient-to-br from-white/50 to-transparent rounded-bl-full opacity-80 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="mb-3 flex h-10 items-center justify-between">
                        <button
                            type="button"
                            onClick={onBack}
                            aria-label="返回"
                            className="flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="h-10 w-10" aria-hidden="true" />
                    </div>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="w-16 h-16 rounded-full p-1 bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                                    <img
                                        src={student.avatar || (student.gender === 'male' ? ASSETS.AVATAR.GENERIC_BOY : ASSETS.AVATAR.GENERIC_GIRL)}
                                        alt="avatar"
                                        className="w-full h-full rounded-full object-cover transition-transform duration-500"
                                    />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                                    {student.name}
                                    {student.gender === 'male' ? <MaleIcon className="w-4 h-4 text-blue-400" /> : <FemaleIcon className="w-4 h-4 text-pink-400" />}
                                </h2>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">{formatCompactClassName(student.class)}</span>
                                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600">ID: {student.id}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onEditBasicInfo}
                            aria-label="编辑基础信息"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 active:scale-95"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Scrollable Content */}
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                    <div>
                        <div className="text-[15px] font-black text-slate-800">学籍状态</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${student.status === 'left' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {studentStatusLabel}
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowStatusActionSheet(true)}
                            className="h-9 rounded-full border border-blue-100 bg-blue-50 px-4 text-xs font-black text-blue-600 active:scale-95 active:bg-blue-100"
                        >管理</button>
                    </div>
                </div>

                {/* B. Assets Card */}
                <div className="rounded-2xl border border-blue-100/70 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <div className="flex min-w-0 flex-1 items-center justify-center rounded-full border border-orange-100 bg-orange-50/60 px-2.5 py-2 text-xs">
                                <span className="mr-1.5 shrink-0 font-bold text-slate-500">钱包</span>
                                <span className="inline-flex min-w-0 items-center font-black tracking-tight text-slate-800">
                                    <img src="/assets/coin.png" className="mr-1 h-[1.1em] w-[1.1em] -translate-y-px opacity-90" alt="coin" />
                                    {formatCoinAmount(campusCoinDetail.balance)}
                                </span>
                            </div>
                            <div className="flex min-w-0 flex-1 items-center justify-center rounded-full border border-blue-100 bg-blue-50/60 px-2.5 py-2 text-xs">
                                <span className="mr-1.5 shrink-0 font-bold text-slate-500">存款</span>
                                <span className="inline-flex min-w-0 items-center font-black tracking-tight text-slate-800">
                                    <img src="/assets/coin.png" className="mr-1 h-[1.1em] w-[1.1em] -translate-y-px opacity-90" alt="coin" />
                                    {formatCoinAmount(campusCoinDetail.bankDeposit)}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onViewCampusCoins}
                            className="flex h-9 shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold text-slate-400 active:bg-slate-50 active:text-slate-600"
                        >
                            查看明细 <ChevronRight size={12} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* C. Tabs */}
                <div className="sticky top-14 z-30 bg-[#F7F9FC] pt-2 pb-1">
                    <div className="grid h-11 grid-cols-3 rounded-xl bg-slate-200/50 p-1" role="tablist" aria-label="学生详情内容">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'growth'}
                            onClick={() => setActiveTab('growth')}
                            className={`rounded-lg px-1 text-[13px] font-medium transition-all ${activeTab === 'growth' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-400'}`}
                        >
                            成长报告
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'evaluation'}
                            onClick={() => setActiveTab('evaluation')}
                            className={`rounded-lg px-1 text-[13px] font-medium transition-all ${activeTab === 'evaluation' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-400'}`}
                        >
                            评价记录
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'collection'}
                            onClick={() => setActiveTab('collection')}
                            className={`rounded-lg px-1 text-[13px] font-medium transition-all ${activeTab === 'collection' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-400'}`}
                        >
                            采集记录
                        </button>
                    </div>
                </div>

                {/* D. Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'growth' && renderGrowthTab()}
                    {activeTab === 'evaluation' && renderRecordTab()}
                    {activeTab === 'collection' && <StudentCollectionHistoryTab items={collectionHistory} onOpen={onViewCollectionRecord} />}
                </div>
            </div>

            {showStatusActionSheet && (
                <div className="absolute inset-0 z-[120] flex items-end bg-slate-950/35 px-4 pb-5" onClick={() => setShowStatusActionSheet(false)}>
                    <div className="w-full rounded-[32px] bg-white p-4 shadow-2xl" onClick={event => event.stopPropagation()}>
                        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
                        <div className="mb-4 flex items-center gap-3">
                            <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${student.status === 'left' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {student.status === 'left' ? <AlertTriangle className="h-5 w-5" /> : <BadgeCheck className="h-5 w-5" />}
                            </span>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900">学籍状态</h3>
                                <p className="mt-0.5 text-xs font-semibold text-slate-400">当前：{studentStatusLabel}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowLeaveConfirm(true)}
                            className="h-12 w-full rounded-2xl border border-amber-200 bg-amber-50 text-sm font-bold text-amber-700 active:scale-[0.98]"
                        >
                            设为离校
                        </button>
                    </div>
                </div>
            )}

            {showLeaveConfirm && (
                <div className="absolute inset-0 z-[140] flex items-end bg-slate-950/45 px-4 pb-5" onClick={() => setShowLeaveConfirm(false)}>
                    <div className="w-full rounded-[32px] bg-white p-4 shadow-2xl" onClick={event => event.stopPropagation()}>
                        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
                        <div className="rounded-3xl bg-amber-50 p-4">
                            <h3 className="text-lg font-extrabold text-slate-900">确认设为离校？</h3>
                            <p className="mt-2 text-sm font-medium leading-relaxed text-amber-800">
                                设置离校后，该学生将不在学生列表展示。可在班级卡片更多操作中恢复。
                            </p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setShowLeaveConfirm(false)}
                                className="h-12 rounded-2xl bg-slate-100 text-sm font-bold text-slate-600 active:scale-[0.98]"
                            >
                                取消
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onUpdateStudentStatus(student, 'left');
                                    setShowLeaveConfirm(false);
                                    setShowStatusActionSheet(false);
                                    onBack?.();
                                }}
                                className="h-12 rounded-2xl bg-amber-500 text-sm font-bold text-white shadow-lg shadow-amber-100 active:scale-[0.98]"
                            >
                                确认离校
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helper Components (Moved to top level) ---
const Clock = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const FileTextIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
);

export default DashboardView;
