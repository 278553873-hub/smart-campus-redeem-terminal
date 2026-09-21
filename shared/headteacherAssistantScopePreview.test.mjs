import assert from 'node:assert/strict';
import {
    HEADTEACHER_ASSISTANT_SCOPE_PREVIEW_OPTIONS,
    getHeadteacherAssistantScopePreviewMode,
} from './headteacherAssistantScopePreview.ts';
import { resolveHeadteacherAssistantScopes } from '../mobile-app/domain/teacherSpaceAccess.ts';

// 1. 滑块只有三档，没有“跟随配置”这一项
assert.deepEqual(
    HEADTEACHER_ASSISTANT_SCOPE_PREVIEW_OPTIONS.map(option => option.value),
    ['student-only', 'class-only', 'both'],
    '滑块应只提供仅开通学生评价、仅开通班级评价、都开通三档',
);
assert.deepEqual(
    HEADTEACHER_ASSISTANT_SCOPE_PREVIEW_OPTIONS.map(option => option.fullLabel),
    ['仅开通学生评价', '仅开通班级评价', '学生评价和班级评价都开通'],
);
assert.equal(
    HEADTEACHER_ASSISTANT_SCOPE_PREVIEW_OPTIONS.some(option => option.label.includes('跟随')),
    false,
    '“跟随配置”不是滑块选项，而是进入页面时的默认档位，不能占一档',
);

// 2. 默认档位由学校配置推出
assert.equal(getHeadteacherAssistantScopePreviewMode(['student']), 'student-only');
assert.equal(getHeadteacherAssistantScopePreviewMode(['class']), 'class-only');
assert.equal(getHeadteacherAssistantScopePreviewMode(['student', 'class']), 'both');
assert.equal(getHeadteacherAssistantScopePreviewMode(['class', 'student']), 'both', '学校配置顺序不应影响默认档位');
assert.equal(getHeadteacherAssistantScopePreviewMode(['teacher', 'class']), 'class-only', '无关的能力编号不应影响默认档位');
assert.equal(getHeadteacherAssistantScopePreviewMode([]), null, '两种评价都没开通时没有可用的默认档位');

// 3. 预览只改页面板块组合，不改变学校真实权限
assert.deepEqual(resolveHeadteacherAssistantScopes(['class'], 'student-only'), ['student']);
assert.deepEqual(resolveHeadteacherAssistantScopes([], 'both'), ['student', 'class']);
assert.deepEqual(resolveHeadteacherAssistantScopes(['class'], null), ['class'], '未点选滑块时应继续使用学校配置');
assert.deepEqual(resolveHeadteacherAssistantScopes(['student']), ['student'], '不传预览档位时等同于学校配置');

console.log('✅ 班主任助理评价能力预览开关断言通过（三档滑块、默认档位跟随学校配置）');
