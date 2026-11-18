import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Checkbox, Descriptions, Empty, Form, Input, Radio, Select, Steps, Table, Tag } from '@arco-design/web-react';
import { ArrowLeft, Search } from 'lucide-react';
import {
  createOrganizationDraft, getIndicatorConflicts, getIndicatorScheme, getSchoolOrganizations,
  indicatorSchemes, maskPhone, organizationKindLabels, validateOrganizationDraft,
  type OperationsCustomers, type OrganizationCustomer, type OrganizationDraft,
} from './operationsCustomers';
import OperationsIndicatorTable from './OperationsIndicatorTable';
import OperationsStatus from './OperationsStatus';
import { confirmDiscardOperationsDraft } from './operationsDialogs';

interface Props {
  data: OperationsCustomers;
  existing?: OrganizationCustomer;
  onSave: (draft: OrganizationDraft, activate: boolean, confirmUnify: boolean) => void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

export default function OrganizationSetup({ data, existing, onSave, onCancel, onDirtyChange }: Props) {
  const initial = useRef<OrganizationDraft>(existing ? {
    name: existing.name, kind: existing.kind, administrator: existing.administrator, phone: existing.phone,
    schoolIds: [...existing.schoolIds], indicatorId: existing.indicatorId,
  } : createOrganizationDraft());
  const [draft, setDraft] = useState<OrganizationDraft>(initial.current);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof OrganizationDraft, string>>>({});
  const [schoolSearch, setSchoolSearch] = useState('');
  const [importIds, setImportIds] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial.current);
  const scheme = getIndicatorScheme(draft.indicatorId);
  const scope = getIndicatorConflicts(data, draft.schoolIds, draft.indicatorId);
  const hasConflicts = Boolean(scope.changedSchools.length || scope.changedOrganizations.length);
  const selectedSchools = data.schools.filter(item => draft.schoolIds.includes(item.id));
  const matchingSchools = data.schools.filter(item => `${item.name} ${item.id}`.includes(schoolSearch.trim()));

  useEffect(() => { onDirtyChange(dirty); return () => onDirtyChange(false); }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', protect);
    return () => window.removeEventListener('beforeunload', protect);
  }, [dirty]);

  const update = <K extends keyof OrganizationDraft>(key: K, value: OrganizationDraft[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: undefined }));
    setConfirmed(false);
    setSaveError('');
  };
  const validateField = (key: keyof OrganizationDraft) => {
    const all = validateOrganizationDraft(draft, data, existing?.id);
    setErrors(current => ({ ...current, [key]: all[key] }));
  };
  const fieldsForStep: (keyof OrganizationDraft)[][] = [[], ['kind', 'name', 'administrator', 'phone'], ['schoolIds'], ['indicatorId']];
  const next = () => {
    const all = validateOrganizationDraft(draft, data, existing?.id);
    const fields = fieldsForStep[step];
    const invalid = fields.filter(key => all[key]);
    setErrors(Object.fromEntries(invalid.map(key => [key, all[key]])));
    if (invalid.length) {
      const first = document.getElementById(`ops-org-${invalid[0]}`);
      first?.focus();
      return;
    }
    setStep(value => value + 1);
    setSaveError('');
    requestAnimationFrame(() => headingRef.current?.focus());
  };
  const save = async (activate: boolean) => {
    if (saving) return;
    if (activate && !confirmed) { setSaveError('请先确认数据查看范围及指标变更'); return; }
    setSaving(true);
    try { await onSave(draft, activate, confirmed); }
    catch (error) { setSaveError((error as Error).message); }
    finally { setSaving(false); }
  };
  const cancel = () => dirty ? confirmDiscardOperationsDraft(onCancel) : onCancel();
  const stepTitle = ['组织与管理员', '关联学校', '统一评价指标', '核对开通信息'][step - 1];
  const fieldError = (key: keyof OrganizationDraft) => errors[key] ? { validateStatus: 'error' as const, help: <span id={`ops-error-${key}`} role="alert">{errors[key]}</span> } : {};
  const fieldAccessibility = (key: keyof OrganizationDraft) => ({ 'aria-required': true as const, 'aria-invalid': Boolean(errors[key]), 'aria-describedby': errors[key] ? `ops-error-${key}` : undefined });

  return <div className="ops-setup">
    <div className="ops-setup-intro"><Button type="text" icon={<ArrowLeft size={16} aria-hidden="true" />} onClick={cancel}>返回列表</Button></div>
    <Steps current={step} size="small" className="ops-setup-steps">
      {['基本信息', '关联学校', '统一指标', '核对开通'].map(title => <Steps.Step key={title} title={title} />)}
    </Steps>
    <div className="ops-setup-body">
      <h2 ref={headingRef} tabIndex={-1} className="ops-section-title">{stepTitle}</h2>
      {step === 1 && <Form className="pc-form ops-organization-form" layout="vertical" onSubmit={next}>
        <Form.Item label="组织类型" required>
          <Radio.Group value={draft.kind} onChange={value => update('kind', value)}>
            {Object.entries(organizationKindLabels).map(([value, label]) => <Radio key={value} value={value}>{label}</Radio>)}
          </Radio.Group>
        </Form.Item>
        <Form.Item label="组织名称" required {...fieldError('name')}>
          <Input id="ops-org-name" value={draft.name} onChange={value => update('name', value)} onBlur={() => validateField('name')}
            placeholder={draft.kind === 'city' ? '例如：成都市教育局' : draft.kind === 'district' ? '例如：成都市高新区教育局' : '例如：明远教育集团'} maxLength={50} showWordLimit aria-label="组织名称" {...fieldAccessibility('name')} />
        </Form.Item>
        <div className="ops-form-section"><h3>管理员</h3>
          <Form.Item label="管理员姓名" required {...fieldError('administrator')}>
            <Input id="ops-org-administrator" value={draft.administrator} onChange={value => update('administrator', value)} onBlur={() => validateField('administrator')} placeholder="请输入管理员姓名" maxLength={30} aria-label="管理员姓名" {...fieldAccessibility('administrator')} />
          </Form.Item>
          <Form.Item label="管理员手机号" required {...fieldError('phone')}>
            <Input id="ops-org-phone" value={draft.phone} onChange={value => update('phone', value)} onBlur={() => validateField('phone')}
              placeholder="请输入11位手机号" maxLength={11} inputMode="tel" aria-label="管理员手机号" {...fieldAccessibility('phone')} />
          </Form.Item>
        </div>
      </Form>}

      {step === 2 && <>
        <div className="ops-import-schools pc-filter-bar">
          <label htmlFor="ops-import-customers">按已有组织批量添加学校</label>
          <Select id="ops-import-customers" mode="multiple" value={importIds} onChange={setImportIds} placeholder="选择已有组织" showSearch allowClear maxTagCount={1}
            options={data.organizations.filter(item => item.status === '已开通').map(item => ({ label: item.name, value: item.id }))} />
          <Button onClick={() => {
            const imported = data.organizations.filter(item => importIds.includes(item.id)).flatMap(item => item.schoolIds);
            update('schoolIds', [...new Set([...draft.schoolIds, ...imported])]); setImportIds([]);
          }} disabled={!importIds.length}>添加学校</Button>
        </div>
        <div className="ops-selection-toolbar pc-filter-bar">
          <Input id="ops-org-schoolIds" value={schoolSearch} onChange={setSchoolSearch} placeholder="搜索学校名称或编码" aria-label="搜索待关联学校" allowClear prefix={<Search size={14} aria-hidden="true" />} />
          <span role="status">已选择 <strong>{draft.schoolIds.length}</strong> 所学校</span>
          {draft.schoolIds.length > 0 && <Button type="text" onClick={() => update('schoolIds', [])}>清空选择</Button>}
        </div>
        {errors.schoolIds && <p role="alert" className="ops-error-text">{errors.schoolIds}</p>}
        <Table rowKey="id" data={matchingSchools} border={false} size="middle" scroll={{ x: 640 }} pagination={{ pageSize: 5 }}
          noDataElement={<Empty description="未找到匹配的学校" />}
          rowSelection={{ selectedRowKeys: draft.schoolIds, preserveSelectedRowKeys: true, checkCrossPage: true, onChange: keys => update('schoolIds', keys.map(String)), checkboxProps: school => ({ disabled: school.status !== '已开通', 'aria-label': `关联${school.name}` }) }}
          columns={[
            { title: '学校名称', dataIndex: 'name', width: 220 },
            { title: '学校编码', dataIndex: 'id', width: 100 },
            { title: '已关联组织', width: 230, render: (_, school) => getSchoolOrganizations(data, school.id).map(item => item.name).join('、') || '未关联' },
            { title: '状态', dataIndex: 'status', width: 90, render: status => <OperationsStatus value={status} /> },
          ]}
        />
        <p className="ops-field-help">同一学校可关联多个组织，已有组织关系继续保留。已停用的学校需先恢复开通。</p>
      </>}

      {step === 3 && <>
        <Form layout="vertical" className="pc-form ops-organization-form" onSubmit={next}>
          <Form.Item label="统一评价指标方案" required {...fieldError('indicatorId')}>
            <Select id="ops-org-indicatorId" value={draft.indicatorId || undefined} onChange={value => update('indicatorId', value)} placeholder="请选择指标方案" aria-label="统一评价指标方案" {...fieldAccessibility('indicatorId')}
              options={indicatorSchemes.map(item => ({ label: `${item.name} · ${item.version}`, value: item.id }))} />
          </Form.Item>
        </Form>
        {scheme && <>
          {hasConflicts ? <Alert className="ops-context-alert" type="warning" title="所选指标与部分学校正在使用的指标不同"
            content={`涉及${scope.changedSchools.length}所学校和${scope.changedOrganizations.length}个已开通组织。下一步将列出完整影响范围，确认统一后才会关联。`} />
            : <Alert className="ops-context-alert" type="info" content="关联学校将使用同一套学生评价指标，当前不允许学校自行补充。" />}
          <OperationsIndicatorTable indicatorId={draft.indicatorId} />
        </>}
      </>}

      {step === 4 && <>
        <Descriptions column={2} labelStyle={{ width: 112 }} data={[
          { label: '组织名称', value: draft.name }, { label: '组织类型', value: organizationKindLabels[draft.kind] },
          { label: '管理员', value: `${draft.administrator} · ${maskPhone(draft.phone)}` }, { label: '关联学校', value: `${selectedSchools.length}所` },
          { label: '统一评价指标', value: `${scheme?.name} · ${scheme?.version}` },
        ]} />
        <div className="ops-review-section"><h3>关联学校</h3><div className="ops-school-names">{selectedSchools.map(item => <Tag key={item.id}>{item.name}</Tag>)}</div></div>
        {hasConflicts && <div className="ops-review-section">
          <Alert type="warning" title="开通前需统一指标" content={`将先统一${scope.changedSchools.length}所学校及${scope.changedOrganizations.length}个已有组织的评价指标，再建立本次关联。关联组织的其他学校也可能被连带调整。`} />
          <Table rowKey="id" border={false} size="small" pagination={false} data={scope.changedSchools} scroll={{ x: 760 }}
            columns={[
              { title: '受影响学校', dataIndex: 'name' },
              { title: '影响类型', width: 120, render: (_, school) => draft.schoolIds.includes(school.id) ? '本次关联' : '连带调整' },
              { title: '原指标', render: (_, school) => { const previous = getIndicatorScheme(school.indicatorId); return previous ? `${previous.name} · ${previous.version}` : '未配置'; } },
              { title: '调整后指标', render: () => `${scheme?.name} · ${scheme?.version}` },
            ]}
          />
          {scope.changedOrganizations.length > 0 && <p className="ops-field-help">同步调整的组织：{scope.changedOrganizations.map(item => item.name).join('、')}。</p>}
          <p className="ops-field-help">新指标用于后续评价；历史评价记录及其指标版本保留。</p>
        </div>}
        <div className="ops-review-section">
          <Checkbox checked={confirmed} onChange={setConfirmed}>
            我已确认管理员可查看所选{selectedSchools.length}所学校的数据{hasConflicts ? '，并同意以上指标调整' : ''}。
          </Checkbox>
        </div>
      </>}
      {saveError && <Alert className="ops-context-alert" type="error" content={saveError} />}
    </div>
    <div className="ops-setup-footer">
      <Button onClick={cancel} disabled={saving}>取消</Button>
      <div className="ops-actions">
        {step > 1 && <Button onClick={() => { setStep(value => value - 1); setSaveError(''); }} disabled={saving}>上一步</Button>}
        {step < 4 ? <Button type="primary" onClick={next}>下一步</Button> : <>
          <Button onClick={() => save(false)} loading={saving}>保存草稿</Button>
          <Button type="primary" onClick={() => save(true)} loading={saving} disabled={!confirmed}>{hasConflicts ? '统一指标并开通' : '确认开通'}</Button>
        </>}
      </div>
    </div>
  </div>;
}
