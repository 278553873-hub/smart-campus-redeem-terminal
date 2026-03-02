import React from 'react';
import { BackIcon, WechatMoreIcon, WechatCloseIcon } from './Icons';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white sticky top-0 z-10 h-[44px]">
      <div className="flex-1 flex justify-start">
        {onBack && (
            <button onClick={onBack} className="p-1 -ml-2 active:bg-gray-100 rounded-full transition-colors text-slate-900">
                <BackIcon className="w-5 h-5" />
            </button>
        )}
      </div>
      
      <h1 className="text-[17px] font-bold text-slate-900 flex-none">{title}</h1>
      
      <div className="flex-1 flex justify-end">
          {/* Simulated WeChat Capsule */}
          <div className="flex items-center bg-white/50 border border-slate-200/80 rounded-full px-3 h-[30px] gap-3 shadow-sm">
            <div className="w-5 h-5 flex items-center justify-center text-slate-900"><WechatMoreIcon className="w-5 h-5" /></div>
            <div className="w-[1px] h-3.5 bg-slate-200"></div>
            <div className="w-5 h-5 flex items-center justify-center text-slate-900"><WechatCloseIcon className="w-4 h-4" /></div>
          </div>
      </div>
    </div>
  );
};

export default Header;