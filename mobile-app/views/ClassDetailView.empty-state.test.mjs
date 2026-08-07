import fs from 'node:fs';

const source = fs.readFileSync(new URL('./ClassDetailView.tsx', import.meta.url), 'utf8');
const assetsSource = fs.readFileSync(new URL('../assets/images.ts', import.meta.url), 'utf8');
const emptyStateSource = fs.readFileSync(new URL('../components/ui/MobileEmptyState.tsx', import.meta.url), 'utf8');

const requireText = (text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

requireText('const hasSearchQuery = searchQuery.trim().length > 0;', '搜索缺省图必须根据是否输入关键词选择语义。');
requireText('hasSearchQuery ? ASSETS.DEFAULT_STATE.MAGNIFIER : ASSETS.DEFAULT_STATE.CHAIR', '搜索无结果必须使用放大镜，学生为空必须使用椅子。');
requireText("hasSearchQuery ? '没有匹配的学生' : '暂无学生'", '学生列表空状态必须区分搜索无结果与没有学生。');
requireText('title="暂无分组"', '没有分组时必须显示明确文案。');
requireText('imageSrc={ASSETS.DEFAULT_STATE.CHAIR}', '没有分组时必须使用椅子缺省图。');
requireText('w-[68%] min-w-[178px] max-w-[224px]', '学生列表缺省图必须使用稳定尺寸。');
requireText('没有匹配的学生', '搜索无结果状态必须保留明确结果文案。');
requireText('className="flex-1 pb-14"', '学生缺省态必须在可用内容区居中展示。');
if (!assetsSource.includes('default-state-giraffe-magnifier-3d-color-v1.png') || !assetsSource.includes('default-state-giraffe-chair-3d-color-v1.png')) {
  throw new Error('教师手机端资源映射缺少放大镜或椅子缺省图。');
}
if (!emptyStateSource.includes('alt=""') || !emptyStateSource.includes('role="status"')) {
  throw new Error('通用缺省态组件必须保留装饰图片和状态语义。');
}

if (source.includes('border-dashed')) {
  throw new Error('学生搜索空状态不应继续使用虚线占位框。');
}

console.log('ClassDetailView empty-state assertions passed');
