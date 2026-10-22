/** 图片内容为固定的张敏演示材料；识别描述与材料本身保持一致。 */
export interface ImageSample {
  id: string;
  label: string;
  file: string;
  teacherId: string;
  date: string;
  text: string;
  summary: string;
  indicatorId?: string;
  category: string;
}

const IMAGE_SAMPLE_INPUTS: Omit<ImageSample, 'summary'>[] = [
  { id: 'training-certificate', label: '研修培训证书', file: '01-training-certificate', teacherId: 't1', date: '2026-10-12', indicatorId: 'C07', category: '研修培训', text: '张敏于2026年10月12日完成玉林中学校级新课程教学研修，共6学时。' },
  { id: 'online-learning', label: '网络研修截图', file: '02-online-learning', teacherId: 't1', date: '2026-10-11', indicatorId: 'C07', category: '研修培训', text: '张敏于2026年10月11日完成省级高中语文阅读教学专题研修，学习进度100%，认定12学时。' },
  { id: 'research-completion', label: '课题结题证明', file: '03-research-completion', teacherId: 't1', date: '2026-10-08', indicatorId: 'C09', category: '课题研究', text: '张敏主持的市级课题“项目化学习促进高中语文阅读能力发展的实践研究”于2026年10月8日结题，所在学校为玉林中学，审核结论为同意结题。' },
  { id: 'teaching-award', label: '赛课获奖证书', file: '05-teaching-award', teacherId: 't1', date: '2026-09-28', indicatorId: 'C04', category: '赛课获奖', text: '玉林中学张敏于2026年9月28日在市级高中语文课堂教学比赛中荣获二等奖。' },
  { id: 'journal-article', label: '论文发表材料', file: '06-journal-article', teacherId: 't1', date: '2026-09', indicatorId: 'C09', category: '论文专著', text: '玉林中学张敏撰写的论文“分层提问在高中语文阅读教学中的应用”发表于《课堂实践研究》2026年第9期；材料未载明具体发表日期。' },
  { id: 'professional-honor', label: '专业荣誉证书', file: '07-professional-honor', teacherId: 't1', date: '2026-09-10', category: '专业荣誉', text: '玉林中学张敏于2026年9月10日被评为2026年度校级骨干教师，任教学科为高中语文。' },
  { id: 'teaching-practice', label: '教学实践记录', file: '08-teaching-practice', teacherId: 't1', date: '2026-09-28', indicatorId: 'C04', category: '教学案例', text: '玉林中学张敏于2026年9月28日完成高一（1）班语文《故都的秋》分层教学实践。记录包含教学设计、课堂实施和学习反馈：设置基础、提升两类阅读任务，学生分组讨论并展示，根据课堂反馈调整追问方式。' },
  { id: 'teaching-research-notes', label: '教研活动记录', file: '09-teaching-research-notes', teacherId: 't1', date: '2026-09-15', indicatorId: 'C08', category: '教研记录', text: '玉林中学张敏于2026年9月15日完成高一语文组集体备课活动记录，研讨主题为阅读课堂的提问设计，记录了先留思考时间再组织交流、增加有依据的追问等教研改进意见。' },
  { id: 'personal-reading', label: '个人阅读研修', file: '10-personal-reading', teacherId: 't1', date: '2026-10-06', indicatorId: 'C07', category: '自主研修', text: '玉林中学张敏于2026年10月6日完成个人阅读与研修记录，主题为如何设计有效的课堂追问，记录了围绕文本追问、让学生说出判断依据，以及下次尝试学生相互追问的想法。' },
  { id: 'student-award', label: '学生获奖证书', file: '13-student-award', teacherId: 't1', date: '2026-10-10', indicatorId: 'C05', category: '学生获奖', text: '玉林中学高一（1）班学生A于2026年10月10日在校级阅读表达比赛中荣获一等奖，指导教师为张敏。该图片证明学生获奖和指导关系，未提供个别支持的需求、措施及跟进记录。' },
];

// 已逐张核对图片正文；只压缩事实，不推导学习成效、教师奖项或未记载的个人贡献。
const MATERIAL_SUMMARIES: Record<string, string> = {
  'training-certificate': '张敏完成玉林中学校级新课程教学研修，共6学时，准予结业。',
  'online-learning': '张敏完成省级高中语文阅读教学专题研修，学习进度100%，认定12学时。',
  'research-completion': '张敏主持的市级课题《项目化学习促进高中语文阅读能力发展的实践研究》获准结题。',
  'teaching-award': '张敏在市级高中语文课堂教学比赛中获二等奖。',
  'journal-article': '张敏的论文《分层提问在高中语文阅读教学中的应用》发表于《课堂实践研究》2026年第9期。',
  'professional-honor': '张敏被评为2026年度玉林中学校级骨干教师。',
  'teaching-practice': '张敏开展高一（1）班《故都的秋》分层教学，设置基础层与提升层任务，组织分组讨论和展示，并记录学习反馈与改进措施。',
  'teaching-research-notes': '张敏记录高一语文组围绕阅读课堂提问设计开展的集体备课，改进意见包括先留思考时间再组织交流、增加有依据的追问。',
  'personal-reading': '张敏记录“如何设计有效的课堂追问”的个人阅读研修思考，包括让学生说出判断依据、围绕文本追问，以及下次尝试学生相互追问。',
  'student-award': '张敏指导的高一（1）班学生A在校级阅读表达比赛中获一等奖。',
};
export const IMAGE_SAMPLES: ImageSample[] = IMAGE_SAMPLE_INPUTS.map(sample => ({ ...sample, summary: MATERIAL_SUMMARIES[sample.id] }));

export const findImageSample = (id?: string) => IMAGE_SAMPLES.find(sample => sample.id === id);

/** 旧版记录继续保留原材料，不能替换成张敏的另一件成果。 */
export const LEGACY_IMAGE_SAMPLES = [
  { id: 'training', heading: '教师研修活动记录', lines: ['校级新课程教学研修', '已完成学习与课堂实践交流'] },
  { id: 'research', heading: '课题结题评审记录', lines: ['市级阅读素养教学研究', '项目状态：已结题', '本人贡献：主持人'] },
  { id: 'lesson', heading: '公开课活动记录', lines: ['区县级阅读教学公开课', '已完成课堂展示与交流', '本人贡献：执教人'] },
  { id: 'practice', heading: '课堂教学实践记录', lines: ['分层教学：阅读课堂实践', '已完成教学设计、实施记录与学生反馈'] },
];
