# 成绩管理页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 PC 学校管理后台「数据中心」新增静态 demo 页面「成绩管理」。

**Architecture:** 沿用现有 `TeacherDashboard` 单文件页面模式，在菜单配置、模拟数据、筛选状态和内容渲染区内增加独立的成绩管理分支。页面不接后端接口，新建、查看、编辑均为占位交互。

**Tech Stack:** React 19、TypeScript、Tailwind CSS、lucide-react、Vite。

---

### Task 1: 新增成绩管理静态列表页

**Files:**
- Modify: `components/TeacherDashboard.tsx`

- [ ] Step 1: 在数据中心菜单增加「成绩管理」。
- [ ] Step 2: 增加成绩管理模拟数据与筛选状态。
- [ ] Step 3: 在主内容区增加「成绩管理」分支，包含筛选区、表格、查看/编辑/新建占位按钮。
- [ ] Step 4: 运行 `npm run build`，期望构建通过。
- [ ] Step 5: 记录沟通日志到 `logs/agent_detail`，日志不提交。
