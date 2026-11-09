import type { MobileDateRange, MobileDateRangePreset, MobileDateRangeSelectionMode } from './mobileDatePickerModel';
import type { MobilePeriodOption, MobilePeriodType } from './MobilePeriodPicker';

interface CommonProps {
  shape?: 'default' | 'subtle';
  open: boolean;
  title?: string;
  onClose: () => void;
  confirmLabel?: string;
}
interface DateLimits { min?: string; max?: string }

export type MobileDateRangeSheetProps = CommonProps & DateLimits & {
  mode: 'range';
  currentTerm?: MobileDateRange;
  value: MobileDateRange;
  defaultSelectionMode?: MobileDateRangeSelectionMode;
  onConfirm: (range: MobileDateRange, selectionMode: MobileDateRangeSelectionMode) => void;
  showPresets?: boolean;
  presets?: ReadonlyArray<MobileDateRangePreset>;
  validate?: (range: MobileDateRange) => string;
};

export type MobileFixedDatePickerSheetProps = CommonProps & (
  | (DateLimits & { mode: 'single'; showTodayButton?: boolean; value: string; onConfirm: (date: string) => void })
  | { mode: MobilePeriodType; monthSelection?: 'grid' | 'wheel'; value: string; periods: MobilePeriodOption[]; currentPeriodId?: string; onConfirm: (id: string) => void }
);

export type MobileDatePickerSheetProps = MobileDateRangeSheetProps | MobileFixedDatePickerSheetProps;
