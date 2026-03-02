import React, { useState } from 'react';
import {
    LayoutDashboard, FileText, ClipboardList, PenTool,
    Settings, Users, BookOpen, Database, FolderOpen,
    Menu, User, ChevronDown, ChevronRight, Package,
    Landmark, ArrowLeftRight, Coins, Monitor, AlertCircle,
    Info, Search, Plus
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
    // 侧边栏菜单展开状态控制
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
        '货柜机配置中心': true,
        '基础信息配置': false,
    });

    const [activeMenu, setActiveMenu] = useState('发币模型配置');

    const toggleMenu = (title: string) => {
        setExpandedMenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const menus = [
        {
            title: '货柜机配置中心', icon: <Package size={18} />,
            children: ['发币模型配置', '货柜超市管理', '历次发币记录', '储蓄银行配置', '终端设备策略']
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

                    {/* 发币模型配置 - 标准后台风格，增强易读性 */}
                    {activeMenu === '发币模型配置' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* 头部标题区域 */}
                            <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        <Coins size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">班级自动发币模型配置</h3>
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
                                        保存发币模型配置
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 货柜超市管理 */}
                    {activeMenu === '货柜超市管理' && (
                        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden transform animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800">月光宝盒商品管理</h3>
                                    <p className="text-slate-400 font-bold mt-1">控制校园智能终端的货柜上架策略</p>
                                </div>
                                <div className="flex gap-4">
                                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-black text-sm hover:bg-slate-50 transition-all flex items-center gap-2 group">
                                        <Search size={18} className="text-slate-400 group-hover:text-blue-500" /> 搜索商品
                                    </button>
                                    <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center gap-2">
                                        <Plus size={20} /> 添加新项
                                    </button>
                                </div>
                            </div>
                            <div className="p-2">
                                <table className="w-full text-left border-separate border-spacing-0">
                                    <thead>
                                        <tr className="text-slate-400 text-[11px] font-[900] uppercase tracking-[0.15em]">
                                            <th className="py-6 px-10">商品名/SKU</th>
                                            <th className="py-6 px-6">售价 (校园币)</th>
                                            <th className="py-6 px-6">实时库存</th>
                                            <th className="py-6 px-6">分类标签</th>
                                            <th className="py-6 px-10 text-right">管理操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {[
                                            { name: '校庆限量徽章', price: 5, stock: 50, category: '实物商品', icon: '🏅' },
                                            { name: '免写一次语文学科作业', price: 150, stock: 10, category: '虚拟特权', icon: '📝' },
                                            { name: '当一天的代理校长', price: 500, stock: 1, category: '尊享荣誉', icon: '🎓' },
                                            { name: '校园电视台出镜机会', price: 300, stock: 5, category: '虚拟资产', icon: '🎥' },
                                        ].map((item, index) => (
                                            <tr key={index} className="hover:bg-blue-50/40 group transition-all cursor-pointer">
                                                <td className="py-6 px-10">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <span className="font-black text-slate-800 text-lg block">{item.name}</span>
                                                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">REF: SN-010{index}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6">
                                                    <div className="flex items-center gap-2 font-black text-orange-500 text-xl">
                                                        <Coins size={22} className="text-orange-400" />
                                                        {item.price}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`w-3 h-3 rounded-full ${item.stock < 5 ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></span>
                                                        <span className="font-black text-slate-700 text-lg">{item.stock}</span>
                                                        <span className="text-slate-300 font-bold text-xs">UNIT</span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6">
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase ${item.category.includes('虚拟') ? 'bg-purple-100/50 text-purple-600' : 'bg-blue-100/50 text-blue-600'
                                                        }`}>
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-10 text-right">
                                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"><PenTool size={18} /></button>
                                                        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all"><Search size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                                                    <div className="text-sm font-semibold text-slate-800">{item.rate}</div>
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

                    {/* 其它待开发 */}
                    {['储蓄银行配置', '终端设备策略', '学校驾驶舱', '评价指标管理'].includes(activeMenu) && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-20 flex flex-col items-center justify-center text-slate-400 animate-in zoom-in-95">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                                <Settings size={40} />
                            </div>
                            <h4 className="text-xl font-black text-slate-400">【{activeMenu}】模块打磨中</h4>
                            <p className="text-slate-300 font-bold mt-2 text-center max-w-xs">正在为您设计极致的交互体验，请稍后体验...</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TeacherDashboard;
