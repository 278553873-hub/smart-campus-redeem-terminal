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
import { getPendingArchiveCollectionsForStudent } from '../../../shared/archiveCollectionPersistence';
import { readQuestionnaires } from '../../../shared/questionnaireStore';
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
  Toast,
} from './archivePagePrimitives';
import ArchiveFormRenderer from './ArchiveFormRenderer';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import MobileFloatingCreateButton from '../../components/ui/MobileFloatingCreateButton';
import { ASSETS } from '../../assets/images';
import { getArchiveHeaderImage, getArchiveTheme, getArchiveThemeStyle } from './archiveAppearance';

interface StudentArchiveViewProps {
  onBack: () => void;
  student: Student;
  classInfo: ClassInfo;
  teacherProfile: TeacherProfile;
  spaceId: string;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  onUpdateArchive: (templateId: string) => void;
  onOpenPendingCollection: (recordId: string) => void;
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
  onOpenPendingCollection,
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
  const [showArchivePicker, setShowArchivePicker] = useState(false);
  const [repeatArchiveTemplateId, setRepeatArchiveTemplateId] = useState('');
  const [repeatArchiveDataDate, setRepeatArchiveDataDate] = useState('');
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
    .sort((a, b) => b.dataUpdatedAt.localeCompare(a.dataUpdatedAt) || b.createdAt.localeCompare(a.createdAt));
  const enabledTemplates = getEnabledTemplatesForGrade(workspace, student.grade);
  const studentNo = student.studentNo ?? student.id;
  const pendingArchiveCollections = getPendingArchiveCollectionsForStudent(readQuestionnaires(), spaceId, studentNo);
  const pendingArchiveTemplateIds = new Set(pendingArchiveCollections.flatMap(record => (
    record.archiveTemplateId ? [record.archiveTemplateId] : []
  )));
  const currentArchives = Array.from(new Set([
    ...drafts.map(item => item.templateId),
    ...snapshots.map(item => item.templateId),
  ])).flatMap(templateId => {
    const draft = drafts.find(item => item.templateId === templateId);
    const snapshot = snapshots.find(item => item.templateId === templateId);
    if (!draft && !snapshot) return [];
    return [{
      templateId,
      templateName: draft?.templateName ?? snapshot?.templateName ?? '学生档案',
      dataUpdatedAt: draft?.dataUpdatedAt ?? snapshot?.dataUpdatedAt ?? '',
      draft,
      snapshot,
    }];
  }).sort((left, right) => right.dataUpdatedAt.localeCompare(left.dataUpdatedAt));
  const currentArchiveTemplateIds = new Set(currentArchives.map(item => item.templateId));
  const canAddArchive = enabledTemplates.some(template => (
    pendingArchiveTemplateIds.has(template.id)
    || !currentArchiveTemplateIds.has(template.id)
    || template.generationMode === 'continuous'
  ));
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

  const openLiveArchive = (templateId: string, dataUpdatedAt?: string) => {
    const template = enabledTemplates.find(item => item.id === templateId);
    if (!template) return;
    const result = createStudentArchiveDraft(workspace, template.id, student, classInfo, teacherProfile.name, { dataUpdatedAt });
    const sourceDraft = result.workspace.drafts.find(item => item.id === result.draftId);
    if (!sourceDraft) return;
    const draft = dataUpdatedAt ? { ...sourceDraft, dataUpdatedAt } : sourceDraft;
    const persistedDraft = workspace.drafts.find(item => item.id === draft.id);
    if (persistedDraft && !dataUpdatedAt) {
      openDraft(persistedDraft);
      return;
    }
    setTransientDraft(draft);
    setActiveDraftId(draft.id);
    setAnswers({ ...draft.answers });
    setPageMode('fill');
  };

  const chooseArchiveTemplate = (templateId: string) => {
    const template = enabledTemplates.find(item => item.id === templateId);
    if (!template) return;
    const pendingCollection = pendingArchiveCollections.find(record => record.archiveTemplateId === template.id);
    if (pendingCollection) {
      setShowArchivePicker(false);
      onOpenPendingCollection(pendingCollection.id);
      return;
    }
    const hasArchive = currentArchiveTemplateIds.has(template.id);
    if (hasArchive && template.generationMode !== 'continuous') return;
    setShowArchivePicker(false);
    if (!hasArchive) {
      openLiveArchive(template.id);
      return;
    }
    setRepeatArchiveTemplateId(template.id);
    setRepeatArchiveDataDate(new Date().toISOString().slice(0, 10));
  };

  const startRepeatedArchive = () => {
    if (!repeatArchiveTemplateId || !repeatArchiveDataDate) return;
    const templateId = repeatArchiveTemplateId;
    const dataUpdatedAt = repeatArchiveDataDate;
    setRepeatArchiveTemplateId('');
    openLiveArchive(templateId, dataUpdatedAt);
  };

  const editSnapshot = (snapshot: ArchiveSnapshot) => {
    const template = workspace.templates.find(item => item.id === snapshot.templateId && item.origin === 'school');
    if (!template) return;
    const result = createStudentArchiveDraft(workspace, template.id, student, classInfo, teacherProfile.name, { snapshotId: snapshot.id });
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
      <div className="flex-1 overflow-y-auto px-5 pb-[calc(var(--tm-size-floating-action)+var(--tm-space-5)+var(--tm-space-5)+env(safe-area-inset-bottom))] pt-4 no-scrollbar">
        {currentArchives.length > 0 ? (
          <div className="space-y-2.5">
            {currentArchives.map(archive => (
              <button
                key={archive.templateId}
                type="button"
                onClick={() => archive.draft ? openDraft(archive.draft) : archive.snapshot && openSnapshot(archive.snapshot)}
                className={`${sectionSurface} flex min-h-[82px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]">
                  <BookOpenCheck className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{archive.templateName}</span>
                  <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">数据更新于 {archive.dataUpdatedAt}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
              </button>
            ))}
          </div>
        ) : (
          <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.WORRIED_CLIPBOARD} title="暂无档案" className="py-10" />
        )}
      </div>
      {canAddArchive && <MobileFloatingCreateButton label="新增档案" emphasis="raised" onClick={() => setShowArchivePicker(true)} />}
    </div>
  );

  const renderFill = () => {
    if (!activeDraft || !activeTemplate) return renderRoot();
    const appearanceTheme = getArchiveTheme(activeTemplate.appearance);
    const headerImage = getArchiveHeaderImage(activeTemplate.appearance);
    const appearanceStyle = getArchiveThemeStyle(activeTemplate.appearance);
    const growthItemByKey = new Map(currentGrowthSnapshots.flatMap(snapshot => (
      snapshot.items.flatMap(item => item.key ? [[item.key, item] as const] : [])
    )));
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`} style={appearanceStyle}>
        <PageHeader
          title={activeTemplate.name}
          onBack={closeFill}
        />
        <div className="flex-1 overflow-y-auto px-5 pb-36 pt-4 no-scrollbar" style={{ backgroundColor: appearanceTheme.background }}>
          {headerImage && (
            <div className="-mx-5 -mt-4 mb-4 aspect-[16/7] overflow-hidden">
              <img src={headerImage} alt="" className="block h-full w-full object-cover" />
            </div>
          )}
          <div className={`${sectionSurface} mb-4 flex min-h-12 items-center justify-between gap-4 px-4 py-3`}>
            <span className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">数据更新日期</span>
            <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{activeDraft.dataUpdatedAt}</span>
          </div>
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
    const appearanceTheme = getArchiveTheme(template.appearance);
    const headerImage = getArchiveHeaderImage(template.appearance);
    const appearanceStyle = getArchiveThemeStyle(template.appearance);
    const growthItemByKey = new Map(activeSnapshot.growthSnapshots.flatMap(snapshot => (
      snapshot.items.flatMap(item => item.key ? [[item.key, item] as const] : [])
    )));
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`} style={appearanceStyle}>
        <PageHeader title="档案详情" onBack={() => setPageMode('root')} />
        <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4 no-scrollbar" style={{ backgroundColor: appearanceTheme.background }}>
          {headerImage && (
            <div className="-mx-5 -mt-4 mb-4 aspect-[16/7] overflow-hidden">
              <img src={headerImage} alt="" className="block h-full w-full object-cover" />
            </div>
          )}
          <section className={`${sectionSurface} p-4`}>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]"><History className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">{activeSnapshot.templateName}</h2>
                <p className="mt-1.5 text-[12px] font-medium text-[var(--tm-text-secondary)]">数据更新于 {activeSnapshot.dataUpdatedAt}</p>
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
        <BottomAction>
          <button type="button" onClick={() => editSnapshot(activeSnapshot)} className={`${primaryButton} w-full`}><FilePenLine className="h-4.5 w-4.5" />编辑档案</button>
        </BottomAction>
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
      <MobileBottomSheet open={showArchivePicker} title="选择档案" onClose={() => setShowArchivePicker(false)}>
        <div className="grid grid-cols-2 gap-3 pb-2">
          {enabledTemplates.map(template => {
            const hasArchive = currentArchiveTemplateIds.has(template.id);
            const hasPendingCollection = pendingArchiveTemplateIds.has(template.id);
            const canRepeat = hasArchive && template.generationMode === 'continuous';
            const disabled = !hasPendingCollection && hasArchive && !canRepeat;
            const stateLabel = hasPendingCollection ? '待填写中' : canRepeat ? '再次填写' : hasArchive ? '已建立' : '开始填写';
            const headerImage = getArchiveHeaderImage(template.appearance);
            const theme = getArchiveTheme(template.appearance);
            return (
              <button
                key={template.id}
                type="button"
                disabled={disabled}
                onClick={() => chooseArchiveTemplate(template.id)}
                className="overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] text-left [box-shadow:var(--tm-shadow-card-on-white)] transition active:scale-[0.97] disabled:opacity-55 disabled:active:scale-100"
              >
                {headerImage ? (
                  <img src={headerImage} alt="" className="block aspect-[16/7] w-full object-cover" />
                ) : (
                  <span className="flex aspect-[16/7] w-full items-center justify-center text-[length:var(--tm-font-size-meta)] font-semibold" style={{ backgroundColor: theme.background, color: theme.accentStrong }}>无头图</span>
                )}
                <span className="block p-3">
                  <span className="line-clamp-2 min-h-10 text-[length:var(--tm-font-size-card-title)] font-semibold leading-5 text-[var(--tm-text-primary)]">{template.name}</span>
                  <span className={`mt-2 block text-[length:var(--tm-font-size-meta)] font-semibold ${disabled ? 'text-[var(--tm-text-disabled)]' : 'text-[var(--tm-brand-primary-strong)]'}`}>{stateLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      </MobileBottomSheet>
      <MobileBottomSheet open={Boolean(repeatArchiveTemplateId)} title="再次填写" onClose={() => setRepeatArchiveTemplateId('')}>
        <label className="block pb-2">
          <span className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">数据更新日期</span>
          <input
            type="date"
            value={repeatArchiveDataDate}
            onInput={event => setRepeatArchiveDataDate(event.currentTarget.value)}
            className={`${inputClass} mt-2 h-12`}
          />
        </label>
        <button type="button" disabled={!repeatArchiveDataDate} onClick={startRepeatedArchive} className={`${primaryButton} mt-4 w-full`}>开始填写</button>
      </MobileBottomSheet>
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
