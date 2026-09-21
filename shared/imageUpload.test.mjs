import assert from 'node:assert/strict';
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MAX_SIZE_TEXT,
  validateImageUpload,
} from './imageUpload.ts';

const MB = 1024 * 1024;

// 1. 格式与大小口径：提示文案和上限来自同一份常量，页面不各写一套
assert.equal(IMAGE_UPLOAD_ACCEPT, 'image/png,image/jpeg,image/webp');
assert.equal(IMAGE_UPLOAD_MAX_BYTES, 2 * MB);
assert.equal(IMAGE_UPLOAD_MAX_SIZE_TEXT, IMAGE_UPLOAD_MAX_BYTES / MB + 'MB');

// 2. 正常图片放行
for (const type of IMAGE_UPLOAD_ACCEPT.split(',')) {
  assert.equal(validateImageUpload({ type, size: 600 * 1024 }), null, type + ' 应放行');
}
assert.equal(validateImageUpload({ type: 'image/jpeg', size: IMAGE_UPLOAD_MAX_BYTES }), null, '刚好等于上限应放行');
assert.equal(validateImageUpload({ type: 'IMAGE/PNG', size: 1024 }), null, '类型大小写不影响判断');

// 3. 不合格的图片要拦下，并给出老师看得懂的原因
assert.match(validateImageUpload({ type: 'image/gif', size: 1024 }), /PNG/, '不支持的格式要说清支持哪些');
assert.ok(validateImageUpload({ type: 'application/pdf', size: 1024 }));
assert.ok(validateImageUpload({ type: 'image/png', size: IMAGE_UPLOAD_MAX_BYTES + 1 }), '超过上限要拦下');
assert.match(
  validateImageUpload({ type: 'image/png', size: IMAGE_UPLOAD_MAX_BYTES + 1 }),
  new RegExp(IMAGE_UPLOAD_MAX_SIZE_TEXT),
  '超限提示里的上限要跟常量一致',
);
assert.ok(validateImageUpload(null), '没有文件时要有提示');
assert.ok(validateImageUpload(undefined));

// 4. 浏览器给不出类型时不误伤（交给 accept 与预览兜底）
assert.equal(validateImageUpload({ type: '', size: 1024 }), null);

console.log('✅ 图片上传规则（格式 / 大小上限 / 提示文案同源）断言测试通过！');
