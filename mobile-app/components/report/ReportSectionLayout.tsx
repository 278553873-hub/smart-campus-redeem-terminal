import React from 'react';
import { normalizeClassReportOutline, type ClassReportOutlineItem } from '../../../shared/classReportOutline';

/** 根据外部布局配置渲染实际顺序，使视觉顺序与读屏、键盘顺序一致。 */
export default function ReportSectionLayout({ outline, children }: {
  outline?: ClassReportOutlineItem[];
  children: React.ReactNode;
}) {
  const sections = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<{ id: string }> => React.isValidElement<{ id: string }>(child),
  );
  if (!outline) return <>{sections}</>;
  const byId = new Map(sections.map(section => [section.props.id, section]));
  return <>{normalizeClassReportOutline(outline).filter(item => item.visible).map(item => byId.get(item.id))}</>;
}
