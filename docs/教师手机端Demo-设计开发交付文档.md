# 教师手机端 Demo 设计开发交付文档

> 版本：1.0
> 更新日期：2026-08-21
> 状态：设计 Token 已批准，可进入重构开发
> 适用对象：前端开发、产品经理、测试
> 目标设备：教师微信小程序手机端；桌面 Demo 使用 393 × 852 像素手机壳预演，真实设备使用完整视口并适配安全区

## 1. 交付目的

本文件用于支持开发重构现有教师手机端产品，统一提供：

- 已批准的设计 Token（设计令牌）及接入方式；
- 页面范围、信息结构和必须展示的内容；
- 公共组件、交互状态、渐进披露规则；
- 图片、图标等视觉资源的位置与使用约束；
- 响应式、微信小程序安全区、无障碍和验收标准。

本次重构不改变业务规则、权限模型、接口字段和数据计算口径。业务定义以对应 PRD（产品需求文档）为准；本文件只说明如何组织和呈现这些业务内容。

## 2. 开发必须先确认的结论

1. 教师手机端唯一可执行 Token 源是 `mobile-app/styles/teacherMobileTokens.ts`。开发必须直接导入，不得从本文复制数值形成第二套主题文件。
2. 教师手机端唯一人类可读视觉规范是 `design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md`。
3. 班级报告图表解析规则只认 `design-system/teacher-mobile/TEACHER_MOBILE_CHART_RULES.md`。
4. 本文件是开发交付总索引和已批准值的快照。发生冲突时，优先级为：已确认的新设计稿或评审结论 > 可执行 Token 源 > 教师端 UI 规范 > 本文快照 > 现有局部页面实现。
5. 业务页面只能消费 Component（组件）或 Semantic（语义）Token，不得直接引用 Primitive（原始）色板，不得新增一次性十六进制颜色、阴影、圆角或字号。
6. 页面显隐由当前空间、角色和权限决定。无权限能力不展示，禁止先展示禁用项再在点击后拦截。
7. 高频流程只保留 1 至 2 个主要操作。低频设置、筛选、删除、批量能力通过底部抽屉或更多菜单渐进披露。

## 3. 产品与视觉目标

### 3.1 核心用户任务

教师在移动场景中需要快速完成三类任务：

- 记录：用语音、拍照或文字记录学生与班级表现，并检查 AI（人工智能）解读结果；
- 查看：查看班级、学生成长数据、评价记录、报告与校园币流水；
- 管理：完成班级、学生、采集、档案、报告等低频管理工作。

### 3.2 视觉方向

- 清爽可信、温暖激励、专业克制；
- 核心氛围页使用浅暖灰背景、低透明品牌红与辅助橙弥散光；
- 查看和配置页使用纯白标题区、浅灰内容区和白色卡面；
- 使用线性图标、轻阴影和克制的玻璃材质；
- 不使用蓝紫或靛青作为品牌色、主操作色、选中态或角色色；
- 不使用重玻璃、厚阴影、重边框、大量 emoji（表情符号）或 3D 图标；
- 不用备注、逻辑说明或重复帮助文案占用真实页面空间。

## 4. 信息架构与页面范围

### 4.1 一级导航

底部固定三入口，选中色始终为品牌红，不随记录模式变化。

| 入口 | 页面 | 首要任务 | 页面常驻内容 |
| --- | --- | --- | --- |
| 记录 | 老师记录 | 快速记录、查看和追溯评价事件 | 班级来源、记录对象、指标入口、记录流、悬浮录入条 |
| 班级 | 我的班级 | 找到班级并进入学生或班级数据 | 班级来源、筛选、班级卡片、排行榜轻入口 |
| 我的 | 我的 | 查看个人信息并进入管理能力 | 教师资料、班级来源、待填写采集、管理工具、更多工具 |

### 4.2 页面地图

| 模块 | 一级或入口页 | 二级及深层页面 |
| --- | --- | --- |
| 记录 | 老师记录 | 录入中、AI 识别中、AI 解读编辑、完整记录对象、日期选择、指标选择 |
| 班级 | 我的班级 | 班级学生列表、班级信息、班级报告、排行榜、学校数据报表 |
| 班级操作 | 班级卡片更多 | 作业录入、兑换奖励、批量修改学生、更新人脸数据、设置兑换密码、批量留档、离校学生管理、邀请老师、邀请家长 |
| 学生 | 学生详情 | 基础信息编辑、成长档案、学籍管理、评价记录、采集详情、身体测量、健康记录、校园币详情、成长报告 |
| 我的 | 我的 | 编辑教师信息、设置、作业批量录入、科目管理、部门管理、货币发放、建议反馈 |
| 作业批量录入 | 我的更多工具 | 作业表识别、下载导入模版、异常核对、逐图提交 |
| 采集与档案 | 采集管理、档案设计 | 新建或编辑表单、预览、发布、填写、答卷或采集详情、批量留档 |
| 班主任助理 | 班主任助理 | 本周行动建议、往期建议、我的评价复盘、往期复盘 |
| 校长助理 | 校长助理 | 本周管理建议、上月学校复盘、学期学校报告及对应历史记录 |

## 5. 页面设计内容

### 5.1 老师记录

页面从上到下固定为：

1. 微信状态栏与胶囊安全区；
2. 班级来源触发器；
3. “记录学生 / 记录班级”分段控件，仅在当前来源同时支持两种记录对象时展示；
4. 与当前对象对应的“学生指标”或“班级指标”弱入口；
5. 全量记录事件流；
6. 悬浮录入条；
7. 固定底部导航。

控制关系必须保持 `班级来源 → 记录对象 → 指标体系`。个人空间、协作空间和未开通班级记录的学校空间默认记录学生，不展示只有一个选项的分段控件。切换到不支持班级记录的来源时，自动回到记录学生，并用短暂状态反馈说明结果。

记录卡必须包含：

- 记录时间与更多操作；
- 原始输入：语音播放与转译、原始文本或图片证明；
- AI 智能解读：时间、对象、三级指标、各指标分值、AI 评语、总分；
- AI 处理中、识别成功、识别失败三类状态；
- 更多菜单内的重新识别与删除，删除必须二次确认。

记录对象展示规则：单个学生显示“姓名(班级)”；多人默认显示前 2 人与“+N人”；点击后在底部抽屉展示完整名单。班级对象直接显示班级名称。三级指标格式为“一级-二级-三级”，一个事件可显示多行指标及各自分值。

悬浮录入条固定为三段：拍照、按住说话、文字输入。面板使用白色、中性图标和悬浮阴影，记录学生或班级的模式色不得进入录入面板。

### 5.2 我的班级

页面必须包含：

- 多来源账号的班级来源触发器；
- 学校空间的年级筛选与“只看任教”筛选；
- 与筛选控件等高的排行榜轻入口，是否展示由版本与权限决定；
- 班级卡片：班级名称、班级号、年级、人数、班主任或副班主任身份、任教学科；
- 主要操作“学生列表”和次要操作“班级报告”；
- 更多操作入口；
- 无结果与无班级两类空状态。

班级号、年级、人数放在同一条紧凑元信息行，不拆成信息卡。班主任和副班主任使用浅橙标签，普通任教学科使用中性标签。个人空间已有班级时，在来源下方用紧凑工具行展示班级数量和“班级管理”，管理抽屉保留创建班级、加入班级和显示设置；无班级时在缺省态直接展示创建与加入入口。

班级更多操作按权限分组：

| 分组 | 操作 |
| --- | --- |
| 日常操作 | 作业录入、兑换奖励 |
| 学生管理 | 批量修改学生、更新人脸数据、设置兑换密码、批量留档、离校学生管理 |
| 协同管理 | 邀请老师加入、邀请家长加入 |

### 5.3 班级学生列表

页面必须包含返回、班级名称、学生或分组切换、学生花名册、选择模式与悬浮录入条。点击学生进入学生详情；进入多选后可批量记录。

头像浅底按 `--tm-tag-*` 循环使用，不承担业务含义；性别只通过头像右下角角标表达。学生、分组选中态统一为品牌红。AI 识别对象应优先限制在当前班级。

### 5.4 班级报告

页面结构固定为“标题 → 日期 → 数据来源 → 报告内容”。默认条件为“本周、全班汇总”。

日期选项：本周、上周、本月、上月、自定义。自定义日期使用公共底部抽屉，开始和结束日期都有效后才应用；取消保持原数据。数据来源按“全班汇总、我的记录、其他有记录的老师”排序，无记录老师不展示。

报告内容顺序：

1. 概况；
2. 评价记录分布；
3. 五育得分分布；
4. 五育事件分布；
5. 积分排行；
6. 需要关注；
7. 学生覆盖情况。

所有板块通过统一 `ReportSection` 实现，使用 `--tm-report-*` 控制页面左右留白、板块间距、卡片内边距与标题到内容的间距。

关键内容规则：

- “评价记录分布”默认只显示正向与负向占比；精确条数通过“对比详情”底部抽屉披露；
- 图表解析固定输出“总结”和“补充”，不推断数据原因；
- 积分排行使用“总分 / 进步幅度”，默认前 10 名，可展开全部；
- “需要关注”并列展示“加分TOP10 / 扣分TOP10”，不使用“重点关注对象”；
- 学生覆盖情况支持按“评价次数 / 评价老师数”点击表头排序；
- 日期或来源变化后，所有板块必须使用同一数据口径。

### 5.5 学生详情

学生详情使用“沉浸顶部背景 + 浅灰内容区”的混合背景。页面内容固定为：

- 独立返回入口；
- 学生身份卡：头像、姓名、班级、学号、档案入口、学籍入口；
- 身份卡底部资产行：钱包、存款、明细；
- 一级页签：成长概览、成长报告、采集记录。

成长概览固定展示本学期实时五育积分、五育雷达图、评价记录数量入口与成长数据入口。成长数据仅展示身高、体重和自动计算的 BMI（身体质量指数），不展示健康检查相关卡片与入口。新增成长记录直接打开底部弹窗，默认使用手机本地当天作为记录日期并允许修改；身高、体重任意一项有效即可保存，两项均有效时实时展示 BMI。评价记录点击后进入独立二级页，通过时间、评价人、指标三个入口筛选。

成长报告与采集记录共用学期筛选。采集记录在学期内按月份分组，不再增加月份或自定义时间筛选。学生详情不把兑换记录作为一级页签，校园币详情只保留收入、支出与按月流水。

学籍高风险操作通过底部抽屉和二次确认披露。基础信息编辑只处理资料与头像，不混入学籍状态操作。

### 5.6 我的

页面必须包含：

- 教师头像、姓名、当前班级来源、设置；
- 有待办时展示“待填写采集 + 数量”，无待办时整块隐藏；
- 管理工具：学校报表、期末报告、班主任助理、校长助理；
- 更多工具：作业批量录入、科目管理、部门管理、货币发放、建议反馈、采集管理、档案设计；
- 固定底部导航。

工具必须按空间类型与角色过滤。个人空间、协作空间、普通任课老师、班主任和管理层看到的入口可以不同，不保留无权限空位。

### 5.7 采集管理与档案设计

采集管理和档案设计等内容创建型列表使用右下角公共悬浮创建按钮，不占用标题栏。科目管理和部门管理属于低频配置页，新增按钮固定在页面底部并保留完整文字，列表独立滚动且预留底部空间，不使用悬浮圆形按钮。子页面标题栏只保留返回和居中标题，右侧完整避让微信胶囊。

表单构建器规则：

- 列表态使用连续题号列和填写效果预览；
- 点击题目或字段后进入编辑态，再披露名称、选项、必填与更多设置；
- 标题与说明在草稿态可直接编辑，说明最多 500 字并随内容增高；
- 分组内新增使用“添加题目 / 字段到本组”，低频编辑、排序、删除进入更多菜单；
- 底部固定三段操作：44 × 44 像素预览图标、中性“保存草稿”、宽红色主按钮；
- 预览与真实填写必须复用同一组件；
- 删除、发布等高风险动作必须二次确认。

### 5.8 班主任助理与校长助理

两个助理共享信息结构，但使用独立角色 Token。

| 助理 | 角色色 | 能力入口 |
| --- | --- | --- |
| 班主任助理 | 翡翠青 `--tm-role-headteacher-*` | 本周行动建议、我的评价复盘 |
| 校长助理 | 品牌红 + 奖励金 `--tm-role-principal-*` | 本周管理建议、上月学校复盘、学期学校报告 |

报告历史入口放在标题栏下方的上下文行右侧，使用历史图标加短文案，不侵入微信胶囊区域。AI 生成内容必须明确标识 AI 身份；减少动态效果开启时，停止文字流光并显示静态正文。

### 5.9 配置与操作型子页面

科目管理、部门管理、货币发放、建议反馈、基础信息编辑、批量修改、作业录入、奖励兑换、人脸更新、兑换密码等页面统一使用纯色分层背景和公共标题栏。科目与部门的数据列表使用独立紧凑条目和条目间距，不把多条数据包进一个大圆角卡片，也不使用横向分隔线。

页面只显示完成当前任务需要的字段和主要操作。编辑、删除、筛选、批量操作等低频能力进入行内更多菜单、底部抽屉或二级页面，不在首屏堆叠按钮。

### 5.10 作业录入

作业数据共用一套台账，通过两条路径进入：任课老师从“班级卡片更多 → 作业录入”手工登记；作业录入员从“我的 → 更多工具 → 作业批量录入”处理全校图片。学校未开通人工智能能力或当前用户没有作业录入员权限时，批量入口直接隐藏；班级手工入口只对本人任教班级展示。

手工路径首页始终使用日历，不设置列表模式。老师存在多个任教科目时，通过班级信息下方的科目分段控件直接切换当前日历数据，不增加科目列表或中转页；只有一个任教科目时只显示当前科目。当前高频场景按“一天一个科目、一条作业”展示：日历默认定位最近一次作业，支持切换月份、回到今天；有作业的日期显示轻量圆点。选择有作业的日期后，当前唯一主题收敛在日历卡底部，五档批量操作和学生名单直接在下方展示，无需再点击作业卡片；页面不使用会遮挡内容的悬浮新建按钮。长名单每20人分组并支持快捷定位。新建只填写日期、主题并使用当前任教学科，不出现学期和独立年级字段；创建后可先批量设置全班等级，再调整个别学生，所有修改自动保存。作业主题行不展示“手工 / 识别”等录入来源标签。

批量路径首页只展示识别任务，拍照或相册选择通过公共底部抽屉渐进披露。选图后先进入待识别过渡页：相册单次最多选择9张，拍照支持逐张连拍加入队列，用户确认“开始识别（N张）”后才发送；多图同时发送仍建立多个一图一任务。系统直接复用现有班级学生数据，不再设置独立花名册页签、拍照导入或逐班学生列表。内容区顶部提供“下载导入模版”次操作；弹窗直接陈列 A4、A3 两份固定模版及实际内容缩略图，每份模版独立提供预览和下载，下载任意规格不需要先切换页签。预览支持放大查看，并保留当前规格下载操作。“识别作业表”和“下载导入模版”弹窗的内容区统一使用页面底色 Token，白色操作项在其上形成清晰层级。

每张上传图片生成一张独立识别结果卡片，识别完成后立即写入共享作业台账，不再设置“确认录入”。卡片只展示原图缩略图、班级、学科、作业次数和“N项待核对 / 已录入”状态，卡片主体直接进入详情且不显示右箭头；右侧三点菜单渐进披露“删除识别任务”，确认删除时同时撤销该图片产生的作业记录。有异常的卡片进入后默认只展示当前图片的待核对项，可切换完整结果；无异常的卡片直接展示完整结果，不出现空异常页。详情顶部不重复待核对数量；最后一个异常处理完成后保留“待核对 0 / 完整结果”页签并停留原位。完整结果只展示单次作业摘要，点击后进入“作业结果”子页面修改日期、主题和学生等级，不在批次页展开长名单；子页面把头像、紧邻的学号后两位与姓名、五档作业等级放在同一行。班级、学科、日期、主题和学生等级的修改实时同步台账，更换班级必须二次确认后才重新匹配学生。五档等级依次使用班级报告绿色、班级报告蓝色、班级报告警示色、品牌红色和中性灰色，选中态统一为无可见边框的实色白字，并与手工作业录入共用组件。冲突默认保留已有记录，错班重新选择现有班级，无法匹配的学号在异常项中人工选择学生，不能自动新建。

作业等级统一为优、良、合格、待合格、未交五档。纸面识别码为 `A/B/C/D/X`，空白严格保留为未登记。标准模板不预印姓名和完整学生编号，只保留固定“学号”列并均分左右区域；A4 横向固定为 `01—72`，A3 横向固定为 `001—100`。所有班级共用同一模板，老师只填写完整班级名、学科以及 6 次作业的日期和主题。系统按“完整班级名 + 学号”匹配现有班级学生，多余空行直接忽略。

## 6. 公共组件

优先复用以下现有公共组件；业务页不得复制结构后局部写死。

| 组件 | 代码位置 | 使用范围 |
| --- | --- | --- |
| 屏幕背景 | `mobile-app/components/TeacherMobileScreenBackground.tsx` | 氛围背景、纯色分层背景、学生详情沉浸背景 |
| 班级来源 | `mobile-app/components/ClassSourceTrigger.tsx`、`HomeroomClassPickerSheet.tsx` | 记录、班级、我的及报告上下文 |
| 底部导航 | `mobile-app/components/TeacherFluidGlassNav.tsx` | 记录、班级、我的 |
| 通用卡片 | `mobile-app/components/ui/MobileCard.tsx` | 普通、抬升、AI、指标等卡片 |
| 底部抽屉 | `mobile-app/components/ui/MobileBottomSheet.tsx` | 筛选、选择、低频编辑、详情披露 |
| 提示抽屉 | `mobile-app/components/ui/MobileNoticeSheet.tsx` | 需要用户知晓但不要求复杂决策的提示 |
| 悬浮创建 | `mobile-app/components/ui/MobileFloatingCreateButton.tsx` | 采集管理、档案设计、个人班级列表 |
| 菜单项与分组 | `mobile-app/components/ui/MenuItem.tsx`、`MenuSection.tsx` | 我的与配置页 |
| 表单构建器 | `mobile-app/components/form-builder/FormBuilder.tsx` | 家长问卷、学生采集、档案设计 |
| 报告图表 | `mobile-app/components/report/TeacherReportChart.tsx` | 教师端报告 |

组件分层：

- 基础层：Token、背景、安全区、图标、焦点、动效；
- 通用组件层：卡片、按钮、输入、底部抽屉、菜单、导航、图表容器；
- 业务层：记录卡、班级卡、学生身份卡、报告板块、助理报告。

业务层只能组合通用组件和语义 Token，禁止把班级、学生、报告等业务判断写进基础组件。

## 7. 状态与反馈

每个可交互模块至少覆盖以下状态：

| 状态 | 设计要求 |
| --- | --- |
| 默认 | 内容与主操作清晰，不依赖说明文字解释 |
| 按压 | 150 至 200 毫秒，使用轻微缩放、表面色或文字色变化 |
| 聚焦 | 输入框使用 1 像素品牌边界和 2 像素浅红外环；其他控件有可见焦点 |
| 加载 | 保持骨架尺寸稳定，不让标题、按钮或列表跳动 |
| 空状态 | 说明当前没有什么，并只给一个可执行下一步；不使用大插画占首屏 |
| 成功 | 反馈具体结果，例如“班级号已复制”，不只显示“成功” |
| 错误 | 说明失败原因或下一步，例如“复制失败，请重试”，不只显示“失败” |
| 禁用 | 只用于真正不可操作状态，不用于未选中项 |
| 只读 | 使用只读 Token，与禁用状态视觉区分 |
| 高风险 | 删除、离校、发布等操作必须二次确认 |
| AI 处理中 | 明确显示 AI 正在处理，完成后原位更新，不新增重复结果卡 |

底部抽屉打开时保持父页面滚动位置，默认聚焦抽屉容器，不主动弹出软键盘；关闭后焦点返回触发入口。遮罩只降低背景层级，不给整页增加模糊或彩色阴影。

## 8. Token 接入

### 8.1 代码接入

应用根容器注入变量：

```tsx
import { teacherBrandCssVariables } from './styles/teacherMobileTokens';

<div style={teacherBrandCssVariables as React.CSSProperties}>
  {children}
</div>
```

业务组件只引用变量：

```tsx
<section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)] [box-shadow:var(--tm-shadow-card)]">
  <h2 className="text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">
    班级报告
  </h2>
</section>
```

完整阴影必须使用 `[box-shadow:var(--tm-shadow-card)]`，不得写成 `shadow-[var(--tm-shadow-card)]`。已有 `phoneText`、`phoneRadius`、`phoneShadow`、`phoneSpace`、`phoneTone` 等辅助映射时优先复用。

### 8.2 颜色语义

| 语义 | 主值 | 浅底 | 使用范围 |
| --- | --- | --- | --- |
| 品牌主色 | `#E02727` | `#FFF1F1` | 主按钮、选中态、记录学生 |
| 辅助色 | `#F75C03` | `#FFF5EC` | 记录班级、小面积辅助强调 |
| 奖励色 | `#FA9C00` | `#FFF8E5` | 校园币、奖励、校长助理辅助色 |
| 正向状态 | `#48A04D` | `#F4FBF4` | 加分、成功、覆盖率高档 |
| 负向状态 | `#E02727` | `#FFF1F1` | 扣分、错误、高风险确认 |
| 主文字 | `#171513` | - | 标题、正文、关键数据 |
| 次文字 | `#6D6764` | - | 辅助内容、未选中导航 |
| 页面背景 | `#F8F6F5` | - | 页面与纯色内容区 |
| 表面 | `#FFFFFF` | - | 卡片、抽屉、输入控件 |

记录模式色只表达记录对象，分值色只表达正负结果。记录班级处于橙色模式时，扣分仍必须使用负向红；加分不得使用橙色。

### 8.3 字号、间距、圆角与触控

| 类型 | Token | 值 |
| --- | --- | --- |
| 页面标题 | `--tm-font-size-page-title` | 22px |
| 分组标题 | `--tm-font-size-group-title` | 18px |
| 板块标题 | `--tm-font-size-section-title` | 17px |
| 卡片标题 | `--tm-font-size-card-title` | 15px |
| 正文 | `--tm-font-size-body` | 14px |
| 紧凑信息 | `--tm-font-size-compact` | 13px |
| 辅助信息 | `--tm-font-size-meta` | 12px |
| 角标 | `--tm-font-size-badge` | 11px |
| 关键数据 | `--tm-font-size-metric` | 24px |
| 间距序列 | `--tm-space-1/2/3/4/5/6/8` | 4/8/12/16/20/24/32px |
| 控件圆角 | `--tm-radius-control` | 12px |
| 卡内圆角 | `--tm-radius-inner` | 16px |
| 卡片圆角 | `--tm-radius-card` | 20px |
| 抽屉圆角 | `--tm-radius-sheet` | 28px |
| 最小触控 | `--tm-size-touch` | 44px |
| 悬浮创建按钮 | `--tm-size-floating-action` | 52px |

## 9. 完整 Token 快照

以下为 2026-08-03 已批准可执行 Token 的解析值，供设计交付核对。项目代码不得手动复制维护本段。

```css
:root {
  --tm-brand-primary: #E02727;
  --tm-brand-primary-strong: #BA352E;
  --tm-brand-primary-hover: #CC2020;
  --tm-brand-primary-pressed: #BA352E;
  --tm-brand-primary-soft: #FFF1F1;
  --tm-brand-primary-soft-strong: #FFE2E2;
  --tm-brand-secondary: #F75C03;
  --tm-brand-secondary-strong: #B83F00;
  --tm-brand-secondary-soft: #FFF5EC;
  --tm-brand-reward: #FA9C00;
  --tm-brand-reward-strong: #9A5B00;
  --tm-brand-reward-soft: #FFF8E5;

  --tm-status-positive: #48A04D;
  --tm-status-positive-strong: #2E7D32;
  --tm-status-positive-soft: #F4FBF4;
  --tm-status-negative: #E02727;
  --tm-status-negative-strong: #BA352E;
  --tm-status-negative-soft: #FFF1F1;

  --tm-record-student-primary: #E02727;
  --tm-record-student-text: #BA352E;
  --tm-record-student-soft: #FFF1F1;
  --tm-record-student-soft-strong: #FFE2E2;
  --tm-record-class-primary: #F75C03;
  --tm-record-class-text: #B83F00;
  --tm-record-class-soft: #FFF5EC;
  --tm-record-positive-bg: #F4FBF4;
  --tm-record-positive-border: #D4EAD5;
  --tm-record-positive-text: #2E7D32;
  --tm-record-negative-bg: #FFF1F1;
  --tm-record-negative-border: #FFE2E2;
  --tm-record-negative-text: #BA352E;

  --tm-edu-virtue: #E02727;
  --tm-edu-wisdom: #F75C03;
  --tm-edu-fitness: #48A04D;
  --tm-edu-aesthetic: #14A085;
  --tm-edu-labor: #C88100;

  --tm-tag-jade-soft: #ECF8F6;
  --tm-tag-jade-strong: #155B54;
  --tm-tag-jade-border: #D4EEE9;
  --tm-tag-orange-soft: #FFF5EC;
  --tm-tag-orange-strong: #B83F00;
  --tm-tag-orange-border: #FFE8D4;
  --tm-tag-red-soft: #FFF1F1;
  --tm-tag-red-strong: #BA352E;
  --tm-tag-red-border: #FFE2E2;
  --tm-tag-gold-soft: #FFF8E5;
  --tm-tag-gold-strong: #9A5B00;
  --tm-tag-gold-border: #FFEFC2;
  --tm-gender-male: #2CCBA3;
  --tm-gender-female: #F75C03;

  --tm-bg-page: #F8F6F5;
  --tm-bg-page-mid: #FBFAF9;
  --tm-bg-page-low: #F6F4F3;
  --tm-bg-surface: #FFFFFF;
  --tm-bg-surface-soft: #F8F6F5;
  --tm-bg-surface-muted: #F1EEEC;
  --tm-bg-page-glass: rgba(255, 249, 246, 0.92);
  --tm-bg-surface-glass: rgba(255, 255, 255, 0.96);
  --tm-page-plain-header-bg: #FFFFFF;
  --tm-page-plain-content-bg: #F8F6F5;

  --tm-text-primary: #171513;
  --tm-text-secondary: #6D6764;
  --tm-text-tertiary: #7B7572;
  --tm-text-disabled: #A49C97;
  --tm-text-inverse: #FFFFFF;
  --tm-nav-item-default: #6D6764;
  --tm-border-subtle: #E7E2DF;
  --tm-border-control: #918985;

  --tm-input-bg: #FFFFFF;
  --tm-input-border: #918985;
  --tm-input-text: #171513;
  --tm-input-placeholder: #7B7572;
  --tm-input-disabled-bg: #F1EEEC;
  --tm-input-disabled-border: #E7E2DF;
  --tm-input-disabled-text: #A49C97;
  --tm-input-readonly-bg: #F8F6F5;
  --tm-input-readonly-border: #E7E2DF;
  --tm-input-readonly-text: #6D6764;
  --tm-input-focus-border: #E02727;
  --tm-input-focus-ring: rgba(224, 39, 39, 0.16);
  --tm-focus-ring: #E02727;

  --tm-chart-data-default: #43B0F6;
  --tm-chart-data-default-text: #176B9B;
  --tm-chart-data-default-soft: #F4FAFF;
  --tm-chart-positive: #5BD65D;
  --tm-chart-positive-text: #23733A;
  --tm-chart-positive-soft: #F3FFF6;
  --tm-chart-warning: #FF9B3D;
  --tm-chart-warning-text: #9C5118;
  --tm-chart-warning-soft: #FFFAEE;
  --tm-chart-negative: #FF8176;
  --tm-chart-negative-text: #A8433D;
  --tm-chart-negative-soft: #FFF7F4;
  --tm-chart-edu-virtue: #FF8176;
  --tm-chart-edu-wisdom: #43B0F6;
  --tm-chart-edu-fitness: #5BD65D;
  --tm-chart-edu-aesthetic: #45CED1;
  --tm-chart-edu-labor: #FFB84D;
  --tm-chart-grid: #E8F0F5;
  --tm-chart-tooltip: #17213A;
  --tm-chart-hover: rgba(224, 39, 39, 0.06);
  --tm-chart-series-muted-opacity: 0.4;
  --tm-chart-series-peer: #AFBDCB;
  --tm-chart-series-total: #40566D;

  --tm-mask: rgba(23, 21, 19, 0.42);
  --tm-shadow-brand-color: rgba(224, 39, 39, 0.30);
  --tm-shadow-neutral-color: rgba(64, 60, 58, 0.18);
  --tm-shadow-card: 0 12px 28px -20px rgba(64, 60, 58, 0.12);
  --tm-shadow-card-raised: 0 14px 32px -20px rgba(64, 60, 58, 0.16);
  --tm-shadow-card-on-white: 0 1px 4px rgba(64, 60, 58, 0.10), 0 12px 28px -14px rgba(64, 60, 58, 0.16);
  --tm-shadow-control: 0 6px 16px -12px rgba(64, 60, 58, 0.18);
  --tm-shadow-icon: 0 10px 22px -16px rgba(224, 39, 39, 0.24);
  --tm-shadow-avatar: 0 18px 28px -18px rgba(224, 39, 39, 0.24);
  --tm-shadow-floating: 0 -10px 24px -12px rgba(64, 60, 58, 0.18), 0 10px 28px -12px rgba(64, 60, 58, 0.18);
  --tm-shadow-navigation: 0 -10px 24px -12px rgba(64, 60, 58, 0.18);
  --tm-shadow-sheet: 0 -20px 52px -34px rgba(64, 60, 58, 0.18);
  --tm-glow-primary: rgba(224, 39, 39, 0.13);
  --tm-glow-secondary: rgba(247, 92, 3, 0.11);
  --tm-glow-primary-subtle: rgba(224, 39, 39, 0.055);
  --tm-glow-secondary-subtle: rgba(247, 92, 3, 0.05);

  --tm-role-headteacher-primary: #1F9E84;
  --tm-role-headteacher-strong: #126B5B;
  --tm-role-headteacher-soft: #EFFAF7;
  --tm-role-headteacher-soft-strong: #D8F3EC;
  --tm-role-headteacher-border: #B7E7DB;
  --tm-role-headteacher-highlight: #86E0CC;
  --tm-role-headteacher-glow-primary: rgba(31, 158, 132, 0.14);
  --tm-role-headteacher-glow-secondary: rgba(134, 224, 204, 0.12);
  --tm-role-headteacher-shadow: rgba(18, 107, 91, 0.18);

  --tm-role-principal-primary: #E02727;
  --tm-role-principal-strong: #BA352E;
  --tm-role-principal-soft: #FFF1F1;
  --tm-role-principal-soft-strong: #FFE2E2;
  --tm-role-principal-border: #FFC7C7;
  --tm-role-principal-accent: #FA9C00;
  --tm-role-principal-accent-strong: #9A5B00;
  --tm-role-principal-highlight: #FFD56A;
  --tm-role-principal-accent-soft: #FFF8E5;
  --tm-role-principal-accent-border: #FFD56A;
  --tm-role-principal-glow-primary: rgba(224, 39, 39, 0.13);
  --tm-role-principal-glow-secondary: rgba(250, 156, 0, 0.11);
  --tm-role-principal-shadow: rgba(146, 34, 31, 0.18);

  --tm-audience-guardian-primary: #E02727;
  --tm-audience-guardian-strong: #BA352E;
  --tm-audience-guardian-soft: #FFF1F1;
  --tm-audience-guardian-border: #FFC7C7;
  --tm-audience-student-primary: #278779;
  --tm-audience-student-strong: #155B54;
  --tm-audience-student-soft: #ECF8F6;
  --tm-audience-student-border: #ADDCD4;
  --tm-audience-teacher-primary: #FA9C00;
  --tm-audience-teacher-strong: #9A5B00;
  --tm-audience-teacher-soft: #FFF8E5;
  --tm-audience-teacher-border: #FFD56A;

  --tm-radius-control: 12px;
  --tm-radius-inner: 16px;
  --tm-radius-card: 20px;
  --tm-radius-sheet: 28px;
  --tm-size-touch: 44px;
  --tm-size-floating-action: 52px;
  --tm-student-detail-header-height: 272px;

  --tm-font-size-document-title: 26px;
  --tm-font-size-page-title: 22px;
  --tm-font-size-group-title: 18px;
  --tm-font-size-form-group-label: 14px;
  --tm-font-size-section-title: 17px;
  --tm-font-size-card-title: 15px;
  --tm-font-size-body: 14px;
  --tm-font-size-compact: 13px;
  --tm-font-size-meta: 12px;
  --tm-font-size-badge: 11px;
  --tm-font-size-metric: 24px;

  --tm-space-1: 4px;
  --tm-space-2: 8px;
  --tm-space-3: 12px;
  --tm-space-4: 16px;
  --tm-space-5: 20px;
  --tm-space-6: 24px;
  --tm-space-8: 32px;

  --tm-report-page-inline: var(--tm-space-5);
  --tm-report-card-gap: var(--tm-space-6);
  --tm-report-card-padding: var(--tm-space-4);
  --tm-report-card-content-gap: var(--tm-space-4);
  --tm-report-coverage-row-height: 48px;
  --tm-report-coverage-value-height: 24px;
  --tm-report-coverage-name-inset: var(--tm-space-4);
  --tm-report-coverage-evaluation-column: 76px;
  --tm-report-coverage-teacher-column: 104px;
  --tm-report-filter-padding-top: 0px;
  --tm-report-filter-padding-bottom: 0px;
  --tm-report-filter-padding-pinned: 0px;
  --tm-report-date-indicator-width: 56px;
  --tm-report-date-indicator-height: 3px;
  --tm-report-custom-range-height: 40px;
  --tm-report-source-list-inline: var(--tm-space-2);
  --tm-report-source-item-gap: var(--tm-space-2);
  --tm-report-source-item-inline: 6px;
  --tm-report-source-padding-top: 0px;
  --tm-report-source-padding-bottom: 0px;
  --tm-report-source-pill-height: 28px;
  --tm-report-source-pill-inline: 6px;

  --tm-duration-fast: 150ms;
  --tm-duration-standard: 200ms;
  --tm-duration-panel: 300ms;
}
```

## 10. 图标与图片资源

### 10.1 图标

- 通用操作图标统一使用 `lucide-react`；已有项目封装时优先使用 `mobile-app/components/Icons.tsx`。
- 返回、关闭、更多、搜索、筛选、历史、相机、语音、键盘等操作使用熟悉的线性符号；图标按钮必须提供中文无障碍名称。
- 不手绘临时 SVG（可缩放矢量图形），不使用 emoji 替代操作图标。
- 图标可见尺寸通常为 18 至 24 像素，但触控容器不得小于 44 × 44 像素。

### 10.2 已有图片

统一从 `mobile-app/assets/images.ts` 的 `ASSETS` 对象引用，不直接拼接文件路径。

| 资源 | 文件或对象 | 用途 |
| --- | --- | --- |
| 教师默认头像 | `teacher-default-avatar.png` | 我的、资料编辑、报告上下文；老师自行更换后展示自定义头像 |
| 学生默认头像 | `student-girl-default-avatar.png`、`studentAvatarCatalog.ts` | 学生列表、学生详情、头像选择 |
| 班主任助理 | `ai-headteacher-assistant-character.png`、`ai-headteacher-assistant-icon.png` | 助理入口与角色页面 |
| 校长助理 | `ai-principal-assistant-character.png`、`ai-principal-assistant-icon.png` | 助理入口与角色页面 |
| AI 标识 | `ai-art-badge.png`、`ai-bot.png` | AI 身份提示 |
| 我的页背景 | `teacher-me-hero-bg.png`、`teacher-me-page-bg.png` | 我的页品牌氛围 |
| 报告入口 | `school-report-v2.png`、`term-report-v2.png` | 学校报表、期末报告 |
| 排名前三 | `ranking-crown-icon.png` | 积分排行前三名，使用 CSS 遮罩着色且保留数字 |
| 高光默认图 | `resources/highlight-defaults/` | 证书、协作、课堂、劳动、体育、美育等缺图占位 |

图片必须提供符合内容的替代文本；纯装饰背景使用空替代文本或 `aria-hidden="true"`。

## 11. 适配与无障碍

- Demo 基准画布为 393 × 852 像素，但布局必须适配常见手机宽度，不按画布宽度缩放字号；
- 微信真机通过 `wx.getMenuButtonBoundingClientRect()` 获取胶囊位置，注入 `--mini-program-capsule-right-inset`；Demo 手机壳注入相同变量；
- 状态栏使用 `--mini-program-status-bar-height`，底部使用 `env(safe-area-inset-bottom)`；
- 子页面标题栏右侧不放业务操作，完整预留微信胶囊区域；
- 所有点击区域至少 44 × 44 像素；正文对比度至少 4.5:1，图标和控件边界至少 3:1；
- 隐藏滚动条外观时仍保留触摸、惯性、键盘滚动和程序定位；
- 内容放大至 200% 时不遮挡、不重叠，长名称、长班级名和三位数数量不撑破容器；
- 不只依赖颜色表达正负、性别、选中、排序或图表系列；
- 动效遵守系统“减少动态效果”偏好。

## 12. 重构建议顺序

1. 在应用根节点接入教师端 Token，清除页面级主题变量和旧蓝紫、靛青令牌；
2. 收敛屏幕背景、标题栏、安全区、底部导航、底部抽屉、卡片、按钮、输入控件；
3. 重构三大一级页：老师记录、我的班级、我的；
4. 重构班级与学生主路径：班级学生列表、班级报告、学生详情、评价记录；
5. 迁移采集、档案、助理报告和配置型页面；
6. 补齐全部状态、权限显隐、无障碍和真机安全区；
7. 进行 Token 扫描、视觉回归、关键流程与多尺寸验收。

## 13. 开发验收清单

### 13.1 Token 与组件

- [ ] 根节点已注入 `teacherBrandCssVariables`；
- [ ] 页面没有新增硬编码颜色、阴影、圆角或独立字号体系；
- [ ] 业务组件优先使用组件级 Token，其次使用语义级 Token；
- [ ] 全局底部抽屉、确认、菜单、提示均使用公共组件；
- [ ] 普通卡片没有常驻实体边框或环形阴影；
- [ ] 页面没有卡片套卡片造成的多层重容器。

### 13.2 页面与流程

- [ ] 三个一级入口固定为记录、班级、我的；
- [ ] 核心任务在 3 次交互内可完成，页面只有 1 至 2 个主要操作；
- [ ] 班级来源、记录对象、指标体系保持正确控制关系；
- [ ] 无权限能力直接隐藏；
- [ ] 删除、离校、发布等高风险操作有二次确认；
- [ ] 筛选、批量和配置能力按渐进披露进入抽屉、更多菜单或二级页；
- [ ] 手工作业录入与批量识别写入同一台账，空白等级保持未登记，错班和冲突不能静默提交；
- [ ] “下载导入模版”中的 A4 模版固定包含学号 `01—72`，A3 模版固定包含学号 `001—100`，左右区域连续且无重复，模版不展示任课教师；
- [ ] 空、加载、成功、失败、禁用、只读和 AI 处理中状态齐全。

### 13.3 视觉与无障碍

- [ ] 393 × 852 像素 Demo、窄屏和宽屏手机均无重叠、截断或横向溢出；
- [ ] 微信状态栏、胶囊与底部安全区适配正确；
- [ ] 所有触控区域不小于 44 × 44 像素；
- [ ] 正文、图标和控件边界满足对比度要求；
- [ ] 键盘可访问，焦点可见，抽屉焦点进入与返回正确；
- [ ] AI 内容有明确身份标识，错误反馈可执行；
- [ ] 减少动态效果开启后无持续扫光或非必要动画；
- [ ] 真机与手机壳预览均隐藏滚动条外观但保留滚动能力。

## 14. 交付文件索引

| 类型 | 文件 |
| --- | --- |
| 本交付文档 | `docs/教师手机端Demo-设计开发交付文档.md` |
| 可执行 Token | `mobile-app/styles/teacherMobileTokens.ts` |
| 教师端 UI 规范 | `design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md` |
| 图表解析规则 | `design-system/teacher-mobile/TEACHER_MOBILE_CHART_RULES.md` |
| 应用页面装配 | `mobile-app/App.tsx` |
| 教师端公共样式 | `mobile-app/index.css`、`mobile-app/styles/navigation.css` |
| 图片资源入口 | `mobile-app/assets/images.ts` |
| 图片文件目录 | `mobile-app/assets/resources/` |
