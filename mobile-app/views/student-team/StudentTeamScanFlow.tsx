import React, { useEffect, useState } from 'react';
import { AlertCircle, LoaderCircle, ScanLine } from 'lucide-react';
import type { ClassInfo, Student } from '../../types';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import StudentCompactSelectGrid from '../../components/student/StudentCompactSelectGrid';

type ScanStep = 'scan' | 'loading' | 'review';
type ScanItemState = 'toConfirm' | 'unmatched';

interface ScanItem {
  key: string;
  state: ScanItemState;
  student?: Student;
  classLabel?: string;
  name?: string;
}

interface StudentTeamScanFlowProps {
  open: boolean;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  getClassLabel: (classInfo: ClassInfo) => string;
  onClose: () => void;
  onConfirm: (studentIds: string[]) => void;
}

export const StudentTeamScanButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-3 text-[13px] font-semibold text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-bg-surface-soft)]"
  >
    <ScanLine className="h-4 w-4" />
    扫码
  </button>
);

const StudentTeamScanFlow: React.FC<StudentTeamScanFlowProps> = ({
  open,
  classes,
  getStudentsForClass,
  getClassLabel,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState<ScanStep>('scan');
  const [items, setItems] = useState<ScanItem[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [ignoredKeys, setIgnoredKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setStep('scan');
    setItems([]);
    setConfirmedIds(new Set());
    setIgnoredKeys(new Set());
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    if (step === 'scan') {
      const timer = window.setTimeout(() => setStep('loading'), 1400);
      return () => window.clearTimeout(timer);
    }
    if (step === 'loading') {
      const timer = window.setTimeout(() => {
        const roster: { student: Student; classLabel: string }[] = [];
        classes.forEach(classInfo => {
          getStudentsForClass(classInfo.id)
            .filter(student => (student.status ?? 'active') === 'active')
            .forEach(student => roster.push({ student, classLabel: getClassLabel(classInfo) }));
        });
        const nextItems: ScanItem[] = [];
        roster.slice(0, 3).forEach((entry, index) => {
          nextItems.push({ key: 'confirm-' + index, state: 'toConfirm', student: entry.student, classLabel: entry.classLabel });
        });
        nextItems.push({ key: 'unmatched-1', state: 'unmatched', name: '李雨桐' });
        setItems(nextItems);
        setConfirmedIds(new Set());
        setIgnoredKeys(new Set());
        setStep('review');
      }, 1200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open, step, classes, getStudentsForClass, getClassLabel]);

  const toConfirmItems = items.filter(item => item.state === 'toConfirm');
  const unmatchedItems = items.filter(item => item.state === 'unmatched' && !ignoredKeys.has(item.key));
  const toConfirmStudents = toConfirmItems.map(item => item.student).filter((student): student is Student => Boolean(student));

  const classLabelById = new Map<string, string>();
  toConfirmItems.forEach(item => {
    if (item.student) classLabelById.set(item.student.id, item.classLabel ?? '');
  });

  const toggleConfirmed = (studentId: string) => setConfirmedIds(current => {
    const next = new Set(current);
    if (next.has(studentId)) next.delete(studentId);
    else next.add(studentId);
    return next;
  });

  const ignoreUnmatched = (key: string) => setIgnoredKeys(current => {
    const next = new Set(current);
    next.add(key);
    return next;
  });

  const handleRescan = () => {
    setItems([]);
    setConfirmedIds(new Set());
    setIgnoredKeys(new Set());
    setStep('scan');
  };

  const handleConfirm = () => {
    const ids = toConfirmItems.filter(item => item.student && confirmedIds.has(item.student.id)).map(item => item.student!.id);
    onConfirm(ids);
    onClose();
  };

  const isReview = step === 'review';
  const title = step === 'scan' ? '扫码识别' : step === 'loading' ? '识别中' : '识别结果';

  return (
    <MobileBottomSheet
      open={open}
      title={title}
      onClose={onClose}
      size="tall"
      contentInset={isReview ? 'compact' : 'none'}
      contentTone="plain"
      footer={isReview ? (
        <div className="space-y-[var(--tm-space-2)]">
          <button type="button" disabled={confirmedIds.size === 0} onClick={handleConfirm} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">
            确认添加 {confirmedIds.size} 人
          </button>
          <button type="button" onClick={handleRescan} className="flex min-h-11 w-full items-center justify-center rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
            重新扫
          </button>
        </div>
      ) : undefined}
    >
      {step === 'scan' && (
        <div className="flex min-h-full flex-col items-center justify-center px-6 pb-8">
          <style>{'@keyframes teamScanLine { 0% { transform: translateY(0); } 50% { transform: translateY(200px); } 100% { transform: translateY(0); } } .team-scan-line { animation: teamScanLine 1.8s ease-in-out infinite; }'}</style>
          <div className="relative h-60 w-full max-w-[280px] overflow-hidden rounded-[var(--tm-radius-card)] bg-[#0f172a]">
            <span className="absolute left-3 top-3 h-8 w-8 rounded-tl border-l-2 border-t-2 border-white/70" />
            <span className="absolute right-3 top-3 h-8 w-8 rounded-tr border-r-2 border-t-2 border-white/70" />
            <span className="absolute bottom-3 left-3 h-8 w-8 rounded-bl border-b-2 border-l-2 border-white/70" />
            <span className="absolute bottom-3 right-3 h-8 w-8 rounded-br border-b-2 border-r-2 border-white/70" />
            <span className="team-scan-line absolute left-4 right-4 top-3 h-[2px] rounded-full bg-[var(--tm-brand-primary)]" />
          </div>
          <p className="mt-6 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)]">正在识别学生码…</p>
          <p className="mt-1 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-tertiary)]">请将学生码对准框内</p>
        </div>
      )}

      {step === 'loading' && (
        <div className="flex min-h-full flex-col items-center justify-center px-6 pb-8" role="status" aria-label="正在识别并匹配学生">
          <LoaderCircle className="h-10 w-10 animate-spin text-[var(--tm-brand-primary)]" aria-hidden="true" />
          <p className="mt-5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)]">正在识别并匹配学生…</p>
          <p className="mt-1 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-tertiary)]">正在查找学生信息，请稍候</p>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-[var(--tm-space-4)] pb-2 pt-[var(--tm-space-4)]">
          {toConfirmItems.length > 0 && (
            <section>
              <h3 className="mb-2 px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">需确认（{toConfirmItems.length}）</h3>
              <StudentCompactSelectGrid
                sections={[{ id: 'scan-confirm', students: toConfirmStudents }]}
                isSelected={studentId => confirmedIds.has(studentId)}
                getSecondaryLabel={student => classLabelById.get(student.id)}
                onToggle={toggleConfirmed}
              />
            </section>
          )}

          {unmatchedItems.length > 0 && (
            <section>
              <h3 className="mb-2 px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">未匹配（{unmatchedItems.length}）</h3>
              <div className="px-[var(--tm-space-2)]">
                {unmatchedItems.map(item => (
                  <div key={item.key} className="flex items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-3 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tm-status-negative-soft)] text-[var(--tm-status-negative-strong)]">
                      <AlertCircle className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{item.name}</span>
                      <span className="block text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">未查到该学生</span>
                    </span>
                    <button type="button" onClick={() => ignoreUnmatched(item.key)} className="shrink-0 rounded-[var(--tm-radius-control)] px-2.5 py-1.5 text-[13px] font-semibold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">忽略</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </MobileBottomSheet>
  );
};

export default StudentTeamScanFlow;
