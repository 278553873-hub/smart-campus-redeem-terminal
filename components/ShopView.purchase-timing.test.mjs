import { readFileSync } from 'node:fs';

const shopSource = readFileSync(new URL('./ShopView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const previewControlsSource = readFileSync(new URL('./TerminalLoginMethodPreviewControls.tsx', import.meta.url), 'utf8');

const failures = [];

if (!shopSource.includes('onPurchase: (p: Product) => Promise<boolean>')) {
  failures.push('ShopView 的 onPurchase 应返回处理结果，不能只表示“已发起兑换”。');
}

if (!shopSource.includes('const purchaseSucceeded = await onPurchase(productToPurchase)')) {
  failures.push('ShopView 应等待父组件处理完成后，再判断是否显示兑换成功。');
}

if (/onPurchase\(confirmingProduct\);\s*setConfirmingProduct\(null\);\s*setShowSuccess\(true\)/s.test(shopSource)) {
  failures.push('ShopView 仍在发起兑换后立即显示成功提示，会和处理中加载层同时出现。');
}

if (!appSource.includes('const handlePurchase = async (product: Product): Promise<boolean>')) {
  failures.push('App.handlePurchase 应异步返回兑换是否成功。');
}

if (!appSource.includes('return await withLoading(() =>')) {
  failures.push('App.handlePurchase 应等待 withLoading 完成后再把结果返回给 ShopView。');
}

if (!shopSource.includes('isGuest?: boolean') || !shopSource.includes('onRequireLogin?: (product: Product, scrollTop: number) => void')) {
  failures.push('ShopView 应支持未登录浏览态，并提供兑换前登录回调。');
}

if (!shopSource.includes('if (isGuest)') || !shopSource.includes('onRequireLogin?.(product, scrollRef.current?.scrollTop ?? 0)')) {
  failures.push('未登录点击兑换时应先提示登录，不能进入支付确认或调用扣库存逻辑。');
}

if (!appSource.includes('查看商品') || !appSource.includes("setIsGuestBrowsing(true);") || !appSource.includes("navigateTo('shop')")) {
  failures.push('货柜机登录页应保留原有内容，并新增进入商品浏览页的入口。');
}

if (!appSource.includes('setReturnToShopAfterLogin(true)') || !appSource.includes('setShowStudentLoginModal(true)')) {
  failures.push('未登录点击商品后应在商品页打开登录弹窗，并记录登录后的返回目标。');
}

if (!appSource.includes('initialScrollTop={shopScrollTop}') || !appSource.includes('setShopScrollTop(scrollTop)') || !appSource.includes('setPendingPurchaseProductId(product.id)')) {
  failures.push('打开登录弹窗前应保存商品列表位置和待购买商品。');
}

if (!shopSource.includes('pendingPurchaseProductId') || !shopSource.includes('setConfirmingProduct(pendingProduct)')) {
  failures.push('登录成功后应继续打开原商品的购买确认。');
}

if (!appSource.includes("setLoginSubView(passwordLoginEnabled ? 'password' : 'face')")) {
  failures.push('购买前登录应在可用时默认密码登录，仅人脸场景应直接展示人脸识别。');
}

if (shopSource.includes('先浏览，再决定') || shopSource.includes('登录后即可兑换') || shopSource.includes('登录后兑换')) {
  failures.push('商品浏览页不应重复展示登录提示或解释性废话。');
}

if (shopSource.includes('星光超市') || shopSource.includes('isScrolled')) {
  failures.push('文创星光超市商品页不应保留顶部星光超市卡片或吸顶余额状态。');
}

if (!appSource.includes("view === 'shop' && !isGuestBrowsing") || !appSource.includes('GROWTH_COIN_TERMS.available') || !appSource.includes('student.campusCoins')) {
  failures.push('登录后的商品页应在返回首页标题栏中展示可用成长币余额，游客浏览态不展示余额。');
}

if (!appSource.includes('faceLoginEnabled') || !appSource.includes('passwordLoginEnabled')) {
  failures.push('登录页应根据学校配置决定展示刷脸或密码登录。');
}

if (!previewControlsSource.includes("type StudentLoginPreviewMode = 'face-only' | 'password-only' | 'both'") || !previewControlsSource.includes('货柜机登录方式预览')) {
  failures.push('Demo 应提供仅人脸、仅密码和两种方式三种登录样式预览。');
}

if (!appSource.includes("onFaceLogin={faceLoginEnabled ? () => setLoginSubView('face') : undefined}")) {
  failures.push('密码登录弹窗应仅在学校开放人脸识别时展示切换入口。');
}

if (!shopSource.includes('<button\n                  key={product.id}') || !shopSource.includes('onClick={() => handleOpenConfirm(product)}')) {
  failures.push('商品卡片整体应可点击，不能只允许点击价格区域。');
}

if (!appSource.includes("const TERMINAL_ENTRY_BUTTON_BASE = 'h-[72px]") || !appSource.includes('TERMINAL_ENTRY_BUTTON_TERTIARY')) {
  failures.push('登录页三个入口应复用 72px 高度的统一按钮基础样式，并通过三级样式区分。');
}

if (!shopSource.includes('`${product.name}，${product.price} ${GROWTH_COIN_TERMS.name}，兑换`')) {
  failures.push('商品兑换按钮应以商品价格为核心，并提供完整读屏名称。');
}

if (!appSource.includes('padding={8} safetyGap={32} maxScale={1.1}')) {
  failures.push('货柜机预览应保留适度安全间距，避免设备贴近页面底部。');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('shop purchase success timing assertions passed');
