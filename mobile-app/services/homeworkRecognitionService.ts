import { GoogleGenAI } from '@google/genai';
import {
  HOMEWORK_STATUS_META,
  HOMEWORK_STATUS_VALUES,
  getHomeworkConflict,
  getHomeworkStatusFromCode,
  sortStudentsByNumber,
  type HomeworkAssignment,
  type HomeworkImportDraft,
  type HomeworkImportIssue,
  type HomeworkRosterVersion,
  type HomeworkStatus,
} from '../domain/homework';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
const hasConfiguredAi = Boolean(API_KEY && !API_KEY.includes('PLACEHOLDER') && !API_KEY.includes('YOUR_'));

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toBase64 = async (file: File) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
};

const parseJsonResponse = <T>(text: string): T => {
  const normalized = text.trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  return JSON.parse(normalized) as T;
};

const matchRosterFromText = (text: string, rosters: HomeworkRosterVersion[], fallbackIndex = 0) => (
  rosters.find(roster => text.includes(roster.className.replace(/\s+/g, '')))
  ?? rosters[fallbackIndex % Math.max(rosters.length, 1)]
);

interface RawHomeworkRecognition {
  className: string;
  subject: string;
  qualityIssues?: string[];
  assignments: Array<{
    date: string;
    title: string;
    results: Array<{ classSequence: string; code?: string; confidence?: number }>;
  }>;
}

const recognizeWithAi = async <T>(file: File, prompt: string): Promise<T> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY! });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType: file.type || 'image/jpeg', data: await toBase64(file) } },
      ],
    }],
    config: { responseMimeType: 'application/json' },
  });
  if (!response.text) throw new Error('识别服务没有返回结果');
  return parseJsonResponse<T>(response.text);
};

const homeworkPrompt = `识别这张通用作业登记表。表格包含一个完整班级、左右两个连续学号区和最多6次作业。每次作业按优、良、合格、待合格、未交分成5个固定位置，老师会在其中一个格内打勾、划线或涂抹。请使用光学标记识别判断被标记的位置，不要识别或推测手写字母。未标记必须返回空字符串，绝不能把空白判断为未交；同一次作业出现多格标记、擦改痕迹或无法确定时降低confidence。
严格返回 JSON：
{"className":"2025级1班","subject":"学科","qualityIssues":[],"assignments":[{"date":"YYYY-MM-DD","title":"作业主题","results":[{"classSequence":"纸面学号，如01","code":"A/B/C/D/X或空字符串","confidence":0.99}]}]}
返回值按标记位置映射：优=A、良=B、合格=C、待合格=D、未交=X。学号必须按纸面印刷值返回，不识别或推测姓名、完整学生编号；只输出图片中真实存在的作业列，日期和主题不得推测。`;

const buildMockHomeworkRecognition = (
  file: File,
  roster: HomeworkRosterVersion,
  fileIndex: number,
): RawHomeworkRecognition => {
  const today = new Date();
  const subjectFromName = ['语文', '数学', '英语', '体育', '书法'].find(subject => file.name.includes(subject));
  const subject = subjectFromName ?? ['语文', '数学', '英语'][fileIndex % 3];
  return {
    className: roster.className,
    subject,
    assignments: [0, 1].map(assignmentIndex => ({
      date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - assignmentIndex)),
      title: assignmentIndex === 0 ? '基础练习' : '拓展训练',
      results: sortStudentsByNumber(roster.students.filter(student => student.status === 'active'))
        .map((student, studentIndex) => ({
          classSequence: String(studentIndex + 1).padStart(2, '0'),
          code: HOMEWORK_STATUS_META[HOMEWORK_STATUS_VALUES[(studentIndex + assignmentIndex) % HOMEWORK_STATUS_VALUES.length]].code,
          confidence: fileIndex === 0 && studentIndex === 3 && assignmentIndex === 0 ? 0.72 : 0.98,
        })),
    })),
  };
};

const mapRawHomeworkToDraft = ({
  raw,
  file,
  fileIndex,
  schoolId,
  schoolName,
  rosters,
  existingAssignments,
  operatorName,
}: {
  raw: RawHomeworkRecognition;
  file: File;
  fileIndex: number;
  schoolId: string;
  schoolName: string;
  rosters: HomeworkRosterVersion[];
  existingAssignments: HomeworkAssignment[];
  operatorName: string;
}): HomeworkImportDraft => {
  const normalizedClassName = raw.className.replace(/\s+/g, '');
  const roster = rosters.find(item => item.className.replace(/\s+/g, '') === normalizedClassName);
  const issues: HomeworkImportIssue[] = (raw.qualityIssues ?? []).map((message, index) => ({
    id: `quality-${fileIndex}-${index}`,
    type: 'image_quality',
    message,
    resolved: false,
  }));
  if (!roster || roster.className.replace(/\s+/g, '') !== raw.className.replace(/\s+/g, '')) {
    issues.push({
      id: `class-${fileIndex}`,
      type: 'class_mismatch',
      message: `未找到与“${raw.className || '未识别班级'}”一致的班级`,
      resolved: false,
    });
  }
  const rosterBySequence = new Map(
    sortStudentsByNumber((roster?.students ?? []).filter(student => student.status === 'active'))
      .map((student, index) => [index + 1, student]),
  );
  const now = new Date().toISOString();
  const assignments = raw.assignments.slice(0, 6).map((rawAssignment, assignmentIndex): HomeworkAssignment => {
    const assignmentId = `recognized-${Date.now()}-${fileIndex}-${assignmentIndex}`;
    const assignment: HomeworkAssignment = {
      id: assignmentId,
      schoolId,
      schoolName,
      classId: roster?.classId ?? `unmatched-${fileIndex}`,
      className: raw.className,
      subject: raw.subject,
      teacherName: '',
      date: rawAssignment.date,
      title: rawAssignment.title,
      source: 'ai_import',
      creatorName: operatorName,
      sourceImageName: file.name,
      createdAt: now,
      updatedAt: now,
      results: rawAssignment.results.map((rawResult, resultIndex) => {
        const classSequence = Number.parseInt(rawResult.classSequence, 10);
        const rosterStudent = Number.isInteger(classSequence) && classSequence > 0
          ? rosterBySequence.get(classSequence)
          : undefined;
        const status = getHomeworkStatusFromCode(rawResult.code);
        const studentId = rosterStudent?.studentId ?? `unmatched-${fileIndex}-${assignmentIndex}-${resultIndex}`;
        if (!rosterStudent) {
          issues.push({
            id: `student-${fileIndex}-${assignmentIndex}-${resultIndex}`,
            type: 'student_mismatch',
            message: `学号${rawResult.classSequence || '未识别'}无法匹配班级学生`,
            assignmentId,
            studentId,
            resolved: false,
          });
        }
        if ((rawResult.confidence ?? 0.9) < 0.9 || (rawResult.code && !status)) {
          issues.push({
            id: `confidence-${fileIndex}-${assignmentIndex}-${resultIndex}`,
            type: 'low_confidence',
            message: `${rosterStudent?.name || `学号${rawResult.classSequence || '未识别'}`}的作业等级需要核对`,
            assignmentId,
            studentId,
            resolved: false,
          });
        }
        return {
          studentId,
          studentNo: rosterStudent?.studentNo ?? `学号${rawResult.classSequence || '未识别'}`,
          studentName: rosterStudent?.name ?? '未匹配学生',
          avatar: rosterStudent?.avatar,
          classSequence: Number.isInteger(classSequence) && classSequence > 0 ? classSequence : undefined,
          status,
          rawCode: rawResult.code,
          confidence: rawResult.confidence,
        };
      }),
    };
    if (!assignment.date || !assignment.title.trim() || !assignment.subject.trim()) {
      issues.push({
        id: `metadata-${fileIndex}-${assignmentIndex}`,
        type: 'missing_metadata',
        message: `第${assignmentIndex + 1}次作业缺少日期、主题或学科`,
        assignmentId,
        resolved: false,
      });
    }
    const conflict = getHomeworkConflict(assignment, existingAssignments);
    if (conflict !== 'none') {
      issues.push({
        id: `${conflict}-${fileIndex}-${assignmentIndex}`,
        type: conflict,
        message: conflict === 'duplicate' ? `${assignment.date} ${assignment.title}已存在相同记录` : `${assignment.date} ${assignment.title}与已有记录不一致`,
        assignmentId,
        resolved: conflict === 'duplicate',
      });
    }
    return assignment;
  });
  return {
    id: `draft-${Date.now()}-${fileIndex}`,
    fileName: file.name,
    className: raw.className,
    subject: raw.subject,
    teacherName: '',
    assignments,
    issues,
  };
};

export const recognizeHomeworkFiles = async ({
  files,
  schoolId,
  schoolName,
  rosters,
  existingAssignments,
  operatorName,
}: {
  files: File[];
  schoolId: string;
  schoolName: string;
  rosters: HomeworkRosterVersion[];
  existingAssignments: HomeworkAssignment[];
  operatorName: string;
}): Promise<HomeworkImportDraft[]> => {
  if (rosters.length === 0) throw new Error('当前学校还没有可匹配的班级学生');
  return Promise.all(files.map(async (file, index) => {
    const fallbackRoster = matchRosterFromText(file.name.replace(/\s+/g, ''), rosters, index) ?? rosters[0];
    const raw = hasConfiguredAi
      ? await recognizeWithAi<RawHomeworkRecognition>(file, homeworkPrompt)
      : buildMockHomeworkRecognition(file, fallbackRoster, index);
    return mapRawHomeworkToDraft({
      raw,
      file,
      fileIndex: index,
      schoolId,
      schoolName,
      rosters,
      existingAssignments,
      operatorName,
    });
  }));
};

export const homeworkStatusFromRecognition = (status: HomeworkStatus | null) => status;
