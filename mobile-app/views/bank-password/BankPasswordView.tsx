import React, { useState } from 'react';
import { BackIcon, CheckCircleIcon, WechatMoreIcon, WechatCloseIcon, LockIcon, ShieldIcon, SearchIcon, EyeIcon, EyeOffIcon, EditIcon } from '../../components/Icons';
import { MOCK_STUDENTS_CLASS_1 } from '../../constants';

// 模拟自动生成 6 位随机数字密码
const generateRandomPassword = () => Math.floor(100000 + Math.random() * 900000).toString();

interface BankPasswordViewProps {
    classId: string;
    onBack: () => void;
}

export const BankPasswordView: React.FC<BankPasswordViewProps> = ({ classId, onBack }) => {
    // 初始化时为所有学生分配随机密码
    const [students, setStudents] = useState(
        MOCK_STUDENTS_CLASS_1.map(s => ({
            ...s,
            password: generateRandomPassword(),
            showPassword: false
        }))
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempPassword, setTempPassword] = useState('');

    const filteredStudents = students.filter(s =>
        s.name.includes(searchTerm) || s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTogglePassword = (id: string) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, showPassword: !s.showPassword } : s));
    };

    const handleStartEdit = (id: string, current: string) => {
        setEditingId(id);
        setTempPassword(current);
    };

    const handleSaveEdit = () => {
        if (editingId) {
            if (tempPassword.length !== 6 || !/^\d+$/.test(tempPassword)) {
                alert('密码必须为 6 位数字');
                return;
            }
            setStudents(prev => prev.map(s => s.id === editingId ? { ...s, password: tempPassword } : s));
            setEditingId(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between px-4 py-2 bg-white sticky top-0 z-30 h-[44px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex-1 flex justify-start">
                    <button onClick={onBack} className="p-1 -ml-2 text-slate-900 active:bg-slate-100 rounded-full transition-colors">
                        <BackIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-[17px] font-bold text-slate-900 flex-none">设置兑换密码</div>
                <div className="flex-1 flex justify-end">
                    <div className="flex items-center bg-white/50 border border-slate-200/80 rounded-full px-3 h-[30px] gap-3 shadow-sm">
                        <div className="w-5 h-5 flex items-center justify-center text-slate-900"><WechatMoreIcon className="w-5 h-5" /></div>
                        <div className="w-[1px] h-3.5 bg-slate-200"></div>
                        <div className="w-5 h-5 flex items-center justify-center text-slate-900"><WechatCloseIcon className="w-4 h-4" /></div>
                    </div>
                </div>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto">
                {/* Top Info Card - Will scroll away */}
                <div className="p-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-100">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-blue-100/60 text-[9px] font-black uppercase tracking-widest">Security</span>
                                <h2 className="text-lg font-bold">兑换认证密码</h2>
                            </div>
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                <ShieldIcon className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        
                        <div className="bg-black/10 rounded-xl p-2.5 border border-white/10">
                            <p className="text-[10px] leading-relaxed text-blue-50/70">
                                该密码用于货柜机兑换身份认证。系统已自动初始化。您可以点击眼睛图标查看，或点击编辑图标进行调整。
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar - Sticky at top after card scrolls away */}
                <div className="sticky top-0 z-20 px-3 py-2 bg-slate-50/95 backdrop-blur-md">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="搜索学生姓名或学号..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all pl-10"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <SearchIcon className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>

                {/* Student List */}
                <div className="px-3 pb-20 space-y-2">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                            <div key={student.id} className="bg-white rounded-xl px-3 py-2.5 shadow-sm border border-slate-100 flex items-center justify-between group active:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-2.5 text-slate-800">
                                    <div className="w-9 h-9 rounded-full border border-indigo-50 p-0.5 shadow-sm">
                                        <img 
                                            src={student.avatar || `https://i.pravatar.cc/150?u=${student.id}`} 
                                            alt="" 
                                            className="w-full h-full object-cover rounded-full" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="font-bold text-sm leading-tight">{student.name}</div>
                                        {/* 学号字体调整为与货柜机一致的 Baloo 2 */}
                                        <div className="text-[11px] font-bold opacity-60 mt-0.5" style={{ fontFamily: '"Baloo 2", cursive' }}>
                                            {student.id}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {editingId === student.id ? (
                                        <div className="flex items-center gap-1.5 animate-in slide-in-from-right-4 duration-200">
                                            <input
                                                autoFocus
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={tempPassword}
                                                onChange={(e) => setTempPassword(e.target.value.replace(/\D/g, ''))}
                                                className="w-[80px] bg-slate-50 border-2 border-blue-400 rounded-lg px-2 py-1 text-center font-black text-blue-600 focus:outline-none text-sm shadow-sm"
                                                style={{ fontFamily: '"Baloo 2", cursive' }}
                                            />
                                            <button
                                                onClick={handleSaveEdit}
                                                className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90"
                                            >
                                                <CheckCircleIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex items-center gap-1">
                                                {/* 密码字体也同步调整，且密文改为更纤细的样式 */}
                                                <div 
                                                    className={`text-lg font-black text-slate-800 italic tracking-[0.05em] flex items-center`}
                                                    style={{ fontFamily: student.showPassword ? '"Baloo 2", cursive' : 'inherit' }}
                                                >
                                                    {student.showPassword ? student.password : (
                                                        <div className="flex gap-0.5 translate-y-[1px]">
                                                            {[1,2,3,4,5,6].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800/80" />)}
                                                        </div>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => handleTogglePassword(student.id)}
                                                    className="p-1 text-slate-300 active:text-blue-500 transition-colors"
                                                >
                                                    {student.showPassword ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleStartEdit(student.id, student.password)}
                                                className="w-8 h-8 bg-slate-50 text-blue-500 border border-blue-100 flex items-center justify-center rounded-lg transition-all active:scale-90 shadow-sm"
                                                title="修改密码"
                                            >
                                                <EditIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="pt-20 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <SearchIcon className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-sm font-bold">未找到相关学生</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BankPasswordView;
