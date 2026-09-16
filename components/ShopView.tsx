import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ShoppingBag, Gift, CheckCircle2 } from 'lucide-react';
import { Student, Product } from '../types';
import { GROWTH_COIN_TERMS } from '../shared/growthCoinTerminology';

interface ShopViewProps {
  student: Student;
  products: Product[];
  onPurchase: (p: Product) => Promise<boolean>;
  onBack: () => void;
  isGuest?: boolean;
  initialScrollTop?: number;
  pendingPurchaseProductId?: string | null;
  onPendingPurchaseHandled?: () => void;
  onRequireLogin?: (product: Product, scrollTop: number) => void;
}

const ShopView: React.FC<ShopViewProps> = ({
  student,
  products,
  onPurchase,
  isGuest = false,
  initialScrollTop = 0,
  pendingPurchaseProductId = null,
  onPendingPurchaseHandled,
  onRequireLogin,
}) => {
  const [confirmingProduct, setConfirmingProduct] = useState<Product | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(p => p.type === 'standard');

  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = initialScrollTop;
  }, [initialScrollTop, isGuest]);

  useEffect(() => {
    if (isGuest || !pendingPurchaseProductId) return;
    const pendingProduct = products.find(product => product.id === pendingPurchaseProductId && product.stock > 0);
    if (pendingProduct) setConfirmingProduct(pendingProduct);
    onPendingPurchaseHandled?.();
  }, [isGuest, onPendingPurchaseHandled, pendingPurchaseProductId, products]);

  const handleOpenConfirm = (product: Product) => {
    if (isGuest) {
      onRequireLogin?.(product, scrollRef.current?.scrollTop ?? 0);
      return;
    }
    setConfirmingProduct(product);
  };

  const handleConfirmPurchase = async () => {
    if (confirmingProduct) {
      const productToPurchase = confirmingProduct;
      setShowSuccess(false);
      setConfirmingProduct(null);

      const purchaseSucceeded = await onPurchase(productToPurchase);
      if (purchaseSucceeded) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#fcfdfe]">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar relative px-8"
      >
        <div className="flex-1 flex flex-col pt-4 pb-12">
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(product => {
              const isSpecial = product.type === 'special';
              const inStock = product.stock > 0;
              const canAfford = student.campusCoins >= product.price;
              const canBuy = isGuest ? inStock : canAfford && inStock;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleOpenConfirm(product)}
                  disabled={!canBuy}
                  aria-label={inStock ? `${product.name}，${product.price} ${GROWTH_COIN_TERMS.name}，兑换` : `${product.name}，已售罄`}
                  className={`rounded-2xl overflow-hidden shadow-[0_4px_16px_rgb(0,0,0,0.03)] border-2 flex flex-col transition-all text-left bg-white ${canBuy
                    ? 'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200'
                    : 'cursor-not-allowed opacity-60'
                    } ${isSpecial ? 'border-indigo-100' : 'border-slate-100'}`}
                >
                  {/* 商品图区域：顶天立地铺满卡片上方，融入卡片 */}
                  <div className={`w-full aspect-square relative overflow-hidden flex items-center justify-center p-3.5 ${isSpecial ? 'bg-gradient-to-b from-indigo-50/60 to-slate-50/40' : 'bg-gradient-to-b from-orange-50/40 to-slate-50/40'}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain drop-shadow-sm mix-blend-multiply"
                    />
                  </div>

                  {/* 信息区域：放大商品名称、金额与货币icon */}
                  <div className="p-4 pt-3 flex flex-col flex-1 justify-between gap-3 w-full">
                    <h3 className="text-[18px] font-black text-slate-800 line-clamp-2 min-h-[2.8rem] leading-snug text-center">
                      {product.name}
                    </h3>

                    <div
                      className={`w-full h-14 rounded-xl flex items-center justify-center transition-all border shadow-sm ${canBuy
                        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                      <div className="font-[NumberFont] font-black text-[26px] leading-none flex items-center gap-2">
                        {inStock ? (
                          <>
                            <img src="/assets/coin.png" className={`w-6 h-6 shrink-0 -translate-y-[1px] ${canBuy ? '' : 'opacity-40 grayscale'}`} alt="" />
                            <span>{product.price}</span>
                          </>
                        ) : (
                          <span className="text-[17px] font-bold tracking-wider px-2 text-slate-400">已售罄</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
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
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">确认兑换？</h2>
            <p className="text-[17px] font-bold text-slate-500 mb-8 max-w-[280px] line-clamp-1">{confirmingProduct.name}</p>

            <div className="w-full space-y-4 mb-10">
              <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <span className="text-slate-500 font-bold">当前{GROWTH_COIN_TERMS.available}</span>
                <span className="text-xl font-black text-slate-800"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> {student.campusCoins}</span>
              </div>
              <div className={`flex justify-between items-center p-5 rounded-2xl border ${confirmingProduct.type === 'special' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-pink-50 border-pink-100 text-pink-700'
                }`}>
                <span className="font-bold">本次消耗</span>
                <span className="text-2xl font-black"><img src="/assets/coin.png" className="inline-block w-[1.1em] h-[1.1em] align-middle drop-shadow-sm mx-1 -translate-y-[1px]" alt="coin" /> {confirmingProduct.price}</span>
              </div>
              <div className="flex justify-between items-center bg-green-50 p-5 rounded-2xl border border-green-100">
                <span className="text-green-600 font-bold">兑换后剩余</span>
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
                确认兑换
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none success-toast">
          <div className="text-white px-5 py-3 rounded-[1.4rem] shadow-[0_14px_30px_rgba(34,197,94,0.28)] flex items-center gap-2.5 border-2 border-white/90 bg-green-500">
            <div className="bg-white/20 p-1.5 rounded-full">
              <CheckCircle2 size={22} strokeWidth={3} />
            </div>
            <div className="font-black text-lg tracking-tight leading-none">
              兑换成功
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
        .success-toast {
          animation: success-toast-drop-fade 2s ease both;
        }
        @keyframes success-toast-drop-fade {
          0% {
            opacity: 0;
            transform: translate(-50%, -18px);
          }
          18% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          78% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, 8px);
          }
        }
      `}</style>
    </div>
  );
};

export default ShopView;
