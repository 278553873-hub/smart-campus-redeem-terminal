import { CLASS_EVALUATION_RECORDS } from "./classEvaluationAssistantV2";
import type { ClassEvaluationRecord } from "../domain/classEvaluationAssistantV2";
import {
  getTeacherClassDisplayName,
  getTeacherSchoolGradeOptions,
  type TeacherSpaceOption,
} from "../domain/teacherSpaceAccess";
import {
  shiftReportDate,
  type ClassReportClass,
  type ClassReportScoreRule,
} from "../domain/classEvaluationReport";

// 独立报表演示数据。真实接入时提供原始流水、班级目录与学校计分规则。
// 复用已有评价案例及现场配图，所有统计均从同一份流水生成。
export function createClassEvaluationReportDemo(
  space: TeacherSpaceOption,
  today: string,
) {
  const gradeNames = getTeacherSchoolGradeOptions(space) ?? [
    "一年级",
    "二年级",
    "三年级",
    "四年级",
    "五年级",
    "六年级",
  ];
  const classes: ClassReportClass[] = gradeNames.flatMap(
    (gradeName, gradeIndex) =>
      Array.from({ length: 5 }, (_, index) => ({
        id: `g${gradeIndex + 1}c${index + 1}`,
        gradeId: `g${gradeIndex + 1}`,
        gradeName,
        name: getTeacherClassDisplayName(
          { name: `${gradeName}${index + 1}班`, gradeLevel: gradeName },
          space,
        ),
      })),
  );
  const firstDate = `${Number(today.slice(0, 4)) - 1}-${today.slice(5, 7)}-01`;
  const records: ClassEvaluationRecord[] = [];
  let date = firstDate;
  let dayIndex = 0;
  while (date <= today) {
    const weekday = new Date(`${date}T12:00:00`).getDay();
    if (weekday !== 0 && weekday !== 6) {
      classes.forEach((classInfo, classIndex) => {
        if ((dayIndex + classIndex) % 3 !== 0) return;
        const template =
          CLASS_EVALUATION_RECORDS[
            (dayIndex * 7 + classIndex) % CLASS_EVALUATION_RECORDS.length
          ];
        records.push({
          ...template,
          id: `report-${date}-${classInfo.id}`,
          classId: classInfo.id,
          date,
        });
      });
      // 每个工作日保留带照片的正、负向案例，便于完整演示记录下钻。
      CLASS_EVALUATION_RECORDS.filter(
        (record) => record.images?.length,
      ).forEach((template, index) => {
        const classInfo = classes[(dayIndex + index * 3) % classes.length];
        records.push({
          ...template,
          id: `report-photo-${date}-${index}`,
          classId: classInfo.id,
          date,
        });
      });
    }
    date = shiftReportDate(date, 1);
    dayIndex += 1;
  }
  const rules: ClassReportScoreRule[] = Array.from(
    new Set(CLASS_EVALUATION_RECORDS.map((record) => record.dimension)),
  ).map((dimension) => ({
    dimension,
    baseScore: 20,
    minScore: 0,
    maxScore: 20,
  }));
  return { firstDate, classes, records: records.reverse(), rules };
}
