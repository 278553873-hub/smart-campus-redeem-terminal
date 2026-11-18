import React, { useState } from 'react';
import { Avatar, Breadcrumb, Button, Empty, Menu } from '@arco-design/web-react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import PlatformBrandMark from '../PlatformBrandMark';
import OperationsCustomerList from './OperationsCustomerList';
import { operationsNavigation, operationsPages } from './operationsNavigation';
import { confirmDiscardOperationsDraft } from './operationsDialogs';
import './operationsTokens.css';
import './operationsPc.css';

const OperationsPcAdmin: React.FC = () => {
  const [activePage, setActivePage] = useState('school-list');
  const [collapsed, setCollapsed] = useState(false);
  const [customerTitle, setCustomerTitle] = useState('学校列表');
  const [customerDirty, setCustomerDirty] = useState(false);
  const page = operationsPages.find(item => item.key === activePage) ?? operationsPages[0];
  const title = page.key === 'school-list' ? customerTitle : page.title;
  const selectPage = (key: string) => {
    if (key === activePage) return;
    const navigate = () => { setActivePage(key); setCustomerTitle('学校列表'); setCustomerDirty(false); };
    if (customerDirty) confirmDiscardOperationsDraft(navigate);
    else navigate();
  };

  return (
    <div className="operations-pc">
      <header className="operations-pc-header">
        <div className="operations-pc-brand">
          <div className="operations-pc-brand-mark"><PlatformBrandMark size={20} /></div>
          <span className="operations-pc-brand-name">乐途AI智慧教育运营后台</span>
        </div>
        <div className="operations-pc-account">
          <Avatar size={32} style={{ backgroundColor: 'var(--ops-color-primary-soft)', color: 'var(--ops-color-primary)' }}>运</Avatar>
          <span>运营管理员</span>
        </div>
      </header>

      <div className="operations-pc-body">
        <aside className={`operations-pc-sidebar${collapsed ? ' is-collapsed' : ''}`}>
          <nav id="operations-pc-navigation" className="operations-pc-navigation" aria-label="运营管理导航">
            <Menu
              collapse={collapsed}
              selectedKeys={[activePage]}
              defaultOpenKeys={['schools']}
              onClickMenuItem={selectPage}
              levelIndent={24}
            >
              {operationsNavigation.map(item => {
                const Icon = item.icon;
                const label = <><Icon className="arco-icon operations-pc-nav-icon" size={18} aria-hidden="true" /><span>{item.title}</span></>;
                return item.children ? (
                  <Menu.SubMenu key={item.key} title={label}>
                    {item.children.map(child => <Menu.Item key={child.key}>{child.title}</Menu.Item>)}
                  </Menu.SubMenu>
                ) : <Menu.Item key={item.key}>{label}</Menu.Item>;
              })}
            </Menu>
          </nav>
          <div className="operations-pc-sidebar-footer">
            <Button
              type="text"
              long
              onClick={() => setCollapsed(value => !value)}
              aria-label={collapsed ? '展开菜单' : '收起菜单'}
              aria-expanded={!collapsed}
              aria-controls="operations-pc-navigation"
              icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            >
              {collapsed ? null : '收起菜单'}
            </Button>
          </div>
        </aside>

        <main className="operations-pc-main" aria-label="运营管理内容">
          <Breadcrumb className="operations-pc-breadcrumb">
            {page.parent && <Breadcrumb.Item key="parent">{page.parent}</Breadcrumb.Item>}
            <Breadcrumb.Item key="page">{page.title}</Breadcrumb.Item>
            {title !== page.title && <Breadcrumb.Item key="flow">{title}</Breadcrumb.Item>}
          </Breadcrumb>
          <section className="operations-pc-page" aria-labelledby="operations-pc-page-title" key={page.key}>
            <div className="operations-pc-page-heading"><h1 id="operations-pc-page-title">{title}</h1></div>
            {page.key === 'school-list' ? <OperationsCustomerList onDirtyChange={setCustomerDirty} onTitleChange={setCustomerTitle} /> : (
              <div className="operations-pc-page-empty" role="status"><Empty description="暂无数据" /></div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default OperationsPcAdmin;
