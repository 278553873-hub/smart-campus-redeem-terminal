import React, { useEffect, useState } from 'react';
import {
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  FilePenLine,
  History,
  LockKeyhole,
  Plus,
  UserRound,
} from 'lucide-react';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import {
  appendArchiveViewAudit,
  createStudentArchiveDraft,
  getArchiveSystemFieldLabel,
  getArchiveSystemValues,
  getEnabledTemplatesForGrade,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  saveStudentArchiveDraft,
  type ArchiveDraft,
  type ArchiveField,
  type ArchiveSnapshot,
  type ArchiveSystemFieldKey,
  type ArchiveTemplate,
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

const toggleValue = (current: string, option: string) => {
  const values = current ? current.split('、').filter(Boolean) : [];
  return values.includes(option)
    ? values.filter(item => item !== option).join('、')
    : [...values, option].join('、');
};

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
  const [activeSnapshotId, setActiveSnapshotId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [editingSystemField, setEditingSystemField] = useState<ArchiveSystemFieldKey | null>(null);
  const [systemFieldDraft, setSystemFieldDraft] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    setWorkspace(readWorkspace());
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
  const activeDraft = workspace.drafts.find(item => item.id === activeDraftId);
  const activeTemplate = activeDraft?.templateSnapshot;
  const activeSnapshot = workspace.snapshots.find(item => item.id === activeSnapshotId);
  const currentSystemValues = getArchiveSystemValues(student);

  const openDraft = (draft: ArchiveDraft) => {
    setActiveDraftId(draft.id);
    setAnswers({ ...draft.answers });
    setPageMode('fill');
  };

  const selectTemplate = (template: ArchiveTemplate) => {
    const result = createStudentArchiveDraft(workspace, template.id, student, classInfo, teacherProfile.name);
    if (!result.draftId) return;
    updateWorkspace(result.workspace);
    const draft = result.workspace.drafts.find(item => item.id === result.draftId);
    if (draft) openDraft(draft);
  };

  const saveDraft = (submit: boolean) => {
    if (!activeDraft || !activeTemplate) return;
    const missingSystemField = activeTemplate.systemFields.find(key => !currentSystemValues[key]?.trim());
    if (submit && missingSystemField) {
      setToast(`请先补充“${getArchiveSystemFieldLabel(missingSystemField)}”`);
      window.setTimeout(() => setToast(''), 1800);
      return;
    }
    const missing = activeTemplate.fields.find(field => field.required && !answers[field.semanticKey]?.trim());
    if (submit && missing) {
      setToast(`请先填写“${missing.label}”`);
      window.setTimeout(() => setToast(''), 1800);
      return;
    }
    const systemValues = Object.fromEntries(
      activeTemplate.systemFields.map(key => [key, currentSystemValues[key] ?? '']),
    ) as Partial<Record<ArchiveSystemFieldKey, string>>;
    const next = saveStudentArchiveDraft(workspace, activeDraft.id, answers, submit, teacherProfile.name, systemValues);
    updateWorkspace(next, submit ? '已确认成档' : '草稿已保存');
    setPageMode('root');
  };

  const openSnapshot = (snapshot: ArchiveSnapshot) => {
    setActiveSnapshotId(snapshot.id);
    updateWorkspace(appendArchiveViewAudit(workspace, student.id, teacherProfile.name));
    setPageMode('detail');
  };

  const renderFieldInput = (field: ArchiveField) => {
    const value = answers[field.semanticKey] ?? '';
    if (field.type === 'text') {
      return <textarea value={value} onChange={event => setAnswers({ ...answers, [field.semanticKey]: event.target.value })} rows={3} placeholder="请输入" className={`${inputClass} min-h-[92px] py-3`} />;
    }
    if (field.type === 'date') {
      return <input type="date" value={value} onInput={event => setAnswers({ ...answers, [field.semanticKey]: event.currentTarget.value })} className={`${inputClass} h-12`} />;
    }
    if (field.type === 'number') {
      return <input type="number" inputMode="decimal" value={value} onChange={event => setAnswers({ ...answers, [field.semanticKey]: event.target.value })} placeholder="请输入数字" className={`${inputClass} h-12`} />;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {field.options.map(option => {
          const selected = field.type === 'multiple-select' ? value.split('、').includes(option) : value === option;
          return (
            <button key={option} type="button" onClick={() => setAnswers({ ...answers, [field.semanticKey]: field.type === 'multiple-select' ? toggleValue(value, option) : option })} className={`min-h-10 rounded-[13px] border px-3 text-left text-[13px] font-medium ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]' : 'border-[var(--tm-border-subtle)] bg-white text-[var(--tm-text-secondary)]'}`}>
              {option}
            </button>
          );
        })}
      </div>
    );
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

  const renderRoot = () => (
    <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
      <PageHeader title="学生成长档案" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
        <button type="button" onClick={() => setPageMode('template-select')} className={`${primaryButton} w-full`}>
          <Plus className="h-4.5 w-4.5" />新建档案
        </button>

        {drafts.length > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">未完成</h2>
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

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">历史档案</h2>
            <span className="text-[12px] font-semibold text-[var(--tm-text-tertiary)]">{snapshots.length}份</span>
          </div>
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
              <div className={`${sectionSurface} px-4 py-8 text-center text-[14px] font-medium text-[var(--tm-text-secondary)]`}>暂无历史档案</div>
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
                <span className="mt-1.5 block text-[12px] font-medium text-[var(--tm-text-secondary)]">{template.fields.length}个字段</span>
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
    const grouped = activeTemplate.layoutMode === 'grouped';
    const firstIncompleteSectionIndex = activeTemplate.sections.findIndex(section => (
      activeTemplate.fields
        .filter(field => field.sectionId === section.id && field.required)
        .some(field => !answers[field.semanticKey]?.trim())
    ));
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title={activeTemplate.name} onBack={() => setPageMode('root')} action={<StatusPill className="bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">草稿</StatusPill>} />
        <div className="flex-1 overflow-y-auto px-5 pb-36 pt-4 no-scrollbar">
          {renderSystemFields(activeTemplate.systemFields, currentSystemValues, true)}

          {grouped ? <section className="mt-4 space-y-3">
            {activeTemplate.sections.map((section, sectionIndex) => {
              const fields = activeTemplate.fields.filter(field => field.sectionId === section.id);
              const completed = fields.filter(field => answers[field.semanticKey]?.trim()).length;
              return (
                <details key={section.id} className={`${sectionSurface} overflow-hidden`} open={sectionIndex === (firstIncompleteSectionIndex >= 0 ? firstIncompleteSectionIndex : 0)}>
                  <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 px-4">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-[var(--tm-text-primary)]">{section.label}</span>
                    </span>
                    <span className={`text-[12px] font-bold tabular-nums ${completed === fields.length ? 'text-[var(--tm-status-positive-strong)]' : 'text-[var(--tm-text-tertiary)]'}`}>{completed}/{fields.length}</span>
                    <ChevronDown className="h-4 w-4 text-[var(--tm-text-tertiary)]" />
                  </summary>
                  <div className="space-y-5 border-t border-[var(--tm-border-subtle)] px-4 py-4">
                    {fields.map((field, index) => (
                      <div key={field.id}>
                        <label className="mb-2 block text-[14px] font-semibold text-[var(--tm-text-primary)]">{index + 1}. {field.label}{field.required && <span className="ml-1 text-rose-500">*</span>}</label>
                        {renderFieldInput(field)}
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </section> : (
            <section className={`${sectionSurface} mt-4 space-y-5 p-4`}>
              {activeTemplate.fields.map((field, index) => (
                <div key={field.id}>
                  <label className="mb-2 block text-[14px] font-semibold text-[var(--tm-text-primary)]">{index + 1}. {field.label}{field.required && <span className="ml-1 text-rose-500">*</span>}</label>
                  {renderFieldInput(field)}
                </div>
              ))}
            </section>
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
        <PageHeader title="档案详情" onBack={() => setPageMode('root')} action={<StatusPill className="bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]">已成档</StatusPill>} />
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
            {template?.layoutMode === 'flat' ? (
              <article className={`${sectionSurface} p-4`}>
                <div className="divide-y divide-[var(--tm-border-subtle)]">
                  {template.fields.filter(field => activeSnapshot.answers[field.semanticKey]).map(field => (
                    <div key={field.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="text-[11px] font-semibold text-[var(--tm-text-tertiary)]">{field.label}</div>
                      <div className="mt-1 text-[13px] font-medium leading-relaxed text-[var(--tm-text-primary)]">{activeSnapshot.answers[field.semanticKey]}</div>
                    </div>
                  ))}
                </div>
              </article>
            ) : template ? template.sections.map(section => {
              const fields = template.fields.filter(field => field.sectionId === section.id && activeSnapshot.answers[field.semanticKey]);
              if (fields.length === 0) return null;
              return (
                <article key={section.id} className={`${sectionSurface} p-4`}>
                  <h3 className="text-[15px] font-bold text-[var(--tm-text-primary)]">{section.label}</h3>
                  <div className="mt-3 divide-y divide-[var(--tm-border-subtle)]">
                    {fields.map(field => (
                      <div key={field.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="text-[11px] font-semibold text-[var(--tm-text-tertiary)]">{field.label}</div>
                        <div className="mt-1 text-[13px] font-medium leading-relaxed text-[var(--tm-text-primary)]">{activeSnapshot.answers[field.semanticKey]}</div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            }) : Object.entries(activeSnapshot.answers).map(([key, value]) => (
              <article key={key} className={`${sectionSurface} p-4`}>
                <div className="text-[11px] font-semibold text-[var(--tm-text-tertiary)]">{key}</div>
                <div className="mt-1 text-[13px] font-medium leading-relaxed text-[var(--tm-text-primary)]">{value}</div>
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
