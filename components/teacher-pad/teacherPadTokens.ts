import type { CSSProperties } from 'react';
import { teacherBrandCssVariables } from '../../mobile-app/styles/teacherMobileTokens';

/** Pad 只扩展设备布局令牌；品牌、字体、图标、圆角、状态沿用教师手机端唯一令牌源。 */
export const teacherPadCssVariables = {
 ...teacherBrandCssVariables,
 '--tm-sheet-max-width':'none',
 '--tp-page-gutter':'32px',
 '--tp-content-max':'1120px',
 '--tp-grid-gap':'24px',
 '--tp-navigation-height':'64px',
 '--tp-record-input-max':'640px',
 '--tp-tool-item-width':'104px',
 '--tp-tool-column-gap':'24px',
} as CSSProperties;
