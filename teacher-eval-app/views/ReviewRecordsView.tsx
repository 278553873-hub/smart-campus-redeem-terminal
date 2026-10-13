import React from 'react';
import type { GrowthRecord } from '../domain/growthRecord.ts';
import RecordCard from '../components/RecordCard.tsx';
import MobilePageHeader from '../../mobile-app/components/ui/MobilePageHeader.tsx';

interface ReviewRecordsViewProps {
  records: GrowthRecord[];
  onBack: () => void;
  onOpenRecord: (record: GrowthRecord) => void;
}

const ReviewRecordsView: React.FC<ReviewRecordsViewProps> = ({ records, onBack, onOpenRecord }) => {
  const sorted = [...records].sort((left, right) => right.issuedAt.localeCompare(left.issuedAt));
  const pending = sorted.filter(record => record.reviewStatus === '待审核').length;
  const rejected = sorted.filter(record => record.reviewStatus === '未通过').length;
  const approved = sorted.filter(record => record.reviewStatus === '已通过').length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[var(--tm-bg-page)]">
      <MobilePageHeader title="填报与审核记录" onBack={onBack} />
      <p className="shrink-0 px-[var(--tm-space-5)] pb-[var(--tm-space-2)] text-[13px] font-medium text-[var(--tm-text-tertiary)]">
        已通过 {approved} 条 · 待审核 {pending} 条 · 未通过 {rejected} 条
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] pb-[var(--tm-space-5)]">
        <div className="flex flex-col gap-[var(--tm-space-3)]">
          {sorted.map(record => (
            <RecordCard key={record.id} record={record} onOpen={onOpenRecord} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewRecordsView;
