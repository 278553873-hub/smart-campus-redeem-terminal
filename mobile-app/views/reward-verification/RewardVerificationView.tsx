import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, Gift, Pencil, Plus, Trash2 } from 'lucide-react';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import { GET_MOCK_CAMPUS_COIN_DETAIL } from '../../constants';
import type { ClassInfo, Student } from '../../types';

interface RewardVerificationViewProps {
  classInfo: ClassInfo;
  students: Student[];
  onBack: () => void;
}

interface ClassGood {
  id: string;
  name: string;
  price: number;
  icon: string;
}

interface RewardStudent extends Student {
  campusCoins: number;
}

type SheetMode = 'redeem' | 'manage' | 'edit' | null;

const DEFAULT_ICONS = ['包', '笔', '点', '券', '章', '书', '球', '画', '座', '扫', '餐'];
const INITIAL_GOODS: ClassGood[] = [
  { id: 'g1', name: '免写一次语文作业', price: 100, icon: '券' },
  { id: 'g2', name: '做一天班长体验券', price: 300, icon: '章' },
  { id: 'g3', name: '与校长共进午餐1次', price: 500, icon: '餐' },
  { id: 'g4', name: '精美笔记本一本', price: 150, icon: '书' },
  { id: 'g5', name: '黑色中性笔一支', price: 50, icon: '笔' },
];

const inputClass = 'h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100 read-only:border-[var(--tm-input-readonly-border)] read-only:bg-[var(--tm-input-readonly-bg)] read-only:text-[var(--tm-input-readonly-text)]';

const RewardVerificationView: React.FC<RewardVerificationViewProps> = ({ classInfo, students: classStudents, onBack }) => {
  const [students, setStudents] = useState<RewardStudent[]>(() => classStudents.map(student => ({
    ...student,
    campusCoins: GET_MOCK_CAMPUS_COIN_DETAIL(student).balance,
  })));
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [goods, setGoods] = useState<ClassGood[]>(INITIAL_GOODS);
  const [draftGoods, setDraftGoods] = useState<ClassGood[]>([]);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [feedback, setFeedback] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedStudents = useMemo(
    () => students.filter(student => selectedStudentIds.has(student.id)),
    [selectedStudentIds, students],
  );

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(current => {
      const next = new Set(current);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

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
    setStudents(current => current.map(student => selectedStudentIds.has(student.id)
      ? { ...student, campusCoins: student.campusCoins - good.price }
      : student));
    setSelectedStudentIds(new Set());
    setSheetMode(null);
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 1600);
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
    setDraftGoods(current => [{ id: `g-${Date.now()}`, name: '', price: 50, icon: DEFAULT_ICONS[0] }, ...current]);
  };

  const sheetTitle = sheetMode === 'redeem' ? '选择兑换奖励' : sheetMode === 'edit' ? '批量编辑奖品' : '设置班级奖励';

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回班级列表">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">兑换奖励</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-28 pt-[var(--tm-space-3)] no-scrollbar">
        <div className="mb-[var(--tm-space-3)] flex items-center justify-between text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">
          <span className="truncate">{classInfo.name}</span>
          <span>已选 {selectedStudentIds.size} 人</span>
        </div>
        <div className="grid grid-cols-3 gap-[var(--tm-space-2)]">
          {students.map(student => {
            const selected = selectedStudentIds.has(student.id);
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => toggleStudentSelection(student.id)}
                aria-pressed={selected}
                className={`relative flex min-h-[116px] min-w-0 flex-col items-center justify-center rounded-[var(--tm-radius-card)] border p-[var(--tm-space-2)] text-center [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.98] ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary-soft)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]'}`}
              >
                <span className={`absolute right-[var(--tm-space-2)] top-[var(--tm-space-2)] flex h-4 w-4 items-center justify-center rounded-full border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]'}`}>{selected && <Check className="h-3 w-3" />}</span>
                <img src={student.avatar} alt="" className="h-11 w-11 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover" />
                <span className="mt-[var(--tm-space-2)] w-full truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{student.name}</span>
                <span className="mt-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] font-semibold tabular-nums text-[var(--tm-brand-reward-strong)]">{student.campusCoins} 币</span>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="absolute inset-x-0 bottom-0 flex gap-[var(--tm-space-2)] border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)] backdrop-blur-xl">
        <button type="button" onClick={() => setSheetMode('manage')} className="flex min-h-[var(--tm-size-touch)] shrink-0 items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-reward-soft)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-reward-strong)] active:bg-[var(--tm-bg-surface-muted)]">
          <Gift className="h-[18px] w-[18px]" />设置奖励
        </button>
        <button type="button" disabled={selectedStudentIds.size === 0} onClick={openRedeemSheet} className="flex min-h-[var(--tm-size-touch)] min-w-0 flex-1 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">去兑换{selectedStudentIds.size > 0 ? `（${selectedStudentIds.size}人）` : ''}</button>
      </footer>

      <MobileBottomSheet open={sheetMode !== null} title={sheetTitle} onClose={() => setSheetMode(null)}>
        {sheetMode === 'redeem' && (
          <div className="space-y-[var(--tm-space-2)]">
            <p className="text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">已选择 {selectedStudentIds.size} 名学生</p>
            {feedback && <p role="alert" className="rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative-soft)] px-[var(--tm-space-3)] py-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-status-negative-strong)]">{feedback}</p>}
            {goods.map(good => {
              const canAfford = selectedStudents.every(student => student.campusCoins >= good.price);
              return (
                <div key={good.id} className="flex min-h-[68px] items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-3)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-lg [box-shadow:var(--tm-shadow-control)]">{good.icon}</span>
                  <span className="min-w-0 flex-1"><strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{good.name}</strong><small className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-reward-strong)]">{good.price} 币 / 人</small></span>
                  <button type="button" disabled={!canAfford} onClick={() => redeemGood(good)} className="min-h-[var(--tm-size-touch)] shrink-0 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">{canAfford ? '兑换' : '余额不足'}</button>
                </div>
              );
            })}
          </div>
        )}

        {sheetMode === 'manage' && (
          <div>
            <div className="space-y-[var(--tm-space-2)]">
              {goods.map(good => <div key={good.id} className="flex items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-3)]"><span className="flex h-10 w-10 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-lg">{good.icon}</span><span className="min-w-0 flex-1"><strong className="block truncate text-[length:var(--tm-font-size-body)] text-[var(--tm-text-primary)]">{good.name}</strong><small className="font-semibold text-[var(--tm-brand-reward-strong)]">{good.price} 币</small></span></div>)}
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
                  <div className="grid grid-cols-[56px_minmax(0,1fr)_44px] gap-[var(--tm-space-2)]">
                    <select value={good.icon} onChange={event => updateDraft(good.id, { icon: event.target.value })} className={`${inputClass} px-0 text-center text-lg`} aria-label={`${good.name || '新奖品'}图标`}>{DEFAULT_ICONS.map(icon => <option key={icon}>{icon}</option>)}</select>
                    <input value={good.name} onChange={event => updateDraft(good.id, { name: event.target.value })} className={inputClass} placeholder="奖品名称" aria-label="奖品名称" />
                    <button type="button" onClick={() => setDraftGoods(current => current.filter(item => item.id !== good.id))} className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-soft)]" aria-label={`删除${good.name || '奖品'}`}><Trash2 className="h-[18px] w-[18px]" /></button>
                  </div>
                  <label className="mt-[var(--tm-space-2)] grid grid-cols-[44px_minmax(0,1fr)] items-center gap-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]"><span>售价</span><input type="number" min="1" value={good.price} onChange={event => updateDraft(good.id, { price: Number(event.target.value) })} className={inputClass} /></label>
                </div>
              ))}
            </div>
            <button type="button" onClick={saveGoods} className="mt-[var(--tm-space-4)] flex min-h-[var(--tm-size-touch)] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)]">完成</button>
          </div>
        )}
      </MobileBottomSheet>

      {showSuccess && <div role="status" className="pointer-events-none absolute inset-x-[var(--tm-space-4)] top-[calc(var(--tm-size-touch)+var(--tm-space-4))] z-50 flex min-h-[var(--tm-size-touch)] items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-chart-tooltip)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-floating)]"><Check className="h-[18px] w-[18px]" />兑换成功</div>}
    </div>
  );
};

export default RewardVerificationView;
