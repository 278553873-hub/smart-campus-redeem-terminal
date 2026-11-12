import React, { useEffect, useState } from 'react';
import { Camera, ChevronLeft, Image, Trash2 } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../../components/ui/MobileConfirmSheet';
import MobileToast from '../../components/ui/MobileToast';
import StudentHorizontalCard from '../../components/student/StudentHorizontalCard';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import ReportDateRangeTabs, { type ReportDateRangeTab } from '../../components/report/ReportDateRangeTabs';
import { ASSETS } from '../../assets/images';
import type { ClassInfo, Student } from '../../types';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import { clearStudentFace, isStudentFaceRecorded, markStudentFaceRecorded, resolveStudentAvatar, seedClassFaceLibrary, useStudentFaceLibrary } from '../../domain/studentFaceLibrary';

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
type FaceAction = { studentId: string; type: 'capture' | 'clear' | null };

const FaceUpdateView: React.FC<FaceUpdateViewProps> = ({ classInfo, currentSpace, students: classStudents, onBack }) => {
  seedClassFaceLibrary(classInfo.id, classStudents);
  const [uploadingStudentIds, setUploadingStudentIds] = useState<Set<string>>(() => new Set());
  const [activeAction, setActiveAction] = useState<FaceAction | null>(null);
  const [activeTab, setActiveTab] = useState<FaceTab>(() => (classStudents.some(student => !isStudentFaceRecorded(student.id)) ? 'pending' : 'recorded'));
  const [toastMessage, setToastMessage] = useState('');

  // 状态直接读取共享人脸库，避免清除后保留本页的旧副本。
  useStudentFaceLibrary();
  const students: FaceStudent[] = classStudents.map(student => ({
    ...student,
    avatar: resolveStudentAvatar(student),
    hasFaceData: isStudentFaceRecorded(student.id),
    isUploading: uploadingStudentIds.has(student.id),
  }));

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(''), 1800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const activeStudent = students.find(student => student.id === activeAction?.studentId) ?? null;
  const pendingStudents = students.filter(student => !student.hasFaceData);
  const recordedStudents = students.filter(student => student.hasFaceData);
  const totalCount = students.length;
  const pendingCount = pendingStudents.length;
  const completedCount = recordedStudents.length;
  // 关闭时保留操作对象，公共弹窗退场动画中的姓名不会闪空。
  const closeAction = () => setActiveAction(current => current ? { ...current, type: null } : null);

  const updateFace = (source: 'camera' | 'album') => {
    if (!activeStudent || activeStudent.isUploading) return;
    const student = activeStudent;
    closeAction();
    setUploadingStudentIds(current => new Set(current).add(student.id));
    window.setTimeout(() => {
      markStudentFaceRecorded(student, classInfo.id);
      setUploadingStudentIds(current => {
        const next = new Set(current);
        next.delete(student.id);
        return next;
      });
    }, source === 'camera' ? 900 : 700);
  };

  const clearFace = () => {
    if (!activeStudent?.hasFaceData || activeStudent.isUploading || activeAction?.type !== 'clear') return;
    clearStudentFace(activeStudent.id);
    closeAction();
    setToastMessage('已清空人脸数据');
  };

  const renderStudentRow = (student: FaceStudent) => {
    return (
      <StudentHorizontalCard
        shape="subtle"
        key={student.id}
        student={student}
        avatarSrc={student.avatar}
        action={student.isUploading ? (
          <span role="status" className="shrink-0 px-[var(--tm-space-2)] text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">处理中</span>
        ) : (
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setActiveAction({ studentId: student.id, type: 'capture' })}
              className="flex h-[var(--tm-size-touch)] shrink-0 items-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-control-compact)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
              aria-label={`${student.hasFaceData ? '更新' : '录入'}${student.name}人脸`}
              aria-haspopup="dialog"
              aria-expanded={activeAction?.studentId === student.id && activeAction.type === 'capture'}
            >
              <Camera aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              {student.hasFaceData ? '更新' : '录入'}
            </button>
            {student.hasFaceData && (
              <button
                type="button"
                onClick={() => setActiveAction({ studentId: student.id, type: 'clear' })}
                aria-label={`清空${student.name}人脸数据`}
                aria-haspopup="dialog"
                aria-expanded={activeAction?.studentId === student.id && activeAction.type === 'clear'}
                className="flex h-[var(--tm-size-touch)] shrink-0 items-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-control-compact)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
              >
                <Trash2 aria-hidden="true" className="h-[18px] w-[18px]" />
                清空
              </button>
            )}
          </div>
        )}
      />
    );
  };

  const tabItems: ReadonlyArray<ReportDateRangeTab<FaceTab>> = [
    { value: 'pending', label: <span className="font-semibold tabular-nums">待录入（{pendingCount}）</span> },
    { value: 'recorded', label: <span className="font-semibold tabular-nums">已录入（{completedCount}）</span> },
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
        <>
          <ReportDateRangeTabs
            value={activeTab}
            items={tabItems}
            onChange={setActiveTab}
            ariaLabel="按人脸录入状态切换学生"
            semantics="tabs"
            className="shrink-0"
          />
          <div
            role="tabpanel"
            aria-label={activeTab === 'pending' ? '待录入学生' : '已录入学生'}
            className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pt-[var(--tm-space-3)] pb-[calc(var(--tm-space-6)+env(safe-area-inset-bottom))] no-scrollbar"
          >
            {visibleStudents.length > 0 ? (
              <div className="space-y-[var(--tm-layout-list-gap-compact)]">{visibleStudents.map(renderStudentRow)}</div>
            ) : (
              <p className="py-20 text-center text-[length:var(--tm-font-size-body)] text-[var(--tm-text-tertiary)]">
                {activeTab === 'pending'
                  ? `${getTeacherClassDisplayName(classInfo, currentSpace)} ${totalCount} 人已完成人脸采集`
                  : '暂无已录入学生'}
              </p>
            )}
          </div>
        </>
      )}

      <MobileBottomSheet open={activeStudent !== null && activeAction?.type === 'capture'} title={`${activeStudent?.hasFaceData ? '更新' : '录入'}人脸`} onClose={closeAction}>
        <div className="mb-[var(--tm-space-3)] truncate text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">{activeStudent?.name}</div>
        <div className="space-y-[var(--tm-layout-list-gap-compact)]">
          <button type="button" onClick={() => updateFace('camera')} className="flex min-h-[56px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"><span className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]"><Camera className="h-[18px] w-[18px]" /></span>拍照录入</button>
          <button type="button" onClick={() => updateFace('album')} className="flex min-h-[56px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"><span className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]"><Image className="h-[18px] w-[18px]" /></span>从相册选择</button>
        </div>
      </MobileBottomSheet>

      <MobileConfirmSheet
        shape="subtle"
        open={Boolean(activeStudent?.hasFaceData) && activeAction?.type === 'clear'}
        title={`清空${activeStudent?.name ?? ''}的人脸数据？`}
        description="清空后将无法使用人脸识别，且无法恢复。如需再次录入，请先征得家长同意。"
        confirmLabel="确认清空"
        tone="danger"
        onClose={closeAction}
        onConfirm={clearFace}
      />
      <MobileToast message={toastMessage} />
    </div>
  );
};

export default FaceUpdateView;
