import React from 'react';
import { ParentCard } from './ParentUI';

/** 成长记录共用卡片：业务方提供图片和底部信息，不在基础层处理来源及权限。 */
export default function ParentRecordCard({ content, children, footer, action, topAction }: {
  content: string; children?: React.ReactNode; footer: React.ReactNode; action?: React.ReactNode; topAction?: React.ReactNode;
}) {
  return <ParentCard shape="subtle" as="article" className="relative p-4">
    {topAction && <div className="absolute right-1 top-1">{topAction}</div>}
    {content && <p className={`${topAction ? 'pr-8 ' : ''}whitespace-pre-wrap break-words text-[length:var(--pm-font-size-card-title)] font-medium leading-relaxed text-[var(--pm-text-primary)]`}>{content}</p>}
    {children}
    <div className="mt-3 flex items-baseline justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-[length:var(--pm-font-size-meta)] font-medium text-[var(--pm-text-tertiary)]">{footer}</div>
      {action}
    </div>
  </ParentCard>;
}
