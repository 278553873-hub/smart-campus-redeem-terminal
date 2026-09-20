
import { Product, TermType } from './types';

export const EXCHANGE_RATE = 10; // 10积分 = 1校园币

/**
 * 演示用货柜商品：真实环境里由老师在后台逐个配置。
 * 这里按学校实际在售规模补足到 49 件标准商品，方便评估一屏 6 个时的分类、滚动与排序效果。
 * 没上传商品图的商品 image 留空，终端与后台会统一回退成默认商品图（文创超市图标）。
 * 价格刻意不按大小排列，用来验证终端「越贵的越靠下」这条规则真的生效。
 */
const shelfProduct = (
  id: string,
  name: string,
  price: number,
  category: string,
  stock: number,
  image = '',
): Product => ({ id, name, price, category, stock, image, type: 'standard' });

/** 特权类奖励：不是货柜里的实物商品，终端商品页不展示 */
const privilegeProduct = (
  id: string,
  name: string,
  price: number,
  stock: number,
  image: string,
): Product => ({ id, name, price, category: 'privilege', stock, image, type: 'special' });

export const MOCK_PRODUCTS: Product[] = [
  // 文具：13 件
  shelfProduct('s3', '四色圆珠笔套装', 8, 'stationery', 100, '/assets/shop/shop_colorpen.png'),
  shelfProduct('7', '太空舱双层文具盒', 65, 'stationery', 30, '/assets/shop/shop_pencilcase.png'),
  shelfProduct('6', '定制刻字钢笔', 120, 'stationery', 0, '/assets/shop/shop_pen.png'),
  shelfProduct('n01', '星空图案铅笔套装', 6, 'stationery', 60),
  shelfProduct('n02', '卡通橡皮擦三件套', 3, 'stationery', 80),
  shelfProduct('n03', '双头荧光笔（6 色）', 12, 'stationery', 45),
  shelfProduct('n04', '简约线圈笔记本', 9, 'stationery', 40),
  shelfProduct('n05', '磁性书签（4 枚）', 5, 'stationery', 0),
  shelfProduct('n06', '便携卷笔刀', 4, 'stationery', 70),
  shelfProduct('n07', '帆布笔袋', 22, 'stationery', 25),
  shelfProduct('n08', '护脊握笔器套装', 7, 'stationery', 50),
  shelfProduct('n09', '儿童安全剪刀', 10, 'stationery', 35),
  shelfProduct('n10', 'A4 文件夹（5 个）', 14, 'stationery', 30),

  // 文创：12 件
  shelfProduct('1', '校庆限量徽章', 5, 'cultural', 0, '/assets/shop/shop_badge.png'),
  shelfProduct('5', '智能成长笔记本', 15, 'cultural', 20, '/assets/shop/shop_notebook.png'),
  shelfProduct('s2', '星光书包', 150, 'cultural', 12, '/assets/shop/shop_backpack.png'),
  shelfProduct('n11', '校园明信片（6 张）', 6, 'cultural', 55),
  shelfProduct('n12', '校徽胸针', 12, 'cultural', 40),
  shelfProduct('n13', '手账胶带套装', 9, 'cultural', 48),
  shelfProduct('n14', '校园风景冰箱贴', 8, 'cultural', 33),
  shelfProduct('n15', '成长主题帆布袋', 28, 'cultural', 18),
  shelfProduct('n16', '限量纪念印章', 18, 'cultural', 15),
  shelfProduct('n17', '校园吉祥物钥匙扣', 10, 'cultural', 62),
  shelfProduct('n18', '笔记本礼盒装', 45, 'cultural', 9),
  shelfProduct('n19', '定制校服小熊', 88, 'cultural', 5),

  // 玩具：9 件
  shelfProduct('s4', '立体旋转地球仪', 88, 'toy', 8, '/assets/shop/shop_globe.png'),
  shelfProduct('n20', '磁力积木（48 片）', 65, 'toy', 14),
  shelfProduct('n21', '木质七巧板', 15, 'toy', 0),
  shelfProduct('n22', '迷你魔方', 12, 'toy', 0),
  shelfProduct('n23', '手摇发电机模型', 42, 'toy', 6),
  shelfProduct('n24', '太阳能小汽车', 35, 'toy', 10),
  shelfProduct('n25', '昆虫观察盒', 20, 'toy', 22),
  shelfProduct('n26', '拼图（120 片）', 25, 'toy', 16),
  shelfProduct('n27', '桌面保龄球', 30, 'toy', 12),

  // 零食：15 件
  shelfProduct('n28', '全麦饼干（1 包）', 2, 'snack', 0),
  shelfProduct('n29', '棒棒糖（1 支）', 2, 'snack', 0),
  shelfProduct('n30', '果冻（1 个）', 2, 'snack', 120),
  shelfProduct('n31', '每日坚果（1 包）', 3, 'snack', 90),
  shelfProduct('n32', '儿童牛奶（1 盒）', 3, 'snack', 100),
  shelfProduct('n33', '酸奶（1 盒）', 4, 'snack', 80),
  shelfProduct('n34', '肉松饼（1 个）', 4, 'snack', 66),
  shelfProduct('n35', '威化饼干（1 包）', 4, 'snack', 75),
  shelfProduct('n36', '汽水（1 瓶）', 4, 'snack', 58),
  shelfProduct('n37', '海苔（1 包）', 5, 'snack', 70),
  shelfProduct('n38', '奶酪棒（1 支）', 5, 'snack', 0),
  shelfProduct('n39', '果汁（1 瓶）', 5, 'snack', 0),
  shelfProduct('n40', '巧克力（1 块）', 6, 'snack', 44),
  shelfProduct('n41', '小蛋糕（1 个）', 6, 'snack', 26),
  shelfProduct('n42', '混合果干（1 包）', 8, 'snack', 30),

  // 特权：5 件，终端商品页不展示
  privilegeProduct('2', '当一天的代理校长', 500, 1, '/assets/shop/shop_principal.png'),
  privilegeProduct('3', '和校长合影一次', 50, 10, '/assets/shop/shop_photo.png'),
  privilegeProduct('4', '免作业卡（单科）', 100, 5, '/assets/shop/shop_homework.png'),
  privilegeProduct('8', '做一天体育老师助理', 300, 2, '/assets/shop/shop_pe.png'),
  privilegeProduct('9', '自选座位一星期', 200, 5, '/assets/shop/shop_seat.png'),
];

export const BANK_CONFIG = {
  DAILY_RATE: 0.0003, // 活期日利率 0.03% (年化约10.95%)
  get ANNUAL_RATE_TEXT() { return (this.DAILY_RATE * 365 * 100).toFixed(2) + '%'; },
  TERMS: [
    { type: 'current', days: 0, rate: 0.0003, min: 1, label: '活期存单', desc: '随存随取，按日计息' },
    { type: 'fixed', days: TermType.ONE_WEEK, rate: 0.01, min: 1, label: '定期存单-1周', desc: '满期固定利息1.0%' },
    { type: 'fixed', days: TermType.ONE_MONTH, rate: 0.08, min: 1, label: '定期存单-1月', desc: '满期固定利息8.0% (推荐)' },
    { type: 'fixed', days: TermType.HALF_YEAR, rate: 0.60, min: 1, label: '定期存单-半年', desc: '满期固定利息60.0% (高收益)' },
    { type: 'fixed', days: TermType.ONE_YEAR, rate: 1.50, min: 1, label: '定期存单-1年', desc: '满期固定利息150.0% (财富翻倍)' }
  ]
};
