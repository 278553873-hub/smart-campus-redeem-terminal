/* eslint-disable react/no-unknown-property */
import React, { memo } from 'react';

interface TeacherFluidGlassNavProps {
  activeIndex: number;
  itemCount: number;
  jellyToggle?: 'a' | 'b' | 'none';
}

const TeacherFluidGlassNav: React.FC<TeacherFluidGlassNavProps> = memo(({ activeIndex, itemCount, jellyToggle = 'none' }) => {
  // 运动容器宽度等于单个 Item 的宽度百分比 (如 3 个 item 则为 33.333%)
  const itemWidthPct = 100 / Math.max(itemCount, 1);
  // 偏移 index * 100% 的自身宽度，这会精准移动 1 个 Item 宽度的位移，绝无偏差
  const transformX = activeIndex * 100;

  return (
    <div className="teacher-fluid-glass-canvas" style={{ position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
      {/* 限制在 Flex 核心按钮区的定位容器 */}
      <div style={{ position: 'absolute', left: '0px', right: '0px', top: '0', bottom: '0' }}>
        {/* 运动定位容器：宽度等于单个 Tab 宽度，负责平滑移动 */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '0',
            width: `${itemWidthPct}%`,
            transform: `translateX(${transformX}%)`,
            // 采用 380ms 物理阻尼曲线：快速冲出，并在接近终点时显著晃过头再Q弹回缩，带极舒适的弹性缓冲
            transition: 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* 内层胶囊滑块：在其内部居中 */}
          <div
            className={jellyToggle !== 'none' ? `slider-jelly-active-${jellyToggle}` : ''}
            style={{
              position: 'absolute',
              top: '0px',
              bottom: '0px',
              left: '0px',
              right: '0px',
              background: 'rgba(15, 23, 42, 0.06)', // 极淡灰蓝色（在纯白背景上精确呈现高级微灰质感，如“财富”截图）
              borderRadius: '9999px',
              border: 'none', // 彻底移除边框，消除任何割裂感
              boxShadow: 'none', // 彻底移除阴影，保持极简扁平一体性
              transformOrigin: 'center center', // 确保缩放以中心为基准
            }}
          />
        </div>
      </div>
    </div>
  );
});

export default TeacherFluidGlassNav;

