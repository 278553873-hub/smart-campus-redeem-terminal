import React, { useMemo, useState } from 'react';
import { Camera, ChevronLeft, Image, UserRound } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import CompactSegmentedControl, { type CompactSegmentedControlItem } from '../../components/ui/CompactSegmentedControl';
import { ASSETS } from '../../assets/images';
import type { ClassInfo, Student } from '../../types';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import { isStudentFaceRecorded, markStudentFaceRecorded, resolveStudentAvatar, seedClassFaceLibrary, useStudentFaceLibrary } from '../../domain/studentFaceLibrary';

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

type FaceTab = 'pending' | 'recorded';

const FaceUpdateView: React.FC<FaceUpdateViewProps> = ({ classInfo, currentSpace, students: classStudents, onBack }) => {
  const [students, setStudents] = useState<FaceStudent[]>(() => {
    seedClassFaceLibrary(classInfo.id, classStudents);
    return classStudents.map(student => ({
      ...student,
      hasFaceData: isStudentFaceRecorded(student.id),
      isUploading: false,
    }));
  });
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FaceTab>(() => (students.some(student => !student.hasFaceData) ? 'pending' : 'recorded'));

  // 订阅共享人脸库，录入后本页与其它页面的学生头像一起更新。
  useStudentFaceLibrary();

  const activeStudent = useMemo(() => students.find(student => student.id === activeStudentId) ?? null, [activeStudentId, students]);
  const pendingStudents = students.filter(student => !student.hasFaceData);
  const recordedStudents = students.filter(student => student.hasFaceData);
  const totalCount = students.length;
  const pendingCount = pendingStudents.length;
  const completedCount = recordedStudents.length;

  const updateFace = (source: 'camera' | 'album') => {
    if (!activeStudent) return;
    const student = activeStudent;
    setActiveStudentId(null);
    setStudents(current => current.map(item => item.id === student.id ? { ...item, isUploading: true } : item));
    window.setTimeout(() => {
      markStudentFaceRecorded(student, classInfo.id);
      setStudents(current => current.map(item => item.id === student.id ? { ...item, isUploading: false, hasFaceData: true } : item));
    }, source === 'camera' ? 900 : 700);
  };

  const renderStudentRow = (student: FaceStudent) => {
    const faceImageSrc = resolveStudentAvatar(student);
    return (
      <article key={student.id} className="rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] [box-shadow:var(--tm-shadow-control)]">
        <div className="flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-3)]">
          {faceImageSrc
            ? <img src={faceImageSrc} alt="" className="h-10 w-10 shrink-0 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover" />
            : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-disabled)]" aria-hidden="true"><UserRound className="h-5 w-5" /></span>}
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{student.name}</strong>
            <small className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{student.studentNo ?? student.id}</small>
          </div>
          {student.isUploading ? (
            <span role="status" className="shrink-0 px-[var(--tm-space-2)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">处理中</span>
          ) : (
            <button
              type="button"
              onClick={() => setActiveStudentId(student.id)}
              className="flex h-[var(--tm-size-touch)] shrink-0 items-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-control)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]"
              aria-label={`${student.hasFaceData ? '更新' : '录入'}${student.name}人脸`}
            >
              <Camera aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              {student.hasFaceData ? '更新' : '录入'}
            </button>
          )}
        </div>
      </article>
    );
  };

  const selectTab = (tab: FaceTab) => setActiveTab(tab);

  const tabItems: ReadonlyArray<CompactSegmentedControlItem<FaceTab>> = [
    { value: 'pending', label: <span className="tabular-nums">待录入（{pendingCount}）</span> },
    { value: 'recorded', label: <span className="tabular-nums">已录入（{completedCount}）</span> },
  ];

  const visibleStudents = activeTab === 'pending' ? pendingStudents : recordedStudents;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)]" aria-label="返回班级列表"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">更新人脸</h1>
      </header>

      {totalCount === 0 ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pt-[var(--tm-space-3)] no-scrollbar">
          <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.CHAIR} title="暂无学生" className="min-h-[360px] py-4" />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
          <div className="sticky top-0 z-20 bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-space-4)] pt-[var(--tm-space-2)] pb-[var(--tm-space-3)]">
            <CompactSegmentedControl
              value={activeTab}
              items={tabItems}
              onChange={selectTab}
              ariaLabel="按人脸录入状态切换学生"
              fullWidth
              motion="sliding"
            />
          </div>

          <div className="px-[var(--tm-space-4)] pb-[calc(var(--tm-space-6)+env(safe-area-inset-bottom))]">
            {visibleStudents.length > 0 ? (
              <div className="space-y-[var(--tm-space-2)]">{visibleStudents.map(renderStudentRow)}</div>
            ) : (
              <p className="py-20 text-center text-[length:var(--tm-font-size-body)] text-[var(--tm-text-tertiary)]">
                {activeTab === 'pending'
                  ? `${getTeacherClassDisplayName(classInfo, currentSpace)} ${totalCount} 人已完成人脸采集`
                  : '还没有学生录入人脸'}
              </p>
            )}
          </div>
        </div>
      )}

      <MobileBottomSheet open={activeStudent !== null} title={`${activeStudent?.hasFaceData ? '更新' : '录入'}人脸`} onClose={() => setActiveStudentId(null)}>
        <div className="mb-[var(--tm-space-3)] truncate text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">{activeStudent?.name}</div>
        <div className="space-y-[var(--tm-space-2)]">
          <button type="button" onClick={() => updateFace('camera')} className="flex min-h-[56px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"><span className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]"><Camera className="h-[18px] w-[18px]" /></span>拍照录入</button>
          <button type="button" onClick={() => updateFace('album')} className="flex min-h-[56px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"><span className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]"><Image className="h-[18px] w-[18px]" /></span>从相册选择</button>
        </div>
      </MobileBottomSheet>
    </div>
  );
};

export default FaceUpdateView;
