import React from 'react';
import type { Student } from '../../types';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import MobileEmptyState from '../ui/MobileEmptyState';
import MobileSearchInput from '../ui/MobileSearchInput';
import { BackIcon, CloseIcon } from '../Icons';
import StudentCompactSelectGrid, { type StudentCompactSelectSection } from './StudentCompactSelectGrid';

interface MobileStudentPickerSheetProps {
  open: boolean;
  title?: string;
  size?: 'tall' | 'full';
  onClose: () => void;
  onBack?: () => void;
  searchValue: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sections: StudentCompactSelectSection[];
  isSelected: (studentId: string) => boolean;
  getSelectionDescription?: (student: Student) => string | undefined;
  onToggle: (studentId: string) => void;
  auxiliary?: React.ReactNode;
  selectAllAction?: {
    allSelected: boolean;
    disabled?: boolean;
    onToggle: () => void;
  };
  emptyImageSrc: string;
  emptyTitle: string;
  footer: React.ReactNode;
}

const MobileStudentPickerSheet: React.FC<MobileStudentPickerSheetProps> = ({
  open,
  title = '选择学生',
  size = 'tall',
  onClose,
  onBack,
  searchValue,
  onSearchChange,
  sections,
  isSelected,
  getSelectionDescription,
  onToggle,
  auxiliary,
  selectAllAction,
  emptyImageSrc,
  emptyTitle,
  footer,
}) => {
  const visibleStudentCount = sections.reduce((total, section) => total + section.students.length, 0);

  return (
    <MobileBottomSheet
      open={open}
      title={title}
      size={size}
      contentInset="compact"
      contentTone="plain"
      footerDivider={false}
      onClose={onClose}
      header={onBack ? (
        <header className="grid h-14 shrink-0 grid-cols-[44px_1fr_44px] items-center px-2">
          <button type="button" onClick={onBack} aria-label="返回上一步" className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
            <BackIcon className="h-5 w-5" />
          </button>
          <h2 className="truncate text-center text-[17px] font-semibold text-[var(--tm-text-primary)]">{title}</h2>
          <button type="button" onClick={onClose} aria-label={`关闭${title}`} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>
      ) : undefined}
      footer={footer}
    >
      <div className="min-h-full">
        <div className="sticky top-0 z-20 -mx-3 bg-[var(--tm-bg-surface)] px-3 py-2">
          <MobileSearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder="搜索姓名、学号"
            aria-label="搜索学生"
            density="compact"
            appearance="filled"
            fillTone="soft"
            containerClassName="flex min-h-11 items-center"
          />
        </div>
        {auxiliary}
        {selectAllAction && (
          <div className="student-compact-select-sections">
            <div className="student-compact-select-grid grid gap-2">
              <button
                type="button"
                onClick={selectAllAction.onToggle}
                disabled={selectAllAction.disabled}
                aria-pressed={selectAllAction.allSelected}
                className="student-compact-select-last-column flex min-h-11 items-center justify-end text-right text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] active:text-[var(--tm-brand-primary-pressed)] disabled:text-[var(--tm-text-disabled)]"
              >
                {selectAllAction.allSelected ? '取消全选' : '全选'}
              </button>
            </div>
          </div>
        )}
        {visibleStudentCount > 0 ? (
          <StudentCompactSelectGrid
            sections={sections}
            isSelected={isSelected}
            getSelectionDescription={getSelectionDescription}
            onToggle={onToggle}
            className="pt-1"
          />
        ) : (
          <MobileEmptyState imageSrc={emptyImageSrc} title={emptyTitle} className="min-h-[320px] py-4" />
        )}
      </div>
    </MobileBottomSheet>
  );
};

export default MobileStudentPickerSheet;
