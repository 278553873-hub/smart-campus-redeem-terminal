import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  FileImage,
  FileText,
  Image,
  Maximize2,
  MoreHorizontal,
  Printer,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import MobileToast from '../components/ui/MobileToast';
import HomeworkStatusButtonGroup from '../components/homework/HomeworkStatusButtonGroup';
import { ASSETS } from '../assets/images';
import {
  HOMEWORK_TEMPLATE_CAPACITY,
  getCurrentRosterVersions,
  sortStudentsByNumber,
  type HomeworkAssignment,
  type HomeworkImportDraft,
  type HomeworkRosterVersion,
  type HomeworkStatus,
  type HomeworkTemplatePageSize,
} from '../domain/homework';
import { recognizeHomeworkFiles } from '../services/homeworkRecognitionService';
import {
  getHomeworkTemplatePreviewDataUrl,
  printHomeworkTemplate,
} from '../utils/homeworkTemplateExport';
import type { ClassInfo } from '../types';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../domain/teacherSpaceAccess';

interface StagedImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface HomeworkBatchImportViewProps {
  schoolId: string;
  schoolName: string;
  operatorName: string;
  rosters: HomeworkRosterVersion[];
  assignments: HomeworkAssignment[];
  tasks: HomeworkImportDraft[];
  onChangeTasks: React.Dispatch<React.SetStateAction<HomeworkImportDraft[]>>;
  onSubmitAssignments: (assignments: HomeworkAssignment[]) => { saved: number; skipped: number };
  onSyncAssignments: (assignments: HomeworkAssignment[]) => void;
  onDeleteTask: (task: HomeworkImportDraft) => void;
  onBack: () => void;
  classes: ClassInfo[];
  currentSpace: TeacherSpaceOption;
}

const templatePageSizes: HomeworkTemplatePageSize[] = ['A4', 'A3'];
const maxImagesPerRecognition = 9;

const templateSequenceRange: Record<HomeworkTemplatePageSize, string> = {
  A4: '学号01—72',
  A3: '学号001—100',
};

const readImagePreview = (file: File) => new Promise<string>(resolve => {
  const reader = new FileReader();
  reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
  reader.onerror = () => resolve('');
  reader.readAsDataURL(file);
});

const getStudentNoSuffix = (studentNo: string) => {
  const normalized = studentNo.replace(/^学号/, '').trim();
  const numeric = normalized.match(/\d+/g)?.join('') ?? normalized;
  return numeric.slice(-2).padStart(2, '0');
};

const remapDraftToRoster = (
  draft: HomeworkImportDraft,
  roster: HomeworkRosterVersion,
): HomeworkImportDraft => {
  const rosterBySequence = new Map(
    sortStudentsByNumber(roster.students.filter(student => student.status === 'active'))
      .map((student, index) => [index + 1, student]),
  );
  const remappedStudentIds = new Map<string, string>();
  const studentIssues: HomeworkImportDraft['issues'] = [];
  const nextAssignments = draft.assignments.map(assignment => ({
    ...assignment,
    classId: roster.classId,
    className: roster.className,
    results: assignment.results.map((result, index) => {
      const student = result.classSequence ? rosterBySequence.get(result.classSequence) : undefined;
      if (!student) {
        studentIssues.push({
          id: `student-rematch-${assignment.id}-${index}`,
          type: 'student_mismatch',
          message: `学号${result.classSequence ?? '未识别'}无法匹配班级学生`,
          assignmentId: assignment.id,
          studentId: result.studentId,
          resolved: false,
        });
        return result;
      }
      remappedStudentIds.set(result.studentId, student.studentId);
      return {
        ...result,
        studentId: student.studentId,
        studentNo: student.studentNo,
        studentName: student.name,
        avatar: student.avatar,
      };
    }),
  }));

  return {
    ...draft,
    className: roster.className,
    assignments: nextAssignments,
    issues: draft.issues
      .filter(issue => issue.type !== 'class_mismatch' && issue.type !== 'student_mismatch')
      .map(issue => issue.studentId && remappedStudentIds.has(issue.studentId)
        ? { ...issue, studentId: remappedStudentIds.get(issue.studentId) }
        : issue)
      .concat(studentIssues),
  };
};

const HomeworkBatchImportView: React.FC<HomeworkBatchImportViewProps> = ({
  schoolId,
  schoolName,
  operatorName,
  rosters,
  assignments,
  tasks: drafts,
  onChangeTasks: setDrafts,
  onSubmitAssignments,
  onSyncAssignments,
  onDeleteTask,
  onBack,
  classes,
  currentSpace,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [templateSheetOpen, setTemplateSheetOpen] = useState(false);
  const [templatePreviewPageSize, setTemplatePreviewPageSize] = useState<HomeworkTemplatePageSize | null>(null);
  const [templatePreviewZoomed, setTemplatePreviewZoomed] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');
  const [toast, setToast] = useState('');
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [stagingSource, setStagingSource] = useState<'camera' | 'gallery' | null>(null);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<'issues' | 'all'>('issues');
  const [reviewTabsVisible, setReviewTabsVisible] = useState(false);
  const [activeAssignmentDetailId, setActiveAssignmentDetailId] = useState<string | null>(null);
  const [pendingRosterId, setPendingRosterId] = useState<string | null>(null);
  const [actionDraftId, setActionDraftId] = useState<string | null>(null);
  const [deleteDraftId, setDeleteDraftId] = useState<string | null>(null);
  const [skippedAssignmentIds, setSkippedAssignmentIds] = useState<Set<string>>(new Set());
  const [classMatchSelections, setClassMatchSelections] = useState<Record<string, string>>({});
  const [studentMatchSelections, setStudentMatchSelections] = useState<Record<string, string>>({});
  const currentRosters = useMemo(() => getCurrentRosterVersions(rosters), [rosters]);
  const templatePreviewUrls = useMemo(() => {
    if (!templateSheetOpen || typeof document === 'undefined') return null;
    return Object.fromEntries(templatePageSizes.map(pageSize => [pageSize, getHomeworkTemplatePreviewDataUrl(pageSize)])) as Record<HomeworkTemplatePageSize, string>;
  }, [templateSheetOpen]);
  const activeDraft = drafts.find(draft => draft.id === activeDraftId) ?? null;
  const activeAssignmentDetail = activeDraft?.assignments.find(assignment => assignment.id === activeAssignmentDetailId) ?? null;
  const actionDraft = drafts.find(draft => draft.id === actionDraftId) ?? null;
  const deleteDraft = drafts.find(draft => draft.id === deleteDraftId) ?? null;
  const unresolvedIssues = activeDraft?.issues.filter(issue => !issue.resolved) ?? [];
  const getRosterClassLabel = (roster: HomeworkRosterVersion) => {
    const classInfo = classes.find(classInfo => classInfo.id === roster.classId);
    return classInfo ? getTeacherClassDisplayName(classInfo, currentSpace) : roster.className;
  };
  const getDraftClassLabel = (draft: HomeworkImportDraft) => {
    const classId = draft.assignments[0]?.classId;
    const classInfo = classes.find(item => item.id === classId || item.name === draft.className);
    return classInfo ? getTeacherClassDisplayName(classInfo, currentSpace) : draft.className;
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const syncDraftAssignments = (draft: HomeworkImportDraft) => {
    const blockedAssignmentIds = new Set(
      draft.issues
        .filter(issue => issue.type === 'duplicate' || issue.type === 'conflict')
        .map(issue => issue.assignmentId)
        .filter((assignmentId): assignmentId is string => Boolean(assignmentId)),
    );
    onSyncAssignments(draft.assignments.filter(assignment => !blockedAssignmentIds.has(assignment.id)));
  };

  const stageFiles = async (fileList: FileList | null, source: 'camera' | 'gallery') => {
    const selectedFiles = Array.from(fileList ?? []).filter(file => file.type.startsWith('image/'));
    if (selectedFiles.length === 0) return;
    const remainingCount = maxImagesPerRecognition - stagedImages.length;
    const files = selectedFiles.slice(0, remainingCount);
    if (files.length === 0) {
      showToast(`一次最多识别${maxImagesPerRecognition}张图片`);
      return;
    }
    const previewUrls = await Promise.all(files.map(readImagePreview));
    const stamp = Date.now();
    setStagedImages(current => [
      ...current,
      ...files.map((file, index) => ({ id: `staged-${stamp}-${index}`, file, previewUrl: previewUrls[index] })),
    ]);
    setStagingSource(source);
    setUploadSheetOpen(false);
    if (selectedFiles.length > files.length) showToast(`一次最多识别${maxImagesPerRecognition}张图片`);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const startRecognition = async () => {
    const files = stagedImages.map(image => image.file);
    if (files.length === 0) return;
    setProcessingLabel('正在识别作业表');
    try {
      const recognizedDrafts = await recognizeHomeworkFiles({
        files,
        schoolId,
        schoolName,
        rosters: currentRosters,
        existingAssignments: assignments,
        operatorName,
      });
      const draftsWithPreviews = recognizedDrafts.map((draft, index) => ({ ...draft, previewUrl: stagedImages[index]?.previewUrl }));
      const saveResult = onSubmitAssignments(draftsWithPreviews.flatMap(draft => draft.assignments));
      setDrafts(current => [...draftsWithPreviews, ...current]);
      const duplicateIds = recognizedDrafts.flatMap(draft => draft.issues.filter(issue => issue.type === 'duplicate').map(issue => issue.assignmentId).filter((id): id is string => Boolean(id)));
      setSkippedAssignmentIds(current => new Set([...current, ...duplicateIds]));
      setActiveDraftId(null);
      setActiveAssignmentDetailId(null);
      setReviewMode('issues');
      setStagedImages([]);
      setStagingSource(null);
      showToast(`识别完成，已自动录入${saveResult.saved}次作业`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '识别失败，请重新上传');
    } finally {
      setProcessingLabel('');
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const openDraft = (draft: HomeworkImportDraft) => {
    const hasIssues = draft.issues.some(issue => !issue.resolved);
    setActiveDraftId(draft.id);
    setReviewTabsVisible(hasIssues);
    setReviewMode(hasIssues ? 'issues' : 'all');
    setActiveAssignmentDetailId(null);
  };

  const updateAssignment = (assignmentId: string, updater: (assignment: HomeworkAssignment) => HomeworkAssignment) => {
    const ownerDraft = drafts.find(draft => draft.assignments.some(assignment => assignment.id === assignmentId));
    const currentAssignment = ownerDraft?.assignments.find(assignment => assignment.id === assignmentId);
    if (!ownerDraft || !currentAssignment) return;
    const nextAssignment = updater(currentAssignment);
    const nextDraft = {
      ...ownerDraft,
      assignments: ownerDraft.assignments.map(assignment => assignment.id === assignmentId ? nextAssignment : assignment),
      issues: ownerDraft.issues.map(issue => {
        if (issue.assignmentId !== assignmentId || issue.type !== 'missing_metadata') return issue;
        return nextAssignment.date && nextAssignment.title.trim() && nextAssignment.subject.trim()
          ? { ...issue, resolved: true }
          : { ...issue, resolved: false };
      }),
    };
    setDrafts(current => current.map(draft => {
      return draft.id === ownerDraft.id ? nextDraft : draft;
    }));
    syncDraftAssignments(nextDraft);
  };

  const updateDraftSubject = (draftId: string, subject: string) => {
    const ownerDraft = drafts.find(draft => draft.id === draftId);
    if (!ownerDraft) return;
    const nextAssignments = ownerDraft.assignments.map(assignment => ({ ...assignment, subject }));
    const nextDraft = {
      ...ownerDraft,
      subject,
      assignments: nextAssignments,
      issues: ownerDraft.issues.map(issue => {
        if (issue.type !== 'missing_metadata' || !issue.assignmentId) return issue;
        const assignment = nextAssignments.find(item => item.id === issue.assignmentId);
        return assignment?.date && assignment.title.trim() && subject.trim()
          ? { ...issue, resolved: true }
          : { ...issue, resolved: false };
      }),
    };
    setDrafts(current => current.map(draft => {
      return draft.id === draftId ? nextDraft : draft;
    }));
    syncDraftAssignments(nextDraft);
  };

  const selectDraftRoster = (draftId: string, rosterId: string) => {
    const roster = currentRosters.find(item => item.id === rosterId);
    if (!roster) return;
    const draft = drafts.find(item => item.id === draftId);
    if (!draft) return;
    const remappedDraft = remapDraftToRoster(draft, roster);
    const hasRematchIssues = remappedDraft.issues.some(issue => !issue.resolved);
    setDrafts(current => current.map(item => item.id === draftId ? remappedDraft : item));
    syncDraftAssignments(remappedDraft);
    if (hasRematchIssues) {
      setReviewTabsVisible(true);
      setReviewMode('issues');
      setActiveAssignmentDetailId(null);
    }
    setPendingRosterId(null);
  };

  const requestDraftRosterChange = (rosterId: string) => {
    const currentRosterId = currentRosters.find(roster => roster.classId === activeDraft?.assignments[0]?.classId)?.id;
    if (!rosterId || rosterId === currentRosterId) return;
    setPendingRosterId(rosterId);
  };

  const matchDraftToRoster = (issueId: string, rosterId: string) => {
    const roster = currentRosters.find(item => item.id === rosterId);
    if (!roster) return;
    const ownerDraft = drafts.find(draft => draft.issues.some(issue => issue.id === issueId && issue.type === 'class_mismatch'));
    if (!ownerDraft) return;
    const remappedDraft = remapDraftToRoster(ownerDraft, roster);
    setDrafts(current => current.map(draft => draft.id === ownerDraft.id ? remappedDraft : draft));
    syncDraftAssignments(remappedDraft);
    setClassMatchSelections(current => {
      const next = { ...current };
      delete next[issueId];
      return next;
    });
  };

  const matchDraftStudent = (issueId: string, assignmentId: string, unmatchedStudentId: string, targetStudentId: string) => {
    const assignment = drafts.flatMap(draft => draft.assignments).find(item => item.id === assignmentId);
    const roster = currentRosters.find(item => item.classId === assignment?.classId);
    const student = roster?.students.find(item => item.studentId === targetStudentId && item.status === 'active');
    if (!student) return;
    const ownerDraft = drafts.find(draft => draft.assignments.some(item => item.id === assignmentId));
    if (!ownerDraft) return;
    const nextDraft = {
      ...ownerDraft,
      assignments: ownerDraft.assignments.map(item => item.id !== assignmentId ? item : {
          ...item,
          results: item.results.map(result => result.studentId !== unmatchedStudentId ? result : {
          ...result,
          studentId: student.studentId,
          studentNo: student.studentNo,
          studentName: student.name,
          avatar: student.avatar,
          manuallyConfirmed: true,
        }),
      }),
      issues: ownerDraft.issues.map(issue => {
        if (issue.id === issueId) return { ...issue, resolved: true, studentId: student.studentId };
        if (issue.assignmentId === assignmentId && issue.studentId === unmatchedStudentId) {
          return { ...issue, studentId: student.studentId };
        }
        return issue;
      }),
    };
    setDrafts(current => current.map(draft => draft.id === ownerDraft.id ? nextDraft : draft));
    syncDraftAssignments(nextDraft);
    setStudentMatchSelections(current => {
      const next = { ...current };
      delete next[issueId];
      return next;
    });
  };

  const updateStudentStatus = (assignmentId: string, studentId: string, status: HomeworkStatus | null) => {
    updateAssignment(assignmentId, assignment => ({
      ...assignment,
      updatedAt: new Date().toISOString(),
      results: assignment.results.map(result => result.studentId === studentId ? { ...result, status, manuallyConfirmed: true, confidence: 1 } : result),
    }));
    setDrafts(current => current.map(draft => ({
      ...draft,
      issues: draft.issues.map(issue => issue.assignmentId === assignmentId && issue.studentId === studentId && issue.type === 'low_confidence' ? { ...issue, resolved: true } : issue),
    })));
  };

  const resolveIssue = (issueId: string, skipAssignmentId?: string) => {
    setDrafts(current => current.map(draft => ({
      ...draft,
      issues: draft.issues.map(issue => issue.id === issueId ? { ...issue, resolved: true } : issue),
      assignments: draft.assignments.map(assignment => ({
        ...assignment,
        results: draft.issues.some(issue => issue.id === issueId && issue.type === 'student_mismatch' && issue.assignmentId === assignment.id)
          ? assignment.results.filter(result => !draft.issues.some(issue => issue.id === issueId && issue.studentId === result.studentId))
          : assignment.results,
      })),
    })));
    if (skipAssignmentId) setSkippedAssignmentIds(current => new Set([...current, skipAssignmentId]));
  };

  const confirmDeleteTask = () => {
    if (!deleteDraft) return;
    onDeleteTask(deleteDraft);
    if (activeDraftId === deleteDraft.id) {
      setActiveDraftId(null);
      setActiveAssignmentDetailId(null);
    }
    setDeleteDraftId(null);
    showToast('已删除识别任务');
  };

  const downloadPrintTemplate = (pageSize: HomeworkTemplatePageSize) => {
    try {
      printHomeworkTemplate({ pageSize });
    } catch (error) {
      showToast(error instanceof Error ? error.message : '打印模板生成失败，请重试');
    }
  };

  const closeTemplateSheet = () => {
    setTemplateSheetOpen(false);
    setTemplatePreviewPageSize(null);
    setTemplatePreviewZoomed(false);
  };

  const previewTemplate = (pageSize: HomeworkTemplatePageSize) => {
    setTemplatePreviewPageSize(pageSize);
    setTemplatePreviewZoomed(false);
  };

  const renderHeader = (title: string, backAction: () => void) => (
    <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
      <button type="button" onClick={backAction} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回"><ChevronLeft className="h-5 w-5" /></button>
      <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">{title}</h1>
    </header>
  );

  if (processingLabel) {
    return <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">{renderHeader('作业录入', onBack)}<main className="flex min-h-0 flex-1 flex-col items-center justify-center px-[var(--tm-space-5)] text-center" role="status" aria-live="polite"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><FileImage className="h-7 w-7 motion-safe:animate-pulse" /></span><h2 className="mt-[var(--tm-space-4)] text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{processingLabel}</h2><p className="mt-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">正在检查图片并匹配班级学生</p></main></div>;
  }

  if (stagedImages.length > 0) {
    const continueSelecting = () => {
      if (stagingSource === 'camera') cameraInputRef.current?.click();
      else galleryInputRef.current?.click();
    };
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
        {renderHeader('待识别图片', () => { setStagedImages([]); setStagingSource(null); })}
        <main className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[var(--tm-space-5)] pt-[var(--tm-space-3)] no-scrollbar">
          <div className="mb-[var(--tm-space-3)] flex min-h-[var(--tm-size-touch)] items-center justify-between">
            <strong className="text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">已选择 {stagedImages.length}/{maxImagesPerRecognition} 张</strong>
            {stagedImages.length < maxImagesPerRecognition && (
              <button type="button" onClick={continueSelecting} className="min-h-[var(--tm-size-touch)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">
                {stagingSource === 'camera' ? '继续拍照' : '继续选择'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-[var(--tm-space-2)]" aria-label="待识别图片列表">
            {stagedImages.map((imageItem, index) => (
              <figure key={imageItem.id} className="relative overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)]" style={{ aspectRatio: '3 / 4' }}>
                <img src={imageItem.previewUrl} alt={`待识别图片${index + 1}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setStagedImages(current => current.filter(item => item.id !== imageItem.id))} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tm-mask)] text-[var(--tm-text-inverse)]" aria-label={`移除第${index + 1}张图片`}><X className="h-4 w-4" /></button>
                <figcaption className="absolute bottom-1 left-1 flex h-6 min-w-6 items-center justify-center rounded-[var(--tm-radius-badge)] bg-[var(--tm-bg-surface-glass)] px-1 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-text-primary)]">{index + 1}</figcaption>
              </figure>
            ))}
          </div>
        </main>
        <footer className="shrink-0 bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)]">
          <button type="button" onClick={startRecognition} className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)]">开始识别（{stagedImages.length}张）</button>
        </footer>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={event => stageFiles(event.target.files, 'camera')} />
        <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={event => stageFiles(event.target.files, 'gallery')} />
        <MobileToast message={toast} />
      </div>
    );
  }

  if (activeDraft && activeAssignmentDetail) {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
        {renderHeader('作业结果', () => setActiveAssignmentDetailId(null))}
        <main className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[var(--tm-space-5)] pt-[var(--tm-space-3)] no-scrollbar">
          <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card)]">
            <strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{getDraftClassLabel(activeDraft) || '待匹配班级'} · {activeDraft.subject || '待补充学科'}</strong>
            <div className="mt-[var(--tm-space-3)] grid grid-cols-2 gap-[var(--tm-space-2)]">
              <input aria-label="作业日期" type="date" value={activeAssignmentDetail.date} onChange={event => updateAssignment(activeAssignmentDetail.id, item => ({ ...item, date: event.target.value }))} className="h-[var(--tm-size-touch)] min-w-0 rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)]" />
              <input aria-label="作业主题" value={activeAssignmentDetail.title} onChange={event => updateAssignment(activeAssignmentDetail.id, item => ({ ...item, title: event.target.value }))} placeholder="作业主题" className="h-[var(--tm-size-touch)] min-w-0 rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)]" />
            </div>
          </section>

          <section className="mt-[var(--tm-space-3)] overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]" aria-label="学生作业结果">
            {activeAssignmentDetail.results.map((resultItem, resultIndex) => (
              <div key={resultItem.studentId} className={`grid min-h-[60px] grid-cols-[104px_minmax(0,1fr)] items-center gap-[var(--tm-space-2)] px-[var(--tm-space-2)] py-[var(--tm-space-2)] ${resultIndex > 0 ? 'border-t border-[var(--tm-border-subtle)]' : ''}`}>
                <div className="flex min-w-0 items-center gap-[var(--tm-space-2)]">
                  <img src={resultItem.avatar || ASSETS.AVATAR.GENERIC_BOY} alt="" className="h-8 w-8 shrink-0 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover" />
                  <span className="flex min-w-0 items-center gap-0.5">
                    <span aria-label={`学号${resultItem.studentNo}`} className="flex h-[14px] w-4 shrink-0 items-center justify-center rounded-[4px] bg-[var(--tm-bg-surface-muted)] font-mono text-[9px] font-semibold leading-none tabular-nums text-[var(--tm-text-tertiary)]">{getStudentNoSuffix(resultItem.studentNo)}</span>
                    <strong className="min-w-0 truncate text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-primary)]">{resultItem.studentName}</strong>
                  </span>
                </div>
                <HomeworkStatusButtonGroup value={resultItem.status} onChange={status => updateStudentStatus(activeAssignmentDetail.id, resultItem.studentId, status)} ariaLabel={`修改${resultItem.studentName}作业等级`} showAllTones />
              </div>
            ))}
          </section>
        </main>
        <MobileToast message={toast} />
      </div>
    );
  }

  if (activeDraft) {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
        {renderHeader('识别结果', () => setActiveDraftId(null))}
        <main className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[var(--tm-space-5)] pt-[var(--tm-space-3)] no-scrollbar">
          <section className="flex items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card)]">
            <span className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)]">
              {activeDraft.previewUrl ? <img src={activeDraft.previewUrl} alt="作业表原图" className="h-full w-full object-cover" /> : <FileImage className="h-6 w-6 text-[var(--tm-text-tertiary)]" />}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{getDraftClassLabel(activeDraft) || '待匹配班级'} · {activeDraft.subject || '待补充学科'}</strong>
              <span className="mt-1 block text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{activeDraft.assignments.length}次作业</span>
            </div>
          </section>

          {reviewTabsVisible && (
            <CompactSegmentedControl
              value={reviewMode}
              items={[{ value: 'issues', label: `待核对 ${unresolvedIssues.length}` }, { value: 'all', label: '完整结果' }]}
              onChange={value => setReviewMode(value as 'issues' | 'all')}
              ariaLabel="识别结果查看范围"
              fullWidth
              className="mt-[var(--tm-space-3)]"
            />
          )}

          {reviewMode === 'issues' && reviewTabsVisible && (
            <section className="mt-[var(--tm-space-3)] space-y-[var(--tm-space-2)]" aria-label="待核对项">
              {unresolvedIssues.length === 0 && (
                <div className="flex min-h-[144px] flex-col items-center justify-center rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] text-center [box-shadow:var(--tm-shadow-card)]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]"><Check className="h-5 w-5" /></span>
                  <strong className="mt-[var(--tm-space-2)] text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">已完成核对</strong>
                </div>
              )}
              {unresolvedIssues.map(issue => {
                const assignment = activeDraft.assignments.find(item => item.id === issue.assignmentId);
                const result = assignment?.results.find(item => item.studentId === issue.studentId);
                const classStudents = currentRosters
                  .find(roster => roster.classId === assignment?.classId)
                  ?.students.filter(student => student.status === 'active') ?? [];
                return (
                  <div key={issue.id} className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card)]">
                    <div className="flex gap-[var(--tm-space-2)]">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tm-status-negative)]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{issue.message}</p>
                        {result && issue.type === 'low_confidence' && (
                          <div className="mt-[var(--tm-space-2)]"><HomeworkStatusButtonGroup value={result.status} onChange={status => updateStudentStatus(assignment!.id, result.studentId, status)} ariaLabel={`核对${result.studentName}作业等级`} showAllTones /></div>
                        )}
                        {issue.type === 'class_mismatch' && (
                          <div className="mt-[var(--tm-space-2)] flex gap-[var(--tm-space-2)]">
                            <select aria-label="选择班级" value={classMatchSelections[issue.id] ?? ''} onChange={event => setClassMatchSelections(current => ({ ...current, [issue.id]: event.target.value }))} className="h-[var(--tm-size-touch)] min-w-0 flex-1 rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)]">
                              <option value="">选择班级</option>
                              {currentRosters.map(roster => <option key={roster.id} value={roster.id}>{getRosterClassLabel(roster)}</option>)}
                            </select>
                            <button type="button" disabled={!classMatchSelections[issue.id]} onClick={() => matchDraftToRoster(issue.id, classMatchSelections[issue.id])} className="h-[var(--tm-size-touch)] shrink-0 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] disabled:bg-[var(--tm-bg-disabled)]">匹配</button>
                          </div>
                        )}
                        {issue.type === 'student_mismatch' && assignment && issue.studentId && (
                          <div className="mt-[var(--tm-space-2)] flex gap-[var(--tm-space-2)]">
                            <select aria-label="选择学生" value={studentMatchSelections[issue.id] ?? ''} onChange={event => setStudentMatchSelections(current => ({ ...current, [issue.id]: event.target.value }))} className="h-[var(--tm-size-touch)] min-w-0 flex-1 rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)]">
                              <option value="">选择学生</option>
                              {classStudents.map(student => <option key={student.studentId} value={student.studentId}>{student.studentNo} {student.name}</option>)}
                            </select>
                            <button type="button" disabled={!studentMatchSelections[issue.id]} onClick={() => matchDraftStudent(issue.id, assignment.id, issue.studentId!, studentMatchSelections[issue.id])} className="h-[var(--tm-size-touch)] shrink-0 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] disabled:bg-[var(--tm-bg-disabled)]">匹配</button>
                          </div>
                        )}
                        {issue.type === 'missing_metadata' && <button type="button" onClick={() => setActiveAssignmentDetailId(issue.assignmentId ?? null)} className="mt-[var(--tm-space-2)] min-h-[var(--tm-size-touch)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">进入补全</button>}
                        {issue.type !== 'low_confidence' && issue.type !== 'class_mismatch' && issue.type !== 'student_mismatch' && issue.type !== 'missing_metadata' && <button type="button" onClick={() => resolveIssue(issue.id, issue.type === 'conflict' ? issue.assignmentId : undefined)} className="mt-[var(--tm-space-2)] min-h-[var(--tm-size-touch)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">{issue.type === 'conflict' ? '保留原记录' : '确认继续使用'}</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {(reviewMode === 'all' || !reviewTabsVisible) && (
            <>
              <section className="mt-[var(--tm-space-3)] grid grid-cols-2 gap-[var(--tm-space-2)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card)]">
                <label className="block min-w-0">
                  <span className="mb-[var(--tm-space-1)] block text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">班级</span>
                  <select aria-label="修改班级" value={currentRosters.find(roster => roster.classId === activeDraft.assignments[0]?.classId)?.id ?? ''} onChange={event => requestDraftRosterChange(event.target.value)} className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)]">
                    <option value="">选择班级</option>
                    {currentRosters.map(roster => <option key={roster.id} value={roster.id}>{getRosterClassLabel(roster)}</option>)}
                  </select>
                </label>
                <label className="block min-w-0">
                  <span className="mb-[var(--tm-space-1)] block text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">学科</span>
                  <input aria-label="修改学科" value={activeDraft.subject} onChange={event => updateDraftSubject(activeDraft.id, event.target.value)} placeholder="学科" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)]" />
                </label>
              </section>
              <section className="mt-[var(--tm-space-3)] space-y-[var(--tm-space-3)]" aria-label="完整识别结果">
                {activeDraft.assignments.filter(assignment => !skippedAssignmentIds.has(assignment.id)).map(assignment => (
                  <button key={assignment.id} type="button" onClick={() => setActiveAssignmentDetailId(assignment.id)} className="flex min-h-[72px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] text-left [box-shadow:var(--tm-shadow-card)]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><FileText className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1"><strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{assignment.title || '待补充作业主题'}</strong><span className="mt-1 block text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{assignment.date || '待补充日期'} · {assignment.results.length}人</span></span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
                  </button>
                ))}
              </section>
            </>
          )}
        </main>
        <MobileBottomSheet
          open={Boolean(pendingRosterId)}
          title="确认更换班级"
          onClose={() => setPendingRosterId(null)}
          footer={(
            <div className="grid grid-cols-2 gap-[var(--tm-space-2)]">
              <button type="button" onClick={() => setPendingRosterId(null)} className="h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)]">取消</button>
              <button type="button" onClick={() => pendingRosterId && selectDraftRoster(activeDraft.id, pendingRosterId)} className="h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)]">重新匹配</button>
            </div>
          )}
        >
          <p className="pb-[var(--tm-space-2)] text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]">更换为{currentRosters.find(roster => roster.id === pendingRosterId) ? getRosterClassLabel(currentRosters.find(roster => roster.id === pendingRosterId)!) : '新班级'}后，将按该班级学生名单重新匹配所有学生。</p>
        </MobileBottomSheet>
        <MobileToast message={toast} />
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      {renderHeader('作业录入', onBack)}
      <main className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[calc(96px+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)] no-scrollbar">
        <div className="mb-[var(--tm-space-2)] flex justify-end">
          <button type="button" onClick={() => setTemplateSheetOpen(true)} className="flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
            <FileText className="h-4 w-4" />
            下载导入模版
          </button>
        </div>
        <div className="space-y-[var(--tm-space-3)]">
          {drafts.map(draft => {
            const issueCount = draft.issues.filter(issue => !issue.resolved).length;
            return (
              <article key={draft.id} className="flex min-h-[88px] w-full items-center overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
                <button type="button" onClick={() => openDraft(draft)} className="flex min-w-0 flex-1 items-center gap-[var(--tm-space-3)] p-[var(--tm-space-3)] pr-[var(--tm-space-1)] text-left" aria-label={`查看${getDraftClassLabel(draft) || '待匹配班级'}${draft.subject || '待补充学科'}识别结果`}>
                  <span className="flex h-[68px] w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)]">
                    {draft.previewUrl ? <img src={draft.previewUrl} alt="" className="h-full w-full object-cover" /> : <FileImage className="h-6 w-6 text-[var(--tm-text-tertiary)]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{getDraftClassLabel(draft) || '待匹配班级'} · {draft.subject || '待补充学科'}</strong>
                    <span className="mt-1 block text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{draft.assignments.length}次作业</span>
                    <span className={`mt-1 block text-[length:var(--tm-font-size-compact)] font-semibold ${issueCount > 0 ? 'text-[var(--tm-status-negative)]' : 'text-[var(--tm-status-positive-strong)]'}`}>{issueCount > 0 ? `${issueCount}项待核对` : '已录入'}</span>
                  </span>
                </button>
                <button type="button" onClick={() => setActionDraftId(draft.id)} className="mr-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-text-tertiary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label={`${getDraftClassLabel(draft) || '当前'}识别任务更多操作`} title="更多操作"><MoreHorizontal className="h-5 w-5" /></button>
              </article>
            );
          })}
          {drafts.length === 0 && (
            <MobileEmptyState
              imageSrc={ASSETS.DEFAULT_STATE.WORRIED_CLIPBOARD}
              title="还没有识别任务"
              className="min-h-[300px] py-4"
            />
          )}
        </div>
      </main>
      <button type="button" onClick={() => setUploadSheetOpen(true)} className="absolute bottom-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] right-[var(--tm-space-4)] flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-card-raised)] active:scale-95"><FileImage className="h-5 w-5" />识别作业表</button>
      <MobileBottomSheet open={uploadSheetOpen} title="识别作业表" onClose={() => setUploadSheetOpen(false)} contentTone="plain">
        <div className="space-y-[var(--tm-space-2)] pt-[var(--tm-space-3)]">
          <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex min-h-[60px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] text-left [box-shadow:var(--tm-shadow-card-on-white)]"><span className="flex h-10 w-10 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><Camera className="h-5 w-5" /></span><strong className="text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">拍照</strong></button>
          <button type="button" onClick={() => galleryInputRef.current?.click()} className="flex min-h-[60px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] text-left [box-shadow:var(--tm-shadow-card-on-white)]"><span className="flex h-10 w-10 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><Image className="h-5 w-5" /></span><strong className="text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">从相册选择</strong></button>
        </div>
      </MobileBottomSheet>
      <MobileBottomSheet
        open={templateSheetOpen}
        title={templatePreviewPageSize ? `${templatePreviewPageSize} 模版预览` : '下载导入模版'}
        onClose={closeTemplateSheet}
        size={templatePreviewPageSize ? 'tall' : 'content'}
        contentInset={templatePreviewPageSize ? 'none' : 'standard'}
        contentTone="plain"
        header={templatePreviewPageSize ? (
          <header className="relative flex h-14 shrink-0 items-center justify-between px-[var(--tm-space-2)]">
            <button type="button" onClick={() => setTemplatePreviewPageSize(null)} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]" aria-label="返回模板列表"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-2))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">{templatePreviewPageSize} 模版预览</h2>
            <button type="button" onClick={closeTemplateSheet} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]" aria-label="关闭下载导入模版"><X className="h-5 w-5" /></button>
          </header>
        ) : undefined}
        footer={templatePreviewPageSize ? (
          <button type="button" onClick={() => downloadPrintTemplate(templatePreviewPageSize)} className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] transition-[transform,background-color] [transition-duration:var(--tm-duration-fast)] active:scale-[0.98] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2">
            <Printer className="h-5 w-5" aria-hidden="true" />下载 {templatePreviewPageSize} 模版
          </button>
        ) : undefined}
        footerDivider={false}
      >
        {templatePreviewPageSize ? (
          <div className="relative h-full min-h-[420px] overflow-hidden bg-[var(--tm-page-plain-content-bg)]">
            <button type="button" onClick={() => setTemplatePreviewZoomed(value => !value)} className="absolute right-[var(--tm-space-3)] top-[var(--tm-space-3)] z-10 flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full bg-[var(--tm-bg-surface-glass)] text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]" aria-label={templatePreviewZoomed ? '适应屏幕' : '放大模板'} title={templatePreviewZoomed ? '适应屏幕' : '放大模板'}>
              {templatePreviewZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
            </button>
            <div className={`flex h-full min-h-[420px] overflow-auto p-[var(--tm-space-3)] ${templatePreviewZoomed ? 'items-start justify-start' : 'items-center justify-center'}`}>
              <img src={templatePreviewUrls?.[templatePreviewPageSize]} alt={`${templatePreviewPageSize}作业导入模版预览`} className={`block h-auto bg-white [box-shadow:var(--tm-shadow-card)] ${templatePreviewZoomed ? 'w-[720px] max-w-none' : 'w-full max-w-full'}`} />
            </div>
          </div>
        ) : (
          <div className="space-y-[var(--tm-space-3)] pt-[var(--tm-space-3)]">
            {templatePageSizes.map(pageSize => (
              <article key={pageSize} className="flex min-h-[124px] items-stretch gap-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-3)] [box-shadow:var(--tm-shadow-card-on-white)]">
                <button type="button" onClick={() => previewTemplate(pageSize)} className="relative w-[128px] shrink-0 overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]" style={{ aspectRatio: '3508 / 2480' }} aria-label={`预览${pageSize}模板`}>
                  <img src={templatePreviewUrls?.[pageSize]} alt="" className="h-full w-full object-contain" aria-hidden="true" />
                  <span className="absolute bottom-[var(--tm-space-1)] right-[var(--tm-space-1)] flex h-6 items-center gap-1 rounded-[var(--tm-radius-badge)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)]"><Maximize2 className="h-3 w-3" aria-hidden="true" />预览</span>
                </button>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{pageSize} 横向</h3>
                    <p className="mt-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{HOMEWORK_TEMPLATE_CAPACITY[pageSize]}人 · {templateSequenceRange[pageSize]}</p>
                  </div>
                  <button type="button" onClick={() => downloadPrintTemplate(pageSize)} className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] transition-[transform,background-color] [transition-duration:var(--tm-duration-fast)] active:scale-[0.98] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2"><Printer className="h-4 w-4" aria-hidden="true" />下载 {pageSize} 模版</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </MobileBottomSheet>
      <MobileBottomSheet open={Boolean(actionDraft)} title="识别任务操作" onClose={() => setActionDraftId(null)} contentTone="plain">
        <div className="pt-[var(--tm-space-3)]">
          <button type="button" onClick={() => { if (actionDraft) setDeleteDraftId(actionDraft.id); setActionDraftId(null); }} className="flex min-h-[60px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] text-left text-[var(--tm-status-negative)] [box-shadow:var(--tm-shadow-card-on-white)] active:bg-[var(--tm-status-negative-soft)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative-soft)]"><Trash2 className="h-5 w-5" /></span>
            <strong className="text-[length:var(--tm-font-size-body)]">删除识别任务</strong>
          </button>
        </div>
      </MobileBottomSheet>
      <MobileConfirmSheet
        open={Boolean(deleteDraft)}
        title="删除识别任务"
        description={`删除后，将同时撤销${deleteDraft ? getDraftClassLabel(deleteDraft) || '该班级' : '该班级'}本次识别产生的${deleteDraft?.assignments.length ?? 0}次作业。`}
        confirmLabel="删除"
        tone="danger"
        onConfirm={confirmDeleteTask}
        onClose={() => setDeleteDraftId(null)}
      />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={event => stageFiles(event.target.files, 'camera')} />
      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={event => stageFiles(event.target.files, 'gallery')} />
      <MobileToast message={toast} />
    </div>
  );
};

export default HomeworkBatchImportView;
