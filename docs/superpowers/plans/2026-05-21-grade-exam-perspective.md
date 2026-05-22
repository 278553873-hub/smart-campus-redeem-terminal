# 成绩管理考试视角 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 PC 后台成绩管理新增“班级视角 / 考试视角”，让教务处按考试聚合查看各年级、各班级成绩录入情况。

**Architecture:** 保持现有 `TeacherDashboard.tsx` 单文件 demo 结构，不引入新依赖。班级视角复用当前列表与编辑逻辑；考试视角基于现有 `GradeExamRow` 按 `term + type` 聚合，详情页按“年级区块 -> 班级 Sheet -> 学生成绩表”展示，不输出跨年级整体完成结论。

**Tech Stack:** React 19、TypeScript、Tailwind CSS、Vite、Node 静态断言测试。

---

### Task 1: 静态回归测试

**Files:**
- Create: `components/TeacherDashboard.grade-exam-perspective.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText("gradeListViewMode", '成绩管理应新增列表视角状态。');
requireText('班级视角', '成绩管理应提供班级视角标签。');
requireText('考试视角', '成绩管理应提供考试视角标签。');
requireText('GradeExamAggregateRow', '考试视角应定义聚合行类型。');
requireText('handleViewGradeExamAggregate', '考试视角应有独立的聚合查看入口。');
requireText("gradePageMode === 'examView'", '考试聚合详情应使用独立只读页面模式。');
requireText('一个年级一个表格', '考试聚合详情应说明按年级分组展示。');
requireText('请核对是否与本次考试应考科目一致', '考试聚合详情应提示核对应考科目，避免错误完成结论。');

if (source.includes('整体录入完成进度')) {
  throw new Error('考试视角不应展示跨年级整体录入完成进度。');
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node components/TeacherDashboard.grade-exam-perspective.test.mjs`
Expected: FAIL because implementation is missing.

### Task 2: 实现考试视角列表与详情

**Files:**
- Modify: `components/TeacherDashboard.tsx`

- [ ] **Step 1: Add types and state**
- [ ] **Step 2: Build aggregate rows by `term + type`**
- [ ] **Step 3: Add list segmented control**
- [ ] **Step 4: Render exam perspective table with only 学年-学期、考试类型、操作**
- [ ] **Step 5: Render exam aggregate detail as grade sections and class sheets**
- [ ] **Step 6: Keep aggregate detail read-only and avoid overall completion claims**

### Task 3: 验证

**Files:**
- Test: `components/TeacherDashboard.grade-exam-perspective.test.mjs`

- [ ] **Step 1: Run static test**

Run: `node components/TeacherDashboard.grade-exam-perspective.test.mjs`
Expected: PASS.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Vite build exits 0.
