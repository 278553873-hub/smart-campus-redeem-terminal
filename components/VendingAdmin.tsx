import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, RefreshCw, Package, Plus, Minus, Settings } from 'lucide-react';

interface VendingAdminProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    onExit: () => void;
}

const VendingAdmin: React.FC<VendingAdminProps> = ({ products, setProducts, onExit }) => {
    const [activeTab, setActiveTab] = useState<'stock' | 'system'>('stock');

    const updateStock = (id: string, delta: number) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, stock: Math.max(0, p.stock + delta) };
            }
            return p;
        }));
    };

    const handleRestart = () => {
        window.location.reload();
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-100 animate-in fade-in">
            <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 bg-slate-900 z-50">
                <button
                    onClick={onExit}
                    className="flex items-center space-x-1 text-slate-400 font-bold active:text-white px-3 py-1.5 rounded-xl transition-colors"
                >
                    <ChevronLeft size={24} />
                    <span>退出管理</span>
                </button>
                <div className="font-black text-lg flex items-center gap-2">
                    <Settings size={20} className="text-blue-500" />
                    终端维护
                </div>
            </div>

            <div className="flex px-6 pt-4 gap-4 shrink-0">
                <button
                    onClick={() => setActiveTab('stock')}
                    className={`flex-1 py-3 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${activeTab === 'stock' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                    <Package size={18} /> 货柜补货
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`flex-1 py-3 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${activeTab === 'system' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                    <RefreshCw size={18} /> 系统维护
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {activeTab === 'stock' && (
                    <div className="space-y-4 pb-10">
                        <h3 className="font-bold text-slate-400 mb-4 text-sm">调整商品库存情况 (仅货柜实物)</h3>
                        {products.filter(p => p.type === 'standard').map(product => (
                            <div key={product.id} className="bg-slate-800 p-4 rounded-3xl flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shrink-0 shadow-inner">
                                    <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="font-black text-white leading-tight truncate text-base">{product.name}</div>
                                    <div className="text-slate-400 text-xs mt-1 font-bold">当前库存: <span className={product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}>{product.stock}</span></div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 bg-slate-900 rounded-full p-1 border border-slate-700 shadow-inner">
                                    <button
                                        onClick={() => updateStock(product.id, -1)}
                                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 active:bg-slate-700 active:text-white transition-colors"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="w-8 text-center font-black font-[NumberFont] text-lg">{product.stock}</span>
                                    <button
                                        onClick={() => updateStock(product.id, 1)}
                                        className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 active:bg-slate-700 active:text-white transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="space-y-6 flex flex-col items-center justify-center pt-10">
                        <div className="w-24 h-24 bg-slate-800 text-blue-500 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                            <RefreshCw size={48} />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="font-black text-2xl">重启终端设备</h3>
                            <p className="text-slate-400 text-sm max-w-[260px] mx-auto font-bold leading-relaxed">重置并清除所有临时缓存，重新加载当前界面系统。</p>
                        </div>
                        <button
                            onClick={handleRestart}
                            className="w-full max-w-[260px] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all mt-6 text-lg"
                        >
                            立刻重启
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendingAdmin;
