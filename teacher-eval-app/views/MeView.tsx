import React, { useState } from 'react';
import { ChevronRight, RotateCcw, ScrollText, Table2 } from 'lucide-react';
import type { TeacherEvalProfile } from '../domain/demoData.ts';
import { formatPoints, type GrowthSummary } from '../domain/scoring.ts';
import MobileBottomSheet from '../../mobile-app/components/ui/MobileBottomSheet.tsx';

interface MeViewProps {
  profile: TeacherEvalProfile;
  termSummary: GrowthSummary;
  totalPoints: number;
  totalRecords: number;
  onOpenPointsRule: () => void;
  onOpenReviewRecords: () => void;
  onResetDemoData: () => void;
}

const MeView: React.FC<MeViewProps> = ({
  profile,
  termSummary,
  totalPoints,
  totalRecords,
  onOpenPointsRule,
  onOpenReviewRecords,
  onResetDemoData,
}) => {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const menuItems = [
    { id: 'points-rule', label: '积分规则', Icon: Table2, onSelect: onOpenPointsRule },
    { id: 'review-records', label: '填报与审核记录', Icon: ScrollText, onSelect: onOpenReviewRecords },
    { id: 'reset', label: '重置演示数据', Icon: RotateCcw, onSelect: () => setConfirmResetOpen(true) },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[var(--tm-bg-page)]">
      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] pb-[var(--tm-space-5)]">
        <div
          className="mt-[var(--tm-space-4)] flex items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)]"
          style={{ boxShadow: 'var(--tm-shadow-card)' }}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--tm-brand-primary-soft)] text-[20px] font-bold text-[var(--tm-brand-primary)]"
            aria-hidden="true"
          >
            {profile.name.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-bold text-[var(--tm-text-primary)]">{profile.name}</p>
            <p className="mt-1 text-[12px] font-medium text-[var(--tm-text-secondary)]">
              {profile.subject} · {profile.title} · {profile.department}
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-[var(--tm-text-tertiary)]">
              {profile.school} · {profile.joinedYear} 年入职
            </p>
          </div>
        </div>

        <div
          className="mt-[var(--tm-space-3)] grid grid-cols-3 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] py-[var(--tm-space-4)]"
          style={{ boxShadow: 'var(--tm-shadow-card)' }}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-[12px] font-medium text-[var(--tm-text-secondary)]">本学期积分</span>
            <span className="text-[22px] font-bold leading-none text-[var(--tm-brand-primary)]">
              {formatPoints(termSummary.countedPoints)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-[var(--tm-border-subtle)]">
            <span className="text-[12px] font-medium text-[var(--tm-text-secondary)]">累计积分</span>
            <span className="text-[22px] font-bold leading-none text-[var(--tm-text-primary)]">
              {formatPoints(totalPoints)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[12px] font-medium text-[var(--tm-text-secondary)]">记录总数</span>
            <span className="text-[22px] font-bold leading-none text-[var(--tm-text-primary)]">{totalRecords}</span>
          </div>
        </div>

        <div
          className="mt-[var(--tm-space-3)] overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)]"
          style={{ boxShadow: 'var(--tm-shadow-card)' }}
        >
          {menuItems.map(({ id, label, Icon, onSelect }) => (
            <button
              key={id}
              type="button"
              onClick={onSelect}
              className="flex min-h-[52px] w-full items-center gap-[var(--tm-space-3)] border-b border-[var(--tm-border-subtle)] px-[var(--tm-space-4)] text-left last:border-b-0"
            >
              <Icon className="h-[18px] w-[18px] shrink-0" color="var(--tm-text-secondary)" strokeWidth={2.2} aria-hidden="true" />
              <span className="min-w-0 flex-1 text-[15px] font-semibold text-[var(--tm-text-primary)]">{label}</span>
              <ChevronRight className="h-4 w-4 shrink-0" color="var(--tm-text-tertiary)" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <MobileBottomSheet
        open={confirmResetOpen}
        title="重置演示数据"
        onClose={() => setConfirmResetOpen(false)}
      >
        <p className="text-[14px] font-medium leading-relaxed text-[var(--tm-text-secondary)]">
          将清空本次演示新增的记录，恢复到初始的 13 条演示记录。
        </p>
        <div className="mt-[var(--tm-space-4)] grid grid-cols-2 gap-[var(--tm-space-2)]">
          <button
            type="button"
            onClick={() => setConfirmResetOpen(false)}
            className="h-[var(--tm-choice-pill-touch-height)] rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[15px] font-semibold text-[var(--tm-text-secondary)]"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmResetOpen(false);
              onResetDemoData();
            }}
            className="h-[var(--tm-choice-pill-touch-height)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[15px] font-semibold text-[var(--tm-text-inverse)]"
          >
            重置
          </button>
        </div>
      </MobileBottomSheet>
    </div>
  );
};

export default MeView;
