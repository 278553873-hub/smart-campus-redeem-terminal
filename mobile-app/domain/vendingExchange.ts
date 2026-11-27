import type { CampusCoinConsumeRecord, CampusCoinIssueRecord, ClassInfo, TeacherProfile } from '../types';
import type { TeacherSpaceOption } from './teacherSpaceAccess';
import type { MobileDateRange } from '../components/ui/mobileDatePickerModel';
import type { GrowthCoinExchangeRefundReason } from '../../shared/growthCoinFlow.ts';

export type VendingExchangeStatus = 'completed' | 'failed';
export type VendingRefundStatus = 'none' | 'pending' | 'refunded';
export type VendingRefundReason = GrowthCoinExchangeRefundReason;
export type VendingCorrection = 'refund' | 'charge';

export interface VendingExchangeOperation {
  type: VendingCorrection | 'system_refund';
  amount: number;
  shortfall?: number;
  operator: string;
  operatorId?: string;
  time?: string;
  historical?: true;
}

export interface VendingCorrectionPreview {
  type: VendingCorrection;
  amount: number;
  shortfall: number;
  available: number;
}

export interface VendingExchangeActions {
  preview: (record: VendingExchangeRecord) => VendingCorrectionPreview | null;
  confirm: (record: VendingExchangeRecord, preview: VendingCorrectionPreview) => Promise<VendingExchangeOperation>;
}

/** 历史字段均为兑换发生时的快照，不随商品、学生或设备的当前配置改写。 */
export interface VendingExchangeRecord {
  id: string;
  orderNo: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  studentNo: string;
  classId: string;
  className: string;
  gradeName: string;
  productId: string;
  productName: string;
  productImage?: string;
  categoryId: string;
  categoryName: string;
  unitPrice: number;
  chargedAmount: number;
  terminalDeviceId: string;
  terminalDeviceName: string;
  channelName: string;
  time: string;
  status: VendingExchangeStatus;
  refundStatus: VendingRefundStatus;
  refundedAmount: number;
  /** 历史退币原因；缺省视为货柜未出货自动退还。 */
  refundReason?: VendingRefundReason;
  /** 人工退币时保存老师姓名。 */
  refundedBy?: string;
  /** 退币完成时间，兼容缺少时间的历史记录。 */
  refundedAt?: string;
  /** 按发生顺序保存。旧记录首次纠正时补入原退币快照。 */
  operations?: readonly VendingExchangeOperation[];
}

export interface VendingExchangeFilter {
  studentName: string;
  dateRange: MobileDateRange;
  categoryId: string;
  productId: string;
  gradeName: string;
  classId: string;
  terminalDeviceId: string;
  status: VendingExchangeStatus | '';
  classIds: readonly string[];
  productIds: readonly string[];
}

export interface VendingExchangeScope {
  schoolId: string;
  classIds: readonly string[];
}

export const VENDING_EXCHANGE_STATUS_LABELS: Record<VendingExchangeStatus, string> = {
  completed: '兑换成功', failed: '兑换失败',
};

export const VENDING_REFUND_STATUS_LABELS: Record<VendingRefundStatus, string> = {
  none: '未退币', pending: '退币中', refunded: '已退币',
};

export const formatVendingExchangeClassLabel = (record: Pick<VendingExchangeRecord, 'className' | 'gradeName'>) => {
  const className = record.className?.trim();
  const gradeName = record.gradeName?.trim();
  return className && gradeName && /^[\d一二三四五六七八九十]+班$/.test(className)
    ? `${gradeName}${className}` : className || gradeName || '';
};

export const formatVendingExchangeStudentLabel = (record: Pick<VendingExchangeRecord, 'studentName' | 'className' | 'gradeName'>) => {
  const classLabel = formatVendingExchangeClassLabel(record);
  return classLabel ? `${record.studentName}（${classLabel}）` : record.studentName;
};

/** 演示权限适配；真实接口须在服务端执行同样的学校与班级权限校验。 */
export const getVendingExchangeAuthorizedClasses = (
  space: TeacherSpaceOption,
  teacher: TeacherProfile,
  classes: readonly ClassInfo[],
): ClassInfo[] => {
  if (space.type !== 'school') return [];
  if (space.role === 'administrator' || space.role === 'leader') return [...classes];
  const classIds = new Set([
    ...teacher.homeroomClassIds,
    ...(teacher.deputyHomeroomClassIds ?? []),
    ...teacher.teachingAssignments.map(item => item.classId),
  ]);
  return classes.filter(item => classIds.has(item.id) || teacher.gradeLeaderGrades.includes(item.gradeLevel));
};

/** 先限定权限，再执行页面筛选，筛选选项也只能来自此范围。空授权列表不代表全校。 */
export const scopeVendingExchangeRecords = (
  records: readonly VendingExchangeRecord[],
  scope: VendingExchangeScope,
): VendingExchangeRecord[] => {
  const classIds = new Set(scope.classIds);
  return records.filter(record => record.schoolId === scope.schoolId && classIds.has(record.classId));
};

export const filterVendingExchangeRecords = (
  records: readonly VendingExchangeRecord[],
  filter: VendingExchangeFilter,
): VendingExchangeRecord[] => {
  const name = filter.studentName.trim().replace(/\s+/g, '');
  const classIds = new Set(filter.classIds);
  const productIds = new Set(filter.productIds);
  return records.filter(record => {
    const date = record.time.slice(0, 10);
    return (!name || record.studentName.replace(/\s+/g, '').includes(name))
      && date >= filter.dateRange.start && date <= filter.dateRange.end
      && (!filter.categoryId || record.categoryId === filter.categoryId)
      && (!filter.productId || record.productId === filter.productId)
      && (!productIds.size || productIds.has(record.productId))
      && (!filter.gradeName || record.gradeName === filter.gradeName)
      && (!filter.classId || record.classId === filter.classId)
      && (!classIds.size || classIds.has(record.classId))
      && (!filter.terminalDeviceId || record.terminalDeviceId === filter.terminalDeviceId)
      && (!filter.status || record.status === filter.status);
  }).sort((left, right) => right.time.localeCompare(left.time) || left.id.localeCompare(right.id));
};

const roundCoins = (amount: number) => Math.round(amount * 100) / 100;
export const normalizeCoinBalance = (amount: number) => Math.max(0, roundCoins(amount));

export const getVendingExchangeOperations = (record: VendingExchangeRecord): readonly VendingExchangeOperation[] => {
  if (record.operations) return record.operations;
  if (record.refundStatus !== 'refunded') return [];
  const manual = record.refundReason === 'exchange_revoked' || record.refundReason === 'vending_correction';
  return [{
    type: manual ? 'refund' : 'system_refund',
    amount: record.refundedAmount,
    operator: manual ? record.refundedBy?.trim() || '—' : '系统',
    time: record.refundedAt?.trim() || undefined,
    historical: true,
  }];
};

export const getVendingCorrectionBalanceChange = (record: VendingExchangeRecord) => roundCoins(
  (record.operations ?? []).reduce((total, operation) => {
    if (operation.historical) return total;
    return total + (operation.type === 'charge' ? -operation.amount : operation.amount);
  }, 0),
);

export const getVendingExchangeNetCharge = (record: VendingExchangeRecord) => normalizeCoinBalance(getVendingExchangeOperations(record).reduce(
  (total, operation) => total + (operation.type === 'charge' ? operation.amount : -operation.amount),
  record.chargedAmount,
));

export const getVendingCorrectionPreview = (record: VendingExchangeRecord, availableCoins: number): VendingCorrectionPreview | null => {
  const available = normalizeCoinBalance(availableCoins);
  const netCharged = getVendingExchangeNetCharge(record);
  if (record.status === 'completed' && record.refundStatus === 'none') {
    return { type: 'refund', amount: netCharged, shortfall: 0, available };
  }
  if (record.status !== 'failed' || record.refundStatus !== 'refunded') return null;
  const due = normalizeCoinBalance(record.chargedAmount - netCharged);
  const amount = Math.min(due, available);
  return { type: 'charge', amount, shortfall: roundCoins(due - amount), available };
};

export const applyVendingCorrection = (
  record: VendingExchangeRecord, preview: VendingCorrectionPreview,
  operator: { name: string; id: string; time: string },
): VendingExchangeRecord & { operations: readonly VendingExchangeOperation[] } => {
  const isRefund = preview.type === 'refund';
  return {
    ...record,
    status: isRefund ? 'failed' : 'completed',
    refundStatus: isRefund ? 'refunded' : 'none',
    refundedAmount: isRefund ? preview.amount : 0,
    refundReason: isRefund ? 'vending_correction' : undefined,
    refundedBy: isRefund ? operator.name : undefined,
    refundedAt: isRefund ? operator.time : undefined,
    operations: [...getVendingExchangeOperations(record), {
      type: preview.type, amount: preview.amount, shortfall: preview.shortfall,
      operator: operator.name, operatorId: operator.id, time: operator.time,
    }],
  };
};

/** 两个入口以同一份已纠正的订单快照覆盖初始货柜记录。 */
export const applyVendingCorrections = (
  records: readonly VendingExchangeRecord[],
  corrections: Readonly<Record<string, VendingExchangeRecord>>,
): VendingExchangeRecord[] => {
  const byId = new Map(records.map(record => [record.id, record]));
  for (const record of Object.values(corrections)) byId.set(record.id, record);
  return [...byId.values()];
};

export const getVendingExchangeCoinFlows = (records: readonly VendingExchangeRecord[]) => {
  const expenses: CampusCoinConsumeRecord[] = [];
  const incomes: CampusCoinIssueRecord[] = [];
  for (const record of records) {
    const originalId = `vending-${record.id}`;
    const product = { productName: record.productName };
    const operations = getVendingExchangeOperations(record);
    let chargeId = originalId;
    if (record.chargedAmount > 0) {
      expenses.push({ id: originalId, category: 'vending_exchange', ...product, amount: record.chargedAmount, time: record.time });
    }
    operations.forEach((operation, index) => {
      if (operation.amount <= 0) return;
      const id = `${originalId}-operation-${index + 1}`;
      const movement = { id, ...product, amount: operation.amount, time: operation.time ?? record.time };
      if (operation.type === 'charge') {
        expenses.push({ ...movement, category: 'vending_exchange', vendingRecharged: true, relatedRecordId: originalId });
        chargeId = id;
      } else {
        incomes.push({
          ...movement, category: 'exchange_refund', relatedRecordId: chargeId,
          refundReason: operation.type === 'system_refund' ? 'not_dispensed' : 'vending_correction',
        });
      }
    });
  }
  return { expenses, incomes };
};

export const createVendingExchangeFilter = (today: string): VendingExchangeFilter => ({
  // 初始从当前月份连续向前浏览，空开始日期表示不截断历史记录。
  studentName: '', dateRange: { start: '', end: today },
  categoryId: '', productId: '', productIds: [], gradeName: '', classId: '', classIds: [], terminalDeviceId: '', status: '',
});

/** 记录已按时间倒序查询；保留浏览起始月，即使该月暂时没有记录。 */
export const groupVendingExchangeRecordsByMonth = (
  records: readonly VendingExchangeRecord[],
  leadingMonth: string,
): { month: string; records: VendingExchangeRecord[] }[] => {
  const groups = new Map<string, VendingExchangeRecord[]>([[leadingMonth, []]]);
  for (const record of records) {
    const month = record.time.slice(0, 7);
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month)!.push(record);
  }
  return [...groups].sort(([left], [right]) => right.localeCompare(left)).map(([month, records]) => ({ month, records }));
};
