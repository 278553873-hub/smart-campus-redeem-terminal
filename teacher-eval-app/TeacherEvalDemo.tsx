import React from 'react';
import TeacherEvalApp from './App.tsx';
import PrdView from './prd/PrdView.tsx';
import { teacherBrandCssVariables } from '../mobile-app/styles/teacherMobileTokens.ts';
import CompactSegmentedControl from '../mobile-app/components/ui/CompactSegmentedControl.tsx';

export type TeacherEvalDemoTab = 'prototype' | 'prd';

const DEMO_TABS: Array<{ id: TeacherEvalDemoTab; label: string }> = [
  { id: 'prototype', label: '原型' },
  { id: 'prd', label: 'PRD' },
];

interface TeacherEvalDemoProps {
  activeTab: TeacherEvalDemoTab;
  onTabChange: (tab: TeacherEvalDemoTab) => void;
  showPhoneShell?: boolean;
}

/** 教师评价演示外壳：顶部「原型 / PRD」大页签，原型走手机壳，PRD 走文档版式。 */
const TeacherEvalDemo: React.FC<TeacherEvalDemoProps> = ({ activeTab, onTabChange, showPhoneShell = true }) => (
  <div
    className="teacher-mobile-app flex h-[100dvh] w-screen flex-col bg-[var(--tm-bg-page)]"
    style={teacherBrandCssVariables as React.CSSProperties}
  >
    <header className="flex shrink-0 items-center justify-center px-[var(--tm-space-4)] pb-[var(--tm-space-3)] pt-[var(--tm-space-4)]">
      <div role="tablist" aria-label="教师评价演示切换">
        <CompactSegmentedControl
          value={activeTab}
          items={DEMO_TABS.map(tab => ({ value: tab.id, label: tab.label }))}
          onChange={onTabChange}
          ariaLabel="教师评价演示切换"
          semantics="tabs"
          density="compact"
          motion="sliding"
          className="w-[var(--tm-report-header-tabs-width)]"
        />
      </div>
    </header>
    <div className="min-h-0 flex-1">
      {activeTab === 'prototype' ? <TeacherEvalApp showPhoneShell={showPhoneShell} /> : <PrdView />}
    </div>
  </div>
);

export default TeacherEvalDemo;
