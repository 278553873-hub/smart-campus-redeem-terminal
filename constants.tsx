
import { Product, TermType } from './types';

export const EXCHANGE_RATE = 10; // 10积分 = 1校园币

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '校庆限量徽章',
    price: 5,
    image: '/assets/shop/shop_badge.png',
    stock: 50,
    type: 'standard',
    limitInfo: '每人限购3个',
    description: '闪闪发光的校庆限量版徽章，兑换后直接从货柜领取。'
  },
  {
    id: '2',
    name: '当一天的代理校长',
    price: 500,
    image: '/assets/shop/shop_principal.png',
    stock: 1,
    type: 'special',
    limitInfo: '每月限购1个',
    description: '体验一天校长的日常工作，参与学校决策。兑换后请联系班主任预约时间。'
  },
  {
    id: '3',
    name: '和校长合影一次',
    price: 50,
    image: '/assets/shop/shop_photo.png',
    stock: 10,
    type: 'special',
    limitInfo: '每周限购2个',
    description: '在校园荣誉墙前与校长合影留念。兑换后请联系班主任安排。'
  },
  {
    id: '4',
    name: '免作业卡（单科）',
    price: 100,
    image: '/assets/shop/shop_homework.png',
    stock: 5,
    type: 'special',
    limitInfo: '每学期限购1个',
    description: '可抵消一次单科家庭作业。兑换后需班主任核销确认。'
  },
  {
    id: '5',
    name: '智能成长笔记本',
    price: 15,
    image: '/assets/shop/shop_notebook.png',
    stock: 20,
    type: 'standard',
    description: '高品质纸张，记录奇思妙想。兑换后直接从货柜领取。'
  },
  {
    id: '6',
    name: '定制刻字钢笔',
    price: 120,
    image: '/assets/shop/shop_pen.png',
    stock: 10,
    type: 'standard',
    limitInfo: '每人限购1支',
    description: '书写流畅的定制版钢笔。兑换后直接从货柜领取。'
  },
  {
    id: '7',
    name: '太空舱双层文具盒',
    price: 65,
    image: '/assets/shop/shop_pencilcase.png',
    stock: 30,
    type: 'standard',
    description: '多功能太空主题文具盒。兑换后直接从货柜领取。'
  },
  {
    id: 's2',
    name: '星光书包',
    price: 150,
    image: '/assets/shop/shop_backpack.png',
    stock: 12,
    type: 'standard',
    limitInfo: '每学期限购1个',
    description: '大容量防水书包，护脊减负设计。兑换后直接从货柜领取。'
  },
  {
    id: 's3',
    name: '四色圆珠笔套装',
    price: 8,
    image: '/assets/shop/shop_colorpen.png',
    stock: 100,
    type: 'standard',
    description: '书写顺滑不卡墨，记笔记好帮手。兑换后直接从货柜领取。'
  },
  {
    id: 's4',
    name: '立体旋转地球仪',
    price: 88,
    image: '/assets/shop/shop_globe.png',
    stock: 8,
    type: 'standard',
    description: '高清无缝印刷，带LED夜灯功能。兑换后直接从货柜领取。'
  },
  {
    id: '8',
    name: '做一天体育老师助理',
    price: 300,
    image: '/assets/shop/shop_pe.png',
    stock: 2,
    type: 'special',
    limitInfo: '每月限购2个',
    description: '协助体育老师组织班级运动会。兑换后请联系体育老师。'
  },
  {
    id: '9',
    name: '自选座位一星期',
    price: 200,
    image: '/assets/shop/shop_seat.png',
    stock: 5,
    type: 'special',
    limitInfo: '每学期限购1个',
    description: '可以任意挑选自己的座位并保持一周。兑换后需班主任核销确认。'
  }
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
