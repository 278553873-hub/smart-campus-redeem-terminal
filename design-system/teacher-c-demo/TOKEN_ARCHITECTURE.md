# Teacher C Demo Design Token Architecture

> 这是 `demo - C端改造 - 教师端` 的 token 使用说明。`tokens.json` 是唯一源文件，`tokens.css` 由脚本生成，不手工维护。

## 1. 文件职责

| 文件 | 作用 |
|---|---|
| `tokens.json` | Design Token 源文件，按 primitive / semantic / component 三层组织。 |
| `tokens.css` | CSS 变量输出文件，由 `tokens.json` 生成。 |
| `scripts/build-tokens.mjs` | token 编译脚本。 |
| `design-system-preview.html` | token 可视化看板与组件示例。 |
| `DESIGN_SYSTEM.md` | 面向产品与设计评审的规则说明。 |

## 2. 三层结构

### Primitive

原始值，不直接表达业务含义。

示例：

```css
--tc-aqua-500: #58c3cf;
--tc-space-5: 20px;
--tc-radius-lg: 20px;
```

使用规则：

- 只在 token 定义、色板展示、极少数视觉资产中直接使用。
- 业务页面和组件不应直接引用 primitive 色值。

### Semantic

表达语义用途，是大多数组件的默认引用层。

示例：

```css
--tc-color-primary: #58c3cf;
--tc-bg-card: rgba(255, 255, 255, 0.9);
--tc-text-body: #405064;
```

使用规则：

- 通用布局、普通文本、普通卡片优先引用 semantic token。
- 换肤、夜间模式主要通过 semantic 层稳定语义。

### Component

表达具体组件的使用结果。

示例：

```css
--tc-button-primary-bg: linear-gradient(135deg, #58c3cf, #7f9eed);
--tc-card-ai-bg: linear-gradient(...);
--tc-record-score-positive: #3f7f68;
```

使用规则：

- 业务组件必须优先引用 component token。
- 如果一个值只服务某类组件，应进入 component 层，而不是散落在代码里。

## 3. 命名规则

```text
--tc-{layer-or-domain}-{role}-{state?}
```

常见前缀：

| 前缀 | 含义 |
|---|---|
| `--tc-aqua-*` | Primitive 晨雾青色阶 |
| `--tc-color-*` | Semantic 品牌/状态色 |
| `--tc-bg-*` | Semantic 背景 |
| `--tc-text-*` | Semantic 文本 |
| `--tc-border-*` | Semantic 描边 |
| `--tc-button-*` | Component 按钮 |
| `--tc-card-*` | Component 卡片 |
| `--tc-record-*` | Component 记录业务 |
| `--tc-voice-*` | Component 语音状态 |

## 4. 编译方式

```bash
node design-system/teacher-c-demo/scripts/build-tokens.mjs
```

输出：

```text
design-system/teacher-c-demo/tokens.css
```

## 5. 夜间模式

`tokens.json` 中支持 `dark` 字段：

```json
{
  "value": "#58c3cf",
  "dark": "#72d7e2"
}
```

编译后生成：

```css
:root {
  --tc-aqua-500: #58c3cf;
}

[data-theme="dark"] {
  --tc-aqua-500: #72d7e2;
}
```

## 6. 落地约束

- 不在业务代码里写新的 hex 色值。
- 不在业务组件里直接使用 `rgba(...)` 做临时状态色。
- 新组件先判断是否已有 component token；没有再补充 token。
- 禁止为了局部视觉效果绕过 token。
- 夜间模式不能靠组件局部覆盖，应通过 token 统一切换。
