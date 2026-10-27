import { createDemoGrowthCoinFlows } from '../shared/demoGrowthCoinFlow';
import { GROWTH_COIN_FLOW_LABELS as CATEGORY_LABELS, GROWTH_COIN_INCOME_CATEGORIES as INCOME_CATEGORIES, GROWTH_COIN_EXPENSE_CATEGORIES as EXPENSE_CATEGORIES, formatCampusCoinFlowTime as formatFlowTime, getGrowthCoinFlowDetail } from '../shared/growthCoinFlow';
import { GrowthCoinIcon } from './GrowthCoinBranding';
import React, { useState } from 'react';
import { Clock, ShoppingBag, TrendingUp, Landmark, Sparkles } from 'lucide-react';
import type { Student, TransactionRecord } from '../types';

interface TransactionViewProps {
  student: Student;
  onBack: () => void;
}

const TransactionView: React.FC<TransactionViewProps> = ({ student, onBack }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [activeYear, setActiveYear] = useState<string>('2026'); // defaulted to current display year
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTransactions = createDemoGrowthCoinFlows(student.id)
    .filter(t =>
      (activeFilter === 'all' ? true : t.type === activeFilter) &&
      (activeCategory === 'all' ? true : t.category === activeCategory) &&
      t.date.startsWith(activeYear)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const groupedTransactions = filteredTransactions.reduce<Array<{ month: string; items: TransactionRecord[] }>>((groups, transaction) => {
    const month = transaction.date.slice(0, 7);
    const currentGroup = groups[groups.length - 1];
    if (currentGroup?.month === month) currentGroup.items.push(transaction);
    else groups.push({ month, items: [transaction] });
    return groups;
  }, []);

  const getIcon = (category: string) => {
    switch(category) {
      case 'vending_exchange':
      case 'class_exchange':
      case 'manual_clear': return <ShoppingBag size={20} className="text-pink-500" />;
      case 'growth_award': return <TrendingUp size={20} className="text-orange-500" />;
      case 'class_reward': return <Sparkles size={20} className="text-yellow-500" />;
      case 'bank_interest': return <Landmark size={20} className="text-blue-500" />;
      default: return <Clock size={20} className="text-slate-500" />;
    }
  };

  const getBgColor = (category: string) => {
    switch(category) {
      case 'vending_exchange':
      case 'class_exchange':
      case 'manual_clear': return 'bg-pink-50 ring-pink-100';
      case 'growth_award': return 'bg-orange-50 ring-orange-100';
      case 'class_reward': return 'bg-yellow-50 ring-yellow-100';
      case 'bank_interest': return 'bg-blue-50 ring-blue-100';
      default: return 'bg-slate-50 ring-slate-100';
    }
  };

  const formatCoin = (val: number) => Number.isInteger(val) ? val : parseFloat(val.toFixed(2));

  return (
    <div className="h-full flex flex-col bg-[#f8fbff] overflow-hidden relative">
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
           {(activeFilter === 'all' || activeFilter === 'income') && INCOME_CATEGORIES.map(category => (
             <button
               key={category}
               onClick={() => setActiveCategory(category)}
               className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all h-8 flex items-center justify-center ${activeCategory === category ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 active:bg-slate-50'}`}
             >
               {CATEGORY_LABELS[category]}
             </button>
           ))}
           {(activeFilter === 'all' || activeFilter === 'expense') && EXPENSE_CATEGORIES.map(category => (
             <button
               key={category}
               onClick={() => setActiveCategory(category)}
               className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all h-8 flex items-center justify-center ${activeCategory === category ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'bg-white text-slate-500 border border-slate-200 active:bg-slate-50'}`}
             >
               {CATEGORY_LABELS[category]}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
        {groupedTransactions.length === 0 ? (
           <div className="h-64 flex flex-col items-center justify-center text-slate-400 opacity-60">
             <Clock size={48} className="mb-4 text-slate-300" />
             <p className="font-bold text-sm">暂无符合条件的流水记录</p>
           </div>
        ) : (
          groupedTransactions.map(group => (
            <section key={group.month} className="space-y-2">
              <h3 className="px-1 text-xs font-bold text-slate-500">{group.month.split('-')[0]}年{Number(group.month.split('-')[1])}月</h3>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm">
                {group.items.map((tx) => (
                  <div key={tx.id} className="flex min-h-[92px] items-start gap-3 px-4 py-3 transition-transform active:scale-[0.98]">
                    <div className={`mt-0.5 flex h-10 w-10 rounded-xl items-center justify-center shrink-0 ring-4 ring-white ${getBgColor(tx.category)}`}>
                      {getIcon(tx.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="min-w-0 truncate text-base font-bold text-slate-800">{CATEGORY_LABELS[tx.category]}</h4>
                        <div className={`shrink-0 font-black text-lg font-[NumberFont] flex items-center gap-1 leading-none ${tx.type === 'income' ? 'text-green-500' : 'text-slate-700'}`}>
                          {tx.type === 'income' ? '+' : '-'}
                          <span>{formatCoin(tx.amount)}</span>
                          <GrowthCoinIcon className="h-[0.9em] w-[0.9em]" alt="成长币" />
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-500">{getGrowthCoinFlowDetail(tx)}</p>
                      <time dateTime={tx.date} className="mt-1 block text-xs font-bold leading-4 text-slate-400">{formatFlowTime(tx.date)}</time>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionView;
