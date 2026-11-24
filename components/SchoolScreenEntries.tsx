import React, { type ReactNode } from 'react';
import { Button } from '@arco-design/web-react';
import { Monitor, Trophy } from 'lucide-react';

function SchoolScreenEntry({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Button
      type="text"
      className="shrink-0 shadow-none"
      href={href}
      target="_blank"
      anchorProps={{ rel: 'noopener noreferrer', title: `打开${label}大屏（新窗口）` }}
      icon={icon}
    >
      <span className="whitespace-nowrap font-bold">{label}</span>
    </Button>
  );
}

/** 两个顶部入口分别导出，供宿主按各自功能权限控制展示。 */
export function SchoolCockpitEntry() {
  return <SchoolScreenEntry href="?app=data-screen" label="学校驾驶舱" icon={<Monitor size={16} aria-hidden="true" />} />;
}

export function StudentHonorEntry() {
  return <SchoolScreenEntry href="?app=student-honor-screen" label="学生荣誉榜" icon={<Trophy size={16} aria-hidden="true" />} />;
}
