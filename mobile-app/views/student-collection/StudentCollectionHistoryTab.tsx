import React from 'react';
import { ClipboardCheck, UserRoundCheck, UsersRound } from 'lucide-react';
import type { StudentCollectionHistoryItem } from '../../../shared/questionnaireStore';

interface StudentCollectionHistoryTabProps {
  items: StudentCollectionHistoryItem[];
  onOpen: (item: StudentCollectionHistoryItem) => void;
}

const modeMeta = {
  guardian_questionnaire: {
    label: '家长问卷',
    icon: UsersRound,
    accentClass: 'bg-[var(--tm-audience-guardian-primary)]',
    badgeClass: 'border border-[var(--tm-audience-guardian-border)] bg-[var(--tm-audience-guardian-soft)] text-[var(--tm-audience-guardian-strong)]',
  },
  student_information: {
    label: '学生采集',
    icon: UserRoundCheck,
    accentClass: 'bg-[var(--tm-audience-student-primary)]',
    badgeClass: 'border border-[var(--tm-audience-student-border)] bg-[var(--tm-audience-student-soft)] text-[var(--tm-audience-student-strong)]',
  },
} as const;

const formatListDate = (value: string) => {
  if (!value) return '';
  const month = value.slice(5, 7);
  const day = value.slice(8, 10);
  return month && day ? `${month}月${day}日` : value;
};

const StudentCollectionHistoryTab: React.FC<StudentCollectionHistoryTabProps> = ({ items, onOpen }) => (
  <div className="space-y-2.5 pb-24 pt-2 animate-in fade-in duration-200">
    {items.map(item => {
      const meta = modeMeta[item.collectionMode];
      const ModeIcon = meta.icon;
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpen(item)}
          className="relative min-h-[88px] w-full overflow-hidden rounded-[16px] bg-white px-4 py-4 text-left shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.10),0_12px_24px_-20px_rgba(35,96,145,0.24)] transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.98] active:bg-slate-50"
        >
          <span className={`pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-r-full ${meta.accentClass}`} aria-hidden="true" />
          <div className="line-clamp-2 text-pretty text-[15px] font-semibold leading-[21px] text-slate-900">{item.title}</div>
          <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
            <span className={`inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[11px] font-semibold ${meta.badgeClass}`}><ModeIcon className="h-3.5 w-3.5" />{meta.label}</span>
            <span className="min-w-0 truncate text-right text-[11px] font-medium text-slate-400">{formatListDate(item.completedAt)} · {item.respondentLabel}</span>
          </div>
        </button>
      );
    })}

    {items.length === 0 && (
      <div className="py-14 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-100 text-slate-400"><ClipboardCheck className="h-6 w-6" /></span>
        <div className="mt-4 text-[15px] font-semibold text-slate-600">暂无采集记录</div>
      </div>
    )}
  </div>
);

export default StudentCollectionHistoryTab;
