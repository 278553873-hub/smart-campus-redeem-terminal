import React, { useState } from 'react';
import {
    LayoutDashboard, FileText, ClipboardList, PenTool,
    Settings, Users, BookOpen, Database, FolderOpen,
    Menu, User, ChevronDown, ChevronRight, Package,
    Landmark, ArrowLeftRight, Coins, Monitor, AlertCircle,
    Info, Search, Plus, MonitorSmartphone, Sparkles,
    Check, Upload
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
    // 侧边栏菜单展开状态控制
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
        '货柜机配置中心': true,
        '基础信息配置': false,
    });

    const [activeMenu, setActiveMenu] = useState('货币发放管理');

    const toggleMenu = (title: string) => {
        setExpandedMenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const menus = [
        {
            title: '货柜机配置中心', icon: <Package size={18} />,
            children: ['货币发放管理', '货柜超市管理', '历次发币记录', '储蓄银行配置', '设备基础配置']
        },
        {
            title: '报表中心', icon: <FileText size={18} />,
            children: ['学校驾驶舱', '评价记录明细表', '学期报告']
        },
        {
            title: '播报中心', icon: <PenTool size={18} />,
            children: ['评价指标管理']
        },
        {
            title: '基础信息配置', icon: <Settings size={18} />,
            children: ['学期管理', '部门管理', '科目管理', '年级管理', '班级管理', '教师管理', '学生管理', '学生成绩管理']
        },
        {
            title: '报告配置', icon: <FileText size={18} />,
            children: ['学科指标']
        },
        {
            title: '数据中心', icon: <Database size={18} />,
            children: ['资料文件']
        }
    ];

    // 发币模型配置状态
    const [budgetPool, setBudgetPool] = useState(10000);
    const [issueCycle, setIssueCycle] = useState<'monthly' | 'weekly'>('monthly');
    const [guaranteedRate, setGuaranteedRate] = useState(30);
    const [competitiveRate, setCompetitiveRate] = useState(70);
    const [showRank, setShowRank] = useState(true);

    // 发币配置页面内部 Tab
    const [issuanceTab, setIssuanceTab] = useState<'auto' | 'manual'>('auto');

    // 手动发币状态
    const [manualClass, setManualClass] = useState('');
    const [manualPerStudent, setManualPerStudent] = useState(0);
    const [manualReason, setManualReason] = useState('流动红旗');
    const [customReason, setCustomReason] = useState('');

    // 模拟班级数据字典 (班级名称 -> 班级人数)
    const classData: Record<string, number> = {
        '1年级1班': 42,
        '1年级2班': 45,
        '2年级1班': 40,
        '2年级2班': 43,
        '3年级1班': 48,
    };
    const selectedClassStudentCount = classData[manualClass] || 0;
    const totalManualIssuance = selectedClassStudentCount * manualPerStudent;

    // 储蓄银行配置状态
    const [currentDailyRate, setCurrentDailyRate] = useState(0.03);
    const [bankProducts, setBankProducts] = useState([
        { id: 1, label: '定期存单-1周', days: 7, rate: 0.01, min: 1, desc: '满期固定利息1.0%', active: true },
        { id: 2, label: '定期存单-1月', days: 30, rate: 0.08, min: 1, desc: '满期固定利息8.0%', active: true },
        { id: 3, label: '定期存单-半年', days: 180, rate: 0.60, min: 1, desc: '满期固定利息60.0%', active: true },
        { id: 4, label: '定期存单-1年', days: 365, rate: 1.50, min: 1, desc: '满期固定利息150.0%', active: true }
    ]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    // 设备基础配置状态
    const [terminalConfig, setTerminalConfig] = useState({
        mainTitle: '校园星光',
        subTitle: '货柜机',
        slogan: '点滴进步，成就未来',
        growthLabel: '成长足迹中心',
        growthDesc: '记录点滴进步，每月结算奖励',
        shopLabel: '文创星光超市',
        shopDesc: '把努力变成奖励，海量商品兑换',
        bankLabel: '博学储蓄银行',
        bankDesc: '将资产存入银行，赚取高额利息',
        coinIconUrl: '/assets/coin.png'
    });

    // 货柜商品管理状态
    const [shopActiveTab, setShopActiveTab] = useState<'products' | 'channels'>('channels');
    const [shopProducts, setShopProducts] = useState([
        { id: 1, name: '校庆限量徽章', price: 5, icon: '/assets/shop/shop_badge.png' },
        { id: 2, name: '星光书包', price: 150, icon: '/assets/shop/shop_backpack.png' },
        { id: 3, name: '定制刻字钢笔', price: 120, icon: '/assets/shop/shop_pen.png' },
        { id: 4, name: '智能成长笔记本', price: 15, icon: '/assets/shop/shop_notebook.png' },
    ]);
    const [channels, setChannels] = useState(
        Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            type: i < 10 ? '挂钩货道' : i < 20 ? '弹簧货道' : '推杆货道',
            productId: [0, 4, 15, 30].includes(i) ? (i === 0 ? 1 : i === 4 ? 2 : i === 15 ? 3 : 4) : null,
            stock: [0, 4, 15, 30].includes(i) ? (i === 0 ? 3 : i === 15 ? 8 : 10) : 0
        }))
    );
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [editingShopProduct, setEditingShopProduct] = useState<any>(null);
    const [editingChannel, setEditingChannel] = useState<any>(null);
    const [modalIcon, setModalIcon] = useState<string>('');

    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [modalDays, setModalDays] = useState(7);
    const [modalRate, setModalRate] = useState(1.0);

    const handleOpenProductModal = (product: any = null) => {
        setEditingProduct(product);
        setModalDays(product?.days || 7);
        setModalRate(product ? parseFloat((product.rate * 100).toFixed(2)) : 1.0);
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = (productData: any) => {
        if (editingProduct) {
            setBankProducts(bankProducts.map(p => p.id === productData.id ? { ...productData, active: p.active } : p));
        } else {
            setBankProducts([...bankProducts, { ...productData, id: Date.now(), active: true }]);
        }
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleToggleProductStatus = (id: number) => {
        setBankProducts(bankProducts.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };

    const handleOpenShopModal = (product: any = null) => {
        setEditingShopProduct(product);
        setModalIcon(product?.icon || '/assets/c4d_shop.png');
        setIsShopModalOpen(true);
    };

    const handleOpenChannelModal = (channel: any) => {
        setEditingChannel(channel);
        setIsChannelModalOpen(true);
    };

    const handleSaveShopProduct = (productData: any) => {
        if (editingShopProduct) {
            setShopProducts(shopProducts.map(p => p.id === productData.id ? productData : p));
        } else {
            setShopProducts([{ ...productData, id: Date.now() }, ...shopProducts]);
        }
        setIsShopModalOpen(false);
        setEditingShopProduct(null);
    };

    const handleSaveChannel = (channelData: any) => {
        setChannels(channels.map(c => c.id === channelData.id ? channelData : c));
        setIsChannelModalOpen(false);
        setEditingChannel(null);
    };

    const handleDeleteShopProduct = (id: number) => {
        setShopProducts(shopProducts.filter(p => p.id !== id));
        // clear from channels
        setChannels(channels.map(c => c.productId === id ? { ...c, productId: null, stock: 0 } : c));
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex font-sans text-slate-800">
            {/* 左侧侧边栏 - 极致还原原本菜单样式 */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen overflow-hidden shrink-0">
                <div className="h-14 flex items-center justify-center border-b border-slate-200 shrink-0">
                    <h1 className="text-blue-600 font-bold text-lg tracking-wide">乐途AI智慧教育管理平台</h1>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
                    {menus.map((menu, idx) => (
                        <div key={idx} className="mb-2">
                            <div
                                className="px-6 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 text-slate-700"
                                onClick={() => toggleMenu(menu.title)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400">{menu.icon}</span>
                                    <span className="font-semibold text-sm">{menu.title}</span>
                                </div>
                                {expandedMenus[menu.title] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                            {expandedMenus[menu.title] && menu.children && (
                                <div className="mt-1">
                                    {menu.children.map((child, cIdx) => (
                                        <div
                                            key={cIdx}
                                            onClick={() => setActiveMenu(child)}
                                            className={`pl-12 pr-6 py-2 text-[13px] cursor-pointer transition-colors ${activeMenu === child
                                                ? 'bg-blue-50 text-blue-600 font-bold border-r-4 border-blue-600'
                                                : 'text-slate-500 hover:text-blue-500'
                                                }`}
                                        >
                                            {child}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* 右侧主体区 */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* 顶栏 - 还原样式 */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4 text-slate-500 text-[13px]">
                        <Menu size={18} className="cursor-pointer hover:text-blue-600 transition-colors" />
                        <span className="text-slate-200">/</span>
                        <span className="font-semibold text-slate-700">货柜机配置中心</span>
                        <span className="text-slate-200">/</span>
                        <span className="font-semibold text-slate-700">{activeMenu}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[13px]">
                        <span className="text-slate-600">欢迎，管理员 [成都七中初中附属小学]</span>
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:opacity-90 shadow-sm">
                            <User size={16} />
                        </div>
                    </div>
                </header>

                {/* 内容区 - 采用精致的高端设计 */}
                <main className="flex-1 overflow-y-auto p-8 bg-[#f5f7fa] custom-scrollbar">

                    {/* 页面主标题 */}
                    <div className="mb-8 transform animate-in fade-in slide-in-from-left-4 duration-500">
                        <h2 className="text-2xl font-[900] text-slate-800 tracking-tight">{activeMenu}</h2>
                        <div className="h-1 w-12 bg-blue-600 rounded-full mt-2"></div>
                    </div>

                    {/* 货币发放管理 - 增加标签页切换以分离自动模型和手动发币 */}
                    {activeMenu === '货币发放管理' && (
                        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden transform animate-in fade-in slide-in-from-bottom-6 duration-700 flex flex-col min-h-[600px]">
                            <div className="p-8 border-b border-slate-50 flex flex-col gap-6 bg-white shrink-0">
                                {/* 内部 Tab 切换器 */}
                                <div className="flex bg-slate-100 rounded-xl p-1 self-start inline-flex">
                                    <button onClick={() => setIssuanceTab('auto')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${issuanceTab === 'auto' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>自动发放规则</button>
                                    <button onClick={() => setIssuanceTab('manual')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${issuanceTab === 'manual' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>手动发放</button>
                                </div>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                                {/* 自动发币模型配置区域 */}
                                {issuanceTab === 'auto' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
                                        {/* 头部标题区域 */}
                                        <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                    <Coins size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-800">自动发放规则配置</h3>
                                                    <p className="text-slate-500 text-sm mt-1">设置并自动计算各发放池的额度，采用「保底+竞争」双池模型预防通胀</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 表单内容区 */}
                                        <div className="p-8 space-y-10">
                                            {/* 核心设置区段 */}
                                            <div className="space-y-8">

                                                {/* 预算与发币周期设置 */}
                                                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl"></div>
                                                    <div className="flex flex-col gap-5">

                                                        {/* 发币周期选择 */}
                                                        <div className="flex items-center gap-4">
                                                            <label className="text-sm font-semibold text-slate-700 w-24">发币周期</label>
                                                            <div className="flex bg-slate-200/50 p-1 rounded-lg">
                                                                <button
                                                                    onClick={() => setIssueCycle('monthly')}
                                                                    className={`px-6 py-1.5 text-sm font-bold rounded-md transition-all ${issueCycle === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                                                >
                                                                    按月度发放
                                                                </button>
                                                                <button
                                                                    onClick={() => setIssueCycle('weekly')}
                                                                    className={`px-6 py-1.5 text-sm font-bold rounded-md transition-all ${issueCycle === 'weekly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                                                >
                                                                    按周度发放
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="h-px w-full bg-slate-200"></div>

                                                        {/* 预算输入 */}
                                                        <div className="flex flex-col gap-2 mt-1">
                                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                                班级总预算 <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Base Pool</span>
                                                            </label>
                                                            <div className="flex items-end gap-3 mt-1">
                                                                <div className="relative w-64">
                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                                                        <Coins size={20} />
                                                                    </span>
                                                                    <input
                                                                        type="number"
                                                                        value={budgetPool}
                                                                        onChange={(e) => setBudgetPool(Math.max(0, Number(e.target.value)))}
                                                                        className="w-full bg-white border border-slate-300 rounded-lg pl-12 pr-4 py-3 text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                                                                    />
                                                                </div>
                                                                <span className="text-slate-500 font-medium mb-3">校园币 / 班级 / {issueCycle === 'monthly' ? '月' : '周'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 比例分配与自动计算结果 */}
                                                <div className="grid grid-cols-2 gap-6">
                                                    {/* 保底池 */}
                                                    <div className="p-6 border border-slate-200 rounded-xl bg-white hover:border-blue-300 transition-colors">
                                                        <div className="flex justify-between items-center mb-6">
                                                            <div>
                                                                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div> 阳光保底池
                                                                </h4>
                                                                <p className="text-xs text-slate-500 mt-1">保障每位学生的基准参与感</p>
                                                            </div>
                                                            <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                                                                人均发放
                                                            </span>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">分配比例设置</label>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative w-32">
                                                                        <input
                                                                            type="number"
                                                                            value={guaranteedRate}
                                                                            onChange={(e) => {
                                                                                let val = Number(e.target.value);
                                                                                val = Math.max(0, Math.min(100, val));
                                                                                setGuaranteedRate(val);
                                                                                setCompetitiveRate(100 - val);
                                                                            }}
                                                                            className="w-full bg-slate-50 border border-slate-300 rounded-md pr-8 pl-4 py-2 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                                                    </div>
                                                                    <input
                                                                        type="range"
                                                                        min="0" max="100"
                                                                        value={guaranteedRate}
                                                                        onChange={(e) => {
                                                                            const val = Number(e.target.value);
                                                                            setGuaranteedRate(val);
                                                                            setCompetitiveRate(100 - val);
                                                                        }}
                                                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                                                                <span className="text-sm font-medium text-slate-500">本池具体额度:</span>
                                                                <div className="text-right">
                                                                    <span className="text-3xl font-black text-green-600">
                                                                        {Math.floor(budgetPool * (guaranteedRate / 100)).toLocaleString()}
                                                                    </span>
                                                                    <span className="text-sm font-bold text-slate-400 ml-1">币</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 竞争池 */}
                                                    <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50">
                                                        <div className="flex justify-between items-center mb-6">
                                                            <div>
                                                                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div> 荣誉竞争池
                                                                </h4>
                                                                <p className="text-xs text-slate-500 mt-1">用于高分奖励，激发向上动力</p>
                                                            </div>
                                                            <span className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                                                                排名发放
                                                            </span>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">剩余比例 (系统自动计算)</label>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative w-32 opacity-70 cursor-not-allowed">
                                                                        <input
                                                                            type="text"
                                                                            value={competitiveRate}
                                                                            disabled
                                                                            className="w-full bg-slate-100 border border-slate-300 rounded-md pr-8 pl-4 py-2 text-lg font-bold text-slate-600"
                                                                        />
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                                                    </div>
                                                                    <div className="w-full h-2 bg-slate-200 rounded-lg overflow-hidden flex">
                                                                        <div className="bg-green-500 h-full transition-all" style={{ width: `${guaranteedRate}%` }}></div>
                                                                        <div className="bg-orange-500 h-full transition-all" style={{ width: `${competitiveRate}%` }}></div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                                                                <span className="text-sm font-medium text-slate-500">本池具体额度:</span>
                                                                <div className="text-right">
                                                                    <span className="text-3xl font-black text-orange-500">
                                                                        {Math.floor(budgetPool * (competitiveRate / 100)).toLocaleString()}
                                                                    </span>
                                                                    <span className="text-sm font-bold text-slate-400 ml-1">币</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                            {/* 高级设置区段 */}
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">高级展示设置</h4>

                                                <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 text-slate-400">
                                                            <Info size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-bold text-slate-700">在终端显示班级总排行榜</h4>
                                                            <p className="text-sm text-slate-500 mt-1">关闭后，学生在终端只能看到自己前后的排名，避免分数焦虑。</p>
                                                        </div>
                                                    </div>

                                                    {/* 标准 Switch 开关 */}
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={showRank}
                                                            onChange={() => setShowRank(!showRank)}
                                                        />
                                                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                                        <span className="ml-3 text-sm font-medium text-slate-600 w-12 text-right">
                                                            {showRank ? '已开启' : '已关闭'}
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* 底部操作栏 */}
                                            <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
                                                <button className="px-6 py-2.5 border border-slate-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                                                    重置为默认
                                                </button>
                                                <button className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2">
                                                    保存自动发放规则配置
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 手动定向发放区段 */}
                                {issuanceTab === 'manual' && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
                                        <div className="px-8 py-6 border-b border-slate-200 bg-orange-50/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                                    <Sparkles size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-800">班级定向校园币发放</h3>
                                                    <p className="text-slate-500 text-sm mt-1">适用于流动红旗、运动会获奖等临时性集体奖励</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* 左侧：选择与计算 */}
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                                            1. 选择目标班级
                                                        </label>
                                                        <select
                                                            value={manualClass}
                                                            onChange={(e) => setManualClass(e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                                        >
                                                            <option value="" disabled>请选择班级...</option>
                                                            {Object.keys(classData).map(cName => (
                                                                <option key={cName} value={cName}>{cName}</option>
                                                            ))}
                                                        </select>
                                                        {manualClass && (
                                                            <div className="text-xs text-orange-600 font-bold bg-orange-50 w-max px-2.5 py-1 rounded inline-flex items-center gap-1.5 mt-1">
                                                                <Users size={14} /> 当前班级总人数：{selectedClassStudentCount} 人
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                                            2. 每人发放数量
                                                        </label>
                                                        <div className="flex items-center gap-3 relative">
                                                            <div className="relative flex-1">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                                    <Coins size={18} />
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    value={manualPerStudent}
                                                                    onChange={(e) => setManualPerStudent(Math.max(0, Number(e.target.value)))}
                                                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-12 pr-4 py-3 text-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                                                />
                                                            </div>
                                                            <span className="text-slate-500 font-medium whitespace-nowrap">校园币 / 人</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white shadow-md relative overflow-hidden">
                                                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                                            <Coins size={100} />
                                                        </div>
                                                        <div className="relative z-10">
                                                            <div className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-1">本次发放总计</div>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-4xl font-black">{totalManualIssuance.toLocaleString()}</span>
                                                                <span className="font-medium text-orange-100">校园币</span>
                                                            </div>
                                                            <div className="mt-2 text-xs text-orange-100 opacity-90">
                                                                计算方式: {selectedClassStudentCount} 人 × {manualPerStudent} 币/人
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 右侧：理由与确认 */}
                                                <div className="space-y-6">
                                                    <div className="space-y-3">
                                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                                            3. 选择发放原因
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['流动红旗', '运动会奖励', '文明班级', '劳动实践优秀'].map(reason => (
                                                                <button
                                                                    key={reason}
                                                                    onClick={() => {
                                                                        setManualReason(reason);
                                                                        setCustomReason('');
                                                                    }}
                                                                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${manualReason === reason
                                                                        ? 'bg-orange-50 border-orange-400 text-orange-700 font-bold'
                                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                    {reason}
                                                                </button>
                                                            ))}
                                                            <button
                                                                onClick={() => setManualReason('custom')}
                                                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${manualReason === 'custom'
                                                                    ? 'bg-orange-50 border-orange-400 text-orange-700 font-bold'
                                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                自定义输入
                                                            </button>
                                                        </div>

                                                        {manualReason === 'custom' && (
                                                            <textarea
                                                                value={customReason}
                                                                onChange={(e) => setCustomReason(e.target.value)}
                                                                placeholder="请输入具体奖励事由..."
                                                                rows={3}
                                                                className="w-full mt-3 bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                                                            ></textarea>
                                                        )}
                                                    </div>

                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed">
                                                        <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                                                            <AlertCircle size={16} className="text-blue-500" /> 操作提示
                                                        </div>
                                                        发放操作确认后，相应的校园币将实时打入对应班级每位学生的可用余额账户中，并在「成长足迹中心」产生流水记录。此操作无法撤销。
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 底部操作栏 */}
                                            <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
                                                <button
                                                    className={`px-8 py-3 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2 ${manualClass && manualPerStudent > 0
                                                        ? 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
                                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                    disabled={!manualClass || manualPerStudent <= 0}
                                                    onClick={() => {
                                                        if (!manualClass || manualPerStudent <= 0) return;
                                                        alert(`已成功发放 ${totalManualIssuance} 校园币至 ${manualClass}`);
                                                        setManualClass('');
                                                        setManualPerStudent(0);
                                                    }}
                                                >
                                                    确认确认，立即发放
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 货柜超市管理 */}
                    {activeMenu === '货柜超市管理' && (
                        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden transform animate-in fade-in slide-in-from-bottom-6 duration-700 flex flex-col min-h-[600px]">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                                <div>
                                    <div className="flex bg-slate-100 rounded-xl p-1">
                                        <button onClick={() => setShopActiveTab('channels')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${shopActiveTab === 'channels' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>货道配置 (50)</button>
                                        <button onClick={() => setShopActiveTab('products')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${shopActiveTab === 'products' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>基础商品库</button>
                                    </div>
                                </div>
                                {shopActiveTab === 'products' && (
                                    <div className="flex gap-4 self-start">
                                        <button onClick={() => handleOpenShopModal()} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-2">
                                            <Plus size={20} /> 新建商品
                                        </button>
                                    </div>
                                )}
                            </div>

                            {shopActiveTab === 'products' && (
                                <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead>
                                            <tr className="text-slate-400 text-[11px] font-[900] uppercase tracking-[0.15em]">
                                                <th className="py-6 px-10">商品名/SKU</th>
                                                <th className="py-6 px-6">售价 (校园币)</th>
                                                <th className="py-6 px-10 text-right">管理操作</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {shopProducts.map((item, index) => (
                                                <tr key={item.id} className="active:bg-slate-50 transition-all cursor-pointer border-b border-slate-50 last:border-0">
                                                    <td className="py-6 px-10">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform overflow-hidden">
                                                                {item.icon.includes('http') || item.icon.includes('/') || item.icon.startsWith('data:') ? <img src={item.icon} className="w-full h-full object-cover" alt={item.name} /> : item.icon}
                                                            </div>
                                                            <div>
                                                                <span className="font-black text-slate-800 text-lg block">{item.name}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-6">
                                                        <div className="flex items-center gap-2 font-black text-orange-500 text-xl">
                                                            <Coins size={22} className="text-orange-400" />
                                                            {item.price}
                                                        </div>
                                                    </td>
                                                    <td className="py-6 px-10 text-right">
                                                        <div className="flex justify-end gap-3 transition-all">
                                                            <button onClick={(e) => { e.stopPropagation(); handleOpenShopModal(item); }} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 active:text-blue-600 active:border-blue-200 active:bg-blue-50 shadow-sm transition-colors"><PenTool size={18} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteShopProduct(item.id); }} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 active:text-red-500 active:border-red-200 active:bg-red-50 shadow-sm transition-colors"><Plus size={18} className="transform rotate-45" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {shopProducts.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="py-20 text-center text-slate-400 font-bold">商品库为空，请先新建商品</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {shopActiveTab === 'channels' && (
                                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                                    <p className="text-slate-500 font-bold mb-6 text-sm flex items-center gap-2"><Info size={16} /> 点击对应编号的货道为其配置商品。每个货道最大容量为 10 件。</p>

                                    {[
                                        { title: '挂钩货道', count: 10, offset: 0 },
                                        { title: '弹簧货道', count: 10, offset: 10 },
                                        { title: '推杆货道', count: 30, offset: 20 }
                                    ].map(group => (
                                        <div key={group.title} className="mb-8 last:mb-0 bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                                            <h4 className="text-lg font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                        <span className="text-sm border-2 border-current rounded-full w-5 h-5 flex items-center justify-center">{group.title[0]}</span>
                                                    </div>
                                                    {group.title} <span className="text-sm text-slate-400 font-bold">({group.offset + 1}-{group.offset + group.count})</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setChannels(channels.map((c, idx) => {
                                                            if (idx >= group.offset && idx < group.offset + group.count && c.productId !== null) {
                                                                return { ...c, stock: 10 };
                                                            }
                                                            return c;
                                                        }));
                                                    }}
                                                    className="px-3 py-1.5 flex items-center gap-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95 transition-all outline-none text-xs font-bold"
                                                >
                                                    <Database size={12} /> 一键补满本区
                                                </button>
                                            </h4>
                                            <div className="grid grid-cols-5 gap-4">
                                                {channels.slice(group.offset, group.offset + group.count).map((channel) => {
                                                    const product = shopProducts.find(p => p.id === channel.productId);
                                                    return (
                                                        <div
                                                            key={channel.id}
                                                            onClick={() => handleOpenChannelModal(channel)}
                                                            className={`bg-white rounded-2xl p-4 border-2 transition-all cursor-pointer shadow-sm active:scale-95 group ${product ? 'border-blue-100 hover:border-blue-300' : 'border-dashed border-slate-200 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-lg font-black text-slate-800">{channel.id}</span>
                                                                </div>
                                                                {product && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${channel.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                                            存: {channel.stock}/10
                                                                        </span>
                                                                        {channel.stock < 10 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setChannels(channels.map(c => c.id === channel.id ? { ...c, stock: 10 } : c));
                                                                                }}
                                                                                className="h-5 px-1.5 flex items-center gap-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all outline-none text-[10px] font-bold"
                                                                                title="一键补满"
                                                                            >
                                                                                <Database size={10} /> 补满
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {product ? (
                                                                <div className="flex items-center gap-3">
                                                                    <img src={product.icon} alt="" className="w-10 h-10 object-contain drop-shadow-sm" />
                                                                    <div className="min-w-0">
                                                                        <div className="text-sm font-black text-slate-800 truncate">{product.name}</div>
                                                                        <div className="text-orange-500 font-bold text-xs font-[NumberFont]">{product.price} 币</div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="h-10 flex items-center justify-center text-slate-300 font-bold text-xs group-active:text-slate-400">
                                                                    + 空闲货道
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 历次发币记录 - 任务历史 */}
                    {activeMenu === '历次发币记录' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* 头部标题区域 */}
                            <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">历次发币任务记录</h3>
                                        <p className="text-slate-500 text-sm mt-1">以发放任务（Task）为维度，展示系统历次执行的批量发币记录</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none">
                                        <option>全部年级</option>
                                        <option>一年级</option>
                                        <option>二年级</option>
                                    </select>
                                    <select className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none">
                                        <option>本月 (10月)</option>
                                        <option>上月 (9月)</option>
                                        <option>本周</option>
                                        <option>上周</option>
                                        <option>自定义时间...</option>
                                    </select>
                                    <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-sm">
                                        导出 Excel
                                    </button>
                                </div>
                            </div>

                            {/* 报表主体 - 任务列表 */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-[13px] font-bold">
                                            <th className="py-4 px-6 border-b border-slate-200">发币任务 / 学期</th>
                                            <th className="py-4 px-6 border-b border-slate-200">发币时间</th>
                                            <th className="py-4 px-6 border-b border-slate-200">发币考评周期</th>
                                            <th className="py-4 px-6 border-b border-slate-200 max-w-xs">发币对象</th>
                                            <th className="py-4 px-6 border-b border-slate-200">发币标准</th>
                                            <th className="py-4 px-6 border-b border-slate-200">发币总量</th>
                                            <th className="py-4 px-6 border-b border-slate-200 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {[
                                            {
                                                term: '2025-2026年下学期', title: '第 1 次发币', time: '2026-03-09',
                                                cycle: '2026-03-02～2026-03-08', targets: '2020级1班、2020级2班...',
                                                rate: '100币 / 班级', total: 200000
                                            },
                                            {
                                                term: '2025-2026年下学期', title: '配置测试发币', time: '2026-03-01',
                                                cycle: '测试任务', targets: '全校所有班级',
                                                rate: '100币 / 班级', total: 2000
                                            },
                                            {
                                                term: '2025-2026年上学期', title: '第 20 次发币', time: '2026-01-15',
                                                cycle: '2026-01-08～2026-01-14', targets: '2020级1班、2020级2班...',
                                                rate: '保底30币+排位竞争', total: 100000
                                            },
                                            {
                                                term: '2025-2026年上学期', title: '第 19 次发币', time: '2026-01-08',
                                                cycle: '2026-01-01～2026-01-07', targets: '2020级1班、2020级2班...',
                                                rate: '保底30币+排位竞争', total: 100000
                                            }
                                        ].map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-slate-800">{item.title}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{item.term}</div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-600 font-medium">{item.time}</td>
                                                <td className="py-4 px-6 text-sm text-slate-500">{item.cycle}</td>
                                                <td className="py-4 px-6 text-sm text-slate-500 truncate max-w-[150px]" title={item.targets}>
                                                    {item.targets}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold text-slate-800">{item.rate}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-black text-indigo-600 text-lg flex items-center gap-1.5">
                                                        <Coins size={16} className="text-indigo-400" />
                                                        {item.total.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold inline-flex items-center gap-1 transition-colors">
                                                        <FileText size={16} /> 班级明细
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 分页区 */}
                            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-sm text-slate-500">
                                <div>共计 24 条记录</div>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50">上一页</button>
                                    <button className="px-3 py-1.5 border border-slate-300 rounded bg-blue-50 text-blue-600">1</button>
                                    <button className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50">2</button>
                                    <button className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50">下一页</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 储蓄银行配置 */}
                    {activeMenu === '储蓄银行配置' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            {/* 活期存款配置卡片 */}
                            <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 p-10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-green-400"></div>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        活期存款设置
                                        <span className="bg-green-100 text-green-700 text-[12px] px-2.5 py-1 rounded font-bold tracking-wider">随存随取</span>
                                    </h3>
                                    <p className="text-slate-400 font-bold mt-2 text-sm">设置基础活期日利率</p>
                                </div>
                                <div className="flex flex-col xl:flex-row gap-8 xl:items-end p-2">
                                    <div className="flex items-end gap-6 shrink-0">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-500">活期日利率</label>
                                            <div className="relative w-48">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={currentDailyRate}
                                                    onChange={(e) => setCurrentDailyRate(Number(e.target.value))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-lg font-black text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-500">折合年利率 (约)</label>
                                            <div className="text-2xl font-black text-green-600 pb-2">{(currentDailyRate * 365).toFixed(2)}%</div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col gap-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <Info size={16} className="text-blue-500" /> 收益体验试算 <span className="text-slate-400 font-normal">（假设存入 1000 校园币）</span>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-center">
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold mb-1">一天</div>
                                                <div className="text-sm font-black text-slate-800">
                                                    <span className="text-blue-600">{(1000 * (currentDailyRate / 100) * 1).toFixed(2)}</span> 币
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold mb-1">一周</div>
                                                <div className="text-sm font-black text-slate-800">
                                                    <span className="text-blue-600">{(1000 * (currentDailyRate / 100) * 7).toFixed(2)}</span> 币
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold mb-1">一个月</div>
                                                <div className="text-sm font-black text-slate-800">
                                                    <span className="text-blue-600">{(1000 * (currentDailyRate / 100) * 30).toFixed(2)}</span> 币
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold mb-1">半年</div>
                                                <div className="text-sm font-black text-slate-800">
                                                    <span className="text-blue-600">{(1000 * (currentDailyRate / 100) * 180).toFixed(2)}</span> 币
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                                <div className="text-xs text-slate-400 font-bold mb-1">一年</div>
                                                <div className="text-sm font-black text-slate-800">
                                                    <span className="text-blue-600">{(1000 * (currentDailyRate / 100) * 365).toFixed(2)}</span> 币
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 定期存单产品卡片 */}
                            <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 p-10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                                <div>
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Landmark className="text-indigo-500" size={28} /> 定期存单设置</h3>
                                            <p className="text-slate-400 font-bold mt-2 text-sm">管理定期存单的利率、存期等参数</p>
                                        </div>
                                        <button
                                            onClick={() => handleOpenProductModal()}
                                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <Plus size={16} /> 添加存单产品
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {bankProducts.map((plan) => (
                                            <div key={plan.id} className={`flex items-center justify-between bg-white border ${plan.active ? 'border-slate-200 shadow-sm hover:shadow-md' : 'border-slate-100 opacity-60 bg-slate-50/50'} rounded-2xl p-5 transition-all relative`}>
                                                {/* 左侧信息 */}
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 ${plan.active ? 'text-indigo-500' : 'text-slate-300'} transition-colors`}>
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                                            {plan.label}
                                                            {!plan.active && <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded shadow-inner border border-slate-200">进入未展示状态</span>}
                                                        </h5>
                                                        <p className="text-slate-400 text-xs font-bold mt-1">需存满 {plan.days} 天 <span className="mx-2 text-slate-300">|</span> {plan.desc}</p>
                                                    </div>
                                                </div>

                                                {/* 中间信息区 */}
                                                <div className="flex items-center gap-10 mr-8">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] text-slate-400 font-bold mb-1 uppercase tracking-widest">满期收益率</span>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className={`text-xl font-black ${plan.active ? 'text-indigo-600' : 'text-slate-500'}`}>{(plan.rate * 100).toFixed(1)}%</span>
                                                            <span className="text-xs text-slate-400 font-bold">
                                                                (年化 {((plan.rate / plan.days) * 365 * 100).toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] text-slate-400 font-bold mb-1 uppercase tracking-widest">起存金额</span>
                                                        <div className="flex items-center gap-1.5 h-7">
                                                            <Coins size={16} className={plan.active ? 'text-orange-400' : 'text-slate-400'} />
                                                            <span className={`text-lg font-black ${plan.active ? 'text-slate-700' : 'text-slate-400'}`}>{plan.min}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`flex flex-col justify-center px-4 py-2 rounded-xl border ${plan.active ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'} min-w-[130px]`}>
                                                        <span className="text-[10px] text-slate-500 font-bold mb-0.5">存1000币收益试算</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className={`text-lg font-black ${plan.active ? 'text-emerald-600' : 'text-slate-400'}`}>+{parseFloat((1000 * plan.rate).toFixed(2))}</span>
                                                            <span className="text-[11px] text-slate-400 font-bold">币</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 操作区 */}
                                                <div className="flex gap-3 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleOpenProductModal(plan)}
                                                        className={`px-5 py-2 rounded-xl border border-slate-200 ${plan.active ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-white'} font-bold text-sm transition-colors flex items-center justify-center gap-1.5`}
                                                    >
                                                        <PenTool size={14} /> 编辑
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleProductStatus(plan.id)}
                                                        className={`px-5 py-2 rounded-xl font-bold text-sm transition-colors ${plan.active ? 'bg-slate-100 text-slate-400 hover:bg-orange-50 hover:text-orange-500' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                    >
                                                        {plan.active ? '不展示(停止新签)' : '重新展示并可签署'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 设备基础配置 */}
                    {activeMenu === '设备基础配置' && (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* 头部标题区域 */}
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center gap-5">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                                    <MonitorSmartphone size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">终端设备及首页配置</h3>
                                    <p className="text-slate-500 font-medium mt-1.5 flex items-center gap-2">
                                        <Sparkles size={14} className="text-orange-400" /> 控制学生所见货柜终端的品牌文案及核心入口
                                    </p>
                                </div>
                            </div>

                            {/* 表单内容区 */}
                            <div className="p-10 space-y-12 bg-slate-50/30">

                                {/* 品牌标识配置区 */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">1</div>
                                        <h4 className="text-lg font-bold text-slate-800">品牌及欢迎语配置</h4>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-8">
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">主标题前缀</label>
                                                <input value={terminalConfig.mainTitle} onChange={(e) => setTerminalConfig({ ...terminalConfig, mainTitle: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">主标题后缀 (强调色)</label>
                                                <input value={terminalConfig.subTitle} onChange={(e) => setTerminalConfig({ ...terminalConfig, subTitle: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-blue-600 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">副标题 / Slogan</label>
                                            <textarea value={terminalConfig.slogan} onChange={(e) => setTerminalConfig({ ...terminalConfig, slogan: e.target.value })} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"></textarea>
                                        </div>
                                    </div>
                                </section>

                                {/* 功能入口配置区 */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">2</div>
                                        <h4 className="text-lg font-bold text-slate-800">模块入口文案配置</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5">
                                        {/* 成长足迹 */}
                                        <div className="bg-white p-5 rounded-2xl border border-orange-100/50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex gap-6 hover:shadow-md transition-shadow relative overflow-hidden">
                                            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-orange-400"></div>
                                            <div className="bg-orange-50 w-20 h-20 rounded-xl flex items-center justify-center shrink-0 border border-orange-100">
                                                <img src="/assets/c4d_growth.png" alt="" className="w-12 h-12 object-contain" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 flex-1">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">模块名称</label>
                                                    <input value={terminalConfig.growthLabel} onChange={(e) => setTerminalConfig({ ...terminalConfig, growthLabel: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-orange-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">描述文案</label>
                                                    <input value={terminalConfig.growthDesc} onChange={(e) => setTerminalConfig({ ...terminalConfig, growthDesc: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 文创超市 */}
                                        <div className="bg-white p-5 rounded-2xl border border-pink-100/50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex gap-6 hover:shadow-md transition-shadow relative overflow-hidden">
                                            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-pink-400"></div>
                                            <div className="bg-pink-50 w-20 h-20 rounded-xl flex items-center justify-center shrink-0 border border-pink-100">
                                                <img src="/assets/c4d_shop.png" alt="" className="w-12 h-12 object-contain" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 flex-1">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">模块名称</label>
                                                    <input value={terminalConfig.shopLabel} onChange={(e) => setTerminalConfig({ ...terminalConfig, shopLabel: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-pink-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">描述文案</label>
                                                    <input value={terminalConfig.shopDesc} onChange={(e) => setTerminalConfig({ ...terminalConfig, shopDesc: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 储蓄银行 */}
                                        <div className="bg-white p-5 rounded-2xl border border-blue-100/50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex gap-6 hover:shadow-md transition-shadow relative overflow-hidden">
                                            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-500"></div>
                                            <div className="bg-blue-50 w-20 h-20 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                                                <img src="/assets/c4d_bank.png" alt="" className="w-12 h-12 object-contain" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 flex-1">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">模块名称</label>
                                                    <input value={terminalConfig.bankLabel} onChange={(e) => setTerminalConfig({ ...terminalConfig, bankLabel: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">描述文案</label>
                                                    <input value={terminalConfig.bankDesc} onChange={(e) => setTerminalConfig({ ...terminalConfig, bankDesc: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* 校园币图标配置区 */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">3</div>
                                        <h4 className="text-lg font-bold text-slate-800">校园币图标配置</h4>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <label className="block text-sm font-bold text-slate-700 mb-4">系统全局所用货币图标，可采用各校个性化设计样式</label>
                                        <div className="flex flex-wrap gap-4">
                                            {[
                                                { id: '1', url: '/assets/coin.png', name: '经典铜钱' },
                                                { id: '2', url: '/assets/c4d_growth.png', name: '成长勋章' },
                                                { id: '3', url: '/assets/c4d_shop.png', name: '星光钻' },
                                                { id: '4', url: '/assets/c4d_bank.png', name: '博学水晶' }
                                            ].map(icon => (
                                                <button
                                                    key={icon.id}
                                                    onClick={() => setTerminalConfig({ ...terminalConfig, coinIconUrl: icon.url })}
                                                    className={`relative p-3 rounded-2xl border-2 transition-all group w-28 ${terminalConfig.coinIconUrl === icon.url ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-slate-100 hover:border-slate-300 bg-slate-50'}`}
                                                >
                                                    <div className="w-full h-16 rounded-xl flex items-center justify-center bg-white shadow-sm mb-2 p-2 relative overflow-hidden">
                                                        <img src={icon.url} alt={icon.name} className={`w-10 h-10 object-contain transition-transform group-active:scale-95 z-10 ${terminalConfig.coinIconUrl === icon.url ? 'drop-shadow-sm scale-110' : ''}`} />
                                                    </div>
                                                    <span className={`text-[12px] font-bold block text-center ${terminalConfig.coinIconUrl === icon.url ? 'text-blue-700' : 'text-slate-500'}`}>{icon.name}</span>
                                                    {terminalConfig.coinIconUrl === icon.url && (
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-sm">
                                                            <Check size={14} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}

                                            {/* 自定义上传占位 */}
                                            <button className="relative w-28 p-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group opacity-60 flex flex-col items-center justify-center">
                                                <div className="w-full h-16 rounded-xl flex flex-col items-center justify-center bg-white shadow-sm mb-2 p-2 text-slate-400 group-hover:text-blue-500">
                                                    <Upload size={24} className="mb-1" />
                                                </div>
                                                <span className="text-[12px] font-bold block text-center text-slate-500 group-hover:text-blue-600">上传新图标</span>
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                {/* 底部操作栏 */}
                                <div className="pt-6 border-t border-slate-200 flex justify-end gap-4 mt-8">
                                    <button className="px-6 py-3 border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-white hover:shadow-sm transition-all focus:outline-none">
                                        重置为默认
                                    </button>
                                    <button className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                                        保存配置发布到设备
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 其它待开发 */}
                    {['学校驾驶舱', '评价指标管理'].includes(activeMenu) && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-slate-400 animate-in zoom-in-95">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                                <Settings size={40} />
                            </div>
                            <h4 className="text-xl font-black text-slate-400">【{activeMenu}】模块打磨中</h4>
                            <p className="text-slate-300 font-bold mt-2 text-center max-w-xs">正在为您设计极致的交互体验，请稍后体验...</p>
                        </div>
                    )}
                </main>
            </div >

            {/* Shop Product Modal */}
            {
                isShopModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                    <Package size={20} className="text-blue-600" />
                                    {editingShopProduct ? '编辑商品' : '新增商品'}
                                </h3>
                                <button onClick={() => setIsShopModalOpen(false)} className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                <form id="shop-product-form" onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const newProduct = {
                                        id: editingShopProduct?.id || Date.now(),
                                        name: formData.get('name') as string,
                                        price: Number(formData.get('price')),
                                        icon: modalIcon
                                    };
                                    handleSaveShopProduct(newProduct);
                                }}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">商品名称</label>
                                            <input name="name" defaultValue={editingShopProduct?.name || ''} required className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" placeholder="例如：校庆限量徽章" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">售价 (校园币)</label>
                                            <input type="number" name="price" defaultValue={editingShopProduct?.price || 10} required min="0" className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-orange-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-4">商品图片设置 (支持默认或上传)</label>
                                        <div className="flex flex-wrap gap-4">
                                            {[
                                                { id: '1', url: '/assets/c4d_shop.png', name: '默认商品图' }
                                            ].map(icon => (
                                                <button
                                                    key={icon.id}
                                                    type="button"
                                                    onClick={() => setModalIcon(icon.url)}
                                                    className={`relative p-3 rounded-2xl border-2 transition-all active:scale-95 group w-24 ${modalIcon === icon.url ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100' : 'border-slate-100 bg-slate-50'}`}
                                                >
                                                    <div className="w-full h-12 rounded-xl flex items-center justify-center bg-white shadow-sm mb-2 p-1.5 relative overflow-hidden">
                                                        <img src={icon.url} alt={icon.name} className={`w-full h-full object-contain transition-transform z-10 ${modalIcon === icon.url ? 'drop-shadow-sm scale-110' : ''}`} />
                                                    </div>
                                                    <span className={`text-[11px] font-bold block text-center ${modalIcon === icon.url ? 'text-blue-700' : 'text-slate-500'}`}>{icon.name}</span>
                                                    {modalIcon === icon.url && (
                                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-sm">
                                                            <Check size={12} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}

                                            {/* 自定义上传 */}
                                            <div className="relative w-24 p-3 rounded-2xl border-2 border-dashed border-slate-200 active:border-blue-300 active:bg-blue-50 transition-all group flex flex-col items-center justify-center">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                                if (event.target?.result) {
                                                                    setModalIcon(event.target.result as string);
                                                                }
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <div className="w-full h-12 rounded-xl flex flex-col items-center justify-center bg-white shadow-sm mb-2 p-1.5 text-slate-400 group-active:text-blue-500">
                                                    <Upload size={20} className="mb-0.5" />
                                                </div>
                                                <span className="text-[11px] font-bold block text-center text-slate-500 group-active:text-blue-600">自定义图片</span>
                                            </div>
                                        </div>
                                        {modalIcon && !modalIcon.startsWith('/assets/') && (
                                            <div className="mt-4 p-3 border border-blue-100 bg-blue-50 rounded-xl flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                    <img src={modalIcon} className="w-full h-full object-cover" alt="已上传图片" />
                                                </div>
                                                <div className="text-sm font-bold text-blue-700 flex-1">已成功应用自定义图片</div>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                                <button onClick={() => setIsShopModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">取消</button>
                                <button type="submit" form="shop-product-form" className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">保存</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Channel Configuration Modal */}
            {
                isChannelModalOpen && editingChannel && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                    <Monitor size={20} className="text-blue-600" />
                                    货道 {editingChannel.id} 配置 ({editingChannel.type})
                                </h3>
                                <button onClick={() => setIsChannelModalOpen(false)} className="text-slate-400 active:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                <form id="channel-form" onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const productId = formData.get('productId') ? Number(formData.get('productId')) : null;
                                    const newChannel = {
                                        ...editingChannel,
                                        productId: productId,
                                        stock: productId ? Number(formData.get('stock')) : 0
                                    };
                                    handleSaveChannel(newChannel);
                                }}>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">选择商品放入货道</label>
                                        <select name="productId" defaultValue={editingChannel.productId || ''} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-bold">
                                            <option value="">-- 置空货道 --</option>
                                            {shopProducts.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (售价: {p.price}币)</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">当前库存 (上限10件)</label>
                                        <div className="relative">
                                            <input id="stock-input" type="number" name="stock" defaultValue={editingChannel.stock || 0} min="0" max="10" className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-black text-slate-700 pr-12" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">/ 10</span>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                                <button onClick={() => setIsChannelModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 active:bg-slate-200 transition-colors border border-slate-200">取消</button>
                                <button type="submit" form="channel-form" className="px-8 py-2.5 rounded-xl font-bold text-white bg-blue-600 active:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">放置商品</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 储蓄银行产品配置 Modal */}
            {
                isProductModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Landmark size={20} className="text-indigo-500" />
                                    {editingProduct ? '编辑储蓄产品' : '添加新产品'}
                                </h3>
                                <button
                                    onClick={() => setIsProductModalOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors text-xl font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                let autoRate = Number(formData.get('rate')) / 100;
                                let autoDesc = `满期固定利息${(autoRate * 100).toFixed(1)}%`;

                                handleSaveProduct({
                                    id: editingProduct?.id || Date.now(),
                                    label: formData.get('label') as string,
                                    days: Number(formData.get('days')),
                                    rate: autoRate,
                                    min: Number(formData.get('min')),
                                    desc: autoDesc
                                });
                            }} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">产品名称 <span className="text-red-500">*</span></label>
                                    <input name="label" required defaultValue={editingProduct?.label || ''} placeholder="例如：定期存单-1周" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">存期 (天) <span className="text-red-500">*</span></label>
                                        <input
                                            name="days" type="number" required min="1"
                                            value={modalDays}
                                            onChange={(e) => setModalDays(Math.max(1, Number(e.target.value)))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-right"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5 gap-1">
                                            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">满期利率 (%) <span className="text-red-500">*</span></label>
                                            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 shadow-sm whitespace-nowrap">
                                                折合年化: {((modalRate / (modalDays || 1)) * 365).toFixed(1)}%
                                            </span>
                                        </div>
                                        <input
                                            name="rate" type="number" step="0.01" required min="0"
                                            value={modalRate}
                                            onChange={(e) => setModalRate(Math.max(0, Number(e.target.value)))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-right"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">起存金额 (校园币) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Coins size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input name="min" type="number" required min="1" defaultValue={editingProduct?.min || 1} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                                        取消
                                    </button>
                                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95">
                                        保存产品
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TeacherDashboard;
