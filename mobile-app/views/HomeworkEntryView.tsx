import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import MobileToast from '../components/ui/MobileToast';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import HomeworkStatusButtonGroup from '../components/homework/HomeworkStatusButtonGroup';
import {
  HOMEWORK_STATUS_META,
  buildHomeworkResults,
  getAssignmentCompletionCount,
  type HomeworkAssignment,
  type HomeworkStatus,
} from '../domain/homework';
import type { ClassInfo, Student } from '../types';

interface HomeworkEntryViewProps {
  schoolId: string;
  schoolName: string;
  classInfo: ClassInfo;
  students: Student[];
  subjects: string[];
  teacherName: string;
  assignments: HomeworkAssignment[];
  onSaveAssignment: (assignment: HomeworkAssignment) => void;
  onBack: () => void;
}

const getTodayText = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value: string) => {
  const [year, month, day] = value.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
};

const parseDateText = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateText = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addMonths = (date: Date, offset: number) => (
  new Date(date.getFullYear(), date.getMonth() + offset, 1)
);

const getMonthDays = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const leadingEmptyDays = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: leadingEmptyDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
    ...Array.from({ length: 42 - leadingEmptyDays - daysInMonth }, () => null),
  ];
};

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
const studentGroupSize = 20;

const HomeworkEntryView: React.FC<HomeworkEntryViewProps> = ({
  schoolId,
  schoolName,
  classInfo,
  students,
  subjects,
  teacherName,
  assignments,
  onSaveAssignment,
  onBack,
}) => {
  const availableSubjects = subjects.length > 0 ? subjects : ['未配置学科'];
  const initialAssignment = assignments
    .filter(assignment => assignment.classId === classInfo.id && assignment.subject === availableSubjects[0])
    .sort((first, second) => second.date.localeCompare(first.date) || second.updatedAt.localeCompare(first.updatedAt))[0];
  const initialDate = initialAssignment?.date ?? getTodayText();
  const [subject, setSubject] = useState(availableSubjects[0]);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(initialAssignment?.id ?? null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [calendarMonth, setCalendarMonth] = useState(() => parseDateText(initialDate));
  const [draftDate, setDraftDate] = useState(getTodayText());
  const [draftTitle, setDraftTitle] = useState('');
  const [toast, setToast] = useState('');

  const classAssignments = useMemo(() => (
    assignments
      .filter(assignment => assignment.classId === classInfo.id && assignment.subject === subject)
      .sort((first, second) => second.date.localeCompare(first.date) || second.updatedAt.localeCompare(first.updatedAt))
  ), [assignments, classInfo.id, subject]);
  const activeAssignment = assignments.find(assignment => assignment.id === activeAssignmentId) ?? null;
  const assignmentsByDate = useMemo(() => (
    classAssignments.reduce<Record<string, HomeworkAssignment[]>>((result, assignment) => {
      (result[assignment.date] ??= []).push(assignment);
      return result;
    }, {})
  ), [classAssignments]);
  const selectedDateAssignments = assignmentsByDate[selectedDate] ?? [];
  const calendarDays = useMemo(() => getMonthDays(calendarMonth), [calendarMonth]);
  const todayText = getTodayText();
  const getDateMarkerTone = (dateText: string) => {
    const dateAssignments = assignmentsByDate[dateText] ?? [];
    if (dateAssignments.length === 0) return '';
    return dateAssignments.every(assignment => getAssignmentCompletionCount(assignment) === assignment.results.length)
      ? 'bg-[var(--tm-status-positive)]'
      : 'bg-[var(--tm-brand-secondary)]';
  };
  const activeResultGroups = useMemo(() => {
    if (!activeAssignment) return [];
    return Array.from({ length: Math.ceil(activeAssignment.results.length / studentGroupSize) }, (_, index) => {
      const start = index * studentGroupSize;
      const end = Math.min(start + studentGroupSize, activeAssignment.results.length);
      return {
        id: `homework-student-group-${index + 1}`,
        label: `${start + 1}-${end}`,
        start,
        results: activeAssignment.results.slice(start, end),
      };
    });
  }, [activeAssignment]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const startCreate = () => {
    setDraftDate(selectedDate);
    setDraftTitle('');
    setIsCreating(true);
  };

  const selectDate = (dateText: string) => {
    setSelectedDate(dateText);
    setActiveAssignmentId(assignmentsByDate[dateText]?.[0]?.id ?? null);
  };

  const changeSubject = (nextSubject: string) => {
    setSubject(nextSubject);
    const nextAssignments = assignments
      .filter(assignment => assignment.classId === classInfo.id && assignment.subject === nextSubject)
      .sort((first, second) => second.date.localeCompare(first.date) || second.updatedAt.localeCompare(first.updatedAt));
    const nextAssignment = nextAssignments.find(assignment => assignment.date === selectedDate) ?? nextAssignments[0] ?? null;
    setActiveAssignmentId(nextAssignment?.id ?? null);
    if (nextAssignment && nextAssignment.date !== selectedDate) {
      setSelectedDate(nextAssignment.date);
      setCalendarMonth(parseDateText(nextAssignment.date));
    }
  };

  const createAssignment = () => {
    const title = draftTitle.trim();
    if (!draftDate || !title || subject === '未配置学科') {
      showToast(subject === '未配置学科' ? '请先配置任教学科' : '请填写作业日期和主题');
      return;
    }
    const now = new Date().toISOString();
    const assignment: HomeworkAssignment = {
      id: `manual-homework-${Date.now()}`,
      schoolId,
      schoolName,
      classId: classInfo.id,
      className: classInfo.name,
      subject,
      teacherName,
      date: draftDate,
      title,
      source: 'manual',
      creatorName: teacherName,
      createdAt: now,
      updatedAt: now,
      results: buildHomeworkResults(students),
    };
    onSaveAssignment(assignment);
    setSelectedDate(draftDate);
    setCalendarMonth(parseDateText(draftDate));
    setActiveAssignmentId(assignment.id);
    setIsCreating(false);
  };

  const jumpToToday = () => {
    const today = parseDateText(todayText);
    selectDate(todayText);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const saveResultChange = (studentId: string, status: HomeworkStatus) => {
    if (!activeAssignment) return;
    onSaveAssignment({
      ...activeAssignment,
      updatedAt: new Date().toISOString(),
      results: activeAssignment.results.map(result => (
        result.studentId === studentId
          ? { ...result, status: result.status === status ? null : status, manuallyConfirmed: true }
          : result
      )),
    });
  };

  const applyStatusToAll = (status: HomeworkStatus) => {
    if (!activeAssignment) return;
    onSaveAssignment({
      ...activeAssignment,
      updatedAt: new Date().toISOString(),
      results: activeAssignment.results.map(result => ({ ...result, status, manuallyConfirmed: true })),
    });
    showToast(`已将全班设为${HOMEWORK_STATUS_META[status].label}`);
  };

  const renderHeader = (title: string, backAction: () => void) => (
    <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
      <button type="button" onClick={backAction} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">{title}</h1>
    </header>
  );

  if (isCreating) {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
        {renderHeader('新建作业', () => setIsCreating(false))}
        <main className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] py-[var(--tm-space-3)] no-scrollbar">
          <div className="space-y-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)] [box-shadow:var(--tm-shadow-card)]">
            <label className="block">
              <span className="mb-[var(--tm-space-2)] block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">作业日期</span>
              <input type="date" value={draftDate} onChange={event => setDraftDate(event.target.value)} className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
            </label>
            <label className="block">
              <span className="mb-[var(--tm-space-2)] block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">作业主题</span>
              <input value={draftTitle} onChange={event => setDraftTitle(event.target.value)} placeholder="例如：分数应用题" autoFocus className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
            </label>
            {availableSubjects.length > 1 ? (
              <label className="block">
                <span className="mb-[var(--tm-space-2)] block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">任教学科</span>
                <select value={subject} onChange={event => setSubject(event.target.value)} className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)]">
                  {availableSubjects.map(item => <option key={item}>{item}</option>)}
                </select>
              </label>
            ) : (
              <div className="flex min-h-[var(--tm-size-touch)] items-center justify-between text-[length:var(--tm-font-size-body)]"><span className="text-[var(--tm-text-secondary)]">任教学科</span><strong className="text-[var(--tm-text-primary)]">{subject}</strong></div>
            )}
          </div>
        </main>
        <footer className="shrink-0 bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)]">
          <button type="button" onClick={createAssignment} className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)]">开始登记</button>
        </footer>
        <MobileToast message={toast} />
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      {renderHeader('作业录入', onBack)}
      <main className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[calc(var(--tm-space-6)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)] no-scrollbar">
        <div className="mb-[var(--tm-space-3)] flex min-h-[var(--tm-size-touch)] items-center justify-between gap-[var(--tm-space-3)]">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{classInfo.name}</h2>
            {availableSubjects.length === 1 && <div className="mt-[var(--tm-space-1)] truncate text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{subject}</div>}
          </div>
          {activeAssignment && <span className="shrink-0 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">已录入 {getAssignmentCompletionCount(activeAssignment)}/{activeAssignment.results.length}</span>}
        </div>
        {availableSubjects.length > 1
          ? <CompactSegmentedControl value={subject} items={availableSubjects.map(item => ({ value: item, label: item }))} onChange={changeSubject} ariaLabel="任教学科" fullWidth className="mb-[var(--tm-space-3)]" />
          : null}

        <>
            <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] pb-[var(--tm-space-3)] pt-[var(--tm-space-2)] [box-shadow:var(--tm-shadow-card)]">
              <div className="flex min-h-[var(--tm-size-touch)] items-center justify-between">
                <div className="flex items-center">
                  <button type="button" onClick={() => setCalendarMonth(current => addMonths(current, -1))} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="上个月"><ChevronLeft className="h-[18px] w-[18px]" /></button>
                  <strong className="min-w-[104px] text-center text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{calendarMonth.getFullYear()}年{calendarMonth.getMonth() + 1}月</strong>
                  <button type="button" onClick={() => setCalendarMonth(current => addMonths(current, 1))} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="下个月"><ChevronRight className="h-[18px] w-[18px]" /></button>
                </div>
                <button type="button" onClick={jumpToToday} className="min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]">今天</button>
              </div>
              <div className="grid grid-cols-7 text-center text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{weekDays.map(day => <span key={day} className="flex h-9 items-center justify-center">{day}</span>)}</div>
              <div className="grid grid-cols-7">
                {calendarDays.map((date, index) => {
                  if (!date) return <span key={`calendar-empty-${index}`} className="h-12" />;
                  const dateText = formatDateText(date);
                  const selected = selectedDate === dateText;
                  const assignmentCount = assignmentsByDate[dateText]?.length ?? 0;
                  const markerTone = getDateMarkerTone(dateText);
                  return (
                    <button
                      key={dateText}
                      type="button"
                      onClick={() => selectDate(dateText)}
                      className="relative flex h-12 items-center justify-center rounded-[var(--tm-radius-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                      aria-label={`${formatDateLabel(dateText)}${assignmentCount > 0 ? `，${assignmentCount}次作业` : '，无作业'}`}
                      aria-pressed={selected}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[length:var(--tm-font-size-compact)] font-medium ${selected ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : dateText === todayText ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-primary)]'}`}>{dateText === todayText && !selected ? '今' : date.getDate()}</span>
                      {assignmentCount === 1 && <span className={`absolute bottom-[3px] h-1 w-1 rounded-full ${markerTone}`} />}
                      {assignmentCount > 1 && <span className={`absolute bottom-0 min-w-3 rounded-full px-1 text-center text-[10px] font-semibold leading-3 ${selected ? 'bg-[var(--tm-text-inverse)] text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-brand-secondary-soft)] text-[var(--tm-brand-secondary-strong)]'}`}>{assignmentCount}</span>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-[var(--tm-space-3)] flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] pl-[var(--tm-space-3)] pr-[var(--tm-space-1)]">
                {activeAssignment ? (
                  <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-input-text)]">{activeAssignment.title}</span>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-input-placeholder)]">当天还没有作业</span>
                )}
                <button type="button" onClick={startCreate} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]" aria-label={`新建${formatDateLabel(selectedDate)}作业`}><Plus className="h-5 w-5" /></button>
              </div>
            </section>

            {selectedDateAssignments.length > 1 && (
              <div className="mt-[var(--tm-space-3)] flex gap-[var(--tm-space-2)] overflow-x-auto no-scrollbar" role="tablist" aria-label="当天作业">
                {selectedDateAssignments.map(assignment => (
                  <button key={assignment.id} type="button" role="tab" aria-selected={assignment.id === activeAssignmentId} onClick={() => setActiveAssignmentId(assignment.id)} className={`min-h-[var(--tm-size-touch)] shrink-0 rounded-[var(--tm-radius-control)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-compact)] font-semibold ${assignment.id === activeAssignmentId ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)]'}`}>{assignment.title}</button>
                ))}
              </div>
            )}

            {activeAssignment ? (
              <section className="mt-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card)]">
                <div className="mb-[var(--tm-space-2)] flex min-h-8 items-center justify-between gap-[var(--tm-space-3)]">
                  <h2 className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">批量操作</h2>
                  <span className="shrink-0 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-tertiary)]">实时保存</span>
                </div>
                <HomeworkStatusButtonGroup value={null} onChange={applyStatusToAll} ariaLabel="全班批量设置作业等级" showAllTones />

                {activeResultGroups.length > 1 && (
                  <div className="mt-[var(--tm-space-3)] flex gap-[var(--tm-space-2)] overflow-x-auto no-scrollbar" aria-label="学生分组">
                    {activeResultGroups.map(group => <button key={group.id} type="button" onClick={() => document.getElementById(group.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="min-h-[var(--tm-size-touch)] shrink-0 rounded-full bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">{group.label}</button>)}
                  </div>
                )}

                <div className="mt-[var(--tm-space-3)] space-y-[var(--tm-space-3)]">
                  {activeResultGroups.map(group => (
                    <div key={group.id} id={group.id} className="scroll-mt-[var(--tm-space-3)]">
                      {activeResultGroups.length > 1 && <div className="mb-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">第{group.label}人</div>}
                      <div className="overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)]">
                        {group.results.map((result, index) => (
                          <div key={result.studentId} className={`grid min-h-[68px] grid-cols-[76px_minmax(0,1fr)] items-center gap-[var(--tm-space-2)] px-[var(--tm-space-2)] py-[var(--tm-space-2)] ${index > 0 ? 'border-t border-[var(--tm-border-subtle)]' : ''}`}>
                            <div className="min-w-0"><strong className="block truncate text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-primary)]">{result.studentName}</strong><span className="text-[length:var(--tm-font-size-badge)] text-[var(--tm-text-tertiary)]">{result.studentNo}</span></div>
                            <HomeworkStatusButtonGroup value={result.status} onChange={status => saveResultChange(result.studentId, status)} ariaLabel={`设置${result.studentName}作业等级`} showAllTones />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
        </>
      </main>
      <MobileToast message={toast} />
    </div>
  );
};

export default HomeworkEntryView;
