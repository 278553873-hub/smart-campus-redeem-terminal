import React from 'react';
import {
    BookOpen,
    Check,
    ChevronRight,
    CircleHelp,
    Edit3,
    GripVertical,
    ImagePlus,
    KeyRound,
    Lock,
    Palette,
    Plus,
    Shield,
    Trash2,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import CompactRemoveButton from '../components/ui/CompactRemoveButton';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import type { CoinIssuanceConfig } from '../types';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import {
    getTeacherGradientPreviewVisual,
    type TeacherGradientPreviewConfig,
    type TeacherGradientSchemeId,
} from '../styles/teacherGradientPreview';
import { getClassBudgetTotal } from '../domain/campusCoinIssuance';

export interface SchoolSubjectItem {
    id: string;
    name: string;
}

export interface SchoolDepartmentItem {
    id: string;
    name: string;
}

interface SettingsViewProps {
    onLogout: () => void;
    gradientPreview: TeacherGradientPreviewConfig;
    onGradientPreviewChange: (config: TeacherGradientPreviewConfig) => void;
}

interface SubjectManagementViewProps {
    subjects: SchoolSubjectItem[];
    draggingSubjectId: string | null;
    onAdd: () => void;
    onEdit: (item: SchoolSubjectItem) => void;
    onDelete: (item: SchoolSubjectItem) => void;
    onDragStart: (id: string) => void;
    onDragOver: (targetId: string) => void;
    onDragEnd: () => void;
}

interface DepartmentManagementViewProps {
    departments: SchoolDepartmentItem[];
    onAdd: () => void;
    onEdit: (item: SchoolDepartmentItem) => void;
    onDelete: (item: SchoolDepartmentItem) => void;
}

interface CoinIssuanceViewProps {
    config: CoinIssuanceConfig;
    onChange: (config: CoinIssuanceConfig) => void;
    onSave: () => void;
    classStudentCount?: number;
}

interface SuggestionFeedbackViewProps {
    text: string;
    images: string[];
    onTextChange: (text: string) => void;
    onAddImage: () => void;
    onRemoveImage: (index: number) => void;
    onSubmit: () => void;
}

export const FeaturePageBody: React.FC<{ children: React.ReactNode; footer?: React.ReactNode; contentClassName?: string }> = ({ children, footer, contentClassName = '' }) => (
    <div className="relative flex h-full min-h-0 flex-col text-[var(--tm-text-primary)]">
        <div className={`min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 no-scrollbar ${footer ? 'pb-28' : 'pb-8'} ${contentClassName}`}>{children}</div>
        {footer && <div className="absolute inset-x-0 bottom-0 z-20 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-5 py-4 shadow-[0_-10px_28px_-24px_var(--tm-shadow-neutral-color)] backdrop-blur-xl">{footer}</div>}
    </div>
);

export const FeaturePanel: React.FC<{ children: React.ReactNode; className?: string; allowOverflow?: boolean }> = ({ children, className = '', allowOverflow = false }) => (
    <section className={`${allowOverflow ? 'overflow-visible' : 'overflow-hidden'} rounded-[24px] bg-[var(--tm-bg-surface-glass)] shadow-[0_12px_32px_-26px_var(--tm-shadow-neutral-color)] backdrop-blur-sm ${className}`}>
        {children}
    </section>
);

export const featurePrimaryButtonClass = 'flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-[var(--tm-brand-primary)] text-[14px] font-bold text-white shadow-[0_16px_30px_-24px_var(--tm-shadow-brand-color)]';
export const featureListRowClass = 'flex min-h-[60px] items-center gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-3 [box-shadow:var(--tm-shadow-control)]';
export const featureEditButtonClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)]';
export const featureDeleteButtonClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-status-negative)]';

export const SwitchControl: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <button
        type="button"
        role="switch"
        onClick={() => onChange(!checked)}
        className="flex h-11 w-14 items-center justify-center"
        aria-label={label}
        aria-checked={checked}
    >
        <span className={`relative block h-7 w-12 rounded-full p-[3px] transition ${checked ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-muted)]'}`}>
            <span className={`block h-[22px] w-[22px] rounded-full bg-white shadow-sm transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </span>
    </button>
);

const ActionRow: React.FC<{ icon?: React.ElementType; title: string; value?: string; onClick?: () => void }> = ({ icon: Icon, title, value, onClick }) => (
    <button type="button" onClick={onClick} className={`${featureListRowClass} w-full justify-between gap-3 text-left`}>
        <span className="flex min-w-0 items-center gap-3 text-[14px] font-semibold text-[var(--tm-text-primary)]">
            {Icon && <Icon className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-secondary)]" strokeWidth={2.1} />}
            <span className="truncate">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[13px] font-medium text-[var(--tm-text-tertiary)]">
            {value}
            <ChevronRight className="h-4 w-4" strokeWidth={2.1} />
        </span>
    </button>
);

const TEACHER_DIFFUSE_STYLE_OPTIONS: ReadonlyArray<{
    schemeId: TeacherGradientSchemeId;
    label: string;
    exclusive?: boolean;
}> = [
    { schemeId: 'scheme-exclusive', label: '小班化专属', exclusive: true },
    { schemeId: 'scheme-6', label: '清新校园' },
];

const StaticRow: React.FC<{ icon?: React.ElementType; title: string; value?: string }> = ({ icon: Icon, title, value }) => (
    <div className={`${featureListRowClass} w-full justify-between gap-3`}>
        <span className="flex min-w-0 items-center gap-3 text-[14px] font-semibold text-[var(--tm-text-primary)]">
            {Icon && <Icon className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-secondary)]" strokeWidth={2.1} />}
            <span className="truncate">{title}</span>
        </span>
        {value && <span className="shrink-0 text-[13px] font-medium text-[var(--tm-text-tertiary)]">{value}</span>}
    </div>
);

interface TeacherStyleSheetProps {
    open: boolean;
    value: TeacherGradientPreviewConfig;
    onClose: () => void;
    onChange: (config: TeacherGradientPreviewConfig) => void;
}

const TeacherStyleSheet: React.FC<TeacherStyleSheetProps> = ({ open, value, onClose, onChange }) => (
    <MobileBottomSheet open={open} title="页面风格" onClose={onClose} contentTone="plain">
        <div className="pt-[var(--tm-space-4)] pb-2">
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 no-scrollbar" role="radiogroup" aria-label="页面风格">
                {TEACHER_DIFFUSE_STYLE_OPTIONS.map(option => {
                    const selected = value.schemeId === option.schemeId;
                    const visual = getTeacherGradientPreviewVisual({ schemeId: option.schemeId, styleId: 'diffuse' });
                    return (
                        <button
                            key={option.schemeId}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={`${option.label}${option.exclusive ? '，专属' : ''}`}
                            onClick={() => onChange({ schemeId: option.schemeId, styleId: 'diffuse' })}
                            className={`w-[148px] shrink-0 snap-start overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] text-left [box-shadow:var(--tm-shadow-card)] transition-[box-shadow] motion-reduce:transition-none ${selected ? 'ring-2 ring-[var(--tm-brand-primary)]' : 'ring-1 ring-inset ring-[var(--tm-border-subtle)]'}`}
                        >
                            <div className="relative aspect-[9/16] w-full">
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundColor: visual.backgroundColor,
                                        backgroundImage: visual.backgroundImage,
                                        backgroundSize: visual.backgroundSize,
                                        backgroundPosition: visual.backgroundPosition,
                                        backgroundRepeat: visual.backgroundRepeat,
                                    }}
                                    aria-hidden="true"
                                />
                                {option.exclusive && (
                                    <span className="absolute right-2 top-2 rounded-[6px] bg-[var(--tm-brand-primary)] px-2 py-1 text-[11px] font-semibold text-white shadow-sm" aria-hidden="true">
                                        专属
                                    </span>
                                )}
                            </div>
                            <div className="flex min-h-12 items-center gap-2 px-3">
                                <span className="min-w-0 flex-1 whitespace-nowrap text-[14px] font-semibold text-[var(--tm-text-primary)]">{option.label}</span>
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-[var(--tm-brand-primary)] text-white' : 'border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-transparent'}`} aria-hidden="true">
                                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    </MobileBottomSheet>
);

export const MineSettingsView: React.FC<SettingsViewProps> = ({ onLogout, gradientPreview, onGradientPreviewChange }) => {
    const [showTeacherStyleSheet, setShowTeacherStyleSheet] = React.useState(false);
    const selectedStyle = TEACHER_DIFFUSE_STYLE_OPTIONS.find(option => option.schemeId === gradientPreview.schemeId);

    return (
        <>
            <FeaturePageBody>
                <section className="space-y-2">
                    <h3 className="px-1 text-[14px] font-bold text-[var(--tm-text-primary)]">账号安全</h3>
                    <StaticRow icon={Shield} title="登录账号" value="139****0121" />
                    <ActionRow icon={KeyRound} title="修改密码" />
                </section>

                <section className="space-y-2">
                    <h3 className="px-1 text-[14px] font-bold text-[var(--tm-text-primary)]">页面与显示</h3>
                    <ActionRow
                        icon={Palette}
                        title="页面风格"
                        value={selectedStyle?.label ?? '清新校园'}
                        onClick={() => setShowTeacherStyleSheet(true)}
                    />
                </section>

                <section className="space-y-2">
                    <h3 className="px-1 text-[14px] font-bold text-[var(--tm-text-primary)]">隐私与协议</h3>
                    <ActionRow icon={Lock} title="隐私协议" />
                    <ActionRow icon={BookOpen} title="用户协议" />
                </section>

                <button type="button" onClick={onLogout} className="flex min-h-[60px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-3 text-[14px] font-semibold text-[var(--tm-status-negative)] [box-shadow:var(--tm-shadow-control)]">
                    退出登录
                </button>
            </FeaturePageBody>

            <TeacherStyleSheet
                open={showTeacherStyleSheet}
                value={gradientPreview}
                onClose={() => setShowTeacherStyleSheet(false)}
                onChange={onGradientPreviewChange}
            />
        </>
    );
};

export const SubjectManagementView: React.FC<SubjectManagementViewProps> = ({ subjects, draggingSubjectId, onAdd, onEdit, onDelete, onDragStart, onDragOver, onDragEnd }) => (
    <FeaturePageBody
        contentClassName={subjects.length === 0 ? 'flex min-h-0 flex-col' : ''}
        footer={(
            <button type="button" onClick={onAdd} className={featurePrimaryButtonClass}>
                <Plus className="h-4 w-4" />
                新增科目
            </button>
        )}
    >
        {subjects.length > 0 ? (
            <section className="space-y-2">
                {subjects.map(item => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={() => onDragStart(item.id)}
                        onDragOver={(event) => {
                            event.preventDefault();
                            onDragOver(item.id);
                        }}
                        onDragEnd={onDragEnd}
                        className={`${featureListRowClass} transition ${draggingSubjectId === item.id ? 'bg-[var(--tm-brand-primary-soft)] opacity-70' : 'opacity-100'}`}
                    >
                        <span className="flex h-11 w-9 shrink-0 cursor-grab items-center justify-center text-[var(--tm-text-disabled)] active:cursor-grabbing" aria-label="拖动排序">
                            <GripVertical className="h-4.5 w-4.5" />
                        </span>
                        <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold text-[var(--tm-text-primary)]">{item.name}</button>
                        <button type="button" onClick={() => onEdit(item)} className={featureEditButtonClass} aria-label={`修改${item.name}`}>
                            <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => onDelete(item)} className={featureDeleteButtonClass} aria-label={`删除${item.name}`}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </section>
        ) : (
            <MobileEmptyState
                imageSrc={ASSETS.DEFAULT_STATE.BOX_CLIPBOARD}
                title="暂无科目"
                className="min-h-0 flex-1 pb-14"
                imageClassName="w-[72%] min-w-[188px] max-w-[236px]"
            />
        )}
    </FeaturePageBody>
);

export const DepartmentManagementView: React.FC<DepartmentManagementViewProps> = ({ departments, onAdd, onEdit, onDelete }) => (
    <FeaturePageBody
        contentClassName={departments.length === 0 ? 'flex min-h-0 flex-col' : ''}
        footer={(
            <button type="button" onClick={onAdd} className={featurePrimaryButtonClass}>
                <Plus className="h-4 w-4" />
                新增部门
            </button>
        )}
    >
        {departments.length > 0 ? (
            <section className="space-y-2">
                {departments.map(item => (
                    <div key={item.id} className={`${featureListRowClass} pl-4`}>
                        <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold text-[var(--tm-text-primary)]">{item.name}</button>
                        <button type="button" onClick={() => onEdit(item)} className={featureEditButtonClass} aria-label={`修改${item.name}`}>
                            <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => onDelete(item)} className={featureDeleteButtonClass} aria-label={`删除${item.name}`}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </section>
        ) : (
            <MobileEmptyState
                imageSrc={ASSETS.DEFAULT_STATE.BOX_CLIPBOARD}
                title="暂无部门"
                className="min-h-0 flex-1 pb-14"
                imageClassName="w-[72%] min-w-[188px] max-w-[236px]"
            />
        )}
    </FeaturePageBody>
);

export const CoinIssuanceView: React.FC<CoinIssuanceViewProps> = ({ config, onChange, onSave, classStudentCount }) => {
    const [showIssuanceHelp, setShowIssuanceHelp] = React.useState(false);
    const [budgetAmountDraft, setBudgetAmountDraft] = React.useState(String(config.budgetAmount));
    const issuanceHelpId = React.useId();
    const rankingRatio = 100 - config.sunshineRatio;
    const isPerStudentBudget = config.budgetMode === 'per_student';
    const update = (patch: Partial<CoinIssuanceConfig>) => onChange({ ...config, ...patch });
    const classBudgetTotal = getClassBudgetTotal({
        budgetMode: config.budgetMode,
        budgetAmount: config.budgetAmount,
        // 配置页没有绑定单一班级时，用 50 人作为试算示例；进入具体班级上下文后使用实际人数。
        classStudentCount: classStudentCount ?? 50,
    });
    const sunshineAmount = Math.round(classBudgetTotal * config.sunshineRatio / 100);
    const rankingAmount = classBudgetTotal - sunshineAmount;
    const budgetLabel = isPerStudentBudget ? '每人预算' : '每班预算';
    const sampleClassStudentCount = 50;
    const studentBudgetPreview = config.budgetAmount * sampleClassStudentCount;
    const formatCoinAmount = (amount: number) => {
        if (!Number.isFinite(amount)) return '0';
        return Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/\.?0+$/, '');
    };
    const numberInputClass = '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';
    const parsePositiveInteger = (value: string) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? Math.max(1, Math.floor(parsed)) : 1;
    };
    const parsePositiveMoney = (value: string) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) return 1;
        return Math.max(0.01, Math.round(parsed * 100) / 100);
    };
    const selectBudgetMode = (budgetMode: CoinIssuanceConfig['budgetMode']) => {
        const nextBudget = budgetMode === 'per_student' ? 10 : 500;
        setBudgetAmountDraft(String(nextBudget));
        update({ budgetMode, budgetAmount: nextBudget });
    };

    return (
        <FeaturePageBody
            footer={(
                <button type="button" onClick={onSave} className={featurePrimaryButtonClass}>
                    保存
                </button>
            )}
        >
            <FeaturePanel className="relative z-10 px-4 py-2" allowOverflow>
                <div className="flex min-h-[60px] items-center justify-between gap-3">
                    <div className="relative flex min-w-0 items-center gap-0">
                        <span className="truncate text-[14px] font-bold text-[var(--tm-text-primary)]">开启校园币发放</span>
                        <button
                            type="button"
                            className="-ml-2 flex h-11 w-11 shrink-0 touch-manipulation select-none items-center justify-center rounded-full text-[var(--tm-text-disabled)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary-soft-strong)]"
                            aria-label="查看校园币发放说明"
                            aria-describedby={showIssuanceHelp ? issuanceHelpId : undefined}
                            aria-expanded={showIssuanceHelp}
                            onPointerDown={() => setShowIssuanceHelp(true)}
                            onPointerUp={() => setShowIssuanceHelp(false)}
                            onPointerCancel={() => setShowIssuanceHelp(false)}
                            onPointerLeave={() => setShowIssuanceHelp(false)}
                            onFocus={() => setShowIssuanceHelp(true)}
                            onBlur={() => setShowIssuanceHelp(false)}
                            onContextMenu={(event) => event.preventDefault()}
                        >
                            <CircleHelp className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {showIssuanceHelp && (
                            <div id={issuanceHelpId} role="tooltip" className="pointer-events-none absolute left-0 top-full z-30 w-[260px] max-w-[calc(100vw-64px)] rounded-2xl bg-[var(--tm-text-primary)] px-3.5 py-3 text-[12px] font-medium leading-5 text-white shadow-[0_14px_32px_-20px_var(--tm-shadow-neutral-color)]">
                                开启后，系统将按设置的周期和预算自动向班级发放校园币。
                            </div>
                        )}
                    </div>
                    <SwitchControl checked={config.enabled} onChange={(enabled) => update({ enabled })} label="开启校园币发放" />
                </div>
            </FeaturePanel>

            {config.enabled && (
                <>
                    <FeaturePanel className="space-y-4 p-4">
                        <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">发放条件</h2>
                        <div className="space-y-3">
                            <label className="grid min-h-12 grid-cols-[minmax(72px,1fr)_minmax(0,1.8fr)] items-center gap-3 px-1">
                                <span className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">发放周期</span>
                                <div className="w-[172px] max-w-full justify-self-end">
                                    <select value={config.period} onChange={(event) => update({ period: event.target.value as CoinIssuanceConfig['period'] })} className="h-11 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-4 text-center text-[14px] font-semibold text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]">
                                        <option value="weekly">每周一发放</option>
                                        <option value="monthly">每月一号发放</option>
                                    </select>
                                </div>
                            </label>

                            <label className="grid min-h-12 grid-cols-[minmax(72px,1fr)_minmax(0,1.8fr)] items-center gap-3 px-1">
                                <span className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">发放门槛</span>
                                <div className="flex w-[172px] max-w-full min-w-0 items-center justify-self-end justify-end gap-2 text-[14px] font-semibold text-[var(--tm-text-primary)]">
                                    <span className="shrink-0 whitespace-nowrap">{config.period === 'weekly' ? '本周至少评价' : '本月至少评价'}</span>
                                    <input
                                        type="number"
                                        min={1}
                                        step={1}
                                        inputMode="numeric"
                                        value={config.minimumEvaluationCount}
                                        onChange={(event) => update({ minimumEvaluationCount: parsePositiveInteger(event.target.value) })}
                                        className={`${numberInputClass} h-11 w-11 shrink-0 rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-2 text-center text-[14px] font-bold tabular-nums text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]`}
                                        aria-label={`${config.period === 'weekly' ? '本周' : '本月'}评价次数`}
                                    />
                                    <span className="shrink-0 whitespace-nowrap">次</span>
                                </div>
                            </label>
                        </div>
                        <p className="whitespace-nowrap pl-1 text-[12px] font-medium leading-5 text-[var(--tm-text-tertiary)]">班主任评价“全班50名同学积极参加锻炼”，算作1次评价</p>
                    </FeaturePanel>

                    <FeaturePanel className="space-y-4 p-4">
                        <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">发放数量</h2>
                        <div className="space-y-3">
                            <div className="grid min-h-12 grid-cols-[minmax(72px,1fr)_minmax(0,1.8fr)] items-center gap-3 px-1">
                                <div className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">预算设置</div>
                                <div className="flex min-w-0 justify-end">
                                    <CompactSegmentedControl
                                        value={config.budgetMode}
                                        items={[
                                            { value: 'per_student', label: '按人' },
                                            { value: 'per_class', label: '按班' },
                                        ]}
                                        onChange={selectBudgetMode}
                                        ariaLabel="预算设置"
                                        semantics="group"
                                        variant="settings"
                                    />
                                </div>
                            </div>
                            <label className="grid min-h-12 grid-cols-[minmax(72px,1fr)_minmax(0,1.8fr)] items-center gap-3 px-1">
                                <span className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">{budgetLabel}</span>
                                <div className="flex min-w-0 justify-end">
                                    <div className="flex w-[144px] items-center gap-2">
                                        <input
                                            type="number"
                                            min={0.01}
                                            step="0.01"
                                            value={budgetAmountDraft}
                                            onChange={(event) => {
                                                const raw = event.target.value;
                                                if (!/^\d*(\.\d{0,2})?$/.test(raw)) return;
                                                setBudgetAmountDraft(raw);
                                                if (raw && raw !== '.') update({ budgetAmount: parsePositiveMoney(raw) });
                                            }}
                                            onBlur={() => {
                                                const normalized = parsePositiveMoney(budgetAmountDraft);
                                                setBudgetAmountDraft(String(normalized));
                                                update({ budgetAmount: normalized });
                                            }}
                                            className={`${numberInputClass} h-11 min-w-0 flex-1 rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 text-center text-[14px] font-bold tabular-nums text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]`}
                                            aria-label={budgetLabel}
                                        />
                                        <span className="shrink-0 text-[13px] font-semibold text-[var(--tm-brand-reward-strong)]">币</span>
                                    </div>
                                </div>
                                {isPerStudentBudget && (
                                    <p className="col-span-2 text-pretty text-[12px] font-medium leading-5 text-[var(--tm-text-tertiary)]">一个班50人，则班级预算为 <span className="tabular-nums">{formatCoinAmount(config.budgetAmount)}</span> × 50 = <span className="tabular-nums">{formatCoinAmount(studentBudgetPreview)}</span> 币</p>
                                )}
                            </label>
                        </div>
                    </FeaturePanel>

                    <FeaturePanel className="space-y-4 p-4">
                        <h2 className="text-[15px] font-bold text-[var(--tm-text-primary)]">奖励分配</h2>
                        <div className="space-y-6">
                        <label className="block">
                        <div className="flex items-center justify-between text-[14px] font-bold text-[var(--tm-text-primary)]">
                            <span>阳光保底比例</span>
                            <span className="tabular-nums text-[var(--tm-brand-primary)]">{config.sunshineRatio}%</span>
                        </div>
                        <div className="relative mt-1 h-8 w-full">
                            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-[var(--tm-brand-primary-soft-strong)]" aria-hidden="true">
                                <div className="h-full rounded-full bg-[var(--tm-brand-primary)]" style={{ width: `${config.sunshineRatio}%` }} />
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={config.sunshineRatio}
                                onChange={(event) => update({ sunshineRatio: Number(event.target.value) })}
                                className="absolute inset-x-0 top-1/2 h-11 w-full -translate-y-1/2 cursor-pointer appearance-none border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary-soft-strong)] [&::-moz-range-progress]:border-0 [&::-moz-range-progress]:bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--tm-brand-primary)] [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border-0 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:border-0 [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-[var(--tm-brand-primary)]"
                                aria-label={`阳光保底比例 ${config.sunshineRatio}%`}
                            />
                        </div>
                            <p className="mt-1 text-[12px] font-medium leading-5 text-[var(--tm-text-tertiary)]">每个学生无论评价如何，都可以获得的成长奖励</p>
                            <div className="mt-2 text-[12px] font-semibold text-[var(--tm-text-primary)]">全班平分：<span className="tabular-nums text-[var(--tm-brand-reward-strong)]">{sunshineAmount}币</span></div>
                        </label>

                        <div>
                        <div className="flex items-center justify-between text-[14px] font-bold text-[var(--tm-text-primary)]">
                            <span>积分排行比例</span>
                            <span className="tabular-nums text-[var(--tm-brand-reward-strong)]">{rankingRatio}%</span>
                        </div>
                        <div className="relative mt-1 h-8 w-full">
                            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-[var(--tm-brand-reward-soft)]" aria-hidden="true">
                                <div className="h-full rounded-full bg-[var(--tm-brand-reward)]" style={{ width: `${rankingRatio}%` }} />
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={rankingRatio}
                                onChange={(event) => update({ sunshineRatio: 100 - Number(event.target.value) })}
                                className="absolute inset-x-0 top-1/2 h-11 w-full -translate-y-1/2 cursor-pointer appearance-none border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-reward-soft)] [&::-moz-range-progress]:border-0 [&::-moz-range-progress]:bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--tm-brand-reward)] [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border-0 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:border-0 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-[var(--tm-brand-reward)]"
                                aria-label={`积分排行比例 ${rankingRatio}%`}
                            />
                        </div>
                            <p className="mt-1 text-[12px] font-medium leading-5 text-[var(--tm-text-tertiary)]">评分为正的学生，按比例分配的排名奖励</p>
                            <div className="mt-2 text-[12px] font-semibold text-[var(--tm-text-primary)]">奖池金额：<span className="tabular-nums text-[var(--tm-brand-reward-strong)]">{rankingAmount}币</span></div>
                        </div>
                        </div>
                    </FeaturePanel>
                </>
            )}
        </FeaturePageBody>
    );
};

export const SuggestionFeedbackView: React.FC<SuggestionFeedbackViewProps> = ({ text, images, onTextChange, onAddImage, onRemoveImage, onSubmit }) => {
    const canSubmit = Boolean(text.trim());
    const canAddImage = images.length < 5;

    return (
        <FeaturePageBody
            footer={(
                <button type="button" disabled={!canSubmit} onClick={onSubmit} className={`h-12 w-full rounded-[20px] text-[14px] font-bold transition-colors ${canSubmit ? 'bg-[var(--tm-brand-primary)] text-white shadow-[0_16px_30px_-24px_var(--tm-shadow-brand-color)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-disabled)]'}`}>
                    提交
                </button>
            )}
        >
            <FeaturePanel className="p-4">
                <textarea value={text} onChange={(event) => onTextChange(event.target.value)} className="min-h-[156px] w-full resize-none bg-transparent text-[14px] leading-6 text-[var(--tm-text-primary)] outline-none placeholder:text-[var(--tm-text-disabled)]" placeholder="请输入建议或问题" aria-label="反馈内容" />
            </FeaturePanel>

            <FeaturePanel className="p-4">
                <div className="flex items-center justify-between">
                    <div className="text-[14px] font-bold text-[var(--tm-text-primary)]">上传图片</div>
                    <div className="text-[12px] font-semibold tabular-nums text-[var(--tm-text-disabled)]">{images.length}/5</div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                        <div key={`${image}-${index}`} className="relative flex aspect-square items-center justify-center rounded-2xl bg-[var(--tm-bg-surface-soft)] text-[12px] font-semibold text-[var(--tm-text-secondary)]">
                            {image}
                            <CompactRemoveButton
                                onClick={() => onRemoveImage(index)}
                                ariaLabel={`删除第${index + 1}张反馈图片`}
                            />
                        </div>
                    ))}
                    {canAddImage && (
                        <button type="button" onClick={onAddImage} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--tm-brand-primary-soft-strong)] bg-white text-[12px] font-semibold text-[var(--tm-brand-primary)]" aria-label="上传反馈图片">
                            <ImagePlus className="h-5 w-5" />
                            上传图片
                        </button>
                    )}
                </div>
            </FeaturePanel>
        </FeaturePageBody>
    );
};

interface EditSheetProps {
    title: string;
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
}

export const TextEditSheet: React.FC<EditSheetProps> = ({ title, value, placeholder, onChange, onCancel, onConfirm }) => (
    <div className="absolute inset-0 z-[100] flex items-end bg-[var(--tm-mask)] px-4 pb-4 backdrop-blur-[2px]" onClick={onCancel}>
        <section className="w-full rounded-[28px] bg-[var(--tm-bg-surface-glass)] p-4 shadow-[0_28px_80px_-42px_var(--tm-shadow-neutral-color)] backdrop-blur-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
                <button type="button" onClick={onCancel} className="h-9 px-2 text-[13px] font-semibold text-[var(--tm-text-secondary)]">取消</button>
                <div className="text-[16px] font-bold text-[var(--tm-text-primary)]">{title}</div>
                <button type="button" onClick={onConfirm} className="flex h-9 items-center gap-1 rounded-full bg-[var(--tm-brand-primary-soft)] px-3 text-[13px] font-bold text-[var(--tm-brand-primary)]">
                    <Check className="h-3.5 w-3.5" />
                    完成
                </button>
            </div>
            <input value={value} onChange={(event) => onChange(event.target.value)} autoFocus placeholder={placeholder} className="h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-4 text-[14px] font-semibold text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
        </section>
    </div>
);

interface ConfirmSheetProps {
    title: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export const DeleteConfirmSheet: React.FC<ConfirmSheetProps> = ({ title, onCancel, onConfirm }) => (
    <div className="absolute inset-0 z-[100] flex items-end bg-[var(--tm-mask)] px-4 pb-4 backdrop-blur-[2px]" onClick={onCancel}>
        <section className="w-full rounded-[28px] bg-[var(--tm-bg-surface-glass)] p-4 shadow-[0_28px_80px_-42px_var(--tm-shadow-neutral-color)] backdrop-blur-xl" onClick={(event) => event.stopPropagation()}>
            <div className="px-2 pb-4 pt-1 text-center text-[16px] font-bold text-[var(--tm-text-primary)]">{title}</div>
            <button type="button" onClick={onConfirm} className="h-12 w-full rounded-[20px] bg-[var(--tm-status-negative-soft)] text-[14px] font-bold text-[var(--tm-status-negative)]">
                删除
            </button>
            <button type="button" onClick={onCancel} className="mt-2 h-12 w-full rounded-[20px] bg-[var(--tm-bg-surface-soft)] text-[14px] font-bold text-[var(--tm-text-secondary)]">
                取消
            </button>
        </section>
    </div>
);
