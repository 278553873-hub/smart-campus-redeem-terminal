import React, { useState, useMemo, useEffect } from 'react';
import { Student, ScoreItem, SubjectGrade, GrowthReportItem } from '../types';
import { ASSETS } from '../assets/images';
import {
    MaleIcon, FemaleIcon, ChevronDownIcon, ChevronRightIcon,
    AwardIcon, ChartIcon, StarIcon, TrophyIcon, GrowthIcon,
    CheckCircleIcon, CircleIcon, CameraIcon
} from '../components/Icons';
import { Sparkles, ChevronLeft } from 'lucide-react';
import { MOCK_BEHAVIOR_RECORDS } from '../constants';

interface DashboardViewProps {
    student: Student;
    scores: ScoreItem[];
    subjects: SubjectGrade[];
    growthReports: GrowthReportItem[];
    onViewReport: (subject: string) => void;
    onViewTermReport?: () => void; // New optional prop
}

// Helper: Radar Chart Component
const FiveEducationRadar = ({
    scores,
    showGradeAvg,
    showLastMonth
}: {
    scores: ScoreItem[],
    showGradeAvg: boolean,
    showLastMonth: boolean
}) => {
    // Configuration - Enlarged Size
    const size = 320;
    const center = size / 2;
    const radius = 110; // Increased radius for better visibility
    const levels = 4;

    // 1. Filter and Order Data
    const ORDER = ['moral', 'intellectual', 'physical', 'aesthetic', 'labor'];

    const activeData = useMemo(() => {
        return ORDER.map(cat => {
            const item = scores.find(s => s.category === cat);
            return item ? { ...item, value: Math.max(item.score, 20) } : null; // Min value for visual shape
        }).filter(Boolean) as (ScoreItem & { value: number })[];
    }, [scores]);

    // 2. Generate Comparison Data
    const gradeAvgData = useMemo(() => {
        return activeData.map(item => {
            // Mock Grade Avg: Balanced around 80-85
            const val = { moral: 85, intellectual: 82, physical: 78, aesthetic: 80, labor: 85 }[item.category] || 80;
            return { ...item, value: val };
        });
    }, [activeData]);

    const lastMonthData = useMemo(() => {
        return activeData.map(item => {
            // Mock Last Month: Slightly different
            const val = Math.min(100, Math.max(40, item.score + (item.category === 'physical' ? -8 : 3)));
            return { ...item, value: val };
        });
    }, [activeData]);

    // Coordinate Calculation
    const getCoordinates = (value: number, index: number, total: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const r = (value / 100) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    // Generate Polygon String
    const generatePoints = (data: { value: number }[]) => {
        return data.map((s, i) => {
            const coords = getCoordinates(s.value, i, data.length);
            return `${coords.x},${coords.y}`;
        }).join(' ');
    };

    const studentPoints = generatePoints(activeData);
    const gradePoints = generatePoints(gradeAvgData);
    const monthPoints = generatePoints(lastMonthData);

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
            <div className="relative w-[320px] h-[320px]">
                <svg width="320" height="320" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                    {/* 1. Background Grid (Webs) */}
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

                    {/* 2. Axis Lines */}
                    {activeData.map((_, i) => {
                        const end = getCoordinates(100, i, activeData.length);
                        return (
                            <line
                                key={i}
                                x1={center} y1={center}
                                x2={end.x} y2={end.y}
                                stroke="#E2E8F0"
                                strokeWidth="1.5"
                            />
                        );
                    })}

                    {/* 3. Grade Average Layer (Bottom) */}
                    {showGradeAvg && (
                        <g className="animate-in fade-in duration-500">
                            <polygon
                                points={gradePoints}
                                fill="transparent"
                                stroke="#94A3B8"
                                strokeWidth="2"
                                strokeDasharray="6 4"
                            />
                        </g>
                    )}

                    {/* 4. Last Month Layer (Middle) */}
                    {showLastMonth && (
                        <g className="animate-in fade-in duration-500">
                            <polygon
                                points={monthPoints}
                                fill="transparent"
                                stroke="#10B981"
                                strokeWidth="2"
                                strokeDasharray="2 4"
                                strokeLinecap="round"
                            />
                        </g>
                    )}

                    {/* 5. Current Student Layer (Top) */}
                    <g>
                        <polygon
                            points={studentPoints}
                            fill="rgba(59, 130, 246, 0.15)"
                            stroke="#3B82F6"
                            strokeWidth="2.5"
                            className="drop-shadow-sm"
                        />
                        {/* Data Points & Labels */}
                        {activeData.map((s, i) => {
                            const coords = getCoordinates(s.value, i, activeData.length);
                            const labelCoords = getCoordinates(112, i, activeData.length);

                            return (
                                <g key={i}>
                                    {/* The Point */}
                                    <circle
                                        cx={coords.x} cy={coords.y}
                                        r="5"
                                        fill="white"
                                        stroke={getCategoryColor(s.category)}
                                        strokeWidth="3"
                                    />

                                    {/* Category Label (Outer Ring) */}
                                    <text
                                        x={labelCoords.x}
                                        y={labelCoords.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="text-[13px] font-bold fill-slate-500"
                                    >
                                        {s.label}
                                    </text>

                                    {/* Score Value (Floating near point - Enhanced Visibility) */}
                                    <text
                                        x={coords.x}
                                        y={coords.y - 14} // Pushed slightly higher
                                        textAnchor="middle"
                                        className="text-[15px] font-black"
                                        fill={getCategoryColor(s.category)}
                                        style={{
                                            paintOrder: 'stroke',
                                            stroke: 'white',
                                            strokeWidth: '4px',
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round'
                                        }}
                                    >
                                        {s.score}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* Dynamic Legend */}
            <div className="flex items-center gap-5 mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-50"></div>
                    <span className="text-xs text-slate-600 font-bold">当前</span>
                </div>

                {showGradeAvg && (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                        <div className="w-6 border-t-2 border-dashed border-slate-400 h-0"></div>
                        <span className="text-xs text-slate-500">年级平均</span>
                    </div>
                )}

                {showLastMonth && (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                        <div className="w-6 border-t-2 border-dotted border-emerald-500 h-0"></div>
                        <span className="text-xs text-emerald-600">上月</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const DashboardView: React.FC<DashboardViewProps> = ({
    student,
    scores,
    subjects,
    growthReports,
    onViewTermReport
}) => {
    const [activeTab, setActiveTab] = useState<'growth' | 'evaluation' | 'redemption'>('growth');

    // Face Upload State
    const [isUploadingFace, setIsUploadingFace] = useState(false);
    const [showAvatarActionSheet, setShowAvatarActionSheet] = useState(false);
    const [localAvatar, setLocalAvatar] = useState(student.avatar);

    useEffect(() => {
        setLocalAvatar(student.avatar);
    }, [student.avatar]);

    const handleUpdateFaceClick = () => {
        setShowAvatarActionSheet(true);
    };

    const handleActionSheetSelect = (type: 'camera' | 'album') => {
        setShowAvatarActionSheet(false);
        setIsUploadingFace(true);
        setTimeout(() => {
            setIsUploadingFace(false);
            const validBoys = ASSETS.AVATAR.BOYS.slice(0, 7);
            const validGirls = ASSETS.AVATAR.GIRLS.slice(0, 7);
            const newAvatar = student.gender === 'male'
                ? validBoys[Math.floor(Math.random() * validBoys.length)]
                : validGirls[Math.floor(Math.random() * validGirls.length)];
            setLocalAvatar(newAvatar);
        }, 1500);
    };

    // UI States
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['subject_reports']));
    const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

    // Multi-select comparison states
    const [showGradeAvg, setShowGradeAvg] = useState(true);
    const [showLastMonth, setShowLastMonth] = useState(false);

    const toggleSection = (id: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedSections(newSet);
    };

    const validScores = scores.filter(s => s.category !== 'creativity');

    // --- Sub-renderers ---

    const renderGrowthTab = () => (
        <div className="space-y-3 pb-24 animate-in fade-in duration-300">
            {/* Term Report */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
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
                <div key={report.id} className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
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

            {/* 1. Filter Bar (Term Selector) - Sticky Top */}
            <div className="bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 py-2 border-b border-slate-100/60 shadow-sm flex items-center gap-3 safe-top transition-all">
                <button className="flex items-center gap-1.5 bg-slate-100  text-slate-800 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all active:opacity-60">
                    <span>2025-2026学年 上学期</span>
                    <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
                </button>
            </div>

            {/* 2. Scrollable Content */}
            <div className="p-4 space-y-4">

                {/* A. Separate Student Profile Card */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-60 pointer-events-none"></div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full p-1 bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                                {isUploadingFace && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-full">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    </div>
                                )}
                                <img
                                    src={localAvatar || (student.gender === 'male' ? ASSETS.AVATAR.GENERIC_BOY : ASSETS.AVATAR.GENERIC_GIRL)}
                                    alt="avatar"
                                    className={`w-full h-full rounded-full object-cover transition-transform duration-500 ${isUploadingFace ? 'scale-110 blur-[1px]' : ''}`}
                                />
                            </div>
                            <button
                                onClick={handleUpdateFaceClick}
                                disabled={isUploadingFace}
                                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500  active:bg-blue-700 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors z-20"
                            >
                                <CameraIcon className="w-3 h-3" />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                {student.name}
                                {student.gender === 'male' ? <MaleIcon className="w-4 h-4 text-blue-400" /> : <FemaleIcon className="w-4 h-4 text-pink-400" />}
                            </h2>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">{student.grade}{student.class}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600">ID: {student.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. Points & Finance Summary Card */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-100">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                        <img src="/assets/coin.png" className="w-[1.2em] h-[1.2em]" alt="coin" />
                        财富与得分详情
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100/50 flex flex-col justify-center">
                            <div className="text-[11px] text-orange-600/70 font-bold mb-1">可用货币余额</div>
                            <div className="text-2xl font-black text-orange-500">{(student as any).campusCoins || 350}</div>
                        </div>
                        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50 flex flex-col justify-center">
                            <div className="text-[11px] text-blue-600/70 font-bold mb-1">博学银行存款</div>
                            <div className="text-2xl font-black text-blue-500">1,200</div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="text-[12px] text-slate-600 font-bold mb-2">本月得分结算预估 <span className="text-orange-500">+125</span></div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>基础表现 100</div>
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>排行榜 15</div>
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>班级额外 10</div>
                        </div>
                    </div>
                </div>

                {/* C. Radar Chart Card */}
                <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">
                    {/* Header Controls */}
                    <div className="px-5 pt-4 pb-2 flex items-center justify-between z-10 relative">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                            <AwardIcon className="w-4 h-4 text-amber-500" />
                            五育能力模型
                        </h3>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setShowGradeAvg(!showGradeAvg)}
                                className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all border ${showGradeAvg ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200'}`}
                            >
                                年级平均
                            </button>
                            <button
                                onClick={() => setShowLastMonth(!showLastMonth)}
                                className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all border ${showLastMonth ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'}`}
                            >
                                上月对比
                            </button>
                        </div>
                    </div>

                    {/* Optimized Chart Container: Removed fixed height, using negative margins to trim padding */}
                    <div className="w-full flex justify-center -my-6 opacity-100 relative z-0 pointer-events-none">
                        <div className="transform scale-[0.9] origin-center -mt-2 -mb-2">
                            {/* Passed props to chart */}
                            <FiveEducationRadar scores={validScores} showGradeAvg={showGradeAvg} showLastMonth={showLastMonth} />
                        </div>
                    </div>
                    {/* Visual Spacer at bottom to ensure no cut-off but minimal whitespace */}
                    <div className="h-6"></div>
                </div>

                {/* D. Tabs */}
                <div className="sticky top-14 z-30 bg-[#F7F9FC] pt-2 pb-1">
                    <div className="bg-slate-200/50 p-1 rounded-xl flex h-11">
                        <button
                            onClick={() => setActiveTab('growth')}
                            className={`flex-[1.2] text-[13px] font-bold rounded-lg transition-all shadow-sm ${activeTab === 'growth' ? 'bg-white text-slate-800' : 'bg-transparent text-slate-400 shadow-none'}`}
                        >
                            成长报告
                        </button>
                        <button
                            onClick={() => setActiveTab('evaluation')}
                            className={`flex-[1.2] text-[13px] font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 ${activeTab === 'evaluation' ? 'bg-white text-slate-800' : 'bg-transparent text-slate-400 shadow-none'}`}
                        >
                            评价记录
                        </button>
                        <button
                            onClick={() => setActiveTab('redemption')}
                            className={`flex-1 text-[13px] font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 ${activeTab === 'redemption' ? 'bg-white text-slate-800' : 'bg-transparent text-slate-400 shadow-none'}`}
                        >
                            兑换记录
                        </button>
                    </div>
                </div>

                {/* E. Content Area */}
                <div className="min-h-[400px]">
                    {activeTab === 'growth' && renderGrowthTab()}
                    {activeTab === 'evaluation' && renderEvaluationTab()}
                    {activeTab === 'redemption' && (
                        <div className="space-y-3 pb-24 pt-2 animate-in fade-in duration-300">
                            {[
                                { id: '1', item: '得力中性笔 x 2', cost: 100, type: 'vending', time: '今天 12:30', location: '教学楼A区货柜' },
                                { id: '2', item: '免除一次大扫除', cost: 120, type: 'manual', time: '昨天 15:40', location: '班主任手动兑换' },
                                { id: '3', item: '指定优选座位一周', cost: 200, type: 'manual', time: '02-28 10:15', location: '班主任手动兑换' },
                            ].map((rec) => (
                                <div key={rec.id} className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3 shrink-0 ${rec.type === 'vending' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                                        {rec.type === 'vending' ? '🛒' : '👩‍🏫'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 text-[14px] mb-1 truncate">{rec.item}</div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                            <span>{rec.time}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>{rec.location}</span>
                                        </div>
                                    </div>
                                    <div className="font-black text-orange-500 flex items-center shrink-0 ml-2">
                                        <span className="text-slate-400 text-xs mr-1">-</span> <img src="/assets/coin.png" className="w-[1.2em] h-[1.2em] mr-0.5" alt="coin" /> {rec.cost}
                                    </div>
                                </div>
                            ))}
                            <div className="text-center py-6 text-xs text-slate-300">
                                - 仅展示最近30天的兑换记录 -
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Sheet for Face Update */}
            {showAvatarActionSheet && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
                        onClick={() => setShowAvatarActionSheet(false)}
                    ></div>
                    <div className="fixed bottom-0 left-0 right-0 z-[110] px-4 pb-safe animate-in slide-in-from-bottom flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl mb-2 flex flex-col">
                            <div className="p-3 text-center text-xs text-slate-400 font-medium border-b border-slate-100/50">
                                选择人脸更新方式
                            </div>
                            <button
                                className="w-full py-4 text-center text-blue-500 font-bold active:bg-slate-100 transition-colors border-b border-slate-100/50 bg-white"
                                onClick={() => handleActionSheetSelect('camera')}
                            >
                                拍照
                            </button>
                            <button
                                className="w-full py-4 text-center text-blue-500 font-bold active:bg-slate-100 transition-colors bg-white"
                                onClick={() => handleActionSheetSelect('album')}
                            >
                                从相册选择
                            </button>
                        </div>
                        <button
                            className="w-full bg-white rounded-2xl py-4 text-center text-slate-800 font-bold active:bg-slate-100 transition-colors shadow-xl mb-4"
                            onClick={() => setShowAvatarActionSheet(false)}
                        >
                            取消
                        </button>
                    </div>
                </>
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
