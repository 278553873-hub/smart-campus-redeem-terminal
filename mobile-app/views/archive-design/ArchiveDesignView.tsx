import React, { useEffect, useState } from 'react';
import {
  Check,
  CalendarDays,
  ChevronRight,
  FilePenLine,
  Files,
  Eye,
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
import GrowthFieldCategoryPicker from '../../components/growth/GrowthFieldCategoryPicker';
import MobileFloatingCreateButton from '../../components/ui/MobileFloatingCreateButton';
import type { ConfigurableFormField } from '../../../shared/formDefinition';
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
  ARCHIVE_GROWTH_FIELD_GROUPS,
  cloneRecommendedTemplate,
  createBlankArchiveTemplate,
  createArchiveField,
  deleteArchiveTemplate,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  saveArchiveTemplate,
  setArchiveTemplateStatus,
  getArchiveGrowthModulesForFields,
  getArchiveGrowthMissingPolicy,
  type ArchiveGrowthFieldKey,
  type ArchiveFieldType,
  type ArchiveGrowthFieldConfig,
  type ArchiveGrowthMissingPolicy,
  type ArchiveTemplate,
  type ArchiveWorkspace,
} from '../../../shared/studentArchiveStore';
import {
  getEnabledGrowthFields,
  getGrowthFieldDefinition,
} from '../../../shared/studentGrowthFieldCatalog';

interface ArchiveDesignViewProps {
  onBack: () => void;
  teacherProfile: TeacherProfile;
  spaceId: string;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
}

type PageMode = 'root' | 'template-create' | 'template-editor';
type TemplateEditorMode = 'create' | 'edit' | 'preview' | 'detail';

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
  ready: { label: '待启用', className: 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]' },
  published: { label: '使用中', className: 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' },
  disabled: { label: '已停用', className: 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]' },
};

const templateStatusOrder: Record<ArchiveTemplate['status'], number> = {
  ready: 0,
  draft: 1,
  published: 2,
  disabled: 3,
  recommended: 4,
};

const growthBuilderFieldId = (key: ArchiveGrowthFieldKey) => `archive-growth:${key}`;

const getGrowthBuilderField = (
  config: ArchiveGrowthFieldConfig,
  fallbackSectionId: string | undefined,
): ConfigurableFormField<ArchiveFieldType> => {
  const definition = getGrowthFieldDefinition(config.key as Parameters<typeof getGrowthFieldDefinition>[0]);
  const legacyField = ARCHIVE_GROWTH_FIELD_GROUPS
    .flatMap(group => group.fields)
    .find(field => field.key === config.key);
  const type: ArchiveFieldType = definition?.valueType === 'number'
    ? 'number'
    : definition?.valueType === 'single-select'
      ? 'single-select'
      : 'text';
  return {
    id: growthBuilderFieldId(config.key),
    label: definition?.label ?? legacyField?.label ?? config.key,
    type,
    required: getArchiveGrowthMissingPolicy(config) === 'required',
    options: [...(definition?.options ?? [])],
    sectionId: config.sectionId ?? fallbackSectionId,
    settings: type === 'number' ? {
      numberFormat: definition?.decimalPlaces === 2 ? 'decimal-2' : definition?.decimalPlaces === 1 ? 'decimal-1' : 'integer',
      minValue: definition?.minValue,
      maxValue: definition?.maxValue,
    } : undefined,
  };
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
  const [showEnableConfirm, setShowEnableConfirm] = useState(false);
  const [toast, setToast] = useState('');
  const archiveGrowthFields = getEnabledGrowthFields(spaceId);

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

  const openTemplate = (templateId: string, editorMode?: TemplateEditorMode) => {
    const template = workspace.templates.find(item => item.id === templateId);
    if (!template || template.deletedAt) return;
    setTemplateDraft({
      ...template,
      systemFields: [...template.systemFields],
      growthModules: template.growthModules.map(item => ({ ...item })),
      growthFields: template.growthFields.map(item => ({ ...item })),
      sections: template.sections.map(item => ({ ...item })),
      fields: template.fields.map(item => ({
        ...item,
        options: [...item.options],
        customAnswerOptions: [...(item.customAnswerOptions ?? [])],
        settings: item.settings ? { ...item.settings } : undefined,
      })),
    });
    setEditingDisabledTemplate(false);
    setTemplateEditorMode(editorMode ?? (template.status === 'draft' ? 'edit' : 'detail'));
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
      growthModules: template.growthModules.map(item => ({ ...item })),
      growthFields: template.growthFields.map(item => ({ ...item })),
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

  const validateCompletedTemplate = (template: ArchiveTemplate) => {
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
    if (template.fields.length === 0 && template.growthFields.length === 0) {
      setToast('请至少添加一项档案内容');
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
    if (template.layoutMode === 'grouped' && (
      template.fields.some(field => !field.sectionId || !template.sections.some(section => section.id === field.sectionId))
      || template.growthFields.some(field => !field.sectionId || !template.sections.some(section => section.id === field.sectionId))
    )) {
      setToast('请为所有字段选择分组');
      window.setTimeout(() => setToast(''), 1800);
      return false;
    }
    return true;
  };

  const saveTemplateDraft = () => {
    if (!templateDraft) return;
    const nextTemplate: ArchiveTemplate = { ...templateDraft, status: 'draft' };
    const next = saveArchiveTemplate(workspace, nextTemplate);
    updateWorkspace(next, '草稿已保存');
    setPageMode('root');
  };

  const completeTemplateDesign = () => {
    if (!templateDraft || !validateCompletedTemplate(templateDraft)) return;
    const nextTemplate: ArchiveTemplate = { ...templateDraft, status: 'ready' };
    const next = saveArchiveTemplate(workspace, nextTemplate);
    setTemplateDraft(nextTemplate);
    setTemplateEditorMode('detail');
    updateWorkspace(next, '设计已完成');
  };

  const saveDisabledTemplate = (enable: boolean) => {
    if (!templateDraft || (enable && !validateCompletedTemplate(templateDraft))) return;
    const nextTemplate: ArchiveTemplate = { ...templateDraft, status: enable ? 'published' : 'disabled' };
    const next = saveArchiveTemplate(workspace, nextTemplate);
    setEditingDisabledTemplate(false);
    updateWorkspace(next, enable ? '档案已启用' : '修改已保存');
    setPageMode('root');
  };

  const toggleTemplateStatus = (templateId: string, enable: boolean) => {
    const next = setArchiveTemplateStatus(workspace, templateId, enable ? 'published' : 'disabled');
    updateWorkspace(next, enable ? '档案已启用' : '档案已停用');
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

  const updateGrowthFields = (growthFields: ArchiveGrowthFieldConfig[]) => {
    if (!templateDraft) return;
    setTemplateDraft({
      ...templateDraft,
      growthFields,
      growthModules: getArchiveGrowthModulesForFields(growthFields),
    });
  };

  const renderGrowthDataPicker = (close: () => void, sectionId?: string) => (
    <div>
      <GrowthFieldCategoryPicker
        fields={archiveGrowthFields}
        isSelected={field => Boolean(templateDraft?.growthFields.some(item => item.key === field.key))}
        onToggle={field => {
          const selected = Boolean(templateDraft?.growthFields.some(item => item.key === field.key));
          updateGrowthFields(selected
            ? (templateDraft?.growthFields ?? []).filter(item => item.key !== field.key)
            : [...(templateDraft?.growthFields ?? []), {
                key: field.key,
                sectionId: templateDraft?.layoutMode === 'grouped'
                  ? sectionId ?? templateDraft.sections[0]?.id
                  : undefined,
                order: templateDraft ? templateDraft.fields.length + templateDraft.growthFields.length : 0,
                required: false,
                missingPolicy: 'supplement',
              }]);
        }}
        getFieldHint={field => field.unit}
        renderFieldAccessory={field => {
          const config = templateDraft?.growthFields.find(item => item.key === field.key);
          if (!config) return null;
          return (
            <select
              aria-label={`${field.label}是否必填`}
              value={config.required ? 'required' : 'supplement'}
              onChange={event => {
                const missingPolicy = event.currentTarget.value as ArchiveGrowthMissingPolicy;
                updateGrowthFields((templateDraft?.growthFields ?? []).map(item => item.key === field.key
                  ? { ...item, missingPolicy, required: missingPolicy === 'required' }
                  : item));
              }}
              className="h-11 max-w-[104px] shrink-0 appearance-none rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] px-2 text-center text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-text-secondary)]"
            >
              <option value="supplement">选填</option>
              <option value="required">必填</option>
            </select>
          );
        }}
      />
      <button type="button" onClick={close} className={`${primaryButton} mt-4 w-full`}>完成</button>
    </div>
  );

  const renderTemplates = () => {
    const school = workspace.templates
      .filter(template => template.origin === 'school' && !template.deletedAt)
      .sort((left, right) => templateStatusOrder[left.status] - templateStatusOrder[right.status] || right.updatedAt.localeCompare(left.updatedAt));
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
              <button key={template.id} type="button" onClick={() => openTemplate(template.id)} className={`${sectionSurface} flex min-h-[76px] w-full items-center gap-3 p-4 text-left transition active:scale-[0.985]`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]">
                  <FilePenLine className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-[15px] font-bold text-[var(--tm-text-primary)]">{template.name}</span>
                  <StatusPill className={meta.className}>{meta.label}</StatusPill>
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
          <button type="button" onClick={createBlankTemplate} className={`${sectionSurface} flex min-h-[82px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><Plus className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold text-[var(--tm-text-primary)]">空白档案</span><span className="mt-1.5 block text-[12px] font-medium text-[var(--tm-text-secondary)]">0个分组 · 0个字段</span></span>
            <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-disabled)]" />
          </button>
          <h2 className="mb-3 mt-6 text-[16px] font-bold text-[var(--tm-text-primary)]">从模板创建</h2>
          <div className="space-y-2.5">
            {recommended.map(template => (
              <button key={template.id} type="button" onClick={() => previewRecommendedTemplate(template.id)} className={`${sectionSurface} flex min-h-[82px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><Files className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold text-[var(--tm-text-primary)]">{template.name}</span></span>
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
    const isFormPreview = templateEditorMode === 'preview';
    const isRecommendedPreview = isFormPreview && templateDraft.status === 'recommended';
    const showFillPreview = isFormPreview || templateEditorMode === 'detail';
    const isCreating = templateEditorMode === 'create';
    const isPersisted = workspace.templates.some(template => template.id === templateDraft.id && !template.deletedAt);
    const canDelete = !editingDisabledTemplate && isPersisted && templateDraft.origin === 'school' && (templateDraft.status === 'draft' || templateDraft.status === 'ready' || templateDraft.status === 'disabled');
    const gradeOptions = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级', '高一', '高二', '高三'];
    const fallbackSectionId = templateDraft.layoutMode === 'grouped' ? templateDraft.sections[0]?.id : undefined;
    const combinedBuilderEntries: Array<{ order: number; field: ConfigurableFormField<ArchiveFieldType> }> = [
      ...templateDraft.growthFields.map((config, index) => ({
        order: config.order ?? index,
        field: getGrowthBuilderField(config, fallbackSectionId),
      })),
      ...templateDraft.fields.map((field, index) => ({
        order: field.order ?? templateDraft.growthFields.length + index,
        field: {
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options,
          sectionId: field.sectionId || fallbackSectionId,
          customAnswerOptions: field.customAnswerOptions,
          settings: field.settings,
        },
      })),
    ];
    const builderFields = combinedBuilderEntries
      .sort((left, right) => left.order - right.order)
      .map(item => item.field);
    const growthFieldByBuilderId = new Map(templateDraft.growthFields.map(field => [growthBuilderFieldId(field.key), field]));
    const lockedGrowthFieldIds = new Set(growthFieldByBuilderId.keys());
    const closePreview = () => {
      if (isRecommendedPreview) {
        setPageMode('template-create');
        return;
      }
      setTemplateEditorMode(isPersisted ? 'edit' : 'create');
    };
    const openEditorPreview = () => {
      if (templateDraft.fields.length === 0 && templateDraft.growthFields.length === 0) {
        setToast('添加内容后即可预览');
        window.setTimeout(() => setToast(''), 1800);
        return;
      }
      setTemplateEditorMode('preview');
    };
    const pageTitle = isRecommendedPreview
      ? '模板预览'
      : isFormPreview
        ? '档案预览'
        : templateEditorMode === 'detail'
          ? '档案详情'
          : isCreating
            ? '新建档案'
            : '编辑档案';
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader
          title={pageTitle}
          onBack={() => {
            if (isFormPreview) {
              closePreview();
              return;
            }
            setEditingDisabledTemplate(false);
            setPageMode('root');
          }}
        />
        <div className={`flex-1 overflow-y-auto px-5 pt-4 no-scrollbar ${showFillPreview ? 'pb-28' : 'pb-36'}`}>
          {showFillPreview ? (
            <>
              <section className={`${sectionSurface} p-4`}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-[16px] font-bold text-[var(--tm-text-primary)]">{templateDraft.name}</h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <StatusPill className={templateStatusMeta[templateDraft.status].className}>{templateStatusMeta[templateDraft.status].label}</StatusPill>
                    {templateEditorMode === 'detail' && canDelete && (
                      <button type="button" onClick={() => setShowTemplateMenu(true)} className={iconButton} aria-label="档案操作">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                <dl className="mt-3 flex items-start justify-between gap-4 border-t border-[var(--tm-border-subtle)] pt-3">
                  <dt className="shrink-0 text-[12px] font-semibold text-[var(--tm-text-tertiary)]">适用年级</dt>
                  <dd className="text-right text-[13px] font-semibold leading-5 text-[var(--tm-text-primary)]">{templateDraft.gradeScopes.join('、') || '未设置'}</dd>
                </dl>
              </section>

              {(templateDraft.fields.length > 0 || templateDraft.growthFields.length > 0) && (
                <section className="mt-5">
                  <FormBuilder
                    layoutMode={templateDraft.layoutMode}
                    sections={templateDraft.sections}
                    fields={builderFields}
                    itemLabel="字段"
                    showItemLabel={false}
                    readOnly
                    lockedFieldIds={lockedGrowthFieldIds}
                    getLockedFieldSubtitle={field => {
                      const config = growthFieldByBuilderId.get(field.id);
                      if (!config) return undefined;
                      const definition = getGrowthFieldDefinition(config.key as Parameters<typeof getGrowthFieldDefinition>[0]);
                      return `成长数据${definition?.unit ? ` · ${definition.unit}` : ''}`;
                    }}
                    fieldTypes={archiveFieldTypes}
                    allowCustomAnswer
                    createField={(type, sectionId) => ({ ...createArchiveField(sectionId ?? ''), type })}
                    onChange={() => undefined}
                  />
                </section>
              )}
            </>
          ) : (
            <>
              <section className={`${sectionSurface} relative space-y-4 p-4`}>
                {canDelete && (
                  <button type="button" onClick={() => setShowTemplateMenu(true)} className={`${iconButton} absolute right-1.5 top-1.5`} aria-label="档案操作">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                )}
                <label className={`block ${canDelete ? 'pr-10' : ''}`}>
                  <span className="text-[12px] font-semibold text-[var(--tm-text-secondary)]">模板名称</span>
                  <input value={templateDraft.name} onChange={event => setTemplateDraft({ ...templateDraft, name: event.target.value })} className={`${inputClass} mt-2 h-12`} />
                </label>
                <div>
                  <div className="mb-2 text-[12px] font-semibold text-[var(--tm-text-secondary)]">适用年级</div>
                  <div className="flex flex-wrap gap-2">
                    {gradeOptions.map(grade => {
                      const selected = templateDraft.gradeScopes.includes(grade);
                      return (
                        <button key={grade} type="button" onClick={() => setTemplateDraft({ ...templateDraft, gradeScopes: selected ? templateDraft.gradeScopes.filter(item => item !== grade) : [...templateDraft.gradeScopes, grade] })} className={`min-h-9 rounded-full px-3 text-[12px] font-semibold ${selected ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]'}`}>
                          {grade}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="mt-6">
                <h2 className="mb-3 px-1 text-[15px] font-bold text-[var(--tm-text-primary)]">档案内容</h2>
                <FormBuilder
                  layoutMode={templateDraft.layoutMode}
                  sections={templateDraft.sections}
                  fields={builderFields}
                  itemLabel="字段"
                  showItemLabel={false}
                  addButtonLabel="内容"
                  typePickerTitle="添加内容"
                  typePickerPrimaryLabel="手动填写"
                  typePickerSecondaryTab={{ label: '成长数据', render: (close, sectionId) => renderGrowthDataPicker(close, sectionId) }}
                  lockedFieldIds={lockedGrowthFieldIds}
                  getLockedFieldSubtitle={field => {
                    const config = growthFieldByBuilderId.get(field.id);
                    if (!config) return undefined;
                    const definition = getGrowthFieldDefinition(config.key as Parameters<typeof getGrowthFieldDefinition>[0]);
                    return `成长数据${definition?.unit ? ` · ${definition.unit}` : ''}`;
                  }}
                  fieldTypes={archiveFieldTypes}
                  allowCustomAnswer
                  createField={(type, sectionId) => {
                    const field = createArchiveField(sectionId ?? '');
                    return { ...field, type };
                  }}
                  onChange={value => {
                    const originalFields = new Map(templateDraft.fields.map(field => [field.id, field]));
                    const nextGrowthFields: ArchiveGrowthFieldConfig[] = [];
                    const nextManualFields: ArchiveTemplate['fields'] = [];
                    value.fields.forEach((field, order) => {
                      const growthConfig = growthFieldByBuilderId.get(field.id);
                      if (growthConfig) {
                        nextGrowthFields.push({
                          ...growthConfig,
                          sectionId: value.layoutMode === 'grouped' ? field.sectionId : undefined,
                          order,
                        });
                        return;
                      }
                      nextManualFields.push({
                        id: field.id,
                        semanticKey: originalFields.get(field.id)?.semanticKey ?? `custom-${field.id}`,
                        label: field.label,
                        type: field.type,
                        sectionId: value.layoutMode === 'grouped' ? field.sectionId ?? '' : '',
                        order,
                        required: field.required,
                        options: field.options,
                        customAnswerOptions: field.customAnswerOptions,
                        settings: field.settings,
                      });
                    });
                    setTemplateDraft({
                      ...templateDraft,
                      layoutMode: value.layoutMode,
                      sections: value.sections,
                      growthFields: nextGrowthFields,
                      growthModules: getArchiveGrowthModulesForFields(nextGrowthFields),
                      fields: nextManualFields,
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
          ) : isFormPreview ? (
            <button type="button" onClick={closePreview} className={`${primaryButton} w-full`}>结束预览</button>
          ) : templateDraft.status === 'ready' && templateEditorMode === 'detail' ? (
            <div className="grid grid-cols-[0.85fr_1.15fr] gap-3">
              <button type="button" onClick={() => setTemplateEditorMode('edit')} className={secondaryButton}><FilePenLine className="h-4.5 w-4.5" />继续编辑</button>
              <button type="button" onClick={() => setShowEnableConfirm(true)} className={primaryButton}>启用档案</button>
            </div>
          ) : templateDraft.status === 'published' ? (
            <button type="button" onClick={() => toggleTemplateStatus(templateDraft.id, false)} className={`${secondaryButton} w-full`}>停用档案</button>
          ) : templateDraft.status === 'disabled' ? (
            editingDisabledTemplate ? (
              <div className="grid grid-cols-[0.85fr_1.15fr] gap-3">
                <button type="button" onClick={() => saveDisabledTemplate(false)} className={secondaryButton}>保存修改</button>
                <button type="button" onClick={() => saveDisabledTemplate(true)} className={primaryButton}>重新启用</button>
              </div>
            ) : (
              <div className="grid grid-cols-[0.85fr_1.15fr] gap-3">
                <button type="button" onClick={() => { setEditingDisabledTemplate(true); setTemplateEditorMode('edit'); }} className={secondaryButton}><FilePenLine className="h-4.5 w-4.5" />编辑档案</button>
                <button type="button" onClick={() => toggleTemplateStatus(templateDraft.id, true)} className={primaryButton}>重新启用</button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-[44px_minmax(0,0.9fr)_minmax(0,1.2fr)] items-center gap-2.5">
              <button type="button" onClick={openEditorPreview} className={`${iconButton} border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-control)]`} aria-label="预览档案" title="预览档案"><Eye className="h-5 w-5" /></button>
              <button type="button" onClick={saveTemplateDraft} className={`${secondaryButton} px-2`}>保存草稿</button>
              <button type="button" onClick={completeTemplateDesign} className={`${primaryButton} px-3`}>完成设计</button>
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
          {templateDraft?.status === 'draft' ? '删除后无法恢复' : '删除后，该档案将从档案设计中移除。学生已有档案和更新记录不受影响。此操作无法撤销。'}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setShowDeleteConfirm(false)} className={secondaryButton}>取消</button>
          <button type="button" onClick={deleteCurrentTemplate} className="min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative)] px-4 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] transition active:scale-[0.98]">确认删除</button>
        </div>
      </BottomSheet>
      <BottomSheet open={showEnableConfirm} label="启用档案" onDismiss={() => setShowEnableConfirm(false)}>
        <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">启用“{templateDraft?.name ?? ''}”？</h2>
        <p className="mt-2 text-center text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">
          启用后，老师可以在采集管理中按此档案发起采集。
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setShowEnableConfirm(false)} className={secondaryButton}>取消</button>
          <button
            type="button"
            onClick={() => {
              if (!templateDraft) return;
              setShowEnableConfirm(false);
              toggleTemplateStatus(templateDraft.id, true);
            }}
            className={primaryButton}
          >
            确认启用
          </button>
        </div>
      </BottomSheet>
      <Toast message={toast} />
    </div>
  );
};

export default ArchiveDesignView;
