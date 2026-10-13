/**
 * 学校期末报告口径（演示数据）
 *
 * 老师手机端的期末报告默认使用平台通用内容；
 * 学校配置了自己的报告口径后，报告按学校要求调整五育维度与展示板块，
 * 个别学生还可以各自配置报告内容（封面标签、五育数据、成长建议、亲子活动指南）。
 */
import type { TermReportSectionId } from '../views/TermReportView';

export interface SchoolReportRadarDimension {
  label: string;
  /** 学期末得分 */
  score: number;
  /** 期初得分 */
  startScore: number;
  /** 班级平均分 */
  classAverageScore: number;
}

export interface StudentTermReportContent {
  /** 封面特质标签 */
  tags?: readonly string[];
  /** 该生的五育雷达图数据，未配置时使用学校维度 */
  dimensions?: readonly SchoolReportRadarDimension[];
  /** 成长建议，未配置时使用平台通用文案 */
  growthAdvice?: string;
  /** 亲子活动指南，未配置时使用平台通用文案 */
  parentActivityGuide?: string;
}

export interface SchoolTermReportProfile {
  schoolId: string;
  /** 本校报告不展示的板块 */
  hiddenSections: readonly TermReportSectionId[];
  /** 学校自己的五育一级维度 */
  radarDimensions: readonly SchoolReportRadarDimension[];
  /** 个别学生的报告内容，未配置的学生沿用平台通用内容 */
  students?: Readonly<Record<string, StudentTermReportContent>>;
}

/**
 * 青禾实验小学：五育一级维度照《成都市花园（国际）小学五育评价指标体系 v3》
 * 的学校育人目标，报告不展示学科成绩分布与高光时刻。
 */
const QINGHE_TERM_REPORT_PROFILE: SchoolTermReportProfile = {
  schoolId: 'school-qinghe',
  hiddenSections: ['subject-results', 'highlights', 'five-education-highlights'],
  radarDimensions: [
    { label: '健康向上', score: 84, startScore: 75, classAverageScore: 80 },
    { label: '乐学善思', score: 88, startScore: 78, classAverageScore: 82 },
    { label: '实践创新', score: 80, startScore: 72, classAverageScore: 77 },
    { label: '自主担当', score: 86, startScore: 77, classAverageScore: 81 },
  ],
  students: {
    '杨悠然': {
      tags: ['心思细腻', '表达流畅', '艺术感知'],
      dimensions: [
        { label: '健康向上', score: 74, startScore: 58, classAverageScore: 80 },
        { label: '乐学善思', score: 94, startScore: 74, classAverageScore: 82 },
        { label: '实践创新', score: 68, startScore: 54, classAverageScore: 78 },
        { label: '自主担当', score: 86, startScore: 68, classAverageScore: 81 },
      ],
      growthAdvice: [
        '<p>这学期你把很多心事写进了随笔，文字里有温度，也有别人不容易写出来的观察。接下来可以在两件事上再往前走一步。</p>',
        '<p><strong>把想法讲出来</strong>：你写得比说得多。课堂讨论时可以给自己一个小目标——每次至少主动说出自己的一个判断，再补上理由。说得越多，你会越发现自己其实讲得很清楚。</p>',
        '<p><strong>让身体跟上来</strong>：跳绳和大课间的练习可以固定成每天十分钟的小任务，完成就在日历上记一笔。身体状态稳了，课堂上的专注也会更稳。</p>',
      ].join(''),
      parentActivityGuide: [
        '<p>寒假里，建议家长陪孩子做两件小事。</p>',
        '<p><strong>家庭朗读时间</strong>：每周挑两个晚上，一家人轮流读一段文章，读后各自说一句最喜欢的句子。孩子的表达欲会在轻松的氛围里自然长出来。</p>',
        '<p><strong>一次展览或一场音乐会</strong>：孩子对色彩和声音很敏感，带她看一次展览或听一场音乐会，回来请她讲讲最喜欢的作品。这比任何说教都更能保护她的审美兴趣。</p>',
      ].join(''),
    },
    '邹艾琳': {
      tags: ['行动力强', '做事有条理', '乐于助人'],
      dimensions: [
        { label: '健康向上', score: 94, startScore: 76, classAverageScore: 80 },
        { label: '乐学善思', score: 72, startScore: 56, classAverageScore: 82 },
        { label: '实践创新', score: 92, startScore: 74, classAverageScore: 78 },
        { label: '自主担当', score: 80, startScore: 64, classAverageScore: 81 },
      ],
      growthAdvice: [
        '<p>你是班上最能“动手”的那一个：实验、手工、值日都做得干净利落，跳绳还带着同学一起练。接下来可以把这份行动力用到两件事上。</p>',
        '<p><strong>给阅读留固定时段</strong>：每天睡前二十分钟课外阅读，读后在本子上写一句最想分享的话。不用写长，但要天天有。</p>',
        '<p><strong>把情绪说清楚</strong>：遇到同伴之间的小摩擦，先说出自己的感受再解决问题，比如“我现在有点着急，因为……”。把情绪说明白，沟通会顺很多。</p>',
      ].join(''),
      parentActivityGuide: [
        '<p>寒假里，建议家长陪孩子做两件小事。</p>',
        '<p><strong>一起做一顿家常菜</strong>：让孩子负责一道菜的完整流程，从择菜到装盘。她做事有条理，给一次“完整负责”的机会，比单独检查作业更有价值。</p>',
        '<p><strong>每天一次户外运动</strong>：跳绳、羽毛球都行，家长陪着一起完成并打卡。运动是她最有成就感的事，固定成家庭日常，习惯就稳了。</p>',
      ].join(''),
    },
    '高奕可': {
      tags: ['识字小达人', '安静专注', '爱读故事'],
      dimensions: [
        { label: '健康向上', score: 80, startScore: 64, classAverageScore: 78 },
        { label: '乐学善思', score: 94, startScore: 72, classAverageScore: 80 },
        { label: '实践创新', score: 70, startScore: 56, classAverageScore: 76 },
        { label: '自主担当', score: 85, startScore: 69, classAverageScore: 79 },
      ],
      growthAdvice: [
        '<p>这学期你认识的生字越来越多，朗读课文时声音清楚，同学们都爱听。下学期可以在两件事上再试一试。</p>',
        '<p><strong>举手说一说</strong>：你已经很会听、很会读，可以给自己定个小目标——每节课至少举一次手，把想到的说出来。说错了也没关系，老师更想听到你的声音。</p>',
        '<p><strong>动手做一做</strong>：剪纸、拼图、科学小实验都可以，做完把作品讲给同伴听。手和脑一起用，你会记得更牢。</p>',
      ].join(''),
      parentActivityGuide: [
        '<p>寒假里，建议家长陪孩子做两件小事。</p>',
        '<p><strong>亲子共读 15 分钟</strong>：每天睡前一起读一个故事，读后请孩子说一句最喜欢的话。刚学会认字的孩子，最需要的是有人认真听她读。</p>',
        '<p><strong>一起整理小书桌</strong>：让孩子自己把书、本子、文具分类摆好，家长只在旁边提醒。小事能自己做完，她上学会更有底气。</p>',
      ].join(''),
    },
    '廖堇汐': {
      tags: ['运动小达人', '热心助人', '动手能干'],
      dimensions: [
        { label: '健康向上', score: 93, startScore: 74, classAverageScore: 78 },
        { label: '乐学善思', score: 71, startScore: 57, classAverageScore: 80 },
        { label: '实践创新', score: 90, startScore: 70, classAverageScore: 76 },
        { label: '自主担当', score: 88, startScore: 70, classAverageScore: 79 },
      ],
      growthAdvice: [
        '<p>你是班上跑得最快、也最爱帮忙的那一个：课间带着同伴跳绳，值日时抢着抬水。下学期把这份劲头分一点给两件事。</p>',
        '<p><strong>每天读十分钟</strong>：挑一本自己喜欢的绘本，睡前读十分钟，读后在本子上画一画、写一句话。坚持下来，认字会越来越快。</p>',
        '<p><strong>先听完再开口</strong>：和同伴说话时，先听完对方一句，再说自己的。你会被更多人喜欢，也少一些误会。</p>',
      ].join(''),
      parentActivityGuide: [
        '<p>寒假里，建议家长陪孩子做两件小事。</p>',
        '<p><strong>每天一次户外活动</strong>：跳绳、拍球、骑车都行，家长陪着一起完成并记录。运动是她最喜欢的事，坚持下来开学后体质会更好。</p>',
        '<p><strong>请她当一次小帮手</strong>：择菜、摆碗筷、给花浇水，做完请她说一说“我是怎么做的”，让动手能力变成会表达的自信。</p>',
      ].join(''),
    },
  },
};

const SCHOOL_TERM_REPORT_PROFILES: Record<string, SchoolTermReportProfile> = {
  'school-qinghe': QINGHE_TERM_REPORT_PROFILE,
};

export const getSchoolTermReportProfile = (schoolId: string): SchoolTermReportProfile | undefined => (
  SCHOOL_TERM_REPORT_PROFILES[schoolId]
);

export const getSchoolStudentReportContent = (schoolId: string, studentName: string): StudentTermReportContent | undefined => (
  SCHOOL_TERM_REPORT_PROFILES[schoolId]?.students?.[studentName]
);
