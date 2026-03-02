import React, { useState, useMemo } from 'react';
import { ClassInfo, Student } from '../types';
import {
    HelpIcon, CheckCircleIcon, AlertCircleIcon
} from '../components/Icons';

interface ClassReportViewProps {
    classInfo: ClassInfo;
    students: Student[];
    onSelectStudent: (student: Student) => void;
    onGoToClassDetail: () => void;
}

type ReportScope = 'mine' | 'all';
type TimeRange = 'day' | 'week' | 'month' | 'semester' | 'custom';

// Simple SVG Donut Chart Component
const DonutChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    let cumulativeAngle = 0;

    // Handle empty data
    if (total === 0) {
        return (
            <div className="w-32 h-32 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                <span className="text-xs text-slate-300">暂无数据</span>
            </div>
        );
    }

    return (
        <div className="relative w-40 h-40 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                {data.map((item, index) => {
                    const angle = (item.value / total) * 360;
                    if (angle === 0) return null;
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    const r = 40; // radius
                    const cx = 50;
                    const cy = 50;

                    const startX = cx + r * Math.cos((cumulativeAngle * Math.PI) / 180);
                    const startY = cy + r * Math.sin((cumulativeAngle * Math.PI) / 180);

                    cumulativeAngle += angle;

                    const endX = cx + r * Math.cos((cumulativeAngle * Math.PI) / 180);
                    const endY = cy + r * Math.sin((cumulativeAngle * Math.PI) / 180);

                    if (data.filter(d => d.value > 0).length === 1) {
                        return <circle key={index} cx="50" cy="50" r="40" stroke={item.color} strokeWidth="12" fill="none" />;
                    }

                    const pathData = [
                        `M ${startX} ${startY}`,
                        `A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`
                    ].join(' ');

                    return (
                        <path
                            key={index}
                            d={pathData}
                            fill="none"
                            stroke={item.color}
                            strokeWidth="12"
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out hover:opacity-80"
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">{total}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">总记录</span>
            </div>
        </div>
    );
};

const ClassReportView: React.FC<ClassReportViewProps> = ({ classInfo, students, onSelectStudent, onGoToClassDetail }) => {
    const handleStudentClick = (name: string) => {
        const student = students.find(s => s.name === name);
        if (student) {
            onSelectStudent(student);
        }
    };
    const [scope, setScope] = useState<ReportScope>('mine');
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [activeRankDim, setActiveRankDim] = useState('诗意');

    // Mock Data Generator
    const reportData = useMemo(() => {
        let daysCount = 1;
        switch (timeRange) {
            case 'day': daysCount = 1; break;
            case 'week': daysCount = 5; break;
            case 'month': daysCount = 22; break;
            case 'semester': daysCount = 100; break;
            case 'custom':
                if (customRange.start && customRange.end) {
                    const s = new Date(customRange.start);
                    const e = new Date(customRange.end);
                    daysCount = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)));
                } else {
                    daysCount = 7;
                }
                break;
        }

        const entriesPerTeacherPerDay = 4.5;
        const teachersCount = scope === 'mine' ? 1 : 8;
        const variance = 0.8 + Math.random() * 0.4;
        const totalEntries = Math.max(1, Math.floor(daysCount * entriesPerTeacherPerDay * teachersCount * variance));

        const positiveEntries = Math.floor(totalEntries * 0.82);
        const negativeEntries = totalEntries - positiveEntries;

        let coverageBase = 0;
        if (timeRange === 'day') coverageBase = scope === 'mine' ? 0.1 : 0.4;
        else if (timeRange === 'week') coverageBase = scope === 'mine' ? 0.35 : 0.75;
        else if (timeRange === 'month') coverageBase = scope === 'mine' ? 0.65 : 0.92;
        else coverageBase = scope === 'mine' ? 0.85 : 0.98;

        const coveredCount = Math.min(classInfo.studentCount, Math.floor(classInfo.studentCount * (coverageBase + (Math.random() * 0.1 - 0.05))));
        const coverageRate = Math.round((coveredCount / classInfo.studentCount) * 100);
        const unEvaluatedCount = classInfo.studentCount - coveredCount;

        const positiveCoverage = Math.floor(coveredCount * 0.85);
        const negativeCoverage = Math.floor(coveredCount * 0.2);

        const allNames = ['林小杰', '林云溪', '张林天', '王小虎', '李思思', '陈晨', '刘洋', '赵雪', '孙悟空', '猪八戒', '沙僧', '唐僧', '贾宝玉', '林黛玉', '薛宝钗', '王熙凤', '史湘云', '宋江', '武松', '鲁智深', '林冲', '李逵', '刘备', '关羽', '张飞', '赵云', '诸葛亮', '曹操', '周瑜', '司马懿'];
        const unEvaluatedNames = allNames
            .filter((_, i) => (i * 7 + (scope === 'mine' ? 3 : 0)) % 10 < (unEvaluatedCount / allNames.length * 10))
            .slice(0, unEvaluatedCount);

        const weights = { poetic: 0.25, safety: 0.20, physical: 0.20, elegant: 0.20, clean: 0.15 };
        const pillars = ['诗意', '安全', '健体', '文雅', '美净'];

        const dimRankings = pillars.map(dim => ({
            dim,
            pos: [
                { name: allNames[Math.floor(Math.random() * 10)], score: Math.round(10 * variance) },
                { name: allNames[Math.floor(Math.random() * 10) + 10], score: Math.round(8 * variance) },
            ],
            neg: [
                { name: allNames[Math.floor(Math.random() * 5) + 20], score: Math.round(5 * variance) },
            ]
        }));

        return {
            totalEntries,
            positiveEntries,
            negativeEntries,
            positiveCoverage,
            negativeCoverage,
            coveredStudents: coveredCount,
            coverageRate,
            unEvaluatedCount,
            unEvaluatedNames,
            dimRankings,
            chartData: [
                { label: '诗意', value: Math.round(totalEntries * weights.poetic), color: '#F59E0B' },
                { label: '安全', value: Math.round(totalEntries * weights.safety), color: '#3B82F6' },
                { label: '健体', value: Math.round(totalEntries * weights.physical), color: '#10B981' },
                { label: '文雅', value: Math.round(totalEntries * weights.elegant), color: '#EC4899' },
                { label: '美净', value: Math.round(totalEntries * weights.clean), color: '#84CC16' },
            ]
        };
    }, [scope, timeRange, classInfo.studentCount, customRange.start, customRange.end]);

    const timeRangeTabs: { key: TimeRange; label: string }[] = [
        { key: 'day', label: '今日' },
        { key: 'week', label: '本周' },
        { key: 'month', label: '本月' },
        { key: 'semester', label: '本学期' },
        { key: 'custom', label: '自定义' },
    ];

    return (
        <div className="pb-10 bg-[#F0F4F8] min-h-screen font-sans">
            {/* Sticky Header Section */}
            <div className="bg-white sticky top-0 z-20 shadow-sm">
                <div className="px-4 py-3 pb-0">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{classInfo.name}</h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {classInfo.studentCount}名学生 · {classInfo.tags.includes('班主任') ? '班主任' : '任课老师'}
                            </p>
                        </div>
                        {/* Scope Toggle Pill */}
                        <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold shrink-0">
                            <button
                                onClick={() => setScope('mine')}
                                className={`px-3 py-1.5 rounded-md transition-all duration-200 ${scope === 'mine' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                我的记录
                            </button>
                            <button
                                onClick={() => setScope('all')}
                                className={`px-3 py-1.5 rounded-md transition-all duration-200 ${scope === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                全班汇总
                            </button>
                        </div>
                    </div>

                    {/* Time Range Tabs */}
                    <div className="flex border-b border-slate-100 relative">
                        {timeRangeTabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTimeRange(t.key)}
                                className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${timeRange === t.key ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t.label}
                                {timeRange === t.key && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full animate-in fade-in duration-200"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Custom Range Picker */}
                    {timeRange === 'custom' && (
                        <div className="py-3 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                            <input
                                type="date"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={customRange.start}
                                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                            />
                            <span className="text-slate-400 text-xs">至</span>
                            <input
                                type="date"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={customRange.end}
                                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* 1. Detail Metrics Cards */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Positive Stats */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-12 h-12 bg-emerald-50 rounded-bl-full opacity-40 pointer-events-none"></div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">正面评价</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-slate-800 tracking-tight">{reportData.positiveEntries}</span>
                                <span className="text-[10px] text-slate-400 font-bold">次</span>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-slate-50 space-y-0.5">
                            <div className="text-[10px] text-slate-400 font-medium">覆盖人数</div>
                            <div className="text-xs font-bold text-emerald-600">{reportData.positiveCoverage} <span className="text-[10px] text-slate-300 font-normal">人</span></div>
                        </div>
                    </div>

                    {/* Negative Stats */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-12 h-12 bg-rose-50 rounded-bl-full opacity-40 pointer-events-none"></div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">改进建议</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-slate-800 tracking-tight">{reportData.negativeEntries}</span>
                                <span className="text-[10px] text-slate-400 font-bold">次</span>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-slate-50 space-y-0.5">
                            <div className="text-[10px] text-slate-400 font-medium">覆盖人数</div>
                            <div className="text-xs font-bold text-rose-500">{reportData.negativeCoverage} <span className="text-[10px] text-slate-300 font-normal">人</span></div>
                        </div>
                    </div>
                </div>

                {/* Coverage Summary */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 shadow-lg shadow-blue-200 flex items-center justify-between text-white overflow-hidden relative">
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 w-2/3">
                        <div className="text-[10px] font-bold opacity-70 mb-1 uppercase tracking-widest">总体学生覆盖率</div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-black">{reportData.coverageRate}</span>
                            <span className="text-xs font-bold opacity-80">%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${reportData.coverageRate}%` }}></div>
                        </div>
                    </div>
                    <div className="text-right relative z-10">
                        <div className="text-[10px] font-bold opacity-70 mb-1">评价总计</div>
                        <div className="text-xl font-black">{reportData.totalEntries}</div>
                        <div className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded-md mt-1 inline-block">条记录</div>
                    </div>
                </div>

                {/* 2. Unevaluated List */}
                {reportData.unEvaluatedCount > 0 ? (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <AlertCircleIcon className="w-4 h-4 text-orange-500" />
                                    {scope === 'mine' ? '我的未点评学生清单' : '全班未被关注学生'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {scope === 'mine' ? '本周期内您还未对以下学生进行评价：' : '本周期内以下学生没有收到任何评价：'}
                                </p>
                            </div>
                            <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-orange-100">
                                待评 {reportData.unEvaluatedCount} 人
                            </span>
                        </div>

                        <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/50">
                            <div className="flex flex-wrap gap-2">
                                {reportData.unEvaluatedNames.map((name, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleStudentClick(name)}
                                        className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer select-none active:bg-blue-50"
                                    >
                                        {name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={onGoToClassDetail}
                                className="text-xs font-bold text-blue-600 flex items-center gap-1 active:opacity-70"
                            >
                                去点评 <span className="text-[10px]">➜</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col items-center justify-center text-center gap-2">
                        <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                        <h3 className="font-bold text-emerald-800">完美覆盖！</h3>
                        <p className="text-xs text-emerald-600 opacity-80">
                            {scope === 'mine' ? '您' : '所有老师'}已经关注到了每一位同学。
                        </p>
                    </div>
                )}

                {/* 3. Five Education Distribution */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-slate-800 border-l-4 border-blue-500 pl-3">班级评价指标分布</h3>
                        <button className="text-slate-400"><HelpIcon className="w-4 h-4" /></button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex-1 flex justify-center">
                            <DonutChart data={reportData.chartData} />
                        </div>
                        <div className="w-[45%] pl-2 space-y-2.5">
                            {reportData.chartData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-slate-600">{item.label}</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{Math.round((item.value / (reportData.totalEntries || 1)) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Dimension Rankings */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-800 border-l-4 border-blue-500 pl-3">维度表现排行</h3>
                        <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[200px]">
                            {['诗意', '安全', '健体', '文雅', '美净'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setActiveRankDim(d)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-all ${activeRankDim === d ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Positive Ranking */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-1 h-3 bg-emerald-400 rounded-full"></div>
                                <span className="text-[11px] font-bold text-slate-500">加分榜</span>
                            </div>
                            {reportData.dimRankings.find(dr => dr.dim === activeRankDim)?.pos.map((stu, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleStudentClick(stu.name)}
                                    className="flex flex-col p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50 cursor-pointer hover:bg-emerald-100/50 transition-colors active:scale-95 transition-all"
                                >
                                    <span className="text-xs font-bold text-slate-700">{stu.name}</span>
                                    <span className="text-[10px] font-bold text-emerald-600">+{stu.score}分</span>
                                </div>
                            ))}
                        </div>

                        {/* Negative Ranking */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-1 h-3 bg-rose-400 rounded-full"></div>
                                <span className="text-[11px] font-bold text-slate-500">减分榜</span>
                            </div>
                            {reportData.dimRankings.find(dr => dr.dim === activeRankDim)?.neg.map((stu, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleStudentClick(stu.name)}
                                    className="flex flex-col p-2 bg-rose-50/50 rounded-lg border border-rose-100/50 cursor-pointer hover:bg-rose-100/50 transition-colors active:scale-95 transition-all"
                                >
                                    <span className="text-xs font-bold text-slate-700">{stu.name}</span>
                                    <span className="text-[10px] font-bold text-rose-500">-{stu.score}分</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassReportView;