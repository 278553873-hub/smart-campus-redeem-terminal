import React, { useEffect, useMemo, useState } from 'react';
import { Archive, Check, ChevronDown, CircleAlert, LockKeyhole, UserRound } from 'lucide-react';
import type { ClassInfo, Student, TeacherProfile } from '../../types';
import {
  batchArchiveStudents,
  getEnabledTemplatesForGrade,
  getStudentArchiveReadiness,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  resolveArchivePeriod,
  type ArchiveTemplate,
  type ArchiveWorkspace,
} from '../../../shared/studentArchiveStore';
import {
  BottomAction,
  BottomSheet,
  pageBackground,
  PageHeader,
  primaryButton,
  sectionSurface,
  StatusPill,
  Toast,
} from './archivePagePrimitives';

interface ClassArchiveBatchViewProps {
  onBack: () => void;
  classInfo: ClassInfo;
  students: Student[];
  teacherProfile: TeacherProfile;
  spaceId: string;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
}

type ReadinessFilter = 'ready' | 'missing' | 'archived';

const filterLabels: Record<ReadinessFilter, string> = {
  ready: '可留档',
  missing: '待补充',
  archived: '已留档',
};

const ClassArchiveBatchView: React.FC<ClassArchiveBatchViewProps> = ({
  onBack,
  classInfo,
  students,
  teacherProfile,
  spaceId,
  classes,
  getStudentsForClass,
}) => {
  const readWorkspace = () => readArchiveWorkspace({
    spaceId,
    teacherName: teacherProfile.name,
    classes,
    homeroomClassIds: teacherProfile.homeroomClassIds,
    getStudentsForClass,
  });
  const [workspace, setWorkspace] = useState<ArchiveWorkspace>(readWorkspace);
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [activeFilter, setActiveFilter] = useState<ReadinessFilter>('ready');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [toast, setToast] = useState('');

  const templates = getEnabledTemplatesForGrade(workspace, classInfo.gradeLevel);
  const activeTemplate = templates.find(template => template.id === activeTemplateId) ?? templates[0];
  const rows = useMemo(() => activeTemplate ? students.map(student => ({
    student,
    readiness: getStudentArchiveReadiness(workspace, activeTemplate, student),
  })) : [], [activeTemplate, students, workspace]);
  const rowsByStatus = useMemo(() => ({
    ready: rows.filter(row => row.readiness.status === 'ready'),
    missing: rows.filter(row => row.readiness.status === 'missing'),
    archived: rows.filter(row => row.readiness.status === 'archived'),
  }), [rows]);
  const readyStudentKey = rowsByStatus.ready.map(row => row.student.id).join('|');

  useEffect(() => {
    if (!templates.some(template => template.id === activeTemplateId) && templates[0]) setActiveTemplateId(templates[0].id);
  }, [activeTemplateId, templates]);

  useEffect(() => {
    setSelectedStudentIds(new Set(rowsByStatus.ready.map(row => row.student.id)));
  }, [activeTemplate?.id, readyStudentKey]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds(current => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleAllReady = () => {
    const readyIds = rowsByStatus.ready.map(row => row.student.id);
    setSelectedStudentIds(selectedStudentIds.size === readyIds.length ? new Set() : new Set(readyIds));
  };

  const archiveSelectedStudents = () => {
    if (!activeTemplate || selectedStudentIds.size === 0) return;
    const selected = students.filter(student => selectedStudentIds.has(student.id));
    const result = batchArchiveStudents(workspace, activeTemplate.id, selected, classInfo, teacherProfile.name);
    setWorkspace(result.workspace);
    persistArchiveWorkspace(result.workspace);
    setSelectedStudentIds(new Set());
    showToast(`已完成${result.archivedStudentIds.length}名学生留档`);
    if (result.archivedStudentIds.length > 0) setActiveFilter('archived');
  };

  const visibleRows = rowsByStatus[activeFilter];

  return (
    <div className={`relative flex h-full min-h-0 flex-col ${pageBackground}`}>
      <PageHeader title="批量留档" onBack={onBack} />
      <div className={`flex-1 overflow-y-auto px-5 pt-4 no-scrollbar ${activeFilter === 'ready' && rowsByStatus.ready.length > 0 ? 'pb-32' : 'pb-8'}`}>
        {activeTemplate ? (
          <>
            <button
              type="button"
              onClick={() => setShowTemplatePicker(true)}
              className={`${sectionSurface} flex min-h-[68px] w-full items-center gap-3 px-4 text-left`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]"><Archive className="h-4.5 w-4.5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-bold text-[var(--tm-text-primary)]">{activeTemplate.name}</span>
                <span className="mt-1 block truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{classInfo.name} · {resolveArchivePeriod(activeTemplate).label}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
            </button>

            <div className="mt-4 grid grid-cols-3 border-b border-[var(--tm-border-subtle)]">
              {(Object.keys(filterLabels) as ReadinessFilter[]).map(filter => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`relative min-h-11 text-[13px] font-semibold ${activeFilter === filter ? 'text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-secondary)]'}`}
                >
                  {filterLabels[filter]} {rowsByStatus[filter].length}
                  {activeFilter === filter && <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-[var(--tm-brand-primary)]" />}
                </button>
              ))}
            </div>

            {activeFilter === 'ready' && rowsByStatus.ready.length > 0 && (
              <div className="flex min-h-11 items-center justify-between">
                <span className="text-[12px] font-medium text-[var(--tm-text-tertiary)]">已选 {selectedStudentIds.size} 人</span>
                <button type="button" onClick={toggleAllReady} className="min-h-11 px-1 text-[12px] font-semibold text-[var(--tm-brand-primary)]">
                  {selectedStudentIds.size === rowsByStatus.ready.length ? '取消全选' : '全选'}
                </button>
              </div>
            )}

            <section className={`${sectionSurface} ${activeFilter === 'ready' && rowsByStatus.ready.length > 0 ? '' : 'mt-4'} divide-y divide-[var(--tm-border-subtle)] px-4`}>
              {visibleRows.map(({ student, readiness }) => {
                const selected = selectedStudentIds.has(student.id);
                return (
                  <button
                    key={student.id}
                    type="button"
                    disabled={activeFilter !== 'ready'}
                    onClick={() => toggleStudent(student.id)}
                    className="flex min-h-[64px] w-full items-center gap-3 py-2 text-left disabled:cursor-default"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activeFilter === 'archived' ? 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' : activeFilter === 'missing' ? 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]'}`}>
                      {activeFilter === 'archived' ? <Check className="h-4.5 w-4.5" /> : activeFilter === 'missing' ? <CircleAlert className="h-4.5 w-4.5" /> : <UserRound className="h-4.5 w-4.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{student.name}</span>
                      {activeFilter === 'missing' && <span className="mt-1 block truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{readiness.missingLabels.slice(0, 3).join('、')}</span>}
                    </span>
                    {activeFilter === 'ready' ? (
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] text-transparent'}`}><Check className="h-4 w-4" /></span>
                    ) : activeFilter === 'missing' ? (
                      <StatusPill className="bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">缺{readiness.missingLabels.length}项</StatusPill>
                    ) : (
                      <StatusPill className="bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]">已留档</StatusPill>
                    )}
                  </button>
                );
              })}
              {visibleRows.length === 0 && <div className="py-8 text-center text-[14px] font-medium text-[var(--tm-text-secondary)]">暂无{filterLabels[activeFilter]}学生</div>}
            </section>
          </>
        ) : (
          <section className={`${sectionSurface} px-4 py-8 text-center text-[14px] font-medium text-[var(--tm-text-secondary)]`}>当前年级暂无已启用档案</section>
        )}
      </div>

      {activeFilter === 'ready' && rowsByStatus.ready.length > 0 && (
        <BottomAction>
          <button type="button" disabled={selectedStudentIds.size === 0} onClick={archiveSelectedStudents} className={`${primaryButton} w-full disabled:opacity-40`}>
            <LockKeyhole className="h-4.5 w-4.5" />批量留档 {selectedStudentIds.size} 人
          </button>
        </BottomAction>
      )}

      <BottomSheet open={showTemplatePicker} label="选择档案" onDismiss={() => setShowTemplatePicker(false)}>
        <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">选择档案</h2>
        <div className="mt-4 divide-y divide-[var(--tm-border-subtle)]">
          {templates.map((template: ArchiveTemplate) => {
            const selected = activeTemplate.id === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  setActiveTemplateId(template.id);
                  setActiveFilter('ready');
                  setShowTemplatePicker(false);
                }}
                className="flex min-h-[58px] w-full items-center justify-between gap-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{template.name}</span>
                  <span className="mt-1 block text-[11px] font-medium text-[var(--tm-text-tertiary)]">{resolveArchivePeriod(template).label}</span>
                </span>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] text-transparent'}`}><Check className="h-4 w-4" /></span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
      <Toast message={toast} />
    </div>
  );
};

export default ClassArchiveBatchView;
