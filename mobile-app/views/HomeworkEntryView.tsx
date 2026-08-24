import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus } from 'lucide-react';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileToast from '../components/ui/MobileToast';
import PillSelectionControl from '../components/ui/PillSelectionControl';
import HomeworkStatusButtonGroup from '../components/homework/HomeworkStatusButtonGroup';
import { ASSETS } from '../assets/images';
import {
  buildHomeworkResults,
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

const getStudentNoSuffix = (studentNo: string) => {
  const normalized = studentNo.replace(/^学号/, '').trim();
  const numeric = normalized.match(/\d+/g)?.join('') ?? normalized;
  return numeric.slice(-2).padStart(2, '0');
};

type EditorMode = 'create' | 'edit' | null;

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
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [calendarMonth, setCalendarMonth] = useState(() => parseDateText(initialDate));
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [draftAssignment, setDraftAssignment] = useState<HomeworkAssignment | null>(null);
  const [titleError, setTitleError] = useState(false);
  const [toast, setToast] = useState('');

  const classAssignments = useMemo(() => (
    assignments
      .filter(assignment => assignment.classId === classInfo.id && assignment.subject === subject)
      .sort((first, second) => second.date.localeCompare(first.date) || second.updatedAt.localeCompare(first.updatedAt))
  ), [assignments, classInfo.id, subject]);
  const assignmentsByDate = useMemo(() => (
    classAssignments.reduce<Record<string, HomeworkAssignment[]>>((result, assignment) => {
      (result[assignment.date] ??= []).push(assignment);
      return result;
    }, {})
  ), [classAssignments]);
  const selectedDateAssignments = assignmentsByDate[selectedDate] ?? [];
  const calendarDays = useMemo(() => getMonthDays(calendarMonth), [calendarMonth]);
  const todayText = getTodayText();

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const startCreate = () => {
    if (subject === '未配置学科') {
      showToast('请先配置任教学科');
      return;
    }
    const now = new Date().toISOString();
    setDraftAssignment({
      id: `manual-homework-${Date.now()}`,
      schoolId,
      schoolName,
      classId: classInfo.id,
      className: classInfo.name,
      subject,
      teacherName,
      date: selectedDate,
      title: '',
      source: 'manual',
      creatorName: teacherName,
      createdAt: now,
      updatedAt: now,
      results: buildHomeworkResults(students),
    });
    setTitleError(false);
    setEditorMode('create');
  };

  const startEdit = (assignment: HomeworkAssignment) => {
    setDraftAssignment({
      ...assignment,
      results: assignment.results.map(result => ({ ...result })),
    });
    setTitleError(false);
    setEditorMode('edit');
  };

  const closeEditor = () => {
    setEditorMode(null);
    setDraftAssignment(null);
    setTitleError(false);
  };

  const selectDate = (dateText: string) => {
    setSelectedDate(dateText);
  };

  const changeSubject = (nextSubject: string) => {
    closeEditor();
    setSubject(nextSubject);
    const nextAssignments = assignments
      .filter(assignment => assignment.classId === classInfo.id && assignment.subject === nextSubject)
      .sort((first, second) => second.date.localeCompare(first.date) || second.updatedAt.localeCompare(first.updatedAt));
    const nextAssignment = nextAssignments.find(assignment => assignment.date === selectedDate) ?? nextAssignments[0] ?? null;
    if (nextAssignment && nextAssignment.date !== selectedDate) {
      setSelectedDate(nextAssignment.date);
      setCalendarMonth(parseDateText(nextAssignment.date));
    }
  };

  const saveDraftAssignment = () => {
    if (!draftAssignment) return;
    const title = draftAssignment.title.trim();
    if (!title) {
      setTitleError(true);
      return;
    }
    onSaveAssignment({
      ...draftAssignment,
      title,
      updatedAt: new Date().toISOString(),
    });
    const message = editorMode === 'create' ? '作业已新增' : '作业已更新';
    closeEditor();
    showToast(message);
  };

  const jumpToToday = () => {
    const today = parseDateText(todayText);
    selectDate(todayText);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const changeDraftResult = (studentId: string, status: HomeworkStatus) => {
    setDraftAssignment(current => current ? {
      ...current,
      results: current.results.map(result => (
        result.studentId === studentId
          ? { ...result, status: result.status === status ? null : status, manuallyConfirmed: true }
          : result
      )),
    } : current);
  };

  const applyStatusToAll = (status: HomeworkStatus) => {
    setDraftAssignment(current => current ? {
      ...current,
      results: current.results.map(result => ({ ...result, status, manuallyConfirmed: true })),
    } : current);
  };

  const renderHeader = (title: string, backAction: () => void) => (
    <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
      <button type="button" onClick={backAction} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">{title}</h1>
    </header>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      {renderHeader('作业录入', onBack)}
      <main className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[calc(var(--tm-space-6)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)] no-scrollbar">
        <div className="mb-[var(--tm-space-3)] flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-3)]">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{classInfo.name}</h2>
            {availableSubjects.length === 1 && <div className="mt-[var(--tm-space-1)] truncate text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{subject}</div>}
          </div>
        </div>
        {availableSubjects.length > 1
          ? <PillSelectionControl value={subject} items={availableSubjects.map(item => ({ value: item, label: item }))} onChange={changeSubject} ariaLabel="任教学科" semantics="tabs" className="mb-[var(--tm-space-3)]" />
          : null}

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
                  {assignmentCount > 0 && (
                    <span className={`absolute bottom-0 flex h-3 min-w-4 items-center justify-center rounded-[4px] px-1 text-[9px] font-semibold leading-3 ${selected ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]'}`} aria-hidden="true">{assignmentCount}</span>
                  )}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={startCreate} className="mt-[var(--tm-space-3)] flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]" aria-label={`新建${formatDateLabel(selectedDate)}作业`}><Plus className="h-[18px] w-[18px]" /><span>新增作业</span></button>
        </section>

        {selectedDateAssignments.length > 0 && (
          <section className="mt-[var(--tm-space-3)]" aria-labelledby="selected-date-homework-title">
            <div className="mb-[var(--tm-space-2)] flex items-center justify-between gap-[var(--tm-space-3)] px-[var(--tm-space-1)]">
              <h2 id="selected-date-homework-title" className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">当天作业</h2>
              <span className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{selectedDateAssignments.length}次</span>
            </div>
            <div className="space-y-[var(--tm-space-2)]" aria-label="当天作业记录">
              {selectedDateAssignments.map(assignment => (
                <button
                  key={assignment.id}
                  type="button"
                  onClick={() => startEdit(assignment)}
                  className="flex min-h-[60px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] text-left text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-card)] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                  aria-label={`编辑作业：${assignment.title}`}
                >
                  <span className="line-clamp-2 min-w-0 flex-1 text-[length:var(--tm-font-size-body)] font-medium leading-5">{assignment.title}</span>
                  <Pencil className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
      <MobileBottomSheet
        open={editorMode !== null && Boolean(draftAssignment)}
        title={editorMode === 'create' ? '新增作业' : '编辑作业'}
        onClose={closeEditor}
        size="full"
        contentTone="plain"
        contentInset="compact"
        footer={(
          <button type="button" onClick={saveDraftAssignment} className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)]">
            完成
          </button>
        )}
      >
        {draftAssignment && (
          <div className="space-y-[var(--tm-space-3)] py-[var(--tm-space-3)]">
            <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card)]">
              <div className="mb-[var(--tm-space-2)] flex items-center justify-between gap-[var(--tm-space-3)]">
                <label htmlFor="homework-title-input" className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">作业主题</label>
                <span className="truncate text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{formatDateLabel(draftAssignment.date)} · {draftAssignment.subject}</span>
              </div>
              <textarea
                id="homework-title-input"
                value={draftAssignment.title}
                onChange={event => {
                  setTitleError(false);
                  setDraftAssignment(current => current ? { ...current, title: event.target.value } : current);
                }}
                placeholder="输入作业主题"
                autoFocus={editorMode === 'create'}
                rows={2}
                aria-invalid={titleError}
                aria-describedby={titleError ? 'homework-title-error' : undefined}
                className={`min-h-20 w-full resize-none rounded-[var(--tm-radius-control)] border bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] ${titleError ? 'border-[var(--tm-status-negative-strong)]' : 'border-[var(--tm-input-border)]'}`}
              />
              {titleError && <p id="homework-title-error" className="mt-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-status-negative-strong)]">请输入作业主题</p>}
            </section>

            <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card)]">
              <h3 className="mb-[var(--tm-space-2)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">批量设置</h3>
              <HomeworkStatusButtonGroup value={null} onChange={applyStatusToAll} ariaLabel="全班批量设置作业等级" showAllTones size="compact" />
            </section>

            <section aria-labelledby="student-homework-results-title">
              <h3 id="student-homework-results-title" className="mb-[var(--tm-space-2)] px-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">学生等级</h3>
              <div className="overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
                {draftAssignment.results.map((result, index) => (
                  <div key={result.studentId} className={`grid min-h-[60px] grid-cols-[104px_minmax(0,1fr)] items-center gap-[var(--tm-space-2)] px-[var(--tm-space-2)] py-[var(--tm-space-2)] ${index > 0 ? 'border-t border-[var(--tm-border-subtle)]' : ''}`}>
                    <div className="flex min-w-0 items-center gap-[var(--tm-space-2)]">
                      <img src={result.avatar || ASSETS.AVATAR.GENERIC_BOY} alt="" className="h-8 w-8 shrink-0 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover" />
                      <span className="flex min-w-0 items-center gap-0.5">
                        <span aria-label={`学号${result.studentNo}`} className="flex h-[14px] w-4 shrink-0 items-center justify-center rounded-[4px] bg-[var(--tm-bg-surface-muted)] font-mono text-[9px] font-semibold leading-none tabular-nums text-[var(--tm-text-tertiary)]">{getStudentNoSuffix(result.studentNo)}</span>
                        <strong className="min-w-0 truncate text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-primary)]">{result.studentName}</strong>
                      </span>
                    </div>
                    <HomeworkStatusButtonGroup value={result.status} onChange={status => changeDraftResult(result.studentId, status)} ariaLabel={`设置${result.studentName}作业等级`} showAllTones />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </MobileBottomSheet>
      <MobileToast message={toast} />
    </div>
  );
};

export default HomeworkEntryView;
