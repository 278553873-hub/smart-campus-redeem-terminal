import React from 'react';
import MobileOptionPickerSheet, { type MobilePickerOption } from './MobileOptionPickerSheet';

export interface MobileGradePickerOption extends MobilePickerOption {
  stage?: MobileGradeStage;
}

export type MobileGradeStage = '小学' | '初中' | '高中';

interface MobileGradePickerSheetBaseProps {
  open: boolean;
  title?: string;
  options: ReadonlyArray<MobileGradePickerOption>;
  onClose: () => void;
  showAllGradesOption?: boolean;
  allGradesValue?: string;
  allGradesLabel?: React.ReactNode;
  showStageName?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  ariaLabel?: string;
}

interface MobileGradePickerSheetSingleProps extends MobileGradePickerSheetBaseProps {
  selectionMode?: 'single';
  value: string;
  onChange: (value: string) => void;
}

interface MobileGradePickerSheetMultipleProps extends MobileGradePickerSheetBaseProps {
  selectionMode: 'multiple';
  values: ReadonlyArray<string>;
  onSelectionChange?: (values: string[]) => void;
  onConfirm: (values: string[]) => void;
  confirmLabel?: string;
}

export type MobileGradePickerSheetProps =
  | MobileGradePickerSheetSingleProps
  | MobileGradePickerSheetMultipleProps;

const MobileGradePickerSheet: React.FC<MobileGradePickerSheetProps> = props => {
  const {
    title = '选择年级',
    options,
    showAllGradesOption = false,
    allGradesValue = 'all',
    allGradesLabel = '全部年级',
    showStageName = false,
  } = props;
  const concreteOptions = showAllGradesOption
    ? options.filter(option => option.value !== allGradesValue)
    : [...options];
  const displayOptions = showAllGradesOption
    ? [{ value: allGradesValue, label: allGradesLabel }, ...concreteOptions]
    : concreteOptions;
  const allGradeOptions = showAllGradesOption
    ? displayOptions.filter(option => option.value === allGradesValue)
    : [];
  const optionGroups = showStageName
    ? [
        { id: 'all-grades', stage: undefined, options: allGradeOptions },
        { id: 'other', stage: undefined, options: concreteOptions.filter(option => !option.stage) },
        ...(['小学', '初中', '高中'] as MobileGradeStage[]).map(stage => ({
          id: stage,
          stage,
          options: concreteOptions.filter(option => option.stage === stage),
        })),
      ].filter(group => group.options.length > 0)
    : [
        { id: 'all-grades', stage: undefined, options: allGradeOptions },
        { id: 'grades', stage: undefined, options: concreteOptions },
      ].filter(group => group.options.length > 0);

  return (
    <MobileOptionPickerSheet
      {...props}
      title={title}
      titleSpacing="inset"
      options={displayOptions}
      groups={optionGroups.map(group => ({ ...group, label: group.stage }))}
      exclusiveValue={showAllGradesOption ? allGradesValue : undefined}
    />
  );
};

export default MobileGradePickerSheet;
