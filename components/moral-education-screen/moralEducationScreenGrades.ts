import type { MoralScreenSnapshot } from './moralEducationScreenModel';

export const MORAL_GRADE_GROUP_SIZE = 3;
export const MORAL_GRADE_ROWS = 12;

/** 一组年级的班级全部展示完，再进入下一组；短名册停留在自己的最后一页。 */
export function buildMoralGradePages(grades: MoralScreenSnapshot['grades']) {
  const pages = [];
  for (let start = 0; start < grades.length; start += MORAL_GRADE_GROUP_SIZE) {
    const group = grades.slice(start, start + MORAL_GRADE_GROUP_SIZE);
    const classPages = Math.max(1, ...group.map(grade => Math.ceil(grade.ranking.length / MORAL_GRADE_ROWS)));
    for (let page = 0; page < classPages; page++) {
      pages.push({
        groupIndex: start / MORAL_GRADE_GROUP_SIZE,
        classPage: page,
        grades: group.map(grade => {
          const lastPage = Math.max(0, Math.ceil(grade.ranking.length / MORAL_GRADE_ROWS) - 1);
          const offset = Math.min(page, lastPage) * MORAL_GRADE_ROWS;
          return {
            id: grade.id, name: grade.name, total: grade.ranking.length,
            from: grade.ranking.length ? offset + 1 : 0,
            to: Math.min(offset + MORAL_GRADE_ROWS, grade.ranking.length),
            rows: grade.ranking.slice(offset, offset + MORAL_GRADE_ROWS),
          };
        }),
      });
    }
  }
  return pages;
}

export type MoralGradePage = ReturnType<typeof buildMoralGradePages>[number];
