import React, { useId, useLayoutEffect, useRef, useState } from 'react';

export const stackedGlassCardGeometry = { rearOffset: 8, notchDepth: 39, notchShift: 0.08 };
const { rearOffset, notchDepth } = stackedGlassCardGeometry;

interface StackedGlassCardBackgroundProps {
    className: string;
    notchShift?: number;
}

export default function StackedGlassCardBackground({
    className,
    notchShift = stackedGlassCardGeometry.notchShift,
}: StackedGlassCardBackgroundProps) {
    const id = useId();
    const canvasRef = useRef<SVGSVGElement>(null);
    const [{ width, height }, setSize] = useState({ width: 365, height: 172 });

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const updateSize = () => {
            const next = { width: canvas.clientWidth, height: canvas.clientHeight };
            if (next.width <= 0 || next.height <= 0) return;
            setSize(current => current.width === next.width && current.height === next.height ? current : next);
        };

        updateSize();
        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(updateSize);
        observer.observe(canvas);
        return () => observer.disconnect();
    }, []);

    const right = width - 0.5;
    const bottom = height - 0.5;
    const front = [
        'M 0.5 18 C 0.5 7 7 0.5 18 0.5',
        `H ${width * (0.57 + notchShift)}`,
        `C ${width * (0.64 + notchShift)} 0.5 ${width * (0.62 + notchShift)} ${notchDepth} ${width * (0.68 + notchShift)} ${notchDepth}`,
        `H ${right - 16} C ${right - 7} ${notchDepth} ${right} ${notchDepth + 7} ${right} ${notchDepth + 18}`,
        `V ${bottom - 18} C ${right} ${bottom - 8} ${right - 8} ${bottom} ${right - 18} ${bottom}`,
        `H 18 C 8 ${bottom} 0.5 ${bottom - 8} 0.5 ${bottom - 18} Z`,
    ].join(' ');

    return (
        <svg
            ref={canvasRef}
            className={className}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id={`${id}-front`} x2="0" y2="1">
                    <stop stopColor="#fff" stopOpacity="0.6" />
                    <stop offset="0.43" stopColor="var(--stacked-glass-front-tint, #fffdf1)" stopOpacity="0.79" />
                    <stop offset="0.81" stopColor="#fff" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id={`${id}-rear`} x1="0.28" x2="0.72" y2="1">
                    <stop stopColor="#ffe492" stopOpacity="0.6" />
                    <stop offset="0.3" stopColor="#f3bb3d" stopOpacity="0.48" />
                    <stop offset="0.6" stopColor="#fff0b4" stopOpacity="0.15" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0.15" />
                </linearGradient>
                <mask id={`${id}-rear-opening`} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
                    <rect width={width} height={height} fill="white" />
                    <path d={front} fill="black" />
                </mask>
            </defs>
            <rect
                className="stacked-glass-card-rear"
                x="5"
                y={rearOffset}
                width={width - 6}
                height={height - rearOffset - 6}
                rx="18"
                fill={`url(#${id}-rear)`}
                stroke="white"
                strokeOpacity="0.9"
                mask={`url(#${id}-rear-opening)`}
            />
            <path d={front} fill={`url(#${id}-front)`} stroke="white" strokeOpacity="0.9" />
        </svg>
    );
}
