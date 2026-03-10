import React, { useState, useMemo, useRef } from 'react';
import { ShoppingCart, Gift, CheckCircle2, Filter, Sparkles, ShoppingBag, History, Clock, ChevronDown, Calendar, ChevronLeft } from 'lucide-react';
import { Student, Product } from '../types';

interface PurchaseRecord {
  id: string;
  productId: string;
  name: string;
  price: number;
  date: number;
  type: 'standard' | 'special';
  image: string;
  status: 'exchanged' | 'claimed'; // 已兑换 | 已核销
}

interface ShopViewProps {
  student: Student;
  products: Product[];
  onPurchase: (p: Product) => void;
  onBack: () => void;
}

const ShopView: React.FC<ShopViewProps> = ({ student, products, onPurchase }) => {
  const [isHistory, setIsHistory] = useState(false);
  const [confirmingProduct, setConfirmingProduct] = useState<Product | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 购买历史记录状态
  const [records, setRecords] = useState<PurchaseRecord[]>([
    {
      id: 'rec_3',
      productId: '1',
      name: '校庆限量徽章',
      price: 5,
      date: new Date(2025, 1, 4, 11, 41).getTime(), // 2月4日
      type: 'standard',
      image: 'https://picsum.photos/seed/badge/300/300',
      status: 'exchanged'
    }
  ]);

  // 获取所有记录中包含的月份
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    records.forEach(r => {
      const d = new Date(r.date);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(months).sort().reverse();
  }, [records]);

  // 筛选并排序记录
  const displayRecords = useMemo(() => {
    let filtered = [...records].sort((a, b) => b.date - a.date);
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(r => {
        const d = new Date(r.date);
        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return m === selectedMonth;
      });
    }
    return filtered;
  }, [records, selectedMonth]);

  const filteredProducts = products.filter(p => p.type === 'standard');

  const handleOpenConfirm = (product: Product) => {
    setConfirmingProduct(product);
  };

  const handleConfirmPurchase = () => {
    if (confirmingProduct) {
      const type = confirmingProduct.type;
      onPurchase(confirmingProduct);

      const newRecord: PurchaseRecord = {
        id: `rec_${Date.now()}`,
        productId: confirmingProduct.id,
        name: confirmingProduct.name,
        price: confirmingProduct.price,
        date: Date.now(),
        type: confirmingProduct.type,
        image: confirmingProduct.image,
        status: 'exchanged'
      };
      setRecords(prev => [newRecord, ...prev]);

      setConfirmingProduct(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}-${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (isHistory) {
    return (
      <div className="animate-in slide-in-from-right-8 duration-500 relative h-full bg-[#fcfdfe] overflow-y-auto custom-scrollbar flex flex-col">
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsHistory(false)} className="p-2.5 bg-slate-100 rounded-full text-slate-500 active:bg-slate-200 transition-colors">
              <ChevronLeft size={20} className="-ml-0.5" />
            </button>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              兑换明细 <History size={20} className="text-blue-500" />
            </h2>
          </div>
          <div className="relative border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-transparent pl-4 pr-10 py-2 w-full font-black text-xs text-slate-600 focus:outline-none"
            >
              <option value="all">全部时间</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{m.replace('-', '年')}月</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
        <div className="p-6 pb-12 w-full space-y-4 max-w-5xl mx-auto flex-1">
          {displayRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-300">
              <ShoppingBag size={80} className="mb-4 opacity-20" />
              <p className="text-xl font-black">暂无相关记录</p>
            </div>
          ) : (
            displayRecords.map(record => (
              <div key={record.id} className="bg-white p-4 rounded-[1.5rem] shadow-[0_2px_10px_rgb(0,0,0,0.02)] border-2 border-slate-50 flex items-center transition-all animate-in fade-in zoom-in-[0.98] duration-300">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center p-2 shrink-0 ${record.type === 'special' ? 'bg-indigo-50/50' : 'bg-orange-50/50'}`}>
                  <img src={record.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="ml-4 flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-black text-slate-800 tracking-tight truncate">{record.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${record.type === 'special' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                      {record.type === 'special' ? '特殊' : '货柜'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold">
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-slate-300" />
                      <span>{formatTime(record.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={12} className={record.status === 'claimed' ? 'text-slate-300' : 'text-green-500'} />
                      <span className={record.status === 'claimed' ? 'text-slate-400' : 'text-green-600'}>
                        {record.status === 'claimed' ? '已核销' : '已兑换(待领取)'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end space-x-1">
                    <img src="/assets/coin.png" className="w-[1.2em] h-[1.2em] drop-shadow-sm -translate-y-[1px]" alt="coin" />
                    <span className="text-xl font-[NumberFont] font-black text-slate-700">{record.price}</span>
                  </div>
                  {record.type === 'special' && (
                    <div className={`text-[8px] font-black mt-1 ${record.status === 'claimed' ? 'text-slate-300 line-through' : 'text-indigo-500'}`}>
                      {record.status === 'claimed' ? '已享受' : '待教师核销'}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-8 duration-500 relative h-full bg-[#fcfdfe] flex flex-col pt-8 overflow-hidden">
      {/* 头部固定停靠区 */}
      <div className="shrink-0 relative z-30 flex flex-col transition-all duration-500 bg-[#fcfdfe]/95 backdrop-blur-md px-8 pb-3">
        {/* 主要卡片 */}
        <div className={`flex items-center justify-between bg-white rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border-2 border-slate-50 transition-all duration-500 origin-top overflow-hidden
          ${isScrolled ? 'max-h-0 opacity-0 py-0 px-5 scale-y-90 border-none blur-sm' : 'max-h-[200px] p-5 opacity-100 scale-y-100 blur-0'}
        `}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-orange-50 rounded-[1.2rem] flex items-center justify-center shadow-inner">
              <ShoppingBag className="text-orange-500" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                星光超市 <Sparkles className="text-yellow-400" size={20} />
              </h2>
              <p className="text-slate-400 font-bold text-[11px] mt-0.5">努力沉淀，兑现心愿 ✨</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => { setIsHistory(true); setIsScrolled(false); }}
              className="flex items-center justify-center gap-1.5 rounded-full transition-all font-black text-slate-500 bg-slate-50 py-1.5 px-3 active:scale-95 border border-slate-100"
            >
              <History size={12} className="shrink-0" />
              <div className="text-[11px] leading-none">兑换明细</div>
            </button>
            <div className="bg-gradient-to-b from-orange-50 to-orange-100/50 px-4 py-2 rounded-2xl border border-orange-200/50 flex flex-col items-end shadow-sm">
              <span className="text-orange-500/80 font-black text-[9px] mb-0.5 tracking-wider">我的余额</span>
              <div className="text-orange-600 font-[NumberFont] font-black text-xl leading-none flex items-center gap-1">
                <img src="/assets/coin.png" className="w-[1.1em] h-[1.1em] drop-shadow-sm -translate-y-0.5" alt="coin" />
                {student.campusCoins}
              </div>
            </div>
          </div>
        </div>

        {/* 滚动后显示的精简栏，采用常规层级堆叠而非绝对定位 */}
        <div className={`flex items-center justify-between transition-all duration-500 overflow-hidden
          ${isScrolled ? 'max-h-[60px] opacity-100 mt-2 pointer-events-auto' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
          <div className="flex items-center justify-center bg-white shadow-sm border border-slate-100 rounded-2xl px-4 py-2">
            <div className="flex flex-col w-full gap-1">
              <div className="flex justify-between items-center gap-3">
                <span className="text-[10px] text-orange-400 font-black">我的钱包</span>
                <div className="flex items-center gap-0.5 text-orange-600 font-black font-[NumberFont] text-[13px] leading-none">
                  <img src="/assets/coin.png" className="w-[0.9em] h-[0.9em]" alt="coin" /> {student.campusCoins}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setIsHistory(true); setIsScrolled(false); }}
            className={`flex items-center justify-center gap-1.5 rounded-2xl transition-all font-black text-slate-500 bg-white shadow-sm border border-slate-100 px-3.5 py-2.5 active:scale-95`}
          >
            <History size={15} className="shrink-0" />
          </button>
        </div>
      </div>

      {/* 滚动区 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar relative px-8"
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
        <div className="animate-in fade-in zoom-in-[0.98] duration-500 ease-out fill-mode-both flex-1 flex flex-col pt-2 pb-12">
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(product => {
              const isSpecial = product.type === 'special';
              const inStock = product.stock > 0;
              const canAfford = student.campusCoins >= product.price;
              const canBuy = canAfford && inStock;

              return (
                <div key={product.id} className={`p-4 rounded-[2rem] shadow-[0_4px_15px_rgb(0,0,0,0.02)] border-2 flex flex-col gap-4 transition-all active:scale-[0.98] ${isSpecial ? 'bg-indigo-50/20 border-indigo-100' : 'bg-orange-50/20 border-orange-100/80'}`}>
                  {/* 商品图区域 */}
                  <div className={`aspect-square rounded-[1.5rem] flex items-center justify-center p-4 relative ${isSpecial ? 'bg-indigo-50/50' : 'bg-orange-50/50'}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-md mix-blend-multiply"
                    />
                  </div>

                  {/* 信息区域 */}
                  <div className="flex flex-col gap-3 mt-auto">
                    <h3 className="text-base font-black text-slate-800 line-clamp-2 min-h-[2.5rem] leading-tight text-center">
                      {product.name}
                    </h3>

                    <button
                      onClick={() => handleOpenConfirm(product)}
                      disabled={!canBuy}
                      className={`w-full py-4 rounded-[1.2rem] flex items-center justify-center transition-all border shadow-sm ${canBuy
                        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:bg-blue-700 active:scale-95'
                        : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed shadow-none'
                        }`}
                    >
                      <div className={`font-[NumberFont] font-black text-[22px] leading-none flex items-center gap-1.5`}>
                        {inStock ? (
                          <>
                            <img src="/assets/coin.png" className={`w-[0.9em] h-[0.9em] -translate-y-[1px] ${canBuy ? '' : 'opacity-40 grayscale'}`} alt="coin" />
                            {product.price}
                          </>
                        ) : (
                          <span className="text-base tracking-widest px-2">已售罄</span>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {confirmingProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300 border-8 border-slate-50">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-inner ${confirmingProduct.type === 'special' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'
              }`}>
              {confirmingProduct.type === 'special' ? <Gift size={64} /> : <ShoppingBag size={64} />}
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-10 tracking-tight">确认兑换？</h2>

            <div className="w-full space-y-4 mb-10">
              <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <span className="text-slate-500 font-bold">当前校园币余额</span>
                <span className="text-xl font-black text-slate-800"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> {student.campusCoins}</span>
              </div>
              <div className={`flex justify-between items-center p-5 rounded-2xl border ${confirmingProduct.type === 'special' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-pink-50 border-pink-100 text-pink-700'
                }`}>
                <span className="font-bold">本次支出金额</span>
                <span className="text-2xl font-black"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> -{confirmingProduct.price}</span>
              </div>
              <div className="flex justify-between items-center bg-green-50 p-5 rounded-2xl border border-green-100">
                <span className="text-green-600 font-bold">支付后剩余</span>
                <span className="text-2xl font-black text-green-700"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> {student.campusCoins - confirmingProduct.price}</span>
              </div>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => setConfirmingProduct(null)}
                className="flex-1 py-6 rounded-[2rem] bg-slate-100 text-slate-600 font-black text-xl transition-colors active:bg-slate-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirmPurchase}
                className={`flex-1 py-6 rounded-[2rem] text-white font-black text-xl shadow-2xl transition-all active:scale-95 ${confirmingProduct.type === 'special'
                  ? 'bg-indigo-600 shadow-indigo-200'
                  : 'bg-pink-500 shadow-pink-200'
                  }`}
              >
                确认支付
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-full duration-700">
          <div className="text-white px-12 py-6 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] flex items-center space-x-5 border-4 border-white bg-green-500">
            <div className="bg-white/20 p-2 rounded-full">
              <CheckCircle2 size={40} />
            </div>
            <div className="font-black text-2xl tracking-tight">
              兑换成功，柜门已打开请取货
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ShopView;
