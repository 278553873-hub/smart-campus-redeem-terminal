import {
  getCategoryDefinition,
  type GrowthRecord,
  type GrowthRecordCategory,
  type GrowthRecordLevel,
  type GrowthRecordRank,
  type GrowthRecordSource,
} from './growthRecord.ts';
import { getRecordPoints } from './scoring.ts';
import type { CaptureScene } from './aiCapture.ts';

export interface DraftFields {
  title: string;
  category: GrowthRecordCategory;
  level: GrowthRecordLevel;
  rank: GrowthRecordRank;
  issuer: string;
  issuedAt: string;
}

export interface RecordDraft {
  id: string;
  channel: GrowthRecordSource;
  /** 识别中：卡片先出现，字段出齐后再允许提交 */
  analyzing: boolean;
  fields: DraftFields;
  inputText?: string;
  voiceSeconds?: number;
  evidenceImage?: string;
  evidenceLabel?: string;
  /** AI 归类与赋分依据；手动填报没有这一段 */
  reasoning?: string;
}

export const buildDraftFromScene = (scene: CaptureScene, id: string): RecordDraft => ({
  id,
  channel: scene.channel,
  analyzing: true,
  fields: {
    title: scene.parsed.title,
    category: scene.parsed.category,
    level: scene.parsed.level,
    rank: scene.parsed.rank,
    issuer: scene.parsed.issuer,
    issuedAt: scene.parsed.issuedAt,
  },
  inputText: scene.utterance,
  voiceSeconds: scene.voiceSeconds,
  evidenceImage: scene.evidenceImage,
  evidenceLabel: scene.evidenceLabel,
  reasoning: scene.reasoning,
});

export const buildManualDraft = (
  category: GrowthRecordCategory,
  issuedAt: string,
  id: string,
): RecordDraft => ({
  id,
  channel: 'manual',
  analyzing: false,
  fields: { title: '', category, level: '市级', rank: '一等奖', issuer: '', issuedAt },
});

export const draftToRecord = (draft: RecordDraft): GrowthRecord => ({
  id: 'rec-' + draft.id,
  title: draft.fields.title.trim() || draft.fields.category,
  category: draft.fields.category,
  dimension: getCategoryDefinition(draft.fields.category).dimension,
  level: draft.fields.level,
  rank: draft.fields.rank,
  issuer: draft.fields.issuer.trim() || '待补充',
  issuedAt: draft.fields.issuedAt,
  points: getRecordPoints(draft.fields.category, draft.fields.level, draft.fields.rank),
  source: draft.channel,
  inputText: draft.inputText,
  voiceSeconds: draft.voiceSeconds,
  evidenceImage: draft.evidenceImage,
  evidenceLabel: draft.evidenceLabel,
  reviewStatus: '待审核',
});
