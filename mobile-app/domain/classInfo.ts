import type { ClassInfo, EducationStage } from '../types';

export const EDUCATION_STAGE_OPTIONS: ReadonlyArray<{ value: EducationStage; label: string; years: number }> = [
  { value: 'primary', label: '小学', years: 6 },
  { value: 'middle', label: '初中', years: 3 },
  { value: 'high', label: '高中', years: 3 },
];

const CHINESE_CLASS_NUMBERS: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

const PRIMARY_GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
const MIDDLE_GRADES = ['七年级', '八年级', '九年级'];
const HIGH_GRADES = ['高一', '高二', '高三'];

export const getCurrentAcademicYear = (date = new Date()): number => (
  date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1
);

export const inferEducationStage = (classInfo: ClassInfo): EducationStage => {
  if (classInfo.educationStage) return classInfo.educationStage;
  if (/^(初一|初二|初三|七年级|八年级|九年级)/.test(classInfo.gradeLevel)) return 'middle';
  if (classInfo.gradeLevel.startsWith('高')) return 'high';
  return 'primary';
};

export const inferAdmissionYear = (classInfo: ClassInfo): number => {
  if (classInfo.admissionYear) return classInfo.admissionYear;
  const matchedYear = classInfo.name.match(/(\d{4})级/)?.[1] ?? classInfo.id.match(/c_(\d{4})_/)?.[1];
  return matchedYear ? Number(matchedYear) : getCurrentAcademicYear();
};

export const inferClassNumber = (classInfo: ClassInfo): number => {
  if (classInfo.classNumber) return classInfo.classNumber;
  const arabicNumber = classInfo.name.match(/级(\d+)班/)?.[1];
  if (arabicNumber) return Number(arabicNumber);
  const chineseNumber = classInfo.name.match(/级([一二三四五六七八九十]+)班/)?.[1];
  if (chineseNumber && CHINESE_CLASS_NUMBERS[chineseNumber]) return CHINESE_CLASS_NUMBERS[chineseNumber];
  const idNumber = classInfo.id.match(/_(\d+)$/)?.[1];
  return idNumber ? Number(idNumber) : 1;
};

export const getGradeLevel = (
  stage: EducationStage,
  admissionYear: number,
  academicYear = getCurrentAcademicYear(),
): string => {
  const gradeIndex = academicYear - admissionYear;
  const labels = stage === 'primary' ? PRIMARY_GRADES : stage === 'middle' ? MIDDLE_GRADES : HIGH_GRADES;
  return labels[Math.max(0, Math.min(gradeIndex, labels.length - 1))];
};

export const getAdmissionYearOptions = (
  _stage: EducationStage,
  academicYear = getCurrentAcademicYear(),
): number[] => {
  return Array.from({ length: 6 }, (_, index) => academicYear + 1 - index);
};

export const buildClassName = (admissionYear: number, classNumber: number): string => (
  `${admissionYear}级${classNumber}班`
);

export const formatClassCode = (classCode: string): string => classCode.replace(/(\d{4})(?=\d)/, '$1 ');
