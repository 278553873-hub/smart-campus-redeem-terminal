import {
  Archive, BarChart3, Bot, Building2, Cpu, Database,
  FileText, Layers, Megaphone, MessageSquare, Settings,
  type LucideIcon,
} from 'lucide-react';

export interface OperationsNavItem {
  key: string;
  title: string;
  icon: LucideIcon;
  children?: { key: string; title: string }[];
}

// 仅收录现有后台截图中已确认的入口，未展开的子菜单后续按业务补充。
export const operationsNavigation: OperationsNavItem[] = [
  { key: 'basic-info', title: '基础信息配置', icon: Database },
  { key: 'data-center', title: '数据中心', icon: BarChart3 },
  { key: 'system', title: '系统管理', icon: Settings },
  { key: 'updates', title: '更新包管理', icon: Archive },
  { key: 'advertising', title: '广告投放管理', icon: Megaphone },
  {
    key: 'schools', title: '学校管理', icon: Building2,
    children: [
      { key: 'school-list', title: '学校列表' },
      { key: 'teachers', title: '教师管理' },
    ],
  },
  { key: 'templates', title: '模板管理', icon: Layers },
  { key: 'feedback', title: '建议反馈', icon: MessageSquare },
  { key: 'agents', title: 'Agent管理', icon: Bot },
  { key: 'prompts', title: '提示词版本管理', icon: FileText },
  { key: 'models', title: '大模型配置', icon: Cpu },
];

export const operationsPages = operationsNavigation.flatMap(item => (
  item.children
    ? item.children.map(child => ({ ...child, parent: item.title }))
    : [{ key: item.key, title: item.title, parent: '' }]
));
