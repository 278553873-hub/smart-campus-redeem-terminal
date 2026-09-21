import React, { useState } from 'react';
import { Product } from '../types';
import { clampChannelStock, getChannelCapacity, isSingleItemChannel } from '../shared/vendingChannelCapacity';
import { 
    ChevronLeft, RefreshCw, Package,
    Cpu, KeyRound, CheckCircle2, Play, Unlock, Lock, DoorOpen, Check,
    Plus, Trash2, X, Minus, Sparkles, Wrench, Search
} from 'lucide-react';

interface ChannelItem {
    id: number;
    cabinet: 'left' | 'right';
    cabinetName: string;
    row: number;
    col: number;
    type: string;
    subTypeLabel: string;
    productId: string | number | null;
    stock: number;
    maxStock: number;
    doorOpen?: boolean;
}

// 默认根据 49 格标品机型生成物理货道数据
const createDefaultVendingChannels = (): ChannelItem[] => {
    const list: ChannelItem[] = [];
    // 左机（出货主机 30 道）
    // 第1排: 5个挂钩
    for (let c = 1; c <= 5; c++) {
        const id = list.length + 1;
        list.push({
            id, cabinet: 'left', cabinetName: '左柜·出货货道',
            row: 1, col: c, type: '挂钩货道', subTypeLabel: '1排·挂钩',
            productId: c === 1 ? 3 : c === 2 ? 1 : null,
            stock: c === 1 ? 6 : c === 2 ? 3 : 0,
            maxStock: 10
        });
    }
    // 第2排: 7个弹簧
    for (let c = 1; c <= 7; c++) {
        const id = list.length + 1;
        list.push({
            id, cabinet: 'left', cabinetName: '左柜·出货货道',
            row: 2, col: c, type: '弹簧货道', subTypeLabel: '2排·弹簧',
            productId: c === 2 ? 4 : null,
            stock: c === 2 ? 4 : 0,
            maxStock: 10
        });
    }
    // 第3排: 5个推杆
    for (let c = 1; c <= 5; c++) {
        const id = list.length + 1;
        list.push({
            id, cabinet: 'left', cabinetName: '左柜·出货货道',
            row: 3, col: c, type: '推杆货道', subTypeLabel: '3排·推杆',
            productId: c === 1 ? 1 : null,
            stock: c === 1 ? 5 : 0,
            maxStock: 10
        });
    }
    // 第4排: 5个推杆
    for (let c = 1; c <= 5; c++) {
        const id = list.length + 1;
        list.push({
            id, cabinet: 'left', cabinetName: '左柜·出货货道',
            row: 4, col: c, type: '推杆货道', subTypeLabel: '4排·推杆',
            productId: null, stock: 0, maxStock: 10
        });
    }
    // 第5排: 4个推杆
    for (let c = 1; c <= 4; c++) {
        const id = list.length + 1;
        list.push({
            id, cabinet: 'left', cabinetName: '左柜·出货货道',
            row: 5, col: c, type: '推杆货道', subTypeLabel: '5排·推杆',
            productId: null, stock: 0, maxStock: 10
        });
    }
    // 第6排: 4个推杆
    for (let c = 1; c <= 4; c++) {
        const id = list.length + 1;
        list.push({
            id, cabinet: 'left', cabinetName: '左柜·出货货道',
            row: 6, col: c, type: '推杆货道', subTypeLabel: '6排·推杆',
            productId: null, stock: 0, maxStock: 10
        });
    }

    // 右机（储物副柜 19 格，电子锁独立单格，每柜只放 1 个商品）
    // 1-3排: 每排2大格
    for (let r = 1; r <= 3; r++) {
        for (let c = 1; c <= 2; c++) {
            const id = list.length + 1;
            list.push({
                id, cabinet: 'right', cabinetName: '右柜·储物格',
                row: r, col: c, type: '电子锁货柜', subTypeLabel: `${r}排·大格`,
                productId: (r === 1 && c === 1) ? 2 : (r === 2 && c === 1) ? 1 : null,
                stock: (r === 1 && c === 1) ? 1 : (r === 2 && c === 1) ? 0 : 0,
                maxStock: 1, doorOpen: false
            });
        }
    }
    // 第4排: 10窄格
    for (let c = 1; c <= 10; c++) {
        const id = list.length + 1;
        list.push({
            id, cabinet: 'right', cabinetName: '右柜·储物格',
            row: 4, col: c, type: '电子锁货柜', subTypeLabel: '4排·窄格',
            productId: null, stock: 0, maxStock: 1, doorOpen: false
        });
    }
    // 第5排: 3中格
    for (let c = 1; c <= 3; c++) {
        const id = list.length + 1;
        list.push({
            id, cabinet: 'right', cabinetName: '右柜·储物格',
            row: 5, col: c, type: '电子锁货柜', subTypeLabel: '5排·中格',
            productId: null, stock: 0, maxStock: 1, doorOpen: false
        });
    }

    return list;
};

interface VendingAdminProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    onExit: () => void;
    deviceId?: string;
    deviceName?: string;
    initialActivationCode?: string;
}

const VendingAdmin: React.FC<VendingAdminProps> = ({ 
    products, 
    setProducts, 
    onExit,
    deviceName = '现场智能货柜'
}) => {
    // 适配 540px 竖屏的机柜左右子级切换
    const [activeCabinet, setActiveCabinet] = useState<'left' | 'right'>('left');

    // 货道状态列表（49 格）
    const [channels, setChannels] = useState<ChannelItem[]>(createDefaultVendingChannels);

    // 提示信息
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 1800);
    };

    // 上架 / 换绑 / 下架商品抽屉状态
    const [selectedChannelForAssign, setSelectedChannelForAssign] = useState<ChannelItem | null>(null);
    const [assignProductId, setAssignProductId] = useState<string | number | null>(null);
    const [assignInitialStock, setAssignInitialStock] = useState<number>(10);
    const [productSearchKeyword, setProductSearchKeyword] = useState<string>('');

    // 现场硬件调试模式状态（左柜出货测试 + 右柜开柜测试）
    const [isDiagnosticsMode, setIsDiagnosticsMode] = useState<boolean>(false);
    // 瞬时触发动效状态（左柜推杆出货脉冲 + 右柜电磁锁开门脉冲）
    const [motorTestingIds, setMotorTestingIds] = useState<Record<number, boolean>>({});
    const [doorUnlockingIds, setDoorUnlockingIds] = useState<Record<number, boolean>>({});

    // 同步货道库存至全局商品库，实现真实数据闭环
    const syncProductsStock = (updatedChannels: ChannelItem[]) => {
        setProducts(prevProducts => {
            const next = [...prevProducts];
            const stockMap: Record<string | number, number> = {};
            updatedChannels.forEach(c => {
                if (c.productId) {
                    stockMap[c.productId] = (stockMap[c.productId] || 0) + c.stock;
                }
            });
            return next.map(p => {
                if (stockMap[p.id] !== undefined) {
                    return { ...p, stock: stockMap[p.id] };
                }
                return p;
            });
        });
    };


    const getProduct = (productId: string | number | null) => {
        if (!productId) return null;
        return products.find(prod => String(prod.id) === String(productId)) || null;
    };

    const getProductName = (productId: string | number | null) => {
        if (!productId) return null;
        const p = getProduct(productId);
        return p?.name || '已配商品';
    };

    // 打开选品上架 / 运维抽屉
    const handleOpenAssignModal = (channel: ChannelItem) => {
        setSelectedChannelForAssign(channel);
        const hasExistingItem = Boolean(channel.productId);

        if (hasExistingItem) {
            // 已有商品：自动选中当前商品，带入当前库存数量
            setAssignProductId(channel.productId);
            setAssignInitialStock(channel.stock);
        } else {
            // 空闲格：不预选商品，默认装填满仓容量（右柜电子锁单件格口固定 1 件）
            setAssignProductId(null);
            setAssignInitialStock(getChannelCapacity(channel));
        }
        setProductSearchKeyword('');
    };

    // 确认上架 / 保存库存 / 更换商品
    const handleConfirmAssign = () => {
        if (!selectedChannelForAssign || !assignProductId) return;
        const targetProduct = products.find(p => String(p.id) === String(assignProductId));
        const targetName = targetProduct?.name || '商品';
        const code = `${selectedChannelForAssign.row}-${selectedChannelForAssign.col}`;
        const isExisting = Boolean(selectedChannelForAssign.productId);
        const isProductChanged = isExisting && String(selectedChannelForAssign.productId) !== String(assignProductId);

        const nextChannels = channels.map(c => {
            if (c.id === selectedChannelForAssign.id) {
                return {
                    ...c,
                    productId: assignProductId,
                    stock: clampChannelStock(c, assignInitialStock)
                };
            }
            return c;
        });
        setChannels(nextChannels);
        syncProductsStock(nextChannels);
        setSelectedChannelForAssign(null);

        if (!isExisting) {
            showToast(`已上架【${targetName}】至货道【${code}】`);
        } else if (isProductChanged) {
            showToast(`货道【${code}】已换为【${targetName}】`);
        } else {
            showToast(`货道【${code}】库存已更新为 ${assignInitialStock}`);
        }
    };

    // 下架并清空货道
    const handleUnassignChannel = (channelId: number) => {
        const target = channels.find(c => c.id === channelId);
        const nextChannels = channels.map(c => {
            if (c.id === channelId) {
                return {
                    ...c,
                    productId: null,
                    stock: 0
                };
            }
            return c;
        });
        setChannels(nextChannels);
        syncProductsStock(nextChannels);
        setSelectedChannelForAssign(null);
        if (target) {
            showToast(`货道【${target.row}-${target.col}】已清空下架`);
        }
    };

    // 单道补满
    const handleRestockSingleChannel = (channelId: number) => {
        const target = channels.find(c => c.id === channelId);
        if (!target) return;
        if (!target.productId) {
            handleOpenAssignModal(target);
            return;
        }
        const fullCapacity = getChannelCapacity(target);
        if (target.stock >= fullCapacity) {
            handleOpenAssignModal(target);
            return;
        }
        const nextChannels = channels.map(c => {
            if (c.id === channelId) {
                return { ...c, stock: fullCapacity };
            }
            return c;
        });
        setChannels(nextChannels);
        syncProductsStock(nextChannels);
        showToast(`货道【${target.row}-${target.col}】已补满`);
    };

    // 补满某整排
    const handleRestockRow = (cabinet: 'left' | 'right', row: number) => {
        const rowChannels = channels.filter(c => c.cabinet === cabinet && c.row === row && c.productId !== null);
        if (rowChannels.length === 0) {
            showToast(`第 ${row} 排无在架商品`);
            return;
        }
        const nextChannels = channels.map(c => {
            if (c.cabinet === cabinet && c.row === row && c.productId !== null) {
                return { ...c, stock: getChannelCapacity(c) };
            }
            return c;
        });
        setChannels(nextChannels);
        syncProductsStock(nextChannels);
        showToast(`第 ${row} 排已补满`);
    };

    // 右柜电磁锁开门：单格脉冲指令（无硬件状态回执，单向触发，不展示虚假标签与遮挡Toast）
    // 上架页每格下方的「开门」按钮与调试模式共用这一个动作
    const handleUnlockDoorPulse = (channelId: number) => {
        setDoorUnlockingIds(prev => ({ ...prev, [channelId]: true }));
        setTimeout(() => {
            setDoorUnlockingIds(prev => ({ ...prev, [channelId]: false }));
        }, 400);
    };


    // 一键补满当前机柜全部货道
    const handleBatchRestockFull = () => {
        const validChannels = channels.filter(c => c.cabinet === activeCabinet && c.productId !== null);
        if (validChannels.length === 0) {
            showToast('当前机柜暂无在架商品');
            return;
        }
        const nextChannels = channels.map(c => {
            if (c.cabinet === activeCabinet && c.productId !== null) {
                return { ...c, stock: getChannelCapacity(c) };
            }
            return c;
        });
        setChannels(nextChannels);
        syncProductsStock(nextChannels);
        showToast('在架货道已全部补满');
    };

    // 调试模式：单道推杆直接出货测试（无硬件状态回执，单向触发，不展示虚假正常标签与遮挡Toast）
    const handleDiagnosticsMotor = (channelId: number) => {
        setMotorTestingIds(prev => ({ ...prev, [channelId]: true }));
        setTimeout(() => {
            setMotorTestingIds(prev => ({ ...prev, [channelId]: false }));
        }, 500);
    };

    // 过滤当前机柜的货道与排数
    const activeChannels = channels.filter(c => c.cabinet === activeCabinet);
    const rows = Array.from(new Set(activeChannels.map(c => c.row))).sort((a, b) => a - b);

    // 独立承接页：现场硬件调试模式
    if (isDiagnosticsMode) {
        return (
            <div className="w-full h-full bg-[#f8fbff] text-slate-800 flex flex-col font-sans select-none overflow-hidden">
                {/* 调试顶栏：左侧返回 + 中间标题“调试模式” + 右侧占位 */}
                <div className="h-14 shrink-0 bg-white border-b border-slate-100 px-4 flex items-center justify-between shadow-xs">
                    <button
                        onClick={() => setIsDiagnosticsMode(false)}
                        className="h-10 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                        <ChevronLeft size={18} />
                        <span>返回</span>
                    </button>

                    <div className="text-base font-black text-slate-800 tracking-tight">
                        调试模式
                    </div>

                    <div className="w-20 shrink-0" />
                </div>

                {/* 调试控制栏：左柜/右柜居中切换（右柜硬件无一键全开，只能逐格开门） */}
                <div className="shrink-0 flex items-center justify-center px-4 py-2 min-h-[52px]">
                    <div className="w-56 h-11 bg-slate-200/70 p-1 rounded-2xl flex gap-1 border border-slate-200/50 shadow-inner">
                        <button
                            onClick={() => setActiveCabinet('left')}
                            className={`flex-1 h-9 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${activeCabinet === 'left' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            左柜
                        </button>
                        <button
                            onClick={() => setActiveCabinet('right')}
                            className={`flex-1 h-9 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${activeCabinet === 'right' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            右柜
                        </button>
                    </div>
                </div>

                {/* 轻量 Toast 提示：天然 Flexbox 居中，纯透明度淡入，彻底杜绝左右漂移 */}
                {toastMessage && (
                    <div className="pointer-events-none absolute top-14 inset-x-0 z-[100] flex justify-center px-4">
                        <div
                            key={toastMessage}
                            className="pointer-events-auto bg-slate-900/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in duration-150 whitespace-nowrap"
                        >
                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                            <span>{toastMessage}</span>
                        </div>
                    </div>
                )}

                {/* 硬件调试内容区：全屏自适应 6 排货架 */}
                <div className="flex-1 flex flex-col overflow-hidden p-2">
                    <div className="flex-1 flex flex-col justify-between bg-slate-900/5 border border-slate-200/80 rounded-2xl p-1.5 gap-1.5 overflow-hidden">
                        {rows.map(rowNum => {
                            const rowChannels = activeChannels.filter(c => c.row === rowNum);
                            const firstItem = rowChannels[0];
                            return (
                                <div 
                                    key={rowNum} 
                                    className="flex-1 flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-1.5 shadow-xs overflow-hidden"
                                >
                                    {/* 层板标牌 */}
                                    <div className="flex items-center justify-between text-xs font-black text-slate-700 leading-none mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span>{firstItem?.subTypeLabel || `第 ${rowNum} 排`}</span>
                                        </div>
                                    </div>

                                    {/* 格口自适应网格 */}
                                    <div className={`flex-1 grid gap-1 items-stretch ${
                                        rowChannels.length === 2 ? 'grid-cols-2' : 
                                        rowChannels.length === 3 ? 'grid-cols-3' : 
                                        rowChannels.length === 4 ? 'grid-cols-4' : 
                                        rowChannels.length === 7 ? 'grid-cols-7' : 
                                        rowChannels.length === 10 ? 'grid-cols-10' : 
                                        'grid-cols-5'
                                    }`}>
                                        {rowChannels.map(ch => {
                                            const colNumber = ch.col;
                                            const is10Narrow = rowChannels.length === 10;
                                            if (activeCabinet === 'left') {
                                                const isTesting = Boolean(motorTestingIds[ch.id]);
                                                return (
                                                    <div
                                                        key={ch.id}
                                                        onClick={() => handleDiagnosticsMotor(ch.id)}
                                                        className={`rounded-lg border text-center transition-all flex flex-col justify-between select-none cursor-pointer active:scale-95 ${
                                                            is10Narrow ? 'p-0.5' : 'p-1'
                                                        } ${
                                                            isTesting
                                                                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/40'
                                                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between text-xs font-mono leading-none">
                                                            <span className="text-slate-400 font-bold">{colNumber}</span>
                                                        </div>

                                                        <div className="py-0.5 min-h-0 flex-1 flex flex-col items-center justify-center">
                                                            <div className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1">
                                                                {isTesting ? (
                                                                    <RefreshCw size={13} className="animate-spin text-blue-600" />
                                                                ) : (
                                                                    <Play size={12} className="text-blue-500 fill-blue-500" />
                                                                )}
                                                                <span className={is10Narrow ? 'text-[10px]' : 'text-xs'}>出货</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                // 右柜电锁开门调试（无硬件状态回执，固定展示开门动作，无已锁/已开虚假标签）
                                                // 指令下发中的反馈与左柜出货统一：蓝色高亮 + 转动图标，琥珀色只留给「门已开」等状态
                                                const isUnlocking = Boolean(doorUnlockingIds[ch.id]);
                                                return (
                                                    <div
                                                        key={ch.id}
                                                        onClick={() => handleUnlockDoorPulse(ch.id)}
                                                        className={`rounded-lg border text-center transition-all flex flex-col justify-between select-none cursor-pointer active:scale-95 ${
                                                            is10Narrow ? 'p-0.5' : 'p-1'
                                                        } ${
                                                            isUnlocking
                                                                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/40'
                                                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between text-xs font-mono leading-none">
                                                            <span className="text-slate-400 font-bold shrink-0">{colNumber}</span>
                                                        </div>

                                                        <div className="py-0.5 min-h-0 flex-1 flex flex-col items-center justify-center">
                                                            <div className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1">
                                                                {isUnlocking ? (
                                                                    <RefreshCw size={13} className="animate-spin text-blue-600" />
                                                                ) : (
                                                                    <Unlock size={is10Narrow ? 11 : 13} className="text-blue-500 shrink-0" />
                                                                )}
                                                                <span className={is10Narrow ? 'text-[10px]' : 'text-xs'}>开门</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-[#f8fbff] text-slate-800 flex flex-col font-sans select-none overflow-hidden">
            {/* 顶部标题栏：左侧返回 + 中间标题“商品上架” + 右侧调试入口 */}
            <div className="h-14 shrink-0 bg-white border-b border-slate-100 px-4 flex items-center justify-between shadow-xs">
                {/* 左侧：返回 */}
                <button
                    onClick={onExit}
                    className="h-10 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                >
                    <ChevronLeft size={18} />
                    <span>返回</span>
                </button>

                {/* 中间：标题名字“商品上架” */}
                <div className="text-base font-black text-slate-800 tracking-tight">
                    商品上架
                </div>

                {/* 右侧：进入调试模式 */}
                <button
                    onClick={() => setIsDiagnosticsMode(true)}
                    className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold active:scale-95 transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                >
                    <Wrench size={15} className="text-slate-600" />
                    <span>调试</span>
                </button>
            </div>

            {/* 顶栏下方控制栏：左柜/右柜居中切换（右柜开门按钮在每格下方，逐格操作） */}
            <div className="shrink-0 flex items-center justify-center px-4 py-2 min-h-[52px]">
                <div className="w-56 h-11 bg-slate-200/70 p-1 rounded-2xl flex gap-1 border border-slate-200/50 shadow-inner">
                    <button
                        onClick={() => setActiveCabinet('left')}
                        className={`flex-1 h-9 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${activeCabinet === 'left' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        左柜
                    </button>
                    <button
                        onClick={() => setActiveCabinet('right')}
                        className={`flex-1 h-9 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${activeCabinet === 'right' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        右柜
                    </button>
                </div>
            </div>

            {/* 轻量 Toast 提示：天然 Flexbox 居中，纯透明度淡入，彻底杜绝左右漂移 */}
            {toastMessage && (
                <div className="pointer-events-none absolute top-14 inset-x-0 z-[100] flex justify-center px-4">
                    <div
                        key={toastMessage}
                        className="pointer-events-auto bg-slate-900/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in duration-150 whitespace-nowrap"
                    >
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span>{toastMessage}</span>
                    </div>
                </div>
            )}

            {/* 内容区：全屏自适应 540x960 视口 (现场补货专一工作台，无冗余控制条) */}
            <div className="flex-1 flex flex-col overflow-hidden p-2">
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    {/* 拟真机柜展示区：6排自适应垂直均分，彻底无内部滚动 */}
                    <div className="flex-1 flex flex-col justify-between bg-slate-900/5 border border-slate-200/80 rounded-2xl p-1.5 gap-1.5 overflow-hidden">
                        {rows.map(rowNum => {
                            const rowChannels = activeChannels.filter(c => c.row === rowNum);
                            const firstItem = rowChannels[0];
                            return (
                                <div 
                                    key={rowNum} 
                                    className="flex-1 flex flex-col justify-between bg-white border border-slate-200/90 rounded-xl p-1.5 shadow-xs overflow-hidden"
                                >
                                    {/* 层板极简标牌：固定显示补满本排 */}
                                    <div className="flex items-center justify-between text-xs font-black text-slate-700 leading-none mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span>{firstItem?.subTypeLabel || `第 ${rowNum} 排`}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRestockRow(activeCabinet, rowNum)}
                                            className="text-xs text-blue-700 hover:text-blue-800 active:scale-95 font-bold px-2 py-0.5 rounded-md bg-blue-50/90 hover:bg-blue-100"
                                        >
                                            补满本排
                                        </button>
                                    </div>

                                    {/* 格口自适应网格：弹性填充每排高度，10窄格改为真实1排10个 */}
                                    <div className={`flex-1 grid gap-1 items-stretch ${
                                        rowChannels.length === 2 ? 'grid-cols-2' : 
                                        rowChannels.length === 3 ? 'grid-cols-3' : 
                                        rowChannels.length === 4 ? 'grid-cols-4' : 
                                        rowChannels.length === 7 ? 'grid-cols-7' : 
                                        rowChannels.length === 10 ? 'grid-cols-10' : 
                                        'grid-cols-5'
                                    }`}>
                                        {rowChannels.map(ch => {
                                            const product = getProduct(ch.productId);
                                            const hasItem = Boolean(ch.productId && product);
                                            const maxCapacity = getChannelCapacity(ch);
                                            const isFull = hasItem && ch.stock >= maxCapacity;
                                            const isWarning = hasItem && (isSingleItemChannel(ch) ? ch.stock === 0 : ch.stock < 3);
                                            const colNumber = ch.col;
                                            const is10Narrow = rowChannels.length === 10;
                                            const is2Big = rowChannels.length === 2;
                                            const isUnlocking = Boolean(doorUnlockingIds[ch.id]);
                                            return (
                                                <div key={ch.id} className="min-h-0 flex flex-col gap-1">
                                                    <div
                                                        onClick={() => handleOpenAssignModal(ch)}
                                                        className={`flex-1 min-h-0 rounded-lg border text-center transition-all flex flex-col justify-between select-none cursor-pointer active:scale-95 ${
                                                            is10Narrow ? 'p-0.5' : 'p-1'
                                                        } ${
                                                            !hasItem 
                                                                ? 'bg-slate-50/50 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50' 
                                                                : ch.doorOpen
                                                                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40'
                                                                : isFull
                                                                ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800 hover:brightness-95'
                                                                : isWarning
                                                                ? 'bg-rose-50 border-rose-300 text-rose-800 hover:brightness-95'
                                                                : 'bg-white border-blue-200 text-slate-700 hover:border-blue-400'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between text-xs font-mono leading-none">
                                                            <span className="text-slate-400 font-bold">{colNumber}</span>
                                                            {hasItem && (
                                                                <span className={`px-1.5 py-0.5 rounded font-bold ${is10Narrow ? 'text-[9px]' : 'text-[11px]'} ${
                                                                    ch.doorOpen ? 'bg-amber-200 text-amber-900' :
                                                                    isFull ? 'bg-emerald-100 text-emerald-700' :
                                                                    isWarning ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                    {ch.doorOpen ? '门已开' : `${ch.stock}/${maxCapacity}`}
                                                                </span>
                                                            )}
                                                        </div>
    
                                                        <div className="py-0.5 min-h-0 flex-1 flex flex-col items-center justify-between overflow-hidden">
                                                            {hasItem && product ? (
                                                                <>
                                                                    <div className="flex-1 min-h-0 flex items-center justify-center">
                                                                        <div className={`${
                                                                            is10Narrow ? 'w-5 h-5' : 
                                                                            is2Big ? 'w-9 h-9' : 
                                                                            rowChannels.length === 7 ? 'w-6 h-6' : 'w-7 h-7'
                                                                        } rounded bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-200/60 shrink-0`}>
                                                                            {product.image ? (
                                                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <Package size={is10Narrow ? 10 : is2Big ? 18 : 13} className="text-slate-400" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className={`w-full px-0.5 shrink-0 text-center font-bold text-slate-800 truncate leading-tight ${
                                                                        is10Narrow ? 'text-[8px]' : 
                                                                        is2Big ? 'text-xs' : 
                                                                        rowChannels.length === 7 ? 'text-[10px]' : 'text-[11px]'
                                                                    }`}>
                                                                        {product.name}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="flex-1 min-h-0 flex items-center justify-center">
                                                                    <div className={`font-medium text-slate-400 flex items-center justify-center gap-0.5 opacity-80 ${
                                                                        is10Narrow ? 'text-[8px]' : 'text-[11px]'
                                                                    }`}>
                                                                        <Plus size={is10Narrow ? 8 : 11} className="text-slate-400" />
                                                                        <span>空闲</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* 右柜开门是机械动作：按钮放在格子外侧下方，点格子仍然只做「选品上架」一件事 */}
                                                    {activeCabinet === 'right' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUnlockDoorPulse(ch.id)}
                                                            disabled={isUnlocking}
                                                            aria-label={'打开 ' + ch.row + ' 排 ' + ch.col + ' 号储物格门'}
                                                            className={`shrink-0 rounded-md border font-bold flex items-center justify-center gap-1 transition-colors active:scale-95 ${is10Narrow ? 'h-6 text-[10px]' : 'h-7 text-[11px]'} ${isUnlocking ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'}`}
                                                        >
                                                            {isUnlocking ? (
                                                                <RefreshCw size={is10Narrow ? 10 : 12} className="animate-spin shrink-0" />
                                                            ) : (
                                                                <Unlock size={is10Narrow ? 10 : 12} className="shrink-0" />
                                                            )}
                                                            <span>开门</span>
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 4. 货道选品上架 / 运维抽屉 (单一极简架构，无废话) */}
            {selectedChannelForAssign && (() => {
                const isExisting = Boolean(selectedChannelForAssign.productId);
                const isRightCabinet = selectedChannelForAssign.cabinet === 'right';
                const maxCap = getChannelCapacity(selectedChannelForAssign);
                const filteredProducts = products.filter(p => 
                    !productSearchKeyword.trim() || p.name.toLowerCase().includes(productSearchKeyword.trim().toLowerCase())
                );

                return (
                    <div 
                        className="absolute inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
                        onClick={() => setSelectedChannelForAssign(null)}
                    >
                        <div 
                            className="bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[78%] border-t border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 抽屉顶部标题栏 */}
                            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-800">
                                        选择商品
                                    </span>
                                    <span className="text-xs font-bold text-slate-600 font-mono bg-slate-200/60 px-2 py-0.5 rounded-md">
                                        {isRightCabinet ? '右柜' : '左柜'} · {selectedChannelForAssign.row}排{selectedChannelForAssign.col}号
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        ({selectedChannelForAssign.type})
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedChannelForAssign(null)}
                                    className="w-8 h-8 rounded-full bg-slate-200/60 text-slate-500 hover:text-slate-800 flex items-center justify-center active:scale-95 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* 商品搜索栏 */}
                            <div className="px-4 pt-3 pb-1 shrink-0">
                                <div className="relative flex items-center">
                                    <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={productSearchKeyword}
                                        onChange={(e) => setProductSearchKeyword(e.target.value)}
                                        placeholder="搜索商品名称..."
                                        className="w-full h-9 pl-8 pr-8 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                    />
                                    {productSearchKeyword && (
                                        <button
                                            onClick={() => setProductSearchKeyword('')}
                                            className="absolute right-2.5 w-4 h-4 rounded-full bg-slate-300 hover:bg-slate-400 text-slate-600 flex items-center justify-center text-[10px]"
                                        >
                                            <X size={10} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 商品网格列表 */}
                            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                                {filteredProducts.length === 0 ? (
                                    <div className="py-10 text-center text-slate-400 text-xs">
                                        未找到匹配“{productSearchKeyword}”的商品
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {filteredProducts.map(product => {
                                            const isSelected = String(assignProductId) === String(product.id);
                                            return (
                                                <div
                                                    key={product.id}
                                                    onClick={() => setAssignProductId(product.id)}
                                                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 select-none relative ${
                                                        isSelected
                                                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/30'
                                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/60">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={20} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-bold text-slate-800 truncate">
                                                            {product.name}
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                                            <Check size={10} className="stroke-[3]" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* 抽屉底部设置库存与确定操作 */}
                            <div className="p-4 border-t border-slate-100 bg-white shrink-0 space-y-3">
                                {isRightCabinet ? (
                                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                                        <span className="text-xs font-bold text-slate-600 pl-2">装填库存</span>
                                        <div className="flex items-center pr-2">
                                            <span className="font-mono text-sm font-black text-slate-800 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
                                                1 件
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                                        <span className="text-xs font-bold text-slate-600 pl-2">装填库存</span>
                                        <div className="flex items-center gap-3 pr-2">
                                            <button
                                                onClick={() => setAssignInitialStock(prev => Math.max(1, prev - 1))}
                                                className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-700 flex items-center justify-center font-bold active:scale-90"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-mono text-base font-black text-slate-800 min-w-[28px] text-center">
                                                {assignInitialStock}
                                            </span>
                                            <button
                                                onClick={() => setAssignInitialStock(prev => Math.min(maxCap, prev + 1))}
                                                className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-700 flex items-center justify-center font-bold active:scale-90"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 操作按钮 */}
                                <div className="flex items-center gap-2">
                                    {isExisting && (
                                        <button
                                            onClick={() => handleUnassignChannel(selectedChannelForAssign.id)}
                                            className="h-11 px-4 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
                                        >
                                            <Trash2 size={15} />
                                            <span>下架清空</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={handleConfirmAssign}
                                        disabled={!assignProductId}
                                        className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-98 transition-all"
                                    >
                                        <Check size={16} />
                                        <span>{isExisting ? '确认保存' : '确认上架'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default VendingAdmin;
