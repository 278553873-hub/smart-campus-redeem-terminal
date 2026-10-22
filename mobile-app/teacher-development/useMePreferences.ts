import { useState } from 'react';

export interface PersonalSettings { phone: string; avatar: string; }
export interface CollectionAnswer { focus: string; support: string; }
interface Feedback { id: string; text: string; images?: string[]; createdAt: string; }
interface TeacherPreferences { profile?: PersonalSettings; collection?: CollectionAnswer; feedback: Feedback[]; }
type Preferences = Record<string, TeacherPreferences>;
const KEY = 'teacher-development-me-v1';
function readPreferences(): Preferences {
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => {
      const item = entry as TeacherPreferences;
      return item && Array.isArray(item.feedback) && item.feedback.every(f => typeof f.text === 'string' && typeof f.id === 'string' && typeof f.createdAt === 'string' && (f.images === undefined || Array.isArray(f.images) && f.images.every(image => typeof image === 'string')))
        && (!item.profile || ['phone', 'avatar'].every(key => typeof item.profile?.[key as keyof PersonalSettings] === 'string'))
        && (!item.collection || typeof item.collection.focus === 'string' && typeof item.collection.support === 'string');
    }).map(([id, item]) => [id, item as TeacherPreferences] as const));
  } catch { return {}; }
}
/** 教师评价演示的个人偏好按账号隔离；写入失败时保留表单，交由页面提示重试。 */
export function useMePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);
  const update = (actorId: string, patch: Partial<TeacherPreferences>) => {
    const next = { ...preferences, [actorId]: { feedback: [], ...preferences[actorId], ...patch } };
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); setPreferences(next); return true; }
    catch { return false; }
  };
  const reset = () => { try { window.localStorage.removeItem(KEY); setPreferences({}); return true; } catch { return false; } };
  return { preferences, update, reset };
}
