/* eslint-disable react/no-unknown-property */
import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  Frame,
  Glass,
  GlassContainer,
  LiquidCanvas,
  Transform,
  ZStack,
  spring,
} from '@liquid-dom/react';

interface TeacherFluidGlassNavProps {
  activeIndex: number;
  itemCount: number;
  jellyToggle?: 'a' | 'b' | 'none';
  tabbarWidth?: number;
  enableExperimentalLiquidDom?: boolean;
}

const NAV_HEIGHT = 66;
const ACTIVE_GLASS_INSET = 7;

const TeacherFluidGlassNav: React.FC<TeacherFluidGlassNavProps> = memo(({ activeIndex, itemCount, jellyToggle = 'none', tabbarWidth = 0, enableExperimentalLiquidDom = false }) => {
  const [supportsWebGpu, setSupportsWebGpu] = useState(false);
  const [liquidUnavailable, setLiquidUnavailable] = useState(false);

  useEffect(() => {
    setSupportsWebGpu(typeof window !== 'undefined' && !!window.navigator && 'gpu' in window.navigator);
  }, []);

  // 运动容器宽度等于单个 Item 的宽度百分比 (如 3 个 item 则为 33.333%)
  const itemWidthPct = 100 / Math.max(itemCount, 1);
  // 偏移 index * 100% 的自身宽度，这会精准移动 1 个 Item 宽度的位移，绝无偏差
  const transformX = activeIndex * 100;
  const safeItemCount = Math.max(itemCount, 1);
  const measuredWidth = Math.max(tabbarWidth, 1);
  const itemWidthPx = measuredWidth / safeItemCount;
  const activeGlassWidth = Math.max(itemWidthPx - ACTIVE_GLASS_INSET * 2, 48);
  const activeOffsetX = (activeIndex - (safeItemCount - 1) / 2) * itemWidthPx;
  const shouldUseLiquidDom = enableExperimentalLiquidDom && supportsWebGpu && !liquidUnavailable && measuredWidth > 1;

  const liquidTransition = useMemo(() => spring({ stiffness: 520, damping: 38, mass: 0.7 }), []);

  return (
    <div className="teacher-fluid-glass-canvas" style={{ position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
      {shouldUseLiquidDom && (
        <LiquidCanvas
          className="teacher-liquid-dom-root"
          canvasClassName="teacher-liquid-dom-canvas"
          maxDpr={1.35}
          frameloop="demand"
          proposal={{ width: measuredWidth, height: NAV_HEIGHT }}
          onError={() => setLiquidUnavailable(true)}
        >
          <Frame width={measuredWidth} height={NAV_HEIGHT}>
            <GlassContainer
              blur={18}
              spacing={12}
              bezelWidth={7}
              thickness={14}
              displacementFactor={0.16}
              displacementBlur={8}
              ior={1.22}
              contentIor={1}
              contentDepth={42}
              dispersion={0.012}
              tint={{ r: 0.94, g: 0.98, b: 1, a: 0.42 }}
              specularStrength={0.82}
              specularWidth={2}
              specularFalloff={1.9}
              specularOpacity={0.5}
              shadowColor={{ r: 0.09, g: 0.12, b: 0.22, a: 0.14 }}
              shadowOffsetY={16}
              shadowBlur={34}
              shadowSpread={-18}
              opacity={0.96}
            >
              <ZStack>
                <Frame width={measuredWidth - 2} height={NAV_HEIGHT - 2}>
                  <Glass cornerRadius={999} cornerSmoothing={0.72} />
                </Frame>
                <Transform
                  x={activeOffsetX}
                  scaleX={jellyToggle !== 'none' ? 1.02 : 1}
                  scaleY={jellyToggle !== 'none' ? 0.985 : 1}
                  transition={{ x: liquidTransition, scaleX: liquidTransition, scaleY: liquidTransition }}
                >
                  <Frame width={activeGlassWidth} height={NAV_HEIGHT - ACTIVE_GLASS_INSET * 2}>
                    <Glass cornerRadius={999} cornerSmoothing={0.78} />
                  </Frame>
                </Transform>
              </ZStack>
            </GlassContainer>
          </Frame>
        </LiquidCanvas>
      )}

      {/* 限制在 Flex 核心按钮区的定位容器 */}
      <div className={shouldUseLiquidDom ? 'teacher-fluid-css-fallback is-liquid-dom-enhanced' : 'teacher-fluid-css-fallback'} style={{ position: 'absolute', left: '0px', right: '0px', top: '0', bottom: '0' }}>
        {/* 运动定位容器：宽度等于单个 Tab 宽度，负责平滑移动 */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '0',
            width: `${itemWidthPct}%`,
            transform: `translateX(${transformX}%)`,
            transition: 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* 内层胶囊滑块：在其内部居中 */}
          <div
            className={`tabbar-liquid-indicator ${jellyToggle !== 'none' ? `slider-jelly-active-${jellyToggle}` : ''}`}
            style={{
              position: 'absolute',
              top: '0px',
              bottom: '0px',
              left: '0px',
              right: '0px',
              borderRadius: '9999px',
              transformOrigin: 'center center', // 确保缩放以中心为基准
            }}
          />
        </div>
      </div>
    </div>
  );
});

export default TeacherFluidGlassNav;
