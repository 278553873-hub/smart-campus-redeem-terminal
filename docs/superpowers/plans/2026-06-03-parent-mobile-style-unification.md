# 家长手机端样式统一 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变家长端真实功能、流程和业务数据的前提下，统一家长手机端视觉系统、组件边界和页面样式。

**Architecture:** 先建立家长端专属样式 token 和通用组件，再用这些组件替换 `components/ParentApp.tsx` 中的临时样式。业务状态、数据计算和页面流转继续留在 `ParentApp.tsx`，通用组件只接收展示数据和事件回调，不写业务逻辑。

**Tech Stack:** React 19、TypeScript、Tailwind CSS、Lucide React、Vite、本项目现有 Node 文本断言测试。

---

## File Structure

**Create:**
- `components/parent-app/ParentStyleTokens.tsx`：导出家长端样式常量、渐变 icon tone、按钮 tone、圆角/阴影 class，集中收敛视觉规则。
- `components/parent-app/ParentUI.tsx`：导出家长端通用展示组件：页面壳、卡片、渐变图标、按钮、数据卡、动作卡、底部抽屉、头像。
- `components/ParentApp.style-unification.test.mjs`：新增样式统一与功能边界保护测试，避免再次新增真实方案外功能。

**Modify:**
- `components/ParentApp.tsx`：只替换样式和组件组合；保留 Screen 类型、state、计算函数、银行规则、报告数据结构和页面流转。
- `components/ParentApp.campus-growth.test.mjs`：删除或修正与新设计冲突的旧样式断言，保留真实功能断言。
- `mobile-app/styles/teacherMobileTokens.css`：只保留或新增兼容性 token；如果新组件不依赖旧 `parent-teacher-token-*`，逐步减少家长端对教师端 token 的样式依赖。
- `PARENT_APP_UI_GUIDELINES.md`：实施完成后补充本次已确认的家长端视觉规范。

**Do Not Modify:**
- `constants.tsx` 中银行配置逻辑，除非测试发现现有行为已坏。
- `docs/superpowers/specs/2026-06-03-parent-mobile-style-unification-design.md`，除非用户要求变更设计规格。
- 与 PC 后台、教师端无关的页面和样式。

---

### Task 1: 更新测试边界，先保护“功能不变”

**Files:**
- Create: `components/ParentApp.style-unification.test.mjs`
- Modify: `components/ParentApp.campus-growth.test.mjs`

- [x] **Step 1: 新增失败测试，禁止再引入真实方案外功能**

Create `components/ParentApp.style-unification.test.mjs` with this content:

```js
import { readFileSync } from 'node:fs';

const parentSource = readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const failures = [];

const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message ?? `缺少：${text}`);
};

const forbidText = (source, text, message) => {
  if (source.includes(text)) failures.push(message ?? `不应出现：${text}`);
};

for (const required of [
  "type Screen = 'binding' | 'growth' | 'reports' | 'reportDetail' | 'bank'",
  "const [screen, setScreen] = useState<Screen>('binding')",
  'shouldShowStudentBindFields',
  'canSubmitBinding',
  'submitBinding',
  'openBinding',
  'returnToChildSwitcher',
  'GrowthChildProfileCard',
  'GrowthSummaryCards',
  'activeChild.reports.map',
  'setActiveReportId(report.id); setScreen(\'reportDetail\')',
  'activeReport.summary',
  'activeReport.highlights.map',
  "type BankTab = 'deposit' | 'list'",
  'PARENT_BANK_TERMS.map',
  'setSelectedBankScheme(scheme); setShowDepositConfirm(true);',
  'CURRENT_DEPOSIT_PROJECTION_DAYS.map',
  'showDepositReview && selectedBankScheme',
  'withdrawTarget &&',
  'ChildSwitcherSheet',
  '新增绑定',
]) {
  requireText(parentSource, required, `家长端真实功能边界被破坏：${required}`);
}

for (const forbidden of [
  '高光时刻',
  '智能生成状态',
  '成长画像',
  'AI成长洞察',
  '收益预估入口',
  '查看成长报告',
]) {
  forbidText(parentSource, forbidden, `样式统一不得新增真实方案外入口或概念文案：${forbidden}`);
}

for (const forbiddenStyle of [
  'bg-slate-900 text-white',
  'bg-slate-950 text-white',
  'bg-[#FFC210] text-[#653C16]',
  'parent-teacher-token-primary-button',
]) {
  forbidText(parentSource, forbiddenStyle, `家长端新视觉不应继续使用旧冲突按钮/教师端 token：${forbiddenStyle}`);
}

for (const requiredStyle of [
  'ParentPageShell',
  'ParentCard',
  'ParentGradientIcon',
  'ParentChildAvatar',
  'ParentPrimaryButton',
  'ParentBottomSheet',
]) {
  requireText(parentSource, requiredStyle, `家长端应使用新的通用组件：${requiredStyle}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('parent style unification assertions passed');
```

- [x] **Step 2: 运行新增测试，确认当前会失败**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
```

Expected: FAIL，至少包含 `家长端应使用新的通用组件：ParentPageShell`，因为组件尚未创建和接入。

- [x] **Step 3: 修正旧测试中和新设计冲突的样式断言**

Modify `components/ParentApp.campus-growth.test.mjs`:

Replace assertions that require old visual decisions:

```js
requireText(parentSource, 'bg-[#FFC210]', '家长端主按钮应使用产品指定主色 #FFC210。');
requireText(parentSource, 'bg-[#FFC210] text-[#653C16]', '家长端主按钮应使用 #FFC210 背景和 #653C16 文字。');
requireText(parentSource, '#5886EF', '家长端辅助强调色应保留产品指定蓝色 #5886EF。');
requireText(parentSource, 'parent-teacher-token-primary-button', '绑定孩子页完成绑定按钮应使用教师端 token 主按钮类。');
requireText(parentSource, 'parent-teacher-token-input', '绑定孩子页输入框应使用教师端 token 输入框类。');
```

with assertions for the new design boundary:

```js
requireText(parentSource, 'ParentPrimaryButton', '家长端确认类按钮应使用新的 ParentPrimaryButton 组件。');
requireText(parentSource, 'ParentGradientIcon', '家长端功能图标应使用统一渐变 icon 组件。');
requireText(parentSource, 'ParentCard', '家长端卡片应使用统一 ParentCard 组件。');
requireText(parentSource, 'ParentPageShell', '家长端页面应使用统一 ParentPageShell 背景和滚动容器。');
forbidText(parentSource, 'bg-[#FFC210] text-[#653C16]', '家长端新视觉不应继续使用黄色主按钮。');
forbidText(parentSource, 'parent-teacher-token-primary-button', '家长端新视觉不应继续依赖教师端主按钮 token。');
```

Keep functional assertions such as `shouldShowStudentBindFields`, `activeChild.reports.map`, `PARENT_BANK_TERMS`, `CURRENT_DEPOSIT_PROJECTION_DAYS`, and `showDepositReview`.

- [x] **Step 4: 运行旧测试，确认旧测试现在只约束真实功能与新组件边界**

Run:

```bash
node components/ParentApp.campus-growth.test.mjs
```

Expected: FAIL is acceptable at this point only for missing new components or old code still using旧样式；不应出现因真实功能断言缺失导致的失败。

- [x] **Step 5: Commit tests**

Run:

```bash
git add components/ParentApp.style-unification.test.mjs components/ParentApp.campus-growth.test.mjs
git commit -m "更新家长端样式统一测试边界"
```

Expected: commit succeeds.

---

### Task 2: 建立家长端视觉 token

**Files:**
- Create: `components/parent-app/ParentStyleTokens.tsx`
- Test: `components/ParentApp.style-unification.test.mjs`

- [x] **Step 1: 写失败断言，要求 token 文件存在并包含核心 tone**

Append to `components/ParentApp.style-unification.test.mjs` after reading `parentSource`:

```js
const tokenSource = readFileSync(new URL('./parent-app/ParentStyleTokens.tsx', import.meta.url), 'utf8');
```

Append these assertions before the final `if (failures.length > 0)` block:

```js
for (const requiredToken of [
  'parentSurface.background',
  'parentSurface.card',
  'parentIconTone.blue',
  'parentIconTone.green',
  'parentIconTone.orange',
  'parentButtonTone.primary',
  'parentRadius.card',
  'parentShadow.card',
]) {
  requireText(tokenSource, requiredToken, `家长端 token 缺少：${requiredToken}`);
}
```

- [x] **Step 2: 运行测试，确认 token 文件缺失导致失败**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
```

Expected: FAIL with file read error for `ParentStyleTokens.tsx` or token missing.

- [x] **Step 3: 创建 token 文件**

Create `components/parent-app/ParentStyleTokens.tsx`:

```tsx
export const parentSurface = {
  background: 'bg-[linear-gradient(135deg,#fff6fb_0%,#f4fbff_44%,#f8fffb_100%)]',
  card: 'border border-white/90 bg-white/95',
  subtle: 'border border-slate-100 bg-slate-50/80',
};

export const parentText = {
  title: 'text-slate-950',
  body: 'text-slate-700',
  muted: 'text-slate-500',
  weak: 'text-slate-400',
  success: 'text-emerald-600',
  attention: 'text-orange-500',
};

export const parentIconTone = {
  blue: 'bg-gradient-to-br from-[#0DB4F1] to-[#22D3C5] text-white shadow-[0_12px_22px_-16px_rgba(13,180,241,0.7)]',
  green: 'bg-gradient-to-br from-[#18C978] to-[#82DF46] text-white shadow-[0_12px_22px_-16px_rgba(24,201,120,0.62)]',
  orange: 'bg-gradient-to-br from-[#FFB36C] to-[#FF7E6B] text-white shadow-[0_12px_22px_-16px_rgba(255,126,107,0.62)]',
  softBlue: 'bg-gradient-to-br from-[#8FD7FF] to-[#BCEFFF] text-white shadow-[0_12px_22px_-16px_rgba(13,180,241,0.42)]',
};

export const parentButtonTone = {
  primary: 'bg-gradient-to-br from-[#0DB4F1] to-[#18D0A8] text-white shadow-[0_18px_34px_-24px_rgba(17,184,240,0.68)]',
  secondary: 'border border-[#D8EEF0] bg-white text-emerald-700 shadow-none',
  neutral: 'bg-slate-100 text-slate-600 shadow-none',
  attention: 'bg-gradient-to-br from-[#FFB36C] to-[#FF7E6B] text-white shadow-[0_18px_34px_-24px_rgba(255,126,107,0.58)]',
};

export const parentRadius = {
  icon: 'rounded-[15px]',
  iconSmall: 'rounded-[10px]',
  card: 'rounded-[20px]',
  cardLarge: 'rounded-[22px]',
  input: 'rounded-[14px]',
  button: 'rounded-[16px]',
  sheet: 'rounded-t-[22px]',
};

export const parentShadow = {
  card: 'shadow-[0_18px_42px_-38px_rgba(28,42,58,0.42)]',
  floating: 'shadow-[0_22px_50px_-40px_rgba(28,42,58,0.5)]',
  sheet: 'shadow-[0_-22px_60px_-42px_rgba(28,42,58,0.72)]',
};
```

- [x] **Step 4: 运行 token 测试**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
```

Expected: FAIL only because `ParentApp.tsx` has not yet imported or used new components.

- [x] **Step 5: Commit token**

Run:

```bash
git add components/parent-app/ParentStyleTokens.tsx components/ParentApp.style-unification.test.mjs
git commit -m "新增家长端视觉 token"
```

Expected: commit succeeds.

---

### Task 3: 创建家长端通用 UI 组件

**Files:**
- Create: `components/parent-app/ParentUI.tsx`
- Test: `components/ParentApp.style-unification.test.mjs`

- [x] **Step 1: 写失败断言，要求组件导出**

Append to `components/ParentApp.style-unification.test.mjs` after `tokenSource`:

```js
const parentUiSource = readFileSync(new URL('./parent-app/ParentUI.tsx', import.meta.url), 'utf8');
```

Append before final failure block:

```js
for (const componentName of [
  'export const ParentPageShell',
  'export const ParentCard',
  'export const ParentGradientIcon',
  'export const ParentChildAvatar',
  'export const ParentPrimaryButton',
  'export const ParentSecondaryButton',
  'export const ParentBottomSheet',
]) {
  requireText(parentUiSource, componentName, `ParentUI 缺少组件：${componentName}`);
}
```

- [x] **Step 2: 运行测试确认失败**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
```

Expected: FAIL with missing `ParentUI.tsx`.

- [x] **Step 3: 创建通用组件文件**

Create `components/parent-app/ParentUI.tsx`:

```tsx
import React from 'react';
import { X } from 'lucide-react';
import { parentButtonTone, parentIconTone, parentRadius, parentShadow, parentSurface } from './ParentStyleTokens';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

type IconTone = keyof typeof parentIconTone;

type ButtonTone = keyof typeof parentButtonTone;

interface ParentPageShellProps {
  children: React.ReactNode;
  className?: string;
}

export const ParentPageShell: React.FC<ParentPageShellProps> = ({ children, className }) => (
  <div className={cx('relative flex-1 overflow-y-auto no-scrollbar bg-transparent', className)}>
    {children}
  </div>
);

interface ParentCardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export const ParentCard: React.FC<ParentCardProps> = ({ children, className, as: Component = 'div' }) => (
  <Component className={cx(parentSurface.card, parentRadius.card, parentShadow.card, className)}>
    {children}
  </Component>
);

interface ParentGradientIconProps {
  children: React.ReactNode;
  tone?: IconTone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaHidden?: boolean;
}

const iconSizeClass = {
  sm: 'h-[30px] w-[30px] text-[14px]',
  md: 'h-[42px] w-[42px] text-[18px]',
  lg: 'h-[50px] w-[50px] text-[20px]',
};

export const ParentGradientIcon: React.FC<ParentGradientIconProps> = ({ children, tone = 'blue', size = 'lg', className, ariaHidden = true }) => (
  <span
    aria-hidden={ariaHidden}
    className={cx(
      'relative grid place-items-center overflow-hidden font-black',
      size === 'sm' ? parentRadius.iconSmall : parentRadius.icon,
      iconSizeClass[size],
      parentIconTone[tone],
      'after:absolute after:right-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white/35 after:blur-[1px]',
      className
    )}
  >
    {children}
  </span>
);

interface ParentChildAvatarProps {
  name: string;
  src?: string;
  alt: string;
  className?: string;
}

export const ParentChildAvatar: React.FC<ParentChildAvatarProps> = ({ name, src, alt, className }) => {
  const fallback = name.trim().slice(0, 1) || '学';
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cx('h-[52px] w-[52px] shrink-0 rounded-[15px] border-2 border-white object-cover shadow-[0_12px_22px_-18px_rgba(13,180,241,0.45)]', className)}
      />
    );
  }
  return (
    <span className={cx('grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[15px] border border-cyan-100 bg-gradient-to-br from-[#E9FBFF] to-white text-[22px] font-black text-emerald-600 shadow-[inset_0_0_0_1px_rgba(13,180,241,0.16),0_12px_22px_-18px_rgba(13,180,241,0.45)]', className)}>
      {fallback}
    </span>
  );
};

interface ParentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone;
}

export const ParentPrimaryButton: React.FC<ParentButtonProps> = ({ tone = 'primary', className, children, ...props }) => (
  <button
    type="button"
    className={cx('flex h-[52px] items-center justify-center gap-2 px-4 text-[16px] font-bold transition-transform active:scale-[0.98] disabled:active:scale-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none', parentRadius.button, parentButtonTone[tone], className)}
    {...props}
  >
    {children}
  </button>
);

export const ParentSecondaryButton: React.FC<ParentButtonProps> = ({ tone = 'secondary', className, children, ...props }) => (
  <button
    type="button"
    className={cx('flex h-11 items-center justify-center gap-2 px-4 text-[14px] font-bold transition-transform active:scale-[0.98]', parentRadius.button, parentButtonTone[tone], className)}
    {...props}
  >
    {children}
  </button>
);

interface ParentBottomSheetProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export const ParentBottomSheet: React.FC<ParentBottomSheetProps> = ({ title, children, onClose, className }) => (
  <div className="absolute inset-0 z-[90] flex items-end bg-slate-950/35 backdrop-blur-sm" onClick={onClose}>
    <div className={cx('w-full border border-white/90 border-b-0 bg-white p-5 pb-8', parentRadius.sheet, parentShadow.sheet, className)} onClick={event => event.stopPropagation()}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[19px] font-black text-slate-950">{title}</h2>
        <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500" aria-label="关闭">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);
```

- [x] **Step 4: 运行测试，确认组件导出通过**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
```

Expected: FAIL only because `ParentApp.tsx` has not been migrated to use the components.

- [x] **Step 5: Commit components**

Run:

```bash
git add components/parent-app/ParentUI.tsx components/ParentApp.style-unification.test.mjs
git commit -m "新增家长端通用 UI 组件"
```

Expected: commit succeeds.

---

### Task 4: 迁移绑定页和报告页

**Files:**
- Modify: `components/ParentApp.tsx`
- Test: `components/ParentApp.style-unification.test.mjs`, `components/ParentApp.campus-growth.test.mjs`

- [x] **Step 1: 添加组件导入**

Modify `components/ParentApp.tsx` imports:

```tsx
import {
  ParentBottomSheet,
  ParentCard,
  ParentChildAvatar,
  ParentGradientIcon,
  ParentPageShell,
  ParentPrimaryButton,
  ParentSecondaryButton,
} from './parent-app/ParentUI';
```

Remove no business imports in this step.

- [x] **Step 2: 更新页面容器常量**

Replace:

```tsx
const PARENT_SCREEN_CLASS = 'relative flex-1 overflow-y-auto no-scrollbar bg-transparent';
const BINDING_INPUT_CLASS = 'parent-teacher-token-input w-full h-[52px] rounded-[16px] border px-4 text-[16px] font-bold outline-none transition-colors';
```

with:

```tsx
const BINDING_INPUT_CLASS = 'h-[52px] w-full rounded-[14px] border border-slate-100 bg-slate-50/80 px-4 text-[16px] font-bold text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white';
```

- [x] **Step 3: 迁移 Binding 函数**

Replace the outer wrapper and card in `Binding` with:

```tsx
const Binding = () => (
  <ParentPageShell className="pb-12">
    <Header title="绑定孩子" showBack={bindingReturnTarget === 'switcher'} backLabel="返回切换孩子" onBack={returnToChildSwitcher} />
    <div className="px-6 pt-7">
      <ParentCard className="p-5" as="section">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-500"><ShieldCheck size={15} /> 学校编号</span>
            <input
              value={bindForm.schoolCode}
              onChange={event => updateBindForm('schoolCode', event.target.value)}
              placeholder="例如：BS2024"
              className={BINDING_INPUT_CLASS}
            />
          </label>
          {shouldShowStudentBindFields && ([
            { label: '学生姓名', field: 'studentName' as const, icon: UserRound, placeholder: '例如：郑小磊' },
            { label: '学生学号', field: 'studentNo' as const, icon: Star, placeholder: '例如：20250101' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <label key={item.field} className="block">
                <span className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-500"><Icon size={15} /> {item.label}</span>
                <input value={bindForm[item.field]} onChange={event => updateBindForm(item.field, event.target.value)} placeholder={item.placeholder} className={BINDING_INPUT_CLASS} />
              </label>
            );
          }))}
        </div>
        <ParentPrimaryButton onClick={submitBinding} disabled={!canSubmitBinding} className="mt-6 w-full">
          完成绑定
        </ParentPrimaryButton>
      </ParentCard>
    </div>
  </ParentPageShell>
);
```

- [x] **Step 4: 迁移 Reports 函数**

Replace `Reports` return block with:

```tsx
const Reports = () => {
  if (!activeChild) return <Binding />;
  return (
    <ParentPageShell className="pb-28">
      <section className="space-y-3 px-5 pt-4">
        {activeChild.reports.map(report => (
          <button key={report.id} type="button" onClick={() => { setActiveReportId(report.id); setScreen('reportDetail'); }} className="w-full text-left transition-transform active:scale-[0.99]">
            <ParentCard className="flex min-h-[92px] items-center gap-3 p-4">
              <ParentGradientIcon tone={report.type === 'month' ? 'blue' : 'green'}>
                {report.type === 'month' ? <CalendarDays size={23} /> : <BookOpenCheck size={23} />}
              </ParentGradientIcon>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[17px] font-black text-slate-950">{report.title}</h2>
                <p className="mt-1 text-[13px] font-bold text-emerald-600">{report.period}</p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-slate-300" />
            </ParentCard>
          </button>
        ))}
      </section>
    </ParentPageShell>
  );
};
```

- [x] **Step 5: 运行测试**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
node components/ParentApp.campus-growth.test.mjs
npm run build
```

Expected: style test may still fail for other pages not migrated; campus-growth should not fail on binding/report functional behavior; build should PASS.

- [x] **Step 6: Commit binding/report migration**

Run:

```bash
git add components/ParentApp.tsx components/ParentApp.style-unification.test.mjs components/ParentApp.campus-growth.test.mjs
git commit -m "统一家长端绑定与报告页样式"
```

Expected: commit succeeds.

---

### Task 5: 迁移成长页，保留真实数据卡

**Files:**
- Modify: `components/ParentApp.tsx`
- Test: `components/ParentApp.style-unification.test.mjs`, `components/ParentApp.campus-growth.test.mjs`

- [x] **Step 1: 迁移 GrowthChildProfileCard，保留班级、学号、切换**

Replace `GrowthChildProfileCard` body with:

```tsx
const GrowthChildProfileCard = () => {
  if (!activeChild) return null;
  return (
    <ParentCard className="mx-5 mt-4 p-4" as="section">
      <div className="flex items-center gap-3.5">
        <ParentChildAvatar name={activeChild.name} src={activeChild.avatar} alt={`${activeChild.name}头像`} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[18px] font-black leading-tight tracking-tight text-slate-950">{activeChild.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-bold text-slate-500">
            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-700">{activeChild.className}</span>
            <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-700">{activeChild.studentNo}</span>
          </div>
        </div>
        <ParentSecondaryButton onClick={() => setShowChildSwitcher(true)} className="h-9 min-w-[58px] px-3 text-[13px]" aria-label="切换孩子">
          切换
        </ParentSecondaryButton>
      </div>
    </ParentCard>
  );
};
```

- [x] **Step 2: 迁移 GrowthSummaryCards，保留净得分/表扬/待改进/分红结构**

Replace the two `article` blocks inside `GrowthSummaryCards` with `ParentCard` while keeping constants and labels:

```tsx
return (
  <section className="mx-5 mt-4 flex flex-col gap-3">
    <ParentCard className="min-h-[154px] p-4" as="article">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-black text-slate-500">本月净得分</span>
        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[12px] font-black text-emerald-600">稳步成长</span>
      </div>
      <div className="mt-4 flex items-baseline justify-center">
        <span className="text-[48px] font-black leading-none tracking-[-0.06em] text-emerald-600">{netScore}</span>
        <span className="ml-2 text-[18px] font-black text-slate-300">分</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-[16px] border border-emerald-100 bg-emerald-50/80 px-2 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-black text-emerald-500"><ParentGradientIcon tone="green" size="sm">赞</ParentGradientIcon>表扬</div>
          <div className="mt-1 text-[17px] font-black text-emerald-600">{positiveCount}<span className="ml-0.5 text-[11px]">次</span></div>
        </div>
        <div className="rounded-[16px] border border-orange-100 bg-orange-50/80 px-2 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] font-black text-orange-500"><ParentGradientIcon tone="orange" size="sm">!</ParentGradientIcon>待改进</div>
          <div className="mt-1 text-[17px] font-black text-orange-500">{improveCount}<span className="ml-0.5 text-[11px]">次</span></div>
        </div>
      </div>
    </ParentCard>

    <ParentCard className="min-h-[154px] p-4" as="article">
      <div className="text-[13px] font-black text-slate-500">预估分红总额</div>
      <div className="mt-5 flex items-center justify-center gap-2">
        <img src="/assets/coin.png" alt="" className="h-9 w-9 shrink-0" />
        <span className="text-[42px] font-black leading-none tracking-[-0.06em] text-emerald-600">{totalReward.toFixed(2)}</span>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="rounded-[16px] border border-cyan-100 bg-cyan-50/60 px-2 py-2 text-center">
          <div className="text-[11px] font-black text-cyan-600/80">成长奖励</div>
          <div className="mt-1 flex items-center justify-center gap-1 text-[16px] font-black text-cyan-700">
            <img src="/assets/coin.png" alt="" className="h-4 w-4" />{growthReward}
          </div>
        </div>
        <div className="text-[18px] font-black text-slate-300">+</div>
        <div className="rounded-[16px] border border-emerald-100 bg-emerald-50/60 px-2 py-2 text-center">
          <div className="text-[11px] font-black text-emerald-600/80">得分奖励</div>
          <div className="mt-1 flex items-center justify-center gap-1 text-[16px] font-black text-emerald-600">
            <img src="/assets/coin.png" alt="" className="h-4 w-4" />{scoreReward}
          </div>
        </div>
      </div>
    </ParentCard>
  </section>
);
```

- [x] **Step 3: 迁移 Growth 页面容器**

Replace:

```tsx
<div className={`${PARENT_SCREEN_CLASS} pb-28`}>
```

inside `Growth` with:

```tsx
<ParentPageShell className="pb-28">
```

and close with `</ParentPageShell>`.

- [x] **Step 4: 运行测试**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
node components/ParentApp.campus-growth.test.mjs
npm run build
```

Expected: no growth functional assertions fail; build PASS.

- [x] **Step 5: Commit growth migration**

Run:

```bash
git add components/ParentApp.tsx
git commit -m "统一家长端成长页样式"
```

Expected: commit succeeds.

---

### Task 6: 迁移报告详情页

**Files:**
- Modify: `components/ParentApp.tsx`
- Test: `components/ParentApp.style-unification.test.mjs`, `components/ParentApp.campus-growth.test.mjs`

- [x] **Step 1: 迁移 ReportDetail 容器和图标**

Replace the `ReportDetail` return block with:

```tsx
const ReportDetail = () => {
  if (!activeChild || !activeReport) return <Reports />;
  return (
    <ParentPageShell className="pb-28">
      <Header title="报告详情" subtitle={`${activeReport.title} · ${activeReport.period}`} showBack />
      <ParentCard className="mx-5 mt-5 p-5" as="section">
        <ParentGradientIcon tone={activeReport.type === 'month' ? 'blue' : 'green'} className="mb-5 h-14 w-14 rounded-[18px]">
          <FileText size={26} />
        </ParentGradientIcon>
        <h2 className="text-[24px] font-black text-slate-950">{activeReport.title}</h2>
        <p className="mt-1 text-[13px] font-bold text-emerald-600">{activeChild.name} · {activeReport.period}</p>
        <p className="mt-5 text-[15px] leading-relaxed text-slate-600">{activeReport.summary}</p>
        <div className="mt-5 space-y-2">
          {activeReport.highlights.map(item => (
            <div key={item} className="flex items-start gap-2 rounded-[16px] bg-slate-50 p-3">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
              <span className="text-[13px] font-medium leading-relaxed text-slate-600">{item}</span>
            </div>
          ))}
        </div>
      </ParentCard>
    </ParentPageShell>
  );
};
```

- [x] **Step 2: 运行测试**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
node components/ParentApp.campus-growth.test.mjs
npm run build
```

Expected: report detail content assertions PASS; build PASS.

- [x] **Step 3: Commit report detail migration**

Run:

```bash
git add components/ParentApp.tsx
git commit -m "统一家长端报告详情样式"
```

Expected: commit succeeds.

---

### Task 7: 迁移银行页和存单弹窗

**Files:**
- Modify: `components/ParentApp.tsx`
- Test: `components/ParentApp.style-unification.test.mjs`, `components/ParentApp.campus-growth.test.mjs`

- [x] **Step 1: 迁移银行页面容器**

Replace the outer `Bank` wrapper:

```tsx
<div className={`${PARENT_SCREEN_CLASS} pb-28`}>
```

with:

```tsx
<ParentPageShell className="pb-28">
```

and update its closing tag.

- [x] **Step 2: 保留钱包/存款真实信息条，仅调整视觉**

Replace the `parent-bank-balance-strip` section with:

```tsx
<section className="sticky top-0 z-30 px-5 bg-white/70 backdrop-blur-xl">
  <ParentCard className="flex h-11 items-center px-3 text-slate-600">
    <div className="flex flex-1 items-center justify-center gap-1.5">
      <span className="text-[14px] font-black">钱包</span>
      <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
      <span className="text-[16px] font-black leading-none text-emerald-600">{formatCoin(activeChild.availableCoins)}</span>
    </div>
    <div className="h-5 w-px bg-slate-200" aria-hidden="true" />
    <div className="flex flex-1 items-center justify-center gap-1.5">
      <span className="text-[14px] font-black">存款</span>
      <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
      <span className="text-[16px] font-black leading-none text-emerald-600">{formatCoin(activeChild.bankBalance)}</span>
    </div>
  </ParentCard>
</section>
```

- [x] **Step 3: 保留 tab 功能，仅替换按钮样式**

In `parent-bank-action-tabs`, replace active/inactive class logic with `ParentPrimaryButton` and `ParentSecondaryButton`:

```tsx
{[
  { key: 'deposit' as const, label: '签署新存单', icon: PiggyBank },
  { key: 'list' as const, label: '我的存单', icon: FileText },
].map(item => {
  const Icon = item.icon;
  const active = activeBankTab === item.key;
  const Button = active ? ParentPrimaryButton : ParentSecondaryButton;
  return (
    <Button key={item.key} onClick={() => setActiveBankTab(item.key)} className="h-12 text-[14px]">
      <Icon size={16} /> {item.label}
    </Button>
  );
})}
```

- [x] **Step 4: 迁移存钱计划卡片，保留所有字段和点击逻辑**

Inside `PARENT_BANK_TERMS.map`, keep `setSelectedBankScheme(scheme); setShowDepositConfirm(true);` and replace button class with:

```tsx
className={`flex w-full items-center justify-between rounded-[16px] border px-4 py-3 text-left transition-colors ${active ? (isCurrent ? 'border-emerald-300 bg-emerald-50' : 'border-cyan-300 bg-cyan-50') : 'border-slate-100 bg-slate-50'}`}
```

Change定期标签颜色 from blue/indigo to cyan where possible:

```tsx
<span className={`rounded-full px-2.5 py-1 ${isCurrent ? 'bg-emerald-50 text-emerald-600' : 'bg-cyan-50 text-cyan-700'}`}>日利率 {formatDailyRate(scheme.dailyRate)}</span>
```

- [x] **Step 5: 迁移存单列表，保留本金、利息、进度、取出**

Replace each deposit card outer `article` class with:

```tsx
<ParentCard key={deposit.id} className="p-4" as="article">
```

Replace status icon container with `ParentGradientIcon`:

```tsx
<ParentGradientIcon tone={details.matured ? 'green' : 'orange'} size="md">
  {details.matured ? <BadgeCheck size={19} /> : <Clock size={19} />}
</ParentGradientIcon>
```

Keep the `button onClick={() => setWithdrawTarget(deposit)}` logic unchanged, but use:

```tsx
<ParentPrimaryButton onClick={() => setWithdrawTarget(deposit)} tone={deposit.type === 'current' ? 'primary' : 'primary'} className="mt-4 w-full h-12 text-[15px]">
  取出
</ParentPrimaryButton>
```

- [x] **Step 6: 迁移存入金额抽屉为 ParentBottomSheet**

Replace the outer `showDepositConfirm` overlay with:

```tsx
{showDepositConfirm && selectedBankScheme && (
  <ParentBottomSheet title="存入金额" onClose={() => { setShowDepositConfirm(false); setShowDepositReview(false); }}>
    <p className="-mt-3 mb-4 text-[12px] font-bold text-slate-400">{selectedBankScheme.productName} · 存期 {selectedBankScheme.termLabel} · 日利率 {formatDailyRate(selectedBankScheme.dailyRate)}</p>
    {/* keep the existing amount range, interest cards, current projection block, and 签署存单 button here */}
  </ParentBottomSheet>
)}
```

Do not remove these existing elements inside the sheet:

```tsx
<input type="range" />
{selectedBankScheme.type === 'current' && (...CURRENT_DEPOSIT_PROJECTION_DAYS.map(days => ...))}
<button type="button" onClick={() => setShowDepositReview(true)}>签署存单</button>
```

- [x] **Step 7: 迁移签署确认弹窗按钮样式，保留二次确认**

Keep centered modal structure and `onClick={submitDeposit}` only on `确认签署`. Replace buttons with:

```tsx
<ParentSecondaryButton onClick={() => setShowDepositReview(false)} tone="neutral" className="h-[52px] text-[16px]">
  我再想想
</ParentSecondaryButton>
<ParentPrimaryButton onClick={submitDeposit} className="h-[52px] text-[16px]">
  确认签署
</ParentPrimaryButton>
```

- [x] **Step 8: 迁移取出确认抽屉为 ParentBottomSheet**

Replace outer `withdrawTarget` overlay with:

```tsx
{withdrawTarget && (
  <ParentBottomSheet title="确认取出" onClose={() => setWithdrawTarget(null)}>
    <div className="space-y-3 rounded-[16px] bg-slate-50 p-4">
      <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-500">本金</span><span className="text-slate-900">{withdrawTarget.amount}</span></div>
      <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-500">利息</span><span className="text-emerald-600">+{getDepositInterest(withdrawTarget).interest}</span></div>
    </div>
    <ParentPrimaryButton onClick={() => withdrawDeposit(withdrawTarget)} className="mt-4 w-full">
      确认取出
    </ParentPrimaryButton>
  </ParentBottomSheet>
)}
```

- [x] **Step 9: 运行测试**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
node components/ParentApp.campus-growth.test.mjs
npm run build
```

Expected: bank assertions PASS, especially `PARENT_BANK_TERMS`, `CURRENT_DEPOSIT_PROJECTION_DAYS`, `showDepositReview`, `withdrawTarget`, and build PASS.

- [x] **Step 10: Commit bank migration**

Run:

```bash
git add components/ParentApp.tsx
git commit -m "统一家长端银行页和存单弹窗样式"
```

Expected: commit succeeds.

---

### Task 8: 迁移切换孩子抽屉和底部导航视觉

**Files:**
- Modify: `components/ParentApp.tsx`
- Modify: `mobile-app/styles/navigation.css` if needed
- Test: `components/ParentApp.style-unification.test.mjs`, `components/ParentApp.campus-growth.test.mjs`

- [x] **Step 1: 迁移 ChildSwitcherSheet 为 ParentBottomSheet**

Replace outer sheet wrapper with:

```tsx
if (!showChildSwitcher) return null;
return (
  <ParentBottomSheet title="切换孩子" onClose={() => setShowChildSwitcher(false)}>
    <div className="space-y-2">
      {childrenList.map(child => (
        <ParentCard key={child.id} className={`w-full p-4 ${child.id === activeChildId ? 'border-emerald-200 bg-emerald-50/40' : ''}`} as="article">
          <div className="flex items-center gap-3">
            <ParentChildAvatar name={child.name} src={child.avatar} alt={`${child.name}头像`} className="h-11 w-11 rounded-[14px]" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[16px] font-black leading-tight text-slate-950">{child.name}</div>
              <div className="mt-2 flex min-w-0 items-center gap-2 whitespace-nowrap text-[12px] font-bold text-slate-500">
                <span className="shrink-0 text-slate-300">所在班级</span>
                <span className="max-w-[92px] truncate text-slate-700">{child.className}</span>
                <span className="shrink-0 text-slate-300">学号</span>
                <span className="max-w-[54px] truncate text-slate-700">{child.studentNo}</span>
              </div>
            </div>
            <ParentSecondaryButton onClick={() => { setActiveChildId(child.id); setShowChildSwitcher(false); }} disabled={child.id === activeChildId} className="h-9 min-w-[58px] px-3 text-[13px]">
              {child.id === activeChildId ? '当前' : '切换'}
            </ParentSecondaryButton>
          </div>
        </ParentCard>
      ))}
    </div>
    <ParentPrimaryButton onClick={() => openBinding('switcher')} className="mt-4 w-full">
      <Plus size={18} /> 新增绑定
    </ParentPrimaryButton>
  </ParentBottomSheet>
);
```

- [x] **Step 2: 更新底部导航选中态颜色，不改入口和状态逻辑**

In `renderParentBottomNav`, replace active text class:

```tsx
active ? 'text-indigo-600 font-bold scale-105 opacity-100' : 'text-slate-400 font-medium scale-100 opacity-70'
```

with:

```tsx
active ? 'text-emerald-600 font-bold scale-105 opacity-100' : 'text-slate-400 font-medium scale-100 opacity-70'
```

Keep `TeacherFluidGlassNav`, `parentNavActiveIndex`, `parentTabbarWidth`, and `tabItems` unchanged unless user later approves a deeper nav redesign.

- [x] **Step 3: 运行测试**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
node components/ParentApp.campus-growth.test.mjs
npm run build
```

Expected: both tests PASS and build PASS.

- [x] **Step 4: Commit switcher/nav migration**

Run:

```bash
git add components/ParentApp.tsx mobile-app/styles/navigation.css
git commit -m "统一家长端切换孩子和底部导航样式"
```

Expected: commit succeeds.

---

### Task 9: 更新家长端 UI 规范

**Files:**
- Modify: `PARENT_APP_UI_GUIDELINES.md`
- Test: manual review

- [ ] **Step 1: 在规范中新增视觉系统章节**

Append to `PARENT_APP_UI_GUIDELINES.md` after `## 2. 视觉基础规范`:

```markdown
### 2.5 2026-06 家长端轻科技视觉修订

家长端采用“极淡粉蓝/蓝绿背景 + 白色卡片 + 小面积渐变 icon”的轻科技视觉方向。

使用要求：

- 页面背景接近白色，只使用极淡粉蓝、浅蓝绿雾化氛围。
- 内容卡片以白色为主，使用轻阴影和克制圆角。
- 功能 icon 使用统一渐变容器，青蓝用于报告、银行等信息入口，绿青用于成长、完成等正向状态，蜜桃橙用于待改进等关注状态。
- 待改进不使用灰色，避免误解为不可用或不重要。
- 确认类按钮使用青蓝/绿青渐变，不使用纯黑、深蓝或黄色大按钮。
- 圆角按组件层级分级，不允许所有组件使用超大圆角。
- 学生头像真实上传优先，未上传时显示姓名姓氏第一个字。
```

- [ ] **Step 2: 运行文档检查**

Run:

```bash
rg -n "极淡粉蓝|渐变 icon|姓氏第一个字|纯黑" PARENT_APP_UI_GUIDELINES.md
```

Expected: shows the newly added guideline lines.

- [ ] **Step 3: Commit guideline update**

Run:

```bash
git add PARENT_APP_UI_GUIDELINES.md
git commit -m "更新家长端轻科技 UI 规范"
```

Expected: commit succeeds.

---

### Task 10: 最终验证和视觉预览

**Files:**
- No source edits expected unless a verification issue is found.

- [ ] **Step 1: Run all relevant static tests**

Run:

```bash
node components/ParentApp.style-unification.test.mjs
node components/ParentApp.campus-growth.test.mjs
node components/ShopView.purchase-timing.test.mjs
npm run build
```

Expected: all Node tests print success; `npm run build` exits 0.

- [ ] **Step 2: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL such as `http://localhost:5173/`.

- [ ] **Step 3: Browser preview with real flow**

Open the local URL in the in-app browser and verify these flows manually:

```text
1. 进入家长手机端。
2. 输入学校编号后，学生姓名和学生学号出现。
3. 完成绑定后进入成长页。
4. 成长页显示孩子信息、本月净得分、表扬、待改进、预估分红总额、成长奖励、得分奖励。
5. 切换到底部“报告”，只显示月度报告和期末报告。
6. 点击月度报告进入报告详情，返回正常。
7. 切换到底部“银行”，钱包和存款显示正常。
8. 点击签署新存单，选择计划后打开存入金额抽屉。
9. 点击签署存单，出现二次确认。
10. 确认签署后进入我的存单。
11. 点击取出，确认取出后存单移除。
12. 打开切换孩子，当前/切换/新增绑定正常。
```

Expected: all flows work; no new入口出现；页面风格统一。

- [ ] **Step 4: Capture verification notes**

Append a short note to `logs/agent_detail/parent-mobile-style-brainstorming.md`:

```markdown

## 2026-06-03 家长端样式统一实施验证
- 已运行：`node components/ParentApp.style-unification.test.mjs`、`node components/ParentApp.campus-growth.test.mjs`、`npm run build`。
- 已人工预览：绑定、成长、报告、报告详情、银行、签署存单、取出、切换孩子。
- 结果：功能边界未变化，样式已统一为极淡背景、白卡片、小面积渐变 icon。
```

- [ ] **Step 5: Final commit if verification note is the only change**

Do not commit `logs/agent_detail` because project rules say logs must never be submitted. If no source changes remain, do not create an empty commit.

Run:

```bash
git status --short
```

Expected: no source changes except ignored/untracked logs or unrelated existing workspace changes.

---

## Self-Review

**Spec coverage:**
- 功能不变：Task 1 and Task 10 protect binding, growth, reports, report detail, bank, switcher, and bottom nav.
- 视觉 token：Task 2.
- 通用组件：Task 3.
- 页面映射：Tasks 4 through 8.
- UI guideline update：Task 9.
- Verification：Task 10.

**Placeholder scan:** No unfinished markers or unspecified test steps are present.

**Type consistency:** Component names are consistent across tasks: `ParentPageShell`, `ParentCard`, `ParentGradientIcon`, `ParentChildAvatar`, `ParentPrimaryButton`, `ParentSecondaryButton`, and `ParentBottomSheet`.
