import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import './MobileSkeletonList.css';

type SkeletonShape = 'line' | 'circle' | 'tag';

/** 标注真实内容块；内容一直参与布局，占位与入场共用同一份结构。 */
export const skeletonBlock = (order: number, shape: SkeletonShape = 'line', width = 1, height?: number) => ({
    'data-skeleton-block': shape,
    'data-skeleton-width': width,
    'data-skeleton-height': height,
    style: { '--mobile-skeleton-order': order } as React.CSSProperties,
});

interface SkeletonRect {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    order: number;
}

interface MobileSkeletonListProps {
    loading: boolean;
    label: string;
    children: React.ReactNode;
    className?: string;
}

const MobileSkeletonList: React.FC<MobileSkeletonListProps> = ({ loading, label, children, className = '' }) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const maskId = `skeleton-mask-${useId().replace(/:/g, '')}`;
    const gradientId = `${maskId}-light`;
    const [rects, setRects] = useState<SkeletonRect[]>([]);
    const [phase, setPhase] = useState<'loading' | 'revealing' | 'ready'>(loading ? 'loading' : 'ready');

    useLayoutEffect(() => {
        if (loading) {
            setPhase('loading');
            return;
        }
        // 仅在真实的 loading → ready 交接时入场；筛选、编辑等普通重绘不重复播放。
        setPhase(previous => previous === 'loading' ? 'revealing' : previous);
    }, [loading]);

    useLayoutEffect(() => {
        if (phase !== 'revealing') return;
        const timer = window.setTimeout(() => setPhase('ready'), 520);
        return () => window.clearTimeout(timer);
    }, [phase]);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root || (!loading && phase === 'ready')) return;
        const measure = () => {
            const getLayoutPosition = (block: HTMLElement) => {
                let x = 0;
                let y = 0;
                let element: HTMLElement | null = block;
                // 使用布局坐标，避免演示手机壳的缩放影响骨架位置。
                while (element && element !== root) {
                    x += element.offsetLeft;
                    y += element.offsetTop;
                    element = element.offsetParent as HTMLElement | null;
                }
                return { x, y };
            };
            const anchors = new Map(Array.from(root.querySelectorAll<HTMLElement>('[data-skeleton-anchor]')).map(anchor => [anchor.dataset.skeletonAnchor, anchor]));
            const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-skeleton-block]'));
            const nextRects = blocks.map(block => {
                let { x, y } = getLayoutPosition(block);
                let availableWidth = block.offsetWidth;
                const alignedGroup = block.closest<HTMLElement>('[data-skeleton-align-to]');
                const anchor = alignedGroup && anchors.get(alignedGroup.dataset.skeletonAlignTo);
                if (anchor) {
                    // 骨架可以按内容列组织，而不改变真实按钮的位置和点击区域。
                    const columns = Array.from(alignedGroup.querySelectorAll<HTMLElement>('[data-skeleton-block]'));
                    const anchorStyle = window.getComputedStyle(anchor);
                    const paddingLeft = Number.parseFloat(anchorStyle.paddingLeft) || 0;
                    const paddingRight = Number.parseFloat(anchorStyle.paddingRight) || 0;
                    // 按锚点内容区域分列，排除边框与内边距，起点与内容本身一致。
                    availableWidth = Math.max(0, anchor.clientWidth - paddingLeft - paddingRight) / columns.length;
                    x = getLayoutPosition(anchor).x + anchor.clientLeft + paddingLeft + columns.indexOf(block) * availableWidth;
                }
                const width = block.dataset.skeletonWidthPx !== undefined
                    ? Number(block.dataset.skeletonWidthPx)
                    : availableWidth * Number(block.dataset.skeletonWidth ?? 1);
                const height = Math.min(block.offsetHeight, Number(block.dataset.skeletonHeight ?? block.offsetHeight));
                const centered = block.dataset.skeletonBlock === 'circle' || block.dataset.skeletonBlock === 'tag';
                return {
                    x: x + (centered ? (availableWidth - width) / 2 : 0),
                    y: y + (block.offsetHeight - height) / 2,
                    width,
                    height,
                    radius: block.dataset.skeletonBlock === 'circle' ? height / 2 : 4,
                    order: Number(block.style.getPropertyValue('--mobile-skeleton-order')),
                };
            });
            // 先测量全部图形，再对齐目标骨架的右边缘，支持跨行对齐而不改变真实布局。
            const rectsByAnchor = new Map<string, SkeletonRect>();
            blocks.forEach((block, index) => {
                if (block.dataset.skeletonAnchor) rectsByAnchor.set(block.dataset.skeletonAnchor, nextRects[index]);
            });
            blocks.forEach((block, index) => {
                const target = block.dataset.skeletonRightTo && rectsByAnchor.get(block.dataset.skeletonRightTo);
                if (target) nextRects[index].width = Math.max(0, target.x + target.width - nextRects[index].x);
            });
            setRects(nextRects);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(root);
        root.querySelectorAll<HTMLElement>('[data-skeleton-block]').forEach(block => observer.observe(block));
        return () => observer.disconnect();
    }, [loading, phase, children]);

    const currentPhase = loading ? 'loading' : phase;
    return (
        <div className={`mobile-skeleton-list ${className}`} data-phase={currentPhase} aria-busy={loading}>
            <span className="sr-only" role="status" aria-live="polite">{loading ? `${label}加载中` : `${label}已加载`}</span>
            <div ref={rootRef} className="mobile-skeleton-list__layout" inert={loading || undefined} aria-hidden={loading || undefined}>
                {children}
                {currentPhase !== 'ready' && (
                    <svg className="mobile-skeleton-list__overlay" aria-hidden="true" width="100%" height="100%">
                        <defs>
                            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%" style={{ maskType: 'alpha' }}>
                                {rects.map((rect, index) => (
                                    <rect key={index} x={rect.x} y={rect.y} width={rect.width} height={rect.height} rx={rect.radius} fill="white" className="mobile-skeleton-list__mask-block" style={{ '--mobile-skeleton-order': rect.order } as React.CSSProperties} />
                                ))}
                            </mask>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0.2" gradientUnits="objectBoundingBox">
                                <stop offset="25%" stopColor="white" stopOpacity="0" />
                                <stop offset="50%" stopColor="white" stopOpacity="0.8" />
                                <stop offset="75%" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <g mask={`url(#${maskId})`}>
                            <rect width="100%" height="100%" fill="var(--tm-skeleton-base)" />
                            {/* 全列表只有一道光带，蒙版将其限制在所有骨架块内。 */}
                            <rect className="mobile-skeleton-list__light" x="-100%" width="100%" height="100%" fill={`url(#${gradientId})`} />
                        </g>
                    </svg>
                )}
            </div>
        </div>
    );
};

export default MobileSkeletonList;
