import React, { useState, useRef } from 'react';
import {
  Landmark, PiggyBank,
  Wallet, FileText, BadgeCheck, ArrowRight, Clock,
  Calendar, Layers, AlertTriangle, CheckCircle2, X, TrendingUp, Sparkles,
  Zap, Lock, Timer, Star, Coins, Info, FileEdit, LayoutGrid
} from 'lucide-react';
import { Student, BankAccount, Deposit } from '../types';
import { BANK_CONFIG } from '../constants';

interface BankViewProps {
  student: Student;
  bank: BankAccount;
  onDeposit: (amount: number, days: number, rate: number, label: string, type: string) => void;
  onWithdrawDeposit: (deposit: Deposit) => void;
  onBack: () => void;
}

const BankView: React.FC<BankViewProps> = ({ student, bank, onDeposit, onWithdrawDeposit }) => {
  const bankBalance = bank.deposits.reduce((acc, dep) => acc + dep.amount, 0);
  // 按照要求：进入校园存单中心，默认选中“签署新存单”
  const [activeTab, setActiveTab] = useState<'deposit' | 'list'>('deposit');
  const [selectedScheme, setSelectedScheme] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState(10);
  const [withdrawConfirmTarget, setWithdrawConfirmTarget] = useState<Deposit | null>(null);
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stepTwoRef = useRef<HTMLDivElement>(null);

  const switchTab = (tab: 'deposit' | 'list') => {
    setActiveTab(tab);
    setIsScrolled(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const calculateProjectedInterest = (amt: number, scheme: any) => {
    if (!scheme) return "0";
    const interest = amt * scheme.rate;
    return interest < 1 ? interest.toFixed(2) : Math.floor(interest).toString();
  };

  const calculateFlexibleInterestForDays = (amt: number, days: number) => {
    const interest = amt * BANK_CONFIG.DAILY_RATE * days;
    return interest < 1 ? interest.toFixed(2) : Math.floor(interest).toString();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getInterestDetails = (dep: Deposit) => {
    const now = Date.now();
    const elapsedDays = Math.max(0, (now - dep.startDate) / 86400000);
    const isMatured = dep.type === 'current' ? true : elapsedDays >= dep.termDays;
    let interest = 0;
    let isPenalty = false;

    if (dep.type === 'current') {
      interest = dep.amount * BANK_CONFIG.DAILY_RATE * elapsedDays;
    } else {
      if (isMatured) {
        interest = dep.amount * dep.interestRate;
      } else {
        interest = dep.amount * BANK_CONFIG.DAILY_RATE * elapsedDays;
        isPenalty = true;
      }
    }

    return {
      interest: Number(interest.toFixed(2)),
      isMatured,
      isPenalty,
      elapsedDays: Math.floor(elapsedDays)
    };
  };

  const handleConfirmDeposit = () => {
    onDeposit(depositAmount, selectedScheme.days, selectedScheme.rate, selectedScheme.label, selectedScheme.type);
    setShowDepositConfirm(false);
    // 签署成功后自动跳转到存单列表查看
    switchTab('list');
  };

  React.useEffect(() => {
    if (selectedScheme && activeTab === 'deposit') {
      // 延迟一点等DOM渲染和展开动画完成再滚动
      setTimeout(() => {
        stepTwoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
    }
  }, [selectedScheme, activeTab]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] p-6 !pb-0 animate-in slide-in-from-right-8 duration-500 overflow-hidden relative">
      {/* 顶部简明与数据区 */}
      <div className={`shrink-0 flex items-center justify-between bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border-2 border-slate-50 z-30 relative transition-all duration-500 origin-top overflow-hidden
        ${isScrolled ? 'mb-0 max-h-0 opacity-0 py-0 px-5 scale-y-90 border-none blur-md' : 'mb-4 max-h-[200px] p-5 opacity-100 scale-y-100 blur-0'}
      `}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-[1.2rem] flex items-center justify-center shadow-inner shrink-0">
            <Landmark className="text-blue-500" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              储蓄银行 <Sparkles className="text-blue-400" size={20} />
            </h2>
            <p className="text-slate-400 font-bold text-[11px] mt-0.5 whitespace-nowrap">聪明理财，财富复利 📈</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-gradient-to-b from-blue-50 to-blue-100/50 px-4 py-2 rounded-2xl border border-blue-200/50 flex flex-col items-end shadow-sm">
            <span className="text-blue-500/80 font-black text-[9px] mb-0.5 tracking-wider">我的存款</span>
            <div className="text-blue-600 font-[NumberFont] font-black text-xl leading-none flex items-center gap-1">
              <img src="/assets/coin.png" className="w-[1em] h-[1em] drop-shadow-sm -translate-y-0.5" alt="coin" />
              {Math.floor(bankBalance)}
            </div>
          </div>
          <div className="bg-gradient-to-b from-orange-50 to-orange-100/50 px-4 py-2 rounded-2xl border border-orange-200/50 flex flex-col items-end shadow-sm">
            <span className="text-orange-500/80 font-black text-[9px] mb-0.5 tracking-wider">钱包余额</span>
            <div className="text-orange-600 font-[NumberFont] font-black text-xl leading-none flex items-center gap-1">
              <img src="/assets/coin.png" className="w-[1em] h-[1em] drop-shadow-sm -translate-y-0.5" alt="coin" />
              {student.campusCoins}
            </div>
          </div>
        </div>
      </div>

      {/* 粘性筛选分类栏 (现改为固定在上方) */}
      <div className={`shrink-0 z-20 bg-[#f8fafc]/90 backdrop-blur-md transition-all duration-300 flex items-center mb-3 ${isScrolled ? 'pt-0 pb-2 gap-3' : 'pt-2 pb-2'}`}>

        {/* 滑动后简易版头部（淡入淡出，堆叠更紧凑展示避免挤压） */}
        <div className={`flex items-center justify-center bg-white shadow-sm border border-slate-100 rounded-2xl transition-all duration-500 overflow-hidden whitespace-nowrap
          ${isScrolled ? 'opacity-100 w-[120px] px-3 py-1.5 translate-x-0' : 'opacity-0 w-0 px-0 py-1.5 -translate-x-10 border-none'}`}>
          <div className="flex flex-col w-full gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-blue-400 font-black">存款</span>
              <div className="flex items-center gap-0.5 text-blue-600 font-black font-[NumberFont] text-[13px] leading-none">
                <img src="/assets/coin.png" className="w-[0.9em] h-[0.9em]" alt="coin" /> {Math.floor(bankBalance)}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-orange-400 font-black">钱包</span>
              <div className="flex items-center gap-0.5 text-orange-600 font-black font-[NumberFont] text-[13px] leading-none">
                <img src="/assets/coin.png" className="w-[0.9em] h-[0.9em]" alt="coin" /> {student.campusCoins}
              </div>
            </div>
          </div>
        </div>

        <div className={`flex bg-slate-200/50 p-1.5 rounded-2xl backdrop-blur-md border border-slate-200/50 relative w-full transition-all duration-300 flex-1 overflow-hidden`}>
          <button
            onClick={() => switchTab('deposit')}
            className={`flex-1 mx-0.5 rounded-[1rem] font-black transition-all active:scale-95 flex items-center justify-center border whitespace-nowrap overflow-hidden ${isScrolled ? 'py-2.5 text-xs' : 'py-3 text-sm'} ${activeTab === 'deposit' ? 'bg-white text-blue-600 shadow-sm border-blue-50' : 'text-slate-500 border-transparent'}`}
          >
            <div className={`transition-all duration-300 flex items-center justify-center ${isScrolled ? 'w-0 opacity-0 mr-0 scale-50' : 'w-4 opacity-100 mr-1.5 scale-100'}`}>
              <PiggyBank size={16} />
            </div>
            签署新存单
          </button>
          <button
            onClick={() => switchTab('list')}
            className={`flex-1 mx-0.5 rounded-[1rem] font-black transition-all active:scale-95 flex items-center justify-center border whitespace-nowrap overflow-hidden ${isScrolled ? 'py-2.5 text-xs' : 'py-3 text-sm'} ${activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm border-indigo-50' : 'text-slate-500 border-transparent'}`}
          >
            <div className={`transition-all duration-300 flex items-center justify-center ${isScrolled ? 'w-0 opacity-0 mr-0 scale-50' : 'w-4 opacity-100 mr-1.5 scale-100'}`}>
              <FileText size={16} />
            </div>
            我的存单
            {bank.deposits.length > 0 && (
              <span className={`transition-all duration-300 rounded-full text-[9px] text-white flex items-center justify-center ${isScrolled ? 'ml-1 px-1 py-0.5 scale-90' : 'ml-1.5 px-1.5 py-0.5 scale-100'} ${activeTab === 'list' ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                {bank.deposits.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 视图内容区 - 正式滚动区 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-12 custom-scrollbar relative max-w-5xl mx-auto w-full"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const st = target.scrollTop;
          setIsScrolled(prev => {
            if (!prev) {
              const availableScroll = target.scrollHeight - target.clientHeight;
              if (st > 30 && availableScroll > 200) return true;
            } else {
              if (st <= 5) return false;
            }
            return prev;
          });
        }}
      >
        <div key={activeTab} className="animate-in fade-in zoom-in-[0.98] duration-500 ease-out fill-mode-both">
          {activeTab === 'deposit' ? (
            <div className="flex flex-col gap-4">
              {/* 第一步：选择区域 */}
              <div className="bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border-2 border-slate-50 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                      <LayoutGrid size={18} />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">第一步：选择存钱计划</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-2">
                    {BANK_CONFIG.TERMS.map((scheme, idx) => {
                      const isCurrent = scheme.type === 'current';
                      const isSelected = selectedScheme === scheme;
                      const Icon = isCurrent ? Zap : (scheme.days <= 7 ? Timer : (scheme.days <= 30 ? Calendar : (scheme.days <= 180 ? Layers : Star)));
                      const termLabel = isCurrent ? '随存随取' : `需存满 ${scheme.days} 天`;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedScheme(scheme);
                            if (depositAmount < scheme.min) setDepositAmount(scheme.min);
                          }}
                          className={`relative p-3 rounded-[1.5rem] border-2 flex flex-col items-center transition-all ${isSelected
                            ? (isCurrent ? 'border-green-500 bg-green-50' : 'border-indigo-500 bg-indigo-50')
                            : (isCurrent ? 'border-green-100 bg-white' : 'border-blue-100 bg-white')
                            }`}
                        >
                          <div className="flex flex-col items-center mb-2">
                            <div className={`p-2 rounded-xl mb-2 ${isSelected ? (isCurrent ? 'bg-green-500 text-white' : 'bg-indigo-500 text-white') : (isCurrent ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-400')}`}>
                              <Icon size={16} />
                            </div>
                            <span className={`text-[13px] font-black tracking-tight mb-1 ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                              {scheme.label}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isSelected ? (isCurrent ? 'bg-green-200 text-green-800' : 'bg-indigo-200 text-indigo-800') : 'bg-blue-50 text-blue-300'}`}>
                              {termLabel}
                            </span>
                          </div>
                          <div className={`text-2xl font-black ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                            {isCurrent ? '日计息' : `${Math.round(scheme.rate * 100)}%`}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                </div>
              </div>

              {selectedScheme && (
                <div ref={stepTwoRef} className="bg-white rounded-[2rem] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border-2 border-slate-50 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                        <Coins size={18} />
                      </div>
                      <h3 className="text-xl font-black text-gray-800 tracking-tight">第二步：确认金额与收益</h3>
                    </div>

                    <div className="flex flex-col bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[11px] font-black text-slate-400">滑动滑块调整存款金额</span>
                          <div className={`px-4 py-1.5 rounded-xl shadow-inner border ${selectedScheme.type === 'current' ? 'text-green-600 border-green-200 bg-green-50/50' : 'text-indigo-600 border-indigo-200 bg-indigo-50/50'} font-[NumberFont] font-black text-xl`}>
                            {depositAmount}
                          </div>
                        </div>
                        <div>
                          <input
                            type="range" min="1" max={Math.max(1, student.campusCoins)} step="1"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(parseInt(e.target.value))}
                            className={`w-full h-3 rounded-full appearance-none cursor-pointer ${selectedScheme.type === 'current' ? 'bg-green-100 accent-green-500' : 'bg-indigo-100 accent-indigo-600'}`}
                          />
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                            <span>1</span>
                            <span>最大可用 {Math.max(1, student.campusCoins)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-center mb-4">
                        {selectedScheme.type === 'current' ? (
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: '1周后', days: 7 },
                              { label: '1月后', days: 30 },
                              { label: '半年后', days: 180 },
                              { label: '1年后', days: 365 }
                            ].map((period, pIdx) => (
                              <div key={pIdx} className="bg-white p-2 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                                <span className="text-[9px] font-black text-slate-400 mb-0.5">{period.label}</span>
                                <span className="text-xs font-[NumberFont] font-black text-green-600">+{calculateFlexibleInterestForDays(depositAmount, period.days)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-start mx-1">
                            <Info className="text-indigo-400 shrink-0 mt-0.5 mr-2" size={14} />
                            <div className="flex flex-col">
                              <p className="text-[11px] font-bold text-indigo-400/90 leading-snug">
                                需存满 <span className="text-indigo-600 text-xs font-black">{selectedScheme.days}天</span> 才能获得最高收益。若提前取出，按最低活期计算。
                              </p>
                              <p className="text-[9px] font-black text-indigo-500 mt-1 opacity-80">
                                预计到期时间：{formatDate(Date.now() + selectedScheme.days * 86400000)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 tracking-wider">
                            {selectedScheme.type === 'current' ? '收益率' : '满期固定利息'}
                          </span>
                          <span className={`text-xl font-[NumberFont] font-black ${selectedScheme.type === 'current' ? 'text-green-500' : 'text-indigo-500'}`}>
                            +{calculateProjectedInterest(depositAmount, selectedScheme)}
                          </span>
                        </div>

                        <button
                          onClick={() => setShowDepositConfirm(true)}
                          disabled={student.campusCoins < depositAmount || depositAmount <= 0}
                          className={`px-8 py-3 rounded-2xl text-white font-black text-[13px] shadow-md transition-all active:scale-95 disabled:opacity-30 flex items-center gap-1 ${selectedScheme.type === 'current' ? 'bg-green-500 shadow-green-200' : 'bg-indigo-500 shadow-indigo-200'}`}
                        >
                          签署存单 <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* 我的存单列表视图 */}
              {bank.deposits.length === 0 ? (
                <div className="bg-white rounded-[3rem] py-32 text-center border-4 border-dashed border-gray-100 flex flex-col items-center shadow-inner">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Clock size={48} className="text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-black text-2xl tracking-tight">还没有存单呢</p>
                  <button
                    onClick={() => switchTab('deposit')}
                    className="mt-8 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
                  >
                    去签署第一份存单 ✍️
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 pb-20">
                  {bank.deposits.map(dep => {
                    const details = getInterestDetails(dep);
                    const progress = dep.type === 'current' ? 100 : Math.min(100, (details.elapsedDays / dep.termDays) * 100);
                    const certId = dep.id.split('_')[1].toUpperCase();
                    const maturityDate = dep.startDate + dep.termDays * 86400000;

                    return (
                      <div key={dep.id} className="relative flex flex-col group">
                        <div className={`absolute inset-0 rounded-[2rem] transform translate-y-2 translate-x-1 transition-transform ${dep.type === 'current' ? 'bg-green-200/50' : 'bg-indigo-200/50'}`}></div>
                        <div className={`relative bg-white rounded-[2rem] p-5 border-2 transition-all flex flex-col h-full shadow-sm ${dep.type === 'current' ? 'border-green-300' : (details.isMatured ? 'border-indigo-500 shadow-indigo-100' : 'border-indigo-100')
                          }`}>
                          <div className="flex justify-between items-start mb-4 border-b border-dashed border-gray-100 pb-4">
                            <div>
                              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${dep.type === 'current' ? 'text-green-500' : 'text-indigo-400'}`}>
                                {dep.type === 'current' ? '活期存单' : '定期存单'}
                              </div>
                              <div className="text-xl font-black text-gray-800 flex items-center gap-2">
                                {dep.label} <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[9px] text-gray-400 font-medium">编号:{certId}</span>
                              </div>
                            </div>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${details.isMatured ? (dep.type === 'current' ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white') : 'bg-gray-50 text-gray-300'
                              }`}>
                              {details.isMatured ? <BadgeCheck size={20} /> : <Clock size={20} />}
                            </div>
                          </div>

                          <div className="space-y-4 mb-6 flex-1">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[11px] text-gray-400 font-black mb-1">存入本金</p>
                                <p className="text-3xl font-black text-gray-800 tracking-tighter"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> {dep.amount}</p>
                              </div>
                              <div className="flex flex-col gap-1 items-end bg-slate-50/50 px-4 py-2 rounded-xl border border-slate-50">
                                <p className="text-[10px] text-gray-400 font-black">已得利息</p>
                                <p className={`text-xl font-[NumberFont] font-black flex items-center gap-1 ${dep.type === 'current' ? 'text-green-600' : 'text-indigo-600'}`}>
                                  <img src="/assets/coin.png" className="w-[0.9em] h-[0.9em] -translate-y-[1px]" alt="coin" />
                                  +{details.interest}
                                </p>
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center text-xs font-bold text-gray-500">
                              <div className="flex items-center space-x-2">
                                <Calendar size={14} className="text-gray-400" />
                                <span>已存时长: {details.elapsedDays} 天</span>
                              </div>
                            </div>
                            {dep.type === 'fixed' && (
                              <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-[10px] font-black text-gray-400 tracking-tight">
                                    <span>存钱进度</span>
                                    <span>{Math.floor(progress)}%</span>
                                  </div>
                                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-1000 ${details.isMatured ? 'bg-indigo-600' : 'bg-indigo-300'}`}
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {!details.isMatured && (
                                  <div className="bg-blue-50/50 rounded-2xl p-4 flex justify-between items-center text-[11px] font-black text-blue-600 border border-blue-100/50 border-dashed">
                                    <div className="flex items-center space-x-2">
                                      <Calendar size={14} className="text-blue-400" />
                                      <span className="opacity-70">预计到期日期</span>
                                    </div>
                                    <span>{formatDate(maturityDate)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setWithdrawConfirmTarget(dep)}
                            className={`w-full py-4 rounded-xl text-sm font-black transition-all shadow-sm active:translate-y-1 ${details.isMatured
                              ? (dep.type === 'current' ? 'bg-green-500 text-white shadow-green-100' : 'bg-indigo-500 text-white shadow-indigo-100')
                              : 'bg-white text-gray-500 border-2 border-gray-100'
                              }`}
                          >
                            {details.isMatured ? (
                              <div className="flex items-center justify-center space-x-2">
                                <span>取出财富</span>
                                <ArrowRight size={16} />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <AlertTriangle size={14} />
                                <span>提前取出</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 签署确认弹窗 */}
      {showDepositConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl border-8 border-white animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${selectedScheme.type === 'current' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                <FileEdit size={48} />
              </div>
              <button onClick={() => setShowDepositConfirm(false)} className="p-3 text-slate-300 active:text-slate-500">
                <X size={32} />
              </button>
            </div>

            <h2 className="text-4xl font-black text-slate-900 mb-2">确认签署这份存单？</h2>
            <p className="text-slate-500 font-bold mb-6">请检查你的签署信息，确认后将扣除相应校园币。</p>

            <div className="bg-slate-50 rounded-[2.5rem] p-8 mb-8 space-y-4 border border-slate-100 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-black">签署计划</span>
                <span className={`px-4 py-1.5 rounded-xl font-black text-sm ${selectedScheme.type === 'current' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>{selectedScheme.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-black">投入本金</span>
                <span className="text-xl font-black text-slate-800 tracking-tight"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> {depositAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-black">预期利息</span>
                <span className={`text-xl font-black ${selectedScheme.type === 'current' ? 'text-green-600' : 'text-indigo-600'}`}>
                  <img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> +{calculateProjectedInterest(depositAmount, selectedScheme)}
                </span>
              </div>
              {selectedScheme.type === 'fixed' && (
                <div className="pt-4 mt-4 border-t border-slate-200 border-dashed">
                  <div className="flex items-center space-x-2 text-indigo-500 font-black text-sm">
                    <Calendar size={16} />
                    <span>到期时间：{formatDate(Date.now() + selectedScheme.days * 86400000)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium italic">* 到期前取出将无法获得全部收益</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDepositConfirm(false)}
                className="flex-1 py-6 rounded-[2rem] bg-slate-100 text-slate-600 font-black text-xl active:bg-slate-200 transition-all"
              >
                我再想想
              </button>
              <button
                onClick={handleConfirmDeposit}
                className={`flex-1 py-6 rounded-[2rem] text-white font-black text-xl shadow-xl transition-all active:scale-95 ${selectedScheme.type === 'current' ? 'bg-green-600 shadow-green-100' : 'bg-indigo-600 shadow-indigo-100'
                  }`}
              >
                确认签署
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 取款确认 */}
      {withdrawConfirmTarget && (() => {
        const details = getInterestDetails(withdrawConfirmTarget);
        return (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl border-8 border-white animate-in zoom-in-95">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${details.isPenalty ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                  }`}>
                  {details.isPenalty ? <AlertTriangle size={48} /> : <CheckCircle2 size={48} />}
                </div>
                <button onClick={() => setWithdrawConfirmTarget(null)} className="p-3 text-slate-300 active:text-slate-500">
                  <X size={32} />
                </button>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">你要取走这笔钱吗？</h2>
              {details.isPenalty && (
                <div className="mb-6 p-5 bg-yellow-50 border-2 border-yellow-100 rounded-[2rem] flex items-start space-x-4">
                  <AlertTriangle className="text-yellow-600 shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-black text-yellow-800 text-lg">还没到期哦！</h4>
                    <p className="text-yellow-700 text-sm mt-1 leading-relaxed">
                      现在取出，收益会按最少的活期算。再坚持一下，就能拿更多奖励啦！
                    </p>
                  </div>
                </div>
              )}
              <div className="bg-slate-50 rounded-[2.5rem] p-8 mb-8 space-y-4">
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>拿回本金</span>
                  <span className="text-slate-900 font-black"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> {withdrawConfirmTarget.amount}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>结算利息</span>
                  <span className={`font-black ${details.isPenalty ? 'text-yellow-600' : 'text-green-600'}`}>
                    <img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> +{details.interest}
                  </span>
                </div>
                <div className="h-px bg-slate-200 border-dashed border-t my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-black text-slate-900">到账总额</span>
                  <span className="text-4xl font-black text-indigo-600 tracking-tighter">
                    <img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> {Math.round(withdrawConfirmTarget.amount + details.interest)}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setWithdrawConfirmTarget(null)}
                  className="flex-1 py-6 rounded-[2rem] bg-slate-100 text-slate-600 font-black text-xl active:bg-slate-200"
                >
                  继续存着
                </button>
                <button
                  onClick={() => {
                    onWithdrawDeposit(withdrawConfirmTarget);
                    setWithdrawConfirmTarget(null);
                  }}
                  className={`flex-1 py-6 rounded-[2rem] text-white font-black text-xl shadow-xl transition-all active:scale-95 ${details.isPenalty ? 'bg-yellow-600 shadow-yellow-200' : 'bg-green-600 shadow-green-200'
                    }`}
                >
                  确认取走
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default BankView;
