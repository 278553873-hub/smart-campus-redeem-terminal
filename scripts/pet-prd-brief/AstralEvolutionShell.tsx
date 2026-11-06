import React, { useEffect, useRef } from 'react';

// 独立实现星群与细丝分布，参数逐项采用用户截图的 Violet 预设；不额外添加光环或中央遮罩。
type Point = { x: number; y: number; z: number; hub: boolean };
export const SHELL_PRESET = {
  preset: 'Violet', background: '#0a0a0a', network: '#7C6BFF', highlight: '#8a98ff',
  nodes: 2400, connections: 4, reach: .2, clustering: .85, chords: .35,
  radius: .4, originX: .5, originY: .5, lineOpacity: .7, nodeSize: .8, depthFade: .7,
  spin: 1, tilt: 18, hoverRadius: .22, hoverBoost: 1, pulseSpeed: 1.2, seed: 0,
  interactive: true, draggable: true, clickPulse: true, paused: false,
};
const points: Point[] = [];
const edges: [number, number][] = [];
let seed = SHELL_PRESET.seed;
const random = () => { seed = Math.imul(seed, 1664525) + 1013904223 | 0; return (seed >>> 0) / 4294967296; };
const normalize = (x: number, y: number, z: number): Point => { const length = Math.hypot(x, y, z); return { x: x / length, y: y / length, z: z / length, hub: false }; };
const sphere = () => { const z = random() * 2 - 1, angle = random() * 2 * Math.PI; return normalize(Math.sqrt(1 - z * z) * Math.cos(angle), Math.sqrt(1 - z * z) * Math.sin(angle), z); };
const noise = () => Math.sqrt(-2 * Math.log(Math.max(random(), .000001))) * Math.sin(2 * Math.PI * random());
const scatter = (point: Point, spread: number) => normalize(point.x + noise() * spread, point.y + noise() * spread, point.z + noise() * spread);
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const centers = Array.from({ length: 27 }, sphere);
const bridges: [Point, Point][] = [];
centers.forEach(center => {
  centers.filter(other => other !== center).sort((a, b) => distance(center, a) - distance(center, b)).slice(0, 3).forEach(other => bridges.push([center, other]));
});
for (let i = 0; i < SHELL_PRESET.nodes; i++) {
  const choice = random();
  if (choice > SHELL_PRESET.clustering) points.push(sphere());
  else if (choice < .3) points.push(scatter(centers[Math.floor(random() * centers.length)], .09));
  else {
    const [from, to] = bridges[Math.floor(random() * bridges.length)];
    const fraction = random(), angle = Math.acos(Math.max(-1, Math.min(1, from.x * to.x + from.y * to.y + from.z * to.z)));
    const weightA = Math.sin((1 - fraction) * angle), weightB = Math.sin(fraction * angle);
    points.push(scatter(normalize(from.x * weightA + to.x * weightB, from.y * weightA + to.y * weightB, from.z * weightA + to.z * weightB), .03));
  }
}
const unique = new Set<string>();
const degrees = new Uint16Array(points.length);
function addEdge(i: number, j: number, local: boolean) {
  if (i === j) return;
  const key = `${Math.min(i, j)}:${Math.max(i, j)}`;
  if (unique.has(key)) return;
  unique.add(key); edges.push([i, j]);
  if (local) { degrees[i]++; degrees[j]++; }
}
const cells = new Map<string, number[]>();
const cellSize = SHELL_PRESET.reach;
points.forEach((point, i) => {
  const key = [point.x, point.y, point.z].map(value => Math.floor(value / cellSize)).join(',');
  const cell = cells.get(key) || []; cell.push(i); cells.set(key, cell);
});
points.forEach((point, i) => {
  const cell = [point.x, point.y, point.z].map(value => Math.floor(value / cellSize));
  const neighbours: { index: number; length: number }[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    for (const index of cells.get(`${cell[0] + x},${cell[1] + y},${cell[2] + z}`) || []) {
      if (index === i) continue;
      const length = distance(point, points[index]);
      if (length < SHELL_PRESET.reach) neighbours.push({ index, length });
    }
  }
  neighbours.sort((a, b) => a.length - b.length).slice(0, SHELL_PRESET.connections).forEach(other => addEdge(i, other.index, true));
});
for (let i = 0; i < Math.round(points.length * SHELL_PRESET.chords); i++) {
  const from = Math.floor(random() * points.length);
  for (let attempt = 0; attempt < 12; attempt++) {
    const to = Math.floor(random() * points.length), length = distance(points[from], points[to]);
    if (length > .45 && length < 1.6) { addEdge(from, to, false); break; }
  }
}
points.forEach((point, index) => { point.hub = degrees[index] >= 6; });
const edgeStrength = edges.map(([i, j]) => {
  const amount = Math.max(0, Math.min(1, (distance(points[i], points[j]) - .07) / .13));
  const fade = 1 - amount * amount * (3 - 2 * amount);
  return (.35 + .65 * fade) * (.55 + .45 * fade);
});
function project(time: number, yaw = 0, pitch = 0) {
  const spin = time * .11 * SHELL_PRESET.spin + yaw, tilt = SHELL_PRESET.tilt * Math.PI / 180 + pitch;
  return points.map(point => {
    const x = point.x * Math.cos(spin) + point.z * Math.sin(spin);
    const z = point.z * Math.cos(spin) - point.x * Math.sin(spin);
    const y = point.y * Math.cos(tilt) - z * Math.sin(tilt);
    const depth = point.y * Math.sin(tilt) + z * Math.cos(tilt);
    const perspective = 4 / (4 - depth);
    return { x: SHELL_PRESET.originX * 512 + x * 512 * SHELL_PRESET.radius * perspective, y: (1 - SHELL_PRESET.originY) * 512 - y * 512 * SHELL_PRESET.radius * perspective, z: depth, rim: Math.hypot(x, y), hub: point.hub };
  });
}
function opacity(depth: number) {
  const fraction = Math.max(0, Math.min(1, (depth + .6) / 1.2));
  const front = fraction * fraction * (3 - 2 * fraction);
  return SHELL_PRESET.lineOpacity * (1 - SHELL_PRESET.depthFade + SHELL_PRESET.depthFade * front) * (1 + (1 - Math.abs(depth)) ** 2 * .45);
}
let staticImages: { back: string; front: string } | undefined;
function snapshots() {
  if (staticImages) return staticImages;
  const projected = project(0);
  const image = (front: boolean) => {
    let body = '';
    edges.forEach(([i, j], edgeIndex) => {
      const a = projected[i], b = projected[j];
      if (((a.z + b.z) / 2 >= 0) !== front) return;
      const alpha = opacity((a.z + b.z) / 2) * edgeStrength[edgeIndex];
      body += `<path d="M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}" stroke="#7C6BFF" stroke-width="1.1" opacity="${alpha.toFixed(2)}"/>`;
    });
    projected.forEach(point => {
      if ((point.z >= 0) !== front) return;
      body += `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${SHELL_PRESET.nodeSize * (point.hub ? 1.35 : .8)}" fill="${point.hub ? '#8a98ff' : '#7C6BFF'}" opacity="${Math.min(1, opacity(point.z) + .12).toFixed(2)}"/>`;
    });
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none"><style>path,circle{mix-blend-mode:screen}</style>${body}</svg>`);
  };
  staticImages = { back: image(false), front: image(true) };
  return staticImages;
}
export default function AstralEvolutionShell({ detail }: { detail: boolean }) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!detail) return;
    const back = backRef.current!, front = frontRef.current!;
    const contexts = [back.getContext('2d'), front.getContext('2d')];
    if (!contexts[0] || !contexts[1]) return;
    let frame = 0, visible = false, time = 0, previous = 0, lastPaint = 0;
    let yaw = 0, pitch = 0, pointerX = -999, pointerY = -999, dragging = false, lastX = 0, lastY = 0, travel = 0;
    const pulses: { x: number; y: number; start: number }[] = [];
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    function lightAt(x: number, y: number) {
      if (preference.matches) return 0;
      const hover = Math.exp(-((x - pointerX) ** 2 + (y - pointerY) ** 2) / (512 * SHELL_PRESET.hoverRadius) ** 2) * SHELL_PRESET.hoverBoost;
      let pulse = 0;
      for (const origin of pulses) {
        const age = time - origin.start;
        const distance = Math.hypot(x - origin.x, y - origin.y) / (512 * SHELL_PRESET.radius);
        pulse += Math.exp(-Math.pow((distance - age * SHELL_PRESET.pulseSpeed) * 8, 2)) * Math.exp(-age * .7);
      }
      return Math.min(2, hover + pulse);
    }
    function paint() {
      const projected = project(time, yaw, pitch);
      contexts.forEach((ctx, layer) => {
        if (!ctx) return;
        const canvas = layer === 0 ? back : front;
        ctx.setTransform(canvas.width / 512, 0, 0, canvas.height / 512, 0, 0);
        ctx.clearRect(0, 0, 512, 512);
        ctx.globalCompositeOperation = 'lighter';
        edges.forEach(([i, j], edgeIndex) => {
          const a = projected[i], b = projected[j];
          if (((a.z + b.z) / 2 >= 0) !== (layer === 1)) return;
          ctx.globalAlpha = opacity((a.z + b.z) / 2) * edgeStrength[edgeIndex];
          const glow = lightAt((a.x + b.x) / 2, (a.y + b.y) / 2);
          ctx.globalAlpha = Math.min(1, ctx.globalAlpha + glow * .6);
          ctx.strokeStyle = glow > .15 ? SHELL_PRESET.highlight : SHELL_PRESET.network; ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        });
        projected.forEach((point, index) => {
          if ((point.z >= 0) !== (layer === 1)) return;
          const pulse = point.hub ? .12 * Math.sin(time * 1.2 + index) : 0;
          ctx.globalAlpha = Math.max(.05, Math.min(1, opacity(point.z) + .15 + pulse));
          const glow = lightAt(point.x, point.y);
          ctx.globalAlpha = Math.min(1, ctx.globalAlpha + glow);
          ctx.fillStyle = point.hub || glow > .15 ? SHELL_PRESET.highlight : SHELL_PRESET.network;
          ctx.beginPath(); ctx.arc(point.x, point.y, SHELL_PRESET.nodeSize * .5 * (512 / Math.max(back.clientWidth, 1)) * (point.hub ? 1.35 : .8) * (1 + glow * .7), 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
      });
    }
    function stop() { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    function schedule() { if (!frame && visible && !document.hidden && !preference.matches && !SHELL_PRESET.paused) frame = requestAnimationFrame(draw); }
    function draw(now: number) {
      frame = 0;
      if (previous) time += Math.min((now - previous) / 1000, .05);
      previous = now;
      if (now - lastPaint >= 32) { paint(); lastPaint = now; }
      schedule();
    }
    function resize() {
      const size = back.clientWidth;
      if (!size) return;
      const pixels = Math.ceil(size * Math.min(devicePixelRatio, 1.5));
      [back, front].forEach(canvas => { canvas.width = pixels; canvas.height = pixels; });
      paint();
    }
    const resizeObserver = new ResizeObserver(resize);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) { resize(); schedule(); } else stop(); });
    const onVisibility = () => { if (document.hidden) stop(); else schedule(); };
    const onPreference = () => { stop(); paint(); schedule(); };
    const target = back.closest('.evolution-preview-art')?.parentElement;
    function move(event: PointerEvent) {
      const bounds = back.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width * 512;
      pointerY = (event.clientY - bounds.top) / bounds.height * 512;
      if (dragging && SHELL_PRESET.draggable && !preference.matches) {
        const dx = event.clientX - lastX, dy = event.clientY - lastY;
        yaw += dx / bounds.width * 3.2; pitch += dy / bounds.height * 3.2; travel += Math.abs(dx) + Math.abs(dy);
      }
      lastX = event.clientX; lastY = event.clientY;
    }
    function down(event: PointerEvent) { if (event.button !== 0) return; dragging = true; travel = 0; lastX = event.clientX; lastY = event.clientY; move(event); }
    function up() {
      if (dragging && travel < 8 && SHELL_PRESET.clickPulse && !preference.matches) {
        pulses.push({ x: pointerX, y: pointerY, start: time }); if (pulses.length > 4) pulses.shift();
      }
      dragging = false;
    }
    function leave() { dragging = false; pointerX = pointerY = -999; }
    if (SHELL_PRESET.interactive) {
      target?.addEventListener('pointermove', move); target?.addEventListener('pointerdown', down);
      target?.addEventListener('pointerup', up); target?.addEventListener('pointerleave', leave); target?.addEventListener('pointercancel', leave);
    }
    resize(); resizeObserver.observe(back); observer.observe(back);
    document.addEventListener('visibilitychange', onVisibility);
    preference.addEventListener('change', onPreference);
    return () => { target?.removeEventListener('pointermove', move); target?.removeEventListener('pointerdown', down); target?.removeEventListener('pointerup', up); target?.removeEventListener('pointerleave', leave); target?.removeEventListener('pointercancel', leave); stop(); resizeObserver.disconnect(); observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); preference.removeEventListener('change', onPreference); };
  }, [detail]);
  const images = detail ? undefined : snapshots();
  return <>
    <span className="evolution-astral evolution-astral--back" aria-hidden="true">{detail ? <canvas ref={backRef} /> : <img src={images!.back} alt="" />}</span>
    <span className="evolution-astral evolution-astral--front" aria-hidden="true">{detail ? <canvas ref={frontRef} /> : <img src={images!.front} alt="" />}</span>
  </>;
}
