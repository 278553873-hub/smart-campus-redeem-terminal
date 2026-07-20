import React, { useEffect, useState } from 'react';
import {
  Archive,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Clock3,
  Copy,
  FilePenLine,
  Files,
  History,
  ListChecks,
  LockKeyhole,
  Pencil,
  Plus,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRoundCheck,
  UsersRound,
  X,
} from 'lucide-react';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import {
  appendArchiveViewAudit,
  archiveSourceMeta,
  archiveStageMeta,
  cloneRecommendedTemplate,
  createArchiveField,
  createArchiveTask,
  createTemplateVersion,
  getTaskCompletionRate,
  markArchiveSourceReceived,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  requestSnapshotCorrection,
  saveArchiveTemplate,
  saveStudentArchiveDraft,
  updateStudentBaseArchive,
  type ArchiveField,
  type ArchiveFieldType,
  type ArchiveClassAssignment,
  type ArchiveSection,
  type ArchiveSource,
  type ArchiveStage,
  type ArchiveStudentProgress,
  type ArchiveTask,
  type ArchiveTemplate,
  type ArchiveWorkspace,
} from '../../../shared/studentArchiveStore';

interface ArchiveDesignViewProps {
  onBack: () => void;
  teacherProfile: TeacherProfile;
  spaceId: string;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  entryMode?: 'design' | 'assigned';
}

type RootTab = 'templates' | 'tasks';
type PageMode = 'root' | 'template-create' | 'template-editor' | 'task-launch' | 'task-detail' | 'student-fill' | 'archive-detail';

const fieldTypeMeta: Record<ArchiveFieldType, string> = {
  'short-text': '简短文字',
  'long-text': '多行文字',
  'single-select': '单选',
  'multiple-select': '多选',
};

const templateStatusMeta: Record<ArchiveTemplate['status'], { label: string; className: string }> = {
  recommended: { label: '推荐', className: 'bg-cyan-50 text-cyan-700' },
  draft: { label: '草稿', className: 'bg-amber-50 text-amber-700' },
  published: { label: '已发布', className: 'bg-emerald-50 text-emerald-700' },
  disabled: { label: '已停用', className: 'bg-slate-100 text-slate-500' },
};

const progressStatusMeta: Record<ArchiveStudentProgress['status'], { label: string; className: string }> = {
  draft: { label: '待填写', className: 'bg-slate-100 text-slate-600' },
  pending: { label: '填写中', className: 'bg-amber-50 text-amber-700' },
  archived: { label: '已成档', className: 'bg-emerald-50 text-emerald-700' },
};

const pageBackground = 'bg-[linear-gradient(180deg,var(--tm-bg-page)_0%,var(--tm-bg-surface)_52%,var(--tm-bg-page)_100%)]';
const sectionSurface = 'rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)]';
const primaryButton = 'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-5 text-[15px] font-bold text-white shadow-[var(--tm-shadow-card)] transition active:scale-[0.98] active:bg-[var(--tm-brand-primary-strong)] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none';
const secondaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-4 text-[14px] font-semibold text-[var(--tm-text-secondary)] shadow-sm transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)] disabled:opacity-45';
const iconButton = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 transition active:scale-[0.96] active:bg-slate-100';
const inputClass = 'w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-white px-3.5 text-[14px] font-medium text-[var(--tm-text-primary)] outline-none transition placeholder:text-[var(--tm-text-tertiary)] focus:border-[var(--tm-brand-primary)] focus:ring-4 focus:ring-[var(--tm-focus-ring)]';

const PageHeader: React.FC<{ title: string; onBack: () => void; action?: React.ReactNode }> = ({ title, onBack, action }) => (
  <header className="sticky top-0 z-40 flex h-11 shrink-0 items-center justify-between border-b border-white/70 bg-white/82 px-4 backdrop-blur-xl">
    <button type="button" onClick={onBack} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 active:bg-slate-100" aria-label="返回">
      <ChevronLeft className="h-5 w-5" />
    </button>
    <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-bold text-slate-900">{title}</h1>
    <div className="-mr-2 flex h-10 min-w-10 items-center justify-end whitespace-nowrap pl-1">{action}</div>
  </header>
);

const BottomAction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/90 px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_34px_-28px_rgba(15,23,42,0.40)] backdrop-blur-xl">
    {children}
  </div>
);

const BottomSheet: React.FC<{ open: boolean; label: string; onDismiss: () => void; children: React.ReactNode }> = ({ open, label, onDismiss, children }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-slate-900/20 backdrop-blur-[2px]" onClick={onDismiss}>
      <section className="max-h-[88%] w-full overflow-y-auto rounded-t-[28px] border border-white bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_50px_-34px_rgba(15,23,42,0.52)]" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={label}>
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-slate-200" />
        {children}
      </section>
    </div>
  );
};

const StatusPill: React.FC<{ children: React.ReactNode; className: string }> = ({ children, className }) => (
  <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[11px] font-bold ${className}`}>{children}</span>
);

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
    <div className="h-full rounded-full bg-[var(--tm-brand-primary)] transition-[width] duration-300" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
);

const SegmentedTabs: React.FC<{ value: RootTab; onChange: (value: RootTab) => void }> = ({ value, onChange }) => (
  <div className="grid grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] p-1" role="tablist" aria-label="档案管理视图">
    {([
      { key: 'templates' as const, label: '档案设计' },
      { key: 'tasks' as const, label: '建档任务' },
    ]).map(tab => (
      <button key={tab.key} type="button" onClick={() => onChange(tab.key)} className={`h-10 rounded-[10px] text-[13px] font-semibold transition ${value === tab.key ? 'bg-white text-[var(--tm-text-primary)] shadow-sm' : 'text-[var(--tm-text-secondary)]'}`} role="tab" aria-selected={value === tab.key}>
        {tab.label}
      </button>
    ))}
  </div>
);

const toggleValue = (current: string, option: string) => {
  const values = current ? current.split('、').filter(Boolean) : [];
  return values.includes(option) ? values.filter(item => item !== option).join('、') : [...values, option].join('、');
};

const ArchiveDesignView: React.FC<ArchiveDesignViewProps> = ({ onBack, teacherProfile, spaceId, classes, getStudentsForClass, entryMode = 'design' }) => {
  const [workspace, setWorkspace] = useState<ArchiveWorkspace>(() => readArchiveWorkspace({
    spaceId,
    teacherName: teacherProfile.name,
    classes,
    homeroomClassIds: teacherProfile.homeroomClassIds,
    getStudentsForClass,
  }));
  const isTaskManager = entryMode === 'design';
  const [rootTab, setRootTab] = useState<RootTab>(isTaskManager ? 'templates' : 'tasks');
  const [pageMode, setPageMode] = useState<PageMode>('root');
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [templateDraft, setTemplateDraft] = useState<ArchiveTemplate | null>(null);
  const [activeTaskId, setActiveTaskId] = useState('');
  const [activeStudentId, setActiveStudentId] = useState('');
  const [answerDraft, setAnswerDraft] = useState<Record<string, string>>({});
  const [editingFieldId, setEditingFieldId] = useState('');
  const [fieldDraft, setFieldDraft] = useState<ArchiveField | null>(null);
  const [editingSectionId, setEditingSectionId] = useState('');
  const [sectionDraft, setSectionDraft] = useState<ArchiveSection | null>(null);
  const [showCorrectionSheet, setShowCorrectionSheet] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [showBaseEditor, setShowBaseEditor] = useState(false);
  const [baseDraft, setBaseDraft] = useState({ healthNotes: '', allergyHistory: '', guardianSummary: '' });
  const [toast, setToast] = useState('');

  const publishedTemplates = workspace.templates.filter(template => template.origin === 'school' && template.status === 'published');
  const activeTask = workspace.tasks.find(task => task.id === activeTaskId);
  const activeProgress = activeTask?.progress.find(student => student.studentId === activeStudentId);
  const activeTaskTemplate = activeTask ? workspace.templates.find(template => template.id === activeTask.templateId) : undefined;

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
    setRootTab(isTaskManager ? 'templates' : 'tasks');
  }, [spaceId, isTaskManager]);

  const openTemplate = (templateId: string) => {
    const template = workspace.templates.find(item => item.id === templateId);
    if (!template) return;
    setActiveTemplateId(templateId);
    setTemplateDraft({
      ...template,
      sections: template.sections.map(item => ({ ...item })),
      fields: template.fields.map(item => ({ ...item, options: [...item.options] })),
    });
    setPageMode('template-editor');
  };

  const copyTemplate = (templateId: string) => {
    const result = cloneRecommendedTemplate(workspace, templateId);
    updateWorkspace(result.workspace, '已复制为校本模板');
    openTemplateFromWorkspace(result.workspace, result.templateId);
  };

  const openTemplateFromWorkspace = (nextWorkspace: ArchiveWorkspace, templateId: string) => {
    const template = nextWorkspace.templates.find(item => item.id === templateId);
    if (!template) return;
    setActiveTemplateId(templateId);
    setTemplateDraft({
      ...template,
      sections: template.sections.map(item => ({ ...item })),
      fields: template.fields.map(item => ({ ...item, options: [...item.options] })),
    });
    setPageMode('template-editor');
  };

  const saveTemplate = (publish: boolean) => {
    if (!templateDraft) return;
    const nextTemplate: ArchiveTemplate = { ...templateDraft, status: publish ? 'published' : 'draft' };
    const next = saveArchiveTemplate(workspace, nextTemplate);
    updateWorkspace(next, publish ? '模板已发布' : '草稿已保存');
    setRootTab('templates');
    setPageMode('root');
  };

  const createNewTemplateVersion = () => {
    const result = createTemplateVersion(workspace, activeTemplateId);
    updateWorkspace(result.workspace, '已创建新版本草稿');
    openTemplateFromWorkspace(result.workspace, result.templateId);
  };

  const openFieldEditor = (fieldItem: ArchiveField) => {
    setEditingFieldId(fieldItem.id);
    setFieldDraft({ ...fieldItem, options: [...fieldItem.options] });
  };

  const saveFieldDraft = () => {
    if (!templateDraft || !fieldDraft) return;
    setTemplateDraft({
      ...templateDraft,
      fields: templateDraft.fields.map(item => item.id === editingFieldId ? fieldDraft : item),
    });
    setEditingFieldId('');
    setFieldDraft(null);
  };

  const moveField = (fieldId: string, direction: -1 | 1) => {
    if (!templateDraft) return;
    const index = templateDraft.fields.findIndex(item => item.id === fieldId);
    if (index < 0) return;
    const fieldItem = templateDraft.fields[index];
    const sectionFieldIndexes = templateDraft.fields
      .map((item, itemIndex) => item.sectionId === fieldItem.sectionId ? itemIndex : -1)
      .filter(itemIndex => itemIndex >= 0);
    const position = sectionFieldIndexes.indexOf(index);
    const target = sectionFieldIndexes[position + direction];
    if (target === undefined) return;
    const fields = [...templateDraft.fields];
    [fields[index], fields[target]] = [fields[target], fields[index]];
    setTemplateDraft({ ...templateDraft, fields });
  };

  const addField = (sectionId: string) => {
    if (!templateDraft) return;
    const nextField = createArchiveField(sectionId);
    setTemplateDraft({ ...templateDraft, fields: [...templateDraft.fields, nextField] });
    openFieldEditor(nextField);
  };

  const addSection = () => {
    if (!templateDraft) return;
    const nextSection: ArchiveSection = { id: `section-custom-${Date.now()}`, label: '新分组' };
    setTemplateDraft({ ...templateDraft, sections: [...templateDraft.sections, nextSection] });
    setEditingSectionId(nextSection.id);
    setSectionDraft(nextSection);
  };

  const openSectionEditor = (sectionItem: ArchiveSection) => {
    setEditingSectionId(sectionItem.id);
    setSectionDraft({ ...sectionItem });
  };

  const saveSectionDraft = () => {
    if (!templateDraft || !sectionDraft) return;
    setTemplateDraft({
      ...templateDraft,
      sections: templateDraft.sections.map(item => item.id === editingSectionId ? sectionDraft : item),
    });
    setEditingSectionId('');
    setSectionDraft(null);
  };

  const moveSection = (direction: -1 | 1) => {
    if (!templateDraft || !sectionDraft) return;
    const index = templateDraft.sections.findIndex(item => item.id === sectionDraft.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= templateDraft.sections.length) return;
    const sections = [...templateDraft.sections];
    [sections[index], sections[target]] = [sections[target], sections[index]];
    setTemplateDraft({ ...templateDraft, sections });
  };

  const deleteSection = () => {
    if (!templateDraft || !sectionDraft) return;
    if (templateDraft.fields.some(item => item.sectionId === sectionDraft.id)) {
      setToast('请先移动或删除分组内字段');
      window.setTimeout(() => setToast(''), 1800);
      return;
    }
    setTemplateDraft({ ...templateDraft, sections: templateDraft.sections.filter(item => item.id !== sectionDraft.id) });
    setEditingSectionId('');
    setSectionDraft(null);
  };

  const openTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setPageMode('task-detail');
  };

  const openStudentFill = (task: ArchiveTask, progress: ArchiveStudentProgress) => {
    setActiveTaskId(task.id);
    setActiveStudentId(progress.studentId);
    setAnswerDraft({ ...progress.answers });
    setPageMode('student-fill');
  };

  const saveStudent = (submit: boolean) => {
    if (!activeTask || !activeProgress || !activeTaskTemplate) return;
    const missingRequired = activeTaskTemplate.fields.find(fieldItem => fieldItem.required && !answerDraft[fieldItem.semanticKey]?.trim());
    if (submit && missingRequired) {
      setToast(`请先填写“${missingRequired.label}”`);
      window.setTimeout(() => setToast(''), 1800);
      return;
    }
    const next = saveStudentArchiveDraft(workspace, activeTask.id, activeProgress.studentId, answerDraft, submit, teacherProfile.name);
    updateWorkspace(next, submit ? '已确认成档' : '草稿已保存');
    setPageMode('task-detail');
  };

  const openArchive = (studentId: string) => {
    setActiveStudentId(studentId);
    const next = appendArchiveViewAudit(workspace, studentId, teacherProfile.name);
    updateWorkspace(next);
    setPageMode('archive-detail');
  };

  const renderTemplates = () => {
    const recommended = workspace.templates.filter(template => template.origin === 'recommended');
    const school = workspace.templates.filter(template => template.origin === 'school');
    return (
      <div className="space-y-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-slate-950">校本模板</h2>
            <span className="text-[12px] font-semibold text-slate-400">{school.length}个</span>
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
                      <span className="truncate text-[15px] font-bold text-slate-950">{template.name}</span>
                      <StatusPill className={meta.className}>{meta.label}</StatusPill>
                    </span>
                    <span className="mt-1.5 block text-[12px] font-medium text-slate-500">{archiveStageMeta[template.stage].label} · V{template.version} · {template.fields.length}个字段</span>
                  </span>
                  <ChevronRight className="h-4.5 w-4.5 shrink-0 text-slate-300" />
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-slate-950">推荐模板</h2>
            <Sparkles className="h-4.5 w-4.5 text-cyan-500" />
          </div>
          <div className="space-y-2.5">
            {recommended.map(template => (
              <article key={template.id} className={`${sectionSurface} flex min-h-[96px] items-center gap-3 p-4`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-cyan-50 text-cyan-600">
                  <Files className="h-5 w-5" />
                </span>
                <button type="button" onClick={() => openTemplate(template.id)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[15px] font-bold text-slate-950">{template.name}</span>
                  <span className="mt-1.5 block text-[12px] font-medium text-slate-500">{template.gradeScopes.join('、')} · {template.fields.length}个字段</span>
                </button>
                <button type="button" onClick={() => copyTemplate(template.id)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500 active:bg-cyan-50 active:text-cyan-700" aria-label={`复制${template.name}`} title="复制模板">
                  <Copy className="h-4.5 w-4.5" />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const getAssignedClassIds = (task: ArchiveTask) => task.classAssignments
    .filter(assignment => (
      assignment.assigneeType === 'homeroom'
        ? teacherProfile.homeroomClassIds.includes(assignment.classId)
        : assignment.assigneeName === teacherProfile.name
    ))
    .map(assignment => assignment.classId);

  const visibleTasks = isTaskManager
    ? workspace.tasks
    : workspace.tasks.filter(task => {
      const assignedClassIds = getAssignedClassIds(task);
      return task.progress.some(item => assignedClassIds.includes(item.classId));
    });

  const renderTasks = () => (
    <div className="space-y-4">
      {isTaskManager && (
        <button type="button" onClick={() => setPageMode('task-launch')} className={`${primaryButton} w-full`}>
          <Send className="h-4.5 w-4.5" />发起档案任务
        </button>
      )}
      {visibleTasks.map(task => {
        const assignedClassIds = isTaskManager ? task.classIds : getAssignedClassIds(task);
        const visibleProgress = task.progress.filter(item => assignedClassIds.includes(item.classId));
        const rate = visibleProgress.length ? Math.round(visibleProgress.filter(item => item.status === 'archived').length / visibleProgress.length * 100) : 0;
        const archivedCount = visibleProgress.filter(item => item.status === 'archived').length;
        return (
          <button key={task.id} type="button" onClick={() => openTask(task.id)} className={`${sectionSurface} w-full p-4 text-left transition active:scale-[0.985]`}>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]">
                <ClipboardCheck className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-950">{task.name}</span>
                  <ChevronRight className="h-4.5 w-4.5 shrink-0 text-slate-300" />
                </span>
                <span className="mt-1.5 block text-[12px] font-medium text-slate-500">{task.gradeScope} · 截止 {task.deadline.slice(5).replace('-', '月')}日</span>
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-[12px] font-semibold">
              <span className="text-slate-500">已完成 {archivedCount}/{visibleProgress.length}</span>
              <span className="tabular-nums text-[var(--tm-brand-primary-strong)]">{rate}%</span>
            </div>
            <div className="mt-2"><ProgressBar value={rate} /></div>
          </button>
        );
      })}
      {visibleTasks.length === 0 && (
        <div className={`${sectionSurface} px-4 py-8 text-center text-[14px] font-medium text-slate-500`}>暂无建档任务</div>
      )}
    </div>
  );

  const renderRoot = () => {
    const showingTemplates = isTaskManager && rootTab === 'templates';
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title={isTaskManager ? '档案管理' : '建档任务'} onBack={onBack} />
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
          {isTaskManager && <div className="mb-5"><SegmentedTabs value={rootTab} onChange={setRootTab} /></div>}
          {showingTemplates && (
            <button type="button" onClick={() => setPageMode('template-create')} className={`${primaryButton} mb-6 w-full`}><Plus className="h-4.5 w-4.5" />新建档案</button>
          )}
          {showingTemplates && renderTemplates()}
          {rootTab === 'tasks' && renderTasks()}
        </div>
      </div>
    );
  };

  const renderTemplateCreate = () => {
    const recommended = workspace.templates.filter(template => template.origin === 'recommended');
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title="新建档案" onBack={() => setPageMode('root')} />
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
          <h2 className="mb-3 text-[16px] font-bold text-slate-950">选择模板</h2>
          <div className="space-y-2.5">
            {recommended.map(template => (
              <button key={template.id} type="button" onClick={() => copyTemplate(template.id)} className={`${sectionSurface} flex min-h-[82px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><Files className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold text-slate-950">{template.name}</span><span className="mt-1.5 block text-[12px] font-medium text-slate-500">{archiveStageMeta[template.stage].label} · {template.fields.length}个字段</span></span>
                <ChevronRight className="h-4.5 w-4.5 shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTemplateEditor = () => {
    if (!templateDraft) return renderRoot();
    const readOnly = templateDraft.status === 'published' || templateDraft.status === 'recommended';
    const gradeOptions = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title={readOnly ? '模板详情' : '编辑模板'} onBack={() => { setPageMode('root'); setRootTab('templates'); }} action={<StatusPill className={templateStatusMeta[templateDraft.status].className}>{templateStatusMeta[templateDraft.status].label}</StatusPill>} />
        <div className={`flex-1 overflow-y-auto px-5 pt-4 no-scrollbar ${readOnly ? 'pb-28' : 'pb-36'}`}>
          <section className={`${sectionSurface} space-y-4 p-4`}>
            <label className="block">
              <span className="text-[12px] font-semibold text-slate-500">模板名称</span>
              <input value={templateDraft.name} disabled={readOnly} onChange={event => setTemplateDraft({ ...templateDraft, name: event.target.value })} className={`${inputClass} mt-2 h-12 disabled:bg-slate-50 disabled:text-slate-600`} />
            </label>
            <div>
              <div className="mb-2 text-[12px] font-semibold text-slate-500">档案阶段</div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(archiveStageMeta) as ArchiveStage[]).map(stage => (
                  <button key={stage} type="button" disabled={readOnly} onClick={() => setTemplateDraft({ ...templateDraft, stage })} className={`min-h-10 rounded-[13px] border text-[13px] font-semibold ${templateDraft.stage === stage ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-slate-100 bg-white text-slate-500'} disabled:opacity-80`}>
                    {archiveStageMeta[stage].shortLabel}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[12px] font-semibold text-slate-500">适用年级</div>
              <div className="flex flex-wrap gap-2">
                {gradeOptions.map(grade => {
                  const selected = templateDraft.gradeScopes.includes(grade);
                  return (
                    <button key={grade} type="button" disabled={readOnly} onClick={() => setTemplateDraft({ ...templateDraft, gradeScopes: selected ? templateDraft.gradeScopes.filter(item => item !== grade) : [...templateDraft.gradeScopes, grade] })} className={`min-h-9 rounded-full px-3 text-[12px] font-semibold ${selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'} disabled:opacity-80`}>
                      {grade}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-slate-950">参与来源</h2>
              <span className="text-[12px] font-semibold text-slate-400">{templateDraft.sources.length}项</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(archiveSourceMeta) as ArchiveSource[]).map(source => {
                const selected = templateDraft.sources.includes(source);
                return (
                  <button key={source} type="button" disabled={readOnly || source === 'homeroom'} onClick={() => setTemplateDraft({ ...templateDraft, sources: selected ? templateDraft.sources.filter(item => item !== source) : [...templateDraft.sources, source] })} className={`flex min-h-[54px] items-center justify-between rounded-[16px] border px-3 text-left text-[13px] font-semibold ${selected ? 'border-cyan-200 bg-cyan-50/70 text-cyan-800' : 'border-slate-100 bg-white text-slate-500'} disabled:opacity-80`}>
                    <span>{archiveSourceMeta[source].label}</span>
                    {selected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-slate-950">系统信息</h2>
              <StatusPill className="bg-slate-100 text-slate-500">自动带出</StatusPill>
            </div>
            <div className={`${sectionSurface} flex flex-wrap gap-2 p-4`}>
              {['姓名', '班级', '性别', '建档日期', '建档教师', '健康提醒', '过敏史'].map(item => (
                <span key={item} className="rounded-[10px] bg-slate-50 px-2.5 py-2 text-[12px] font-medium text-slate-600">{item}</span>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-slate-950">档案分组</h2>
                <div className="mt-1 text-[12px] font-medium text-slate-400">{templateDraft.sections.length}个分组 · {templateDraft.fields.length}个字段</div>
              </div>
              {!readOnly && <button type="button" onClick={addSection} className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-700 active:bg-cyan-100" aria-label="新增分组" title="新增分组"><Plus className="h-4.5 w-4.5" /></button>}
            </div>
            <div className="space-y-3">
              {templateDraft.sections.map(sectionItem => {
                const sectionFields = templateDraft.fields.filter(item => item.sectionId === sectionItem.id);
                return (
                  <section key={sectionItem.id} className={`${sectionSurface} overflow-hidden`}>
                    <div className="flex min-h-[60px] items-center gap-3 px-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[15px] font-bold text-slate-950">{sectionItem.label}</h3>
                          <span className="text-[11px] font-semibold text-slate-400">{sectionFields.length}项</span>
                        </div>
                        {sectionItem.description && <p className="mt-1 truncate text-[11px] font-medium text-slate-400">{sectionItem.description}</p>}
                      </div>
                      {!readOnly && <button type="button" onClick={() => openSectionEditor(sectionItem)} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 active:bg-slate-100" aria-label={`编辑${sectionItem.label}分组`} title="编辑分组"><Settings2 className="h-4.5 w-4.5" /></button>}
                    </div>
                    <div className="border-t border-slate-100 px-4">
                      {sectionFields.map((fieldItem, index) => (
                        <div key={fieldItem.id} className="flex min-h-[64px] items-center gap-3 border-b border-slate-100 last:border-b-0">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-bold ${fieldItem.group === 'core' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                          <button type="button" disabled={readOnly} onClick={() => openFieldEditor(fieldItem)} className="min-w-0 flex-1 py-2 text-left disabled:cursor-default">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-[14px] font-semibold text-slate-900">{fieldItem.label}</span>
                              {fieldItem.required && <span className="text-[10px] font-bold text-rose-500">必填</span>}
                            </span>
                            <span className="mt-1 block text-[11px] font-medium text-slate-400">{fieldTypeMeta[fieldItem.type]}{fieldItem.group === 'core' ? ' · 成长对比' : ''}</span>
                          </button>
                          {!readOnly && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}
                        </div>
                      ))}
                      {!readOnly && <button type="button" onClick={() => addField(sectionItem.id)} className="flex min-h-12 w-full items-center justify-center gap-2 text-[13px] font-semibold text-[#1E9AAA]"><Plus className="h-4 w-4" />新增字段</button>}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        </div>
        <BottomAction>
          {templateDraft.status === 'recommended' ? (
            <button type="button" onClick={() => copyTemplate(templateDraft.id)} className={`${primaryButton} w-full`}><Copy className="h-4.5 w-4.5" />复制为校本模板</button>
          ) : templateDraft.status === 'published' ? (
            <button type="button" onClick={createNewTemplateVersion} className={`${primaryButton} w-full`}><FilePenLine className="h-4.5 w-4.5" />复制为 V{templateDraft.version + 1} 草稿</button>
          ) : (
            <div className="grid grid-cols-[0.85fr_1.15fr] gap-3">
              <button type="button" onClick={() => saveTemplate(false)} className={secondaryButton}>保存草稿</button>
              <button type="button" onClick={() => saveTemplate(true)} className={primaryButton}>发布模板</button>
            </div>
          )}
        </BottomAction>

        <BottomSheet open={Boolean(fieldDraft)} label="编辑字段" onDismiss={() => { setFieldDraft(null); setEditingFieldId(''); }}>
          {fieldDraft && (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-slate-950">编辑字段</h2>
                <button type="button" onClick={() => { setFieldDraft(null); setEditingFieldId(''); }} className={iconButton} aria-label="关闭"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-4 space-y-4">
                <label className="block"><span className="text-[12px] font-semibold text-slate-500">字段名称</span><input value={fieldDraft.label} onChange={event => setFieldDraft({ ...fieldDraft, label: event.target.value })} className={`${inputClass} mt-2 h-12`} /></label>
                <label className="block"><span className="text-[12px] font-semibold text-slate-500">所属分组</span><select value={fieldDraft.sectionId} onChange={event => setFieldDraft({ ...fieldDraft, sectionId: event.target.value })} className={`${inputClass} mt-2 h-12`}>{templateDraft.sections.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                <label className="block"><span className="text-[12px] font-semibold text-slate-500">字段类型</span><select value={fieldDraft.type} onChange={event => setFieldDraft({ ...fieldDraft, type: event.target.value as ArchiveFieldType })} className={`${inputClass} mt-2 h-12`}>{(Object.keys(fieldTypeMeta) as ArchiveFieldType[]).map(type => <option key={type} value={type}>{fieldTypeMeta[type]}</option>)}</select></label>
                {(fieldDraft.type === 'single-select' || fieldDraft.type === 'multiple-select') && (
                  <label className="block"><span className="text-[12px] font-semibold text-slate-500">选项（每行一个）</span><textarea value={fieldDraft.options.join('\n')} onChange={event => setFieldDraft({ ...fieldDraft, options: event.target.value.split('\n').map(item => item.trim()).filter(Boolean) })} rows={4} className={`${inputClass} mt-2 min-h-[112px] py-3`} /></label>
                )}
                <div className="flex items-center justify-between rounded-[15px] bg-slate-50 px-4 py-2">
                  <span className="text-[14px] font-semibold text-slate-800">调整顺序</span>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const sectionFields = templateDraft.fields.filter(item => item.sectionId === fieldDraft.sectionId);
                      const index = sectionFields.findIndex(item => item.id === fieldDraft.id);
                      return <><button type="button" onClick={() => moveField(fieldDraft.id, -1)} disabled={index <= 0} className={`${iconButton} disabled:opacity-25`} aria-label="上移字段" title="上移"><ChevronUp className="h-5 w-5" /></button><button type="button" onClick={() => moveField(fieldDraft.id, 1)} disabled={index < 0 || index === sectionFields.length - 1} className={`${iconButton} disabled:opacity-25`} aria-label="下移字段" title="下移"><ChevronDown className="h-5 w-5" /></button></>;
                    })()}
                  </div>
                </div>
                <button type="button" onClick={() => setFieldDraft({ ...fieldDraft, required: !fieldDraft.required })} className="flex min-h-12 w-full items-center justify-between rounded-[15px] bg-slate-50 px-4 text-[14px] font-semibold text-slate-800" aria-pressed={fieldDraft.required}>
                  <span>设为必填</span><span className={`relative h-7 w-12 rounded-full p-1 transition ${fieldDraft.required ? 'bg-[#1E9AAA]' : 'bg-slate-200'}`}><span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition ${fieldDraft.required ? 'translate-x-5' : ''}`} /></span>
                </button>
                <button type="button" onClick={() => setFieldDraft({ ...fieldDraft, group: fieldDraft.group === 'core' ? 'stage' : 'core' })} className="flex min-h-12 w-full items-center justify-between rounded-[15px] bg-slate-50 px-4 text-[14px] font-semibold text-slate-800" aria-pressed={fieldDraft.group === 'core'}>
                  <span>用于成长对比</span><span className={`relative h-7 w-12 rounded-full p-1 transition ${fieldDraft.group === 'core' ? 'bg-[#6366F1]' : 'bg-slate-200'}`}><span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition ${fieldDraft.group === 'core' ? 'translate-x-5' : ''}`} /></span>
                </button>
                <button type="button" onClick={saveFieldDraft} className={`${primaryButton} w-full`}>完成</button>
                <button type="button" onClick={() => { if (!templateDraft) return; setTemplateDraft({ ...templateDraft, fields: templateDraft.fields.filter(item => item.id !== fieldDraft.id) }); setFieldDraft(null); setEditingFieldId(''); }} className="flex min-h-11 w-full items-center justify-center gap-2 text-[14px] font-semibold text-rose-500"><Trash2 className="h-4 w-4" />删除字段</button>
              </div>
            </div>
          )}
        </BottomSheet>

        <BottomSheet open={Boolean(sectionDraft)} label="编辑分组" onDismiss={() => { setSectionDraft(null); setEditingSectionId(''); }}>
          {sectionDraft && (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-slate-950">编辑分组</h2>
                <button type="button" onClick={() => { setSectionDraft(null); setEditingSectionId(''); }} className={iconButton} aria-label="关闭"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-4 space-y-4">
                <label className="block"><span className="text-[12px] font-semibold text-slate-500">分组名称</span><input value={sectionDraft.label} onChange={event => setSectionDraft({ ...sectionDraft, label: event.target.value })} className={`${inputClass} mt-2 h-12`} /></label>
                <label className="block"><span className="text-[12px] font-semibold text-slate-500">分组说明（选填）</span><input value={sectionDraft.description ?? ''} onChange={event => setSectionDraft({ ...sectionDraft, description: event.target.value })} className={`${inputClass} mt-2 h-12`} /></label>
                <div className="flex items-center justify-between rounded-[15px] bg-slate-50 px-4 py-2">
                  <span className="text-[14px] font-semibold text-slate-800">调整顺序</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveSection(-1)} disabled={templateDraft.sections[0]?.id === sectionDraft.id} className={`${iconButton} disabled:opacity-25`} aria-label="上移分组" title="上移"><ChevronUp className="h-5 w-5" /></button>
                    <button type="button" onClick={() => moveSection(1)} disabled={templateDraft.sections.at(-1)?.id === sectionDraft.id} className={`${iconButton} disabled:opacity-25`} aria-label="下移分组" title="下移"><ChevronDown className="h-5 w-5" /></button>
                  </div>
                </div>
                <button type="button" onClick={saveSectionDraft} disabled={!sectionDraft.label.trim()} className={`${primaryButton} w-full`}>完成</button>
                <button type="button" onClick={deleteSection} className="flex min-h-11 w-full items-center justify-center gap-2 text-[14px] font-semibold text-rose-500"><Trash2 className="h-4 w-4" />删除分组</button>
              </div>
            </div>
          )}
        </BottomSheet>
      </div>
    );
  };

  const TaskLaunchPage = () => {
    const [templateId, setTemplateId] = useState(publishedTemplates[0]?.id ?? '');
    const template = workspace.templates.find(item => item.id === templateId);
    const [schoolTerm, setSchoolTerm] = useState('2025-2026学年 下学期');
    const [gradeScope, setGradeScope] = useState(template?.gradeScopes[0] ?? '一年级');
    const scopedClasses = classes.filter(item => item.gradeLevel === gradeScope).slice(0, 10);
    const [classIds, setClassIds] = useState<string[]>([]);
    const [deadline, setDeadline] = useState('2026-07-25');
    const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, { assigneeType: 'homeroom' | 'designated'; assigneeName: string }>>({});
    const [beforeDeadlineDays, setBeforeDeadlineDays] = useState<number[]>([3, 1]);
    const [repeatWhenOverdue, setRepeatWhenOverdue] = useState(true);
    const hasMissingAssignee = classIds.some(classId => {
      const assignment = assignmentDrafts[classId];
      return assignment?.assigneeType === 'designated' && !assignment.assigneeName.trim();
    });
    const createTask = () => {
      if (!template || classIds.length === 0 || hasMissingAssignee) return;
      const classAssignments: ArchiveClassAssignment[] = classIds.map(classId => {
        const classInfo = classes.find(item => item.id === classId);
        const assignment = assignmentDrafts[classId] ?? { assigneeType: 'homeroom' as const, assigneeName: '' };
        return {
          classId,
          className: classInfo?.name ?? classId,
          assigneeType: assignment.assigneeType,
          assigneeName: assignment.assigneeType === 'designated' ? assignment.assigneeName.trim() : undefined,
          assigneeRole: assignment.assigneeType === 'homeroom' ? '班主任' : '指定任课教师',
        };
      });
      const next = createArchiveTask(workspace, {
        name: `${schoolTerm}${archiveStageMeta[template.stage].label}`,
        templateId: template.id,
        templateName: template.name,
        templateVersion: template.version,
        stage: template.stage,
        schoolTerm,
        gradeScope,
        classIds,
        classAssignments,
        reminderPolicy: {
          notifyOnCreate: true,
          beforeDeadlineDays,
          repeatWhenOverdue,
        },
        createdBy: teacherProfile.name,
        deadline,
      }, classes, getStudentsForClass);
      updateWorkspace(next, '任务已发起');
      setRootTab('tasks');
      setPageMode('root');
    };
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title="发起档案任务" onBack={() => { setRootTab('tasks'); setPageMode('root'); }} />
        <div className="flex-1 overflow-y-auto px-5 pb-32 pt-4 no-scrollbar">
          <section className={`${sectionSurface} space-y-4 p-4`}>
            <label className="block"><span className="text-[12px] font-semibold text-slate-500">档案模板</span><select value={templateId} onChange={event => { const next = workspace.templates.find(item => item.id === event.target.value); setTemplateId(event.target.value); if (next) setGradeScope(next.gradeScopes[0]); setClassIds([]); }} className={`${inputClass} mt-2 h-12`}>{publishedTemplates.map(item => <option key={item.id} value={item.id}>{item.name} · V{item.version}</option>)}</select></label>
            <label className="block"><span className="text-[12px] font-semibold text-slate-500">所属周期</span><input value={schoolTerm} onChange={event => setSchoolTerm(event.target.value)} className={`${inputClass} mt-2 h-12`} /></label>
            <label className="block"><span className="text-[12px] font-semibold text-slate-500">截止日期</span><input type="date" value={deadline} onChange={event => setDeadline(event.target.value)} className={`${inputClass} mt-2 h-12`} /></label>
          </section>
          <section className="mt-5">
            <h2 className="text-[16px] font-bold text-slate-950">适用范围</h2>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {(template?.gradeScopes ?? []).map(grade => <button key={grade} type="button" onClick={() => { setGradeScope(grade); setClassIds([]); }} className={`min-h-9 shrink-0 rounded-full px-3 text-[12px] font-semibold ${gradeScope === grade ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{grade}</button>)}
            </div>
            <div className="mt-3 space-y-2">
              {scopedClasses.map(classInfo => {
                const selected = classIds.includes(classInfo.id);
                const assignment = assignmentDrafts[classInfo.id] ?? { assigneeType: 'homeroom' as const, assigneeName: '' };
                return (
                  <article key={classInfo.id} className={`${sectionSurface} overflow-hidden`}>
                    <button type="button" onClick={() => {
                      setClassIds(selected ? classIds.filter(id => id !== classInfo.id) : [...classIds, classInfo.id]);
                      if (!selected && !assignmentDrafts[classInfo.id]) setAssignmentDrafts({ ...assignmentDrafts, [classInfo.id]: assignment });
                    }} className="flex min-h-[58px] w-full items-center justify-between px-4 text-left"><span className="text-[14px] font-semibold text-slate-900">{classInfo.name}</span><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-white' : 'border-slate-200 text-transparent'}`}><Check className="h-4 w-4" /></span></button>
                    {selected && (
                      <div className="space-y-2 border-t border-[var(--tm-border-subtle)] px-4 py-3">
                        <label className="block"><span className="text-[12px] font-semibold text-slate-500">填写责任人</span><select value={assignment.assigneeType} onChange={event => setAssignmentDrafts({ ...assignmentDrafts, [classInfo.id]: { ...assignment, assigneeType: event.target.value as 'homeroom' | 'designated' } })} className={`${inputClass} mt-2 h-11`}><option value="homeroom">当前班主任</option><option value="designated">指定任课教师</option></select></label>
                        {assignment.assigneeType === 'designated' && <input value={assignment.assigneeName} onChange={event => setAssignmentDrafts({ ...assignmentDrafts, [classInfo.id]: { ...assignment, assigneeName: event.target.value } })} placeholder="选择有任教关系的教师" className={`${inputClass} h-11`} />}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
          <details className={`${sectionSurface} mt-5 overflow-hidden`}>
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between px-4 text-[14px] font-semibold text-slate-900">提醒设置<ChevronDown className="h-4 w-4 text-slate-400" /></summary>
            <div className="space-y-2 border-t border-slate-100 px-4 py-3">
              {[3, 1].map(day => {
                const checked = beforeDeadlineDays.includes(day);
                return <label key={day} className="flex min-h-11 items-center justify-between text-[13px] font-medium text-slate-700"><span>截止前{day}天提醒</span><input type="checkbox" checked={checked} onChange={() => setBeforeDeadlineDays(checked ? beforeDeadlineDays.filter(item => item !== day) : [...beforeDeadlineDays, day].sort((a, b) => b - a))} className="h-5 w-5 accent-[var(--tm-brand-primary)]" /></label>;
              })}
              <label className="flex min-h-11 items-center justify-between text-[13px] font-medium text-slate-700"><span>逾期后每日提醒</span><input type="checkbox" checked={repeatWhenOverdue} onChange={event => setRepeatWhenOverdue(event.target.checked)} className="h-5 w-5 accent-[var(--tm-brand-primary)]" /></label>
            </div>
          </details>
        </div>
        <BottomAction><button type="button" onClick={createTask} disabled={!template || classIds.length === 0 || hasMissingAssignee} className={`${primaryButton} w-full`}>确认发起 · {classIds.length}个班</button></BottomAction>
      </div>
    );
  };

  const renderTaskDetail = () => {
    if (!activeTask) return renderRoot();
    const assignedClassIds = isTaskManager ? activeTask.classIds : getAssignedClassIds(activeTask);
    const visibleProgress = activeTask.progress.filter(item => assignedClassIds.includes(item.classId));
    const rate = visibleProgress.length ? Math.round(visibleProgress.filter(item => item.status === 'archived').length / visibleProgress.length * 100) : 0;
    const completed = visibleProgress.filter(item => item.status === 'archived').length;
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title="任务进度" onBack={() => { setRootTab('tasks'); setPageMode('root'); }} />
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 no-scrollbar">
          <section className="rounded-[var(--tm-radius-card)] border border-[var(--tm-brand-primary-soft-strong)] bg-[var(--tm-brand-primary-soft)] p-4">
            <div className="flex items-start justify-between gap-3"><div><div className="text-[12px] font-semibold text-slate-500">{activeTask.gradeScope} · 截止 {activeTask.deadline}</div><h2 className="mt-1 text-[18px] font-extrabold leading-snug text-slate-950">{activeTask.name}</h2></div><span className="text-[24px] font-extrabold tabular-nums text-[var(--tm-brand-primary-strong)]">{rate}%</span></div>
            <div className="mt-4"><ProgressBar value={rate} /></div>
            <div className="mt-3 flex items-center justify-between text-[12px] font-semibold text-slate-500"><span>已完成 {completed}人</span><span>待完成 {visibleProgress.length - completed}人</span></div>
          </section>
          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-[16px] font-bold text-slate-950">{isTaskManager ? '班级进度' : '待填写学生'}</h2><span className="text-[12px] font-semibold text-slate-400">{isTaskManager ? `${activeTask.classIds.length}个班` : `${visibleProgress.length - completed}人待完成`}</span></div>
            {isTaskManager ? (
              <div className="space-y-2.5">
                {activeTask.classAssignments.map(assignment => {
                  const classProgress = activeTask.progress.filter(item => item.classId === assignment.classId);
                  const classCompleted = classProgress.filter(item => item.status === 'archived').length;
                  return (
                    <article key={assignment.classId} className={`${sectionSurface} flex min-h-[76px] items-center gap-3 px-4`}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]"><UsersRound className="h-5 w-5" /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold text-slate-950">{assignment.className}</span><span className="mt-1 block truncate text-[11px] font-medium text-slate-500">{assignment.assigneeName || '当前班主任'} · {classCompleted}/{classProgress.length}</span></span>
                      <StatusPill className={classCompleted === classProgress.length ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>{classCompleted === classProgress.length ? '已完成' : '进行中'}</StatusPill>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {visibleProgress.map(student => {
                  const meta = progressStatusMeta[student.status];
                  const waitingSources = student.sourceProgress.filter(item => item.status === 'waiting').length;
                  const content = <><span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[13px] font-bold text-slate-600">{student.studentName.slice(-1)}</span><span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold text-slate-950">{student.studentName}</span><span className="mt-1 block text-[11px] font-medium text-slate-400">{waitingSources ? `${waitingSources}项来源待补充` : student.updatedAt}</span></span><StatusPill className={meta.className}>{meta.label}</StatusPill>{student.status !== 'archived' && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}</>;
                  return student.status === 'archived'
                    ? <div key={student.studentId} className={`${sectionSurface} flex min-h-[70px] w-full items-center gap-3 px-4 text-left opacity-70`}>{content}</div>
                    : <button key={student.studentId} type="button" onClick={() => openStudentFill(activeTask, student)} className={`${sectionSurface} flex min-h-[70px] w-full items-center gap-3 px-4 text-left transition active:scale-[0.985]`}>{content}</button>;
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  };

  const renderFieldInput = (fieldItem: ArchiveField) => {
    const value = answerDraft[fieldItem.semanticKey] ?? '';
    if (fieldItem.type === 'long-text') return <textarea value={value} onChange={event => setAnswerDraft({ ...answerDraft, [fieldItem.semanticKey]: event.target.value })} rows={3} placeholder="请输入" className={`${inputClass} min-h-[92px] py-3`} />;
    if (fieldItem.type === 'short-text') return <input value={value} onChange={event => setAnswerDraft({ ...answerDraft, [fieldItem.semanticKey]: event.target.value })} placeholder="请输入" className={`${inputClass} h-12`} />;
    return (
      <div className="flex flex-wrap gap-2">
        {fieldItem.options.map(option => {
          const selected = fieldItem.type === 'multiple-select' ? value.split('、').includes(option) : value === option;
          return <button key={option} type="button" onClick={() => setAnswerDraft({ ...answerDraft, [fieldItem.semanticKey]: fieldItem.type === 'multiple-select' ? toggleValue(value, option) : option })} className={`min-h-10 rounded-[13px] border px-3 text-left text-[13px] font-medium ${selected ? 'border-cyan-300 bg-cyan-50 text-cyan-800' : 'border-slate-100 bg-white text-slate-600'}`}>{option}</button>;
        })}
      </div>
    );
  };

  const renderStudentFill = () => {
    if (!activeTask || !activeProgress || !activeTaskTemplate) return renderTaskDetail();
    const previousSnapshot = [...workspace.snapshots].filter(snapshot => snapshot.studentId === activeProgress.studentId && snapshot.status === 'archived').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    const student = getStudentsForClass(activeProgress.classId).find(item => item.id === activeProgress.studentId);
    const base = workspace.baseArchives.find(item => item.studentId === activeProgress.studentId);
    const systemProfile = [
      ['姓名', activeProgress.studentName],
      ['班级', activeProgress.className],
      ['性别', student?.gender === 'male' ? '男' : student?.gender === 'female' ? '女' : '未设置'],
      ['建档日期', new Date().toISOString().slice(0, 10)],
      ['建档教师', teacherProfile.name],
      ['健康提醒', base?.healthNotes ?? '待完善'],
      ['过敏史', base?.allergyHistory ?? '待完善'],
    ];
    const firstIncompleteSectionIndex = activeTaskTemplate.sections.findIndex(sectionItem => (
      activeTaskTemplate.fields
        .filter(fieldItem => fieldItem.sectionId === sectionItem.id && fieldItem.required)
        .some(fieldItem => !answerDraft[fieldItem.semanticKey]?.trim())
    ));
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title={activeProgress.studentName} onBack={() => setPageMode('task-detail')} action={<StatusPill className={progressStatusMeta[activeProgress.status].className}>{progressStatusMeta[activeProgress.status].label}</StatusPill>} />
        <div className="flex-1 overflow-y-auto px-5 pb-36 pt-4 no-scrollbar">
          <section>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-[16px] font-bold text-slate-950">信息来源</h2><span className="text-[12px] font-semibold text-slate-400">{activeProgress.sourceProgress.filter(item => item.status === 'received').length}/{activeProgress.sourceProgress.filter(item => item.status !== 'not-required').length}</span></div>
            <div className="grid grid-cols-2 gap-2">
              {activeProgress.sourceProgress.filter(item => item.status !== 'not-required').map(item => (
                <button key={item.source} type="button" disabled={item.status === 'received'} onClick={() => updateWorkspace(markArchiveSourceReceived(workspace, activeTask.id, activeProgress.studentId, item.source), `${archiveSourceMeta[item.source].label}已补录`)} className={`flex min-h-[58px] items-center justify-between rounded-[16px] border px-3 text-left ${item.status === 'received' ? 'border-emerald-100 bg-emerald-50/60 text-emerald-800' : 'border-amber-100 bg-amber-50/60 text-amber-800'}`}>
                  <span><span className="block text-[12px] font-semibold">{archiveSourceMeta[item.source].label}</span><span className="mt-1 block text-[10px] font-medium opacity-70">{item.status === 'received' ? '已收到' : '点击补录'}</span></span>
                  {item.status === 'received' ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Clock3 className="h-4.5 w-4.5" />}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-[16px] font-bold text-slate-950">建档信息</h2><StatusPill className="bg-slate-100 text-slate-500">系统带出</StatusPill></div>
            <div className={`${sectionSurface} divide-y divide-slate-100 px-4`}>
              {systemProfile.map(([label, value]) => <div key={label} className="flex min-h-[48px] items-center justify-between gap-4 py-2"><span className="shrink-0 text-[12px] font-semibold text-slate-400">{label}</span><span className="text-right text-[13px] font-semibold leading-snug text-slate-800">{value}</span></div>)}
            </div>
          </section>

          <section className="mt-5 space-y-3">
            {activeTaskTemplate.sections.map((sectionItem, sectionIndex) => {
              const sectionFields = activeTaskTemplate.fields.filter(fieldItem => fieldItem.sectionId === sectionItem.id);
              const completedCount = sectionFields.filter(fieldItem => answerDraft[fieldItem.semanticKey]?.trim()).length;
              const shouldOpen = sectionIndex === (firstIncompleteSectionIndex >= 0 ? firstIncompleteSectionIndex : 0);
              return (
                <details key={sectionItem.id} className={`${sectionSurface} overflow-hidden`} open={shouldOpen}>
                  <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 px-4">
                    <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-bold text-slate-950">{sectionItem.label}</span>{sectionItem.description && <span className="mt-1 block truncate text-[11px] font-medium text-slate-400">{sectionItem.description}</span>}</span>
                    <span className={`text-[12px] font-bold tabular-nums ${completedCount === sectionFields.length ? 'text-emerald-600' : 'text-slate-400'}`}>{completedCount}/{sectionFields.length}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  </summary>
                  <div className="space-y-5 border-t border-slate-100 px-4 py-4">
                    {sectionFields.map((fieldItem, index) => (
                      <div key={fieldItem.id}>
                        <label className="mb-2 block text-[14px] font-semibold text-slate-900">{index + 1}. {fieldItem.label}{fieldItem.required && <span className="ml-1 text-rose-500">*</span>}</label>
                        {previousSnapshot?.answers[fieldItem.semanticKey] && fieldItem.group === 'core' && <div className="mb-2 rounded-[12px] bg-slate-100/70 px-3 py-2 text-[12px] font-medium leading-relaxed text-slate-500">上期：{previousSnapshot.answers[fieldItem.semanticKey]}</div>}
                        {renderFieldInput(fieldItem)}
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </section>
        </div>
        <BottomAction><div className="grid grid-cols-[0.82fr_1.18fr] gap-3"><button type="button" onClick={() => saveStudent(false)} className={secondaryButton}>保存草稿</button><button type="button" onClick={() => saveStudent(true)} className={primaryButton}><LockKeyhole className="h-4.5 w-4.5" />确认成档</button></div></BottomAction>
      </div>
    );
  };

  const renderArchiveDetail = () => {
    const snapshots = [...workspace.snapshots].filter(snapshot => snapshot.studentId === activeStudentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const archived = snapshots.filter(snapshot => snapshot.status === 'archived');
    const latest = archived[0];
    const previous = archived[1];
    if (!latest) return renderRoot();
    const base = workspace.baseArchives.find(item => item.studentId === activeStudentId);
    const auditEvents = workspace.auditEvents.filter(item => item.studentId === activeStudentId).slice(0, 6);
    const compareKeys = ['learning-habits', 'peer-relations', 'stage-goal'];
    const fieldLabels: Record<string, string> = { 'learning-habits': '学习习惯', 'peer-relations': '同伴交往', 'stage-goal': '阶段目标' };
    return (
      <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
        <PageHeader title="学生档案" onBack={() => { setRootTab('archives'); setPageMode('root'); }} action={<ShieldCheck className="h-5 w-5 text-emerald-600" />} />
        <div className="flex-1 overflow-y-auto px-5 pb-10 pt-4 no-scrollbar">
          <section className="rounded-[22px] border border-cyan-100/80 bg-[linear-gradient(135deg,#ECFEFF,#EEF2FF)] p-4">
            <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[17px] font-bold text-blue-700 shadow-sm">{latest.studentName.slice(-1)}</span><div className="min-w-0 flex-1"><h2 className="truncate text-[20px] font-extrabold text-slate-950">{latest.studentName}</h2><p className="mt-1 truncate text-[12px] font-semibold text-slate-500">{latest.className} · {archived.length}份阶段档案</p></div><StatusPill className="bg-white/80 text-emerald-700">完整档案</StatusPill></div>
          </section>

          <section className="mt-4">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-[16px] font-bold text-slate-950">接班摘要</h2><span className="text-[12px] font-semibold text-slate-400">{latest.period}</span></div>
            <div className="space-y-2">
              {[['优势特点', latest.answers.strengths], ['近期变化', latest.answers['term-change'] || latest.answers['important-change']], ['有效支持', latest.answers['support-strategy'] || latest.answers['best-method']]].map(([label, value]) => (
                <div key={label} className={`${sectionSurface} p-4`}><div className="text-[11px] font-bold text-[#1E9AAA]">{label}</div><div className="mt-1.5 text-[14px] font-medium leading-relaxed text-slate-700">{value || '暂无记录'}</div></div>
              ))}
            </div>
          </section>

          {previous && (
            <section className="mt-5">
              <div className="mb-3 flex items-center justify-between"><h2 className="text-[16px] font-bold text-slate-950">成长变化</h2><History className="h-4.5 w-4.5 text-slate-400" /></div>
              <div className={`${sectionSurface} divide-y divide-slate-100 px-4`}>
                {compareKeys.map(key => (
                  <div key={key} className="py-3"><div className="text-[12px] font-semibold text-slate-500">{fieldLabels[key]}</div><div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[12px] font-medium leading-snug"><span className="rounded-[11px] bg-slate-100 px-2.5 py-2 text-slate-500">{previous.answers[key] || '未记录'}</span><ArrowRight className="h-4 w-4 text-cyan-500" /><span className="rounded-[11px] bg-cyan-50 px-2.5 py-2 text-cyan-800">{latest.answers[key] || '未记录'}</span></div></div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-[16px] font-bold text-slate-950">长期底档</h2>{base && <button type="button" onClick={() => { setBaseDraft({ healthNotes: base.healthNotes, allergyHistory: base.allergyHistory, guardianSummary: base.guardianSummary }); setShowBaseEditor(true); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500" aria-label="更新长期底档"><Pencil className="h-4 w-4" /></button>}</div>
            {base && <div className={`${sectionSurface} divide-y divide-slate-100 px-4`}>{[['健康提醒', base.healthNotes], ['过敏史', base.allergyHistory], ['家庭联系人', base.guardianSummary], ['班级经历', base.classHistory.join('、')]].map(([label, value]) => <div key={label} className="flex min-h-[52px] items-center justify-between gap-4 py-2"><span className="shrink-0 text-[12px] font-semibold text-slate-400">{label}</span><span className="text-right text-[13px] font-semibold leading-snug text-slate-800">{value}</span></div>)}</div>}
          </section>

          <section className="mt-5">
            <h2 className="mb-3 text-[16px] font-bold text-slate-950">完整内容</h2>
            <details className={`${sectionSurface} overflow-hidden`}>
              <summary className="flex min-h-[54px] cursor-pointer list-none items-center justify-between px-4 text-[14px] font-semibold text-slate-900">最新阶段档案<ChevronDown className="h-4 w-4 text-slate-400" /></summary>
              <div className="border-t border-slate-100 px-4 pb-4">
                {(() => {
                  const template = workspace.templates.find(item => item.id === latest.templateId);
                  if (!template) return Object.entries(latest.answers).map(([key, value]) => <div key={key} className="border-b border-slate-100 py-3 last:border-b-0"><div className="text-[11px] font-semibold text-slate-400">{key}</div><div className="mt-1 text-[13px] font-medium leading-relaxed text-slate-800">{value}</div></div>);
                  return template.sections.map(sectionItem => {
                    const sectionFields = template.fields.filter(fieldItem => fieldItem.sectionId === sectionItem.id && latest.answers[fieldItem.semanticKey]);
                    if (sectionFields.length === 0) return null;
                    return <section key={sectionItem.id} className="border-b border-slate-100 py-3 last:border-b-0"><h3 className="text-[13px] font-bold text-slate-900">{sectionItem.label}</h3>{sectionFields.map(fieldItem => <div key={fieldItem.id} className="mt-3"><div className="text-[11px] font-semibold text-slate-400">{fieldItem.label}</div><div className="mt-1 text-[13px] font-medium leading-relaxed text-slate-800">{latest.answers[fieldItem.semanticKey]}</div></div>)}</section>;
                  });
                })()}
              </div>
            </details>
          </section>

          <section className="mt-5">
            <h2 className="mb-3 text-[16px] font-bold text-slate-950">阶段时间线</h2>
            <div className="space-y-2">
              {snapshots.map(snapshot => <article key={snapshot.id} className={`${sectionSurface} flex min-h-[72px] items-center gap-3 px-4`}><span className={`flex h-9 w-9 items-center justify-center rounded-[12px] ${snapshot.status === 'revision-draft' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{snapshot.status === 'revision-draft' ? <FilePenLine className="h-4 w-4" /> : <BookOpenCheck className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold text-slate-950">{snapshot.period}</div><div className="mt-1 text-[11px] font-medium text-slate-400">{snapshot.templateName} · V{snapshot.templateVersion}</div></div><StatusPill className={snapshot.status === 'revision-draft' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}>{snapshot.status === 'revision-draft' ? '更正草稿' : '已成档'}</StatusPill></article>)}
            </div>
          </section>

          <details className={`${sectionSurface} mt-5 overflow-hidden`}>
            <summary className="flex min-h-[54px] cursor-pointer list-none items-center justify-between px-4 text-[14px] font-semibold text-slate-900">来源记录与查看日志<ChevronDown className="h-4 w-4 text-slate-400" /></summary>
            <div className="border-t border-slate-100 px-4 pb-3">
              {latest.sourceRecords.map(record => <div key={`${record.source}-${record.submittedAt}`} className="flex min-h-[50px] items-center justify-between gap-3 border-b border-slate-100 py-2"><div><div className="text-[12px] font-semibold text-slate-800">{record.title}</div><div className="mt-1 text-[10px] font-medium text-slate-400">{record.provider} · {record.submittedAt}</div></div><StatusPill className="bg-slate-100 text-slate-600">{record.status}</StatusPill></div>)}
              <div className="pt-3 text-[11px] font-bold text-slate-400">最近查看与修改</div>
              {auditEvents.map(event => <div key={event.id} className="flex items-start gap-2 py-2 text-[11px] font-medium leading-relaxed text-slate-500"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" /><span>{event.operator} · {event.action} · {event.occurredAt}</span></div>)}
            </div>
          </details>

          <button type="button" onClick={() => setShowCorrectionSheet(true)} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 text-[13px] font-semibold text-slate-500"><FilePenLine className="h-4 w-4" />申请更正最新档案</button>
        </div>

        <BottomSheet open={showCorrectionSheet} label="申请更正" onDismiss={() => setShowCorrectionSheet(false)}>
          <h2 className="text-[18px] font-bold text-slate-950">申请更正</h2>
          <textarea value={correctionReason} onChange={event => setCorrectionReason(event.target.value)} rows={4} placeholder="说明需要更正的内容" className={`${inputClass} mt-4 min-h-[112px] py-3`} />
          <button type="button" disabled={!correctionReason.trim()} onClick={() => { const next = requestSnapshotCorrection(workspace, latest.id, correctionReason.trim(), teacherProfile.name); updateWorkspace(next, '已生成更正草稿'); setCorrectionReason(''); setShowCorrectionSheet(false); }} className={`${primaryButton} mt-4 w-full`}>生成更正草稿</button>
        </BottomSheet>

        <BottomSheet open={showBaseEditor} label="更新长期底档" onDismiss={() => setShowBaseEditor(false)}>
          <h2 className="text-[18px] font-bold text-slate-950">更新长期底档</h2>
          <div className="mt-4 space-y-4">
            <label className="block"><span className="text-[12px] font-semibold text-slate-500">健康提醒</span><input value={baseDraft.healthNotes} onChange={event => setBaseDraft({ ...baseDraft, healthNotes: event.target.value })} className={`${inputClass} mt-2 h-12`} /></label>
            <label className="block"><span className="text-[12px] font-semibold text-slate-500">过敏史</span><input value={baseDraft.allergyHistory} onChange={event => setBaseDraft({ ...baseDraft, allergyHistory: event.target.value })} className={`${inputClass} mt-2 h-12`} /></label>
            <label className="block"><span className="text-[12px] font-semibold text-slate-500">家庭联系人</span><textarea value={baseDraft.guardianSummary} onChange={event => setBaseDraft({ ...baseDraft, guardianSummary: event.target.value })} rows={3} className={`${inputClass} mt-2 min-h-[88px] py-3`} /></label>
            <button type="button" onClick={() => { const next = updateStudentBaseArchive(workspace, activeStudentId, baseDraft, teacherProfile.name); updateWorkspace(next, '长期底档已更新'); setShowBaseEditor(false); }} className={`${primaryButton} w-full`}>保存更新</button>
          </div>
        </BottomSheet>
      </div>
    );
  };

  let content: React.ReactNode;
  if (pageMode === 'template-create') content = renderTemplateCreate();
  else if (pageMode === 'template-editor') content = renderTemplateEditor();
  else if (pageMode === 'task-launch') content = <TaskLaunchPage />;
  else if (pageMode === 'task-detail') content = renderTaskDetail();
  else if (pageMode === 'student-fill') content = renderStudentFill();
  else if (pageMode === 'archive-detail') content = renderArchiveDetail();
  else content = renderRoot();

  return (
    <div className="relative h-full min-h-0 overflow-hidden font-sans text-slate-900">
      {content}
      {toast && <div className="pointer-events-none absolute inset-x-5 bottom-24 z-[70] rounded-[15px] bg-slate-900/92 px-4 py-3 text-center text-[13px] font-semibold text-white shadow-xl">{toast}</div>}
    </div>
  );
};

export default ArchiveDesignView;
