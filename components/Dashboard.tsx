
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
}

const Dashboard: React.FC<DashboardProps> = ({ student, onNavigate, bankBalance }) => {
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700 bg-[#f8fbff] overflow-hidden tracking-tight">

      {/* 顶部：用户信息与退出按钮 */}
      <div className="w-full bg-white p-6 border-b-2 border-blue-50 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl border-2 border-blue-50 p-0.5 bg-white shadow-lg overflow-hidden shrink-0">
              <img src={student.avatar} alt="头像" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">你好，{student.name}！</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{student.class}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('welcome')}
            className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-all"
            title="退出系统"
          >
            <LogOut size={24} />
          </button>
        </div>

        {/* 资产与成长概览 (使用非对称网格比例) */}
        <div className="grid grid-cols-12 gap-4">

          <div className="col-span-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10 flex flex-col items-start w-full">
              <p className="text-blue-100 font-black text-[10px] uppercase tracking-widest mb-1 opacity-90">我的总资产</p>

              <div className="flex items-end gap-3 w-full mb-1">
                <h3 className="text-4xl font-black tracking-tighter leading-none"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[2px]" alt="coin" /> {student.campusCoins + bankBalance}</h3>

                {/* 拆解项跟随在总资产侧边 */}
                <div className="flex flex-col gap-0.5 pb-0.5">
                  <div className="flex items-center text-[10px] bg-white/10 rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/10">
                    <span className="opacity-70 font-bold mr-1">钱包</span>
                    <span className="font-bold tracking-tight inline-flex items-center"><img src="/assets/coin.png" className="w-[1em] h-[1em] -mt-[1px] mr-0.5 opacity-80" alt="coin" /> {student.campusCoins}</span>
                  </div>
                  <div className="flex items-center text-[10px] bg-white/10 rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/10">
                    <span className="opacity-70 font-bold mr-1">存款</span>
                    <span className="font-bold tracking-tight inline-flex items-center"><img src="/assets/coin.png" className="w-[1em] h-[1em] -mt-[1px] mr-0.5 opacity-80" alt="coin" /> {bankBalance}</span>
                  </div>
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

          <button
            onClick={() => onNavigate('growth')}
            className="col-span-5 bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-center items-start text-left active:scale-[0.98] transition-all group"
          >
            <div className="relative z-10 w-full mb-2">
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">当前成长阶段</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">🙂 稳步成长</h3>
              <div className="mt-1 flex items-center gap-1.5 opacity-80">
                <span className="text-[10px] font-bold text-slate-500">预估月度分红:</span>
                <span className="text-xs font-black text-orange-500 inline-flex items-center"><img src="/assets/coin.png" className="w-[1em] h-[1em] mr-0.5 -mt-[1px]" alt="coin" /> 145 币</span>
              </div>
            </div>
            <Sparkles size={80} className="absolute -bottom-6 -right-6 text-slate-50 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* 功能主要入口区 */}
      <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
        <div className="space-y-4">
          <ActionCard
            imageSrc="/assets/c4d_growth.png"
            label="成长足迹中心"
            desc="记录点滴进步，每月结算奖励"
            theme="orange"
            onClick={() => onNavigate('growth')}
          />

          <ActionCard
            imageSrc="/assets/c4d_shop.png"
            label="文创星光超市"
            desc="把努力变成奖励，海量商品兑换"
            theme="pink"
            onClick={() => onNavigate('shop')}
          />

          <ActionCard
            imageSrc="/assets/c4d_bank.png"
            label="博学储蓄银行"
            desc="将资产存入银行，赚取高额利息"
            theme="blue"
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
  onClick: () => void
}> = ({ imageSrc, label, desc, theme, onClick }) => {
  const configs = {
    orange: { bg: 'bg-orange-500', lightBg: 'bg-orange-50', text: 'text-orange-600', blob: 'bg-orange-100', border: 'border-orange-100', ring: 'ring-orange-100' },
    pink: { bg: 'bg-pink-500', lightBg: 'bg-pink-50', text: 'text-pink-600', blob: 'bg-pink-100', border: 'border-pink-100', ring: 'ring-pink-100' },
    blue: { bg: 'bg-blue-500', lightBg: 'bg-blue-50', text: 'text-blue-600', blob: 'bg-blue-100', border: 'border-blue-100', ring: 'ring-blue-100' },
  };

  const ctx = configs[theme];

  return (
    <button
      onClick={onClick}
      className={`relative w-full overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-2 border-slate-50 transition-all active:scale-[0.98] flex items-center text-left gap-5 group hover:border-slate-100`}
    >
      {/* 质感装饰玻璃球背景 */}
      <div className={`absolute -right-8 -top-8 w-40 h-40 ${ctx.lightBg} rounded-full mix-blend-multiply opacity-50 transition-transform duration-500 group-active:scale-110 pointer-events-none`}></div>
      <div className={`absolute right-12 -bottom-10 w-24 h-24 ${ctx.blob} rounded-full mix-blend-multiply opacity-40 transition-transform duration-500 group-active:-translate-x-4 pointer-events-none`}></div>

      {/* 左侧超大高定立体光影Icon区 */}
      <div className={`relative z-10 w-20 h-20 rounded-[1.5rem] ${ctx.lightBg} ${ctx.text} flex items-center justify-center shadow-inner shrink-0 transition-transform duration-300 group-active:scale-95 group-active:-rotate-6 ring-4 ring-white overflow-hidden`}>
        <img src={imageSrc} className="w-16 h-16 object-contain drop-shadow-sm transition-transform duration-500 group-active:scale-110" alt="" />
      </div>

      {/* 文本内容区 */}
      <div className="flex flex-col flex-1 relative z-10">
        <h3 className="text-[22px] font-black text-slate-800 leading-tight mb-1 tracking-tight">{label}</h3>
        <p className="text-slate-400 font-bold text-xs opacity-90">{desc}</p>
      </div>

      {/* 右侧箭头 */}
      <div className={`relative z-10 w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center ${ctx.text} group-active:bg-slate-50 transition-colors`}>
        <ChevronRight size={24} className="transition-transform group-active:translate-x-1" />
      </div>
    </button>
  );
};

export default Dashboard;
