import type { Student } from '../types';
import {
  createCoinLedgerEntry,
  formatCoinLedgerTimeValue,
  type CampusCoinLedgerEntry,
} from '../domain/campusCoinLedger.ts';

interface DemoRewardProduct {
  name: string;
  amount: number;
}

const DEMO_REWARD_PRODUCTS: DemoRewardProduct[] = [
  { name: '免写一次语文作业', amount: 100 },
  { name: '做一天班长体验券', amount: 300 },
  { name: '与校长共进午餐1次', amount: 500 },
  { name: '精美笔记本一本', amount: 150 },
  { name: '黑色中性笔一支', amount: 50 },
  { name: '免除一次大扫除', amount: 120 },
  { name: '指定优选座位一周', amount: 200 },
];

/** 演示数据的历史分布，0 表示今天，按批次顺序循环使用。 */
const DEMO_REWARD_DAY_OFFSETS = [0, 0, 1, 3, 5, 8, 12, 18, 24];

/** 同一天内的先后顺序用“距今多少小时”表达，保证演示记录都发生在当前时刻之前。 */
const DEMO_REWARD_HOUR_OFFSETS = [2, 5, 1, 4, 7, 3, 6];

/** 演示两种清空口径：一条只清可用，一条连银行里的已存一起清。 */
const DEMO_CLEAR_SEEDS = [
  { dayOffset: 0, hourOffset: 3, size: 3, scope: 'all' as const },
  { dayOffset: 2, hourOffset: 21, size: 1, scope: 'available' as const },
];

const DEMO_HISTORY_OPERATORS = ['李老师', '王老师'];

export interface CreateDemoCoinLedgerInput {
  classId: string;
  students: Student[];
  operator: string;
  today: Date;
}

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const SCHOOL_DAY_START_HOUR = 8;
const SCHOOL_DAY_END_HOUR = 16;

/**
 * 演示记录统一落在 08:00-16:30 的校时段内，并且不晚于老师打开页面的当前时刻，
 * 避免出现比当前时间还晚、或落在清晨和深夜的记录。
 */
const occurredAtBefore = (now: Date, dayOffset: number, hourOffset: number, minuteSeed: number) => {
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset, SCHOOL_DAY_START_HOUR, 0, 0, 0).getTime();
  const schoolDayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset, SCHOOL_DAY_END_HOUR, 30, 0, 0).getTime();
  const latest = dayOffset === 0 ? Math.min(now.getTime() - 5 * 60_000, schoolDayEnd) : schoolDayEnd;
  const anchor = dayOffset === 0 ? Math.min(now.getTime() - 30 * 60_000, schoolDayEnd) : schoolDayEnd;
  const candidate = anchor - hourOffset * HOUR_MS - (minuteSeed % 60) * 60_000;
  return new Date(Math.min(Math.max(candidate, dayStart + (minuteSeed % 45) * 60_000), latest));
};

/**
 * 按班级花名册生成演示流水：老师会多选学生一起兑换同一件商品，
 * 所以每 1~3 名学生合成一条记录，另外补两条清空成长币的记录。
 */
export const createDemoCoinLedger = ({
  classId,
  students,
  operator,
  today,
}: CreateDemoCoinLedgerInput): CampusCoinLedgerEntry[] => {
  const operators = [operator, ...DEMO_HISTORY_OPERATORS];
  const entries: CampusCoinLedgerEntry[] = [];
  let cursor = 0;
  let batchIndex = 0;

  while (cursor < students.length) {
    const batchSize = 1 + ((batchIndex * 2) % 3);
    const batch = students.slice(cursor, cursor + batchSize);
    cursor += batchSize;
    const product = DEMO_REWARD_PRODUCTS[batchIndex % DEMO_REWARD_PRODUCTS.length];
    const occurredAt = occurredAtBefore(
      today,
      DEMO_REWARD_DAY_OFFSETS[batchIndex % DEMO_REWARD_DAY_OFFSETS.length],
      DEMO_REWARD_HOUR_OFFSETS[batchIndex % DEMO_REWARD_HOUR_OFFSETS.length],
      batchIndex * 11,
    );
    entries.push(createCoinLedgerEntry({
      id: `ledger-redeem-${classId}-${batchIndex}`,
      classId,
      type: 'redeem',
      time: formatCoinLedgerTimeValue(occurredAt),
      operator: operators[batchIndex % operators.length],
      productName: product.name,
      shares: batch.map(student => ({ studentId: student.id, studentName: student.name, amount: product.amount })),
    }));
    batchIndex += 1;
  }

  DEMO_CLEAR_SEEDS.forEach((seed, seedIndex) => {
    const batch = students.slice(seedIndex * seed.size, seedIndex * seed.size + seed.size);
    if (batch.length === 0) return;
    const occurredAt = occurredAtBefore(today, seed.dayOffset, seed.hourOffset, (seedIndex + 1) * 17);
    entries.push(createCoinLedgerEntry({
      id: `ledger-clear-${classId}-${seedIndex}`,
      classId,
      type: 'clear',
      time: formatCoinLedgerTimeValue(occurredAt),
      operator: seedIndex === 0 ? operator : DEMO_HISTORY_OPERATORS[0],
      shares: batch.map((student, index) => ({
        studentId: student.id,
        studentName: student.name,
        amount: 40 + (((index + seedIndex + 1) * 37) % 260),
        bankAmount: seed.scope === 'all' ? 600 + (((index + seedIndex + 2) * 53) % 900) : 0,
      })),
    }));
  });

  return entries.sort((left, right) => right.time.localeCompare(left.time));
};
