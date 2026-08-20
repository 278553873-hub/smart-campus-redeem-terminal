const CHINESE_DIGITS = {
  '一': 1,
  '二': 2,
  '三': 3,
  '四': 4,
  '五': 5,
  '六': 6,
  '七': 7,
  '八': 8,
  '九': 9,
};

const SPOKEN_NUMBER_TOKEN = '[0-9]{1,2}|[一二三四五六七八九十]{1,3}';

export const parseSpokenStudentNumber = (value) => {
  if (/^\d{1,2}$/.test(value)) return Number(value);
  if (value === '十') return 10;
  if (!value.includes('十')) return CHINESE_DIGITS[value] ?? null;

  const [tensText, onesText] = value.split('十');
  const tens = tensText ? CHINESE_DIGITS[tensText] : 1;
  const ones = onesText ? CHINESE_DIGITS[onesText] : 0;
  if (tens == null || ones == null) return null;
  return tens * 10 + ones;
};

export const extractSpokenStudentNumbers = (text) => {
  const normalized = text.replace(/\s/g, '');
  const result = new Set();
  const rangePattern = new RegExp(`(${SPOKEN_NUMBER_TOKEN})号?(?:到|至|[-~～])(${SPOKEN_NUMBER_TOKEN})号`, 'g');
  const singlePattern = new RegExp(`(${SPOKEN_NUMBER_TOKEN})号`, 'g');

  for (const match of normalized.matchAll(rangePattern)) {
    const start = parseSpokenStudentNumber(match[1]);
    const end = parseSpokenStudentNumber(match[2]);
    if (start == null || end == null) continue;
    const direction = start <= end ? 1 : -1;
    for (let number = start; number !== end + direction; number += direction) result.add(number);
  }

  for (const match of normalized.matchAll(singlePattern)) {
    const number = parseSpokenStudentNumber(match[1]);
    if (number != null) result.add(number);
  }

  return [...result];
};

export const resolveStudentsBySpokenNumbers = (text, students) => {
  const numbers = extractSpokenStudentNumbers(text);
  const studentByNumber = new Map(students.map(student => [Number(student.studentNo.slice(-2)), student]));
  return {
    numbers,
    students: numbers.map(number => studentByNumber.get(number)).filter(Boolean),
  };
};
