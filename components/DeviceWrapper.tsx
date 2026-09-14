import React, { useEffect, useRef, useState } from 'react';

interface DeviceWrapperProps {
    children: React.ReactNode;
    width: number;
    height: number;
    /** Preview padding. Vending screens use a tighter value to improve visibility. */
    padding?: number;
    /** Safe gap between the rendered device and the container edge. */
    safetyGap?: number;
    /** Maximum preview scale. Defaults to the design's original size. */
    maxScale?: number;
    /** Optional marker for external preview controls that need the rendered device bounds. */
    previewAnchor?: string;
}

export const DeviceWrapper: React.FC<DeviceWrapperProps> = ({
    children,
    width,
    height,
    padding = 32,
    safetyGap = 40,
    maxScale = 1,
    previewAnchor,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width: wrapperWidth, height: wrapperHeight } = entry.contentRect;
                // Keep a small edge buffer for the physical bezel and shadow while using the available viewport.
                const scaleX = (wrapperWidth - safetyGap) / width;
                const scaleY = (wrapperHeight - safetyGap) / height;
                setScale(Math.min(scaleX, scaleY, maxScale));
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, [width, height, safetyGap, maxScale]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{ padding }}
        >
            <div
                data-preview-anchor={previewAnchor}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    flexShrink: 0,
                    position: 'relative'
                }}
                className="will-change-transform"
            >
                {children}
            </div>
        </div>
    );
};
