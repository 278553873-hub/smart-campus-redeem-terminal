import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ShoppingBag, Gift, CheckCircle2 } from 'lucide-react';
import { Student, Product } from '../types';
import { GROWTH_COIN_TERMS } from '../shared/growthCoinTerminology';
import {
  ALL_CATEGORY_ID,
  getShopCategoryName,
  getShopProductCategoryId,
  getShopVisibleCategoryIds,
  shouldShowShopCategoryRow,
} from '../shared/productCategory';
import { useShopCatalog } from './useShopCatalog';
import { sortShopProductsForShelf } from '../shared/shopProductOrder';
import {
  TERMINAL_SHOP_LAYOUT_PREVIEW_UPDATED_EVENT,
  readTerminalShopLayoutPresetId,
} from '../shared/terminalShopLayoutPreview';
import { getProductImage, getProductImageScale } from '../shared/productImage';
import {
  TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT,
  TERMINAL_SHOP_CATEGORY_FONT_SIZE,
  TERMINAL_SHOP_CATEGORY_ROW_HEIGHT,
  TERMINAL_SHOP_GRID_PADDING_X,
  TERMINAL_SHOP_GRID_GAP,
  TERMINAL_SHOP_CARD_PADDING,
  TERMINAL_SHOP_CARD_RADIUS,
  TERMINAL_SHOP_CARD_RING,
  TERMINAL_SHOP_INNER_RADIUS,
  TERMINAL_SHOP_NAME_FONT_SIZE,
  TERMINAL_SHOP_PRICE_FONT_SIZE,
  getTerminalShopCardHeight,
  getTerminalShopCardSpec,
  getTerminalShopImageTileHeight,
  getTerminalShopLayoutPreset,
} from '../shared/terminalShopLayout';

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

// 版式尺寸全部由 shared/terminalShopLayout 推导，卡片大小随演示控件选择的版式变化
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
  const [activeCategoryId, setActiveCategoryId] = useState<string>(ALL_CATEGORY_ID);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shopLayout, setShopLayout] = useState(() => getTerminalShopLayoutPreset(readTerminalShopLayoutPresetId()));
  // 卡片内距按行数取档：2 × 4 用紧凑档，把高度让给商品图
  const shopCardSpec = getTerminalShopCardSpec(shopLayout.rows);
  const shopCardHeight = getTerminalShopCardHeight(shopLayout.rows);
  const shopImageHeight = getTerminalShopImageTileHeight(shopLayout.rows);

  // 分类数据由 PC 后台维护（shared/shopCatalogStore），终端只读同一份
  const shopCatalog = useShopCatalog();
  const shopCategories = shopCatalog.categories;
  const shopProductCategories = shopCatalog.productCategories;
  const standardProducts = products.filter(p => p.type === 'standard');
  const shopCategoryIds = getShopVisibleCategoryIds(standardProducts, shopCategories, shopProductCategories);
  // 只有 1 个分类时不展示分类行，避免一排只有一个无效标签
  const showCategoryRow = shouldShowShopCategoryRow(standardProducts, shopCategories, shopProductCategories);
  const currentCategoryId = !showCategoryRow || activeCategoryId === ALL_CATEGORY_ID || !shopCategoryIds.some(id => id === activeCategoryId)
    ? ALL_CATEGORY_ID
    : activeCategoryId;
  // 可购买的在前且越贵越靠下，售罄的一律沉到最后
  const visibleProducts = sortShopProductsForShelf(
    currentCategoryId === ALL_CATEGORY_ID
      ? standardProducts
      : standardProducts.filter(product => getShopProductCategoryId(product, shopProductCategories) === currentCategoryId),
  );
  const categoryOptions = [
    { id: ALL_CATEGORY_ID, label: '全部' },
    ...shopCategoryIds.map(id => ({ id, label: getShopCategoryName(shopCategories, id) })),
  ];

  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = initialScrollTop;
  }, [initialScrollTop, isGuest]);

  // 演示控件切换「一屏几个商品」时跟着重排，并回到列表顶部，避免停在上一版式的滚动位置
  useEffect(() => {
    const handleLayoutPreviewUpdate = () => {
      setShopLayout(getTerminalShopLayoutPreset(readTerminalShopLayoutPresetId()));
      scrollRef.current?.scrollTo({ top: 0 });
    };
    window.addEventListener(TERMINAL_SHOP_LAYOUT_PREVIEW_UPDATED_EVENT, handleLayoutPreviewUpdate);
    return () => window.removeEventListener(TERMINAL_SHOP_LAYOUT_PREVIEW_UPDATED_EVENT, handleLayoutPreviewUpdate);
  }, []);

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

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    scrollRef.current?.scrollTo({ top: 0 });
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
      {/* 分类标签：固定在返回栏下方，只切换商品列表，不随商品滚动；只有 1 个分类时整行不出现 */}
      {showCategoryRow && (
        <div
          role="group"
          aria-label="商品分类"
          className="shrink-0 flex items-center gap-2 overflow-x-auto"
          style={{
            height: TERMINAL_SHOP_CATEGORY_ROW_HEIGHT,
            paddingLeft: TERMINAL_SHOP_GRID_PADDING_X,
            paddingRight: TERMINAL_SHOP_GRID_PADDING_X,
          }}
        >
          {categoryOptions.map(option => {
            const selected = option.id === currentCategoryId;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectCategory(option.id)}
                aria-pressed={selected}
                style={{ height: TERMINAL_SHOP_CATEGORY_CHIP_HEIGHT, fontSize: TERMINAL_SHOP_CATEGORY_FONT_SIZE }}
                className={`shrink-0 px-3.5 rounded-full font-black transition-colors ${selected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white text-slate-500 border border-slate-200 active:bg-slate-50'
                  }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar relative"
        style={{ paddingLeft: TERMINAL_SHOP_GRID_PADDING_X, paddingRight: TERMINAL_SHOP_GRID_PADDING_X }}
      >
        <div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${shopLayout.columns}, minmax(0, 1fr))`,
              gap: TERMINAL_SHOP_GRID_GAP,
            }}
          >
            {visibleProducts.map(product => {
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
                  style={{
                    height: shopCardHeight,
                    // 商品图底板与金额条统一内缩 CARD_PADDING；描边走 1px 阴影环，不占布局高度
                    padding: TERMINAL_SHOP_CARD_PADDING,
                    borderRadius: TERMINAL_SHOP_CARD_RADIUS,
                    boxShadow: '0 0 0 ' + TERMINAL_SHOP_CARD_RING + 'px #E9EDF3, 0 2px 6px rgba(15,23,42,0.04)',
                  }}
                  className={`overflow-hidden bg-white flex flex-col text-left transition-transform duration-150 ${canBuy
                    ? 'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200'
                    : 'cursor-not-allowed opacity-60'
                    }`}
                >
                  {/* 商品图底板：整块浅色圆角底，商品图铺在底板上，四周不画线 */}
                  <div
                    style={{ height: shopImageHeight, borderRadius: TERMINAL_SHOP_INNER_RADIUS }}
                    className="w-full shrink-0 relative overflow-hidden flex items-center justify-center bg-slate-100"
                  >
                    <img
                      src={getProductImage(product)}
                      alt=""
                      style={{ scale: getProductImageScale(product) }}
                      className="max-h-full max-w-full w-auto h-auto object-contain drop-shadow-sm mix-blend-multiply"
                    />
                    {!inStock && (
                      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/45 text-white text-[17px] font-black tracking-[0.2em]">
                        已售罄
                      </span>
                    )}
                  </div>

                  {/* 商品名：上下间距都取 nameGap，居中由结构保证，不靠手算半个行高 */}
                  <div
                    style={{
                      height: shopCardSpec.nameRowHeight,
                      marginTop: shopCardSpec.nameGap,
                      marginBottom: shopCardSpec.nameGap,
                    }}
                    className="w-full shrink-0 flex items-center justify-center"
                  >
                    <span className="w-full truncate text-center font-black leading-none text-slate-800" style={{ fontSize: TERMINAL_SHOP_NAME_FONT_SIZE }}>
                      {product.name}
                    </span>
                  </div>

                  {/* 金额：独立一条蓝底横条，作为卡片视觉重点 */}
                  <div
                    className="w-full shrink-0"
                    style={{ height: shopCardSpec.priceBarHeight }}
                  >
                    <div
                      style={{ fontSize: TERMINAL_SHOP_PRICE_FONT_SIZE, borderRadius: TERMINAL_SHOP_INNER_RADIUS }}
                      className={`w-full h-full flex items-center justify-center gap-1.5 font-black transition-colors ${canBuy
                        ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]'
                        : 'bg-slate-200 text-slate-400'
                        }`}
                    >
                      <img src="/assets/coin.png" alt="" className="h-[0.95em] w-[0.95em] object-contain" />
                      {product.price}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {visibleProducts.length === 0 && (
            <p className="pt-16 text-center text-[15px] font-bold text-slate-400">这个分类还没有商品</p>
          )}
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
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-[0_12px_30px_-6px_rgba(0,0,0,0.12),0_4px_10px_-2px_rgba(0,0,0,0.05)] border border-slate-100/90 flex items-center gap-3">
            <div className="bg-emerald-50 p-1.5 rounded-full flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-500" strokeWidth={2.5} />
            </div>
            <div className="font-bold text-[16px] text-slate-800 tracking-tight leading-none">
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

