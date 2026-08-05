import React, { useEffect, useState } from 'react';
import {
  BookOpenCheck,
  ChevronRight,
  FilePenLine,
  History,
  Save,
  Send,
} from 'lucide-react';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import {
  appendArchiveViewAudit,
  ARCHIVE_GROWTH_FIELD_GROUPS,
  buildArchiveGrowthModuleSnapshots,
  createEmptyArchiveGrowthSnapshots,
  createStudentArchiveDraft,
  getArchiveAnswerValidationError,
  getArchiveGrowthMissingPolicy,
  getArchiveSystemValues,
  getEnabledTemplatesForGrade,
  mergeArchiveGrowthSnapshots,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  saveStudentArchiveDraft,
  type ArchiveAnswer,
  type ArchiveDraft,
  type ArchiveGrowthFieldKey,
  type ArchiveSnapshot,
  type ArchiveWorkspace,
} from '../../../shared/studentArchiveStore';
import {
  getGrowthFieldDefinition,
  type GrowthFieldDefinition,
} from '../../../shared/studentGrowthFieldCatalog';
import { saveStudentGrowthDataRecord } from '../../../shared/studentGrowthStore';
import {
  BottomAction,
  BottomSheet,
  inputClass,
  pageBackground,
  PageHeader,
  primaryButton,
  readonlyFieldClass,
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
  onUpdateArchive: (templateId: string) => void;
}

type PageMode = 'root' | 'fill' | 'detail';

interface GrowthFieldDraft {
  recordedAt: string;
  value: string;
}

const StudentArchiveView: React.FC<StudentArchiveViewProps> = ({
  onBack,
  student,
  classInfo,
  teacherProfile,
  spaceId,
  classes,
  getStudentsForClass,
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
  const [editingGrowthField, setEditingGrowthField] = useState<GrowthFieldDefinition | null>(null);
  const [growthFieldDraft, setGrowthFieldDraft] = useState<GrowthFieldDraft>({ recordedAt: '', value: '' });
  const [growthFieldError, setGrowthFieldError] = useState('');
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
  const currentGrowthSnapshots = activeTemplate
    ? mergeArchiveGrowthSnapshots(
        createEmptyArchiveGrowthSnapshots(activeTemplate.growthFields),
        activeDraft?.growthSnapshots ?? [],
      )
    : [];
  const availableGrowthSnapshots = currentGrowthSnapshots.flatMap(snapshot => {
    const items = snapshot.items.filter(item => item.value.trim());
    return items.length > 0 ? [{ ...snapshot, status: 'available' as const, items }] : [];
  });

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
    const missingGrowthField = activeTemplate.growthFields.find(field => (
      getArchiveGrowthMissingPolicy(field) === 'required' && !currentGrowthSnapshots.some(snapshot => (
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
    const workingWorkspace = transientDraft?.id === activeDraft.id
      ? { ...workspace, drafts: [transientDraft, ...workspace.drafts] }
      : workspace;
    const next = saveStudentArchiveDraft(workingWorkspace, activeDraft.id, answers, submit, teacherProfile.name, getArchiveSystemValues(student), availableGrowthSnapshots);
    setTransientDraft(null);
    updateWorkspace(next, submit ? '档案已保存' : '修改已保存');
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

  const openGrowthFieldEditor = (key: ArchiveGrowthFieldKey) => {
    const definition = getGrowthFieldDefinition(key as Parameters<typeof getGrowthFieldDefinition>[0]);
    if (!definition) return;
    setEditingGrowthField(definition);
    setGrowthFieldDraft({ recordedAt: new Date().toISOString().slice(0, 10), value: '' });
    setGrowthFieldError('');
  };

  const saveGrowthField = () => {
    if (!editingGrowthField || !activeDraft || !activeTemplate) return;
    const rawValue = growthFieldDraft.value.trim();
    if (!growthFieldDraft.recordedAt) {
      setGrowthFieldError('请选择实际记录日期');
      return;
    }
    if (!rawValue) {
      setGrowthFieldError(`请填写${editingGrowthField.label}`);
      return;
    }
    const value = editingGrowthField.valueType === 'number' ? Number(rawValue) : rawValue;
    if (editingGrowthField.valueType === 'number' && !Number.isFinite(value)) {
      setGrowthFieldError('请输入有效数值');
      return;
    }
    if (typeof value === 'number' && (
      editingGrowthField.minValue !== undefined && value < editingGrowthField.minValue
      || editingGrowthField.maxValue !== undefined && value > editingGrowthField.maxValue
    )) {
      setGrowthFieldError(`请输入${editingGrowthField.minValue ?? ''}至${editingGrowthField.maxValue ?? ''}${editingGrowthField.unit ?? ''}`);
      return;
    }
    const sourceRecordId = `archive-${activeDraft.id}-${editingGrowthField.key}`;
    saveStudentGrowthDataRecord(student.id, {
      recordedAt: growthFieldDraft.recordedAt,
      values: { [editingGrowthField.key]: value },
      sourceRecordId,
      sourceLabel: `档案补录·${activeDraft.templateName}`,
      sourceType: 'mobile-entry',
    }, teacherProfile.name);
    const incomingSnapshots = buildArchiveGrowthModuleSnapshots(student.id, activeTemplate.growthFields, {
      startDate: growthFieldDraft.recordedAt,
      endDate: growthFieldDraft.recordedAt,
    }).flatMap(module => {
      const items = module.items.filter(item => item.value.trim() && item.sourceRecordId === sourceRecordId);
      return items.length > 0 ? [{ ...module, status: 'available' as const, items }] : [];
    });
    const nextGrowthSnapshots = mergeArchiveGrowthSnapshots(activeDraft.growthSnapshots, incomingSnapshots);
    if (transientDraft?.id === activeDraft.id) {
      setTransientDraft({ ...transientDraft, growthSnapshots: nextGrowthSnapshots, updatedAt: new Date().toISOString().slice(0, 10) });
    } else {
      updateWorkspace({
        ...workspace,
        drafts: workspace.drafts.map(item => item.id === activeDraft.id ? { ...item, growthSnapshots: nextGrowthSnapshots, updatedAt: new Date().toISOString().slice(0, 10) } : item),
      });
    }
    setEditingGrowthField(null);
    setGrowthFieldError('');
    setToast('已保存到当前档案');
    window.setTimeout(() => setToast(''), 1800);
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
              const latestSnapshot = snapshots.find(item => item.templateId === template.id);
              const hasArchive = Boolean(draft || latestSnapshot);
              const statusMeta = hasArchive
                ? { label: '已建立', className: 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' }
                : { label: '待采集', className: 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]' };
              return (
              <button key={template.id} type="button" onClick={() => openLiveArchive(template.id)} className={`${sectionSurface} flex min-h-[82px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ${hasArchive ? 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' : 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]'}`}>
                  {hasArchive ? <BookOpenCheck className="h-4.5 w-4.5" /> : <FilePenLine className="h-4.5 w-4.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{template.name}</span>
                  <span className="mt-1 block truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{draft ? `更新于 ${draft.updatedAt}` : latestSnapshot ? `采集于 ${latestSnapshot.createdAt}` : `${template.growthFields.length + template.fields.length}项内容`}</span>
                </span>
                <StatusPill className={statusMeta.className}>{statusMeta.label}</StatusPill>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
              </button>
              );
            })}
            {enabledTemplates.length === 0 && <div className={`${sectionSurface} px-4 py-8 text-center text-[14px] font-medium text-[var(--tm-text-secondary)]`}>当前年级暂无可用档案</div>}
          </div>
        </section>

        {snapshots.length > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">更新记录</h2>
              <span className="text-[12px] font-semibold text-[var(--tm-text-tertiary)]">{snapshots.length}条</span>
            </div>
            <div className="space-y-2.5">
              {snapshots.map(snapshot => (
                <button key={snapshot.id} type="button" onClick={() => openSnapshot(snapshot)} className={`${sectionSurface} flex min-h-[78px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]"><History className="h-4.5 w-4.5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{snapshot.templateName}</span>
                    <span className="mt-1 block truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{snapshot.createdAt} · {snapshot.createdBy}</span>
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
    const growthItemByKey = new Map(currentGrowthSnapshots.flatMap(snapshot => (
      snapshot.items.flatMap(item => item.key ? [[item.key, item] as const] : [])
    )));
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader
          title={activeTemplate.name}
          onBack={closeFill}
        />
        <div className="flex-1 overflow-y-auto px-5 pb-36 pt-4 no-scrollbar">
          <button type="button" onClick={() => onUpdateArchive(activeDraft.templateId)} className={`${sectionSurface} mb-4 flex min-h-[56px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]"><Send className="h-4.5 w-4.5" /></span>
            <span className="min-w-0 flex-1 text-[14px] font-semibold text-[var(--tm-text-primary)]">发起采集</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
          </button>
          {(activeTemplate.fields.length > 0 || activeTemplate.growthFields.length > 0) && (
            <div className="mt-5">
              <h2 className="mb-3 px-1 text-[15px] font-bold text-[var(--tm-text-primary)]">档案内容</h2>
              <ArchiveFormRenderer
                definition={activeTemplate}
                answers={answers}
                onAnswersChange={setAnswers}
                isGrowthFieldFilled={config => Boolean(growthItemByKey.get(config.key)?.value)}
                renderGrowthField={(config, number) => {
                  const definition = getGrowthFieldDefinition(config.key as Parameters<typeof getGrowthFieldDefinition>[0]);
                  const legacyField = ARCHIVE_GROWTH_FIELD_GROUPS.flatMap(group => group.fields).find(field => field.key === config.key);
                  const item = growthItemByKey.get(config.key);
                  return (
                    <div>
                      <div className="mb-2 text-[14px] font-semibold text-[var(--tm-text-primary)]">
                        {number}. {definition?.label ?? legacyField?.label ?? config.key}
                        {getArchiveGrowthMissingPolicy(config) === 'required' && <span className="ml-1 text-[var(--tm-status-negative-strong)]">*</span>}
                      </div>
                      <div className={`${readonlyFieldClass} flex min-h-12 items-center gap-3 py-2`}>
                        <span className={`min-w-0 flex-1 ${item?.value ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-input-readonly-text)]'}`}>
                          {item?.value || '未填写'}
                          {item?.recordedAt && <span className="mt-0.5 block text-[11px] font-medium text-[var(--tm-text-tertiary)]">{item.recordedAt} · {item.sourceLabel}</span>}
                        </span>
                        {!item?.value && definition && (
                          <button type="button" onClick={() => openGrowthFieldEditor(config.key)} className="flex min-h-10 shrink-0 items-center gap-1 text-[13px] font-semibold text-[var(--tm-brand-primary)]">
                            填写<ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          )}
        </div>
        <BottomAction>
          <button type="button" onClick={() => saveDraft(true)} className={`${primaryButton} w-full`}><Save className="h-4.5 w-4.5" />保存修改</button>
        </BottomAction>
      </div>
    );
  };

  const renderDetail = () => {
    if (!activeSnapshot) return renderRoot();
    const template = activeSnapshot.templateSnapshot;
    const growthItemByKey = new Map(activeSnapshot.growthSnapshots.flatMap(snapshot => (
      snapshot.items.flatMap(item => item.key ? [[item.key, item] as const] : [])
    )));
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title="更新记录" onBack={() => setPageMode('root')} />
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
          <section className={`${sectionSurface} p-4`}>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]"><History className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">{activeSnapshot.templateName}</h2>
                <p className="mt-1.5 text-[12px] font-medium text-[var(--tm-text-secondary)]">{activeSnapshot.createdBy} · {activeSnapshot.createdAt}</p>
              </div>
            </div>
          </section>

          <section className="mt-4">
            <ArchiveFormRenderer
              definition={template}
              mode="readonly"
              answers={activeSnapshot.answers}
              isGrowthFieldFilled={config => Boolean(growthItemByKey.get(config.key)?.value)}
              renderGrowthField={(config, number) => {
                const definition = getGrowthFieldDefinition(config.key as Parameters<typeof getGrowthFieldDefinition>[0]);
                const legacyField = ARCHIVE_GROWTH_FIELD_GROUPS.flatMap(group => group.fields).find(field => field.key === config.key);
                const item = growthItemByKey.get(config.key);
                return (
                  <div>
                    <div className="mb-2 text-[14px] font-semibold text-[var(--tm-text-primary)]">
                      {number}. {definition?.label ?? legacyField?.label ?? config.key}
                      {getArchiveGrowthMissingPolicy(config) === 'required' && <span className="ml-1 text-[var(--tm-status-negative-strong)]">*</span>}
                    </div>
                    <div className={`${readonlyFieldClass} min-h-12 py-3 leading-5 ${item?.value ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-input-readonly-text)]'}`}>
                      {item?.value || '未填写'}
                      {item?.recordedAt && <span className="mt-0.5 block text-[11px] font-medium text-[var(--tm-text-tertiary)]">{item.recordedAt} · {item.sourceLabel}</span>}
                    </div>
                  </div>
                );
              }}
            />
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
      <BottomSheet open={editingGrowthField !== null} label="填写成长数据" onDismiss={() => setEditingGrowthField(null)}>
        <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">
          填写{editingGrowthField?.label ?? ''}
        </h2>
        <label className="mt-5 block">
          <span className="text-[12px] font-semibold text-[var(--tm-text-secondary)]">实际记录日期</span>
          <input
            type="date"
            value={growthFieldDraft.recordedAt}
            onInput={event => {
              const recordedAt = event.currentTarget.value;
              setGrowthFieldDraft(current => ({ ...current, recordedAt }));
              setGrowthFieldError('');
            }}
            className={`${inputClass} mt-2 h-12`}
          />
        </label>
        <label className="mt-4 block">
          <span className="text-[12px] font-semibold text-[var(--tm-text-secondary)]">
            {editingGrowthField?.label ?? '数据'}{editingGrowthField?.unit ? `（${editingGrowthField.unit}）` : ''}
          </span>
          {editingGrowthField?.valueType === 'single-select' ? (
            <select
              value={growthFieldDraft.value}
              onChange={event => {
                const value = event.currentTarget.value;
                setGrowthFieldDraft(current => ({ ...current, value }));
                setGrowthFieldError('');
              }}
              className={`${inputClass} mt-2 h-12`}
            >
              <option value="">请选择</option>
              {editingGrowthField.options?.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : editingGrowthField?.valueType === 'text' ? (
            <textarea
              value={growthFieldDraft.value}
              onInput={event => {
                const value = event.currentTarget.value;
                setGrowthFieldDraft(current => ({ ...current, value }));
                setGrowthFieldError('');
              }}
              className={`${inputClass} mt-2 min-h-[88px] resize-none py-3`}
            />
          ) : (
            <input
              type="number"
              inputMode="decimal"
              min={editingGrowthField?.minValue}
              max={editingGrowthField?.maxValue}
              step={editingGrowthField?.decimalPlaces === 2 ? '0.01' : editingGrowthField?.decimalPlaces === 1 ? '0.1' : '1'}
              value={growthFieldDraft.value}
              onInput={event => {
                const value = event.currentTarget.value;
                setGrowthFieldDraft(current => ({ ...current, value }));
                setGrowthFieldError('');
              }}
              className={`${inputClass} mt-2 h-12`}
            />
          )}
        </label>
        {growthFieldError && <p className="mt-2 text-[12px] font-semibold text-[var(--tm-status-negative-strong)]">{growthFieldError}</p>}
        <button type="button" disabled={!growthFieldDraft.recordedAt || !growthFieldDraft.value.trim()} onClick={saveGrowthField} className={`${primaryButton} mt-5 w-full`}>保存</button>
      </BottomSheet>
      <Toast message={toast} />
    </div>
  );
};

export default StudentArchiveView;
