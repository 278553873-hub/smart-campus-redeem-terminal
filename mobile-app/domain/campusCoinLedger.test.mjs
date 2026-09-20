import assert from 'node:assert/strict';
import {
  DEFAULT_COIN_CLEAR_SCOPE,
  EMPTY_COIN_LEDGER_PATCH,
  applyCoinLedgerPatch,
  buildCoinClearShares,
  countActiveCoinLedgerEntries,
  createCoinLedgerEntry,
  expandCoinLedgerForStudent,
  filterCoinLedgerEntries,
  formatCoinLedgerStudentSummary,
  formatCoinLedgerTimeLabel,
  getCoinLedgerEntryTitle,
  isCoinLedgerClearAllScope,
  isCoinLedgerEntryRevocable,
  recordCoinLedgerEntry,
  revokeCoinLedgerEntry,
  sumCoinLedgerShares,
} from './campusCoinLedger.ts';

const batchEntry = createCoinLedgerEntry({
  id: 'ledger-redeem-1',
  classId: 'class-1',
  type: 'redeem',
  time: '2026-09-20 16:45',
  operator: '张老师',
  productName: '与校长共进午餐1次',
  shares: [
    { studentId: 's1', studentName: '李明', amount: 500 },
    { studentId: 's2', studentName: '韦小宝', amount: 500 },
    { studentId: 's3', studentName: '王小美', amount: 500 },
  ],
});

assert.equal(batchEntry.totalAmount, 1500, '多人一起兑换时应按整批合计金额。');
assert.equal(batchEntry.revoked, false, '新建记录默认未撤回。');
assert.equal(batchEntry.revokedAt, null, '新建记录不应带撤回时间。');

const clearEntry = createCoinLedgerEntry({
  id: 'ledger-clear-1',
  classId: 'class-1',
  type: 'clear',
  time: '2026-09-20 15:30',
  operator: '张老师',
  productName: '清空成长币',
  shares: [{ studentId: 's1', studentName: '李明', amount: 260 }],
});

assert.equal(clearEntry.productName, null, '清空成长币记录不承载商品名。');
assert.equal(clearEntry.totalAmount, 260, '清空记录金额应为被清空的余额合计。');

assert.equal(formatCoinLedgerStudentSummary(batchEntry.shares), '李明、韦小宝 等 3 人', '三人以上应汇总为前两人加人数。');
assert.equal(formatCoinLedgerStudentSummary(batchEntry.shares.slice(0, 2)), '李明、韦小宝', '两人应并列表述。');
assert.equal(formatCoinLedgerStudentSummary(batchEntry.shares.slice(0, 1)), '李明', '单人应直接显示姓名。');

assert.equal(isCoinLedgerEntryRevocable(batchEntry, '2026-09-20'), true, '当天兑换的记录可以撤回。');
assert.equal(isCoinLedgerEntryRevocable(batchEntry, '2026-09-21'), false, '隔天的兑换记录不能再撤回。');
assert.equal(isCoinLedgerEntryRevocable(clearEntry, '2026-09-20'), false, '清空成长币的记录不支持撤回。');

const revokedPatch = revokeCoinLedgerEntry(recordCoinLedgerEntry(EMPTY_COIN_LEDGER_PATCH, batchEntry), 'ledger-redeem-1', '2026-09-20 17:02');
const revokedLedger = applyCoinLedgerPatch([], revokedPatch);
assert.equal(revokedLedger.length, 1, '撤回只做标记，不删除记录。');
assert.equal(revokedLedger[0].revoked, true, '撤回后记录应标记为已撤回。');
assert.equal(revokedLedger[0].revokedAt, '2026-09-20 17:02', '撤回后应写入撤回时间。');
assert.equal(revokedLedger[0].totalAmount, 1500, '撤回后仍保留原始金额，便于对账。');
assert.equal(isCoinLedgerEntryRevocable(revokedLedger[0], '2026-09-20'), false, '已撤回的记录不能再次撤回。');
assert.equal(expandCoinLedgerForStudent(revokedLedger, 's1').length, 0, '已撤回的兑换不应出现在学生成长币明细里。');

const historyEntry = createCoinLedgerEntry({
  id: 'ledger-redeem-2',
  classId: 'class-1',
  type: 'redeem',
  time: '2026-08-12 10:00',
  operator: '李老师',
  productName: '精美笔记本一本',
  shares: [{ studentId: 's1', studentName: '李明', amount: 150 }],
});

const mergedLedger = applyCoinLedgerPatch([historyEntry], recordCoinLedgerEntry(EMPTY_COIN_LEDGER_PATCH, batchEntry));
assert.deepEqual(mergedLedger.map(entry => entry.id), ['ledger-redeem-1', 'ledger-redeem-2'], '新增记录应合并进流水并按时间倒序。');

assert.equal(countActiveCoinLedgerEntries(mergedLedger), 2, '笔数只统计未撤回的记录。');
assert.equal(countActiveCoinLedgerEntries(applyCoinLedgerPatch([historyEntry], revokedPatch)), 1, '已撤回的记录不计入笔数。');

assert.equal(filterCoinLedgerEntries(mergedLedger, { type: 'month', month: '2026-09' }).length, 1, '按月份筛选应只保留当月记录。');
assert.equal(
  filterCoinLedgerEntries(mergedLedger, { type: 'range', start: '2026-08-01', end: '2026-08-31' }).length,
  1,
  '按时间段筛选应只保留区间内记录。',
);
assert.equal(
  filterCoinLedgerEntries(mergedLedger, { type: 'range', start: '2026-09-01', end: '2026-09-30' })[0].id,
  'ledger-redeem-1',
  '时间段筛选应支持当天的记录。',
);

assert.equal(formatCoinLedgerTimeLabel('2026-09-20 16:45', '2026-09-20'), '今天 16:45', '当天记录显示今天。');
assert.equal(formatCoinLedgerTimeLabel('2026-09-19 09:05', '2026-09-20'), '昨天 09:05', '前一天记录显示昨天。');
assert.equal(formatCoinLedgerTimeLabel('2026-08-12 10:00', '2026-09-20'), '8月12日 10:00', '更早的记录显示月日。');

const studentExpansion = expandCoinLedgerForStudent(mergedLedger, 's2');
assert.equal(studentExpansion.length, 1, '学生只看到自己参与的那一条支出。');
assert.equal(studentExpansion[0].amount, 500, '学生看到的是自己承担的金额，而不是整批合计。');
assert.equal(studentExpansion[0].category, 'class_exchange', '班级兑换应落在班级兑换分类。');
assert.equal(studentExpansion[0].productName, '与校长共进午餐1次', '学生侧应显示兑换的商品名。');
assert.equal(expandCoinLedgerForStudent(mergedLedger, 's3')[0].amount, 500, '同批其它学生各自看到自己的份额。');

const clearExpansion = expandCoinLedgerForStudent(applyCoinLedgerPatch([], recordCoinLedgerEntry(EMPTY_COIN_LEDGER_PATCH, clearEntry)), 's1');
assert.equal(clearExpansion.length, 1, '清空成长币也应进入学生成长币明细。');
assert.equal(clearExpansion[0].category, 'manual_clear', '清空成长币使用独立的支出分类。');
assert.equal(clearExpansion[0].amount, 260, '清空记录金额取该学生被清空的余额。');

// 清空口径：默认清空全部（可用 + 已存），也允许老师只清可用。
const clearTargets = [
  { studentId: 's1', studentName: '李明', availableAmount: 260, bankAmount: 1200 },
  { studentId: 's2', studentName: '韦小宝', availableAmount: 0, bankAmount: 0 },
];

assert.equal(DEFAULT_COIN_CLEAR_SCOPE, 'all', '清空成长币默认应清空可用与已存两部分。');

const clearAllShares = buildCoinClearShares(clearTargets, DEFAULT_COIN_CLEAR_SCOPE);
assert.equal(clearAllShares.length, 1, '可用与已存都为 0 的学生不产生清空份额。');
assert.equal(clearAllShares[0].bankAmount, 1200, '清空全部口径应带上被扣的已存金额。');
assert.equal(sumCoinLedgerShares(clearAllShares), 1460, '清空合计应为可用与已存之和。');

const clearAvailableShares = buildCoinClearShares(clearTargets, 'available');
assert.equal(clearAvailableShares[0].bankAmount, 0, '只清可用时不应扣减已存。');
assert.equal(sumCoinLedgerShares(clearAvailableShares), 260, '只清可用时合计只算可用余额。');

const clearAllEntry = createCoinLedgerEntry({
  id: 'ledger-clear-all',
  classId: 'class-1',
  type: 'clear',
  time: '2026-09-20 15:30',
  operator: '张老师',
  shares: clearAllShares,
});

assert.equal(clearAllEntry.totalAmount, 1460, '清空记录的合计应包含已存部分。');
assert.equal(getCoinLedgerEntryTitle(clearAllEntry), '清空全部成长币', '清空全部口径的标题要区别于只清可用。');
assert.equal(isCoinLedgerClearAllScope(clearAllEntry), true, '含已存扣减的清空记录应识别为清空全部口径。');
assert.equal(isCoinLedgerClearAllScope(clearEntry), false, '只清可用的记录不应识别为清空全部口径。');
assert.equal(getCoinLedgerEntryTitle(clearEntry), '清空成长币', '只清可用的记录保持原清空标题。');

const clearAllExpansion = expandCoinLedgerForStudent(
  applyCoinLedgerPatch([], recordCoinLedgerEntry(EMPTY_COIN_LEDGER_PATCH, clearAllEntry)),
  's1',
);
assert.equal(clearAllExpansion.length, 2, '清空全部应拆成可用与已存两条学生流水。');
assert.equal(
  clearAllExpansion.map(record => record.category).sort().join(','),
  'bank_clear,manual_clear',
  '已存扣减使用独立的清空已存分类。',
);
assert.equal(
  clearAllExpansion.find(record => record.category === 'bank_clear').amount,
  1200,
  '清空已存流水取该学生被清掉的已存金额。',
);

console.log('campusCoinLedger assertions passed');
