import {
  GROWTH_CATEGORY_DEFINITIONS,
  type GrowthRecord,
  type GrowthRecordCategory,
  type TeacherEvalDimension,
} from './growthRecord.ts';
import { getRecordPoints } from './scoring.ts';

export interface TeacherEvalProfile {
  name: string;
  school: string;
  subject: string;
  title: string;
  department: string;
  joinedYear: number;
  homeroomClass: string;
}

export const DEMO_TEACHER_PROFILE: TeacherEvalProfile = {
  name: '张岚',
  school: '四川省成都市玉林中学',
  subject: '高中语文',
  title: '一级教师',
  department: '高中语文教研组',
  joinedYear: 2013,
  homeroomClass: '高二（3）班',
};

const DIMENSION_BY_CATEGORY = GROWTH_CATEGORY_DEFINITIONS.reduce<Record<GrowthRecordCategory, TeacherEvalDimension>>(
  (map, definition) => {
    map[definition.id] = definition.dimension;
    return map;
  },
  {} as Record<GrowthRecordCategory, TeacherEvalDimension>,
);

interface DemoRecordSeed extends Omit<GrowthRecord, 'dimension' | 'points'> {}

/** 演示数据：13 条记录覆盖六个维度，含 1 条审核未通过，便于演示审核状态与原因回填。 */
const DEMO_RECORD_SEEDS: DemoRecordSeed[] = [
  {
    id: 'rec-term-01',
    title: '成都市高中语文优质课展评',
    category: '教学比赛',
    level: '市级',
    rank: '二等奖',
    issuer: '成都市教育科学研究院',
    issuedAt: '2026-09-12',
    source: 'manual',
    inputText: '9 月 12 日在成都市高中语文优质课展评中执教《赤壁赋》，获二等奖。',
    reviewStatus: '已通过',
  },
  {
    id: 'rec-term-02',
    title: '成都市中学语文教学论文评选',
    category: '论文与著作',
    level: '市级',
    rank: '三等奖',
    issuer: '成都市教育科学研究院',
    issuedAt: '2026-09-22',
    source: 'manual',
    inputText: '论文《群文阅读在高中语文课堂的落地路径》参加市级评选，获三等奖。',
    reviewStatus: '待审核',
  },
  {
    id: 'rec-term-03',
    title: '玉林中学语文组校本教研公开课',
    category: '示范引领',
    level: '校级',
    rank: '二等奖',
    issuer: '四川省成都市玉林中学',
    issuedAt: '2026-09-05',
    source: 'voice',
    inputText: '9 月 5 号在语文组校本教研上做了一节公开课，讲《乡土中国》，组内评了二等奖。',
    voiceSeconds: 9,
    reviewStatus: '已通过',
  },
  {
    id: 'rec-term-04',
    title: '成都市中学班主任优秀案例评选',
    category: '荣誉表彰',
    level: '市级',
    rank: '一等奖',
    issuer: '某教育学会',
    issuedAt: '2026-09-25',
    source: 'manual',
    inputText: '参加市级班主任优秀案例评选，获一等奖，证书由教育学会颁发。',
    reviewStatus: '未通过',
    reviewNote: '主办单位为学会，需补充教育行政部门认定的材料后重新提交。',
  },
  {
    id: 'rec-2026-06-20',
    title: '四川省民族地区送教下乡专题讲座',
    category: '示范引领',
    level: '省级',
    rank: '三等奖',
    issuer: '四川省教育科学研究院',
    issuedAt: '2026-06-20',
    source: 'manual',
    inputText: '6 月 20 日到民族地区送教，做《群文阅读怎么教》专题讲座。',
    reviewStatus: '已通过',
  },
  {
    id: 'rec-2026-05-18',
    title: '成都市高中语文优质课展评',
    category: '教学比赛',
    level: '市级',
    rank: '二等奖',
    issuer: '成都市教育科学研究院',
    issuedAt: '2026-05-18',
    source: 'manual',
    inputText: '5 月 18 日参加成都市高中语文优质课展评复赛，获二等奖。',
    reviewStatus: '已通过',
  },
  {
    id: 'rec-2026-05-08',
    title: '成都市中学生作文大赛 优秀指导教师',
    category: '学生发展与辅导',
    level: '区县级',
    rank: '一等奖',
    issuer: '成都市武侯区教育科学研究院',
    issuedAt: '2026-05-08',
    source: 'manual',
    inputText: '指导学生参加成都市中学生作文大赛，两名学生获一等奖。',
    reviewStatus: '已通过',
  },
  {
    id: 'rec-2026-04-10',
    title: '四川省中学语文教学论文评选',
    category: '论文与著作',
    level: '省级',
    rank: '二等奖',
    issuer: '四川省教育科学研究院',
    issuedAt: '2026-04-10',
    source: 'manual',
    inputText: '论文《高中语文整本书阅读的课时设计》获省级评选二等奖。',
    reviewStatus: '已通过',
  },
  {
    id: 'rec-2026-03-06',
    title: '成都市高中语文阅读教学专项课题（结题）',
    category: '课题研究',
    level: '市级',
    rank: '一等奖',
    issuer: '成都市教育科学研究院',
    issuedAt: '2026-03-06',
    source: 'manual',
    inputText: '主持的市级课题《高中语文阅读教学专项研究》通过结题鉴定。',
    reviewStatus: '已通过',
  },
  {
    id: 'rec-2026-01-15',
    title: '自制古诗文学习资源包评比',
    category: '数字素养与创新实践',
    level: '校级',
    rank: '三等奖',
    issuer: '四川省成都市玉林中学',
    issuedAt: '2026-01-15',
    source: 'manual',
    inputText: '做的古诗文学习资源包参加学校评比，获三等奖。',
    reviewStatus: '已通过',
  },
  {
    id: 'rec-2025-12-11',
    title: '玉林中学语文组校本教研公开课',
    category: '示范引领',
    level: '校级',
    rank: '一等奖',
    issuer: '四川省成都市玉林中学',
    issuedAt: '2025-12-11',
    source: 'manual',
    inputText: '12 月 11 日在语文组校本教研上执教公开课，组内评了一等奖。',
    reviewStatus: '已通过',
  },
  {
    id: 'rec-2025-11-27',
    title: '成都市高中语文骨干教师研修班（优秀学员）',
    category: '培训进修',
    level: '市级',
    rank: '一等奖',
    issuer: '成都市教师发展中心',
    issuedAt: '2025-11-27',
    source: 'manual',
    inputText: '参加成都市高中语文骨干教师研修班，获评优秀学员。',
    reviewStatus: '已通过',
  },
  {
    id: 'rec-2025-10-16',
    title: '玉林中学优秀班主任',
    category: '荣誉表彰',
    level: '校级',
    rank: '一等奖',
    issuer: '四川省成都市玉林中学',
    issuedAt: '2025-10-16',
    source: 'manual',
    inputText: '被评为玉林中学优秀班主任。',
    reviewStatus: '已通过',
  },
];

export const DEMO_GROWTH_RECORDS: GrowthRecord[] = DEMO_RECORD_SEEDS.map(seed => ({
  ...seed,
  dimension: DIMENSION_BY_CATEGORY[seed.category],
  points: getRecordPoints(seed.category, seed.level, seed.rank),
}));
