// 形态只负责通用尺寸，档案与问卷通过 shape 显式选择，不在组件内判断业务。
export type FormBuilderShape = 'default' | 'subtle';

export const formBuilderShapes = {
  default: {
    card: 'rounded-[var(--tm-radius-card)]',
    row: 'rounded-[var(--tm-radius-control)]',
    inner: 'rounded-[var(--tm-radius-inner)]',
    control: 'rounded-[var(--tm-radius-control)]',
    segmentActive: 'rounded-[var(--tm-radius-control)]',
    cardGap: 'space-y-3',
    groupGap: 'space-y-4',
    listGap: 'space-y-2',
    sectionPadding: 'pb-4',
  },
  subtle: {
    card: 'rounded-[var(--tm-radius-card-compact)]',
    row: 'rounded-[var(--tm-radius-card-compact)]',
    inner: 'rounded-[var(--tm-radius-card-compact)]',
    control: 'rounded-[var(--tm-radius-control-compact)]',
    segmentActive: 'rounded-[var(--tm-form-segment-active-radius)]',
    cardGap: 'space-y-[var(--tm-layout-card-gap)]',
    groupGap: 'space-y-[var(--tm-layout-card-gap)]',
    listGap: 'space-y-[var(--tm-layout-list-gap-compact)]',
    sectionPadding: 'pb-[var(--tm-layout-card-gap)]',
  },
} as const;
