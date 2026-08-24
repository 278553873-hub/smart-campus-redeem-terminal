import React, { useMemo, useState } from 'react';
import {
  CalendarOff,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import MobileSearchInput from '../components/ui/MobileSearchInput';
import { ASSETS } from '../assets/images';
import {
  CURRENT_DUTY_WEEK_ID,
  DUTY_TEACHERS,
  DUTY_TERM_WEEKS,
  INITIAL_DUTY_SCHEDULES,
} from '../data/weeklyDutySchedule';
import {
  formatDutyMonth,
  formatDutyTeacherSummary,
  formatDutyWeekRange,
  getDutyWeeksForMonth,
  type DutyWeek,
} from '../domain/weeklyDutySchedule';

interface WeeklyDutyScheduleViewProps {
  onBack: () => void;
}

const selectedMonthDefault = { year: 2026, monthIndex: 7 };

const WeeklyDutyScheduleView: React.FC<WeeklyDutyScheduleViewProps> = ({ onBack }) => {
  const [selectedMonth, setSelectedMonth] = useState(selectedMonthDefault);
  const [selectedWeekId, setSelectedWeekId] = useState(CURRENT_DUTY_WEEK_ID);
  const [teacherSheetWeek, setTeacherSheetWeek] = useState<DutyWeek | null>(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [draftTeacherIds, setDraftTeacherIds] = useState<string[]>([]);
  const [onlyUnscheduled, setOnlyUnscheduled] = useState(false);
  const [schedules, setSchedules] = useState<Record<string, string[]>>(INITIAL_DUTY_SCHEDULES);

  const teachersById = useMemo(
    () => Object.fromEntries(DUTY_TEACHERS.map(teacher => [teacher.id, teacher])),
    [],
  );
  const monthWeeks = useMemo(
    () => getDutyWeeksForMonth(DUTY_TERM_WEEKS, selectedMonth.year, selectedMonth.monthIndex),
    [selectedMonth],
  );
  const filteredTeachers = useMemo(() => {
    const keyword = teacherSearch.trim();
    return keyword
      ? DUTY_TEACHERS.filter(teacher => teacher.name.includes(keyword))
      : DUTY_TEACHERS;
  }, [teacherSearch]);
  const selectedTeachers = useMemo(
    () => draftTeacherIds.flatMap(teacherId => {
      const teacher = teachersById[teacherId];
      return teacher ? [teacher] : [];
    }),
    [draftTeacherIds, teachersById],
  );
  const openTeacherSheet = (week: DutyWeek) => {
    setSelectedWeekId(week.id);
    setTeacherSearch('');
    setDraftTeacherIds([...(schedules[week.id] ?? [])]);
    setTeacherSheetWeek(week);
  };

  const closeTeacherSheet = () => {
    setTeacherSheetWeek(null);
    setTeacherSearch('');
    setDraftTeacherIds([]);
  };

  const toggleTeacher = (teacherId: string) => {
    setDraftTeacherIds(current => current.includes(teacherId)
      ? current.filter(id => id !== teacherId)
      : [...current, teacherId]);
  };

  const leaveTeacherUnscheduled = () => {
    setDraftTeacherIds([]);
  };

  const saveTeacherSelection = () => {
    if (!teacherSheetWeek) return;
    const weekId = teacherSheetWeek.id;
    setSchedules(current => {
      const next = { ...current };
      if (draftTeacherIds.length === 0) {
        delete next[weekId];
      } else {
        next[weekId] = [...draftTeacherIds];
      }
      return next;
    });
    closeTeacherSheet();
  };

  const shiftMonth = (offset: number) => {
    setSelectedMonth(current => {
      const next = new Date(current.year, current.monthIndex + offset, 1);
      return { year: next.getFullYear(), monthIndex: next.getMonth() };
    });
  };

  const resetToCurrentWeek = () => {
    setSelectedMonth(selectedMonthDefault);
    setSelectedWeekId(CURRENT_DUTY_WEEK_ID);
  };

  const renderTeacherSummary = (week: DutyWeek) => {
    const teacherNames = (schedules[week.id] ?? []).map(
      teacherId => teachersById[teacherId]?.name ?? '教师已停用',
    );
    return formatDutyTeacherSummary(teacherNames);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]">
      <MobilePageHeader title="值周安排" onBack={onBack} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-[var(--tm-size-touch)] shrink-0 items-center justify-end bg-[var(--tm-bg-surface)] px-[var(--tm-space-5)]">
          <button
            type="button"
            role="switch"
            aria-checked={onlyUnscheduled}
            onClick={() => setOnlyUnscheduled(current => !current)}
            className="flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] transition-[scale,color] duration-150 ease-out active:scale-[0.96]"
          >
            <span>只看未安排</span>
            <span className={`relative h-6 w-10 rounded-full transition-[background-color] duration-200 ease-out ${onlyUnscheduled ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-muted)]'}`} aria-hidden="true">
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-control)] transition-transform duration-200 ease-out ${onlyUnscheduled ? 'translate-x-4' : 'translate-x-0'}`} />
            </span>
          </button>
        </div>

        <section className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] pb-[calc(var(--tm-space-6)+env(safe-area-inset-bottom))] pt-[var(--tm-space-4)] no-scrollbar">
          <div className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] pb-[var(--tm-space-4)] pt-[var(--tm-space-2)] [box-shadow:var(--tm-shadow-card)]">
            <div className="grid min-h-[52px] grid-cols-[44px_minmax(0,1fr)_44px_auto] items-center gap-[var(--tm-space-1)]">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-tertiary)] transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-primary)]"
                aria-label="上一个月"
              >
                <ChevronLeft className="h-5 w-5 -translate-x-px" strokeWidth={2.2} />
              </button>
              <h2 className="truncate text-center text-[length:var(--tm-font-size-group-title)] font-bold tabular-nums text-[var(--tm-text-primary)]" aria-live="polite">
                {formatDutyMonth(selectedMonth.year, selectedMonth.monthIndex)}
              </h2>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-tertiary)] transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-primary)]"
                aria-label="下一个月"
              >
                <ChevronRight className="h-5 w-5 translate-x-px" strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={resetToCurrentWeek}
                className="group flex h-[var(--tm-size-touch)] items-center justify-center px-1 transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                <span className="flex h-7 items-center justify-center rounded-[8px] border border-[var(--tm-duty-current-button-border)] bg-[var(--tm-duty-current-button-bg)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-duty-current-button-text)] [box-shadow:var(--tm-duty-current-button-shadow)] transition-[background-color,color,border-color] duration-150 ease-out group-active:bg-[var(--tm-duty-current-button-pressed-bg)]">
                  本周
                </span>
              </button>
            </div>

            <div className="mt-[var(--tm-space-3)] grid grid-cols-2 gap-[var(--tm-duty-week-grid-gap)]">
              {monthWeeks.map(week => {
                const teacherIds = schedules[week.id] ?? [];
                const assigned = teacherIds.length > 0;
                const selected = selectedWeekId === week.id;
                const dimmed = onlyUnscheduled && assigned;
                return (
                  <button
                    key={week.id}
                    type="button"
                    onClick={() => openTeacherSheet(week)}
                    aria-pressed={selected}
                    aria-label={`${formatDutyWeekRange(week)}，${renderTeacherSummary(week)}`}
                    className={`flex h-[var(--tm-duty-week-tile-height)] min-w-0 flex-col items-center justify-center rounded-[var(--tm-duty-week-tile-radius)] px-[var(--tm-space-2)] text-center transition-[scale,background-color,color,box-shadow,opacity] duration-150 ease-out active:scale-[0.96] ${selected ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] [box-shadow:var(--tm-duty-week-selected-shadow)]' : assigned ? 'bg-[var(--tm-duty-week-assigned-bg)] text-[var(--tm-text-primary)]' : 'bg-[var(--tm-duty-week-unassigned-bg)] text-[var(--tm-text-primary)]'} ${dimmed ? '[opacity:var(--tm-duty-week-dimmed-opacity)]' : 'opacity-100'}`}
                  >
                    <span className="whitespace-nowrap text-[length:var(--tm-font-size-card-title)] font-bold tabular-nums leading-none">
                      {formatDutyWeekRange(week)}
                    </span>
                    <span className={`mt-[var(--tm-space-2)] flex max-w-full items-center gap-[var(--tm-space-1)] text-[length:var(--tm-font-size-compact)] font-semibold ${selected ? 'text-[var(--tm-text-inverse)]' : assigned ? 'text-[var(--tm-duty-week-assigned-text)]' : 'text-[var(--tm-duty-week-unassigned-text)]'}`}>
                      {assigned && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />}
                      <span className="truncate">{renderTeacherSummary(week)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <MobileBottomSheet
        open={Boolean(teacherSheetWeek)}
        title={teacherSheetWeek ? formatDutyWeekRange(teacherSheetWeek) : '选择教师'}
        onClose={closeTeacherSheet}
        footer={teacherSheetWeek ? (
          <button
            type="button"
            onClick={saveTeacherSelection}
            className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
          >
            {draftTeacherIds.length > 0 ? `保存（${draftTeacherIds.length}人）` : '保存'}
          </button>
        ) : undefined}
        header={teacherSheetWeek ? (
          <header className="flex h-14 shrink-0 items-center gap-[var(--tm-space-1)] px-[var(--tm-space-4)]">
            <h2 className="min-w-0 flex-1 truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">
              {formatDutyWeekRange(teacherSheetWeek)}
            </h2>
            <button
              type="button"
              onClick={leaveTeacherUnscheduled}
              aria-label="暂不安排老师"
              aria-pressed={draftTeacherIds.length === 0}
              className="group flex h-[var(--tm-duty-unassigned-option-height)] shrink-0 items-center justify-center transition-transform duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
            >
              <span className={`flex h-[var(--tm-duty-unassigned-button-visible-height)] items-center gap-[var(--tm-space-1)] rounded-[var(--tm-duty-unassigned-button-radius)] border border-[var(--tm-duty-unassigned-button-border)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-duty-unassigned-button-text)] [box-shadow:var(--tm-duty-unassigned-button-shadow)] transition-[background-color,box-shadow] duration-150 ease-out group-active:bg-[var(--tm-duty-unassigned-button-pressed-bg)] ${draftTeacherIds.length === 0 ? 'bg-[var(--tm-duty-unassigned-button-selected-bg)]' : 'bg-[var(--tm-duty-unassigned-button-bg)]'}`}>
                <CalendarOff className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
                <span>暂不安排老师</span>
              </span>
            </button>
            <button
              type="button"
              onClick={closeTeacherSheet}
              className="-mr-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)]"
              aria-label={`关闭${formatDutyWeekRange(teacherSheetWeek)}教师选择`}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>
        ) : undefined}
      >
        <div className="pb-[var(--tm-space-2)]">
          <MobileSearchInput
            value={teacherSearch}
            onChange={event => setTeacherSearch(event.target.value)}
            placeholder="搜索教师姓名"
            aria-label="搜索教师姓名"
            autoComplete="off"
          />

          <section
            className="mt-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] min-w-0 items-center gap-[var(--tm-space-2)] overflow-hidden"
            aria-label={`已选${draftTeacherIds.length}人`}
            aria-live="polite"
          >
            <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">
              已选 {draftTeacherIds.length}人
            </span>
            <div className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
              <div className="flex w-max items-center gap-[var(--tm-space-2)] pr-[var(--tm-space-1)]">
                {selectedTeachers.length > 0 ? selectedTeachers.map(teacher => (
                  <button
                    key={teacher.id}
                    type="button"
                    onClick={() => toggleTeacher(teacher.id)}
                    aria-label={`移除${teacher.name}`}
                    className="flex h-[var(--tm-size-touch)] shrink-0 items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] px-[var(--tm-space-2)] text-[var(--tm-text-primary)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                  >
                    <img src={teacher.avatar} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10" />
                    <span className="text-[length:var(--tm-font-size-compact)] font-semibold">{teacher.name}</span>
                    <X className="h-3.5 w-3.5 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                  </button>
                )) : (
                  <span className="text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-tertiary)]">未选择</span>
                )}
              </div>
            </div>
          </section>

          <div className="mt-[var(--tm-space-2)] space-y-[var(--tm-space-2)]" aria-live="polite">
            {filteredTeachers.length > 0 ? filteredTeachers.map(teacher => {
              const active = draftTeacherIds.includes(teacher.id);
              return (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => toggleTeacher(teacher.id)}
                  aria-pressed={active}
                  className={`flex min-h-[var(--tm-duty-teacher-row-height)] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] px-[var(--tm-space-3)] text-left transition-[scale,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] ${active ? 'bg-[var(--tm-bg-surface-muted)] [box-shadow:var(--tm-shadow-control)]' : 'bg-[var(--tm-bg-surface-soft)]'}`}
                >
                  <img src={teacher.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10" />
                  <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{teacher.name}</span>
                  {active && <Check className="h-5 w-5 shrink-0 text-[var(--tm-brand-primary)]" strokeWidth={2.4} aria-hidden="true" />}
                </button>
              );
            }) : (
              <MobileEmptyState
                imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER}
                title="没有匹配的教师"
                className="min-h-72 py-[var(--tm-space-4)]"
                imageClassName="w-[58%] min-w-[156px] max-w-[196px]"
              />
            )}
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  );
};

export default WeeklyDutyScheduleView;
