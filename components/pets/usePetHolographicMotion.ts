import { useEffect, useRef } from 'react';

/** 仅响应当前伙伴的指针，不建立常驻动画循环，也不倾斜姓名和进度。 */
export default function usePetHolographicMotion(enabled: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const scene = ref.current;
    if (!enabled || !scene) return;
    const target = scene.closest<HTMLElement>('.pet-interaction-target');
    if (!target) return;
    const media = window.matchMedia('(prefers-reduced-motion: no-preference)');
    let frame = 0;
    let bounds: DOMRect | null = null;
    let pointer: { x: number; y: number } | null = null;
    let hovered = false;
    const setPosition = (x: number, y: number) => {
      scene.style.setProperty('--pet-tilt-x', `${-y * 4}deg`);
      scene.style.setProperty('--pet-tilt-y', `${x * 4}deg`);
      scene.style.setProperty('--pet-layer-x', `${x * 3}px`);
      scene.style.setProperty('--pet-layer-y', `${y * 2}px`);
      scene.style.setProperty('--pet-foil-x', `${50 + x * 24}%`);
      scene.style.setProperty('--pet-foil-y', `${50 + y * 24}%`);
      scene.style.setProperty('--pet-foil-angle', `${x * 65 + y * 35}deg`);
    };
    const activate = () => {
      if (!media.matches) return;
      scene.dataset.holoActive = 'true';
      bounds = target.getBoundingClientRect();
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
      scene.dataset.holoActive = 'false';
      setPosition(0, 0);
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !media.matches) return;
      hovered = true;
      activate();
      move(event);
    };
    const move = (event: PointerEvent) => {
      if (!hovered || !media.matches || !bounds || !bounds.width || !bounds.height) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!pointer || !bounds) return;
        const x = Math.max(-1, Math.min(1, (pointer.x - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (pointer.y - bounds.top) / bounds.height * 2 - 1));
        setPosition(x, y);
      });
    };
    const leave = () => {
      hovered = false;
      reset();
      if (target.matches(':focus-visible')) activate();
    };
    const focus = () => {
      if (target.matches(':focus-visible')) activate();
    };
    const blur = () => { if (!hovered) reset(); };
    const preferenceChange = () => { if (!media.matches) reset(); };
    target.addEventListener('pointerenter', enter);
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerleave', leave);
    target.addEventListener('pointercancel', leave);
    target.addEventListener('focusin', focus);
    target.addEventListener('focusout', blur);
    media.addEventListener('change', preferenceChange);
    return () => {
      reset();
      target.removeEventListener('pointerenter', enter);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerleave', leave);
      target.removeEventListener('pointercancel', leave);
      target.removeEventListener('focusin', focus);
      target.removeEventListener('focusout', blur);
      media.removeEventListener('change', preferenceChange);
    };
  }, [enabled]);
  return ref;
}
