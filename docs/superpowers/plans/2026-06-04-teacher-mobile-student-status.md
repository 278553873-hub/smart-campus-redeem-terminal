# Teacher Mobile Student Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 教师手机端默认只展示在校学生，并把在校/离校改为可恢复、需确认的高风险状态操作。

**Architecture:** 在 `App.tsx` 统一生成“合并覆盖后的班级学生列表”，避免页面各自读取 mock 导致状态不一致。`ClassDetailView.tsx` 负责默认过滤在校学生、展示离校学生管理抽屉并触发恢复；`StudentBasicEditView.tsx` 负责把学籍状态从普通字段中拆出并做离校确认。

**Tech Stack:** React 19、TypeScript、Vite、现有文件级 Node 断言测试。

---

### Task 1: 先写学生状态流测试

**Files:**
- Create: `mobile-app/views/StudentStatusFlow.test.mjs`
- Modify later: `mobile-app/App.tsx`
- Modify later: `mobile-app/views/ClassDetailView.tsx`
- Modify later: `mobile-app/views/StudentBasicEditView.tsx`

- [ ] **Step 1: Write the failing test**

```js
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const appSource = read('../App.tsx');
const classDetailSource = read('./ClassDetailView.tsx');
const basicEditSource = read('./StudentBasicEditView.tsx');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(appSource, 'getMergedStudentsForClass', 'App 应统一生成合并覆盖后的班级学生列表。');
requireText(appSource, 'handleRestoreStudentStatus', 'App 应提供离校学生恢复为在校的处理函数。');
requireText(appSource, 'onRestoreStudentStatus={handleRestoreStudentStatus}', 'App 应把恢复学生状态回调传给班级学生页。');
requireText(classDetailSource, "students.filter(student => (student.status ?? 'active') === 'active')", '班级学生页默认只展示在校学生。');
requireText(classDetailSource, 'leftStudents', '班级学生页应独立维护离校学生集合。');
requireText(classDetailSource, '离校学生', '班级学生页应提供离校学生入口。');
requireText(classDetailSource, '恢复在校', '离校学生列表应提供恢复在校操作。');
requireText(classDetailSource, 'onRestoreStudentStatus', '班级学生页应通过回调恢复学生状态。');
requireText(basicEditSource, 'showStatusConfirm', '基础信息编辑页设置离校前应有确认状态。');
requireText(basicEditSource, '学籍状态', '基础信息编辑页应把学生状态拆成独立学籍状态区域。');
requireText(basicEditSource, '设为离校', '在校学生应通过高风险按钮设为离校。');
requireText(basicEditSource, '离校后将不再出现在老师默认学生名单中', '设为离校前应说明影响。');
requireText(basicEditSource, '恢复在校', '离校学生编辑页应支持恢复在校。');

console.log('student status flow assertions passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node mobile-app/views/StudentStatusFlow.test.mjs`
Expected: FAIL because status flow strings/functions are missing.

### Task 2: 实现合并数据与默认在校列表

**Files:**
- Modify: `mobile-app/App.tsx`
- Modify: `mobile-app/views/ClassDetailView.tsx`

- [ ] **Step 1: Implement merged class students in App**

Use `getMergedStudentsForClass(classId)` to apply `studentOverrides` to every generated student, then pass it to all class-related child views.

- [ ] **Step 2: Implement active/left filtering in ClassDetailView**

Add `activeStudents` and `leftStudents`; default grid/search/selection/grouping use `activeStudents`; add a `离校学生` button and bottom sheet that lists left students and calls `onRestoreStudentStatus(student)`.

- [ ] **Step 3: Run status flow test**

Run: `node mobile-app/views/StudentStatusFlow.test.mjs`
Expected: PASS.

### Task 3: 拆分学籍状态风险区

**Files:**
- Modify: `mobile-app/views/StudentBasicEditView.tsx`

- [ ] **Step 1: Move student status out of base card**

Remove the inline two-option “学生状态” field from the ordinary base information card.

- [ ] **Step 2: Add dedicated status card**

Add independent `学籍状态` card. “在校” state exposes `设为离校` and opens confirm sheet; “离校” state exposes `恢复在校`.

- [ ] **Step 3: Run tests**

Run: `node mobile-app/views/StudentStatusFlow.test.mjs && node mobile-app/views/StudentDetailOptimization.test.mjs`
Expected: PASS.

### Task 4: 验证构建

**Files:**
- No source changes unless build finds a TypeScript issue.

- [ ] **Step 1: Run build**

Run: `npm run build`
Expected: PASS.
