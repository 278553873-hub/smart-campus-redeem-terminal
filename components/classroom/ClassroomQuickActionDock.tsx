import React, { useEffect, useRef, useState } from 'react';

interface ClassroomQuickActionDockProps {
  assistantIconSrc: string;
  secondaryIconSrc: string;
  isVoiceListening: boolean;
  voiceLevel: number;
  onToggleVoice: () => void;
  onSecondaryAction?: () => void;
}

interface DockPosition {
  x: number;
  y: number;
}

type FanDirection = 'up-left' | 'up-right' | 'down-left' | 'down-right';

const DOCK_SIZE = 64;
const VIEWPORT_GUTTER = 12;
const MIC_FAN_OFFSET = { x: 21, y: 77 };
const ASSISTANT_FAN_OFFSET = { x: 69, y: 40 };
const MICROPHONE_GLYPH_SRC = '/assets/classroom/microphone-glyph.png';

const VoiceWaveGlyph: React.FC<{ level: number }> = ({ level }) => {
  const bars = [0.35, 0.65, 1, 0.78, 0.48];

  return (
    <div className="relative z-10 flex h-7 w-8 items-center justify-center gap-0.5">
      {bars.map((weight, index) => {
        const height = 7 + Math.round(level * weight * 18);
        return (
          <span
            key={index}
            className="w-1 rounded-full bg-white transition-[height] duration-75 ease-out"
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
};

const ClassroomQuickActionDock: React.FC<ClassroomQuickActionDockProps> = ({
  assistantIconSrc,
  secondaryIconSrc,
  isVoiceListening,
  voiceLevel,
  onToggleVoice,
  onSecondaryAction,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState<DockPosition | null>(null);
  const [fanDirection, setFanDirection] = useState<FanDirection>('up-left');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const launcherButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasVoiceListeningRef = useRef(isVoiceListening);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  const clampPosition = (x: number, y: number): DockPosition => ({
    x: Math.min(
      Math.max(VIEWPORT_GUTTER, x),
      Math.max(VIEWPORT_GUTTER, window.innerWidth - DOCK_SIZE - VIEWPORT_GUTTER),
    ),
    y: Math.min(
      Math.max(VIEWPORT_GUTTER, y),
      Math.max(VIEWPORT_GUTTER, window.innerHeight - DOCK_SIZE - VIEWPORT_GUTTER),
    ),
  });

  const resolveFanDirection = (): FanDirection => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return 'up-left';
    const verticalDirection = rect.top + rect.height / 2 >= window.innerHeight / 2 ? 'up' : 'down';
    const horizontalDirection = rect.left + rect.width / 2 >= window.innerWidth / 2 ? 'left' : 'right';
    return `${verticalDirection}-${horizontalDirection}` as FanDirection;
  };

  const toggleExpanded = () => {
    if (!isExpanded) setFanDirection(resolveFanDirection());
    setIsExpanded((current) => !current);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      drag.moved = true;
      setIsExpanded(false);
    }
    setPosition(clampPosition(drag.originX + dx, drag.originY + dy));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    dragRef.current = { ...drag, active: false };
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!drag.moved) toggleExpanded();
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId === event.pointerId) {
      dragRef.current = { ...drag, active: false };
    }
  };

  useEffect(() => {
    if (!isExpanded) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsExpanded(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsExpanded(false);
      launcherButtonRef.current?.focus();
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (isVoiceListening) {
      setFanDirection(resolveFanDirection());
      setIsExpanded(true);
    } else if (wasVoiceListeningRef.current) {
      setIsExpanded(false);
    }
    wasVoiceListeningRef.current = isVoiceListening;
  }, [isVoiceListening]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((current) => current
        ? clampPosition(current.x, current.y)
        : current);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const verticalSign = fanDirection.startsWith('up') ? -1 : 1;
  const horizontalSign = fanDirection.endsWith('left') ? -1 : 1;
  const micOffset = {
    x: MIC_FAN_OFFSET.x * horizontalSign,
    y: MIC_FAN_OFFSET.y * verticalSign,
  };
  const assistantOffset = {
    x: ASSISTANT_FAN_OFFSET.x * horizontalSign,
    y: ASSISTANT_FAN_OFFSET.y * verticalSign,
  };
  const getActionMotionStyle = (offset: DockPosition, isVisible = isExpanded): React.CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1)`
      : 'translate3d(0, 0, 0) scale(0.55)',
    transitionDuration: isVisible ? '220ms' : '160ms',
    transitionTimingFunction: isVisible
      ? 'cubic-bezier(0.22, 1, 0.36, 1)'
      : 'cubic-bezier(0.4, 0, 1, 1)',
  });

  const voiceStatusStyle: React.CSSProperties = {
    ...(verticalSign < 0 ? { bottom: '76px' } : { top: '76px' }),
    ...(horizontalSign < 0 ? { right: '68px' } : { left: '68px' }),
  };

  return (
    <div
      ref={rootRef}
      className={`fixed z-[80] h-16 w-16 ${position ? '' : 'bottom-28 right-10'}`}
      style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
    >
      <button
        ref={launcherButtonRef}
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          toggleExpanded();
        }}
        onClick={(event) => {
          if (event.detail === 0) toggleExpanded();
        }}
        tabIndex={isVoiceListening ? -1 : 0}
        aria-hidden={isVoiceListening}
        className={`relative z-20 flex h-16 w-16 touch-none select-none items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_18px_36px_rgba(15,23,42,0.22)] transition-[transform,opacity,box-shadow] cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${
          isVoiceListening
            ? 'pointer-events-none scale-75 opacity-0'
            : `opacity-100 hover:scale-105 active:scale-95 ${isExpanded ? 'ring-4 ring-blue-200/70' : 'ring-1 ring-white/80'}`
        }`}
        title={isExpanded ? '收起课堂快捷功能' : '展开课堂快捷功能'}
        aria-label={isExpanded ? '收起课堂快捷功能' : '展开课堂快捷功能'}
        aria-expanded={isExpanded}
        aria-controls="classroom-quick-actions"
      >
        <img
          src={assistantIconSrc}
          alt=""
          draggable={false}
          className="h-full w-full scale-[1.12] select-none object-cover"
        />
      </button>

      <div
        id="classroom-quick-actions"
        role="group"
        aria-label="课堂快捷功能"
        aria-hidden={!isExpanded}
        className={`absolute inset-0 z-10 ${isExpanded ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <div
          className="absolute left-2 top-2 will-change-transform transition-[transform,opacity] motion-reduce:transition-none"
          style={getActionMotionStyle(micOffset)}
        >
          <button
            type="button"
            tabIndex={isExpanded ? 0 : -1}
            onClick={() => {
              if (isVoiceListening) setIsExpanded(false);
              onToggleVoice();
            }}
            className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(180deg,#7BCDFC_0%,#54BAF6_52%,#2D99DF_100%)] text-white shadow-[0_12px_28px_rgba(45,153,223,0.30)] transition-[transform,background-image,box-shadow] hover:scale-105 hover:bg-[linear-gradient(180deg,#8AD7FF_0%,#61C5FB_52%,#38A8E8_100%)] active:scale-95 active:bg-[linear-gradient(180deg,#62BFEF_0%,#43ACEB_52%,#258ACD_100%)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B9E8FF] ${
              isVoiceListening ? 'ring-4 ring-[#54BAF6]/25' : ''
            }`}
            title={isVoiceListening ? '停止语音录入' : '开始语音录入'}
            aria-label={isVoiceListening ? '停止语音录入' : '开始语音录入'}
            aria-pressed={isVoiceListening}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_32%_18%,rgba(255,255,255,0.34),transparent_44%)]"
            />
            {isVoiceListening && <span className="absolute inset-0 rounded-full bg-[#54BAF6]/30 animate-ping" />}
            {isVoiceListening
              ? <VoiceWaveGlyph level={voiceLevel} />
              : (
                <img
                  src={MICROPHONE_GLYPH_SRC}
                  alt=""
                  draggable={false}
                  className="relative z-10 h-8 w-8 select-none object-contain"
                />
              )}
          </button>
        </div>

        <div
          className="absolute left-2 top-2 will-change-transform transition-[transform,opacity] motion-reduce:transition-none"
          style={getActionMotionStyle(assistantOffset, isExpanded && !isVoiceListening)}
          aria-hidden={!isExpanded || isVoiceListening}
        >
          <button
            type="button"
            tabIndex={isExpanded && !isVoiceListening ? 0 : -1}
            onClick={() => {
              setIsExpanded(false);
              onSecondaryAction?.();
            }}
            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
            title="课堂助手"
            aria-label="课堂助手"
          >
            <img
              src={secondaryIconSrc}
              alt=""
              draggable={false}
              className="h-full w-full scale-[1.16] select-none object-cover"
            />
          </button>
        </div>
      </div>

      <div
        aria-live="polite"
        aria-hidden={!isVoiceListening}
        className={`pointer-events-none absolute w-max max-w-[320px] rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.10)] transition-all duration-200 ${
          isVoiceListening ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
        style={voiceStatusStyle}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[12px] font-black text-slate-500">录音采集中</span>
        </div>
        <p className="mt-1.5 text-[16px] font-black leading-snug text-slate-800">点击麦克风结束</p>
      </div>
    </div>
  );
};

export default ClassroomQuickActionDock;
