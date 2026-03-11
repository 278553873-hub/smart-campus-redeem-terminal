import React, { useState } from 'react';
import { User, KeyRound, Loader2, ArrowRight, ChevronLeft } from 'lucide-react';
import { playSound } from '../utils/sound';

interface AccountLoginProps {
    onSuccess: () => void;
    onBack?: () => void;
    layout?: 'horizontal' | 'vertical';
}

const AccountLogin: React.FC<AccountLoginProps> = ({ onSuccess, onBack, layout = 'horizontal' }) => {
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
        <div className={`relative flex items-center justify-center h-full w-full animate-in fade-in duration-700 ${layout === 'vertical' ? 'p-2' : 'p-8'}`}>
            {layout === 'vertical' && onBack && (
                <button type="button" onClick={onBack} className="absolute top-10 left-6 w-14 h-14 bg-white/90 backdrop-blur-md text-slate-500 rounded-[1.25rem] shadow-xl flex items-center justify-center active:bg-slate-100 transition-colors z-50 border border-slate-100">
                    <ChevronLeft size={30} strokeWidth={2.5} />
                </button>
            )}

            <div className={`bg-white flex overflow-hidden w-full ${layout === 'vertical' ? 'max-w-[360px] flex-col rounded-[2.5rem] shadow-xl p-6 h-auto border-4 border-blue-50/50 relative' : 'max-w-5xl rounded-[3.5rem] shadow-2xl border-4 border-blue-50 h-[560px]'}`}>
                
                {/* Left Side: Branding & Illustration */}
                {layout !== 'vertical' && (
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
                )}

                {/* Right Side: Login Form */}
                <div className={`w-full bg-white relative flex flex-col justify-center ${layout === 'vertical' ? 'p-2' : 'md:w-7/12 p-10 md:p-16'}`}>
                    {/* Subtle background element */}
                    {layout !== 'vertical' && (
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-[150px] -z-0 pointer-events-none"></div>
                    )}

                    <div className={`relative z-10 w-full max-w-md mx-auto ${layout === 'vertical' ? 'mt-2' : ''}`}>
                        <div className="flex items-center gap-4 mb-3">
                            {layout !== 'vertical' && onBack && (
                                <button type="button" onClick={onBack} className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center -ml-2 active:bg-slate-200 transition-colors shrink-0">
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-inner shrink-0">
                                <User size={24} />
                            </div>
                            <h2 className={`font-black text-slate-800 tracking-tight ${layout === 'vertical' ? 'text-3xl' : 'text-4xl'}`}>密码登录</h2>
                        </div>
                        <p className={`text-slate-400 font-bold ${layout === 'vertical' ? 'mb-8' : 'mb-10'} text-xs leading-relaxed`}>请输入您的学号和密码，如果忘记密码请联系班主任。</p>

                        <form onSubmit={handleLogin} className={`w-full ${layout === 'vertical' ? 'space-y-4' : 'space-y-6'}`}>
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
                                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] py-4 pl-14 pr-5 text-slate-800 font-bold focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-inner font-[NumberFont] ${layout === 'vertical' ? 'text-lg py-3.5 pl-12' : 'text-xl tracking-wider'}`}
                                        placeholder="2026xxxx"
                                        disabled={loading}
                                    />
                                </div>
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
                                        className={`w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] py-4 pl-14 pr-5 text-left text-slate-800 font-black tracking-[0.5em] focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-inner placeholder:text-base placeholder:font-sans placeholder:font-bold placeholder:tracking-normal placeholder:text-left ${layout === 'vertical' ? 'text-2xl py-3.5 pl-12' : 'text-3xl'}`}
                                        placeholder="6位身份识别码"
                                        disabled={loading}
                                    />
                                </div>
                            <div className="h-4 flex items-center px-1">
                                {error && <p className="text-red-500 text-xs font-bold animate-in slide-in-from-left-1 flex items-center gap-1.5"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{error}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full transition-all flex items-center justify-center shadow-xl ${loading ? 'bg-blue-400 text-white shadow-blue-200' : 'bg-blue-600 text-white shadow-blue-200 active:scale-[0.98]'} ${layout === 'vertical' ? 'py-4 mt-2 rounded-[1.25rem] font-bold text-lg gap-2' : 'py-5 mt-4 rounded-[1.5rem] font-black text-xl gap-3'}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={layout === 'vertical' ? 22 : 26} /> 身份认证中...
                                    </>
                                ) : (
                                    <>
                                        登录终端 <ArrowRight size={layout === 'vertical' ? 22 : 26} />
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
