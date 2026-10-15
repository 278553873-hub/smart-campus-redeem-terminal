# PC Term Report Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 demo-PC 端基础信息配置中新增“期末报告配置”，支持配置报告板块展示状态与拖拽排序。

**Architecture:** 沿用 `components/TeacherDashboard.tsx` 单文件后台 Demo 结构，新增独立数据类型、默认配置、状态和处理函数，并在基础信息配置菜单下渲染一个主卡片配置页。拖拽排序使用原生 HTML Drag and Drop（浏览器内置拖拽能力），避免引入新依赖。

**Tech Stack:** React、TypeScript、Tailwind CSS、Arco Design React、Node 测试脚本。

---

### Task 1: 测试期末报告配置源码结构

**Files:**
- Create: `components/TeacherDashboard.term-report-config.test.mjs`

- [ ] **Step 1: 写失败测试**

```js
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText("'期末报告配置'", '基础信息配置菜单应新增期末报告配置。');
requireText('interface TermReportModuleConfig', '期末报告配置应有独立数据结构。');
requireText('defaultTermReportModules', '应定义期末报告默认板块。');
for (const name of ['五育雷达图', '学科成绩分布', '高光时刻', '总体评价', '成长建议', '亲子活动指南']) {
  requireText(`name: '${name}'`, `默认板块应包含${name}。`);
}
requireText("id: 'highlightMoments', name: '高光时刻', enabled: false", '高光时刻默认应未选中。');
for (const id of ['fiveEducationRadar', 'subjectGradeDistribution', 'overallEvaluation', 'growthSuggestions', 'parentChildActivityGuide']) {
  requireText(`id: '${id}'`, `默认配置应包含${id}。`);
}
requireText('setDraggedTermReportModuleId', '期末报告配置应支持拖拽排序状态。');
requireText('handleDropTermReportModule', '期末报告配置应支持拖拽落位。');
requireText('handleToggleTermReportModule', '期末报告配置应支持展示开关。');
requireText("activeMenu === '期末报告配置'", '应渲染期末报告配置页面。');
requireText('拖拽排序', '页面应提示可拖拽排序。');
requireText('保存配置', '页面应提供保存配置按钮。');
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node components/TeacherDashboard.term-report-config.test.mjs`
Expected: FAIL，提示缺少“期末报告配置”。

### Task 2: 实现期末报告配置页面

**Files:**
- Modify: `components/TeacherDashboard.tsx`

- [ ] **Step 1: 新增数据结构和默认配置**

在考试等级结构附近新增 `TermReportModuleConfig` 和 `defaultTermReportModules`，确保高光时刻默认 `enabled: false`。

- [ ] **Step 2: 新增菜单入口和状态函数**

在“基础信息配置”菜单 children 中加入“期末报告配置”；新增 `termReportModules`、`draggedTermReportModuleId`、开关处理和拖拽落位处理。

- [ ] **Step 3: 新增配置页面**

在考试等级管理页面前后新增 `activeMenu === '期末报告配置'` 分支，使用 PC 后台白底主卡片、卡片列表、开关按钮、拖拽排序和保存按钮。

### Task 3: 验证

**Files:**
- Test: `components/TeacherDashboard.term-report-config.test.mjs`

- [ ] **Step 1: 运行新增测试**

Run: `node components/TeacherDashboard.term-report-config.test.mjs`
Expected: PASS，无输出。

- [ ] **Step 2: 运行相关测试与构建**

Run: `node components/TeacherDashboard.exam-level-management.test.mjs && node components/TeacherDashboard.device-config-pc-guidelines.test.mjs && npm run build`
Expected: PASS，构建成功。
