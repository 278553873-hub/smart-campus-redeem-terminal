import { MOCK_PRODUCTS } from '../../constants';
import { DEFAULT_SHOP_CATEGORIES } from '../../shared/shopCatalogStore';
import { shiftDate } from '../components/ui/mobileDatePickerModel';
import type { ClassInfo, Student } from '../types';
import type { VendingExchangeRecord, VendingExchangeStatus } from '../domain/vendingExchange';
import type { VendingCabinetInventory } from '../domain/vendingInventory';

const TERMINAL_DEVICES = [
  { id: 'terminal-1', name: '人北华侨城一楼' },
  { id: 'terminal-2', name: '人北华侨城二楼' },
  { id: 'terminal-3', name: '人北华侨城图书馆' },
];

/** 当前库存演示快照；生产环境由按学校查询货柜库存的接口替换。 */
export const createDemoVendingCabinets = (schoolId: string): VendingCabinetInventory[] => {
  const products = MOCK_PRODUCTS.filter(product => product.type === 'standard');
  const categoryNames = new Map(DEFAULT_SHOP_CATEGORIES.map(item => [item.id, item.name]));
  return TERMINAL_DEVICES.map((terminal, terminalIndex) => ({
    ...terminal,
    schoolId,
    products: Array.from({ length: 18 }, (_, index) => {
      const product = products[(terminalIndex * 13 + index) % products.length];
      return {
        productId: product.id, productName: product.name, image: product.image,
        categoryId: product.category ?? 'uncategorized',
        categoryName: categoryNames.get(product.category ?? '') ?? '未分类',
        stock: Math.min(product.stock, (index * 3 + terminalIndex * 2) % 11),
      };
    }),
  }));
};

/** 与现有演示花名册及商品共用数据来源；生产环境由兑换明细接口替换此适配层。 */
export const createDemoVendingExchangeRecords = ({ schoolId, classes, getStudents, today, getClassLabel = item => item.name }: {
  schoolId: string;
  classes: readonly ClassInfo[];
  getStudents: (classId: string) => readonly Student[];
  today: string;
  getClassLabel?: (item: ClassInfo) => string;
}): VendingExchangeRecord[] => {
  const products = MOCK_PRODUCTS.filter(product => product.type === 'standard');
  const categoryNames = new Map(DEFAULT_SHOP_CATEGORIES.map(item => [item.id, item.name]));
  const offsets = [0, 0, 1, 2, 3, 6, 9, 12, 18, 25, 38, 65];
  return classes.flatMap((classInfo, classIndex) => {
    const students = getStudents(classInfo.id);
    if (!students.length) return [];
    return offsets.map((offset, index) => {
      const student = students[(index === 3 ? 0 : index) % students.length];
      const product = products[(classIndex * 7 + index * 13) % products.length];
      const terminal = TERMINAL_DEVICES[(classIndex + index) % TERMINAL_DEVICES.length];
      const status: VendingExchangeStatus = index === 4 ? 'failed' : 'completed';
      const quantity = index === 7 ? 2 : 1;
      const chargedAmount = Number((quantity * product.price).toFixed(2));
      const date = shiftDate(today, -offset);
      const time = `${date} ${String(10 + index % 7).padStart(2, '0')}:${String((classIndex * 3 + index * 7) % 60).padStart(2, '0')}:00`;
      return {
        id: `${schoolId}-${classInfo.id}-vending-${index}`,
        orderNo: `HG${date.replaceAll('-', '')}${String(classIndex + 1).padStart(3, '0')}${String(index + 1).padStart(3, '0')}`,
        schoolId, studentId: student.id, studentName: student.name, studentNo: student.studentNo ?? '',
        classId: classInfo.id, className: getClassLabel(classInfo), gradeName: classInfo.gradeLevel,
        productId: product.id, productName: product.name, productImage: product.image, categoryId: product.category ?? 'uncategorized',
        categoryName: categoryNames.get(product.category ?? '') ?? '未分类',
        quantity, unitPrice: product.price, chargedAmount,
        terminalDeviceId: terminal.id, terminalDeviceName: terminal.name,
        channelName: `${String(index % 7 + 1).padStart(2, '0')}${String(classIndex % 7 + 1).padStart(2, '0')}`,
        time, status,
        refundStatus: status === 'failed' ? 'refunded' : 'none',
        refundedAmount: status === 'failed' ? chargedAmount : 0,
      };
    });
  });
};
