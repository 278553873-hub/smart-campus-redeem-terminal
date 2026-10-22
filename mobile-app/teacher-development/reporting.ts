import { ALL_PERIODS, DEMO_TODAY, PERIODS, type DevelopmentIndicator, type DevelopmentRecord, type TeacherDossier } from './data';
import { inPeriod, indicatorScore, teacherScore } from './domain';
import { recordLevelGroup, RECORD_LEVELS } from './recordLevels';

export interface ReportDrill {
  title: string;
  teacherId?: string;
  dimension?: string;
  indicatorId?: string;
  category?: string;
  level?: string;
  month?: string;
  status?: 'approved' | 'pending' | 'returned' | 'all';
}
export type PersonnelGrouping = 'subject' | 'grade' | 'title' | 'education';

/** 汇总与下钻共用过滤条件；学校待审总数不等于当前管理者的待办。 */
export function reportRecords(records: DevelopmentRecord[], teachers: TeacherDossier[], indicators: DevelopmentIndicator[], periodId: string, drill: Omit<ReportDrill, 'title'> = {}) {
  const ids = new Set(teachers.map(t => t.id));
  return records.filter(r => ids.has(r.teacherId) && inPeriod(r, periodId)
    && (drill.status === 'all' ? r.status !== 'withdrawn' : r.status === (drill.status ?? 'approved'))
    && (!drill.teacherId || r.teacherId === drill.teacherId)
    && (!drill.indicatorId || r.indicatorId === drill.indicatorId)
    && (!drill.dimension || indicators.find(i => i.id === r.indicatorId)?.dimension === drill.dimension)
    && (!drill.category || (r.category ?? '日常记录') === drill.category)
    && (!drill.level || recordLevelGroup(r, indicators.find(i => i.id === r.indicatorId)) === drill.level)
    && (!drill.month || r.date.startsWith(drill.month)));
}

export function registeredProfileParts(teacher: TeacherDossier) {
  return [
    { name: '基础资料', present: !!(teacher.name && teacher.subject && teacher.grade && teacher.school) },
    { name: '任职情况', present: teacher.positions.some(item => !!item.title) },
    { name: '资格证书', present: teacher.qualifications.some(item => !!item.name) },
    { name: '工作经历', present: teacher.experience.some(item => !!item.school) },
  ];
}

export function buildDevelopmentReport(teachers: TeacherDossier[], records: DevelopmentRecord[], indicators: DevelopmentIndicator[], periodId: string, today = DEMO_TODAY) {
  const current = reportRecords(records, teachers, indicators, periodId, { status: 'all' });
  const approved = current.filter(r => r.status === 'approved');
  const pending = current.filter(r => r.status === 'pending');
  const returned = current.filter(r => r.status === 'returned');
  const teacherRows = teachers.map(teacher => ({
    teacher,
    score: teacherScore(indicators, current, teacher.id, periodId),
    total: current.filter(r => r.teacherId === teacher.id).length,
    approved: approved.filter(r => r.teacherId === teacher.id).length,
    pending: pending.filter(r => r.teacherId === teacher.id).length,
    returned: returned.filter(r => r.teacherId === teacher.id).length,
    profile: registeredProfileParts(teacher),
  }));
  const dimensionRows = [...new Set(indicators.map(i => i.dimension))].map(name => ({
    name,
    count: approved.filter(r => indicators.find(i => i.id === r.indicatorId)?.dimension === name).length,
  }));
  const categoryRows = [...new Set(approved.map(r => r.category ?? '日常记录'))].map(name => ({ name, count: approved.filter(r => (r.category ?? '日常记录') === name).length }));
  const levelRows = [...RECORD_LEVELS.map(level => level.name), '不区分等级', '未识别等级'].map(name => ({
    name, count: approved.filter(r => recordLevelGroup(r, indicators.find(i => i.id === r.indicatorId)) === name).length,
  }));
  const period = ALL_PERIODS.find(p => p.id === periodId);
  const latestDate = current.reduce((date, r) => r.date > date ? r.date : date, today);
  const end = period ? (period.end < latestDate ? period.end : latestDate) : '';
  const months: { key: string; label: string; count: number }[] = [];
  if (period && end >= period.start) {
    let [year, month] = period.start.slice(0, 7).split('-').map(Number);
    while (`${year}-${String(month).padStart(2, '0')}` <= end.slice(0, 7)) {
      const key = `${year}-${String(month).padStart(2, '0')}`;
      months.push({ key, label: `${month}月`, count: approved.filter(r => r.date.startsWith(key)).length });
      month += 1;
      if (month === 13) { year += 1; month = 1; }
    }
  }
  return {
    current, approved, pending, returned, teacherRows, dimensionRows, categoryRows, levelRows, months,
    activeTeachers: teacherRows.filter(row => row.approved > 0).length,
    recordedTeachers: teacherRows.filter(row => row.total > 0).length,
    base: indicators.reduce((sum, item) => sum + item.base, 0),
    indicatorRows: teachers.length === 1 ? indicators.map(indicator => ({
      indicator, count: approved.filter(r => r.indicatorId === indicator.id).length,
      score: indicatorScore(indicator, current, teachers[0].id, periodId),
    })) : [],
  };
}
export type DevelopmentReport = ReturnType<typeof buildDevelopmentReport>;

export function personnelGroups(rows: DevelopmentReport['teacherRows'], key: PersonnelGrouping) {
  return [...new Set(rows.map(row => row.teacher[key] || '未登记'))].map(name => {
    const members = rows.filter(row => (row.teacher[key] || '未登记') === name);
    return { name, members, count: members.length, active: members.filter(row => row.approved > 0).length, records: members.reduce((sum, row) => sum + row.approved, 0) };
  });
}
