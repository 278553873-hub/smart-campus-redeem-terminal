import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import MobileBottomSheet from '../../mobile-app/components/ui/MobileBottomSheet.tsx';
import {
  PHOTO_CAPTURE_SCENES,
  VOICE_CAPTURE_SCENE,
  type CaptureScene,
} from '../domain/aiCapture.ts';
import type { GrowthRecord, GrowthRecordCategory } from '../domain/growthRecord.ts';
import { GROWTH_SCORE_TABLE } from '../domain/scoringTable.ts';
import { formatPoints, getRecordPoints, previewDraftImpact } from '../domain/scoring.ts';
import {
  buildDraftFromScene,
  buildManualDraft,
  draftToRecord,
  type DraftFields,
  type RecordDraft,
} from '../domain/recordDraft.ts';
import DraftRecordCard from '../components/DraftRecordCard.tsx';
import QuickInputBar, { type VoicePressState } from '../components/QuickInputBar.tsx';
import RecordFeedCard from '../components/RecordFeedCard.tsx';

interface RecordFeedViewProps {
  records: GrowthRecord[];
  termPoints: number;
  onSubmit: (record: GrowthRecord) => void;
  onOpenRecord: (record: GrowthRecord) => void;
}

const today = new Date().toISOString().slice(0, 10);
const nextDraftId = () => 'draft-' + Date.now().toString(36);

const RecordFeedView: React.FC<RecordFeedViewProps> = ({ records, termPoints, onSubmit, onOpenRecord }) => {
  const [draft, setDraft] = useState<RecordDraft | null>(null);
  const [voiceState, setVoiceState] = useState<VoicePressState>('idle');
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const analyzeTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (analyzeTimerRef.current !== null) window.clearTimeout(analyzeTimerRef.current);
  }, []);

  const runAnalyzing = useCallback((nextDraft: RecordDraft, delay: number) => {
    if (analyzeTimerRef.current !== null) window.clearTimeout(analyzeTimerRef.current);
    setDraft(nextDraft);
    analyzeTimerRef.current = window.setTimeout(() => {
      setDraft(current => (current && current.id === nextDraft.id ? { ...current, analyzing: false } : current));
    }, delay);
  }, []);

  const sortedRecords = useMemo(
    () => [...records].sort((left, right) => right.issuedAt.localeCompare(left.issuedAt)),
    [records],
  );

  const impact = useMemo(
    () => (draft
      ? previewDraftImpact(records, {
        category: draft.fields.category,
        level: draft.fields.level,
        rank: draft.fields.rank,
        issuedAt: draft.fields.issuedAt,
      })
      : { inCurrentTerm: true, delta: 0, sameCategoryBest: 0, yearCap: 0 }),
    [draft, records],
  );

  const pickPhotoScene = (scene: CaptureScene) => {
    setPhotoSheetOpen(false);
    runAnalyzing(buildDraftFromScene(scene, nextDraftId()), 1200);
  };

  const startManualDraft = (category: GrowthRecordCategory) => {
    setCategorySheetOpen(false);
    setDraft(buildManualDraft(category, today, nextDraftId()));
  };

  const handleVoiceStart = () => {
    if (draft) return;
    setVoiceState('listening');
  };

  const handleVoiceEnd = () => {
    if (voiceState !== 'listening') return;
    setVoiceState('idle');
    runAnalyzing(buildDraftFromScene(VOICE_CAPTURE_SCENE, nextDraftId()), 900);
  };

  const handleVoiceCancel = () => {
    if (voiceState !== 'listening') return;
    setVoiceState('idle');
  };

  const handleDraftChange = (fields: DraftFields) => {
    setDraft(current => (current ? { ...current, fields } : current));
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[var(--tm-bg-page)]">
      <div className="flex shrink-0 items-center px-[var(--tm-space-5)] pb-[var(--tm-space-2)] pt-[var(--tm-space-4)]">
        <button
          type="button"
          onClick={() => setCategorySheetOpen(true)}
          className="flex h-9 items-center gap-0.5 text-[14px] font-semibold text-[var(--tm-text-secondary)]"
        >
          指标
          <ChevronDown className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        </button>
        <span className="ml-auto text-[11px] font-medium text-[var(--tm-text-tertiary)]">内容由AI生成</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[var(--tm-space-2)]">
        {draft && (
          <div className="mb-[var(--tm-space-3)]">
            <DraftRecordCard
              draft={draft}
              impact={impact}
              onChange={handleDraftChange}
              onCancel={() => setDraft(null)}
              onConfirm={() => {
                onSubmit(draftToRecord(draft));
                setDraft(null);
              }}
            />
          </div>
        )}
        <div className="flex flex-col gap-[var(--tm-space-3)]">
          {sortedRecords.map(record => (
            <RecordFeedCard key={record.id} record={record} onOpen={onOpenRecord} />
          ))}
        </div>
      </div>

      <QuickInputBar
        voiceState={voiceState}
        disabled={draft !== null}
        onPhoto={() => setPhotoSheetOpen(true)}
        onManual={() => setCategorySheetOpen(true)}
        onVoiceStart={handleVoiceStart}
        onVoiceEnd={handleVoiceEnd}
        onVoiceCancel={handleVoiceCancel}
      />

      <MobileBottomSheet
        open={photoSheetOpen}
        title="拍照识别"
        onClose={() => setPhotoSheetOpen(false)}
      >
        <div className="flex flex-col gap-[var(--tm-space-2)]">
          {PHOTO_CAPTURE_SCENES.map(scene => (
            <button
              key={scene.id}
              type="button"
              onClick={() => pickPhotoScene(scene)}
              className="flex items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-2)] text-left"
            >
              <img
                src={scene.evidenceImage}
                alt={scene.evidenceLabel ?? '样例证书'}
                className="h-[52px] w-[70px] shrink-0 rounded-[var(--tm-radius-control)] object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold leading-snug text-[var(--tm-text-primary)]">
                  {scene.parsed.title}
                </span>
                <span className="mt-1 block text-[12px] font-medium tabular-nums text-[var(--tm-text-tertiary)]">
                  {scene.parsed.level} · {scene.parsed.rank} · {formatPoints(getRecordPoints(scene.parsed.category, scene.parsed.level, scene.parsed.rank))} 分
                </span>
              </span>
            </button>
          ))}
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={categorySheetOpen}
        title="选择指标"
        onClose={() => setCategorySheetOpen(false)}
      >
        <div className="flex flex-col gap-[var(--tm-space-2)]">
          {(Object.keys(GROWTH_SCORE_TABLE) as GrowthRecordCategory[]).map(category => (
            <button
              key={category}
              type="button"
              onClick={() => startManualDraft(category)}
              className="flex h-[var(--tm-choice-pill-touch-height)] w-full items-center justify-between gap-2 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] text-[15px] font-semibold text-[var(--tm-text-primary)]"
            >
              {category}
              <span className="text-[12px] font-medium text-[var(--tm-text-tertiary)]">
                {GROWTH_SCORE_TABLE[category].dimension}
              </span>
            </button>
          ))}
        </div>
      </MobileBottomSheet>
    </div>
  );
};

export default RecordFeedView;
