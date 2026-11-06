# 学校 PC 顶部育人大屏

## 并行方案边界

用户于 2026-11-06 明确要求两套方案并行保留，最终确认后才决定取舍。

| 方案 | 入口 | 独立目录 |
| --- | --- | --- |
| 学校 PC 顶部「育人大屏」（本文） | `?app=school-pc-screen` | `components/data-screen/` |
| Demo 项目「数据大屏」 | `?app=data-screen` | `components/demo-data-screen/` |

Demo 方案见 [Demo独立方案.md](Demo独立方案.md)。两套方案的展示组件、样式与演示状态分别维护，不互相覆盖。

## 目标与视觉依据

- 场景：学校大厅与接待区，面向来访领导、家长及师生，主要尺寸 1920×1080，适配 1280×720、4K 和窄屏预览。
- 当前使用 `image-to-ui-skill`，以截图还原（recreate）模式、单代理实现。
- 主视觉依据：`output/imagegen/school-outcomes/school-outcomes-v7.png`。风格依据为用户认可的 `references/accepted-style-reference.png`。
- 保留深蓝底、蓝紫渐变、柔和圆角、中央五育主图与分组留白。去除校园照片、3D 校园模型、强发光切角框。
- 大屏使用局部展示样式；PC 顶部入口沿用 Arco。优先遵守用户确认的展示风格，不将 PC 后台字号和表单布局套用到公共屏幕。

## 入口与交互

- 学校 PC 登录后，顶部“育人大屏”位于登录信息及退出按钮左侧，新窗口打开 `?app=school-pc-screen`，保留原后台状态。
- 本方案可直接通过 `?app=school-pc-screen` 预览，不显示内部环境切换浮层。Demo 项目的独立方案使用另一个地址。
- 育人总览：四项核心指标；覆盖双环、年级覆盖；五育分布、教师活跃、行为指标；班级常规和五育积分；底部双动态。
- 学生成长：选择年级后展示该年级的班级覆盖人数、覆盖率、成长记录条数。
- 班级风貌：班评汇总、年级均分、按年级查看班级得分、扣分、问题记录及常规关注事项。
- 大屏设置使用 Arco Popover 与 Button，包含本周／本月／本学期、暂停／继续、全屏。默认本学期。
- 页签支持方向键、Home、End；控件有焦点反馈；图形提供可访问数值。减少动态效果时关闭过渡，后台页面隐藏时停止演示更新。
- 年级按实际配置渲染，最多每页十二个；更多年级才出现翻页入口。没有数据时显示空状态。
- 底部教师与学生动态各两行。学生姓名沿用既有脱敏示例。暂停同时停止模拟记录产生和年级轮播。

## 数据口径与接入边界

- 学评适配：`mobile-app/services/leaderReportService.ts`。不改动手机端报表。
- 班评适配：`mobile-app/services/moralEducationCockpitService.ts`，按选定周期加载，卡片单独标明小学部、班级数量和截至日期。
- `summary.totalRecords` 为评价次数；`summary.totalEvaluationCount` 为成长记录条数。评价 N 人，评价次数 +1，成长记录 +N。
- 五育事件和指标使用量来自各自的演示快照，不以五育事件总数作为全校成长记录总数，不将评价次数解释为学生能力。
- 加分、扣分、净分均保留符号与单位，图表按实际值计算。
- 年级结构、参评班数、指标使用数、教师榜单均从数据计算；不在页面硬编码效果图中的学校人数。
- 现有服务仍为演示数据。底部演示事件源每 5.2 秒生成一次示例，评价次数、成长记录和分值由同一事件联动，页面明确显示“演示数据”和“动态示例”。
- 真实学校接入时，应替换适配层与演示事件源，使用同一学校范围、有效时间、评价行为 ID、学生记录 ID 及更新游标；撤回与更正需由真实记录源重算。
- 当前图中的“高频行为指标”“指标使用覆盖”“年级覆盖”“教师参与”均有现有字段支持。每日真实趋势、首次覆盖、新增学生等在没有可靠历史记录前不虚构。

## 分层与组件

- `studentEvaluationScreenModel.ts`：数据结构、演示事件与增量口径。
- `studentEvaluationScreenService.ts`：学评和班评适配。
- `useStudentEvaluationScreen.ts`：加载、可见性和播放生命周期。
- `StudentEvaluationDataScreen.tsx`：页面、页签和操作状态。
- `StudentEvaluationCharts.tsx`：图表、数据面板、班级明细、双动态。
- `ScreenIcon.tsx`：统一 Lucide 图标入口。
- `studentEvaluationDataScreen.css`：仅本模块生效的字号、色彩、间距和响应式样式。
- 所有文字、指标、图形和控件均为代码渲染，没有将效果图铺为页面背景。
- 组件依赖与图标覆盖见 `artifacts/component-sources.json`、`artifacts/icon-coverage.md`。

## 验证

- `node components/data-screen/studentEvaluationScreen.test.mjs`：验证多人评价、扣分、去重、覆盖人数、跨周期联动、缓存边界、班评适配，以及三个页签在正常／空数据下的真实组件渲染。
- `npm run build`：生产构建。
- 浏览器检查需按 AGENTS.md 先获授权。结果记录于 `artifacts/verification.json`，未验证的项目不得报告通过。
