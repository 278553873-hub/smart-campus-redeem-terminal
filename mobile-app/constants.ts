import { Student, ScoreItem, SubjectGrade, GrowthReportItem, DetailedReportSection, ClassInfo } from './types';
import { ASSETS } from './assets/images';

const GENERATE_MOCK_CLASSES = (): ClassInfo[] => {
  const grades = [
    { year: 2025, level: '一年级' },
    { year: 2024, level: '二年级' },
    { year: 2023, level: '三年级' },
    { year: 2022, level: '四年级' },
    { year: 2021, level: '五年级' },
    { year: 2020, level: '六年级' },
  ];
  const classes: ClassInfo[] = [];
  const classNames = ['一班', '二班', '三班', '四班', '五班'];

  grades.forEach(g => {
    classNames.forEach((name, idx) => {
      const id = `c_${g.year}_${idx + 1}`;
      classes.push({
        id,
        name: `${g.year}级${name}`,
        gradeLevel: g.level,
        studentCount: Math.floor(35 + Math.random() * 10),
        tags: idx === 0 ? ['班主任', '数学', '劳动'] : (idx % 2 === 0 ? ['数学'] : ['劳动'])
      });
    });
  });
  return classes;
};

export const MOCK_CLASSES: ClassInfo[] = GENERATE_MOCK_CLASSES();

const REALISTIC_NAMES = [
  { n: '刘新宇', g: 'male' },
  { n: '张子轩', g: 'male' }, { n: '王梓涵', g: 'female' }, { n: '李欣怡', g: 'female' }, { n: '刘浩宇', g: 'male' },
  { n: '陈思睿', g: 'male' }, { n: '杨一诺', g: 'female' }, { n: '赵宇轩', g: 'male' }, { n: '黄子墨', g: 'male' },
  { n: '周雨桐', g: 'female' }, { n: '吴佳泽', g: 'male' }, { n: '徐心怡', g: 'female' }, { n: '孙浩然', g: 'male' },
  { n: '胡梓萱', g: 'female' }, { n: '朱宇航', g: 'male' }, { n: '高俊杰', g: 'male' }, { n: '林诗涵', g: 'female' },
  { n: '何子涵', g: 'female' }, { n: '郭博文', g: 'male' }, { n: '马铭泽', g: 'male' }, { n: '罗依诺', g: 'female' },
  { n: '梁皓轩', g: 'male' }, { n: '宋雨泽', g: 'male' }, { n: '郑若曦', g: 'female' }, { n: '谢子萱', g: 'female' },
  { n: '韩宇辰', g: 'male' }, { n: '唐欣妍', g: 'female' }, { n: '冯子墨', g: 'male' }, { n: '于思涵', g: 'female' },
  { n: '董浩宇', g: 'male' }, { n: '萧萧', g: 'female' }, { n: '程子睿', g: 'male' }, { n: '曹梦瑶', g: 'female' },
  { n: '袁致远', g: 'male' }, { n: '邓诗琪', g: 'female' }, { n: '许皓', g: 'male' }, { n: '傅语嫣', g: 'female' },
  { n: '沈煜祺', g: 'male' }, { n: '曾子瑶', g: 'female' }, { n: '彭云天', g: 'male' }, { n: '欧阳慕晴', g: 'female' }
];

// 基础姓名池用于生成学生
const BASE_REALISTIC_NAMES = [
  ...REALISTIC_NAMES,
  { n: '李明', g: 'male' }, { n: '张伟', g: 'male' }, { n: '王刚', g: 'male' }, { n: '李丽', g: 'female' },
  { n: '陈晨', g: 'female' }, { n: '刘方', g: 'male' }, { n: '赵敏', g: 'female' }, { n: '孙权', g: 'male' },
  { n: '周瑜', g: 'male' }, { n: '诸葛亮', g: 'male' }, { n: '黄蓉', g: 'female' }, { n: '郭靖', g: 'male' },
  { n: '杨过', g: 'male' }, { n: '小龙女', g: 'female' }, { n: '张无忌', g: 'male' }, { n: '韦小宝', g: 'male' },
];

export const GET_MOCK_STUDENTS_FOR_CLASS = (classId: string): Student[] => {
  const cls = MOCK_CLASSES.find(c => c.id === classId);
  if (!cls) return [];

  const count = cls.studentCount;
  // Use a simple hash of classId to pick names consistently
  const seed = classId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return Array.from({ length: count }).map((_, i) => {
    const nameObj = BASE_REALISTIC_NAMES[(seed + i) % BASE_REALISTIC_NAMES.length];

    // Roughly 1 in 5 students lack a face setup (meaning they use the generic default avatar)
    const isMissingFace = (i % 6) === 2;

    return {
      id: `${cls.id.replace('c_', '').replace('_', '')}${(i + 1).toString().padStart(2, '0')}`,
      name: nameObj.n,
      gender: nameObj.g as 'male' | 'female',
      grade: cls.gradeLevel,
      class: cls.name,
      avatar: isMissingFace
        ? (nameObj.g === 'male' ? ASSETS.AVATAR.GENERIC_BOY : ASSETS.AVATAR.GENERIC_GIRL)
        : (nameObj.g === 'male'
          ? ASSETS.AVATAR.BOYS[(seed + i) % ASSETS.AVATAR.BOYS.length]
          : ASSETS.AVATAR.GIRLS[(seed + i) % ASSETS.AVATAR.GIRLS.length]),
    };
  });
};

export const MOCK_STUDENTS_CLASS_1: Student[] = GET_MOCK_STUDENTS_FOR_CLASS(MOCK_CLASSES[0]?.id || 'c_2025_1');

export const MOCK_SCORES: ScoreItem[] = [
  { label: '德育', score: 75, category: 'moral' },
  { label: '智育', score: 73, category: 'intellectual' },
  { label: '体育', score: 60, category: 'physical' },
  { label: '美育', score: 68, category: 'aesthetic' },
  { label: '劳育', score: 60, category: 'labor' },
  { label: '创造', score: 0, category: 'creativity' },
];

// Updated to include all required subjects from the latest design
export const MOCK_SUBJECTS: SubjectGrade[] = [
  { subject: '语文', grade: '优', hasReport: true },
  { subject: '数学', grade: '优', hasReport: true },
  { subject: '英语', grade: '优', hasReport: true },
  { subject: '科学', grade: '优', hasReport: true },
  { subject: '信息技术', grade: '优', hasReport: true },
  { subject: '体育', grade: '优', hasReport: true },
  { subject: '美术', grade: '优', hasReport: true },
  { subject: '书法', grade: '优', hasReport: true },
  { subject: '道德与法治', grade: '优', hasReport: true },
];

export const MOCK_GROWTH_REPORTS: GrowthReportItem[] = [
  { id: '1', title: '2025年10月-成长报告', date: '2025-10' },
  { id: '2', title: '2025年9月-成长报告', date: '2025-09' },
];

export const MOCK_PE_REPORT_DETAILS: DetailedReportSection[] = [
  {
    title: '学科评价',
    content: '刘新宇同学本学期在体育学科综合素养评定中表现踏实稳健，最终等级为【良】，课堂配合稳定，能按要求完成老师布置的练习，整体状态积极。'
  },
  {
    title: '表现亮点',
    content: '学习态度与课后锻炼维度保持满星，说明他能坚持到课与课后练习；专项运动技能训练中节奏感逐渐稳定，体能项目切换时也能守住呼吸节奏，展现了耐力基础。'
  },
  {
    title: '提升建议',
    content: '与课堂表现相比，专项技能的动作幅度和连贯性还有挖掘空间，体能冲刺环节偶尔因紧张导致动作偏紧，若能在细节上更放松，整体水平会更均衡。'
  }
];

// 分年级、分学科的报告模板（基于评价标准生成）
export const MOCK_GRADE_SUBJECT_REPORT_TEMPLATES: Record<string, Record<string, DetailedReportSection[]>> = {
  '一年级': {
    '语文': [
      {
        title: '学科评价',
        content: '本学期语文学习表现优秀，展现出良好的学习习惯和浓厚的学习兴趣。在拼音、识字、写字等基础板块都打下了扎实的基础，朗读和背诵能力突出，课外阅读习惯正在养成，口语交际中能够大方表达。'
      },
      {
        title: '表现亮点',
        content: '拼音掌握扎实，能够正确拼读音节。识字量稳步增长，对汉字充满好奇。写字姿势端正，笔画书写规范工整。朗读时声音响亮，能读出句子的语气。背诵古诗和课文流利，国学诵读表现积极。课外阅读兴趣浓厚，能够主动分享阅读感受。'
      },
      {
        title: '提升建议',
        content: '建议每天坚持亲子阅读，选择适合的绘本和童话故事，在阅读中积累识字量。可以通过识字游戏、组词造句等方式，巩固已学汉字。鼓励多说完整的话，在日常交流中锻炼表达能力。建议坚持练字，养成良好的书写习惯。'
      }
    ],
  },
  '二年级': {
    '语文': [
      {
        title: '学科评价',
        content: '本学期语文学习表现优秀，识字写字基础扎实，朗读背诵能力强，课外阅读习惯良好，口语交际和传话能力发展良好，综合实践活动中表现积极，展现出稳定的语文素养。'
      },
      {
        title: '表现亮点',
        content: '识字量持续增长，对汉字结构有初步认识。写字工整美观，笔顺规范。朗读流利有感情，能读出不同语气。背诵古诗课文准确流畅，国学积累丰富。课外阅读面广，能复述故事主要内容。口语交际大方自信，传话清晰准确。'
      },
      {
        title: '提升建议',
        content: '建议扩大阅读量，尝试阅读短篇童话和寓言故事，在阅读后尝试复述或画画表达。可以开始尝试写日记或看图写话，从几句话开始练习。鼓励参加讲故事比赛、朗诵活动等，锻炼口头表达能力。'
      }
    ],
  },
  '三年级': {
    '语文': [
      {
        title: '学科评价',
        content: '本学期语文学习表现优异，识字写字、习作表达、口语交际、背诵朗读、国学积累、课外阅读和综合实践等各板块发展均衡，展现出良好的语文综合素养和学习潜力。'
      },
      {
        title: '表现亮点',
        content: '识字写字基础扎实，能准确书写常用汉字。习作表达开始起步，能写简短的记叙文和想象作文，语句通顺。口语交际自信大方，能清楚表达自己的想法。背诵和朗读基本功扎实。国学积累丰富，课外阅读习惯良好，能主动分享阅读感受。'
      },
      {
        title: '提升建议',
        content: '建议在习作方面多练习，可以从写日记、周记开始，逐步提升文字表达能力。课外阅读可以选择适合三年级的儿童文学作品，如《夏洛的网》《小王子》等，在阅读中积累词汇和写作素材。鼓励参加综合实践活动，提升语文综合运用能力。'
      }
    ],
  },
  '四年级': {
    '语文': [
      {
        title: '学科评价',
        content: '本学期语文学习表现优秀，习作表达能力突出，口语交际能力强，背诵朗读基础扎实，国学和课外阅读积累丰富，综合实践活动表现积极，展现出较高的语文综合素养。'
      },
      {
        title: '表现亮点',
        content: '习作表达能力突出，能写内容具体、条理清楚的记叙文和想象作文，开始尝试写简单的读后感。口语交际能力强，能有条理地表达观点。背诵和朗读有感情，能把握作品情感。国学积累深厚，课外阅读面广，能初步理解作品主题。综合实践活动中展现出较强的组织和表达能力。'
      },
      {
        title: '提升建议',
        content: '建议在习作中尝试运用修辞手法，让文字更生动。可以阅读一些经典儿童文学和少年读物，如《城南旧事》《草房子》等，提升文学鉴赏能力。鼓励尝试写读书笔记，记录阅读感悟。建议参加写作比赛、演讲比赛等活动，锻炼综合语文能力。'
      }
    ],
  },
  '五年级': {
    '语文': [
      {
        title: '学科评价',
        content: '本学期语文学习表现优异，习作表达能力强，阅读理解深入，口语交际成熟，背诵积累丰富，国学和课外阅读素养高，综合实践能力突出，展现出扎实的语文功底和较高的文学素养。'
      },
      {
        title: '表现亮点',
        content: '习作表达能力强，文章结构完整，内容充实，语言流畅，能表达真情实感。阅读理解能力突出，能把握文章主旨，体会作者情感。口语交际成熟，表达有逻辑、有深度。背诵功底扎实，国学素养深厚。课外阅读面广量大，能独立阅读经典名著，写出有见地的读后感。'
      },
      {
        title: '提升建议',
        content: '建议阅读更多经典文学作品，如《红楼梦》《西游记》等名著选段，提升文学鉴赏水平。在习作中可以尝试更多文体，如散文、议论文等，培养独特的写作风格。建议坚持写读书笔记和随笔，记录生活感悟。鼓励参加文学社团、辩论赛等活动，全面提升语文综合素养。'
      }
    ],
  },
  '六年级': {
    '语文': [
      {
        title: '学科评价',
        content: '本学期语文学习表现优异，展现出成熟的语文素养和扎实的语文功底。习作表达深入，写字功底扎实，口语交际能力强，背诵朗读有韵味，国学素养深厚，课外阅读视野开阔，综合运用能力突出，为初中语文学习打下了坚实基础。'
      },
      {
        title: '表现亮点',
        content: '习作表达成熟，能写出有思想、有文采的文章，文体意识强。写字功底扎实，书写美观。口语交际能力强，能进行深入的交流和辩论。背诵朗读有感染力，能传达作品神韵。国学积累深厚，有一定的古文阅读能力。课外阅读量大面广，能独立阅读经典名著并写出深刻的感悟。'
      },
      {
        title: '提升建议',
        content: '建议提前接触初中语文学习内容，阅读更多经典名著和现当代优秀文学作品。在习作中可以尝试议论文、散文等更多文体，培养思辨能力。建议坚持写作练笔，记录生活思考。鼓励参加各类语文竞赛和文学活动，展示语文才华，为初中学习做好充分准备。'
      }
    ],
    '数学': [
      {
        title: '学科评价',
        content: '本学期数学学习表现优秀，展现出扎实的数学功底和良好的数学素养。能够熟练运用所学知识解决实际问题，数学思维严谨，逻辑推理能力强。在数学应用、数学设计等综合实践活动中表现突出，为初中数学学习打下了坚实基础。'
      },
      {
        title: '表现亮点',
        content: '数学计算准确，解题思路清晰。能够灵活运用多种方法解决问题，展现出良好的数学思维。在数学应用方面能够将所学知识与生活实际相结合，解决实际问题。课堂参与度高，能够与同学交流分享解题思路，具备较强的数学表达能力。'
      },
      {
        title: '提升建议',
        content: '建议提前了解初中数学内容，做好知识衔接。可以尝试一些有挑战性的奥数题目，培养数学思维的深度和广度。鼓励参加数学竞赛，在竞争中提升能力。建议关注数学在科技、工程等领域的应用，拓宽数学视野。'
      }
    ],
  },
};

// 各学科的默认报告模板（通用，不分年级）
export const MOCK_SUBJECT_REPORT_TEMPLATES: Record<string, DetailedReportSection[]> = {
  '语文': [
    {
      title: '学科评价',
      content: '本学期语文学习表现优异，展现了扎实的语文素养。日常学习中，认真完成字词积累、背诵默写、课外阅读等任务，口语交际和习作表达能力突出。期末检测中发挥稳定，整体呈现出良好的学习状态。'
    },
    {
      title: '表现亮点',
      content: '在认字写字、背诵默写等基础环节表现出色，课外阅读习惯良好，阅读面广、理解深入。习作表达方面尤为突出，文字通顺、内容充实、情感真挚，展现出良好的语言组织能力。口语交际中能够积极参与讨论，表达流畅、条理清晰。'
    },
    {
      title: '提升建议',
      content: '建议在课外阅读的基础上，可以尝试阅读一些有深度的文学作品，如经典名著、优秀散文等，提升文学鉴赏能力。在习作表达中可以多尝试不同的文体和写作风格，培养独特的表达个性。建议参加朗诵、演讲等活动，在实践中锻炼综合语文能力。'
    }
  ],
  '数学': [
    {
      title: '学科评价',
      content: '本学期数学学习表现良好，具备扎实的数学基础。课堂观察显示学习态度认真，作业完成质量较高。在数学阅读、数学设计等主题活动中积极参与，展现了一定的数学思维能力和应用能力。'
    },
    {
      title: '表现亮点',
      content: '在数学阅读和数学设计方面表现突出，能够理解数学概念并进行创意表达。作业完成情况良好，基础知识掌握扎实。课堂观察显示能够积极思考问题，与老师和同学进行数学交流。'
    },
    {
      title: '提升建议',
      content: '建议在数学思维和数学应用方面继续加强训练，多做一些具有挑战性的思维题目。可以通过生活中的实际问题来锻炼数学应用能力，培养用数学眼光观察世界的习惯。建议参加数学兴趣小组或数学竞赛活动，拓展数学视野。'
    }
  ],
  '英语': [
    {
      title: '学科评价',
      content: '本学期英语学习表现优秀，展现了扎实的英语基础和良好的学习习惯。课堂表现积极，家庭作业完成认真，单词识记能力强，书写工整规范。期末检测中取得了优异的成绩，整体英语素养发展良好。'
    },
    {
      title: '表现亮点',
      content: '课堂表现非常积极主动，能够大胆开口说英语，发音标准清晰。单词识记能力突出，词汇量积累丰富。书写作业工整美观，体现了良好的学习态度。家庭作业完成质量高，能够举一反三。'
    },
    {
      title: '提升建议',
      content: '建议多进行英语听力和口语练习，可以通过观看英文动画、听英文歌曲等方式增强语感。鼓励多阅读英文绘本和简单的英文故事，扩大词汇量。可以尝试用英语进行日常对话练习，提升口语表达的流利度和自信心。'
    }
  ],
  '道法': [
    {
      title: '学科评价',
      content: '本学期道德与法治学习表现优秀，展现了良好的道德品质和法治意识。能够理解并遵守社会规则，积极参与课堂讨论，对道德问题有自己的思考和判断，整体思想品德素养发展良好。'
    },
    {
      title: '表现亮点',
      content: '课堂表现积极，能够主动参与讨论，勇于表达自己的观点。对道德问题有较深的思考，能够明辨是非。尊重他人，乐于助人，展现了良好的道德品质。法治意识强，能够自觉遵守校纪校规和社会公德。'
    },
    {
      title: '提升建议',
      content: '建议多关注社会热点问题，培养批判性思维和独立思考能力。可以通过阅读新闻、观看时事节目等方式，了解社会现象，思考道德与法治问题。鼓励参加志愿服务活动，在实践中体验助人为乐的快乐，培养社会责任感。'
    }
  ],
  '科学': [
    {
      title: '学科评价',
      content: '本学期科学学习表现优秀，展现了强烈的好奇心和探究精神。平时成绩稳定，活动手册完成认真，期末考试成绩优异。在科学实验和探究活动中表现积极，具备良好的科学素养。'
    },
    {
      title: '表现亮点',
      content: '平时学习非常认真，课堂参与度高，善于提出问题。活动手册完成质量好，实验记录详细准确。期末考试发挥出色，对科学知识的理解深入。展现了良好的观察能力、实验能力和科学思维能力。'
    },
    {
      title: '提升建议',
      content: '建议多参与科学实践活动，如科技馆参观、科学小实验等，在动手实践中加深对科学原理的理解。可以阅读一些科普读物，拓展科学知识面。鼓励对感兴趣的科学现象进行深入探究，培养科学探究精神和创新思维。'
    }
  ],
  '体育': [
    {
      title: '学科评价',
      content: '本学期体育学科综合素养评定中表现良好，课堂配合积极，能按要求完成老师布置的练习。在课堂表现、运动技能、体能测试和团队协作等方面都有不错的表现，整体状态积极向上。'
    },
    {
      title: '表现亮点',
      content: '课堂表现积极主动，学习态度端正，能坚持完成各项体育练习。运动技能掌握较好，动作规范。在团队协作项目中表现突出，能够与同学配合默契。体能测试中展现了良好的身体素质和耐力基础。'
    },
    {
      title: '提升建议',
      content: '建议加强专项运动技能的练习，提高动作的连贯性和协调性。可以在课余时间进行适当的体能训练，如跑步、跳绳等，增强体能储备。建议放松心态，在体能冲刺环节保持放松状态，发挥出更好的水平。'
    }
  ],
  '音乐': [
    {
      title: '学科评价',
      content: '本学期音乐学习表现优秀，展现了良好的音乐素养和艺术感受力。能够积极参与音乐活动，演唱和演奏表现出色，对音乐有浓厚的兴趣和较强的感知能力，整体音乐水平发展良好。'
    },
    {
      title: '表现亮点',
      content: '课堂表现积极，能够大胆演唱和表演。音准节奏把握准确，歌声优美动听。乐器演奏技能掌握较好，演奏流畅自然。音乐鉴赏能力强，能够感受不同风格音乐的美感。在音乐活动中表现突出，富有表现力和感染力。'
    },
    {
      title: '提升建议',
      content: '建议多欣赏不同类型的音乐作品，如古典音乐、民族音乐、流行音乐等，拓宽音乐视野。可以学习一种乐器，在实践中提升音乐技能。鼓励参加合唱团、乐队等音乐团体，在集体活动中培养合作精神和音乐表现力。'
    }
  ],
  '美术': [
    {
      title: '学科评价',
      content: '本学期美术学习表现优秀，展现了良好的艺术素养和创作能力。在创作能力、审美鉴赏和课堂表现等方面都有出色的表现，作品富有创意，色彩运用恰当，整体艺术水平较高。'
    },
    {
      title: '表现亮点',
      content: '创作能力突出，作品构思新颖，富有想象力。色彩搭配协调，画面表现力强。审美鉴赏能力好，能够欣赏和理解不同风格的艺术作品。课堂表现认真专注，用心完成每一幅作品，展现了对美术的热爱。'
    },
    {
      title: '提升建议',
      content: '建议多欣赏不同风格的艺术作品，如参观美术馆、阅读画册等，拓宽艺术视野。可以尝试不同的绘画技法和材料，如水彩、国画、版画等，丰富艺术表现形式。鼓励记录生活中的美好瞬间，培养敏锐的观察力和艺术感知力。'
    }
  ],
  '信息技术': [
    {
      title: '学科评价',
      content: '本学期信息技术学习表现优秀，展现了扎实的计算机操作能力和良好的编程思维。在操作技能、编程思维和作品质量等方面都有出色的表现，能够独立完成各类信息技术任务。'
    },
    {
      title: '表现亮点',
      content: '操作技能熟练，能够快速掌握新的软件和工具。编程思维清晰，逻辑性强，能够设计出较为复杂的程序。作品质量高，界面美观，功能完善，展现了良好的创新能力和实践能力。'
    },
    {
      title: '提升建议',
      content: '建议深入学习编程知识，如参加编程兴趣班、在线编程课程等，提升编程能力。可以尝试制作一些实用的小程序或小游戏，在实践中巩固所学知识。鼓励参加信息技术竞赛，如编程比赛、创客大赛等，展示自己的才华。'
    }
  ],
  '生安心理': [
    {
      title: '学科评价',
      content: '本学期生安心理课程学习表现优秀，安全意识强，心理健康状态良好，实践能力较强。能够理解和遵守各项安全规则，具备一定的自我保护能力和心理调节能力。'
    },
    {
      title: '表现亮点',
      content: '安全意识非常强，能够主动识别和规避安全隐患。心理健康状态良好，情绪稳定，乐观向上。实践能力较强，在安全演练和心理活动中表现积极，能够将所学知识应用到实际生活中。'
    },
    {
      title: '提升建议',
      content: '建议继续加强安全知识的学习，如参加消防演练、急救培训等，提升应急处理能力。可以多参与心理健康活动，如团体辅导、心理游戏等，培养积极健康的心理品质。鼓励与家长、老师和同学多交流，遇到问题及时寻求帮助。'
    }
  ]
};

export const SUBJECT_REPORT_OVERRIDES: Record<string, Record<string, DetailedReportSection[]>> = {
  '刘新宇': {
    '体育': [
      {
        title: '学科评价',
        content: '刘新宇同学本学期在体育学科综合素养评定中表现踏实稳健，最终等级为【良】，课堂配合稳定，能按要求完成老师布置的练习，整体状态积极。'
      },
      {
        title: '表现亮点',
        content: '学习态度与课后锻炼维度保持满星，说明他能坚持到课与课后练习；专项运动技能训练中节奏感逐渐稳定，体能项目切换时也能守住呼吸节奏，展现了耐力基础。'
      },
      {
        title: '发展与提升',
        content: '与课堂表现相比，专项技能的动作幅度和连贯性还有挖掘空间，体能冲刺环节偶尔因紧张导致动作偏紧，若能在细节上更放松，整体水平会更均衡。'
      }
    ]
  }
};

export const MOCK_ACTIVITIES = [
  {
    name: "秋季田径运动会",
    time: "2025年10月20日",
    location: "学校操场",
    purpose: "强健体魄，磨练意志，增强班级凝聚力",
    content: "在本次秋季运动会中，全班同学展现出了极高的热情和拼搏精神。特别是接力赛项目中，大家配合默契，不仅取得了优异的成绩，更体现了团结互助的体育精神。啦啦队的同学们也喊破了喉咙，为运动员加油助威，充分展示了班级的风采。",
    image: ASSETS.ACTIVITY.SPORTS // Using Local Asset
  },
  {
    name: "科技博物馆研学之旅",
    time: "2025年11月15日",
    location: "市科技馆",
    purpose: "探索科学奥秘，激发创新思维，拓宽视野",
    content: "同学们怀着激动的心情参观了市科技馆。在'探索与发现'展厅，大家亲身体验了各种物理现象；在'生命奥秘'展区，感受到了生命的奇迹。这次研学活动不仅增长了见识，更在同学们心中种下了科学的种子。",
    image: ASSETS.ACTIVITY.SCIENCE // Using Local Asset
  }
];

// 学科维度数据 - 用于雷达图展示
export const MOCK_SUBJECT_DIMENSIONS: Record<string, { label: string; score: number; fullScore: number }[]> = {
  '语文': [
    { label: '认字写字', score: 4, fullScore: 4 },
    { label: '背诵默写', score: 6, fullScore: 6 },
    { label: '课外阅读', score: 4, fullScore: 6 },
    { label: '口语交际', score: 4, fullScore: 4 },
    { label: '习作表达', score: 6.5, fullScore: 10 },
    { label: '期末检测', score: 52.5, fullScore: 70 },
  ],
  '数学': [
    { label: '课堂观察', score: 6, fullScore: 10 },
    { label: '作业情况', score: 18, fullScore: 20 },
    { label: '数学阅读', score: 5, fullScore: 5 },
    { label: '数学设计', score: 5, fullScore: 5 },
    { label: '数学思维', score: 4, fullScore: 5 },
    { label: '数学应用', score: 4, fullScore: 5 },
  ],
  '英语': [
    { label: '课堂表现', score: 10, fullScore: 10 },
    { label: '家庭作业', score: 8, fullScore: 10 },
    { label: '单词识记', score: 9, fullScore: 10 },
    { label: '书写作业', score: 9, fullScore: 10 },
    { label: '期末检测', score: 51, fullScore: 60 },
  ],
  '科学': [
    { label: '平时成绩', score: 30, fullScore: 30 },
    { label: '活动手册', score: 18, fullScore: 20 },
    { label: '期末考试', score: 40.25, fullScore: 50 },
  ],
};

// 为所有年级添加通用科目模板（数学、英语等）
// 这个逻辑在导出后执行，确保所有年级都有完整的科目模板
Object.keys(MOCK_GRADE_SUBJECT_REPORT_TEMPLATES).forEach(grade => {
  const gradeTemplates = MOCK_GRADE_SUBJECT_REPORT_TEMPLATES[grade];

  // 为每个年级添加其他科目的模板
  if (!gradeTemplates['数学']) {
    gradeTemplates['数学'] = MOCK_SUBJECT_REPORT_TEMPLATES['数学'];
  }
  if (!gradeTemplates['英语']) {
    gradeTemplates['英语'] = MOCK_SUBJECT_REPORT_TEMPLATES['英语'];
  }
  if (!gradeTemplates['道法']) {
    gradeTemplates['道法'] = MOCK_SUBJECT_REPORT_TEMPLATES['道法'];
  }
  if (!gradeTemplates['科学']) {
    gradeTemplates['科学'] = MOCK_SUBJECT_REPORT_TEMPLATES['科学'];
  }
  if (!gradeTemplates['体育']) {
    gradeTemplates['体育'] = MOCK_SUBJECT_REPORT_TEMPLATES['体育'];
  }
  if (!gradeTemplates['音乐']) {
    gradeTemplates['音乐'] = MOCK_SUBJECT_REPORT_TEMPLATES['音乐'];
  }
  if (!gradeTemplates['美术']) {
    gradeTemplates['美术'] = MOCK_SUBJECT_REPORT_TEMPLATES['美术'];
  }
  if (!gradeTemplates['信息技术']) {
    gradeTemplates['信息技术'] = MOCK_SUBJECT_REPORT_TEMPLATES['信息技术'];
  }
  if (!gradeTemplates['生安心理']) {
    gradeTemplates['生安心理'] = MOCK_SUBJECT_REPORT_TEMPLATES['生安心理'];
  }
});

// 行为评价记录 Mock 数据 (严格基于 AI Step4 生成结果)
export const MOCK_BEHAVIOR_RECORDS = [
  {
    id: "rec_001",
    timestamp: "2026-01-15 16:10:00",
    evaluation_date: "2026-01-15",
    type: "behavior",
    indicatorPath: ["智育", "学科评价", "英语学科"],
    scoreChange: 2,
    isBad: false,
    description: "本月中英语课上主动用英语主持对话，并帮助同学纠正发音。", // 原始记录
    aiComment: "你在英语课上表现非常积极，主动承担主持任务并耐心帮助同伴，展现了出色的表达能力与互助精神。", // AI评价 (event_summary)
    teacherName: "英语周老师",
    auditReason: "[学科评价]+[带动同学]→[+2]分(主动主持对话并纠错)"
  },
  {
    id: "rec_002",
    timestamp: "2026-01-12 09:30:00",
    evaluation_date: "2026-01-12",
    type: "behavior",
    indicatorPath: ["德育", "品格修养", "诚实守信"],
    scoreChange: 1,
    isBad: false,
    description: "拾金不昧，在操场捡到红领巾主动交还给值周老师。",
    aiComment: "诚信是一盏明灯。你拾金不昧的行为值得表扬，这份诚实的小细节让校园更加温暖。",
    teacherName: "班主任王老师",
    auditReason: "[品格修养]+[影响个人]→[+1]分(拾金不昧)"
  },
  {
    id: "rec_003",
    timestamp: "2026-01-10 14:00:00",
    evaluation_date: "2026-01-10",
    type: "behavior",
    indicatorPath: ["智育", "学习态度", "课前准备"],
    scoreChange: -1,
    isBad: true,
    description: "上课铃响后仍在走廊追逐，进教室后课本未准备好。",
    aiComment: "课前的安静是为了更好的思考。希望下次铃响后能迅速回到座位，做好学习准备哦。",
    teacherName: "数学李老师",
    auditReason: "[学习态度]+[影响个人]→[-1]分(课前准备不充分)"
  }
];
// 符合 AI Prompt (期末报告-通用-v2.md) 输出结构的 Mock 数据
export const MOCK_TERM_REPORT_AI_DATA = {
  "dimensionScores": [
    { "label": "崇德", "score": 78 },
    { "label": "求知", "score": 85 },
    { "label": "向阳", "score": 72 },
    { "label": "尚美", "score": 80 },
    { "label": "躬行", "score": 75 }
  ],
  "startDimensionScores": [
    { "label": "崇德", "score": 65 },
    { "label": "求知", "score": 70 },
    { "label": "向阳", "score": 60 },
    { "label": "尚美", "score": 75 },
    { "label": "躬行", "score": 68 }
  ],
  "subjectScores": {
    "语文": "优",
    "数学": "良",
    "英语": "优",
    "科学": "优",
    "美术": "良",
    "体育": "优"
  },
  "subjectReports": {
    "语文": {
      "subjectAssessment": "本学期，你在语文学习中展现出的文字敏感度和对文学作品的深层共情，令老师感到由衷的欣喜。你的每一篇阅读随笔，都仿佛是与生命进行的真诚对话。",
      "performanceHighlights": "这体现了你敏锐且细腻的情感特质。在处理复杂的文本细节时，你总能精准捕捉作者未曾言明的深意，这种对文字温度的感知力，是你最宝贵的精神财富。",
      "improvementAdvice": "不妨尝试在寒假期间开始为期21天的‘晨间笔记’计划。不用在意文辞，只是记录下醒来时的第一缕思绪，让这种无门槛的表达帮助你磨炼书写的速度与自信。"
    },
    "数学": {
      "subjectAssessment": "翻看你的数学练习册，那些清晰的解题步骤和严密的逻辑闭环，无不流露出你对秩序感的追求。看到你在这个领域稳扎稳打的进步，我感到非常欣慰。",
      "performanceHighlights": "你展现了极其出色的空间逻辑和归纳能力。在面对极具挑战性的混合运算时，你总能迅速拆解复杂问题，这种‘化繁为简’的思维习惯是通往成功的重要基石。",
      "improvementAdvice": "可以尝试每天独立解决一道生活中的‘数学谜题’，比如计算家庭采购的最优组合。这种将抽象概念引入现实场景的练习，会让你发现数学背后那种理性而迷人的力量。"
    },
    "英语": {
      "subjectAssessment": "英语课堂上的你总是神采飞扬，你那标准的发音和自然地流露出的跨文化沟通自信，让整个课堂都充满了活力。",
      "performanceHighlights": "这说明 you 拥有一颗开放且包容的心，能够自然地接纳并融入不同的语言语境。你在主持对话时展现出的组织力和亲和力，是同伴眼中非常闪亮的光芒。",
      "improvementAdvice": "建议每天尝试用英语录一段 30 秒的短视频分享你的日常见闻。这种‘向外输出’的微行动，不仅能帮你固定语感，更能让你在表达中建立起更深层的成就感。"
    },
    "科学": {
      "subjectAssessment": "你的实验记录本充满了对未知世界的探索热情，那种不畏失败、反复求证的求知欲，正是未来科学家最需要的品质。",
      "performanceHighlights": "这体现了你严谨、客观的思维底色。你在观察植物生长过程时展现出的耐心和对细节的捕捉能力，让你的实验结论总能比别人多出一份深度。",
      "improvementAdvice": "不妨在寒假尝试完成一个小型的‘阳台气象站’观察计划。通过持续的记录与对比，你会掌握如何在大规模的数据积累中，发现自然运行的神奇规律。"
    },
    "体育": {
      "subjectAssessment": "在这个学期的冬季长跑和各项体质测试中，我看到了一个坚韧不拔的灵魂在汗水中悄然拔节，你的每一次冲刺都在突破昨天的自己。",
      "performanceHighlights": "这说明你具备极佳的自律性和意志力。你在团队接力赛中展现出的责任感，让你不仅成为了一个优秀的跑者，更成为了班级力量的粘合剂。",
      "improvementAdvice": "建议每天坚持 15 分钟的跳绳或拉伸练习。这种对身体控制能力的微调，不仅能帮你建立更优美的体态，更能通过规律的律动，让你的心境在学习压力下保持平和。"
    }
  },
  "studentTags": [
    "敏锐深邃",
    "自律严谨",
    "温润互助"
  ],
  "overallAssessment": "<p>亲爱的{name}，翻开你这学期的成长记录，老师仿佛看到了一个像小松树一样挺拔、向上的身影。你在语文、数学、英语等学科上表现出了极佳的专注力和学习习惯，特别是在听写全对和课堂积极互动上的表现，更是令人欣喜；在体育锻炼和劳动实践中，你也从不动后，展现出了满满的活力与责任感。</p><p>最让老师感动的是那些藏在细节里的美好：你是那个坐姿最端正的孩子，是那个会耐心等待的孩子，也是那个学具收拾得最利落的孩子。这些“润物细无声”的好习惯，是你送给自己一年级生活最珍贵的礼物。愿你继续保持这份笃定与认真，在未来的日子里，向着阳光，快乐生长！</p>",
  "growthAdvice": "<p>针对你目前的成长阶段，老师为你准备了几个生活中的小锦囊：</p><p><strong>表达的小巨人</strong></p><p>你已经很会“听”了，不妨尝试多“说”。每天找一个机会，大声地把你的想法或观察到的趣事讲给身边的人听，让大家听到你自信的声音。</p><p><strong>阅读的探险家</strong></p><p>建议每天睡前坚持15分钟的亲子阅读时光。不用拘泥于绘本的世界里探险吧，那里的故事会给你的想象力插上翅膀。</p>",
  "parentActivityGuide": "<p>为了呵护孩子这份宝贵的专注与自律，我们建议家长在碎片化时间里尝试以下活动：</p><p><strong>角色互换游戏</strong></p><p>周末时，请孩子当一次“小老师”，教家长一个他在学校学到的新单词或新规矩。这能极大地增强孩子的自信心，巩固他的学习成果。</p><p><strong>户外“撒野”</strong></p><p>既然孩子在学校坐姿端正、非常自律，假期建议多带孩子去大自然中奔跑、攀爬。动静结合，能让孩子释放天性，保持身心的平衡与健康。</p>",
  "highlights": [
    {
      "date": "2025年12月",
      "achievement": "2025年12月，你的书法作品《毛主席语录》在2025年“高新学子活力成长嘉年华”系列活动暨成都市高新区中小学校师生艺术作品展演评审活动中荣获一等奖。",
      "isAward": true,
      "imageUrl": ASSETS.HIGHLIGHTS.CERTIFICATE
    },
    {
      "date": "2026年1月",
      "achievement": "2026年1月，你在语文检测中进步巨大，得到了语文老师的高度赞扬。",
      "isAward": false,
      "imageUrl": ASSETS.HIGHLIGHTS.GENERIC_GROWTH
    },
    {
      "date": "2026年1月",
      "achievement": "2026年1月，你在“希望之星”2025年成都市青少年(学生)运动会乒乓球比赛中中荣获第三名。",
      "isAward": true,
      "imageUrl": ASSETS.HIGHLIGHTS.PINGPONG_CERT
    }
  ]
};

export const MOCK_TERM_REPORT_AI_DATA_FEMALE = {
  "dimensionScores": [
    { "label": "崇德", "score": 82 },
    { "label": "求知", "score": 88 },
    { "label": "向阳", "score": 78 },
    { "label": "尚美", "score": 85 },
    { "label": "躬行", "score": 80 }
  ],
  "startDimensionScores": [
    { "label": "崇德", "score": 70 },
    { "label": "求知", "score": 75 },
    { "label": "向阳", "score": 65 },
    { "label": "尚美", "score": 78 },
    { "label": "躬行", "score": 72 }
  ],
  "subjectScores": {
    "语文": "优",
    "数学": "优",
    "英语": "优",
    "科学": "优",
    "美术": "优",
    "体育": "优"
  },
  "subjectReports": MOCK_TERM_REPORT_AI_DATA.subjectReports,
  "studentTags": [
    "全面发展",
    "成熟可靠",
    "独立自主"
  ],
  "overallAssessment": "<p>亲爱的{name}，翻开你这学期的成长记录，老师仿佛看到了一个像小松树一样挺拔、向上的身影。你在语文、数学、英语等学科上表现出了极佳的专注力和学习习惯，特别是在听写全对和课堂积极互动上的表现，更是令人欣喜；在体育锻炼和劳动实践中，你也从不动后，展现出了满满的活力与责任感。</p><p>最让老师感动的是那些藏在细节里的美好：你是那个坐姿最端正的孩子，是那个会耐心等待的孩子，也是那个学具收拾得最利落的孩子。这些“润物细无声”的好习惯，是你送给自己一年级生活最珍贵的礼物。愿你继续保持这份笃定与认真，在未来的日子里，向着阳光，快乐生长！</p>",
  "growthAdvice": "<p>针对你目前的成长阶段，老师为你准备了几个生活中的小锦囊：</p><p><strong>表达的小巨人</strong></p><p>你已经很会“听”了，不妨尝试多“说”。每天找一个机会，大声地把你的想法或观察到的趣事讲给身边的人听，让大家听到你自信的声音。</p><p><strong>阅读的探险家</strong></p><p>建议每天睡前坚持15分钟的亲子阅读时光。不用拘泥于绘本的世界里探险吧，那里的故事会给你的想象力插上翅膀。</p>",
  "parentActivityGuide": "<p>为了呵护孩子这份宝贵的专注与自律，我们建议家长在碎片化时间里尝试以下活动：</p><p><strong>角色互换游戏</strong></p><p>周末时，请孩子当一次“小老师”，教家长一个他在学校学到的新单词或新规矩。这能极大地增强孩子的自信心，巩固他的学习成果。</p><p><strong>户外“撒野”</strong></p><p>既然孩子在学校坐姿端正、非常自律，假期建议多带孩子去大自然中奔跑、攀爬。动静结合，能让孩子释放天性，保持身心的平衡与健康。</p>",
  "highlights": [
    {
      "date": "2025年12月",
      "achievement": "2025年12月，你的书法作品《毛主席语录》在2025年“高新学子活力成长嘉年华”系列活动暨成都市高新区中小学校师生艺术作品展演评审活动中荣获一等奖。",
      "isAward": true,
      "imageUrl": ASSETS.HIGHLIGHTS.CERTIFICATE
    },
    {
      "date": "2026年1月",
      "achievement": "2026年1月，你在语文检测中进步巨大，得到了语文老师的高度赞扬。",
      "isAward": false,
      "imageUrl": ASSETS.HIGHLIGHTS.GENERIC_GROWTH
    },
    {
      "date": "2026年1月",
      "achievement": "2026年1月，你在“希望之星”2025年成都市青少年(学生)运动会乒乓球比赛中中荣获第三名。",
      "isAward": true,
      "imageUrl": ASSETS.HIGHLIGHTS.PINGPONG_CERT
    }
  ]
};
// 草堂小学班级评价指标体系 (基于精简版.md)
export const MOCK_CLASS_EVALUATION_INDICATORS = [
  {
    name: '诗意中队',
    children: [
      {
        name: '少先队礼仪',
        children: [{ name: '佩戴规范', scoreValue: 1 }, { name: '宣誓集会', scoreValue: 2 }]
      },
      {
        name: '中队文化建设',
        children: [{ name: '图书管理', scoreValue: 1 }, { name: '文化宣传', scoreValue: 2 }]
      },
      {
        name: '队会课执行',
        children: [{ name: '队会落实', scoreValue: 3 }]
      }
    ]
  },
  {
    name: '安全班级',
    children: [
      {
        name: '班级安全秩序',
        children: [{ name: '公共秩序', scoreValue: 1 }, { name: '违禁核查', scoreValue: 2 }]
      },
      {
        name: '班级安全教育',
        children: [
          { name: '安全班会', scoreValue: 2 },
          { name: '安全记录', scoreValue: 1 },
          { name: '演练参与', scoreValue: 3 },
          { name: '事故预防', scoreValue: 2 }
        ]
      }
    ]
  },
  {
    name: '健体班级',
    children: [
      {
        name: '早操体锻',
        children: [
          { name: '精神风貌', scoreValue: 1 },
          { name: '队列姿态', scoreValue: 1 },
          { name: '做操规范', scoreValue: 2 },
          { name: '跑操品质', scoreValue: 2 },
          { name: '退场有序', scoreValue: 1 },
          { name: '组织带队', scoreValue: 1 }
        ]
      },
      {
        name: '眼保健操',
        children: [
          { name: '准备姿态', scoreValue: 1 },
          { name: '眼操品质', scoreValue: 2 },
          { name: '操间纪律', scoreValue: 1 },
          { name: '有效管理', scoreValue: 1 }
        ]
      }
    ]
  },
  {
    name: '文雅班级',
    children: [
      {
        name: '班级常规',
        children: [{ name: '文化建设', scoreValue: 2 }, { name: '内务整理', scoreValue: 1 }]
      },
      {
        name: '路队管理',
        children: [{ name: '文明放学', scoreValue: 2 }]
      },
      {
        name: '协调精灵',
        children: [{ name: '职责登记', scoreValue: 1 }, { name: '职责值岗', scoreValue: 2 }]
      }
    ]
  },
  {
    name: '美净班级',
    children: [
      {
        name: '环境卫生',
        children: [{ name: '晨间清洁', scoreValue: 2 }, { name: '午间清洁', scoreValue: 2 }]
      },
      {
        name: '即时保洁',
        children: [{ name: '持续维护', scoreValue: 1 }]
      }
    ]
  }
];

// 模拟班级记录数据 (基于草堂小学指标)
export const MOCK_CLASS_RECORD_LOGS = [
  {
    id: 'class_rec_001',
    type: 'text',
    status: 'done',
    time: '2026-02-05 08:30',
    content: '一班在早操期间队伍整齐，动作规范，精神面貌非常好。',
    aiSummary: '2025级一班在早操体锻中展现了极佳的精神风貌和规范的动作姿态，整体表现优异。',
    theme: 'positive',
    students: [{ id: 'c1', name: '2025级一班' }],
    score: { label: '健体班级-早操体锻-做操规范', value: 2 },
    rawDate: '2026-02-05',
    scope: 'class'
  },
  {
    id: 'class_rec_002',
    type: 'voice',
    status: 'done',
    time: '2026-02-04 14:00',
    content: '三班的少先队员今日红领巾佩戴不全，有三位同学未佩戴。',
    aiSummary: '2023级三班在少先队礼仪方面存在佩戴不规范的情况，需要加强日常检查。',
    theme: 'negative',
    students: [{ id: 'c2', name: '2023级三班' }],
    score: { label: '诗意中队-少先队礼仪-佩戴规范', value: -1 },
    rawDate: '2026-02-04',
    scope: 'class'
  },
  {
    id: 'class_rec_003',
    type: 'text',
    status: 'done',
    time: '2026-02-03 10:20',
    content: '二班午间清洁完成非常高效，地面洁净，桌椅整齐。',
    aiSummary: '2024级二班在环境卫生维护上表现出色，午间清洁彻底，保持了室内美观整洁。',
    theme: 'positive',
    students: [{ id: 'c3', name: '2024级二班' }],
    score: { label: '美净班级-环境卫生-午间清洁', value: 2 },
    rawDate: '2026-02-03',
    scope: 'class'
  },
  {
    id: 'class_rec_004',
    type: 'voice',
    status: 'done',
    time: '2026-02-02 16:30',
    content: '一班放学路队秩序井然，行进整齐，口号响亮。',
    aiSummary: '2025级一班在路队管理中体现了高度的纪律性，文明放学流程落实到位。',
    theme: 'positive',
    students: [{ id: 'c1', name: '2025级一班' }],
    score: { label: '文雅班级-路队管理-文明放学', value: 2 },
    rawDate: '2026-02-02',
    scope: 'class'
  },
  {
    id: 'class_rec_005',
    type: 'text',
    status: 'done',
    time: '2026-02-01 09:15',
    content: '三班在中队角布置中非常有创意，文化宣传氛围浓厚。',
    aiSummary: '2023级三班在中队文化建设方面表现突出，文化宣传内容丰富且具诗意。',
    theme: 'positive',
    students: [{ id: 'c2', name: '2023级三班' }],
    score: { label: '诗意中队-中队文化建设-文化宣传', value: 2 },
    rawDate: '2026-02-01',
    scope: 'class'
  }
];
