import React, { useMemo, useState } from 'react';
import { Camera, CheckCircle2, ChevronLeft, Image, UserRound } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import type { ClassInfo, Student } from '../../types';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';

interface FaceUpdateViewProps {
  classInfo: ClassInfo;
  currentSpace: TeacherSpaceOption;
  students: Student[];
  onBack: () => void;
}

interface FaceStudent extends Student {
  hasFaceData: boolean;
  isUploading: boolean;
}

const FaceUpdateView: React.FC<FaceUpdateViewProps> = ({ classInfo, currentSpace, students: classStudents, onBack }) => {
  const [students, setStudents] = useState<FaceStudent[]>(() => classStudents.map((student, index) => ({
    ...student,
    hasFaceData: Boolean(student.avatar) && index < Math.ceil(classStudents.length * 0.6),
    isUploading: false,
  })));
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  const activeStudent = useMemo(() => students.find(student => student.id === activeStudentId) ?? null, [activeStudentId, students]);
  const completedCount = students.filter(student => student.hasFaceData).length;
  const progress = students.length > 0 ? (completedCount / students.length) * 100 : 0;

  const updateFace = (source: 'camera' | 'album') => {
    if (!activeStudent) return;
    const studentId = activeStudent.id;
    setActiveStudentId(null);
    setStudents(current => current.map(student => student.id === studentId ? { ...student, isUploading: true } : student));
    window.setTimeout(() => {
      setStudents(current => current.map(student => student.id === studentId ? { ...student, isUploading: false, hasFaceData: true } : student));
    }, source === 'camera' ? 900 : 700);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回班级列表"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">更新人脸库</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[calc(var(--tm-space-6)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)] no-scrollbar">
        <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)] [box-shadow:var(--tm-shadow-card)]">
          <div className="flex items-end justify-between gap-[var(--tm-space-3)]">
            <div><div className="text-[length:var(--tm-font-size-metric)] font-bold tabular-nums text-[var(--tm-text-primary)]">{completedCount}<span className="ml-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-secondary)]">/ {students.length}</span></div><div className="mt-[var(--tm-space-1)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">{getTeacherClassDisplayName(classInfo, currentSpace)}已录入</div></div>
            <span className="text-[length:var(--tm-font-size-compact)] font-semibold tabular-nums text-[var(--tm-status-positive-strong)]">{Math.round(progress)}%</span>
          </div>
          <div className="mt-[var(--tm-space-3)] h-2 overflow-hidden rounded-full bg-[var(--tm-bg-surface-muted)]"><div className="h-full rounded-full bg-[var(--tm-status-positive)] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
        </section>

        <div className="mt-[var(--tm-space-3)] grid grid-cols-2 gap-[var(--tm-space-3)]">
          {students.map(student => (
            <article key={student.id} className="overflow-hidden rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-control)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-muted)]">
                {student.hasFaceData && student.avatar ? <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-[var(--tm-space-2)] text-[var(--tm-text-disabled)]"><UserRound className="h-8 w-8" /><span className="text-[length:var(--tm-font-size-meta)]">未录入</span></div>}
                {student.hasFaceData && <CheckCircle2 className="absolute right-[var(--tm-space-2)] top-[var(--tm-space-2)] h-5 w-5 rounded-full bg-[var(--tm-bg-surface)] text-[var(--tm-status-positive)]" />}
                {student.isUploading && <div className="absolute inset-0 flex items-center justify-center bg-[var(--tm-mask)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)]">处理中</div>}
              </div>
              <div className="mt-[var(--tm-space-2)] flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-2)]">
                <div className="min-w-0 flex-1"><strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{student.name}</strong><small className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{student.studentNo ?? student.id}</small></div>
                <button type="button" disabled={student.isUploading} onClick={() => setActiveStudentId(student.id)} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft-strong)] disabled:text-[var(--tm-text-disabled)]" aria-label={`${student.hasFaceData ? '更新' : '录入'}${student.name}人脸`}><Camera className="h-[18px] w-[18px]" /></button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <MobileBottomSheet open={activeStudent !== null} title={`${activeStudent?.hasFaceData ? '更新' : '录入'}人脸`} onClose={() => setActiveStudentId(null)}>
        <div className="mb-[var(--tm-space-3)] truncate text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">{activeStudent?.name}</div>
        <div className="space-y-[var(--tm-space-2)]">
          <button type="button" onClick={() => updateFace('camera')} className="flex min-h-[56px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]"><span className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]"><Camera className="h-[18px] w-[18px]" /></span>拍照录入</button>
          <button type="button" onClick={() => updateFace('album')} className="flex min-h-[56px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]"><span className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]"><Image className="h-[18px] w-[18px]" /></span>从相册选择</button>
        </div>
      </MobileBottomSheet>
    </div>
  );
};

export default FaceUpdateView;
