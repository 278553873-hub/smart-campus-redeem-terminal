import { DEMO_TEACHER_ACCOUNTS } from '../../shared/demoTeacherAccounts.ts';
import type { StudentMedalAward } from '../domain/medal.ts';
import { getSchoolDate, getStudentTermForDate } from '../domain/studentTerms.ts';

const DEMO_MEDAL_QUANTITIES = [
  ['platform-progress-star', 1],
  ['platform-civilized-star', 2],
  ['platform-art-talent', 3],
  ['platform-reading-talent', 10],
] as const;

export function getDemoStudentMedalAwards(studentId: string): StudentMedalAward[] {
  const now = new Date();
  const term = getStudentTermForDate(getSchoolDate(now));
  const termStart = Date.parse(`${term.startDate}T00:00:00+08:00`);
  return DEMO_MEDAL_QUANTITIES.flatMap(([medalId, quantity], medalIndex) =>
    Array.from({ length: quantity }, (_, awardIndex): StudentMedalAward => {
      const minutesAgo = medalIndex * 7 + awardIndex * 9;
      const awardedAt = new Date(Math.max(termStart, now.getTime() - minutesAgo * 60_000));
      return {
        id: `demo-award-${studentId}-${medalId}-${awardIndex}`,
        studentId,
        medalId,
        quantity: 1,
        awardedAt: awardedAt.toISOString(),
        teacherName: DEMO_TEACHER_ACCOUNTS[(medalIndex + awardIndex) % 2 === 0 ? 0 : 2].name,
        source: 'teacher',
      };
    }),
  );
}
