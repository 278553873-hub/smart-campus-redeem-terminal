import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const controlSource = readFileSync(new URL('./HeadteacherAssistantScopePreviewControls.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const mobileAppSource = readFileSync(new URL('../mobile-app/App.tsx', import.meta.url), 'utf8');

// 1. 控件应与货柜机登录方式预览保持同一套滑块外观与无障碍语义
assert.ok(!controlSource.includes('<fieldset'), '预览控件不应使用 fieldset，避免标题与边框穿模');
assert.ok(controlSource.includes('grid grid-cols-3'), '三档能力组合应使用单行滑块');
assert.ok(controlSource.includes('role="radiogroup"'), '滑块应提供单选组语义');
assert.ok(controlSource.includes('role="radio"'), '每个选项应提供单选项语义');
assert.ok(controlSource.includes('min-h-9') && controlSource.includes('leading-tight'), '选项高度与行高应与其它预览控件一致');
assert.ok(controlSource.includes('whitespace-nowrap'), '选项文案不应折行');
assert.ok(
  controlSource.includes('title={option.fullLabel}') && controlSource.includes('aria-label={option.fullLabel}'),
  '短文案需要完整说明兜底，方便预览时确认含义',
);
assert.ok(!controlSource.includes('rounded-2xl'), '卡片外壳由浮层提供，控件本身只负责滑块');

// 2. 必须是独立卡片，不能嵌在配色方案卡片里
const controlIndex = appSource.indexOf('<HeadteacherAssistantScopePreviewControls');
assert.ok(controlIndex > 0, '预览滑块应挂在教师手机端右侧浮层内');
const headingIndex = appSource.lastIndexOf('>班主任助理</span>', controlIndex);
const cardIndex = appSource.lastIndexOf('w-full rounded-2xl border border-slate-200/80 bg-white/90 p-2', headingIndex);
assert.ok(headingIndex > 0 && cardIndex > 0 && cardIndex < headingIndex, '预览控件应位于带标题的独立卡片内');
const gradientCardToControl = appSource.slice(appSource.indexOf('aria-label="选择渐变配色方案"'), controlIndex);
assert.ok(
  gradientCardToControl.includes('</div>'),
  '配色方案卡片应在预览控件之前闭合，预览控件不能放在配色方案卡片内部',
);
assert.ok(
  gradientCardToControl.includes('w-full rounded-2xl border border-slate-200/80'),
  '预览控件应使用与其它浮层卡片一致的独立卡片容器',
);

// 3. 默认档位来自学校配置，每次进入班主任助理都回到该档位
assert.ok(
  appSource.includes('onHeadteacherAssistantScopePreviewDefaultChange={setHeadteacherAssistantScopePreviewDefault}'),
  '手机端回传的默认档位要进入浮层状态',
);
assert.ok(
  appSource.includes('value={headteacherAssistantScopePreviewMode}'),
  '滑块选中项应取“点选档位或学校配置档位”',
);
assert.ok(
  mobileAppSource.includes('getHeadteacherAssistantScopePreviewMode(spaceHeadteacherAssistantScopes)'),
  '手机端应根据学校配置推出默认档位',
);
assert.ok(
  mobileAppSource.includes('onHeadteacherAssistantScopePreviewDefaultChange?.(defaultHeadteacherAssistantScopePreview)'),
  '默认档位应回传给预览浮层',
);
assert.ok(
  mobileAppSource.includes("if (view === 'ai_headteacher_assistant' || view === 'ai_headteacher_assistant_v2') {")
    && mobileAppSource.includes('onHeadteacherAssistantScopePreviewChange?.(null);'),
  '每次进入班主任助理都应把预览档位复位到学校配置',
);

// 4. 预览档位只覆盖板块组合，能力判定仍走统一解析
assert.ok(mobileAppSource.includes('resolveHeadteacherAssistantScopes('), '手机端应把预览组合解析进班主任助理能力范围');
assert.ok(
  mobileAppSource.includes("showStudentEvaluation={headteacherAssistantScopes.includes('student')}"),
  '页面能力判定仍应读取解析后的能力范围',
);

console.log('✅ 班主任助理评价能力预览控件断言通过（三档滑块、独立卡片、默认档位跟随学校配置）');
