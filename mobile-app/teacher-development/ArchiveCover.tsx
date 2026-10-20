import React from 'react';
import { ArrowUpRight, Feather } from 'lucide-react';
import { DIMENSIONS, type DevelopmentIndicator, type DevelopmentRecord, type TeacherDossier } from './data';
import { effectiveRecords, indicatorScore, teacherScore } from './domain';
import { archiveIllustration } from './archiveAppearance';

interface Props {
  teacher: TeacherDossier;
  indicators: DevelopmentIndicator[];
  records: DevelopmentRecord[];
  periodId: string;
  onEvaluate?: () => void;
}

/** 档案的身份与周期概览；图像仅作封面装饰，不承载统计含义。 */
export default function ArchiveCover({ teacher, indicators, records, periodId, onEvaluate }: Props) {
  const score = teacherScore(indicators, records, teacher.id, periodId);
  const base = indicators.reduce((sum, item) => sum + item.base, 0);
  const approved = effectiveRecords(records, periodId, teacher.id);
  return <section className="td-dossier-cover" aria-label={`${teacher.name}的成长概览`}>
    <img className="td-dossier-cover-art" src={archiveIllustration} width="640" height="494" alt="" aria-hidden="true" />
    <div className="td-dossier-identity">
      <div className="td-dossier-name"><h2>{teacher.name}</h2><span>{teacher.title}</span></div>
      <p className="td-dossier-subject">{teacher.school} · {teacher.grade}{teacher.subject}</p>
    </div>
    <div className="td-dossier-metrics">
      <div><p>本期积分</p><div className="td-dossier-score">{score}<span>分</span></div></div>
      <div className="td-dossier-record-count"><p>已通过记录</p><strong>{approved.length}<span>条</span></strong></div>
    </div>
    <div className="td-dossier-footer"><p className="td-dossier-score-note">基础 {base} 分<span>·</span>本期{score - base >= 0 ? '增加' : '减少'} {Math.abs(score - base)} 分</p>{onEvaluate && <button className="td-dossier-evaluate" onClick={onEvaluate} type="button"><Feather size={16} aria-hidden="true" />记录表现<ArrowUpRight size={14} aria-hidden="true" /></button>}</div>
    <dl className="td-dossier-dimensions" aria-label="四大维度得分">
      {DIMENSIONS.map(name => <div key={name}><dt>{name}</dt><dd>{indicators.filter(item => item.dimension === name).reduce((sum, item) => sum + indicatorScore(item, records, teacher.id, periodId), 0)}<span>分</span></dd></div>)}
    </dl>
  </section>;
}
