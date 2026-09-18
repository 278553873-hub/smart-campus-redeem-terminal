import fs from 'node:fs';

const css = fs.readFileSync(new URL('./pc-admin.css', import.meta.url), 'utf8');

const requireRule = (needle, message) => {
  if (!css.includes(needle)) {
    throw new Error(`[测试失败] pc-admin.css 缺少关键防错位规则: "${needle}"，原因: ${message}`);
  }
};

// 1. 验证全局Arco按钮inline-flex横向排列
requireRule('.arco-btn {', '必须全局约束arco-btn');
requireRule('display: inline-flex !important;', 'arco-btn必须全局设置为inline-flex避免块级子元素换行');
requireRule('flex-direction: row !important;', 'arco-btn必须强制水平横向排布');
requireRule('align-items: center !important;', 'arco-btn必须垂直居中对齐');

// 2. 验证svg行内块与防压缩
requireRule('.arco-btn > svg {', '必须约束按钮直接包含的SVG');
requireRule('display: inline-block !important;', 'SVG必须重置为inline-block防止Tailwind preflight的display:block造成强制换行');

// 3. 验证水平间距
requireRule('margin-left: 6px;', '图文之间必须自动保持合理的横向间距');

console.log('✅ PC后台按钮与SVG图标通用横排样式断言测试通过！');
