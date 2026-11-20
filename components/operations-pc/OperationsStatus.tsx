import React from 'react';
import { Badge } from '@arco-design/web-react';

/** 标准文字加状态点：状态可读，不依赖浅色标签上的低对比彩色小字。 */
export default function OperationsStatus({ value }: { value: string }) {
  return <Badge status={value === '待开通' || value === '未开始' || value === '未配置' ? 'warning' : value === '已到期' || value === '已停用' ? 'default' : 'success'} text={value} />;
}
