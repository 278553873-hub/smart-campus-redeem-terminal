import React, { useState } from 'react';
import { DEFAULT_PRODUCT_IMAGE, getProductImage, getProductImageScale } from '../../../shared/productImage';
import { MobileCard } from '../../components/ui/MobileCard';
import MobileTag from '../../components/ui/MobileTag';
import type { VendingInventoryProduct } from '../../domain/vendingInventory';

const categoryTones = { stationery: 'blue', cultural: 'jade', toy: 'gold', snack: 'orange' } as const;
const customCategoryTones = ['blue', 'jade', 'gold', 'orange'] as const;

const getCategoryTone = (categoryId: string) => {
  if (!categoryId || categoryId === 'uncategorized') return 'neutral';
  if (Object.hasOwn(categoryTones, categoryId)) return categoryTones[categoryId as keyof typeof categoryTones];
  // 自定义分类按稳定编号配色，切换货柜和筛选不改变同一分类的颜色。
  const hash = Array.from(categoryId).reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 0);
  return customCategoryTones[hash % customCategoryTones.length];
};

export default function VendingInventoryProductCard({ product }: { product: VendingInventoryProduct }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageProduct = { image: product.image?.trim() === failedImage ? undefined : product.image };
  const imageSrc = getProductImage(imageProduct);
  return <MobileCard variant="flat" shape="subtle" padding="none">
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[var(--tm-space-4)] p-[var(--tm-space-4)]">
      <div className="aspect-square w-[calc(var(--tm-space-8)*2)] overflow-hidden rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)]">
        <img
          src={imageSrc}
          alt={`${product.productName}商品图`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
          style={{ scale: getProductImageScale(imageProduct) }}
          onError={imageSrc !== DEFAULT_PRODUCT_IMAGE ? () => setFailedImage(imageSrc) : undefined}
        />
      </div>
      <div className="min-w-0">
        <h2 className="break-words text-[length:var(--tm-font-size-card-title)] [font-weight:var(--tm-font-weight-semibold)] leading-relaxed">{product.productName}</h2>
        <div className="mt-[var(--tm-space-2)]">
          <MobileTag tone={getCategoryTone(product.categoryId)} size="meta">{product.categoryName}</MobileTag>
        </div>
      </div>
      <dl className="shrink-0 text-right tabular-nums">
        <dt className="sr-only">库存数量</dt>
        <dd className={`whitespace-nowrap text-[length:var(--tm-font-size-card-title)] [font-weight:var(--tm-font-weight-semibold)] leading-relaxed ${product.stock === 0 ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-primary)]'}`}>
          {product.stock}<span className="ml-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] tm-font-regular text-[var(--tm-text-secondary)]">件</span>
        </dd>
      </dl>
    </div>
  </MobileCard>;
}
