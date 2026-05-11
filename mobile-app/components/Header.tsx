import React from 'react';
import { BackIcon } from './Icons';

interface HeaderProps {
  title: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white sticky top-0 z-10 h-[44px]">
      <div className="flex-1 flex justify-start">
        {onBack && (
            <button onClick={onBack} className="min-h-11 min-w-11 -ml-3 flex items-center justify-center active:bg-gray-100 rounded-full transition-colors text-slate-900">
                <BackIcon className="w-5 h-5" />
            </button>
        )}
      </div>
      
      <h1 className="text-[17px] font-bold text-slate-900 flex-none">{title}</h1>
      
<div className="flex-1" aria-hidden="true"></div>
    </div>
  );
};

export default Header;
