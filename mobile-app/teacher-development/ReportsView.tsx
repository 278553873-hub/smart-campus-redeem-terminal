import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { MobileCard } from '../components/ui/MobileCard';
import TextSelectionControl from '../components/ui/TextSelectionControl';
import { DIMENSIONS, type DevelopmentIndicator, type DevelopmentRecord, type TeacherDossier } from './data';
import { effectiveRecords, inPeriod, teacherScore } from './domain';
import { EmptyState, metaClass, Metric, RowButton, Section } from './ui';

export interface ReportDrill { title: string; teacherId?: string; dimension?: string; category?: string; level?: string; }
interface Props { teachers: TeacherDossier[]; records: DevelopmentRecord[]; indicators: DevelopmentIndicator[]; periodId: string; schoolScope: boolean; onDrill: (drill: ReportDrill) => void; onTeacher: (teacherId: string) => void; }
export default function ReportsView({ teachers, records, indicators, periodId, schoolScope, onDrill, onTeacher }: Props) {
  const [breakdown, setBreakdown] = useState<'category' | 'level'>('category');
  const scoped = records.filter(r => teachers.some(t => t.id === r.teacherId));
  const approved = effectiveRecords(scoped, periodId);
  const pending = scoped.filter(r => r.status === 'pending' && inPeriod(r, periodId)).length;
  const activeTeachers = new Set(approved.map(r => r.teacherId)).size;
  const types = [...new Set(approved.map(r => breakdown === 'category' ? r.category ?? '日常记录' : r.level ?? '不适用'))];
  const score = teachers.length === 1 ? teacherScore(indicators, records, teachers[0].id, periodId) : undefined;
  return <div className="space-y-[var(--tm-report-card-gap)]">
    <MobileCard className="p-[var(--tm-report-card-padding)]" padding="none"><div className="grid grid-cols-2 gap-[var(--tm-report-card-content-gap)]"><Metric label={schoolScope ? '教师总数' : '本期积分'} value={schoolScope ? teachers.length : score ?? 0} unit={schoolScope ? '人' : '分'} /><Metric label="已通过记录" value={approved.length} unit="条" /><Metric label={schoolScope ? '有记录教师' : '加分记录'} value={schoolScope ? activeTeachers : approved.filter(r => r.delta > 0).length} unit={schoolScope ? '人' : '条'} /><Metric label="待审核记录" value={pending} unit="条" /></div><p className={`mt-4 ${metaClass}`}>{schoolScope ? '包含本期尚无记录的教师。' : '仅已通过记录影响积分。'}待审核材料未计入下方统计。</p></MobileCard>
    <Section title="指标分布"><MobileCard><div className="space-y-4">{DIMENSIONS.map(dimension => {
      const count = approved.filter(r => indicators.find(i => i.id === r.indicatorId)?.dimension === dimension).length;
      return <button type="button" key={dimension} onClick={() => onDrill({ title: dimension, dimension })} className="block min-h-[var(--tm-size-touch)] w-full text-left"><div className="mb-2 flex items-center justify-between text-[length:var(--tm-font-size-body)]"><span>{dimension}</span><span className="flex items-center gap-1 text-[var(--tm-text-secondary)]">{count}条<ChevronRight size={16} aria-hidden="true" /></span></div><div className="h-2 overflow-hidden rounded-full bg-[var(--tm-bg-surface-soft)]"><div className="h-full rounded-full bg-[var(--tm-brand-primary)]" style={{ width: `${approved.length ? count / approved.length * 100 : 0}%` }} /></div></button>;
    })}</div></MobileCard></Section>
    <Section title="成果分布"><TextSelectionControl<'category' | 'level'> value={breakdown} items={[{ value: 'category', label: '按类别' }, { value: 'level', label: '按级别' }]} onChange={setBreakdown} ariaLabel="成果统计方式" /><MobileCard>{types.length ? types.map(type => <RowButton key={type} description={`${approved.filter(r => (breakdown === 'category' ? r.category ?? '日常记录' : r.level ?? '不适用') === type).length}条`} onClick={() => onDrill({ title: type, ...(breakdown === 'category' ? { category: type } : { level: type }) })}>{type}</RowButton>) : <EmptyState description="本期还没有已通过的成果记录。" />}</MobileCard></Section>
    {schoolScope && <Section title="教师数据"><MobileCard>{teachers.map(teacher => <RowButton key={teacher.id} description={`${teacher.grade} · ${teacher.subject} · 已通过${approved.filter(r => r.teacherId === teacher.id).length}条`} onClick={() => onTeacher(teacher.id)}><span className="flex items-center justify-between gap-2"><span>{teacher.name}</span><span className="text-[length:var(--tm-font-size-body)] tabular-nums">{teacherScore(indicators, records, teacher.id, periodId)}分</span></span></RowButton>)}{!teachers.length && <EmptyState title="没有找到教师" />}</MobileCard></Section>}
  </div>;
}
