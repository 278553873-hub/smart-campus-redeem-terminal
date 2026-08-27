import React, { useMemo, useState } from 'react';
import { ScanLine } from 'lucide-react';
import type { Student } from '../types';
import CompactRemoveButton from '../components/ui/CompactRemoveButton';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobilePageHeader from '../components/ui/MobilePageHeader';

export interface AddStudentDraft {
  name: string;
  studentNo: string;
  gender: Student['gender'];
}

interface AddStudentViewProps {
  existingStudents: Student[];
  onBack: () => void;
  onSave: (students: AddStudentDraft[]) => void;
}

interface StudentInputRow extends AddStudentDraft {
  id: number;
}

const createEmptyRow = (id: number): StudentInputRow => ({
  id,
  name: '',
  studentNo: '',
  gender: 'male',
});

const scannedStudentRows: AddStudentDraft[] = [
  { name: '陈雨桐', studentNo: '41', gender: 'female' },
  { name: '宋嘉树', studentNo: '42', gender: 'male' },
  { name: '赵一诺', studentNo: '43', gender: 'female' },
];

const AddStudentView: React.FC<AddStudentViewProps> = ({ existingStudents, onBack, onSave }) => {
  const [studentInputRows, setStudentInputRows] = useState<StudentInputRow[]>([createEmptyRow(1)]);
  const [showStudentScanSheet, setShowStudentScanSheet] = useState(false);

  const normalizedRows = useMemo(() => studentInputRows.map(row => ({
    ...row,
    name: row.name.trim(),
    studentNo: row.studentNo.trim(),
  })), [studentInputRows]);
  const existingStudentNumbers = useMemo(
    () => new Set(existingStudents.map(student => student.studentNo?.trim()).filter(Boolean)),
    [existingStudents],
  );
  const duplicateStudentNumbers = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    normalizedRows.forEach(row => {
      if (!row.studentNo) return;
      if (seen.has(row.studentNo) || existingStudentNumbers.has(row.studentNo)) duplicates.add(row.studentNo);
      seen.add(row.studentNo);
    });
    return duplicates;
  }, [existingStudentNumbers, normalizedRows]);
  const canSubmitStudents = normalizedRows.length > 0
    && normalizedRows.every(row => row.name && row.studentNo)
    && duplicateStudentNumbers.size === 0;

  const updateStudentInputRow = (id: number, patch: Partial<StudentInputRow>) => {
    setStudentInputRows(rows => rows.map(row => row.id === id ? { ...row, ...patch } : row));
  };

  const addStudentInputRow = () => {
    setStudentInputRows(rows => [
      ...rows,
      createEmptyRow(Math.max(...rows.map(row => row.id)) + 1),
    ]);
  };

  const removeStudentInputRow = (id: number) => {
    setStudentInputRows(rows => rows.length === 1
      ? [createEmptyRow(rows[0].id)]
      : rows.filter(row => row.id !== id));
  };

  const fillStudentsFromScannedTable = () => {
    const availableRows = scannedStudentRows.filter(row => !existingStudentNumbers.has(row.studentNo));
    setStudentInputRows(availableRows.length > 0
      ? availableRows.map((row, index) => ({ ...row, id: index + 1 }))
      : [createEmptyRow(1)]);
    setShowStudentScanSheet(false);
  };

  const handleSubmit = () => {
    if (!canSubmitStudents) return;
    onSave(normalizedRows.map(({ name, studentNo, gender }) => ({ name, studentNo, gender })));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--tm-page-plain-content-bg)]">
      <MobilePageHeader title="添加学生" onBack={onBack} />

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[var(--tm-space-6)] pt-[var(--tm-space-4)]">
        <button
          type="button"
          onClick={() => setShowStudentScanSheet(true)}
          className="flex min-h-[var(--tm-size-touch)] w-full items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-card-ambient)] transition-[transform,background-color] active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
        >
          <ScanLine className="h-5 w-5" aria-hidden="true" />
          扫码识别表格
        </button>

        <div className="mt-[var(--tm-space-4)] space-y-[var(--tm-space-2)]">
          {studentInputRows.map((row, index) => {
            const studentNoError = row.studentNo.trim() && duplicateStudentNumbers.has(row.studentNo.trim());
            const hasStudentData = Boolean(row.name.trim() || row.studentNo.trim());
            const canRemoveRow = hasStudentData || studentInputRows.length > 1;
            return (
              <div
                key={row.id}
                className="relative rounded-[var(--tm-radius-inner)] bg-[var(--tm-compact-editor-row-bg)] p-[var(--tm-space-2)] [box-shadow:var(--tm-shadow-card-ambient)]"
              >
                {canRemoveRow && (
                  <CompactRemoveButton
                    onClick={() => removeStudentInputRow(row.id)}
                    ariaLabel={`删除第${index + 1}名学生`}
                  />
                )}

                <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(68px,0.8fr)_38px_38px] gap-[var(--tm-space-2)]">
                  <input
                    value={row.name}
                    onChange={event => updateStudentInputRow(row.id, { name: event.target.value })}
                    placeholder="姓名"
                    aria-label={`第${index + 1}名学生姓名`}
                    aria-required="true"
                    className="h-[var(--tm-size-touch)] min-w-0 rounded-[var(--tm-radius-control)] border border-[var(--tm-compact-editor-control-border)] bg-[var(--tm-compact-editor-control-bg)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-0"
                  />
                  <input
                    value={row.studentNo}
                    onChange={event => updateStudentInputRow(row.id, { studentNo: event.target.value })}
                    placeholder="学号必填"
                    aria-label={`第${index + 1}名学生学号`}
                    aria-required="true"
                    aria-invalid={Boolean(studentNoError)}
                    inputMode="numeric"
                    className={`h-[var(--tm-size-touch)] min-w-0 rounded-[var(--tm-radius-control)] border bg-[var(--tm-compact-editor-control-bg)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:ring-0 ${studentNoError ? 'border-[var(--tm-status-negative-strong)]' : 'border-[var(--tm-compact-editor-control-border)] focus:border-[var(--tm-input-focus-border)]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => updateStudentInputRow(row.id, { gender: 'male' })}
                    aria-label={`第${index + 1}名学生性别男`}
                    aria-pressed={row.gender === 'male'}
                    className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] justify-self-center items-center justify-center transition-transform active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
                  >
                    <span className={`flex h-9 w-[38px] items-center justify-center rounded-[var(--tm-radius-control)] border text-[length:var(--tm-font-size-body)] font-semibold transition-[background-color,border-color,color,box-shadow] ${row.gender === 'male' ? 'border-[var(--tm-gender-male-selection-bg)] bg-[var(--tm-gender-male-selection-bg)] text-[var(--tm-compact-editor-selected-text)] [box-shadow:var(--tm-shadow-control)]' : 'border-[var(--tm-compact-editor-control-border)] bg-[var(--tm-compact-editor-control-bg)] text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)]'}`} aria-hidden="true">
                      男
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStudentInputRow(row.id, { gender: 'female' })}
                    aria-label={`第${index + 1}名学生性别女`}
                    aria-pressed={row.gender === 'female'}
                    className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] justify-self-center items-center justify-center transition-transform active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
                  >
                    <span className={`flex h-9 w-[38px] items-center justify-center rounded-[var(--tm-radius-control)] border text-[length:var(--tm-font-size-body)] font-semibold transition-[background-color,border-color,color,box-shadow] ${row.gender === 'female' ? 'border-[var(--tm-gender-female-selection-bg)] bg-[var(--tm-gender-female-selection-bg)] text-[var(--tm-compact-editor-selected-text)] [box-shadow:var(--tm-shadow-control)]' : 'border-[var(--tm-compact-editor-control-border)] bg-[var(--tm-compact-editor-control-bg)] text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)]'}`} aria-hidden="true">
                      女
                    </span>
                  </button>
                </div>

                {studentNoError && (
                  <p className="mt-[var(--tm-space-2)] text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-status-negative-strong)]" role="alert">
                    该学号已存在，请修改
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-[var(--tm-space-4)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">
          填写学号后，可说“1号和3号同学打架”进行评价。
        </p>

        <button
          type="button"
          onClick={addStudentInputRow}
          className="mt-[var(--tm-space-5)] flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
        >
          添加一名
        </button>
      </div>

      <footer className="shrink-0 bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-3)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmitStudents}
          className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-5)] text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.98] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2"
        >
          完成
        </button>
        <button
          type="button"
          onClick={onBack}
          className="mt-[var(--tm-space-1)] flex min-h-[var(--tm-size-touch)] w-full items-center justify-center text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)] transition active:text-[var(--tm-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
        >
          稍后添加
        </button>
      </footer>

      <MobileBottomSheet
        open={showStudentScanSheet}
        title="扫码识别表格"
        onClose={() => setShowStudentScanSheet(false)}
        footer={(
          <button
            type="button"
            onClick={fillStudentsFromScannedTable}
            className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-5)] text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.98] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2"
          >
            开始识别
          </button>
        )}
      >
        <div className="flex flex-col items-center py-[var(--tm-space-5)] text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-[var(--tm-radius-inner)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]">
            <ScanLine className="h-7 w-7" aria-hidden="true" />
          </span>
          <p className="mt-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-secondary)]">
            拍摄纸质名单，识别后可再修改
          </p>
        </div>
      </MobileBottomSheet>
    </div>
  );
};

export default AddStudentView;
