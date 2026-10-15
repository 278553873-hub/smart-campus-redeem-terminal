import React, { useState } from 'react';
import { Award, BriefcaseBusiness, GraduationCap, UserRound } from 'lucide-react';
import { MobileCard } from '../components/ui/MobileCard';
import TextSelectionControl from '../components/ui/TextSelectionControl';
import { DIMENSIONS, type DevelopmentIndicator, type DevelopmentRecord, type TeacherDossier } from './data';
import { effectiveRecords, indicatorScore, inPeriod, teacherScore } from './domain';
import { bodyClass, EmptyState, metaClass, Metric, RecordList, RowButton, Section, SelectButton } from './ui';

export type ProfilePart = 'basic' | 'positions' | 'qualifications' | 'experience';
export const PROFILE_PARTS = [
  { id: 'basic' as const, name: '基本信息', icon: UserRound },
  { id: 'positions' as const, name: '任职信息', icon: GraduationCap },
  { id: 'qualifications' as const, name: '资格证书', icon: Award },
  { id: 'experience' as const, name: '工作经历', icon: BriefcaseBusiness },
];
export function ProfileDetails({ teacher, part }: { teacher: TeacherDossier; part: ProfilePart }) {
  if (part === 'basic') return <dl className="space-y-5">{[['姓名', teacher.name], ['学校', teacher.school], ['任教学科', teacher.subject], ['任教年级', teacher.grade], ['职称', teacher.title], ['学历', teacher.education], ['专业', teacher.major], ['参加工作', teacher.teachingSince], ['入校时间', teacher.joined]].map(([label, value]) => <div key={label} className="grid grid-cols-[5rem_1fr] gap-4"><dt className={metaClass}>{label}</dt><dd className={bodyClass}>{value}</dd></div>)}</dl>;
  if (part === 'positions') return <div className="space-y-6">{teacher.positions.map(position => <article key={position.title}><h3 className="text-[length:var(--tm-font-size-card-title)] font-bold">{position.title}</h3><p className={`mt-2 ${bodyClass}`}>{position.scope}</p><p className={`mt-1 ${metaClass}`}>{position.period}</p></article>)}</div>;
  if (part === 'qualifications') return <div className="space-y-6">{teacher.qualifications.map(certificate => <article key={certificate.number}><h3 className="text-[length:var(--tm-font-size-card-title)] font-bold">{certificate.name}</h3><dl className="mt-3 space-y-2"><div><dt className={metaClass}>发证机构</dt><dd className={bodyClass}>{certificate.issuer}</dd></div><div><dt className={metaClass}>取得日期</dt><dd className={bodyClass}>{certificate.issued}</dd></div><div><dt className={metaClass}>证书编号</dt><dd className={`${bodyClass} break-all`}>{certificate.number}</dd></div></dl></article>)}</div>;
  return <div className="space-y-6">{teacher.experience.map(item => <article key={item.period}><p className={metaClass}>{item.period}</p><h3 className="mt-1 text-[length:var(--tm-font-size-card-title)] font-bold">{item.school}</h3><p className={`mt-2 ${bodyClass}`}>{item.position}</p></article>)}</div>;
}
interface ArchiveViewProps {
  teacher: TeacherDossier; indicators: DevelopmentIndicator[]; records: DevelopmentRecord[]; periodId: string;
  teacherNames: Record<string, string>; onProfile: (part: ProfilePart) => void; onRecord: (record: DevelopmentRecord) => void;
  onFilter: () => void; filterLabel: string; filterIndicator: string; filterLevel: string; filterCategory: string; onIndicator: (id: string) => void; onEvaluate?: () => void;
}
export default function ArchiveView({ teacher, indicators, records, periodId, teacherNames, onProfile, onRecord, onFilter, filterLabel, filterIndicator, filterLevel, filterCategory, onIndicator, onEvaluate }: ArchiveViewProps) {
  const [view, setView] = useState<'timeline' | 'indicator'>('timeline');
  const allRecords = records.filter(r => r.teacherId === teacher.id && r.status !== 'withdrawn' && inPeriod(r, periodId));
  const filteredRecords = allRecords.filter(r => (!filterIndicator || r.indicatorId === filterIndicator) && (!filterLevel || r.level === filterLevel) && (!filterCategory || r.category === filterCategory));
  const approved = effectiveRecords(records, periodId, teacher.id);
  return <div className="space-y-4">
    <MobileCard><div className="flex items-start gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--tm-brand-primary-soft)] text-[length:var(--tm-font-size-group-title)] font-bold text-[var(--tm-brand-primary)]" aria-hidden="true">{teacher.name.slice(-2)}</div><div className="min-w-0 flex-1"><h2 className="text-[length:var(--tm-font-size-group-title)] font-bold">{teacher.name}</h2><p className={`mt-1 ${metaClass}`}>{teacher.subject} · {teacher.grade} · {teacher.title}</p><p className={metaClass}>{teacher.school}</p></div>{onEvaluate && <button type="button" onClick={onEvaluate} className="min-h-[var(--tm-size-touch)] shrink-0 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">记录表现</button>}</div><div className="mt-4 grid grid-cols-4 gap-1">{PROFILE_PARTS.map(({ id, name, icon: Icon }) => <button type="button" key={id} onClick={() => onProfile(id)} className="flex min-h-[var(--tm-size-touch)] flex-col items-center justify-center gap-2 py-2 text-[length:var(--tm-font-size-meta)]"><Icon size={20} className="text-[var(--tm-action-icon-neutral)]" aria-hidden="true" /><span>{name}</span></button>)}</div></MobileCard>
    <MobileCard><div className="flex items-start justify-between"><Metric label="本期积分" value={teacherScore(indicators, records, teacher.id, periodId)} unit="分" /><Metric label="已通过记录" value={approved.length} unit="条" /></div><p className={`mt-3 ${metaClass}`}>基础分{indicators.reduce((sum, i) => sum + i.base, 0)}分，待审核记录尚未计分。</p><div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">{DIMENSIONS.map(name => <div key={name} className="flex items-center justify-between gap-1 text-[length:var(--tm-font-size-compact)]"><span className="text-[var(--tm-text-secondary)]">{name}</span><span className="font-semibold tabular-nums">{indicators.filter(i => i.dimension === name).reduce((sum, i) => sum + indicatorScore(i, records, teacher.id, periodId), 0)}</span></div>)}</div></MobileCard>
    <Section title="成长记录" action={<SelectButton onClick={onFilter} label="筛选成长记录">{filterLabel}</SelectButton>}><TextSelectionControl<'timeline' | 'indicator'> value={view} onChange={setView} items={[{ value: 'timeline', label: '时光轴' }, { value: 'indicator', label: '按指标' }]} ariaLabel="成长记录查看方式" />
      {view === 'timeline' ? <RecordList records={filteredRecords} teacherNames={teacherNames} indicatorNames={Object.fromEntries(indicators.map(i => [i.id, i.name]))} onOpen={onRecord} /> : <MobileCard>{indicators.filter(i => !filterIndicator || i.id === filterIndicator).map(indicator => <RowButton key={indicator.id} onClick={() => { setView('timeline'); onIndicator(indicator.id); }} description={`${filteredRecords.filter(r => r.indicatorId === indicator.id).length}条记录 · ${indicatorScore(indicator, records, teacher.id, periodId)}分`}>{indicator.name}</RowButton>)}{!indicators.length && <EmptyState />}</MobileCard>}
    </Section>
  </div>;
}
