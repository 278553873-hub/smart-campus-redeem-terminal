import type { ClassInfo, TeacherProfile } from '../types';
import type { TeacherSpaceOption } from './teacherSpaceAccess';
import type { MobileDateRange } from '../components/ui/mobileDatePickerModel';

export type VendingExchangeStatus = 'completed' | 'failed';
export type VendingRefundStatus = 'none' | 'pending' | 'refunded';

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
  quantity: number;
  unitPrice: number;
  chargedAmount: number;
  terminalDeviceId: string;
  terminalDeviceName: string;
  channelName: string;
  time: string;
  status: VendingExchangeStatus;
  refundStatus: VendingRefundStatus;
  refundedAmount: number;
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
