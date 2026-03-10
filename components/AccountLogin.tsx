import React, { useState } from 'react';
import { User, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { playSound } from '../utils/sound';

interface AccountLoginProps {
    onSuccess: () => void;
}

const AccountLogin: React.FC<AccountLoginProps> = ({ onSuccess }) => {
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId || !password) {
            setError('请输入学号和密码');
            return;
        }

        if (password.length !== 6) {
            setError('密码必须是6位数字');
            return;
        }

        setLoading(true);
        setError('');

        // 模拟登录请求
        setTimeout(() => {
            // 演示环境中，只要输入了6位密码就允许登录
            setLoading(false);
            playSound('success');
            onSuccess();
        }, 1500);
    };

    return (
        <div className="flex items-center justify-center h-full w-full animate-in fade-in duration-700 p-8">
            <div className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-blue-50 w-full max-w-5xl flex overflow-hidden h-[560px]">
                {/* Left Side: Branding & Illustration */}
                <div className="hidden md:flex flex-col items-center justify-center w-5/12 bg-gradient-to-br from-blue-600 to-indigo-800 p-10 text-white relative">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative group mb-10">
                            <div className="absolute -inset-6 bg-white/20 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                            <img
                                src="/assets/school_cover.png"
                                alt="School Feature"
                                className="relative w-56 h-56 rounded-[2.5rem] shadow-2xl border-4 border-white/20 object-cover"
                            />
                        </div>

                        <h1 className="text-4xl font-black tracking-tighter mb-4 text-center drop-shadow-lg">校园星光空间</h1>
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-5 py-2 rounded-full border border-white/10 shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <p className="text-blue-50 text-sm font-bold tracking-widest">班级一体机终端</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full md:w-7/12 p-10 md:p-16 flex flex-col justify-center relative bg-white">
                    {/* Subtle background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-[150px] -z-0 pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-md mx-auto">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <User size={24} />
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight">学生登录</h2>
                        </div>
                        <p className="text-slate-400 font-bold mb-10 text-sm">请输入您的学号和密码，以访问个人数字中心</p>

                        <form onSubmit={handleLogin} className="w-full space-y-6">
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">识别学号</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-blue-400">
                                        <User size={22} />
                                    </div>
                                    <input
                                        type="text"
                                        value={studentId}
                                        onChange={(e) => {
                                            setStudentId(e.target.value);
                                            setError('');
                                        }}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] py-4 pl-14 pr-5 text-slate-800 font-bold focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-inner font-[NumberFont] text-xl tracking-wider"
                                        placeholder="2026xxxx"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">账户密码</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-blue-400">
                                        <KeyRound size={22} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setPassword(val);
                                            setError('');
                                        }}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] py-4 pl-14 pr-5 text-center text-slate-800 font-black text-3xl tracking-[0.5em] focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-inner placeholder:text-base placeholder:font-sans placeholder:font-bold placeholder:tracking-normal placeholder:text-left"
                                        placeholder="6位身份识别码"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="h-4 flex items-center px-1">
                                {error && <p className="text-red-500 text-xs font-bold animate-in slide-in-from-left-1 flex items-center gap-1.5"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{error}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 mt-4 rounded-[1.5rem] font-black text-xl transition-all flex items-center justify-center gap-3 shadow-xl ${loading ? 'bg-blue-400 text-white shadow-blue-200' : 'bg-blue-600 text-white shadow-blue-200 active:scale-[0.98]'}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={26} /> 身份认证中...
                                    </>
                                ) : (
                                    <>
                                        登录终端 <ArrowRight size={26} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountLogin;
