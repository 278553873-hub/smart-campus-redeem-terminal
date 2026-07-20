# 教师手机端 Design Token（设计令牌）

> 适用范围：教师微信小程序手机端，包括记录、班级、学生、报表、我的、弹层和底部导航。
>
> 不适用范围：家长手机端、PC 后台、货柜机终端和教室大屏。各端保持独立主题，禁止交叉覆盖。

## 1. 唯一来源

教师手机端只允许存在一个可执行令牌源：

```text
mobile-app/styles/teacherMobileTokens.ts
```

该文件同时维护：

- Primitive（原始值）：品牌红、辅助橙、奖励金、角色玉石青、中性色、正向绿、负向玫红。
- Semantic（语义值）：品牌、文字、页面、表面、边框、状态。
- Component（组件值）：记录模式、导航、阴影、圆角、触控、字号、间距和动效。

页面只能引用 `--tm-*` 语义变量或该文件导出的共享样式映射，不得在页面内重新声明主题变量。

已废弃并删除：

- `mobile-app/styles/teacherBrandTokens.ts`
- `mobile-app/styles/phoneTokens.ts`
- `mobile-app/styles/teacherMobileTokens.css`
- `mobile-app/index.css` 中旧 `--ai-*`、`--student-*`、`--class-*` 蓝紫/靛青变量

## 2. 视觉方向

- 暖白页面底色，品牌红和辅助橙只用于小面积强调及顶部弱弥散光。
- 白色内容表面、轻中性阴影、克制圆角，不使用重玻璃和厚重彩色发光。
- 记录学生使用品牌红，记录班级使用辅助橙；二者只表达记录对象。
- 加分使用正向绿，扣分使用负向玫红；不得与记录对象颜色混用。
- 蓝紫、靛青不再承担教师端品牌、主操作、选中态或人工智能角色色。班主任助理使用玉石青角色体系，校长助理使用品牌红与奖励金角色体系。

## 3. 原始颜色

### 3.1 品牌与中性色

| 用途 | Token | 色值 |
|---|---|---:|
| 品牌主色 | `red-500` | `#E02727` |
| 品牌按压 | `red-700` | `#BA352E` |
| 品牌浅底 | `red-50` | `#FFF1F1` |
| 辅助橙 | `orange-500` | `#F75C03` |
| 辅助橙文字 | `orange-700` | `#B83F00` |
| 辅助橙浅底 | `orange-50` | `#FFF5EC` |
| 角色玉石青 | `jade-500` | `#278779` |
| 角色玉石青文字 | `jade-700` | `#155B54` |
| 角色玉石青浅底 | `jade-50` | `#ECF8F6` |
| 页面暖白 | 页面语义值 | `#FFF9F6` |
| 主文字 | `neutral-900` | `#171513` |
| 次文字 | `neutral-500` | `#6D6764` |
| 弱图标/禁用 | `neutral-400` | `#A49C97` |
| 弱边框 | `neutral-200` | `#E7E2DF` |

### 3.2 状态色

| 语义 | 浅底 | 主色 | 深文字 |
|---|---:|---:|---:|
| 正向/加分 | `#ECF8F1` | `#168252` | `#0F6A45` |
| 负向/扣分 | `#FFF0F3` | `#B4233C` | `#8F1830` |
| 奖励 | `#FFF8E5` | `#FA9C00` | `#9A5B00` |

### 3.3 人工智能助理角色色

角色色表达助理的业务角色，不替代全局品牌、状态或记录模式语义；人工智能身份由人物、打字机、流光和卡片材质共同表达。

| 角色 | 主色 | 强文字 | 浅底 | 流光高光 |
|---|---|---|---|---|
| 班主任助理 | `--tm-role-headteacher-primary` | `--tm-role-headteacher-strong` | `--tm-role-headteacher-soft` | `--tm-role-headteacher-highlight`（浅玉石青） |
| 校长助理 | `--tm-role-principal-primary` | `--tm-role-principal-strong` | `--tm-role-principal-soft` | `--tm-role-principal-highlight`（管理金） |

角色页面的背景光、边框、焦点、阴影和文字流光必须引用对应 `--tm-role-*` Token，禁止重新引入青蓝、柔紫或一次性角色色。流光高光必须与角色深色正文保持足够的明度差，避免动画运行但视觉不可辨识。

### 3.4 采集受众色

问卷采集按填写对象区分受众色，颜色必须与图标和类型文字共同出现，不能单独依赖颜色传达类型。

| 受众 | Token 前缀 | 视觉方向 |
|---|---|---|
| 家长 | `--tm-audience-guardian-*` | 品牌红 |
| 学生 | `--tm-audience-student-*` | 玉石青 |
| 教师 | `--tm-audience-teacher-*` | 奖励金 |

## 4. 核心语义变量

| 语义 | CSS（层叠样式表）变量 | 说明 |
|---|---|---|
| 品牌主色 | `--tm-brand-primary` | 主入口、全局选中态 |
| 品牌深色 | `--tm-brand-primary-strong` | 品牌浅底上的普通字号文字 |
| 辅助色 | `--tm-brand-secondary` | 班级模式图形强调，不承载小字号文字 |
| 辅助色文字 | `--tm-brand-secondary-strong` | 橙色浅底上的文字 |
| 主文字 | `--tm-text-primary` | 标题、姓名、关键数字 |
| 次文字 | `--tm-text-secondary` | 正文辅助信息、未选中导航 |
| 弱文字 | `--tm-text-tertiary` | 非关键提示和装饰图标 |
| 禁用文字 | `--tm-text-disabled` | 仅用于真正不可操作状态 |
| 页面背景 | `--tm-bg-page` | 教师端全局暖白背景 |
| 内容表面 | `--tm-bg-surface` | 卡片、弹层、底栏 |
| 弱表面 | `--tm-bg-surface-soft` | 次级按钮、卡内弱分组 |
| 弱边框 | `--tm-border-subtle` | 分割线、描边 |
| 控件边框 | `--tm-border-control` | 输入框等必须被清晰识别的交互边界 |
| 焦点环 | `--tm-focus-ring` | 表单及按钮的键盘焦点反馈 |
| 遮罩 | `--tm-mask` | 底部抽屉和弹层遮罩 |

角色色与受众色均属于业务语义层，只能由对应角色页、问卷类型标签和类型图形使用，不得改写全局导航、通用主按钮或正负状态。

## 5. 记录语义

| 用途 | 强调 | 可读文字 | 浅底 |
|---|---|---|---|
| 记录学生 | `--tm-record-student-primary` | `--tm-record-student-text` | `--tm-record-student-soft` |
| 记录班级 | `--tm-record-class-primary` | `--tm-record-class-text` | `--tm-record-class-soft` |
| 加分 | `--tm-status-positive` | `--tm-record-positive-text` | `--tm-record-positive-bg` |
| 扣分 | `--tm-status-negative` | `--tm-record-negative-text` | `--tm-record-negative-bg` |

规则：

- `#F75C03` 在白底只用于图形、色块和大面积状态，不用于普通字号正文。
- 品牌红 `#E02727` 在浅红底上只用于图形强调；`12px-14px` 文字使用 `--tm-record-student-text`。
- 班级模式的 `12px-14px` 文字统一使用 `--tm-record-class-text`（`#B83F00`）。
- 总分使用正负语义色，不跟随记录学生/记录班级模式色。

## 6. 排版令牌

| 层级 | Token | 默认值 |
|---|---|---:|
| 页面标题 | `--tm-font-size-page-title` | `22px` |
| 区块标题 | `--tm-font-size-section-title` | `17px` |
| 卡片标题 | `--tm-font-size-card-title` | `15px` |
| 正文 | `--tm-font-size-body` | `14px` |
| 紧凑正文 | `--tm-font-size-compact` | `13px` |
| 辅助信息 | `--tm-font-size-meta` | `12px` |
| 徽标 | `--tm-font-size-badge` | `11px` |
| 统计数字 | `--tm-font-size-metric` | `24px` |

普通正文不得低于 `12px`。`11px` 只用于徽标、数量角标等短信息，不承载需要阅读和判断的正文。
总分、统计摘要等大数字默认使用 `24px`，不得在普通列表中继续放大。

## 7. 圆角、阴影与触控

### 7.1 圆角

| 用途 | Token | 值 |
|---|---|---:|
| 按钮/控件 | `--tm-radius-control` | `12px` |
| 卡内分组/工具项 | `--tm-radius-inner` | `16px` |
| 内容卡片 | `--tm-radius-card` | `20px` |
| 底部抽屉 | `--tm-radius-sheet` | `28px` |

头像、徽标、标签等圆形内容使用 `rounded-full`。普通页面区块不得使用 `30px+` 大圆角。

### 7.2 阴影

| 用途 | Token |
|---|---|
| 普通卡片 | `--tm-shadow-card` |
| 强调卡片 | `--tm-shadow-card-raised` |
| 选中控件 | `--tm-shadow-control` |
| 悬浮录入条 | `--tm-shadow-floating` |
| 底部导航 | `--tm-shadow-navigation` |
| 底部抽屉 | `--tm-shadow-sheet` |

业务页面不得使用阴影颜色自行拼装新的阴影公式。

### 7.3 触控

- 所有可点击控件的最小触控尺寸为 `44px × 44px`。
- 对应 Token 为 `--tm-size-touch`。
- 小图标可以保持 `16px-22px`，但必须放入至少 `44px` 的点击容器。
- 底部导航未选中态使用 `--tm-nav-item-default`，不得使用低对比禁用色。
- 弱提示文字必须使用 `--tm-text-tertiary` 并满足普通文字对比度；`--tm-text-disabled` 不得承载仍需阅读的信息。

## 8. 间距与动效

间距使用 `4 / 8 / 12 / 16 / 20 / 24 / 32px` 七级刻度，对应 `--tm-space-*`。

| 动效 | Token | 值 |
|---|---|---:|
| 即时反馈 | `--tm-duration-fast` | `150ms` |
| 常规状态切换 | `--tm-duration-standard` | `200ms` |
| 页面/抽屉进入 | `--tm-duration-panel` | `300ms` |

动效只用于状态反馈和层级变化，并遵守系统“减少动态效果”设置。

## 9. 页面使用边界

### 记录页

- 记录模式、对象标签和语音来源标签使用对应模式令牌。
- AI 解读区保持中性表面，总分使用正负语义令牌。
- 悬浮录入条使用中性表面和完整悬浮阴影，不跟随模式变色。

### 班级页

- 班主任标签使用辅助橙浅底和深橙文字。
- 学生列表使用中性入口，班级报告使用品牌浅底入口。
- 卡片、入口和筛选控件必须满足 `44px` 触控要求。

### 我的页

- 工具区使用统一卡片、图标槽位、圆角和阴影令牌。
- AI 助理可保留角色图片，但外层容器仍遵循教师端令牌。
- 低频工具只在对应分组中展示，不侵入高频记录流程。

### 问卷采集页

- 家长问卷、学生信息采集和教师问卷使用对应受众 Token；列表必须同时展示类型文字。
- 页面、卡片、按钮、表单、状态、抽屉仍使用全局教师端 Token，受众色不得扩散成页面主题。
- 未开放的采集类型不进入新建采集高频流程。

## 10. 检查清单

- 教师手机端是否只从 `teacherMobileTokens.ts` 获取主题令牌。
- 页面内是否不存在蓝紫、靛青品牌变量和一次性主题色；助理角色与问卷受众是否只使用对应角色/受众 Token。
- 普通文字对比度是否至少达到 `4.5:1`。
- 图标和控件边界对比度是否至少达到 `3:1`。
- 所有交互热区是否至少为 `44px × 44px`。
- 卡片、圆角和阴影是否引用组件级令牌。
- 记录、班级、我的三页是否共享同一底栏和表面规则。
