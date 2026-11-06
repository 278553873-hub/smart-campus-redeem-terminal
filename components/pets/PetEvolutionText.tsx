import React, { useEffect, useRef } from 'react';

// Independent canvas implementation of latitude text rings, not React Bits source.
type Props = { text?: string; fontWeight?: number; bands?: number; detail?: boolean };
type Vec = { x: number; y: number; z: number };
const TAU = Math.PI * 2;
// Keep glyph size independent of ring count so reducing density does not enlarge letters.
const GLYPH_HEIGHT = 2 / 15 * .8;
const GLYPH_SPACING = 2 / 15 * 1.4;

export default function PetEvolutionText({ text = '进化中', fontWeight = 500, bands = 11, detail = false }: Props) {
  const host = useRef<HTMLSpanElement>(null);
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = host.current!;
    const canvases = [back.current!, front.current!];
    const contexts = canvases.map(canvas => canvas.getContext('2d'));
    if (contexts.some(context => !context)) return;
    const letters = Array.from(text || '进化中');
    const family = getComputedStyle(element).fontFamily;
    const sprites = ['#94A3B8', '#64788F'].map(color => letters.map(letter => {
      const sprite = document.createElement('canvas');
      sprite.width = sprite.height = 96;
      const ctx = sprite.getContext('2d')!;
      ctx.font = `${fontWeight} 72px ${family}`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, 48, 48);
      return sprite;
    }));
    const rows = Array.from({ length: bands }, (_, band) => {
      const latitude = -Math.PI / 2 + Math.PI * (band + .5) / bands;
      const count = Math.max(letters.length, Math.round(TAU * Math.cos(latitude) / GLYPH_SPACING / letters.length) * letters.length);
      const cos = Math.cos(latitude), sin = Math.sin(latitude);
      const glyphs = Array.from({ length: count }, (_, index) => {
        const longitude = index / count * TAU;
        const sl = Math.sin(longitude), cl = Math.cos(longitude);
        return {
          point: { x: cos * sl, y: sin, z: cos * cl },
          right: { x: cl, y: 0, z: -sl },
          down: { x: sin * sl, y: -cos, z: sin * cl },
          letter: index % letters.length,
        };
      });
      return { glyphs, direction: band % 2 ? -1 : 1, offset: band * .37 };
    });
    let width = 0, height = 0, pixelRatio = 1, frame = 0, previous = 0, elapsed = 0;
    let visible = true, disposed = false, dragging = false, yaw = 0, pitch = 0, pulse = 0;
    let pointerX = 0, pointerY = 0, hovering = false, lastX = 0, lastY = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const interaction = element.closest<HTMLElement>('.classroom-pet-card') ?? element.parentElement!.parentElement!;
    function draw() {
      if (!width || !height) return;
      const radius = Math.min(width, height) * .44 * (1 + pulse * .035);
      const glyph = GLYPH_HEIGHT;
      contexts.forEach(ctx => { ctx!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); ctx!.clearRect(0, 0, width, height); });
      function project(p: Vec) {
        const factor = 1 / (1 - p.z * .3);
        return { x: width / 2 + p.x * radius * factor, y: height / 2 - p.y * radius * factor };
      }
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const ct = Math.cos(24 * Math.PI / 180), st = Math.sin(24 * Math.PI / 180);
      for (const row of rows) {
        const angle = yaw + elapsed * .12 + elapsed * .5 * row.direction + row.offset;
        const ca = Math.cos(angle), sa = Math.sin(angle);
        function rotate(v: Vec): Vec {
          const x = v.x * ca + v.z * sa;
          const z = v.z * ca - v.x * sa;
          const y = v.y * cp - z * sp;
          return { x: x * ct - y * st, y: x * st + y * ct, z: v.y * sp + z * cp };
        }
        for (const item of row.glyphs) {
          const p = rotate(item.point);
          const right = rotate(item.right);
          const down = rotate(item.down);
          const center = project(p);
          const distance = hovering ? Math.hypot(center.x - pointerX, center.y - pointerY) : 0;
          const boost = hovering ? Math.max(0, 1 - distance / (radius * .6)) * .18 : 0;
          const step = glyph * (1 + boost);
          const horizontal = project({ x: p.x + right.x * step, y: p.y + right.y * step, z: p.z + right.z * step });
          const vertical = project({ x: p.x + down.x * step, y: p.y + down.y * step, z: p.z + down.z * step });
          const side = p.z < 0 ? 0 : 1;
          const ctx = contexts[side]!;
          ctx.globalAlpha = side ? Math.min(1, .92 + boost * .4) : .15;
          ctx.setTransform(pixelRatio * (horizontal.x - center.x) / 72, pixelRatio * (horizontal.y - center.y) / 72,
            pixelRatio * (vertical.x - center.x) / 72, pixelRatio * (vertical.y - center.y) / 72,
            pixelRatio * center.x, pixelRatio * center.y);
          ctx.drawImage(sprites[side][item.letter], -48, -48);
        }
      }
    }
    function running() { return !disposed && visible && !document.hidden && !reduced.matches && (detail || hovering || dragging); }
    function schedule() {
      if (!frame && running()) frame = requestAnimationFrame(tick);
    }
    function syncPlayback() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0; previous = 0;
      schedule();
    }
    function tick(now: number) {
      frame = 0;
      if (!running()) { previous = 0; return; }
      const delta = previous ? Math.min((now - previous) / 1000, .1) : 0;
      previous = now;
      elapsed += delta;
      pulse *= Math.exp(-6.3 * delta);
      draw();
      schedule();
    }
    const resize = new ResizeObserver(() => {
      const box = element.getBoundingClientRect();
      width = box.width; height = box.height;
      pixelRatio = Math.min(devicePixelRatio || 1, detail ? 2 : 1.5);
      canvases.forEach(canvas => { canvas.width = Math.round(width * pixelRatio); canvas.height = Math.round(height * pixelRatio); });
      draw();
    });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncPlayback(); });
    function move(event: PointerEvent) {
      const box = element.getBoundingClientRect();
      pointerX = event.clientX - box.left; pointerY = event.clientY - box.top;
      hovering = event.pointerType === 'mouse' || event.pointerType === 'pen';
      if (dragging) { yaw += (event.clientX - lastX) * .008; pitch = Math.max(-1, Math.min(1, pitch + (event.clientY - lastY) * .006)); }
      lastX = event.clientX; lastY = event.clientY;
      schedule();
      if (reduced.matches) draw();
    }
    function enter(event: PointerEvent) { move(event); }
    function down(event: PointerEvent) { dragging = true; lastX = event.clientX; lastY = event.clientY; pulse = 1; schedule(); }
    function up() { if (dragging) { dragging = false; syncPlayback(); } }
    function leave() {
      hovering = false; dragging = false; pulse = 0;
      syncPlayback();
      if (visible && !document.hidden) draw();
    }
    interaction.addEventListener('pointerenter', enter);
    interaction.addEventListener('pointermove', move);
    interaction.addEventListener('pointerdown', down);
    interaction.addEventListener('pointerleave', leave);
    window.addEventListener('pointerup', up);
    document.addEventListener('visibilitychange', syncPlayback);
    reduced.addEventListener('change', syncPlayback);
    resize.observe(element); observer.observe(element); schedule();
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      reduced.removeEventListener('change', syncPlayback);
      interaction.removeEventListener('pointerenter', enter);
      interaction.removeEventListener('pointermove', move); interaction.removeEventListener('pointerdown', down);
      interaction.removeEventListener('pointerleave', leave); window.removeEventListener('pointerup', up);
    };
  }, [text, fontWeight, bands, detail]);
  return <>
    <span ref={host} className="pet-evolution-text pet-evolution-text--back" aria-hidden="true"><canvas ref={back} /></span>
    <span className="pet-evolution-text pet-evolution-text--front" aria-hidden="true"><canvas ref={front} /></span>
    <span className="sr-only">进化中</span>
  </>;
}
