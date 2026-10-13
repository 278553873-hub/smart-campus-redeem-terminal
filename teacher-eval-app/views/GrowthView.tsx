import React, { useMemo, useState } from 'react';
import {
  ARCHIVE_FILTER_GROUPS,
  getCategoryDefinition,
  type GrowthRecord,
  type GrowthRecordCategory,
} from '../domain/growthRecord.ts';
import {
  CURRENT_ACADEMIC_YEAR,
  CURRENT_TERM,
  PREVIOUS_ACADEMIC_YEAR,
  formatPoints,
  summarizeGrowth,
  summarizeTotalPoints,
} from '../domain/scoring.ts';
import RecordCard from '../components/RecordCard.tsx';
import SegmentedControl from '../components/SegmentedControl.tsx';

interface GrowthViewProps {
  records: GrowthRecord[];
  onOpenRecord: (record: GrowthRecord) => void;
}

const formatMonthLabel = (date: string) => {
  const parts = date.split('-');
  return parts[0] + ' 年 ' + Number(parts[1]) + ' 月';
};

const GrowthView: React.FC<GrowthViewProps> = ({ records, onOpenRecord }) => {
  const [filterId, setFilterId] = useState('all');
  const [mode, setMode] = useState<'timeline' | 'category' | 'wall'>('timeline');

  const termSummary = useMemo(() => summarizeGrowth(records, CURRENT_TERM), [records]);
  const totalPoints = useMemo(
    () => summarizeTotalPoints(records, [PREVIOUS_ACADEMIC_YEAR, CURRENT_ACADEMIC_YEAR]),
    [records],
  );

  const sortedRecords = useMemo(
    () => [...records].sort((left, right) => right.issuedAt.localeCompare(left.issuedAt)),
    [records],
  );

  const filteredRecords = useMemo(() => {
    const group = ARCHIVE_FILTER_GROUPS.find(item => item.id === filterId) ?? ARCHIVE_FILTER_GROUPS[0];
    return sortedRecords.filter(record => group.categories.includes(record.category));
  }, [filterId, sortedRecords]);

  const timelineGroups = useMemo(() => {
    const groups: Array<{ label: string; records: GrowthRecord[] }> = [];
    filteredRecords.forEach(record => {
      const label = formatMonthLabel(record.issuedAt);
      const existing = groups.find(group => group.label === label);
      if (existing) existing.records.push(record);
      else groups.push({ label, records: [record] });
    });
    return groups;
  }, [filteredRecords]);

  const categoryGroups = useMemo(() => {
    const groups: Array<{ category: GrowthRecordCategory; records: GrowthRecord[] }> = [];
    filteredRecords.forEach(record => {
      const existing = groups.find(group => group.category === record.category);
      if (existing) existing.records.push(record);
      else groups.push({ category: record.category, records: [record] });
    });
    return groups;
  }, [filteredRecords]);

  const wallImages = useMemo(
    () => filteredRecords.filter(record => record.evidenceImage),
    [filteredRecords],
  );

  const maxDimensionPoints = Math.max(1, ...termSummary.dimensionPoints.map(item => item.points));

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[var(--tm-bg-page)]">
      <div className="shrink-0 px-[var(--tm-space-5)] pt-[var(--tm-space-4)]">
        <div
          className="flex items-end gap-[var(--tm-space-4)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] py-[var(--tm-space-4)]"
          style={{ boxShadow: 'var(--tm-shadow-card)' }}
        >
          <div>
            <p className="text-[12px] font-medium text-[var(--tm-text-secondary)]">本学期积分</p>
            <p className="mt-1 text-[30px] font-bold leading-none text-[var(--tm-brand-primary)]">
              {formatPoints(termSummary.countedPoints)}
            </p>
          </div>
          <div className="ml-auto flex gap-[var(--tm-space-4)]">
            <div className="text-right">
              <p className="text-[12px] font-medium text-[var(--tm-text-secondary)]">累计积分</p>
              <p className="mt-1 text-[17px] font-bold leading-none text-[var(--tm-text-primary)]">
                {formatPoints(totalPoints)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium text-[var(--tm-text-secondary)]">待审核</p>
              <p className="mt-1 text-[17px] font-bold leading-none text-[var(--tm-text-primary)]">
                {termSummary.pendingCount}
              </p>
            </div>
          </div>
        </div>

        <div
          className="mt-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] py-[var(--tm-space-3)]"
          style={{ boxShadow: 'var(--tm-shadow-card)' }}
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">六大维度</h2>
            <span className="text-[11px] font-medium text-[var(--tm-text-tertiary)]">按本学期已认定积分</span>
          </div>
          <ul className="mt-[var(--tm-space-3)] flex flex-col gap-[var(--tm-space-2)]">
            {termSummary.dimensionPoints.length === 0 && (
              <li className="text-[13px] font-medium text-[var(--tm-text-tertiary)]">本学期还没有记录</li>
            )}
            {termSummary.dimensionPoints.map(item => (
              <li key={item.dimension} className="flex items-center gap-[var(--tm-space-2)]">
                <span className="w-[92px] shrink-0 text-[12px] font-medium text-[var(--tm-text-secondary)]">
                  {item.dimension}
                </span>
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--tm-bg-surface-muted)]">
                  <span
                    className="block h-full rounded-full bg-[var(--tm-brand-primary)]"
                    style={{ width: Math.round((item.points / maxDimensionPoints) * 100) + '%' }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right text-[12px] font-bold tabular-nums text-[var(--tm-text-primary)]">
                  {formatPoints(item.points)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-[var(--tm-space-3)]">
          <SegmentedControl
            ariaLabel="档案视图切换"
            value={mode}
            onChange={value => setMode(value as 'timeline' | 'category' | 'wall')}
            options={[
              { id: 'timeline', label: '时光轴' },
              { id: 'category', label: '按类别' },
              { id: 'wall', label: '证书墙' },
            ]}
          />
        </div>
      </div>

      <div className="shrink-0 overflow-x-auto px-[var(--tm-space-5)] pb-1 pt-[var(--tm-space-2)]">
        <div className="flex w-max gap-[var(--tm-space-2)]">
          {ARCHIVE_FILTER_GROUPS.map(group => {
            const active = group.id === filterId;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setFilterId(group.id)}
                aria-pressed={active}
                className="h-8 rounded-full px-[var(--tm-space-3)] text-[12px] font-semibold"
                style={{
                  background: active ? 'var(--tm-brand-primary-soft)' : 'var(--tm-bg-surface)',
                  color: active ? 'var(--tm-brand-primary)' : 'var(--tm-text-secondary)',
                }}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] pb-[var(--tm-space-5)] pt-[var(--tm-space-2)]">
        {mode === 'wall' && (
          wallImages.length === 0 ? (
            <p className="mt-[var(--tm-space-8)] text-center text-[13px] font-medium text-[var(--tm-text-tertiary)]">
              还没有上传证书照片，去录入页拍一张
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-[var(--tm-space-3)]">
              {wallImages.map(record => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => onOpenRecord(record)}
                  className="overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] text-left"
                  style={{ boxShadow: 'var(--tm-shadow-card)' }}
                >
                  <img
                    src={record.evidenceImage}
                    alt={record.evidenceLabel ?? '证书照片'}
                    className="h-[110px] w-full object-cover"
                  />
                  <span className="block px-[var(--tm-space-3)] py-[var(--tm-space-2)]">
                    <span className="block truncate text-[13px] font-semibold text-[var(--tm-text-primary)]">
                      {record.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[var(--tm-text-tertiary)]">
                      {record.level} · {record.rank}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )
        )}

        {mode !== 'wall' && filteredRecords.length === 0 && (
          <p className="mt-[var(--tm-space-8)] text-center text-[13px] font-medium text-[var(--tm-text-tertiary)]">
            这个分类下还没有记录
          </p>
        )}

        {mode === 'timeline' && timelineGroups.map(group => (
          <section key={group.label} aria-label={group.label} className="mt-[var(--tm-space-3)]">
            <h2 className="text-[12px] font-semibold text-[var(--tm-text-tertiary)]">{group.label}</h2>
            <div className="mt-[var(--tm-space-2)] flex flex-col gap-[var(--tm-space-3)]">
              {group.records.map(record => (
                <RecordCard key={record.id} record={record} onOpen={onOpenRecord} />
              ))}
            </div>
          </section>
        ))}

        {mode === 'category' && categoryGroups.map(group => (
          <section key={group.category} className="mt-[var(--tm-space-3)]">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">{group.category}</h2>
              <span className="text-[11px] font-medium text-[var(--tm-text-tertiary)]">
                {getCategoryDefinition(group.category).dimension} · {group.records.length} 条
              </span>
            </div>
            <div className="mt-[var(--tm-space-2)] flex flex-col gap-[var(--tm-space-3)]">
              {group.records.map(record => (
                <RecordCard key={record.id} record={record} onOpen={onOpenRecord} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default GrowthView;
