
import React, { useState, useEffect, useRef } from 'react';
import SimulatedMiniProgramChrome from './SimulatedMiniProgramChrome';

interface PhoneMockupProps {
  children: React.ReactNode;
  isAnalyzing?: boolean;
  safeAreaTop?: boolean;
  screenBackground?: React.ReactNode;
  screenOverlay?: React.ReactNode;
  screenOverlayRootId?: string;
  screenRef?: React.Ref<HTMLDivElement>;
  showDeviceFrame?: boolean;
  contentTopInsetMode?: 'full-chrome' | 'status-bar' | 'none';
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ 
  children, 
  isAnalyzing = false,
  safeAreaTop = true,
  screenBackground,
  screenOverlay,
  screenOverlayRootId,
  screenRef,
  showDeviceFrame = true,
  contentTopInsetMode = 'full-chrome',
}) => {
  const screenWidth = 393;
  const screenHeight = 852;
  const simulatedStatusBarHeightValue = 54;
  const simulatedCapsuleTop = 60;
  const simulatedCapsuleHeight = 32;
  const simulatedTitleBarHeight = (simulatedCapsuleTop - simulatedStatusBarHeightValue) * 2 + simulatedCapsuleHeight;
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: wrapperWidth, height: wrapperHeight } = entry.contentRect;
        const scaleX = (wrapperWidth - 40) / screenWidth;
        const scaleY = (wrapperHeight - 40) / screenHeight;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [screenWidth, screenHeight]);

  const shouldShowNativeChrome = showDeviceFrame && safeAreaTop;
  const nativeChromeTopInset = contentTopInsetMode === 'none'
    ? 0
    : contentTopInsetMode === 'status-bar'
      ? 54
      : 106;
  const simulatedChromeTopInset = shouldShowNativeChrome ? nativeChromeTopInset : 0;
  const simulatedStatusBarHeight = shouldShowNativeChrome ? simulatedStatusBarHeightValue : 0;
  const simulatedCapsuleRightInset = shouldShowNativeChrome ? 112 : 0;
  const deviceFrameVisibility = showDeviceFrame ? 'opacity-100' : 'opacity-0';
  const screenCornerClass = showDeviceFrame ? 'rounded-[50px]' : 'rounded-none';
  const screenClipStyle: React.CSSProperties = showDeviceFrame
    ? {
        clipPath: 'inset(0 round 50px)',
        WebkitClipPath: 'inset(0 round 50px)',
        contain: 'paint',
        isolation: 'isolate',
      }
    : {};

  const screenContent = (
    <div
      ref={screenRef}
      className={`relative overflow-hidden bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] ${screenCornerClass}`}
      style={{
        width: `${screenWidth}px`,
        height: `${screenHeight}px`,
        ...screenClipStyle,
        '--mini-program-status-bar-height': `${simulatedStatusBarHeight}px`,
        '--mini-program-title-bar-height': `${simulatedTitleBarHeight}px`,
        '--mini-program-capsule-right-inset': `${simulatedCapsuleRightInset}px`,
        '--mini-program-bottom-safe-area': shouldShowNativeChrome ? '28px' : '0px',
      } as React.CSSProperties}
    >
        {screenBackground && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {screenBackground}
          </div>
        )}
        
        {/* 模拟真实手机环境时，可统一避让顶部原生区域，也可由沉浸页面自行接管安全区。 */}
        <div
          className="absolute inset-0 z-10 flex flex-col"
          style={{ paddingTop: `${simulatedChromeTopInset}px` }}
        >
          {children}
        </div>

        {screenOverlayRootId && (
          <div
            id={screenOverlayRootId}
            className="pointer-events-none absolute inset-0 z-[1000]"
          />
        )}

        <SimulatedMiniProgramChrome />

        {screenOverlay && (
          <div
            className={`pointer-events-none absolute inset-0 z-[110] overflow-hidden ${screenCornerClass}`}
            style={screenClipStyle}
          >
            {screenOverlay}
          </div>
        )}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <div 
        className="relative shrink-0"
        style={{
          width: `${screenWidth}px`,
          height: `${screenHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <div className="relative w-full h-full">
          <div className={`pointer-events-none absolute inset-[-8px] z-0 bg-gradient-to-b from-[#e2e2e2] via-[#d1d1d1] to-[#b8b8b8] rounded-[60px] border border-gray-200 shadow-2xl ${deviceFrameVisibility}`} aria-hidden={!showDeviceFrame}></div>
          <div className={`pointer-events-none absolute inset-[-6px] z-0 bg-[#121212] rounded-[58px] shadow-sm ${deviceFrameVisibility}`} aria-hidden={!showDeviceFrame}></div>
            {/* 侧边物理按钮 */}
            <div className={`pointer-events-none absolute left-[-5px] top-28 z-0 w-[3.5px] h-9 bg-[#aaa] rounded-l-md border-r border-black/10 ${deviceFrameVisibility}`} aria-hidden={!showDeviceFrame}></div>
            <div className={`pointer-events-none absolute left-[-5px] top-40 z-0 w-[3.5px] h-14 bg-[#aaa] rounded-l-md border-r border-black/10 ${deviceFrameVisibility}`} aria-hidden={!showDeviceFrame}></div>
            <div className={`pointer-events-none absolute left-[-5px] top-56 z-0 w-[3.5px] h-14 bg-[#aaa] rounded-l-md border-r border-black/10 ${deviceFrameVisibility}`} aria-hidden={!showDeviceFrame}></div>
            <div className={`pointer-events-none absolute right-[-5px] top-44 z-0 w-[3.5px] h-20 bg-[#aaa] rounded-r-md border-l border-black/10 ${deviceFrameVisibility}`} aria-hidden={!showDeviceFrame}></div>

            {/* 灵动岛 (Dynamic Island) - z-index prioritized */}
            <div
              className={`pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 bg-black z-[100] transition-[width,height,border-radius] duration-500 flex items-center justify-center overflow-hidden ${deviceFrameVisibility}
              ${isAnalyzing ? 'w-44 h-9 rounded-full border border-white/5 shadow-lg' : 'w-24 h-6 rounded-full'}`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.19,1,0.22,1)' }}
              aria-hidden={!showDeviceFrame}
            >
                {isAnalyzing && (
                  <div className="flex items-center gap-3 px-4 w-full">
                    <div className="w-4 h-4 rounded-full border-2 border-[#07c160] border-t-transparent animate-spin"></div>
                    <span className="text-[10px] text-white font-bold tracking-tight">AI 分析图像中...</span>
                  </div>
                )}
            </div>

          {/* 屏幕内容区固定为 H5 视口尺寸，手机壳不参与布局计算。 */}
          <div className="absolute inset-0 z-10">
            {screenContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
