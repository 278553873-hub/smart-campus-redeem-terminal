import React, { useEffect, useState } from 'react';
import {
  Activity,
  BookOpenCheck,
  CalendarRange,
  ChevronRight,
  CircleAlert,
  FilePenLine,
  History,
  LockKeyhole,
  UserRound,
} from 'lucide-react';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import {
  appendArchiveViewAudit,
  ARCHIVE_GROWTH_FIELD_GROUPS,
  buildArchiveGrowthModuleSnapshots,
  createStudentArchiveDraft,
  formatArchiveAnswer,
  getArchiveAnswerValidationError,
  getArchiveSystemFieldLabel,
  getArchiveSystemValues,
  getEnabledTemplatesForGrade,
  getStudentArchiveReadiness,
  isArchiveAnswerFilled,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  resolveArchiveDataRange,
  saveStudentArchiveDraft,
  type ArchiveAnswer,
  type ArchiveDraft,
  type ArchiveGrowthFieldKey,
  type ArchiveGrowthModuleSnapshot,
  type ArchiveSnapshot,
  type ArchiveSystemFieldKey,
  type ArchiveWorkspace,
} from '../../../shared/studentArchiveStore';
import {
  BottomAction,
  BottomSheet,
  inputClass,
  pageBackground,
  PageHeader,
  primaryButton,
  secondaryButton,
  sectionSurface,
  StatusPill,
  Toast,
} from './archivePagePrimitives';
import ArchiveFormRenderer from './ArchiveFormRenderer';

interface StudentArchiveViewProps {
  onBack: () => void;
  student: Student;
  classInfo: ClassInfo;
  teacherProfile: TeacherProfile;
  spaceId: string;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  onUpdateStudent: (student: Student) => void;
  onUpdateArchive: (templateId: string) => void;
}

type PageMode = 'root' | 'fill' | 'detail';

const StudentArchiveView: React.FC<StudentArchiveViewProps> = ({
  onBack,
  student,
  classInfo,
  teacherProfile,
  spaceId,
  classes,
  getStudentsForClass,
  onUpdateStudent,
  onUpdateArchive,
}) => {
  const readWorkspace = () => readArchiveWorkspace({
    spaceId,
    teacherName: teacherProfile.name,
    classes,
    homeroomClassIds: teacherProfile.homeroomClassIds,
    getStudentsForClass,
  });
  const [workspace, setWorkspace] = useState<ArchiveWorkspace>(readWorkspace);
  const [pageMode, setPageMode] = useState<PageMode>('root');
  const [activeDraftId, setActiveDraftId] = useState('');
  const [transientDraft, setTransientDraft] = useState<ArchiveDraft | null>(null);
  const [activeSnapshotId, setActiveSnapshotId] = useState('');
  const [answers, setAnswers] = useState<Record<string, ArchiveAnswer>>({});
  const [editingSystemField, setEditingSystemField] = useState<ArchiveSystemFieldKey | null>(null);
  const [systemFieldDraft, setSystemFieldDraft] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    setWorkspace(readWorkspace());
    setTransientDraft(null);
    setActiveDraftId('');
    setPageMode('root');
  }, [spaceId, student.id]);

  const updateWorkspace = (next: ArchiveWorkspace, message?: string) => {
    setWorkspace(next);
    persistArchiveWorkspace(next);
    if (message) {
      setToast(message);
      window.setTimeout(() => setToast(''), 1800);
    }
  };

  const drafts = workspace.drafts
    .filter(item => item.studentId === student.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const snapshots = workspace.snapshots
    .filter(item => item.studentId === student.id && item.status === 'archived')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const enabledTemplates = getEnabledTemplatesForGrade(workspace, student.grade);
  const enabledTemplateIds = new Set(enabledTemplates.map(template => template.id));
  const preservedDrafts = drafts.filter(draft => !enabledTemplateIds.has(draft.templateId));
  const activeDraft = transientDraft?.id === activeDraftId
    ? transientDraft
    : workspace.drafts.find(item => item.id === activeDraftId);
  const activeTemplate = activeDraft?.templateSnapshot;
  const activeSnapshot = workspace.snapshots.find(item => item.id === activeSnapshotId);
  const currentSystemValues = getArchiveSystemValues(student);
  const activeDataRange = activeTemplate ? resolveArchiveDataRange(activeTemplate) : null;
  const currentGrowthSnapshots = activeTemplate
    ? buildArchiveGrowthModuleSnapshots(student.id, activeTemplate.growthFields, activeDataRange ?? undefined)
    : [];

  const openDraft = (draft: ArchiveDraft) => {
    setTransientDraft(null);
    setActiveDraftId(draft.id);
    setAnswers({ ...draft.answers });
    setPageMode('fill');
  };

  const openLiveArchive = (templateId: string) => {
    const template = enabledTemplates.find(item => item.id === templateId);
    if (!template) return;
    const result = createStudentArchiveDraft(workspace, template.id, student, classInfo, teacherProfile.name);
    if (!result.draftId) return;
    const draft = result.workspace.drafts.find(item => item.id === result.draftId);
    if (!draft) return;
    const persistedDraft = workspace.drafts.find(item => item.id === draft.id);
    if (persistedDraft) {
      openDraft(persistedDraft);
      return;
    }
    setTransientDraft(draft);
    setActiveDraftId(draft.id);
    setAnswers({ ...draft.answers });
    setPageMode('fill');
  };

  const saveDraft = (submit: boolean) => {
    if (!activeDraft || !activeTemplate) return;
    const missingSystemField = activeTemplate.systemFields.find(key => !currentSystemValues[key]?.trim());
    if (submit && missingSystemField) {
      setToast(`请先补充“${getArchiveSystemFieldLabel(missingSystemField)}”`);
      window.setTimeout(() => setToast(''), 1800);
      return;
    }
    const missingGrowthField = activeTemplate.growthFields.find(field => (
      field.required && !currentGrowthSnapshots.some(snapshot => (
        snapshot.status === 'available' && snapshot.items.some(item => item.key === field.key && item.value.trim())
      ))
    ));
    if (submit && missingGrowthField) {
      const fieldLabel = ARCHIVE_GROWTH_FIELD_GROUPS.flatMap(group => group.fields).find(field => field.key === missingGrowthField.key)?.label;
      setToast(`请先补充“${fieldLabel ?? '成长数据'}”`);
      window.setTimeout(() => setToast(''), 1800);
      return;
    }
    const validationError = activeTemplate.fields.map(field => getArchiveAnswerValidationError(field, answers[field.semanticKey])).find(Boolean);
    if (submit && validationError) {
      setToast(validationError);
      window.setTimeout(() => setToast(''), 1800);
      return;
    }
    const systemValues = Object.fromEntries(
      activeTemplate.systemFields.map(key => [key, currentSystemValues[key] ?? '']),
    ) as Partial<Record<ArchiveSystemFieldKey, string>>;
    const workingWorkspace = transientDraft?.id === activeDraft.id
      ? { ...workspace, drafts: [transientDraft, ...workspace.drafts] }
      : workspace;
    const next = saveStudentArchiveDraft(workingWorkspace, activeDraft.id, answers, submit, teacherProfile.name, systemValues, currentGrowthSnapshots);
    setTransientDraft(null);
    updateWorkspace(next, submit ? '已完成并留档' : '草稿已保存');
    setPageMode('root');
  };

  const closeFill = () => {
    if (transientDraft?.id === activeDraftId) setTransientDraft(null);
    setActiveDraftId('');
    setPageMode('root');
  };

  const openSnapshot = (snapshot: ArchiveSnapshot) => {
    setActiveSnapshotId(snapshot.id);
    updateWorkspace(appendArchiveViewAudit(workspace, student.id, teacherProfile.name));
    setPageMode('detail');
  };

  const openSystemFieldEditor = (key: ArchiveSystemFieldKey) => {
    if (key !== 'birthDate' && key !== 'studentNo') return;
    setEditingSystemField(key);
    setSystemFieldDraft(currentSystemValues[key] ?? '');
  };

  const saveSystemField = () => {
    if (!editingSystemField || !systemFieldDraft.trim()) return;
    onUpdateStudent({
      ...student,
      [editingSystemField]: systemFieldDraft.trim(),
    });
    setEditingSystemField(null);
    setToast('已保存并带入');
    window.setTimeout(() => setToast(''), 1800);
  };

  const renderSystemFields = (keys: ArchiveSystemFieldKey[], values: Partial<Record<ArchiveSystemFieldKey, string>>, includeTeacher = false) => (
    <section className={`${sectionSurface} divide-y divide-[var(--tm-border-subtle)] px-4`}>
      {keys.map(key => {
        const value = values[key]?.trim();
        const canCompleteHere = key === 'birthDate' || key === 'studentNo';
        return (
          <div key={key} className="flex min-h-[48px] items-center justify-between gap-4 py-2">
            <span className="shrink-0 text-[12px] font-semibold text-[var(--tm-text-tertiary)]">{getArchiveSystemFieldLabel(key)}</span>
            {value ? (
              <span className="text-right text-[13px] font-semibold text-[var(--tm-text-primary)]">{value}</span>
            ) : canCompleteHere ? (
              <button type="button" onClick={() => openSystemFieldEditor(key)} className="flex min-h-10 items-center gap-1 text-[13px] font-semibold text-[var(--tm-brand-primary)]">
                待补充 <span className="text-[var(--tm-text-disabled)]">·</span> 补充 <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <span className="text-[13px] font-semibold text-rose-500">待补充</span>
            )}
          </div>
        );
      })}
      {includeTeacher && (
        <div className="flex min-h-[48px] items-center justify-between gap-4 py-2">
          <span className="shrink-0 text-[12px] font-semibold text-[var(--tm-text-tertiary)]">建档教师</span>
          <span className="text-right text-[13px] font-semibold text-[var(--tm-text-primary)]">{teacherProfile.name}</span>
        </div>
      )}
    </section>
  );

  const renderGrowthSnapshots = (values: ArchiveGrowthModuleSnapshot[], requiredFieldKeys: Set<ArchiveGrowthFieldKey>) => {
    if (values.length === 0) return null;
    return (
      <section className="space-y-2.5">
        {values.map(value => (
          <article key={value.key} className={`${sectionSurface} overflow-hidden`}>
            <div className="flex min-h-[58px] items-center gap-3 px-4 py-2">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ${value.status === 'available' ? 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-tertiary)]'}`}>
                {value.status === 'available' ? <Activity className="h-4.5 w-4.5" /> : <CircleAlert className="h-4.5 w-4.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-[var(--tm-text-primary)]">{value.label}</span>
                <span className="mt-0.5 block text-[11px] font-medium text-[var(--tm-text-tertiary)]">{value.items.filter(item => item.value).length}/{value.items.length}项已带入</span>
              </span>
              {value.status === 'missing' ? (
                <StatusPill className="bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">待补充</StatusPill>
              ) : null}
            </div>
            {value.items.length > 0 && (
              <div className="divide-y divide-[var(--tm-border-subtle)] border-t border-[var(--tm-border-subtle)] px-4">
                {value.items.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex min-h-[52px] items-start justify-between gap-4 py-2.5">
                    <span className="shrink-0 pt-0.5 text-[11px] font-semibold text-[var(--tm-text-tertiary)]">{item.label}</span>
                    <span className="min-w-0 text-right">
                      <span className="flex items-center justify-end gap-2">
                        <span className={`text-[13px] font-semibold leading-5 ${item.value ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-brand-reward-strong)]'}`}>{item.value || '待补充'}</span>
                        {item.key && requiredFieldKeys.has(item.key) && <StatusPill className="shrink-0 bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">必需</StatusPill>}
                      </span>
                      {item.value && item.recordedAt && <span className="mt-0.5 block text-[11px] font-medium text-[var(--tm-text-tertiary)]">{item.recordedAt} · {item.sourceLabel}</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    );
  };

  const renderRoot = () => (
    <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
      <PageHeader title="学生成长档案" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">当前档案</h2>
            <span className="text-[12px] font-semibold text-[var(--tm-text-tertiary)]">{enabledTemplates.length}份</span>
          </div>
          <div className="space-y-2.5">
            {enabledTemplates.map(template => {
              const draft = drafts.find(item => item.templateId === template.id);
              const readiness = getStudentArchiveReadiness(workspace, template, student);
              const statusMeta = draft
                ? { label: '草稿', className: 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]' }
                : readiness.status === 'ready'
                  ? { label: '可留档', className: 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' }
                  : readiness.status === 'archived'
                    ? { label: '已留档', className: 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]' }
                    : { label: '待补充', className: 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]' };
              return (
              <button key={template.id} type="button" onClick={() => openLiveArchive(template.id)} className={`${sectionSurface} flex min-h-[82px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ${draft ? 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]' : 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]'}`}>
                  {draft ? <FilePenLine className="h-4.5 w-4.5" /> : <BookOpenCheck className="h-4.5 w-4.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{template.name}</span>
                  <span className="mt-1 block truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{draft ? `草稿更新于 ${draft.updatedAt}` : resolveArchiveDataRange(template).label}</span>
                </span>
                <StatusPill className={statusMeta.className}>{statusMeta.label}</StatusPill>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
              </button>
              );
            })}
            {enabledTemplates.length === 0 && <div className={`${sectionSurface} px-4 py-8 text-center text-[14px] font-medium text-[var(--tm-text-secondary)]`}>当前年级暂无可用档案</div>}
          </div>
        </section>

        {preservedDrafts.length > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">待继续</h2>
              <span className="text-[12px] font-semibold text-[var(--tm-text-tertiary)]">{preservedDrafts.length}份</span>
            </div>
            <div className="space-y-2.5">
              {preservedDrafts.map(draft => (
                <button key={draft.id} type="button" onClick={() => openDraft(draft)} className={`${sectionSurface} flex min-h-[78px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]"><FilePenLine className="h-4.5 w-4.5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{draft.templateName}</span>
                    <span className="mt-1 block text-[11px] font-medium text-[var(--tm-text-tertiary)]">更新于 {draft.updatedAt}</span>
                  </span>
                  <StatusPill className="bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">草稿</StatusPill>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
                </button>
              ))}
            </div>
          </section>
        )}

        {snapshots.length > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">留档记录</h2>
              <span className="text-[12px] font-semibold text-[var(--tm-text-tertiary)]">{snapshots.length}份</span>
            </div>
            <div className="space-y-2.5">
              {snapshots.map(snapshot => (
                <button key={snapshot.id} type="button" onClick={() => openSnapshot(snapshot)} className={`${sectionSurface} flex min-h-[78px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]"><History className="h-4.5 w-4.5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{snapshot.templateName}</span>
                    <span className="mt-1 block truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{snapshot.period} · {snapshot.createdAt}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderFill = () => {
    if (!activeDraft || !activeTemplate) return renderRoot();
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader
          title={activeTemplate.name}
          onBack={closeFill}
          action={<button type="button" onClick={() => onUpdateArchive(activeDraft.templateId)} className="flex h-11 items-center px-2 text-[13px] font-semibold text-[var(--tm-brand-primary-strong)] active:text-[var(--tm-brand-primary-pressed)]">更新档案</button>}
        />
        <div className="flex-1 overflow-y-auto px-5 pb-36 pt-4 no-scrollbar">
          {activeDataRange && (
            <section className={`${sectionSurface} mb-4 flex min-h-[52px] items-center gap-3 px-4`}>
              <CalendarRange className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-tertiary)]" />
              <span className="min-w-0 flex-1 text-[12px] font-semibold text-[var(--tm-text-secondary)]">数据范围</span>
              <span className="text-right text-[13px] font-semibold text-[var(--tm-text-primary)]">{activeDataRange.label}</span>
            </section>
          )}
          {renderSystemFields(activeTemplate.systemFields, currentSystemValues, true)}

          {activeTemplate.growthFields.length > 0 && (
            <div className="mt-5">
              <h2 className="mb-3 px-1 text-[15px] font-bold text-[var(--tm-text-primary)]">成长数据</h2>
              {renderGrowthSnapshots(currentGrowthSnapshots, new Set(activeTemplate.growthFields.filter(field => field.required).map(field => field.key)))}
            </div>
          )}

          {activeTemplate.fields.length > 0 && (
            <div className="mt-5">
              <h2 className="mb-3 px-1 text-[15px] font-bold text-[var(--tm-text-primary)]">老师填写内容</h2>
              <ArchiveFormRenderer definition={activeTemplate} answers={answers} onAnswersChange={setAnswers} />
            </div>
          )}
        </div>
        <BottomAction>
          <div className="grid grid-cols-[0.82fr_1.18fr] gap-3">
            <button type="button" onClick={() => saveDraft(false)} className={secondaryButton}>保存草稿</button>
            <button type="button" onClick={() => saveDraft(true)} className={primaryButton}><LockKeyhole className="h-4.5 w-4.5" />完成并留档</button>
          </div>
        </BottomAction>
      </div>
    );
  };

  const renderDetail = () => {
    if (!activeSnapshot) return renderRoot();
    const template = activeSnapshot.templateSnapshot;
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title="档案详情" onBack={() => setPageMode('root')} />
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
          <section className={`${sectionSurface} p-4`}>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]"><History className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">{activeSnapshot.templateName}</h2>
                <p className="mt-1.5 text-[12px] font-medium text-[var(--tm-text-secondary)]">{activeSnapshot.period}</p>
                <p className="mt-1 text-[12px] font-medium text-[var(--tm-text-secondary)]">{activeSnapshot.createdBy} · {activeSnapshot.createdAt}</p>
              </div>
            </div>
          </section>

          <section className="mt-4 space-y-3">
            {activeSnapshot.templateSnapshot.systemFields.length > 0 && (
              <article className={`${sectionSurface} p-4`}>
                <div className="mb-3 flex items-center gap-2">
                  <UserRound className="h-4.5 w-4.5 text-[var(--tm-text-tertiary)]" />
                  <h3 className="text-[15px] font-bold text-[var(--tm-text-primary)]">学生信息</h3>
                </div>
                <div className="divide-y divide-[var(--tm-border-subtle)]">
                  {activeSnapshot.templateSnapshot.systemFields.map(key => (
                    <div key={key} className="flex min-h-[44px] items-center justify-between gap-4 py-2">
                      <span className="text-[12px] font-semibold text-[var(--tm-text-tertiary)]">{getArchiveSystemFieldLabel(key)}</span>
                      <span className="text-right text-[13px] font-semibold text-[var(--tm-text-primary)]">{activeSnapshot.systemValues[key] || '未填写'}</span>
                    </div>
                  ))}
                </div>
              </article>
            )}
            {activeSnapshot.growthSnapshots.length > 0 && renderGrowthSnapshots(
              activeSnapshot.growthSnapshots,
              new Set(activeSnapshot.templateSnapshot.growthFields.filter(field => field.required).map(field => field.key)),
            )}
            {template && template.fields.length === 0 ? null : template?.layoutMode === 'flat' ? (
              <article className={`${sectionSurface} p-4`}>
                <div className="divide-y divide-[var(--tm-border-subtle)]">
                  {template.fields.filter(field => isArchiveAnswerFilled(activeSnapshot.answers[field.semanticKey])).map(field => (
                    <div key={field.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="text-[11px] font-semibold text-[var(--tm-text-tertiary)]">{field.label}</div>
                      <div className="mt-1 text-[13px] font-medium leading-relaxed text-[var(--tm-text-primary)]">{formatArchiveAnswer(activeSnapshot.answers[field.semanticKey])}</div>
                    </div>
                  ))}
                </div>
              </article>
            ) : template ? template.sections.map(section => {
              const fields = template.fields.filter(field => field.sectionId === section.id && isArchiveAnswerFilled(activeSnapshot.answers[field.semanticKey]));
              if (fields.length === 0) return null;
              return (
                <article key={section.id} className={`${sectionSurface} p-4`}>
                  <h3 className="text-[15px] font-bold text-[var(--tm-text-primary)]">{section.label}</h3>
                  <div className="mt-3 divide-y divide-[var(--tm-border-subtle)]">
                    {fields.map(field => (
                      <div key={field.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="text-[11px] font-semibold text-[var(--tm-text-tertiary)]">{field.label}</div>
                        <div className="mt-1 text-[13px] font-medium leading-relaxed text-[var(--tm-text-primary)]">{formatArchiveAnswer(activeSnapshot.answers[field.semanticKey])}</div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            }) : Object.entries(activeSnapshot.answers).map(([key, value]) => (
              <article key={key} className={`${sectionSurface} p-4`}>
                <div className="text-[11px] font-semibold text-[var(--tm-text-tertiary)]">{key}</div>
                <div className="mt-1 text-[13px] font-medium leading-relaxed text-[var(--tm-text-primary)]">{formatArchiveAnswer(value)}</div>
              </article>
            ))}
          </section>
        </div>
      </div>
    );
  };

  let content: React.ReactNode;
  if (pageMode === 'fill') content = renderFill();
  else if (pageMode === 'detail') content = renderDetail();
  else content = renderRoot();

  return (
    <div className="relative h-full min-h-0 overflow-hidden font-sans text-[var(--tm-text-primary)]">
      {content}
      <BottomSheet open={editingSystemField !== null} label="补充学生信息" onDismiss={() => setEditingSystemField(null)}>
        <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">
          补充{editingSystemField ? getArchiveSystemFieldLabel(editingSystemField) : ''}
        </h2>
        <label className="mt-5 block">
          <span className="text-[12px] font-semibold text-[var(--tm-text-secondary)]">{editingSystemField ? getArchiveSystemFieldLabel(editingSystemField) : ''}</span>
          <input
            type={editingSystemField === 'birthDate' ? 'date' : 'text'}
            inputMode={editingSystemField === 'studentNo' ? 'numeric' : undefined}
            value={systemFieldDraft}
            onInput={event => setSystemFieldDraft(event.currentTarget.value)}
            className={`${inputClass} mt-2 h-12`}
            autoFocus
          />
        </label>
        <button type="button" disabled={!systemFieldDraft.trim()} onClick={saveSystemField} className={`${primaryButton} mt-5 w-full`}>保存并带入</button>
      </BottomSheet>
      <Toast message={toast} />
    </div>
  );
};

export default StudentArchiveView;
