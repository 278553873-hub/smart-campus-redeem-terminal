import React, { useRef, useState } from 'react';
import { Award, BookOpen, BriefcaseBusiness, ChevronRight, GraduationCap, HeartHandshake, Sprout, SlidersHorizontal, UserRound, UsersRound, X } from 'lucide-react';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import ArchiveTimeline from './ArchiveTimeline';
import { DIMENSIONS, type DevelopmentIndicator, type DevelopmentRecord, type TeacherDossier } from './data';
import { indicatorScore, inPeriod } from './domain';
import { recordLevel } from './recordLevels';
import { bodyClass, EmptyState, metaClass } from './ui';
import ArchiveCover from './ArchiveCover';
import { ARCHIVE_TONES } from './archiveAppearance';
import './archive.css';

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
  onProfile: (part: ProfilePart) => void; onRecord: (record: DevelopmentRecord) => void;
  onFilter: () => void; filterLabel: string; filterIndicator: string; filterLevel: string; filterCategory: string; onIndicator: (id: string) => void; onClearFilters: () => void; onEvaluate?: () => void;
}
export default function ArchiveView({ teacher, indicators, records, periodId, onProfile, onRecord, onFilter, filterLabel, filterIndicator, filterLevel, filterCategory, onIndicator, onClearFilters, onEvaluate }: ArchiveViewProps) {
  const [view, setView] = useState<'timeline' | 'indicator'>('timeline');
  const growthSection = useRef<HTMLElement>(null);
  const allRecords = records.filter(r => r.teacherId === teacher.id && r.status !== 'withdrawn' && inPeriod(r, periodId));
  const filteredRecords = allRecords.filter(r => (!filterIndicator || r.indicatorId === filterIndicator) && (!filterLevel || recordLevel(r, indicators.find(i => i.id === r.indicatorId)) === filterLevel) && (!filterCategory || r.category === filterCategory));
  const hasFilters = !!(filterIndicator || filterLevel || filterCategory);
  const visibleIndicators = indicators.filter(i => !filterIndicator || i.id === filterIndicator);
  const dimensionIcons = [HeartHandshake, BookOpen, Sprout, UsersRound];
  const tones = ARCHIVE_TONES;
  return <div className="td-archive">
    <ArchiveCover teacher={teacher} indicators={indicators} records={records} periodId={periodId} onEvaluate={onEvaluate} />
    <nav aria-label="教师资料" className="td-profile-links">
      {PROFILE_PARTS.map(({ id, name, icon: Icon }, index) => <button type="button" key={id} onClick={() => onProfile(id)} className="td-profile-link"><span className={`td-profile-icon td-tone-${tones[index]}`}><Icon size={23} strokeWidth={1.6} aria-hidden="true" /></span><span>{name}</span></button>)}
    </nav>
    <section ref={growthSection} aria-label="成长记录" className="td-growth-section">
      <div className="td-growth-toolbar">
        <h2>成长记录</h2>
        <CompactSegmentedControl<'timeline' | 'indicator'> value={view} onChange={setView} items={[{ value: 'timeline', label: '时光轴' }, { value: 'indicator', label: '按指标' }]} density="compact" motion="sliding" ariaLabel="成长记录查看方式" />
        <button type="button" onClick={onFilter} aria-label="筛选成长记录" aria-haspopup="dialog" data-active={hasFilters} className="td-growth-filter"><SlidersHorizontal size={18} aria-hidden="true" /></button>
      </div>
      {hasFilters && <div className="td-growth-active-filter"><button type="button" onClick={onClearFilters} aria-label="清除成长记录筛选"><span>{filterLabel}</span><X size={14} className="shrink-0" aria-hidden="true" /></button><span role="status">{filteredRecords.length}条</span></div>}
      {view === 'timeline' ? <ArchiveTimeline records={filteredRecords} indicators={indicators} filtered={hasFilters} onOpen={onRecord} /> : <div className="td-indicator-groups">
        {DIMENSIONS.map((dimension, index) => {
          const items = visibleIndicators.filter(item => item.dimension === dimension);
          if (!items.length) return null;
          const Icon = dimensionIcons[index];
          return <section key={dimension} aria-label={dimension} className="td-indicator-group">
            <div className={`td-indicator-heading td-tone-${tones[index]}`}><Icon size={18} strokeWidth={1.7} aria-hidden="true" /><h3>{dimension}</h3><span>{items.length}项指标</span></div>
            {items.map(indicator => <button type="button" className="td-indicator-row" key={indicator.id} onClick={() => { setView('timeline'); onIndicator(indicator.id); requestAnimationFrame(() => growthSection.current?.scrollIntoView({ block: 'start' })); }}><span>{indicator.name}<small>{filteredRecords.filter(r => r.indicatorId === indicator.id).length}条记录</small></span><strong>{indicatorScore(indicator, records, teacher.id, periodId)}<small>分</small></strong><ChevronRight size={16} aria-hidden="true" /></button>)}
          </section>;
        })}
        {!visibleIndicators.length && <EmptyState title="暂无匹配指标" />}
      </div>}
    </section>
  </div>;
}
