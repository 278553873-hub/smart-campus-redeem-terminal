import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ClassInfo, Student } from '../types';

interface HomeworkEntryViewProps {
  classInfo: ClassInfo;
  students: Student[];
  onBack: () => void;
}

const subjectOptions = ['语文', '书法'];
const statusOptions = ['优', '良', '合格', '待合格', '未交'];
const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
const studentGroupSize = 20;

const activeStatusTone: Record<string, string> = {
  优: 'border-[var(--tm-status-positive)] bg-[var(--tm-status-positive)] text-[var(--tm-text-inverse)]',
  良: 'border-[var(--tm-brand-secondary)] bg-[var(--tm-brand-secondary)] text-[var(--tm-text-inverse)]',
  合格: 'border-[var(--tm-brand-reward)] bg-[var(--tm-brand-reward)] text-[var(--tm-text-primary)]',
  待合格: 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]',
  未交: 'border-[var(--tm-status-negative)] bg-[var(--tm-status-negative)] text-[var(--tm-text-inverse)]',
};

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getTodayText = () => formatDateValue(new Date());
const addMonths = (date: Date, offset: number) => new Date(date.getFullYear(), date.getMonth() + offset, 1);
const addDays = (date: Date, offset: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + offset);
  return nextDate;
};

const getMonthGrid = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const leadingEmptyDays = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: leadingEmptyDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
};

const buildMockStatusMap = (students: Student[], count: number, shift = 0) => {
  const statusCycle = ['优', '良', '合格', '待合格'];
  return students.slice(0, Math.min(count, students.length)).reduce<Record<string, string>>((result, student, index) => {
    result[student.id] = statusCycle[(index + shift) % statusCycle.length];
    return result;
  }, {});
};

const buildMockHomeworkResults = (students: Student[]) => {
  const today = new Date();
  return {
    语文: {
      [formatDateValue(addDays(today, -1))]: buildMockStatusMap(students, students.length),
      [formatDateValue(addDays(today, -3))]: buildMockStatusMap(students, Math.ceil(students.length * 0.65), 1),
      [formatDateValue(addDays(today, -8))]: buildMockStatusMap(students, students.length, 2),
    },
    书法: {
      [formatDateValue(addDays(today, -2))]: buildMockStatusMap(students, Math.ceil(students.length * 0.5), 2),
      [formatDateValue(addDays(today, -5))]: buildMockStatusMap(students, students.length, 1),
    },
  };
};

const HomeworkEntryView: React.FC<HomeworkEntryViewProps> = ({ classInfo, students, onBack }) => {
  const [subject, setSubject] = useState(subjectOptions[0]);
  const [homeworkName, setHomeworkName] = useState('');
  const [homeworkDate, setHomeworkDate] = useState(getTodayText());
  const [calendarMonth, setCalendarMonth] = useState(() => parseDateValue(getTodayText()));
  const [homeworkResultsBySubject, setHomeworkResultsBySubject] = useState<Record<string, Record<string, Record<string, string>>>>(() => buildMockHomeworkResults(students));

  const todayText = getTodayText();
  const monthDays = getMonthGrid(calendarMonth);
  const subjectResultsByDate = homeworkResultsBySubject[subject] ?? {};
  const statusMap = subjectResultsByDate[homeworkDate] ?? {};
  const sortedStudents = [...students].sort((first, second) => (first.studentNo ?? first.id).localeCompare(second.studentNo ?? second.id, 'zh-Hans-CN', { numeric: true }));
  const studentGroups = Array.from({ length: Math.ceil(sortedStudents.length / studentGroupSize) }, (_, index) => {
    const start = index * studentGroupSize;
    return {
      key: `student-group-${index + 1}`,
      label: `${start + 1}-${Math.min(start + studentGroupSize, sortedStudents.length)}`,
      items: sortedStudents.slice(start, start + studentGroupSize),
    };
  });
  const completedCount = students.filter(student => statusMap[student.id]).length;

  const updateHomeworkDateResults = (updater: (current: Record<string, string>) => Record<string, string>) => {
    setHomeworkResultsBySubject(current => ({
      ...current,
      [subject]: {
        ...(current[subject] ?? {}),
        [homeworkDate]: updater(current[subject]?.[homeworkDate] ?? {}),
      },
    }));
  };

  const updateStudentStatus = (studentId: string, status: string) => {
    updateHomeworkDateResults(current => {
      if (current[studentId] !== status) return { ...current, [studentId]: status };
      const { [studentId]: _removed, ...rest } = current;
      return rest;
    });
  };

  const applyQuickStatus = (status: string) => {
    updateHomeworkDateResults(() => students.reduce<Record<string, string>>((result, student) => {
      result[student.id] = status;
      return result;
    }, {}));
  };

  const jumpToToday = () => {
    const today = new Date();
    setHomeworkDate(formatDateValue(today));
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const getDateResultTone = (dateValue: string) => {
    const dateStatusMap = subjectResultsByDate[dateValue];
    if (!dateStatusMap) return 'bg-transparent';
    const count = students.filter(student => dateStatusMap[student.id]).length;
    if (count === 0) return 'bg-transparent';
    return count === students.length ? 'bg-[var(--tm-status-positive)]' : 'bg-[var(--tm-brand-secondary)]';
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回班级列表"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">作业录入</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[calc(var(--tm-space-6)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)] no-scrollbar">
        <div className="mb-[var(--tm-space-3)] flex items-center justify-between text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]"><span className="truncate">{classInfo.name}</span><span>已录入 {completedCount}/{students.length}</span></div>

        <div className="mb-[var(--tm-space-3)] grid grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-[var(--tm-space-1)]" role="tablist" aria-label="学科">
          {subjectOptions.map(item => <button key={item} type="button" role="tab" aria-selected={subject === item} onClick={() => setSubject(item)} className={`min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-inner)] text-[length:var(--tm-font-size-body)] font-semibold ${subject === item ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>{item}</button>)}
        </div>

        <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] shadow-[var(--tm-shadow-card)]">
          <div className="mb-[var(--tm-space-2)] flex items-center justify-between">
            <div className="flex items-center">
              <button type="button" onClick={() => setCalendarMonth(current => addMonths(current, -1))} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="上个月"><ChevronLeft className="h-[18px] w-[18px]" /></button>
              <strong className="min-w-[110px] text-center text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{calendarMonth.getFullYear()}年 {calendarMonth.getMonth() + 1}月</strong>
              <button type="button" onClick={() => setCalendarMonth(current => addMonths(current, 1))} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="下个月"><ChevronRight className="h-[18px] w-[18px]" /></button>
            </div>
            <button type="button" onClick={jumpToToday} className="min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]">今天</button>
          </div>
          <div className="grid grid-cols-7 text-center text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{weekDays.map(day => <span key={day} className="py-[var(--tm-space-2)]">{day}</span>)}</div>
          <div className="grid grid-cols-7">
            {monthDays.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} className="h-[var(--tm-size-touch)]" />;
              const value = formatDateValue(date);
              const selected = value === homeworkDate;
              return <button key={value} type="button" onClick={() => setHomeworkDate(value)} className="relative flex h-[var(--tm-size-touch)] items-center justify-center" aria-label={value} aria-pressed={selected}><span className={`flex h-8 w-8 items-center justify-center rounded-full text-[length:var(--tm-font-size-compact)] font-medium ${selected ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : value === todayText ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-primary)]'}`}>{value === todayText && !selected ? '今' : date.getDate()}</span><span className={`absolute bottom-[2px] h-1 w-1 rounded-full ${getDateResultTone(value)}`} /></button>;
            })}
          </div>
          <input value={homeworkName} onChange={event => setHomeworkName(event.target.value)} placeholder="作业名称（选填）" className="mt-[var(--tm-space-3)] h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100 read-only:border-[var(--tm-input-readonly-border)] read-only:bg-[var(--tm-input-readonly-bg)] read-only:text-[var(--tm-input-readonly-text)]" />
        </section>

        <section className="mt-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] shadow-[var(--tm-shadow-card)]">
          <div className="mb-[var(--tm-space-2)] flex items-center justify-between"><h2 className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">批量操作</h2><span className="text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">实时保存</span></div>
          <div className="grid grid-cols-5 gap-[var(--tm-space-1)]">{statusOptions.map(status => <button key={status} type="button" onClick={() => applyQuickStatus(status)} className={`min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] border text-[length:var(--tm-font-size-meta)] font-semibold ${activeStatusTone[status]}`}>{status}</button>)}</div>

          {studentGroups.length > 1 && <div className="mt-[var(--tm-space-3)] flex gap-[var(--tm-space-2)] overflow-x-auto no-scrollbar">{studentGroups.map(group => <button key={group.key} type="button" onClick={() => document.getElementById(group.key)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="min-h-[var(--tm-size-touch)] shrink-0 rounded-full bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">{group.label}</button>)}</div>}

          <div className="mt-[var(--tm-space-3)] space-y-[var(--tm-space-3)]">
            {studentGroups.map(group => <div key={group.key} id={group.key} className="scroll-mt-[var(--tm-space-3)]"><div className="mb-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">第{group.label}人</div><div className="divide-y divide-[var(--tm-border-subtle)] overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)]">{group.items.map(student => <div key={student.id} className="grid min-h-[64px] grid-cols-[72px_minmax(0,1fr)] items-center gap-[var(--tm-space-2)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-2)] py-[var(--tm-space-2)]"><div className="min-w-0"><strong className="block truncate text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-primary)]">{student.name}</strong><small className="text-[length:var(--tm-font-size-badge)] text-[var(--tm-text-tertiary)]">{student.studentNo ?? student.id}</small></div><div className="grid grid-cols-5 gap-[var(--tm-space-1)]">{statusOptions.map(status => { const active = statusMap[student.id] === status; return <button key={status} type="button" onClick={() => updateStudentStatus(student.id, status)} aria-pressed={active} className={`min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] border text-[length:var(--tm-font-size-badge)] font-semibold ${active ? activeStatusTone[status] : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}>{status}</button>; })}</div></div>)}</div></div>)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeworkEntryView;
