import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Pencil, Repeat2 } from 'lucide-react';
import type { ClassInfo, SchoolStudentTeam, Student } from '../../types';
import { MobileCard } from '../../components/ui/MobileCard';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../../components/ui/MobileConfirmSheet';
import { ASSETS } from '../../assets/images';
import { phoneText } from '../../styles/teacherMobileTokens';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import StudentTeamEditorView, { type StudentTeamEditorValue, type StudentTeamSearchResult } from './StudentTeamEditorView';

interface TeamTeacherItem {
  id: string;
  name: string;
  isOwner: boolean;
}

interface StudentTeamInfoViewProps {
  team: SchoolStudentTeam;
  canManage: boolean;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  searchStudentsByExactName: (name: string) => StudentTeamSearchResult[];
  getStudentLabelById: (studentId: string) => { name: string; classLabel: string } | undefined;
  currentSpace: TeacherSpaceOption;
  onBack: () => void;
  onUpdate: (teamId: string, value: StudentTeamEditorValue) => void;
  onRemoveCollaborator: (teamId: string, collaboratorId: string) => void;
  onTransferOwner: (teamId: string, collaboratorId: string) => void;
  onArchive: (teamId: string) => void;
}

type DetailPage = 'detail' | 'teachers';

const iconButtonClass = 'flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]';
const secondaryButtonClass = 'flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]';
const fixedFooterClass = 'shrink-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-5)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)]';

const StudentTeamInfoView: React.FC<StudentTeamInfoViewProps> = ({
  team,
  canManage,
  classes,
  getStudentsForClass,
  searchStudentsByExactName,
  getStudentLabelById,
  currentSpace,
  onBack,
  onUpdate,
  onRemoveCollaborator,
  onTransferOwner,
  onArchive,
}) => {
  const [page, setPage] = useState<DetailPage>('detail');
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showTransferSheet, setShowTransferSheet] = useState(false);
  const [transferTarget, setTransferTarget] = useState<{ id: string; name: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const isPublic = team.visibility === 'management';

  const teachers = useMemo<TeamTeacherItem[]>(() => [
    { id: team.ownerId, name: team.ownerName, isOwner: true },
    ...team.collaboratorIds.map((collaboratorId, index) => ({
      id: collaboratorId,
      name: team.collaboratorNames[index] ?? '协作老师',
      isOwner: false,
    })),
  ], [team]);
  const collaborators = useMemo(() => team.collaboratorIds.map((collaboratorId, index) => ({
    id: collaboratorId,
    name: team.collaboratorNames[index] ?? '协作老师',
  })), [team]);

  const handleBack = () => {
    if (page !== 'detail') {
      setPage('detail');
      return;
    }
    onBack();
  };

  const title = page === 'teachers' ? '老师列表' : '社团详情';

  const renderSectionHeader = (label: string, count: string, onViewAll: () => void, ariaLabel: string) => (
    <div className="flex min-h-[var(--tm-size-touch)] items-center justify-between gap-[var(--tm-space-3)]">
      <h2 className={`${phoneText.sectionTitle} min-w-0 text-[var(--tm-text-primary)]`}>
        {label}<span className="ml-[var(--tm-space-1)] text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">({count})</span>
      </h2>
      <button type="button" onClick={onViewAll} className={iconButtonClass} aria-label={ariaLabel}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );

  const TeacherAvatar: React.FC<{ teacher: TeamTeacherItem }> = ({ teacher }) => (
    <div className="w-[var(--tm-size-touch)] shrink-0 text-center">
      <img src={ASSETS.AVATAR.TEACHER_DEFAULT} alt="" className="h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 rounded-full bg-[var(--tm-bg-surface-soft)] object-cover" />
      <div className="mt-[var(--tm-space-1)] truncate text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-primary)]">
        {teacher.name}
      </div>
    </div>
  );

  const renderDetail = () => (
    <>
      <MobileCard variant="card" padding="md" className="relative">
        {canManage && (
          <button
            type="button"
            onClick={() => setShowEditSheet(true)}
            className={`${iconButtonClass} absolute right-[var(--tm-space-3)] top-[var(--tm-space-3)] text-[var(--tm-brand-primary)]`}
            aria-label="编辑社团信息"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>
        )}
        <div className={`flex items-center gap-[var(--tm-space-2)] ${canManage ? 'pr-[calc(var(--tm-size-touch)+var(--tm-space-2))]' : ''}`}>
          <h2 className="min-w-0 truncate text-[length:var(--tm-class-info-title-font-size)] font-bold leading-tight text-[var(--tm-text-primary)]">{team.name}</h2>
          <span className={`inline-flex h-5 shrink-0 items-center rounded-md px-1.5 text-[11px] font-semibold ${isPublic ? 'bg-[var(--tm-brand-secondary-soft)] text-[var(--tm-brand-secondary-strong)]' : 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]'}`}>{isPublic ? '公开' : '私密'}</span>
        </div>
        <div className="mt-[var(--tm-space-3)] flex min-h-[var(--tm-size-touch)] items-center justify-end gap-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">
          <span className="shrink-0 tabular-nums text-[var(--tm-text-primary)]">{team.memberIds.length}人</span>
        </div>
      </MobileCard>

      <MobileCard variant="card" padding="md" className="mt-[var(--tm-space-4)]">
        {renderSectionHeader('老师列表', `${teachers.length}人`, () => setPage('teachers'), '查看完整老师列表')}
        <div className="mt-[var(--tm-space-3)] flex flex-wrap gap-[var(--tm-space-3)]">
          {teachers.slice(0, 5).map(teacher => <TeacherAvatar key={teacher.id} teacher={teacher} />)}
        </div>
      </MobileCard>
    </>
  );

  const renderTeacherList = () => (
    <div className="space-y-[var(--tm-space-3)]">
      {teachers.map(teacher => (
        <MobileCard key={teacher.id} variant="card" padding="md" className="flex min-h-[76px] items-center gap-[var(--tm-space-3)]">
          <img src={ASSETS.AVATAR.TEACHER_DEFAULT} alt="" className="h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 rounded-full bg-[var(--tm-bg-surface-soft)] object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{teacher.name}{teacher.id === team.ownerId ? '（我）' : ''}</div>
            <div className="mt-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{teacher.isOwner ? '负责人' : '协作老师'}</div>
          </div>
          {canManage && !teacher.isOwner && (
            <button type="button" onClick={() => setRemoveTarget({ id: teacher.id, name: teacher.name })} className="inline-flex min-h-11 shrink-0 items-center rounded-[var(--tm-radius-control)] px-2 text-[13px] font-semibold text-[var(--tm-status-negative)]">移除</button>
          )}
        </MobileCard>
      ))}
    </div>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={handleBack} className={`${iconButtonClass} -ml-[var(--tm-space-2)]`} aria-label={page === 'detail' ? '返回社团与团队' : '返回社团详情'}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className={`${phoneText.navTitle} pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[var(--tm-text-primary)]`}>{title}</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] py-[var(--tm-space-4)] no-scrollbar">
        {page === 'detail' && renderDetail()}
        {page === 'teachers' && renderTeacherList()}
      </div>

      {page === 'detail' && canManage && (
        <footer className={`${fixedFooterClass} space-y-[var(--tm-space-2)]`}>
          <button type="button" onClick={() => setShowTransferSheet(true)} className={secondaryButtonClass}>
            <Repeat2 className="h-[18px] w-[18px]" />转移负责人
          </button>
          <button type="button" onClick={() => setShowArchiveConfirm(true)} className={`${secondaryButtonClass} text-[var(--tm-status-negative-strong)]`}>
            <LogOut className="h-[18px] w-[18px]" />解散
          </button>
        </footer>
      )}

      <MobileBottomSheet open={showTransferSheet} title="选择新负责人" onClose={() => setShowTransferSheet(false)}>
        <div className="space-y-2 pb-2">
          {collaborators.length === 0 ? (
            <p className="py-8 text-center text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-tertiary)]">还没有协作老师，可通过邀请老师添加</p>
          ) : (
            collaborators.map(collaborator => (
              <button
                key={collaborator.id}
                type="button"
                onClick={() => { setShowTransferSheet(false); setTransferTarget(collaborator); }}
                className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-3 text-left"
              >
                <img src={ASSETS.AVATAR.TEACHER_DEFAULT} alt="" className="h-9 w-9 shrink-0 rounded-full bg-[var(--tm-bg-surface)] object-cover" />
                <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{collaborator.name}</span>
              </button>
            ))
          )}
        </div>
      </MobileBottomSheet>

      <StudentTeamEditorView
        open={showEditSheet}
        mode="settings"
        team={team}
        classes={classes}
        getStudentsForClass={getStudentsForClass}
        searchStudentsByExactName={searchStudentsByExactName}
        getStudentLabelById={getStudentLabelById}
        getClassLabel={classInfo => getTeacherClassDisplayName(classInfo, currentSpace)}
        currentSpace={currentSpace}
        onClose={() => setShowEditSheet(false)}
        onSave={value => {
          onUpdate(team.id, value);
          setShowEditSheet(false);
        }}
      />

      <MobileConfirmSheet
        open={Boolean(transferTarget)}
        title="确认转让负责人"
        description={`确认后，${transferTarget?.name ?? ''}将成为「${team.name}」的负责人，你将转为协作老师。`}
        confirmLabel="确认转让"
        onClose={() => setTransferTarget(null)}
        onConfirm={() => { if (transferTarget) onTransferOwner(team.id, transferTarget.id); setTransferTarget(null); }}
      />

      <MobileConfirmSheet
        open={Boolean(removeTarget)}
        title="移除协作老师"
        description={`确认移除${removeTarget?.name ?? ''}的协作老师身份？`}
        confirmLabel="确认移除"
        tone="danger"
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => { if (removeTarget) onRemoveCollaborator(team.id, removeTarget.id); setRemoveTarget(null); }}
      />

      <MobileConfirmSheet open={showArchiveConfirm} title={`解散${team.name}`} description="解散后不再显示该团队，已有学生评价记录不受影响。" confirmLabel="确认解散" tone="danger" onClose={() => setShowArchiveConfirm(false)} onConfirm={() => { setShowArchiveConfirm(false); onArchive(team.id); }} />
    </div>
  );
};

export default StudentTeamInfoView;
