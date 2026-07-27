import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ClipboardCheck, UserRoundCheck, UsersRound } from 'lucide-react';
import type { StudentCollectionHistoryItem } from '../../../shared/questionnaireStore';
import StudentTermSelector, { type StudentTermOption } from '../../components/student-detail/StudentTermSelector';

interface StudentCollectionHistoryTabProps {
  items: StudentCollectionHistoryItem[];
  termOptions: StudentTermOption[];
  selectedTerm: string;
  onSelectedTermChange: (value: string) => void;
  onOpen: (item: StudentCollectionHistoryItem) => void;
}

const modeMeta = {
  guardian_questionnaire: {
    label: '家长问卷',
    icon: UsersRound,
    accentClass: 'bg-[var(--tm-audience-guardian-primary)]',
    badgeClass: 'border border-[var(--tm-audience-guardian-border)] bg-[var(--tm-audience-guardian-soft)] text-[var(--tm-audience-guardian-strong)]',
  },
  student_information: {
    label: '学生采集',
    icon: UserRoundCheck,
    accentClass: 'bg-[var(--tm-audience-student-primary)]',
    badgeClass: 'border border-[var(--tm-audience-student-border)] bg-[var(--tm-audience-student-soft)] text-[var(--tm-audience-student-strong)]',
  },
} as const;

const formatListDate = (value: string) => {
  if (!value) return '';
  const month = value.slice(5, 7);
  const day = value.slice(8, 10);
  return month && day ? `${month}月${day}日` : value;
};

interface CollectionGroup {
  key: string;
  label: string;
  items: StudentCollectionHistoryItem[];
}

const getMonthGroup = (value: string) => {
  const year = value.slice(0, 4);
  const month = Number(value.slice(5, 7));
  if (!year || !month) return { key: 'unknown', label: '日期待确认' };
  return { key: `${year}-${String(month).padStart(2, '0')}`, label: `${year}年${month}月` };
};

const groupCollectionHistory = (items: StudentCollectionHistoryItem[]) => (
  items.reduce<CollectionGroup[]>((groups, item) => {
    const meta = getMonthGroup(item.completedAt);
    const group = groups.find(candidate => candidate.key === meta.key);
    if (group) group.items.push(item);
    else groups.push({ ...meta, items: [item] });
    return groups;
  }, [])
);

const StudentCollectionHistoryTab: React.FC<StudentCollectionHistoryTabProps> = ({
  items,
  termOptions,
  selectedTerm,
  onSelectedTermChange,
  onOpen,
}) => {
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(new Set());
  const activeTerm = termOptions.find(option => option.value === selectedTerm) ?? termOptions[0];
  const filteredItems = useMemo(() => items.filter(item => {
    const completedDate = item.completedAt.slice(0, 10);
    return completedDate >= activeTerm.startDate && completedDate <= activeTerm.endDate;
  }), [activeTerm.endDate, activeTerm.startDate, items]);
  const groups = useMemo(() => groupCollectionHistory(filteredItems), [filteredItems]);
  const firstGroupKey = groups[0]?.key;

  useEffect(() => {
    setExpandedGroupKeys(firstGroupKey ? new Set([firstGroupKey]) : new Set());
  }, [firstGroupKey]);

  const toggleGroup = (key: string) => {
    setExpandedGroupKeys(current => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="pb-24 animate-in fade-in duration-200">
      <StudentTermSelector value={selectedTerm} options={termOptions} onChange={onSelectedTermChange} ariaLabel="选择采集记录学期" />

      <div className="mt-3 space-y-3">
        {groups.map(group => {
          const isExpanded = expandedGroupKeys.has(group.key);
          return (
            <section key={group.key}>
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={isExpanded}
                className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-between rounded-[var(--tm-radius-control)] px-1 text-left"
              >
                <span className="text-[13px] font-semibold text-[var(--tm-text-primary)]">{group.label}</span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--tm-text-tertiary)]">
                  {group.items.length}条
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </span>
              </button>

              {isExpanded && (
                <div className="space-y-2.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {group.items.map(item => {
                    const meta = modeMeta[item.collectionMode];
                    const ModeIcon = meta.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onOpen(item)}
                        className="relative min-h-[88px] w-full overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-4 py-4 text-left shadow-[var(--tm-shadow-card)] transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)]"
                      >
                        <span className={`pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-r-full ${meta.accentClass}`} aria-hidden="true" />
                        <span className="line-clamp-2 block text-pretty text-[15px] font-semibold leading-[21px] text-[var(--tm-text-primary)]">{item.title}</span>
                        <span className="mt-3 flex min-w-0 items-center justify-between gap-3">
                          <span className={`inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[11px] font-semibold ${meta.badgeClass}`}><ModeIcon className="h-3.5 w-3.5" />{meta.label}</span>
                          <span className="min-w-0 truncate text-right text-[11px] font-medium text-[var(--tm-text-tertiary)]">{formatListDate(item.completedAt)} · {item.respondentLabel}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-tertiary)]"><ClipboardCheck className="h-6 w-6" /></span>
          <div className="mt-4 text-[15px] font-semibold text-[var(--tm-text-secondary)]">{items.length === 0 ? '暂无采集记录' : '该学期暂无采集记录'}</div>
        </div>
      )}
    </div>
  );
};

export default StudentCollectionHistoryTab;
