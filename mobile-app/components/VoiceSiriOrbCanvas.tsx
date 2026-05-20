import React, { useEffect, useRef } from 'react';

interface VoiceSiriOrbCanvasProps {
  level: number;
  canceling?: boolean;
  className?: string;
}

const TAU = Math.PI * 2;

const drawRibbon = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
  colorA: string,
  colorB: string,
  width: number,
  amp: number,
  phase: number,
) => {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.globalCompositeOperation = 'screen';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 18;
  ctx.shadowColor = colorB;

  const gradient = ctx.createLinearGradient(-radius * 0.92, 0, radius * 0.92, 0);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.18, colorA);
  gradient.addColorStop(0.5, colorB);
  gradient.addColorStop(0.74, 'rgba(255,255,255,0.72)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = gradient;
  ctx.lineWidth = width;

  ctx.beginPath();
  const start = -radius * 0.9;
  const end = radius * 0.9;
  const steps = 54;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = start + (end - start) * t;
    const wave = Math.sin(t * Math.PI * 2 + phase) * amp + Math.sin(t * Math.PI * 4 + phase * 0.7) * amp * 0.32;
    const y = wave * (1 - Math.abs(t - 0.5) * 0.72);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
};

export const VoiceSiriOrbCanvas: React.FC<VoiceSiriOrbCanvasProps> = ({ level, canceling = false, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const levelRef = useRef(level);
  const cancelingRef = useRef(canceling);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    cancelingRef.current = canceling;
  }, [canceling]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const draw = (time: number) => {
      const t = mediaQuery.matches ? 0 : time / 1000;
      const voice = Math.max(0.18, Math.min(1, levelRef.current));
      const pulse = mediaQuery.matches ? 0.25 : (Math.sin(t * 2.4) + 1) * 0.5;
      const cx = size / 2;
      const cy = size / 2;
      const radius = 82 + voice * 8 + pulse * 3;
      const isCanceling = cancelingRef.current;

      ctx.clearRect(0, 0, size, size);

      // Outside glow.
      const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.72, cx, cy, radius * 1.82);
      outerGlow.addColorStop(0, isCanceling ? 'rgba(251,146,60,0.28)' : 'rgba(90,128,255,0.28)');
      outerGlow.addColorStop(0.58, isCanceling ? 'rgba(244,63,94,0.09)' : 'rgba(125,90,255,0.12)');
      outerGlow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.9, 0, TAU);
      ctx.fill();

      // Subtle rings.
      ctx.save();
      ctx.globalAlpha = isCanceling ? 0.22 : 0.18;
      for (let i = 0; i < 3; i += 1) {
        ctx.strokeStyle = isCanceling ? 'rgba(251,146,60,0.42)' : 'rgba(96,165,250,0.42)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 20 + i * 24 + voice * 10, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TAU);
      ctx.clip();

      // Glass sphere base.
      const base = ctx.createRadialGradient(cx - 28, cy - 34, 8, cx, cy, radius * 1.1);
      if (isCanceling) {
        base.addColorStop(0, '#FFE4C6');
        base.addColorStop(0.3, '#FB923C');
        base.addColorStop(0.62, '#F43F5E');
        base.addColorStop(1, '#9F1239');
      } else {
        base.addColorStop(0, '#9CF6FF');
        base.addColorStop(0.27, '#6D5DFB');
        base.addColorStop(0.58, '#982DE8');
        base.addColorStop(1, '#FF4FB8');
      }
      ctx.fillStyle = base;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Deep shade for spherical depth.
      const shade = ctx.createRadialGradient(cx + radius * 0.2, cy + radius * 0.24, radius * 0.15, cx, cy, radius * 1.12);
      shade.addColorStop(0, 'rgba(255,255,255,0)');
      shade.addColorStop(0.64, 'rgba(255,255,255,0.02)');
      shade.addColorStop(1, 'rgba(18,12,84,0.48)');
      ctx.fillStyle = shade;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      const ribbonBoost = voice * 16;
      drawRibbon(ctx, cx, cy, radius, -0.26 + t * 0.55, 'rgba(53,232,255,0.25)', 'rgba(151,255,248,0.9)', 18 + ribbonBoost * 0.22, 22 + ribbonBoost, t * 2.1);
      drawRibbon(ctx, cx, cy, radius, 1.08 - t * 0.38, 'rgba(255,93,211,0.22)', 'rgba(255,124,226,0.86)', 16 + ribbonBoost * 0.18, 18 + ribbonBoost * 0.75, t * 2.7 + 1.4);
      drawRibbon(ctx, cx, cy, radius, 2.26 + t * 0.32, 'rgba(120,104,255,0.24)', 'rgba(126,104,255,0.82)', 15 + ribbonBoost * 0.16, 16 + ribbonBoost * 0.62, t * 2.3 + 2.2);
      drawRibbon(ctx, cx, cy, radius, 3.62 - t * 0.46, 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0.78)', 11 + ribbonBoost * 0.12, 13 + ribbonBoost * 0.5, t * 2.9 + 3.1);

      // Central star-like crossing highlight.
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.62);
      const star = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.58);
      star.addColorStop(0, 'rgba(255,255,255,0.86)');
      star.addColorStop(0.15, 'rgba(255,255,255,0.34)');
      star.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = star;
      ctx.scale(1.7, 0.42);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.42, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Glass sheen.
      const sheen = ctx.createRadialGradient(cx - radius * 0.32, cy - radius * 0.42, 0, cx - radius * 0.32, cy - radius * 0.42, radius * 0.7);
      sheen.addColorStop(0, 'rgba(255,255,255,0.62)');
      sheen.addColorStop(0.28, 'rgba(255,255,255,0.16)');
      sheen.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      ctx.restore();

      // Crisp outer rim.
      ctx.strokeStyle = 'rgba(255,255,255,0.52)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, TAU);
      ctx.stroke();

      if (!mediaQuery.matches) {
        frameRef.current = requestAnimationFrame(draw);
      }
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};
