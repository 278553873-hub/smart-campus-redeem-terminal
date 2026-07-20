import React from 'react';
import { CalendarDays, ChevronLeft, UserRound, UserRoundCheck, UsersRound } from 'lucide-react';
import {
  formatQuestionnaireAnswer,
  type StudentCollectionHistoryItem,
} from '../../../shared/questionnaireStore';

interface StudentCollectionRecordDetailViewProps {
  item: StudentCollectionHistoryItem;
  onBack: () => void;
}

const modeMeta = {
  guardian_questionnaire: {
    label: '家长问卷',
    icon: UsersRound,
    badgeClass: 'border border-[var(--tm-audience-guardian-border)] bg-[var(--tm-audience-guardian-soft)] text-[var(--tm-audience-guardian-strong)]',
  },
  student_information: {
    label: '学生采集',
    icon: UserRoundCheck,
    badgeClass: 'border border-[var(--tm-audience-student-border)] bg-[var(--tm-audience-student-soft)] text-[var(--tm-audience-student-strong)]',
  },
} as const;

const formatDetailDate = (value: string) => {
  if (!value) return '';
  const [date, time] = value.split(' ');
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return value;
  return `${year}年${month}月${day}日${time ? ` ${time}` : ''}`;
};

const StudentCollectionRecordDetailView: React.FC<StudentCollectionRecordDetailViewProps> = ({ item, onBack }) => {
  const meta = modeMeta[item.collectionMode];
  const ModeIcon = meta.icon;
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#F5FBFF_0%,#FFFFFF_48%,#F6FAFD_100%)] font-sans text-slate-900">
      <header className="sticky top-0 z-40 flex h-11 shrink-0 items-center justify-between border-b border-slate-100/40 bg-white/84 px-4 backdrop-blur-md">
        <button type="button" onClick={onBack} aria-label="返回学生详情" className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 active:bg-slate-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-bold text-slate-800">采集详情</h1>
        <div className="h-10 w-10" aria-hidden="true" />
      </header>

      <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 no-scrollbar">
        <section className="mt-4 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
          <h2 className="text-balance text-[18px] font-bold leading-6 text-slate-950">{item.title}</h2>
          {item.description && <p className="mt-1 line-clamp-2 text-pretty text-[13px] font-medium leading-5 text-slate-500">{item.description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium text-slate-500">
            <span className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold ${meta.badgeClass}`}><ModeIcon className="h-3.5 w-3.5" />{meta.label}</span>
            <span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5 text-slate-400" />{item.respondentLabel}</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />{formatDetailDate(item.completedAt)}
          </div>
        </section>

        <section className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.10),0_12px_24px_-20px_rgba(35,96,145,0.18)]">
          {item.questions.map((question, index) => {
            const answer = formatQuestionnaireAnswer(item.answers[question.id]);
            const empty = answer === '未填写';
            return (
              <div key={question.id} className="px-4 py-4">
                <div className="text-pretty text-[13px] font-medium leading-5 text-slate-500">{index + 1}. {question.title}</div>
                <div className={`mt-2 whitespace-pre-wrap text-pretty text-[14px] font-semibold leading-6 ${empty ? 'text-slate-300' : 'text-slate-800'}`}>{answer}</div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default StudentCollectionRecordDetailView;
