export type CustomerEdition = 'personal' | 'school' | 'organization';
export type OrganizationKind = 'city' | 'district' | 'group';
export const schoolTypes = ['小学', '初中', '高中', '九年一贯制', '十二年一贯制', '幼儿园'] as const;
export type SchoolAuthorizationStatus = '合作中' | '已到期' | '未开始';

export interface PersonalCustomer {
  id: string;
  adminAccount: string;
  name: string;
  schoolName: string;
  statistics: {
    createdClassCount: number;
    createdStudentCount: number;
    evaluationRecordCount: number;
  };
  registeredAt: string;
  status: '正常' | '已停用';
}

export interface SchoolCustomer {
  id: string;
  name: string;
  region: string;
  administrator: string;
  phone: string;
  schoolType: typeof schoolTypes[number];
  level: 1 | 2 | 3 | 4 | 5;
  teacherCount: number;
  classCount: number;
  studentCount: number;
  authorizationStartsAt: string;
  authorizationEndsAt: string;
  indicatorId: string;
  status: '已开通' | '已停用';
}

export interface OrganizationCustomer {
  id: string;
  name: string;
  kind: OrganizationKind;
  administrator: string;
  phone: string;
  schoolIds: string[];
  indicatorId: string;
  status: '已开通' | '待开通';
  createdAt: string;
}

export interface OrganizationDraft {
  name: string;
  kind: OrganizationKind;
  administrator: string;
  phone: string;
  schoolIds: string[];
  indicatorId: string;
}

export interface IndicatorScheme {
  id: string;
  name: string;
  version: string;
  stage: string;
  items: { id: string; level1: string; level2: string; level3: string }[];
}

export interface OperationsCustomers {
  personal: PersonalCustomer[];
  schools: SchoolCustomer[];
  organizations: OrganizationCustomer[];
}

export const organizationKindLabels: Record<OrganizationKind, string> = { city: '市级教育局', district: '区级教育局', group: '教育集团' };

export const createOrganizationDraft = (): OrganizationDraft => ({
  name: '', kind: 'district', administrator: '', phone: '', schoolIds: [], indicatorId: '',
});

export const indicatorSchemes: IndicatorScheme[] = [
  {
    id: 'primary-v1', name: '小学五育综合评价', version: 'V1.0', stage: '小学',
    items: [
      ['德育', '文明礼仪', '礼貌待人'], ['德育', '遵规守纪', '遵守秩序'],
      ['智育', '学习习惯', '专注听讲'], ['智育', '探究实践', '主动提问'],
      ['体育', '运动习惯', '坚持锻炼'], ['体育', '健康生活', '规律作息'],
      ['美育', '艺术实践', '参与创作'], ['美育', '审美体验', '欣赏作品'],
      ['劳育', '生活劳动', '整理物品'], ['劳育', '集体劳动', '主动分担'],
    ].map(([level1, level2, level3], i) => ({ id: `p-${i}`, level1, level2, level3 })),
  },
  {
    id: 'secondary-v1', name: '初中五育综合评价', version: 'V1.0', stage: '初中',
    items: [
      ['德育', '责任担当', '履行职责'], ['德育', '文明交往', '尊重他人'],
      ['智育', '自主学习', '制定计划'], ['智育', '思维品质', '独立思考'],
      ['体育', '运动参与', '坚持锻炼'], ['体育', '健康管理', '自我调节'],
      ['美育', '艺术实践', '表达创意'], ['美育', '审美素养', '鉴赏作品'],
      ['劳育', '劳动实践', '完成任务'], ['劳育', '社会服务', '服务集体'],
    ].map(([level1, level2, level3], i) => ({ id: `s-${i}`, level1, level2, level3 })),
  },
];

export const createOperationsCustomers = (): OperationsCustomers => ({
  personal: [
    { id: 'U10021', adminAccount: '13800000001', name: '林老师', schoolName: '青禾实验小学', statistics: { createdClassCount: 3, createdStudentCount: 126, evaluationRecordCount: 2680 }, registeredAt: '2026-11-16 09:32', status: '正常' },
    { id: 'U10020', adminAccount: '13800000002', name: '陈老师', schoolName: '明远小学', statistics: { createdClassCount: 2, createdStudentCount: 83, evaluationRecordCount: 1246 }, registeredAt: '2026-11-15 14:08', status: '正常' },
    { id: 'U10019', adminAccount: '13800000003', name: '周老师', schoolName: '云川中学', statistics: { createdClassCount: 1, createdStudentCount: 45, evaluationRecordCount: 832 }, registeredAt: '2026-11-13 10:46', status: '正常' },
    { id: 'U10018', adminAccount: '13800000004', name: '许老师', schoolName: '青禾第二小学', statistics: { createdClassCount: 0, createdStudentCount: 0, evaluationRecordCount: 0 }, registeredAt: '2026-11-11 16:25', status: '已停用' },
  ],
  schools: [
    { id: '1053', name: '青禾实验小学', region: '四川省 / 成都市 / 高新区', administrator: '李老师', phone: '13900000001', schoolType: '小学', level: 5, teacherCount: 86, classCount: 36, studentCount: 1620, authorizationStartsAt: '2026-09-01', authorizationEndsAt: '2027-08-31', indicatorId: 'primary-v1', status: '已开通' },
    { id: '1052', name: '青禾第二小学', region: '四川省 / 成都市 / 高新区', administrator: '王老师', phone: '13900000002', schoolType: '小学', level: 4, teacherCount: 62, classCount: 24, studentCount: 1080, authorizationStartsAt: '2026-09-01', authorizationEndsAt: '2027-08-31', indicatorId: 'primary-v1', status: '已开通' },
    { id: '1051', name: '明远小学', region: '四川省 / 成都市 / 锦江区', administrator: '赵老师', phone: '13900000003', schoolType: '小学', level: 3, teacherCount: 48, classCount: 18, studentCount: 756, authorizationStartsAt: '2026-10-01', authorizationEndsAt: '2027-09-30', indicatorId: 'primary-v1', status: '已开通' },
    { id: '1050', name: '明远第二小学', region: '四川省 / 成都市 / 武侯区', administrator: '孙老师', phone: '13900000004', schoolType: '小学', level: 3, teacherCount: 52, classCount: 20, studentCount: 840, authorizationStartsAt: '2026-10-01', authorizationEndsAt: '2027-09-30', indicatorId: 'primary-v1', status: '已开通' },
    { id: '1049', name: '云川中学', region: '四川省 / 成都市 / 青羊区', administrator: '吴老师', phone: '13900000005', schoolType: '初中', level: 4, teacherCount: 96, classCount: 30, studentCount: 1380, authorizationStartsAt: '2025-09-01', authorizationEndsAt: '2026-08-31', indicatorId: 'secondary-v1', status: '已开通' },
    { id: '1048', name: '梧桐实验学校', region: '四川省 / 成都市 / 成华区', administrator: '郑老师', phone: '13900000006', schoolType: '九年一贯制', level: 2, teacherCount: 72, classCount: 27, studentCount: 1188, authorizationStartsAt: '2027-02-01', authorizationEndsAt: '2028-01-31', indicatorId: 'primary-v1', status: '已开通' },
    { id: '1047', name: '青禾第三小学', region: '四川省 / 成都市 / 金牛区', administrator: '钱老师', phone: '13900000007', schoolType: '小学', level: 1, teacherCount: 28, classCount: 12, studentCount: 480, authorizationStartsAt: '2025-09-01', authorizationEndsAt: '2026-08-31', indicatorId: 'primary-v1', status: '已停用' },
  ],
  organizations: [
    { id: 'Q1003', name: '成都市教育局', kind: 'city', administrator: '刘主任', phone: '13700000003', schoolIds: ['1053', '1052', '1051', '1050'], indicatorId: 'primary-v1', status: '已开通', createdAt: '2026-11-16' },
    { id: 'Q1002', name: '成都市高新区', kind: 'district', administrator: '张主任', phone: '13700000001', schoolIds: ['1053', '1052'], indicatorId: 'primary-v1', status: '已开通', createdAt: '2026-11-12' },
    { id: 'G1001', name: '明远教育集团', kind: 'group', administrator: '陈主任', phone: '13700000002', schoolIds: ['1051', '1050'], indicatorId: 'primary-v1', status: '已开通', createdAt: '2026-11-05' },
  ],
});

export const maskPhone = (phone: string) => phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');

/** 授权按中国时区的自然日计算，结束日期当天仍为合作中。 */
export const getSchoolAuthorizationStatus = (
  school: Pick<SchoolCustomer, 'authorizationStartsAt' | 'authorizationEndsAt'>,
  now = new Date(),
): SchoolAuthorizationStatus => {
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  if (date < school.authorizationStartsAt) return '未开始';
  if (date > school.authorizationEndsAt) return '已到期';
  return '合作中';
};

export const getSchoolOrganizations = (data: OperationsCustomers, schoolId: string) => (
  data.organizations.filter(item => item.status === '已开通' && item.schoolIds.includes(schoolId))
);

export const validateOrganizationDraft = (draft: OrganizationDraft, data: OperationsCustomers, editingId?: string) => {
  const errors: Partial<Record<keyof OrganizationDraft, string>> = {};
  if (!draft.name.trim()) errors.name = '请输入组织名称';
  else if (draft.name.trim().length > 50) errors.name = '名称不能超过50个字';
  else if (data.organizations.some(item => item.id !== editingId && item.name === draft.name.trim())) errors.name = '该名称已存在，请使用其他名称';
  if (!Object.hasOwn(organizationKindLabels, draft.kind)) errors.kind = '请选择组织类型';
  if (!draft.administrator.trim()) errors.administrator = '请输入管理员姓名';
  else if (draft.administrator.trim().length > 30) errors.administrator = '管理员姓名不能超过30个字';
  if (!/^1\d{10}$/.test(draft.phone.trim())) errors.phone = '请输入11位管理员手机号';
  if (!draft.schoolIds.length) errors.schoolIds = '请至少选择一所关联学校';
  else if (draft.schoolIds.some(id => !data.schools.some(school => school.id === id && school.status === '已开通'))) errors.schoolIds = '所选学校不可用，请重新选择已开通的学校';
  if (!indicatorSchemes.some(item => item.id === draft.indicatorId)) errors.indicatorId = '请选择统一评价指标方案';
  return errors;
};

export const getIndicatorScheme = (id: string) => indicatorSchemes.find(item => item.id === id);

/** 指标完全统一时，共用学校会把多个组织连接成一个调整范围，必须传递展开。 */
export const collectIndicatorScope = (data: OperationsCustomers, selectedSchoolIds: string[]) => {
  const schoolIds = new Set(selectedSchoolIds);
  const organizationIds = new Set<string>();
  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const organization of data.organizations) {
      if (organization.status !== '已开通' || organizationIds.has(organization.id)) continue;
      if (!organization.schoolIds.some(id => schoolIds.has(id))) continue;
      organizationIds.add(organization.id);
      organization.schoolIds.forEach(id => schoolIds.add(id));
      expanded = true;
    }
  }
  return {
    schools: data.schools.filter(item => schoolIds.has(item.id)),
    organizations: data.organizations.filter(item => organizationIds.has(item.id)),
  };
};

export const getIndicatorConflicts = (data: OperationsCustomers, schoolIds: string[], indicatorId: string) => {
  const scope = collectIndicatorScope(data, schoolIds);
  return {
    ...scope,
    changedSchools: scope.schools.filter(item => item.indicatorId !== indicatorId),
    changedOrganizations: scope.organizations.filter(item => item.indicatorId !== indicatorId),
  };
};

/** Demo 内的原子更新：明确确认统一指标后，才一并建立关联；历史评价数据不在本模块修改。 */
export const saveOrganization = (
  data: OperationsCustomers,
  draft: OrganizationDraft,
  options: { activate: boolean; confirmUnify?: boolean; editingId?: string },
  now = new Date(),
): OperationsCustomers => {
  const errors = validateOrganizationDraft(draft, data, options.editingId);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const previous = data.organizations.find(item => item.id === options.editingId);
  if (previous?.status === '已开通' && !options.activate) throw new Error('已开通组织不能通过保存草稿停用');
  const conflicts = getIndicatorConflicts(data, draft.schoolIds, draft.indicatorId);
  const hasConflicts = conflicts.changedSchools.length > 0 || conflicts.changedOrganizations.length > 0;
  if (options.activate && hasConflicts && !options.confirmUnify) throw new Error('存在指标冲突，请先确认统一指标的影响范围');
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const id = previous?.id ?? `C${now.getTime()}`;
  const organization: OrganizationCustomer = {
    ...draft, id, name: draft.name.trim(), administrator: draft.administrator.trim(), phone: draft.phone.trim(),
    schoolIds: [...new Set(draft.schoolIds)], status: options.activate ? '已开通' : '待开通', createdAt: previous?.createdAt ?? date,
  };
  return {
    ...data,
    schools: data.schools.map(item => options.activate && conflicts.schools.some(school => school.id === item.id) ? { ...item, indicatorId: draft.indicatorId } : item),
    organizations: [organization, ...data.organizations.filter(item => item.id !== id).map(item => (
      options.activate && conflicts.organizations.some(related => related.id === item.id) ? { ...item, indicatorId: draft.indicatorId } : item
    ))],
  };
};
