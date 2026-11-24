import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { DEMO_TEACHER_ACCOUNTS, findDemoTeacherAccount } from './demoTeacherAccounts.ts';

// 演示授权按账号存储，验证结果绑定本次设置的安全码。
const storagePrefix = 'letu-demo-teacher-support:v1:';
const previewPrefix = 'letu-demo-teacher-support-preview:v1:';
const changeEvent = 'letu-demo-teacher-support-change';

export const DEMO_TEACHER_PREVIEW_SECURITY_CODE = 'Preview2026';
export const TEACHER_SUPPORT_SECURITY_CODE_HINT = '至少 8 位，仅限数字和英文字母，两种都须包含';

export function isTeacherSupportSecurityCode(code: string): boolean {
    return code.length >= 8 && !/[^A-Za-z0-9]/.test(code) && /[A-Za-z]/.test(code) && /[0-9]/.test(code);
}

interface SupportGrant {
    salt: string;
    verifier: string;
    verified: boolean;
}

function readGrant(key: string): SupportGrant | 'legacy' | null {
    try {
        const raw = window.localStorage.getItem(key);
        if (raw === '1') return 'legacy';
        if (!raw) return null;
        const record = JSON.parse(raw) as SupportGrant | null;
        return record && /^[a-f0-9]{32}$/.test(record.salt) && /^[a-f0-9]{64}$/.test(record.verifier)
            && typeof record.verified === 'boolean' ? record : null;
    } catch {
        return null;
    }
}

export function hasDemoTeacherSupportAccess(phone?: string): boolean {
    const account = phone && findDemoTeacherAccount(phone);
    return Boolean(account && readGrant(storagePrefix + account.id));
}

export function hasVerifiedDemoTeacherSupportAccess(phone: string | undefined, preview: boolean): boolean {
    if (!phone) return false;
    try {
        if (preview) return window.localStorage.getItem(previewPrefix + phone) === '1';
        const account = findDemoTeacherAccount(phone);
        const grant = account && readGrant(storagePrefix + account.id);
        return Boolean(grant && grant !== 'legacy' && grant.verified);
    } catch {
        return false;
    }
}

export function getVerifiedDemoTeacherSupportMode(phone: string | undefined, allowPreview: boolean): 'granted' | 'preview' | null {
    const preview = !hasDemoTeacherSupportAccess(phone);
    if (preview && !allowPreview) return null;
    return hasVerifiedDemoTeacherSupportAccess(phone, preview) ? (preview ? 'preview' : 'granted') : null;
}

export const readDemoTeacherSupportAccounts = () => (
    DEMO_TEACHER_ACCOUNTS.filter(account => hasDemoTeacherSupportAccess(account.phone))
);

async function deriveVerifier(code: string, salt: string) {
    return bytesToHex(await pbkdf2Async(sha256, code, hexToBytes(salt), { c: 120_000, dkLen: 32 }));
}

async function saveSecurityCode(phone: string, code: string, mode: 'add' | 'reset'): Promise<void> {
    const account = findDemoTeacherAccount(phone);
    if (!account) throw new Error('未找到该手机号对应的教师账号');
    if (!isTeacherSupportSecurityCode(code)) throw new Error(TEACHER_SUPPORT_SECURITY_CODE_HINT);

    const key = storagePrefix + account.id;
    const original = window.localStorage.getItem(key);
    if (mode === 'add' && readGrant(key)) throw new Error('该账号已授权');
    if (mode === 'reset' && !readGrant(key)) throw new Error('该账号的排查授权已移除');

    const salt = bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(16)));
    const verifier = await deriveVerifier(code, salt);
    if (window.localStorage.getItem(key) !== original) throw new Error('授权已更新，请重新操作');
    const grant: SupportGrant = { salt, verifier, verified: false };
    window.localStorage.setItem(key, JSON.stringify(grant));
    window.dispatchEvent(new Event(changeEvent));
}

export const addDemoTeacherSupportAccount = (phone: string, code: string) => saveSecurityCode(phone, code, 'add');
export const resetDemoTeacherSupportSecurityCode = (phone: string, code: string) => saveSecurityCode(phone, code, 'reset');

export function removeDemoTeacherSupportAccount(phone: string): void {
    const account = findDemoTeacherAccount(phone);
    if (!account) return;

    window.localStorage.removeItem(storagePrefix + account.id);
    window.dispatchEvent(new Event(changeEvent));
}

type SupportVerification = { status: 'verified' | 'require-code' } | { status: 'error'; error: string };

export async function verifyDemoTeacherSupportAccess(
    phone: string | undefined, code: string | undefined, preview: boolean, signal?: AbortSignal,
): Promise<SupportVerification> {
    if (!phone) return { status: 'error', error: '当前账号未获排查授权' };
    try {
        if (preview) {
            const key = previewPrefix + phone;
            if (window.localStorage.getItem(key) === '1') return { status: 'verified' };
            if (!code) return { status: 'require-code' };
            if (code !== DEMO_TEACHER_PREVIEW_SECURITY_CODE) return { status: 'error', error: '安全码有误，请重试' };
            if (!signal?.aborted) {
                window.localStorage.setItem(key, '1');
                window.dispatchEvent(new Event(changeEvent));
            }
            return { status: 'verified' };
        }

        const account = findDemoTeacherAccount(phone);
        const key = account && storagePrefix + account.id;
        const grant = key && readGrant(key);
        if (!key || !grant) return { status: 'error', error: '当前账号未获排查授权' };
        if (grant !== 'legacy' && grant.verified) return { status: 'verified' };
        if (!code) return { status: 'require-code' };
        if (grant === 'legacy') return { status: 'error', error: '该排查授权尚未设置安全码' };

        // 设置时校验格式，验证时匹配已保存的安全码，兼容已有授权。
        if (await deriveVerifier(code, grant.salt) !== grant.verifier) {
            return { status: 'error', error: '安全码有误，请重试' };
        }
        if (signal?.aborted) return { status: 'error', error: '校验已取消' };

        const latest = readGrant(key);
        if (!latest || latest === 'legacy' || latest.salt !== grant.salt) {
            return { status: 'error', error: '排查授权已更新，请重试' };
        }
        if (!latest.verified) {
            window.localStorage.setItem(key, JSON.stringify({ ...latest, verified: true }));
            window.dispatchEvent(new Event(changeEvent));
        }
        return { status: 'verified' };
    } catch {
        return { status: 'error', error: '安全码校验失败，请重试' };
    }
}

export function subscribeToDemoTeacherSupportAccess(onChange: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key.startsWith(storagePrefix) || event.key.startsWith(previewPrefix)) onChange();
    };
    window.addEventListener(changeEvent, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
        window.removeEventListener(changeEvent, onChange);
        window.removeEventListener('storage', onStorage);
    };
}
