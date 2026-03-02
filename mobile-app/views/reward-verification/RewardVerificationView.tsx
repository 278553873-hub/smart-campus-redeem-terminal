import React, { useState } from 'react';
import { BackIcon, CheckCircleIcon, GiftIcon } from '../../components/Icons';
import { MOCK_STUDENTS_CLASS_1 } from '../../constants';

interface RewardVerificationViewProps {
    classId: string;
    onBack: () => void;
}

// 模拟待核销的数据列表
const initialPendingRewards = [
    { id: 'r1', studentName: '郑小磊', rewardName: '与校长共进午餐1次', time: '今天 12:30', isVerified: false, avatar: MOCK_STUDENTS_CLASS_1[0].avatar },
    { id: 'r2', studentName: '林依依', rewardName: '免写一次语文作业', time: '昨天 18:20', isVerified: false, avatar: MOCK_STUDENTS_CLASS_1[1].avatar },
    { id: 'r3', studentName: '张伟浩', rewardName: '做一天班长体验券', time: '2026-03-01 10:15', isVerified: false, avatar: MOCK_STUDENTS_CLASS_1[2].avatar },
];

export const RewardVerificationView: React.FC<RewardVerificationViewProps> = ({ classId, onBack }) => {
    const [rewards, setRewards] = useState(initialPendingRewards);

    const handleVerify = (id: string) => {
        setRewards(prev => prev.map(r => r.id === id ? { ...r, isVerified: true } : r));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-20">
            {/* Header */}
            <div className="pt-12 pb-4 px-4 bg-white sticky top-0 z-10 flex items-center shadow-sm">
                <button onClick={onBack} className="p-2 -ml-2 text-slate-600 active:bg-slate-100 rounded-full">
                    <BackIcon className="w-6 h-6" />
                </button>
                <div className="flex-1 text-center font-bold text-lg text-slate-800 mr-8">奖品核销</div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
                {rewards.map(reward => (
                    <div key={reward.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${reward.isVerified ? 'border-green-200' : 'border-slate-100'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <img src={reward.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-slate-100" alt="" />
                                <div>
                                    <div className="font-bold text-slate-800 text-[15px]">{reward.studentName}</div>
                                    <div className="text-xs text-slate-400">{reward.time}</div>
                                </div>
                            </div>
                            {reward.isVerified ? (
                                <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                                    <CheckCircleIcon className="w-3 h-3" /> 已核销
                                </div>
                            ) : (
                                <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">待核销</div>
                            )}
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                                <GiftIcon className="w-5 h-5" />
                            </div>
                            <div className="font-bold text-slate-700">{reward.rewardName}</div>
                        </div>

                        {!reward.isVerified && (
                            <button
                                onClick={() => handleVerify(reward.id)}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl active:scale-[0.98] transition-all shadow-md shadow-blue-200"
                            >
                                确认核销
                            </button>
                        )}
                    </div>
                ))}

                {rewards.every(r => r.isVerified) && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <CheckCircleIcon className="w-12 h-12 text-green-500 mb-3" />
                        <span className="text-sm font-bold text-slate-500">所有奖品均已核销完毕</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RewardVerificationView;
