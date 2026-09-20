import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');
const categorySource = readFileSync(new URL('../shared/productCategory.ts', import.meta.url), 'utf8');
const storeSource = readFileSync(new URL('../shared/shopCatalogStore.ts', import.meta.url), 'utf8');

const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};
const forbidText = (text, message) => {
  if (source.includes(text)) failures.push(message);
};

// 分类管理面板（从工具栏到「货道配置」面板之前），列序断言只在这段里找，避免误命中别处的同名文字
const categoriesPanelStart = source.indexOf('aria-label="分类列表工具栏"');
const categoriesPanelEnd = source.indexOf("{shopActiveTab === 'channels' && (", categoriesPanelStart);
const categoriesPanel =
  categoriesPanelStart >= 0 && categoriesPanelEnd > categoriesPanelStart
    ? source.slice(categoriesPanelStart, categoriesPanelEnd)
    : '';

// 1. 后台商品库与货柜机上架商品是同一份数据，分类改动才会在终端立刻生效
requireText("import { runShopCatalogAction } from '../shared/shopCatalogStore';", '分类改动应走共享分类数据。');
requireText("import { useShopCatalog } from './useShopCatalog';", '后台应订阅共享分类数据。');
requireText('const shopCatalog = useShopCatalog();', '后台分类表应来自共享分类数据，不能在页面里另存一份。');
requireText("import { MOCK_PRODUCTS } from '../constants';", '后台商品库应与终端使用同一份商品数据。');
requireText(".filter(product => product.type === 'standard')", '后台商品库只应包含货柜机在售的标准商品。');
forbidText('cindy.shopCatalog', '存储键应定义在 shared/shopCatalogStore，不能写在页面里。');
forbidText('shopCategories, setShopCategories] = useState([', '分类表应由共享分类数据持有，不能在页面里用 useState 维护。');

// 2. 页签：货道配置 / 商品管理 / 分类管理，「分类管理」排在「商品管理」后面
if (!/setShopActiveTab\('products'\)[\s\S]{0,600}?商品管理/.test(source)) {
  failures.push('商品页签文案应为「商品管理」。');
}
if (!/setShopActiveTab\('categories'\)[\s\S]{0,600}?分类管理/.test(source)) {
  failures.push('「分类管理」页签文案应挂在分类页签按钮上。');
}
const productsTabIndex = source.indexOf("setShopActiveTab('products')");
const categoriesTabIndex = source.indexOf("setShopActiveTab('categories')");
if (productsTabIndex < 0 || categoriesTabIndex < 0 || categoriesTabIndex < productsTabIndex) {
  failures.push('「分类管理」页签应排在「商品管理」后面。');
}
forbidText('基础商品库', '「基础商品库」应改名为「商品管理」。');
requireText("useState<'products' | 'categories' | 'channels'>", '货柜超市应包含「货道配置 / 商品管理 / 分类管理」三个页签。');
requireText("aria-selected={shopActiveTab === 'categories'}", '「分类管理」页签需要正确的选中态。');
requireText("{shopActiveTab === 'categories' && (", '缺少「分类管理」面板。');

// 3. 分类管理面板：列表、拖动排序、启用停用，且不解释实现细节
requireText('aria-label="分类列表工具栏"', '分类管理需要有明确的操作工具栏。');
// 拖动手柄独占最左一列（表头用 sr-only 说明），列序为：拖动排序 / 分类名称 / 商品数 / 启用状态 / 操作
const categoryColumns = [
  { header: 'sr-only">拖动排序<', label: '拖动排序' },
  { header: '>分类名称<', label: '分类名称' },
  { header: '>商品数<', label: '商品数' },
  { header: '>启用状态<', label: '启用状态' },
  { header: '>操作<', label: '操作' },
];
const categoryColumnIndexes = categoryColumns.map(column => categoriesPanel.indexOf(column.header));
categoryColumns.forEach((column, index) => {
  if (categoryColumnIndexes[index] < 0) failures.push('分类表缺少「' + column.label + '」列。');
});
if (
  categoryColumnIndexes.every(index => index >= 0) &&
  !categoryColumnIndexes.every((index, position) => position === 0 || index > categoryColumnIndexes[position - 1])
) {
  failures.push('分类表列序应为「拖动排序 / 分类名称 / 商品数 / 启用状态 / 操作」，拖动手柄在最左一列、启用状态在操作列左侧。');
}
if (categoriesPanel.includes('padStart')) {
  failures.push('分类顺序已经由拖拽位置表达，不需要再展示序号。');
}
forbidText('这里的顺序就是货柜机上分类标签的顺序', '分类管理页不应展示面向实现说明的提示文案。');
forbidText('停用的分类和分类下的商品不会出现在货柜机上', '停用只影响商品表单可选性，页面不应保留旧的说明文案。');
requireText('countShopCategoryProducts(shopProducts, shopCategories, shopProductCategories, category.id)', '分类的商品数应由共享规则统计。');
requireText('onChange={(checked) => handleToggleShopCategoryEnabled(category.id, checked)}', '分类应支持启用 / 停用。');
requireText('onDragStart={() => setDraggedShopCategoryId(category.id)}', '分类排序应支持拖动：拖动行时要记住被拖的是哪个分类。');
requireText('onDrop={() => handleDropShopCategory(index)}', '分类排序应支持拖动：落到目标行要按目标位置重排。');
requireText('onDragOver={(event) => event.preventDefault()}', '分类行要允许作为放置目标。');
requireText('onDragEnd={() => setDraggedShopCategoryId(null)}', '拖动结束要清掉拖动状态，避免行一直高亮。');
requireText("runShopCatalogAction({ type: 'reorderCategory', categoryId, toIndex })", '拖动排序应走共享分类数据的重排动作。');
requireText('draggedShopCategoryId === category.id ?', '拖动中的分类行要有可见的落点反馈。');
forbidText("handleMoveShopCategory", '排序已改为拖动，不应再保留上移 / 下移按钮。');
forbidText("direction: 'up' | 'down'", '排序已改为拖动，不应再保留上移 / 下移的方向参数。');
requireText('拖动排序手柄', '分类管理页要能看出来手柄可以拖动。');
requireText('ArrowUp', '拖动排序要保留键盘可用的兜底方式。');
if (!storeSource.includes("case 'reorderCategory'")) failures.push('拖动排序应落在共享分类数据的变更里。');
requireText('onClick={() => handleOpenShopCategoryModal(category)}', '分类应支持改名（编辑）。');

// 4. 新建 / 改名弹窗：名称 2~10 字，校验走共享规则
requireText('id="shop-category-form"', '缺少分类弹窗表单。');
requireText('validateShopCategoryName(shopCategoryNameInput, shopCategories, editingShopCategory?.id)', '分类名称校验应走共享规则。');
requireText('maxLength={SHOP_CATEGORY_NAME_MAX_LENGTH}', '分类名称输入长度上限应来自共享规则。');
requireText('role="alert"', '分类名称不合法时应有可被读屏读出的错误提示。');
requireText('handleOpenShopCategoryModal(category)', '编辑分类应带出当前分类。');
for (const rule of ['SHOP_CATEGORY_NAME_MIN_LENGTH = 2', 'SHOP_CATEGORY_NAME_MAX_LENGTH = 10']) {
  if (!categorySource.includes(rule)) failures.push('分类名称 2~10 字的规则应定义在 shared/productCategory。');
}

// 5. 分类下有商品不允许删除，且要说明原因
requireText('canDeleteShopCategory(categoryId, shopProducts, shopCategories, shopProductCategories)', '删除分类应走共享的删除校验。');
requireText('if (!deleteCheck.allowed)', '删除校验不通过时必须中断删除。');
requireText('Message.warning(deleteCheck.reason)', '不允许删除时要说明原因。');
requireText('deleteCheck.allowed ? (', '删除按钮应区分「可删除 / 不可删除」两种状态。');
if (!categorySource.includes('该分类下还有')) failures.push('删除校验应给出可读的拦截原因。');
if (!storeSource.includes("case 'removeCategory'")) failures.push('删除分类应落在共享分类数据的变更里。');

// 6. 商品挂分类：列表里只读展示，改分类只能进商品弹窗
requireText('aria-label="商品分类筛选"', '商品列表应可按分类筛选。');
forbidText('商品编号', '商品没有编号字段，商品管理列表不应展示商品编号。');
requireText(
  "getShopCategoryName(shopCategories, getShopProductCategoryId(item, shopProductCategories)) || '未分类'",
  '商品表的分类列应回显分类名（未分类时显示「未分类」），并且只读展示。',
);
forbidText('handleChangeShopProductCategory', '商品表不应支持行内改分类，分类归属统一在商品弹窗里维护。');
requireText('aria-label="商品分类"', '商品弹窗应能选择分类。');
requireText('category: shopCategoryInput', '保存商品时要把分类一起保存。');
requireText("type: 'assignProductCategory'", '商品分类归属应写入共享分类数据。');

// 7. 商品弹窗的分类选择框：可正常编辑，停用分类只做「不可选」标记
requireText('<form id="shop-product-form" className="pc-form"', '商品弹窗表单应使用可编辑态样式（白底），不能呈禁用态。');
requireText('options={getShopCategoryPickerOptions(shopCategories)', '商品弹窗的分类选项应走共享规则（停用分类不可选）。');
requireText('disabled: option.disabled', '停用的分类在商品弹窗里应标记为不可选。');
requireText('（已停用）', '停用的分类要有可读的「（已停用）」标记。');

console.log('分类规则来源：shared/productCategory.ts + shared/shopCatalogStore.ts（页面不重复实现）');

if (failures.length > 0) {
  for (const failure of failures) console.log('❌ ' + failure);
  throw new Error('货柜超市「分类管理」检查未通过');
}

console.log('✅ 货柜超市「分类管理」检查通过（新建 / 改名 / 拖动排序 / 启停 / 有商品不可删 / 商品分类只在弹窗里维护）');
