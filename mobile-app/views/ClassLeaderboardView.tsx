import React, { useState, useMemo } from 'react';
import { ChevronRightIcon, ActivityIcon } from '../components/Icons';
import ReportDateRangeTabs from '../components/report/ReportDateRangeTabs';
import ClassRankingList from '../components/ui/ClassRankingList';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import PillSelectionControl from '../components/ui/PillSelectionControl';
import TextSelectionControl from '../components/ui/TextSelectionControl';

interface ClassLeaderboardViewProps {
    onOpenEvaluationRecords: () => void;
}

type TimeRange = 'today' | 'week' | 'month' | 'term' | 'custom';
type Dimension = 'total' | '诗意中队' | '安全班级' | '健体班级' | '文雅班级' | '美净班级';

const dimensions: Dimension[] = ['total', '诗意中队', '安全班级', '健体班级', '文雅班级', '美净班级'];
const GRADES = ['2025级', '2024级', '2023级', '2022级', '2021级', '2020级'];

type ClassRankingItem = {
    id: string;
    name: string;
    score: number;
};

const getRankedClasses = (items: ClassRankingItem[]): Array<ClassRankingItem & { rank: number }> => {
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

const ClassLeaderboardView: React.FC<ClassLeaderboardViewProps> = ({ onOpenEvaluationRecords }) => {
    const [activeGrade, setActiveGrade] = useState('全部年级');
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [activeDim, setActiveDim] = useState<Dimension>('total');
    const [showFullRanking, setShowFullRanking] = useState(false);

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
        <div className="flex min-h-screen flex-col items-center bg-[var(--tm-page-plain-content-bg)]">

            <div className="w-full max-w-md min-h-screen relative flex flex-col">

                <div className="sticky top-0 z-40 bg-[var(--tm-page-plain-content-bg)]">
                    <ReportDateRangeTabs
                        value={timeRange}
                        items={timeOptions.map(item => ({ value: item.value, label: item.label }))}
                        onChange={setTimeRange}
                        ariaLabel="排行榜时间范围"
                    />

                    <div className="bg-[var(--tm-page-plain-content-bg)]">
                        <TextSelectionControl
                            value={activeGrade}
                            items={gradeOptions.map(grade => ({ value: grade, label: grade }))}
                            onChange={setActiveGrade}
                            ariaLabel="排行榜年级筛选"
                            size="compact"
                            className="px-[var(--tm-report-page-inline)]"
                        />
                    </div>
                </div>

                {/* Scroll Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">

                    {/* Module 1: Class Rankings Card */}
                    <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-report-card-padding)] [box-shadow:var(--tm-shadow-card)]">

                        {/* Header */}
                        <div className="mb-[var(--tm-report-card-content-gap)] flex min-h-11 items-center">
                            <h3 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">
                                班级排行榜
                            </h3>
                        </div>

                        {/* Dimension Pills */}
                        <PillSelectionControl
                            value={activeDim}
                            items={dimensions.map(dim => ({ value: dim, label: dim === 'total' ? '综合评价' : dim }))}
                            onChange={setActiveDim}
                            ariaLabel="班级排行榜维度"
                            className="mb-2"
                        />

                        <ClassRankingList
                            items={data.rankings.slice(0, 5)}
                            ariaLabel="班级排行榜前五名"
                            onViewAll={data.rankings.length > 5 ? () => setShowFullRanking(true) : undefined}
                            actionLabel="查看完整排名"
                        />
                    </section>

                    {/* Module 2: Evaluation Records Card */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[17px] font-semibold text-slate-800 flex items-center gap-2">
                                <ActivityIcon className="h-5 w-5 text-[var(--tm-brand-primary)]" />
                                评价记录
                            </h3>
                            <button
                                type="button"
                                onClick={onOpenEvaluationRecords}
                                aria-label="查看全部评价记录"
                                className="-my-2 flex min-h-[var(--tm-size-touch)] items-center gap-0.5 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-brand-primary)] transition-colors active:text-[var(--tm-brand-primary-pressed)]"
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
                                            <div className={`flex-shrink-0 text-sm font-bold tabular-nums ${record.score > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {record.score > 0 ? '+' : ''}{record.score}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <MobileBottomSheet
                    open={showFullRanking}
                    title="全部班级排名"
                    onClose={() => setShowFullRanking(false)}
                >
                    <p className="-mt-1 mb-2 text-[12px] font-medium text-[var(--tm-text-secondary)]">
                        {activeGrade} · {activeDim === 'total' ? '综合评价' : activeDim}
                    </p>
                    <ClassRankingList items={data.rankings} ariaLabel="全部班级排名" />
                </MobileBottomSheet>
            </div>
        </div>
    );
};

export default ClassLeaderboardView;
