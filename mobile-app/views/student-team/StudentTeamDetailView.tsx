import React, { useMemo, useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { SchoolStudentTeam, Student } from '../../types';
import { BackIcon, CheckCircleIcon, CircleIcon } from '../../components/Icons';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../../components/ui/MobileConfirmSheet';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import MobileSearchInput from '../../components/ui/MobileSearchInput';
import StudentPerformanceAvatar from '../../components/student-performance/StudentPerformanceAvatar';
import StudentPerformanceMeta from '../../components/student-performance/StudentPerformanceMeta';
import { ASSETS } from '../../assets/images';
import {
  createDemoStudentPerformanceSummary,
  getStudentPerformanceLevel,
  type StudentPerformanceSummary,
} from '../../domain/studentPerformance';

interface StudentTeamDetailViewProps {
  team: SchoolStudentTeam;
  students: Student[];
  onBack: () => void;
  onSelectStudent: (student: Student) => void;
  onEdit: () => void;
  onArchive: () => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedIds: Set<string>;
  onSelectionChange: (studentId: string) => void;
  performanceByStudentId?: Record<string, StudentPerformanceSummary>;
}

const avatarStyles = [
  ['bg-[var(--tm-tag-jade-soft)]', 'text-[var(--tm-tag-jade-strong)]'],
  ['bg-[var(--tm-tag-gold-soft)]', 'text-[var(--tm-tag-gold-strong)]'],
  ['bg-[var(--tm-tag-orange-soft)]', 'text-[var(--tm-tag-orange-strong)]'],
  ['bg-[var(--tm-tag-red-soft)]', 'text-[var(--tm-tag-red-strong)]'],
] as const;

const StudentTeamDetailView: React.FC<StudentTeamDetailViewProps> = ({
  team,
  students,
  onBack,
  onSelectStudent,
  onEdit,
  onArchive,
  isSelectionMode,
  onToggleSelectionMode,
  selectedIds,
  onSelectionChange,
  performanceByStudentId = {},
}) => {
  const [query, setQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleStudents = useMemo(() => students.filter(student => (
    !normalizedQuery
    || student.name.toLowerCase().includes(normalizedQuery)
    || student.class.toLowerCase().includes(normalizedQuery)
    || (student.studentNo ?? '').toLowerCase().includes(normalizedQuery)
  )), [normalizedQuery, students]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <header className="relative z-10 flex h-11 shrink-0 items-center justify-between bg-[var(--tm-page-plain-header-bg)] px-4 [padding-right:var(--mini-program-capsule-right-inset,16px)]">
        <button type="button" onClick={onBack} aria-label="返回社团与团队" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
          <BackIcon className="h-5 w-5 text-[var(--tm-text-secondary)]" />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 max-w-[52%] -translate-x-1/2 truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">{team.name}</h1>
        <button type="button" onClick={() => setShowMore(true)} aria-label={`${team.name}更多操作`} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      <div className="shrink-0 bg-[var(--tm-page-plain-header-bg)] px-4 pb-3 pt-2">
        <div className="flex items-center gap-2">
          {!isSelectionMode ? (
            <MobileSearchInput value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索姓名、班级或学号" className="min-w-0 flex-1" />
          ) : (
            <div className="flex min-h-11 min-w-0 flex-1 items-center text-[13px] font-semibold text-[var(--tm-brand-primary)]">已选 {selectedIds.size} 人</div>
          )}
          <button type="button" onClick={onToggleSelectionMode} className="min-h-11 shrink-0 rounded-[var(--tm-radius-control)] px-3 text-[13px] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]">
            {isSelectionMode ? '取消' : '多选'}
          </button>
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-3 pb-40 pt-3 no-scrollbar">
        <div className="student-roster-grid grid shrink-0 gap-x-2.5 gap-y-3">
          {visibleStudents.map((student, index) => {
            const selected = selectedIds.has(student.id);
            const [backgroundClass, textClass] = avatarStyles[index % avatarStyles.length];
            const performance = performanceByStudentId[student.id] ?? createDemoStudentPerformanceSummary(student);
            const level = getStudentPerformanceLevel(performance.netScore);
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => isSelectionMode ? onSelectionChange(student.id) : onSelectStudent(student)}
                aria-pressed={isSelectionMode ? selected : undefined}
                className={`relative flex h-[176px] min-w-0 flex-col items-center overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-2 pt-2.5 text-center [box-shadow:var(--tm-shadow-card)] transition-transform active:scale-[0.98] ${selected ? 'ring-2 ring-[var(--tm-brand-primary)]' : ''}`}
              >
                {isSelectionMode && (
                  <span className="absolute right-1.5 top-1.5 z-10">
                    {selected ? <CheckCircleIcon className="h-5 w-5 text-[var(--tm-brand-primary)]" /> : <CircleIcon className="h-5 w-5 text-[var(--tm-border-control)]" />}
                  </span>
                )}
                <span className="w-full truncate text-[10px] font-medium text-[var(--tm-text-tertiary)]">{student.class}</span>
                <StudentPerformanceAvatar student={student} fallbackText={student.name.slice(-1)} fallbackClassName={`${backgroundClass} ${textClass}`} level={level} />
                <span className="mt-1 w-full truncate text-[13px] font-semibold leading-4 text-[var(--tm-text-primary)]">{student.name}</span>
                <StudentPerformanceMeta level={level} summary={performance} />
              </button>
            );
          })}
        </div>

        {visibleStudents.length === 0 && (
          <MobileEmptyState
            imageSrc={normalizedQuery ? ASSETS.DEFAULT_STATE.MAGNIFIER : ASSETS.DEFAULT_STATE.CHAIR}
            title={normalizedQuery ? '没有匹配的学生' : '暂无成员'}
            className="min-h-[420px]"
          />
        )}
      </main>

      <MobileBottomSheet open={showMore} title="社团与团队管理" onClose={() => setShowMore(false)}>
        <div className="space-y-2">
          <button type="button" onClick={() => { setShowMore(false); onEdit(); }} className="flex min-h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-4 text-left active:bg-[var(--tm-bg-surface-muted)]">
            <Pencil className="h-5 w-5 text-[var(--tm-brand-primary)]" />
            <span className="text-[14px] font-semibold text-[var(--tm-text-primary)]">编辑名称与成员</span>
          </button>
          <button type="button" onClick={() => { setShowMore(false); setShowArchiveConfirm(true); }} className="flex min-h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-status-negative-soft)] px-4 text-left active:bg-[var(--tm-bg-surface-muted)]">
            <Trash2 className="h-5 w-5 text-[var(--tm-status-negative)]" />
            <span className="text-[14px] font-semibold text-[var(--tm-status-negative)]">解散社团或团队</span>
          </button>
        </div>
      </MobileBottomSheet>

      <MobileConfirmSheet
        open={showArchiveConfirm}
        title={`解散${team.name}`}
        description="解散后不再显示该团队，已有学生评价记录不受影响。"
        confirmLabel="确认解散"
        tone="danger"
        onClose={() => setShowArchiveConfirm(false)}
        onConfirm={() => {
          setShowArchiveConfirm(false);
          onArchive();
        }}
      />
    </div>
  );
};

export default StudentTeamDetailView;
