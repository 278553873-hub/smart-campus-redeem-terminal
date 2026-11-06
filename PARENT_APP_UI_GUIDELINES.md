# 家长手机端设计规范入口

家长端现行规范统一维护在 [家长手机端设计规范](design-system/parent-mobile/PARENT_MOBILE_UI_GUIDELINES.md)。本文件仅作导航，避免同时维护两份相互冲突的规范。

- [设计令牌源码](components/parent-app/parentMobileTokens.ts)：完整继承教师端基线，仅覆盖家长方案二颜色。
- [方案二颜色源](components/parent-app/parentMobileColors.ts)：颜色、透明度及渐变配方，不包含首页布局或尺寸。
- [令牌交付清单](design-system/parent-mobile/parent-mobile.tokens.json)：从代码生成，供设计和开发交付使用。
- [家长业务需求](docs/演示项目/家长手机端/PRD-家长手机端.md)：角色、权限、操作流程与数据边界。
- [历史规范归档](design-system/parent-mobile/archive/PARENT_APP_UI_GUIDELINES.before-unification-2026-11-03.md)：仅供追溯，旧颜色、字号和组件结论不再作为通用基线。

教师端的字号、字重、间距、圆角、触控、组件状态和动效为非颜色基线。家长成长页方案二仅贡献配色，不把当前首页大数字、插画尺寸、固定高度、卡片布局或阴影几何推广到全端。

本次完成规范与令牌收敛；存量页面的局部硬编码样式仍需逐页迁移，不代表已完成所有页面的设计一致性验收。
