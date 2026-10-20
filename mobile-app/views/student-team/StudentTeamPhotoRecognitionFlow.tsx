import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Image } from 'lucide-react';
import type { ClassInfo, Student } from '../../types';
import MobileFullScreenPage from '../../components/ui/MobileFullScreenPage';
import MobilePageHeader from '../../components/ui/MobilePageHeader';
import MobileCameraView from '../../components/ui/MobileCameraView';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import StudentCompactSelectGrid from '../../components/student/StudentCompactSelectGrid';

type RecognitionStep = 'source' | 'capture' | 'loading' | 'review';
type RecognitionItemState = 'toConfirm' | 'unmatched';

interface RecognitionItem {
  key: string;
  state: RecognitionItemState;
  student?: Student;
  classLabel?: string;
  name?: string;
}

interface StudentTeamPhotoRecognitionFlowProps {
  open: boolean;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  getClassLabel: (classInfo: ClassInfo) => string;
  existingStudentIds?: ReadonlySet<string>;
  onClose: () => void;
  onConfirm: (studentIds: string[]) => void;
}

export const StudentTeamPhotoRecognitionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-[var(--tm-radius-control-compact)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-3 text-[13px] font-semibold text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-bg-surface-soft)]"
  >
    <Camera className="h-4 w-4" aria-hidden="true" />
    拍照识别
  </button>
);

const StudentTeamPhotoRecognitionFlow: React.FC<StudentTeamPhotoRecognitionFlowProps> = ({
  open,
  classes,
  getStudentsForClass,
  getClassLabel,
  onClose,
  onConfirm,
  existingStudentIds,
}) => {
  const [step, setStep] = useState<RecognitionStep>('source');
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [albumPreview, setAlbumPreview] = useState('');
  const [imageError, setImageError] = useState('');
  const [items, setItems] = useState<RecognitionItem[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [ignoredKeys, setIgnoredKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setStep('source');
    setAlbumPreview('');
    setImageError('');
    setItems([]);
    setConfirmedIds(new Set());
    setIgnoredKeys(new Set());
  }, [open]);

  useEffect(() => () => {
    if (albumPreview) URL.revokeObjectURL(albumPreview);
  }, [albumPreview]);

  const handleAlbumChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.type && !file.type.startsWith('image/')) {
      setImageError('请选择图片文件');
      return;
    }
    setImageError('');
    setAlbumPreview(URL.createObjectURL(file));
    setStep('loading');
  };

  useEffect(() => {
    if (!open) return undefined;
    if (step === 'loading') {
      const timer = window.setTimeout(() => {
        const roster: { student: Student; classLabel: string }[] = [];
        classes.forEach(classInfo => {
          getStudentsForClass(classInfo.id)
            .filter(student => (student.status ?? 'active') === 'active')
            .forEach(student => roster.push({ student, classLabel: getClassLabel(classInfo) }));
        });
        const nextItems: RecognitionItem[] = [];
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
    if (existingStudentIds?.has(studentId)) return current;
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

  const handleRetake = () => {
    setItems([]);
    setConfirmedIds(new Set());
    setIgnoredKeys(new Set());
    setStep(albumPreview ? 'source' : 'capture');
    setAlbumPreview('');
  };

  const handleConfirm = () => {
    const ids = toConfirmItems.filter(item => item.student && confirmedIds.has(item.student.id) && !existingStudentIds?.has(item.student.id)).map(item => item.student!.id);
    onConfirm(ids);
    onClose();
  };

  const isReview = step === 'review';
  const title = step === 'capture' ? '拍照识别学生名单' : step === 'loading' ? '识别中' : '识别结果';

  if (step === 'source') {
    return (
      <MobileBottomSheet open={open} title="拍照识别" onClose={onClose}>
        <div className="space-y-[var(--tm-space-2)]">
          {[
            { label: '拍照', icon: Camera, onClick: () => setStep('capture') },
            { label: '从相册选择', icon: Image, onClick: () => albumInputRef.current?.click() },
          ].map(({ label, icon: Icon, onClick }) => (
            <button key={label} type="button" onClick={onClick} className="flex min-h-14 w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-left text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]">
              <Icon className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" aria-hidden="true" />
              {label}
            </button>
          ))}
          {imageError && <p role="alert" className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-status-negative-strong)]">{imageError}</p>}
        </div>
        <input ref={albumInputRef} type="file" accept="image/*" aria-label="选择学生名单图片" className="hidden" onChange={handleAlbumChange} />
      </MobileBottomSheet>
    );
  }

  return (
    <MobileFullScreenPage open={open} title={title} onBack={onClose} appearance={isReview ? 'light' : 'dark'}>
      {isReview && <MobilePageHeader title="识别结果" onBack={onClose} />}
      {!isReview && albumPreview && (
        <>
          <MobilePageHeader title="识别中" onBack={onClose} />
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[var(--tm-space-4)] p-[var(--tm-space-4)] text-[var(--tm-camera-text)]">
            <img src={albumPreview} alt="待识别的学生名单" className="min-h-0 max-w-full flex-1 object-contain" />
            <p role="status">正在识别学生名单…</p>
          </div>
        </>
      )}
      {!isReview && !albumPreview && (
        <MobileCameraView
          title="拍照识别学生名单"
          onBack={onClose}
          onCapture={() => setStep('loading')}
          busy={step === 'loading'}
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[var(--tm-camera-preview-bg)] p-[12%] pb-[25%]" aria-hidden="true">
            <div className="w-full -rotate-3 bg-[var(--tm-bg-surface)] px-5 py-7 text-[var(--tm-text-primary)] shadow-2xl">
              <p className="mb-5 text-center text-[length:var(--tm-font-size-section-title)] font-semibold">学生名单</p>
              <div className="space-y-3 text-[length:var(--tm-font-size-compact)]">
                <div className="flex justify-between border-b border-[var(--tm-border-control)] pb-2 font-medium"><span>姓名</span><span>班级</span></div>
                {classes.flatMap(classInfo => getStudentsForClass(classInfo.id).filter(student => (student.status ?? 'active') === 'active').map(student => ({ student, classLabel: getClassLabel(classInfo) }))).slice(0, 3).map(({ student, classLabel }) => (
                  <div key={student.id} className="flex justify-between gap-2 border-b border-[var(--tm-border-subtle)] pb-2"><span className="shrink-0">{student.name}</span><span className="truncate">{classLabel}</span></div>
                ))}
                <div className="border-b border-[var(--tm-border-subtle)] pb-2">李雨桐</div>
              </div>
            </div>
          </div>
        </MobileCameraView>
      )}

      {step === 'review' && (
        <main className="min-h-0 flex-1 space-y-[var(--tm-layout-card-gap)] overflow-y-auto bg-[var(--tm-page-plain-content-bg)] px-3 py-[var(--tm-space-4)] no-scrollbar">
          {toConfirmItems.length > 0 && (
            <section>
              <h3 className="mb-2 px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">核对名单（{toConfirmItems.length}）</h3>
              <StudentCompactSelectGrid
                sections={[{ id: 'recognition-confirm', students: toConfirmStudents }]}
                isSelected={studentId => confirmedIds.has(studentId)}
                isDisabled={studentId => existingStudentIds?.has(studentId) ?? false}
                getSecondaryLabel={student => `${classLabelById.get(student.id) ?? ''}${existingStudentIds?.has(student.id) ? ' · 已加入' : ''}`}
                showRosterNumber={false}
                onToggle={toggleConfirmed}
              />
            </section>
          )}

          {unmatchedItems.length > 0 && (
            <section>
              <h3 className="mb-2 px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">未匹配（{unmatchedItems.length}）</h3>
              <div className="px-[var(--tm-space-2)]">
                {unmatchedItems.map(item => (
                  <div key={item.key} className="flex items-center gap-3 rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] px-3 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tm-status-negative-soft)] text-[var(--tm-status-negative-strong)]">
                      <AlertCircle className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{item.name}</span>
                      <span className="block text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">未查到该学生</span>
                    </span>
                    <button type="button" onClick={() => ignoreUnmatched(item.key)} className="min-h-11 min-w-11 shrink-0 rounded-[var(--tm-radius-control-compact)] px-2.5 py-1.5 text-[13px] font-semibold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">忽略</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      )}
      {isReview && (
        <footer className="shrink-0 bg-[var(--tm-bg-surface)] px-4 pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-3">
        <div className="space-y-[var(--tm-space-2)]">
          <button type="button" disabled={confirmedIds.size === 0} onClick={handleConfirm} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">
            确认添加 {confirmedIds.size} 人
          </button>
          <button type="button" onClick={handleRetake} className="flex min-h-11 w-full items-center justify-center rounded-[var(--tm-radius-control-compact)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
            {albumPreview ? '重新选择图片' : '重新拍照'}
          </button>
        </div>
        </footer>
      )}
    </MobileFullScreenPage>
  );
};

export default StudentTeamPhotoRecognitionFlow;
