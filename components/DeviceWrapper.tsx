import React, { useEffect, useRef, useState } from 'react';

interface DeviceWrapperProps {
    children: React.ReactNode;
    width: number;
    height: number;
}

export const DeviceWrapper: React.FC<DeviceWrapperProps> = ({ children, width, height }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width: wrapperWidth, height: wrapperHeight } = entry.contentRect;
                const scaleX = wrapperWidth / width;
                const scaleY = wrapperHeight / height;
                // Apply scaling. We allow scale down, and potentially scale up up to 1 (or allow slight scale up for 4K displays).
                // For faithful pixel-perfect device mockup, keeping max scale at 1 is good, but let's allow up to 1 for perfect fit, or maybe larger if needed.
                // Let's cap at scale=1 so it doesn't get ridiculously huge on ultra-wide web screens unless we want it to.
                // Actually, if they are on a massive display, perhaps the mockup shouldn't scale infinitely. We cap at 1.2
                setScale(Math.min(scaleX, scaleY, 1.2));
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
