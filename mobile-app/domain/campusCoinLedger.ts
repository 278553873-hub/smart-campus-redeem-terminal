import type { CampusCoinConsumeRecord } from '../types';
import { GROWTH_COIN_TERMS } from '../../shared/growthCoinTerminology.ts';

export type CampusCoinLedgerEntryType = 'redeem' | 'clear';

export interface CampusCoinLedgerShare {
  studentId: string;
  studentName: string;
  /** 可用成长币的扣减金额。 */
  amount: number;
  /** 已存（银行）成长币的扣减金额；只清空可用的口径下为 0。 */
  bankAmount?: number;
}

export const getCoinLedgerShareTotal = (share: CampusCoinLedgerShare) => share.amount + (share.bankAmount ?? 0);

export const sumCoinLedgerShares = (shares: CampusCoinLedgerShare[]) => (
  shares.reduce((total, share) => total + getCoinLedgerShareTotal(share), 0)
);

/** 清空成长币的口径：只清可用，或连银行里的已存一起清。 */
export type CampusCoinClearScope = 'available' | 'all';

/** 老师进入清空流程时默认清空全部成长币（可用 + 已存）。 */
export const DEFAULT_COIN_CLEAR_SCOPE: CampusCoinClearScope = 'all';

/** 待清空的学生资产快照。 */
export interface CoinClearTarget {
  studentId: string;
  studentName: string;
  availableAmount: number;
  bankAmount: number;
}

/**
 * 按口径把学生资产折算成记录份额：清空可用只扣可用，清空全部连已存一起扣。
 * 两处都为 0 的学生不产生份额，因此不会写进记录。
 */
export const buildCoinClearShares = (
  targets: CoinClearTarget[],
  scope: CampusCoinClearScope,
): CampusCoinLedgerShare[] => targets
  .map(target => ({
    studentId: target.studentId,
    studentName: target.studentName,
    amount: target.availableAmount,
    bankAmount: scope === 'all' ? target.bankAmount : 0,
  }))
  .filter(share => getCoinLedgerShareTotal(share) > 0);

/** 学生侧支出流水的明细文案：分类说明做了什么，明细说明清掉的是哪部分资产。 */
export const COIN_CLEAR_DETAIL = {
  available: `可用${GROWTH_COIN_TERMS.name}`,
  bank: `已存${GROWTH_COIN_TERMS.name}`,
} as const;

/**
 * 一次兑换或一次清空操作 = 一条成长币记录。
 * 老师多选学生一起兑换同一件商品时，多名学生共享同一条记录，各自扣减金额放在 shares 里，
 * 操作老师与撤回状态都挂在这条记录上，保证可追溯。
 */
export interface CampusCoinLedgerEntry {
  id: string;
  classId: string;
  type: CampusCoinLedgerEntryType;
  /** 记录时间，格式 `YYYY-MM-DD HH:mm`，与成长币流水的其它记录保持一致。 */
  time: string;
  operator: string;
  productName: string | null;
  shares: CampusCoinLedgerShare[];
  totalAmount: number;
  revoked: boolean;
  revokedAt: string | null;
}

/** 运行期间产生的记录变更：新增的记录，以及已撤回记录对应的撤回时间。 */
export interface CampusCoinLedgerPatch {
  entries: CampusCoinLedgerEntry[];
  revokedAtById: Record<string, string>;
}

export type CampusCoinLedgerFilter =
  | { type: 'month'; month: string }
  | { type: 'range'; start: string; end: string };

export const EMPTY_COIN_LEDGER_PATCH: CampusCoinLedgerPatch = { entries: [], revokedAtById: {} };

const pad = (value: number) => String(value).padStart(2, '0');

export const formatCoinLedgerTimeValue = (date: Date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
);

export const formatCoinLedgerDateKey = (date: Date) => formatCoinLedgerTimeValue(date).slice(0, 10);

export const getCoinLedgerDateKey = (time: string) => time.slice(0, 10);

export const getCoinLedgerMonthKey = (time: string) => time.slice(0, 7);

/** 记录里只要有学生被扣了已存，这次清空就是「清空全部」口径。 */
export const isCoinLedgerClearAllScope = (entry: CampusCoinLedgerEntry) => (
  entry.type === 'clear' && entry.shares.some(share => (share.bankAmount ?? 0) > 0)
);

export const getCoinLedgerEntryTitle = (entry: CampusCoinLedgerEntry) => {
  if (entry.type === 'redeem') return entry.productName ?? '兑换奖励';
  return isCoinLedgerClearAllScope(entry) ? `清空全部${GROWTH_COIN_TERMS.name}` : `清空${GROWTH_COIN_TERMS.name}`;
};

let entrySequence = 0;
const createEntryId = (type: CampusCoinLedgerEntryType, time: string) => {
  entrySequence += 1;
  return `ledger-${type}-${time.replace(/\D/g, '')}-${entrySequence}`;
};

export interface CreateCoinLedgerEntryInput {
  classId: string;
  type: CampusCoinLedgerEntryType;
  time: string;
  operator: string;
  productName?: string | null;
  shares: CampusCoinLedgerShare[];
  /** 仅演示数据需要固定 id 时传入。 */
  id?: string;
}

export const createCoinLedgerEntry = ({
  classId,
  type,
  time,
  operator,
  productName = null,
  shares,
  id,
}: CreateCoinLedgerEntryInput): CampusCoinLedgerEntry => ({
  id: id ?? createEntryId(type, time),
  classId,
  type,
  time,
  operator,
  productName: type === 'clear' ? null : productName,
  shares: shares.map(share => ({ ...share })),
  totalAmount: sumCoinLedgerShares(shares),
  revoked: false,
  revokedAt: null,
});

export const recordCoinLedgerEntry = (
  patch: CampusCoinLedgerPatch,
  entry: CampusCoinLedgerEntry,
): CampusCoinLedgerPatch => ({
  entries: [entry, ...patch.entries],
  revokedAtById: patch.revokedAtById,
});

export const revokeCoinLedgerEntry = (
  patch: CampusCoinLedgerPatch,
  entryId: string,
  revokedAt: string,
): CampusCoinLedgerPatch => ({
  entries: patch.entries,
  revokedAtById: { ...patch.revokedAtById, [entryId]: revokedAt },
});

/** 把运行期间的新增记录与撤回状态合并到基础流水上，按时间倒序返回。 */
export const applyCoinLedgerPatch = (
  base: CampusCoinLedgerEntry[],
  patch: CampusCoinLedgerPatch,
): CampusCoinLedgerEntry[] => (
  [...patch.entries, ...base]
    .map(entry => (patch.revokedAtById[entry.id]
      ? { ...entry, revoked: true, revokedAt: patch.revokedAtById[entry.id] }
      : entry))
    .sort((left, right) => right.time.localeCompare(left.time))
);

/** 只有当天发起的兑换可以撤回，且整批一起撤回；清空学生成长币不支持撤回。 */
export const isCoinLedgerEntryRevocable = (entry: CampusCoinLedgerEntry, todayKey: string) => (
  entry.type === 'redeem' && !entry.revoked && getCoinLedgerDateKey(entry.time) === todayKey
);

export const filterCoinLedgerEntries = (
  entries: CampusCoinLedgerEntry[],
  filter: CampusCoinLedgerFilter,
) => entries.filter(entry => (
  filter.type === 'month'
    ? getCoinLedgerMonthKey(entry.time) === filter.month
    : getCoinLedgerDateKey(entry.time) >= filter.start && getCoinLedgerDateKey(entry.time) <= filter.end
));

export const countActiveCoinLedgerEntries = (entries: CampusCoinLedgerEntry[]) => (
  entries.filter(entry => !entry.revoked).length
);

export const formatCoinLedgerStudentSummary = (shares: CampusCoinLedgerShare[]) => {
  if (shares.length === 0) return '';
  if (shares.length === 1) return shares[0].studentName;
  if (shares.length === 2) return `${shares[0].studentName}、${shares[1].studentName}`;
  return `${shares[0].studentName}、${shares[1].studentName} 等 ${shares.length} 人`;
};

const distanceInDays = (dateKey: string, todayKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [todayYear, todayMonth, todayDay] = todayKey.split('-').map(Number);
  return Math.round((Date.UTC(todayYear, todayMonth - 1, todayDay) - Date.UTC(year, month - 1, day)) / 86400000);
};

export const formatCoinLedgerTimeLabel = (time: string, todayKey: string) => {
  const dateKey = getCoinLedgerDateKey(time);
  const clock = time.slice(11, 16);
  const distance = distanceInDays(dateKey, todayKey);
  if (distance === 0) return `今天 ${clock}`;
  if (distance === 1) return `昨天 ${clock}`;
  const [, month, day] = dateKey.split('-').map(Number);
  return `${month}月${day}日 ${clock}`;
};

export const formatCoinLedgerFullTime = (time: string) => {
  const [dateKey, clock] = time.split(' ');
  const [year, month, day] = dateKey.split('-').map(Number);
  return `${year}年${month}月${day}日 ${clock}`;
};

/**
 * 学生侧成长币明细：把批次记录展开成该学生自己的支出。
 * 兑换只落一条班级兑换；清空按口径拆成「清空可用」和「清空已存」两条，学生和家长能看清钱从哪来、到哪去。
 * 已撤回的记录不产生支出，因此不进学生流水。
 */
export const expandCoinLedgerForStudent = (
  entries: CampusCoinLedgerEntry[],
  studentId: string,
): CampusCoinConsumeRecord[] => (
  entries
    .filter(entry => !entry.revoked)
    .flatMap(entry => entry.shares
      .filter(share => share.studentId === studentId)
      .flatMap(share => {
        if (entry.type === 'redeem') {
          return [{
            id: `${entry.id}-${studentId}`,
            category: 'class_exchange' as const,
            productName: getCoinLedgerEntryTitle(entry),
            quantity: 1,
            amount: share.amount,
            time: entry.time,
          }];
        }
        const bankAmount = share.bankAmount ?? 0;
        const records: CampusCoinConsumeRecord[] = [];
        if (share.amount > 0) {
          records.push({
            id: `${entry.id}-${studentId}-available`,
            category: 'manual_clear',
            productName: COIN_CLEAR_DETAIL.available,
            quantity: 1,
            amount: share.amount,
            time: entry.time,
          });
        }
        if (bankAmount > 0) {
          records.push({
            id: `${entry.id}-${studentId}-bank`,
            category: 'bank_clear',
            productName: COIN_CLEAR_DETAIL.bank,
            quantity: 1,
            amount: bankAmount,
            time: entry.time,
          });
        }
        return records;
      }))
);
