import React, { useState, useMemo } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';

interface EvaluationRecordsLogViewProps {
    onBack: () => void;
}

// --- Mock Data & Constants ---
const INDICATORS = {
    '诗意中队': {
        '少先队礼仪': ['佩戴规范', '宣誓集会'],
        '中队文化建设': ['图书管理', '文化宣传'],
        '队会课执行': ['队会落实']
    },
    '安全班级': {
        '班级安全秩序': ['公共秩序', '违禁核查'],
        '班级安全教育': ['安全班会', '安全记录', '演练参与', '事故预防']
    },
    '健体班级': {
        '早操体锻': ['精神风貌', '队列姿态', '做操规范', '跑操品质', '退场有序', '组织带队'],
        '眼保健操': ['准备姿态', '眼操品质', '操间纪律', '有效管理']
    },
    '文雅班级': {
        '班级常规': ['文化建设', '内务整理'],
        '路队管理': ['文明放学'],
        '协调精灵': ['职责登记', '职责值岗']
    },
    '美净班级': {
        '环境卫生': ['晨间清洁', '午间清洁'],
        '即时保洁': ['持续维护']
    }
};

const GRADES = ['2025级', '2024级', '2023级', '2022级', '2021级', '2020级'];

const generateMockLogs = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
        // Random Hierarchy
        const l1 = Object.keys(INDICATORS)[Math.floor(Math.random() * Object.keys(INDICATORS).length)];
        const l2Obj = INDICATORS[l1 as keyof typeof INDICATORS] as any;
        const l2 = Object.keys(l2Obj)[Math.floor(Math.random() * Object.keys(l2Obj).length)];
        const l3List = l2Obj[l2];
        const l3 = l3List[Math.floor(Math.random() * l3List.length)];

        const isPositive = Math.random() > 0.3; // 70% positive

        return {
            id: `log_${i}`,
            className: `${GRADES[Math.floor(Math.random() * GRADES.length)]}${Math.floor(Math.random() * 8) + 1}班`,
            l1, l2, l3,
            detail: isPositive ? '表现优秀，特此表扬' : '存在违纪行为，扣分警示',
            score: isPositive ? Math.floor(Math.random() * 5) + 1 : -(Math.floor(Math.random() * 5) + 1),
            time: `${Math.floor(Math.random() * 23) + 1}小时前`,
            timestamp: Date.now() - Math.floor(Math.random() * 100000000)
        };
    });
};

const EvaluationRecordsLogView: React.FC<EvaluationRecordsLogViewProps> = ({ onBack }) => {
    // State
    const [filterTime, setFilterTime] = useState<'today' | 'week' | 'month' | 'term'>('week');

    // Indicator Filters
    const [selectedL1, setSelectedL1] = useState<string>('全部');
    const [selectedL2, setSelectedL2] = useState<string>('全部');
    const [selectedL3, setSelectedL3] = useState<string>('全部');

    const logs = useMemo(() => generateMockLogs(50), []);

    // Filter Logic
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            if (selectedL1 !== '全部' && log.l1 !== selectedL1) return false;
            if (selectedL2 !== '全部' && log.l2 !== selectedL2) return false;
            if (selectedL3 !== '全部' && log.l3 !== selectedL3) return false;
            return true;
        });
    }, [logs, selectedL1, selectedL2, selectedL3]);

    // Helpers for Dropdowns
    const l1Options = ['全部', ...Object.keys(INDICATORS)];
    const l2Options = selectedL1 !== '全部'
        ? ['全部', ...Object.keys(INDICATORS[selectedL1 as keyof typeof INDICATORS])]
        : ['全部'];
    const l3Options = (selectedL1 !== '全部' && selectedL2 !== '全部')
        ? ['全部', ...INDICATORS[selectedL1 as keyof typeof INDICATORS][selectedL2 as any]]
        : ['全部'];

    const Dropdown = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) => {
        const [isOpen, setIsOpen] = useState(false);
        return (
            <div className="relative min-w-[100px] flex-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2 bg-white border rounded-xl text-[12px] font-bold transition-all
                        ${isOpen ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 text-slate-600'}
                    `}
                >
                    <span className="truncate">{value === '全部' ? label : value}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto z-50">
                            {options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => { onChange(opt); setIsOpen(false); }}
                                    className={`w-full text-left px-3 py-2 text-[12px]  font-medium
                                        ${value === opt ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}
                                    `}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
            {/* Header */}
            <div className="bg-white sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-slate-50">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <h1 className="text-[16px] font-black text-slate-800">评价记录明细</h1>
                </div>

                {/* Filters */}
                <div className="p-3 space-y-3">
                    {/* Time Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['today', 'week', 'month', 'term'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterTime(t as any)}
                                className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all
                                    ${filterTime === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}
                                `}
                            >
                                {t === 'today' ? '今日' : t === 'week' ? '本周' : t === 'month' ? '本月' : '本学期'}
                            </button>
                        ))}
                    </div>

                    {/* Indicator Dropdowns */}
                    <div className="flex gap-2">
                        <Dropdown label="一级指标" value={selectedL1} options={l1Options} onChange={(v) => { setSelectedL1(v); setSelectedL2('全部'); setSelectedL3('全部'); }} />
                        <Dropdown label="二级指标" value={selectedL2} options={l2Options} onChange={(v) => { setSelectedL2(v); setSelectedL3('全部'); }} />
                        <Dropdown label="三级指标" value={selectedL3} options={l3Options} onChange={setSelectedL3} />
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-[12px] text-slate-400 font-bold px-1">共找到 {filteredLogs.length} 条记录</div>
                {filteredLogs.map(log => (
                    <div key={log.id} className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[15px] font-black text-slate-800">{log.className}</span>
                            <span className={`font-mono font-black text-[16px] ${log.score > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {log.score > 0 ? '+' : ''}{log.score}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[11px] font-bold border border-blue-100">{log.l1}</span>
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[11px] font-medium border border-slate-100">{log.l2}</span>
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[11px] font-medium border border-slate-100">{log.l3}</span>
                        </div>

                        <div className="flex justify-between items-center text-[12px] text-slate-400 font-medium">
                            <span>{log.time}</span>
                            <span>操作人: 李老师</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EvaluationRecordsLogView;
