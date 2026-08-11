import type {
    ClassEvaluationRecord,
    ClassEvaluationWeeklyReport,
} from '../domain/classEvaluationAssistantV2';

const STORAGE_KEY = 'teacher-mobile:class-evaluation-assistant-v2-reports:v2';
const MAX_SAVED_REPORTS = 60;

export interface SavedClassEvaluationReport {
    id: string;
    classId: string;
    className: string;
    weekId: string;
    weekLabel: string;
    dataRangeLabel: string;
    promptVersion: string;
    dataSnapshotId: string;
    generatedAt: string;
    report: ClassEvaluationWeeklyReport;
    evidenceRecords: ClassEvaluationRecord[];
}

export interface SaveClassEvaluationReportInput {
    classId: string;
    className: string;
    weekId: string;
    weekLabel: string;
    dataRangeLabel: string;
    report: ClassEvaluationWeeklyReport;
    records: ClassEvaluationRecord[];
    generatedAt?: string;
}

interface FindClassEvaluationReportInput {
    classId: string;
    weekId: string;
    promptVersion: string;
    dataSnapshotId: string;
}

let memoryReports: SavedClassEvaluationReport[] = [];

const cloneReports = (reports: SavedClassEvaluationReport[]) => (
    typeof structuredClone === 'function'
        ? structuredClone(reports)
        : JSON.parse(JSON.stringify(reports)) as SavedClassEvaluationReport[]
);

const isSavedReport = (value: unknown): value is SavedClassEvaluationReport => {
    if (!value || typeof value !== 'object') return false;
    const report = value as Partial<SavedClassEvaluationReport>;
    return typeof report.id === 'string'
        && typeof report.classId === 'string'
        && typeof report.weekId === 'string'
        && typeof report.promptVersion === 'string'
        && typeof report.dataSnapshotId === 'string'
        && typeof report.generatedAt === 'string'
        && Boolean(report.report)
        && Array.isArray(report.evidenceRecords);
};

const readReports = (): SavedClassEvaluationReport[] => {
    if (typeof window === 'undefined') return cloneReports(memoryReports);
    try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
        return Array.isArray(parsed) ? parsed.filter(isSavedReport) : [];
    } catch {
        return [];
    }
};

const writeReports = (reports: SavedClassEvaluationReport[]) => {
    memoryReports = cloneReports(reports);
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {
        // A storage quota failure must not block the generated report currently on screen.
    }
};

const createReportId = (input: FindClassEvaluationReportInput) => (
    [
        input.classId,
        input.weekId,
        input.dataSnapshotId,
        input.promptVersion,
    ].join(':')
);

export const listSavedClassEvaluationReports = () => (
    readReports().sort((left, right) => right.generatedAt.localeCompare(left.generatedAt))
);

export const findSavedClassEvaluationReport = (input: FindClassEvaluationReportInput) => {
    const reportId = createReportId(input);
    return readReports().find(report => report.id === reportId);
};

export const saveClassEvaluationReport = (
    input: SaveClassEvaluationReportInput,
): SavedClassEvaluationReport => {
    const identity = {
        classId: input.classId,
        weekId: input.weekId,
        promptVersion: input.report.promptVersion,
        dataSnapshotId: input.report.dataSnapshotId,
    };
    const report: SavedClassEvaluationReport = {
        id: createReportId(identity),
        ...identity,
        className: input.className,
        weekLabel: input.weekLabel,
        dataRangeLabel: input.dataRangeLabel,
        generatedAt: input.generatedAt ?? new Date().toISOString(),
        report: input.report,
        evidenceRecords: input.records.filter(record => input.report.evidenceRefs.includes(record.id)),
    };
    const nextReports = [report, ...readReports().filter(item => item.id !== report.id)]
        .slice(0, MAX_SAVED_REPORTS);
    writeReports(nextReports);
    return report;
};
