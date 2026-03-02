import React, { useState } from 'react';
import { HelpIcon, CheckCircleIcon, TrophyIcon } from '../components/Icons';

interface RecordResultViewProps {
    initialResult: any;
    onSave: () => void;
    onCancel: () => void;
}

const RecordResultView: React.FC<RecordResultViewProps> = ({ initialResult, onSave, onCancel }) => {
    // Mock State for the form
    const [desc, setDesc] = useState(initialResult.text || "今天数学课，大家表现都很积极，主动回答问题。");
    const [score, setScore] = useState(2);
    const [selectedIndicator, setSelectedIndicator] = useState("智育 > 学习态度 > 课堂表现");

    // Example Certificate Mock Data if mode was camera
    const isCertificate = initialResult.type === 'camera';

    return (
        <div className="flex flex-col h-full bg-[#F0F4F8] pt-safe">
            {/* Header */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                <button onClick={onCancel} className="text-slate-500 font-medium">取消</button>
                <h1 className="text-lg font-bold text-slate-900">确认记录</h1>
                <button onClick={onSave} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-700">提交</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* AI Summary Banner */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
                    <div className="mt-1"><CheckCircleIcon className="w-5 h-5 text-indigo-600" /></div>
                    <div>
                        <h3 className="text-sm font-bold text-indigo-900 mb-1">AI 智能分析完成</h3>
                        <p className="text-xs text-indigo-700 leading-relaxed">
                            已自动识别学生、时间和事件类型。请核对下方信息，支持点击修改。
                        </p>
                    </div>
                </div>

                {/* Certificate Specific Fields */}
                {isCertificate && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                            <TrophyIcon className="w-4 h-4" /> 证书识别结果
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs text-slate-400 block mb-1">赛事名称</label>
                                <input type="text" defaultValue="第十五届全国青少年科技创新大赛" className="w-full text-sm font-semibold border-b border-slate-200 pb-1 focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">奖项等级</label>
                                <input type="text" defaultValue="一等奖" className="w-full text-sm font-semibold border-b border-slate-200 pb-1 focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">获奖时间</label>
                                <input type="text" defaultValue="2025-09-10" className="w-full text-sm font-semibold border-b border-slate-200 pb-1 focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-50">
                        <label className="block text-sm font-bold text-slate-700 mb-2">涉及学生</label>
                        <div className="flex flex-wrap gap-2">
                            {(initialResult.mockStudents || ['1', '2']).map((id: string) => (
                                <span key={id} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                    {id === '1' ? '林小杰' : '林云溪'}
                                    <button className="text-slate-400 hover:text-slate-600">×</button>
                                </span>
                            ))}
                            <button className="border border-dashed border-slate-300 text-slate-400 px-3 py-1 rounded-full text-sm hover:border-blue-400 hover:text-blue-500">+ 添加</button>
                        </div>
                    </div>

                    <div className="p-4 border-b border-slate-50">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-slate-700">五育指标</label>
                            <button className="text-xs text-blue-600 flex items-center gap-1">
                                <HelpIcon className="w-3 h-3" /> 指标说明
                            </button>
                        </div>
                        <div
                            className="w-full p-3 bg-slate-50 rounded-lg text-sm text-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-100"
                            onClick={() => {/* Open tree selector */ }}
                        >
                            <span>{selectedIndicator}</span>
                            <span className="text-slate-400">›</span>
                        </div>
                    </div>

                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                        <label className="block text-sm font-bold text-slate-700">加减分值</label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setScore(s => s - 1)}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
                            >-</button>
                            <span className={`text-xl font-bold ${score > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {score > 0 ? `+${score}` : score}
                            </span>
                            <button
                                onClick={() => setScore(s => s + 1)}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50"
                            >+</button>
                        </div>
                    </div>

                    <div className="p-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">事件描述 / 评语</label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full p-3 bg-slate-50 rounded-lg text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px]"
                        />
                        <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                            <span className="text-xs font-bold text-yellow-700 block mb-1">AI 建议评语：</span>
                            <p className="text-xs text-yellow-800">
                                该生在数学课堂上展现出极高的专注度，积极思考并踊跃发言，起到了良好的带头作用，值得表扬！
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RecordResultView;
