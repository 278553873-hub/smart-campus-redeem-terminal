# 家长手机端设计系统入口

> 本文件是家长手机端设计系统的入口，不再维护独立于教师手机端的第二套视觉数值。

## 唯一来源

家长手机端直接复用教师手机端的设计令牌（Token）和视觉规则：

- Token（设计令牌）源文件：[`mobile-app/styles/teacherMobileTokens.ts`](../../mobile-app/styles/teacherMobileTokens.ts)
- 教师手机端 UI（用户界面）规范：[`design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md`](../teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md)
- 家长端用户任务、权限和入口补充：[`PARENT_APP_UI_GUIDELINES.md`](../../PARENT_APP_UI_GUIDELINES.md)
- 家长端业务别名映射：[`components/parent-app/ParentStyleTokens.tsx`](../../components/parent-app/ParentStyleTokens.tsx)

## 复用规则

1. 家长端页面消费 `--pm-*` 语义别名；别名必须指向教师端 `--tm-*` Token。
2. 不在家长端新增独立颜色、字号、字重、圆角、阴影或间距数值。
3. 家长端品牌主色与教师端一致，使用品牌红；正向状态、提醒和成长币继续使用教师端对应语义色。
4. 家长端底部一级导航固定为“成长 / 报告 / 我的”，积分银行保留为成长页内入口。
5. 主卡片、控件、内层分组、底部抽屉和固定导航分别使用教师端对应的圆角与阴影 Token。
6. 家长端只在用户任务、权限边界和文案上做角色差异，不通过另一套视觉风格制造角色割裂。

## 当前关键映射

| 家长端语义 | 教师端来源 |
| --- | --- |
| `--pm-brand-*` | `--tm-brand-*` |
| `--pm-status-*` | `--tm-status-*` |
| `--pm-bg-*` / `--pm-text-*` | `--tm-bg-*` / `--tm-text-*` |
| `--pm-radius-*` | `--tm-radius-*` |
| `--pm-shadow-*` | `--tm-shadow-*` |
| `--pm-font-*` | `--tm-font-*` |
| `--pm-space-*` / `--pm-size-touch` | `--tm-space-*` / `--tm-size-touch` |

历史草案中的深蓝、金色、卡通字体和独立圆角规则均已废弃，不得作为实现依据。
