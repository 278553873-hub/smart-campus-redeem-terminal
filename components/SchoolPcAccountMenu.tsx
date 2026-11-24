import React, { useCallback, useRef, useState } from 'react';
import { Avatar, Button, Dropdown, Menu, Tag } from '@arco-design/web-react';
import { Check, ChevronDown } from 'lucide-react';
import { ClassSourceIcon } from '../mobile-app/components/ClassSourceTrigger';
import type { SchoolPcMembership } from './schoolPcMemberships';

const SCHOOL_MENU_ITEM_SELECTOR = '[role="menuitemradio"]';
const SCHOOL_MENU_ROW_HEIGHT = 64;
const SCHOOL_MENU_VISIBLE_ROWS = 5;

function WorkspaceMenuLabel({ workspace, selected }: { workspace: SchoolPcMembership; selected?: boolean }) {
  return (
    <span className="flex w-full items-center gap-3">
      <ClassSourceIcon type={workspace.type} className="h-5 w-5 shrink-0 text-blue-600" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium leading-5 group-hover:text-blue-600" title={workspace.name}>{workspace.name}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1">
          <Tag color="arcoblue" size="small">{workspace.type === 'school' ? '学校版' : '个人版'}</Tag>
          {workspace.schoolTypeLabel && <Tag size="small">{workspace.schoolTypeLabel}</Tag>}
        </span>
      </span>
      {selected && <Check className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />}
    </span>
  );
}

export default function SchoolPcAccountMenu({ teacherName, avatar, current, workspaces, onWorkspaceChange }: {
  teacherName: string;
  avatar?: string;
  current: SchoolPcMembership;
  workspaces: readonly SchoolPcMembership[];
  onWorkspaceChange: (workspaceId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusMenu = useCallback((node: unknown) => {
    const menu = node as HTMLDivElement | null;
    (menu?.querySelector<HTMLElement>(SCHOOL_MENU_ITEM_SELECTOR) ?? menu)?.focus({ preventScroll: true });
  }, []);
  const canSwitchWorkspace = workspaces.length > 1;
  const scopeLabel = workspaces.some(workspace => workspace.type === 'personal') ? '空间' : '学校';

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === ' ' && event.target instanceof HTMLElement && event.target.matches(SCHOOL_MENU_ITEM_SELECTOR)) {
      event.preventDefault();
      event.target.click();
      return;
    }

    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(SCHOOL_MENU_ITEM_SELECTOR));
    if (!items.length) return;
    const index = items.findIndex(item => item === event.target);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(index + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        items.at(-1)?.focus();
        break;
    }
  };

  const accountMenu = (
    <Menu
      aria-label="账号菜单"
      className="w-72 !max-h-none"
      ref={focusMenu}
      tabIndex={-1}
      selectedKeys={[current.id]}
      onKeyDown={handleMenuKeyDown}
      onClickMenuItem={key => {
        if (key !== current.id) onWorkspaceChange(key);
      }}
    >
      <Menu.ItemGroup title={`${canSwitchWorkspace ? '切换' : '当前'}${scopeLabel}`}>
        {canSwitchWorkspace ? (
          <div className="overflow-y-auto" style={{ maxHeight: SCHOOL_MENU_ROW_HEIGHT * SCHOOL_MENU_VISIBLE_ROWS }}>
            {workspaces.map(workspace => (
              <Menu.Item
                key={workspace.id}
                role="menuitemradio"
                aria-checked={workspace.id === current.id}
                tabIndex={-1}
                className="group flex items-center !py-2 !leading-normal hover:!bg-transparent"
                style={{ height: SCHOOL_MENU_ROW_HEIGHT }}
              >
                <WorkspaceMenuLabel workspace={workspace} selected={workspace.id === current.id} />
              </Menu.Item>
            ))}
          </div>
        ) : <div className="px-3 py-2 text-slate-700"><WorkspaceMenuLabel workspace={current} /></div>}
      </Menu.ItemGroup>
    </Menu>
  );

  return (
    <Dropdown position="br" trigger="click" droplist={accountMenu} popupVisible={open} onVisibleChange={setOpen}>
      <Button
        ref={triggerRef}
        type="text"
        size="large"
        className="group !h-11 !px-2 hover:!bg-transparent active:!bg-transparent"
        aria-label={`${teacherName}的账号菜单，当前${current.type === 'school' ? '学校' : '为'}${current.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onKeyDown={event => {
          if (event.key !== 'ArrowDown') return;
          event.preventDefault();
          setOpen(true);
        }}
      >
        <span className="flex items-center gap-2 text-slate-700 group-hover:text-blue-600">
          <Avatar size={32} className="shrink-0 !bg-blue-100 !text-blue-700">
            {avatar ? <img src={avatar} alt="" /> : teacherName.slice(0, 1)}
          </Avatar>
          <span className="flex min-w-0 flex-col items-start text-left">
            <span className="max-w-36 truncate text-[13px] font-bold leading-4">{teacherName}</span>
            <span className="max-w-36 truncate text-xs font-medium leading-4 text-slate-500 lg:max-w-44" title={current.name}>{current.name}</span>
          </span>
          <ChevronDown className="shrink-0" size={14} aria-hidden="true" />
        </span>
      </Button>
    </Dropdown>
  );
}
