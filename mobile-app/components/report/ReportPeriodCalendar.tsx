import React from 'react';
import MobilePeriodPicker from '../ui/MobilePeriodPicker';
import type { MoralEducationPeriodOption } from '../../services/moralEducationCockpitService';
export { periodTypeLabels } from '../ui/MobilePeriodPicker';
export const toMobilePeriodOptions = (periods: MoralEducationPeriodOption[]) => periods.map(period => ({
    ...period,
    schoolYear: Number(period.id.match(/^(\d{4})/)?.[1] ?? period.startDate.slice(0, 4)),
}));
/** 报表学年编号的兼容适配；日历展示由公共组件负责。 */
export default function ReportPeriodCalendar({ periods, selectedPeriodId, onSelect }: {
    periods: MoralEducationPeriodOption[]; selectedPeriodId: string; onSelect: (id: string) => void;
}) {
    return <MobilePeriodPicker shape="subtle" periods={toMobilePeriodOptions(periods)} selectedPeriodId={selectedPeriodId} onSelect={onSelect} />;
}
