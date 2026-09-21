/**
 * 智能货柜格口容量规则（PC 学校管理后台「货柜超市」与终端货柜维护台共用）
 *
 * 左柜为出货货道（挂钩 / 弹簧 / 推杆），同款商品可叠放，默认上限 10 件；
 * 右柜为电子锁储物格，物理上单格只放得下 1 件商品，绑定商品即视为满格。
 *
 * 容量推导、库存收敛、告急判定统一走这里，避免各页面各自写死 10 件导致口径不一致。
 */

export type CabinetSide = 'left' | 'right';

/** 左柜出货货道默认容量（件） */
export const LEFT_CABINET_DEFAULT_CAPACITY = 10;

/** 右柜电子锁储物格容量（件）：单件格口，物理上限 1 件 */
export const RIGHT_CABINET_CAPACITY = 1;

interface ChannelCapacityLike {
  cabinet?: CabinetSide | string | null;
  maxStock?: number | null;
}

interface ChannelStockLike extends ChannelCapacityLike {
  stock?: number | null;
}

/** 是否为单件格口（右柜电子锁储物格） */
export const isSingleItemChannel = (channel: ChannelCapacityLike): boolean => channel.cabinet === 'right';

/** 格口容量：右柜固定 1 件，左柜取货道自身 maxStock（缺省 10 件） */
export const getChannelCapacity = (channel: ChannelCapacityLike): number => {
  if (isSingleItemChannel(channel)) return RIGHT_CABINET_CAPACITY;
  const declared = Number(channel.maxStock);
  return Number.isFinite(declared) && declared > 0 ? declared : LEFT_CABINET_DEFAULT_CAPACITY;
};

/** 把库存收敛到格口容量区间内：右柜只可能是 0（空）或 1（满格） */
export const clampChannelStock = (channel: ChannelCapacityLike, stock: number): number => {
  const requested = Number(stock);
  if (!Number.isFinite(requested)) return 0;
  return Math.min(Math.max(0, Math.trunc(requested)), getChannelCapacity(channel));
};

/** 库存告急判定：低于格口容量一半即预警（左柜 < 5 件，右柜仅在缺货时预警） */
export const isChannelStockWarning = (channel: ChannelStockLike): boolean => {
  const stock = Number(channel.stock);
  return (Number.isFinite(stock) ? stock : 0) < getChannelCapacity(channel) / 2;
};

/** 装填库存的最小件数：装 0 件等于没装；库存变 0 只由售卖产生，不需要人工填 */
export const CHANNEL_STOCK_MIN = 1;

/** 校验「装填库存」输入：不合法时返回给老师看的中文原因，合法返回 null */
export const validateChannelStockInput = (channel: ChannelCapacityLike, raw: unknown): string | null => {
  const capacity = getChannelCapacity(channel);
  const text = String(raw ?? '').trim();
  if (!text) return '请填写装填件数';
  if (!/^[0-9]+$/.test(text)) return '装填件数只能填整数';
  const requested = Number(text);
  if (requested < CHANNEL_STOCK_MIN) return '最少要装 ' + CHANNEL_STOCK_MIN + ' 件';
  if (requested > capacity) return '这一格最多装 ' + capacity + ' 件';
  return null;
};

/** 输入框清空时显示的提示文案：可填范围要在这里说清楚，而不是等输入后才报错 */
export const getChannelStockPlaceholder = (channel: ChannelCapacityLike): string => {
  const capacity = getChannelCapacity(channel);
  if (capacity === CHANNEL_STOCK_MIN) return '可填 ' + capacity + ' 件';
  return '可填 ' + CHANNEL_STOCK_MIN + ' ~ ' + capacity + ' 件';
};

/** 打开货道配置时的默认装填件数：正常带入当前库存，已卖光（0）时默认补满 */
export const getDefaultChannelStockInput = (channel: ChannelStockLike): number => {
  const capacity = getChannelCapacity(channel);
  const stock = Number(channel?.stock);
  if (!Number.isFinite(stock) || stock < CHANNEL_STOCK_MIN) return capacity;
  return Math.min(Math.trunc(stock), capacity);
};

