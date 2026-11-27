import { useRef, useState } from 'react';
import { resolveMedalIcon } from '../assets/medals';
import MedalIconView from '../components/medal/MedalIcon';
import MobileFormActionBar from '../components/ui/MobileFormActionBar';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import TextSelectionControl from '../components/ui/TextSelectionControl';
import { PLATFORM_MEDAL_GROUPS, type MedalDefinition } from '../domain/medal';
import {
  getSchoolManualMedalCatalog,
  type SchoolCustomMedalInput,
  type SchoolMedalSettings,
} from '../domain/schoolMedals';
import SchoolMedalEditorSheet from './SchoolMedalEditorSheet';

interface SchoolMedalSettingsViewProps {
  settings: SchoolMedalSettings;
  onBack: () => void;
  onSaveCustomMedal: (input: SchoolCustomMedalInput) => Promise<void>;
  onDeleteCustomMedal: (medalId: string) => Promise<void>;
}

const medalTabs = [
  { value: 'platform', label: '平台奖章' },
  { value: 'custom', label: '学校特色奖章' },
] as const;
type MedalSettingsTab = typeof medalTabs[number]['value'];

interface MedalEditorSession {
  version: number;
  open: boolean;
  medal?: MedalDefinition;
  initialAvailability?: boolean;
}

const tileClass = 'flex min-w-0 flex-col items-center gap-[var(--tm-space-1)] text-center';

export default function SchoolMedalSettingsView({ settings, onBack, onSaveCustomMedal, onDeleteCustomMedal }: SchoolMedalSettingsViewProps) {
  const [tab, setTab] = useState<MedalSettingsTab>('platform');
  const [editor, setEditor] = useState<MedalEditorSession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedalDefinition | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const deletingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPlatform = tab === 'platform';
  const enabledIds = new Set(settings.enabled ? settings.availableMedalIds : []);
  const manualIds = new Set(getSchoolManualMedalCatalog(settings).map(medal => medal.id));
  const groups = (isPlatform
    ? PLATFORM_MEDAL_GROUPS
    : [{ id: 'school', label: medalTabs[1].label, medals: settings.customMedals }]
  ).filter(group => group.medals.length > 0);
  const contentBottomClass = isPlatform
    ? 'pb-[calc(var(--tm-space-4)+max(var(--mini-program-bottom-safe-area,0px),env(safe-area-inset-bottom,0px)))]'
    : 'pb-[var(--tm-space-4)]';

  const changeTab = (next: MedalSettingsTab) => {
    if (tab === next) return;
    scrollRef.current?.scrollTo({ top: 0 });
    setTab(next);
  };

  const openEditor = (medal?: MedalDefinition) => {
    setEditor(previous => ({
      version: (previous?.version ?? 0) + 1,
      open: true,
      medal,
      initialAvailability: medal && manualIds.has(medal.id) ? enabledIds.has(medal.id) : undefined,
    }));
  };

  const requestDelete = () => {
    if (!editor?.medal) return;
    setDeleteError('');
    setDeleteTarget(editor.medal);
    setEditor({ ...editor, open: false });
  };

  const cancelDelete = () => {
    if (deletingRef.current) return;
    setDeleteTarget(null);
    setDeleteError('');
    setEditor(previous => previous ? { ...previous, open: true } : null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    setDeleteError('');
    try {
      await onDeleteCustomMedal(deleteTarget.id);
      setDeleteTarget(null);
      setEditor(null);
    } catch {
      setDeleteError('删除失败，请重试');
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]">
      <MobilePageHeader title="奖章设置" onBack={onBack} />
      <TextSelectionControl value={tab} items={medalTabs} onChange={changeTab} ariaLabel="奖章类型"
        variant="page" />
      <div ref={scrollRef} data-view-scroll-root role="tabpanel" aria-label={isPlatform ? medalTabs[0].label : medalTabs[1].label}
        className={`min-h-0 flex-1 space-y-[var(--tm-layout-card-gap)] overflow-y-auto px-[var(--tm-space-3)] pt-[var(--tm-layout-first-card-gap)] no-scrollbar ${contentBottomClass}`}>
        {groups.map(group => (
          <section key={group.id} aria-labelledby={isPlatform ? `school-medal-group-${group.id}` : undefined}
            className="space-y-[var(--tm-space-2)] rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] pt-[var(--tm-space-2)] pb-[var(--tm-space-3)]">
            {isPlatform && <h2 id={`school-medal-group-${group.id}`} className="text-[length:var(--tm-font-size-card-title)] [font-weight:var(--tm-font-weight-bold)]">{group.label}</h2>}
            <ul className="grid gap-x-[var(--tm-space-2)] grid-cols-4 gap-y-[var(--tm-space-2)]">
              {group.medals.map(medal => {
                const content = (
                  <>
                    <div className="h-[var(--tm-medal-settings-icon-size)] w-[var(--tm-medal-settings-icon-size)] shrink-0" aria-hidden="true">
                      <MedalIconView icon={resolveMedalIcon(medal.id, medal.icon)} className="h-full w-full text-[var(--tm-brand-reward)]" />
                    </div>
                    <span className="text-balance text-[length:var(--tm-font-size-compact)] leading-[var(--tm-space-4)] [overflow-wrap:anywhere] [font-weight:var(--tm-font-weight-regular)]">{medal.name}</span>
                    {!isPlatform && manualIds.has(medal.id) && !enabledIds.has(medal.id) && (
                      <span className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">已停用</span>
                    )}
                  </>
                );
                return (
                  <li key={medal.id} className="min-w-0">
                    {!isPlatform ? (
                      <button type="button" className={`${tileClass} w-full rounded-[var(--tm-radius-card-compact)] transition-colors [transition-duration:var(--tm-duration-fast)] enabled:active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none`}
                        onClick={() => openEditor(medal)}>
                        {content}
                      </button>
                    ) : (
                      <div className={tileClass}>{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {groups.length === 0 && (
          <p className="py-[var(--tm-space-8)] text-center text-[length:var(--tm-font-size-body)] text-[var(--tm-text-secondary)]" role="status">
            {isPlatform ? '暂无平台奖章' : '暂无学校特色奖章'}
          </p>
        )}
      </div>
      {!isPlatform && <MobileFormActionBar type="button" label="新增奖章" onClick={() => openEditor()} />}
      {editor && (
        <SchoolMedalEditorSheet key={editor.version} open={editor.open} medal={editor.medal}
          initialAvailability={editor.initialAvailability} onSave={onSaveCustomMedal}
          onRequestDelete={requestDelete}
          onClose={() => setEditor({ ...editor, open: false })} />
      )}
      <MobileConfirmSheet open={Boolean(deleteTarget)} shape="subtle" tone="danger"
        title={`删除“${deleteTarget?.name ?? '奖章'}”？`}
        description="该奖章将从学校图库和可发列表中移除，已发放给学生的奖章继续保留。"
        confirmLabel={deleting ? '删除中…' : '删除奖章'} confirmDisabled={deleting}
        errorMessage={deleteError} onClose={cancelDelete} onConfirm={confirmDelete} />
    </div>
  );
}
