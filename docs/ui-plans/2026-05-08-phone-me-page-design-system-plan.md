# 手机端“我的页面”视觉系统落地方案

## 目标

以“我的页面”为第一批样板页面，将 `PHONE_UI_GUIDELINES.md` 中的手机端视觉系统落到可复用组件结构中，验证字体、圆角、阴影、图标、间距、触控反馈是否能在真实业务页面中稳定复用。

本阶段只建议改手机端“我的页面”及其必要的通用组件，不扩散到记录流、报表页、文件页等复杂页面。

## 当前问题

### 1. 页面直接承载太多视觉规则

当前 `mobile-app/views/MeView.tsx` 同时负责：

- 页面布局。
- 个人信息卡视觉。
- 菜单分组结构。
- 菜单项结构。
- 图标容器尺寸。
- 图标颜色。
- 字号、字重、圆角、阴影。

这导致页面文件承担了通用组件职责，后续其他页面很容易复制这些 class，造成视觉系统继续扩散。

### 2. 字体层级过重

当前菜单分组和菜单项大量使用 `text-[18px]`、`font-black`，例如：

- 分组标题：`text-[18px] font-black`。
- 菜单主标题：`text-[18px] font-black`。
- 手机号：`text-[16px] font-black`。

这与 `PHONE_UI_GUIDELINES.md` 中的角色不一致。菜单项应使用 `text.itemTitle`，辅助说明应使用 `text.helper`，强字重只保留给页面主标题和核心数字。

### 3. 圆角和阴影未语义化

当前页面直接使用：

- 个人信息卡：`rounded-[32px]`。
- 菜单分组：`rounded-[28px]`。
- 菜单图标：`rounded-2xl`。
- 自定义阴影：`shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)]`。

这些值本身可以成立，但不应该散落在业务页面里。应归入 `MobileCard`、`MenuSection`、`IconBadge` 等组件语义。

### 4. 图标体系局部封装不足

当前 `MeView.tsx` 内部已经有 `MenuIconBadge` 雏形，但：

- 没有成为通用组件。
- `ICON_TONE_CLASS` 未被当前页面实际复用完整。
- 图标容器、图标尺寸、颜色仍大量在 JSX 中手写。
- 分组图标和菜单图标没有共享统一接口。

## 第一批改造边界

### 包含

- `mobile-app/styles/phoneTokens.ts`：新增手机端视觉 token 映射。
- `mobile-app/components/ui/IconBadge.tsx`：新增图标徽章组件。
- `mobile-app/components/ui/MobileCard.tsx`：新增通用卡片组件。
- `mobile-app/components/ui/MenuSection.tsx`：新增菜单分组组件。
- `mobile-app/components/ui/MenuItem.tsx`：新增菜单项组件。
- `mobile-app/views/MeView.tsx`：只做组件组合与数据配置，不再承载通用视觉规则。

### 不包含

- 不改记录流页面。
- 不改报表页。
- 不改文件页。
- 不改底部 Tab。
- 不改全局 Header。
- 不处理智能终端、PC 后台、大屏。

## 组件职责设计

### 1. phoneTokens

职责：把 `PHONE_UI_GUIDELINES.md` 的核心 token 转成可复用 class 字符串。

要求：

- 只包含基础视觉值。
- 不出现业务命名。
- 不依赖 React。
- 不包含页面逻辑。

建议结构：

```ts
export const phoneText = {
  pageTitle: 'text-2xl font-extrabold leading-tight tracking-tight',
  sectionTitle: 'text-[17px] font-bold leading-snug',
  itemTitle: 'text-[15px] font-semibold leading-snug',
  body: 'text-sm font-normal leading-relaxed',
  helper: 'text-xs font-medium leading-snug',
  label: 'text-[11px] font-bold leading-none',
};

export const phoneRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  sheet: 'rounded-[32px]',
  full: 'rounded-full',
};
```

说明：Tailwind（样式工具）中 `rounded-3xl` 对应 24px，符合 `radius.xl`；`radius.sheet` 暂时保留任意值 32px，但只能通过 token 使用。

### 2. IconBadge

职责：统一图标容器。

接口建议：

```ts
type IconBadgeSize = 'sm' | 'md' | 'lg' | 'xl';
type IconBadgeTone = 'brand' | 'success' | 'warning' | 'danger' | 'ai' | 'neutral' | 'violet' | 'blue' | 'teal';
type IconBadgeShape = 'rounded' | 'circle';
```

使用规则：

- 分组标题图标使用 `size="sm"` 或 `size="md"`。
- 菜单项图标使用 `size="lg"`。
- 个人头像编辑按钮可使用 `shape="circle"`。
- 业务页面不得自己写图标容器尺寸。

### 3. MobileCard

职责：统一卡片圆角、阴影、边框、内边距。

接口建议：

```ts
type MobileCardVariant = 'flat' | 'card' | 'raised' | 'hero';
type MobileCardPadding = 'none' | 'sm' | 'md' | 'lg';
```

我的页面映射：

- 个人资料卡：`variant="hero" padding="lg"`。
- 菜单分组卡：`variant="card" padding="none"`。

### 4. MenuSection

职责：统一分组标题、分隔线、子项容器。

接口建议：

```ts
interface MenuSectionProps {
  title: string;
  icon: LucideIcon;
  tone?: IconBadgeTone;
  children: React.ReactNode;
}
```

使用规则：

- 分组标题使用 `phoneText.sectionTitle`。
- 分组卡片使用 `MobileCard variant="card"`。
- 分隔线由组件内部统一处理。

### 5. MenuItem

职责：统一菜单入口。

接口建议：

```ts
interface MenuItemProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: IconBadgeTone;
  value?: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}
```

使用规则：

- 主标题使用 `phoneText.itemTitle`。
- 描述使用 `phoneText.helper`。
- 右侧可以是箭头、状态值或空。
- 无 `onClick` 的信息项不显示按压态。
- 有 `onClick` 的项必须有 `active:bg-slate-50`。

## 我的页面结构调整

### 数据配置

`MeView.tsx` 应从 JSX 堆叠改为数据驱动：

```ts
const menuSections = [
  {
    title: '管理工具',
    icon: BriefcaseBusiness,
    tone: 'brand',
    items: [
      {
        title: '使用督导报表',
        description: '查看教师使用率、待督促名单与覆盖情况',
        icon: BarChart3,
        tone: 'violet',
        onClick: onViewLeaderReport,
      },
    ],
  },
];
```

这样业务页面只表达“有哪些入口”，不再表达“这些入口怎么长”。

### 保留的业务定制

`MeView.tsx` 可以保留：

- 教师头像。
- 教师姓名。
- 学校名称。
- 教师身份标签数据。
- 菜单分组和菜单项数据。
- 回调函数绑定。

`MeView.tsx` 不应继续保留：

- 通用图标容器 class。
- 菜单分组卡片 class。
- 菜单项字体 class。
- 通用圆角和阴影 class。

## 验收标准

### 视觉验收

- “我的页面”分组卡片圆角、阴影、边框一致。
- 菜单项主标题不再过重，层级低于页面主标题。
- 图标容器尺寸统一，分组图标和菜单图标有明确层级差异。
- 辅助说明不抢主标题权重。
- 页面仍保持手机端触控友好，不牺牲点击热区。

### 架构验收

- `MeView.tsx` 主要变成业务组合，不再承担通用组件职责。
- token 文件不包含业务命名。
- 通用组件不写死“我的文件”“登录账号”等业务文案。
- 菜单分组、菜单项、图标徽章可以被文件页、设置页继续复用。

### 技术验收

- 执行 `npm run build` 通过。
- 不引入新的 TypeScript 类型错误。
- 不影响当前页面导航：我的文件、使用督导报表入口仍可点击。
- 不改动与本阶段无关页面。

## 推荐执行顺序

1. 新增 `mobile-app/styles/phoneTokens.ts`。
2. 新增 `mobile-app/components/ui/IconBadge.tsx`。
3. 新增 `mobile-app/components/ui/MobileCard.tsx`。
4. 新增 `mobile-app/components/ui/MenuItem.tsx`。
5. 新增 `mobile-app/components/ui/MenuSection.tsx`。
6. 重构 `mobile-app/views/MeView.tsx` 为数据驱动组合。
7. 执行 `npm run build`。
8. 用浏览器检查手机端“我的页面”。
9. 记录验收结果到 `logs/agent_detail`。
10. 询问是否继续推广到文件页、记录页、报表页。

## 风险控制

- 第一批只改“我的页面”，避免影响记录流和报表页。
- 不改底部 Tab，避免引入导航回归。
- 不改全局 Header，避免影响多个页面顶部栏。
- 保留现有业务入口和文案，不做产品功能删减。
- 对视觉值做收敛，但不追求一次性全局替换。
