import type { ClassInfo, Student } from '../types';
import {
  HOMEWORK_STATUS_VALUES,
  buildHomeworkResults,
  type HomeworkAssignment,
} from '../domain/homework';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, offset: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + offset);
  return result;
};

export const createDemoHomeworkAssignments = ({
  schoolId,
  schoolName,
  classInfo,
  students,
  teacherName,
  subject,
  entries,
}: {
  schoolId: string;
  schoolName: string;
  classInfo: ClassInfo;
  students: Student[];
  teacherName: string;
  subject: string;
  entries?: Array<{
    title: string;
    dayOffset: number;
    source?: HomeworkAssignment['source'];
  }>;
}): HomeworkAssignment[] => {
  const today = new Date();
  const demoEntries = entries ?? [
    { title: '课堂练习', dayOffset: -1 },
    { title: '基础巩固', dayOffset: -2 },
    { title: '拓展训练', dayOffset: -3, source: 'ai_import' as const },
  ];
  return demoEntries.map((entry, assignmentIndex) => {
    const date = formatDate(addDays(today, entry.dayOffset));
    return {
      id: `demo-homework-${classInfo.id}-${subject}-${assignmentIndex + 1}`,
      schoolId,
      schoolName,
      classId: classInfo.id,
      className: classInfo.name,
      subject,
      teacherName,
      date,
      title: entry.title,
      source: entry.source ?? 'manual',
      creatorName: teacherName,
      createdAt: `${date}T09:00:00.000Z`,
      updatedAt: `${date}T09:00:00.000Z`,
      results: buildHomeworkResults(students).map((result, studentIndex) => ({
        ...result,
        status: HOMEWORK_STATUS_VALUES[(studentIndex + assignmentIndex) % HOMEWORK_STATUS_VALUES.length],
      })),
    } satisfies HomeworkAssignment;
  });
};
