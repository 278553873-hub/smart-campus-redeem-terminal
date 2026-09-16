
import React from 'react';
import {
  Coins, ShoppingBag, Landmark, ArrowRightLeft, Sparkles,
  Zap, ChevronRight, LogOut
} from 'lucide-react';
import { Student } from '../types';
import { GROWTH_COIN_TERMS } from '../shared/growthCoinTerminology';

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
    <div className={`h-full flex flex-col bg-[#f8fbff] tracking-tight ${layout === 'pc' ? 'overflow-y-auto' : 'overflow-hidden'}`}>

      {/* 顶部：学生信息与退出栏（融于一体化背景，清爽大方，不画地为牢） */}
      <div className={`w-full px-5 pt-5 pb-3 shrink-0 flex items-center justify-between ${layout === 'pc' ? 'max-w-4xl mx-auto' : ''}`}>
        <div className="flex items-center gap-3.5">
          <div className={`rounded-2xl border-2 border-white p-1 bg-white shadow-md ring-4 ring-blue-100/70 overflow-hidden shrink-0 ${layout === 'pc' ? 'w-24 h-24' : 'w-[78px] h-[78px]'}`}>
            <img src={student.avatar} alt="头像" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <h1 className={`${layout === 'pc' ? 'text-3xl' : 'text-[26px] sm:text-[28px]'} font-black text-slate-900 tracking-tight leading-none`}>你好，{student.name}！</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-blue-600 text-white text-[13px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">{student.class}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('welcome')}
          className={`${layout === 'pc' ? 'h-16 rounded-3xl px-5' : 'h-12 rounded-2xl px-3.5'} flex shrink-0 items-center justify-center gap-1.5 bg-red-50 text-red-500 transition-all active:scale-95`}
          title="退出系统"
        >
          <LogOut size={layout === 'pc' ? 32 : 22} />
          <span className={`${layout === 'pc' ? 'text-base' : 'text-sm'} font-black`}>退出</span>
        </button>
      </div>

      {/* 资产与成长概览卡片区（作为首层核心视觉卡片，自然平铺） */}
      <div className={`w-full px-5 pb-3.5 shrink-0 ${layout === 'pc' ? 'max-w-4xl mx-auto' : ''}`}>
        <div className={`grid gap-3.5 sm:gap-4 ${layout === 'pc' ? 'grid-cols-2' : 'grid-cols-12'}`}>

          <div className={`${layout === 'pc' ? 'col-span-1' : 'col-span-7'} bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between`}>
            <div className="relative z-10 flex flex-col justify-between w-full h-full">
              {/* 顶行：成长币标签 + 流水明细按钮 */}
              <div className="flex justify-between items-center w-full">
                <span className="text-blue-100 font-bold text-[13px] tracking-wide whitespace-nowrap">{GROWTH_COIN_TERMS.name}</span>
                <button
                  type="button"
                  onClick={() => onNavigate('transactions')}
                  className="text-xs bg-white/20 active:bg-white/30 text-white px-3 py-1 rounded-full flex items-center gap-1 transition-colors backdrop-blur-sm border border-white/20 font-bold shadow-sm whitespace-nowrap"
                >
                  流水明细 <ChevronRight size={12} strokeWidth={3} />
                </button>
              </div>

              {/* 中间行：总资产大数字（独占整行，绝对不会被右上角按钮遮挡） */}
              <div className="my-1.5 sm:my-2">
                <h3 className="text-4xl font-black tracking-tighter leading-none flex items-center whitespace-nowrap">
                  <img src="/assets/coin.png" className="inline-block w-[1.05em] h-[1.05em] drop-shadow-sm mr-2 shrink-0" alt="coin" /> 
                  {formatCoin(student.campusCoins + bankBalance)}
                </h3>
              </div>

              {/* 底行：一体化半透明双格资产胶囊（高效紧凑，彻底杜绝换行） */}
              <div className="flex items-center text-[12px] bg-black/15 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/20 shadow-inner w-full justify-between whitespace-nowrap">
                <div className="flex items-center shrink-0">
                  <span className="font-semibold mr-1.5 text-blue-100 whitespace-nowrap">{GROWTH_COIN_TERMS.available}</span>
                  <span className="font-black tracking-tight inline-flex items-center text-white text-[13px] whitespace-nowrap">
                    <img src="/assets/coin.png" className="w-[1.05em] h-[1.05em] -mt-[1px] mr-1 opacity-90" alt="coin" />
                    {formatCoin(student.campusCoins)}
                  </span>
                </div>
                <div className="w-px h-3.5 bg-white/25 shrink-0 mx-2"></div>
                <div className="flex items-center shrink-0">
                  <span className="font-semibold mr-1.5 text-blue-100 whitespace-nowrap">{GROWTH_COIN_TERMS.saved}</span>
                  <span className="font-black tracking-tight inline-flex items-center text-white text-[13px] whitespace-nowrap">
                    <img src="/assets/coin.png" className="w-[1.05em] h-[1.05em] -mt-[1px] mr-1 opacity-90" alt="coin" />
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

          {/* 右侧成长阶段卡片 */}
          <div
            className={`${layout === 'pc' ? 'col-span-1' : 'col-span-5'} bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between items-start text-left`}
          >
            <div className="relative z-10 w-full mb-1">
              <p className="text-slate-400 font-bold text-[12px] uppercase tracking-wider mb-1 whitespace-nowrap">当前成长阶段</p>
              <h3 className="text-[22px] font-black text-slate-900 tracking-tight leading-tight whitespace-nowrap">稳步成长</h3>
              <div className="flex items-center justify-between mt-2 pt-2.5 border-t border-slate-100 w-full">
                <div className="flex flex-col shrink-0">
                  <span className="text-[12px] font-semibold text-slate-500 mb-0.5 tracking-tight whitespace-nowrap">本月总分</span>
                  <span className="text-[18px] font-black text-blue-600 leading-none whitespace-nowrap">45<span className="text-[12px] font-bold ml-1 text-slate-400">分</span></span>
                </div>
                <div className="w-px h-6 bg-slate-200 shrink-0 mx-1"></div>
                <div className="flex flex-col shrink-0">
                  <span className="text-[12px] font-semibold text-slate-500 mb-0.5 tracking-tight whitespace-nowrap">预计可得</span>
                  <span className="text-[18px] font-black text-orange-500 inline-flex items-center leading-none whitespace-nowrap"><img src="/assets/coin.png" className="w-[0.95em] h-[0.95em] mr-1 -mt-[2px]" alt="coin" /> 90.88</span>
                </div>
              </div>
            </div>
            <Sparkles size={80} className="absolute -bottom-6 -right-6 text-slate-50 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 功能主要入口区（三大卡片顺流而下，间距均等统一，彻底消灭中间断层） */}
      <div className={`flex-1 px-5 pb-5 flex flex-col min-h-0 overflow-hidden custom-scrollbar ${layout === 'pc' ? 'p-10' : ''}`}>
        <div className={`flex flex-col gap-3.5 sm:gap-4 ${layout === 'pc' ? 'grid grid-cols-2 max-w-4xl mx-auto gap-5' : 'w-full'}`}>
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
      className={`relative w-full overflow-hidden bg-white rounded-[1.75rem] px-5 py-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-2 border-slate-50 transition-all active:scale-[0.98] active:border-slate-100 flex items-center text-left gap-4 group ${layout === 'pc' ? 'flex-col items-center justify-center p-10 h-72' : 'h-[128px] sm:h-[134px]'}`}
    >
      {/* 质感装饰玻璃球背景 */}
      <div className={`absolute -right-8 -top-8 w-36 h-36 ${ctx.lightBg} rounded-full mix-blend-multiply opacity-50 transition-transform duration-500 group-active:scale-110 pointer-events-none`}></div>
      <div className={`absolute right-12 -bottom-10 w-24 h-24 ${ctx.blob} rounded-full mix-blend-multiply opacity-40 transition-transform duration-500 group-active:-translate-x-4 pointer-events-none`}></div>

      {/* 左侧高定立体光影Icon区 */}
      <div className={`relative z-10 ${layout === 'pc' ? 'w-32 h-32 mb-4' : 'w-[74px] h-[74px]'} rounded-2xl ${ctx.lightBg} ${ctx.text} flex items-center justify-center shadow-inner shrink-0 transition-transform duration-300 group-active:scale-95 ring-4 ring-white overflow-hidden`}>
        <img src={imageSrc} className={`${layout === 'pc' ? 'w-24 h-24' : 'w-[60px] h-[60px]'} object-contain drop-shadow-sm transition-transform duration-500 group-active:scale-110`} alt="" />
      </div>

      {/* 文本内容区 */}
      <div className={`flex flex-col flex-1 relative z-10 ${layout === 'pc' ? 'items-center text-center' : 'justify-center'}`}>
        <h3 className={`font-black text-slate-800 leading-tight tracking-tight mb-1 ${layout === 'pc' ? 'text-3xl mb-2' : 'text-[22px]'}`}>{label}</h3>
        <p className={`font-medium ${layout === 'pc' ? 'text-slate-500 text-sm' : 'text-slate-500 text-[14px] leading-snug'}`}>{desc}</p>
      </div>

      {/* 右侧箭头 */}
      {layout !== 'pc' && (
        <div className={`relative z-10 w-10 h-10 rounded-full bg-slate-50/80 shadow-xs border border-slate-100 flex items-center justify-center ${ctx.text} group-active:bg-slate-100 transition-colors`}>
          <ChevronRight size={22} className="transition-transform group-active:translate-x-1" />
        </div>
      )}
    </button>
  );
};

export default Dashboard;
