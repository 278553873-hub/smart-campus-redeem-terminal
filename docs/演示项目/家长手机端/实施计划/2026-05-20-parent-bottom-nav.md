# Parent Bottom Nav Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将录屏中的丝滑白色悬浮胶囊底部菜单复刻到家长手机端，同时保留家长端固定三入口。

**Architecture:** 在 `components/ParentApp.tsx` 中把底部导航从页面尾部内联 JSX 收敛为 `ParentBottomNav` 语义组件。导航数据仍来自 `tabItems`，业务屏幕状态不变，只替换底部导航的视觉结构与动效。

**Tech Stack:** React 19、TypeScript、Tailwind CSS、lucide-react。

---

### Task 1: 底部导航结构保护测试

**Files:**
- Modify: `components/ParentApp.campus-growth.test.mjs`
- Modify: `components/ParentApp.tsx`

- [ ] **Step 1: Write the failing test**

在 `components/ParentApp.campus-growth.test.mjs` 底部菜单断言附近增加以下断言：

```js
requireText(parentSource, 'const ParentBottomNav', '家长端底部菜单应封装为 ParentBottomNav，避免样式散落在页面尾部。');
requireText(parentSource, 'parent-bottom-nav-shell', '家长端底部菜单应使用白色悬浮胶囊容器。');
requireText(parentSource, 'parent-bottom-nav-indicator', '家长端底部菜单应使用滑块式选中态。');
requireText(parentSource, 'translateX(`${activeIndex * 100}%`)', '家长端底部菜单选中滑块应通过 transform 平移，保证动效流畅。');
requireText(parentSource, 'rounded-full bg-white/95', '家长端底部菜单应复刻录屏中的大圆角白色胶囊。');
forbidText(parentSource, "bg-[#FFC210]/30", '家长端底部菜单选中态不应继续使用黄色块，应改为录屏式浅灰滑块。');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node components/ParentApp.campus-growth.test.mjs`
Expected: FAIL，提示缺少 `ParentBottomNav` 和滑块相关结构。

- [ ] **Step 3: Implement minimal code**

在 `components/ParentApp.tsx` 中新增 `ParentBottomNav`，保留 `tabItems` 三入口与 `reportDetail` 映射到报告选中态。使用绝对定位滑块、`transform` 平移、白色胶囊容器和深灰选中图标文字。

- [ ] **Step 4: Run tests and build**

Run: `node components/ParentApp.campus-growth.test.mjs`
Expected: PASS。

Run: `npm run build`
Expected: exit 0。
