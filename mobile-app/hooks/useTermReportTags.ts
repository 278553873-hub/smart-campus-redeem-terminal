import { useMemo, useState } from 'react';
import { normalizeTermReportTags } from '../domain/termReportTags';
import { readTermReportTags, saveTermReportTags } from '../services/termReportTagStore';

export function useTermReportTags(key: string, defaults: readonly string[]) {
  const stored = useMemo(() => readTermReportTags(key), [key]);
  const [edited, setEdited] = useState<{ key: string; tags: string[] } | null>(null);
  const tags = edited?.key === key ? edited.tags : stored ?? defaults;
  const save = (draft: readonly string[]) => {
    const normalized = normalizeTermReportTags(draft);
    saveTermReportTags(key, normalized);
    setEdited({ key, tags: normalized });
  };
  return { tags, save };
}
