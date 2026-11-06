/** 家长日常记录的本地预览存储，与学校评价分数、成长币账本分开。 */
export interface ParentBehaviorDraft {
  content: string;
  occurredOn: string;
  images: string[];
  indicatorId?: string;
  indicatorLabel?: string;
}
export interface ParentBehaviorSubject {
  schoolCode: string;
  studentNo: string;
  name: string;
}
export interface ParentBehaviorRecord extends ParentBehaviorDraft {
  id: string;
  source: 'parent';
  subject: ParentBehaviorSubject;
  guardianId: string;
  author: string;
  createdAt: number;
}
const DEMO_IMAGES = ['/assets/parent-record-demo/reading.png', '/assets/parent-record-demo/cooperation.png', '/assets/parent-record-demo/housework.png'];
const validImage = (image: unknown): image is string => typeof image === 'string' && (image.startsWith('data:image/') || DEMO_IMAGES.includes(image));
const STORAGE_KEY = 'campus-parent-behavior-records:v1';
export const parentBehaviorSubjectKey = (subject: ParentBehaviorSubject) => `${subject.schoolCode}:${subject.studentNo}`;
export const todayForParentRecord = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
export const createParentBehaviorDraft = (): ParentBehaviorDraft => ({ content: '', occurredOn: todayForParentRecord(), images: [] });
export function readParentBehaviorRecords(): ParentBehaviorRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter(record => record?.source === 'parent' && typeof record.id === 'string'
      && typeof record.guardianId === 'string' && typeof record.author === 'string' && typeof record.content === 'string'
      && typeof record.occurredOn === 'string' && Number.isFinite(record.createdAt)
      && typeof record.subject?.schoolCode === 'string' && typeof record.subject?.studentNo === 'string'
      && Array.isArray(record.images) && record.images.every(validImage)) : [];
  } catch { return []; }
}
export function recordsForParentChild(records: ParentBehaviorRecord[], guardianId: string, subject: ParentBehaviorSubject) {
  return records.filter(record => record.guardianId === guardianId && parentBehaviorSubjectKey(record.subject) === parentBehaviorSubjectKey(subject))
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt - a.createdAt);
}
export function saveParentBehaviorRecord(draft: ParentBehaviorDraft, subject: ParentBehaviorSubject, guardianId: string, author: string, editingId?: string) {
  if (!draft.content.trim() && draft.images.length === 0) throw new Error('请描述孩子的表现，或添加一张图片。');
  if (draft.content.length > 2000) throw new Error('记录内容请控制在2000字以内。');
  const date = new Date(`${draft.occurredOn}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.occurredOn) || Number.isNaN(date.getTime())
    || date.getDate() !== Number(draft.occurredOn.slice(8)) || draft.occurredOn > todayForParentRecord()) throw new Error('请选择今天或之前的有效日期。');
  if (draft.images.length > 3 || draft.images.some(image => !validImage(image))) throw new Error('最多添加3张有效图片。');
  const record: ParentBehaviorRecord = { ...draft, content: draft.content.trim(), images: [...draft.images],
    id: crypto.randomUUID(), source: 'parent', subject: { name: subject.name, schoolCode: subject.schoolCode, studentNo: subject.studentNo }, guardianId, author, createdAt: Date.now() };
  const existing = readParentBehaviorRecords();
  const original = editingId ? existing.find(item => item.id === editingId && item.guardianId === guardianId && parentBehaviorSubjectKey(item.subject) === parentBehaviorSubjectKey(subject)) : undefined;
  if (editingId && !original) throw new Error('无法修改这条记录，请刷新后重试。');
  const records = original ? existing.map(item => item.id === original.id ? { ...original, content: record.content, occurredOn: record.occurredOn, images: record.images, indicatorId: record.indicatorId, indicatorLabel: record.indicatorLabel } : item) : [record, ...existing];
  // 写入失败时保留页面草稿，由调用方展示恢复提示。
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
  catch { throw new Error('保存失败，请减少图片后重试，文字和图片已保留。'); }
  return records;
}

export function deleteParentBehaviorRecord(id: string, subject: ParentBehaviorSubject, guardianId: string) {
  const records = readParentBehaviorRecords().filter(record => !(record.id === id && record.guardianId === guardianId && parentBehaviorSubjectKey(record.subject) === parentBehaviorSubjectKey(subject)));
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }
  catch { throw new Error('删除失败，请重试。'); }
  return records;
}

/** 每位家长只补充一次演示样例，保留已有记录，删除后不重新出现。 */
export function readParentRecordsWithDemo(guardianId: string, subjects: ParentBehaviorSubject[], author: string) {
  const existing = readParentBehaviorRecords();
  const marker = `${STORAGE_KEY}:photo-demo:${guardianId}`;
  try {
    if (window.localStorage.getItem(marker)) return readParentMonthlyDemo(guardianId, subjects, author);
    const subject = subjects.find(item => item.schoolCode === 'BS2024' && item.studentNo === '20250101');
    if (!subject) return existing;
    const now = Date.now();
    const samples: ParentBehaviorRecord[] = [
      { id: 'parent-photo-demo-reading', source: 'parent', guardianId, author, subject: { ...subject }, content: '今天主动完成阅读，还和家人分享了书里最喜欢的故事。', occurredOn: todayForParentRecord(), createdAt: now - 3600000, images: DEMO_IMAGES.slice(0, 2) },
      { id: 'parent-photo-demo-housework', source: 'parent', guardianId, author, subject: { ...subject }, content: '晚饭后主动收拾餐桌，把自己的碗筷洗干净了。', occurredOn: todayForParentRecord(), createdAt: now - 7200000, images: [DEMO_IMAGES[2]] },
    ];
    const next = [...existing, ...samples.filter(sample => !existing.some(item => item.id === sample.id && item.guardianId === guardianId))];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.localStorage.setItem(marker, '1');
    return readParentMonthlyDemo(guardianId, subjects, author);
  } catch { return existing; }
}

function readParentMonthlyDemo(guardianId: string, subjects: ParentBehaviorSubject[], author: string) {
  const existing = readParentBehaviorRecords();
  const marker = `${STORAGE_KEY}:monthly-demo:${guardianId}`;
  try {
    if (window.localStorage.getItem(marker)) return existing;
    const subject = subjects.find(item => item.schoolCode === 'BS2024' && item.studentNo === '20250101');
    if (!subject) return existing;
    const samples: ParentBehaviorRecord[] = [1, 2, 3].map(offset => {
      const date = new Date(); date.setMonth(date.getMonth() - offset, 15); date.setHours(19, 30, 0, 0);
      const occurredOn = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-15`;
      return { id: `parent-monthly-demo-${offset}`, source: 'parent', guardianId, author, subject: { ...subject }, occurredOn, createdAt: date.getTime(),
        content: ['周末和家人一起整理书架，把读过的书分类摆放。', '主动帮忙收拾餐桌，饭后还擦干净了桌子。', '和家人一起阅读，耐心讲述自己喜欢的故事。'][offset-1], images: [DEMO_IMAGES[(offset-1) % DEMO_IMAGES.length]] };
    });
    const next = [...existing, ...samples];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); window.localStorage.setItem(marker, '1');
    return next;
  } catch { return existing; }
}
