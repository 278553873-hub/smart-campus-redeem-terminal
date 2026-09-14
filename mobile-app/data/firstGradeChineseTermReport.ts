import type { DetailedReportSection } from '../types';
import type { StudentEvaluationRecord } from '../views/student-evaluation/types';

export interface SubjectRubricRating {
  label: string;
  stars: number;
  fullStars: number;
}

export interface SubjectTermReportPromptInput {
  subject: string;
  grade: string;
  term: string;
  rubricRatings: SubjectRubricRating[];
  dailyEvaluationRecords: StudentEvaluationRecord[];
}

export interface GeneratedSubjectReportSection extends DetailedReportSection {
  evidenceRecordIds: string[];
}

export const FIRST_GRADE_CHINESE_TERM_REPORT_PROMPT_INPUT: SubjectTermReportPromptInput = {
  subject: '语文',
  grade: '一年级',
  term: '2025-2026学年下学期',
  rubricRatings: [
    { label: '课堂小明星', stars: 4, fullStars: 5 },
    { label: '识字小达人', stars: 5, fullStars: 5 },
    { label: '小小书法家', stars: 4, fullStars: 5 },
    { label: '朗读小明星', stars: 4, fullStars: 5 },
    { label: '自信小话家', stars: 4, fullStars: 5 },
  ],
  dailyEvaluationRecords: [
    {
      id: 'chinese-record-01',
      evaluation_date: '2026-02-27',
      indicatorPath: ['语文综合素质评价', '课堂小明星', '坐姿、倾听、专注度'],
      scoreChange: 1,
      isBad: false,
      description: '语文课上坐姿端正，能持续倾听同伴发言，并在交流时看向发言者。',
      aiComment: '倾听习惯稳定，能够尊重并关注同伴的表达。',
      teacherId: 'teacher-zhou-chinese',
      teacherName: '语文周老师',
    },
    {
      id: 'chinese-record-02',
      evaluation_date: '2026-03-13',
      indicatorPath: ['语文综合素质评价', '课堂小明星', '发言积极'],
      scoreChange: 1,
      isBad: false,
      description: '学习《姓氏歌》时连续两次主动举手，并用完整句子补充了自己的发现。',
      aiComment: '课堂表达积极，能够围绕学习内容说清自己的发现。',
      teacherId: 'teacher-zhou-chinese',
      teacherName: '语文周老师',
    },
    {
      id: 'chinese-record-03',
      evaluation_date: '2026-03-26',
      indicatorPath: ['语文综合素质评价', '识字小达人', '会用多种方法灵活识字'],
      scoreChange: 1,
      isBad: false,
      description: '在校园识字活动中主动认出“图书角”和“安全出口”，并用偏旁和生活场景说明识字方法。',
      aiComment: '能够主动联系生活识字，并清楚说明自己的识字方法。',
      teacherId: 'teacher-zhou-chinese',
      teacherName: '语文周老师',
    },
    {
      id: 'chinese-record-04',
      evaluation_date: '2026-04-17',
      indicatorPath: ['语文综合素质评价', '小小书法家', '结构恰当'],
      scoreChange: -1,
      isBad: true,
      description: '书写“春、看”时上下结构偏松，修改前没有先观察字在田字格中的位置。',
      aiComment: '下笔前先观察结构和占格，书写会更加匀称。',
      teacherId: 'teacher-zhou-chinese',
      teacherName: '语文周老师',
    },
    {
      id: 'chinese-record-05',
      evaluation_date: '2026-05-08',
      indicatorPath: ['语文综合素质评价', '课堂小明星', '及时改错'],
      scoreChange: 1,
      isBad: false,
      description: '订正生字作业时能主动对照范字检查，把结构偏松的字重新写得更加匀称。',
      aiComment: '能够根据反馈主动订正，书写结构比上一次更稳定。',
      teacherId: 'teacher-zhou-chinese',
      teacherName: '语文周老师',
    },
    {
      id: 'chinese-record-06',
      evaluation_date: '2026-05-22',
      indicatorPath: ['语文综合素质评价', '朗读小明星', '正确、流利、有感情地朗读课文'],
      scoreChange: -1,
      isBad: true,
      description: '朗读《树和喜鹊》时字音准确，但语速偏快，人物心情的变化还没有通过停顿和语气表现出来。',
      aiComment: '准确度已经很好，放慢语速并关注停顿，会让朗读更有感染力。',
      teacherId: 'teacher-zhou-chinese',
      teacherName: '语文周老师',
    },
    {
      id: 'chinese-record-07',
      evaluation_date: '2026-06-12',
      indicatorPath: ['语文综合素质评价', '自信小话家', '使用普通话自信、流畅、大方表达'],
      scoreChange: 1,
      isBad: false,
      description: '口语交际活动中能用普通话完整介绍游戏规则，在老师鼓励后提高音量并完成全班分享。',
      aiComment: '表达内容完整，继续练习自然大方地面向大家说话。',
      teacherId: 'teacher-zhou-chinese',
      teacherName: '语文周老师',
    },
  ],
};

export const FIRST_GRADE_CHINESE_RUBRIC_DIMENSIONS = FIRST_GRADE_CHINESE_TERM_REPORT_PROMPT_INPUT.rubricRatings.map(rating => ({
  label: rating.label,
  score: rating.stars,
  fullScore: rating.fullStars,
}));

export const FIRST_GRADE_CHINESE_GENERATED_REPORT: GeneratedSubjectReportSection[] = [
  {
    title: '学科评价',
    content: '翻看你这一学期的语文记录，老师很欣慰地发现，你已经能安静倾听同伴、主动举手分享，也会把课堂上学到的识字方法带进校园生活。期末的4星背后，是你一次次认真参与、听取提醒并愿意改进的积累，这份踏实的进步很珍贵。',
    evidenceRecordIds: ['chinese-record-01', 'chinese-record-02', 'chinese-record-03', 'chinese-record-04', 'chinese-record-05', 'chinese-record-06', 'chinese-record-07'],
  },
  {
    title: '表现亮点',
    content: '校园里遇到“图书角”和“安全出口”时，你不只认出了这些字，还能说出自己怎样借助偏旁和生活场景来识字。老师欣赏的，正是这份细心观察、主动联想和乐于表达的习惯；它会帮助你在今后的语文学习中，发现更多文字里的线索和趣味。',
    evidenceRecordIds: ['chinese-record-01', 'chinese-record-02', 'chinese-record-03', 'chinese-record-04', 'chinese-record-05'],
  },
  {
    title: '提升建议',
    content: '朗读时，你的字音已经很准确，只是语速一快，人物的心情就容易悄悄溜走。不妨每天挑一小段喜欢的文字，先慢慢读一遍，再读给家人听，请他们说说听出了什么心情。这样的小练习，会让你的声音更有故事感，也会让你站到大家面前时越来越从容。',
    evidenceRecordIds: ['chinese-record-06', 'chinese-record-07'],
  },
];
