import React, { useState } from 'react';
import {
    Home, Users, Wallet, CheckCircle, Search,
    Settings, TrendingDown, TrendingUp, AlertTriangle, ShieldCheck
} from 'lucide-react';

// 管理端 - 手机App (班主任/财务可用)
const AdminMobileApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'home' | 'students' | 'audit'>('home');

    return (
        <div className="w-full h-full mx-auto relative overflow-hidden flex flex-col font-sans app-container" style={{ background: 'transparent' }}>
            <div className="phone-mockup border-[8px] border-slate-900 mx-auto bg-slate-50" style={{ height: '850px', maxHeight: '100%', borderRadius: '3rem' }}>
                {/* 顶部手机状态栏 */}
                <div className="h-8 bg-white flex justify-between items-center px-6 text-xs font-bold text-slate-800 shrink-0">
                    <span>14:30</span>
                    <div className="flex gap-1.5 items-center">
                        <div className="w-4 h-3 bg-slate-800 rounded-[2px]"></div>
                        <div className="w-4 h-3 bg-slate-800 rounded-[2px]"></div>
                        <div className="w-5 h-3 bg-slate-800 rounded-sm"></div>
                    </div>
                </div>

                {/* App Header */}
                <header className="bg-white px-6 py-4 shadow-sm shrink-0 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black text-slate-900">财务与激励控制台</h1>
                        <p className="text-xs font-bold text-slate-400">王财务 / 校园总部</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                        <Settings size={20} />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 space-y-4">

                    {/* 全校预算核心指标 */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                        <ShieldCheck size={100} className="absolute -bottom-4 -right-4 text-white/5" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-1">本月全校已发总币量</h2>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-4xl font-black tracking-tighter">42,500</span>
                            <span className="text-indigo-200 font-bold text-sm">/ 50,000 额度</span>
                        </div>

                        <div className="w-full bg-indigo-900/50 h-1.5 rounded-full overflow-hidden mb-2">
                            <div className="bg-green-400 w-[85%] h-full rounded-full"></div>
                        </div>
                        <p className="text-xs font-semibold text-green-300">预警：距离本月预算上限仅剩 15%</p>
                    </div>

                    {/* 特批申请处理 */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-amber-500" /> 待处理大额特批
                            </h3>
                            <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">2 条待办</span>
                        </div>

                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
                                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0">
                                    <img src="https://i.pravatar.cc/150?u=a" className="w-full h-full rounded-full object-cover p-0.5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">王小飞 (三年二班)</p>
                                            <p className="text-xs text-slate-500 mt-0.5">申请奖励 <span className="text-blue-600 font-black">+100 币</span></p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] mt-1 text-slate-400 bg-white p-2 rounded-lg border border-slate-100">
                                        理由：拾金不昧，交还同学丢失的 500 元现金。(张老师 发起)
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <button className="flex-1 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm">同意发放</button>
                                        <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl">驳回申请</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 班主任备用金分配 */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Wallet size={18} className="text-blue-500" /> 班级备用金监控
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800">三年二班 (张老师)</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="w-[90%] h-full bg-red-400"></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-red-500">剩余 10%</span>
                                    </div>
                                </div>
                                <button className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">追补额度</button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800">四年一班 (李老师)</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="w-[40%] h-full bg-green-400"></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-green-500">剩余 60%</span>
                                    </div>
                                </div>
                                <button className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">调整配额</button>
                            </div>
                        </div>
                    </div>

                    {/* 班级发币经济模型配置 */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Settings size={18} className="text-purple-500" /> 虚拟币分配模型配置
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">班级基础发币总池 (月度/币)</label>
                                <input type="number" defaultValue={10000} className="w-full bg-slate-50 focus:bg-white border focus:border-purple-300 outline-none rounded-xl px-4 py-2 text-sm font-black text-slate-800 transition-all shadow-inner" />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">阳光保底池比例</label>
                                    <div className="relative">
                                        <input type="number" defaultValue={30} className="w-full bg-slate-50 focus:bg-white border focus:border-purple-300 outline-none rounded-xl px-4 py-2 text-sm font-black text-slate-800 transition-all shadow-inner" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">排位竞争池比例</label>
                                    <div className="relative">
                                        <input type="number" defaultValue={70} className="w-full bg-slate-50 focus:bg-white border focus:border-purple-300 outline-none rounded-xl px-4 py-2 text-sm font-black text-slate-800 transition-all shadow-inner" />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">对学生公开展示排行榜</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">部分学校可能认为显示全员排行过于敏感</p>
                                </div>
                                <div className="w-12 h-6 bg-purple-500 rounded-full flex items-center p-1 cursor-pointer transition-colors shadow-inner relative">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm transform translate-x-6 transition-transform"></div>
                                </div>
                            </div>

                            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-2">
                                <AlertTriangle size={14} className="text-purple-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-purple-700 leading-snug">采用双池模型：防止单极通胀，保证每班级成员基础参与感，并激发高分同学冲榜动力。</p>
                            </div>

                            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-sm shadow-md active:scale-95 transition-all outline-none">更新全校分配模型</button>
                        </div>
                    </div>

                </main>

                {/* 底部导航栏 */}
                <footer className="bg-white border-t border-slate-100 flex justify-around p-4 pb-6 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10">
                    <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <Home size={22} className={activeTab === 'home' ? 'fill-indigo-100' : ''} />
                        <span className="text-[10px] font-bold">概览</span>
                    </button>
                    <button onClick={() => setActiveTab('students')} className={`flex flex-col items-center gap-1 ${activeTab === 'students' ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <Users size={22} />
                        <span className="text-[10px] font-bold">班级</span>
                    </button>
                    <button onClick={() => setActiveTab('audit')} className={`flex flex-col items-center gap-1 ${activeTab === 'audit' ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <CheckCircle size={22} />
                        <span className="text-[10px] font-bold">审批</span>
                    </button>
                </footer>

                {/* 底部小横条 (iOS Indicator) */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full z-50"></div>
            </div>
        </div>
    );
};

export default AdminMobileApp;
