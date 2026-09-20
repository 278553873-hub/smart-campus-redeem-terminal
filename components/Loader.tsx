import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  text?: string;
  size?: number;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({
  text,
  size = 38,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <div className="relative flex items-center justify-center">
        {/* 背景轻柔光晕 */}
        <div className="absolute inset-0 rounded-full bg-blue-500/15 blur-[6px] animate-pulse" />
        {/* 现代品牌蓝圆环 */}
        <Loader2
          size={size}
          className="animate-spin text-blue-600 drop-shadow-sm transition-all"
          strokeWidth={2.5}
        />
      </div>
      {text && (
        <span className="text-[15px] font-bold text-slate-700 tracking-wider">
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;
