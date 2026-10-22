import { useLayoutEffect, useRef } from 'react';

/** 动画改变气泡本身的宽度，背景始终贴合正文；出现第二行时立即切换满宽。 */
export function useAssistantBubbleSurface() {
    const bubbleRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<() => void>(() => {});

    useLayoutEffect(() => {
        const bubble = bubbleRef.current;
        if (!bubble) return;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const duration = parseFloat(getComputedStyle(bubble).getPropertyValue('--tm-duration-standard')) || 200;
        const frequency = 6 / (duration / 1000);
        const initial = bubble.getBoundingClientRect();
        const width = { value: initial.width, velocity: 0, target: initial.width };
        let frame = 0;
        let lastTime = 0;
        let locked = false;
        const paint = () => { bubble.style.width = `${width.value}px`; };
        const stop = () => { cancelAnimationFrame(frame); frame = 0; };
        const settle = () => {
            stop();
            width.value = width.target;
            width.velocity = 0;
            if (!locked) paint();
        };
        const tick = (time: number) => {
            frame = 0;
            if (locked || motion.matches) { settle(); return; }
            const elapsed = lastTime ? Math.min(64, time - lastTime) / 1000 : 1 / 60;
            lastTime = time;
            const distance = width.value - width.target;
            const impulse = width.velocity + frequency * distance;
            const decay = Math.exp(-frequency * elapsed);
            width.value = width.target + (distance + impulse * elapsed) * decay;
            width.velocity = (width.velocity - frequency * impulse * elapsed) * decay;
            paint();
            if (Math.abs(width.value - width.target) > .1 || Math.abs(width.velocity) > 1) frame = requestAnimationFrame(tick);
            else settle();
        };
        const measure = () => {
            if (locked) return;
            // 在绘制前按自然宽度测量正文，恢复后才展示，避免把动画中的窄宽度当成换行依据。
            bubble.dataset.measuring = 'true';
            bubble.style.width = '';
            const natural = bubble.getBoundingClientRect();
            const paragraphs = Array.from(bubble.querySelectorAll<HTMLElement>('.assistant-reply-content p'));
            const multipleLines = paragraphs.length > 1 || paragraphs.some(paragraph => {
                const lineHeight = parseFloat(getComputedStyle(paragraph).lineHeight);
                return Number.isFinite(lineHeight) && paragraph.getBoundingClientRect().height > lineHeight + 1;
            });
            const available = bubble.parentElement?.clientWidth ?? 0;
            delete bubble.dataset.measuring;
            if (multipleLines || (available > 0 && natural.width >= available - 1)) {
                locked = true;
                stop();
                // 第二行出现时直接满宽，后续只由自然内容撑高；不用滞后的独立背景尺寸。
                bubble.dataset.widthLocked = 'true';
                width.target = available || natural.width;
                width.value = width.target;
                width.velocity = 0;
                return;
            }
            width.target = natural.width;
            paint();
            if (motion.matches) { settle(); return; }
            if (!frame && Math.abs(width.value - width.target) > .1) {
                lastTime = 0;
                frame = requestAnimationFrame(tick);
            }
        };
        const resize = new ResizeObserver(measure);
        const onMotionChange = () => { if (motion.matches) settle(); };
        // React 每批文字提交后也会测量，不能仅依赖外框尺寸变化触发观察器。
        measureRef.current = measure;
        measure();
        if (bubble.parentElement) resize.observe(bubble.parentElement);
        motion.addEventListener('change', onMotionChange);
        return () => {
            stop();
            resize.disconnect();
            motion.removeEventListener('change', onMotionChange);
            measureRef.current = () => {};
            bubble.style.width = '';
            delete bubble.dataset.widthLocked;
            delete bubble.dataset.measuring;
        };
    }, []);

    useLayoutEffect(() => { measureRef.current(); });
    return { bubbleRef };
}
