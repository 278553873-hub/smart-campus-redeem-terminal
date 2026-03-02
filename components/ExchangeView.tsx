
import React, { useState } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Student } from '../types';
import { EXCHANGE_RATE } from '../constants';

interface ExchangeViewProps {
  student: Student;
  onExchange: (points: number) => void;
  onBack: () => void;
}

const ExchangeView: React.FC<ExchangeViewProps> = ({ student, onExchange }) => {
  const [amount, setAmount] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setAmount(Math.floor(val / 10) * 10);
  };

  const coinsGained = amount / EXCHANGE_RATE;

  return (
    <div className="p-8 max-w-2xl mx-auto h-full flex flex-col items-center animate-in zoom-in duration-300">
      <h2 className="text-3xl font-bold text-blue-900 mb-2">积分兑换中心</h2>
      <p className="text-blue-600 mb-8 italic text-sm">每 {EXCHANGE_RATE} 积分可兑换 1 校园币</p>

      <div className="w-full flex flex-col items-center gap-6 mb-8 bg-white p-8 rounded-[3rem] shadow-xl border-4 border-blue-50">
        <div className="text-center">
          <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">当前持有积分</div>
          <div className="text-5xl font-black text-blue-900 leading-none">{student.points}</div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse rotate-90">
            <ArrowRight size={28} />
          </div>
        </div>

        <div className="text-center">
          <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">预计获得校园币</div>
          <div className="text-5xl font-black text-yellow-500 leading-none"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> {coinsGained}</div>
        </div>
      </div>

      <div className="w-full space-y-8 bg-blue-50/50 p-10 rounded-[3rem] border-2 border-dashed border-blue-200">
        <div className="flex justify-between items-center px-4">
          <span className="text-xl font-bold text-blue-800">兑换数量</span>
          <span className="bg-blue-600 text-white px-6 py-2 rounded-2xl text-2xl font-black shadow-md">{amount}</span>
        </div>

        <input
          type="range"
          min="0"
          max={student.points}
          step="10"
          value={amount}
          onChange={handleSliderChange}
          className="w-full h-4 bg-blue-200 rounded-full appearance-none cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-blue-400 font-bold px-2">
          <span>0</span>
          <span>{student.points}</span>
        </div>
      </div>

      <button
        onClick={() => setIsConfirming(true)}
        disabled={amount <= 0}
        className={`mt-12 px-20 py-8 rounded-[2.5rem] text-3xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale ${amount > 0 ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-200 text-gray-400'
          }`}
      >
        立即兑换
      </button>

      {/* 兑换确认弹窗 */}
      {isConfirming && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border-8 border-blue-50">
            <div className="w-32 h-32 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-8 shadow-inner">
              <AlertCircle size={64} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">确认兑换？</h2>

            <div className="w-full space-y-4 mb-10">
              <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <span className="text-slate-500 font-bold">当前持有积分</span>
                <span className="text-xl font-black text-slate-800">{student.points}</span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 p-5 rounded-2xl border border-blue-100">
                <span className="text-blue-600 font-bold">本次支出积分</span>
                <span className="text-2xl font-black text-blue-700">-{amount}</span>
              </div>
              <div className="flex justify-between items-center bg-yellow-50 p-5 rounded-2xl border border-yellow-100">
                <span className="text-yellow-600 font-bold">兑换获得校园币</span>
                <span className="text-2xl font-black text-yellow-600"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> +{coinsGained}</span>
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => setIsConfirming(false)}
                className="flex-1 py-6 rounded-[2rem] bg-slate-100 text-slate-600 font-black text-xl transition-colors active:bg-slate-200"
              >
                返回修改
              </button>
              <button
                onClick={() => {
                  onExchange(amount);
                  setIsConfirming(false);
                }}
                className="flex-1 py-6 rounded-[2rem] bg-blue-600 text-white font-black text-xl shadow-2xl shadow-blue-200 transition-all active:scale-95"
              >
                确认兑换
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeView;
