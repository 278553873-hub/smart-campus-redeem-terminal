import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IMAGE_UPLOAD_MAX_BYTES, validateImageUpload } from '../shared/imageUpload.ts';

const source = readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');

const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};
const forbidText = (text, message) => {
  if (source.includes(text)) failures.push(message);
};

// 1. 通用模型：图是上传控件，不是「默认图 / 自定义图」二选一
requireText('listType="picture-card"', '商品图应使用 Arco Upload 的图片卡片形态。');
requireText('limit={1}', '商品图是单图：上传数量上限为 1。');
requireText('autoUpload={false}', '演示态不入后端：不应触发真实上传请求。');
requireText('imagePreview', '上传后点预览图标要能看大图。');
requireText('fileList={shopProductImageFiles}', '已上传的图由 fileList 渲染，删掉就回到空态。');
requireText('onRemove={() => {', '图片卡片要能删除，删掉即回退默认商品图。');
requireText('setModalIcon(DEFAULT_PRODUCT_IMAGE);', '删除图片后商品回到没上传的状态，前台用默认商品图兜底。');
requireText('const shopProductImageFiles = modalIcon && modalIcon !== DEFAULT_PRODUCT_IMAGE', '没上传时列表为空，不能把默认图当成一张已上传的图。');

// 2. 默认图不再作为可选项，商品也不再自己记历史图
forbidText('getShopProductImageOptions', '图片选项不该再是「默认图 + 自定义图」的并列列表。');
forbidText('customImage', '商品只存当前这张图，不该再存历史自定义图。');
forbidText('已应用自定义图片', '图片是否已应用看缩略图和预览即可，不再叠信息条。');
forbidText('opacity-0 cursor-pointer', '上传入口要用 Arco 组件，不再手写盖在方框上的 file input。');

// 3. 上传校验走共享规则
requireText("import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_MAX_SIZE_TEXT, validateImageUpload } from '../shared/imageUpload';", '格式与大小规则要来自共享基础层，页面不重复实现。');
requireText('accept={IMAGE_UPLOAD_ACCEPT}', '上传入口的格式限制要用共享规则。');
requireText('beforeUpload={handleShopProductImageBeforeUpload}', '选图后先校验再落库。');
requireText('const uploadError = validateImageUpload(file);', '上传校验要调用共享规则。');
requireText('Message.warning(uploadError);', '校验不通过要明确告诉老师原因。');
requireText('{SHOP_PRODUCT_IMAGE_HINT}', '上传入口要写清尺寸、格式与大小要求。');

// 4. 校验规则本身的行为：合格的放行、不合格的给理由
assert.equal(validateImageUpload({ type: 'image/png', size: 600 * 1024 }), null);
assert.ok(validateImageUpload({ type: 'image/png', size: IMAGE_UPLOAD_MAX_BYTES + 1 }), '超过上限要拦下');
assert.ok(validateImageUpload({ type: 'image/tiff', size: 1024 }), '不支持的格式要拦下');

if (failures.length > 0) {
  for (const failure of failures) console.log('❌ ' + failure);
  throw new Error('货柜超市「商品图片」检查未通过');
}

console.log('✅ 货柜超市「商品图片」检查通过（单图上传：空态上传框 / 有图可预览可删除 / 删掉回默认图）');
