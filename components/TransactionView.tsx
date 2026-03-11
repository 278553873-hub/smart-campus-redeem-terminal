import React, { useState } from 'react';
import { ArrowLeft, Clock, ShoppingBag, TrendingUp, Landmark, Sparkles } from 'lucide-react';
import { Student, TransactionRecord } from '../types';

interface TransactionViewProps {
  student: Student;
  onBack: () => void;
}

const MOCK_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx_1',
    title: '货柜兑换（炫彩盲盒）',
    amount: 35.00,
    type: 'expense',
    date: '2026-03-05 14:15',
    category: 'vending_shop'
  },
  {
    id: 'tx_2',
    title: '2026年3月分红',
    amount: 145.50,
    type: 'income',
    date: '2026-03-01 08:30',
    category: 'dividend'
  },
  {
    id: 'tx_3',
    title: '班级奖励 (流动红旗)',
    amount: 50.00,
    type: 'income',
    date: '2026-02-25 10:00',
    category: 'reward'
  },
  {
    id: 'tx_4',
    title: '银行利息（活期存单）',
    amount: 102.38,
    type: 'income',
    date: '2026-02-15 09:00',
    category: 'interest'
  },
  {
    id: 'tx_5',
    title: '2026年1月分红',
    amount: 120.00,
    type: 'income',
    date: '2026-02-01 08:30',
    category: 'dividend'
  },
  {
    id: 'tx_6',
    title: '班级兑换（卡通笔袋）',
    amount: 45.00,
    type: 'expense',
    date: '2026-01-20 16:40',
    category: 'class_shop'
  }
];

const TransactionView: React.FC<TransactionViewProps> = ({ student, onBack }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [activeYear, setActiveYear] = useState<string>('2026'); // defaulted to current display year
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTransactions = MOCK_TRANSACTIONS.filter(t => 
    (activeFilter === 'all' ? true : t.type === activeFilter) &&
    (activeCategory === 'all' ? true : t.category === activeCategory) &&
    t.date.startsWith(activeYear)
  );

  const getIcon = (category: string) => {
    switch(category) {
      case 'vending_shop': return <ShoppingBag size={20} className="text-pink-500" />;
      case 'class_shop': return <ShoppingBag size={20} className="text-pink-500" />;
      case 'dividend': return <TrendingUp size={20} className="text-orange-500" />;
      case 'reward': return <Sparkles size={20} className="text-yellow-500" />;
      case 'interest': return <Landmark size={20} className="text-blue-500" />;
      default: return <Clock size={20} className="text-slate-500" />;
    }
  };

  const getBgColor = (category: string) => {
    switch(category) {
      case 'vending_shop': return 'bg-pink-50 ring-pink-100';
      case 'class_shop': return 'bg-pink-50 ring-pink-100';
      case 'dividend': return 'bg-orange-50 ring-orange-100';
      case 'reward': return 'bg-yellow-50 ring-yellow-100';
      case 'interest': return 'bg-blue-50 ring-blue-100';
      default: return 'bg-slate-50 ring-slate-100';
    }
  };

  const formatCoin = (val: number) => Number.isInteger(val) ? val : parseFloat(val.toFixed(2));

  return (
    <div className="h-full flex flex-col bg-[#f8fbff] animate-in slide-in-from-right-12 fade-in duration-300 ease-out overflow-hidden relative">
      <div className="px-6 py-4 shrink-0 z-10 bg-[#f8fbff]/90 backdrop-blur-md shadow-sm">
        {/* Top Row: Year Selector & Main filter tabs */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="relative shrink-0">
             <select 
               value={activeYear}
               onChange={(e) => setActiveYear(e.target.value)}
               className="bg-white text-slate-800 font-bold rounded-2xl pl-5 pr-8 py-2 text-base outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none cursor-pointer border-2 border-slate-50 shadow-sm"
             >
               <option value="2026">2026 年</option>
               <option value="2025">2025 年</option>
               <option value="2024">2024 年</option>
             </select>
             <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none mt-[1px] border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slate-400"></div>
          </div>

          <div className="flex p-1 bg-slate-200/60 rounded-2xl flex-1 max-w-[240px]">
            <button
                onClick={() => { setActiveFilter('all'); setActiveCategory('all'); }}
                className={`flex-1 py-1.5 rounded-xl font-bold text-sm transition-all ${activeFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 active:text-slate-700'}`}
            >
                全部
            </button>
            <button
                onClick={() => { setActiveFilter('income'); setActiveCategory('all'); }}
                className={`flex-1 py-1.5 rounded-xl font-bold text-sm transition-all ${activeFilter === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 active:text-slate-700'}`}
            >
                收入
            </button>
            <button
                onClick={() => { setActiveFilter('expense'); setActiveCategory('all'); }}
                className={`flex-1 py-1.5 rounded-xl font-bold text-sm transition-all ${activeFilter === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500 active:text-slate-700'}`}
            >
                支出
            </button>
          </div>
        </div>

        {/* Category Type Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

           <button 
             onClick={() => setActiveCategory('all')} 
             className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all h-8 flex items-center justify-center ${activeCategory === 'all' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 active:bg-slate-50'}`}
           >
             全部
           </button>
           {(activeFilter === 'all' || activeFilter === 'income') && (
             <>
               <button 
                 onClick={() => setActiveCategory('dividend')} 
                 className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all h-8 flex items-center justify-center ${activeCategory === 'dividend' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 active:bg-slate-50'}`}
               >
                 月度分红
               </button>
               <button 
                 onClick={() => setActiveCategory('reward')} 
                 className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all h-8 flex items-center justify-center ${activeCategory === 'reward' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 active:bg-slate-50'}`}
               >
                 班级奖励
               </button>
               <button 
                 onClick={() => setActiveCategory('interest')} 
                 className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all h-8 flex items-center justify-center ${activeCategory === 'interest' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 active:bg-slate-50'}`}
               >
                 银行利息
               </button>
             </>
           )}
           {(activeFilter === 'all' || activeFilter === 'expense') && (
             <>
               <button 
                 onClick={() => setActiveCategory('vending_shop')} 
                 className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all h-8 flex items-center justify-center ${activeCategory === 'vending_shop' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 active:bg-slate-50'}`}
               >
                 货柜兑换
               </button>
               <button 
                 onClick={() => setActiveCategory('class_shop')} 
                 className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all h-8 flex items-center justify-center ${activeCategory === 'class_shop' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 active:bg-slate-50'}`}
               >
                 班级兑换
               </button>
             </>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
        {filteredTransactions.length === 0 ? (
           <div className="h-64 flex flex-col items-center justify-center text-slate-400 opacity-60">
             <Clock size={48} className="mb-4 text-slate-300" />
             <p className="font-bold text-sm">暂无符合条件的流水记录</p>
           </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4 transition-transform active:scale-[0.98]">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ring-4 ring-white shadow-sm ${getBgColor(tx.category)}`}>
                {getIcon(tx.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-base truncate mb-1">{tx.title}</h4>
                <div className="flex items-center gap-2 text-xs font-bold font-[NumberFont] text-slate-400">
                   <span>{tx.date}</span>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-2">
                <div className={`font-black text-2xl font-[NumberFont] flex items-center gap-1 leading-none ${tx.type === 'income' ? 'text-green-500' : 'text-slate-700'}`}>
                   {tx.type === 'income' ? '+' : '-'}
                   <span>{formatCoin(tx.amount)}</span>
                   <img src="/assets/coin.png" className="w-[0.9em] h-[0.9em] -translate-y-[1px]" alt="coin" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionView;
