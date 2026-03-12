
import React, { useState } from 'react';
import {
    Trophy, TrendingUp, Calendar, ArrowUpRight,
    ChevronRight, Sparkles, UserCheck, Clock, CheckCircle2,
    AlertCircle, ArrowLeft, Medal, Info
} from 'lucide-react';
import { Student, GrowthStatus, TierLevel } from '../types';

interface GrowthViewProps {
    student: Student;
    onBack: () => void;
}

const MOCK_GROWTH: GrowthStatus = {
    currentTier: 'stable',
    currentScore: 45,
    nextTierScoreNeeded: 15,
    records: [
        {
            id: '1',
            description: '你上课积极举手发言，展现了良好的课堂参与意识。',
            teacher: '李老师',
            time: '2026-03-11',
            type: 'positive',
            score: 2
        },
        {
            id: '2',
            description: '你在周口市“新华杯”多文本阅读写作活动中荣获小学组特等奖，展现了出色的语文素养。',
            teacher: '张老师',
            time: '2026-03-10',
            type: 'positive',
            score: 5
        },
        {
            id: '3',
            description: '走廊走动期间追逐打闹，缺乏基础的安全防范意识。',
            teacher: '王老师',
            time: '2026-03-08',
            type: 'negative',
            score: -2
        },
        {
            id: '4',
            description: '主动承担班级卫生清扫工作，并在“红领巾体验岗位”中表现优异。',
            teacher: '李老师',
            time: '2026-03-07',
            type: 'positive',
            score: 3
        },
        {
            id: '5',
            description: '体育课耐力跑训练中克服困难，坚持完成任务并取得优异成绩。',
            teacher: '陈老师',
            time: '2026-03-05',
            type: 'positive',
            score: 2
        },
        {
            id: '6',
            description: '在校内数学思维竞赛中表现突出，逻辑思维严密，获得优胜奖。',
            teacher: '张老师',
            time: '2026-03-03',
            type: 'positive',
            score: 10
        },
        {
            id: '7',
            description: '担任班级图书角管理员期间认真负责，图书摆放整齐。',
            teacher: '李老师',
            time: '2026-02-28',
            type: 'positive',
            score: 3
        },
        {
            id: '8',
            description: '课间休息文明有礼，能主动向老师问好，体现了良好的礼仪修养。',
            teacher: '王老师',
            time: '2026-02-27',
            type: 'positive',
            score: 2
        },
        {
            id: '9',
            description: '在校园垃圾分类实践活动中表现优异，被评为“环保标兵”。',
            teacher: '李老师',
            time: '2026-02-25',
            type: 'positive',
            score: 3
        },
        {
            id: '10',
            description: '早晨集体朗读课文声音洪亮，感情充沛，起到了良好的带头作用。',
            teacher: '李老师',
            time: '2026-02-23',
            type: 'positive',
            score: 2
        },
        {
            id: '11',
            description: '课后协助老师整理多媒体教具，爱护公物，值得大家学习。',
            teacher: '张老师',
            time: '2026-02-21',
            type: 'positive',
            score: 3
        },
        {
            id: '12',
            description: '在科学课实验观察中记录详尽准确，体现了严谨的学习态度。',
            teacher: '周老师',
            time: '2026-02-19',
            type: 'positive',
            score: 5
        },
        {
            id: '13',
            description: '放学路队集队速度快，行进中保持队形整齐，“快、静、齐”达标。',
            teacher: '王老师',
            time: '2026-02-17',
            type: 'positive',
            score: 2
        },
        {
            id: '14',
            description: '发现并劝阻了个别同学在走廊随地吐痰的行为，维护了校园环境卫生。',
            teacher: '李老师',
            time: '2026-02-15',
            type: 'positive',
            score: 5
        }
    ]
};

const MOCK_SHOW_LEADERBOARD = true;

const TIER_CONFIG: Record<TierLevel, { label: string, bg: string, requirement: string, textColor: string, ring: string, emoji: string }> = {
    star: { label: '领航之星', bg: 'bg-yellow-50', requirement: '', textColor: 'text-yellow-700', ring: 'ring-yellow-100', emoji: '' },
    active: { label: '卓越先锋', bg: 'bg-blue-50', requirement: '', textColor: 'text-blue-700', ring: 'ring-blue-100', emoji: '' },
    stable: { label: '稳步成长', bg: 'bg-green-50', requirement: '', textColor: 'text-green-700', ring: 'ring-green-100', emoji: '' },
    improve: { label: '潜力新星', bg: 'bg-emerald-50/50', requirement: '', textColor: 'text-emerald-700', ring: 'ring-emerald-100', emoji: '' }
};

type DemoScenario = 'normal' | 'allZero' | 'rank5';

const GrowthView: React.FC<GrowthViewProps> = ({ student, onBack }) => {
    const [activeTab, setActiveTab] = useState<'records' | 'leaderboard'>('records');
    const [demoScenario, setDemoScenario] = useState<DemoScenario>('normal');
    const [showClassRewardModal, setShowClassRewardModal] = useState(false);

    const formatFixedCoin = (num: number) => {
        return Number.isInteger(num) ? num.toString() : parseFloat(num.toFixed(2)).toString();
    };

    const uiState = React.useMemo(() => {
        if (demoScenario === 'allZero') {
            return {
                currentTier: 'stable' as TierLevel,
                currentScore: 0,
                nextTierScoreNeeded: 1,
                coinsBase: 100,
                coinsBonus: 0,
                coinsFlag: 10,
                totalCoins: 110,
                records: [],
                leaderboard: []
            };
        } else if (demoScenario === 'rank5') {
            return {
                currentTier: 'active' as TierLevel,
                currentScore: 82,
                nextTierScoreNeeded: 3,
                coinsBase: 10,
                coinsBonus: 180,
                coinsFlag: 10,
                totalCoins: 200,
                records: MOCK_GROWTH.records,
                leaderboard: [
                    { rank: 1, name: '张小宇', score: 95, coins: 50.55, isSelf: false, isTarget: false, tier: 'star' as TierLevel },
                    { rank: 2, name: '李佳怡', score: 92, coins: 50.55, isSelf: false, isTarget: false, tier: 'star' as TierLevel },
                    { rank: 3, name: '赵梓涵', score: 88, coins: 50.55, isSelf: false, isTarget: false, tier: 'star' as TierLevel },
                    { rank: 4, name: '王小明', score: 85, coins: 250, isSelf: false, isTarget: true, tier: 'star' as TierLevel },
                    { rank: 5, name: '郑小磊', score: 82, coins: 180, isSelf: true, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 6, name: '陈子轩', score: 80, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 7, name: '林浩然', score: 78, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 8, name: '郭星辰', score: 75, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 9, name: '周雨桐', score: 73, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 10, name: '吴佳琪', score: 72, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 11, name: '徐博文', score: 70, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 12, name: '刘诗语', score: 65, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 13, name: '陈冠宇', score: 62, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 14, name: '黄心怡', score: 60, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 15, name: '张子豪', score: 58, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 16, name: '林嘉欣', score: 55, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 17, name: '周芷若', score: 52, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 18, name: '王志祥', score: 50, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 19, name: '杨超越', score: 48, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 20, name: '赵俊杰', score: 45, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 21, name: '钱多多', score: 42, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 22, name: '孙悟空', score: 40, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 23, name: '李白', score: 38, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 24, name: '杜甫', score: 35, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 25, name: '白居易', score: 30, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 26, name: '辛弃疾', score: 25, coins: 110, isSelf: false, isTarget: false, tier: 'improve' as TierLevel },
                    { rank: 27, name: '李清照', score: 20, coins: 110, isSelf: false, isTarget: false, tier: 'improve' as TierLevel },
                    { rank: 28, name: '陆游', score: 15, coins: 110, isSelf: false, isTarget: false, tier: 'improve' as TierLevel },
                    { rank: 29, name: '司马迁', score: 10, coins: 110, isSelf: false, isTarget: false, tier: 'improve' as TierLevel },
                    { rank: 30, name: '苏轼', score: 5, coins: 110, isSelf: false, isTarget: false, tier: 'improve' as TierLevel },
                    ...Array.from({ length: 10 }).map((_, i) => ({ rank: 31 + i, name: `学生 ${31 + i}`, score: 0, coins: 0, isSelf: false, isTarget: false, tier: 'improve' as TierLevel }))
                ]
            };
        } else {
            return {
                currentTier: 'stable' as TierLevel,
                currentScore: 45,
                nextTierScoreNeeded: 15,
                coinsBase: 70.5,
                coinsBonus: 20.38,
                coinsFlag: 10,
                totalCoins: 90.88,
                records: MOCK_GROWTH.records,
                leaderboard: [
                    { rank: 1, name: '张小宇', score: 85, coins: 50.55, isSelf: false, isTarget: false, tier: 'star' as TierLevel },
                    { rank: 2, name: '李佳怡', score: 78, coins: 50.55, isSelf: false, isTarget: false, tier: 'star' as TierLevel },
                    { rank: 3, name: '赵梓涵', score: 72, coins: 50.55, isSelf: false, isTarget: false, tier: 'star' as TierLevel },
                    { rank: 4, name: '孙雨菲', score: 68, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 5, name: '陈子轩', score: 65, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 6, name: '林浩然', score: 64, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 7, name: '郭星辰', score: 63, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 8, name: '周雨桐', score: 63, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 9, name: '吴佳琪', score: 62, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 10, name: '徐博文', score: 61, coins: 180, isSelf: false, isTarget: false, tier: 'active' as TierLevel },
                    { rank: 11, name: '王小明', score: 60, coins: 180, isSelf: false, isTarget: true, tier: 'active' as TierLevel },
                    { rank: 12, name: '郑小磊', score: 45, coins: 20.38, isSelf: true, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 13, name: '刘诗语', score: 42, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 14, name: '陈冠宇', score: 41, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 15, name: '黄心怡', score: 40, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 16, name: '张子豪', score: 38, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 17, name: '林嘉欣', score: 38, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 18, name: '周芷若', score: 35, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 19, name: '王志祥', score: 34, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 20, name: '杨超越', score: 33, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 21, name: '赵俊杰', score: 30, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 22, name: '钱多多', score: 28, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 23, name: '孙悟空', score: 25, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 24, name: '李白', score: 22, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 25, name: '杜甫', score: 20, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 26, name: '白居易', score: 18, coins: 125, isSelf: false, isTarget: false, tier: 'stable' as TierLevel },
                    { rank: 27, name: '辛弃疾', score: 12, coins: 110, isSelf: false, isTarget: false, tier: 'improve' as TierLevel },
                    { rank: 28, name: '李清照', score: 10, coins: 110, isSelf: false, isTarget: false, tier: 'improve' as TierLevel },
                    { rank: 29, name: '陆游', score: 8, coins: 110, isSelf: false, isTarget: false, tier: 'improve' as TierLevel },
                    { rank: 30, name: '苏轼', score: 5, coins: 110, isSelf: false, isTarget: false, tier: 'improve' as TierLevel },
                    ...Array.from({ length: 10 }).map((_, i) => ({ rank: 31 + i, name: `学生 ${31 + i}`, score: 0, coins: 0, isSelf: false, isTarget: false, tier: 'improve' as TierLevel }))
                ]
            };
        }
    }, [demoScenario]);

    const currentConfig = TIER_CONFIG[uiState.currentTier];

    return (
        <div className="h-full flex flex-col bg-[#f8fbff] animate-in slide-in-from-right-12 fade-in duration-300 ease-out overflow-hidden relative">

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 max-w-5xl mx-auto w-full">

                {/* 顶部总得分卡片（强化层级分离） */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    {/* 左半部分：得分与档位 */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border-2 border-slate-50 flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-start w-full shrink-0 h-[28px]">
                            <span className="text-slate-400 font-extrabold text-xs uppercase tracking-widest pl-1">本月净得分</span>
                            <div className={`px-3 py-1.5 rounded-xl font-black text-xs border-[2px] border-white ring-1 ${currentConfig.ring} ${currentConfig.bg} ${currentConfig.textColor} shadow-sm flex items-center gap-1.5`}>
                                {currentConfig.label}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center flex-1 py-4">
                            <h3 className="text-[3.5rem] leading-none font-black text-blue-600 tracking-tighter flex items-baseline">
                                {uiState.currentScore} <span className="text-xl text-slate-400 ml-2 opacity-70 font-bold">分</span>
                            </h3>
                        </div>

                        <div className="flex justify-between items-center gap-3 w-full shrink-0 h-[52px]">
                            <div className="flex-1 h-full flex items-center justify-center flex-col bg-green-50/80 rounded-2xl py-1 px-2 border border-green-100/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-transform hover:scale-105">
                                <span className="text-[10px] text-green-600/80 font-bold mb-0.5 flex items-center gap-1">表扬</span>
                                <div className="text-green-600 font-black text-sm font-[NumberFont] flex items-baseline justify-center gap-0.5">
                                    {uiState.records.filter(r => r.type === 'positive').length} <span className="text-[10px] font-bold font-sans opacity-80">次</span>
                                </div>
                            </div>
                            <div className="flex-1 h-full flex items-center justify-center flex-col bg-red-50/80 rounded-2xl py-1 px-2 border border-red-100/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-transform hover:scale-105">
                                <span className="text-[10px] text-red-500/80 font-bold mb-0.5 flex items-center gap-1">待改进</span>
                                <div className="text-red-500 font-black text-sm font-[NumberFont] flex items-baseline justify-center gap-0.5">
                                    {uiState.records.filter(r => r.type === 'negative').length} <span className="text-[10px] font-bold font-sans opacity-80">次</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 右半部分：预计分红账单 */}
                    <div className="bg-gradient-to-b from-orange-50/80 to-amber-50/50 rounded-[2rem] p-6 border-2 border-orange-100/50 flex flex-col relative overflow-hidden">
                        <div className="flex justify-start items-start w-full shrink-0 h-[28px]">
                            <span className="text-orange-600/80 font-extrabold text-xs uppercase tracking-widest pl-1">
                                预估分红总额
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center flex-1 py-4">
                            <h3 className="text-[3.5rem] leading-none font-black text-orange-500 tracking-tighter flex items-center justify-center gap-3">
                                <img src="/assets/coin.png" className="w-[0.9em] h-[0.9em] -translate-y-[2px]" alt="coin" />
                                <span className="font-[NumberFont]">{formatFixedCoin(uiState.coinsBase + uiState.coinsBonus)}</span>
                            </h3>
                        </div>

                        <div className="flex justify-between items-center gap-3 w-full shrink-0 h-[52px]">
                            <div className="flex-1 h-full flex items-center justify-center flex-col bg-white/70 rounded-2xl py-1 px-2 border border-orange-100/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-transform hover:scale-105">
                                <span className="text-[10px] text-orange-600/70 font-bold mb-0.5">成长奖励</span>
                                <div className="text-orange-500 font-black text-sm font-[NumberFont] flex items-center justify-center gap-1">
                                    <img src="/assets/coin.png" className="w-[1.1em] h-[1.1em] -translate-y-[1px]" alt="coin" />
                                    <span>{formatFixedCoin(uiState.coinsBase)}</span>
                                </div>
                            </div>
                            <div className="text-orange-300 font-black text-sm leading-none">+</div>
                            <div className="flex-1 h-full flex items-center justify-center flex-col bg-white/70 rounded-2xl py-1 px-2 border border-orange-100/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-transform hover:scale-105">
                                <span className="text-[10px] text-orange-600/70 font-bold mb-0.5">得分奖励</span>
                                <div className="text-orange-500 font-black text-sm font-[NumberFont] flex items-center justify-center gap-1">
                                    <img src="/assets/coin.png" className="w-[1.1em] h-[1.1em] -translate-y-[1px]" alt="coin" />
                                    <span>{formatFixedCoin(uiState.coinsBonus)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* 粘性吸顶 Tab 切换栏 */}
                <div className="sticky top-0 z-40 bg-[#f8fbff]/90 backdrop-blur-md pt-2 pb-2">
                    <div className="flex p-1 bg-slate-200/60 rounded-xl">
                        <button
                            onClick={() => setActiveTab('records')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${activeTab === 'records' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Clock size={16} /> 行为记录
                        </button>
                        {MOCK_SHOW_LEADERBOARD && (
                            <button
                                onClick={() => setActiveTab('leaderboard')}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1.5 ${activeTab === 'leaderboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Medal size={16} /> 班级标杆
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab 内容区 */}
                {activeTab === 'leaderboard' && MOCK_SHOW_LEADERBOARD && (
                    <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border-2 border-slate-50 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-black text-slate-800 flex items-center gap-1.5 text-sm">
                                <Medal size={18} className="text-yellow-500" /> 班级标杆
                            </h4>
                        </div>



                        <div className="space-y-2 relative z-10">
                            {uiState.leaderboard.length === 0 ? (
                                <div className="py-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-3">
                                        <TrendingUp size={32} />
                                    </div>
                                    <h5 className="font-black text-slate-700 mb-1">大家都在同一起跑线</h5>
                                    <p className="text-xs text-slate-400 font-bold px-4">本班目前还没有同学得分，谁会成为本月榜一大哥？快去争取第一分吧！</p>
                                </div>
                            ) : (() => {
                                // 计算分数分组
                                const scoreMap = new Map<number, typeof uiState.leaderboard>();
                                uiState.leaderboard.forEach(item => {
                                    if (!scoreMap.has(item.score)) scoreMap.set(item.score, []);
                                    scoreMap.get(item.score)!.push(item);
                                });
                                const sortedGroups = [...scoreMap.entries()]
                                    .filter(([score]) => score > 0)
                                    .sort((a, b) => b[0] - a[0]);
                                // 只要有参与者就展示标杆，不以参与者内部是否同分作为判断
                                const allSame = false; // 废弃此判断，改为始终展示
                                // 取前3个正分数层作为标杆
                                const benchmarkGroups = sortedGroups.slice(0, 3);
                                const selfItem = uiState.leaderboard.find(item => item.isSelf);
                                // 自己是否已在标杆层中
                                const selfInBenchmark = benchmarkGroups.some(([, students]) => students.some(s => s.isSelf));

                                return (
                                    <>
                                        {/* 班级标杆：只要有参与者就展示 */}
                                        {benchmarkGroups.length > 0 && (
                                            <div>
                                                <div className="space-y-1.5">
                                                    {benchmarkGroups.map(([score, students], groupIdx) => {
                                                        const isTop = groupIdx === 0;
                                                        return (
                                                            <div key={score} className="space-y-1">
                                                                {students.map((item, idx) => (
                                                                    <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${item.isSelf ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                                                            : isTop ? 'bg-amber-50 border-amber-100'
                                                                                : 'bg-slate-50 border-slate-100'
                                                                        }`}>
                                                                        <div className="flex items-center gap-2.5">
                                                                            <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 ${item.isSelf ? 'border-blue-300' : isTop ? 'border-amber-300' : 'border-slate-200'}`}>
                                                                                <img src={`https://i.pravatar.cc/150?u=${item.name}`} className="w-full h-full object-cover" alt="" />
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <span className={`font-bold text-sm ${item.isSelf ? 'text-blue-700' : 'text-slate-700'}`}>
                                                                                        {item.name}
                                                                                    </span>
                                                                                    {item.isSelf && <span className="text-[10px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded font-bold">我</span>}
                                                                                </div>
                                                                                <div className={`mt-0.5 text-[10px] font-black uppercase tracking-wider ${TIER_CONFIG[item.tier].textColor}`}>
                                                                                    {TIER_CONFIG[item.tier].label}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                            <div className="text-right shrink-0">
                                                                                <div className={`font-black text-sm tabular-nums ${item.isSelf ? 'text-blue-600' : isTop ? 'text-amber-600' : 'text-slate-500'}`}>
                                                                                    {item.score} <small className="text-slate-300 font-sans">分</small>
                                                                                </div>
                                                                                {item.coins > 0 ? (
                                                                                    <div className="text-orange-500 font-bold text-xs flex items-center gap-0.5 justify-end">
                                                                                        <span className="text-[10px] font-sans text-slate-400">预估</span>
                                                                                        <img src="/assets/coin.png" className="w-[0.9em] h-[0.9em] -translate-y-[1px]" alt="coin" />
                                                                                        {formatFixedCoin(item.coins || 0)}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-[10px] text-slate-400 font-bold pt-0.5">无奖励</div>
                                                                                )}
                                                                            </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* 分割线 */}
                                        {!allSame && selfItem && !selfInBenchmark && (
                                            <div className="flex items-center gap-2 py-1">
                                                <div className="h-px flex-1 border-t border-dashed border-slate-200" />
                                                <span className="text-[10px] font-black text-slate-400 shrink-0">我的得分</span>
                                                <div className="h-px flex-1 border-t border-dashed border-slate-200" />
                                            </div>
                                        )}

                                        {/* 自己（不在标杆层时单独展示） */}
                                        {selfItem && !selfInBenchmark && (
                                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200 ring-1 ring-blue-200">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 border-blue-300">
                                                        <img src={`https://i.pravatar.cc/150?u=${selfItem.name}`} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-sm text-blue-700">
                                                                {selfItem.name}
                                                            </span>
                                                            <span className="text-[10px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded font-bold">我</span>
                                                        </div>
                                                        {/* 等级标签：纯文字演示，更好对齐 */}
                                                        <div className={`mt-0.5 text-[10px] font-black uppercase tracking-wider ${TIER_CONFIG[selfItem.tier].textColor}`}>
                                                            {TIER_CONFIG[selfItem.tier].label}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="font-black text-blue-600 text-sm tabular-nums">{selfItem.score} <small className="text-blue-300 font-sans">分</small></div>
                                                    {selfItem.coins > 0 ? (
                                                        <div className="text-orange-500 font-bold text-xs flex items-center gap-0.5 justify-end">
                                                            <span className="text-[10px] font-sans text-slate-400">预估</span>
                                                            <img src="/assets/coin.png" className="w-[0.9em] h-[0.9em] -translate-y-[1px]" alt="coin" />
                                                            {formatFixedCoin(selfItem.coins || 0)}
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] text-slate-400 font-bold pt-0.5 text-right">无奖励</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                        <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-slate-50 pointer-events-none opacity-50" />
                    </div>
                )}

                {activeTab === 'records' && (
                    <div className="space-y-3 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between px-2 pb-1">
                            <h4 className="text-sm font-black text-slate-700 flex items-center gap-2">
                                <Clock size={16} className="text-blue-400" /> 本月行为明细
                            </h4>
                            <div className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">{uiState.records.length} 条记录</div>
                        </div>

                        {uiState.records.length === 0 ? (
                            <div className="py-8 flex flex-col items-center justify-center text-center opacity-60">
                                <Clock size={32} className="text-slate-300 mb-2" />
                                <p className="text-sm text-slate-400 font-bold">暂无行为明细记录</p>
                            </div>
                        ) : uiState.records.map(record => (
                            <div key={record.id} className="bg-white p-5 rounded-[1.5rem] border-2 border-slate-50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col gap-3 group relative overflow-hidden w-full">

                                {/* 头部：事件得分与人员 */}
                                <div className="flex justify-between items-start gap-4">
                                    <p className="font-bold text-slate-700 text-sm leading-relaxed flex-1 pt-1 opacity-90">
                                        {record.description}
                                    </p>
                                    <div className={`flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-2xl border-4 border-white shadow-sm -mt-2 -mr-2 ${record.type === 'positive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        <span className="font-black text-2xl leading-none font-[NumberFont]">{record.score > 0 ? '+' : ''}{record.score}</span>
                                        <span className="text-[10px] font-black opacity-60 uppercase mt-0.5">分</span>
                                    </div>
                                </div>

                                {/* 底部：时间脚标 */}
                                <div className="flex items-center gap-3 pt-3 border-t border-dashed border-slate-100 opacity-60 pt-2">
                                    <div className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <UserCheck size={10} /> {record.teacher}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {record.time}
                                    </div>
                                </div>

                                {/* 左侧颜色线指示 */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${record.type === 'positive' ? 'bg-green-400' : 'bg-red-400'} opacity-80`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 班级奖励明细 Modal */}
            {showClassRewardModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowClassRewardModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                    <AlertCircle size={16} />
                                </span>
                                班级奖励明细
                            </h3>
                            <button onClick={() => setShowClassRewardModal(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-xl border border-slate-100 transition-colors">
                                <ArrowLeft size={16} className="rotate-180" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3 pb-8">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
                                <span className="text-sm font-bold text-slate-700">流动红旗</span>
                                <span className="text-orange-500 font-black font-[NumberFont] flex items-center gap-1">+ <img src="/assets/coin.png" className="w-[0.9em] h-[0.9em]" alt="coin" /> 5.00</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
                                <span className="text-sm font-bold text-slate-700">运动会拔河第一名</span>
                                <span className="text-orange-500 font-black font-[NumberFont] flex items-center gap-1">+ <img src="/assets/coin.png" className="w-[0.9em] h-[0.9em]" alt="coin" /> 5.00</span>
                            </div>
                            <div className="text-center pt-2">
                                <span className="text-xs text-slate-400 font-bold">由班主任分配发放</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 0px; }
            .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
            .custom-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default GrowthView;
