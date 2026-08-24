import type { ClassInfo, Student } from '../types';

export const HOMEWORK_STATUS_VALUES = [
  'excellent',
  'good',
  'pass',
  'pending_pass',
  'missing',
] as const;

export type HomeworkStatus = typeof HOMEWORK_STATUS_VALUES[number];
export type HomeworkSource = 'manual' | 'ai_import';

export const HOMEWORK_STATUS_META: Record<HomeworkStatus, { label: string; code: string }> = {
  excellent: { label: '优', code: 'A' },
  good: { label: '良', code: 'B' },
  pass: { label: '合格', code: 'C' },
  pending_pass: { label: '待合格', code: 'D' },
  missing: { label: '未交', code: 'X' },
};

export interface HomeworkStudentResult {
  studentId: string;
  studentNo: string;
  studentName: string;
  avatar?: string;
  classSequence?: number;
  status: HomeworkStatus | null;
  rawCode?: string;
  confidence?: number;
  manuallyConfirmed?: boolean;
}

export interface HomeworkAssignment {
  id: string;
  schoolId: string;
  schoolName: string;
  classId: string;
  className: string;
  subject: string;
  teacherName: string;
  date: string;
  title: string;
  source: HomeworkSource;
  creatorName: string;
  sourceImageName?: string;
  createdAt: string;
  updatedAt: string;
  results: HomeworkStudentResult[];
}

export interface HomeworkRosterStudent {
  studentId: string;
  studentNo: string;
  name: string;
  avatar?: string;
  status: 'active' | 'left';
  confidence?: number;
  needsReview?: boolean;
}

export interface HomeworkRosterVersion {
  id: string;
  schoolId: string;
  schoolName: string;
  classId: string;
  className: string;
  version: number;
  sourceImageNames: string[];
  createdAt: string;
  students: HomeworkRosterStudent[];
}

export type HomeworkImportIssueType =
  | 'image_quality'
  | 'class_mismatch'
  | 'student_mismatch'
  | 'missing_metadata'
  | 'low_confidence'
  | 'duplicate'
  | 'conflict';

export interface HomeworkImportIssue {
  id: string;
  type: HomeworkImportIssueType;
  message: string;
  assignmentId?: string;
  studentId?: string;
  resolved: boolean;
}

export interface HomeworkImportDraft {
  id: string;
  fileName: string;
  previewUrl?: string;
  className: string;
  subject: string;
  teacherName: string;
  assignments: HomeworkAssignment[];
  issues: HomeworkImportIssue[];
}

export const getHomeworkStatusFromCode = (code?: string | null): HomeworkStatus | null => {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) return null;
  const entry = HOMEWORK_STATUS_VALUES.find(status => HOMEWORK_STATUS_META[status].code === normalized);
  return entry ?? null;
};

export const sortStudentsByNumber = <T extends { studentNo?: string; studentId?: string; id?: string }>(students: T[]) => (
  [...students].sort((first, second) => (
    (first.studentNo ?? first.studentId ?? first.id ?? '').localeCompare(
      second.studentNo ?? second.studentId ?? second.id ?? '',
      'zh-Hans-CN',
      { numeric: true },
    )
  ))
);

export type HomeworkTemplatePageSize = 'A4' | 'A3';

export const HOMEWORK_TEMPLATE_CAPACITY: Record<HomeworkTemplatePageSize, number> = {
  A4: 72,
  A3: 100,
};

const A4_HOMEWORK_TEMPLATE_PAGE = { pageSize: 'A4' as const, width: 3508, height: 2480 };
const A3_HOMEWORK_TEMPLATE_PAGE = { pageSize: 'A3' as const, width: 4961, height: 3508 };

export const getHomeworkTemplatePageSpec = (pageSize: HomeworkTemplatePageSize = 'A4') => (
  pageSize === 'A3' ? A3_HOMEWORK_TEMPLATE_PAGE : A4_HOMEWORK_TEMPLATE_PAGE
);

export const getHomeworkTemplateLayout = (pageSize: HomeworkTemplatePageSize = 'A4') => {
  const page = getHomeworkTemplatePageSpec(pageSize);
  const capacity = HOMEWORK_TEMPLATE_CAPACITY[pageSize];
  const sequenceDigits = pageSize === 'A3' ? 3 : 2;
  const sequences = Array.from({ length: capacity }, (_, index) => String(index + 1).padStart(sequenceDigits, '0'));
  const splitIndex = Math.ceil(sequences.length / 2);
  return {
    page,
    sequences,
    leftSequences: sequences.slice(0, splitIndex),
    rightSequences: sequences.slice(splitIndex),
  };
};

export const buildHomeworkResults = (students: Student[]): HomeworkStudentResult[] => (
  sortStudentsByNumber(students)
    .filter(student => (student.status ?? 'active') === 'active')
    .map((student, index) => ({
      studentId: student.id,
      studentNo: student.studentNo ?? student.id,
      studentName: student.name,
      avatar: student.avatar,
      classSequence: index + 1,
      status: null,
    }))
);

export const buildRosterVersion = ({
  schoolId,
  schoolName,
  classInfo,
  students,
  version = 1,
  sourceImageNames = [],
}: {
  schoolId: string;
  schoolName: string;
  classInfo: ClassInfo;
  students: Student[];
  version?: number;
  sourceImageNames?: string[];
}): HomeworkRosterVersion => ({
  id: `${schoolId}:${classInfo.id}:v${version}`,
  schoolId,
  schoolName,
  classId: classInfo.id,
  className: classInfo.name,
  version,
  sourceImageNames,
  createdAt: new Date().toISOString(),
  students: sortStudentsByNumber(students).map(student => ({
    studentId: student.id,
    studentNo: student.studentNo ?? student.id,
    name: student.name,
    avatar: student.avatar,
    status: student.status ?? 'active',
  })),
});

export const getCurrentRosterVersions = (versions: HomeworkRosterVersion[]) => {
  const currentByClass = new Map<string, HomeworkRosterVersion>();
  versions.forEach(version => {
    const current = currentByClass.get(version.classId);
    if (!current || version.version > current.version) currentByClass.set(version.classId, version);
  });
  return [...currentByClass.values()].sort((first, second) => first.className.localeCompare(second.className, 'zh-Hans-CN', { numeric: true }));
};

export const normalizeHomeworkTitle = (title: string) => title.trim().replace(/\s+/g, '').toLocaleLowerCase('zh-CN');

export const getHomeworkAssignmentKey = (assignment: Pick<HomeworkAssignment, 'schoolId' | 'className' | 'subject' | 'date' | 'title'>) => (
  [assignment.schoolId, assignment.className.trim(), assignment.subject.trim(), assignment.date, normalizeHomeworkTitle(assignment.title)].join('|')
);

export const haveSameHomeworkResults = (first: HomeworkAssignment, second: HomeworkAssignment) => {
  const firstResults = new Map(first.results.map(result => [result.studentId, result.status]));
  return second.results.length === first.results.length
    && second.results.every(result => firstResults.get(result.studentId) === result.status);
};

export const getHomeworkConflict = (
  assignment: HomeworkAssignment,
  existingAssignments: HomeworkAssignment[],
): 'none' | 'duplicate' | 'conflict' => {
  const sameAssignment = existingAssignments.find(existing => (
    getHomeworkAssignmentKey(existing) === getHomeworkAssignmentKey(assignment)
  ));
  if (!sameAssignment) return 'none';
  return haveSameHomeworkResults(sameAssignment, assignment) ? 'duplicate' : 'conflict';
};

export const getAssignmentCompletionCount = (assignment: HomeworkAssignment) => (
  assignment.results.filter(result => result.status !== null).length
);
