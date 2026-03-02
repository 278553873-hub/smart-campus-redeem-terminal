import React, { useMemo, useState } from 'react';
import { 
    BackIcon, FileIcon,
    DeleteIcon, GenericFileIcon, MoreVerticalIcon,
    WechatMoreIcon, WechatCloseIcon
} from '../components/Icons';

interface MyFilesViewProps {
    onBack: () => void;
}

interface FileItem {
    id: string;
    name: string;
    date: string;
    size: string;
    type: 'excel' | 'word' | 'pdf';
    tags: string[];
    monthKey: string;
    monthLabel: string;
}

const getMonthInfo = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return { monthKey: 'unknown', monthLabel: '未分类' };
    }
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return { monthKey: `${year}-${month}`, monthLabel: `${year}年${month}月` };
};

const INITIAL_FILES: Omit<FileItem, 'monthKey' | 'monthLabel'>[] = [
    {
        id: '1',
        name: '体育综合素质评价表三年级体育.xlsx',
        date: '2025-01-01',
        size: '19.2M',
        type: 'excel',
        tags: ['体育', '综合素质', '三年级', '期末成绩', '2024-2025学年']
    },
    {
        id: '2',
        name: '体育综合素质评价表三年级体育-下学期.xlsx',
        date: '2025-06-30',
        size: '18.7M',
        type: 'excel',
        tags: ['体育', '三年级', '体能测试', '行为表现', '下学期']
    },
    {
        id: '3',
        name: '2024秋季学期学生体质健康数据汇总.xlsx',
        date: '2024-12-28',
        size: '4.5M',
        type: 'excel',
        tags: ['体育', '体质健康', '秋季学期', '体测数据']
    },
    {
        id: '4',
        name: '2025年6月体育学科过程性记录.pdf',
        date: '2025-06-12',
        size: '2.4M',
        type: 'pdf',
        tags: ['体育', '过程记录', '课堂表现', '2025年6月']
    },
    {
        id: '5',
        name: '2025-06家校协同计划.docx',
        date: '2025-06-08',
        size: '1.1M',
        type: 'word',
        tags: ['家校协同', '计划', '家长安排', '2025年6月']
    },
    {
        id: '6',
        name: '2025年6月-班级体育月度小结.pdf',
        date: '2025-06-02',
        size: '3.6M',
        type: 'pdf',
        tags: ['体育', '月度总结', '班级', '2025年6月']
    },
];

const getFileIconStyle = (type: FileItem['type']) => {
    switch (type) {
        case 'pdf':
            return { color: 'text-rose-600', badge: 'PDF', badgeColor: 'bg-rose-600' };
        case 'word':
            return { color: 'text-blue-600', badge: 'W', badgeColor: 'bg-blue-600' };
        default:
            return { color: 'text-emerald-600', badge: 'X', badgeColor: 'bg-emerald-600' };
    }
};

const MyFilesView: React.FC<MyFilesViewProps> = ({ onBack }) => {
    const [files, setFiles] = useState<FileItem[]>(() => {
        return INITIAL_FILES.map(file => ({
            ...file,
            ...getMonthInfo(file.date)
        }));
    });
    const [activeMonth, setActiveMonth] = useState<'all' | string>('all');

    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
        setActiveMenuId(null);
    };

    const monthOptions = useMemo(() => {
        const map = new Map<string, string>();
        files.forEach(file => {
            if (!map.has(file.monthKey) && file.monthKey !== 'unknown') {
                map.set(file.monthKey, file.monthLabel);
            }
        });
        return Array.from(map.entries())
            .sort((a, b) => (a[0] < b[0] ? 1 : -1))
            .map(([key, label]) => ({ key, label }));
    }, [files]);

    const filteredFiles = useMemo(() => {
        return activeMonth === 'all' ? files : files.filter(file => file.monthKey === activeMonth);
    }, [files, activeMonth]);

    const groupedFiles = useMemo(() => {
        const groupMap = new Map<string, { key: string; label: string; files: FileItem[] }>();
        filteredFiles.forEach(file => {
            const key = file.monthKey;
            if (!groupMap.has(key)) {
                groupMap.set(key, { key, label: file.monthLabel, files: [] });
            }
            groupMap.get(key)!.files.push(file);
        });
        return Array.from(groupMap.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
    }, [filteredFiles]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            {/* Header (WeChat Style) */}
            <div className="px-4 py-2 bg-white sticky top-0 z-10 border-b border-slate-100 flex items-center justify-between h-[44px]">
                <div className="flex-1 flex justify-start">
                    <button onClick={onBack} className="p-1 -ml-2 active:bg-gray-100 rounded-full text-slate-600 transition-colors">
                        <BackIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <h1 className="text-[17px] font-bold text-slate-900 flex-none">我的文件</h1>
                
                <div className="flex-1 flex justify-end">
                    {/* WeChat Capsule */}
                    <div className="flex items-center bg-white/50 border border-slate-200/80 rounded-full px-3 h-[30px] gap-3 shadow-sm">
                        <div className="w-5 h-5 flex items-center justify-center text-slate-900"><WechatMoreIcon className="w-5 h-5" /></div>
                        <div className="w-[1px] h-3.5 bg-slate-200"></div>
                        <div className="w-5 h-5 flex items-center justify-center text-slate-900"><WechatCloseIcon className="w-4 h-4" /></div>
                    </div>
                </div>
            </div>

            {/* Month Filter */}
            <div className="px-4 py-3 bg-white border-b border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 mb-1">按上传月份筛选</div>
                <div className="relative">
                    <select 
                        value={activeMonth}
                        onChange={(e) => setActiveMonth(e.target.value as 'all' | string)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="all">全部月份</option>
                        {monthOptions.map(option => (
                            <option key={option.key} value={option.key}>{option.label}</option>
                        ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</span>
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 p-4 space-y-5">
                {filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <GenericFileIcon className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm">暂无文件</p>
                    </div>
                ) : (
                    groupedFiles.map(group => (
                        <div key={group.key}>
                            <div className="text-[11px] font-bold text-slate-400 mb-2 px-1">{group.label}</div>
                            <div className="space-y-3">
                            {group.files.map(file => (
                        <div key={file.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 relative group">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {/* File Icon */}
                                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                        <div className="relative">
                                            {(() => {
                                                const { color, badge, badgeColor } = getFileIconStyle(file.type);
                                                return (
                                                    <>
                                                        <FileIcon className={`w-7 h-7 ${color}`} />
                                                        <div className={`absolute -bottom-0.5 -right-0.5 ${badgeColor} text-white text-[8px] font-bold px-0.5 rounded leading-none`}>
                                                            {badge}
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-slate-800 truncate pr-4">{file.name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{file.date}  <span className="ml-2">{file.size}</span></p>
                                    </div>
                                </div>

                                {/* Menu Button */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(activeMenuId === file.id ? null : file.id);
                                    }}
                                    className="p-2 text-slate-300 active:text-slate-600 rounded-full active:bg-slate-50 transition-colors"
                                >
                                    <MoreVerticalIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-3 pl-[52px]">
                                <div className="flex flex-wrap gap-1.5 pr-6">
                                    {file.tags.map(tag => (
                                        <span key={tag} className="text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Popup Menu */}
                            {activeMenuId === file.id && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)}></div>
                                    <div className="absolute top-10 right-4 z-30 bg-white rounded-lg shadow-xl border border-slate-100 p-1 w-24 animate-in fade-in zoom-in duration-100 origin-top-right">
                                        <button 
                                            onClick={() => handleDelete(file.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 active:bg-red-50 rounded-md transition-colors"
                                        >
                                            <DeleteIcon className="w-3.5 h-3.5" />
                                            删除
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                            ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyFilesView;
