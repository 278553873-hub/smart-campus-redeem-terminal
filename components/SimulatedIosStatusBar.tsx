import React, { useEffect, useState } from 'react';
import { Signal, Wifi } from 'lucide-react';

interface SimulatedIosStatusBarProps {
  visible?: boolean;
  appearance?: 'light' | 'dark';
}

/**
 * 手机演示壳的 iOS 状态栏仿真。
 *
 * 手机壳与「跳转微信」这类整屏仿真界面共用同一份实现，
 * 保证系统状态栏在两套界面里的高度、字号和图标完全一致。
 */
const SimulatedIosStatusBar: React.FC<SimulatedIosStatusBarProps> = ({ visible = true, appearance = 'light' }) => {
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute left-0 top-0 z-[90] flex h-[54px] w-full items-end justify-between px-8 pb-3 text-[12px] font-bold ${appearance === 'dark' ? 'text-white' : 'text-black'} ${visible ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!visible}
    >
      <div className="flex-1 text-left"><span>{currentTime}</span></div>
      <div className="flex flex-1 items-center justify-end gap-1.5 opacity-60">
        <Signal size={13} />
        <Wifi size={13} />
        <div className="ml-0.5 flex items-center">
          <div className="relative h-[11px] w-[22px] rounded-[3px] border-[1.2px] border-current p-[1.5px]">
            <div className="h-full rounded-[0.5px] bg-current" style={{ width: '92%' }} />
            <div className="absolute right-[-3px] top-[2px] h-[4px] w-[1.5px] rounded-r-full bg-current opacity-40" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatedIosStatusBar;
