import React from 'react';
import { Button } from '@arco-design/web-react';
import { Monitor, Trophy } from 'lucide-react';

/** 两个顶部入口分别导出，供宿主按各自功能权限控制展示。 */
export function SchoolCockpitEntry() {
  return (
    <Button
      type="text"
      href="?app=data-screen"
      target="_blank"
      anchorProps={{ rel: 'noopener noreferrer', title: '打开学校驾驶舱（新窗口）' }}
      icon={<Monitor size={16} aria-hidden="true" />}
    >学校驾驶舱</Button>
  );
}

export function StudentHonorEntry() {
  return (
    <Button
      type="text"
      href="?app=student-honor-screen"
      target="_blank"
      anchorProps={{ rel: 'noopener noreferrer', title: '打开学生荣誉榜（新窗口）' }}
      icon={<Trophy size={16} aria-hidden="true" />}
    >学生荣誉榜</Button>
  );
}
