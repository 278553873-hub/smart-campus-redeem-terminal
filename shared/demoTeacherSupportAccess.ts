import { DEMO_TEACHER_ACCOUNTS, findDemoTeacherAccount } from './demoTeacherAccounts.ts';

// 独立的演示授权数据。每个账号单独存储，多个标签页添加不同账号时互不覆盖。
const storagePrefix = 'letu-demo-teacher-support:v1:';
const changeEvent = 'letu-demo-teacher-support-change';

export function hasDemoTeacherSupportAccess(phone?: string): boolean {
    const account = phone && findDemoTeacherAccount(phone);
    try {
        return Boolean(account && window.localStorage.getItem(storagePrefix + account.id) === '1');
    } catch {
        return false;
    }
}

export const readDemoTeacherSupportAccounts = () => (
    DEMO_TEACHER_ACCOUNTS.filter(account => hasDemoTeacherSupportAccess(account.phone))
);

export function addDemoTeacherSupportAccount(phone: string): void {
    const account = findDemoTeacherAccount(phone);
    if (!account) throw new Error('未找到该手机号对应的教师账号');

    window.localStorage.setItem(storagePrefix + account.id, '1');
    window.dispatchEvent(new Event(changeEvent));
}

export function removeDemoTeacherSupportAccount(phone: string): void {
    const account = findDemoTeacherAccount(phone);
    if (!account) return;

    window.localStorage.removeItem(storagePrefix + account.id);
    window.dispatchEvent(new Event(changeEvent));
}

export function subscribeToDemoTeacherSupportAccess(onChange: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key.startsWith(storagePrefix)) onChange();
    };
    window.addEventListener(changeEvent, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
        window.removeEventListener(changeEvent, onChange);
        window.removeEventListener('storage', onStorage);
    };
}
