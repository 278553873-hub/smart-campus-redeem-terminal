import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Breadcrumb, Menu } from '@arco-design/web-react';
import PlatformBrandMark from '../PlatformBrandMark';
import OperationsCustomerList from './OperationsCustomerList';
import OperationsTeacherSupportAccess from './OperationsTeacherSupportAccess';
import { operationsNavigation, operationsPages } from './operationsNavigation';
import { confirmDiscardOperationsDraft } from './operationsDialogs';
import './operationsTokens.css';
import './operationsPc.css';

const pageComponents = {
  'school-list': OperationsCustomerList,
  'teacher-support-access': OperationsTeacherSupportAccess,
};

type PageKey = keyof typeof pageComponents;
const isAvailablePage = (key: string): key is PageKey => Object.hasOwn(pageComponents, key);

const renderMenuItem = (key: string, label: React.ReactNode) => {
  const disabled = !isAvailablePage(key);
  return <Menu.Item key={key} disabled={disabled} aria-disabled={disabled || undefined}>{label}</Menu.Item>;
};

const OperationsPcAdmin: React.FC = () => {
  const [activePage, setActivePage] = useState<PageKey>('school-list');
  const [navigationScrolling, setNavigationScrolling] = useState(false);
  const scrollbarTimer = useRef<number | undefined>(undefined);
  const [customerTitle, setCustomerTitle] = useState('学校列表');
  const [customerDirty, setCustomerDirty] = useState(false);
  const page = operationsPages.find(item => item.key === activePage)!;
  const CurrentPage = pageComponents[activePage];
  const title = page.key === 'school-list' ? customerTitle : page.title;

  useEffect(() => () => window.clearTimeout(scrollbarTimer.current), []);

  const handleNavigationScroll = () => {
    setNavigationScrolling(true);
    window.clearTimeout(scrollbarTimer.current);
    scrollbarTimer.current = window.setTimeout(() => setNavigationScrolling(false), 500);
  };

  const selectPage = (key: string) => {
    if (key === activePage || !isAvailablePage(key)) return;
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
        <aside className="operations-pc-sidebar">
          <nav className={`operations-pc-navigation${navigationScrolling ? ' is-scrolling' : ''}`} aria-label="运营管理导航" onScroll={handleNavigationScroll}>
            <Menu
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
                    {item.children.map(({ key, title: childTitle, icon: ChildIcon }) => renderMenuItem(key, (
                      <>
                        {ChildIcon && <ChildIcon className="arco-icon operations-pc-nav-icon" size={16} aria-hidden="true" />}
                        <span>{childTitle}</span>
                      </>
                    )))}
                  </Menu.SubMenu>
                ) : renderMenuItem(item.key, label);
              })}
            </Menu>
          </nav>
        </aside>

        <main className="operations-pc-main" aria-label="运营管理内容">
          <Breadcrumb className="operations-pc-breadcrumb">
            {page.parent && <Breadcrumb.Item key="parent">{page.parent}</Breadcrumb.Item>}
            <Breadcrumb.Item key="page">{page.title}</Breadcrumb.Item>
            {title !== page.title && <Breadcrumb.Item key="flow">{title}</Breadcrumb.Item>}
          </Breadcrumb>
          <section className="operations-pc-page" aria-labelledby="operations-pc-page-title" key={page.key}>
            <div className="operations-pc-page-heading">
              <h1 id="operations-pc-page-title">{title}</h1>
              {page.key === 'teacher-support-access' && (
                <p className="operations-pc-page-description">获授权人员登录教师小程序后，可在「我的 → 设置 → 账号安全」长按「登录账号」，输入目标手机号切换账号排查问题，无需输入密码或验证码。</p>
              )}
            </div>
            <CurrentPage onDirtyChange={setCustomerDirty} onTitleChange={setCustomerTitle} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default OperationsPcAdmin;
