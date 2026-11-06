/** 学校级家长录入策略；演示配置按学校隔离保存。 */
export interface ParentRecordingSettings { enabled: boolean; photoEnabled: boolean }
const KEY = 'campus-parent-recording-settings:v1';
export const PARENT_RECORDING_UPDATED = 'parent-recording-settings-updated';
export const parentRecordingSchoolId = (id: string) => id === 'BS2024' ? 'school-star' : id;
export function readParentRecordingSettings(schoolId: string): ParentRecordingSettings {
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY) || '{}')[parentRecordingSchoolId(schoolId)];
    return { enabled: typeof value?.enabled === 'boolean' ? value.enabled : true,
      photoEnabled: typeof value?.photoEnabled === 'boolean' ? value.photoEnabled : true };
  } catch { return { enabled: true, photoEnabled: true }; }
}
export function writeParentRecordingSettings(schoolId: string, settings: ParentRecordingSettings) {
  const store = JSON.parse(window.localStorage.getItem(KEY) || '{}');
  window.localStorage.setItem(KEY, JSON.stringify({ ...store, [parentRecordingSchoolId(schoolId)]: settings }));
  window.dispatchEvent(new Event(PARENT_RECORDING_UPDATED));
}
