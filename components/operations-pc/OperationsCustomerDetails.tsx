import React, { useState } from 'react';
import { Button, Descriptions, Drawer, Table, Tabs } from '@arco-design/web-react';
import {
  getIndicatorScheme, getSchoolAuthorizationStatus, getSchoolOrganizations, maskPhone, organizationKindLabels,
  type CustomerEdition, type OperationsCustomers,
} from './operationsCustomers';
import OperationsIndicatorTable from './OperationsIndicatorTable';
import OperationsStatus from './OperationsStatus';
import OperationsPersonalStatistics from './OperationsPersonalStatistics';

export interface CustomerDetailSelection { edition: CustomerEdition; id: string; tab?: string }

export default function OperationsCustomerDetails({ selection, data, onClose }: {
  selection: CustomerDetailSelection;
  data: OperationsCustomers;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(selection.tab ?? 'basic');
  const personal = selection.edition === 'personal' ? data.personal.find(item => item.id === selection.id) : undefined;
  const school = selection.edition === 'school' ? data.schools.find(item => item.id === selection.id) : undefined;
  const organization = selection.edition === 'organization' ? data.organizations.find(item => item.id === selection.id) : undefined;
  const item = personal ?? school ?? organization;
  if (!item) return null;
  const organizationSchools = organization ? data.schools.filter(row => organization.schoolIds.includes(row.id)) : [];
  const schoolOrganizations = school ? getSchoolOrganizations(data, school.id) : [];
  const basic = [
    { label: personal ? '用户编号' : organization ? '组织编码' : '学校编号', value: item.id },
    { label: school ? '授权状态' : '状态', value: <OperationsStatus value={school ? getSchoolAuthorizationStatus(school) : item.status} /> },
    ...(personal ? [
      { label: '管理员账号', value: personal.adminAccount }, { label: '姓名', value: personal.name },
      { label: '填写学校', value: personal.schoolName }, { label: '注册日期', value: personal.registeredAt },
      { label: '统计信息', value: <OperationsPersonalStatistics statistics={personal.statistics} /> },
      { label: '注册方式', value: '用户自行注册' },
    ] : []),
    ...(school ? [
      { label: '学校名称', value: school.name }, { label: '学校类型', value: school.schoolType },
      { label: '学校等级', value: `${school.level}星` }, { label: '省／市／区', value: school.region },
      { label: '管理员姓名', value: school.administrator }, { label: '管理员手机', value: maskPhone(school.phone) },
      { label: '拥有教师数', value: school.teacherCount.toLocaleString('zh-CN') },
      { label: '拥有班级数', value: school.classCount.toLocaleString('zh-CN') },
      { label: '拥有学生数', value: school.studentCount.toLocaleString('zh-CN') },
      { label: '授权起止时间', value: `${school.authorizationStartsAt} 至 ${school.authorizationEndsAt}` },
    ] : []),
    ...(organization ? [
      { label: '组织名称', value: organization.name }, { label: '组织类型', value: organizationKindLabels[organization.kind] },
      { label: '管理员', value: organization.administrator }, { label: '管理员手机号', value: maskPhone(organization.phone) },
      { label: '创建时间', value: organization.createdAt },
      { label: organization.status === '待开通' ? '拟关联学校' : '关联学校', value: `${organizationSchools.length}所` },
      { label: '数据查看范围', value: organization.status === '待开通' ? '开通后生效' : '已关联学校' },
    ] : []),
  ];
  return <Drawer visible title={item.name} width="min(880px, calc(100vw - 32px))" wrapClassName="operations-pc-overlay" className="ops-detail-drawer"
    onCancel={onClose} maskClosable focusLock autoFocus footer={<Button onClick={onClose}>关闭</Button>}>
    <Tabs activeTab={tab} onChange={setTab} animation={false}>
      <Tabs.TabPane key="basic" title="基本信息"><Descriptions column={1} labelStyle={{ width: 128 }} data={basic} /></Tabs.TabPane>
      {school && <Tabs.TabPane key="schools" title="关联组织"><Table rowKey="id" data={schoolOrganizations} border={false} pagination={false} columns={[
        { title: '组织名称', dataIndex: 'name' },
        { title: '类型', render: (_, row) => organizationKindLabels[row.kind] },
        { title: '统一评价指标', render: (_, row) => getIndicatorScheme(row.indicatorId)?.name },
      ]} /></Tabs.TabPane>}
      {organization && <Tabs.TabPane key="schools" title={organization.status === '待开通' ? '拟关联学校' : '关联学校'}><Table rowKey="id" data={organizationSchools} border={false} pagination={false} columns={[
        { title: '学校名称', dataIndex: 'name' }, { title: '学校编码', dataIndex: 'id', width: 112 },
        { title: '其他已关联组织', render: (_, row) => getSchoolOrganizations(data, row.id).filter(customer => customer.id !== organization.id).map(customer => customer.name).join('、') || '未关联' },
      ]} /></Tabs.TabPane>}
      {(school || organization) && <Tabs.TabPane key="indicators" title="统一评价指标"><OperationsIndicatorTable indicatorId={(school ?? organization)!.indicatorId} /></Tabs.TabPane>}
    </Tabs>
  </Drawer>;
}
