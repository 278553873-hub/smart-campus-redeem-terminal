# 运营 PC 端

- 地址：`?app=operations-pc`。
- 入口：Demo 环境切换中的「运营-PC端」。
- 目标用户：SaaS 平台运营管理员。
- 平台名称：乐途AI智慧教育运营后台。
- 页面风格：沿用学校 PC 管理后台的品牌顶栏、白色侧栏、蓝色选中态、浅灰内容区与 Arco 基础组件。
- 默认进入「学校管理 / 学校列表」，不设置首页、工作台或应用门户。

## 当前范围

运营后台壳层保持独立，学校列表已按个人版、学校版、组织版重新设计。组织新增可交互的开通流程。系统管理新增可交互的[排查授权管理](./PRD-教师视角排查.md)。

导航保留基础信息配置、数据中心、系统管理、更新包管理、广告投放管理、学校管理、模板管理、建议反馈、Agent管理、提示词版本管理、大模型配置。学校管理包含学校列表和教师管理。系统管理按后台截图展开目录，「排查授权管理」位于「管理员管理」下方。

已实现的「学校列表」「排查授权管理」可进入。其余功能菜单保留为灰色禁用状态，后续注册对应页面即可启用。

个人版展示自行注册用户，学校版展示合作学校，组织版展示多学校组织。支持详情查看、筛选分页、新建组织、批量关联学校、统一指标预览、指标冲突范围核对、草稿及续办。同一学校可关联多个组织；本期指标完全统一，冲突经明确确认统一后再建立关联。

学校版展示学校基本信息、管理员、师生规模、授权状态与起止时间、组织关联。学校名称固定左侧、操作固定右侧，中间字段横向滚动。等级为1星至5星，授权状态为合作中、已到期、未开始。

组织版展示组织身份、关联学校数、统一指标、管理员、去重汇总的师生规模、独立授权期及创建日期。组织名称固定左侧、操作固定右侧，学校数与指标可直接进入对应详情页签。组织授权与各学校授权分别保留，草稿不作为已生效规模展示。

完整流程与后续规划见[学校列表与组织版方案](./学校列表与组织版方案.md)。视觉规范见 `design-system/operations-pc/MASTER.md`。

## 代码边界

- `components/operations-pc/OperationsPcAdmin.tsx`：后台框架和页面切换。
- `components/operations-pc/operationsNavigation.ts`：导航配置。
- `components/operations-pc/OperationsCustomerList.tsx`：三类组织列表。
- `components/operations-pc/OrganizationSetup.tsx`：组织四步配置。
- `components/operations-pc/OperationsCustomerDetails.tsx`：统一详情抽屉。
- `components/operations-pc/operationsCustomers.ts`：演示实体与指标一致性模型。
- `components/operations-pc/useOperationsCustomers.ts`：独立浏览器存储。
- `components/operations-pc/operationsTokens.css`：Arco 语义变量与布局令牌。
- `components/operations-pc/operationsPc.css`：仅作用于运营端的布局与菜单选中样式。

不引入学校后台业务组件，不共享演示状态，不修改学校端业务服务。通用筛选样式沿用 `styles/pc-admin.css`。本次开通和指标调整只影响运营 Demo 的浏览器数据，不表示真实账号、数据权限和指标服务已接入。
