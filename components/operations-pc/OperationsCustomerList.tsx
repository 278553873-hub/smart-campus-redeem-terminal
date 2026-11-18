import React, { useState } from 'react';
import { Button, Empty, Form, Input, Link, Message, Select, Table, Tabs, Tag, type TableColumnProps } from '@arco-design/web-react';
import { Plus, Search } from 'lucide-react';
import {
  getIndicatorScheme, getSchoolAuthorizationStatus, getSchoolOrganizations, maskPhone, organizationKindLabels, saveOrganization,
  type CustomerEdition, type OrganizationCustomer, type OrganizationDraft, type PersonalCustomer, type SchoolCustomer,
} from './operationsCustomers';
import useOperationsCustomers from './useOperationsCustomers';
import OperationsCustomerDetails, { type CustomerDetailSelection } from './OperationsCustomerDetails';
import OrganizationSetup from './OrganizationSetup';
import OperationsStatus from './OperationsStatus';
import { personalStatisticsFields } from './OperationsPersonalStatistics';
import { operationsTableTokens } from './operationsTableTokens';

const personalColumnWidth = operationsTableTokens.columnWidth;
const schoolColumnWidth = operationsTableTokens.schoolColumnWidth;
const schoolTableWidth = Object.values(schoolColumnWidth).reduce((total, width) => total + width, 0);
const personalTableMinWidth = Object.values(personalColumnWidth).reduce((total, width) => total + width, 0)
  + personalStatisticsFields.length * operationsTableTokens.statisticMinWidth;

const editions: { key: CustomerEdition; title: string; listTitle: string }[] = [
  { key: 'personal', title: '个人版', listTitle: '个人用户' },
  { key: 'school', title: '学校版', listTitle: '合作学校' },
  { key: 'organization', title: '组织版', listTitle: '组织列表' },
];
interface Filters { keyword: string; status?: string; kind?: string; organizationId?: string }
const emptyFilters = (): Filters => ({ keyword: '' });
const initialFilters = (): Record<CustomerEdition, Filters> => ({ personal: emptyFilters(), school: emptyFilters(), organization: emptyFilters() });
const statusTag = (status: string) => <OperationsStatus value={status} />;
const cell = (primary: React.ReactNode, secondary: string) => <div className="ops-table-cell"><div>{primary}</div><span>{secondary}</span></div>;

export default function OperationsCustomerList({ onDirtyChange, onTitleChange }: {
  onDirtyChange: (dirty: boolean) => void;
  onTitleChange: (title: string) => void;
}) {
  const { data, save } = useOperationsCustomers();
  const [edition, setEdition] = useState<CustomerEdition>('school');
  const [inputs, setInputs] = useState(initialFilters);
  const [queries, setQueries] = useState(initialFilters);
  const [pages, setPages] = useState({ personal: 1, school: 1, organization: 1 });
  const [detail, setDetail] = useState<CustomerDetailSelection | null>(null);
  const [setup, setSetup] = useState<{ existing?: OrganizationCustomer } | null>(null);
  const input = inputs[edition];
  const query = queries[edition];
  const keyword = query.keyword.trim().toLocaleLowerCase();
  const matches = (value: string) => value.toLocaleLowerCase().includes(keyword);
  const setInput = (patch: Partial<Filters>) => setInputs(current => ({ ...current, [edition]: { ...current[edition], ...patch } }));
  const reset = () => {
    setInputs(current => ({ ...current, [edition]: emptyFilters() }));
    setQueries(current => ({ ...current, [edition]: emptyFilters() }));
    setPages(current => ({ ...current, [edition]: 1 }));
  };
  const showDetail = (selectedEdition: CustomerEdition, id: string, tab?: string) => setDetail({ edition: selectedEdition, id, tab });
  const detailAction = (selectedEdition: CustomerEdition, id: string) => <Link hoverable={false} role="button" tabIndex={0}
    onClick={() => showDetail(selectedEdition, id)} onKeyDown={event => {
      if (event.key === ' ') { event.preventDefault(); showDetail(selectedEdition, id); }
    }}>查看</Link>;
  const openSetup = (existing?: OrganizationCustomer) => {
    setSetup({ existing });
    onTitleChange(existing ? '开通组织' : '新建组织');
  };
  const closeSetup = () => { setSetup(null); onDirtyChange(false); onTitleChange('学校列表'); };
  const saveSetup = (draft: OrganizationDraft, activate: boolean, confirmUnify: boolean) => {
    const next = saveOrganization(data, draft, { activate, confirmUnify, editingId: setup?.existing?.id });
    save(next);
    setEdition('organization');
    setInputs(current => ({ ...current, organization: emptyFilters() }));
    setQueries(current => ({ ...current, organization: emptyFilters() }));
    setPages(current => ({ ...current, organization: 1 }));
    closeSetup();
    Message.success(activate ? '组织已开通' : '草稿已保存，尚未开通');
  };
  const personalRows = data.personal.filter(item => matches(`${item.adminAccount} ${item.name}`) && (!query.status || item.status === query.status));
  const schoolRows = data.schools.filter(item => {
    const organizations = getSchoolOrganizations(data, item.id);
    return matches(`${item.name} ${item.id}`) && (!query.status || getSchoolAuthorizationStatus(item) === query.status) && (
      !query.organizationId || (query.organizationId === 'none' ? !organizations.length : organizations.some(org => org.id === query.organizationId))
    );
  });
  const organizationRows = data.organizations.filter(item => matches(`${item.name} ${item.id}`) && (!query.status || item.status === query.status) && (!query.kind || item.kind === query.kind));
  const personalColumns: TableColumnProps<PersonalCustomer>[] = [
    { title: '管理员账号', dataIndex: 'adminAccount', width: personalColumnWidth.account },
    { title: '姓名', dataIndex: 'name', width: personalColumnWidth.name },
    { title: '填写学校', dataIndex: 'schoolName', width: personalColumnWidth.school, ellipsis: true },
    { title: '统计信息', align: 'left', children: personalStatisticsFields.map(field => ({
      title: field.label,
      key: field.key,
      align: 'left' as const,
      render: (_: unknown, row: PersonalCustomer) => <span className="ops-statistic-value">{row.statistics[field.key].toLocaleString('zh-CN')}</span>,
    })) },
    { title: '注册日期', dataIndex: 'registeredAt', width: personalColumnWidth.dateTime },
    { title: '操作', fixed: 'right', width: personalColumnWidth.action, render: (_, row) => detailAction('personal', row.id) },
  ];
  const schoolColumns: TableColumnProps<SchoolCustomer>[] = [
    { title: '学校名称', dataIndex: 'name', fixed: 'left', width: schoolColumnWidth.schoolName, ellipsis: true },
    { title: '学校编号', dataIndex: 'id', width: schoolColumnWidth.schoolId },
    { title: '已关联组织', width: schoolColumnWidth.organizations, render: (_, row) => {
      const organizations = getSchoolOrganizations(data, row.id);
      return organizations.length ? <div className="ops-related-links">{organizations.map(org => <Button key={org.id} type="text" size="small" onClick={() => showDetail('organization', org.id)}>{org.name}</Button>)}</div> : <span className="ops-secondary">未关联</span>;
    } },
    { title: '学校类型', dataIndex: 'schoolType', width: schoolColumnWidth.schoolType },
    { title: '管理员姓名', dataIndex: 'administrator', width: schoolColumnWidth.administrator },
    { title: '管理员手机', dataIndex: 'phone', width: schoolColumnWidth.phone, render: maskPhone },
    { title: '拥有教师数', dataIndex: 'teacherCount', width: schoolColumnWidth.teacherCount, render: count => <span className="ops-statistic-value">{count.toLocaleString('zh-CN')}</span> },
    { title: '拥有班级数', dataIndex: 'classCount', width: schoolColumnWidth.classCount, render: count => <span className="ops-statistic-value">{count.toLocaleString('zh-CN')}</span> },
    { title: '拥有学生数', dataIndex: 'studentCount', width: schoolColumnWidth.studentCount, render: count => <span className="ops-statistic-value">{count.toLocaleString('zh-CN')}</span> },
    { title: '授权状态', width: schoolColumnWidth.authorizationStatus, render: (_, row) => statusTag(getSchoolAuthorizationStatus(row)) },
    { title: '授权起止时间', width: schoolColumnWidth.authorizationPeriod, render: (_, row) => `${row.authorizationStartsAt} 至 ${row.authorizationEndsAt}` },
    { title: '学校等级', dataIndex: 'level', width: schoolColumnWidth.level, render: level => `${level}星` },
    { title: '省／市／区', dataIndex: 'region', width: schoolColumnWidth.region },
    { title: '操作', fixed: 'right', width: schoolColumnWidth.action, render: (_, row) => detailAction('school', row.id) },
  ];
  const organizationColumns: TableColumnProps<OrganizationCustomer>[] = [
    { title: '组织', width: 208, render: (_, row) => cell(row.name, row.id) },
    { title: '组织类型', width: operationsTableTokens.organizationTypeWidth, render: (_, row) => <Tag>{organizationKindLabels[row.kind]}</Tag> },
    { title: '关联学校', width: 100, render: (_, row) => <Button type="text" size="small" onClick={() => showDetail('organization', row.id, 'schools')}>{new Set(row.schoolIds).size}所</Button> },
    { title: '统一评价指标', width: 200, render: (_, row) => {
      const scheme = getIndicatorScheme(row.indicatorId);
      return cell(scheme?.name ?? '未配置', scheme?.version ?? '');
    } },
    { title: '管理员', width: 148, render: (_, row) => cell(row.administrator, maskPhone(row.phone)) },
    { title: '状态', dataIndex: 'status', width: 100, render: statusTag },
    { title: '操作', fixed: 'right', width: 156, render: (_, row) => <div className="ops-row-actions"><Button type="text" size="small" onClick={() => showDetail('organization', row.id)}>查看</Button>
      {row.status === '待开通' && <Button type="text" size="small" onClick={() => openSetup(row)}>继续开通</Button>}</div> },
  ];
  if (setup) return <OrganizationSetup key={setup.existing?.id ?? 'new'} data={data} existing={setup.existing} onSave={saveSetup} onCancel={closeSetup} onDirtyChange={onDirtyChange} />;
  const hasFilters = Object.values(query).some(Boolean);
  const emptyState = <div className="operations-pc-table-empty" role="status"><Empty description={hasFilters ? '未找到匹配结果' : '暂无数据'} />{hasFilters && <Button type="text" onClick={reset}>清空筛选</Button>}</div>;
  const pagination = { current: pages[edition], pageSize: 10, showTotal: true, onChange: (page: number) => setPages(current => ({ ...current, [edition]: page })) };
  const statusOptions = edition === 'personal' ? ['正常', '已停用'] : edition === 'school' ? ['合作中', '已到期', '未开始'] : ['已开通', '待开通'];
  const listContent = <div className={`operations-pc-list-content${edition === 'personal' ? ' ops-personal-list' : ''}`}>
      <Form layout="inline" className="pc-filter-bar operations-pc-filters" onSubmit={() => {
        setQueries(current => ({ ...current, [edition]: { ...input } })); setPages(current => ({ ...current, [edition]: 1 }));
      }}>
        <Form.Item label={edition === 'personal' ? '管理员' : edition === 'school' ? '学校' : '组织'}>
          <Input value={input.keyword} onChange={value => setInput({ keyword: value })} placeholder={edition === 'personal' ? '账号或姓名' : edition === 'school' ? '名称或编号' : '名称或编码'} allowClear aria-label={edition === 'personal' ? '搜索管理员账号或姓名' : edition === 'school' ? '搜索学校名称或编号' : '搜索组织名称或编码'} />
        </Form.Item>
        {edition === 'organization' && <Form.Item label="组织类型"><Select value={input.kind} onChange={value => setInput({ kind: value })} placeholder="全部类型" allowClear aria-label="筛选组织类型" options={[
          ...Object.entries(organizationKindLabels).map(([value, label]) => ({ label, value })),
        ]} /></Form.Item>}
        {edition === 'school' && <Form.Item label="关联组织"><Select value={input.organizationId} onChange={value => setInput({ organizationId: value })} placeholder="全部组织" allowClear showSearch aria-label="筛选学校关联组织"
          options={[{ label: '未关联组织', value: 'none' }, ...data.organizations.filter(item => item.status === '已开通').map(item => ({ label: item.name, value: item.id }))]} /></Form.Item>}
        <Form.Item label={edition === 'school' ? '授权状态' : '状态'}><Select value={input.status} onChange={value => setInput({ status: value })} placeholder="全部状态" allowClear aria-label={edition === 'school' ? '筛选授权状态' : '筛选状态'} options={statusOptions} /></Form.Item>
        <Form.Item><div className="ops-actions"><Button type="primary" htmlType="submit" icon={<Search size={14} aria-hidden="true" />}>查询</Button><Button onClick={reset}>重置</Button></div></Form.Item>
      </Form>
      {edition !== 'personal' && <div className="ops-list-toolbar"><h2>{editions.find(item => item.key === edition)?.listTitle}</h2>
        {edition === 'organization' && <Button type="primary" icon={<Plus size={16} aria-hidden="true" />} onClick={() => openSetup()}>新建组织</Button>}
      </div>}
      {edition === 'personal' && <Table<PersonalCustomer> rowKey="id" columns={personalColumns} data={personalRows} border={false} size="middle" tableLayoutFixed scroll={{ x: personalTableMinWidth }} pagination={pagination} noDataElement={emptyState} />}
      {edition === 'school' && <Table<SchoolCustomer> rowKey="id" columns={schoolColumns} data={schoolRows} border={false} size="middle" tableLayoutFixed scroll={{ x: schoolTableWidth }} pagination={pagination} noDataElement={emptyState} />}
      {edition === 'organization' && <Table<OrganizationCustomer> rowKey="id" columns={organizationColumns} data={organizationRows} border={false} size="middle" scroll={{ x: organizationColumns.reduce((total, column) => total + Number(column.width), 0) }} pagination={pagination} noDataElement={emptyState} />}
    </div>;
  return <>
    <Tabs className="ops-customer-tabs" headerPadding={false} activeTab={edition} onChange={value => setEdition(value as CustomerEdition)} animation={false}>
      {editions.map(item => <Tabs.TabPane key={item.key} title={item.title}>{edition === item.key ? listContent : null}</Tabs.TabPane>)}
    </Tabs>
    {detail && <OperationsCustomerDetails key={`${detail.edition}-${detail.id}-${detail.tab}`} selection={detail} data={data} onClose={() => setDetail(null)} />}
  </>;
}
