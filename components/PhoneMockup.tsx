
import React, { useState, useLayoutEffect, useRef } from 'react';
import SimulatedMiniProgramChrome from './SimulatedMiniProgramChrome';

export interface DevicePreviewBounds {
  right: number;
  top: number;
}

interface PhoneMockupProps {
  children: React.ReactNode;
  isAnalyzing?: boolean;
  safeAreaTop?: boolean;
  screenBackground?: React.ReactNode;
  screenOverlay?: React.ReactNode;
  screenOverlayRootId?: string;
  screenRef?: React.Ref<HTMLDivElement>;
  showDeviceFrame?: boolean;
  deviceType?: 'phone' | 'tablet';
  onDeviceBoundsChange?: (bounds: DevicePreviewBounds) => void;
  hideCapsule?: boolean;
  chromeAppearance?: 'light' | 'dark';
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
  deviceType = 'phone',
  onDeviceBoundsChange,
  contentTopInsetMode = 'full-chrome',
  chromeAppearance = 'light',
  hideCapsule = false,
}) => {
  const isTablet = deviceType === 'tablet';
  const screenWidth = isTablet ? 834 : 393;
  const screenHeight = isTablet ? 1194 : 852;
  const simulatedStatusBarHeightValue = isTablet ? 28 : 54;
  const simulatedCapsuleTop = simulatedStatusBarHeightValue + 6;
  const simulatedCapsuleHeight = 32;
  const simulatedTitleBarHeight = (simulatedCapsuleTop - simulatedStatusBarHeightValue) * 2 + simulatedCapsuleHeight;
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateLayout = () => {
      const { clientWidth: width, clientHeight: height } = container;
      if (width <= 0 || height <= 0) return;
      const nextScale = Math.min((width - 40) / screenWidth, (height - 40) / screenHeight, 1);
      setScale(nextScale);

      if (onDeviceBoundsChange) {
        const bounds = container.getBoundingClientRect();
        const bezel = showDeviceFrame ? (isTablet ? 20 : 8) : 0;
        onDeviceBoundsChange({
          right: bounds.left + (width / 2 + (screenWidth / 2 + bezel) * nextScale) * bounds.width / width,
          top: bounds.top + (height / 2 - (screenHeight / 2 + bezel) * nextScale) * bounds.height / height,
        });
      }
    };
    // 设备切换的首帧就使用新尺寸对应的比例与机身边界，不等待绘制后的观察回调。
    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);

    return () => observer.disconnect();
  }, [screenWidth, screenHeight, showDeviceFrame, onDeviceBoundsChange]);

  const shouldShowNativeChrome = showDeviceFrame && safeAreaTop;
  const nativeChromeTopInset = contentTopInsetMode === 'none'
    ? 0
    : contentTopInsetMode === 'status-bar'
      ? simulatedStatusBarHeightValue
      : simulatedStatusBarHeightValue + simulatedTitleBarHeight + 8;
  const simulatedChromeTopInset = shouldShowNativeChrome ? nativeChromeTopInset : 0;
  const simulatedStatusBarHeight = shouldShowNativeChrome ? simulatedStatusBarHeightValue : 0;
  const simulatedCapsuleRightInset = shouldShowNativeChrome && !hideCapsule ? 112 : 0;
  const deviceFrameVisibility = showDeviceFrame ? 'opacity-100' : 'opacity-0';
  const screenCornerRadius = isTablet ? 14 : 50;
  const screenCornerClass = showDeviceFrame ? (isTablet ? 'rounded-[14px]' : 'rounded-[50px]') : 'rounded-none';
  const screenClipStyle: React.CSSProperties = showDeviceFrame
    ? {
        clipPath: `inset(0 round ${screenCornerRadius}px)`,
        WebkitClipPath: `inset(0 round ${screenCornerRadius}px)`,
        contain: 'paint',
        isolation: 'isolate',
      }
    : {};

  const screenContent = (
    <div
      ref={screenRef}
      data-preview-device={deviceType}
      className={`relative overflow-hidden bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] ${screenCornerClass}`}
      style={{
        width: `${screenWidth}px`,
        height: `${screenHeight}px`,
        ...screenClipStyle,
        '--mini-program-status-bar-height': `${simulatedStatusBarHeight}px`,
        '--mini-program-title-bar-height': `${simulatedTitleBarHeight}px`,
        '--mini-program-capsule-right-inset': `${simulatedCapsuleRightInset}px`,
        '--mini-program-bottom-safe-area': shouldShowNativeChrome ? (isTablet ? '20px' : '28px') : '0px',
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

        <SimulatedMiniProgramChrome appearance={chromeAppearance} hideCapsule={hideCapsule} compactStatusBar={isTablet} />

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
          {isTablet ? (
            <div data-preview-anchor="teacher-tablet-device" className={`pointer-events-none absolute inset-[-20px] z-0 rounded-[32px] border border-slate-500 bg-[#202124] shadow-2xl ${deviceFrameVisibility}`} aria-hidden="true">
              <span className="absolute left-1/2 top-[6px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />
            </div>
          ) : (
            <>
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
            </>
          )}

          {/* 仅切换演示视口与机身，业务页面沿用现有布局。 */}
          <div className="absolute inset-0 z-10">
            {screenContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;
