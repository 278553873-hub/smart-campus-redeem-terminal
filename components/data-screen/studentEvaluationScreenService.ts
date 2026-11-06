import { TEACHER_SPACE_OPTIONS } from '../../mobile-app/data/teacherSpaces';
import { getLeaderReportSnapshot } from '../../mobile-app/services/leaderReportService';
import { getMoralEducationCockpitSnapshot } from '../../mobile-app/services/moralEducationCockpitService';
import { createEvaluationScreenSnapshot, SCREEN_PERIODS, type EvaluationScreenPeriods } from './studentEvaluationScreenModel';

// 大屏仅适配既有报表；真实接口和实时事件源可在这一层替换。
export const loadStudentEvaluationScreen = async (now = Date.now()): Promise<EvaluationScreenPeriods> => {
  const schoolName = TEACHER_SPACE_OPTIONS.find(space => space.id === 'school-star')?.title ?? '星河实验学校';
  const classReports = {
    week: getMoralEducationCockpitSnapshot({ periodType: 'week' }),
    month: getMoralEducationCockpitSnapshot({ periodType: 'month' }),
    term: getMoralEducationCockpitSnapshot({ periodType: 'term' }),
  };
  const entries = await Promise.all(SCREEN_PERIODS.map(async ({ key }) => {
    const [report, classReport] = await Promise.all([
      getLeaderReportSnapshot({ period: key }), classReports[key === 'today' ? 'week' : key],
    ]);
    return [key, { ...createEvaluationScreenSnapshot(report, schoolName, now), classReport }] as const;
  }));
  return Object.fromEntries(entries) as EvaluationScreenPeriods;
};
