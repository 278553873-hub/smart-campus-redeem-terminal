import { useCallback, useEffect, useRef } from 'react';

/** 只跟随助理页面内部滚动；阅读历史时由用户接管。 */
export function useAssistantScrollFollow(
    scrollRef: React.RefObject<HTMLDivElement | null>,
    enabled = true,
    resetKey?: string,
) {
    const resumeRef = useRef<() => void>(() => {});
    const resumeFollowing = useCallback(() => resumeRef.current(), []);

    useEffect(() => {
        const scroller = scrollRef.current;
        if (!enabled || !scroller) return;
        let following = true;
        let frame = 0;
        let previousTime = 0;
        let touchY: number | null = null;
        let previousScrollTop = scroller.scrollTop;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const stop = () => {
            following = false;
            cancelAnimationFrame(frame);
            frame = 0;
        };
        const step = (time: number) => {
            frame = 0;
            if (!following) return;
            const target = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
            const gap = target - scroller.scrollTop;
            const elapsed = previousTime ? Math.min(64, time - previousTime) : 16;
            previousTime = time;
            scroller.scrollTop = motion.matches || Math.abs(gap) < 1
                ? target : scroller.scrollTop + gap * (1 - Math.exp(-elapsed / 65));
            if (Math.abs(target - scroller.scrollTop) > 1) frame = requestAnimationFrame(step);
            else scroller.scrollTop = target;
        };
        const schedule = () => {
            if (!following || frame) return;
            previousTime = 0;
            frame = requestAnimationFrame(step);
        };
        const onScroll = () => {
            const movingDown = scroller.scrollTop > previousScrollTop;
            previousScrollTop = scroller.scrollTop;
            if (!following && movingDown && scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop <= 8) {
                following = true;
                schedule();
            }
        };
        const onWheel = (event: WheelEvent) => { if (event.deltaY < 0) stop(); };
        const onTouchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? null; };
        const onTouchMove = (event: TouchEvent) => {
            const y = event.touches[0]?.clientY;
            if (touchY !== null && y !== undefined && y > touchY) stop();
            touchY = y ?? null;
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (['ArrowUp', 'PageUp', 'Home'].includes(event.key) || (event.key === ' ' && event.shiftKey)) stop();
        };
        // 观察直接子区块即可覆盖文字增量、气泡长高与视口变化。
        const resize = new ResizeObserver(schedule);
        const observe = () => {
            resize.disconnect();
            resize.observe(scroller);
            Array.from(scroller.children).forEach(child => resize.observe(child));
            schedule();
        };
        const mutations = new MutationObserver(observe);
        mutations.observe(scroller, { childList: true });
        observe();
        scroller.addEventListener('scroll', onScroll, { passive: true });
        scroller.addEventListener('wheel', onWheel, { passive: true });
        scroller.addEventListener('touchstart', onTouchStart, { passive: true });
        scroller.addEventListener('touchmove', onTouchMove, { passive: true });
        scroller.addEventListener('keydown', onKeyDown);
        resumeRef.current = () => { following = true; schedule(); };
        return () => {
            stop();
            resize.disconnect();
            mutations.disconnect();
            scroller.removeEventListener('scroll', onScroll);
            scroller.removeEventListener('wheel', onWheel);
            scroller.removeEventListener('touchstart', onTouchStart);
            scroller.removeEventListener('touchmove', onTouchMove);
            scroller.removeEventListener('keydown', onKeyDown);
            resumeRef.current = () => {};
        };
    }, [scrollRef, enabled, resetKey]);

    return resumeFollowing;
}
