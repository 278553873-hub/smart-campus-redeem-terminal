export interface StudentEvaluationRecordSnapshot {
  evaluation_date: string;
  indicatorPath: string[];
  scoreChange: number;
  aiComment: string;
}

export interface StudentEvaluationRecordRevision {
  id: string;
  editedAt: string;
  editedByTeacherId: string;
  editedByTeacherName: string;
  reason: string;
  previous: StudentEvaluationRecordSnapshot;
}

export interface StudentEvaluationRecord extends StudentEvaluationRecordSnapshot {
  id: string;
  isBad: boolean;
  description: string;
  teacherId: string;
  teacherName: string;
  auditReason?: string;
  revisions?: StudentEvaluationRecordRevision[];
}

export interface StudentEvaluationRecordUpdate {
  evaluation_date: string;
  indicatorPath: string[];
  scoreChange: number;
  aiComment: string;
  reason: string;
}
