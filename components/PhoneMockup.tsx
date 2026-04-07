
import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Wifi, Signal } from 'lucide-react';

interface PhoneMockupProps {
  children: React.ReactNode;
  isAnalyzing?: boolean;
  safeAreaTop?: boolean;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ 
  children, 
  isAnalyzing = false,
  safeAreaTop = true,
}) => {
  const width = 393;
  const height = 852;
  const [currentTime, setCurrentTime] = useState("09:41");
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: wrapperWidth, height: wrapperHeight } = entry.contentRect;
        const scaleX = (wrapperWidth - 40) / width;
        const scaleY = (wrapperHeight - 40) / height;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [width, height]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <div 
        className="relative"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* 钛金属主边框 */}
        <div className="relative w-full h-full bg-gradient-to-b from-[#e2e2e2] via-[#d1d1d1] to-[#b8b8b8] rounded-[60px] p-[2px] border border-gray-200 shadow-2xl transition-all duration-300">
          
          {/* 边框内侧倒角 */}
          <div className="w-full h-full bg-[#121212] rounded-[58px] p-[6px] flex items-center justify-center relative shadow-sm">
            
            {/* 侧边物理按钮 */}
            <div className="absolute left-[-5px] top-28 w-[3.5px] h-9 bg-[#aaa] rounded-l-md border-r border-black/10"></div>
            <div className="absolute left-[-5px] top-40 w-[3.5px] h-14 bg-[#aaa] rounded-l-md border-r border-black/10"></div>
            <div className="absolute left-[-5px] top-56 w-[3.5px] h-14 bg-[#aaa] rounded-l-md border-r border-black/10"></div>
            <div className="absolute right-[-5px] top-44 w-[3.5px] h-20 bg-[#aaa] rounded-r-md border-l border-black/10"></div>

            {/* 灵动岛 (Dynamic Island) - z-index prioritized */}
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 bg-black z-[100] transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex items-center justify-center overflow-hidden
              ${isAnalyzing ? 'w-44 h-9 rounded-full border border-white/5 shadow-lg' : 'w-24 h-6 rounded-full'}`}>
                {isAnalyzing && (
                  <div className="flex items-center gap-3 px-4 w-full">
                    <div className="w-4 h-4 rounded-full border-2 border-[#07c160] border-t-transparent animate-spin"></div>
                    <span className="text-[10px] text-white font-bold tracking-tight">AI 分析图像中...</span>
                  </div>
                )}
            </div>

            {/* 屏幕内容区 - 采用 absolute 撑满 */}
            <div className="w-full h-full bg-white relative overflow-hidden rounded-[50px]">
                
                {/* 页面主内容 - 这里的 pt-[54px] 保证了应用内容默认不在状态栏/灵动岛区域 */}
                <div className={`absolute inset-0 flex flex-col ${safeAreaTop ? 'pt-[54px]' : ''}`}>
                  {children}
                </div>

                {/* iOS 状态栏 (Overlay) */}
                <div className="absolute top-0 left-0 w-full h-[54px] flex justify-between items-end px-8 pb-3 text-[12px] font-bold text-black z-[90] pointer-events-none">
                    <div className="flex-1 text-left"><span>{currentTime}</span></div>
                    <div className="flex-1 flex justify-end items-center gap-1.5 opacity-60">
                        <Signal size={13} />
                        <Wifi size={13} />
                        <div className="flex items-center ml-0.5">
                          <div className="w-[22px] h-[11px] border-[1.2px] border-black/20 rounded-[3px] relative p-[1.5px]">
                            <div className="h-full bg-black rounded-[0.5px]" style={{ width: '92%' }}></div>
                            <div className="absolute right-[-3px] top-[2px] w-[1.5px] h-[4px] bg-black/30 rounded-r-full"></div>
                          </div>
                        </div>
                    </div>
                </div>

                {/* 微信胶囊仿真 (Overlay) */}
                <div className="absolute top-[60px] right-4 z-[99] flex items-center bg-white/60 backdrop-blur-md border border-black/5 rounded-full h-8 px-3 gap-3">
                    <MoreHorizontal size={16} className="text-black/80" />
                    <div className="w-[1px] h-3.5 bg-black/10"></div>
                    <div className="relative w-4 h-4 flex items-center justify-center">
                        <div className="w-3.5 h-3.5 border-[1.8px] border-black/80 rounded-full"></div>
                        <div className="absolute w-1 h-1 bg-black/80 rounded-full"></div>
                    </div>
                </div>

                {/* Home Bar (Overlay) */}
                <div className="absolute bottom-0 left-0 w-full h-7 flex justify-center items-end pb-2 z-[90] pointer-events-none">
                    <div className="w-32 h-[4px] bg-black/10 rounded-full"></div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
