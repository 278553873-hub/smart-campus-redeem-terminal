import React, { useEffect, useRef, useState } from 'react';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import PhoneMockup from './PhoneMockup';

type LottieTabKey = 'power' | 'winner' | 'security' | 'awards' | 'profile';

const lottieTabs: Array<{ key: LottieTabKey; label: string; trigger: string }> = [
  { key: 'power', label: 'Power', trigger: 'power_trigger' },
  { key: 'winner', label: 'Winners', trigger: 'winner_trigger' },
  { key: 'security', label: 'Security', trigger: 'security_trigger' },
  { key: 'awards', label: 'Awards', trigger: 'awards_trigger' },
  { key: 'profile', label: 'Profile', trigger: 'profile_trigger' },
];

const DemoMiniProgramFluidGlass: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<DotLottie | null>(null);
  const [activeTab, setActiveTab] = useState<LottieTabKey>('power');
  const [isReady, setIsReady] = useState(false);
  const [debugState, setDebugState] = useState('初始化中');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    const player = new DotLottie({
      canvas,
      src: '/animations/ios26-tab-menu-demo-light.lottie',
      autoplay: true,
      loop: false,
      useFrameInterpolation: true,
      layout: { fit: 'cover', align: [0.5, 0.5] },
      stateMachineId: 'SM with Segments',
      stateMachineConfig: {
        openUrlPolicy: { whitelist: [] },
      },
    });

    playerRef.current = player;

    const markReady = () => {
      if (disposed) return;
      const loaded = player.stateMachineLoad('SM with Segments');
      const started = player.stateMachineStart();
      setIsReady(true);
      setDebugState(`状态机：${loaded ? '已加载' : '未加载'} / ${started ? '已启动' : '未启动'}`);
      try {
        player.stateMachineFireEvent('power_trigger');
      } catch {
        // 初始状态已经是 Power 时可忽略。
      }
    };

    const onStateEntered = () => {
      try {
        setDebugState(`当前状态：${player.stateMachineGetCurrentState()}`);
      } catch {
        // 状态机仍在过渡时可能暂时不可读。
      }
    };

    const onError = () => setDebugState('状态机加载失败，请检查 .lottie 文件');

    player.addEventListener('load', markReady);
    player.addEventListener('ready', markReady);
    player.addEventListener('stateMachineStateEntered', onStateEntered);
    player.addEventListener('stateMachineTransition', onStateEntered);
    player.addEventListener('stateMachineError', onError);

    return () => {
      disposed = true;
      player.removeEventListener('load', markReady);
      player.removeEventListener('ready', markReady);
      player.removeEventListener('stateMachineStateEntered', onStateEntered);
      player.removeEventListener('stateMachineTransition', onStateEntered);
      player.removeEventListener('stateMachineError', onError);
      player.destroy();
      playerRef.current = null;
    };
  }, []);

  const handleTabClick = (tab: (typeof lottieTabs)[number]) => {
    setActiveTab(tab.key);
    const player = playerRef.current;
    if (!player) return;

    try {
      if (!player.isStateMachineRunning) {
        player.stateMachineLoad('SM with Segments');
        player.stateMachineStart();
      }
      player.stateMachineFireEvent(tab.trigger);
      setDebugState(`触发：${tab.trigger}`);
    } catch (error) {
      setDebugState(`触发失败：${tab.trigger}`);
      console.error(error);
    }
  };

  return (
    <div className="min-h-[100dvh] w-screen overflow-hidden bg-[#dfe8f2]">
      <style>{`
        .lottie-fluid-screen {
          background:
            radial-gradient(circle at 18% 10%, rgba(125, 211, 252, 0.52), transparent 28%),
            radial-gradient(circle at 84% 18%, rgba(251, 146, 60, 0.34), transparent 30%),
            radial-gradient(circle at 52% 70%, rgba(129, 140, 248, 0.24), transparent 42%),
            linear-gradient(180deg, #fbfdff 0%, #eff6fb 45%, #e8f0f8 100%);
        }

        .lottie-fluid-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.84), rgba(255,255,255,0.42));
          border: 1px solid rgba(255,255,255,0.78);
          box-shadow: 0 24px 80px -48px rgba(15,23,42,0.55), inset 0 1px 0 rgba(255,255,255,0.8);
          backdrop-filter: blur(18px) saturate(1.4);
          -webkit-backdrop-filter: blur(18px) saturate(1.4);
        }

        .lottie-tab-stage {
          position: relative;
          width: 342px;
          max-width: calc(100vw - 42px);
          height: 94px;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 34px;
          transform: translateY(4px);
        }

        .lottie-tab-canvas {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 448px;
          height: 336px;
          max-width: none;
          display: block;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 20px 34px rgba(15,23,42,0.18));
        }

        .lottie-hit-grid {
          position: absolute;
          left: 2px;
          right: 2px;
          top: 24px;
          height: 56px;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          z-index: 5;
        }

        .lottie-hit-button {
          border-radius: 999px;
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }

        .lottie-hit-button:focus-visible {
          box-shadow: inset 0 0 0 1px rgba(125,211,252,0.5);
        }
      `}</style>

      <PhoneMockup showDeviceFrame contentTopInsetMode="status-bar">
        <div className="lottie-fluid-screen relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden="true">
            <div className="absolute left-7 top-28 h-28 w-28 rounded-full bg-sky-200/50 blur-2xl" />
            <div className="absolute right-4 top-48 h-40 w-40 rounded-full bg-orange-200/42 blur-3xl" />
            <div className="absolute bottom-24 left-20 h-36 w-36 rounded-full bg-indigo-200/30 blur-3xl" />
          </div>

          <div className="pointer-events-none absolute left-5 top-5 z-20 rounded-full border border-white/70 bg-white/46 px-3 py-1.5 text-[11px] font-black text-slate-500 shadow-sm backdrop-blur-xl">
            演示小程序端 · Lottie 状态机
          </div>

          <div className="pointer-events-none absolute inset-x-5 top-28 space-y-3" aria-hidden="true">
            <div className="lottie-fluid-card h-28 rounded-[32px]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="lottie-fluid-card h-24 rounded-[28px]" />
              <div className="lottie-fluid-card h-24 rounded-[28px]" />
            </div>
          </div>

          <div className="mt-auto px-4 pb-[28px]">
            <div className="lottie-tab-stage" aria-label="Lottie 状态机底部导航演示">
              <canvas ref={canvasRef} className="lottie-tab-canvas" />
              <div className="lottie-hit-grid" aria-label="演示小程序底部导航">
                {lottieTabs.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    className="lottie-hit-button"
                    aria-current={activeTab === tab.key ? 'page' : undefined}
                    aria-label={tab.label}
                    onClick={() => handleTabClick(tab)}
                    disabled={!isReady}
                  />
                ))}
              </div>
            </div>
            <div className="sr-only" aria-live="polite">{debugState}</div>
          </div>
        </div>
      </PhoneMockup>
    </div>
  );
};

export default DemoMiniProgramFluidGlass;
