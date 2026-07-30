export const STUDENT_GROWTH_STORE_EVENT = 'student-growth-store-updated';

const STORAGE_KEY = 'teacher-student-growth-workspace-v1';

export type HealthExamSourceType = 'pc-import' | 'mobile-entry';
export type GoalPlanStatus = 'draft' | 'pending-confirmation' | 'active' | 'adjusted' | 'reviewed';
export type GoalSelfAssessment = '我能做到' | '我需要努力' | '我需要帮助';

export interface HealthExamCorrection {
  id: string;
  operator: string;
  correctedAt: string;
  changedFields: string[];
}

export interface HealthExamRecord {
  id: string;
  studentId: string;
  examDate: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  nakedVisionLeft: string;
  nakedVisionRight: string;
  correctedVisionLeft: string;
  correctedVisionRight: string;
  glassesType: '不戴镜' | '框架眼镜' | '夜戴角膜塑形镜';
  conclusion: string;
  conclusionTags: string[];
  sourceType: HealthExamSourceType;
  sourceLabel: string;
  sourceBatchId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  corrections: HealthExamCorrection[];
}

export interface BodyMeasurementRecord {
  id: string;
  studentId: string;
  measuredAt: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  sourceType: 'health-exam' | 'growth-collection' | 'mobile-entry';
  sourceLabel: string;
  sourceRecordId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SemesterGoalItem {
  id: string;
  type: '继续闪亮' | '尝试新方向' | '其他挑战';
  dimension: string;
  reason: string;
  action: string;
  selfAssessment: GoalSelfAssessment;
  optional?: boolean;
}

export interface GoalConfirmation {
  role: '学生' | '教师' | '家长';
  name: string;
  confirmedAt: string;
  method: '账号确认' | '访谈确认';
}

export interface SemesterGoalPlan {
  id: string;
  studentId: string;
  term: string;
  status: GoalPlanStatus;
  previousReflection: string;
  goals: SemesterGoalItem[];
  studentMessage: string;
  teacherMessage: string;
  parentMessage: string;
  agreement: string;
  confirmations: GoalConfirmation[];
  interviewRecorder?: string;
  interviewRecordedAt?: string;
  sourceRecordId?: string;
  sourceLabel?: string;
  version: number;
  updatedAt: string;
}

export interface HealthImportBatch {
  id: string;
  fileName: string;
  operator: string;
  importedAt: string;
  totalRows: number;
  uniqueRecords: number;
  writtenRecords: number;
  duplicateRecords: number;
  unmatchedRecords: number;
  anomalousValues: number;
  status: 'preview' | 'completed';
}

export interface StudentGrowthWorkspace {
  schemaVersion: 2;
  healthExamRecords: HealthExamRecord[];
  bodyMeasurements: BodyMeasurementRecord[];
  semesterGoalPlans: SemesterGoalPlan[];
  importBatches: HealthImportBatch[];
}

export interface StudentGrowthProfile {
  healthExamRecords: HealthExamRecord[];
  bodyMeasurements: BodyMeasurementRecord[];
  semesterGoalPlan?: SemesterGoalPlan;
}

export interface HealthExamInput {
  id?: string;
  examDate: string;
  heightCm: number;
  weightKg: number;
  nakedVisionLeft: string;
  nakedVisionRight: string;
  correctedVisionLeft: string;
  correctedVisionRight: string;
  glassesType: HealthExamRecord['glassesType'];
  conclusion: string;
}

export interface BodyMeasurementInput {
  measuredAt: string;
  heightCm: number;
  weightKg: number;
  sourceRecordId: string;
  sourceLabel: string;
  sourceType?: BodyMeasurementRecord['sourceType'];
}

export interface SemesterGoalPlanInput {
  term: string;
  status: GoalPlanStatus;
  previousReflection: string;
  goals: SemesterGoalItem[];
  studentMessage: string;
  teacherMessage: string;
  parentMessage: string;
  agreement: string;
  confirmations: GoalConfirmation[];
  interviewRecorder?: string;
  interviewRecordedAt?: string;
  sourceRecordId: string;
  sourceLabel: string;
}

const nowText = () => new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const clone = <T,>(value: T): T => (
  value === undefined ? value : JSON.parse(JSON.stringify(value)) as T
);

export const calculateBmi = (heightCm: number, weightKg: number) => {
  if (!heightCm || !weightKg) return 0;
  return Number((weightKg / ((heightCm / 100) ** 2)).toFixed(1));
};

export const extractHealthConclusionTags = (conclusion: string) => {
  const candidates = ['视力异常', '龋齿', '偏瘦', '超重', '肥胖', '心动过缓', '淋巴结肿大'];
  return candidates.filter(tag => conclusion.includes(tag));
};

const hashStudentId = (studentId: string) => (
  studentId.split('').reduce((total, character) => total + character.charCodeAt(0), 0)
);

const seedHealthRecords = (studentId: string): HealthExamRecord[] => {
  const seed = hashStudentId(studentId);
  const currentHeight = Number((136.2 + (seed % 42) / 10).toFixed(1));
  const currentWeight = Number((30.4 + (seed % 36) / 10).toFixed(1));
  const previousHeight = Number((currentHeight - 3.1).toFixed(1));
  const previousWeight = Number((currentWeight - 2.2).toFixed(1));
  const currentConclusion = seed % 3 === 0
    ? '视力异常、龋齿；建议进一步检查。'
    : '龋齿；建议进一步检查。';

  return [
    {
      id: `health-${studentId}-2025-10`,
      studentId,
      examDate: '2025-10-21',
      heightCm: currentHeight,
      weightKg: currentWeight,
      bmi: calculateBmi(currentHeight, currentWeight),
      nakedVisionLeft: seed % 3 === 0 ? '4.7' : '5.0',
      nakedVisionRight: seed % 4 === 0 ? '4.8' : '5.0',
      correctedVisionLeft: '5.0',
      correctedVisionRight: '5.0',
      glassesType: seed % 3 === 0 ? '框架眼镜' : '不戴镜',
      conclusion: currentConclusion,
      conclusionTags: extractHealthConclusionTags(currentConclusion),
      sourceType: 'pc-import',
      sourceLabel: '学校体检数据导入',
      sourceBatchId: 'health-import-2025-autumn',
      version: 1,
      createdAt: '2025-10-29 10:18',
      updatedAt: '2025-10-29 10:18',
      corrections: [],
    },
    {
      id: `health-${studentId}-2025-03`,
      studentId,
      examDate: '2025-03-18',
      heightCm: previousHeight,
      weightKg: previousWeight,
      bmi: calculateBmi(previousHeight, previousWeight),
      nakedVisionLeft: '5.0',
      nakedVisionRight: '5.0',
      correctedVisionLeft: '5.0',
      correctedVisionRight: '5.0',
      glassesType: '不戴镜',
      conclusion: '体检未发现异常。',
      conclusionTags: [],
      sourceType: 'pc-import',
      sourceLabel: '学校体检数据导入',
      sourceBatchId: 'health-import-2025-spring',
      version: 1,
      createdAt: '2025-03-25 14:06',
      updatedAt: '2025-03-25 14:06',
      corrections: [],
    },
  ];
};

const measurementFromHealthExam = (record: HealthExamRecord): BodyMeasurementRecord => ({
  id: `measurement-${record.id}`,
  studentId: record.studentId,
  measuredAt: record.examDate,
  heightCm: record.heightCm,
  weightKg: record.weightKg,
  bmi: record.bmi,
  sourceType: 'health-exam',
  sourceLabel: record.sourceLabel,
  sourceRecordId: record.id,
  version: record.version,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

const seedSemesterGoalPlan = (studentId: string): SemesterGoalPlan => ({
  id: `goal-plan-${studentId}-2026-spring`,
  studentId,
  term: '2025-2026学年下学期',
  status: 'active',
  previousReflection: '我比以前更愿意在小组里表达自己的想法。',
  goals: [
    {
      id: 'goal-continue',
      type: '继续闪亮',
      dimension: '求真',
      reason: '我喜欢自己寻找问题的答案。',
      action: '每周记录一个课堂上发现的新问题，并尝试找到答案。',
      selfAssessment: '我能做到',
    },
    {
      id: 'goal-new',
      type: '尝试新方向',
      dimension: '悦群',
      reason: '我希望在小组合作时更主动。',
      action: '每周至少主动帮助同学两次，并完成一次小组分享。',
      selfAssessment: '我需要努力',
    },
    {
      id: 'goal-challenge',
      type: '其他挑战',
      dimension: '乐健',
      reason: '我想让自己更有耐力。',
      action: '每周完成三次跳绳练习，每次坚持五分钟。',
      selfAssessment: '我需要帮助',
      optional: true,
    },
  ],
  studentMessage: '希望老师提醒我把目标记录下来。',
  teacherMessage: '先从小组内的固定任务开始，我会每两周和你一起回顾一次。',
  parentMessage: '我们会在家里给孩子留出固定的练习和整理时间。',
  agreement: '每两周共同回顾一次目标进展，遇到困难及时寻求帮助。',
  confirmations: [
    { role: '学生', name: '学生本人', confirmedAt: '2026-02-24 15:20', method: '访谈确认' },
    { role: '教师', name: '刘飞飞老师', confirmedAt: '2026-02-24 15:32', method: '账号确认' },
    { role: '家长', name: '学生家长', confirmedAt: '2026-02-25 20:08', method: '账号确认' },
  ],
  interviewRecorder: '刘飞飞老师',
  interviewRecordedAt: '2026-02-24 15:20',
  version: 1,
  updatedAt: '2026-02-25 20:08',
});

const getLatestSemesterGoalPlan = (plans: SemesterGoalPlan[], studentId: string) => (
  plans
    .filter(plan => plan.studentId === studentId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt, 'zh-CN', { numeric: true }))[0]
);

const createInitialWorkspace = (): StudentGrowthWorkspace => ({
  schemaVersion: 2,
  healthExamRecords: [],
  bodyMeasurements: [],
  semesterGoalPlans: [],
  importBatches: [
    {
      id: 'health-import-2025-autumn',
      fileName: '三年级体检数据.xlsx',
      operator: '学校健康管理员',
      importedAt: '2025-10-29 10:18',
      totalRows: 144,
      uniqueRecords: 97,
      writtenRecords: 97,
      duplicateRecords: 47,
      unmatchedRecords: 0,
      anomalousValues: 5,
      status: 'completed',
    },
  ],
});

const isWorkspace = (value: unknown): value is StudentGrowthWorkspace => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StudentGrowthWorkspace>;
  return candidate.schemaVersion === 2
    && Array.isArray(candidate.healthExamRecords)
    && Array.isArray(candidate.bodyMeasurements)
    && Array.isArray(candidate.semesterGoalPlans)
    && Array.isArray(candidate.importBatches);
};

const migrateWorkspace = (value: unknown): StudentGrowthWorkspace | null => {
  if (isWorkspace(value)) return value;
  if (!value || typeof value !== 'object') return null;
  const candidate = value as {
    schemaVersion?: number;
    healthExamRecords?: HealthExamRecord[];
    semesterGoalPlans?: SemesterGoalPlan[];
    importBatches?: HealthImportBatch[];
  };
  if (
    candidate.schemaVersion !== 1
    || !Array.isArray(candidate.healthExamRecords)
    || !Array.isArray(candidate.semesterGoalPlans)
    || !Array.isArray(candidate.importBatches)
  ) return null;
  return {
    schemaVersion: 2,
    healthExamRecords: candidate.healthExamRecords,
    bodyMeasurements: candidate.healthExamRecords.map(measurementFromHealthExam),
    semesterGoalPlans: candidate.semesterGoalPlans,
    importBatches: candidate.importBatches,
  };
};

export const readStudentGrowthWorkspace = (): StudentGrowthWorkspace => {
  if (typeof window === 'undefined') return createInitialWorkspace();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialWorkspace();
    const parsed = JSON.parse(raw) as unknown;
    return migrateWorkspace(parsed) ?? createInitialWorkspace();
  } catch {
    return createInitialWorkspace();
  }
};

export const writeStudentGrowthWorkspace = (workspace: StudentGrowthWorkspace) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent(STUDENT_GROWTH_STORE_EVENT));
};

export const ensureStudentGrowthProfile = (studentId: string): StudentGrowthProfile => {
  const workspace = readStudentGrowthWorkspace();
  const hasHealthRecords = workspace.healthExamRecords.some(record => record.studentId === studentId);
  const hasBodyMeasurements = workspace.bodyMeasurements.some(record => record.studentId === studentId);
  const hasGoalPlan = workspace.semesterGoalPlans.some(plan => plan.studentId === studentId);

  if (!hasHealthRecords) {
    const records = seedHealthRecords(studentId);
    workspace.healthExamRecords.push(...records);
    workspace.bodyMeasurements.push(...records.map(measurementFromHealthExam));
  } else if (!hasBodyMeasurements) {
    workspace.bodyMeasurements.push(...workspace.healthExamRecords.filter(record => record.studentId === studentId).map(measurementFromHealthExam));
  }
  if (!hasGoalPlan) workspace.semesterGoalPlans.push(seedSemesterGoalPlan(studentId));
  if (!hasHealthRecords || !hasBodyMeasurements || !hasGoalPlan) writeStudentGrowthWorkspace(workspace);

  return {
    healthExamRecords: workspace.healthExamRecords
      .filter(record => record.studentId === studentId)
      .sort((left, right) => right.examDate.localeCompare(left.examDate))
      .map(clone),
    bodyMeasurements: workspace.bodyMeasurements
      .filter(record => record.studentId === studentId)
      .sort((left, right) => right.measuredAt.localeCompare(left.measuredAt))
      .map(clone),
    semesterGoalPlan: clone(getLatestSemesterGoalPlan(workspace.semesterGoalPlans, studentId)),
  };
};

export const readStudentGrowthProfile = (studentId: string): StudentGrowthProfile => {
  const workspace = readStudentGrowthWorkspace();
  return {
    healthExamRecords: workspace.healthExamRecords
      .filter(record => record.studentId === studentId)
      .sort((left, right) => right.examDate.localeCompare(left.examDate))
      .map(clone),
    bodyMeasurements: workspace.bodyMeasurements
      .filter(record => record.studentId === studentId)
      .sort((left, right) => right.measuredAt.localeCompare(left.measuredAt))
      .map(clone),
    semesterGoalPlan: clone(getLatestSemesterGoalPlan(workspace.semesterGoalPlans, studentId)),
  };
};

export const validateHealthExamInput = (
  studentId: string,
  input: HealthExamInput,
  records: HealthExamRecord[],
) => {
  const errors: Partial<Record<keyof HealthExamInput, string>> = {};
  if (!input.examDate) errors.examDate = '请选择体检日期';
  if (!Number.isFinite(input.heightCm) || input.heightCm < 80 || input.heightCm > 220) errors.heightCm = '请输入80至220厘米';
  if (!Number.isFinite(input.weightKg) || input.weightKg < 10 || input.weightKg > 200) errors.weightKg = '请输入10至200千克';
  const duplicate = records.some(record => record.studentId === studentId && record.examDate === input.examDate && record.id !== input.id);
  if (duplicate) errors.examDate = '该日期已有体检记录，请编辑已有记录';
  return errors;
};

const comparableHealthFields: Array<keyof HealthExamInput> = [
  'examDate',
  'heightCm',
  'weightKg',
  'nakedVisionLeft',
  'nakedVisionRight',
  'correctedVisionLeft',
  'correctedVisionRight',
  'glassesType',
  'conclusion',
];

export const saveHealthExamRecord = (
  studentId: string,
  input: HealthExamInput,
  operator: string,
): HealthExamRecord => {
  const workspace = readStudentGrowthWorkspace();
  const existingIndex = input.id
    ? workspace.healthExamRecords.findIndex(record => record.id === input.id && record.studentId === studentId)
    : -1;
  const timestamp = nowText();
  const baseValues = {
    studentId,
    examDate: input.examDate,
    heightCm: Number(input.heightCm),
    weightKg: Number(input.weightKg),
    bmi: calculateBmi(Number(input.heightCm), Number(input.weightKg)),
    nakedVisionLeft: input.nakedVisionLeft.trim(),
    nakedVisionRight: input.nakedVisionRight.trim(),
    correctedVisionLeft: input.correctedVisionLeft.trim(),
    correctedVisionRight: input.correctedVisionRight.trim(),
    glassesType: input.glassesType,
    conclusion: input.conclusion.trim(),
    conclusionTags: extractHealthConclusionTags(input.conclusion),
  };

  let nextRecord: HealthExamRecord;
  if (existingIndex >= 0) {
    const existing = workspace.healthExamRecords[existingIndex];
    const changedFields = comparableHealthFields.filter(field => String(existing[field as keyof HealthExamRecord] ?? '') !== String(input[field] ?? ''));
    nextRecord = {
      ...existing,
      ...baseValues,
      version: existing.version + 1,
      updatedAt: timestamp,
      corrections: changedFields.length
        ? [...existing.corrections, { id: createId('health-correction'), operator, correctedAt: timestamp, changedFields }]
        : existing.corrections,
    };
    workspace.healthExamRecords[existingIndex] = nextRecord;
  } else {
    nextRecord = {
      id: createId('health'),
      ...baseValues,
      sourceType: 'mobile-entry',
      sourceLabel: '教师手机端新增',
      version: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
      corrections: [],
    };
    workspace.healthExamRecords.push(nextRecord);
  }

  const measurementIndex = workspace.bodyMeasurements.findIndex(record => record.sourceRecordId === nextRecord.id);
  const measurement = measurementFromHealthExam(nextRecord);
  if (measurementIndex >= 0) workspace.bodyMeasurements[measurementIndex] = measurement;
  else workspace.bodyMeasurements.push(measurement);

  writeStudentGrowthWorkspace(workspace);
  return clone(nextRecord);
};

export const saveBodyMeasurementRecord = (
  studentId: string,
  input: BodyMeasurementInput,
  operator?: string,
): BodyMeasurementRecord => {
  const workspace = readStudentGrowthWorkspace();
  const existingIndex = workspace.bodyMeasurements.findIndex(record => (
    record.studentId === studentId && record.sourceRecordId === input.sourceRecordId
  ));
  const timestamp = nowText();
  const existing = existingIndex >= 0 ? workspace.bodyMeasurements[existingIndex] : undefined;
  const record: BodyMeasurementRecord = {
    id: existing?.id ?? createId('measurement'),
    studentId,
    measuredAt: input.measuredAt,
    heightCm: Number(input.heightCm),
    weightKg: Number(input.weightKg),
    bmi: calculateBmi(Number(input.heightCm), Number(input.weightKg)),
    sourceType: input.sourceType ?? 'growth-collection',
    sourceLabel: input.sourceLabel,
    sourceRecordId: input.sourceRecordId,
    version: (existing?.version ?? 0) + 1,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  if (existingIndex >= 0) workspace.bodyMeasurements[existingIndex] = record;
  else workspace.bodyMeasurements.push(record);

  if (existing?.sourceType === 'health-exam') {
    const healthIndex = workspace.healthExamRecords.findIndex(item => (
      item.studentId === studentId && item.id === existing.sourceRecordId
    ));
    if (healthIndex >= 0) {
      const healthRecord = workspace.healthExamRecords[healthIndex];
      const changedFields = ['examDate', 'heightCm', 'weightKg'].filter(field => {
        if (field === 'examDate') return healthRecord.examDate !== input.measuredAt;
        return healthRecord[field] !== Number(input[field]);
      });
      workspace.healthExamRecords[healthIndex] = {
        ...healthRecord,
        examDate: input.measuredAt,
        heightCm: Number(input.heightCm),
        weightKg: Number(input.weightKg),
        bmi: calculateBmi(Number(input.heightCm), Number(input.weightKg)),
        version: healthRecord.version + 1,
        updatedAt: timestamp,
        corrections: changedFields.length
          ? [...healthRecord.corrections, {
            id: createId('health-correction'),
            operator: operator ?? '教师手机端',
            correctedAt: timestamp,
            changedFields,
          }]
          : healthRecord.corrections,
      };
    }
  }
  writeStudentGrowthWorkspace(workspace);
  return clone(record);
};

export const saveSemesterGoalPlan = (
  studentId: string,
  input: SemesterGoalPlanInput,
): SemesterGoalPlan => {
  const workspace = readStudentGrowthWorkspace();
  const existingIndex = workspace.semesterGoalPlans.findIndex(plan => (
    plan.studentId === studentId
    && (plan.sourceRecordId === input.sourceRecordId || plan.term === input.term)
  ));
  const existing = existingIndex >= 0 ? workspace.semesterGoalPlans[existingIndex] : undefined;
  const plan: SemesterGoalPlan = {
    id: existing?.id ?? createId('goal-plan'),
    studentId,
    term: input.term,
    status: input.status,
    previousReflection: input.previousReflection.trim(),
    goals: input.goals.map(goal => ({ ...goal })),
    studentMessage: input.studentMessage.trim(),
    teacherMessage: input.teacherMessage.trim(),
    parentMessage: input.parentMessage.trim(),
    agreement: input.agreement.trim(),
    confirmations: input.confirmations.map(confirmation => ({ ...confirmation })),
    interviewRecorder: input.interviewRecorder,
    interviewRecordedAt: input.interviewRecordedAt,
    sourceRecordId: input.sourceRecordId,
    sourceLabel: input.sourceLabel,
    version: (existing?.version ?? 0) + 1,
    updatedAt: nowText(),
  };
  if (existingIndex >= 0) workspace.semesterGoalPlans[existingIndex] = plan;
  else workspace.semesterGoalPlans.push(plan);
  writeStudentGrowthWorkspace(workspace);
  return clone(plan);
};

export const readHealthImportBatches = () => (
  readStudentGrowthWorkspace().importBatches
    .sort((left, right) => right.importedAt.localeCompare(left.importedAt))
    .map(clone)
);

export const saveHealthImportBatch = (batch: Omit<HealthImportBatch, 'id' | 'importedAt' | 'status'>) => {
  const workspace = readStudentGrowthWorkspace();
  const savedBatch: HealthImportBatch = {
    ...batch,
    id: createId('health-import'),
    importedAt: nowText(),
    status: 'completed',
  };
  workspace.importBatches.unshift(savedBatch);
  writeStudentGrowthWorkspace(workspace);
  return clone(savedBatch);
};
