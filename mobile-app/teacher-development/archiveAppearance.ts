import archiveIllustration from './assets/dossier-cover.webp';

export { archiveIllustration };
export const ARCHIVE_TONES = ['terra', 'blue', 'sage', 'gold'] as const;

/** 教师检索、筛选后仍保留相同的身份识别色。 */
export function teacherArchiveTone(id: string) {
  return ARCHIVE_TONES[Array.from(id).reduce((sum, character) => sum + character.charCodeAt(0), 0) % ARCHIVE_TONES.length];
}
