
import React from 'react';
import {
  Coins, ShoppingBag, Landmark, ArrowRightLeft, Sparkles,
  Zap, ChevronRight, LogOut
} from 'lucide-react';
import { Student } from '../types';

interface DashboardProps {
  student: Student;
  onNavigate: (view: any) => void;
  bankBalance: number;
  layout?: 'mobile' | 'pc';
  hideShop?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ student, onNavigate, bankBalance, layout = 'mobile', hideShop = false }) => {
  const formatCoin = (val: number) => Number.isInteger(val) ? val : parseFloat(val.toFixed(2));
  
  return (
    <div className={`h-full flex flex-col animate-in fade-in slide-in-from-left-8 duration-300 ease-out bg-[#f8fbff] tracking-tight ${layout === 'pc' ? 'overflow-y-auto' : 'overflow-hidden'}`}>

      {/* 顶部：用户信息与退出按钮 */}
      <div className={`w-full bg-white p-6 border-b-2 border-blue-50 shrink-0 ${layout === 'pc' ? 'shadow-sm z-10' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl border-2 border-blue-50 p-0.5 bg-white shadow-lg overflow-hidden shrink-0 ${layout === 'pc' ? 'w-20 h-20' : 'w-16 h-16'}`}>
              <img src={student.avatar} alt="头像" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h1 className={`${layout === 'pc' ? 'text-3xl' : 'text-2xl'} font-black text-slate-900 tracking-tight`}>你好，{student.name}！</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{student.class}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('welcome')}
            className={`${layout === 'pc' ? 'w-16 h-16 rounded-3xl' : 'w-12 h-12 rounded-2xl'} flex items-center justify-center bg-red-50 text-red-500 active:scale-90 transition-all`}
            title="退出系统"
          >
            <LogOut size={layout === 'pc' ? 32 : 24} />
          </button>
        </div>

        {/* 资产与成长概览 (使用非对称网格比例) */}
        <div className={`grid gap-4 ${layout === 'pc' ? 'grid-cols-2' : 'grid-cols-12'}`}>

          <div className={`${layout === 'pc' ? 'col-span-1' : 'col-span-7'} bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-center`}>
            <div className="relative z-10 flex flex-col justify-between w-full h-full">
              <div className="flex justify-between items-start w-full">
                <div className="flex flex-col">
                  <p className="text-blue-100 font-black text-[10px] uppercase tracking-widest opacity-90 mb-0.5">我的总资产</p>
                  <h3 className="text-4xl font-black tracking-tighter leading-none mb-1 flex items-center">
                    <img src="/assets/coin.png" className="inline-block w-[1em] h-[1em] drop-shadow-sm mr-1.5" alt="coin" /> 
                    {formatCoin(student.campusCoins + bankBalance)}
                  </h3>
                </div>
                <button onClick={() => onNavigate('transactions')} className="text-[11px] bg-white/20 active:bg-white/30 text-white px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors backdrop-blur-sm border border-white/10 font-bold shadow-sm whitespace-nowrap mt-1 -mr-2">
                  流水明细 <ChevronRight size={12} strokeWidth={3} />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full mt-3">
                <div className="flex items-center text-xs bg-black/10 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/20 shadow-inner">
                  <span className="opacity-80 font-bold mr-1.5 text-white">钱包</span>
                  <span className="font-bold tracking-tight inline-flex items-center text-white">
                    <img src="/assets/coin.png" className="w-[1.1em] h-[1.1em] -mt-[1px] mr-1 opacity-90" alt="coin" />
                    {formatCoin(student.campusCoins)}
                  </span>
                </div>
                <div className="flex items-center text-xs bg-black/10 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/20 shadow-inner">
                  <span className="opacity-80 font-bold mr-1.5 text-white">存款</span>
                  <span className="font-bold tracking-tight inline-flex items-center text-white">
                    <img src="/assets/coin.png" className="w-[1.1em] h-[1.1em] -mt-[1px] mr-1 opacity-90" alt="coin" />
                    {formatCoin(bankBalance)}
                  </span>
                </div>
              </div>
            </div>

            <Coins size={100} className="absolute -bottom-6 -right-6 text-white/10 pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <Sparkles className="absolute top-[10%] left-[10%] text-yellow-300 w-3 h-3 opacity-0 particle-1" />
              <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-white rounded-full opacity-0 particle-2 shadow-[0_0_10px_#fff]"></div>
              <Sparkles className="absolute bottom-[20%] left-[80%] text-pink-300 w-4 h-4 opacity-0 particle-3" />
            </div>
          </div>

          <div
            className={`${layout === 'pc' ? 'col-span-1' : 'col-span-5'} bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-center items-start text-left`}
          >
            <div className="relative z-10 w-full mb-1">
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">当前成长阶段</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">稳步成长</h3>
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100 opacity-90">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5 tracking-tight">本月净得分</span>
                  <span className="text-lg font-black text-blue-500 leading-none">45<span className="text-[10px] font-bold ml-1 text-slate-400">分</span></span>
                </div>
                <div className="w-px h-6 bg-slate-200 shrink-0"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 mb-0.5 tracking-tight">预估月度分红</span>
                  <span className="text-lg font-black text-orange-500 inline-flex items-center leading-none"><img src="/assets/coin.png" className="w-[1em] h-[1em] mr-1 -mt-[2px]" alt="coin" /> 90.88</span>
                </div>
              </div>
            </div>
            <Sparkles size={80} className="absolute -bottom-6 -right-6 text-slate-50 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 功能主要入口区 */}
      <div className={`flex-1 ${layout === 'pc' ? 'p-10' : 'overflow-y-auto p-6 pt-4'} custom-scrollbar`}>
        <div className={`grid gap-6 ${layout === 'pc' ? 'grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 space-y-4'}`}>
          <ActionCard
            imageSrc="/assets/c4d_growth.png"
            label="成长足迹中心"
            desc="记录点滴进步，每月结算奖励"
            theme="orange"
            layout={layout}
            onClick={() => onNavigate('growth')}
          />

          {!hideShop && (
            <ActionCard
              imageSrc="/assets/c4d_shop.png"
              label="文创星光超市"
              desc="把努力变成奖励，海量商品兑换"
              theme="pink"
              layout={layout}
              onClick={() => onNavigate('shop')}
            />
          )}

          <ActionCard
            imageSrc="/assets/c4d_bank.png"
            label="博学储蓄银行"
            desc="将资产存入银行，赚取高额利息"
            theme="blue"
            layout={layout}
            onClick={() => onNavigate('bank')}
          />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        @keyframes floating-particle {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-80px) scale(0) rotate(360deg); opacity: 0; }
        }
        
        .particle-1 { animation: floating-particle 4s ease-in-out infinite; }
        .particle-2 { animation: floating-particle 5s ease-in-out infinite 1.2s; }
        .particle-3 { animation: floating-particle 3.5s ease-in-out infinite 2.5s; }
        .particle-4 { animation: floating-particle 4.5s ease-in-out infinite 0.5s; }
      `}</style>
    </div>
  );
};

const ActionCard: React.FC<{
  imageSrc: string,
  label: string,
  desc: string,
  theme: 'orange' | 'pink' | 'blue',
  layout?: 'mobile' | 'pc',
  onClick: () => void
}> = ({ imageSrc, label, desc, theme, layout = 'mobile', onClick }) => {
  const configs = {
    orange: { bg: 'bg-orange-500', lightBg: 'bg-orange-50', text: 'text-orange-600', blob: 'bg-orange-100', border: 'border-orange-100', ring: 'ring-orange-100' },
    pink: { bg: 'bg-pink-500', lightBg: 'bg-pink-50', text: 'text-pink-600', blob: 'bg-pink-100', border: 'border-pink-100', ring: 'ring-pink-100' },
    blue: { bg: 'bg-blue-500', lightBg: 'bg-blue-50', text: 'text-blue-600', blob: 'bg-blue-100', border: 'border-blue-100', ring: 'ring-blue-100' },
  };

  const ctx = configs[theme];

  return (
    <button
      onClick={onClick}
      className={`relative w-full overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-2 border-slate-50 transition-all active:scale-[0.98] active:border-slate-100 flex items-center text-left gap-5 group ${layout === 'pc' ? 'flex-col items-center justify-center p-10 h-72' : ''}`}
    >
      {/* 质感装饰玻璃球背景 */}
      <div className={`absolute -right-8 -top-8 w-40 h-40 ${ctx.lightBg} rounded-full mix-blend-multiply opacity-50 transition-transform duration-500 group-active:scale-110 pointer-events-none`}></div>
      <div className={`absolute right-12 -bottom-10 w-24 h-24 ${ctx.blob} rounded-full mix-blend-multiply opacity-40 transition-transform duration-500 group-active:-translate-x-4 pointer-events-none`}></div>

      {/* 左侧超大高定立体光影Icon区 */}
      <div className={`relative z-10 ${layout === 'pc' ? 'w-32 h-32 mb-4' : 'w-20 h-20'} rounded-[1.5rem] ${ctx.lightBg} ${ctx.text} flex items-center justify-center shadow-inner shrink-0 transition-transform duration-300 group-active:scale-95 ring-4 ring-white overflow-hidden`}>
        <img src={imageSrc} className={`${layout === 'pc' ? 'w-24 h-24' : 'w-16 h-16'} object-contain drop-shadow-sm transition-transform duration-500 group-active:scale-110`} alt="" />
      </div>

      {/* 文本内容区 */}
      <div className={`flex flex-col flex-1 relative z-10 ${layout === 'pc' ? 'items-center text-center' : ''}`}>
        <h3 className={`font-black text-slate-800 leading-tight tracking-tight ${layout === 'pc' ? 'text-3xl mb-2' : 'text-[22px] mb-1'}`}>{label}</h3>
        <p className={`font-bold opacity-90 ${layout === 'pc' ? 'text-slate-500 text-sm' : 'text-slate-400 text-xs'}`}>{desc}</p>
      </div>

      {/* 右侧箭头 */}
      {layout !== 'pc' && (
        <div className={`relative z-10 w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center ${ctx.text} group-active:bg-slate-50 transition-colors`}>
          <ChevronRight size={24} className="transition-transform group-active:translate-x-1" />
        </div>
      )}
    </button>
  );
};

export default Dashboard;
