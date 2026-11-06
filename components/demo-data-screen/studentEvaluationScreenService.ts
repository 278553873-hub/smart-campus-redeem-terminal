import { TEACHER_SPACE_OPTIONS } from '../../mobile-app/data/teacherSpaces';
import { getLeaderReportSnapshot } from '../../mobile-app/services/leaderReportService';
import { createEvaluationScreenSnapshot, SCREEN_PERIODS, type EvaluationScreenPeriods } from './studentEvaluationScreenModel';

// 大屏仅适配既有报表；真实接口和实时事件源可在这一层替换。
export const loadStudentEvaluationScreen = async (now = Date.now()): Promise<EvaluationScreenPeriods> => {
  const schoolName = TEACHER_SPACE_OPTIONS.find(space => space.id === 'school-star')?.title ?? '星河实验学校';
  const entries = await Promise.all(SCREEN_PERIODS.map(async ({ key }) => {
    const report = await getLeaderReportSnapshot({ period: key });
    return [key, createEvaluationScreenSnapshot(report, schoolName, now)] as const;
  }));
  return Object.fromEntries(entries) as EvaluationScreenPeriods;
};
