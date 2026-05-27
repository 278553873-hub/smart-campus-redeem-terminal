# Teacher Liquid DOM Bottom Nav Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将教师手机端底部导航升级为基于 `AndrewPrifer/liquid-dom` 的 Liquid Glass 增强效果，并保留 CSS 降级。

**Architecture:** `TeacherFluidGlassNav` 只负责底部导航装饰玻璃层，普通 HTML 按钮仍在 `mobile-app/App.tsx` 中负责点击、图标、文字和路由。组件先检测 WebGPU；支持时渲染 `@liquid-dom/react` 的 `LiquidCanvas`，不支持或运行报错时回退到原 CSS 滑块。

**Tech Stack:** React 19、Vite、TypeScript、`@liquid-dom/react@0.1.0`、CSS fallback。

---

### Task 1: 依赖与接入守护

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Test: `mobile-app/components/TeacherFluidGlassNav.liquid-dom.test.mjs`

- [ ] **Step 1: Write failing test**

测试要求 `TeacherFluidGlassNav` 明确导入 `@liquid-dom/react`，并且 `package.json` 声明 `@liquid-dom/react` 依赖。

- [ ] **Step 2: Run test to verify it fails**

Run: `node mobile-app/components/TeacherFluidGlassNav.liquid-dom.test.mjs`
Expected: FAIL，因为当前没有依赖且组件没有导入。

- [ ] **Step 3: Install dependency**

Run: `npm install @liquid-dom/react@0.1.0`
Expected: `package.json` 与 `package-lock.json` 更新，并带入 `@liquid-dom/core`、`@liquid-dom/layout`。

### Task 2: Liquid DOM 增强组件

**Files:**
- Modify: `mobile-app/components/TeacherFluidGlassNav.tsx`
- Modify: `mobile-app/App.tsx`
- Modify: `mobile-app/styles/navigation.css`

- [ ] **Step 1: Implement guarded LiquidCanvas**

在 `TeacherFluidGlassNav` 中检测 `navigator.gpu`，支持时用 `LiquidCanvas` + `GlassContainer` + `Glass` 渲染底栏背景与选中态玻璃滑块；失败时使用原 CSS fallback。

- [ ] **Step 2: Pass measured width**

在 `mobile-app/App.tsx` 将已有 `tabbarWidth` 传入 `TeacherFluidGlassNav`，保证 liquid-dom 的 Frame 尺寸与真实底栏一致。

- [ ] **Step 3: Refine CSS fallback**

保留 `.teacher-fluid-glass-canvas` 与原滑块动画，新增 liquid-dom canvas 层级样式，确保按钮仍在最高层。

### Task 3: 验证

**Files:**
- Test: `mobile-app/components/TeacherFluidGlassNav.liquid-dom.test.mjs`

- [ ] **Step 1: Run targeted test**

Run: `node mobile-app/components/TeacherFluidGlassNav.liquid-dom.test.mjs`
Expected: PASS。

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: PASS，无 TypeScript 或 Vite 构建错误。
