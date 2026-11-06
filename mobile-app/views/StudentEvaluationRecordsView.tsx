import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import { ImageGallery, ImagePreview } from '../../components/media/ImageGallery';
import React, { useEffect, useMemo, useState } from 'react';
import { Ellipsis, Bot, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import StudentTermSelector, { type StudentTermOption } from '../components/student-detail/StudentTermSelector';
import { phoneText } from '../styles/teacherMobileTokens';
import EvaluationRecordDetailView from './student-evaluation/EvaluationRecordDetailView';
import EvaluationRecordEditView from './student-evaluation/EvaluationRecordEditView';
import EvaluationIndicatorFilterSheet, { type EvaluationIndicatorOption } from './student-evaluation/EvaluationIndicatorFilterSheet';
import EvaluationTeacherFilterSheet, { type EvaluationTeacherOption } from './student-evaluation/EvaluationTeacherFilterSheet';
import EvaluationTimeFilterSheet, {
  getEvaluationDateRange,
  getEvaluationTimeFilterLabel,
  type EvaluationTimeFilterValue,
} from './student-evaluation/EvaluationTimeFilterSheet';
import type { StudentEvaluationRecord, StudentEvaluationRecordRevision, StudentEvaluationRecordUpdate } from './student-evaluation/types';

export type { StudentEvaluationRecord } from './student-evaluation/types';

interface StudentEvaluationRecordsViewProps {
  records: StudentEvaluationRecord[];
  selectedTerm: string;
  termOptions: StudentTermOption[];
  currentTeacherId: string;
  currentTeacherName: string;
  canEditOtherTeachersRecords: boolean;
  onSelectedTermChange: (value: string) => void;
  onUpdateRecord: (record: StudentEvaluationRecord) => void;
  onDeleteRecord?: (recordId: string) => void;
  onBack: () => void;
  embedded?: boolean;
  initialRecordId?: string | null;
  initialRecordPage?: 'detail' | 'edit';
  onSelectRecord?: (record: StudentEvaluationRecord) => void;
}

const DEFAULT_TIME_FILTER: EvaluationTimeFilterValue = {
  type: 'all',
  customStart: '',
  customEnd: '',
};

const formatMonthLabel = (value: string) => {
  const [year, month] = value.split('-');
  return `${year}年${Number(month)}月`;
};

const matchesIndicatorPath = (record: StudentEvaluationRecord, path: string[]) => (
  path.every((label, index) => record.indicatorPath[index] === label)
);

const buildIndicatorOptions = (
  allRecords: StudentEvaluationRecord[],
  countRecords: StudentEvaluationRecord[],
) => {
  interface MutableIndicatorOption {
    label: string;
    count: number;
    children: Map<string, MutableIndicatorOption>;
  }

  const pathCounts = new Map<string, number>();
  countRecords.forEach(record => {
    record.indicatorPath.slice(0, 3).forEach((_, index) => {
      const key = record.indicatorPath.slice(0, index + 1).join('\u0000');
      pathCounts.set(key, (pathCounts.get(key) ?? 0) + 1);
    });
  });

  const root = new Map<string, MutableIndicatorOption>();
  allRecords.forEach(record => {
    let currentLevel = root;
    record.indicatorPath.slice(0, 3).forEach((label, index) => {
      const path = record.indicatorPath.slice(0, index + 1);
      let option = currentLevel.get(label);
      if (!option) {
        option = { label, count: pathCounts.get(path.join('\u0000')) ?? 0, children: new Map() };
        currentLevel.set(label, option);
      }
      currentLevel = option.children;
    });
  });

  const toOptions = (options: Map<string, MutableIndicatorOption>): EvaluationIndicatorOption[] => Array.from(options.values())
    .map(option => ({ label: option.label, count: option.count, children: toOptions(option.children) }))
    .sort((left, right) => left.label.localeCompare(right.label, 'zh-CN'));
  return toOptions(root);
};

const StudentEvaluationRecordsView: React.FC<StudentEvaluationRecordsViewProps> = ({
  records,
  selectedTerm,
  termOptions,
  currentTeacherId,
  currentTeacherName,
  canEditOtherTeachersRecords,
  onSelectedTermChange,
  onUpdateRecord,
  onBack,
  embedded = false,
  initialRecordId = null,
  initialRecordPage = 'detail',
  onDeleteRecord,
  onSelectRecord,
}) => {
  const [menuRecord, setMenuRecord] = useState<StudentEvaluationRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<StudentEvaluationRecord | null>(null);
  const canDelete = (record: StudentEvaluationRecord) => Boolean(onDeleteRecord && record.source !== 'parent' && (record.teacherId === currentTeacherId || canEditOtherTeachersRecords));
  const [imagePreview, setImagePreview] = useState<{images: string[]; index: number} | null>(null);
  const [timeFilter, setTimeFilter] = useState<EvaluationTimeFilterValue>(DEFAULT_TIME_FILTER);
  const [teacherFilterId, setTeacherFilterId] = useState('all');
  const [indicatorFilterPath, setIndicatorFilterPath] = useState<string[]>([]);
  const [showTimeFilterSheet, setShowTimeFilterSheet] = useState(false);
  const [showTeacherFilterSheet, setShowTeacherFilterSheet] = useState(false);
  const [showIndicatorFilterSheet, setShowIndicatorFilterSheet] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(initialRecordId);
  const [recordPage, setRecordPage] = useState<'detail' | 'edit'>(initialRecordPage);
  const activeTerm = termOptions.find(option => option.value === selectedTerm) ?? termOptions[0];

  useEffect(() => {
    setTimeFilter(DEFAULT_TIME_FILTER);
    setTeacherFilterId('all');
    setIndicatorFilterPath([]);
    setActiveRecordId(initialRecordId);
    setRecordPage(initialRecordPage);
  }, [initialRecordId, initialRecordPage, selectedTerm]);

  const termRecords = useMemo(() => records.filter(record => (
    record.evaluation_date >= activeTerm.startDate && record.evaluation_date <= activeTerm.endDate
  )), [activeTerm.endDate, activeTerm.startDate, records]);
  const referenceDate = useMemo(() => {
    const today = new Date();
    const todayValue = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
    if (!activeTerm.isCurrent || (todayValue >= activeTerm.startDate && todayValue <= activeTerm.endDate)) return today;
    const latestRecordDate = termRecords[0]?.evaluation_date
      ? [...termRecords].sort((left, right) => right.evaluation_date.localeCompare(left.evaluation_date))[0].evaluation_date
      : activeTerm.endDate;
    return new Date(`${latestRecordDate}T12:00:00`);
  }, [activeTerm.endDate, activeTerm.isCurrent, activeTerm.startDate, termRecords]);

  const termTeacherOptions = useMemo(() => {
    const teachers = new Map<string, EvaluationTeacherOption>();
    termRecords.forEach(record => {
      const optionId = record.source === 'parent' ? `relation:${record.guardianRelation || record.teacherName || '监护人'}` : record.teacherId;
      const current = teachers.get(optionId);
      teachers.set(optionId, {
        id: optionId,
        source: record.source ?? 'school',
        name: record.source === 'parent' ? record.guardianRelation || record.teacherName || '监护人' : record.teacherName,
        count: (current?.count ?? 0) + 1,
      });
    });
    return [{ id: 'source:school', name: '学校评价', count: termRecords.filter(r => r.source !== 'parent').length }, { id: 'source:parent', name: '家长评价', count: termRecords.filter(r => r.source === 'parent').length }, ...Array.from(teachers.values())].sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));
  }, [termRecords]);
  const timeRange = useMemo(() => getEvaluationDateRange(
    timeFilter,
    activeTerm.startDate,
    activeTerm.endDate,
    referenceDate,
  ), [activeTerm.endDate, activeTerm.startDate, referenceDate, timeFilter]);
  const timeFilteredRecords = useMemo(() => termRecords.filter(record => (
    record.evaluation_date >= timeRange.startDate && record.evaluation_date <= timeRange.endDate
  )), [termRecords, timeRange.endDate, timeRange.startDate]);
  const indicatorFilteredRecords = useMemo(() => timeFilteredRecords.filter(record => (
    matchesIndicatorPath(record, indicatorFilterPath)
  )), [indicatorFilterPath, timeFilteredRecords]);
  const teacherOptions = useMemo(() => {
    const counts = new Map<string, number>();
    indicatorFilteredRecords.forEach(record => { const id = record.source === 'parent' ? `relation:${record.guardianRelation || record.teacherName || '监护人'}` : record.teacherId; counts.set(id, (counts.get(id) ?? 0) + 1); });
    return termTeacherOptions.map(teacher => ({ ...teacher, count: teacher.id.startsWith('source:') ? indicatorFilteredRecords.filter(r => (r.source ?? 'school') === teacher.id.slice(7)).length : counts.get(teacher.id) ?? 0 }));
  }, [indicatorFilteredRecords, termTeacherOptions]);

  const teacherFilteredRecords = useMemo(() => timeFilteredRecords.filter(record => (
    teacherFilterId === 'all' || (teacherFilterId.startsWith('source:') ? (record.source ?? 'school') === teacherFilterId.slice(7) : teacherFilterId.startsWith('relation:') ? record.source === 'parent' && `relation:${record.guardianRelation || record.teacherName || '监护人'}` === teacherFilterId : record.teacherId === teacherFilterId)
  )), [teacherFilterId, timeFilteredRecords]);
  const indicatorOptions = useMemo(() => buildIndicatorOptions(termRecords, teacherFilteredRecords), [teacherFilteredRecords, termRecords]);

  const filteredRecords = useMemo(() => teacherFilteredRecords.filter(record => (
    matchesIndicatorPath(record, indicatorFilterPath)
  )).sort((left, right) => right.evaluation_date.localeCompare(left.evaluation_date)), [indicatorFilterPath, teacherFilteredRecords]);

  const groupedRecords = useMemo(() => {
    const groups = new Map<string, StudentEvaluationRecord[]>();
    filteredRecords.forEach(record => {
      const month = record.evaluation_date.slice(0, 7);
      groups.set(month, [...(groups.get(month) ?? []), record]);
    });
    return Array.from(groups, ([month, monthRecords]) => ({ month, records: monthRecords }));
  }, [filteredRecords]);

  const activeRecord = records.find(record => record.id === activeRecordId) ?? null;
  const canEditActiveRecord = Boolean(activeRecord && activeRecord.source !== 'parent' && (
    activeRecord.teacherId === currentTeacherId || canEditOtherTeachersRecords
  ));
  const timeFilterLabel = getEvaluationTimeFilterLabel(
    timeFilter,
    activeTerm.startDate,
    activeTerm.endDate,
    referenceDate,
  );
  const teacherFilterLabel = teacherFilterId === 'all'
    ? '全部评价人'
    : termTeacherOptions.find(teacher => teacher.id === teacherFilterId)?.name ?? '全部评价人';
  const indicatorFilterLabel = indicatorFilterPath[indicatorFilterPath.length - 1] ?? '全部指标';
  const hasActiveFilter = timeFilter.type !== 'all' || teacherFilterId !== 'all' || indicatorFilterPath.length > 0;

  const saveRecord = (update: StudentEvaluationRecordUpdate) => {
    if (!activeRecord || !canEditActiveRecord) return;
    const revision: StudentEvaluationRecordRevision = {
      id: `${activeRecord.id}-${Date.now()}`,
      editedAt: new Date().toISOString(),
      editedByTeacherId: currentTeacherId,
      editedByTeacherName: currentTeacherName,
      reason: update.reason,
      previous: {
        evaluation_date: activeRecord.evaluation_date,
        indicatorPath: [...activeRecord.indicatorPath],
        scoreChange: activeRecord.scoreChange,
        aiComment: activeRecord.aiComment,
      },
    };
    const updatedRecord: StudentEvaluationRecord = {
      ...activeRecord,
      ...update,
      isBad: update.scoreChange < 0,
      revisions: [...(activeRecord.revisions ?? []), revision],
    };
    onUpdateRecord(updatedRecord);
    if (initialRecordId && initialRecordPage === 'edit') {
      onBack();
      return;
    }
    setRecordPage('detail');
  };

  if (activeRecord && canEditActiveRecord && recordPage === 'edit') {
    return (
      <EvaluationRecordEditView
        record={activeRecord}
        isEditingOthersRecord={activeRecord.teacherId !== currentTeacherId}
        termStartDate={activeTerm.startDate}
        termEndDate={activeTerm.endDate}
        onCancel={() => initialRecordId && initialRecordPage === 'edit' ? onBack() : setRecordPage('detail')}
        onSave={saveRecord}
      />
    );
  }

  if (activeRecord) {
    return (
      <EvaluationRecordDetailView
        record={activeRecord}
        canEdit={canEditActiveRecord}
        onBack={() => initialRecordId ? onBack() : setActiveRecordId(null)}
        onEdit={() => setRecordPage('edit')}
      />
    );
  }

  const resetFilters = () => {
    setTimeFilter(DEFAULT_TIME_FILTER);
    setTeacherFilterId('all');
    setIndicatorFilterPath([]);
  };

  const renderRecord = (record: StudentEvaluationRecord) => {
    return (
      <article key={record.id} className="relative rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
        {canDelete(record) && <button type="button" aria-label="更多评价操作" onClick={() => setMenuRecord(record)} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)]"><Ellipsis className="h-5 w-5" /></button>}
        <button type="button" className={`block w-full text-left ${canDelete(record) ? 'pr-8' : ''}`} aria-label={`查看${record.teacherName}的评价详情`} onClick={() => {
          if (onSelectRecord) { onSelectRecord(record); return; }
          setActiveRecordId(record.id); setRecordPage('detail');
        }}>
          <p className="whitespace-pre-wrap break-words text-[length:var(--tm-font-size-card-title)] font-medium leading-relaxed text-[var(--tm-text-primary)]">{record.aiComment || record.description}</p>
        </button>
        {!!record.images?.length && <ImageGallery images={record.images} label="评价图片" className="mt-3" onSelect={index => setImagePreview({images: record.images!, index})} />}
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]"><span className="break-words">{record.teacherName}</span><span>{record.timestamp?.slice(0, 16) || record.evaluation_date}</span></div>
          {record.source !== 'parent' && <span className={`shrink-0 text-lg font-bold tabular-nums ${record.isBad ? 'text-[var(--tm-record-negative-text)]' : 'text-[var(--tm-record-positive-text)]'}`}>{record.scoreChange > 0 ? `+${record.scoreChange}` : record.scoreChange}</span>}
        </div>
      </article>
    );
  };

  return (
    <div className={`relative bg-transparent font-sans ${embedded ? '' : 'flex h-full min-h-0 flex-col overflow-hidden'}`}>
      <MobileBottomSheet open={Boolean(menuRecord)} title="更多操作" onClose={() => setMenuRecord(null)}>
        <button type="button" className="min-h-11 w-full text-left text-[var(--tm-status-negative-strong)]" onClick={() => { setDeleteRecord(menuRecord); setMenuRecord(null); }}>删除评价</button>
      </MobileBottomSheet>
      <MobileConfirmSheet open={Boolean(deleteRecord)} title="删除评价" description="删除后，该评价将从学生记录中移除，相关积分也会重新计算。确定删除吗？" confirmLabel="删除评价" tone="danger" onClose={() => setDeleteRecord(null)} onConfirm={() => {
        if (deleteRecord && canDelete(deleteRecord)) onDeleteRecord?.(deleteRecord.id);
        setDeleteRecord(null);
      }} />
      {imagePreview && <ImagePreview portalRootId="teacher-mobile-overlay-root" images={imagePreview.images} initialIndex={imagePreview.index} onClose={() => setImagePreview(null)} />}
      {!embedded && (
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-4 backdrop-blur-md">
          <button type="button" onClick={onBack} aria-label="返回学生详情" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className={`${phoneText.navTitle} text-[var(--tm-text-primary)]`}>评价记录</h1>
          <div className="h-11 w-11" aria-hidden="true" />
        </header>
      )}

      <main className={embedded ? '' : 'min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4 no-scrollbar'}>
        {!embedded && <StudentTermSelector value={selectedTerm} options={termOptions} onChange={onSelectedTermChange} ariaLabel="筛选评价记录学期" />}
        {embedded && (
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">评价记录</h3>
            <span className="text-[12px] font-medium text-[var(--tm-text-tertiary)]">共 {filteredRecords.length} 条</span>
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTimeFilterSheet(true)}
            aria-label={`选择记录时间，当前${timeFilterLabel}`}
            title={timeFilterLabel}
            className={`flex min-h-[var(--tm-size-touch)] min-w-0 items-center justify-center rounded-[var(--tm-radius-control-compact)] px-2.5 text-[13px] font-semibold [box-shadow:var(--tm-shadow-control)] ${timeFilter.type !== 'all'
              ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]'
              : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)]'}`}
          >
            <span className="min-w-0 truncate text-center">{timeFilterLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTeacherFilterSheet(true)}
            aria-label={`选择评价人，当前${teacherFilterLabel}`}
            title={teacherFilterLabel}
            className={`flex min-h-[var(--tm-size-touch)] min-w-0 items-center justify-center rounded-[var(--tm-radius-control-compact)] border bg-[var(--tm-bg-surface)] px-2.5 text-[13px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tm-text-primary)] ${teacherFilterId !== 'all'
              ? 'border-[var(--tm-brand-primary)] text-[var(--tm-brand-primary-strong)]'
              : 'border-transparent text-[var(--tm-text-secondary)]'}`}
          >
            <span className="min-w-0 truncate text-center">{teacherFilterLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowIndicatorFilterSheet(true)}
            aria-label={`选择指标，当前${indicatorFilterPath.length > 0 ? indicatorFilterPath.join('、') : indicatorFilterLabel}`}
            title={indicatorFilterPath.join(' / ') || indicatorFilterLabel}
            className={`flex min-h-[var(--tm-size-touch)] min-w-0 items-center justify-center rounded-[var(--tm-radius-control-compact)] px-2.5 text-[13px] font-semibold [box-shadow:var(--tm-shadow-control)] ${indicatorFilterPath.length > 0
              ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]'
              : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)]'}`}
          >
            <span className="min-w-0 truncate text-center">{indicatorFilterLabel}</span>
          </button>
        </div>
        {!embedded && <div className="mt-2 text-right text-[12px] font-medium text-[var(--tm-text-tertiary)]">共 {filteredRecords.length} 条</div>}

        <div className="mt-3 space-y-[var(--tm-layout-card-gap)]">
          {filteredRecords.length === 0 ? (
            <div className={`flex flex-col items-center justify-center rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] px-6 text-center [box-shadow:var(--tm-shadow-card)] ${embedded ? 'min-h-40' : 'min-h-64'}`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-tertiary)]"><ClipboardList className="h-5 w-5" /></span>
              <p className="mt-3 text-sm font-medium text-[var(--tm-text-secondary)]">没有符合条件的评价记录</p>
              {hasActiveFilter && (
                <button type="button" onClick={resetFilters} className="mt-3 min-h-[var(--tm-size-touch)] px-3 text-[13px] font-semibold text-[var(--tm-brand-primary-strong)]">清除筛选</button>
              )}
            </div>
          ) : groupedRecords.map(group => (
            <section key={group.month} className="space-y-[var(--tm-layout-card-gap)]">
              {groupedRecords.length > 1 && (
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">{formatMonthLabel(group.month)}</h2>
                  <span className="text-[12px] text-[var(--tm-text-tertiary)]">{group.records.length}条</span>
                </div>
              )}
              {group.records.map(renderRecord)}
            </section>
          ))}
        </div>
      </main>

      <EvaluationTimeFilterSheet
        open={showTimeFilterSheet}
        value={timeFilter}
        termStartDate={activeTerm.startDate}
        termEndDate={activeTerm.endDate}
        referenceDate={referenceDate}
        onClose={() => setShowTimeFilterSheet(false)}
        onSelect={setTimeFilter}
      />
      <EvaluationTeacherFilterSheet
        open={showTeacherFilterSheet}
        value={teacherFilterId}
        teachers={teacherOptions}
        totalCount={indicatorFilteredRecords.length}
        currentTeacherId={currentTeacherId}
        currentTeacherName={currentTeacherName}
        onClose={() => setShowTeacherFilterSheet(false)}
        onSelect={setTeacherFilterId}
      />
      <EvaluationIndicatorFilterSheet
        open={showIndicatorFilterSheet}
        value={indicatorFilterPath}
        options={indicatorOptions}
        totalCount={teacherFilteredRecords.length}
        onClose={() => setShowIndicatorFilterSheet(false)}
        onSelect={setIndicatorFilterPath}
      />
    </div>
  );
};

export default StudentEvaluationRecordsView;
