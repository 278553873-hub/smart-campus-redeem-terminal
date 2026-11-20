import { useState } from 'react';
import { createOperationsCustomers, organizationKindLabels, type OperationsCustomers } from './operationsCustomers';

const storageKey = 'letu-operations-customers:v1';

const load = (): OperationsCustomers => {
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null');
    if ([2, 3, 4].includes(value?.version) && Array.isArray(value.data?.organizations) && Array.isArray(value.data?.schools)) {
      const seed = createOperationsCustomers();
      const organizations = value.data.organizations.filter((item: any) => (
        item && typeof item.id === 'string' && typeof item.name === 'string' &&
        Object.hasOwn(organizationKindLabels, item.kind) && typeof item.administrator === 'string' &&
        typeof item.phone === 'string' && typeof item.createdAt === 'string' &&
        Array.isArray(item.schoolIds) && item.schoolIds.every((id: unknown) => typeof id === 'string') &&
        typeof item.indicatorId === 'string' && ['已开通', '待开通'].includes(item.status)
      )).map((item: any) => {
        const seeded = seed.organizations.find(organization => organization.id === item.id);
        return {
          ...item,
          kind: value.version === 2 && item.kind === 'district' && seeded?.kind === 'city' ? 'city' : item.kind,
          authorizationStartsAt: typeof item.authorizationStartsAt === 'string' ? item.authorizationStartsAt : seeded?.authorizationStartsAt ?? '',
          authorizationEndsAt: typeof item.authorizationEndsAt === 'string' ? item.authorizationEndsAt : seeded?.authorizationEndsAt ?? '',
        };
      });
      const schools = seed.schools.map(school => ({
        ...school,
        indicatorId: value.data.schools.find((item: any) => item?.id === school.id && typeof item.indicatorId === 'string')?.indicatorId ?? school.indicatorId,
      }));
      return { ...seed, schools, organizations };
    }
  } catch { /* 存储不可用或旧数据损坏时仍能打开演示页面。 */ }
  return createOperationsCustomers();
};

export default function useOperationsCustomers() {
  const [data, setData] = useState(load);
  const save = (next: OperationsCustomers) => {
    try { window.localStorage.setItem(storageKey, JSON.stringify({ version: 4, data: next })); }
    catch { throw new Error('保存失败，请检查浏览器存储空间后重试，当前输入已保留。'); }
    setData(next);
  };
  return { data, save };
}
