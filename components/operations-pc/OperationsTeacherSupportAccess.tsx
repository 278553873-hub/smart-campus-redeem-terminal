import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Empty, Form, Input, Message, Modal, Table, type TableColumnProps } from '@arco-design/web-react';
import { Plus, Search } from 'lucide-react';
import { DEMO_TEACHER_ACCOUNTS, DEMO_TEACHER_SCHOOL_NAMES, findDemoTeacherAccount, isDemoTeacherPhone, type DemoTeacherAccount } from '../../shared/demoTeacherAccounts';
import { addDemoTeacherSupportAccount, hasDemoTeacherSupportAccess, readDemoTeacherSupportAccounts, removeDemoTeacherSupportAccount, subscribeToDemoTeacherSupportAccess } from '../../shared/demoTeacherSupportAccess';
import { confirmRemoveTeacherSupportAccess } from './operationsDialogs';

const [demoOperator, , demoTarget] = DEMO_TEACHER_ACCOUNTS;

const showSchools = (account: DemoTeacherAccount) => account.schoolSpaceIds.length > 0
  ? <ul role="list">{account.schoolSpaceIds.map(id => <li key={id}>{DEMO_TEACHER_SCHOOL_NAMES[id]}</li>)}</ul>
  : '暂无关联学校';

export default function OperationsTeacherSupportAccess() {
  const [accounts, setAccounts] = useState(readDemoTeacherSupportAccounts);
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<DemoTeacherAccount>();
  const [error, setError] = useState('');

  useEffect(() => {
    const syncAccounts = () => setAccounts(readDemoTeacherSupportAccounts());
    const unsubscribe = subscribeToDemoTeacherSupportAccess(syncAccounts);
    syncAccounts();
    return unsubscribe;
  }, []);

  const isAuthorized = Boolean(result && accounts.some(account => account.id === result.id));
  const rows = accounts.filter(account => account.name.includes(query) || account.phone.includes(query));

  const updatePhone = (value: string) => {
    setPhone(value.replace(/\D/g, '').slice(0, 11));
    setResult(undefined);
    setError('');
  };

  const openAdd = () => {
    updatePhone('');
    setAdding(true);
  };

  const searchPhone = () => {
    if (!isDemoTeacherPhone(phone)) {
      setError('请输入有效的 11 位手机号');
      return;
    }
    const account = findDemoTeacherAccount(phone);
    setResult(account);
    setError(account ? '' : '未找到该手机号对应的教师账号');
  };

  const confirm = () => {
    if (!result || hasDemoTeacherSupportAccess(result.phone)) return;
    try {
      addDemoTeacherSupportAccount(result.phone);
    } catch {
      setError('保存失败，请检查浏览器存储后重试');
      return;
    }
    setKeyword('');
    setQuery('');
    setAdding(false);
    Message.success('已添加授权人员');
  };

  const requestRemoval = (account: DemoTeacherAccount) => {
    confirmRemoveTeacherSupportAccess(account.name, async () => {
      try {
        removeDemoTeacherSupportAccount(account.phone);
      } catch (error) {
        Message.error('移除失败，请重试');
        throw error;
      }
      Message.success('已移除排查授权');
    });
  };

  const columns: TableColumnProps<DemoTeacherAccount>[] = [
    { title: '教师姓名', dataIndex: 'name', width: 144 },
    { title: '手机号', dataIndex: 'phone', width: 168 },
    { title: '关联学校', render: (_, account) => showSchools(account) },
    {
      title: '操作', width: 96, fixed: 'right',
      render: (_, account) => (
        <Button type="text" size="small" status="danger" aria-label={`移除${account.name}的排查授权`} onClick={() => requestRemoval(account)}>
          移除
        </Button>
      ),
    },
  ];

  return (
    <div className="operations-pc-list-content">
      <Form className="pc-filter-bar operations-pc-filters" layout="inline" onSubmit={() => setQuery(keyword.trim())}>
        <Form.Item label="教师">
          <Input value={keyword} onChange={setKeyword} allowClear placeholder="姓名或手机号" aria-label="搜索教师姓名或手机号" />
        </Form.Item>
        <Form.Item>
          <div className="ops-actions">
            <Button type="primary" htmlType="submit" icon={<Search size={14} aria-hidden="true" />}>查询</Button>
            <Button onClick={() => { setKeyword(''); setQuery(''); }}>重置</Button>
          </div>
        </Form.Item>
      </Form>
      <div className="ops-list-toolbar">
        <h2>授权人员</h2>
        <Button type="primary" icon={<Plus size={16} aria-hidden="true" />} onClick={openAdd}>新增</Button>
      </div>
      <Table<DemoTeacherAccount>
        rowKey="id"
        columns={columns}
        data={rows}
        border={false}
        scroll={{ x: 600 }}
        pagination={false}
        noDataElement={<Empty description={query ? '未找到匹配的授权人员' : '暂无授权人员'} />}
      />
      <Modal
        wrapClassName="operations-pc-overlay"
        className="ops-support-add"
        title="新增授权人员"
        visible={adding}
        okText="确认"
        okButtonProps={{ disabled: !result || isAuthorized }}
        onOk={confirm}
        onCancel={() => setAdding(false)}
      >
        <Form layout="vertical">
          <Form.Item label="手机号" validateStatus={error ? 'error' : undefined} help={error && <span role="alert">{error}</span>}>
            <Input.Search
              value={phone}
              onChange={updatePhone}
              onSearch={searchPhone}
              searchButton="检索"
              inputMode="numeric"
              maxLength={11}
              placeholder="请输入教师手机号"
              aria-label="检索教师手机号"
            />
          </Form.Item>
        </Form>
        <div aria-live="polite">
          {result && (
            <Descriptions className="ops-support-result" column={1} colon="" data={[
              { label: '教师姓名', value: <strong>{result.name}</strong> },
              { label: '手机号', value: <span className="ops-support-phone">{result.phone}</span> },
              { label: '关联学校', value: showSchools(result) },
              ...(isAuthorized ? [{ label: '授权状态', value: '已授权' }] : []),
            ]} />
          )}
        </div>
        <aside className="ops-support-demo" aria-labelledby="ops-support-demo-title">
          <h2 id="ops-support-demo-title">演示账号</h2>
          <ol>
            <li>输入{demoOperator.name}的手机号 <span className="ops-support-phone">{demoOperator.phone}</span>，检索并确认授权。</li>
            <li>在同一浏览器打开「教师-手机端」，用最近账号一键登录。</li>
            <li>打开「我的 → 设置 → 账号安全」，按住「登录账号」1 秒，输入 <span className="ops-support-phone">{demoTarget.phone}</span>，切换到{demoTarget.name}。</li>
          </ol>
        </aside>
      </Modal>
    </div>
  );
}
