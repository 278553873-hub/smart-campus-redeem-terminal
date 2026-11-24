import { DEMO_TEACHER_SCHOOL_NAMES, isDemoTeacherPhone } from '../../shared/demoTeacherAccounts.ts';
import type { TeacherLoginAccount, TeacherLoginSession } from '../domain/teacherLoginAccess';

export interface RecentTeacherLogin extends TeacherLoginSession {
    name: string;
    schoolName: string;
    lastUsedSpaceId?: string;
    support?: { operatorPhone: string; preview: boolean };
}

export const RECENT_TEACHER_LOGINS_STORAGE_KEY = 'letu-demo-teacher-recent-logins:v1';
const RECENT_LOGIN_LIMIT = 10;

const isStringList = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string');

function isRecentTeacherLogin(value: unknown): value is RecentTeacherLogin {
    if (!value || typeof value !== 'object') return false;
    const { account, spaceId, name, schoolName, lastUsedSpaceId, support } = value as Partial<RecentTeacherLogin>;
    return Boolean(account && typeof account.phone === 'string' && isDemoTeacherPhone(account.phone)
        && isStringList(account.schoolSpaceIds) && isStringList(account.collaborationSpaceIds)
        && typeof spaceId === 'string' && spaceId.trim()
        && (lastUsedSpaceId === undefined || (typeof lastUsedSpaceId === 'string' && lastUsedSpaceId.trim()))
        && typeof name === 'string' && name.trim() && typeof schoolName === 'string' && schoolName.trim()
        && (support === undefined || (support && typeof support.operatorPhone === 'string'
            && isDemoTeacherPhone(support.operatorPhone) && typeof support.preview === 'boolean')));
}

function readStoredLogins(): RecentTeacherLogin[] | undefined {
    try {
        const stored: unknown = JSON.parse(window.localStorage.getItem(RECENT_TEACHER_LOGINS_STORAGE_KEY) ?? '[]');
        if (!Array.isArray(stored)) return [];
        const distinct = new Map<string, RecentTeacherLogin>();
        for (const login of stored) {
            if (isRecentTeacherLogin(login) && !distinct.has(login.account.phone)) distinct.set(login.account.phone, login);
            if (distinct.size === RECENT_LOGIN_LIMIT) break;
        }
        return Array.from(distinct.values());
    } catch {
        return undefined;
    }
}

export const readRecentTeacherLogins = () => readStoredLogins() ?? [];

function isKnownSchool(spaceId: string): spaceId is keyof typeof DEMO_TEACHER_SCHOOL_NAMES {
    return Object.hasOwn(DEMO_TEACHER_SCHOOL_NAMES, spaceId);
}

export function getRecentTeacherLoginDestination(login: RecentTeacherLogin, account: TeacherLoginAccount = login.account) {
    const schools = [...new Set(account.schoolSpaceIds.filter(isKnownSchool))];
    const lastSpaceId = login.lastUsedSpaceId ?? login.spaceId;
    const canRestore = lastSpaceId === 'personal' || (isKnownSchool(lastSpaceId) && schools.includes(lastSpaceId));
    const spaceId = canRestore ? lastSpaceId : schools[0] ?? 'personal';
    const spaceName = isKnownSchool(spaceId) ? DEMO_TEACHER_SCHOOL_NAMES[spaceId] : '个人空间';
    return { spaceId, spaceName, schoolCount: schools.length, canRestore };
}

export function getAvailableRecentTeacherLogins(
    logins: RecentTeacherLogin[], current: RecentTeacherLogin | undefined, verifiedSupport: 'granted' | 'preview' | null,
): RecentTeacherLogin[] {
    const currentPhone = current?.account.phone;
    const available = logins.filter(({ account, support }) => !support || account.phone === currentPhone
        || (support.operatorPhone === currentPhone && verifiedSupport === (support.preview ? 'preview' : 'granted')));
    return current && !available.some(entry => entry.account.phone === currentPhone)
        ? [current, ...available].slice(0, RECENT_LOGIN_LIMIT)
        : available;
}

export function rememberRecentTeacherLogin(localLogins: RecentTeacherLogin[], login: RecentTeacherLogin): RecentTeacherLogin[] {
    const current = readStoredLogins() ?? localLogins;
    const previous = current.find(entry => entry.account.phone === login.account.phone);
    const entry = login.support && previous && !previous.support ? { ...previous, lastUsedSpaceId: login.spaceId } : login;
    const updated = [entry, ...current.filter(item => item.account.phone !== login.account.phone)].slice(0, RECENT_LOGIN_LIMIT);
    return writeRecentTeacherLogins(updated);
}

export function rememberRecentTeacherLoginSpace(localLogins: RecentTeacherLogin[], phone: string, spaceId: string): RecentTeacherLogin[] {
    const current = readStoredLogins() ?? localLogins;
    const login = current.find(entry => entry.account.phone === phone);
    if (!login || (login.lastUsedSpaceId ?? login.spaceId) === spaceId) return current;
    if (spaceId !== 'personal' && (!isKnownSchool(spaceId) || !login.account.schoolSpaceIds.includes(spaceId))) return current;
    return writeRecentTeacherLogins(current.map(entry => entry === login ? { ...entry, lastUsedSpaceId: spaceId } : entry));
}

function writeRecentTeacherLogins(updated: RecentTeacherLogin[]): RecentTeacherLogin[] {
    try {
        window.localStorage.setItem(RECENT_TEACHER_LOGINS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
        // 浏览器禁止存储时仍保留当前页面的登录记录。
    }
    return updated;
}
