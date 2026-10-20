import { ChevronRight } from 'lucide-react';
import { SCHOOL, type DevelopmentIndicator, type DevelopmentRecord, type TeacherDossier } from './data';
import { effectiveRecords, teacherScore } from './domain';
import { EmptyState } from './ui';
import { archiveIllustration, teacherArchiveTone } from './archiveAppearance';
import './archive.css';

interface Props {
  teachers: TeacherDossier[];
  indicators: DevelopmentIndicator[];
  records: DevelopmentRecord[];
  periodId: string;
  toolbar?: React.ReactNode;
  onTeacher: (id: string) => void;
}

export default function SchoolArchiveView({ teachers, indicators, records, periodId, onTeacher, toolbar }: Props) {
  return <section aria-label="全校教师档案" className="td-school-archive">
    <div className="td-school-cover"><img src={archiveIllustration} width="640" height="494" alt="" aria-hidden="true" /><h2>全校教师</h2><p>{SCHOOL} · 教师成长档案</p></div>
    {toolbar}
    <p className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">共 {teachers.length} 位教师</p>
    <div className="td-school-list">
      {teachers.map(teacher => <button type="button" key={teacher.id} onClick={() => onTeacher(teacher.id)} className="td-school-person">
        <span aria-hidden="true" className={`td-school-monogram td-tone-${teacherArchiveTone(teacher.id)}`}>{teacher.name.slice(0, 1)}</span>
        <span className="td-school-person-info"><span className="td-school-person-name">{teacher.name}</span><span className="td-school-person-meta">{teacher.grade} · {teacher.subject} · {teacher.title}</span></span>
        <span className="td-school-person-score"><strong>{teacherScore(indicators, records, teacher.id, periodId)}</strong><small>分</small><span>已通过 {effectiveRecords(records, periodId, teacher.id).length} 条</span></span>
        <ChevronRight size={14} className="shrink-0 text-[var(--tm-text-secondary)]" aria-hidden="true" />
      </button>)}
      {!teachers.length && <EmptyState title="没有找到教师" description="换个姓名、学科或年级试试。" />}
    </div>
  </section>;
}
