export type LeaderReportPeriod = 'today' | 'week' | 'month' | 'term';

export interface LeaderReportTeacherUsage {
  id: string;
  name: string;
  records: number;
  coveredStudents: number;
  lastUsedAt: string;
}

export interface LeaderReportClassCoverage {
  id: string;
  name: string;
  covered: number;
  total: number;
}

export interface LeaderReportGradeCoverage {
  id: string;
  name: string;
  shortName: string;
  covered: number;
  total: number;
  classes: LeaderReportClassCoverage[];
}

export interface LeaderReportInputSource {
  type: 'text' | 'voice' | 'file';
  name: string;
  percent: number;
}

export interface LeaderReportFiveEducationStat {
  key: 'virtue' | 'wisdom' | 'fitness' | 'aesthetic' | 'labor';
  name: string;
  plusScore: number;
  minusScore: number;
  netScore: number;
  score: number;
  positiveEventCount: number;
  negativeEventCount: number;
  eventCount: number;
}

export interface LeaderReportTeacherScoreSummary {
  teacherId: string;
  teacherName: string;
  plusScore: number;
  minusScore: number;
  netScore: number;
}

export interface LeaderReportIndicatorThirdUsage {
  id: string;
  name: string;
  weekCount: number;
  monthCount: number;
  termCount: number;
}

export interface LeaderReportIndicatorSecondUsage {
  id: string;
  name: string;
  children: LeaderReportIndicatorThirdUsage[];
}

export interface LeaderReportIndicatorGroupUsage {
  id: LeaderReportFiveEducationStat['key'];
  name: string;
  children: LeaderReportIndicatorSecondUsage[];
}

export interface LeaderReportSnapshot {
  period: LeaderReportPeriod;
  teachers: LeaderReportTeacherUsage[];
  activeRanking: LeaderReportTeacherUsage[];
  lowRanking: LeaderReportTeacherUsage[];
  gradeCoverages: LeaderReportGradeCoverage[];
  inputSources: LeaderReportInputSource[];
  fiveEducationStats: LeaderReportFiveEducationStat[];
  teacherScoreSummaries: LeaderReportTeacherScoreSummary[];
  indicatorUsage: LeaderReportIndicatorGroupUsage[];
  summary: {
    activeTeachers: number;
    totalTeachers: number;
    totalRecords: number;
    totalCoveredStudents: number;
    totalStudents: number;
    teacherPercent: number;
    studentPercent: number;
  };
}

export const leaderReportPeriods: { key: LeaderReportPeriod; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'term', label: '本学期' },
];

const demoPeriodScale: Record<LeaderReportPeriod, number> = {
  today: 0.18,
  week: 1,
  month: 2.8,
  term: 7.6,
};

const toSafeNumber = (value: number) => Number.isFinite(value) ? value : 0;
const toSafeCount = (value: number) => Math.max(0, Math.round(toSafeNumber(value)));
const toSafeScore = (value: number) => Math.round(toSafeNumber(value));

export const rate = (value: number, total: number) => {
  const safeTotal = toSafeCount(total);
  if (safeTotal === 0) return 0;
  return Math.round((toSafeCount(value) / safeTotal) * 100);
};

const demoTeacherUsageBase: LeaderReportTeacherUsage[] = [
  { id: 't1', name: '周老师', records: 38, coveredStudents: 94, lastUsedAt: '今天 09:40' },
  { id: 't2', name: '林老师', records: 31, coveredStudents: 86, lastUsedAt: '昨天 16:20' },
  { id: 't3', name: '陈老师', records: 26, coveredStudents: 79, lastUsedAt: '昨天 14:10' },
  { id: 't4', name: '赵老师', records: 24, coveredStudents: 73, lastUsedAt: '今天 08:55' },
  { id: 't5', name: '刘老师', records: 21, coveredStudents: 68, lastUsedAt: '昨天 17:05' },
  { id: 't6', name: '黄老师', records: 18, coveredStudents: 62, lastUsedAt: '2天前' },
  { id: 't7', name: '吴老师', records: 16, coveredStudents: 57, lastUsedAt: '2天前' },
  { id: 't8', name: '何老师', records: 14, coveredStudents: 53, lastUsedAt: '3天前' },
  { id: 't9', name: '马老师', records: 12, coveredStudents: 41, lastUsedAt: '3天前' },
  { id: 't10', name: '郑老师', records: 10, coveredStudents: 36, lastUsedAt: '4天前' },
  { id: 't11', name: '王老师', records: 6, coveredStudents: 18, lastUsedAt: '4天前' },
  { id: 't12', name: '孙老师', records: 5, coveredStudents: 15, lastUsedAt: '5天前' },
  { id: 't13', name: '冯老师', records: 3, coveredStudents: 9, lastUsedAt: '7天前' },
  { id: 't14', name: '许老师', records: 2, coveredStudents: 7, lastUsedAt: '9天前' },
  { id: 't15', name: '高老师', records: 1, coveredStudents: 4, lastUsedAt: '12天前' },
  { id: 't16', name: '孙主任', records: 0, coveredStudents: 0, lastUsedAt: '未使用' },
];

const demoGradeCoverages: LeaderReportGradeCoverage[] = [
  {
    id: 'g1', name: '一年级', shortName: '一', covered: 118, total: 136,
    classes: [
      { id: 'g1c1', name: '一年级1班', covered: 39, total: 45 },
      { id: 'g1c2', name: '一年级2班', covered: 42, total: 46 },
      { id: 'g1c3', name: '一年级3班', covered: 37, total: 45 },
    ],
  },
  {
    id: 'g2', name: '二年级', shortName: '二', covered: 106, total: 128,
    classes: [
      { id: 'g2c1', name: '二年级1班', covered: 36, total: 42 },
      { id: 'g2c2', name: '二年级2班', covered: 31, total: 43 },
      { id: 'g2c3', name: '二年级3班', covered: 39, total: 43 },
    ],
  },
  {
    id: 'g3', name: '三年级', shortName: '三', covered: 315, total: 450,
    classes: [
      { id: 'g3c1', name: '三年级1班', covered: 31, total: 38 },
      { id: 'g3c2', name: '三年级2班', covered: 24, total: 39 },
      { id: 'g3c3', name: '三年级3班', covered: 36, total: 40 },
      { id: 'g3c4', name: '三年级4班', covered: 22, total: 37 },
      { id: 'g3c5', name: '三年级5班', covered: 29, total: 38 },
      { id: 'g3c6', name: '三年级6班', covered: 27, total: 39 },
      { id: 'g3c7', name: '三年级7班', covered: 35, total: 41 },
      { id: 'g3c8', name: '三年级8班', covered: 20, total: 36 },
      { id: 'g3c9', name: '三年级9班', covered: 26, total: 38 },
      { id: 'g3c10', name: '三年级10班', covered: 28, total: 37 },
      { id: 'g3c11', name: '三年级11班', covered: 33, total: 39 },
      { id: 'g3c12', name: '三年级12班', covered: 34, total: 48 },
    ],
  },
  {
    id: 'g4', name: '四年级', shortName: '四', covered: 94, total: 130,
    classes: [
      { id: 'g4c1', name: '四年级1班', covered: 29, total: 43 },
      { id: 'g4c2', name: '四年级2班', covered: 30, total: 44 },
      { id: 'g4c3', name: '四年级3班', covered: 35, total: 43 },
    ],
  },
  {
    id: 'g5', name: '五年级', shortName: '五', covered: 396, total: 468,
    classes: [
      { id: 'g5c1', name: '五年级1班', covered: 33, total: 39 },
      { id: 'g5c2', name: '五年级2班', covered: 30, total: 40 },
      { id: 'g5c3', name: '五年级3班', covered: 36, total: 39 },
      { id: 'g5c4', name: '五年级4班', covered: 32, total: 38 },
      { id: 'g5c5', name: '五年级5班', covered: 34, total: 40 },
      { id: 'g5c6', name: '五年级6班', covered: 29, total: 39 },
      { id: 'g5c7', name: '五年级7班', covered: 37, total: 41 },
      { id: 'g5c8', name: '五年级8班', covered: 31, total: 38 },
      { id: 'g5c9', name: '五年级9班', covered: 35, total: 40 },
      { id: 'g5c10', name: '五年级10班', covered: 28, total: 37 },
      { id: 'g5c11', name: '五年级11班', covered: 36, total: 39 },
      { id: 'g5c12', name: '五年级12班', covered: 35, total: 38 },
    ],
  },
  {
    id: 'g6', name: '六年级', shortName: '六', covered: 111, total: 126,
    classes: [
      { id: 'g6c1', name: '六年级1班', covered: 38, total: 42 },
      { id: 'g6c2', name: '六年级2班', covered: 35, total: 42 },
      { id: 'g6c3', name: '六年级3班', covered: 38, total: 42 },
    ],
  },
];

const demoInputSources: LeaderReportInputSource[] = [
  { type: 'text', name: '文字', percent: 48 },
  { type: 'voice', name: '语音', percent: 35 },
  { type: 'file', name: '图片/文件', percent: 17 },
];

const demoFiveEducationStats: LeaderReportFiveEducationStat[] = [
  { key: 'virtue', name: '育德', plusScore: 18, minusScore: 26, netScore: -8, score: -8, positiveEventCount: 2, negativeEventCount: 2, eventCount: 4 },
  { key: 'wisdom', name: '慧智', plusScore: 48, minusScore: 12, netScore: 36, score: 36, positiveEventCount: 16, negativeEventCount: 4, eventCount: 20 },
  { key: 'fitness', name: '强体', plusScore: 92, minusScore: 6, netScore: 86, score: 86, positiveEventCount: 42, negativeEventCount: 3, eventCount: 45 },
  { key: 'aesthetic', name: '润美', plusScore: 8, minusScore: 8, netScore: 0, score: 0, positiveEventCount: 1, negativeEventCount: 1, eventCount: 2 },
  { key: 'labor', name: '健劳', plusScore: 16, minusScore: 12, netScore: 4, score: 4, positiveEventCount: 1, negativeEventCount: 1, eventCount: 2 },
];

const demoTeacherScoreSummaries: LeaderReportTeacherScoreSummary[] = [
  { teacherId: 't1', teacherName: '周老师', plusScore: 128, minusScore: 12, netScore: 116 },
  { teacherId: 't2', teacherName: '林老师', plusScore: 96, minusScore: 8, netScore: 88 },
  { teacherId: 't3', teacherName: '陈老师', plusScore: 74, minusScore: 20, netScore: 54 },
  { teacherId: 't4', teacherName: '赵老师', plusScore: 82, minusScore: 36, netScore: 46 },
  { teacherId: 't5', teacherName: '刘老师', plusScore: 68, minusScore: 18, netScore: 50 },
  { teacherId: 't6', teacherName: '黄老师', plusScore: 55, minusScore: 22, netScore: 33 },
  { teacherId: 't7', teacherName: '吴老师', plusScore: 44, minusScore: 7, netScore: 37 },
  { teacherId: 't8', teacherName: '何老师', plusScore: 39, minusScore: 26, netScore: 13 },
  { teacherId: 't9', teacherName: '马老师', plusScore: 36, minusScore: 40, netScore: -4 },
  { teacherId: 't10', teacherName: '郑老师', plusScore: 30, minusScore: 12, netScore: 18 },
  { teacherId: 't11', teacherName: '王老师', plusScore: 24, minusScore: 29, netScore: -5 },
  { teacherId: 't12', teacherName: '孙老师', plusScore: 21, minusScore: 6, netScore: 15 },
  { teacherId: 't13', teacherName: '冯老师', plusScore: 16, minusScore: 18, netScore: -2 },
  { teacherId: 't14', teacherName: '许老师', plusScore: 12, minusScore: 3, netScore: 9 },
  { teacherId: 't15', teacherName: '高老师', plusScore: 8, minusScore: 11, netScore: -3 },
  { teacherId: 't16', teacherName: '孙主任', plusScore: 2, minusScore: 0, netScore: 2 },
];

const demoIndicatorUsage: LeaderReportIndicatorGroupUsage[] = [
  {
    id: 'virtue', name: '明礼',
    children: [
      { id: 'virtue-civil', name: '文明守纪', children: [
        { id: 'virtue-civil-politeness', name: '文明礼貌', weekCount: 8, monthCount: 26, termCount: 82 },
        { id: 'virtue-civil-discipline', name: '遵守纪律', weekCount: 14, monthCount: 48, termCount: 156 },
      ] },
      { id: 'virtue-honesty', name: '诚信自律', children: [
        { id: 'virtue-honesty-trust', name: '诚实守信', weekCount: 4, monthCount: 14, termCount: 42 },
        { id: 'virtue-honesty-self', name: '自律自省', weekCount: 2, monthCount: 7, termCount: 18 },
      ] },
      { id: 'virtue-truth', name: '守正求是', children: [
        { id: 'virtue-truth-cultivate', name: '守正修身', weekCount: 1, monthCount: 4, termCount: 9 },
        { id: 'virtue-truth-factual', name: '实事求是', weekCount: 0, monthCount: 1, termCount: 2 },
      ] },
      { id: 'virtue-country', name: '家国情怀', children: [
        { id: 'virtue-country-school', name: '爱国爱校', weekCount: 1, monthCount: 5, termCount: 16 },
        { id: 'virtue-country-duty', name: '社会责任', weekCount: 0, monthCount: 2, termCount: 8 },
      ] },
    ],
  },
  {
    id: 'wisdom', name: '求知',
    children: [
      { id: 'wisdom-will', name: '砺志笃行', children: [
        { id: 'wisdom-will-heart', name: '砺志坚心', weekCount: 2, monthCount: 8, termCount: 21 },
        { id: 'wisdom-will-persist', name: '持之以恒', weekCount: 5, monthCount: 18, termCount: 52 },
      ] },
      { id: 'wisdom-study', name: '勤奋治学', children: [
        { id: 'wisdom-study-learn', name: '勤奋学习', weekCount: 15, monthCount: 54, termCount: 170 },
        { id: 'wisdom-study-homework', name: '认真作业', weekCount: 18, monthCount: 61, termCount: 188 },
      ] },
      { id: 'wisdom-careful', name: '谨慎求真', children: [
        { id: 'wisdom-careful-ask', name: '虚心求教', weekCount: 6, monthCount: 20, termCount: 58 },
        { id: 'wisdom-careful-think', name: '细心思考', weekCount: 9, monthCount: 32, termCount: 96 },
      ] },
      { id: 'wisdom-create', name: '进取拓新', children: [
        { id: 'wisdom-create-try', name: '探索尝试', weekCount: 3, monthCount: 11, termCount: 30 },
        { id: 'wisdom-create-hard', name: '挑战难题', weekCount: 1, monthCount: 3, termCount: 7 },
      ] },
    ],
  },
  {
    id: 'fitness', name: '健体',
    children: [
      { id: 'fitness-habit', name: '运动习惯', children: [
        { id: 'fitness-habit-class', name: '课内锻炼', weekCount: 10, monthCount: 36, termCount: 112 },
        { id: 'fitness-habit-after', name: '课外运动', weekCount: 4, monthCount: 15, termCount: 44 },
      ] },
      { id: 'fitness-health', name: '身心健康', children: [
        { id: 'fitness-health-strong', name: '身体强健', weekCount: 3, monthCount: 13, termCount: 38 },
        { id: 'fitness-health-sunshine', name: '积极乐观', weekCount: 5, monthCount: 16, termCount: 49 },
      ] },
      { id: 'fitness-spirit', name: '竞赛精神', children: [
        { id: 'fitness-spirit-fight', name: '顽强拼搏', weekCount: 1, monthCount: 4, termCount: 11 },
        { id: 'fitness-spirit-fair', name: '公平比赛', weekCount: 0, monthCount: 0, termCount: 3 },
      ] },
    ],
  },
  {
    id: 'aesthetic', name: '尚美',
    children: [
      { id: 'aesthetic-sense', name: '审美感知', children: [
        { id: 'aesthetic-sense-find', name: '发现美好', weekCount: 2, monthCount: 8, termCount: 22 },
        { id: 'aesthetic-sense-express', name: '表达美好', weekCount: 1, monthCount: 5, termCount: 13 },
      ] },
      { id: 'aesthetic-art', name: '艺术实践', children: [
        { id: 'aesthetic-art-create', name: '作品创作', weekCount: 1, monthCount: 4, termCount: 15 },
        { id: 'aesthetic-art-stage', name: '舞台呈现', weekCount: 0, monthCount: 1, termCount: 4 },
      ] },
      { id: 'aesthetic-culture', name: '文化浸润', children: [
        { id: 'aesthetic-culture-tradition', name: '传统文化', weekCount: 0, monthCount: 2, termCount: 8 },
        { id: 'aesthetic-culture-school', name: '学校特色', weekCount: 0, monthCount: 0, termCount: 0 },
      ] },
    ],
  },
  {
    id: 'labor', name: '劳行',
    children: [
      { id: 'labor-life', name: '个人生活', children: [
        { id: 'labor-life-hygiene', name: '卫生习惯', weekCount: 4, monthCount: 16, termCount: 47 },
        { id: 'labor-life-tidy', name: '整理内务', weekCount: 2, monthCount: 7, termCount: 18 },
        { id: 'labor-life-housework', name: '分担家务', weekCount: 0, monthCount: 2, termCount: 6 },
      ] },
      { id: 'labor-campus', name: '校园责任', children: [
        { id: 'labor-campus-duty', name: '认真值日', weekCount: 5, monthCount: 19, termCount: 58 },
        { id: 'labor-campus-service', name: '校园服务', weekCount: 1, monthCount: 4, termCount: 12 },
      ] },
      { id: 'labor-practice', name: '劳动实践', children: [
        { id: 'labor-practice-outside', name: '校外活动', weekCount: 0, monthCount: 0, termCount: 0 },
        { id: 'labor-practice-apply', name: '活学活用', weekCount: 1, monthCount: 3, termCount: 9 },
      ] },
    ],
  },
];

const scaleDemoTeacher = (teacher: LeaderReportTeacherUsage, scale: number): LeaderReportTeacherUsage => {
  if (scale === 1) return teacher;
  const records = Math.max(teacher.records === 0 ? 0 : 1, Math.round(teacher.records * scale));
  const coveredStudents = Math.min(620, Math.round(teacher.coveredStudents * Math.sqrt(scale)));
  return {
    ...teacher,
    records,
    coveredStudents,
    lastUsedAt: scale < 0.3 && teacher.records < 10 ? '今日未使用' : teacher.lastUsedAt,
  };
};

const normalizeInputSources = (sources: LeaderReportInputSource[]) => {
  const total = sources.reduce((sum, source) => sum + toSafeCount(source.percent), 0);
  if (total === 0) return sources.map(source => ({ ...source, percent: 0 }));
  return sources.map(source => ({ ...source, percent: Math.round((toSafeCount(source.percent) / total) * 100) }));
};

const normalizeIndicatorUsage = (groups: LeaderReportIndicatorGroupUsage[]): LeaderReportIndicatorGroupUsage[] => groups.map(group => ({
  ...group,
  children: group.children.map(second => ({
    ...second,
    children: second.children.map(third => ({
      ...third,
      weekCount: toSafeCount(third.weekCount),
      monthCount: toSafeCount(third.monthCount),
      termCount: toSafeCount(third.termCount),
    })),
  })),
}));

export const createLeaderReportSnapshot = ({
  period,
  teachers,
  gradeCoverages,
  inputSources,
  fiveEducationStats,
  teacherScoreSummaries,
  indicatorUsage = demoIndicatorUsage,
}: {
  period: LeaderReportPeriod;
  teachers: LeaderReportTeacherUsage[];
  gradeCoverages: LeaderReportGradeCoverage[];
  inputSources: LeaderReportInputSource[];
  fiveEducationStats: LeaderReportFiveEducationStat[];
  teacherScoreSummaries: LeaderReportTeacherScoreSummary[];
  indicatorUsage?: LeaderReportIndicatorGroupUsage[];
}): LeaderReportSnapshot => {
  const normalizedTeachers = teachers.map(teacher => ({
    ...teacher,
    records: toSafeCount(teacher.records),
    coveredStudents: toSafeCount(teacher.coveredStudents),
  }));
  const normalizedGrades = gradeCoverages.map(grade => ({
    ...grade,
    covered: Math.min(toSafeCount(grade.covered), toSafeCount(grade.total)),
    total: toSafeCount(grade.total),
    classes: grade.classes.map(item => ({
      ...item,
      covered: Math.min(toSafeCount(item.covered), toSafeCount(item.total)),
      total: toSafeCount(item.total),
    })),
  }));
  const normalizedFiveEducationStats = fiveEducationStats.map(item => {
    const plusScore = toSafeCount(item.plusScore);
    const minusScore = toSafeCount(item.minusScore);
    const netScore = toSafeScore(item.netScore ?? plusScore - minusScore);
    const positiveEventCount = toSafeCount(item.positiveEventCount);
    const negativeEventCount = toSafeCount(item.negativeEventCount);
    return {
      ...item,
      plusScore,
      minusScore,
      netScore,
      score: toSafeScore(item.score ?? netScore),
      positiveEventCount,
      negativeEventCount,
      eventCount: positiveEventCount + negativeEventCount,
    };
  });
  const normalizedTeacherScoreSummaries = teacherScoreSummaries.map(item => {
    const plusScore = toSafeCount(item.plusScore);
    const minusScore = toSafeCount(item.minusScore);
    return {
      ...item,
      plusScore,
      minusScore,
      netScore: toSafeScore(item.netScore ?? plusScore - minusScore),
    };
  });
  const activeRanking = [...normalizedTeachers].sort((a, b) => b.records - a.records || b.coveredStudents - a.coveredStudents);
  const lowRanking = [...normalizedTeachers].sort((a, b) => a.records - b.records || a.coveredStudents - b.coveredStudents);
  const activeTeachers = normalizedTeachers.filter(teacher => teacher.records > 0).length;
  const totalTeachers = normalizedTeachers.length;
  const totalRecords = normalizedTeachers.reduce((sum, teacher) => sum + teacher.records, 0);
  const totalCoveredStudents = normalizedGrades.reduce((sum, grade) => sum + grade.covered, 0);
  const totalStudents = normalizedGrades.reduce((sum, grade) => sum + grade.total, 0);

  return {
    period,
    teachers: normalizedTeachers,
    activeRanking,
    lowRanking,
    gradeCoverages: normalizedGrades,
    inputSources: normalizeInputSources(inputSources),
    fiveEducationStats: normalizedFiveEducationStats,
    teacherScoreSummaries: normalizedTeacherScoreSummaries,
    indicatorUsage: normalizeIndicatorUsage(indicatorUsage),
    summary: {
      activeTeachers,
      totalTeachers,
      totalRecords,
      totalCoveredStudents,
      totalStudents,
      teacherPercent: rate(activeTeachers, totalTeachers),
      studentPercent: rate(totalCoveredStudents, totalStudents),
    },
  };
};

export const getLeaderReportSnapshot = async (period: LeaderReportPeriod) => {
  // 后续接入真实后端时，只需要在这里替换为 fetch/API client，并继续返回 LeaderReportSnapshot。
  const scale = demoPeriodScale[period];
  return createLeaderReportSnapshot({
    period,
    teachers: demoTeacherUsageBase.map(teacher => scaleDemoTeacher(teacher, scale)),
    gradeCoverages: demoGradeCoverages,
    inputSources: demoInputSources,
    fiveEducationStats: demoFiveEducationStats.map(item => {
      const plusScore = Math.round(item.plusScore * scale);
      const minusScore = Math.round(item.minusScore * scale);
      const netScore = plusScore - minusScore;
      const positiveEventCount = Math.round(item.positiveEventCount * scale);
      const negativeEventCount = Math.round(item.negativeEventCount * scale);
      return {
        ...item,
        plusScore,
        minusScore,
        netScore,
        score: netScore,
        positiveEventCount,
        negativeEventCount,
        eventCount: positiveEventCount + negativeEventCount,
      };
    }),
    teacherScoreSummaries: demoTeacherScoreSummaries.map(item => {
      const plusScore = Math.round(item.plusScore * scale);
      const minusScore = Math.round(item.minusScore * scale);
      return {
        ...item,
        plusScore,
        minusScore,
        netScore: plusScore - minusScore,
      };
    }),
    indicatorUsage: demoIndicatorUsage,
  });
};
