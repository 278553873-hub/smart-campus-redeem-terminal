import { useRef, useState } from 'react';
import { resolveMedalIcon } from '../assets/medals';
import MedalIconView from '../components/medal/MedalIcon';
import MobileSelectionIndicator from '../components/student/MobileSelectionIndicator';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import { PLATFORM_MEDAL_GROUPS } from '../domain/medal';
import {
  getSchoolManualMedalCatalog,
  type SchoolMedalAvailabilityChange,
  type SchoolMedalSettings,
} from '../domain/schoolMedals';

type Mode = 'overview' | 'remove' | 'library';

interface SchoolMedalSettingsViewProps {
  settings: SchoolMedalSettings;
  onBack: () => void;
  onSave: (change: SchoolMedalAvailabilityChange, medalIds: readonly string[]) => Promise<void>;
}

const pageTitles: Record<Mode, string> = {
  overview: '奖章设置',
  remove: '移除奖章',
  library: '奖章库',
};
const actionClass = 'inline-flex min-h-[var(--tm-size-touch)] min-w-[var(--tm-size-touch)] items-center justify-center whitespace-nowrap rounded-[var(--tm-radius-control-compact)] px-[var(--tm-space-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]';
const overviewActionClass = `${actionClass} text-[length:var(--tm-font-size-compact)] [font-weight:var(--tm-font-weight-regular)] text-[var(--tm-text-action)] active:bg-[var(--tm-bg-surface-muted)]`;
const confirmActionClass = `${actionClass} text-[length:var(--tm-font-size-body)] [font-weight:var(--tm-font-weight-semibold)] text-[var(--tm-brand-primary-strong)] enabled:active:bg-[var(--tm-brand-primary-soft)] disabled:text-[var(--tm-text-disabled)]`;
const tileClass = 'relative flex min-w-0 flex-col items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-card-compact)] py-[var(--tm-space-1)] text-center';

export default function SchoolMedalSettingsView({ settings, onBack, onSave }: SchoolMedalSettingsViewProps) {
  const [mode, setMode] = useState<Mode>('overview');
  const [selection, setSelection] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const editing = mode !== 'overview';
  const inLibrary = mode === 'library';
  const enabledIds = new Set(settings.enabled ? settings.availableMedalIds : []);
  const manualIds = new Set(getSchoolManualMedalCatalog(settings).map(medal => medal.id));
  const groups = [
    ...PLATFORM_MEDAL_GROUPS,
    { id: 'school', label: '学校奖章', medals: settings.customMedals },
  ].map(group => ({
    ...group,
    medals: group.medals.filter(medal =>
      manualIds.has(medal.id) && enabledIds.has(medal.id) !== inLibrary,
    ),
  })).filter(group => group.medals.length > 0);
  const selectedIds = groups.flatMap(group => group.medals.filter(medal => selection.has(medal.id)).map(medal => medal.id));

  const changeMode = (next: Mode) => {
    if (next === 'library' || mode === 'library') scrollRef.current?.scrollTo({ top: 0 });
    setSelection(new Set());
    setError('');
    setMode(next);
  };

  const toggleSelection = (id: string) => {
    setSelection(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirm = async () => {
    if (saving || !selectedIds.length) return;
    setSaving(true);
    setError('');
    try {
      await onSave(inLibrary ? 'add' : 'remove', selectedIds);
      changeMode('overview');
    } catch {
      setError('奖章设置保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const confirmLabel = inLibrary ? '添加' : '确认移除';
  const handleBack = () => {
    if (saving) return;
    if (editing) changeMode('overview');
    else onBack();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]">
      <MobilePageHeader title={pageTitles[mode]} onBack={handleBack} />
      {(!editing || groups.length > 0) && (
        <div className="flex shrink-0 items-center justify-end gap-[var(--tm-space-2)] bg-[var(--tm-page-plain-header-bg)] px-[var(--tm-space-4)]" role="group" aria-label="奖章操作">
          {editing ? (
            <button type="button" className={confirmActionClass}
              disabled={saving || !selectedIds.length} onClick={() => void confirm()}>
              {saving ? '保存中…' : confirmLabel + (selectedIds.length ? `（${selectedIds.length}）` : '')}
            </button>
          ) : (
            <>
              {groups.length > 0 && (
                <button type="button" className={overviewActionClass} onClick={() => changeMode('remove')}>移除</button>
              )}
              <button type="button" className={overviewActionClass} onClick={() => changeMode('library')}>奖章库</button>
            </>
          )}
        </div>
      )}
      {error && <p className="px-[var(--tm-space-4)] pb-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-status-negative-strong)]" role="alert">{error}</p>}
      <div ref={scrollRef} data-view-scroll-root
        className="min-h-0 flex-1 space-y-[var(--tm-layout-card-gap)] overflow-y-auto px-[var(--tm-space-3)] pb-[calc(var(--tm-space-4)+max(var(--mini-program-bottom-safe-area,0px),env(safe-area-inset-bottom,0px)))] pt-[var(--tm-space-2)] no-scrollbar">
        {groups.map(group => (
          <section key={group.id} aria-labelledby={`school-medal-group-${group.id}`}
            className="space-y-[var(--tm-space-4)] rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] py-[var(--tm-space-4)]">
            <h2 id={`school-medal-group-${group.id}`} className="text-[length:var(--tm-font-size-card-title)] [font-weight:var(--tm-font-weight-bold)]">{group.label}</h2>
            <ul className="grid grid-cols-3 gap-x-[var(--tm-space-2)] gap-y-[var(--tm-space-4)]">
              {group.medals.map(medal => {
                const selected = selection.has(medal.id);
                const content = (
                  <>
                    <div className="aspect-square w-full max-w-[var(--tm-medal-settings-icon-size)] shrink-0" aria-hidden="true">
                      <MedalIconView icon={resolveMedalIcon(medal.id, medal.icon)} className="h-full w-full text-[var(--tm-brand-reward)]" />
                    </div>
                    <span className="[overflow-wrap:anywhere] text-[length:var(--tm-font-size-body)] [font-weight:var(--tm-font-weight-regular)]">{medal.name}</span>
                  </>
                );
                return (
                  <li key={medal.id} className="min-w-0">
                    {editing ? (
                      <button type="button" className={`${tileClass} w-full transition-colors [transition-duration:var(--tm-duration-fast)] enabled:active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)] motion-reduce:transition-none`}
                        aria-pressed={selected} disabled={saving} onClick={() => toggleSelection(medal.id)}>
                        {content}
                        <MobileSelectionIndicator selected={selected} className={`absolute right-[var(--tm-space-1)] top-[var(--tm-space-1)] ${selected ? '' : '!text-[var(--tm-border-control)]'}`} />
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
            {inLibrary ? '暂无可添加的奖章' : '暂无可颁发的奖章'}
          </p>
        )}
      </div>
    </div>
  );
}
