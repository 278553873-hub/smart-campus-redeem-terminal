import React from 'react';
import type { GrowthRecord, GrowthStudent } from './studentGrowthModel';
import { growthStudentClassName } from './StudentGrowthRanking';

const timeFormatter = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false });

/** 仅呈现允许公开的正向记录；与学校全景保持教师、学生、指标及加分的信息结构。 */
export function StudentGrowthActivityFeed({ activities }: { activities: { record: GrowthRecord; student: GrowthStudent }[] }) {
  return <ol className="student-growth-activities" aria-label="成长动态记录" aria-live="off">
    {activities.map(({ record, student }) => {
      const teacher = record.teacherName ? `${record.teacherName.replace(/老师$/, '')}老师` : '老师';
      const indicator = record.indicatorPath.join('-');
      const delta = `+${record.delta.toLocaleString('zh-CN')}分`;
      return <li key={record.id} aria-label={`${timeFormatter.format(record.timestamp)}，${teacher}记录了${student.displayName}同学在“${indicator}”方面的表扬，${delta}。`}>
        <p className="student-growth-activity-person"><time dateTime={new Date(record.timestamp).toISOString()}>{timeFormatter.format(record.timestamp)}</time><strong>{teacher}</strong>记录了<strong>{student.displayName}同学</strong><span>（{growthStudentClassName(student)}）</span></p>
        <p className="student-growth-activity-detail"><span>在“<span className="student-growth-activity-indicator">{indicator}</span>”方面的表扬，</span><b>{delta}</b></p>
      </li>;
    })}
  </ol>;
}
