import { INDICATOR_FIELD_PRESETS, extractIndicatorFields, indicatorFields, makeFieldSnapshot, withRecordFields, type IndicatorField, type RecordFieldSnapshot } from './indicatorFields';
import { findImageSample } from './imageSamples';
export { IMAGE_SAMPLES } from './imageSamples';

export type EvaluationRole = 'teacher' | 'manager';
export type RecordInputType = 'text' | 'voice' | 'image';
export const DEMO_TODAY = '2026-10-15';
export const SELF_COMMUNICATION_EXAMPLE = '今天，我与刘甜家长沟通学生学习习惯。';
export type RecordStatus = 'approved' | 'pending' | 'returned' | 'withdrawn';
export interface DevelopmentIndicator {
  id: string; name: string; dimension: string; definition: string;
  roles: EvaluationRole[]; requiresReview: boolean; base: number; upper: number; lower: number;
  rule: string; delta: number; keywords: string[]; category?: string;
  distinguishLevels: boolean;
  fieldVersion: number; fields: IndicatorField[];
}
export interface TeacherDossier {
  id: string; name: string; subject: string; grade: string; title: string; education: string;
  major: string; joined: string; teachingSince: string; school: string; manager?: boolean;
  positions: { title: string; period: string; scope: string }[];
  qualifications: { name: string; issued: string; issuer: string; number: string }[];
  experience: { period: string; school: string; position: string }[];
}
export interface DevelopmentRecord {
  id: string; teacherId: string; authorId: string; text: string; title: string; indicatorId: string;
  date: string; recordedAt?: string; category?: string; level?: string; stage?: string; contribution?: string;
  delta: number; status: RecordStatus; requiresReview: boolean; rule: string;
  inputType: RecordInputType; imageSampleId?: string; note?: string; reviewerId?: string; history: string[];
  fieldSnapshot?: RecordFieldSnapshot;
  distinguishLevels?: boolean;
  matter?: string;
  inputContext?: { teacherId: string; date: string };
  scoreAdjustment?: { value: number; reason: string };
}
export const SCHOOL = '玉林中学';
export const PERIODS = [
  { id: '2026-autumn', label: '2026—2027 第一学期', start: '2026-09-01', end: '2027-01-31' },
  { id: '2026-spring', label: '2025—2026 第二学期', start: '2026-02-01', end: '2026-08-31' },
];
export const ACADEMIC_YEAR_PERIODS = [
  { id: '2026-year', label: '2026—2027 学年', start: '2026-09-01', end: '2027-08-31' },
  { id: '2025-year', label: '2025—2026 学年', start: '2025-09-01', end: '2026-08-31' },
];
export type EvaluationPeriodMode = 'semester' | 'academic-year';
export const periodsForMode = (mode: EvaluationPeriodMode) => mode === 'academic-year' ? ACADEMIC_YEAR_PERIODS : PERIODS;
export const ALL_PERIODS = [...PERIODS, ...ACADEMIC_YEAR_PERIODS];
const INDICATOR_PRESETS: Omit<DevelopmentIndicator, 'fields' | 'fieldVersion' | 'distinguishLevels'>[] = [
  { id: 'C01', name: '履职尽责', dimension: '师德师风', definition: '履行教育教学职责，遵守课堂及岗位要求。', roles: ['manager'], requiresReview: false, base: 10, upper: 10, lower: 0, rule: '经核实，无故缺课或课堂播放与教学无关内容并影响教学，扣3分。', delta: -3, keywords: ['无故缺课', '追星', '歌星', '与教学无关'] },
  { id: 'C02', name: '关爱学生', dimension: '师德师风', definition: '尊重学生人格，平等关爱并保护学生。', roles: ['manager'], requiresReview: false, base: 10, upper: 10, lower: 0, rule: '经核实公开辱骂学生，扣3分。', delta: -3, keywords: ['辱骂', '体罚'] },
  { id: 'C03', name: '廉洁诚信', dimension: '师德师风', definition: '廉洁从教，真实提供工作及成果材料。', roles: ['manager'], requiresReview: false, base: 10, upper: 10, lower: 0, rule: '经核实冒用他人证书，扣5分；关联成果另行撤销。', delta: -5, keywords: ['冒用', '造假'] },
  { id: 'C04', name: '教学实践', dimension: '教育教学', definition: '开展课堂教学实践，形成可追溯的设计、实施和反馈。', roles: ['teacher', 'manager'], requiresReview: true, base: 20, upper: 25, lower: 10, rule: '有设计、实施及反馈依据的分层教学案例，加2分。', delta: 2, keywords: ['分层教学', '教学实践'], category: '教学案例' },
  { id: 'C05', name: '成长支持', dimension: '教育教学', definition: '针对学生实际需要开展支持，记录措施及跟进。', roles: ['teacher', 'manager'], requiresReview: true, base: 10, upper: 15, lower: 5, rule: '有需求、措施及跟进依据的个别支持案例，加2分。', delta: 2, keywords: ['个别支持', '学生获奖'], category: '支持案例' },
  { id: 'C06', name: '沟通反思', dimension: '教育教学', definition: '记录家校沟通事实及自己的思考。', roles: ['teacher', 'manager'], requiresReview: false, base: 5, upper: 10, lower: 0, rule: '完成一次家校沟通记录，加1分。', delta: 1, keywords: ['家长', '家校', '沟通'], category: '沟通记录' },
  { id: 'C07', name: '研修学习', dimension: '研修成长', definition: '参加研修、培训或自主学习，记录学习经历。', roles: ['teacher', 'manager'], requiresReview: false, base: 10, upper: 15, lower: 5, rule: '完成一次研修学习记录，加1分。', delta: 1, keywords: ['研修', '培训', '学习'], category: '研修培训' },
  { id: 'C08', name: '教研改进', dimension: '研修成长', definition: '通过教研或反思改进教育教学实践。', roles: ['teacher', 'manager'], requiresReview: false, base: 5, upper: 10, lower: 0, rule: '完成一次教研改进记录，加1分。', delta: 1, keywords: ['教研', '改进', '反思'], category: '教研记录' },
  { id: 'C09', name: '科研成果', dimension: '研修成长', definition: '形成课题、论文等科研成果，明确本人贡献。', roles: ['teacher', 'manager'], requiresReview: true, base: 0, upper: 10, lower: 0, rule: '市级课题结题且本人为主持人，加3分；其他成果仅归档。', delta: 3, keywords: ['课题', '论文', '专著'], category: '课题研究' },
  { id: 'C10', name: '团队协作', dimension: '协作贡献', definition: '参与学校团队任务并履行分工。', roles: ['teacher', 'manager'], requiresReview: true, base: 10, upper: 10, lower: 5, rule: '完成集体协作任务，记录本人贡献，仅归档。', delta: 0, keywords: ['集体', '团队', '协作'], category: '集体荣誉' },
  { id: 'C11', name: '工作引领', dimension: '协作贡献', definition: '完成带教或工作室引领等任务。', roles: ['teacher', 'manager'], requiresReview: true, base: 5, upper: 10, lower: 0, rule: '完成约定带教任务，有任务记录及受助反馈，加2分。', delta: 2, keywords: ['带教', '工作室', '引领'], category: '工作引领' },
  { id: 'C12', name: '示范服务', dimension: '协作贡献', definition: '开展公开课、讲座分享或教育服务。', roles: ['teacher', 'manager'], requiresReview: true, base: 5, upper: 10, lower: 0, rule: '区县级公开课完成证明，本人为执教人，加2分。', delta: 2, keywords: ['公开课', '讲座', '献课'], category: '讲座献课' },
];
export const INDICATORS: DevelopmentIndicator[] = INDICATOR_PRESETS.map(indicator => ({ ...indicator, distinguishLevels: ['C07', 'C09', 'C12'].includes(indicator.id), fieldVersion: 2, fields: structuredClone(INDICATOR_FIELD_PRESETS[indicator.id] ?? []) }));
export const DIMENSIONS = [...new Set(INDICATORS.map(item => item.dimension))];
export const TEACHERS: TeacherDossier[] = [
  { id: 't1', name: '张敏', subject: '语文', grade: '高一', title: '一级教师', education: '硕士研究生', major: '学科教学（语文）', joined: '2018-08', teachingSince: '2014-09', school: SCHOOL,
    positions: [{ title: '语文教师', period: '2026—2027 第一学期', scope: '高一1班、2班' }, { title: '班主任', period: '2026—2027 第一学期', scope: '高一1班' }],
    qualifications: [{ name: '高级中学教师资格证', issued: '2014-06', issuer: '成都市教育局', number: '2014**********2186' }, { name: '普通话二级甲等证书', issued: '2013-11', issuer: '四川省语言文字工作委员会', number: '2013******0328' }],
    experience: [{ period: '2018.08—至今', school: SCHOOL, position: '语文教师、班主任' }, { period: '2014.09—2018.07', school: '成都市实验中学', position: '语文教师' }] },
  { id: 't2', name: '李岩', subject: '数学', grade: '高二', title: '高级教师', education: '大学本科', major: '数学与应用数学', joined: '2010-08', teachingSince: '2006-09', school: SCHOOL, manager: true,
    positions: [{ title: '数学教师', period: '2026—2027 第一学期', scope: '高二3班' }, { title: '教研组长', period: '2026—2027 第一学期', scope: '数学教研组' }],
    qualifications: [{ name: '高级中学教师资格证', issued: '2006-06', issuer: '成都市教育局', number: '2006**********0369' }],
    experience: [{ period: '2010.08—至今', school: SCHOOL, position: '数学教师、教研组长' }, { period: '2006.09—2010.07', school: '成都市实验中学', position: '数学教师' }] },
  ...(['王悦', '陈晨', '刘欣', '赵宁'] as const).map((name, i): TeacherDossier => ({ id: `t${i + 3}`, name, subject: ['英语', '物理', '历史', '生物'][i], grade: i % 2 ? '高二' : '高一', title: '一级教师', education: '大学本科', major: ['英语', '物理学', '历史学', '生物科学'][i], joined: '2020-08', teachingSince: '2017-09', school: SCHOOL, manager: i === 1,
    positions: [{ title: '学科教师', period: '2026—2027 第一学期', scope: `${i % 2 ? '高二' : '高一'}年级` }],
    qualifications: [{ name: '高级中学教师资格证', issued: '2017-06', issuer: '成都市教育局', number: '2017**********1028' }],
    experience: [{ period: '2020.08—至今', school: SCHOOL, position: '学科教师' }, { period: '2017.09—2020.07', school: '成都市实验中学', position: '学科教师' }],
  })),
];
const seed = (id: string, teacherId: string, indicatorId: string, title: string, date: string, status: RecordStatus = 'approved', extra: Partial<DevelopmentRecord> = {}): DevelopmentRecord => {
  const indicator = INDICATORS.find(item => item.id === indicatorId)!;
  const sample = findImageSample(extra.imageSampleId);
  const snapshot = sample && sample.teacherId === teacherId && sample.date === date
    ? { fieldSnapshot: makeFieldSnapshot(indicator, extractIndicatorFields(sample.text, indicatorFields(indicator))) } : {};
  return withRecordFields({ id, inputType: 'text', teacherId, authorId: teacherId, text: title, title, indicatorId, date, recordedAt: `${date}T14:00:00+08:00`, category: indicator.category, delta: indicator.delta, status, requiresReview: indicator.requiresReview, rule: indicator.rule, history: [indicator.requiresReview ? '教师提交记录' : 'AI匹配规则，免审自动生效'], ...(status === 'approved' && indicator.requiresReview ? { reviewerId: 't2', history: ['教师提交记录', '管理者审核通过'] } : {}), ...snapshot, ...extra }, indicator);
};
export const INITIAL_RECORDS: DevelopmentRecord[] = [
  seed('r1', 't1', 'C07', '完成新课程教学研修', '2026-10-12', 'approved', { inputType: 'image', imageSampleId: 'training-certificate', text: findImageSample('training-certificate')!.text, level: '校级' }),
  seed('r2', 't1', 'C06', '与家长沟通学生学习习惯', '2026-10-09', 'approved', { inputType: 'voice', text: SELF_COMMUNICATION_EXAMPLE }),
  seed('r3', 't1', 'C09', '项目化学习课题结题', '2026-10-08', 'pending', { inputType: 'image', imageSampleId: 'research-completion', level: '市级', stage: '结题', contribution: '主持人', text: findImageSample('research-completion')!.text }),
  seed('r4', 't1', 'C12', '区县级阅读教学公开课', '2026-09-22', 'approved', { inputType: 'image', imageSampleId: 'lesson', level: '区县级', contribution: '执教人' }),
  seed('r5', 't1', 'C08', '优化阅读课堂提问策略', '2026-09-15', 'approved', { inputType: 'image', imageSampleId: 'teaching-research-notes', text: findImageSample('teaching-research-notes')!.text }),
  seed('r6', 't2', 'C11', '完成青年教师带教任务', '2026-10-11', 'pending', { inputType: 'voice', text: '今天，我完成了青年教师带教任务，和青年教师一起复盘了课堂，收到了受助反馈。' }),
  seed('r7', 't3', 'C07', '完成英语教学研修', '2026-10-10', 'approved', { text: '今天，我完成了英语教学研修，学习了分组口语练习的方法。' }),
  seed('r8', 't3', 'C04', '分层教学实践与反馈', '2026-09-28', 'approved', { inputType: 'image', imageSampleId: 'practice' }),
  seed('r9', 't4', 'C09', '课堂实验研究课题结题', '2026-10-07', 'approved', { inputType: 'image', imageSampleId: 'research', level: '市级', stage: '结题', contribution: '主持人' }),
  seed('r10', 't5', 'C08', '改进史料阅读教学方法', '2026-09-30', 'approved', { text: '今天，我完成了史料阅读教学的教研改进，增加了对比阅读环节。' }),
  seed('r11', 't1', 'C07', '参加春季语文研修', '2026-05-16', 'approved', { text: '今天，我参加了春季语文研修，学习了整本书阅读的课堂组织方法。' }),
  seed('r12', 't1', 'C12', '区县级公开课执教证明', '2026-10-06', 'returned', { inputType: 'image', imageSampleId: 'lesson-incomplete', level: '区县级', reviewerId: 't2', note: '图片未显示本人执教信息，请更换清晰完整的图片后重新提交。', history: ['教师提交图片', 'AI匹配示范服务，进入审核队列', '管理者审核未通过：图片未显示本人执教信息'] }),
];
export const STATUS_LABELS: Record<RecordStatus, string> = { approved: '已通过', pending: '待审核', returned: '未通过', withdrawn: '已撤回' };
