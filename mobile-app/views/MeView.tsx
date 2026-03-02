import React from 'react';
import { 
    ArrowRightIcon,
    WechatMoreIcon, WechatCloseIcon
} from '../components/Icons';

interface MeViewProps {
    onNavigateToFiles: () => void;
    onOpenGenerateModal: () => void;
    onOpenTermGenerateModal: () => void;
}

const MeView: React.FC<MeViewProps> = ({ onNavigateToFiles, onOpenGenerateModal, onOpenTermGenerateModal }) => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans relative">
            
            {/* Top Header (WeChat Style) */}
            <div className="bg-white px-4 py-2 sticky top-0 z-10 flex justify-end items-center h-[44px]">
                 {/* WeChat Capsule */}
                 <div className="flex items-center bg-white/50 border border-slate-200/80 rounded-full px-3 h-[30px] gap-3 shadow-sm">
                     <div className="w-5 h-5 flex items-center justify-center text-slate-900"><WechatMoreIcon className="w-5 h-5" /></div>
                     <div className="w-[1px] h-3.5 bg-slate-200"></div>
                     <div className="w-5 h-5 flex items-center justify-center text-slate-900"><WechatCloseIcon className="w-4 h-4" /></div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="px-4 mt-2">
                <div className="bg-gradient-to-br from-[#E2E8F0] via-[#F1F5F9] to-[#E2E8F0] rounded-3xl p-6 shadow-sm relative overflow-hidden border border-white">
                    
                    {/* Abstract Tech Decoration */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/60 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-300/30 rounded-full blur-2xl -ml-10 -mb-10"></div>

                    <div className="relative z-10 flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-white p-0.5 shadow-sm shrink-0">
                            <img 
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" 
                                alt="Avatar" 
                                className="w-full h-full rounded-full bg-slate-100 object-cover"
                            />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-slate-800 truncate">刘飞飞老师</h2>
                            <p className="text-xs text-slate-500 mt-1 truncate">成都七中初中附属小学</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {['学发中心', '年级组长', '班主任', '物理'].map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-800/5 text-slate-600 px-2 py-0.5 rounded-full border border-slate-800/5 font-medium whitespace-nowrap">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-4 mt-4">
                
                {/* 管理工具将在后续版本展示，Demo 暂不显示 */}

                {/* My Resources */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <div className="px-5 py-4 border-b border-slate-50">
                        <h3 className="text-sm font-bold text-slate-800">我的资料</h3>
                    </div>
                    <button 
                        onClick={onNavigateToFiles}
                        className="w-full px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors"
                    >
                        <span className="text-sm font-medium text-slate-600">我的文件</span>
                        <ArrowRightIcon className="w-4 h-4 text-slate-300" />
                    </button>
                </div>

                {/* Account Security */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <div className="px-5 py-4 border-b border-slate-50">
                        <h3 className="text-sm font-bold text-slate-800">账号安全</h3>
                    </div>
                    <div className="w-full px-5 py-4 flex items-center justify-between border-b border-slate-50">
                        <span className="text-sm font-medium text-slate-600">登录账号</span>
                        <span className="text-sm text-slate-400 font-mono">139****0121</span>
                    </div>
                    <button className="w-full px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium text-slate-600">修改密码</span>
                        <ArrowRightIcon className="w-4 h-4 text-slate-300" />
                    </button>
                </div>

                {/* About Product */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                     <div className="px-5 py-4 border-b border-slate-50">
                        <h3 className="text-sm font-bold text-slate-800">关于产品</h3>
                    </div>
                    <button className="w-full px-5 py-4 flex items-center justify-between border-b border-slate-50 active:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium text-slate-600">用户协议</span>
                        <ArrowRightIcon className="w-4 h-4 text-slate-300" />
                    </button>
                    <button className="w-full px-5 py-4 flex items-center justify-between active:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium text-slate-600">隐私协议</span>
                        <ArrowRightIcon className="w-4 h-4 text-slate-300" />
                    </button>
                </div>

                {/* Logout */}
                <button className="w-full bg-white py-4 rounded-2xl text-slate-400 text-sm font-medium shadow-sm border border-slate-100 active:text-red-500 active:bg-red-50 transition-colors">
                    退出登录
                </button>
                
                <div className="h-4"></div>
            </div>
        </div>
    );
};

export default MeView;
