import React from 'react';
import { Button } from '@arco-design/web-react';
import { Moon, Sun } from 'lucide-react';

export type ScreenTheme = 'dark' | 'light';

/** 图标表示当前样式，辅助名称说明点击后切换到的样式。 */
export function ScreenThemeToggle({ theme, onChange }: { theme: ScreenTheme; onChange: (theme: ScreenTheme) => void }) {
  const light = theme === 'light';
  const label = light ? '切换为暗色样式' : '切换为浅色样式';
  return (
    <Button
      className="screen-panorama-theme-toggle"
      type="text"
      shape="circle"
      aria-label={label}
      aria-pressed={light}
      title={label}
      icon={light ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
      onClick={() => onChange(light ? 'dark' : 'light')}
    />
  );
}
