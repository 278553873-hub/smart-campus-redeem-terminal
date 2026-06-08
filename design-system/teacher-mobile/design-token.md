# 教师手机端 Design Token（设计变量）

> 适用对象：教师手机端 Demo、小程序壳层内的教师移动端页面、教师端手机尺寸弹窗/底部抽屉/导航/卡片。
>
> 不适用对象：PC 后台、货柜机终端、教室大屏、家长手机端。家长端已有独立暖色规范，不应直接套用本文件。

## 1. 设计目标

教师手机端当前视觉风格可以概括为：

- **清爽浅色底**：白色内容卡片叠在浅蓝、浅粉、浅紫弥散背景上。
- **AI 科技感**：核心品牌色使用靛蓝到青色渐变，局部使用粉色强调。
- **教师工作效率优先**：列表、班级、学生、报表页面要稳定、清晰、低干扰。
- **轻毛玻璃质感**：底部导航、悬浮层、重要卡片使用半透明白、柔和阴影和模糊。
- **状态颜色克制**：成功、警告、危险只在状态提示、标签和反馈中使用，不抢主品牌层级。

本文件把颜色拆成三层：

```text
Primitive 原始值 → Semantic 语义值 → Component 组件值
```

- **Primitive（原始值）**：只记录颜色本身，不表达业务含义。
- **Semantic（语义值）**：表达用途，如主色、页面背景、成功状态。
- **Component（组件值）**：表达组件内的具体用法，如按钮背景、卡片边框、底栏滑块。

---

## 2. Primitive Tokens：原始颜色

### 2.1 品牌与科技色

| Token | 色值 | 来源/用途 |
|---|---:|---|
| `--tm-indigo-500` | `#6366F1` | 教师端 AI 主色、学生模式主色、选中态 |
| `--tm-indigo-600` | `#4F46E5` | 主色按压态、深一级强调 |
| `--tm-blue-500` | `#3B82F6` | 班级卡片、智育、信息强调 |
| `--tm-blue-600` | `#2563EB` | 蓝色文字强调、按钮按压态 |
| `--tm-cyan-500` | `#06B6D4` | AI 辅助色、扫描/科技感强调 |
| `--tm-cyan-600` | `#0891B2` | 青色深态 |
| `--tm-violet-500` | `#8B5CF6` | 雷达图、能力图、紫色辅助 |
| `--tm-violet-400` | `#A78BFA` | 紫色轻强调 |
| `--tm-pink-500` | `#EC4899` | 美育、AI 渐变强调、局部高光 |

### 2.2 教师业务状态色

| Token | 色值 | 来源/用途 |
|---|---:|---|
| `--tm-emerald-500` | `#10B981` | 班级模式、体育、成功反馈 |
| `--tm-emerald-600` | `#059669` | 选中态、报表筛选主按钮 |
| `--tm-teal-600` | `#0F766E` | 合格/稳定状态、深绿色文本 |
| `--tm-amber-500` | `#F59E0B` | 德育、提醒、待处理 |
| `--tm-orange-600` | `#EA580C` | 低活跃榜、轻警示 |
| `--tm-rose-500` | `#F43F5E` | 危险、错误、负反馈 |
| `--tm-lime-500` | `#84CC16` | 劳动维度、轻活力强调 |

### 2.3 中性色

| Token | 色值 | 用途 |
|---|---:|---|
| `--tm-white` | `#FFFFFF` | 卡片、底栏、弹窗主体 |
| `--tm-slate-50` | `#F8FAFC` | 弱背景、列表分组底 |
| `--tm-slate-100` | `#F1F5F9` | 分隔块、禁用背景 |
| `--tm-slate-200` | `#E2E8F0` | 分割线、图表网格线 |
| `--tm-slate-300` | `#CBD5E1` | 弱图标、禁用文字 |
| `--tm-slate-400` | `#94A3B8` | 辅助文字、占位文字 |
| `--tm-slate-500` | `#64748B` | 次要文字 |
| `--tm-slate-600` | `#475569` | 常规说明文字 |
| `--tm-slate-700` | `#334155` | 次级标题 |
| `--tm-slate-900` | `#0F172A` | 主标题、正文强文本 |
| `--tm-slate-950` | `#020617` | 最高强调文本 |

### 2.4 轻色背景与弥散光

| Token | 色值 | 用途 |
|---|---:|---|
| `--tm-page-bg` | `#F8FBFF` | 教师手机端页面主背景 |
| `--tm-page-bg-top` | `#F9FBFF` | 页面顶部浅蓝白渐变起点 |
| `--tm-page-bg-bottom` | `#FFFFFF` | 页面底部白色渐变终点 |
| `--tm-glow-blue` | `#E2F1FF` | 顶部右侧浅蓝弥散光 |
| `--tm-glow-pink` | `#FFE8F8` | 顶部左侧浅粉弥散光 |
| `--tm-glow-purple` | `#F4F0FF` | 记录页中部浅紫弥散光 |
| `--tm-report-bg` | `#EEF7F3` | 学校数据报表页浅绿背景 |

### 2.5 透明与玻璃色

| Token | 色值 | 用途 |
|---|---:|---|
| `--tm-glass-bg` | `rgba(255,255,255,0.62)` | 教师端通用浮层背景，不用于底部导航主容器 |
| `--tm-glass-bg-strong` | `rgba(255,255,255,0.72)` | 通用浮层背景；悬浮输入区优先使用高不透明白底 |
| `--tm-glass-border` | `rgba(255,255,255,0.74)` | 毛玻璃边框 |
| `--tm-glass-highlight` | `rgba(255,255,255,0.72)` | 玻璃高光线 |
| `--tm-mask-bg` | `rgba(15,23,42,0.35)` | 弹窗遮罩 |

---

## 3. Semantic Tokens：语义颜色

### 3.1 品牌语义

| Token | 对应原始值 | 使用说明 |
|---|---|---|
| `--tm-color-primary` | `var(--tm-indigo-500)` | 教师端默认主色，适合选中态、主操作、重点入口 |
| `--tm-color-primary-pressed` | `var(--tm-indigo-600)` | 主操作按压态 |
| `--tm-color-secondary` | `var(--tm-cyan-500)` | AI 科技感辅助色、扫描线、渐变终点 |
| `--tm-color-accent` | `var(--tm-pink-500)` | 局部高光，不用于大面积按钮 |
| `--tm-color-class` | `var(--tm-emerald-500)` | 班级、群体、数据覆盖类场景 |
| `--tm-color-data` | `var(--tm-blue-500)` | 图表、统计、智育信息 |

### 3.2 文本语义

| Token | 对应原始值 | 使用说明 |
|---|---|---|
| `--tm-text-primary` | `var(--tm-slate-950)` | 页面标题、关键姓名、核心数字 |
| `--tm-text-secondary` | `var(--tm-slate-700)` | 卡片标题、列表标题 |
| `--tm-text-body` | `var(--tm-slate-600)` | 正文、描述 |
| `--tm-text-muted` | `var(--tm-slate-500)` | 次要信息 |
| `--tm-text-placeholder` | `var(--tm-slate-400)` | 输入提示、空状态弱文字 |
| `--tm-text-disabled` | `var(--tm-slate-300)` | 禁用态文字 |
| `--tm-text-inverse` | `var(--tm-white)` | 深色或彩色底上的文字 |

### 3.3 背景语义

| Token | 对应原始值 | 使用说明 |
|---|---|---|
| `--tm-bg-page` | `var(--tm-page-bg)` | 页面基础底色 |
| `--tm-bg-page-gradient` | `linear-gradient(180deg, var(--tm-page-bg-top) 0%, var(--tm-page-bg-bottom) 72%)` | 教师端默认柔和渐变背景 |
| `--tm-bg-card` | `var(--tm-white)` | 普通卡片、列表卡片 |
| `--tm-bg-card-subtle` | `var(--tm-slate-50)` | 卡片内部弱分组、图表承载区 |
| `--tm-bg-control` | `var(--tm-slate-100)` | 分段控件外层、弱按钮背景 |
| `--tm-bg-glass` | `var(--tm-glass-bg)` | 底部导航、悬浮栏 |
| `--tm-bg-report` | `var(--tm-report-bg)` | 学校数据报表页独立浅绿背景 |

### 3.4 边框与分割语义

| Token | 对应原始值 | 使用说明 |
|---|---|---|
| `--tm-border-subtle` | `var(--tm-slate-100)` | 卡片边框、列表分割 |
| `--tm-border-default` | `var(--tm-slate-200)` | 表单边框、较明显分隔 |
| `--tm-border-focus` | `var(--tm-color-primary)` | 输入框聚焦态 |
| `--tm-border-glass` | `var(--tm-glass-border)` | 毛玻璃组件边框 |

### 3.5 状态语义

| Token | 背景 | 文字 | 使用说明 |
|---|---|---|---|
| `--tm-success-*` | `#ECFDF5` | `var(--tm-emerald-600)` | 成功、已完成、正向反馈 |
| `--tm-info-*` | `#EFF6FF` | `var(--tm-blue-600)` | 信息、班级数据、说明提示 |
| `--tm-ai-*` | `#ECFEFF` | `var(--tm-cyan-600)` | AI 分析、智能生成 |
| `--tm-warning-*` | `#FFFBEB` | `var(--tm-amber-500)` | 待处理、提醒 |
| `--tm-danger-*` | `#FFF1F2` | `var(--tm-rose-500)` | 错误、危险、负反馈 |
| `--tm-neutral-*` | `var(--tm-slate-50)` | `var(--tm-slate-600)` | 普通标签、弱状态 |

---

## 4. Component Tokens：组件颜色

### 4.1 页面背景

| 组件 Token | 值 | 使用场景 |
|---|---|---|
| `--tm-page-background` | `var(--tm-bg-page-gradient)` | 默认教师端页面背景 |
| `--tm-page-glow-left` | `radial-gradient(circle at 18% 8%, rgba(255,232,248,0.9), transparent 28%)` | 顶部左侧粉色光 |
| `--tm-page-glow-right` | `radial-gradient(circle at 82% 4%, rgba(226,241,255,0.95), transparent 32%)` | 顶部右侧蓝色光 |
| `--tm-page-glow-middle` | `radial-gradient(circle at 50% 58%, rgba(244,240,255,0.68), transparent 38%)` | 记录页中部紫色光 |

推荐 CSS（层叠顺序固定）：

```css
.teacher-mobile-page {
  background:
    var(--tm-page-glow-left),
    var(--tm-page-glow-right),
    var(--tm-page-background);
}

.teacher-record-page {
  background:
    var(--tm-page-glow-left),
    var(--tm-page-glow-right),
    var(--tm-page-glow-middle),
    var(--tm-page-background);
}
```

### 4.2 卡片

| 组件 Token | 值 | 使用场景 |
|---|---|---|
| `--tm-card-bg` | `var(--tm-bg-card)` | 普通内容卡片 |
| `--tm-card-bg-soft` | `rgba(255,255,255,0.80)` | 轻玻璃卡片 |
| `--tm-card-border` | `var(--tm-border-subtle)` | 普通卡片边框 |
| `--tm-card-ring` | `rgba(226,232,240,0.70)` | 高级卡片弱描边 |
| `--tm-card-shadow` | `0 14px 38px -28px rgba(15,23,42,0.38)` | 普通移动端卡片阴影 |
| `--tm-card-shadow-raised` | `0 24px 70px -38px rgba(14,116,144,0.50)` | 个人中心 Hero、强视觉卡片 |

### 4.3 按钮

| 组件 Token | 背景 | 文字 | 阴影 |
|---|---|---|---|
| `--tm-button-primary-*` | `linear-gradient(135deg,var(--tm-color-primary),var(--tm-color-secondary))` | `var(--tm-text-inverse)` | `0 14px 28px -18px rgba(37,99,235,0.80)` |
| `--tm-button-class-*` | `var(--tm-emerald-600)` | `var(--tm-text-inverse)` | `0 14px 28px -18px rgba(5,150,105,0.90)` |
| `--tm-button-secondary-*` | `var(--tm-slate-100)` | `var(--tm-slate-600)` | `none` |
| `--tm-button-danger-*` | `var(--tm-danger-bg)` | `var(--tm-rose-500)` | `none` |
| `--tm-button-disabled-*` | `var(--tm-slate-200)` | `var(--tm-slate-400)` | `none` |

使用规则：

- 主操作默认使用 `primary`，报表筛选、班级覆盖类页面可使用 `class`。
- 不要在同一页面同时出现多个高饱和主按钮。
- 危险操作必须使用浅底红字，不直接使用大面积纯红按钮，除非是最终确认弹窗。

### 4.4 底部悬浮导航

| 组件 Token | 值 | 使用场景 |
|---|---|---|
| `--tm-tabbar-bg` | `rgba(255,255,255,0.62)` | 教师端悬浮底栏 |
| `--tm-tabbar-highlight` | `linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0.12))` | 底栏玻璃高光 |
| `--tm-tabbar-shadow` | `0 10px 28px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.72)` | 底栏阴影 |
| `--tm-tabbar-item-active` | `var(--tm-color-primary)` | 选中图标与文字 |
| `--tm-tabbar-item-default` | `var(--tm-slate-400)` | 未选中图标与文字 |
| `--tm-tabbar-indicator-bg` | `rgba(255,255,255,0.52)` | 液态滑块背景 |
| `--tm-tabbar-indicator-border` | `rgba(255,255,255,0.74)` | 液态滑块边框 |

### 4.5 表单输入

| 组件 Token | 值 | 使用场景 |
|---|---|---|
| `--tm-input-bg` | `var(--tm-slate-50)` | 默认输入框背景 |
| `--tm-input-bg-focus` | `var(--tm-white)` | 聚焦背景 |
| `--tm-input-border` | `var(--tm-border-subtle)` | 默认边框 |
| `--tm-input-border-focus` | `var(--tm-color-primary)` | 聚焦边框 |
| `--tm-input-text` | `var(--tm-text-primary)` | 输入内容 |
| `--tm-input-placeholder` | `var(--tm-text-placeholder)` | 占位提示 |
| `--tm-input-error-border` | `var(--tm-rose-500)` | 错误边框 |

### 4.6 标签与状态徽章

| Tone | 背景 | 文字 | 边框 | 使用场景 |
|---|---|---|---|---|
| `brand` | `#EEF2FF` | `var(--tm-indigo-500)` | `#E0E7FF` | 默认品牌标签 |
| `blue` | `#EFF6FF` | `var(--tm-blue-600)` | `#DBEAFE` | 数据、智育、班级信息 |
| `cyan` | `#ECFEFF` | `var(--tm-cyan-600)` | `#CFFAFE` | AI、智能分析 |
| `emerald` | `#ECFDF5` | `var(--tm-emerald-600)` | `#D1FAE5` | 成功、班级、体育 |
| `amber` | `#FFFBEB` | `var(--tm-amber-500)` | `#FEF3C7` | 提醒、德育 |
| `rose` | `#FFF1F2` | `var(--tm-rose-500)` | `#FFE4E6` | 错误、负反馈 |
| `neutral` | `var(--tm-slate-50)` | `var(--tm-slate-600)` | `var(--tm-slate-100)` | 默认弱标签 |

### 4.7 教师记录 AI 解读卡

| 组件 Token | 值 | 使用场景 |
|---|---|---|
| `--tm-record-student-primary` | `#12B8CB` | 记录学生模式主色、AI 正向边框 |
| `--tm-record-student-secondary` | `#6577F5` | 记录学生模式渐变终点 |
| `--tm-record-class-primary` | `#7C3AED` | 记录班级模式主色 |
| `--tm-record-class-secondary` | `#C026D3` | 记录班级模式渐变终点 |
| `--tm-record-positive-bg` | `rgba(236,253,245,0.82)` | 正向总分摘要背景 |
| `--tm-record-positive-border` | `rgba(20,184,166,0.30)` | 正向 AI 解读边框和总分边框 |
| `--tm-record-positive-text` | `#0F766E` | 正向分值文字 |
| `--tm-record-negative-bg` | `rgba(255,241,244,0.84)` | 扣分总分摘要背景 |
| `--tm-record-negative-border` | `rgba(224,82,104,0.30)` | 扣分 AI 解读边框和总分边框 |
| `--tm-record-negative-text` | `#E05268` | 扣分分值文字 |

使用规则：

- AI 解读卡只在教师记录流中使用，不复制到班级列表、我的页面、报表页等普通卡片。
- 整块 AI 解读卡可点击编辑时，字段内不放编辑图标。
- 总分使用标题右侧摘要块，不使用圆形装饰章，不使用字段胶囊样式。
- 指标行固定为“名称左对齐、分值右对齐”，支持多指标。
- 记录学生和记录班级是模式色，正向和扣分是语义色，两者不得混用。
- 底部导航使用固定干净青蓝 `#1E9AAA`，不跟随记录模式色切换。

---

## 5. CSS 变量建议

后续可把以下内容沉淀到 `mobile-app/index.css` 或独立 `mobile-app/styles/teacherMobileTokens.css`：

```css
:root {
  /* Primitive */
  --tm-indigo-500: #6366F1;
  --tm-indigo-600: #4F46E5;
  --tm-blue-500: #3B82F6;
  --tm-blue-600: #2563EB;
  --tm-cyan-500: #06B6D4;
  --tm-cyan-600: #0891B2;
  --tm-violet-500: #8B5CF6;
  --tm-violet-400: #A78BFA;
  --tm-pink-500: #EC4899;
  --tm-emerald-500: #10B981;
  --tm-emerald-600: #059669;
  --tm-teal-600: #0F766E;
  --tm-amber-500: #F59E0B;
  --tm-orange-600: #EA580C;
  --tm-rose-500: #F43F5E;
  --tm-lime-500: #84CC16;
  --tm-white: #FFFFFF;
  --tm-slate-50: #F8FAFC;
  --tm-slate-100: #F1F5F9;
  --tm-slate-200: #E2E8F0;
  --tm-slate-300: #CBD5E1;
  --tm-slate-400: #94A3B8;
  --tm-slate-500: #64748B;
  --tm-slate-600: #475569;
  --tm-slate-700: #334155;
  --tm-slate-900: #0F172A;
  --tm-slate-950: #020617;

  /* Semantic */
  --tm-color-primary: var(--tm-indigo-500);
  --tm-color-primary-pressed: var(--tm-indigo-600);
  --tm-color-secondary: var(--tm-cyan-500);
  --tm-color-accent: var(--tm-pink-500);
  --tm-color-class: var(--tm-emerald-500);
  --tm-color-data: var(--tm-blue-500);
  --tm-text-primary: var(--tm-slate-950);
  --tm-text-secondary: var(--tm-slate-700);
  --tm-text-body: var(--tm-slate-600);
  --tm-text-muted: var(--tm-slate-500);
  --tm-text-placeholder: var(--tm-slate-400);
  --tm-text-disabled: var(--tm-slate-300);
  --tm-text-inverse: var(--tm-white);
  --tm-bg-page: #F8FBFF;
  --tm-bg-page-gradient: linear-gradient(180deg, #F9FBFF 0%, #FFFFFF 72%);
  --tm-bg-card: var(--tm-white);
  --tm-bg-card-subtle: var(--tm-slate-50);
  --tm-bg-control: var(--tm-slate-100);
  --tm-border-subtle: var(--tm-slate-100);
  --tm-border-default: var(--tm-slate-200);
  --tm-border-focus: var(--tm-color-primary);

  /* Component */
  --tm-card-shadow: 0 14px 38px -28px rgba(15,23,42,0.38);
  --tm-card-shadow-raised: 0 24px 70px -38px rgba(14,116,144,0.50);
  --tm-tabbar-bg: rgba(255,255,255,0.62);
  --tm-tabbar-shadow: 0 10px 28px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.72);
  --tm-tabbar-indicator-bg: rgba(255,255,255,0.52);
  --tm-tabbar-indicator-border: rgba(255,255,255,0.74);
  --tm-mask-bg: rgba(15,23,42,0.35);
}
```

---

## 6. Tailwind 使用映射

当前项目大量使用 Tailwind CSS（通过类名直接写样式的工具库），短期可按以下规则映射：

| 语义 | Tailwind 推荐类 | Token |
|---|---|---|
| 页面背景 | `teacher-mobile-phone-gradient` | `--tm-page-background` |
| 主文字 | `text-slate-950` / `text-slate-900` | `--tm-text-primary` |
| 次文字 | `text-slate-600` / `text-slate-500` | `--tm-text-body` / `--tm-text-muted` |
| 白卡 | `bg-white border border-slate-100 shadow-sm` | `--tm-card-*` |
| 弱容器 | `bg-slate-50` / `bg-slate-100` | `--tm-bg-card-subtle` / `--tm-bg-control` |
| 主色入口 | `bg-indigo-600 text-white` | `--tm-color-primary` |
| 班级/报表入口 | `bg-emerald-600 text-white` | `--tm-color-class` |
| 数据强调 | `text-blue-600 bg-blue-50` | `--tm-color-data` |
| AI 强调 | `text-cyan-600 bg-cyan-50` | `--tm-color-secondary` |
| 负向提示 | `text-rose-600 bg-rose-50` | `--tm-danger-*` |

---

## 7. 使用边界与禁止项

### 7.1 推荐

- 页面背景优先使用浅蓝白渐变和弥散光，不用大面积高饱和色。
- 内容承载优先使用白卡、浅灰分组、轻阴影。
- 主操作使用靛蓝/青色体系，班级数据类页面可用绿色体系。
- 图表、报表页面可以使用绿色作为局部主色，但不要替代全局主品牌色。
- 状态标签必须成套使用背景、文字、边框，不单独换文字颜色。

### 7.2 禁止

- 禁止在新组件中继续散落一次性十六进制色值，如 `#3B82F6`，应先引用 token。
- 禁止把家长端黄色 `#FFC210` 作为教师端主操作色。
- 禁止把 PC 后台蓝色 `#165DFF` 直接迁移到教师手机端，除非是 PC 后台页面。
- 禁止同一页面同时大面积使用靛蓝、绿色、粉色三个强主色。
- 禁止普通卡片使用厚重彩色发光阴影。
- 禁止用低对比灰字承载关键数据、学生姓名、班级名称、提交按钮。

---

## 8. 与现有文件的关系

本文件基于以下现有实现提炼：

- `design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md`：教师手机端新规范，包含字号、圆角、阴影、组件分层要求。
- `mobile-app/index.css`：教师端 AI 主色、学生/班级模式色、手机端柔和背景、毛玻璃底栏基础色。
- `mobile-app/styles/phoneTokens.ts`：已有文字、圆角、阴影、间距、tone 类型。
- `mobile-app/styles/navigation.css`：教师端底部悬浮毛玻璃导航颜色、阴影和透明度。
- `mobile-app/views/DashboardView.tsx`：五育维度颜色、雷达图和核心数据色。
- `mobile-app/views/LeaderReportView.tsx`：学校数据报表页绿色体系与图表颜色。
- `mobile-app/views/MeView.tsx`：个人中心 Hero 卡片、轻玻璃和蓝色强调按钮。

后续如果要落地到代码，建议顺序：

1. 新增 `mobile-app/styles/teacherMobileTokens.css`，先只放颜色变量。
2. 将 `mobile-app/index.css` 中已有 `--ai-*`、`--student-*`、`--class-*` 渐进映射到 `--tm-*`。
3. 优先改通用组件：底部导航、MobileCard、MenuItem、IconBadge、输入框。
4. 最后再清理业务页面里的硬编码颜色。
