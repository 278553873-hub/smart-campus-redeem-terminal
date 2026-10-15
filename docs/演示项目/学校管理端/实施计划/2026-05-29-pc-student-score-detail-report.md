# PC 学生得分明细表 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 PC 学校管理后台「报表中心」新增「学生得分明细表」，支持当前学期默认展示、学生姓名搜索、学年学期/年级/班级筛选，并提供导出 Excel 按钮。

**Architecture:** 沿用 `components/TeacherDashboard.tsx` 现有 PC 后台单文件模式和考试数据列表页模式。新增独立 demo 数据结构、筛选状态、表格列和页面渲染，不侵入考试数据、作业数据等模块。

**Tech Stack:** React 19、TypeScript、Arco Design React、Tailwind CSS utility classes、现有 `pc-filter-bar` 局部样式。

---

### Task 1: Source-Level Regression Test

**Files:**
- Create: `components/TeacherDashboard.student-score-detail-report.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve('components/TeacherDashboard.tsx'), 'utf8');

const requireText = (text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

const forbidText = (text, message) => {
  if (source.includes(text)) throw new Error(message);
};

requireText("children: ['学校驾驶舱', '评价记录明细表', '学生得分明细表', '学期报告']", '报表中心菜单应新增学生得分明细表，并放在评价记录明细表后。');
requireText('interface StudentScoreDetailRow', '学生得分明细表应有独立数据结构，避免复用考试或作业数据。');
requireText("const currentStudentScoreTerm = currentGradeTerm", '学生得分明细表默认学期应来源于当前学期值，后续便于替换为后端返回值。');
requireText("const [studentScoreTermFilter, setStudentScoreTermFilter] = useState(currentStudentScoreTerm)", '学生得分明细表学期筛选默认应为当前学期。');
requireText("activeMenu === '学生得分明细表'", '应渲染学生得分明细表页面。');
requireText('placeholder="搜索学生姓名"', '筛选区应支持按学生姓名搜索。');
requireText('aria-label="学生姓名搜索"', '学生姓名搜索输入框应有无障碍标签。');
requireText('placeholder="全部年级"', '筛选区应支持年级筛选。');
requireText('aria-label="学生得分班级筛选"', '筛选区应支持班级筛选。');
requireText('导出 Excel', '页面应提供导出 Excel 按钮。');
requireText('studentScoreDetailColumns', '学生得分明细表应定义独立表格列。');
requireText("title: '总净得分'", '表格应展示总净得分列。');
for (const dimension of ['德', '智', '体', '美', '劳']) {
  requireText(`title: '${dimension}'`, `表格应展示${dimension}一级指标净得分列。`);
}
requireText('暂无符合条件的学生得分记录', '表格空状态应明确。');
forbidText('导入 Excel', '本页按钮应为导出 Excel，不应出现导入 Excel。');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node components/TeacherDashboard.student-score-detail-report.test.mjs`
Expected: FAIL because the menu/page/data structure does not exist yet.

### Task 2: Implement Report Page

**Files:**
- Modify: `components/TeacherDashboard.tsx`

- [ ] **Step 1: Add menu, types, mock data, filters, columns, and render block**
- [ ] **Step 2: Keep UI compliant with `PC_UI_GUIDELINES.md`: Arco controls, `pc-filter-bar`, one primary query action, icon + text export button, Arco Table.**
- [ ] **Step 3: Run source-level test to verify it passes**

Run: `node components/TeacherDashboard.student-score-detail-report.test.mjs`
Expected: PASS with no output.

### Task 3: Build Verification

**Files:**
- Verify: full project build

- [ ] **Step 1: Run build**

Run: `npm run build`
Expected: TypeScript and Vite build complete with exit code 0.
