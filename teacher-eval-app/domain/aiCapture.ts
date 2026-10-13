import { getCategoryDefinition, type GrowthRecord } from './growthRecord.ts';
import { getRecordPoints } from './scoring.ts';

/**
 * AI 智能填报的演示场景。
 *
 * Demo 阶段不调用真实模型：口述文本与识别结果都是预设好的确定性结果，
 * 保证演示秒级响应、不依赖网络与密钥，产品链路与真实实现保持一致。
 */
export interface CaptureScene {
  id: string;
  channel: 'voice' | 'photo';
  /** 语音场景：老师口述的原文，页面上逐字展示 */
  utterance?: string;
  /** 演示用的语音时长（秒） */
  voiceSeconds?: number;
  /** 拍照场景：样例证书图片 */
  evidenceImage?: string;
  evidenceLabel?: string;
  parsed: {
    title: string;
    category: GrowthRecord['category'];
    level: GrowthRecord['level'];
    rank: GrowthRecord['rank'];
    issuer: string;
    issuedAt: string;
  };
  /** AI 归类与赋分依据，展示在解析结果页 */
  reasoning: string;
}

export const VOICE_CAPTURE_SCENE: CaptureScene = {
  id: 'capture-voice',
  channel: 'voice',
  voiceSeconds: 12,
  utterance: '把这件事记一下：这学期我指导学生参加四川省中学生作文大赛，拿到了省级一等奖，证书是四川省教育科学研究院 10 月 8 号发的。',
  parsed: {
    title: '四川省中学生作文大赛 优秀指导教师',
    category: '学生发展与辅导',
    level: '省级',
    rank: '一等奖',
    issuer: '四川省教育科学研究院',
    issuedAt: '2026-10-08',
  },
  reasoning: '口述里包含“指导学生”“省级一等奖”“四川省教育科学研究院”，按「学生发展与辅导 · 省级 · 一等奖」计 4 分。',
};

export const PHOTO_CAPTURE_SCENES: CaptureScene[] = [
  {
    id: 'capture-photo-course',
    channel: 'photo',
    evidenceImage: '/assets/teacher-eval/cert-provincial-course.jpg',
    evidenceLabel: '优质课展评获奖证书',
    parsed: {
      title: '四川省高中语文优质课展评',
      category: '教学比赛',
      level: '省级',
      rank: '一等奖',
      issuer: '四川省教育科学研究院',
      issuedAt: '2026-09-10',
    },
    reasoning: '证书落款单位为四川省教育科学研究院，属教育行政部门直属单位主办的省级赛课，按「教学比赛 · 省级 · 一等奖」计 6 分。',
  },
  {
    id: 'capture-photo-paper',
    channel: 'photo',
    evidenceImage: '/assets/teacher-eval/cert-city-paper.jpg',
    evidenceLabel: '论文评选获奖证书',
    parsed: {
      title: '成都市中学语文教学论文评选',
      category: '论文与著作',
      level: '市级',
      rank: '一等奖',
      issuer: '成都市教育科学研究院',
      issuedAt: '2026-09-20',
    },
    reasoning: '证书落款单位为成都市教育科学研究院，属市级教育科研机构组织的论文评选，按「论文与著作 · 市级 · 一等奖」计 2 分。',
  },
  {
    id: 'capture-photo-training',
    channel: 'photo',
    evidenceImage: '/assets/teacher-eval/cert-training.jpg',
    evidenceLabel: '研修班结业证书',
    parsed: {
      title: '成都市高中语文骨干教师研修班',
      category: '培训进修',
      level: '市级',
      rank: '参与',
      issuer: '成都市教师发展中心',
      issuedAt: '2026-09-28',
    },
    reasoning: '证书为研修班结业凭证、没有等次，按「培训进修 · 市级 · 参与」计 0.5 分。',
  },
];

export const findCaptureScene = (sceneId: string): CaptureScene | undefined => (
  sceneId === VOICE_CAPTURE_SCENE.id
    ? VOICE_CAPTURE_SCENE
    : PHOTO_CAPTURE_SCENES.find(scene => scene.id === sceneId)
);

export const buildRecordFromCaptureScene = (scene: CaptureScene, recordId: string): GrowthRecord => ({
  id: recordId,
  title: scene.parsed.title,
  category: scene.parsed.category,
  dimension: getCategoryDefinition(scene.parsed.category).dimension,
  level: scene.parsed.level,
  rank: scene.parsed.rank,
  issuer: scene.parsed.issuer,
  issuedAt: scene.parsed.issuedAt,
  points: getRecordPoints(scene.parsed.category, scene.parsed.level, scene.parsed.rank),
  source: scene.channel,
  evidenceImage: scene.evidenceImage,
  evidenceLabel: scene.evidenceLabel,
  reviewStatus: '待审核',
  inputText: scene.utterance,
  voiceSeconds: scene.voiceSeconds,
});

/** 智能填报三步说明，用于填报入口的引导。 */
export const CAPTURE_STEPS = [
  { id: 'step-1', title: '口述或拍照', description: '说一句话，或者上传一张证书照片' },
  { id: 'step-2', title: '自动识别归类', description: '自动填写事项、级别、等次、颁发单位与日期' },
  { id: 'step-3', title: '确认提交', description: '核对无误后提交，进入学校审核' },
];
