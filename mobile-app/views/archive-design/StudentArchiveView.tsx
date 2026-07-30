import React, { useEffect, useState } from 'react';
import {
  Activity,
  BookOpenCheck,
  ChevronRight,
  CircleAlert,
  FilePenLine,
  History,
  LockKeyhole,
  Plus,
  UserRound,
} from 'lucide-react';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import {
  appendArchiveViewAudit,
  buildArchiveGrowthModuleSnapshots,
  createStudentArchiveDraft,
  formatArchiveAnswer,
  getArchiveAnswerValidationError,
  getArchiveSystemFieldLabel,
  getArchiveSystemValues,
  getEnabledTemplatesForGrade,
  isArchiveAnswerFilled,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  saveStudentArchiveDraft,
  type ArchiveAnswer,
  type ArchiveDraft,
  type ArchiveGrowthModuleSnapshot,
  type ArchiveSnapshot,
  type ArchiveSystemFieldKey,
  type ArchiveTemplate,
  type ArchiveWorkspace,
} from '../../../shared/studentArchiveStore';
import {
  BottomAction,
  BottomSheet,
  iconButton,
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
}

type PageMode = 'root' | 'template-select' | 'fill' | 'detail';

const StudentArchiveView: React.FC<StudentArchiveViewProps> = ({
  onBack,
  student,
  classInfo,
  teacherProfile,
  spaceId,
  classes,
  getStudentsForClass,
  onUpdateStudent,
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
  const activeDraft = transientDraft?.id === activeDraftId
    ? transientDraft
    : workspace.drafts.find(item => item.id === activeDraftId);
  const activeTemplate = activeDraft?.templateSnapshot;
  const activeSnapshot = workspace.snapshots.find(item => item.id === activeSnapshotId);
  const currentSystemValues = getArchiveSystemValues(student);
  const currentGrowthSnapshots = activeTemplate
    ? buildArchiveGrowthModuleSnapshots(student.id, activeTemplate.growthModules)
    : [];

  const openDraft = (draft: ArchiveDraft) => {
    setTransientDraft(null);
    setActiveDraftId(draft.id);
    setAnswers({ ...draft.answers });
    setPageMode('fill');
  };

  const selectTemplate = (template: ArchiveTemplate) => {
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
    setAnswers({});
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
    const missingGrowthModule = activeTemplate.growthModules.find(module => (
      module.required && currentGrowthSnapshots.find(snapshot => snapshot.key === module.key)?.status !== 'available'
    ));
    if (submit && missingGrowthModule) {
      const snapshot = currentGrowthSnapshots.find(item => item.key === missingGrowthModule.key);
      setToast(`请先补充“${snapshot?.label ?? '成长记录'}”`);
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
    updateWorkspace(next, submit ? '已确认成档' : '草稿已保存');
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

  const renderGrowthSnapshots = (values: ArchiveGrowthModuleSnapshot[], requiredKeys: Set<string>) => {
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
                {value.status === 'available' && <span className="mt-0.5 block truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{value.occurredAt} · {value.sourceLabel}</span>}
              </span>
              {value.status === 'missing' ? (
                <StatusPill className="bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">待补充</StatusPill>
              ) : requiredKeys.has(value.key) ? (
                <StatusPill className="bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]">成档必需</StatusPill>
              ) : null}
            </div>
            {value.status === 'available' && value.items.length > 0 && (
              <div className="divide-y divide-[var(--tm-border-subtle)] border-t border-[var(--tm-border-subtle)] px-4">
                {value.items.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex min-h-[44px] items-start justify-between gap-4 py-2.5">
                    <span className="shrink-0 text-[11px] font-semibold text-[var(--tm-text-tertiary)]">{item.label}</span>
                    <span className="text-right text-[13px] font-medium leading-5 text-[var(--tm-text-primary)]">{item.value}</span>
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
      <PageHeader
        title="学生成长档案"
        onBack={onBack}
        action={(
          <button
            type="button"
            onClick={() => setPageMode('template-select')}
            className={iconButton}
            aria-label="新建档案"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      />
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
        {drafts.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">待继续</h2>
              <span className="text-[12px] font-semibold text-[var(--tm-text-tertiary)]">{drafts.length}份</span>
            </div>
            <div className="space-y-2.5">
              {drafts.map(draft => (
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

        <section className={drafts.length > 0 ? 'mt-6' : ''}>
          <div className="space-y-2.5">
            {snapshots.map(snapshot => (
              <button key={snapshot.id} type="button" onClick={() => openSnapshot(snapshot)} className={`${sectionSurface} flex min-h-[78px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]"><BookOpenCheck className="h-4.5 w-4.5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{snapshot.templateName}</span>
                  <span className="mt-1 block truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{snapshot.period} · {snapshot.createdBy}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
              </button>
            ))}
            {snapshots.length === 0 && (
              <div className={`${sectionSurface} px-4 py-8 text-center`}>
                <p className="text-[14px] font-medium text-[var(--tm-text-secondary)]">暂无档案</p>
                {drafts.length === 0 && (
                  <button type="button" onClick={() => setPageMode('template-select')} className={`${primaryButton} mt-5`}>
                    <Plus className="h-4.5 w-4.5" />新建档案
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );

  const renderTemplateSelect = () => (
    <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
      <PageHeader title="选择档案" onBack={() => setPageMode('root')} />
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
        <div className="space-y-2.5">
          {enabledTemplates.map(template => (
            <button key={template.id} type="button" onClick={() => selectTemplate(template)} className={`${sectionSurface} flex min-h-[82px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><BookOpenCheck className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-[var(--tm-text-primary)]">{template.name}</span>
                <span className="mt-1.5 block text-[12px] font-medium text-[var(--tm-text-secondary)]">{template.growthModules.length}项成长记录 · {template.fields.length}个填写字段</span>
              </span>
              <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-disabled)]" />
            </button>
          ))}
          {enabledTemplates.length === 0 && (
            <div className={`${sectionSurface} px-4 py-8 text-center text-[14px] font-medium text-[var(--tm-text-secondary)]`}>当前年级暂无可用档案</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFill = () => {
    if (!activeDraft || !activeTemplate) return renderRoot();
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title={activeTemplate.name} onBack={closeFill} />
        <div className="flex-1 overflow-y-auto px-5 pb-36 pt-4 no-scrollbar">
          {renderSystemFields(activeTemplate.systemFields, currentSystemValues, true)}

          {activeTemplate.growthModules.length > 0 && (
            <div className="mt-5">
              <h2 className="mb-3 px-1 text-[15px] font-bold text-[var(--tm-text-primary)]">成长记录</h2>
              {renderGrowthSnapshots(currentGrowthSnapshots, new Set(activeTemplate.growthModules.filter(module => module.required).map(module => module.key)))}
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
            <button type="button" onClick={() => saveDraft(true)} className={primaryButton}><LockKeyhole className="h-4.5 w-4.5" />确认成档</button>
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
              new Set(activeSnapshot.templateSnapshot.growthModules.filter(module => module.required).map(module => module.key)),
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
  if (pageMode === 'template-select') content = renderTemplateSelect();
  else if (pageMode === 'fill') content = renderFill();
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
