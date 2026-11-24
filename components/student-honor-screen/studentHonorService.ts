import { GET_MOCK_STUDENTS_FOR_CLASS, MOCK_CLASSES } from '../../mobile-app/constants';
import { CURRENT_PRINCIPAL_TERM } from '../../mobile-app/data/principalTermReport';
import { TEACHER_SPACE_OPTIONS } from '../../mobile-app/data/teacherSpaces';
import { createDemoStudentLevelEvaluationRecords, getStudentLevelNetScore } from '../../mobile-app/domain/studentPerformance';
import { getMockClassSeed, getMockStudentNameAt } from '../../mobile-app/data/studentNamePool';
import { getSystemStudentAvatar } from '../../mobile-app/assets/studentAvatarCatalog';
import type { HonorSnapshot, HonorStage } from './studentHonorModel';

/** 教师端演示分只使用班内序号，同一序号会在各班重复。此处仅补齐大屏演示的班际差异。 */
function getHonorDemoScore(student: Parameters<typeof createDemoStudentLevelEvaluationRecords>[0], classId: string) {
  const term = CURRENT_PRINCIPAL_TERM;
  const [current, ...previous] = createDemoStudentLevelEvaluationRecords(student, term);
  const serial = Number((student.studentNo || student.id).slice(-2)) || 1;
  const variation = (getMockClassSeed(classId) * (serial + 7)) % 37;
  return getStudentLevelNetScore([{ ...current, scoreChange: current.scoreChange + variation }, ...previous], 'term', term);
}

/** 演示环境与教师手机端班级详情共用名册和学期净分口径。 */
export async function loadStudentHonor(): Promise<HonorSnapshot> {
  const grades = new Map<string, { id: string; name: string; total: number }>();
  const studentScores = MOCK_CLASSES.flatMap(classInfo => {
    const gradeId = classInfo.gradeLevel;
    const grade = grades.get(gradeId) ?? { id: gradeId, name: gradeId, total: 0 };
    grades.set(gradeId, grade);
    return GET_MOCK_STUDENTS_FOR_CLASS(classInfo.id)
      .filter(student => (student.status ?? 'active') === 'active')
      .map(student => {
        const total = getHonorDemoScore(student, classInfo.id);
        grade.total++;
        return {
          student: {
            id: student.id, displayName: student.name, avatar: student.avatar,
            gradeId, gradeName: grade.name, classId: classInfo.id,
            className: classInfo.classNumber ? `${classInfo.classNumber}班` : classInfo.name,
          },
          total, dimensions: {},
        };
      });
  });
  // 初高中演示名册隔离在荣誉榜，沿用教师端姓名、头像和净分规则。
  const stages: Record<string, HonorStage> = {};
  for (const [stage, prefix] of [['middle', '初'], ['high', '高']] as const) {
    for (const [index, numeral] of [...'一二三'].entries()) {
      const gradeId = `${stage}-${index + 1}`;
      const gradeName = `${prefix}${numeral}`;
      stages[gradeId] = stage;
      grades.set(gradeId, { id: gradeId, name: gradeName, total: 120 });
      for (let classNumber = 1; classNumber <= 3; classNumber++) {
        const classId = `${gradeId}-${classNumber}`;
        for (let serial = 0; serial < 40; serial++) {
          const id = `${classId}-student-${serial + 1}`;
          const { n: displayName, g: gender } = getMockStudentNameAt(classId, serial);
          const avatar = getSystemStudentAvatar(gender, getMockClassSeed(classId) * 31 + serial * 17);
          studentScores.push({
            student: { id, displayName, avatar, gradeId, gradeName, classId, className: `${classNumber}班` },
            total: getHonorDemoScore({ id, studentNo: String(serial + 1) }, classId), dimensions: {},
          });
        }
      }
    }
  }
  // 固定小学前三个年级的并列演示，按完整年级分数选出前三人。
  const tiePatterns = [
    { gradeId: '一年级', offsets: [2, 2, 0] },
    { gradeId: '二年级', offsets: [2, 0, 0] },
    { gradeId: '三年级', offsets: [0, 0, 0] },
  ];
  for (const { gradeId, offsets } of tiePatterns) {
    const leaders = studentScores.filter(item => item.student.gradeId === gradeId)
      .sort((a, b) => b.total - a.total || a.student.id.localeCompare(b.student.id)).slice(0, 3);
    if (leaders.length !== 3) continue;
    const base = leaders[0].total + 1;
    leaders.forEach((item, index) => { item.total = base + offsets[index]; });
  }

  return {
    stages,
    schoolName: TEACHER_SPACE_OPTIONS.find(space => space.id === 'school-star')?.title ?? '星河实验学校',
    grades: [...grades.values()], dimensions: [], studentScores,
  };
}
