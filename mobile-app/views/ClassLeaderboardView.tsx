import React, { useState, useMemo } from 'react';
import {
    ChevronRightIcon, ActivityIcon,
    ChartIcon, UsersIcon, CloseIcon, FilterIcon,
    CheckCircleIcon, AlertCircleIcon, CalendarIcon,
    TrophyIcon
} from '../components/Icons';
import { MOCK_CLASSES } from '../constants';
import { MoreHorizontal, TrendingUp, TrendingDown, ArrowDown, BarChart3, ChevronDown, Check } from 'lucide-react';
import EvaluationRecordsLogView from './EvaluationRecordsLogView';

interface ClassLeaderboardViewProps {
    onBack: () => void;
    classId?: string;
}

type TimeRange = 'today' | 'week' | 'month' | 'term' | 'custom';
type Dimension = 'total' | '诗意中队' | '安全班级' | '健体班级' | '文雅班级' | '美净班级';

const dimensions: Dimension[] = ['total', '诗意中队', '安全班级', '健体班级', '文雅班级', '美净班级'];
const GRADES = ['2025级', '2024级', '2023级', '2022级', '2021级', '2020级'];

type ClassRankingItem = {
    id: string;
    name: string;
    score: number;
    rank?: number;
};

const getRankedClasses = (items: ClassRankingItem[]) => {
    const sortedItems = [...items].sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, 'zh-Hans-CN'));

    let previousScore: number | null = null;
    let previousRank = 0;

    return sortedItems.map((item, index) => {
        const rank = previousScore === item.score ? previousRank : index + 1;
        previousScore = item.score;
        previousRank = rank;

        return {
            ...item,
            rank,
        };
    });
};

const rankBadgeClassName = (rank?: number) => {
    if (rank === 1) return 'bg-[#FFC107] text-white shadow-[#FFC107]/40 shadow-lg';
    if (rank === 2) return 'bg-[#B0BEC5] text-white';
    if (rank === 3) return 'bg-[#FFAB91] text-white';
    return 'bg-slate-100 text-slate-400';
};

// --- Mock Data Generator ---
const getGradeStats = (grade: string, timeRange: TimeRange, activeDim: Dimension) => {
    // 1. Grade Overview Stats
    const gradeAvg = activeDim === 'total' ? 97.4 : 19.5;
    const gradeTrend = -0.2;

    // 2. Pillar Stats (for Radar or specific summary)
    const pillarScores = {
        '诗意中队': { avg: 19.8, color: '#F59E0B' },
        '安全班级': { avg: 18.5, color: '#EF4444' },
        '健体班级': { avg: 19.5, color: '#10B981' },
        '文雅班级': { avg: 19.6, color: '#6366F1' },
        '美净班级': { avg: 19.8, color: '#8B5CF6' },
    };

    // 3. Key Issues (Contextual)
    const topIssue = activeDim === '安全班级'
        ? { title: '课间追逐', count: 42 }
        : activeDim === '健体班级'
            ? { title: '眼操纪律', count: 35 }
            : null;

    // 4. Rankings (Generated based on dimension)
    const rankings = Array.from({ length: 12 }).map((_, i) => {
        // Base score varies by rank to simulate order
        const base = activeDim === 'total' ? 100 : 20;
        // Integer scores only
        const deduction = Math.floor(i * (activeDim === 'total' ? 1.5 : 0.5)) + Math.floor(Math.random() * 2);
        const score = base - deduction;

        // Fix for "all" grade display
        const displayGrade = (grade === 'all' || grade === '全部' || grade === '全部年级')
            ? GRADES[i % GRADES.length]
            : grade;

        return {
            id: `c_${i}`,
            name: `${displayGrade}${i + 1}班`,
            score: Math.max(0, score), // Ensure no negative scores
            // trend removed
        };
    });
    // 5. Recent Records (Mock)
    const recentRecords = Array.from({ length: 8 }).map((_, i) => {
        const displayGrade = (grade === 'all' || grade === '全部' || grade === '全部年级')
            ? GRADES[i % GRADES.length]
            : grade;

        return {
            id: `r_${i}`,
            className: `${displayGrade}${Math.floor(Math.random() * 12) + 1}班`,
            indicator: i % 2 === 0 ? '安全班级 / 课间纪律 / 走廊奔跑' : '美净班级 / 卫生保持 / 地面有垃圾',
            score: i % 2 === 0 ? -2 : -1,
            time: `${Math.floor(Math.random() * 59) + 1}分钟前`
        };
    });

    return { gradeAvg, gradeTrend, pillarScores, topIssue, rankings: getRankedClasses(rankings), recentRecords };
};

// --- Components ---
const GradePicker = ({ selected, options, onSelect }: { selected: string, options: string[], onSelect: (g: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm active:bg-slate-50 transition-all"
            >
                <span className="text-[14px] font-bold text-slate-800">{selected}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden text-left">
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onSelect(opt); setIsOpen(false); }}
                                className={`w-full px-4 py-3 text-[14px] font-bold flex items-center justify-between gap-2
                                    ${selected === opt ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 '}
                                `}
                            >
                                {opt}
                                {selected === opt && <Check className="w-3.5 h-3.5" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

interface TabItemProps {
    label: string;
    active: boolean;
    onClick: () => void;
}
const TabItem: React.FC<TabItemProps> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`relative px-4 py-3 text-sm font-medium transition-all flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`}
    >
        {label}
        {active && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full" />
        )}
    </button>
);

interface DimensionPillProps {
    label: string;
    active: boolean;
    onClick: () => void;
}
const DimensionPill: React.FC<DimensionPillProps> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap flex-shrink-0
            ${active
                ? 'bg-[#5B50F6] text-white border-[#5B50F6] shadow-md shadow-indigo-200'
                : 'bg-white text-slate-500 border-slate-200'}
        `}
    >
        {label}
    </button>
);



const ClassLeaderboardView: React.FC<ClassLeaderboardViewProps> = () => {
    const [activeGrade, setActiveGrade] = useState('全部年级');
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [activeDim, setActiveDim] = useState<Dimension>('total');
    const [showRecordsLog, setShowRecordsLog] = useState(false);
    const [showFullRanking, setShowFullRanking] = useState(false);

    if (showRecordsLog) {
        return <EvaluationRecordsLogView onBack={() => setShowRecordsLog(false)} />;
    }

    // Filter logic: Map '全部年级' back to 'all' for internal logic if needed, 
    // or just pass '全部年级' to getGradeStats and handle it there.
    // Let's update getGradeStats to handle '全部年级' explicitly.
    const data = useMemo(() => getGradeStats(activeGrade, timeRange, activeDim), [activeGrade, timeRange, activeDim]);

    const timeOptions: { label: string, value: TimeRange }[] = [
        { label: '今日', value: 'today' },
        { label: '本周', value: 'week' },
        { label: '本月', value: 'month' },
        { label: '本学期', value: 'term' },
        { label: '自定义', value: 'custom' }
    ];

    const gradeOptions = ['全部年级', ...GRADES];

    return (
        <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center">

            <div className="w-full max-w-md min-h-screen relative flex flex-col">

                {/* 1. Top Navigation Logic (Dropdown + Tabs) */}
                <div className="bg-white sticky top-0 z-40 shadow-sm">

                    {/* Row 1: Grade Dropdown (Left Aligned) */}
                    <div className="flex items-center px-4 py-3 border-b border-slate-50">
                        <GradePicker
                            selected={activeGrade}
                            options={gradeOptions}
                            onSelect={setActiveGrade}
                        />
                    </div>

                    {/* Row 2: Time Tabs */}
                    <div className="flex items-center overflow-x-auto no-scrollbar px-2 bg-slate-50/50">
                        {timeOptions.map(t => (
                            <TabItem
                                key={t.label}
                                label={t.label}
                                active={timeRange === t.value}
                                onClick={() => setTimeRange(t.value)}
                            />
                        ))}
                    </div>
                </div>

                {/* Scroll Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">

                    {/* Module 1: Class Rankings Card */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[17px] font-semibold text-slate-800 flex items-center gap-2">
                                班级排行榜
                            </h3>
                            <span className="text-[11px] font-bold text-slate-400">Top 5</span>
                        </div>

                        {/* Dimension Pills */}
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 mb-2">
                            {dimensions.map(dim => (
                                <DimensionPill
                                    key={dim}
                                    label={dim === 'total' ? '综合评价' : dim}
                                    active={activeDim === dim}
                                    onClick={() => setActiveDim(dim)}
                                />
                            ))}
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {data.rankings.slice(0, 5).map((cls) => (
                                <div
                                    key={cls.id}
                                    className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm"
                                >
                                    {/* Rank & Name */}
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-semibold ${rankBadgeClassName(cls.rank)}`}>
                                            {cls.rank}
                                        </div>
                                        <span className="text-[14px] font-bold text-slate-800">{cls.name}</span>
                                    </div>

                                    {/* Score Only (Trend Removed) */}
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-[17px] text-[#5B50F6]">
                                            {cls.score}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Action */}
                        {data.rankings.length > 5 && (
                            <div className="mt-4 pt-2 flex justify-center border-t border-slate-50">
                                <button
                                    onClick={() => setShowFullRanking(true)}
                                    className="flex min-h-11 items-center gap-1 text-[12px] font-bold text-slate-400 py-2 transition-colors active:text-[#5B50F6]"
                                >
                                    查看全部排名 <ChevronRightIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Module 2: Evaluation Records Card */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[17px] font-semibold text-slate-800 flex items-center gap-2">
                                <ActivityIcon className="w-5 h-5 text-blue-500" />
                                评价记录
                            </h3>
                            <button
                                onClick={() => setShowRecordsLog(true)}
                                className="text-[11px] font-bold text-slate-400 flex items-center gap-0.5"
                            >
                                更多 <ChevronRightIcon className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.recentRecords.slice(0, 5).map((record, i) => (
                                <div key={record.id} className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-sm ${record.score > 0 ? 'bg-emerald-400 shadow-emerald-200' : 'bg-red-400 shadow-red-200'}`} />

                                    <div className="flex-1 min-w-0 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium text-slate-800">{record.className}</span>
                                            <span className="text-[11px] font-medium text-slate-400">{record.time}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="text-[12px] text-slate-500 leading-snug">
                                                {record.indicator}
                                            </div>
                                            <div className={`text-sm font-semibold font-mono flex-shrink-0 ${record.score > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {record.score > 0 ? '+' : ''}{record.score}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {showFullRanking && (
                    <div className="absolute inset-0 z-[120] flex items-end bg-black/40 backdrop-blur-sm" onClick={() => setShowFullRanking(false)}>
                        <div className="max-h-[82%] w-full rounded-t-[32px] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                <div>
                                    <h3 className="text-[17px] font-semibold text-slate-900">全部班级排名</h3>
                                    <p className="mt-1 text-[12px] font-medium text-slate-400">{activeGrade} · {activeDim === 'total' ? '综合评价' : activeDim}</p>
                                </div>
                                <button
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 active:bg-slate-100"
                                    onClick={() => setShowFullRanking(false)}
                                    aria-label="关闭全部班级排名"
                                >
                                    <CloseIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="max-h-[calc(82vh-76px)] overflow-y-auto p-4">
                                <div className="space-y-3">
                                    {data.rankings.map((cls) => (
                                        <div
                                            key={cls.id}
                                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                                        >
                                            <div className="flex min-w-0 items-center gap-4">
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${rankBadgeClassName(cls.rank)}`}>
                                                    {cls.rank}
                                                </div>
                                                <span className="truncate text-[14px] font-bold text-slate-800">{cls.name}</span>
                                            </div>
                                            <span className="font-mono text-[17px] font-black text-[#5B50F6]">
                                                {cls.score}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassLeaderboardView;
