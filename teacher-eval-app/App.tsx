import React, { useCallback, useMemo, useState } from 'react';
import PhoneMockup from '../components/PhoneMockup.tsx';
import MobileToast from '../mobile-app/components/ui/MobileToast.tsx';
import { teacherBrandCssVariables } from '../mobile-app/styles/teacherMobileTokens.ts';
import BottomNav from './components/BottomNav.tsx';
import RecordFeedView from './views/RecordFeedView.tsx';
import GrowthView from './views/GrowthView.tsx';
import MeView from './views/MeView.tsx';
import RecordDetailView from './views/RecordDetailView.tsx';
import PointsRuleView from './views/PointsRuleView.tsx';
import ReviewRecordsView from './views/ReviewRecordsView.tsx';
import { DEMO_GROWTH_RECORDS, DEMO_TEACHER_PROFILE } from './domain/demoData.ts';
import type { GrowthRecord } from './domain/growthRecord.ts';
import {
  CURRENT_ACADEMIC_YEAR,
  CURRENT_TERM,
  PREVIOUS_ACADEMIC_YEAR,
  summarizeGrowth,
  summarizeTotalPoints,
} from './domain/scoring.ts';

type ViewName = 'feed' | 'growth' | 'me' | 'record' | 'points-rule' | 'review-records';

const TAB_VIEWS: ViewName[] = ['feed', 'growth', 'me'];

interface TeacherEvalAppProps {
  /** 演示用的手机壳开关，与教师手机端共用同一个预览开关 */
  showPhoneShell?: boolean;
}

const TeacherEvalApp: React.FC<TeacherEvalAppProps> = ({ showPhoneShell = true }) => {
  const [view, setView] = useState<ViewName>('feed');
  const [history, setHistory] = useState<ViewName[]>([]);
  const [records, setRecords] = useState<GrowthRecord[]>(DEMO_GROWTH_RECORDS);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const termSummary = useMemo(() => summarizeGrowth(records, CURRENT_TERM), [records]);
  const totalPoints = useMemo(
    () => summarizeTotalPoints(records, [PREVIOUS_ACADEMIC_YEAR, CURRENT_ACADEMIC_YEAR]),
    [records],
  );
  const activeRecord = records.find(record => record.id === activeRecordId) ?? null;
  const activeTabIndex = TAB_VIEWS.includes(view) ? TAB_VIEWS.indexOf(view) : 0;

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(current => (current === message ? '' : current)), 1800);
  }, []);

  const openView = useCallback((next: ViewName) => {
    setHistory(previous => [...previous, view]);
    setView(next);
  }, [view]);

  const goBack = useCallback(() => {
    setHistory(previous => {
      const next = [...previous];
      const target = next.pop() ?? 'feed';
      setView(target);
      return next;
    });
  }, []);

  const switchTab = useCallback((index: number) => {
    setHistory([]);
    setView(TAB_VIEWS[index] ?? 'feed');
  }, []);

  const openRecord = useCallback((record: GrowthRecord) => {
    setActiveRecordId(record.id);
    openView('record');
  }, [openView]);

  const handleSubmitRecord = useCallback((record: GrowthRecord) => {
    setRecords(previous => [record, ...previous]);
    showToast('已提交，等待学校审核');
  }, [showToast]);

  const handleResetDemoData = useCallback(() => {
    setRecords(DEMO_GROWTH_RECORDS);
    setHistory([]);
    setView('me');
    showToast('演示数据已重置');
  }, [showToast]);

  const renderView = () => {
    if (view === 'feed') {
      return (
        <RecordFeedView
          records={records}
          termPoints={termSummary.countedPoints}
          onSubmit={handleSubmitRecord}
          onOpenRecord={openRecord}
        />
      );
    }
    if (view === 'growth') {
      return <GrowthView records={records} onOpenRecord={openRecord} />;
    }
    if (view === 'me') {
      return (
        <MeView
          profile={DEMO_TEACHER_PROFILE}
          termSummary={termSummary}
          totalPoints={totalPoints}
          totalRecords={records.length}
          onOpenPointsRule={() => openView('points-rule')}
          onOpenReviewRecords={() => openView('review-records')}
          onResetDemoData={handleResetDemoData}
        />
      );
    }
    if (view === 'record' && activeRecord) {
      return <RecordDetailView record={activeRecord} onBack={goBack} />;
    }
    if (view === 'points-rule') {
      return <PointsRuleView onBack={goBack} />;
    }
    if (view === 'review-records') {
      return <ReviewRecordsView records={records} onBack={goBack} onOpenRecord={openRecord} />;
    }
    return null;
  };

  return (
    <div
      className="teacher-mobile-app flex h-full w-full items-center justify-center bg-[var(--tm-bg-page)] p-4"
      style={teacherBrandCssVariables as React.CSSProperties}
    >
      <PhoneMockup
        showDeviceFrame={showPhoneShell}
        contentTopInsetMode="status-bar"
        screenOverlayRootId="teacher-mobile-overlay-root"
      >
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--tm-bg-page)]">
          {renderView()}
          {TAB_VIEWS.includes(view) && (
            <BottomNav activeIndex={activeTabIndex} onChange={switchTab} />
          )}
          <MobileToast message={toast} />
        </div>
      </PhoneMockup>
    </div>
  );
};

export default TeacherEvalApp;
