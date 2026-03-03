import React, { useState } from 'react';
import { CheckCircleIcon, GiftIcon, PlusIcon, CloseIcon } from '../../components/Icons';
import { MOCK_STUDENTS_CLASS_1 } from '../../constants';

interface RewardVerificationViewProps {
    classId: string;
    onBack: () => void;
}

// default icons for class goods
const DEFAULT_ICONS = ['🎒', '📝', '🍪', '🎟️', '🏅', '📚', '⚽', '🎨', '🪑', '🧹', '🍱'];

// initial class goods
const initialClassGoods = [
    { id: 'g1', name: '免写一次语文作业', price: 100, icon: '🎟️' },
    { id: 'g2', name: '做一天班长体验券', price: 300, icon: '🏅' },
    { id: 'g3', name: '与校长共进午餐1次', price: 500, icon: '🍱' },
    { id: 'g4', name: '精美笔记本一本', price: 150, icon: '📚' },
    { id: 'g5', name: '黑色中性笔一支', price: 50, icon: '📝' },
    { id: 'g6', name: '老师手作小饼干一份', price: 80, icon: '🍪' },
    { id: 'g7', name: '指定优选座位一周', price: 200, icon: '🪑' },
    { id: 'g8', name: '免除一次大扫除', price: 120, icon: '🧹' },
];

export const RewardVerificationView: React.FC<RewardVerificationViewProps> = ({ classId, onBack }) => {
    // Inject mock campusCoins if they don't exist in the mock constants
    const [students, setStudents] = useState<any[]>(() =>
        MOCK_STUDENTS_CLASS_1.map(s => ({
            ...s,
            campusCoins: (s as any).campusCoins || Math.floor(Math.random() * 800) + 200
        }))
    );
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [showGoodsList, setShowGoodsList] = useState(false);

    // Manage Goods State
    const [showManageGoods, setShowManageGoods] = useState(false);

    // Batch Edit State
    const [showBatchEdit, setShowBatchEdit] = useState(false);
    const [draftGoods, setDraftGoods] = useState<typeof initialClassGoods>([]);

    const [goods, setGoods] = useState(initialClassGoods);

    // Success State
    const [showSuccess, setShowSuccess] = useState(false);

    const toggleStudentSelection = (studentId: string) => {
        const newSelected = new Set(selectedStudentIds);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudentIds(newSelected);
    };

    const handleBatchRedeemClick = () => {
        if (selectedStudentIds.size === 0) {
            alert('请先选择学生');
            return;
        }
        setShowGoodsList(true);
    };

    const handleConfirmRedeem = (good: any) => {
        const insufficientStudents = students.filter(s => selectedStudentIds.has(s.id) && s.campusCoins < good.price);
        if (insufficientStudents.length > 0) {
            alert(`${insufficientStudents.map(s => s.name).join(', ')} 余额不足以兑换该商品`);
            return;
        }

        // deduct coins based on local state update
        setStudents(prev => prev.map(s =>
            selectedStudentIds.has(s.id) ? { ...s, campusCoins: s.campusCoins - good.price } : s
        ));

        setSelectedStudentIds(new Set()); // clear selection after success
        setShowGoodsList(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const handleStartBatchEdit = () => {
        setDraftGoods(JSON.parse(JSON.stringify(goods)));
        setShowManageGoods(false);
        setShowBatchEdit(true);
    };

    const handleSaveBatchEdit = () => {
        // filter out empty names
        const validGoods = draftGoods.filter(g => g.name.trim() !== '');
        setGoods(validGoods);
        setShowBatchEdit(false);
        setShowManageGoods(true);
    };

    const handleAddDraftGood = () => {
        const newGood = {
            id: 'g' + Date.now(),
            name: '',
            price: 50,
            icon: DEFAULT_ICONS[0]
        };
        setDraftGoods([newGood, ...draftGoods]);
    };

    const handleDraftChange = (id: string, field: string, value: any) => {
        setDraftGoods(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
    };

    const handleDraftDelete = (id: string) => {
        setDraftGoods(prev => prev.filter(g => g.id !== id));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative pb-20 pt-4">

            <div className="p-4 overflow-y-auto flex-1 pb-32">
                <div className="text-sm font-bold text-slate-500 mb-4 px-2">请选择要兑换奖励的学生：</div>

                <div className="grid grid-cols-3 gap-2 py-1">
                    {students.map((student: any) => {
                        const isSelected = selectedStudentIds.has(student.id);
                        return (
                            <div
                                key={student.id}
                                onClick={() => toggleStudentSelection(student.id)}
                                className={`rounded-2xl p-2 flex flex-col items-center gap-1.5 group transition-all text-center pb-3 relative cursor-pointer outline-none select-none
                                    ${isSelected ? 'bg-indigo-50/50 border-2 border-indigo-500 shadow-md shadow-indigo-100' : 'bg-white border-2 border-transparent shadow-sm'}`}
                            >
                                <div className="absolute top-1.5 right-1.5 z-10">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500' : 'bg-slate-100 border border-slate-300'}`}>
                                        {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                </div>
                                <img src={student.avatar} className={`w-12 h-12 rounded-full object-cover shadow-sm transition-all ${isSelected ? 'border-2 border-indigo-500' : 'border-2 border-slate-50'}`} alt="" />
                                <div className="w-full">
                                    <div className="font-bold text-slate-800 text-[13px] truncate px-1">{student.name}</div>
                                    <div className="text-[11px] font-black text-orange-500 flex items-center justify-center mt-0.5">
                                        <img src="/assets/coin.png" className="w-[1.1em] h-[1.1em] mr-0.5" alt="coin" /> {student.campusCoins}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-40 flex gap-3">
                <button
                    onClick={() => setShowManageGoods(true)}
                    className="flex-1 py-3.5 bg-indigo-50 text-indigo-700 font-bold text-[15px] rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 max-w-[140px]"
                >
                    <GiftIcon className="w-5 h-5 text-indigo-600" />
                    设置奖励
                </button>
                <button
                    onClick={handleBatchRedeemClick}
                    className={`flex-[2] py-3.5 font-black text-[15px] rounded-2xl active:scale-95 transition-all flex items-center justify-center shadow-lg
                        ${selectedStudentIds.size > 0
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-indigo-500/30'
                            : 'bg-slate-200 text-slate-400 shadow-transparent grayscale'}`}
                >
                    去兑换 {selectedStudentIds.size > 0 ? `(${selectedStudentIds.size}人)` : ''}
                </button>
            </div>

            {/* Goods List Bottom Modal */}
            {showGoodsList && (
                <>
                    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setShowGoodsList(false)} />
                    <div className="fixed bottom-0 left-0 right-0 z-[70] bg-[#fcfdfe] rounded-t-3xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-full duration-300">
                        <div className="p-5 flex items-center justify-between border-b border-slate-100 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">班级商品清单</h3>
                                <p className="text-xs font-bold text-indigo-500 mt-1">已选择 {selectedStudentIds.size} 名学生</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowGoodsList(false)} className="p-1.5 bg-slate-100 rounded-full active:scale-95 transition-all">
                                    <CloseIcon className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar pb-12">
                            {goods.map((g) => {
                                // check if ALL selected students can afford
                                const canAffordAll = [...selectedStudentIds].every(id => {
                                    const stu = students.find(s => s.id === id);
                                    return stu && stu.campusCoins >= g.price;
                                });

                                return (
                                    <div key={g.id} className="flex items-center p-3.5 bg-white border-2 border-slate-50 rounded-2xl mb-3 shadow-sm active:scale-[0.98] transition-all">
                                        <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-2xl rounded-xl mr-3 shrink-0 shadow-inner">
                                            {g.icon}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="font-bold text-slate-800 text-[14px] mb-0.5 truncate">{g.name}</div>
                                            <div className="text-xs font-black text-orange-500 flex items-center">
                                                <img src="/assets/coin.png" className="w-[1.1em] h-[1.1em] mr-0.5 -translate-y-[1px]" alt="coin" /> {g.price} / 人
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => canAffordAll ? handleConfirmRedeem(g) : null}
                                            className={`px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm focus:outline-none shrink-0
                                            ${canAffordAll
                                                    ? 'bg-blue-500 text-white active:scale-95 shadow-blue-500/20'
                                                    : 'bg-slate-100 text-slate-400 opacity-70'}
                                        `}
                                        >
                                            {canAffordAll ? '扣除并兑换' : '余额不足'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Manage Rewards Modal (Centered Popup) */}
            {showManageGoods && (
                <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-[400px] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">设置班级奖励</h3>
                                <p className="text-[12px] font-medium text-slate-500 mt-1">当前共有 {goods.length} 个兑换项</p>
                            </div>
                            <button onClick={() => setShowManageGoods(false)} className="p-2 bg-slate-100 rounded-full active:scale-95 transition-all">
                                <CloseIcon className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Goods List */}
                        <div className="p-4 bg-slate-50/50 overflow-y-auto custom-scrollbar max-h-[55vh]">
                            <div className="flex flex-col gap-3">
                                {goods.map((g) => (
                                    <div key={g.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center shadow-sm relative transition-all">
                                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-xl mr-3 shadow-inner shrink-0">{g.icon}</div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="font-bold text-slate-800 text-[15px] mb-1.5 leading-snug break-words">{g.name}</div>
                                            <div className="text-[12px] font-black text-orange-500 flex items-center bg-orange-50 px-2 py-0.5 rounded-full w-fit">
                                                <img src="/assets/coin.png" className="w-[1.2em] h-[1.2em] mr-1" alt="coin" /> {g.price}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {goods.length === 0 && (
                                <div className="text-center py-12 text-slate-400 font-bold text-sm">
                                    暂无兑换项，请点击下方按钮新建
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="p-5 bg-white border-t border-slate-100 shrink-0">
                            <button
                                onClick={handleStartBatchEdit}
                                className="w-full py-3.5 bg-indigo-50 text-indigo-600 font-black text-[15px] rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 border border-indigo-100/50"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                批量编辑奖品
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Edit Modal */}
            {showBatchEdit && (
                <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-5 animate-in fade-in duration-200">
                    <div className="bg-[#fcfdfe] sm:rounded-3xl rounded-t-3xl w-full max-w-[500px] h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">批量编辑奖品</h3>
                                <p className="text-[12px] font-medium text-slate-500 mt-1">编辑已有奖品或新增项</p>
                            </div>
                            <button onClick={handleSaveBatchEdit} className="px-5 py-2 bg-indigo-500 text-white text-sm font-bold rounded-xl active:bg-indigo-600 transition-colors shadow-sm shadow-indigo-500/20">
                                完成
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-4">
                            <button
                                onClick={handleAddDraftGood}
                                className="w-full py-4 mb-4 bg-white border-2 border-dashed border-indigo-200 text-indigo-500 font-black text-[14px] rounded-2xl active:bg-indigo-50 transition-all flex items-center justify-center gap-1.5"
                            >
                                <PlusIcon className="w-5 h-5" /> 新增奖品
                            </button>

                            <div className="flex flex-col gap-4 pb-12">
                                {draftGoods.map(g => (
                                    <div key={g.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm relative">
                                        <button
                                            onClick={() => handleDraftDelete(g.id)}
                                            className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-500 rounded-full shadow-sm hover:bg-red-200 active:scale-95 transition-all z-10"
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center gap-3">
                                            {/* Icon Selector Button (cycles through defaults for simplicity, or we can use a select) */}
                                            <select
                                                value={g.icon}
                                                onChange={(e) => handleDraftChange(g.id, 'icon', e.target.value)}
                                                className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl text-2xl flex items-center justify-center text-center appearance-none cursor-pointer focus:outline-none focus:border-indigo-400"
                                                style={{ textAlignLast: 'center' }}
                                            >
                                                {DEFAULT_ICONS.map(icon => (
                                                    <option key={icon} value={icon}>{icon}</option>
                                                ))}
                                            </select>

                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={g.name}
                                                    onChange={e => handleDraftChange(g.id, 'name', e.target.value)}
                                                    placeholder="输入奖品名称"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-[13px] font-bold text-slate-500 w-14 text-center shrink-0">售价</div>
                                            <div className="relative flex-1">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                                    <img src="/assets/coin.png" className="w-[1.1em] h-[1.1em]" alt="coin" />
                                                </div>
                                                <input
                                                    type="number"
                                                    value={g.price}
                                                    onChange={e => handleDraftChange(g.id, 'price', parseInt(e.target.value) || 0)}
                                                    placeholder="售价"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-800/95 backdrop-blur-xl text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in zoom-in-95 fill-mode-both duration-300">
                        <CheckCircleIcon className="w-7 h-7 text-green-400" />
                        <span className="font-bold text-[15px]">已成功为学生扣除货币</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RewardVerificationView;
