import React, { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import type { ClassInfo, SchoolStudentTeam, Student, StudentCardDisplaySettings } from '../../types';
import { BackIcon, ChartIcon, FemaleIcon, MaleIcon, MenuIcon, SearchIcon } from '../../components/Icons';
import ClassInviteFlow from '../../components/class/ClassInviteFlow';
import StudentRosterCard from '../../components/student/StudentRosterCard';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../../components/ui/MobileConfirmSheet';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import MobileSearchInput from '../../components/ui/MobileSearchInput';
import CardLevelDisplaySettings from '../../components/student-performance/CardLevelDisplaySettings';
import CardEvaluationDisplaySettings from '../../components/student-performance/CardEvaluationDisplaySettings';
import { ASSETS } from '../../assets/images';
import { createDemoStudentPerformanceSummary, type StudentPerformanceSummary } from '../../domain/studentPerformance';
import { getStudentCardDisplaySettings } from '../../domain/studentCardDisplay';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import StudentTeamEditorView, { type StudentTeamEditorMode, type StudentTeamEditorValue, type StudentTeamSearchResult } from './StudentTeamEditorView';
import StudentTeamManagementActions from './StudentTeamManagementActions';

interface StudentTeamDetailViewProps {
  team: SchoolStudentTeam;
  students: Student[];
  currentTeacherName: string;
  schoolName: string;
  currentSpace: TeacherSpaceOption;
  canManage: boolean;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  searchStudentsByExactName: (name: string) => StudentTeamSearchResult[];
  onBack: () => void;
  onSelectStudent: (student: Student) => void;
  onUpdate: (teamId: string, value: StudentTeamEditorValue) => void;
  onArchive: (teamId: string) => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  performanceByStudentId?: Record<string, StudentPerformanceSummary>;
}

const StudentTeamDetailView: React.FC<StudentTeamDetailViewProps> = ({
  team,
  students,
  currentTeacherName,
  schoolName,
  currentSpace,
  canManage,
  classes,
  getStudentsForClass,
  searchStudentsByExactName,
  onBack,
  onSelectStudent,
  onUpdate,
  onArchive,
  isSelectionMode,
  onToggleSelectionMode,
  selectedIds,
  onSelectionChange,
  performanceByStudentId = {},
}) => {
  const [query, setQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [editorMode, setEditorMode] = useState<Exclude<StudentTeamEditorMode, 'create'> | null>(null);
  const [displaySettings, setDisplaySettings] = useState<StudentCardDisplaySettings>(() => getStudentCardDisplaySettings());
  const normalizedQuery = query.trim().replace(/\s+/g, '').toLowerCase();
  const visibleStudents = useMemo(() => students.filter(student => (
    !normalizedQuery
    || student.name.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery)
    || (student.studentNo ?? '').toLowerCase().includes(normalizedQuery)
  )), [normalizedQuery, students]);
  const studentsByGender = useMemo(() => ({
    male: students.filter(student => student.gender === 'male'),
    female: students.filter(student => student.gender === 'female'),
  }), [students]);
  const isAllVisibleSelected = visibleStudents.length > 0 && visibleStudents.every(student => selectedIds.has(student.id));
  const isMaleQuickSelectionActive = studentsByGender.male.length > 0
    && selectedIds.size === studentsByGender.male.length
    && studentsByGender.male.every(student => selectedIds.has(student.id));
  const isFemaleQuickSelectionActive = studentsByGender.female.length > 0
    && selectedIds.size === studentsByGender.female.length
    && studentsByGender.female.every(student => selectedIds.has(student.id));
  const teamOverview = useMemo(() => students.reduce((summary, student) => {
    const performance = performanceByStudentId[student.id] ?? createDemoStudentPerformanceSummary(student);
    return {
      activeMemberCount: summary.activeMemberCount + (performance.praiseCount + performance.criticismCount > 0 ? 1 : 0),
      evaluationCount: summary.evaluationCount + performance.praiseCount + performance.criticismCount,
      praiseCount: summary.praiseCount + performance.praiseCount,
      criticismCount: summary.criticismCount + performance.criticismCount,
      netScore: summary.netScore + performance.netScore,
    };
  }, {
    activeMemberCount: 0,
    evaluationCount: 0,
    praiseCount: 0,
    criticismCount: 0,
    netScore: 0,
  }), [performanceByStudentId, students]);

  const toggleStudent = (studentId: string) => {
    const next = new Set(selectedIds);
    if (next.has(studentId)) next.delete(studentId);
    else next.add(studentId);
    onSelectionChange(next);
  };

  const selectAllVisible = () => {
    const next = new Set(selectedIds);
    visibleStudents.forEach(student => next.add(student.id));
    onSelectionChange(next);
  };

  const clearVisible = () => {
    const visibleIds = new Set(visibleStudents.map(student => student.id));
    onSelectionChange(new Set(Array.from(selectedIds).filter(id => !visibleIds.has(id))));
  };

  const invertVisible = () => {
    const next = new Set(selectedIds);
    visibleStudents.forEach(student => {
      if (next.has(student.id)) next.delete(student.id);
      else next.add(student.id);
    });
    onSelectionChange(next);
  };

  const toggleGender = (gender: Student['gender']) => {
    const genderStudents = studentsByGender[gender];
    const active = gender === 'male' ? isMaleQuickSelectionActive : isFemaleQuickSelectionActive;
    onSelectionChange(active ? new Set() : new Set(genderStudents.map(student => student.id)));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <header className="relative z-10 flex h-11 shrink-0 items-center justify-between bg-[var(--tm-page-plain-header-bg)] px-4 [padding-right:var(--mini-program-capsule-right-inset,16px)]">
        <button type="button" onClick={onBack} aria-label="返回社团与团队" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
          <BackIcon className="h-5 w-5 text-[var(--tm-text-secondary)]" />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 max-w-[52%] -translate-x-1/2 truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">{team.name}</h1>
        <div className="h-11 w-11" aria-hidden="true" />
      </header>

      <section className="mx-4 mt-3 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]" aria-labelledby="student-team-overview-title">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <ChartIcon className="h-4 w-4 shrink-0 text-[var(--tm-brand-primary)]" aria-hidden="true" />
            <h2 id="student-team-overview-title" className="text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">数据概览</h2>
          </div>
          <span className="text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">本学期</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: '成员评价', value: teamOverview.evaluationCount },
            { label: '活跃成员', value: `${teamOverview.activeMemberCount}/${students.length}` },
            { label: '表扬', value: teamOverview.praiseCount },
            { label: '待改进', value: teamOverview.criticismCount },
          ].map(item => (
            <div key={item.label} className="rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-3 py-2.5">
              <div className="text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">{item.label}</div>
              <div className="mt-1 text-[length:var(--tm-font-size-metric)] font-semibold tabular-nums text-[var(--tm-text-primary)]">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
          <span>成员累计分值</span>
          <span className="tabular-nums text-[var(--tm-text-primary)]">{teamOverview.netScore >= 0 ? '+' : ''}{teamOverview.netScore}</span>
        </div>
      </section>

      <div className="student-action-row sticky top-0 z-10 flex min-h-[52px] shrink-0 items-center gap-1.5 bg-[var(--tm-bg-surface)] px-4 py-1">
        <div className={`relative text-left transition-all duration-300 ease-out ${isSelectionMode ? 'w-11 flex-none opacity-70' : 'min-w-0 flex-1 opacity-100'}`}>
          {isSelectionMode ? (
            <button type="button" onClick={onToggleSelectionMode} aria-label="恢复搜索" className="flex h-11 w-11 items-center justify-center rounded-full">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white [box-shadow:var(--tm-shadow-control)]"><SearchIcon className="h-4 w-4 text-[var(--tm-text-disabled)]" /></span>
            </button>
          ) : (
            <MobileSearchInput value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索姓名、学号" aria-label="搜索团队学生" density="compact" appearance="filled" containerClassName="flex min-h-11 items-center" />
          )}
        </div>

        <div className="selection-tools-next-to-cancel ml-auto flex shrink-0 items-center gap-1">
          {isSelectionMode && (
            <>
              <button type="button" onClick={isAllVisibleSelected ? clearVisible : selectAllVisible} className="flex min-h-11 shrink-0 items-center justify-center p-0 text-[13px] font-semibold text-[var(--tm-text-secondary)]"><span className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white px-3 [box-shadow:var(--tm-shadow-control)]">{isAllVisibleSelected ? '取消全选' : '全选'}</span></button>
              <button type="button" onClick={invertVisible} className="flex min-h-11 shrink-0 items-center justify-center p-0 text-[13px] font-semibold text-[var(--tm-text-secondary)]"><span className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white px-3 [box-shadow:var(--tm-shadow-control)]">反选</span></button>
              <button type="button" onClick={() => toggleGender('male')} aria-label={isMaleQuickSelectionActive ? '取消全选男生' : '全选男生'} aria-pressed={isMaleQuickSelectionActive} className="flex h-11 w-11 shrink-0 items-center justify-center"><span className={`flex h-8 w-10 items-center justify-center rounded-full border transition-colors [transition-duration:var(--tm-duration-standard)] [box-shadow:var(--tm-shadow-control)] ${isMaleQuickSelectionActive ? 'border-[var(--tm-gender-male-selection-bg)] bg-[var(--tm-gender-male-selection-bg)] text-white' : 'border-[var(--tm-border-subtle)] bg-white text-[var(--tm-gender-male)]'}`}><MaleIcon className="h-4 w-4" /></span></button>
              <button type="button" onClick={() => toggleGender('female')} aria-label={isFemaleQuickSelectionActive ? '取消全选女生' : '全选女生'} aria-pressed={isFemaleQuickSelectionActive} className="flex h-11 w-11 shrink-0 items-center justify-center"><span className={`flex h-8 w-10 items-center justify-center rounded-full border transition-colors [transition-duration:var(--tm-duration-standard)] [box-shadow:var(--tm-shadow-control)] ${isFemaleQuickSelectionActive ? 'border-[var(--tm-gender-female-selection-bg)] bg-[var(--tm-gender-female-selection-bg)] text-white' : 'border-[var(--tm-border-subtle)] bg-white text-[var(--tm-gender-female)]'}`}><FemaleIcon className="h-4 w-4" /></span></button>
            </>
          )}
          <button type="button" onClick={() => { if (!isSelectionMode) setQuery(''); onToggleSelectionMode(); }} className={`min-h-11 shrink-0 rounded-[var(--tm-radius-control)] px-2.5 text-[13px] font-semibold ${isSelectionMode ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-primary)]'}`}>{isSelectionMode ? '取消' : '多选'}</button>
          {!isSelectionMode && (students.length > 0 || canManage) && (
            <button type="button" onClick={() => setShowMore(true)} aria-label="学生更多操作" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-primary)]">
              <MenuIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-3 pb-40 pt-3 no-scrollbar">
        <div className="student-roster-grid grid shrink-0 gap-x-2.5 gap-y-3">
          {visibleStudents.map((student, index) => (
            <StudentRosterCard
              key={student.id}
              student={student}
              index={index}
              performance={performanceByStudentId[student.id] ?? createDemoStudentPerformanceSummary(student)}
              displaySettings={displaySettings}
              showSelection={isSelectionMode}
              selected={selectedIds.has(student.id)}
              onClick={() => isSelectionMode ? toggleStudent(student.id) : onSelectStudent(student)}
            />
          ))}
        </div>

        {visibleStudents.length === 0 && (
          <MobileEmptyState imageSrc={normalizedQuery ? ASSETS.DEFAULT_STATE.MAGNIFIER : ASSETS.DEFAULT_STATE.CHAIR} title={normalizedQuery ? '没有匹配的学生' : '暂无成员'} className="min-h-[420px]" />
        )}
      </main>

      <MobileBottomSheet open={showMore} title="更多操作" onClose={() => setShowMore(false)}>
        <div className="space-y-1 pb-2">
          <button type="button" onClick={() => { setShowMore(false); setShowCardSettings(true); }} className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[14px] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]"><Eye className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" />学生卡片展示</button>
          {canManage && (
            <StudentTeamManagementActions
              onEditMembers={() => { setShowMore(false); setEditorMode('members'); }}
              onEditSettings={() => { setShowMore(false); setEditorMode('settings'); }}
              onInvite={() => { setShowMore(false); setShowInvite(true); }}
              onArchive={() => { setShowMore(false); setShowArchiveConfirm(true); }}
            />
          )}
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={showCardSettings} title="学生卡片展示" onClose={() => setShowCardSettings(false)}>
        <div className="space-y-[var(--tm-space-4)] pb-2">
          <CardLevelDisplaySettings
            showLevel={displaySettings.showLevel}
            levelForm={displaySettings.levelForm}
            onChange={({ showLevel, levelForm }) => setDisplaySettings(current => ({ ...current, showLevel, levelForm }))}
          />
          <CardEvaluationDisplaySettings
            settings={displaySettings}
            onChange={settings => setDisplaySettings(current => ({ ...current, ...settings }))}
          />
        </div>
      </MobileBottomSheet>

      {canManage && <ClassInviteFlow open={showInvite} audience="teacher" studentTeam={{ id: team.id, name: team.name }} inviterName={currentTeacherName} schoolName={schoolName} onClose={() => setShowInvite(false)} />}

      <StudentTeamEditorView
        open={Boolean(editorMode)}
        mode={editorMode ?? 'settings'}
        team={team}
        classes={classes}
        getStudentsForClass={getStudentsForClass}
        searchStudentsByExactName={searchStudentsByExactName}
        getClassLabel={classInfo => getTeacherClassDisplayName(classInfo, currentSpace)}
        currentSpace={currentSpace}
        onClose={() => setEditorMode(null)}
        onSave={value => {
          onUpdate(team.id, value);
          setEditorMode(null);
        }}
      />

      <MobileConfirmSheet open={showArchiveConfirm} title={`解散${team.name}`} description="解散后不再显示该团队，已有学生评价记录不受影响。" confirmLabel="确认解散" tone="danger" onClose={() => setShowArchiveConfirm(false)} onConfirm={() => { setShowArchiveConfirm(false); onArchive(team.id); }} />
    </div>
  );
};

export default StudentTeamDetailView;
