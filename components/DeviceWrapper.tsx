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
                // Add a buffer for the physical phone bezels and shadows (approx 40px total)
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
            className="w-full h-full flex items-center justify-center overflow-hidden p-8"
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
