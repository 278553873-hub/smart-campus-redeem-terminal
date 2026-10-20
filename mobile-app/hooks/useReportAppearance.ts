import { useEffect, useState } from 'react';
import { effectiveReportAppearance } from '../domain/termReportAppearance';
import { APPEARANCE_CHANGED, appearanceKey, readReportAppearance } from '../services/termReportAppearanceStore';
export function useReportAppearance(spaceId: string, schoolName: string) {
  const [state, setState] = useState(() => ({ spaceId, config: readReportAppearance(spaceId, schoolName) }));
  useEffect(() => {
    const reload = () => setState({ spaceId, config: readReportAppearance(spaceId, schoolName) });
    const onStorage = (event: StorageEvent) => { if (!event.key || event.key === appearanceKey(spaceId)) reload(); };
    reload();
    window.addEventListener(APPEARANCE_CHANGED, reload);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(APPEARANCE_CHANGED, reload); window.removeEventListener('storage', onStorage); };
  }, [spaceId, schoolName]);
  return effectiveReportAppearance(state.spaceId === spaceId ? state.config : readReportAppearance(spaceId, schoolName), schoolName);
}
