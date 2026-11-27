export interface StudentTermOption {
  value: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

const schoolDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
});

export const getSchoolDate = (date: Date) => schoolDate.format(date);

export function getStudentTermForDate(date: string): StudentTermOption {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const schoolYear = month >= 9 ? year : year - 1;
  const isFall = month >= 9 || month <= 2;
  const nextYear = schoolYear + 1;
  return {
    value: `${schoolYear}-${isFall ? 'fall' : 'spring'}`,
    label: `${schoolYear}-${nextYear}学年 ${isFall ? '上学期' : '下学期'}`,
    startDate: isFall ? `${schoolYear}-09-01` : `${nextYear}-03-01`,
    endDate: isFall ? new Date(Date.UTC(nextYear, 2, 0)).toISOString().slice(0, 10) : `${nextYear}-08-31`,
  };
}

export function getStudentTermOptions(today: string): StudentTermOption[] {
  const current = getStudentTermForDate(today);
  const previous = (term: StudentTermOption) => (
    getStudentTermForDate(new Date(Date.parse(term.startDate) - 86_400_000).toISOString().slice(0, 10))
  );
  const lastTerm = previous(current);
  return [{ ...current, isCurrent: true }, lastTerm, previous(lastTerm)];
}

export const STUDENT_TERM_OPTIONS = getStudentTermOptions('2026-09-01');
export const CURRENT_STUDENT_TERM = STUDENT_TERM_OPTIONS[0];
