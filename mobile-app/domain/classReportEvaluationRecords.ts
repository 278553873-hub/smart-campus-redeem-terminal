import type { Student } from '../types';
import type { StudentEvaluationRecord } from '../views/student-evaluation/types';
import type { ReportTimeRange } from './classReportSource';

export interface ClassReportEvaluationRecord extends StudentEvaluationRecord {
  studentId: string;
  studentName: string;
}
export function getClassReportRecordRange(period: Exclude<ReportTimeRange, 'custom'>, today: string) {
  if (period === 'day') return { start: today, end: today };
  if (period === 'month') return { start: `${today.slice(0, 7)}-01`, end: today };
  if (period === 'semester') {
    const year = Number(today.slice(0, 4));
    const month = Number(today.slice(5, 7));
    return { start: month >= 9 ? `${year}-09-01` : month <= 1 ? `${year - 1}-09-01` : `${year}-02-01`, end: today };
  }
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((weekday + 6) % 7));
  return { start: date.toISOString().slice(0, 10), end: today };
}

/** 与报告同口径的演示明细；正式接入时由记录接口提供原始记录。 */
export function buildClassReportEvaluationRecords({ classId, studentCounts, count, positiveCount, paths, teachers, start, end }: {
  classId: string;
  studentCounts: { student: Student; evaluationCount: number }[];
  count: number;
  positiveCount: number;
  paths: readonly (readonly string[])[];
  teachers: { id: string; name: string }[];
  start: string;
  end: string;
}): ClassReportEvaluationRecord[] {
  if (!count || !teachers.length || !paths.length || !studentCounts.length) return [];
  const remaining = studentCounts.map(row => ({ ...row }));
  const students: Student[] = [];
  while (remaining.some(row => row.evaluationCount > 0) && students.length < count) {
    for (const row of remaining) {
      if (row.evaluationCount <= 0 || students.length >= count) continue;
      students.push(row.student);
      row.evaluationCount -= 1;
    }
  }
  if (!students.length) return [];
  const startMs = new Date(`${start}T08:00:00Z`).getTime();
  const endMs = new Date(`${end}T08:00:00Z`).getTime();
  return Array.from({ length: Math.min(count, students.length) }, (_, index) => {
    const student = students[index];
    const teacher = teachers[index % teachers.length];
    const path = paths[index % paths.length];
    const negativeCount = count - positiveCount;
    const negative = Math.floor((index + 1) * negativeCount / count) > Math.floor(index * negativeCount / count);
    const scoreChange = negative ? -1 : 2;
    const timestamp = endMs - Math.round((endMs - startMs) * index / Math.max(1, count - 1));
    const date = new Date(timestamp + 8 * 3600000).toISOString().slice(0, 16).replace('T', ' ');
    return {
      id: `${classId}:${start}:${end}:${index}`, studentId: student.id, studentName: student.name,
      teacherId: teacher.id, teacherName: teacher.name, evaluation_date: date,
      indicatorPath: [...path], scoreChange, isBad: scoreChange < 0,
      description: scoreChange > 0 ? `在“${path.at(-1)}”方面获得表扬。` : `“${path.at(-1)}”方面需要继续改进。`,
      aiComment: '',
    };
  });
}
