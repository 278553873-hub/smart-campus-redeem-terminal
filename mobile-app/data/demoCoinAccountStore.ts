import type { CampusCoinLedgerPatch } from '../domain/campusCoinLedger';
import type { VendingExchangeRecord } from '../domain/vendingExchange';

export interface DemoCoinAccountState {
  classPatches: Record<string, CampusCoinLedgerPatch>;
  vendingCorrections: Record<string, VendingExchangeRecord>;
}

export const EMPTY_DEMO_COIN_ACCOUNT: DemoCoinAccountState = { classPatches: {}, vendingCorrections: {} };
const storageKey = (spaceId: string) => `teacher-demo-coin-account:v1:${spaceId}`;
const updatedEvent = 'teacher-demo-coin-account-updated';

export function readDemoCoinAccountSnapshot(spaceId: string) {
  try {
    return window.localStorage.getItem(storageKey(spaceId)) ?? '';
  } catch {
    return '';
  }
}

export function parseDemoCoinAccountSnapshot(snapshot: string): DemoCoinAccountState {
  if (!snapshot) return EMPTY_DEMO_COIN_ACCOUNT;
  return JSON.parse(snapshot);
}

export function subscribeToDemoCoinAccount(spaceId: string, onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === storageKey(spaceId)) onChange();
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(updatedEvent, onChange);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(updatedEvent, onChange);
  };
}

export async function updateDemoCoinAccount<Result>(
  spaceId: string,
  change: (current: DemoCoinAccountState) => { state: DemoCoinAccountState; result: Result },
): Promise<Result> {
  const key = storageKey(spaceId);
  const update = () => {
    const current = parseDemoCoinAccountSnapshot(window.localStorage.getItem(key) ?? '');
    const { state, result } = change(current);
    if (state !== current) {
      window.localStorage.setItem(key, JSON.stringify(state));
      window.dispatchEvent(new Event(updatedEvent));
    }
    return result;
  };
  if (navigator.locks) return navigator.locks.request(key, update);

  // 演示服务器也使用 HTTP。用 IndexedDB 的独占写事务串行化不支持 Web Locks 的标签页。
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('teacher-demo-coin-account-lock', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('accounts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise<Result>((resolve, reject) => {
      const transaction = database.transaction('accounts', 'readwrite');
      const request = transaction.objectStore('accounts').get(key);
      transaction.onabort = () => reject(transaction.error);
      request.onsuccess = () => {
        try {
          resolve(update());
        } catch (error) {
          reject(error);
        }
      };
    });
  } finally {
    database.close();
  }
}
