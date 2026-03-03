import React, { useState, useRef, useEffect } from 'react';

const IDLE_1 = '/assets/panda/idle_panda_1.mp4';
const IDLE_2 = '/assets/panda/idle_panda_2.mp4';
const TOUCH_1 = '/assets/panda/touch_panda_1.mp4';
const TOUCH_2 = '/assets/panda/touch_panda_2.mp4';

const ALL_VIDEOS = [IDLE_1, IDLE_2, TOUCH_1, TOUCH_2];

const CompanionApp: React.FC = () => {
    const [activeVideo, setActiveVideo] = useState(IDLE_1);
    const [isPlayingTouch, setIsPlayingTouch] = useState(false);

    // Using a ref to hold video elements instead of state
    const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

    // Mute at start to allow autoplay if browser policy is strict, unmute on first interaction
    const [isMuted, setIsMuted] = useState(true);

    const activeVideoRef = useRef(activeVideo);
    const isPlayingTouchRef = useRef(isPlayingTouch);

    useEffect(() => {
        activeVideoRef.current = activeVideo;
        isPlayingTouchRef.current = isPlayingTouch;
    }, [activeVideo, isPlayingTouch]);

    // Initial auto-play
    useEffect(() => {
        const initVideo = videoRefs.current[activeVideo];
        if (initVideo && initVideo.paused) {
            initVideo.play().catch(e => console.log('Initial play prevented:', e));
        }
    }, []);

    const switchVideo = (nextVideo: string, touch: boolean) => {
        // Pre-emptively pause current
        const currentEl = videoRefs.current[activeVideoRef.current];
        if (currentEl) {
            currentEl.pause();
        }

        // Synchronously get new video ready and playing before react render frame
        const nextEl = videoRefs.current[nextVideo];
        if (nextEl) {
            nextEl.currentTime = 0;
            nextEl.play().catch(e => console.log('Auto-play prevented:', e));
        }

        setIsPlayingTouch(touch);
        setActiveVideo(nextVideo);
    };

    const handleVideoEnded = (src: string) => {
        if (src !== activeVideoRef.current) return;

        if (isPlayingTouchRef.current) {
            const nextVideo = Math.random() > 0.5 ? IDLE_1 : IDLE_2;
            switchVideo(nextVideo, false);
        } else {
            const nextVideo = activeVideoRef.current === IDLE_1 ? IDLE_2 : IDLE_1;
            switchVideo(nextVideo, false);
        }
    };

    const handleScreenClick = () => {
        // Unmute upon user interaction
        if (isMuted) {
            setIsMuted(false);
        }

        // When not already in touch sequence, trigger a random touch video
        if (!isPlayingTouchRef.current) {
            const nextTouchVideo = Math.random() > 0.5 ? TOUCH_1 : TOUCH_2;
            switchVideo(nextTouchVideo, true);
        }
    };

    return (
        <div className="w-screen h-screen bg-[#f0f9ff] flex items-center justify-center overflow-hidden py-4">
            <div className="app-container" style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '430px', maxHeight: '932px' }}>
                <div className="phone-mockup" style={{ width: '100%', height: '100%', margin: 0 }}>
                    <div className="dynamic-island z-50"></div>
                    <div className="status-bar-mock text-white mix-blend-difference z-50">
                        <span>9:41</span>
                        <div className="flex gap-1.5 items-center">
                            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><path d="M1 10.5h1.5v-1.5h-1.5v1.5zm3.5 0h1.5v-3.5h-1.5v3.5zm3.5 0h1.5v-5.5h-1.5v5.5zm3.5 0h1.5v-8.5h-1.5v8.5zm3.5 0h1.5v-10.5h-1.5v10.5z" /></svg>
                            <svg width="18" height="10" viewBox="0 0 18 10" fill="currentColor"><path d="M15.333 1.667H1.333A1.333 1.333 0 0 0 0 3v4a1.333 1.333 0 0 0 1.333 1.333h14A1.333 1.333 0 0 0 16.667 7V3a1.333 1.333 0 0 0-1.334-1.333z" /><path d="M17.333 3.333v3.334" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" /></svg>
                        </div>
                    </div>

                    <div
                        className="flex-1 flex flex-col relative w-full h-full bg-gradient-to-bl from-[#dcf5e7] to-[#a8e3c3] overflow-hidden cursor-pointer items-center justify-center"
                        onClick={handleScreenClick}
                    >
                        <div
                            className="w-[70%] max-w-[260px] relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(30,120,70,0.4)] border-[6px] border-white/90 bg-white"
                        >
                            {/* Adding a pb-full or something for aspect ratio isn't necessary if video dictates height, but absolute needs aspect ratio. 
                                We will use a standard 3:4 aspect ratio to prevent object-cover from zooming in too much. */}
                            <div className="relative w-full pb-[110%]">
                                {ALL_VIDEOS.map((src) => (
                                    <video
                                        key={src}
                                        ref={el => {
                                            if (el) videoRefs.current[src] = el;
                                        }}
                                        src={src}
                                        className={`absolute inset-0 w-full h-full object-cover ${activeVideo === src ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                                        playsInline
                                        muted={isMuted}
                                        preload="auto"
                                        onEnded={() => handleVideoEnded(src)}
                                    />
                                ))}
                            </div>
                        </div>

                        {isMuted && (
                            <div className="absolute bottom-24 w-full text-center pointer-events-none animate-bounce z-40">
                                <span className="text-teal-900 tracking-widest text-sm bg-white/80 px-6 py-3 rounded-full backdrop-blur-md font-bold shadow-lg shadow-teal-900/10">
                                    点击屏幕与我互动
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanionApp;
