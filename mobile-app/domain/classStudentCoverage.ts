import type { Student } from '../types';

export type StudentCoverageSortKey = 'evaluationCount' | 'teacherCount';
export type StudentCoverageSortDirection = 'asc' | 'desc';

export interface StudentCoverageRow {
  student: Student;
  evaluationCount: number;
  teacherCount: number;
}

interface BuildStudentCoverageRowsInput {
  students: Student[];
  coveredStudentCount: number;
  totalEvaluationCount: number;
  maxTeacherCount: number;
}

const clampInteger = (value: number, min: number, max: number) => (
  Math.min(max, Math.max(min, Math.round(value)))
);

export const buildStudentCoverageRows = ({
  students,
  coveredStudentCount,
  totalEvaluationCount,
  maxTeacherCount,
}: BuildStudentCoverageRowsInput): StudentCoverageRow[] => {
  const totalRecords = Math.max(0, Math.round(totalEvaluationCount));
  const coveredCount = totalRecords === 0
    ? 0
    : clampInteger(coveredStudentCount, 0, Math.min(students.length, totalRecords));
  const teacherLimit = Math.max(1, Math.round(maxTeacherCount));
  const evaluationCounts = Array.from({ length: students.length }, () => 0);

  if (coveredCount > 0) {
    const remainingRecords = totalRecords - coveredCount;
    const weights = Array.from({ length: coveredCount }, (_, index) => 1 + ((index * 7 + 3) % 5));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let assignedRecords = 0;

    weights.forEach((weight, index) => {
      const additionalRecords = Math.floor((remainingRecords * weight) / totalWeight);
      evaluationCounts[index] = 1 + additionalRecords;
      assignedRecords += additionalRecords;
    });

    let remainder = remainingRecords - assignedRecords;
    let cursor = 0;
    while (remainder > 0) {
      evaluationCounts[(cursor * 7 + 3) % coveredCount] += 1;
      cursor += 1;
      remainder -= 1;
    }
  }

  return students.map((student, index) => {
    const evaluationCount = evaluationCounts[index];
    const teacherCount = evaluationCount === 0
      ? 0
      : Math.min(evaluationCount, teacherLimit, 1 + ((index * 5 + evaluationCount) % teacherLimit));

    return { student, evaluationCount, teacherCount };
  });
};

export const sortStudentCoverageRows = (
  rows: StudentCoverageRow[],
  sortKey: StudentCoverageSortKey,
  direction: StudentCoverageSortDirection,
) => {
  const secondaryKey: StudentCoverageSortKey = sortKey === 'evaluationCount' ? 'teacherCount' : 'evaluationCount';
  const factor = direction === 'asc' ? 1 : -1;

  return [...rows].sort((left, right) => (
    factor * (left[sortKey] - right[sortKey])
    || factor * (left[secondaryKey] - right[secondaryKey])
    || left.student.name.localeCompare(right.student.name, 'zh-Hans-CN')
  ));
};
