import React, { useEffect, useState } from 'react';
import {
  Check,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FilePenLine,
  Files,
  Plus,
  CircleDot,
  ListChecks,
  Hash,
  MessageSquareText,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import FormBuilder, { type FormFieldTypeOption } from '../../components/form-builder/FormBuilder';
import MobileFloatingCreateButton from '../../components/ui/MobileFloatingCreateButton';
import type { ConfigurableFormField } from '../../../shared/formDefinition';
import ArchiveFormRenderer from './ArchiveFormRenderer';
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
import {
  cloneRecommendedTemplate,
  ARCHIVE_SELECTABLE_SYSTEM_FIELD_OPTIONS,
  ARCHIVE_SYSTEM_FIELD_OPTIONS,
  createBlankArchiveTemplate,
  createArchiveField,
  deleteArchiveTemplate,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  saveArchiveTemplate,
  setArchiveTemplateStatus,
  type ArchiveFieldType,
  type ArchiveSystemFieldKey,
  type ArchiveTemplate,
  type ArchiveWorkspace,
} from '../../../shared/studentArchiveStore';

interface ArchiveDesignViewProps {
  onBack: () => void;
  teacherProfile: TeacherProfile;
  spaceId: string;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
}

type PageMode = 'root' | 'template-create' | 'template-editor';
type TemplateEditorMode = 'create' | 'edit' | 'preview';

const archiveFieldTypes: Array<FormFieldTypeOption<ArchiveFieldType>> = [
  { value: 'text', label: '文字', icon: MessageSquareText },
  { value: 'single-select', label: '单选', icon: CircleDot, choice: true },
  { value: 'multiple-select', label: '多选', icon: ListChecks, choice: true },
  { value: 'date', label: '日期', icon: CalendarDays },
  { value: 'number', label: '数字', icon: Hash },
];

const templateStatusMeta: Record<ArchiveTemplate['status'], { label: string; className: string }> = {
  recommended: { label: '推荐', className: 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-pressed)]' },
  draft: { label: '草稿', className: 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]' },
  published: { label: '已启用', className: 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' },
  disabled: { label: '已禁用', className: 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]' },
};


const ArchiveDesignView: React.FC<ArchiveDesignViewProps> = ({ onBack, teacherProfile, spaceId, classes, getStudentsForClass }) => {
  const [workspace, setWorkspace] = useState<ArchiveWorkspace>(() => readArchiveWorkspace({
    spaceId,
    teacherName: teacherProfile.name,
    classes,
    homeroomClassIds: teacherProfile.homeroomClassIds,
    getStudentsForClass,
  }));
  const [pageMode, setPageMode] = useState<PageMode>('root');
  const [templateDraft, setTemplateDraft] = useState<ArchiveTemplate | null>(null);
  const [templateEditorMode, setTemplateEditorMode] = useState<TemplateEditorMode>('edit');
  const [editingDisabledTemplate, setEditingDisabledTemplate] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSystemFieldPicker, setShowSystemFieldPicker] = useState(false);
  const [toast, setToast] = useState('');

  const updateWorkspace = (next: ArchiveWorkspace, message?: string) => {
    setWorkspace(next);
    persistArchiveWorkspace(next);
    if (message) {
      setToast(message);
      window.setTimeout(() => setToast(''), 1800);
    }
  };

  useEffect(() => {
    const next = readArchiveWorkspace({
      spaceId,
      teacherName: teacherProfile.name,
      classes,
      homeroomClassIds: teacherProfile.homeroomClassIds,
      getStudentsForClass,
    });
    setWorkspace(next);
    setPageMode('root');
  }, [spaceId]);

  const openTemplate = (templateId: string, editorMode: TemplateEditorMode = 'edit') => {
    const template = workspace.templates.find(item => item.id === templateId);
    if (!template || template.deletedAt) return;
    setTemplateDraft({
      ...template,
      systemFields: [...template.systemFields],
      sections: template.sections.map(item => ({ ...item })),
      fields: template.fields.map(item => ({
        ...item,
        options: [...item.options],
        customAnswerOptions: [...(item.customAnswerOptions ?? [])],
        settings: item.settings ? { ...item.settings } : undefined,
      })),
    });
    setEditingDisabledTemplate(false);
    setTemplateEditorMode(editorMode);
    setPageMode('template-editor');
  };

  const previewRecommendedTemplate = (templateId: string) => {
    openTemplate(templateId, 'preview');
  };

  const copyTemplate = (templateId: string) => {
    const result = cloneRecommendedTemplate(workspace, templateId);
    openTemplateFromWorkspace(result.workspace, result.templateId, 'create');
  };

  const createBlankTemplate = () => {
    const result = createBlankArchiveTemplate(workspace);
    openTemplateFromWorkspace(result.workspace, result.templateId, 'create');
  };

  const openTemplateFromWorkspace = (nextWorkspace: ArchiveWorkspace, templateId: string, editorMode: TemplateEditorMode) => {
    const template = nextWorkspace.templates.find(item => item.id === templateId);
    if (!template) return;
    setTemplateDraft({
      ...template,
      systemFields: [...template.systemFields],
      sections: template.sections.map(item => ({ ...item })),
      fields: template.fields.map(item => ({
        ...item,
        options: [...item.options],
        customAnswerOptions: [...(item.customAnswerOptions ?? [])],
        settings: item.settings ? { ...item.settings } : undefined,
      })),
    });
    setEditingDisabledTemplate(false);
    setTemplateEditorMode(editorMode);
    setPageMode('template-editor');
  };

  const validateTemplateForEnable = (template: ArchiveTemplate) => {
    if (!template.name.trim()) {
      setToast('请先填写档案名称');
      window.setTimeout(() => setToast(''), 1800);
      return false;
    }
    if (template.gradeScopes.length === 0) {
      setToast('请至少选择一个适用年级');
      window.setTimeout(() => setToast(''), 1800);
      return false;
    }
    if (template.layoutMode === 'grouped' && template.sections.length === 0) {
      setToast('请至少新增一个档案分组');
      window.setTimeout(() => setToast(''), 1800);
      return false;
    }
    if (template.fields.length === 0) {
      setToast('请至少新增一个档案字段');
      window.setTimeout(() => setToast(''), 1800);
      return false;
    }
    if (template.fields.some(field => !field.label.trim())) {
      setToast('请补充完整字段名称');
      window.setTimeout(() => setToast(''), 1800);
      return false;
    }
    if (template.fields.some(field => (
      (field.type === 'single-select' || field.type === 'multiple-select')
      && field.options.filter(option => option.trim()).length < 2
    ))) {
      setToast('单选和多选字段请至少填写2个选项');
      window.setTimeout(() => setToast(''), 1800);
      return false;
    }
    if (template.layoutMode === 'grouped' && template.fields.some(field => !field.sectionId || !template.sections.some(section => section.id === field.sectionId))) {
      setToast('请为所有字段选择分组');
      window.setTimeout(() => setToast(''), 1800);
      return false;
    }
    return true;
  };

  const saveTemplate = (enable: boolean) => {
    if (!templateDraft || (enable && !validateTemplateForEnable(templateDraft))) return;
    const nextTemplate: ArchiveTemplate = { ...templateDraft, status: enable ? 'published' : 'draft' };
    const next = saveArchiveTemplate(workspace, nextTemplate);
    updateWorkspace(next, enable ? '档案已启用' : '草稿已保存');
    setPageMode('root');
  };

  const saveDisabledTemplate = (enable: boolean) => {
    if (!templateDraft || (enable && !validateTemplateForEnable(templateDraft))) return;
    const nextTemplate: ArchiveTemplate = { ...templateDraft, status: enable ? 'published' : 'disabled' };
    const next = saveArchiveTemplate(workspace, nextTemplate);
    setEditingDisabledTemplate(false);
    updateWorkspace(next, enable ? '档案已启用' : '修改已保存');
    setPageMode('root');
  };

  const toggleTemplateStatus = (templateId: string, enable: boolean) => {
    const next = setArchiveTemplateStatus(workspace, templateId, enable ? 'published' : 'disabled');
    updateWorkspace(next, enable ? '档案已启用' : '档案已禁用');
    setPageMode('root');
  };

  const deleteCurrentTemplate = () => {
    if (!templateDraft) return;
    const result = deleteArchiveTemplate(workspace, templateDraft.id);
    setShowDeleteConfirm(false);
    setShowTemplateMenu(false);
    if (!result.deleted) {
      setToast('当前档案无法删除');
      window.setTimeout(() => setToast(''), 1800);
      return;
    }
    updateWorkspace(result.workspace, templateDraft.status === 'draft' ? '草稿已删除' : '档案已删除');
    setTemplateDraft(null);
    setPageMode('root');
  };

  const renderTemplates = () => {
    const school = workspace.templates.filter(template => template.origin === 'school' && !template.deletedAt);
    return (
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[var(--tm-text-primary)]">校本档案</h2>
          <span className="text-[12px] font-semibold text-[var(--tm-text-tertiary)]">{school.length}个</span>
        </div>
        <div className="space-y-2.5">
          {school.map(template => {
            const meta = templateStatusMeta[template.status];
            return (
              <button key={template.id} type="button" onClick={() => openTemplate(template.id)} className={`${sectionSurface} flex min-h-[92px] w-full items-center gap-3 p-4 text-left transition active:scale-[0.985]`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#EEF7FF] text-[#2F9FF4]">
                  <FilePenLine className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-bold text-[var(--tm-text-primary)]">{template.name}</span>
                    <StatusPill className={meta.className}>{meta.label}</StatusPill>
                  </span>
                  <span className="mt-1.5 block text-[12px] font-medium text-[var(--tm-text-secondary)]">{template.fields.length}个字段</span>
                </span>
                <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-disabled)]" />
              </button>
            );
          })}
        </div>
        {school.length === 0 && (
          <div className={`${sectionSurface} mt-2.5 px-4 py-8 text-center text-[14px] font-medium text-[var(--tm-text-secondary)]`}>暂无校本档案</div>
        )}
      </section>
    );
  };

  const renderRoot = () => {
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground} pb-[calc(var(--tm-size-floating-action)+var(--tm-space-5)+var(--tm-space-5)+env(safe-area-inset-bottom))]`}>
        <PageHeader title="档案设计" onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
          {renderTemplates()}
        </div>
        <MobileFloatingCreateButton label="新建档案" onClick={() => setPageMode('template-create')} />
      </div>
    );
  };

  const renderTemplateCreate = () => {
    const recommended = workspace.templates.filter(template => template.origin === 'recommended' && !template.deletedAt);
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title="新建档案" onBack={() => setPageMode('root')} />
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
          <h2 className="mb-3 text-[16px] font-bold text-[var(--tm-text-primary)]">完全新建</h2>
          <button type="button" onClick={createBlankTemplate} className={`${sectionSurface} flex min-h-[82px] w-full items-center gap-3 border-[var(--tm-brand-primary-soft-strong)] px-4 text-left transition active:scale-[0.985]`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><Plus className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold text-[var(--tm-text-primary)]">空白档案</span><span className="mt-1.5 block text-[12px] font-medium text-[var(--tm-text-secondary)]">0个分组 · 0个字段</span></span>
            <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-disabled)]" />
          </button>
          <h2 className="mb-3 mt-6 text-[16px] font-bold text-[var(--tm-text-primary)]">从模板创建</h2>
          <div className="space-y-2.5">
            {recommended.map(template => (
              <button key={template.id} type="button" onClick={() => previewRecommendedTemplate(template.id)} className={`${sectionSurface} flex min-h-[82px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><Files className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold text-[var(--tm-text-primary)]">{template.name}</span><span className="mt-1.5 block text-[12px] font-medium text-[var(--tm-text-secondary)]">{template.fields.length}个字段</span></span>
                <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-disabled)]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTemplateEditor = () => {
    if (!templateDraft) return renderRoot();
    const showFillPreview = templateDraft.status !== 'draft' && !editingDisabledTemplate;
    const isRecommendedPreview = templateEditorMode === 'preview';
    const isCreating = templateEditorMode === 'create';
    const isPersisted = workspace.templates.some(template => template.id === templateDraft.id && !template.deletedAt);
    const canDelete = !editingDisabledTemplate && isPersisted && templateDraft.origin === 'school' && (templateDraft.status === 'draft' || templateDraft.status === 'disabled');
    const headerAction = canDelete ? (
      <button type="button" onClick={() => setShowTemplateMenu(true)} className={iconButton} aria-label="档案操作">
        <MoreHorizontal className="h-5 w-5" />
      </button>
    ) : editingDisabledTemplate ? (
      <StatusPill className={templateStatusMeta[templateDraft.status].className}>{templateStatusMeta[templateDraft.status].label}</StatusPill>
    ) : undefined;
    const gradeOptions = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级', '高一', '高二', '高三'];
    const builderFields: Array<ConfigurableFormField<ArchiveFieldType>> = templateDraft.fields.map(field => ({
      id: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options,
      sectionId: field.sectionId || undefined,
      customAnswerOptions: field.customAnswerOptions,
      settings: field.settings,
    }));
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title={isRecommendedPreview ? '模板预览' : isCreating ? '新建档案' : showFillPreview ? '档案详情' : '编辑档案'} onBack={() => { setEditingDisabledTemplate(false); setPageMode(isRecommendedPreview ? 'template-create' : 'root'); }} action={headerAction} />
        <div className={`flex-1 overflow-y-auto px-5 pt-4 no-scrollbar ${showFillPreview ? 'pb-28' : 'pb-36'}`}>
          {showFillPreview ? (
            <>
              <section className={`${sectionSurface} overflow-hidden`}>
                <div className="flex items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-[16px] font-bold text-[var(--tm-text-primary)]">{templateDraft.name}</h2>
                    <p className="mt-1 text-[12px] font-medium text-[var(--tm-text-tertiary)]">{templateDraft.fields.length}个字段</p>
                  </div>
                  <StatusPill className={templateStatusMeta[templateDraft.status].className}>{templateStatusMeta[templateDraft.status].label}</StatusPill>
                </div>
                <dl className="divide-y divide-[var(--tm-border-subtle)] border-t border-[var(--tm-border-subtle)] px-4">
                  <div className="flex min-h-[48px] items-center justify-between gap-4 py-2">
                    <dt className="shrink-0 text-[12px] font-semibold text-[var(--tm-text-tertiary)]">适用年级</dt>
                    <dd className="text-right text-[13px] font-semibold leading-5 text-[var(--tm-text-primary)]">{templateDraft.gradeScopes.join('、') || '未设置'}</dd>
                  </div>
                  <div className="flex min-h-[48px] items-center justify-between gap-4 py-2">
                    <dt className="shrink-0 text-[12px] font-semibold text-[var(--tm-text-tertiary)]">自动带入</dt>
                    <dd className="text-right text-[13px] font-semibold leading-5 text-[var(--tm-text-primary)]">{templateDraft.systemFields.map(key => ARCHIVE_SYSTEM_FIELD_OPTIONS.find(item => item.key === key)?.label).filter(Boolean).join('、') || '未设置'}</dd>
                  </div>
                </dl>
              </section>

              <section className="mt-6">
                <h2 className="mb-3 px-1 text-[15px] font-bold text-[var(--tm-text-primary)]">表单预览</h2>
                <ArchiveFormRenderer definition={templateDraft} mode="preview" />
              </section>
            </>
          ) : (
            <>
              <section className={`${sectionSurface} space-y-4 p-4`}>
                <label className="block">
                  <span className="text-[12px] font-semibold text-[var(--tm-text-secondary)]">模板名称</span>
                  <input value={templateDraft.name} onChange={event => setTemplateDraft({ ...templateDraft, name: event.target.value })} className={`${inputClass} mt-2 h-12`} />
                </label>
                <div>
                  <div className="mb-2 text-[12px] font-semibold text-[var(--tm-text-secondary)]">适用年级</div>
                  <div className="flex flex-wrap gap-2">
                    {gradeOptions.map(grade => {
                      const selected = templateDraft.gradeScopes.includes(grade);
                      return (
                        <button key={grade} type="button" onClick={() => setTemplateDraft({ ...templateDraft, gradeScopes: selected ? templateDraft.gradeScopes.filter(item => item !== grade) : [...templateDraft.gradeScopes, grade] })} className={`min-h-9 rounded-full px-3 text-[12px] font-semibold ${selected ? 'bg-[var(--tm-brand-primary)] text-white' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]'}`}>
                          {grade}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-[var(--tm-border-subtle)] pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSystemFieldPicker(true)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-[var(--tm-text-primary)]">自动带入</span>
                      <span className="mt-1 block truncate text-[12px] font-medium text-[var(--tm-text-secondary)]">
                        {templateDraft.systemFields.map(key => ARCHIVE_SYSTEM_FIELD_OPTIONS.find(item => item.key === key)?.label).filter(Boolean).join('、') || '未选择'}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[var(--tm-text-secondary)]">
                      已选择 {templateDraft.systemFields.length} 项
                      <ChevronRight className="h-4 w-4 text-[var(--tm-text-disabled)]" />
                    </span>
                  </button>
                </div>
              </section>

              <section className="mt-6">
                <FormBuilder
                  layoutMode={templateDraft.layoutMode}
                  sections={templateDraft.sections}
                  fields={builderFields}
                  itemLabel="字段"
                  fieldTypes={archiveFieldTypes}
                  allowCustomAnswer
                  createField={(type, sectionId) => {
                    const field = createArchiveField(sectionId ?? '');
                    return { ...field, type };
                  }}
                  onChange={value => {
                    const originalFields = new Map(templateDraft.fields.map(field => [field.id, field]));
                    setTemplateDraft({
                      ...templateDraft,
                      layoutMode: value.layoutMode,
                      sections: value.sections,
                      fields: value.fields.map(field => ({
                        id: field.id,
                        semanticKey: originalFields.get(field.id)?.semanticKey ?? `custom-${field.id}`,
                        label: field.label,
                        type: field.type,
                        sectionId: field.sectionId ?? '',
                        required: field.required,
                        options: field.options,
                        customAnswerOptions: field.customAnswerOptions,
                        settings: field.settings,
                      })),
                    });
                  }}
                />
              </section>
            </>
          )}
        </div>
        <BottomAction>
          {templateDraft.status === 'recommended' ? (
            <button type="button" onClick={() => copyTemplate(templateDraft.id)} className={`${primaryButton} w-full`}><Check className="h-4.5 w-4.5" />使用此模板</button>
          ) : templateDraft.status === 'published' ? (
            <button type="button" onClick={() => toggleTemplateStatus(templateDraft.id, false)} className={`${secondaryButton} w-full`}>禁用档案</button>
          ) : templateDraft.status === 'disabled' ? (
            editingDisabledTemplate ? (
              <div className="grid grid-cols-[0.85fr_1.15fr] gap-3">
                <button type="button" onClick={() => saveDisabledTemplate(false)} className={secondaryButton}>保存修改</button>
                <button type="button" onClick={() => saveDisabledTemplate(true)} className={primaryButton}>重新启用</button>
              </div>
            ) : (
              <div className="grid grid-cols-[0.85fr_1.15fr] gap-3">
                <button type="button" onClick={() => setEditingDisabledTemplate(true)} className={secondaryButton}><FilePenLine className="h-4.5 w-4.5" />编辑档案</button>
                <button type="button" onClick={() => toggleTemplateStatus(templateDraft.id, true)} className={primaryButton}>重新启用</button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-[0.85fr_1.15fr] gap-3">
              <button type="button" onClick={() => saveTemplate(false)} className={secondaryButton}>保存草稿</button>
              <button type="button" onClick={() => saveTemplate(true)} className={primaryButton}>启用档案</button>
            </div>
          )}
        </BottomAction>

      </div>
    );
  };

  let content: React.ReactNode;
  if (pageMode === 'template-create') content = renderTemplateCreate();
  else if (pageMode === 'template-editor') content = renderTemplateEditor();
  else content = renderRoot();

  return (
    <div className="relative h-full min-h-0 overflow-hidden font-sans text-[var(--tm-text-primary)]">
      {content}
      <BottomSheet open={showTemplateMenu} label="档案操作" onDismiss={() => setShowTemplateMenu(false)}>
        <button type="button" onClick={() => { setShowTemplateMenu(false); setShowDeleteConfirm(true); }} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative-strong)]">
          <Trash2 className="h-5 w-5" />{templateDraft?.status === 'draft' ? '删除草稿' : '删除档案'}
        </button>
        <button type="button" onClick={() => setShowTemplateMenu(false)} className={`${secondaryButton} mt-3 w-full`}>取消</button>
      </BottomSheet>
      <BottomSheet open={showDeleteConfirm} label={templateDraft?.status === 'draft' ? '删除草稿' : '删除档案'} onDismiss={() => setShowDeleteConfirm(false)}>
        <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{templateDraft?.status === 'draft' ? '删除草稿？' : `删除“${templateDraft?.name ?? ''}”？`}</h2>
        <p className="mt-2 text-center text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">
          {templateDraft?.status === 'draft' ? '删除后无法恢复' : '删除后，该档案将从档案设计中移除。学生已有草稿和已成档记录不受影响。此操作无法撤销。'}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setShowDeleteConfirm(false)} className={secondaryButton}>取消</button>
          <button type="button" onClick={deleteCurrentTemplate} className="min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative)] px-4 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] transition active:scale-[0.98]">确认删除</button>
        </div>
      </BottomSheet>
      <BottomSheet open={showSystemFieldPicker} label="选择自动带入字段" onDismiss={() => setShowSystemFieldPicker(false)}>
        <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">自动带入</h2>
        <div className="mt-4 divide-y divide-[var(--tm-border-subtle)]">
          {ARCHIVE_SELECTABLE_SYSTEM_FIELD_OPTIONS.map(option => {
            const selected = templateDraft?.systemFields.includes(option.key) ?? false;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  if (!templateDraft) return;
                  const nextFields: ArchiveSystemFieldKey[] = selected
                    ? templateDraft.systemFields.filter(key => key !== option.key)
                    : [...templateDraft.systemFields, option.key];
                  setTemplateDraft({ ...templateDraft, systemFields: nextFields });
                }}
                className="flex min-h-[52px] w-full items-center justify-between text-left text-[14px] font-semibold text-[var(--tm-text-primary)]"
              >
                <span>{option.label}</span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-white' : 'border-[var(--tm-border-subtle)] text-transparent'}`}>
                  <Check className="h-4 w-4" />
                </span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => setShowSystemFieldPicker(false)} className={`${primaryButton} mt-4 w-full`}>完成</button>
      </BottomSheet>
      <Toast message={toast} />
    </div>
  );
};

export default ArchiveDesignView;
