export interface Student {
  id: string;
  name: string;
  gender: 'male' | 'female';
  grade: string;
  class: string;
  avatar?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  gradeLevel: string;
  studentCount: number;
  tags: string[]; // e.g. "班主任", "数学"
  hasPendingRewards?: boolean;
}

export interface ScoreItem {
  label: string;
  score: number; // Base 60, range 0-100
  category: string;
  change?: number; // Recent change
}

export interface SubjectGrade {
  subject: string;
  grade: string;
  hasReport: boolean;
}

export interface GrowthReportItem {
  id: string;
  title: string;
  date: string;
}

export interface DetailedReportSection {
  title: string;
  content: string;
}

// Indicator Structure (Tree)
export interface IndicatorNode {
  id: string;
  name: string;
  level: 1 | 2 | 3;
  children?: IndicatorNode[];
  scoreValue?: number; // Default score change for leaf nodes
  description?: string; // For teacher help
}

// Record/Event Data
export interface BehaviorRecord {
  id: string;
  timestamp: string;
  studentIds: string[];
  studentNames: string[]; // Cache for display
  type: 'behavior' | 'certificate' | 'subject'; // Routine behavior, Award, or Subject Score

  // AI Analyzed Fields
  indicatorPath: string[]; // e.g., ["德育", "品格修养", "尊师孝亲"]
  scoreChange: number;
  description: string; // The user's input or AI summary
  aiComment: string; // AI generated encouraging comment
  images?: string[]; // Evidence

  // Certificate Specific
  certificateInfo?: {
    eventName: string;
    project?: string;
    type: string;
    level: string;
    awardDate: string;
    awardName: string;
  };
}

export type TabType = 'five-education' | 'subject';
export type SubTabType = 'evaluation' | 'growth';

// --- AI Document Analysis Types ---
export interface EducationDocumentMeta {
  doc_type: string;
  data_role: string;
  primary_subject: string;
  education_stage: string;
  school_year: string;
  semester: string;
  grade_scope: string;
  class_scope: string;
  student_scope: string;
  time_scope: string;
  core_purpose: string;
  can_be_used_in_report: boolean;
  confidence: number;
}

export interface EducationDocumentScoreExtension {
  exam_type: string;
  score_nature: string;
  class_count: string;
  student_count: string;
  score_dimensions: string[];
  scoring_method: string;
  is_primary_data_source: boolean;
  missing_info: string[];
}

export interface EducationDocumentEvaluationExtension {
  applicable_subject: string;
  applicable_grades: string[];
  evaluation_dimensions: string[];
  weight_info: string;
  can_be_used_as_rule_reference: boolean;
}

export interface EducationDocumentTeachingPlanExtension {
  applicable_subject: string;
  applicable_grades: string[];
  core_goals: string[];
  teaching_period: string;
  can_support_report_narrative: boolean;
}

export interface EducationDocumentCustomExtension {
  key_points: string[];
  possible_usage: string;
}

export interface EducationDocumentExtensions {
  score: EducationDocumentScoreExtension | null;
  evaluation_standard: EducationDocumentEvaluationExtension | null;
  teaching_plan: EducationDocumentTeachingPlanExtension | null;
  custom: EducationDocumentCustomExtension | null;
}

export interface EducationDocumentSummary {
  one_sentence: string;
  detailed: string;
}

export interface EducationDocumentAnalysis {
  doc_meta: EducationDocumentMeta;
  extensions: EducationDocumentExtensions;
  summary: EducationDocumentSummary;
  semantic_tags: string[];
}
