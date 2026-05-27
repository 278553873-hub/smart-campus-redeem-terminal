import fs from 'node:fs';

const viewSource = fs.readFileSync('mobile-app/views/TermReportView.tsx', 'utf8');
const constantsSource = fs.readFileSync('mobile-app/constants.ts', 'utf8');
const assetsSource = fs.readFileSync('mobile-app/assets/images.ts', 'utf8');

const failures = [];

function requireText(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

for (const key of [
  'award-certificate-default',
  'daily-default-growth',
  'daily-kindness-collaboration',
  'daily-classroom-thinking',
  'daily-labor-service',
  'daily-sports-vitality',
  'daily-art-creativity',
]) {
  requireText(assetsSource, key, `系统内置高光图缺少映射：${key}`);
  requireText(viewSource, key, `编辑选择面板缺少系统内置图：${key}`);
}

requireText(constantsSource, 'highlightMoments', 'mock 数据应使用线上提示词一致的 highlightMoments 字段。');
requireText(constantsSource, 'type: "award"', 'mock 数据应包含有奖状的 award 高光。');
requireText(constantsSource, 'type: "dailyRecord"', 'mock 数据应包含无奖状的 dailyRecord 高光。');
requireText(constantsSource, 'imageUrl: ASSETS.HIGHLIGHTS.CERTIFICATE', 'mock 获奖照片应使用 resources/certificate.png。');
requireText(constantsSource, 'imageUrl: ASSETS.HIGHLIGHTS.PINGPONG_CERT', 'mock 获奖照片应使用 resources/pingpong_cert.png。');
requireText(constantsSource, 'defaultImageKey: "daily-classroom-thinking"', '无奖状日常记录应使用内置默认图 key。');

requireText(viewSource, 'type="file"', '编辑时应支持上传本地新图片。');
requireText(viewSource, 'accept="image/*"', '上传入口应限制为图片文件。');
requireText(viewSource, 'FileReader', '上传后应生成本地预览图片。');
requireText(viewSource, 'HIGHLIGHT_DEFAULT_OPTIONS.map', '编辑态应提供系统内置图选择区。');
requireText(viewSource, 'getHighlightImage', '高光图片应通过统一函数按 imageUrl/defaultImageKey 解析。');
requireText(viewSource, 'description', '高光文案应使用提示词结构中的 description 字段。');

requireText(viewSource, 'const canPreview = Boolean(item.imageUrl);', '只有传入 imageUrl 的奖状/证书等图片才允许点击预览。');
requireText(viewSource, 'canPreview && setPreviewImage(resolvedImage)', '内置默认图不应触发大图预览。');
requireText(viewSource, 'getBoundingClientRect', '大图预览应测量手机页面可视容器，避免超过当前页面范围。');
requireText(viewSource, "document.getElementById('main-scroll-container')", '大图预览应优先对齐教师手机端当前页面容器。');
requireText(viewSource, 'previewBounds', '大图预览应使用测量后的页面边界定位。');
requireText(viewSource, 'createPortal', '大图预览应通过 Portal 渲染到 body，避免被手机壳 transform 和滚动容器定位到页面顶部。');
requireText(viewSource, 'document.body', '大图预览 Portal 应挂载到 document.body。');
requireText(viewSource, 'highlights.length === 0', '无高光时刻时应显示空状态新增入口。');
if (viewSource.includes('这个板块还没有高光时刻') || viewSource.includes('可以先添加一条真实、具体')) failures.push('无高光时刻时不应显示整块空状态说明卡，只保留新增按钮。');


if (viewSource.includes('获奖证书') || viewSource.includes('日常高光') || viewSource.includes('系统内置图</div>')) failures.push('高光图片上不应展示获奖证书、日常高光、系统内置图等标签文案。');
if (viewSource.includes('{option.label}') || viewSource.includes('option.label') || viewSource.includes('<span className="block truncate')) failures.push('系统内置图选择区不应显示对应标签文案，只展示图片缩略图。');
if (viewSource.includes('animate-in zoom-in-95')) failures.push('奖状大图预览不应使用旧的通用 zoom-in 动效，应使用原地放大的手机图片预览动效。');
requireText(viewSource, 'highlight-preview-image', '奖状大图预览应使用专用原地缩放动画类。');
requireText(viewSource, 'width: `calc(${previewBounds.width}px - 24px)`', '预览图片应有明确放大宽度，而不是只设置 max-width。');

requireText(viewSource, 'items-start justify-end', '关闭按钮应在预览区域右上方独立显示，而不是覆盖图片。');
requireText(viewSource, 'pt-14', '预览内容需要给右上角关闭按钮留出顶部安全空间。');
if (viewSource.includes('absolute top-4 right-4')) failures.push('关闭按钮不应绝对定位覆盖在图片右上角。');

if (viewSource.includes('>大图预览<') || viewSource.includes('大图预览\n')) failures.push('证书大图预览不应显示额外说明文案。');


requireText(viewSource, '拍照', '上传新图片应提供拍照入口。');
requireText(viewSource, '相册选择', '上传新图片应提供相册选择入口。');
requireText(viewSource, 'capture="environment"', '拍照入口应使用 capture=environment 调用后置摄像头。');
requireText(viewSource, '删除这条高光时刻', '删除按钮应明确删除整条高光时刻，而不是像删除图片。');

requireText(viewSource, '更换图片', '编辑态图片区域应通过蒙版按钮触发更换图片。');
requireText(viewSource, 'imagePickerIndex', '点击更换图片后应打开图片选择面板。');
requireText(viewSource, '上传图片', '图片选择面板应提供上传图片入口。');
requireText(viewSource, 'uploadSheetIndex', '点击上传图片后应打开拍照/相册选择弹窗。');
if (viewSource.includes('图片操作')) failures.push('主卡片编辑态不应直接展示复杂的图片操作区。');
if (viewSource.includes('absolute top-3 right-3 z-20 bg-red-500')) failures.push('删除整条高光时刻的按钮不应悬浮在图片右上角，避免被误解为删除图片。');


requireText(viewSource, 'sheetBounds', '更换图片和上传图片弹窗应使用手机屏幕边界定位。');
requireText(viewSource, 'renderPhoneSheet', '弹窗应通过统一手机屏幕弹层渲染，避免跑到页面上方。');
if (viewSource.includes('className="fixed inset-0 z-[9998]') || viewSource.includes('className="fixed inset-0 z-[9999]')) failures.push('图片选择弹窗不应使用全页面 fixed inset-0，应限制在当前手机屏幕内。');


requireText(viewSource, 'right-2 top-2', '删除按钮应放在整张高光卡片右上角。');
if (viewSource.includes('absolute right-4 top-4')) failures.push('删除按钮不应贴在图片右上方，应移到卡片右上角。');


requireText(viewSource, 'h-8 w-8', '高光卡片右上角删除按钮尺寸应缩小，避免 icon 过大。');
requireText(viewSource, 'h-3.5 w-3.5', '高光卡片删除图标本身应使用更小尺寸。');
if (viewSource.includes('h-10 w-10') || viewSource.includes('w-4.5 h-4.5')) failures.push('高光卡片删除按钮不应使用过大的圆形按钮或非标准 icon 尺寸。');

if (failures.length) {
  throw new Error(failures.join('\n'));
}

console.log('高光时刻 mock 与编辑图片逻辑静态检查通过');
