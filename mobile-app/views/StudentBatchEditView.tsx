import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { phoneText } from '../styles/teacherMobileTokens';
import type { Student } from '../types';

interface StudentBatchEditViewProps {
  students: Student[];
  onBack: () => void;
  onSave: (students: Student[]) => void;
}

const inputClass = 'h-[var(--tm-size-touch)] min-w-0 rounded-[var(--tm-radius-inner)] border border-[var(--tm-compact-editor-control-border)] bg-[var(--tm-compact-editor-control-bg)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]';

const StudentBatchEditView: React.FC<StudentBatchEditViewProps> = ({ students, onBack, onSave }) => {
  const [drafts, setDrafts] = useState<Student[]>(() => students.map(student => ({ ...student })));
  const [showSaved, setShowSaved] = useState(false);

  const canSave = useMemo(() => (
    drafts.length > 0
    && drafts.every(student => student.name.trim() && student.studentNo?.trim() && student.gender)
  ), [drafts]);

  const updateStudent = (studentId: string, patch: Partial<Student>) => {
    setDrafts(current => current.map(student => student.id === studentId ? { ...student, ...patch } : student));
  };

  const handleSave = () => {
    if (!canSave) return;
    setShowSaved(true);
    window.setTimeout(() => onSave(drafts), 500);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回班级列表">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className={`${phoneText.navTitle} pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[var(--tm-text-primary)]`}>批量修改学生信息</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] pb-[calc(var(--tm-space-8)+var(--tm-size-touch))] pt-[var(--tm-space-4)] no-scrollbar">
        <div className="space-y-[var(--tm-space-3)]">
          {drafts.map(student => (
            <div
              key={student.id}
              className="grid grid-cols-[minmax(72px,1fr)_minmax(76px,0.72fr)_92px] items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-card)] bg-[var(--tm-compact-editor-row-bg)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card)]"
              role="group"
              aria-label={`${student.name || '学生'}信息`}
            >
              <input
                value={student.name}
                onChange={event => updateStudent(student.id, { name: event.target.value })}
                className={inputClass}
                placeholder="姓名"
                aria-label={`${student.name || '学生'}姓名`}
              />
              <input
                value={student.studentNo ?? ''}
                onChange={event => updateStudent(student.id, { studentNo: event.target.value })}
                className={inputClass}
                inputMode="numeric"
                placeholder="学号"
                aria-label={`${student.name || '学生'}学号`}
                aria-required="true"
              />
              <div className="grid w-[92px] grid-cols-2 gap-[var(--tm-space-1)]" role="group" aria-label={`${student.name || '学生'}性别`}>
                {(['male', 'female'] as const).map(gender => {
                  const selected = student.gender === gender;
                  return (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => updateStudent(student.id, { gender })}
                      className={`h-[var(--tm-size-touch)] rounded-[var(--tm-radius-inner)] text-[length:var(--tm-font-size-compact)] font-semibold ${selected ? 'bg-[var(--tm-compact-editor-selected-bg)] text-[var(--tm-compact-editor-selected-text)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-muted)]'}`}
                      aria-pressed={selected}
                    >
                      {gender === 'male' ? '男' : '女'}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="shrink-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-5)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)]">
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
        >
          {showSaved && <Check className="h-[18px] w-[18px]" />}
          {showSaved ? '已保存' : '保存修改'}
        </button>
      </footer>
    </div>
  );
};

export default StudentBatchEditView;
