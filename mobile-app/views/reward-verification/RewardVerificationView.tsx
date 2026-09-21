import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, Gift, History, Pencil, Plus, Trash2 } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileDangerConfirmSheet from '../../components/ui/MobileDangerConfirmSheet';
import MobileRadioOptionCard from '../../components/ui/MobileRadioOptionCard';
import MobileSearchInput from '../../components/ui/MobileSearchInput';
import { SearchIcon, MaleIcon, FemaleIcon, MenuIcon, CircleIcon } from '../../components/Icons';
import StudentRosterNumber from '../../components/student/StudentRosterNumber';
import { GROWTH_COIN_TERMS } from '../../../shared/growthCoinTerminology';
import { formatCoinAmount } from '../../utils/coinFormat';
import { GET_MOCK_CAMPUS_COIN_DETAIL } from '../../constants';
import type { ClassInfo, Student } from '../../types';
import type { TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import {
  DEFAULT_COIN_CLEAR_SCOPE,
  buildCoinClearShares,
  sumCoinLedgerShares,
  type CampusCoinClearScope,
  type CampusCoinLedgerShare,
} from '../../domain/campusCoinLedger';

interface RewardVerificationViewProps {
  classInfo: ClassInfo;
  currentSpace: TeacherSpaceOption;
  students: Student[];
  onBack: () => void;
  onViewExchangeRecords: () => void;
  /** 兑换成功后写入成长币记录，一条记录对应一次操作（可能包含多名学生）。 */
  onRecordCoinRedeem: (productName: string, shares: CampusCoinLedgerShare[]) => void;
  /** 清空学生成长币后写入成长币记录，便于老师、学生和家长追溯。 */
  onRecordCoinClear: (shares: CampusCoinLedgerShare[]) => void;
}

interface ClassGood {
  id: string;
  name: string;
  price: number;
  icon: RewardIconKey;
}

type RewardIconKey = 'food' | 'stationery' | 'toy' | 'experience' | 'honor';

const REWARD_ICON_OPTIONS: ReadonlyArray<{ key: RewardIconKey; label: string; src: string }> = [
  { key: 'food', label: '食物饮料', src: '/assets/teacher-mobile/reward-icons/food.jpg' },
  { key: 'stationery', label: '文具', src: '/assets/teacher-mobile/reward-icons/stationery.jpg' },
  { key: 'toy', label: '玩具', src: '/assets/teacher-mobile/reward-icons/toy.jpg' },
  { key: 'experience', label: '体验', src: '/assets/teacher-mobile/reward-icons/experience.jpg' },
  { key: 'honor', label: '荣誉', src: '/assets/teacher-mobile/reward-icons/honor.jpg' },
];

const getRewardIcon = (key: RewardIconKey) => REWARD_ICON_OPTIONS.find(option => option.key === key) ?? REWARD_ICON_OPTIONS[0];

const RewardIconAvatar: React.FC<{ icon: RewardIconKey; size?: 'sm' | 'md' }> = ({ icon, size = 'md' }) => {
  const option = getRewardIcon(icon);
  const sizeClass = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
  return (
    <span className={`shrink-0 overflow-hidden rounded-[var(--tm-radius-control)] ${sizeClass}`}>
      <img src={option.src} alt="" aria-hidden="true" className="h-full w-full object-cover" />
    </span>
  );
};

interface RewardStudent extends Student {
  /** 可用成长币：兑换奖励与“只清可用”时扣减这一项。 */
  campusCoins: number;
  /** 已存（银行）成长币：只有“清空可用+已存”的口径才会一起扣减。 */
  campusBankCoins: number;
}

type SheetMode = 'redeem' | 'manage' | 'edit' | null;

const INITIAL_GOODS: ClassGood[] = [
  { id: 'g1', name: '免写一次语文作业', price: 100, icon: 'experience' },
  { id: 'g2', name: '做一天班长体验券', price: 300, icon: 'experience' },
  { id: 'g3', name: '与校长共进午餐1次', price: 500, icon: 'food' },
  { id: 'g4', name: '精美笔记本一本', price: 150, icon: 'stationery' },
  { id: 'g5', name: '黑色中性笔一支', price: 50, icon: 'stationery' },
];

const inputClass = 'h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100 read-only:border-[var(--tm-input-readonly-border)] read-only:bg-[var(--tm-input-readonly-bg)] read-only:text-[var(--tm-input-readonly-text)]';

const RewardVerificationView: React.FC<RewardVerificationViewProps> = ({
  classInfo,
  currentSpace,
  students: classStudents,
  onBack,
  onViewExchangeRecords,
  onRecordCoinRedeem,
  onRecordCoinClear,
}) => {
  const [students, setStudents] = useState<RewardStudent[]>(() => classStudents.map(student => {
    const coinDetail = GET_MOCK_CAMPUS_COIN_DETAIL(student);
    return { ...student, campusCoins: coinDetail.balance, campusBankCoins: coinDetail.bankDeposit };
  }));
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [goods, setGoods] = useState<ClassGood[]>(INITIAL_GOODS);
  const [draftGoods, setDraftGoods] = useState<ClassGood[]>([]);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [feedback, setFeedback] = useState('');
  const [statusToast, setStatusToast] = useState('');

  // 工具栏与批量选择状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isBatchSelectionMode, setIsBatchSelectionMode] = useState(false);
  const [isClearSelection, setIsClearSelection] = useState(false);
  const [clearSelectedIds, setClearSelectedIds] = useState<Set<string>>(new Set());
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // 清空口径默认“可用 + 已存”，老师误点清空时损失最大，必须在确认前把两部分金额都摆出来。
  const [clearScope, setClearScope] = useState<CampusCoinClearScope>(DEFAULT_COIN_CLEAR_SCOPE);

  const selectedStudents = useMemo(
    () => students.filter(student => selectedStudentIds.has(student.id)),
    [selectedStudentIds, students],
  );

  const visibleStudents = useMemo(() => {
    const normalized = searchQuery.trim().replace(/\s+/g, '').toLowerCase();
    return students.filter(student => !normalized
      || student.name.includes(normalized)
      || student.id.toLowerCase().includes(normalized)
      || (student.studentNo || '').toLowerCase().includes(normalized));
  }, [searchQuery, students]);

  const studentsByGender = useMemo(() => ({
    male: students.filter(student => student.gender === 'male'),
    female: students.filter(student => student.gender === 'female'),
  }), [students]);

  const activeSelectionIds = isClearSelection ? clearSelectedIds : selectedStudentIds;

  // 清空预览：按当前口径算出每名学生会被扣掉的可用与已存金额，供底部合计与二次确认使用。
  const clearSharePreview = useMemo(() => buildCoinClearShares(
    students
      .filter(student => clearSelectedIds.has(student.id))
      .map(student => ({
        studentId: student.id,
        studentName: student.name,
        availableAmount: student.campusCoins,
        bankAmount: student.campusBankCoins,
      })),
    clearScope,
  ), [clearSelectedIds, clearScope, students]);

  const clearTotalAmount = useMemo(() => sumCoinLedgerShares(clearSharePreview), [clearSharePreview]);
  const clearBankAmount = useMemo(
    () => clearSharePreview.reduce((total, share) => total + (share.bankAmount ?? 0), 0),
    [clearSharePreview],
  );
  const clearAvailableAmount = clearTotalAmount - clearBankAmount;

  /** 选中学生里是否有已存可清：没有就不展示口径选择，避免“已存 0 不受影响”这类废话。 */
  const hasBankToClear = clearBankAmount > 0;
  const hasAvailableToClear = clearAvailableAmount > 0;

  // 可用和已存都是成长币，统一挂成长币图标，不再用银行图标区分。
  const renderClearAmount = (amount: number) => (
    <span className="inline-flex items-center gap-1 align-middle">
      <img src="/assets/coin.png" alt="" aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      <strong className="font-semibold tabular-nums text-[var(--tm-text-primary)]">{formatCoinAmount(amount)}</strong>
    </span>
  );

  // 选项只回答“这次清掉多少”，已存明细单独一行，避免把同一笔金额说两遍。
  const clearScopeOptions: ReadonlyArray<{ value: CampusCoinClearScope; title: string; description: React.ReactNode }> = [
    {
      value: 'available',
      title: `只清空${GROWTH_COIN_TERMS.available}`,
      description: hasAvailableToClear
        ? <>{renderClearAmount(clearAvailableAmount)}{' 清零'}</>
        : '没有可用成长币可清',
    },
    {
      value: 'all',
      title: `${GROWTH_COIN_TERMS.available}和${GROWTH_COIN_TERMS.saved}一起清空`,
      description: <>{renderClearAmount(clearTotalAmount)}{' 清零'}</>,
    },
  ];

  const isAllVisibleSelected = useMemo(() => (
    visibleStudents.length > 0 && visibleStudents.every(student => activeSelectionIds.has(student.id))
  ), [activeSelectionIds, visibleStudents]);

  const isMaleQuickSelectionActive = studentsByGender.male.length > 0
    && activeSelectionIds.size === studentsByGender.male.length
    && studentsByGender.male.every(student => activeSelectionIds.has(student.id));
  const isFemaleQuickSelectionActive = studentsByGender.female.length > 0
    && activeSelectionIds.size === studentsByGender.female.length
    && studentsByGender.female.every(student => activeSelectionIds.has(student.id));

  const updateActiveSelection = (next: Set<string>) => {
    if (isClearSelection) {
      setClearSelectedIds(next);
      return;
    }
    setSelectedStudentIds(next);
  };

  const toggleStudentSelection = (studentId: string) => {
    if (isClearSelection) {
      setClearSelectedIds(current => {
        const next = new Set(current);
        next.has(studentId) ? next.delete(studentId) : next.add(studentId);
        return next;
      });
      return;
    }
    setSelectedStudentIds(current => {
      const next = new Set(current);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    const next = new Set(activeSelectionIds);
    visibleStudents.forEach(student => next.add(student.id));
    updateActiveSelection(next);
  };

  const handleClearVisible = () => {
    const visibleIds = new Set(visibleStudents.map(student => student.id));
    const next = new Set(Array.from(activeSelectionIds).filter(id => !visibleIds.has(id)));
    updateActiveSelection(next);
  };

  const handleInvertVisible = () => {
    const next = new Set(activeSelectionIds);
    visibleStudents.forEach(student => {
      if (next.has(student.id)) next.delete(student.id);
      else next.add(student.id);
    });
    updateActiveSelection(next);
  };

  const handleToggleGenderSelection = (gender: Student['gender']) => {
    const genderStudents = studentsByGender[gender];
    const isActive = gender === 'male' ? isMaleQuickSelectionActive : isFemaleQuickSelectionActive;
    updateActiveSelection(isActive ? new Set() : new Set(genderStudents.map(student => student.id)));
  };

  const toggleBatchSelection = () => {
    if (isClearSelection) return;
    if (!isBatchSelectionMode) setSearchQuery('');
    setIsBatchSelectionMode(current => !current);
  };

  const exitBatchSelection = () => {
    setIsBatchSelectionMode(false);
    setSearchQuery('');
  };

  const startClearSelection = () => {
    setShowMoreActions(false);
    setIsBatchSelectionMode(false);
    setIsClearSelection(true);
    setClearSelectedIds(new Set());
    setClearScope(DEFAULT_COIN_CLEAR_SCOPE);
    setSearchQuery('');
  };

  const cancelClearSelection = () => {
    setIsClearSelection(false);
    setClearSelectedIds(new Set());
    setSearchQuery('');
  };

  const openClearConfirm = () => {
    if (clearSelectedIds.size === 0) return;
    // 每次进入确认都回到默认口径，避免沿用上一次的危险选择。
    setClearScope(DEFAULT_COIN_CLEAR_SCOPE);
    setShowClearConfirm(true);
  };

  const confirmClearCoins = () => {
    const count = clearSelectedIds.size;
    const clearedShares = buildCoinClearShares(
      students
        .filter(student => clearSelectedIds.has(student.id))
        .map(student => ({
          studentId: student.id,
          studentName: student.name,
          availableAmount: student.campusCoins,
          bankAmount: student.campusBankCoins,
        })),
      clearScope,
    );
    if (clearedShares.length > 0) onRecordCoinClear(clearedShares);
    setStudents(current => current.map(student => (clearSelectedIds.has(student.id)
      ? {
        ...student,
        campusCoins: 0,
        campusBankCoins: clearScope === 'all' ? 0 : student.campusBankCoins,
      }
      : student)));
    setShowClearConfirm(false);
    setIsClearSelection(false);
    setClearSelectedIds(new Set());
    setStatusToast(clearScope === 'all'
      ? `已清空 ${count} 名学生的全部${GROWTH_COIN_TERMS.name}`
      : `已清空 ${count} 名学生的${GROWTH_COIN_TERMS.available}${GROWTH_COIN_TERMS.name}`);
  };

  useEffect(() => {
    if (!statusToast) return undefined;
    const timer = window.setTimeout(() => setStatusToast(''), 1600);
    return () => window.clearTimeout(timer);
  }, [statusToast]);

  const openRedeemSheet = () => {
    if (selectedStudentIds.size === 0) return;
    setFeedback('');
    setSheetMode('redeem');
  };

  const redeemGood = (good: ClassGood) => {
    const insufficientStudents = selectedStudents.filter(student => student.campusCoins < good.price);
    if (insufficientStudents.length > 0) {
      setFeedback(`${insufficientStudents.map(student => student.name).join('、')}余额不足`);
      return;
    }
    onRecordCoinRedeem(good.name, selectedStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      amount: good.price,
    })));
    setStudents(current => current.map(student => selectedStudentIds.has(student.id)
      ? { ...student, campusCoins: student.campusCoins - good.price }
      : student));
    setSelectedStudentIds(new Set());
    setSheetMode(null);
    setStatusToast('兑换成功');
  };

  const startEditing = () => {
    setDraftGoods(goods.map(good => ({ ...good })));
    setSheetMode('edit');
  };

  const saveGoods = () => {
    setGoods(draftGoods.filter(good => good.name.trim() && good.price > 0));
    setSheetMode('manage');
  };

  const updateDraft = (id: string, patch: Partial<ClassGood>) => {
    setDraftGoods(current => current.map(good => good.id === id ? { ...good, ...patch } : good));
  };

  const addDraft = () => {
    setDraftGoods(current => [{ id: `g-${Date.now()}`, name: '', price: 50, icon: 'food' }, ...current]);
  };

  const sheetTitle = sheetMode === 'redeem' ? '选择兑换奖励' : sheetMode === 'edit' ? '批量编辑奖品' : '设置班级奖励';
  const renderToolbar = () => {
    // 批量兑换与清空成长币共用同一套多选工具栏，只有退出动作和底部主按钮不同。
    if (isBatchSelectionMode || isClearSelection) {
      const exitSelection = isClearSelection ? cancelClearSelection : exitBatchSelection;
      return (
        <div className="flex min-h-11 items-center gap-1">
          <div className="relative w-11 flex-none text-left opacity-70">
            <button
              type="button"
              onClick={exitSelection}
              aria-label="恢复搜索"
              className="flex h-11 w-11 items-center justify-center rounded-full"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white [box-shadow:var(--tm-shadow-control)]">
                <SearchIcon className="h-4 w-4 text-[var(--tm-text-disabled)]" />
              </span>
            </button>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={isAllVisibleSelected ? handleClearVisible : handleSelectAllVisible}
              className="flex min-h-11 shrink-0 items-center justify-center p-0 text-[13px] font-semibold text-[var(--tm-text-secondary)]"
            >
              <span className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white px-3 [box-shadow:var(--tm-shadow-control)]">
                {isAllVisibleSelected ? '取消全选' : '全选'}
              </span>
            </button>
            <button
              type="button"
              onClick={handleInvertVisible}
              className="flex min-h-11 shrink-0 items-center justify-center p-0 text-[13px] font-semibold text-[var(--tm-text-secondary)]"
            >
              <span className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white px-3 [box-shadow:var(--tm-shadow-control)]">反选</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleGenderSelection('male')}
              aria-label={isMaleQuickSelectionActive ? '取消全选男生' : '全选男生'}
              aria-pressed={isMaleQuickSelectionActive}
              className="flex h-11 w-11 shrink-0 items-center justify-center"
            >
              <span className={`flex h-8 w-10 items-center justify-center rounded-full border transition-colors [transition-duration:var(--tm-duration-standard)] [box-shadow:var(--tm-shadow-control)] ${isMaleQuickSelectionActive ? 'border-[var(--tm-gender-male-selection-bg)] bg-[var(--tm-gender-male-selection-bg)] text-white' : 'border-[var(--tm-border-subtle)] bg-white text-[var(--tm-gender-male)]'}`}>
                <MaleIcon className="h-4 w-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleGenderSelection('female')}
              aria-label={isFemaleQuickSelectionActive ? '取消全选女生' : '全选女生'}
              aria-pressed={isFemaleQuickSelectionActive}
              className="flex h-11 w-11 shrink-0 items-center justify-center"
            >
              <span className={`flex h-8 w-10 items-center justify-center rounded-full border transition-colors [transition-duration:var(--tm-duration-standard)] [box-shadow:var(--tm-shadow-control)] ${isFemaleQuickSelectionActive ? 'border-[var(--tm-gender-female-selection-bg)] bg-[var(--tm-gender-female-selection-bg)] text-white' : 'border-[var(--tm-border-subtle)] bg-white text-[var(--tm-gender-female)]'}`}>
                <FemaleIcon className="h-4 w-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={exitSelection}
              className="min-h-11 shrink-0 px-2 text-[13px] font-semibold text-[var(--tm-text-secondary)]"
            >
              取消
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-11 items-center gap-1.5">
        <div className="min-w-0 flex-1 text-left">
          <MobileSearchInput
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="搜索姓名、学号"
            aria-label="搜索学生"
            density="compact"
            appearance="filled"
            containerClassName="flex min-h-11 items-center"
          />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleBatchSelection}
            className="min-h-11 shrink-0 rounded-[var(--tm-radius-control)] px-2.5 text-[13px] font-semibold text-[var(--tm-text-primary)]"
          >
            多选
          </button>
          <button
            type="button"
            onClick={() => setShowMoreActions(true)}
            aria-label="更多操作"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)]"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回班级列表">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">兑换奖励</h1>
      </header>

      <div className="shrink-0 border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] py-1">
        {renderToolbar()}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-28 pt-3 no-scrollbar">
        <div className="student-roster-grid grid shrink-0 gap-x-2.5 gap-y-3">
          {visibleStudents.map(student => {
            const selected = activeSelectionIds.has(student.id);
            const studentNo = student.studentNo || student.id;
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => toggleStudentSelection(student.id)}
                aria-pressed={selected}
                className="relative flex w-full min-w-0 select-none flex-col items-center overflow-visible rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] py-2 text-center [box-shadow:var(--tm-shadow-card)]"
              >
                <span className={`absolute -right-1 -top-1 z-20 flex h-[18px] w-[18px] items-center justify-center rounded-full ${selected ? 'bg-[var(--tm-brand-primary)]' : 'bg-white'}`}>
                  {selected
                    ? <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    : <CircleIcon className="h-[18px] w-[18px] fill-white text-[var(--tm-border-subtle)]" />}
                </span>
                <img src={student.avatar} alt="" className="h-11 w-11 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover" />
                <span className="mt-1.5 flex h-[var(--tm-student-card-identity-height)] w-full shrink-0 items-center justify-center px-0.5">
                  <span className="inline-flex min-w-0 max-w-full items-center justify-center gap-0.5">
                    <StudentRosterNumber studentNo={studentNo} ariaLabel={`学号${studentNo}`} variant="student-card" className="self-center" />
                    <span className="block min-w-0 max-w-[52px] truncate text-[length:var(--tm-student-card-name-font-size)] [font-weight:var(--tm-student-card-name-font-weight)] leading-4 text-[var(--tm-text-primary)]">{student.name}</span>
                  </span>
                </span>
                <span className="mt-1 flex items-center gap-1 text-[length:var(--tm-font-size-meta)] font-semibold tabular-nums text-[var(--tm-text-primary)]">
                  <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
                  <span className="sr-only">{GROWTH_COIN_TERMS.available}{formatCoinAmount(student.campusCoins)}{GROWTH_COIN_TERMS.name}</span>
                  <span aria-hidden="true">{formatCoinAmount(student.campusCoins)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isClearSelection ? (
        <footer className="absolute inset-x-0 bottom-0 z-30 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)] backdrop-blur-xl">
          <button
            type="button"
            disabled={clearSelectedIds.size === 0}
            onClick={openClearConfirm}
            className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-status-negative-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
          >
            清空{GROWTH_COIN_TERMS.name}{clearSelectedIds.size > 0 ? `（${clearSelectedIds.size}人）` : ''}
          </button>
        </footer>
      ) : (
        <footer className="absolute inset-x-0 bottom-0 z-30 flex gap-[var(--tm-space-2)] border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)] backdrop-blur-xl">
          <button type="button" onClick={() => setSheetMode('manage')} className="flex min-h-[var(--tm-size-touch)] shrink-0 items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-reward-soft)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-reward-strong)] active:bg-[var(--tm-bg-surface-muted)]">
            <Gift className="h-[18px] w-[18px]" />设置奖励
          </button>
          <button type="button" disabled={selectedStudentIds.size === 0} onClick={openRedeemSheet} className="flex min-h-[var(--tm-size-touch)] min-w-0 flex-1 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">去兑换{selectedStudentIds.size > 0 ? `（${selectedStudentIds.size}人）` : ''}</button>
        </footer>
      )}

      <MobileBottomSheet open={showMoreActions} title="更多操作" onClose={() => setShowMoreActions(false)}>
        <div className="space-y-1 pb-2">
          <button
            type="button"
            onClick={() => {
              setShowMoreActions(false);
              onViewExchangeRecords();
            }}
            className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"
          >
            <History className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" />
            {GROWTH_COIN_TERMS.name}记录
          </button>
          <button
            type="button"
            onClick={startClearSelection}
            className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative)]"
          >
            <Trash2 className="h-5 w-5 text-[var(--tm-status-negative)]" />
            清空{GROWTH_COIN_TERMS.name}
          </button>
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={sheetMode !== null} title={sheetTitle} onClose={() => setSheetMode(null)}>
        {sheetMode === 'redeem' && (
          <div className="space-y-[var(--tm-space-2)]">
            <p className="text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">已选择 {selectedStudentIds.size} 名学生</p>
            {feedback && <p role="alert" className="rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative-soft)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-status-negative-strong)]">{feedback}</p>}
            {goods.map(good => {
              const canAfford = selectedStudents.every(student => student.campusCoins >= good.price);
              return (
                <div key={good.id} className="flex min-h-[68px] items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-3)]">
                  <RewardIconAvatar icon={good.icon} />
                  <span className="min-w-0 flex-1"><strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{good.name}</strong><small className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-reward-strong)]">{formatCoinAmount(good.price)} {GROWTH_COIN_TERMS.name} / 人</small></span>
                  <button type="button" disabled={!canAfford} onClick={() => redeemGood(good)} className="min-h-[var(--tm-size-touch)] shrink-0 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">{canAfford ? '兑换' : '余额不足'}</button>
                </div>
              );
            })}
          </div>
        )}

        {sheetMode === 'manage' && (
          <div>
            <div className="space-y-[var(--tm-space-2)]">
              {goods.map(good => <div key={good.id} className="flex items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-3)]"><RewardIconAvatar icon={good.icon} /><span className="min-w-0 flex-1"><strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{good.name}</strong><small className="font-semibold text-[var(--tm-brand-reward-strong)]">{formatCoinAmount(good.price)} {GROWTH_COIN_TERMS.name}</small></span></div>)}
            </div>
            <button type="button" onClick={startEditing} className="mt-[var(--tm-space-4)] flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary)]"><Pencil className="h-[18px] w-[18px]" />批量编辑奖品</button>
          </div>
        )}

        {sheetMode === 'edit' && (
          <div>
            <button type="button" onClick={addDraft} className="mb-[var(--tm-space-3)] flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] border border-dashed border-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary)]"><Plus className="h-[18px] w-[18px]" />新增奖品</button>
            <div className="space-y-[var(--tm-space-3)]">
              {draftGoods.map(good => (
                <div key={good.id} className="rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-3)]">
                  <div className="grid grid-cols-[minmax(0,1fr)_44px] gap-[var(--tm-space-2)]">
                    <input value={good.name} onChange={event => updateDraft(good.id, { name: event.target.value })} className={inputClass} placeholder="奖品名称" aria-label="奖品名称" />
                    <button type="button" onClick={() => setDraftGoods(current => current.filter(item => item.id !== good.id))} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-soft)]" aria-label={`删除${good.name || '奖品'}`}><Trash2 className="h-[18px] w-[18px]" /></button>
                  </div>
                  <div className="mt-[var(--tm-space-2)] flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label={`${good.name || '新奖品'}图标`}>
                    {REWARD_ICON_OPTIONS.map(option => {
                      const selected = good.icon === option.key;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={option.label}
                          onClick={() => updateDraft(good.id, { icon: option.key })}
                          className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-[var(--tm-radius-control)] ${selected ? 'ring-2 ring-inset ring-[var(--tm-brand-primary)]' : 'opacity-65 active:opacity-100'}`}
                        >
                          <img src={option.src} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                          {selected && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--tm-brand-primary)] text-[10px] text-[var(--tm-text-inverse)]"><Check className="h-3 w-3" /></span>}
                        </button>
                      );
                    })}
                  </div>
                  <label className="mt-[var(--tm-space-2)] grid grid-cols-[44px_minmax(0,1fr)] items-center gap-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]"><span>售价</span><input type="number" min="1" value={good.price} onChange={event => updateDraft(good.id, { price: Number(event.target.value) })} className={inputClass} /></label>
                </div>
              ))}
            </div>
            <button type="button" onClick={saveGoods} className="mt-[var(--tm-space-4)] flex min-h-[var(--tm-size-touch)] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)]">完成</button>
          </div>
        )}
      </MobileBottomSheet>

      <MobileDangerConfirmSheet
        open={showClearConfirm}
        title={`清空${GROWTH_COIN_TERMS.name}`}
        description={`将清空 ${clearSelectedIds.size} 名学生的${GROWTH_COIN_TERMS.name}，已有的评价记录和积分不受影响。`}
        confirmLabel="确认清空"
        acknowledgeLabel="清空后不可恢复，我已知晓"
        onConfirm={confirmClearCoins}
        onClose={() => setShowClearConfirm(false)}
      >
        {hasBankToClear && (
          <div className="grid gap-[var(--tm-space-2)]" role="radiogroup" aria-label="选择清空范围">
            {clearScopeOptions.map(option => (
              <MobileRadioOptionCard
                key={option.value}
                id={`coin-clear-scope-${option.value}`}
                title={option.title}
                description={option.description}
                selected={clearScope === option.value}
                onSelect={() => setClearScope(option.value)}
              />
            ))}
          </div>
        )}

        {hasBankToClear && (
          <dl className="rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-3)] py-[var(--tm-space-2)]">
            <div className="flex items-center justify-between gap-[var(--tm-space-3)]">
              <dt className="text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{GROWTH_COIN_TERMS.saved}</dt>
              <dd className="flex items-center gap-1 text-[length:var(--tm-font-size-compact)] font-semibold tabular-nums text-[var(--tm-text-primary)]">
                <img src="/assets/coin.png" alt="" aria-hidden="true" className="h-4 w-4 shrink-0" />
                {formatCoinAmount(clearBankAmount)}
              </dd>
            </div>
          </dl>
        )}
      </MobileDangerConfirmSheet>

      {statusToast && <div role="status" className="pointer-events-none absolute inset-x-[var(--tm-space-4)] top-[calc(var(--tm-size-touch)+var(--tm-space-4))] z-50 flex min-h-[var(--tm-size-touch)] items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-chart-tooltip)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-floating)]"><Check className="h-[18px] w-[18px]" />{statusToast}</div>}
    </div>
  );
};

export default RewardVerificationView;
