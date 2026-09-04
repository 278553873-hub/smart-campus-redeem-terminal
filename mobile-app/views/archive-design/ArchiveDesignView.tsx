import React, { useEffect, useState } from 'react';
import {
  Check,
  CalendarDays,
  ChevronRight,
  Copy,
  Eye,
  FilePenLine,
  Plus,
  Power,
  PowerOff,
  CircleDot,
  ListChecks,
  Hash,
  ImageOff,
  MessageSquareText,
  ListTree,
  Palette,
  Settings,
  Trash2,
} from 'lucide-react';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import { getTeacherSchoolGradeOptions, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import FormBuilder, { type FormFieldTypeOption } from '../../components/form-builder/FormBuilder';
import FormOutlineSorter, { type FormOutlineValue } from '../../components/form-builder/FormOutlineSorter';
import GrowthFieldCategoryPicker from '../../components/growth/GrowthFieldCategoryPicker';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileDocumentTitleInput from '../../components/ui/MobileDocumentTitleInput';
import MobileFloatingCreateButton from '../../components/ui/MobileFloatingCreateButton';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import { ASSETS } from '../../assets/images';
import { phoneRadius } from '../../styles/teacherMobileTokens';
import type { ConfigurableFormField } from '../../../shared/formDefinition';
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
import {
  ARCHIVE_GROWTH_FIELD_GROUPS,
  cloneRecommendedTemplate,
  createBlankArchiveTemplate,
  createArchiveField,
  deleteArchiveTemplate,
  discardArchiveDesignDrafts,
  getArchiveDesignDraft,
  hasArchiveDesignDraftContent,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  saveArchiveDesignDraft,
  saveArchiveTemplate,
  setArchiveTemplateStatus,
  getArchiveGrowthModulesForFields,
  getArchiveGrowthMissingPolicy,
  type ArchiveGrowthFieldKey,
  type ArchiveFieldType,
  type ArchiveGrowthFieldConfig,
  type ArchiveTemplate,
  type ArchiveWorkspace,
} from '../../../shared/studentArchiveStore';
import {
  getEnabledGrowthFields,
  getGrowthFieldDefinition,
} from '../../../shared/studentGrowthFieldCatalog';
import {
  archiveHeaderImageOptions,
  archiveThemeOptions,
  getArchiveHeaderImage,
  getArchiveHeaderImageId,
  getArchiveTheme,
  getArchiveThemeStyle,
} from './archiveAppearance';

interface ArchiveDesignViewProps {
  onBack: () => void;
  teacherProfile: TeacherProfile;
  spaceId: string;
  classes: ClassInfo[];
  currentSpace: TeacherSpaceOption;
  getStudentsForClass: (classId: string) => Student[];
}

type PageMode = 'root' | 'template-editor';
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

const archiveActionTile = 'flex min-h-[52px] w-full items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-3)] text-left text-[length:var(--tm-font-size-body)] font-semibold transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-muted)]';
const editorToolButton = 'flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-[var(--tm-radius-inner)] bg-transparent text-[length:var(--tm-font-size-badge)] font-semibold leading-none text-[var(--tm-text-secondary)] transition active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] disabled:opacity-35';

const formatTemplateGradeScope = (gradeScopes: string[]) => {
  if (gradeScopes.length === 0) return '未设置年级';
  if (gradeScopes.length <= 2) return gradeScopes.join('、');
  return `${gradeScopes[0]}等${gradeScopes.length}个年级`;
};

const growthBuilderFieldId = (key: ArchiveGrowthFieldKey) => `archive-growth:${key}`;

const cloneTemplateForEditor = (template: ArchiveTemplate): ArchiveTemplate => ({
  ...template,
  appearance: { ...template.appearance },
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


const ArchiveDesignView: React.FC<ArchiveDesignViewProps> = ({ onBack, teacherProfile, spaceId, classes, currentSpace, getStudentsForClass }) => {
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
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [showDraftRecoverySheet, setShowDraftRecoverySheet] = useState(false);
  const [activeTemplateActionId, setActiveTemplateActionId] = useState('');
  const [previewFromList, setPreviewFromList] = useState(false);
  const [showOutlineSheet, setShowOutlineSheet] = useState(false);
  const [showAppearanceSheet, setShowAppearanceSheet] = useState(false);
  const [showBasicSettingsSheet, setShowBasicSettingsSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEnableConfirm, setShowEnableConfirm] = useState(false);
  const [templateNameValidationAttempt, setTemplateNameValidationAttempt] = useState(0);
  const [toast, setToast] = useState('');
  const archiveGrowthFields = getEnabledGrowthFields(spaceId);
  const draftOwnerKey = `${spaceId}:${teacherProfile.name}`;

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
    setShowCreateSheet(false);
    setShowDraftRecoverySheet(false);
    setActiveTemplateActionId('');
    setPreviewFromList(false);
    setShowOutlineSheet(false);
  }, [spaceId]);

  useEffect(() => {
    if (pageMode !== 'template-editor' || templateDraft?.origin !== 'school' || templateDraft.status !== 'draft') return undefined;
    if (!hasArchiveDesignDraftContent(templateDraft)) {
      setWorkspace(current => {
        const next = discardArchiveDesignDrafts(current, draftOwnerKey);
        if (next.templates.length === current.templates.length) return current;
        persistArchiveWorkspace(next);
        return next;
      });
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setWorkspace(current => {
        const next = saveArchiveDesignDraft(current, templateDraft, draftOwnerKey);
        persistArchiveWorkspace(next);
        return next;
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draftOwnerKey, pageMode, templateDraft]);

  const openTemplate = (templateId: string, editorMode?: TemplateEditorMode) => {
    const template = workspace.templates.find(item => item.id === templateId);
    if (!template || template.deletedAt) return;
    setTemplateDraft(cloneTemplateForEditor(template));
    setTemplateNameValidationAttempt(0);
    setTemplateEditorMode(editorMode ?? (template.status === 'draft' ? 'edit' : 'detail'));
    setPageMode('template-editor');
  };

  const previewRecommendedTemplate = (templateId: string) => {
    setShowCreateSheet(false);
    openTemplate(templateId, 'preview');
  };

  const copyTemplate = (templateId: string) => {
    const cleanWorkspace = discardArchiveDesignDrafts(workspace, draftOwnerKey);
    const result = cloneRecommendedTemplate(cleanWorkspace, templateId, draftOwnerKey);
    openTemplateFromWorkspace(result.workspace, result.templateId, 'create');
  };

  const createBlankTemplate = () => {
    setShowCreateSheet(false);
    const cleanWorkspace = discardArchiveDesignDrafts(workspace, draftOwnerKey);
    const result = createBlankArchiveTemplate(cleanWorkspace, draftOwnerKey);
    openTemplateFromWorkspace(result.workspace, result.templateId, 'create');
  };

  const openCreateFlow = () => {
    if (getArchiveDesignDraft(workspace, draftOwnerKey)) {
      setShowDraftRecoverySheet(true);
      return;
    }
    setShowCreateSheet(true);
  };

  const continueDesignDraft = () => {
    const draft = getArchiveDesignDraft(workspace, draftOwnerKey);
    setShowDraftRecoverySheet(false);
    if (draft) openTemplate(draft.id, 'create');
  };

  const restartDesign = () => {
    const next = discardArchiveDesignDrafts(workspace, draftOwnerKey);
    setWorkspace(next);
    persistArchiveWorkspace(next);
    setShowDraftRecoverySheet(false);
    setShowCreateSheet(true);
  };

  const openTemplateFromWorkspace = (nextWorkspace: ArchiveWorkspace, templateId: string, editorMode: TemplateEditorMode) => {
    const template = nextWorkspace.templates.find(item => item.id === templateId);
    if (!template) return;
    setTemplateDraft(cloneTemplateForEditor(template));
    setTemplateNameValidationAttempt(0);
    setTemplateEditorMode(editorMode);
    setPageMode('template-editor');
  };

  const validateCompletedTemplate = (template: ArchiveTemplate) => {
    if (!template.name.trim()) {
      if (templateEditorMode === 'create') {
        setTemplateNameValidationAttempt(attempt => attempt + 1);
        window.requestAnimationFrame(() => {
          const target = document.getElementById('archive-title');
          target?.focus({ preventScroll: true });
          target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      } else {
        setToast('请先填写档案名称');
        window.setTimeout(() => setToast(''), 1800);
      }
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

  const completeTemplateDesign = () => {
    if (!templateDraft || !validateCompletedTemplate(templateDraft)) return;
    const nextTemplate: ArchiveTemplate = { ...templateDraft, status: 'ready', draftOwnerKey: undefined };
    const next = saveArchiveTemplate(workspace, nextTemplate);
    setTemplateDraft(nextTemplate);
    setTemplateEditorMode('detail');
    updateWorkspace(next, '设计已完成');
  };

  const saveDisabledTemplate = () => {
    if (!templateDraft) return;
    const nextTemplate: ArchiveTemplate = { ...templateDraft, status: 'disabled' };
    const next = saveArchiveTemplate(workspace, nextTemplate);
    updateWorkspace(next, '修改已保存');
    setPageMode('root');
  };

  const toggleTemplateStatus = (templateId: string, enable: boolean) => {
    const next = setArchiveTemplateStatus(workspace, templateId, enable ? 'published' : 'disabled');
    updateWorkspace(next, enable ? '档案已启用' : '档案已停用');
    setPageMode('root');
  };

  const savePublishedTemplate = () => {
    if (!templateDraft || !validateCompletedTemplate(templateDraft)) return;
    const nextTemplate: ArchiveTemplate = { ...templateDraft, status: 'published' };
    updateWorkspace(saveArchiveTemplate(workspace, nextTemplate), '修改已保存');
    setTemplateDraft(null);
    setPageMode('root');
  };

  const deleteCurrentTemplate = () => {
    if (!templateDraft) return;
    const result = deleteArchiveTemplate(workspace, templateDraft.id);
    setShowDeleteConfirm(false);
    if (!result.deleted) {
      setToast('当前档案无法删除');
      window.setTimeout(() => setToast(''), 1800);
      return;
    }
    updateWorkspace(result.workspace, '档案已删除');
    setActiveTemplateActionId('');
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

  const setGroupingEnabled = (enabled: boolean) => {
    setTemplateDraft(current => {
      if (!current || (current.layoutMode === 'grouped') === enabled) return current;
      if (!enabled) return { ...current, layoutMode: 'flat' };
      const fallbackSectionId = current.sections[0]?.id;
      return {
        ...current,
        layoutMode: 'grouped',
        fields: current.fields.map(field => current.sections.some(section => section.id === field.sectionId)
          ? field
          : { ...field, sectionId: fallbackSectionId ?? '' }),
        growthFields: current.growthFields.map(field => current.sections.some(section => section.id === field.sectionId)
          ? field
          : { ...field, sectionId: fallbackSectionId }),
      };
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
      />
      <button type="button" onClick={close} className={`${primaryButton} mt-4 w-full`}>完成</button>
    </div>
  );

  const renderTemplates = () => {
    const school = workspace.templates
      .filter(template => template.origin === 'school' && template.status !== 'draft' && !template.deletedAt)
      .sort((left, right) => templateStatusOrder[left.status] - templateStatusOrder[right.status] || right.updatedAt.localeCompare(left.updatedAt));
    return (
      <section className="flex min-h-full flex-col">
        {school.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {school.map(template => {
              const meta = templateStatusMeta[template.status];
              const listHeaderImage = getArchiveHeaderImage(template.appearance);
              const listTheme = getArchiveTheme(template.appearance);
              return (
                <button key={template.id} type="button" onClick={() => setActiveTemplateActionId(template.id)} aria-label={`打开档案操作：${template.name}`} className={`${sectionSurface} block w-full overflow-hidden text-left transition active:scale-[0.985]`}>
                  {listHeaderImage ? (
                    <img src={listHeaderImage} alt="" className="block aspect-[16/7] w-full object-cover" />
                  ) : (
                    <span className="flex aspect-[16/7] w-full items-center justify-center text-[var(--tm-text-disabled)]" style={{ backgroundColor: listTheme.background }} aria-hidden="true">
                      <ImageOff className="h-5 w-5" />
                    </span>
                  )}
                  <span className="flex min-h-[120px] flex-col p-3">
                    <span className="line-clamp-2 min-h-12 text-[length:var(--tm-font-size-card-title)] font-bold leading-6 text-[var(--tm-text-primary)]">{template.name}</span>
                    <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">
                      {formatTemplateGradeScope(template.gradeScopes)}
                    </span>
                    <span className="mt-auto pt-2">
                      <StatusPill className={meta.className}>{meta.label}</StatusPill>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <MobileEmptyState
            imageSrc={ASSETS.DEFAULT_STATE.WORRIED_CLIPBOARD}
            title="暂无档案"
            className="flex-1 pb-14"
            imageClassName="w-[72%] min-w-[188px] max-w-[236px]"
          />
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
        <MobileFloatingCreateButton label="新建档案" emphasis="raised" onClick={openCreateFlow} />
      </div>
    );
  };

  const closeTemplateEditor = () => {
    if (templateDraft?.origin === 'school' && templateDraft.status === 'draft') {
      const next = hasArchiveDesignDraftContent(templateDraft)
        ? saveArchiveDesignDraft(workspace, templateDraft, draftOwnerKey)
        : discardArchiveDesignDrafts(workspace, draftOwnerKey);
      setWorkspace(next);
      persistArchiveWorkspace(next);
    }
    setPreviewFromList(false);
    setShowOutlineSheet(false);
    setPageMode('root');
  };

  const renderTemplateEditor = () => {
    if (!templateDraft) return renderRoot();
    const isFormPreview = templateEditorMode === 'preview';
    const isRecommendedPreview = isFormPreview && templateDraft.status === 'recommended';
    const showFillPreview = isFormPreview || templateEditorMode === 'detail';
    const isCreating = templateEditorMode === 'create';
    const templateNameError = !templateDraft.name.trim() ? '请输入档案名称' : '';
    const isPersisted = workspace.templates.some(template => template.id === templateDraft.id && !template.deletedAt);
    const appearanceTheme = getArchiveTheme(templateDraft.appearance);
    const headerImage = getArchiveHeaderImage(templateDraft.appearance);
    const appearanceStyle = getArchiveThemeStyle(templateDraft.appearance);
    const gradeOptions = getTeacherSchoolGradeOptions(currentSpace)
      ?? ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级', '高一', '高二', '高三'];
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
    const fixedGrowthFieldIds = new Set(growthFieldByBuilderId.keys());
    const getBuilderFieldPreviewMeta = (field: ConfigurableFormField<ArchiveFieldType>) => {
      const config = growthFieldByBuilderId.get(field.id);
      if (!config) return undefined;
      const definition = getGrowthFieldDefinition(config.key as Parameters<typeof getGrowthFieldDefinition>[0]);
      if (!definition) return undefined;
      const placeholder = definition.valueType === 'number'
        ? definition.decimalPlaces === 0
          ? '请输入整数'
          : `请输入数字，保留${definition.decimalPlaces === 2 ? '两' : '一'}位小数`
        : definition.valueType === 'text'
          ? '请输入内容'
          : undefined;
      return { placeholder, suffix: definition.unit };
    };
    const updateBuilderValue = (value: FormOutlineValue<ArchiveFieldType>) => {
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
            required: field.required,
            missingPolicy: field.required ? 'required' : 'supplement',
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
    };
    const closePreview = () => {
      if (isRecommendedPreview) {
        setPageMode('root');
        setShowCreateSheet(true);
        return;
      }
      if (previewFromList) {
        setPreviewFromList(false);
        setTemplateDraft(null);
        setPageMode('root');
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
    const finishEditor = () => {
      if (templateDraft.status === 'published') {
        savePublishedTemplate();
        return;
      }
      if (templateDraft.status === 'disabled') {
        saveDisabledTemplate();
        return;
      }
      completeTemplateDesign();
    };
    const renderEditorToolbar = () => (
      <div className="grid grid-cols-[var(--tm-size-touch)_var(--tm-size-touch)_var(--tm-size-touch)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-[var(--tm-space-2)]">
        <button type="button" disabled={builderFields.length === 0 && templateDraft.sections.length === 0} onClick={() => setShowOutlineSheet(true)} className={editorToolButton} aria-label="大纲"><ListTree className="h-4.5 w-4.5" /><span>大纲</span></button>
        <button type="button" onClick={() => setShowAppearanceSheet(true)} className={editorToolButton} aria-label="风格"><Palette className="h-4.5 w-4.5" /><span>风格</span></button>
        <button type="button" onClick={() => setShowBasicSettingsSheet(true)} className={editorToolButton} aria-label="设置"><Settings className="h-4.5 w-4.5" /><span>设置</span></button>
        <button type="button" onClick={openEditorPreview} className="inline-flex h-11 w-full items-center justify-center rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)]">预览</button>
        <button type="button" onClick={finishEditor} className="inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-2 text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-inverse)] transition active:scale-[0.98] active:bg-[var(--tm-brand-primary-strong)]">完成</button>
      </div>
    );
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
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`} style={appearanceStyle}>
        <PageHeader
          title={pageTitle}
          onBack={() => {
            if (isFormPreview) {
              closePreview();
              return;
            }
            closeTemplateEditor();
          }}
        />
        <div
          className={`flex-1 overflow-y-auto px-5 no-scrollbar ${isCreating ? 'pt-0' : 'pt-4'} ${showFillPreview ? 'pb-28' : 'pb-36'}`}
          style={{ backgroundColor: appearanceTheme.background }}
        >
          {headerImage && (
            <div className={`-mx-5 mb-4 aspect-[16/7] overflow-hidden ${!isCreating ? '-mt-4' : ''}`}>
              <img src={headerImage} alt="" className="block h-full w-full object-cover" />
            </div>
          )}
          {showFillPreview ? (
            <>
              <section className={`${sectionSurface} p-4`}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{templateDraft.name}</h2>
                  </div>
                  <StatusPill className={templateStatusMeta[templateDraft.status].className}>{templateStatusMeta[templateDraft.status].label}</StatusPill>
                </div>
              </section>
              <section className={`${sectionSurface} mt-3 p-4`}>
                <dl className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-tertiary)]">适用年级</dt>
                  <dd className="text-right text-[length:var(--tm-font-size-compact)] font-semibold leading-5 text-[var(--tm-text-primary)]">{templateDraft.gradeScopes.join('、') || '未设置'}</dd>
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
                    showLayoutControl={false}
                    readOnly
                    getFieldPreviewMeta={getBuilderFieldPreviewMeta}
                    fieldTypes={archiveFieldTypes}
                    allowCustomAnswer
                    createField={(type, sectionId) => createArchiveField(type, sectionId ?? '')}
                    onChange={() => undefined}
                  />
                </section>
              )}
            </>
          ) : (
            <>
              {isCreating && (
                <section className="-mx-5 bg-[var(--tm-bg-surface)] px-5 py-4">
                  <MobileDocumentTitleInput
                    id="archive-title"
                    ariaLabel="档案名称"
                    value={templateDraft.name}
                    maxLength={40}
                    onChange={name => setTemplateDraft({ ...templateDraft, name })}
                    placeholder="请输入档案名称"
                    error={templateNameValidationAttempt > 0 ? templateNameError : undefined}
                  />
                </section>
              )}
              {!isCreating && (
                <section className={`${sectionSurface} p-4`}>
                  <label className="block">
                    <span className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">档案名称</span>
                    <input value={templateDraft.name} onChange={event => setTemplateDraft({ ...templateDraft, name: event.target.value })} placeholder="请输入档案名称" className={`${inputClass} mt-2 h-12`} />
                  </label>
                </section>
              )}
              <section className={`${sectionSurface} p-4 ${isCreating ? 'mt-4' : 'mt-3'}`}>
                <div>
                  <div className="mb-2 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">适用年级</div>
                  <div className="flex flex-wrap gap-2">
                    {gradeOptions.map(grade => {
                      const selected = templateDraft.gradeScopes.includes(grade);
                      return (
                        <button key={grade} type="button" onClick={() => setTemplateDraft({ ...templateDraft, gradeScopes: selected ? templateDraft.gradeScopes.filter(item => item !== grade) : [...templateDraft.gradeScopes, grade] })} className={`min-h-[var(--tm-size-touch)] ${phoneRadius.sm} px-3 text-[length:var(--tm-font-size-meta)] font-semibold ${selected ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]'}`}>
                          {grade}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="mt-6">
                <h2 className="mb-3 px-1 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">档案内容</h2>
                <FormBuilder
                  layoutMode={templateDraft.layoutMode}
                  sections={templateDraft.sections}
                  fields={builderFields}
                  itemLabel="字段"
                  showItemLabel={false}
                  showLayoutControl={false}
                  sortingMode="external"
                  addButtonLabel="内容"
                  typePickerTitle="添加内容"
                  typePickerPrimaryLabel="手动填写"
                  typePickerSecondaryTab={{
                    label: '成长数据',
                    description: '成长数据用于持续记录身高、视力等学生信息，可在多个成长场景复用；字段名称和选项由系统统一定义，不能修改。',
                    render: (close, sectionId) => renderGrowthDataPicker(close, sectionId),
                  }}
                  fixedContentFieldIds={fixedGrowthFieldIds}
                  getFieldPreviewMeta={getBuilderFieldPreviewMeta}
                  smartDefaultContent
                  fieldTypes={archiveFieldTypes}
                  allowCustomAnswer
                  createField={(type, sectionId) => {
                    return createArchiveField(type, sectionId ?? '');
                  }}
                  onChange={updateBuilderValue}
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
          ) : templateEditorMode === 'create' || templateEditorMode === 'edit' ? (
            renderEditorToolbar()
          ) : templateDraft.status === 'ready' && templateEditorMode === 'detail' ? (
            <div className="grid grid-cols-[0.85fr_1.15fr] gap-3">
              <button type="button" onClick={() => setTemplateEditorMode('edit')} className={secondaryButton}><FilePenLine className="h-4.5 w-4.5" />继续编辑</button>
              <button type="button" onClick={() => setShowEnableConfirm(true)} className={primaryButton}>启用档案</button>
            </div>
          ) : templateDraft.status === 'published' ? (
            <button type="button" onClick={() => toggleTemplateStatus(templateDraft.id, false)} className={`${secondaryButton} w-full`}>停用档案</button>
          ) : templateDraft.status === 'disabled' ? (
            <div className="grid grid-cols-[0.85fr_1.15fr] gap-3">
              <button type="button" onClick={() => setTemplateEditorMode('edit')} className={secondaryButton}><FilePenLine className="h-4.5 w-4.5" />编辑档案</button>
              <button type="button" onClick={() => toggleTemplateStatus(templateDraft.id, true)} className={primaryButton}>重新启用</button>
            </div>
          ) : (
            renderEditorToolbar()
          )}
        </BottomAction>

        <MobileBottomSheet open={showOutlineSheet} title="大纲" onClose={() => setShowOutlineSheet(false)}>
          <div style={appearanceStyle}>
            <FormOutlineSorter
              layoutMode={templateDraft.layoutMode}
              sections={templateDraft.sections}
              fields={builderFields}
              itemLabel="字段"
              onChange={updateBuilderValue}
            />
          </div>
        </MobileBottomSheet>

      </div>
    );
  };

  let content: React.ReactNode;
  if (pageMode === 'template-editor') content = renderTemplateEditor();
  else content = renderRoot();

  const recommendedTemplates = workspace.templates.filter(template => template.origin === 'recommended' && !template.deletedAt);
  const activeTemplateAction = workspace.templates.find(template => template.id === activeTemplateActionId && !template.deletedAt);

  const editActiveTemplate = () => {
    if (!activeTemplateAction) return;
    const templateId = activeTemplateAction.id;
    setActiveTemplateActionId('');
    openTemplate(templateId, 'edit');
  };

  const previewActiveTemplate = () => {
    if (!activeTemplateAction) return;
    const templateId = activeTemplateAction.id;
    setActiveTemplateActionId('');
    setPreviewFromList(true);
    openTemplate(templateId, 'preview');
  };

  const enableActiveTemplate = () => {
    if (!activeTemplateAction) return;
    setTemplateDraft(cloneTemplateForEditor(activeTemplateAction));
    setActiveTemplateActionId('');
    setShowEnableConfirm(true);
  };

  const stopActiveTemplate = () => {
    if (!activeTemplateAction) return;
    const templateId = activeTemplateAction.id;
    setActiveTemplateActionId('');
    toggleTemplateStatus(templateId, false);
  };

  const duplicateActiveTemplate = () => {
    if (!activeTemplateAction) return;
    const templateId = activeTemplateAction.id;
    setActiveTemplateActionId('');
    setPreviewFromList(false);
    copyTemplate(templateId);
  };

  const deleteActiveTemplate = () => {
    if (!activeTemplateAction) return;
    setTemplateDraft(cloneTemplateForEditor(activeTemplateAction));
    setActiveTemplateActionId('');
    setShowDeleteConfirm(true);
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden font-sans text-[var(--tm-text-primary)]">
      {content}
      <MobileBottomSheet open={Boolean(activeTemplateAction)} title={activeTemplateAction?.name ?? ''} onClose={() => setActiveTemplateActionId('')}>
        {activeTemplateAction && (
          <div className="pb-2">
            <div className="pb-1">
              <StatusPill className={templateStatusMeta[activeTemplateAction.status].className}>{templateStatusMeta[activeTemplateAction.status].label}</StatusPill>
            </div>

            {activeTemplateAction.status === 'published' ? (
              <button type="button" onClick={stopActiveTemplate} className="mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] px-4 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)]"><PowerOff className="h-5 w-5 text-[var(--tm-text-secondary)]" />停用档案</button>
            ) : (
              <button type="button" onClick={enableActiveTemplate} className={`${primaryButton} mt-3 w-full`}><Power className="h-5 w-5" />{activeTemplateAction.status === 'disabled' ? '重新启用' : '启用档案'}</button>
            )}

            <section className="mt-5">
              <h4 className="px-0.5 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">问卷设计</h4>
              <div className="mt-2 grid grid-cols-2 gap-[var(--tm-space-2)]">
                <button type="button" onClick={previewActiveTemplate} className={`${archiveActionTile} text-[var(--tm-text-primary)]`}><Eye className="h-5 w-5 shrink-0 text-[var(--tm-text-tertiary)]" />预览</button>
                <button type="button" onClick={editActiveTemplate} className={`${archiveActionTile} text-[var(--tm-text-primary)]`}><FilePenLine className="h-5 w-5 shrink-0 text-[var(--tm-text-tertiary)]" />编辑</button>
              </div>
            </section>

            <section className="mt-5">
              <h4 className="px-0.5 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">更多操作</h4>
              <div className="mt-2 grid grid-cols-2 gap-[var(--tm-space-2)]">
                <button type="button" onClick={duplicateActiveTemplate} className={`${archiveActionTile} text-[var(--tm-text-primary)]`}><Copy className="h-5 w-5 shrink-0 text-[var(--tm-text-tertiary)]" />复制档案</button>
                <button type="button" onClick={deleteActiveTemplate} className={`${archiveActionTile} text-[var(--tm-status-negative)]`}><Trash2 className="h-5 w-5 shrink-0" />删除档案</button>
              </div>
            </section>
          </div>
        )}
      </MobileBottomSheet>
      <MobileBottomSheet open={showCreateSheet} title="新建档案" onClose={() => setShowCreateSheet(false)}>
        <button type="button" onClick={createBlankTemplate} className="flex min-h-[72px] w-full items-center gap-3 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-4 text-left [box-shadow:var(--tm-shadow-card-on-white)] transition active:scale-[0.985] active:bg-[var(--tm-bg-surface-soft)]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]">
            <Plus className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">完全新建</span>
          <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-disabled)]" />
        </button>
        <div className="-mx-[var(--tm-space-4)] mt-5 bg-[var(--tm-bg-surface)] pb-4 pt-4">
          <h3 className="mb-3 px-[var(--tm-space-4)] text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">从模版新建</h3>
          <div className="snap-x snap-mandatory overflow-x-auto px-[var(--tm-space-4)] pb-2 pt-1 no-scrollbar" aria-label="档案模板">
            <div className="flex w-max gap-3 pr-8">
              {recommendedTemplates.map(template => {
                const thumbnail = getArchiveHeaderImage(template.appearance);
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => previewRecommendedTemplate(template.id)}
                    className="w-[220px] snap-start overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] text-left [box-shadow:var(--tm-shadow-card-on-white)] transition active:scale-[0.985]"
                    aria-label={`使用模板：${template.name}`}
                  >
                    {thumbnail && <img src={thumbnail} alt="" className="aspect-[16/7] w-full object-cover" />}
                    <span className="block min-w-0 p-4">
                      <span className="block truncate text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">{template.name}</span>
                      <span className="mt-1 block truncate text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{formatTemplateGradeScope(template.gradeScopes)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </MobileBottomSheet>
      <MobileBottomSheet open={showDraftRecoverySheet} title="继续编辑" onClose={() => setShowDraftRecoverySheet(false)}>
        <h3 className="text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">发现一份未完成的档案</h3>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={restartDesign} className={secondaryButton}>重新创建</button>
          <button type="button" onClick={continueDesignDraft} className={primaryButton}>继续编辑</button>
        </div>
      </MobileBottomSheet>
      <MobileBottomSheet open={showAppearanceSheet} title="外观设置" onClose={() => setShowAppearanceSheet(false)}>
        {templateDraft && (
          <div className="pb-2">
            <section>
              <h3 className="text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">主题风格</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {archiveThemeOptions.map(theme => {
                  const selected = templateDraft.appearance.themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setTemplateDraft({ ...templateDraft, appearance: { ...templateDraft.appearance, themeId: theme.id } })}
                      className={`flex min-h-[56px] items-center gap-3 rounded-[var(--tm-radius-control)] px-3 text-left transition ${selected ? 'bg-[var(--tm-brand-primary-soft)] ring-2 ring-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card-on-white)]'}`}
                    >
                      <span className="h-8 w-8 shrink-0 rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)]" style={{ backgroundColor: theme.swatch }} />
                      <span className="min-w-0 flex-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{theme.label}</span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-[var(--tm-brand-primary)]" />}
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="mt-6">
              <h3 className="text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">档案头图</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {archiveHeaderImageOptions.map(option => {
                  const selected = getArchiveHeaderImageId(templateDraft.appearance) === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-label={`选择档案头图：${option.label}`}
                      aria-pressed={selected}
                      onClick={() => setTemplateDraft({ ...templateDraft, appearance: { ...templateDraft.appearance, headerImageId: option.id } })}
                      className={`relative overflow-hidden rounded-[var(--tm-radius-card)] text-left transition ${selected ? 'ring-2 ring-[var(--tm-brand-primary)]' : '[box-shadow:var(--tm-shadow-card-on-white)]'}`}
                    >
                      {option.image
                        ? <img src={option.image} alt="" className="aspect-[16/7] w-full object-cover" />
                        : <span className="flex aspect-[16/7] w-full items-center justify-center bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-tertiary)]"><ImageOff className="h-5 w-5" /></span>}
                      {selected && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] [box-shadow:var(--tm-shadow-control)]"><Check className="h-4 w-4" /></span>}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </MobileBottomSheet>
      <MobileBottomSheet open={showBasicSettingsSheet} title="基础设置" onClose={() => setShowBasicSettingsSheet(false)}>
        {templateDraft && (
          <div className="divide-y divide-[var(--tm-border-subtle)] pb-2">
            <section className="flex min-h-[64px] items-center justify-between gap-4">
              <span className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">展示分组</span>
              <button
                type="button"
                role="switch"
                aria-label="展示分组"
                aria-checked={templateDraft.layoutMode === 'grouped'}
                onClick={() => setGroupingEnabled(templateDraft.layoutMode !== 'grouped')}
                className={`flex h-7 w-12 shrink-0 rounded-full p-0.5 transition ${templateDraft.layoutMode === 'grouped' ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-border-control)]'}`}
              >
                <span className={`h-6 w-6 rounded-full bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-control)] transition-all ${templateDraft.layoutMode === 'grouped' ? 'ml-5' : ''}`} />
              </button>
            </section>
            <section className="py-4">
              <h3 className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">档案更新规则</h3>
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1" role="radiogroup" aria-label="档案更新规则">
                {([['once', '仅填写一次'], ['continuous', '可重复填写']] as const).map(([value, label]) => {
                  const selected = templateDraft.generationMode === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTemplateDraft({ ...templateDraft, generationMode: value })}
                      className={`min-h-11 rounded-[calc(var(--tm-radius-control)-4px)] px-2 text-[length:var(--tm-font-size-compact)] font-semibold ${selected ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </MobileBottomSheet>
      <BottomSheet open={showDeleteConfirm} label="删除档案" onDismiss={() => setShowDeleteConfirm(false)}>
        <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">删除“{templateDraft?.name ?? ''}”？</h2>
        <p className="mt-2 text-center text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">
          删除后，该档案将从档案设计中移除。学生已有档案和更新记录不受影响。此操作无法撤销。
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setShowDeleteConfirm(false)} className={secondaryButton}>取消</button>
          <button type="button" onClick={deleteCurrentTemplate} className="min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative)] px-4 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] transition active:scale-[0.98]">确认删除</button>
        </div>
      </BottomSheet>
      <BottomSheet open={showEnableConfirm} label={templateDraft?.status === 'disabled' ? '重新启用档案' : '启用档案'} onDismiss={() => setShowEnableConfirm(false)}>
        <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{templateDraft?.status === 'disabled' ? '重新启用' : '启用'}“{templateDraft?.name ?? ''}”？</h2>
        <p className="mt-2 text-center text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">
          启用后，老师可以在问卷采集中按此档案发起采集。
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
            {templateDraft?.status === 'disabled' ? '确认重新启用' : '确认启用'}
          </button>
        </div>
      </BottomSheet>
      <Toast message={toast} />
    </div>
  );
};

export default ArchiveDesignView;
